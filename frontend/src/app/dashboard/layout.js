'use client'

import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { useEffect, useState, useCallback } from 'react'
import api from '@/lib/api'
import { ToastProvider } from '@/components/Toast'
import { Icons } from '@/components/Icons'
import BottomNavigation from '@/components/BottomNavigation'
import Sidebar from '@/components/layout/Sidebar'
import DashboardHeader from '@/components/layout/DashboardHeader'
import { dashboardRoutes, hasPermission } from '@/config/dashboard'
import styles from './DashboardLayout.module.css'

// ─── Hook: carrega e sincroniza dados do professor ────────────────────────────
function useProfessor() {
    const [professor, setProfessor] = useState(null)

    const refresh = useCallback(async () => {
        try {
            const res = await api.get('/perfil')
            if (res.data.success) {
                const data = res.data.data
                setProfessor(data)
                localStorage.setItem('professor', JSON.stringify(data))
            }
        } catch {
            // mantém o cache local se a API falhar
        }
    }, [])

    useEffect(() => {
        // Exibe cache instantaneamente
        try {
            const cached = localStorage.getItem('professor')
            if (cached) setProfessor(JSON.parse(cached))
        } catch { /* ignore */ }

        refresh()

        // Escuta atualizações de outras partes do app
        const onUpdate = () => {
            try {
                const cached = localStorage.getItem('professor')
                if (cached) setProfessor(JSON.parse(cached))
            } catch { /* ignore */ }
        }
        window.addEventListener('user-profile-updated', onUpdate)
        return () => window.removeEventListener('user-profile-updated', onUpdate)
    }, [refresh])

    return { professor, setProfessor }
}

// ─── Hook: polling do status do WhatsApp ─────────────────────────────────────
function useWhatsAppStatus() {
    const [connected, setConnected] = useState(false)

    useEffect(() => {
        const check = async () => {
            try {
                const res = await api.get('/whatsapp/status')
                setConnected(!!res.data.connected)
            } catch {
                setConnected(false)
            }
        }

        check()
        const interval = setInterval(check, 30_000)
        return () => clearInterval(interval)
    }, []) // ← array vazio: cria um único interval por montagem

    return connected
}

