const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { supabaseAdmin } = require('../config/supabase');
const { enviarMensagem } = require('../config/evolution');

/**
 * Processa comandos WhatsApp
 */
async function processarComando(professorId, comando) {
    const comandoUpper = comando.trim().toUpperCase();

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const amanha = new Date(hoje);
    amanha.setDate(amanha.getDate() + 1);
    const fimSemana = new Date(hoje);
    fimSemana.setDate(fimSemana.getDate() + 7);

    switch (comandoUpper) {
        case 'HOJE':
            const { data: sessoesHoje } = await supabaseAdmin
                .from('sessoes')
                .select(`
          data_hora_inicio,
          aluno:alunos(nome),
          servico:servicos(nome)
        `)
                .eq('professor_id', professorId)
                .eq('status', 'agendada')
                .gte('data_hora_inicio', hoje.toISOString())
                .lt('data_hora_inicio', amanha.toISOString())
                .order('data_hora_inicio');

            if (!sessoesHoje || sessoesHoje.length === 0) {
                return 'Você não tem sessões agendadas para hoje.';
            }

            let mensagemHoje = 'Suas sessões de hoje:\n\n';
            sessoesHoje.forEach(s => {
                const hora = new Date(s.data_hora_inicio).toLocaleTimeString('pt-BR', {
                    hour: '2-digit',
                    minute: '2-digit',
                    timeZone: 'America/Sao_Paulo'
                });
                mensagemHoje += `- ${hora} - ${s.aluno.nome} (${s.servico.nome})\n`;
            });
            mensagemHoje += `\nTotal: ${sessoesHoje.length} sessões`;
            return mensagemHoje;

        case 'AMANHÃ':
        case 'AMANHA':
            const fimAmanha = new Date(amanha);
            fimAmanha.setDate(fimAmanha.getDate() + 1);

            const { data: sessoesAmanha } = await supabaseAdmin
                .from('sessoes')
                .select(`
          data_hora_inicio,
          aluno:alunos(nome),
          servico:servicos(nome)
        `)
                .eq('professor_id', professorId)
                .eq('status', 'agendada')
                .gte('data_hora_inicio', amanha.toISOString())
                .lt('data_hora_inicio', fimAmanha.toISOString())
                .order('data_hora_inicio');

            if (!sessoesAmanha || sessoesAmanha.length === 0) {
                return 'Você não tem sessões agendadas para amanhã.';
            }

            let mensagemAmanha = 'Suas sessões de amanhã:\n\n';
            sessoesAmanha.forEach(s => {
                const hora = new Date(s.data_hora_inicio).toLocaleTimeString('pt-BR', {
                    hour: '2-digit',
                    minute: '2-digit',
                    timeZone: 'America/Sao_Paulo'
                });
                mensagemAmanha += `- ${hora} - ${s.aluno.nome} (${s.servico.nome})\n`;
            });
            mensagemAmanha += `\nTotal: ${sessoesAmanha.length} sessões`;
            return mensagemAmanha;

        case 'SEMANA':
            const { data: sessoesSemana } = await supabaseAdmin
                .from('sessoes')
                .select(`
          data_hora_inicio,
          aluno:alunos(nome),
          servico:servicos(nome)
        `)
                .eq('professor_id', professorId)
                .eq('status', 'agendada')
                .gte('data_hora_inicio', hoje.toISOString())
                .lt('data_hora_inicio', fimSemana.toISOString())
                .order('data_hora_inicio');

            if (!sessoesSemana || sessoesSemana.length === 0) {
                return 'Você não tem sessões agendadas para esta semana.';
            }

            // Agrupar por dia
            const sessoesPorDia = {};
            sessoesSemana.forEach(s => {
                const data = new Date(s.data_hora_inicio);
                const dataStr = data.toLocaleDateString('pt-BR', {
                    weekday: 'long',
                    day: '2-digit',
                    month: '2-digit',
                    timeZone: 'America/Sao_Paulo'
                });
                if (!sessoesPorDia[dataStr]) {
                    sessoesPorDia[dataStr] = [];
                }
                sessoesPorDia[dataStr].push(s);
            });

            let mensagemSemana = 'Suas sessões desta semana:\n\n';
            Object.keys(sessoesPorDia).forEach(dia => {
                mensagemSemana += `${dia}:\n`;
                sessoesPorDia[dia].forEach(s => {
                    const hora = new Date(s.data_hora_inicio).toLocaleTimeString('pt-BR', {
                        hour: '2-digit',
                        minute: '2-digit',
                        timeZone: 'America/Sao_Paulo'
                    });
                    mensagemSemana += `- ${hora} - ${s.aluno.nome}\n`;
                });
                mensagemSemana += '\n';
            });
            mensagemSemana += `Total: ${sessoesSemana.length} sessões`;
            return mensagemSemana;

        case 'VENCIMENTOS':
            const { data: contratosVencendo } = await supabaseAdmin
                .from('contratos')
                .select(`
          data_vencimento,
          valor_mensal,
          aluno:alunos(nome),
          servico:servicos(nome)
        `)
                .eq('professor_id', professorId)
                .eq('status', 'ativo')
                .gte('data_vencimento', hoje.toISOString().split('T')[0])
                .lte('data_vencimento', fimSemana.toISOString().split('T')[0])
                .order('data_vencimento');

            if (!contratosVencendo || contratosVencendo.length === 0) {
                return 'Você não tem contratos vencendo nos próximos 7 dias.';
            }

            let mensagemVencimentos = 'Contratos vencendo nos próximos 7 dias:\n\n';
            contratosVencendo.forEach(c => {
                const dataVenc = new Date(c.data_vencimento).toLocaleDateString('pt-BR', {
                    timeZone: 'America/Sao_Paulo'
                });
                const diasRestantes = Math.ceil((new Date(c.data_vencimento) - hoje) / (1000 * 60 * 60 * 24));
                mensagemVencimentos += `- ${c.aluno.nome} (${c.servico.nome})\n`;
                mensagemVencimentos += `  Vence em: ${dataVenc} (${diasRestantes} dias)\n`;
                mensagemVencimentos += `  Valor: R$ ${parseFloat(c.valor_mensal).toFixed(2)}\n\n`;
            });
            return mensagemVencimentos;

        default:
            return 'Comando não reconhecido. Comandos disponíveis:\n- HOJE\n- AMANHÃ\n- SEMANA\n- VENCIMENTOS';
    }
}

