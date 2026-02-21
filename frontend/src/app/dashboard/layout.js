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
import styles from './layout.module.css'

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

        const safePathname = pathname || '';
        const allRoutes = [
            ...dashboardRoutes.main,
            ...dashboardRoutes.planos,
            ...dashboardRoutes.sistema,
        ];

        const matchedRoute = allRoutes
            .sort((a, b) => b.href.length - a.href.length)
            .find(route => safePathname.startsWith(route.href));

        if (matchedRoute && !hasPermission(professor.plano, matchedRoute.permission)) {
            router.replace('/dashboard');
        }
    }, [pathname, professor, router]);


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
            <div className={styles.loadingOverlay}>
                <div className="spinner" style={{ width: '3rem', height: '3rem' }} />
            </div>
        )
    }

    return (
        <ToastProvider>
            <div className={styles.container}>
                {/* Sidebar */}
                <Sidebar
                    sidebarOpen={sidebarOpen}
                    pathname={pathname}
                    professor={professor}
                    whatsappConnected={whatsappConnected}
                    handleLogout={handleLogout}
                />

                {/* Main Content */}
                <div
                    className={styles.mainContent}
                    style={{
                        marginLeft: sidebarOpen ? '16rem' : '5rem',
                        width: sidebarOpen ? 'calc(100% - 16rem)' : 'calc(100% - 5rem)',
                    }}
                >

                    {/* Trial Banner Premium */}
                    {professor?.plano_expira_em && (new Date(professor.plano_expira_em) > new Date()) && (
                        <div className={styles.premiumBanner}>
                            <div className={styles.bannerContent}>
                                <div className={styles.bannerIconBox}>
                                    <Icons.Dashboard size={14} color="white" />
                                </div>
                                <span>
                                    Você está no plano <span className="font-black uppercase underline decoration-2 underline-offset-4 decoration-white/30">{professor.plano || 'STARTER'} (Degustação)</span>.
                                    Restam <span className={styles.bannerBadge}>{(() => {
                                        const diff = new Date(professor.plano_expira_em) - new Date();
                                        const dias = Math.ceil(diff / (1000 * 60 * 60 * 24));
                                        return `${dias} ${dias === 1 ? 'dia' : 'dias'}`;
                                    })()}</span> para o fim do acesso total.
                                </span>
                                <Link href="/dashboard/planos" className={styles.bannerLink}>
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
                    <main className={styles.pageArea}>
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
                            className={styles.mobileMenuOverlay}
                        />
                        <div className={styles.mobileMenu}>
                            <div className={styles.mobileHeader}>
                                <div className={styles.mobileHandle} />
                                <h3 className={styles.mobileTitle}>Navegação</h3>
                            </div>

                            <div className={styles.navGrid}>
                                {[...dashboardRoutes.main, ...dashboardRoutes.planos].map((item) => {
                                    // Validação de permissão mobile
                                    if (!hasPermission(professor?.plano, item.permission)) return null;

                                    const IconComponent = Icons[item.icon]
                                    const isActive = pathname === item.href

                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            onClick={() => setMobileMenuOpen(false)}
                                            className={`${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
                                        >
                                            <div className={`${styles.navIconBox} ${isActive ? styles.navIconBoxActive : ''}`}>
                                                <IconComponent size={22} />
                                            </div>
                                            <span className={`${styles.navLabel} ${isActive ? styles.navLabelActive : ''}`}>
                                                {item.label}
                                                {item.label === 'Meus Planos' && professor?.plano && (
                                                    <span
                                                        className="badge badge--success"
                                                        style={{ position: 'absolute', transform: 'translate(40px, -45px)', fontSize: '0.5rem' }}
                                                    >
                                                        {professor.plano.toUpperCase()}
                                                    </span>
                                                )}
                                            </span>
                                        </Link>
                                    )
                                })}
                            </div>

                            <div className={styles.mobileFooter}>
                                <Link
                                    href="/dashboard/perfil"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={styles.profileButton}
                                >
                                    <div className="avatar avatar--md">
                                        {professor.foto_url ? (
                                            <img src={professor.foto_url} alt={professor.nome} />
                                        ) : (
                                            professor.nome?.charAt(0) || 'P'
                                        )}
                                    </div>
                                    <div className="flex flex-col flex-1">
                                        <p className="text-sm font-bold m-0">{professor.nome}</p>
                                        <p className="text-xs text-muted m-0">Meu Perfil • Editar dados</p>
                                    </div>
                                    <Icons.ChevronRight size={18} />
                                </Link>

                                <button
                                    onClick={() => {
                                        setMobileMenuOpen(false)
                                        handleLogout()
                                    }}
                                    className={styles.logoutButton}
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
