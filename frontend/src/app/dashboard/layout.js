'use client'

import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import api from '@/lib/api'
import { ToastProvider } from '@/components/Toast'
import { Icons } from '@/components/Icons'
import BottomNavigation from '@/components/BottomNavigation'
import Sidebar from '@/components/layout/Sidebar'

import DashboardHeader from '@/components/layout/DashboardHeader'
import { dashboardRoutes, hasPermission } from '@/config/dashboard'

export default function DashboardLayout({ children }) {
    const router = useRouter()
    const pathname = usePathname()
    const [professor, setProfessor] = useState(null)
    const [sidebarOpen, setSidebarOpen] = useState(true)

    const [notificacoesCount, setNotificacoesCount] = useState(0)
    const [profileDropdownOpen, setProfileDropdownOpen] = useState(false)
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [whatsappConnected, setWhatsappConnected] = useState(false)


    // Proteção real de rota — redireciona se plano insuficiente
    useEffect(() => {
        if (!professor) return;

        const allRoutes = [
            ...dashboardRoutes.main,
            ...dashboardRoutes.planos,
            ...dashboardRoutes.sistema,
        ];

        const matchedRoute = allRoutes
            .sort((a, b) => b.href.length - a.href.length)
            .find(route => pathname.startsWith(route.href));

        if (matchedRoute && !hasPermission(professor.plano, matchedRoute.permission)) {
            router.replace('/dashboard');
        }
    }, [pathname, professor]);


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


    if (!professor) {
        return (
            <div className="loading-overlay">
                <div className="spinner !w-12 !h-12" />
            </div>
        )
    }

    return (
        <ToastProvider>
            <div className="min-h-screen relative bg-primary-deep overflow-x-hidden">
                {/* Sidebar */}
                <Sidebar
                    sidebarOpen={sidebarOpen}
                    pathname={pathname}
                    professor={professor}
                    whatsappConnected={whatsappConnected}
                    handleLogout={handleLogout}
                />

                {/* Main Content */}
                <div className="main-content"
                    style={{
                        marginLeft: sidebarOpen ? '16rem' : '5rem',
                        width: sidebarOpen ? 'calc(100% - 16rem)' : 'calc(100% - 5rem)',
                        minHeight: '100vh'
                    }}>

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
                    <DashboardHeader
                        pathname={pathname}
                        professor={professor}
                        notificacoesCount={notificacoesCount}
                        setNotificacoesCount={setNotificacoesCount}
                        sidebarOpen={sidebarOpen}
                        setSidebarOpen={setSidebarOpen}
                        profileDropdownOpen={profileDropdownOpen}
                        setProfileDropdownOpen={setProfileDropdownOpen}
                        handleLogout={handleLogout}
                    />

                    {/* Page Content */}
                    <main className="p-6 flex-1 page-enter">
                        {children}
                    </main>
                </div>
            </div >

            {/* Mobile Menu Overlay - Unified */}
            {
                mobileMenuOpen && (
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
                                {[...dashboardRoutes.main, ...dashboardRoutes.planos].map((item) => {
                                    // Validação de permissão mobile
                                    if (!hasPermission(professor?.plano, item.permission)) return null;

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
                )
            }
            <BottomNavigation notificacoesCount={notificacoesCount} onMenuClick={() => setMobileMenuOpen(!mobileMenuOpen)} />
        </ToastProvider >
    )
}
