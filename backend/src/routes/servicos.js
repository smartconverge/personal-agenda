const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { supabaseAdmin } = require('../config/supabase');

/**
 * GET /servicos
 * Listar serviços do professor
 */
router.get('/', authenticate, async (req, res) => {
    try {
        const { tipo } = req.query;

        let query = supabaseAdmin
            .from('servicos')
            .select('*')
            .eq('professor_id', req.professorId)
            .is('deleted_at', null)
            .order('nome', { ascending: true });

        if (tipo) {
            query = query.eq('tipo', tipo);
        }

        const { data, error } = await query;

        if (error) throw error;

        res.json({
            success: true,
            data
        });
    } catch (error) {
        console.error('Erro ao listar serviços:', error);
        res.status(500).json({
            success: false,
            error: 'Erro ao listar serviços'
        });
    }
});

/**
 * POST /servicos
 * Criar novo serviço
 */
router.post('/', authenticate, async (req, res) => {
    try {
        const { tipo, nome, duracao_minutos } = req.body;

        if (!tipo || !nome || (tipo !== 'ficha' && !duracao_minutos)) {
            return res.status(400).json({
                success: false,
                error: 'Tipo e nome são obrigatórios. Duração é obrigatória para serviços presenciais/online.'
            });
        }

        if (!['presencial', 'online', 'ficha'].includes(tipo)) {
            return res.status(400).json({
                success: false,
                error: 'Tipo inválido. Use: presencial, online ou ficha'
            });
        }

        const { data, error } = await supabaseAdmin
            .from('servicos')
            .insert({
                professor_id: req.professorId,
                tipo,
                nome: nome.trim(),
                duracao_minutos: tipo === 'ficha' ? 1 : (parseInt(duracao_minutos) || 15)
            })
            .select()
            .single();

        if (error) {
            console.error('Erro DB ao criar serviço:', error);
            return res.status(400).json({
                success: false,
                error: `Erro no banco: ${error.message}`
            });
        }

        res.status(201).json({
            success: true,
            data
        });
    } catch (error) {
        console.error('Erro interno ao criar serviço:', error);
        res.status(500).json({
            success: false,
            error: `Erro interno: ${error.message}`
        });
    }
});

/**
 * PUT /servicos/:id
 * Atualizar serviço
 */
router.put('/:id', authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const { nome, duracao_minutos } = req.body;

        const updateData = {};
        if (nome !== undefined) updateData.nome = nome.trim();
        if (duracao_minutos !== undefined) updateData.duracao_minutos = parseInt(duracao_minutos);

        const { data, error } = await supabaseAdmin
            .from('servicos')
            .update(updateData)
            .eq('id', id)
            .eq('professor_id', req.professorId)
            .is('deleted_at', null)
            .select()
            .single();

        if (error) throw error;

        if (!data) {
            return res.status(404).json({
                success: false,
                error: 'Serviço não encontrado'
            });
        }

        res.json({
            success: true,
            data
        });
    } catch (error) {
        console.error('Erro ao atualizar serviço:', error);
        res.status(500).json({
            success: false,
            error: 'Erro ao atualizar serviço'
        });
    }
});

/**
 * DELETE /servicos/:id
 * Excluir serviço (soft delete)
 */
router.delete('/:id', authenticate, async (req, res) => {
    try {
        const { id } = req.params;

        const { data, error } = await supabaseAdmin
            .from('servicos')
            .update({ deleted_at: new Date().toISOString() })
            .eq('id', id)
            .eq('professor_id', req.professorId)
            .is('deleted_at', null)
            .select()
            .single();

        if (error) throw error;

        if (!data) {
            return res.status(404).json({
                success: false,
                error: 'Serviço não encontrado'
            });
        }

        res.json({
            success: true,
            data: { message: 'Serviço excluído com sucesso' }
        });
    } catch (error) {
        console.error('Erro ao excluir serviço:', error);
        res.status(500).json({
            success: false,
            error: 'Erro ao excluir serviço'
        });
    }
});

module.exports = router;
