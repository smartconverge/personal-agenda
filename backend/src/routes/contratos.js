const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { supabaseAdmin } = require('../config/supabase');

/**
 * GET /contratos
 * Listar contratos do professor
 */
router.get('/', authenticate, async (req, res) => {
    try {
        const { aluno_id, status } = req.query;

        let query = supabaseAdmin
            .from('contratos')
            .select(`
        *,
        aluno:alunos(id, nome, telefone_whatsapp),
        servico:servicos(id, nome, tipo, duracao_minutos)
      `)
            .eq('professor_id', req.professorId)
            .is('deleted_at', null)
            .order('created_at', { ascending: false });

        if (aluno_id) {
            query = query.eq('aluno_id', aluno_id);
        }

        if (status) {
            query = query.eq('status', status);
        }

        const { data, error } = await query;

        if (error) throw error;

        res.json({
            success: true,
            data
        });
    } catch (error) {
        console.error('Erro ao listar contratos:', error);
        res.status(500).json({
            success: false,
            error: 'Erro ao listar contratos'
        });
    }
});

/**
 * POST /contratos
 * Criar novo contrato
 */
router.post('/', authenticate, async (req, res) => {
    try {
        const { aluno_id, servico_id, data_inicio, valor_mensal } = req.body;

        if (!aluno_id || !servico_id || !data_inicio || !valor_mensal) {
            return res.status(400).json({
                success: false,
                error: 'Aluno, serviço, data de início e valor são obrigatórios'
            });
        }

        // Validar que aluno e serviço pertencem ao professor
        const { data: aluno } = await supabaseAdmin
            .from('alunos')
            .select('id')
            .eq('id', aluno_id)
            .eq('professor_id', req.professorId)
            .single();

        const { data: servico } = await supabaseAdmin
            .from('servicos')
            .select('id')
            .eq('id', servico_id)
            .eq('professor_id', req.professorId)
            .single();

        if (!aluno || !servico) {
            return res.status(404).json({
                success: false,
                error: 'Aluno ou serviço não encontrado'
            });
        }

        // Calcular data de vencimento (1 mês após início)
        const dataInicio = new Date(data_inicio);
        const dataVencimento = new Date(dataInicio);
        dataVencimento.setMonth(dataVencimento.getMonth() + 1);

        const { data, error } = await supabaseAdmin
            .from('contratos')
            .insert({
                professor_id: req.professorId,
                aluno_id,
                servico_id,
                data_inicio: dataInicio.toISOString().split('T')[0],
                data_vencimento: dataVencimento.toISOString().split('T')[0],
                valor_mensal: parseFloat(valor_mensal),
                status: 'ativo'
            })
            .select(`
        *,
        aluno:alunos(id, nome, telefone_whatsapp),
        servico:servicos(id, nome, tipo, duracao_minutos)
      `)
            .single();

        if (error) throw error;

        res.status(201).json({
            success: true,
            data
        });
    } catch (error) {
        console.error('Erro ao criar contrato:', error);
        res.status(500).json({
            success: false,
            error: 'Erro ao criar contrato'
        });
    }
});

/**
 * PUT /contratos/:id
 * Atualizar contrato
 */
router.put('/:id', authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const { valor_mensal, data_vencimento, status } = req.body;

        const updateData = {};
        if (valor_mensal !== undefined) updateData.valor_mensal = parseFloat(valor_mensal);
        if (data_vencimento !== undefined) updateData.data_vencimento = data_vencimento;
        if (status !== undefined) updateData.status = status;

        const { data, error } = await supabaseAdmin
            .from('contratos')
            .update(updateData)
            .eq('id', id)
            .eq('professor_id', req.professorId)
            .is('deleted_at', null)
            .select(`
        *,
        aluno:alunos(id, nome, telefone_whatsapp),
        servico:servicos(id, nome, tipo, duracao_minutos)
      `)
            .single();

        if (error) throw error;

        if (!data) {
            return res.status(404).json({
                success: false,
                error: 'Contrato não encontrado'
            });
        }

        res.json({
            success: true,
            data
        });
    } catch (error) {
        console.error('Erro ao atualizar contrato:', error);
        res.status(500).json({
            success: false,
            error: 'Erro ao atualizar contrato'
        });
    }
});

/**
 * DELETE /contratos/:id
 * Cancelar contrato
 */
router.delete('/:id', authenticate, async (req, res) => {
    try {
        const { id } = req.params;

        const { data, error } = await supabaseAdmin
            .from('contratos')
            .update({ status: 'cancelado' })
            .eq('id', id)
            .eq('professor_id', req.professorId)
            .is('deleted_at', null)
            .select()
            .single();

        if (error) throw error;

        if (!data) {
            return res.status(404).json({
                success: false,
                error: 'Contrato não encontrado'
            });
        }

        res.json({
            success: true,
            data: { message: 'Contrato cancelado com sucesso' }
        });
    } catch (error) {
        console.error('Erro ao cancelar contrato:', error);
        res.status(500).json({
            success: false,
            error: 'Erro ao cancelar contrato'
        });
    }
});

module.exports = router;
