/**
 * Configuração centralizada de Planos SaaS
 * Define permissões e limites para cada nível de assinatura.
 */
const PLANS = {
    STARTER: {
        name: 'Starter (Essencial)',
        description: 'Ideal para profissionais que estão começando a organizar sua agenda e alunos.',
        features: {
            agenda_recorrente: false,
            financeiro_aluno: false,
            lembretes_automaticos: false,
            importacao_alunos: true,
            alunos_ilimitados: true,
            servicos_ilimitados: true,
            app_centralizado: false,
            app_nativo: false,
            ia_assistant: false
        }
    },
    PRO: {
        name: 'Pro (Automação)',
        description: 'Focado em automatizar sua gestão: Financeiro, Lembretes e Agenda Recorrente.',
        features: {
            agenda_recorrente: true,
            financeiro_aluno: true,
            lembretes_automaticos: true,
            importacao_alunos: true,
            alunos_ilimitados: true,
            servicos_ilimitados: true,
            prescricao_treinos: false,
            anamnese_digital: false,
            app_nativo: false,
            ia_assistant: false
        }
    },
    PREMIUM: {
        name: 'Premium (Elite)',
        description: 'A experiência completa: Prescrição de treinos, App Nativo e IA.',
        features: {
            agenda_recorrente: true,
            financeiro_aluno: true,
            lembretes_automaticos: true,
            importacao_alunos: true,
            alunos_ilimitados: true,
            servicos_ilimitados: true,
            prescricao_treinos: true, // Diferencial Elite
            anamnese_digital: true,   // Diferencial Elite
            app_nativo: true,         // Diferencial Elite (Onda 4)
            ia_assistant: true        // Diferencial Elite (Onda 4)
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