// ─── Componente principal ─────────────────────────────────────────────────────
export default function DashboardLayout({ children }) {
    const router = useRouter()
    const pathname = usePathname()

    const { professor } = useProfessor()
    const whatsappConnected = useWhatsAppStatus()

    const [sidebarOpen, setSidebarOpen] = useState(true)
    const [notificacoesCount, setNotificacoesCount] = useState(0)
    const [profileDropdownOpen, setProfileDropdownOpen] = useState(false)
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

    // Tema salvo
    useEffect(() => {
        const saved = localStorage.getItem('theme') || 'light'
        document.documentElement.setAttribute('data-theme', saved)
    }, [])

    // Proteção de rota por plano
    useEffect(() => {
        if (!professor) return
        const allRoutes = [
            ...dashboardRoutes.main,
            ...dashboardRoutes.planos,
            ...dashboardRoutes.sistema,
        ]
        const match = allRoutes
            .sort((a, b) => b.href.length - a.href.length)
            .find(r => pathname?.startsWith(r.href))
        if (match && !hasPermission(professor.plano, match.permission)) {
            router.replace('/dashboard')
        }
    }, [pathname, professor, router])

    // Notificações não lidas
    useEffect(() => {
        const load = async () => {
            try {
                const res = await api.get('/notificacoes?status=enviado&limit=100')
                const data = res.data.data || []
                setNotificacoesCount(data.filter(n => !n.lida).length)
            } catch { /* silently fail */ }
        }
        load()
    }, [])

    // Marca como lidas ao entrar na página de notificações
    useEffect(() => {
        if (pathname !== '/dashboard/notificacoes') return
        const markRead = async () => {
            try {
                await api.patch('/notificacoes/ler-todas')
                setNotificacoesCount(0)
            } catch { /* silently fail */ }
        }
        markRead()
    }, [pathname])

    const handleLogout = async () => {
        try {
            await api.post('/auth/logout')
        } catch { /* continue mesmo se a API falhar */ }
        localStorage.removeItem('token')
        localStorage.removeItem('professor')
        router.push('/login')
    }

    if (!professor) {
        return (
            <div className={styles.loadingScreen}>
                <div className="spinner" />
            </div>
        )
    }

    const trialDaysLeft = professor.plano_expira_em
        ? Math.ceil((new Date(professor.plano_expira_em) - new Date()) / (1000 * 60 * 60 * 24))
        : null
    const showTrial = trialDaysLeft !== null && trialDaysLeft > 0

    return (
        <ToastProvider>
            <div className={styles.root}>
                <Sidebar
                    sidebarOpen={sidebarOpen}
                    pathname={pathname}
                    professor={professor}
                    whatsappConnected={whatsappConnected}
                    handleLogout={handleLogout}
                />

                <div className={`${styles.main} ${sidebarOpen ? styles['main--expanded'] : styles['main--collapsed']}`}>
                    {/* Trial Banner */}
                    {showTrial && (
                        <div className={styles.trialBanner}>
                            <span className={styles.trialBanner__icon}>
                                <Icons.Dashboard size={14} />
                            </span>
                            <span>
                                Você está no plano{' '}
                                <span className={styles.trialBanner__plan}>
                                    {professor.plano || 'STARTER'} (Degustação)
                                </span>
                                . Restam{' '}
                                <span className={styles.trialBanner__days}>
                                    {trialDaysLeft} {trialDaysLeft === 1 ? 'dia' : 'dias'}
                                </span>
                                {' '}para o fim do acesso total.
                            </span>
                            <Link href="/dashboard/planos" className={styles.trialBanner__cta}>
                                Ver Planos
                            </Link>
                        </div>
                    )}

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

                    <main className={styles.pageContent}>
                        {children}
                    </main>
                </div>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <>
                    <div
                        className={styles.mobileOverlay}
                        onClick={() => setMobileMenuOpen(false)}
                    />
                    <div className={styles.mobileMenu}>
                        <div className={styles.mobileMenuHandle} />
                        <h3 className={styles.mobileMenuTitle}>Navegação</h3>

                        <div className={styles.mobileNavGrid}>
                            {[...dashboardRoutes.main, ...dashboardRoutes.planos].map((item) => {
                                if (!hasPermission(professor?.plano, item.permission)) return null
                                const IconComponent = Icons[item.icon]
                                const isActive = pathname === item.href
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className={`${styles.mobileNavItem} ${isActive ? styles['mobileNavItem--active'] : ''}`}
                                    >
                                        <div className={styles.mobileNavIcon}>
                                            <IconComponent size={20} />
                                        </div>
                                        <span className={styles.mobileNavLabel}>{item.label}</span>
                                    </Link>
                                )
                            })}
                        </div>

                        <div className={styles.mobileMenuFooter}>
                            <Link
                                href="/dashboard/perfil"
                                onClick={() => setMobileMenuOpen(false)}
                                className={styles.mobileProfileLink}
                            >
                                <div className="avatar avatar--md">
                                    {professor.foto_url
                                        ? <img src={professor.foto_url} alt={professor.nome} />
                                        : professor.nome?.charAt(0) || 'P'
                                    }
                                </div>
                                <div className={styles.mobileProfileInfo}>
                                    <p>{professor.nome}</p>
                                    <p>Meu Perfil • Editar dados</p>
                                </div>
                                <Icons.ChevronRight size={16} color="var(--text-muted)" />
                            </Link>

                            <button
                                onClick={() => { setMobileMenuOpen(false); handleLogout() }}
                                className={styles.mobileLogoutBtn}
                            >
                                <Icons.Logout size={18} />
                                Sair da Conta
                            </button>
                        </div>
                    </div>
                </>
            )}

            <BottomNavigation
                notificacoesCount={notificacoesCount}
                onMenuClick={() => setMobileMenuOpen(prev => !prev)}
            />
        </ToastProvider>
    )
}
