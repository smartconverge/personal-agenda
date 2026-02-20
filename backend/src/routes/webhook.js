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

    // Lógica de Sinônimos
    const isHoje = comandoUpper === 'HOJE' || comandoUpper === 'HJ' || comandoUpper.includes('AGENDA HOJE') || comandoUpper === 'AGENDA';
    const isAmanha = comandoUpper === 'AMANHA' || comandoUpper === 'AMANHÃ' || comandoUpper === 'AMNH' || comandoUpper.includes('AGENDA AMANHA');
    const isSemana = comandoUpper === 'SEMANA' || comandoUpper.includes('AGENDA SEMANA') || comandoUpper.includes('PROXIMA SEMANA');
    const isVencimentos = comandoUpper === 'VENCIMENTOS' || comandoUpper === 'VENCIMENTO' || comandoUpper === 'VENCE' || comandoUpper === 'PAGAMENTOS' || comandoUpper === 'FINANCEIRO';

    if (isHoje) {
        // ... existente bloco HOJE ...
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
            return '☕ *Você não tem sessões agendadas para hoje.* Aproveite o descanso ou foque no planejamento! 🔥';
        }

        let mensagemHoje = `━━━━━━━━━━━━━━\n`;
        mensagemHoje += `📅 *AGENDA DE HOJE*\n`;
        mensagemHoje += `━━━━━━━━━━━━━━\n\n`;

        sessoesHoje.forEach(s => {
            const hora = new Date(s.data_hora_inicio).toLocaleTimeString('pt-BR', {
                hour: '2-digit',
                minute: '2-digit',
                timeZone: 'America/Sao_Paulo'
            });
            mensagemHoje += `⏰ *${hora}* - ${s.aluno.nome}\n`;
            mensagemHoje += `💪 _${s.servico.nome}_\n\n`;
        });

        mensagemHoje += `━━━━━━━━━━━━━━\n`;
        mensagemHoje += `🎯 Total: *${sessoesHoje.length} sessões*`;
        return mensagemHoje;
    }

    if (isAmanha) {
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
            return '✨ *Nenhum agendamento para amanhã ainda.*';
        }

        let mensagemAmanha = `━━━━━━━━━━━━━━\n`;
        mensagemAmanha += `🌅 *AGENDA DE AMANHÃ*\n`;
        mensagemAmanha += `━━━━━━━━━━━━━━\n\n`;

        sessoesAmanha.forEach(s => {
            const hora = new Date(s.data_hora_inicio).toLocaleTimeString('pt-BR', {
                hour: '2-digit',
                minute: '2-digit',
                timeZone: 'America/Sao_Paulo'
            });
            mensagemAmanha += `⏰ *${hora}* - ${s.aluno.nome}\n`;
            mensagemAmanha += `💪 _${s.servico.nome}_\n\n`;
        });

        mensagemAmanha += `━━━━━━━━━━━━━━\n`;
        mensagemAmanha += `🎯 Total: *${sessoesAmanha.length} sessões*`;
        return mensagemAmanha;
    }

    if (isSemana) {
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
            return '🗓️ *Sua agenda está vazia para os próximos 7 dias.*';
        }

        const sessoPorDia = {};
        sessoesSemana.forEach(s => {
            const data = new Date(s.data_hora_inicio);
            const dataStr = data.toLocaleDateString('pt-BR', {
                weekday: 'long',
                day: '2-digit',
                month: '2-digit',
                timeZone: 'America/Sao_Paulo'
            });
            if (!sessoPorDia[dataStr]) sessoPorDia[dataStr] = [];
            sessoPorDia[dataStr].push(s);
        });

        let mensagemSemana = `━━━━━━━━━━━━━━\n`;
        mensagemSemana += `🗓️ *RESUMO DA SEMANA*\n`;
        mensagemSemana += `━━━━━━━━━━━━━━\n\n`;

        Object.keys(sessoPorDia).forEach(dia => {
            const diaCapitalizado = dia.charAt(0).toUpperCase() + dia.slice(1);
            mensagemSemana += `📌 *${diaCapitalizado}*\n`;
            sessoPorDia[dia].forEach(s => {
                const hora = new Date(s.data_hora_inicio).toLocaleTimeString('pt-BR', {
                    hour: '2-digit',
                    minute: '2-digit',
                    timeZone: 'America/Sao_Paulo'
                });
                mensagemSemana += `  • ${hora} - ${s.aluno.nome} (_${s.servico.nome}_)\n`;
            });
            mensagemSemana += '\n';
        });

        mensagemSemana += `━━━━━━━━━━━━━━\n`;
        mensagemSemana += `✅ Total: *${sessoesSemana.length} aulas* na semana`;
        return mensagemSemana;
    }

    if (isVencimentos) {
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
            return '💰 *Ótimas notícias! Nenhum contrato vencendo nos próximos 7 dias.*';
        }

        let mensagemVencimentos = `━━━━━━━━━━━━━━\n`;
        mensagemVencimentos += `💸 *CONTRATOS VENCENDO*\n`;
        mensagemVencimentos += `━━━━━━━━━━━━━━\n\n`;

        contratosVencendo.forEach(c => {
            const dataVenc = new Date(c.data_vencimento).toLocaleDateString('pt-BR', {
                timeZone: 'America/Sao_Paulo'
            });
            const diasRestantes = Math.ceil((new Date(c.data_vencimento) - hoje) / (1000 * 60 * 60 * 24));
            mensagemVencimentos += `👤 *${c.aluno.nome}*\n`;
            mensagemVencimentos += `📚 _${c.servico.nome}_\n`;
            mensagemVencimentos += `📅 Venc: ${dataVenc} (*${diasRestantes === 0 ? 'HOJE!' : diasRestantes + ' dias'}*)\n`;
            mensagemVencimentos += `💰 Valor: *R$ ${parseFloat(c.valor_mensal).toFixed(2)}*\n\n`;
        });

        mensagemVencimentos += `━━━━━━━━━━━━━━`;
        return mensagemVencimentos;
    }

    return '🤔 *Não entendi esse comando.* Tente:\n- hoje / hj\n- amanhã / amnh\n- semana\n- vencimentos / financeiro';
}