/**
 * POST /webhook/whatsapp
 * Receber webhooks da Evolution API
 */
router.post('/whatsapp', async (req, res) => {
    try {
        const { data } = req.body;

        // Validar estrutura do webhook
        if (!data || !data.key || !data.key.remoteJid || !data.message) {
            return res.status(200).json({ success: true });
        }

        const from = data.key.remoteJid.replace('@s.whatsapp.net', '');
        const messageText = data.message.conversation ||
            data.message.extendedTextMessage?.text || '';

        if (!messageText) {
            return res.status(200).json({ success: true });
        }

        // Gerar hash do webhook para idempotência
        const webhookHash = crypto
            .createHash('md5')
            .update(JSON.stringify({ from, messageText, timestamp: data.messageTimestamp }))
            .digest('hex');

        // Verificar se já processou este webhook
        const { data: jaProcessado } = await supabaseAdmin
            .from('webhooks_processados')
            .select('id')
            .eq('webhook_hash', webhookHash)
            .single();

        if (jaProcessado) {
            console.log('Webhook já processado, ignorando');
            return res.status(200).json({ success: true });
        }

        // Registrar webhook como processado
        await supabaseAdmin
            .from('webhooks_processados')
            .insert({ webhook_hash: webhookHash });

        // Identificar professor pelo telefone
        const { data: professor } = await supabaseAdmin
            .from('professores')
            .select('id, nome')
            .eq('telefone_whatsapp', from)
            .single();

        if (!professor) {
            console.log('Mensagem de número não cadastrado como professor, ignorando');
            return res.status(200).json({ success: true });
        }

        // Processar comando
        const resposta = await processarComando(professor.id, messageText);

        // Enviar resposta
        await enviarMensagem(from, resposta);

        // Registrar log
        await supabaseAdmin
            .from('notification_log')
            .insert({
                professor_id: professor.id,
                tipo: 'comando_whatsapp',
                canal: 'whatsapp',
                mensagem: `Comando: ${messageText}\nResposta: ${resposta}`,
                status: 'enviado',
                enviado_em: new Date().toISOString()
            });

        res.status(200).json({ success: true });
    } catch (error) {
        console.error('Erro ao processar webhook:', error);
        res.status(200).json({ success: true }); // Sempre retornar 200 para Evolution
    }
});

module.exports = router;
