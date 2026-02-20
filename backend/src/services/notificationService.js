const axios = require('axios');
const { supabaseAdmin } = require('../config/supabase');

/**
 * Serviço de Notificações via WhatsApp (Evolution API)
 * Refatorado para Alta Performance com Fila Interna e Controle de Concorrência.
 */
class NotificationService {
    constructor() {
        this.apiUrl = process.env.EVOLUTION_API_URL;
        this.instance = process.env.EVOLUTION_INSTANCE_NAME; // Instância Padrão/Aluno
        this.centralInstance = process.env.EVOLUTION_CENTRAL_INSTANCE || process.env.EVOLUTION_INSTANCE_NAME; // Instância para Professor
        this.token = process.env.EVOLUTION_API_TOKEN || process.env.AUTHENTICATION_API_KEY || process.env.EVOLUTION_GLOBAL_KEY;

        // Fila interna para processamento assíncrono
        this.queue = [];
        this.isProcessing = false;
        this.maxConcurrency = 3; // Processa até 3 notificações por vez para evitar bloqueios
    }

    /**
     * Adiciona uma tarefa à fila e inicia o processamento se necessário
     */
    async addToQueue(taskFn) {
        this.queue.push(taskFn);
        if (!this.isProcessing) {
            this.processQueue();
        }
    }

    /**
     * Processador da fila com controle de concorrência
     */
    async processQueue() {
        if (this.queue.length === 0) {
            this.isProcessing = false;
            return;
        }

        this.isProcessing = true;

        // Pega as próximas tarefas respeitando a concorrência máxima
        const batch = this.queue.splice(0, this.maxConcurrency);

        // Executa o lote em paralelo
        await Promise.all(batch.map(async (task) => {
            try {
                await task();
            } catch (err) {
                console.error('❌ Erro ao processar tarefa da fila:', err);
            }
        }));

        // Pequeno intervalo entre lotes para não sobrecarregar
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Recursão para continuar processando
        this.processQueue();
    }

