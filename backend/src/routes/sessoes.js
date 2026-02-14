const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { supabaseAdmin } = require('../config/supabase');

/**
 * Verifica conflitos de horário
 */
async function verificarConflito(professorId, dataHoraInicio, dataHoraFim, servicoId, sessaoIdExcluir = null) {
    // Buscar tipo do serviço
    const { data: servico } = await supabaseAdmin
        .from('servicos')
        .select('tipo')
        .eq('id', servicoId)
        .single();

    // Ficha não bloqueia agenda
    if (servico?.tipo === 'ficha') {
        return { temConflito: false };
    }

    // Buscar sessões que conflitam
    let query = supabaseAdmin
        .from('sessoes')
        .select('id, servico:servicos(tipo)')
        .eq('professor_id', professorId)
        .in('status', ['agendada', 'concluida'])
        .is('deleted_at', null)
        .or(`and(data_hora_inicio.lt.${dataHoraFim},data_hora_fim.gt.${dataHoraInicio})`);

    if (sessaoIdExcluir) {
        query = query.neq('id', sessaoIdExcluir);
    }

    const { data: sessoesConflitantes } = await query;

    // Filtrar apenas sessões que bloqueiam (presencial e online)
    const conflitos = sessoesConflitantes?.filter(s =>
        s.servico?.tipo === 'presencial' || s.servico?.tipo === 'online'
    ) || [];

    return {
        temConflito: conflitos.length > 0,
        conflitos
    };
}

/**
 * Cria sessões recorrentes
 */
async function criarSessoesRecorrentes(professorId, alunoId, servicoId, dataHoraInicio, dataHoraFim, meses = 3) {
    const sessoes = [];
    const dataInicio = new Date(dataHoraInicio);

    for (let i = 0; i < meses * 4; i++) { // 4 semanas por mês
        const novaData = new Date(dataInicio);
        novaData.setDate(novaData.getDate() + (i * 7)); // Adiciona 7 dias

        const novaDataFim = new Date(dataHoraFim);
        novaDataFim.setDate(novaDataFim.getDate() + (i * 7));

        sessoes.push({
            professor_id: professorId,
            aluno_id: alunoId,
            servico_id: servicoId,
            data_hora_inicio: novaData.toISOString(),
            data_hora_fim: novaDataFim.toISOString(),
            recorrencia: 'semanal',
            status: 'agendada'
        });
    }

    return sessoes;
}

/**
 * GET /sessoes
 * Listar sessões do professor
 */
router.get('/', authenticate, async (req, res) => {
    try {
        const { data_inicio, data_fim, aluno_id, status } = req.query;

        if (!data_inicio || !data_fim) {
            return res.status(400).json({
                success: false,
                error: 'data_inicio e data_fim são obrigatórios'
            });
        }

        let query = supabaseAdmin
            .from('sessoes')
            .select(`
        *,
        aluno:alunos(id, nome, telefone_whatsapp),
        servico:servicos(id, nome, tipo, duracao_minutos)
      `)
            .eq('professor_id', req.professorId)
            .is('deleted_at', null)
            .gte('data_hora_inicio', data_inicio)
            .lte('data_hora_inicio', data_fim)
            .order('data_hora_inicio', { ascending: true });

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
        console.error('Erro ao listar sessões:', error);
        res.status(500).json({
            success: false,
            error: 'Erro ao listar sessões'
        });
    }
});

/**
 * POST /sessoes
 * Criar sessão(ões)
 */
