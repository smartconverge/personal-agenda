const cron = require('node-cron');
const { supabaseAdmin } = require('../config/supabase');
const { enviarMensagem } = require('../config/evolution');

/**
 * Verifica se já enviou notificação
 */
async function jaEnviouNotificacao(professorId, tipo, referenciaId = null, dataReferencia = null) {
    let query = supabaseAdmin
        .from('notification_log')
        .select('id')
        .eq('professor_id', professorId)
        .eq('tipo', tipo)
        .eq('status', 'enviado');

    if (referenciaId) {
        if (tipo === 'lembrete_sessao') {
            query = query.eq('sessao_id', referenciaId);
        } else if (tipo === 'vencimento_contrato') {
            query = query.eq('contrato_id', referenciaId);
        }
    }

    if (dataReferencia) {
        const dataInicio = new Date(dataReferencia);
        dataInicio.setHours(0, 0, 0, 0);
        const dataFim = new Date(dataInicio);
        dataFim.setDate(dataFim.getDate() + 1);

        query = query
            .gte('enviado_em', dataInicio.toISOString())
            .lt('enviado_em', dataFim.toISOString());
    }

    const { data } = await query.single();
    return !!data;
}

/**
 * Registra notificação
 */
async function registrarNotificacao(professorId, alunoId, tipo, canal, mensagem, status, sessaoId = null, contratoId = null) {
    await supabaseAdmin
        .from('notification_log')
        .insert({
            professor_id: professorId,
            aluno_id: alunoId,
            sessao_id: sessaoId,
            contrato_id: contratoId,
            tipo,
            canal,
            mensagem,
            status,
            enviado_em: new Date().toISOString()
        });
}

/**
 * Job: Resumo Diário (06:00)
 */
function jobResumoDiario() {
    const cronExpression = process.env.CRON_RESUMO_DIARIO || '0 6 * * *';

    cron.schedule(cronExpression, async () => {
        console.log('🔔 Executando job: Resumo Diário');

        try {
            const hoje = new Date();
            hoje.setHours(0, 0, 0, 0);
            const amanha = new Date(hoje);
            amanha.setDate(amanha.getDate() + 1);

            // Buscar todos os professores
            const { data: professores } = await supabaseAdmin
                .from('professores')
                .select('id, nome, telefone_whatsapp');

            for (const professor of professores) {
                // Verificar se já enviou resumo hoje
                const jaEnviou = await jaEnviouNotificacao(professor.id, 'resumo_diario', null, hoje);

                if (jaEnviou) {
                    console.log(`Resumo já enviado para ${professor.nome}`);
                    continue;
                }

                // Buscar sessões do dia
                const { data: sessoes } = await supabaseAdmin
                    .from('sessoes')
                    .select(`
            data_hora_inicio,
            aluno:alunos(nome),
            servico:servicos(nome)
          `)
                    .eq('professor_id', professor.id)
                    .eq('status', 'agendada')
                    .gte('data_hora_inicio', hoje.toISOString())
                    .lt('data_hora_inicio', amanha.toISOString())
                    .order('data_hora_inicio');

                if (!sessoes || sessoes.length === 0) {
                    continue; // Não enviar se não houver sessões
                }

                // Montar mensagem
                let mensagem = `Bom dia, ${professor.nome}! Suas sessões de hoje:\n\n`;
                sessoes.forEach(s => {
                    const hora = new Date(s.data_hora_inicio).toLocaleTimeString('pt-BR', {
                        hour: '2-digit',
                        minute: '2-digit',
                        timeZone: 'America/Sao_Paulo'
                    });
                    mensagem += `- ${hora} - ${s.aluno.nome} (${s.servico.nome})\n`;
                });
                mensagem += `\nTotal: ${sessoes.length} sessões`;

                // Enviar mensagem
                const resultado = await enviarMensagem(professor.telefone_whatsapp, mensagem);

                // Registrar log
                await registrarNotificacao(
                    professor.id,
                    null,
                    'resumo_diario',
                    'whatsapp',
                    mensagem,
                    resultado.success ? 'enviado' : 'falha'
                );

                console.log(`Resumo enviado para ${professor.nome}: ${resultado.success ? 'OK' : 'FALHA'}`);
            }
        } catch (error) {
            console.error('Erro no job de resumo diário:', error);
        }
    }, {
        timezone: 'America/Sao_Paulo'
    });

    console.log(`✅ Job Resumo Diário agendado: ${cronExpression}`);
}

/**
 * Job: Lembrete de Sessão (a cada 15 minutos)
 */
