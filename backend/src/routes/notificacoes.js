const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { supabaseAdmin } = require('../config/supabase');

/**
 * GET /notificacoes
 * Listar histórico de notificações
 */
router.get('/', authenticate, async (req, res) => {
    try {
        const { tipo, status } = req.query;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const from = (page - 1) * limit;
        const to = from + limit - 1;

        let query = supabaseAdmin
            .from('notification_log')
            .select('*', { count: 'exact' })
            .eq('professor_id', req.professorId)
            .order('created_at', { ascending: false })
            .range(from, to);

        if (tipo) {
            query = query.eq('tipo', tipo);
        }

        if (status) {
            query = query.eq('status', status);
        }

        const { data, count, error } = await query;

        if (error) throw error;

        res.json({
            success: true,
            data,
            meta: {
                page,
                limit,
                total: count,
                totalPages: Math.ceil(count / limit)
            }
        });
    } catch (error) {
        console.error('Erro ao listar notificações:', error);
        res.status(500).json({
            success: false,
            error: 'Erro ao listar notificações'
        });
    }
});

/**
 * POST /notificacoes/testar
 * Enviar notificação de teste
 */
router.post('/testar', authenticate, async (req, res) => {
    try {
        const { aluno_id, mensagem } = req.body;

        if (!aluno_id || !mensagem) {
            return res.status(400).json({
                success: false,
                error: 'Aluno e mensagem são obrigatórios'
            });
        }

        // Buscar aluno
        const { data: aluno } = await supabaseAdmin
            .from('alunos')
            .select('telefone_whatsapp')
            .eq('id', aluno_id)
            .eq('professor_id', req.professorId)
            .single();

        if (!aluno) {
            return res.status(404).json({
                success: false,
                error: 'Aluno não encontrado'
            });
        }

        // Enviar via NotificationService consolidado
        const notificationService = require('../services/notificationService');
        await notificationService.sendMessage(aluno.telefone_whatsapp, mensagem);
        const resultado = { success: true }; // Se não estourar catch, consideramos que tentou enviar

        // Registrar log
        await supabaseAdmin
            .from('notification_log')
            .insert({
                professor_id: req.professorId,
                aluno_id,
                tipo: 'teste',
                canal: 'whatsapp',
                mensagem,
                status: resultado.success ? 'enviado' : 'falha',
                enviado_em: new Date().toISOString()
            });

        res.json({
            success: resultado.success,
            data: { message: resultado.success ? 'Mensagem enviada' : 'Falha ao enviar' }
        });
    } catch (error) {
        console.error('Erro ao enviar notificação de teste:', error);
        res.status(500).json({
            success: false,
            error: 'Erro ao enviar notificação de teste'
        });
    }
});

/**
 * POST /notificacoes/resumo-aluno
 * Enviar resumo de todos os agendamentos futuros para o aluno
 */
router.post('/resumo-aluno', authenticate, async (req, res) => {
    try {
        const { aluno_id } = req.body;

        if (!aluno_id) {
            return res.status(400).json({
                success: false,
                error: 'ID do aluno é obrigatório'
            });
        }

        const { data: aluno } = await supabaseAdmin
            .from('alunos')
            .select('*, professor:professores(whatsapp_instance)')
            .eq('id', aluno_id)
            .eq('professor_id', req.professorId)
            .single();

        if (!aluno) {
            return res.status(404).json({
                success: false,
                error: 'Aluno não encontrado'
            });
        }

        const agora = new Date().toISOString();
        const { data: sessoes, error: sessoesError } = await supabaseAdmin
            .from('sessoes')
            .select('*, servico:servicos(nome)')
            .eq('aluno_id', aluno_id)
            .eq('professor_id', req.professorId)
            .eq('status', 'agendada')
            .gte('data_hora_inicio', agora)
            .order('data_hora_inicio', { ascending: true });

        if (sessoesError) throw sessoesError;

        if (!sessoes || sessoes.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Não há agendamentos futuros para este aluno.'
            });
        }

        const notificationService = require('../services/notificationService');
        await notificationService.notifyMultipleSchedule(aluno, sessoes, aluno.professor?.whatsapp_instance);

        res.json({
            success: true,
            data: { message: `Resumo de ${sessoes.length} sessões enviado com sucesso!` }
        });

    } catch (error) {
        console.error('Erro ao enviar resumo para aluno:', error);
        res.status(500).json({
            success: false,
            error: 'Erro ao enviar resumo para aluno'
        });
    }
});

/**
 * PATCH /notificacoes/ler-todas
 * Marcar todas as notificações do professor como lidas
 */
router.patch('/ler-todas', authenticate, async (req, res) => {
    try {
        const { error } = await supabaseAdmin
            .from('notification_log')
            .update({ lida: true })
            .eq('professor_id', req.professorId)
            .eq('lida', false);

        if (error) throw error;

        res.json({
            success: true,
            message: 'Todas as notificações foram marcadas como lidas.'
        });
    } catch (error) {
        console.error('Erro ao marcar notificações como lidas:', error);
        res.status(500).json({
            success: false,
            error: 'Erro ao atualizar notificações'
        });
    }
});

module.exports = router;
