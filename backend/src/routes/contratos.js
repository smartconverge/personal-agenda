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
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const from = (page - 1) * limit;
        const to = from + limit - 1;

        let query = supabaseAdmin
            .from('contratos')
            .select(`
        *,
        aluno:alunos(id, nome, telefone_whatsapp),
        servico:servicos(id, nome, tipo, duracao_minutos)
      `, { count: 'exact' })
            .eq('professor_id', req.professorId)
            .is('deleted_at', null)
            .order('created_at', { ascending: false })
            .range(from, to);

        if (aluno_id) {
            query = query.eq('aluno_id', aluno_id);
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
        const { valor_mensal, data_inicio, data_vencimento, status } = req.body;

        const updateData = {};
        if (valor_mensal !== undefined) updateData.valor_mensal = parseFloat(valor_mensal);
        if (data_inicio !== undefined) updateData.data_inicio = data_inicio;
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
 * Cancelar ou excluir contrato
 */
router.delete('/:id', authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const { excluir } = req.query; // ?excluir=true para remover do banco

        // 1. Buscar o contrato para saber aluno e serviço
        const { data: contrato, error: erroBusca } = await supabaseAdmin
            .from('contratos')
            .select('*')
            .eq('id', id)
            .eq('professor_id', req.professorId)
            .single();

        if (erroBusca || !contrato) {
            return res.status(404).json({
                success: false,
                error: 'Contrato não encontrado'
            });
        }

        // 2. Cancelar TODAS as sessões futuras agendadas deste aluno
        // Mudança: Cancelar de todos os serviços para garantir que a agenda fique livre
        const agora = new Date().toISOString();
        const { data: sessoesCanceladas, error: erroCancelamento } = await supabaseAdmin
            .from('sessoes')
            .update({ status: 'cancelada', observacoes: 'Cancelada automaticamente pelo encerramento do contrato.' })
            .eq('aluno_id', contrato.aluno_id)
            .eq('status', 'agendada')
            .gte('data_hora_inicio', agora)
            .select();

        let mensagem = `Contrato cancelado e ${sessoesCanceladas?.length || 0} sessões futuras do aluno foram canceladas.`;

        // 3. Excluir ou Cancelar o Contrato
        if (excluir === 'true') {
            const { error: erroExclusao } = await supabaseAdmin
                .from('contratos')
                .delete()
                .eq('id', id);

            if (erroExclusao) throw erroExclusao;
            mensagem = `Contrato excluído e ${sessoesCanceladas?.length || 0} sessões futuras canceladas.`;
        } else {
            const { error: erroUpdate } = await supabaseAdmin
                .from('contratos')
                .update({ status: 'cancelado' })
                .eq('id', id);

            if (erroUpdate) throw erroUpdate;
        }

        res.json({
            success: true,
            data: {
                message: mensagem,
                sessoes_canceladas: sessoesCanceladas?.length || 0
            }
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
