/**
 * Configuração centralizada de Planos SaaS
 * Define permissões e limites para cada nível de assinatura.
 */
const PLANS = {
    STARTER: {
        name: 'Starter',
        features: {
            agenda_recorrente: false,
            financeiro_aluno: false,
            lembretes_automaticos: false,
            importacao_alunos: true,
            alunos_ilimitados: true
        },
        limits: {
            max_servicos: 5
        }
    },
    PRO: {
        name: 'Pro',
        features: {
            agenda_recorrente: true,
            financeiro_aluno: true,
            lembretes_automaticos: true,
            importacao_alunos: true,
            alunos_ilimitados: true
        },
        limits: {
            max_servicos: 50
        }
    },
    PREMIUM: {
        name: 'Premium',
        features: {
            agenda_recorrente: true,
            financeiro_aluno: true,
            lembretes_automaticos: true,
            importacao_alunos: true,
            alunos_ilimitados: true,
            ia_assistant: true,
            app_nativo: true
        },
        limits: {
            max_servicos: 999
        }
    }
};

/**
 * Retorna se um plano tem acesso a uma funcionalidade
 */
function hasFeature(planName, feature) {
    const plan = PLANS[planName] || PLANS.STARTER;
    return !!plan.features[feature];
}

module.exports = {
    PLANS,
    hasFeature
};
