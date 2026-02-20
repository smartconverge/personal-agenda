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
        name: 'Pro (Gestão Unificada)',
        description: 'Tudo o que você precisa para gerenciar seu negócio solo em um único lugar (estilo MITpersonal).',
        features: {
            agenda_recorrente: true,
            financeiro_aluno: true,
            lembretes_automaticos: true,
            importacao_alunos: true,
            alunos_ilimitados: true,
            servicos_ilimitados: true,
            app_centralizado: true, // App único para todos os profissionais PRO
            prescricao_treinos: true, // Disponível na Onda 3
            anamnese_digital: true, // Disponível na Onda 3
            app_nativo: false,
            ia_assistant: false
        }
    },
    PREMIUM: {
        name: 'Premium (Exclusividade)',
        description: 'Para profissionais de elite que buscam autoridade máxima com seu próprio App exclusivo.',
        features: {
            agenda_recorrente: true,
            financeiro_aluno: true,
            lembretes_automaticos: true,
            importacao_alunos: true,
            alunos_ilimitados: true,
            servicos_ilimitados: true,
            app_centralizado: true,
            prescricao_treinos: true,
            anamnese_digital: true,
            ia_assistant: true,
            app_nativo: true // App White Label exclusivo na Apple/Google
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
