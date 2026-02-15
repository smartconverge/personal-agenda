const express = require('express');
const router = express.Router();
const { supabaseAdmin } = require('../config/supabase');
const { authenticate } = require('../middleware/auth');

/**
 * GET /api/perfil
 * Retorna os dados do perfil do professor logado
 */
router.get('/', authenticate, async (req, res) => {
    try {
        const { data, error } = await supabaseAdmin
            .from('professores')
            .select('*')
            .eq('id', req.professorId)
            .single();

        if (error) {
            console.error('Erro ao buscar perfil:', error);
            return res.status(500).json({
                success: false,
                error: 'Erro ao buscar dados do perfil'
            });
        }

        res.json({
            success: true,
            data
        });
    } catch (error) {
        console.error('Erro interno no perfil:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno ao buscar perfil'
        });
    }
});

/**
 * PUT /api/perfil
 * Atualiza os dados do perfil do professor logado
 */
router.put('/', authenticate, async (req, res) => {
    try {
        const {
            nome,
            telefone_whatsapp,
            data_nascimento,
            cref,
            especialidade,
            bio,
            foto_url
        } = req.body;

        const updateData = {};
        if (nome !== undefined) updateData.nome = nome;
        if (telefone_whatsapp !== undefined) updateData.telefone_whatsapp = telefone_whatsapp;
        if (data_nascimento !== undefined) updateData.data_nascimento = data_nascimento;
        if (cref !== undefined) updateData.cref = cref;
        if (especialidade !== undefined) updateData.especialidade = especialidade;
        if (bio !== undefined) updateData.bio = bio;
        if (foto_url !== undefined) updateData.foto_url = foto_url;

        const { data, error } = await supabaseAdmin
            .from('professores')
            .update(updateData)
            .eq('id', req.professorId)
            .select()
            .single();

        if (error) {
            console.error('Erro ao atualizar perfil:', error);
            return res.status(500).json({
                success: false,
                error: 'Erro ao atualizar dados do perfil'
            });
        }

        res.json({
            success: true,
            data,
            message: 'Perfil atualizado com sucesso'
        });
    } catch (error) {
        console.error('Erro interno ao atualizar perfil:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno ao atualizar perfil'
        });
    }
});

module.exports = router;