/**
 * POST /webhook/whatsapp
 * Receber webhooks da Evolution API
 */
router.post('/whatsapp', async (req, res) => {
    try {
        // Validação de segurança: Verifica se a apikey enviada bate com a nossa WEBHOOK_SECRET
        const apiKey = req.headers['apikey'] || req.headers['webhook-token'];
        const secret = process.env.WEBHOOK_SECRET;

        if (secret && apiKey !== secret) {
            console.warn('⚠️ Tentativa de acesso não autorizado ao Webhook. Token inválido.');
            return res.status(401).json({ success: false, error: 'Unauthorized' });
        }

        const { data, instance: instanceReceived } = req.body;

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
            .select('id, nome, whatsapp_instance')
            .eq('telefone_whatsapp', from)
            .single();

        // Filtro de Segurança / Contexto:
        // Se o professor estiver mandando mensagem na PRÓPRIA INSTÂNCIA dele, 
        // nós ignoramos para que ele possa usar o chat para anotações pessoais sem o bot responder.
        // O bot só responde se a mensagem CHEGAR pela instância Central.
        const { EVOLUTION_CENTRAL_INSTANCE } = process.env;
        if (instanceReceived === professor.whatsapp_instance && instanceReceived !== EVOLUTION_CENTRAL_INSTANCE) {
            console.log(`📝 Mensagem ignorada (Anotação pessoal na instância: ${instanceReceived})`);
            return res.status(200).json({ success: true });
        }

        // Processar comando
        const resposta = await processarComando(professor.id, messageText);

        // Enviar responder pela mesma instância que recebeu (Simetria)
        // Se não tiver a info da instância vinda no webhook, cai no fallback da instância do professor ou central
        const instanceToReply = instanceReceived || professor.whatsapp_instance;

        const { enviarMensagem } = require('../config/evolution');
        await enviarMensagem(from, resposta, instanceToReply);

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
