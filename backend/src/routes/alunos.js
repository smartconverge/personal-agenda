const express = require('express');
const router = express.Router();
const multer = require('multer');
const Papa = require('papaparse');
const { authenticate } = require('../middleware/auth');
const { supabaseAdmin } = require('../config/supabase');

const upload = multer({ storage: multer.memoryStorage() });

/**
 * GET /alunos
 * Listar alunos do professor
 */
router.get('/', authenticate, async (req, res) => {
    try {
        const { nome, notificacoes_ativas } = req.query;

        let query = supabaseAdmin
            .from('alunos')
            .select('*')
            .eq('professor_id', req.professorId)
            .is('deleted_at', null)
            .order('nome', { ascending: true });

        if (nome) {
            query = query.ilike('nome', `%${nome}%`);
        }

        if (notificacoes_ativas !== undefined) {
            query = query.eq('notificacoes_ativas', notificacoes_ativas === 'true');
        }

        const { data, error } = await query;

        if (error) throw error;

        res.json({
            success: true,
            data
        });
    } catch (error) {
        console.error('Erro ao listar alunos:', error);
        res.status(500).json({
            success: false,
            error: 'Erro ao listar alunos'
        });
    }
});

/**
 * POST /alunos
 * Criar novo aluno
 */
router.post('/', authenticate, async (req, res) => {
    try {
        const { nome, telefone_whatsapp, notificacoes_ativas } = req.body;

        if (!nome || !telefone_whatsapp) {
            return res.status(400).json({
                success: false,
                error: 'Nome e telefone são obrigatórios'
            });
        }

        const { data, error } = await supabaseAdmin
            .from('alunos')
            .insert({
                professor_id: req.professorId,
                nome: nome.trim(),
                telefone_whatsapp: telefone_whatsapp.trim(),
                notificacoes_ativas: notificacoes_ativas || false
            })
            .select()
            .single();

        if (error) {
            if (error.code === '23505') {
                return res.status(409).json({
                    success: false,
                    error: 'Aluno com este telefone já existe'
                });
            }
            throw error;
        }

        res.status(201).json({
            success: true,
            data
        });
    } catch (error) {
        console.error('Erro ao criar aluno:', error);
        res.status(500).json({
            success: false,
            error: 'Erro ao criar aluno'
        });
    }
});

/**
 * PUT /alunos/:id
 * Atualizar aluno
 */
router.put('/:id', authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const { nome, telefone_whatsapp, notificacoes_ativas } = req.body;

        const updateData = {};
        if (nome !== undefined) updateData.nome = nome.trim();
        if (telefone_whatsapp !== undefined) updateData.telefone_whatsapp = telefone_whatsapp.trim();
        if (notificacoes_ativas !== undefined) updateData.notificacoes_ativas = notificacoes_ativas;

        const { data, error } = await supabaseAdmin
            .from('alunos')
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
                error: 'Aluno não encontrado'
            });
        }

        res.json({
            success: true,
            data
        });
    } catch (error) {
        console.error('Erro ao atualizar aluno:', error);
        res.status(500).json({
            success: false,
            error: 'Erro ao atualizar aluno'
        });
    }
});

/**
 * DELETE /alunos/:id
 * Excluir aluno (soft delete)
 */
router.delete('/:id', authenticate, async (req, res) => {
    try {
        const { id } = req.params;

        const { data, error } = await supabaseAdmin
            .from('alunos')
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
                error: 'Aluno não encontrado'
            });
        }

        res.json({
            success: true,
            data: { message: 'Aluno excluído com sucesso' }
        });
    } catch (error) {
        console.error('Erro ao excluir aluno:', error);
        res.status(500).json({
            success: false,
            error: 'Erro ao excluir aluno'
        });
    }
});

/**
 * POST /alunos/importar-csv
 * Importar alunos via CSV
 */
router.post('/importar-csv', authenticate, upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'Arquivo CSV não fornecido'
            });
        }

        const csvContent = req.file.buffer.toString('utf-8');

        const parsed = Papa.parse(csvContent, {
            header: true,
            skipEmptyLines: true
        });

        if (parsed.errors.length > 0) {
            return res.status(400).json({
                success: false,
                error: 'Erro ao processar CSV',
                details: parsed.errors
            });
        }

        // Chamar função do banco
        const { data, error } = await supabaseAdmin
            .rpc('importar_alunos_csv', {
                p_professor_id: req.professorId,
                p_dados: parsed.data
            });

        if (error) throw error;

        res.json({
            success: true,
            data
        });
    } catch (error) {
        console.error('Erro ao importar CSV:', error);
        res.status(500).json({
            success: false,
            error: 'Erro ao importar CSV'
        });
    }
});

module.exports = router;
