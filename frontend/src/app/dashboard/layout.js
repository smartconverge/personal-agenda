'use client'

import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import api from '@/lib/api'
import { ToastProvider } from '@/components/Toast'
import { Icons } from '@/components/Icons'
import BottomNavigation from '@/components/BottomNavigation'

export default function DashboardLayout({ children }) {
    const router = useRouter()
    const pathname = usePathname()
    const [professor, setProfessor] = useState(null)
    const [sidebarOpen, setSidebarOpen] = useState(true)
    const [hoveredPath, setHoveredPath] = useState(null)
    const [notificacoesCount, setNotificacoesCount] = useState(0)
    const [profileDropdownOpen, setProfileDropdownOpen] = useState(false)
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [whatsappConnected, setWhatsappConnected] = useState(false)

    async function loadProfile() {
        try {
            const response = await api.get('/perfil')
            if (response.data.success) {
                const updatedProfessor = response.data.data
                setProfessor(updatedProfessor)
                localStorage.setItem('professor', JSON.stringify(updatedProfessor))
            }
        } catch (error) {
            console.error('Erro ao carregar perfil:', error)
        }
    }

    async function loadNotificacoesCount() {
        try {
            const response = await api.get('/notificacoes?status=enviado&limit=100')
            const data = response.data.data || []
            const unread = data.filter(n => n.lida === false).length
            setNotificacoesCount(unread)
        } catch (error) {
            console.error('Erro ao buscar contador de notificações:', error)
        }
    }

    async function marcarTodasComoLidas() {
        try {
            await api.patch('/notificacoes/ler-todas')
            setNotificacoesCount(0)
        } catch (error) {
            console.error('Erro ao marcar notificações como lidas:', error)
        }
    }

    async function checkWhatsAppStatus() {
        try {
            const res = await api.get('/whatsapp/status')
            setWhatsappConnected(!!res.data.connected)
        } catch (error) {
            setWhatsappConnected(false)
        }
    }

    async function handleLogout() {
        try {
            await api.post('/auth/logout')
        } catch (error) {
            console.error('Erro ao fazer logout na API', error)
        } finally {
            localStorage.removeItem('token')
            localStorage.removeItem('professor')
            router.push('/login')
        }
    }

    useEffect(() => {
        const professorData = localStorage.getItem('professor')

        // Carregar tema salvo
        const savedTheme = localStorage.getItem('theme') || 'light'
        document.documentElement.setAttribute('data-theme', savedTheme)

        // Se tiver dados em cache, exibe instantaneamente
        if (professorData) {
            try {
                const parsed = JSON.parse(professorData)
                setProfessor(parsed)
            } catch (error) {
                console.error('Erro ao ler dados do professor:', error)
            }
        }

        // Buscas iniciais
        loadProfile()
        loadNotificacoesCount()
        checkWhatsAppStatus()

        // Polling de status do WhatsApp a cada 30s
        const wsInterval = setInterval(checkWhatsAppStatus, 30000)

        // Se estiver na página de notificações, marca como lidas no banco
        if (pathname === '/dashboard/notificacoes') {
            marcarTodasComoLidas();
        }

        // Listener para atualização de perfil em tempo real
        const handleProfileUpdate = () => {
            const updatedData = localStorage.getItem('professor')
            if (updatedData) {
                setProfessor(JSON.parse(updatedData))
            }
        }

        window.addEventListener('user-profile-updated', handleProfileUpdate)

        return () => {
            window.removeEventListener('user-profile-updated', handleProfileUpdate)
            clearInterval(wsInterval)
        }
    }, [router, pathname])

    const menuItems = [
        { href: '/dashboard', label: 'Dashboard', icon: 'Dashboard' },
        { href: '/dashboard/alunos', label: 'Alunos', icon: 'Students' },
        { href: '/dashboard/meus-servicos', label: 'Serviços', icon: 'Services' },
        { href: '/dashboard/contratos', label: 'Contratos', icon: 'Contracts' },
        { href: '/dashboard/agenda', label: 'Agenda', icon: 'Calendar' },
        { href: '/dashboard/whatsapp', label: 'WhatsApp', icon: 'Dashboard' },
        { href: '/dashboard/notificacoes', label: 'Notificações', icon: 'Notifications' },
    ]

    const planoItems = [
        { href: '/dashboard/planos', label: 'Meus Planos', icon: 'Star' },
    ]

    const sistemaItems = [
        { href: '/dashboard/configuracoes', label: 'Configurações', icon: 'Settings' },
    ]

    if (!professor) {
        return (
            <div className="loading-overlay">
                <div className="spinner !w-12 !h-12" />
            </div>
        )
    }

    return (
        <ToastProvider>
            <div className="flex min-h-screen bg-primary-dark">
                {/* Sidebar Verde Escura - Desktop Only */}
                <aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : 'sidebar-collapsed'} sidebar-glass flex flex-col fixed h-screen z-40 transition-all duration-300`}
                    style={{ width: sidebarOpen ? '16rem' : '5rem' }}>

                    {/* Logo/Header */}
                    <div className="p-6 flex items-center gap-3 border-b border-white/5">
                        <div className="flex-center w-10 h-10 rounded-lg bg-white/10 flex-shrink-0 border border-white/10">
                            <Icons.Fitness size={20} className="text-white" />
                        </div>
                        {sidebarOpen && (
                            <div className="flex flex-col">
                                <h2 className="text-sm font-extrabold text-white leading-tight tracking-tight">
                                    Personal Agenda
                                </h2>
                                <p className="text-[0.65rem] font-bold mt-1 text-white/50 tracking-wider">
                                    TRAINER MANAGEMENT
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Main Navigation - Scrollable Area */}
                    <nav className="no-scrollbar flex-1 overflow-y-auto py-6 px-3">
                        {/* Section: MENU */}
                        {sidebarOpen && (
                            <p className="text-[0.65rem] font-extrabold text-white/40 mb-4 px-4 uppercase tracking-[0.1em]">
                                Menu
                            </p>
                        )}
                        {menuItems.map((item) => {
                            const IconComponent = Icons[item.icon]
                            const isActive = pathname === item.href

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onMouseEnter={() => setHoveredPath(item.href)}
                                    onMouseLeave={() => setHoveredPath(null)}
                                    className={`flex items-center gap-4 px-4 py-3 rounded-lg mb-1 transition-all duration-200 cursor-pointer text-sm ${isActive || hoveredPath === item.href ? 'bg-white/10 text-white font-bold' : 'text-white/60 font-medium'
                                        }`}
                                >
                                    <span className="flex-shrink-0">
                                        <IconComponent size={20} />
                                    </span>
                                    {sidebarOpen && (
                                        <div className="flex items-center justify-between w-full">
                                            <span>{item.label}</span>
                                            {item.label === 'WhatsApp' && (
                                                <span className={`text-[0.55rem] font-black px-2 py-0.5 rounded-full border tracking-tighter ml-auto ${whatsappConnected
                                                    ? 'bg-success/20 text-success border-success/30 animate-pulse'
                                                    : 'bg-red-500/10 text-red-400 border-red-500/20'
                                                    }`}>
                                                    {whatsappConnected ? 'CONECTADO' : 'OFFLINE'}
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </Link>
                            )
                        })}

                        {/* Section: PLANOS */}
                        {sidebarOpen && (
                            <div className="my-6 mx-4 h-px bg-white/10" />
                        )}
                        {sidebarOpen && (
                            <p className="text-[0.65rem] font-extrabold text-white/40 mb-4 px-4 uppercase tracking-[0.1em]">
                                Planos
                            </p>
                        )}
                        {planoItems.map((item) => {
                            const IconComponent = Icons[item.icon]
                            const isActive = pathname === item.href

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onMouseEnter={() => setHoveredPath(item.href)}
                                    onMouseLeave={() => setHoveredPath(null)}
                                    className={`flex items-center gap-4 px-4 py-3 rounded-lg mb-1 transition-all duration-200 cursor-pointer text-sm ${isActive || hoveredPath === item.href ? 'bg-white/10 text-white font-bold' : 'text-white/60 font-medium'
                                        }`}
                                >
                                    <span className="flex-shrink-0">
                                        <IconComponent size={20} />
                                    </span>
                                    {sidebarOpen && (
                                        <div className="flex items-center justify-between w-full">
                                            <span>{item.label}</span>
                                            {item.label === 'Meus Planos' && professor?.plano && (
                                                <span className={`text-[0.55rem] font-black px-2 py-0.5 rounded-full ml-auto tracking-tighter ${professor.plano === 'PREMIUM' ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20' : 'bg-white/20 text-white border border-white/10'
                                                    }`}>
                                                    {professor.plano.toUpperCase()}
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </Link>
                            )
                        })}

                        {/* Section: SISTEMA */}
                        {sidebarOpen && (
                            <div className="my-6 mx-4 h-px bg-white/10" />
                        )}
                        {sidebarOpen && (
                            <p className="text-[0.65rem] font-extrabold text-white/40 mb-4 px-4 uppercase tracking-[0.1em]">
                                Sistema
                            </p>
                        )}
                        {sistemaItems.map((item) => {
                            const IconComponent = Icons[item.icon]
                            const isActive = pathname === item.href

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onMouseEnter={() => setHoveredPath(item.href)}
                                    onMouseLeave={() => setHoveredPath(null)}
                                    className={`flex items-center gap-4 px-4 py-3 rounded-lg mb-1 transition-all duration-200 cursor-pointer text-sm ${isActive || hoveredPath === item.href ? 'bg-white/10 text-white font-bold' : 'text-white/60 font-medium'
                                        }`}
                                >
                                    <span className="flex-shrink-0">
                                        <IconComponent size={20} />
                                    </span>
                                    {sidebarOpen && <span>{item.label}</span>}
                                </Link>
                            )
                        })}
                    </nav>

                    {/* User Profile + Logout - Fixed at Bottom */}
                    <div className="mt-auto p-4 flex flex-col border-t border-white/5 bg-black/20 flex-shrink-0">
                        {sidebarOpen && (
                            <Link
                                href="/dashboard/perfil"
                                className={`flex items-center gap-3 p-4 mb-4 rounded-xl border transition-all duration-200 ${pathname === '/dashboard/perfil'
                                    ? 'bg-primary-light border-white/10'
                                    : 'bg-white/5 border-white/5 hover:bg-white/10'
                                    }`}
                            >
                                <div className="avatar avatar-sm bg-gradient-to-br from-primary to-primary-light border border-white/10 flex-shrink-0">
                                    {professor.foto_url ? (
                                        <img src={professor.foto_url} alt={professor.nome} className="w-full h-full rounded-full object-cover" />
                                    ) : (
                                        professor.nome.charAt(0)
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-white truncate m-0">
                                        {professor.nome}
                                    </p>
                                    <p className="text-[0.65rem] font-medium text-white/50 m-0 mt-0.5">
                                        Personal Trainer
                                    </p>
                                </div>
                                <Icons.ChevronRight size={14} className="text-white/30" />
                            </Link>
                        )}
                        <button
                            onClick={handleLogout}
                            className="w-full p-4 flex-center gap-3 font-bold text-[0.8rem] rounded-xl cursor-pointer transition-all duration-200 bg-red-500/10 text-red-400 border border-red-500/15 hover:bg-red-500/20 hover:border-red-500/25"
                        >
                            <Icons.Logout size={16} />
                            {sidebarOpen && <span>Sair da Conta</span>}
                        </button>
                    </div>
                </aside>

                {/* Main Content */}
                <div className="main-content flex flex-col flex-1 transition-all duration-300 min-h-screen"
                    style={{ marginLeft: sidebarOpen ? '16rem' : '5rem' }}>

                    {/* Trial Banner */}
                    {/* Trial Banner Premium */}
                    {professor?.plano_expira_em && (new Date(professor.plano_expira_em) > new Date()) && (
                        <div className="premium-banner px-4 py-2.5 text-center text-[0.75rem] font-bold z-[100] border-b border-white/5 shadow-xl">
                            <div className="flex items-center justify-center gap-3">
                                <div className="flex-center w-6 h-6 rounded-md bg-white/20">
                                    <Icons.Dashboard size={14} className="text-white" />
                                </div>
                                <span className="tracking-tight">
                                    Você está no plano <span className="text-white font-black uppercase underline decoration-2 underline-offset-4 decoration-white/30">{professor.plano || 'STARTER'} (Degustação)</span>.
                                    Restam <span className="bg-white/20 px-2 py-0.5 rounded-md mx-1">{(() => {
                                        const diff = new Date(professor.plano_expira_em) - new Date();
                                        const dias = Math.ceil(diff / (1000 * 60 * 60 * 24));
                                        return `${dias} ${dias === 1 ? 'dia' : 'dias'}`;
                                    })()}</span> para o fim do acesso total.
                                </span>
                                <Link href="/dashboard/planos" className="bg-white text-primary px-3 py-1 rounded-full text-[0.65rem] font-black uppercase hover:scale-105 transition-transform ml-2 shadow-lg">
                                    Ver Planos
                                </Link>
                            </div>
                        </div>
                    )}

                    {/* Header */}
                    <header className="glass-effect flex-between px-6 py-4 sticky top-0 z-30 min-h-[4.5rem]">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setSidebarOpen(!sidebarOpen)}
                                className="btn-ghost-nav desktop-only p-2"
                            >
                                <Icons.SidebarToggle size={20} />
                            </button>

                            {/* Vertical Separator */}
                            <div className="desktop-only w-px h-6 bg-border mx-2" />

                            <div className="header-title-container">
                                <h1 className="header-title">
                                    {pathname === '/dashboard' ? 'Dashboard' :
                                        pathname.includes('/alunos') ? 'Alunos' :
                                            pathname.includes('servicos') ? 'Serviços' :
                                                pathname.includes('/contratos') ? 'Contratos' :
                                                    pathname.includes('/agenda') ? 'Agenda' :
                                                        pathname.includes('/notificacoes') ? 'Notificações' :
                                                            pathname.includes('/perfil') ? 'Meu Perfil' :
                                                                pathname.includes('/configuracoes') ? 'Configurações' :
                                                                    pathname.includes('/planos') ? 'Planos' : 'Personal Agenda'}
                                </h1>
                                {pathname === '/dashboard' && professor?.nome && (
                                    <p className="header-subtitle truncate max-w-[300px] md:max-w-none">
                                        Bem-vindo de volta, {professor.nome.split(' ')[0]}. Aqui está sua visão geral.
                                    </p>
                                )}
                                {pathname.includes('/alunos') && (
                                    <p className="header-subtitle">
                                        Gerencie seus alunos cadastrados e seus progressos.
                                    </p>
                                )}
                                {pathname.includes('servicos') && (
                                    <p className="header-subtitle">
                                        Configure suas modalidades e durações de treino.
                                    </p>
                                )}
                                {pathname.includes('/contratos') && (
                                    <p className="header-subtitle">
                                        Gerencie planos ativos e faturamento mensal.
                                    </p>
                                )}
                                {pathname.includes('/agenda') && (
                                    <p className="header-subtitle">
                                        Acompanhe sua agenda de treinos diária e semanal.
                                    </p>
                                )}
                                {pathname.includes('/notificacoes') && (
                                    <p className="header-subtitle">
                                        Histórico de mensagens enviadas aos seus alunos.
                                    </p>
                                )}
                                {pathname.includes('/perfil') && (
                                    <p className="header-subtitle">
                                        Gerencie suas informações pessoais e profissionais.
                                    </p>
                                )}
                                {pathname.includes('/configuracoes') && (
                                    <p className="header-subtitle">
                                        Gerencie as preferências e segurança da conta.
                                    </p>
                                )}
                                {pathname.includes('/planos') && (
                                    <p className="header-subtitle">
                                        Evolua sua gestão com recursos Premium.
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-5">
                            <Link
                                href="/dashboard/notificacoes"
                                onClick={() => {
                                    localStorage.setItem('last_notifications_view', Date.now().toString())
                                    setNotificacoesCount(0)
                                }}
                                className="btn-ghost-nav p-2 relative text-decoration-none"
                            >
                                <Icons.Notifications size={22} className="text-secondary" />
                                {notificacoesCount > 0 && (
                                    <span className="absolute top-1 right-1 bg-red-500 text-white text-[0.625rem] font-extrabold px-1.5 py-0.5 rounded-full border-2 border-secondary min-w-[18px] flex items-center justify-center leading-none">
                                        {notificacoesCount > 10 ? '10+' : notificacoesCount}
                                    </span>
                                )}
                            </Link>

                            {/* Profile Dropdown */}
                            <div className="relative">
                                <button
                                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                                    className={`avatar avatar-sm bg-gradient-to-br from-primary to-primary-light border border-border cursor-pointer transition-all duration-200 ${profileDropdownOpen ? 'scale-95' : 'hover:scale-105 hover:-translate-y-px hover:shadow'}`}
                                >
                                    {professor.foto_url ? (
                                        <img src={professor.foto_url} alt={professor.nome} className="w-full h-full rounded-full object-cover" />
                                    ) : (
                                        professor.nome.charAt(0)
                                    )}
                                </button>

                                {/* Dropdown Menu */}
                                {profileDropdownOpen && (
                                    <>
                                        {/* Backdrop para fechar ao clicar fora */}
                                        <div
                                            onClick={() => setProfileDropdownOpen(false)}
                                            className="backdrop-invisible"
                                        />

                                        <div className="dropdown-menu">
                                            {/* User Info */}
                                            <div className="p-4 flex items-center gap-3 border-b border-border">
                                                <div className="avatar avatar-sm bg-gradient-to-br from-primary to-primary-light border border-border">
                                                    {professor.foto_url ? (
                                                        <img src={professor.foto_url} alt={professor.nome} className="w-full h-full rounded-full object-cover" />
                                                    ) : (
                                                        professor.nome.charAt(0)
                                                    )}
                                                </div>
                                                <div className="flex flex-col flex-1 min-w-0">
                                                    <p className="text-sm font-bold text-primary truncate m-0">
                                                        {professor.nome}
                                                    </p>
                                                    <p className="text-xs text-muted truncate m-0 mt-1">
                                                        {professor.email}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Menu Items */}
                                            <div className="p-2">
                                                <Link
                                                    href="/dashboard/perfil"
                                                    onClick={() => setProfileDropdownOpen(false)}
                                                    className="dropdown-item"
                                                >
                                                    <Icons.User size={18} />
                                                    <span>Meu Perfil</span>
                                                </Link>
                                            </div>

                                            {/* Logout */}
                                            <div className="p-2 border-t border-border">
                                                <button
                                                    onClick={() => {
                                                        setProfileDropdownOpen(false)
                                                        handleLogout()
                                                    }}
                                                    className="dropdown-item dropdown-item-danger w-full text-left"
                                                >
                                                    <Icons.Logout size={18} />
                                                    <span>Sair</span>
                                                </button>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </header>

                    {/* Page Content */}
                    <main className="p-6 flex-1 page-enter">
                        {children}
                    </main>
                </div>
            </div>

            {/* Mobile Menu Overlay - Unified */}
            {mobileMenuOpen && (
                <>
                    <div
                        onClick={() => setMobileMenuOpen(false)}
                        className="fixed inset-0 bg-black/60 backdrop-blur-md z-[110] animate-fade-in"
                    />
                    <div className="fixed bottom-[5.5rem] left-4 right-4 bg-secondary rounded-[1.5rem] p-5 z-[120] shadow-2xl border border-border max-h-[80vh] overflow-y-auto animate-slide-up">
                        <div className="mb-6 text-center">
                            <div className="w-12 h-1 bg-border rounded-full mx-auto mb-5 opacity-50" />
                            <h3 className="m-0 text-lg font-extrabold text-primary">Navegação</h3>
                        </div>

                        <div className="mobile-nav-grid">
                            {menuItems.concat(planoItems).map((item) => {
                                const IconComponent = Icons[item.icon]
                                const isActive = pathname === item.href
                                const iconBg = isActive ? 'bg-primary' : 'bg-primary-light'
                                const iconColor = isActive ? 'text-white' : 'text-secondary'

                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className={`mobile-nav-item ${isActive ? 'active' : ''}`}
                                    >
                                        <div className={`mobile-nav-icon ${isActive ? 'active' : ''} ${iconBg} ${iconColor}`}>
                                            <IconComponent size={22} />
                                        </div>
                                        <span className={`text-xs font-bold leading-tight relative text-center ${isActive ? 'text-primary' : 'text-secondary'}`}>
                                            {item.label}
                                            {item.label === 'Meus Planos' && professor?.plano && (
                                                <span className="badge badge-primary absolute -top-12 -right-2 text-[0.55rem] px-1.5 py-0.5">
                                                    {professor.plano.toUpperCase()}
                                                </span>
                                            )}
                                        </span>
                                    </Link>
                                )
                            })}
                        </div>

                        <div className="mobile-footer-section">
                            <Link
                                href="/dashboard/perfil"
                                onClick={() => setMobileMenuOpen(false)}
                                className="flex items-center gap-4 p-4 card-flat rounded-2xl"
                            >
                                <div className="avatar avatar-md bg-gradient-to-br from-primary to-primary-light overflow-hidden">
                                    {professor.foto_url ? (
                                        <img src={professor.foto_url} alt={professor.nome} className="w-full h-full rounded-full object-cover" />
                                    ) : (
                                        professor.nome.charAt(0)
                                    )}
                                </div>
                                <div className="flex flex-col flex-1">
                                    <p className="text-sm font-bold m-0">{professor.nome}</p>
                                    <p className="text-xs text-muted m-0">Meu Perfil • Editar dados</p>
                                </div>
                                <Icons.ChevronRight size={18} className="text-muted" />
                            </Link>

                            <button
                                onClick={() => {
                                    setMobileMenuOpen(false)
                                    handleLogout()
                                }}
                                className="flex-center gap-3 p-4 font-bold text-sm rounded-2xl cursor-pointer transition-all duration-200 bg-red-500/10 border border-red-500/15 text-red-500"
                            >
                                <Icons.Logout size={20} />
                                <span>Sair da Conta</span>
                            </button>
                        </div>
                    </div>
                </>
            )}
            <BottomNavigation notificacoesCount={notificacoesCount} onMenuClick={() => setMobileMenuOpen(!mobileMenuOpen)} />
        </ToastProvider>
    )
}