router.post('/', authenticate, async (req, res) => {
    try {
        const { aluno_id, servico_id, data_hora_inicio, recorrencia } = req.body;

        if (!aluno_id || !servico_id || !data_hora_inicio) {
            return res.status(400).json({
                success: false,
                error: 'Aluno, serviço e data/hora de início são obrigatórios'
            });
        }

        // 1. Buscar dados do professor (instância do WhatsApp)
        const { data: professor } = await supabaseAdmin
            .from('professores')
            .select('whatsapp_instance')
            .eq('id', req.professorId)
            .single();

        // Validar que aluno e serviço pertencem ao professor
        const { data: aluno } = await supabaseAdmin
            .from('alunos')
            .select('id')
            .eq('id', aluno_id)
            .eq('professor_id', req.professorId)
            .single();

        const { data: servico } = await supabaseAdmin
            .from('servicos')
            .select('id, duracao_minutos')
            .eq('id', servico_id)
            .eq('professor_id', req.professorId)
            .single();

        if (!aluno || !servico) {
            return res.status(404).json({
                success: false,
                error: 'Aluno ou serviço não encontrado'
            });
        }

        // 2. Verificar se o aluno possui contrato ATIVO para este serviço
        const { data: contratoAtivo } = await supabaseAdmin
            .from('contratos')
            .select('id')
            .eq('aluno_id', aluno_id)
            .eq('servico_id', servico_id)
            .eq('status', 'ativo')
            .is('deleted_at', null)
            .limit(1);

        if (!contratoAtivo || contratoAtivo.length === 0) {
            return res.status(403).json({
                success: false,
                error: 'Não é possível agendar: Aluno não possui contrato ativo para este serviço.'
            });
        }

        // Calcular data/hora fim
        const dataInicio = new Date(data_hora_inicio);
        const dataFim = new Date(dataInicio.getTime() + servico.duracao_minutos * 60000);

        // Verificar conflito
        const { temConflito } = await verificarConflito(
            req.professorId,
            dataInicio.toISOString(),
            dataFim.toISOString(),
            servico_id
        );

        if (temConflito) {
            return res.status(409).json({
                success: false,
                error: 'Conflito de horário detectado'
            });
        }

        let sessoesCriadas;

        if (recorrencia === 'semanal') {
            // Criar sessões recorrentes
            const sessoes = await criarSessoesRecorrentes(
                req.professorId,
                aluno_id,
                servico_id,
                dataInicio.toISOString(),
                dataFim.toISOString()
            );

            const { data, error } = await supabaseAdmin
                .from('sessoes')
                .insert(sessoes)
                .select(`
          *,
          aluno:alunos(id, nome, telefone_whatsapp),
          servico:servicos(id, nome, tipo, duracao_minutos)
        `);

            if (error) throw error;
            sessoesCriadas = data;
        } else {
            // Criar sessão única
            const { data, error } = await supabaseAdmin
                .from('sessoes')
                .insert({
                    professor_id: req.professorId,
                    aluno_id,
                    servico_id,
                    data_hora_inicio: dataInicio.toISOString(),
                    data_hora_fim: dataFim.toISOString(),
                    recorrencia: 'unica',
                    status: 'agendada'
                })
                .select(`
          *,
          aluno:alunos(id, nome, telefone_whatsapp),
          servico:servicos(id, nome, tipo, duracao_minutos)
        `)
                .single();

            if (error) throw error;
            sessoesCriadas = [data];
        }

        // NOTIFICAÇÃO WHATSAPP (AGRUPADA)
        const alunoInfo = sessoesCriadas[0]?.aluno;
        if (alunoInfo && alunoInfo.telefone_whatsapp) {
            const notificationService = require('../services/notificationService');
            // Enviamos em background para não atrasar a resposta
            notificationService.notifyMultipleSchedule(alunoInfo, sessoesCriadas, professor?.whatsapp_instance).catch(err => console.error('Erro notificação:', err));
        }

        res.status(201).json({
            success: true,
            data: sessoesCriadas
        });
    } catch (error) {
        console.error('Erro ao criar sessão:', error);
        res.status(500).json({
            success: false,
            error: 'Erro ao criar sessão'
        });
    }
});

/**
 * PUT /sessoes/:id/cancelar
 * Cancelar sessão
 */
