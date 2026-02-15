const { supabaseAdmin } = require('../config/supabase');

/**
 * Middleware para validar limites e acesso baseado no plano do professor
 * @param {string} feature - Nome da funcionalidade ou limite a validar
 */
const planGuard = (feature) => {
    return async (req, res, next) => {
        try {
            // 1. Buscar dados atuais do professor
            const { data: professor, error } = await supabaseAdmin
                .from('professores')
                .select('plano, plano_expira_em')
                .eq('id', req.professorId)
                .single();

            if (error || !professor) {
                return res.status(403).json({
                    success: false,
                    error: 'Assinatura não encontrada ou inválida.'
                });
            }

            // 2. Verificar expiração do plano (Trial ou Assinatura)
            const hoje = new Date();
            const expiraEm = professor.plano_expira_em ? new Date(professor.plano_expira_em) : null;

            // Se expirou, rebaixa para STARTER (Free) automaticamente na verificação
            const planoAtivo = (expiraEm && expiraEm > hoje) ? professor.plano : 'STARTER';

            // 3. Validação de limites específicos
            if (feature === 'create_aluno') {
                if (planoAtivo === 'STARTER') {
                    // Contar alunos ativos do professor
                    const { count, error: countError } = await supabaseAdmin
                        .from('alunos')
                        .select('*', { count: 'exact', head: true })
                        .eq('professor_id', req.professorId)
                        .is('deleted_at', null);

                    if (countError) throw countError;

                    if (count >= 5) {
                        return res.status(403).json({
                            success: false,
                            error: 'Limite de 5 alunos atingido no plano STARTER. Faça upgrade para continuar cadastrando.'
                        });
                    }
                } else if (planoAtivo === 'PRO') {
                    const { count, error: countError } = await supabaseAdmin
                        .from('alunos')
                        .select('*', { count: 'exact', head: true })
                        .eq('professor_id', req.professorId)
                        .is('deleted_at', null);

                    if (countError) throw countError;

                    if (count >= 20) {
                        return res.status(403).json({
                            success: false,
                            error: 'Limite de 20 alunos atingido no plano PRO. Faça upgrade para PREMIUM para alunos ilimitados.'
                        });
                    }
                }
                // PREMIUM é ilimitado
            }

            if (feature === 'agenda_recorrente') {
                if (planoAtivo === 'STARTER' && req.body.recorrencia === 'semanal') {
                    return res.status(403).json({
                        success: false,
                        error: 'Agenda recorrente está disponível apenas nos planos PRO e PREMIUM.'
                    });
                }
            }

            // Adicionar info do plano no req para uso posterior se necessário
            req.planoInfo = {
                nome: planoAtivo,
                status: (expiraEm && expiraEm > hoje) ? 'active' : 'expired',
                expiraEm
            };

            next();
        } catch (error) {
            console.error('Erro no PlanGuard:', error);
            res.status(500).json({
                success: false,
                error: 'Erro ao validar limites do plano.'
            });
        }
    };
};

module.exports = { planGuard };
