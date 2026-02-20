const { supabaseAdmin } = require('../config/supabase');
const { hasFeature, PLANS } = require('../config/plans');

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

            // 3. Validação de limites e permissões baseada no config/plans.js
            if (feature) {
                // Verificação de Funcionalidade
                const allowed = hasFeature(planoAtivo, feature);

                // Caso especial: agenda_recorrente só barra se o usuário estiver tentando criar uma recorrente
                if (feature === 'agenda_recorrente') {
                    const isTryingRecurrence = req.body.recorrencia === 'semanal' || req.body.recorrente === true;
                    if (isTryingRecurrence && !allowed) {
                        return res.status(403).json({
                            success: false,
                            error: `A funcionalidade '${feature}' está disponível apenas nos planos PRO e PREMIUM.`
                        });
                    }
                } else if (!allowed) {
                    // Bloqueio genérico para outras features
                    return res.status(403).json({
                        success: false,
                        error: `Seu plano atual (${PLANS[planoAtivo].name}) não possui acesso à funcionalidade: ${feature}`
                    });
                }
            }

            // Adicionar info do plano no req para uso posterior se necessário
            req.planoInfo = {
                nome: planoAtivo,
                detalhes: PLANS[planoAtivo],
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