    /**
     * Helper para atraso aleatório (Anti-Ban)
     */
    async randomDelay(min = 2000, max = 5000) {
        const ms = Math.floor(Math.random() * (max - min) + min);
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Enviar mensagem simples
     */
    async sendMessage(to, text, instanceOverride = null) {
        const targetInstance = instanceOverride || this.instance;

        if (!this.apiUrl || !this.token || !targetInstance) {
            console.warn('⚠️  WhatsApp API não configurada');
            return;
        }

        let cleanNumber = to.replace(/\D/g, '');
        if ((cleanNumber.length === 10 || cleanNumber.length === 11) && !cleanNumber.startsWith('55')) {
            cleanNumber = '55' + cleanNumber;
        }

        const url = `${this.apiUrl}/message/sendText/${targetInstance}`;

        try {
            await axios.post(url, {
                number: cleanNumber,
                text: text,
                options: { delay: 1200, presence: 'composing' }
            }, {
                headers: { 'apikey': this.token, 'Content-Type': 'application/json' }
            });
            console.log(`✅ WhatsApp enviado para ${cleanNumber}`);
        } catch (error) {
            console.error(`❌ Falha ao enviar para ${cleanNumber}:`, error.message);
        }
    }

    /**
     * Notificar agendamento (Agrupado na fila)
     */
    async notifyMultipleSchedule(aluno, sessoes, professorInstance = null) {
        this.addToQueue(async () => {
            if (sessoes.length === 0) return;

            let message = `🏋️‍♂️ *LEMBRETE ALUNO - ${aluno.nome}*\n\n`;
            message += `Olá! 🏋️‍♂️\n\n`;

            if (sessoes.length === 1) {
                const sessao = sessoes[0];
                const data = new Date(sessao.data_hora_inicio);
                message += `Confirmamos seu novo agendamento:\n\n`;
                if (sessao.servico?.nome) message += `💪 Serviço: *${sessao.servico.nome}*\n`;
                message += `🗓️ Data: ${data.toLocaleDateString('pt-BR')}\n`;
                message += `⏰ Hora: ${data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}\n`;
            } else {
                message += `Confirmamos seus novos *${sessoes.length}* agendamentos!\n\n💪 Agenda atualizada:\n`;
                sessoes.slice(0, 5).forEach(s => {
                    const d = new Date(s.data_hora_inicio);
                    message += `• ${d.toLocaleDateString('pt-BR')} às ${d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}${s.servico?.nome ? ' (' + s.servico.nome + ')' : ''}\n`;
                });
            }
            message += `\nVamo pra cima! 🔥🚀`;

            await this.sendMessage(aluno.telefone_whatsapp, message, professorInstance);
            await this.randomDelay();
        });
    }

    /**
     * Resumo Diário para o Personal
     */
    async sendDailySummary(professorId, isAfternoon = false) {
        this.addToQueue(async () => {
            try {
                const { data: professor } = await supabaseAdmin
                    .from('professores')
                    .select('telefone_whatsapp, whatsapp_instance')
                    .eq('id', professorId)
                    .single();

                if (!professor) return;

                const agora = new Date();
                const inicioBusca = isAfternoon ? agora.toISOString() : new Date(agora.setHours(0, 0, 0, 0)).toISOString();
                const fimDia = new Date(new Date().setHours(23, 59, 59, 999)).toISOString();

                const { data: sessoes } = await supabaseAdmin
                    .from('sessoes')
                    .select('data_hora_inicio, aluno:alunos(nome), servico:servicos(nome)')
                    .eq('professor_id', professorId)
                    .eq('status', 'agendada')
                    .gte('data_hora_inicio', inicioBusca)
                    .lte('data_hora_inicio', fimDia)
                    .order('data_hora_inicio', { ascending: true });

                if (!sessoes || sessoes.length === 0) return;

                const dataFormatada = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
                let message = `━━━━━━━━━━━━━━\n💼 *PERSONAL AGENDA* (${dataFormatada})\n━━━━━━━━━━━━━━\n\n`;
                message += isAfternoon ? `🌤️ *AULAS RESTANTES*\n\n` : `🚀 *AGENDA DE HOJE*\n\n`;

                sessoes.forEach((s) => {
                    const hora = new Date(s.data_hora_inicio).toLocaleTimeString('pt-BR', {
                        hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo'
                    });
                    message += `⏰ *${hora}* - ${s.aluno.nome}\n💪 _${s.servico.nome}_\n\n`;
                });

                message += `━━━━━━━━━━━━━━\n🎯 Total: *${sessoes.length} aulas*`;

                await this.sendMessage(professor.telefone_whatsapp, message, this.centralInstance);
                await this.randomDelay();
            } catch (err) {
                console.error('Erro no Resumo Diário:', err);
            }
        });
    }

    /**
     * Resumo Semanal para o Personal
     */
    async sendWeeklySummary(professorId) {
        this.addToQueue(async () => {
            try {
                const { data: professor } = await supabaseAdmin
                    .from('professores')
                    .select('telefone_whatsapp')
                    .eq('id', professorId)
                    .single();

                if (!professor) return;

                const agora = new Date();
                const umaSemanaAtras = new Date(agora.getTime() - 7 * 24 * 60 * 60 * 1000);
                const umaSemanaFrente = new Date(agora.getTime() + 7 * 24 * 60 * 60 * 1000);

                const { count: concluídas } = await supabaseAdmin
                    .from('sessoes')
                    .select('id', { count: 'exact', head: true })
                    .eq('professor_id', professorId)
                    .eq('status', 'concluida')
                    .gte('data_hora_inicio', umaSemanaAtras.toISOString())
                    .lte('data_hora_inicio', agora.toISOString());

                const { count: agendadas } = await supabaseAdmin
                    .from('sessoes')
                    .select('id', { count: 'exact', head: true })
                    .eq('professor_id', professorId)
                    .eq('status', 'agendada')
                    .gte('data_hora_inicio', agora.toISOString())
                    .lte('data_hora_inicio', umaSemanaFrente.toISOString());

                let message = `━━━━━━━━━━━━━━\n💼 *RESUMO SEMANAL*\n━━━━━━━━━━━━━━\n\n`;
                message += `✅ *Passada:* ${concluídas || 0} aulas concluídas.\n`;
                message += `📅 *Próxima:* ${agendadas || 0} aulas agendadas.\n\n`;
                message += `Bora bater as metas! 💪`;

                await this.sendMessage(professor.telefone_whatsapp, message, this.centralInstance);
                await this.randomDelay();
            } catch (err) {
                console.error('Erro no Resumo Semanal:', err);
            }
        });
    }

    /**
     * Lembretes para os Alunos (Fila)
     */
    async sendStudentReminders(mode = 'hourly') {
        try {
            const agora = new Date();
            let inicioJanela, fimJanela;

            if (mode === 'hourly') {
                inicioJanela = new Date(agora.getTime() + 45 * 60000).toISOString();
                fimJanela = new Date(agora.getTime() + 75 * 60000).toISOString();
            } else {
                inicioJanela = new Date(agora.setHours(0, 0, 0, 0)).toISOString();
                fimJanela = new Date(agora.setHours(23, 59, 59, 999)).toISOString();
            }

            const { data: sessoes } = await supabaseAdmin
                .from('sessoes')
                .select(`
                    data_hora_inicio, 
                    aluno:alunos(nome, telefone_whatsapp, notificacoes_ativas), 
                    servico:servicos(nome),
                    professor:professores(whatsapp_instance)
                `)
                .eq('status', 'agendada')
                .gte('data_hora_inicio', inicioJanela)
                .lte('data_hora_inicio', fimJanela);

            if (!sessoes || sessoes.length === 0) return;

            for (const sessao of sessoes) {
                if (sessao.aluno?.notificacoes_ativas && sessao.aluno?.telefone_whatsapp) {
                    this.addToQueue(async () => {
                        const hora = new Date(sessao.data_hora_inicio).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
                        let message = mode === 'hourly'
                            ? `🏋️‍♂️ *LEMBRETE EM 1 HORA*\n\nOlá, *${sessao.aluno.nome}*! 👋\nSua aula de *${sessao.servico.nome}* começa às *${hora}*.\nVamo pra cima! 🔥💪`
                            : `🏋️‍♂️ *LEMBRETE DE HOJE*\n\nBom dia, *${sessao.aluno.nome}*! 👋\nConfirmando nossa aula de *${sessao.servico.nome}* às *${hora}*.\nAté logo! 🔥`;

                        await this.sendMessage(sessao.aluno.telefone_whatsapp, message, sessao.professor?.whatsapp_instance);
                        await this.randomDelay();
                    });
                }
            }
        } catch (err) {
            console.error(`Erro nos Lembretes de Aula (${mode}):`, err);
        }
    }
}

module.exports = new NotificationService();
