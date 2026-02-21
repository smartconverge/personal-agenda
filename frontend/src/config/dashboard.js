/**
 * CONFIGURAÇÃO DE ROTAS DO DASHBOARD
 */
export const dashboardRoutes = {
    main: [
        { href: '/dashboard', label: 'Dashboard', icon: 'Dashboard', permission: 'starter' },
        { href: '/dashboard/alunos', label: 'Alunos', icon: 'Students', permission: 'starter' },
        { href: '/dashboard/meus-servicos', label: 'Serviços', icon: 'Services', permission: 'starter' },
        { href: '/dashboard/contratos', label: 'Contratos', icon: 'Contracts', permission: 'starter' },
        { href: '/dashboard/agenda', label: 'Agenda', icon: 'Calendar', permission: 'starter' },
        { href: '/dashboard/whatsapp', label: 'WhatsApp', icon: 'Dashboard', permission: 'pro' },
        { href: '/dashboard/notificacoes', label: 'Notificações', icon: 'Notifications', permission: 'pro' },
    ],
    planos: [
        { href: '/dashboard/planos', label: 'Meus Planos', icon: 'Star', permission: 'starter' },
    ],
    sistema: [
        { href: '/dashboard/configuracoes', label: 'Configurações', icon: 'Settings', permission: 'starter' },
    ]
};

/**
 * METADADOS DAS PÁGINAS (Títulos e Subtítulos)
 */
export const dashboardMeta = {
    '/dashboard': {
        title: 'Dashboard',
        getSubtitle: (user) => `Bem-vindo de volta, ${user?.nome?.split(' ')[0] || 'Professor'}. Aqui está sua visão geral.`
    },
    '/dashboard/alunos': {
        title: 'Alunos',
        subtitle: 'Gerencie seus alunos cadastrados e seus progressos.'
    },
    '/dashboard/meus-servicos': {
        title: 'Serviços',
        subtitle: 'Configure suas modalidades e durações de treino.'
    },
    '/dashboard/contratos': {
        title: 'Contratos',
        subtitle: 'Gerencie planos ativos e faturamento mensal.'
    },
    '/dashboard/agenda': {
        title: 'Agenda',
        subtitle: 'Acompanhe sua agenda de treinos diária e semanal.'
    },
    '/dashboard/notificacoes': {
        title: 'Notificações',
        subtitle: 'Histórico de mensagens enviadas aos seus alunos.'
    },
    '/dashboard/whatsapp': {
        title: 'WhatsApp',
        subtitle: 'Conecte e gerencie sua integração com WhatsApp.'
    },
    '/dashboard/perfil': {
        title: 'Meu Perfil',
        subtitle: 'Gerencie suas informações pessoais e profissionais.'
    },
    '/dashboard/configuracoes': {
        title: 'Configurações',
        subtitle: 'Gerencie as preferências e segurança da conta.'
    },
    '/dashboard/planos': {
        title: 'Planos',
        subtitle: 'Evolua sua gestão com recursos Premium.'
    }
};

/**
 * SISTEMA DE PERMISSÕES POR PLANO
 */
export const PLANO_NIVEIS = {
    'starter': 1,
    'pro': 2,
    'elite': 3
};

export const hasPermission = (userPlano, requiredPermission) => {
    const userNivel = PLANO_NIVEIS[userPlano?.toLowerCase()] || 1;
    const requiredNivel = PLANO_NIVEIS[requiredPermission?.toLowerCase()] || 1;
    return userNivel >= requiredNivel;
};