router.put('/:id/cancelar', authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const { cancelar_futuras } = req.body;

        if (cancelar_futuras) {
            // Buscar sessão original
            const { data: sessaoOriginal } = await supabaseAdmin
                .from('sessoes')
                .select('data_hora_inicio, aluno_id, servico_id')
                .eq('id', id)
                .eq('professor_id', req.professorId)
                .single();

            if (!sessaoOriginal) {
                return res.status(404).json({
                    success: false,
                    error: 'Sessão não encontrada'
                });
            }

            // Cancelar todas as sessões futuras da mesma recorrência
            const { data, error } = await supabaseAdmin
                .from('sessoes')
                .update({ status: 'cancelada' })
                .eq('professor_id', req.professorId)
                .eq('aluno_id', sessaoOriginal.aluno_id)
                .eq('servico_id', sessaoOriginal.servico_id)
                .eq('recorrencia', 'semanal')
                .gte('data_hora_inicio', sessaoOriginal.data_hora_inicio)
                .select();
            if (error) throw error;

            res.json({
                success: true,
                data: { message: `${data.length} sessões canceladas` }
            });
        } else {
            // Cancelar apenas esta sessão
            const { status, observacoes } = req.body;
            const updateData = {};

            if (status) {
                updateData.status = status;
            } else {
                updateData.status = 'cancelada';
            }

            if (observacoes) {
                updateData.observacoes = observacoes;
            }

            const { data, error } = await supabaseAdmin
                .from('sessoes')
                .update(updateData)
                .eq('id', id)
                .eq('professor_id', req.professorId)
                .select()
                .single();

            if (error) throw error;

            if (!data) {
                return res.status(404).json({
                    success: false,
                    error: 'Sessão não encontrada'
                });
            }

            res.json({
                success: true,
                data
            });
        }
    } catch (error) {
        console.error('Erro ao cancelar sessão:', error);
        res.status(500).json({
            success: false,
            error: 'Erro ao cancelar sessão'
        });
    }
});

/**
 * PUT /sessoes/:id/remarcar
 * Remarcar sessão
 */
router.put('/:id/remarcar', authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const { nova_data_hora_inicio, observacoes } = req.body;

        if (!nova_data_hora_inicio) {
            return res.status(400).json({
                success: false,
                error: 'Nova data/hora de início é obrigatória'
            });
        }

        // Buscar sessão original
        const { data: sessaoOriginal } = await supabaseAdmin
            .from('sessoes')
            .select('*, servico:servicos(duracao_minutos)')
            .eq('id', id)
            .eq('professor_id', req.professorId)
            .single();

        if (!sessaoOriginal) {
            return res.status(404).json({
                success: false,
                error: 'Sessão não encontrada'
            });
        }

        // 2. Verificar contrato ATIVO antes de permitir remarcar
        const { data: contratoAtivo } = await supabaseAdmin
            .from('contratos')
            .select('id')
            .eq('aluno_id', sessaoOriginal.aluno_id)
            .eq('servico_id', sessaoOriginal.servico_id)
            .eq('status', 'ativo')
            .is('deleted_at', null)
            .limit(1);

        if (!contratoAtivo || contratoAtivo.length === 0) {
            return res.status(403).json({
                success: false,
                error: 'Não é possível remarcar: Aluno não possui contrato ativo para este serviço.'
            });
        }

        // Calcular nova data/hora fim
        const novaDataInicio = new Date(nova_data_hora_inicio);
        const novaDataFim = new Date(novaDataInicio.getTime() + sessaoOriginal.servico.duracao_minutos * 60000);

        // Verificar conflito no novo horário
        const { temConflito } = await verificarConflito(
            req.professorId,
            novaDataInicio.toISOString(),
            novaDataFim.toISOString(),
            sessaoOriginal.servico_id,
            id
        );

        if (temConflito) {
            return res.status(409).json({
                success: false,
                error: 'Conflito de horário no novo horário'
            });
        }

        // Criar nova sessão
        const { data: novaSessao, error: errorNova } = await supabaseAdmin
            .from('sessoes')
            .insert({
                professor_id: req.professorId,
                aluno_id: sessaoOriginal.aluno_id,
                servico_id: sessaoOriginal.servico_id,
                data_hora_inicio: novaDataInicio.toISOString(),
                data_hora_fim: novaDataFim.toISOString(),
                recorrencia: 'unica',
                status: 'agendada',
                sessao_original_id: id
            })
            .select(`
        *,
        aluno:alunos(id, nome, telefone_whatsapp),
        servico:servicos(id, nome, tipo, duracao_minutos)
      `)
            .single();

        if (errorNova) throw errorNova;

        // Marcar sessão original como remarcada e adicionar observação
        const updateOriginal = { status: 'remarcada' };
        if (observacoes) updateOriginal.observacoes = observacoes;

        await supabaseAdmin
            .from('sessoes')
            .update(updateOriginal)
            .eq('id', id);

        res.json({
            success: true,
            data: novaSessao
        });
    } catch (error) {
        console.error('Erro ao remarcar sessão:', error);
        res.status(500).json({
            success: false,
            error: 'Erro ao remarcar sessão'
        });
    }
});