function jobLembreteSessao() {
    const cronExpression = process.env.CRON_LEMBRETE_SESSAO || '*/15 * * * *';
    const horasAntes = parseInt(process.env.LEMBRETE_SESSAO_HORAS_ANTES || '2');

    cron.schedule(cronExpression, async () => {
        console.log('🔔 Executando job: Lembrete de Sessão');

        try {
            const agora = new Date();
            const limiteInicio = new Date(agora.getTime() + horasAntes * 60 * 60 * 1000);

            // Buscar sessões nas próximas X horas
            const { data: sessoes } = await supabaseAdmin
                .from('sessoes')
                .select(`
          id,
          professor_id,
          data_hora_inicio,
          aluno:alunos(id, nome, telefone_whatsapp, notificacoes_ativas),
          servico:servicos(nome),
          professor:professores(nome)
        `)
                .eq('status', 'agendada')
                .gte('data_hora_inicio', agora.toISOString())
                .lte('data_hora_inicio', limiteInicio.toISOString());

            for (const sessao of sessoes || []) {
                // Verificar se aluno tem notificações ativas
                if (!sessao.aluno.notificacoes_ativas) {
                    continue;
                }

                // Verificar se já enviou lembrete para esta sessão
                const jaEnviou = await jaEnviouNotificacao(
                    sessao.professor_id,
                    'lembrete_sessao',
                    sessao.id
                );

                if (jaEnviou) {
                    continue;
                }

                // Montar mensagem
                const dataHora = new Date(sessao.data_hora_inicio);
                const hora = dataHora.toLocaleTimeString('pt-BR', {
                    hour: '2-digit',
                    minute: '2-digit',
                    timeZone: 'America/Sao_Paulo'
                });
                const data = dataHora.toLocaleDateString('pt-BR', {
                    timeZone: 'America/Sao_Paulo'
                });

                const mensagem = `Olá ${sessao.aluno.nome}! Lembrete: você tem ${sessao.servico.nome} hoje (${data}) às ${hora} com ${sessao.professor.nome}.`;

                // Enviar mensagem
                const resultado = await enviarMensagem(sessao.aluno.telefone_whatsapp, mensagem);

                // Registrar log
                await registrarNotificacao(
                    sessao.professor_id,
                    sessao.aluno.id,
                    'lembrete_sessao',
                    'whatsapp',
                    mensagem,
                    resultado.success ? 'enviado' : 'falha',
                    sessao.id
                );

                console.log(`Lembrete enviado para ${sessao.aluno.nome}: ${resultado.success ? 'OK' : 'FALHA'}`);
            }
        } catch (error) {
            console.error('Erro no job de lembrete de sessão:', error);
        }
    }, {
        timezone: 'America/Sao_Paulo'
    });

    console.log(`✅ Job Lembrete de Sessão agendado: ${cronExpression}`);
}

/**
 * Job: Lembrete de Vencimento (09:00)
 */
function jobLembreteVencimento() {
    const cronExpression = process.env.CRON_LEMBRETE_VENCIMENTO || '0 9 * * *';
    const diasAntes = parseInt(process.env.LEMBRETE_VENCIMENTO_DIAS_ANTES || '3');

    cron.schedule(cronExpression, async () => {
        console.log('🔔 Executando job: Lembrete de Vencimento');

        try {
            const hoje = new Date();
            hoje.setHours(0, 0, 0, 0);
            const limiteVencimento = new Date(hoje);
            limiteVencimento.setDate(limiteVencimento.getDate() + diasAntes);

            // Buscar contratos vencendo
            const { data: contratos } = await supabaseAdmin
                .from('contratos')
                .select(`
          id,
          professor_id,
          data_vencimento,
          valor_mensal,
          aluno:alunos(id, nome, telefone_whatsapp, notificacoes_ativas),
          servico:servicos(nome)
        `)
                .eq('status', 'ativo')
                .gte('data_vencimento', hoje.toISOString().split('T')[0])
                .lte('data_vencimento', limiteVencimento.toISOString().split('T')[0]);

            for (const contrato of contratos || []) {
                // Verificar se aluno tem notificações ativas
                if (!contrato.aluno.notificacoes_ativas) {
                    continue;
                }

                // Verificar se já enviou lembrete para este contrato
                const jaEnviou = await jaEnviouNotificacao(
                    contrato.professor_id,
                    'vencimento_contrato',
                    contrato.id
                );

                if (jaEnviou) {
                    continue;
                }

                // Calcular dias restantes
                const diasRestantes = Math.ceil(
                    (new Date(contrato.data_vencimento) - hoje) / (1000 * 60 * 60 * 24)
                );

                const dataVenc = new Date(contrato.data_vencimento).toLocaleDateString('pt-BR', {
                    timeZone: 'America/Sao_Paulo'
                });

                // Montar mensagem
                const mensagem = `Olá ${contrato.aluno.nome}! Seu contrato de ${contrato.servico.nome} vence em ${diasRestantes} dias (${dataVenc}). Valor: R$ ${parseFloat(contrato.valor_mensal).toFixed(2)}.`;

                // Enviar mensagem
                const resultado = await enviarMensagem(contrato.aluno.telefone_whatsapp, mensagem);

                // Registrar log
                await registrarNotificacao(
                    contrato.professor_id,
                    contrato.aluno.id,
                    'vencimento_contrato',
                    'whatsapp',
                    mensagem,
                    resultado.success ? 'enviado' : 'falha',
                    null,
                    contrato.id
                );

                console.log(`Lembrete de vencimento enviado para ${contrato.aluno.nome}: ${resultado.success ? 'OK' : 'FALHA'}`);
            }
        } catch (error) {
            console.error('Erro no job de lembrete de vencimento:', error);
        }
    }, {
        timezone: 'America/Sao_Paulo'
    });

    console.log(`✅ Job Lembrete de Vencimento agendado: ${cronExpression}`);
}

/**
 * Inicializa todos os jobs cron
 */
function initCronJobs() {
    jobResumoDiario();
    jobLembreteSessao();
    jobLembreteVencimento();
}

module.exports = {
    initCronJobs
};
