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

module.exports = router;