/**
 * PUT /sessoes/:id/concluir
 * Marcar sessão como concluída
 */
router.put('/:id/concluir', authenticate, async (req, res) => {
    try {
        const { id } = req.params;

        // 1. Buscar a sessão para saber aluno e serviço
        const { data: sessao, error: erroSessao } = await supabaseAdmin
            .from('sessoes')
            .select('aluno_id, servico_id, status')
            .eq('id', id)
            .eq('professor_id', req.professorId)
            .single();

        if (erroSessao || !sessao) {
            return res.status(404).json({ success: false, error: 'Sessão não encontrada' });
        }

        if (sessao.status !== 'agendada') {
            return res.status(400).json({ success: false, error: 'Apenas sessões agendadas podem ser concluídas' });
        }

        // 2. Verificar se existe contrato ATIVO para este aluno e serviço
        const { data: contratoAtivo } = await supabaseAdmin
            .from('contratos')
            .select('id')
            .eq('aluno_id', sessao.aluno_id)
            .eq('servico_id', sessao.servico_id)
            .eq('status', 'ativo')
            .is('deleted_at', null)
            .limit(1);

        if (!contratoAtivo || contratoAtivo.length === 0) {
            return res.status(403).json({
                success: false,
                error: 'Não é possível concluir: Aluno não possui contrato ativo para este serviço.'
            });
        }

        // 3. Proceder com a conclusão
        const { data, error } = await supabaseAdmin
            .from('sessoes')
            .update({ status: 'concluida' })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        res.json({
            success: true,
            data
        });
    } catch (error) {
        console.error('Erro ao concluir sessão:', error);
        res.status(500).json({
            success: false,
            error: 'Erro ao concluir sessão'
        });
    }
});

/**
 * PUT /sessoes/:id
 * Atualizar dados da sessão (genérico)
 */
router.put('/:id', authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const { servico_id, observacoes, status } = req.body;

        const updateData = {};
        if (servico_id) updateData.servico_id = servico_id;
        if (observacoes !== undefined) updateData.observacoes = observacoes;
        if (status) updateData.status = status;

        const { data, error } = await supabaseAdmin
            .from('sessoes')
            .update(updateData)
            .eq('id', id)
            .eq('professor_id', req.professorId)
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
                error: 'Sessão não encontrada'
            });
        }

        res.json({
            success: true,
            data
        });
    } catch (error) {
        console.error('Erro ao atualizar sessão:', error);
        res.status(500).json({
            success: false,
            error: 'Erro ao atualizar sessão'
        });
    }
});

module.exports = router;
