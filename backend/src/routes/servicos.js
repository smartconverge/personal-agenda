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

        if (!tipo || !nome || !duracao_minutos) {
            return res.status(400).json({
                success: false,
                error: 'Tipo, nome e duração são obrigatórios'
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
                duracao_minutos: parseInt(duracao_minutos)
            })
            .select()
            .single();

        if (error) throw error;

        res.status(201).json({
            success: true,
            data
        });
    } catch (error) {
        console.error('Erro ao criar serviço:', error);
        res.status(500).json({
            success: false,
            error: 'Erro ao criar serviço'
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
