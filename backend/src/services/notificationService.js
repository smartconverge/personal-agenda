const axios = require('axios');
const { supabaseAdmin } = require('../config/supabase');

/**
 * Serviço de Notificações via WhatsApp (Evolution API)
 */
class NotificationService {
    constructor() {
        this.apiUrl = process.env.EVOLUTION_API_URL;
        this.instance = process.env.EVOLUTION_INSTANCE_NAME; // Instância Padrão/Aluno
        this.centralInstance = process.env.EVOLUTION_CENTRAL_INSTANCE || process.env.EVOLUTION_INSTANCE_NAME; // Instância para Professor
        this.token = process.env.EVOLUTION_API_TOKEN;
    }

    /**
     * Helper para atraso aleatório (Anti-Ban)
     * @param {number} min - Milissegundos mínimos
     * @param {number} max - Milissegundos máximos
     */
    async randomDelay(min = 5000, max = 15000) {
        const ms = Math.floor(Math.random() * (max - min + 1) + min);
        console.log(`⏱️ Aguardando ${ms / 1000}s para próximo disparo...`);
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Enviar mensagem simples
     */
    async sendMessage(to, text, instanceOverride = null) {
        const targetInstance = instanceOverride || this.instance;

        if (!this.apiUrl || !this.token || !targetInstance) {
            console.warn('⚠️  WhatsApp API não configurada (URL, Token ou Instância ausente)');
            return;
        }

        // Normalização agressiva do número
        let cleanNumber = to.replace(/\D/g, '');

        // Adiciona 55 se o número tiver 10 ou 11 dígitos (formato brasileiro sem DDI)
        if ((cleanNumber.length === 10 || cleanNumber.length === 11) && !cleanNumber.startsWith('55')) {
            cleanNumber = '55' + cleanNumber;
        }

        const url = `${this.apiUrl}/message/sendText/${targetInstance}`;

        console.log(`📤 Enviando WhatsApp: [${targetInstance}] para ${cleanNumber}`);

        try {
            const response = await axios.post(url, {
                number: cleanNumber,
                text: text,
                options: {
                    delay: 1200,
                    presence: 'composing'
                }
            }, {
                headers: {
                    'apikey': this.token,
                    'Content-Type': 'application/json'
                }
            });
            console.log(`✅ Sucesso (${cleanNumber}):`, response.data?.status || 'OK');
        } catch (error) {
            console.error(`❌ Falha ao enviar para ${cleanNumber}:`, error.response?.data?.message || error.message);
        }
    }

    /**
     * Notificar agendamento de múltiplas sessões (AGRUPADO)
     */
    async notifyMultipleSchedule(aluno, sessoes, professorInstance = null) {
        if (sessoes.length === 0) return;

        let message = `🏋️‍♂️ *LEMBRETE ALUNO - ${aluno.nome}*\n\n`;
        message += `Olá! 🏋️‍♂️\n\n`;

        if (sessoes.length === 1) {
            const sessao = sessoes[0];
            const data = new Date(sessao.data_hora_inicio);
            message += `Confirmamos seu novo agendamento:\n\n`;
            if (sessao.servico?.nome) {
                message += `💪 Serviço: *${sessao.servico.nome}*\n`;
            }
            message += `🗓️ Data: ${data.toLocaleDateString('pt-BR')}\n`;
            message += `⏰ Hora: ${data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}\n`;
        } else {
            message += `Confirmamos seus novos *${sessoes.length}* agendamentos!\n\n💪 Agenda atualizada:\n`;
            sessoes.slice(0, 5).forEach(s => {
                const d = new Date(s.data_hora_inicio);
                message += `• ${d.toLocaleDateString('pt-BR')} às ${d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}${s.servico?.nome ? ' (' + s.servico.nome + ')' : ''}\n`;
            });
            if (sessoes.length > 5) message += `... e mais ${sessoes.length - 5} aulas.\n`;
        }

        message += `\nVamo pra cima! 🔥🚀`;

        await this.sendMessage(aluno.telefone_whatsapp, message, professorInstance);
    }

    /**
     * Resumo Diário para o Personal
     * @param {string} professorId 
     * @param {boolean} isAfternoon - Se for true, mostra apenas as aulas restantes (call às 12h)
     */
    async sendDailySummary(professorId, isAfternoon = false) {
        try {
            // 1. Buscar dados do professor no Banco
            const { data: professor, error: profError } = await supabaseAdmin
                .from('professores')
                .select('telefone_whatsapp, whatsapp_instance')
                .eq('id', professorId)
                .single();

            if (profError || !professor) return;

            const agora = new Date();
            const inicioBusca = isAfternoon ? agora.toISOString() : new Date(agora.setHours(0, 0, 0, 0)).toISOString();
            const fimDia = new Date(new Date().setHours(23, 59, 59, 999)).toISOString();

            const { data: sessoes, error } = await supabaseAdmin
                .from('sessoes')
                .select('data_hora_inicio, aluno:alunos(nome), servico:servicos(nome)')
                .eq('professor_id', professorId)
                .eq('status', 'agendada')
                .gte('data_hora_inicio', inicioBusca)
                .lte('data_hora_inicio', fimDia)
                .order('data_hora_inicio', { ascending: true });

            if (error || !sessoes || sessoes.length === 0) {
                console.log(`ℹ️ Nenhuma aula para o professor ${professorId} hoje.`);
                return;
            }

            let title = isAfternoon ? `🌤️ *Agenda Professor - Aulas Restantes*` : `🚀 *Agenda Professor - ${new Date().toLocaleDateString('pt-BR')}*`;
            let message = `💼 *RESUMO PROFESSOR*\n${title}\n\n`;

            sessoes.forEach(s => {
                if (s.aluno && s.servico) {
                    const hora = new Date(s.data_hora_inicio).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
                    message += `⏰ ${hora} - ${s.aluno.nome} (${s.servico.nome})\n`;
                }
            });

            message += `\nTotal: ${sessoes.length} aulas${isAfternoon ? ' restantes' : ''}. Bom trabalho!`;

            // Envia para o telefone do professor usando a INSTÂNCIA CENTRAL para garantir notificação
            await this.sendMessage(professor.telefone_whatsapp, message, this.centralInstance);
        } catch (err) {
            console.error('Erro no Resumo Diário:', err);
        }
    }

    /**
     * Resumo Semanal para o Personal (Domingos às 18h)
     */
    async sendWeeklySummary(professorId) {
        try {
            const { data: professor, error: profError } = await supabaseAdmin
                .from('professores')
                .select('telefone_whatsapp, whatsapp_instance')
                .eq('id', professorId)
                .single();

            if (profError || !professor) return;

            const agora = new Date();
            const umaSemanaAtras = new Date();
            umaSemanaAtras.setDate(agora.getDate() - 7);
            const umaSemanaFrente = new Date();
            umaSemanaFrente.setDate(agora.getDate() + 7);

            const { data: concluidas } = await supabaseAdmin
                .from('sessoes')
                .select('id')
                .eq('professor_id', professorId)
                .eq('status', 'concluida')
                .gte('data_hora_inicio', umaSemanaAtras.toISOString())
                .lte('data_hora_inicio', agora.toISOString());

            const { data: agendadas } = await supabaseAdmin
                .from('sessoes')
                .select('id')
                .eq('professor_id', professorId)
                .eq('status', 'agendada')
                .gte('data_hora_inicio', agora.toISOString())
                .lte('data_hora_inicio', umaSemanaFrente.toISOString());

            let message = `💼 *RESUMO PROFESSOR - SEMANAL*\n\n`;
            message += `✅ *Semana Passada:* ${concluidas?.length || 0} aulas concluídas.\n`;
            message += `📅 *Próxima Semana:* ${agendadas?.length || 0} aulas já agendadas.\n\n`;
            message += `Bora bater as metas! 💪`;

            // Envia para o telefone do professor usando a INSTÂNCIA CENTRAL
            await this.sendMessage(professor.telefone_whatsapp, message, this.centralInstance);
        } catch (err) {
            console.error('Erro no Resumo Semanal:', err);
        }
    }

    /**
     * Lembretes para os Alunos (Pode ser rodado de manhã para o dia ou 1h antes)
     * @param {string} mode - 'daily' (aulas do dia) ou 'hourly' (1h antes)
     */
    async sendStudentReminders(mode = 'hourly') {
        try {
            const agora = new Date();
            let inicioJanela, fimJanela;

            if (mode === 'hourly') {
                // Aulas que começam entre 45 e 75 minutos a partir de agora (~1h)
                inicioJanela = new Date(agora.getTime() + 45 * 60000).toISOString();
                fimJanela = new Date(agora.getTime() + 75 * 60000).toISOString();
            } else {
                // Aulas de hoje (usado no lembrete matinal)
                inicioJanela = new Date(agora.setHours(0, 0, 0, 0)).toISOString();
                fimJanela = new Date(agora.setHours(23, 59, 59, 999)).toISOString();
            }

            console.log(`🔍 Buscando aulas para lembrete (${mode}) entre ${inicioJanela} e ${fimJanela}`);

            const { data: sessoes, error } = await supabaseAdmin
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

            if (error || !sessoes || sessoes.length === 0) return;

            for (const sessao of sessoes) {
                // Só envia se o aluno tiver notificações ativas
                if (sessao.aluno?.notificacoes_ativas && sessao.aluno?.telefone_whatsapp) {
                    const hora = new Date(sessao.data_hora_inicio).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
                    let message = '';

                    if (mode === 'hourly') {
                        message = `🏋️‍♂️ *LEMBRETE ALUNO*\n\nOlá, ${sessao.aluno.nome}! 👋\n\nSua aula de *${sessao.servico.nome}* começa em 1 hora, às *${hora}*.\n\nAté logo! 💪`;
                    } else {
                        message = `🏋️‍♂️ *LEMBRETE ALUNO*\n\nBom dia, ${sessao.aluno.nome}! 👋\n\nConfirmando nossa aula de hoje:\n💪 *${sessao.servico.nome}*\n⏰ às *${hora}*.\n\nVamo pra cima! 🔥`;
                    }

                    await this.sendMessage(sessao.aluno.telefone_whatsapp, message, sessao.professor?.whatsapp_instance);
                }
            }
        } catch (err) {
            console.error(`Erro nos Lembretes de Aula (${mode}):`, err);
        }
    }
}

module.exports = new NotificationService();
