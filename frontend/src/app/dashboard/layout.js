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

    useEffect(() => {
        const professorData = localStorage.getItem('professor')

        // Carregar tema salvo
        const savedTheme = localStorage.getItem('theme') || 'light'
        document.documentElement.setAttribute('data-theme', savedTheme)

        // Se tiver dados em cache, exibe instantaneamente (Optimistic UI)
        if (professorData) {
            try {
                const parsed = JSON.parse(professorData)
                setProfessor(parsed)
            } catch (error) {
                console.error('Erro ao ler dados do professor:', error)
            }
        }

        // Sempre busca dados atualizados e verifica sessão (Cookie)
        // Se falhar com 401, o api.js redireciona para login
        loadProfile()
        loadNotificacoesCount()

        // Se estiver na página de notificações, marca como lidas
        if (pathname === '/dashboard/notificacoes') {
            localStorage.setItem('last_notifications_view', Date.now().toString())
            setNotificacoesCount(0)
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
        }
    }, [router, pathname])

    const loadProfile = async () => {
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

    const loadNotificacoesCount = async () => {
        try {
            const response = await api.get('/notificacoes')
            const data = response.data.data || []

            // Lógica simples: contar notificações dos últimos 3 dias ou as que o usuário ainda não "limpou"
            // Para ser real, precisaríamos de um campo 'lida' no banco. 
            // Como estamos implementando agora, vamos considerar notificações novas ou uma lógica de localStorage
            const lastViewed = localStorage.getItem('last_notifications_view') || 0
            const unread = data.filter(n => new Date(n.created_at).getTime() > parseInt(lastViewed)).length

            setNotificacoesCount(unread)
        } catch (error) {
            console.error('Erro ao buscar contador de notificações:', error)
        }
    }

    const handleLogout = async () => {
        try {
            await api.post('/auth/logout')
        } catch (error) {
            console.error('Erro ao fazer logout na API', error)
        } finally {
            localStorage.removeItem('token') // Limpeza redundante
            localStorage.removeItem('professor')
            router.push('/login')
        }
    }

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
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
                <div className="spinner" style={{ width: '3rem', height: '3rem' }} />
            </div>
        )
    }

    return (
        <ToastProvider>
            <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-primary)' }}>
                {/* Sidebar Verde Escura - Desktop Only */}
                <aside className="sidebar gradient-sidebar" style={{
                    width: sidebarOpen ? '16rem' : '5rem',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    position: 'fixed',
                    height: '100vh',
                    display: 'flex',
                    flexDirection: 'column',
                    zIndex: 40,
                    borderRight: '1px solid var(--sidebar-border)'
                }}>
                    {/* Logo/Header */}
                    <div style={{
                        padding: '1.5rem',
                        borderBottom: '1px solid var(--sidebar-border)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem'
                    }}>
                        <div style={{
                            width: '2.5rem',
                            height: '2.5rem',
                            borderRadius: '0.625rem',
                            background: 'rgba(255, 255, 255, 0.08)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                            border: '1px solid rgba(255, 255, 255, 0.1)'
                        }}>
                            <Icons.Fitness size={20} color="white" />
                        </div>
                        {sidebarOpen && (
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <h2 style={{
                                    fontSize: '1rem',
                                    fontWeight: '800',
                                    color: 'white',
                                    lineHeight: 1.2,
                                    letterSpacing: '-0.02em'
                                }}>
                                    Personal Agenda
                                </h2>
                                <p style={{
                                    fontSize: '0.6875rem',
                                    color: 'var(--sidebar-text)',
                                    opacity: 0.6,
                                    fontWeight: '500',
                                    letterSpacing: '0.01em',
                                    marginTop: '0.125rem'
                                }}>
                                    Trainer Management
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Main Navigation - Scrollable Area */}
                    <nav style={{
                        padding: '1.5rem 0.75rem',
                        flex: 1,
                        overflowY: 'auto',
                        scrollbarWidth: 'thin',
                        scrollbarColor: 'var(--border) transparent'
                    }}>
                        {/* Section: MENU */}
                        {sidebarOpen && (
                            <p style={{
                                fontSize: '0.625rem',
                                fontWeight: '800',
                                color: 'var(--sidebar-text)',
                                opacity: 0.4,
                                textTransform: 'uppercase',
                                letterSpacing: '0.1em',
                                marginBottom: '1rem',
                                paddingLeft: '1rem'
                            }}>
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
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.875rem',
                                        padding: '0.75rem 1rem',
                                        borderRadius: '0.625rem',
                                        marginBottom: '0.25rem',
                                        textDecoration: 'none',
                                        color: (isActive || hoveredPath === item.href) ? 'white' : 'var(--sidebar-text)',
                                        backgroundColor: isActive ? 'var(--sidebar-accent)' : (hoveredPath === item.href ? 'rgba(255, 255, 255, 0.05)' : 'transparent'),
                                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                        cursor: 'pointer',
                                        fontWeight: isActive ? '700' : '500',
                                        fontSize: '0.875rem'
                                    }}
                                >
                                    <span style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                                        <IconComponent size={20} color={(isActive || hoveredPath === item.href) ? 'white' : 'var(--sidebar-text)'} />
                                    </span>
                                    {sidebarOpen && <span>{item.label}</span>}
                                </Link>
                            )
                        })}

                        {/* Section: PLANOS */}
                        {sidebarOpen && (
                            <div style={{
                                height: '1px',
                                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                margin: '1.5rem 1rem 1rem 1rem'
                            }} />
                        )}
                        {sidebarOpen && (
                            <p style={{
                                fontSize: '0.625rem',
                                fontWeight: '800',
                                color: 'var(--sidebar-text)',
                                opacity: 0.4,
                                textTransform: 'uppercase',
                                letterSpacing: '0.1em',
                                marginBottom: '1rem',
                                paddingLeft: '1rem'
                            }}>
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
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.875rem',
                                        padding: '0.75rem 1rem',
                                        borderRadius: '0.625rem',
                                        marginBottom: '0.25rem',
                                        textDecoration: 'none',
                                        color: (isActive || hoveredPath === item.href) ? 'white' : 'var(--sidebar-text)',
                                        backgroundColor: isActive ? 'var(--sidebar-accent)' : (hoveredPath === item.href ? 'rgba(255, 255, 255, 0.05)' : 'transparent'),
                                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                        cursor: 'pointer',
                                        fontWeight: isActive ? '700' : '500',
                                        fontSize: '0.875rem'
                                    }}
                                >
                                    <span style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                                        <IconComponent size={20} color={(isActive || hoveredPath === item.href) ? 'white' : 'var(--sidebar-text)'} />
                                    </span>
                                    {sidebarOpen && (
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                                            <span>{item.label}</span>
                                            {item.label === 'Meus Planos' && professor?.plano && (
                                                <span style={{
                                                    fontSize: '0.625rem',
                                                    fontWeight: '800',
                                                    padding: '0.125rem 0.375rem',
                                                    borderRadius: '1rem',
                                                    background: professor.plano === 'PREMIUM' ? 'linear-gradient(135deg, #f59e0b, #d97706)' : 'rgba(255, 255, 255, 0.1)',
                                                    color: 'white',
                                                    marginLeft: '0.4rem'
                                                }}>
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
                            <div style={{
                                height: '1px',
                                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                margin: '1.5rem 1rem 1rem 1rem'
                            }} />
                        )}
                        {sidebarOpen && (
                            <p style={{
                                fontSize: '0.625rem',
                                fontWeight: '800',
                                color: 'var(--sidebar-text)',
                                opacity: 0.4,
                                textTransform: 'uppercase',
                                letterSpacing: '0.1em',
                                marginBottom: '1rem',
                                paddingLeft: '1rem'
                            }}>
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
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.875rem',
                                        padding: '0.75rem 1rem',
                                        borderRadius: '0.625rem',
                                        marginBottom: '0.25rem',
                                        textDecoration: 'none',
                                        color: (isActive || hoveredPath === item.href) ? 'white' : 'var(--sidebar-text)',
                                        backgroundColor: isActive ? 'var(--sidebar-accent)' : (hoveredPath === item.href ? 'rgba(255, 255, 255, 0.05)' : 'transparent'),
                                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                        cursor: 'pointer',
                                        fontWeight: isActive ? '700' : '500',
                                        fontSize: '0.875rem'
                                    }}
                                >
                                    <span style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                                        <IconComponent size={20} color={(isActive || hoveredPath === item.href) ? 'white' : 'var(--sidebar-text)'} />
                                    </span>
                                    {sidebarOpen && <span>{item.label}</span>}
                                </Link>
                            )
                        })}
                    </nav>

                    {/* User Profile + Logout - Fixed at Bottom */}
                    <div style={{
                        marginTop: 'auto',
                        padding: '1rem',
                        borderTop: '1px solid var(--sidebar-border)',
                        background: 'var(--sidebar-bg-dark)',
                        flexShrink: 0
                    }}>
                        {sidebarOpen && (
                            <Link
                                href="/dashboard/perfil"
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.75rem',
                                    marginBottom: '1rem',
                                    padding: '0.75rem',
                                    borderRadius: '0.75rem',
                                    background: pathname === '/dashboard/perfil' ? 'var(--sidebar-accent)' : 'rgba(255, 255, 255, 0.04)',
                                    border: '1px solid rgba(255, 255, 255, 0.05)',
                                    textDecoration: 'none',
                                    transition: 'all 0.2s',
                                    cursor: 'pointer'
                                }}
                                onMouseEnter={(e) => {
                                    if (pathname !== '/dashboard/perfil') {
                                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (pathname !== '/dashboard/perfil') {
                                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)'
                                    }
                                }}
                            >
                                <div className="avatar avatar-sm" style={{
                                    background: 'linear-gradient(135deg, var(--primary), var(--primary-light))',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    flexShrink: 0
                                }}>
                                    {professor.foto_url ? (
                                        <img src={professor.foto_url} alt={professor.nome} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                                    ) : (
                                        professor.nome.charAt(0)
                                    )}
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <p style={{
                                        fontSize: '0.875rem',
                                        fontWeight: '600',
                                        color: 'white',
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        margin: 0
                                    }}>
                                        {professor.nome}
                                    </p>
                                    <p style={{
                                        fontSize: '0.7rem',
                                        color: 'var(--sidebar-text)',
                                        opacity: 0.7,
                                        margin: 0,
                                        marginTop: '2px'
                                    }}>
                                        Personal Trainer
                                    </p>
                                </div>
                                <Icons.ChevronRight size={14} color="var(--sidebar-text)" style={{ opacity: 0.5 }} />
                            </Link>
                        )}
                        <button
                            onClick={handleLogout}
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                background: 'rgba(239, 68, 68, 0.08)',
                                color: '#ff8a8a',
                                border: '1px solid rgba(239, 68, 68, 0.15)',
                                borderRadius: '0.75rem',
                                fontSize: '0.8125rem',
                                fontWeight: '700',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.625rem'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.12)'
                                e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.25)'
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.08)'
                                e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.15)'
                            }}
                        >
                            <Icons.Logout size={16} color="#ff8a8a" />
                            {sidebarOpen && <span>Sair da Conta</span>}
                        </button>
                    </div>
                </aside>

                {/* Main Content */}
                <div className="main-content" style={{
                    marginLeft: sidebarOpen ? '16rem' : '5rem',
                    flex: 1,
                    transition: 'margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    minHeight: '100vh',
                    display: 'flex',
                    flexDirection: 'column'
                }}>
                    {/* Trial Banner */}
                    {professor?.plano_expira_em && (new Date(professor.plano_expira_em) > new Date()) && (
                        <div style={{
                            background: 'linear-gradient(90deg, var(--primary), var(--primary-dark))',
                            color: 'white',
                            padding: '0.5rem 1rem',
                            textAlign: 'center',
                            fontSize: '0.8125rem',
                            fontWeight: '700',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem',
                            zIndex: 100
                        }}>
                            <Icons.Dashboard size={14} />
                            <span>
                                Você esta usando o plano <strong>STARTER (Degustação)</strong>.
                                Restam <strong>{(() => {
                                    const diff = new Date(professor.plano_expira_em) - new Date();
                                    const dias = Math.ceil(diff / (1000 * 60 * 60 * 24));
                                    return `${dias} ${dias === 1 ? 'dia' : 'dias'}`;
                                })()}</strong> de acesso total.
                            </span>
                            <Link href="/dashboard/planos" style={{
                                color: 'white',
                                textDecoration: 'underline',
                                marginLeft: '1rem',
                                opacity: 0.9
                            }}>
                                Ver Planos
                            </Link>
                        </div>
                    )}
                    {/* Header */}
                    <header style={{
                        backgroundColor: 'var(--bg-secondary)',
                        borderBottom: '1px solid var(--border)',
                        padding: '1rem 1.5rem',
                        position: 'sticky',
                        top: 0,
                        zIndex: 30,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        minHeight: '4.5rem'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <button
                                onClick={() => setSidebarOpen(!sidebarOpen)}
                                style={{
                                    padding: '0.55rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    background: 'transparent',
                                    border: 'none',
                                    cursor: 'pointer',
                                    color: 'var(--text-secondary)',
                                    borderRadius: '0.5rem',
                                    transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)'
                                    e.currentTarget.style.boxShadow = 'var(--shadow)'
                                    e.currentTarget.style.transform = 'translateY(-1px)'
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = 'transparent'
                                    e.currentTarget.style.boxShadow = 'none'
                                    e.currentTarget.style.transform = 'translateY(0)'
                                }}
                                className="desktop-only"
                            >
                                <Icons.SidebarToggle size={20} />
                            </button>

                            {/* Vertical Separator */}
                            <div className="desktop-only" style={{
                                width: '1px',
                                height: '1.5rem',
                                backgroundColor: 'var(--border)',
                                margin: '0 0.5rem'
                            }} />

                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <h1 style={{
                                    fontSize: '1.25rem',
                                    fontWeight: '800',
                                    color: 'var(--primary)',
                                    margin: 0,
                                    lineHeight: 1.2,
                                    letterSpacing: '-0.02em'
                                }}>
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
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0, marginTop: '2px' }}>
                                        Bem-vindo de volta, {professor.nome.split(' ')[0]}. Aqui está sua visão geral.
                                    </p>
                                )}
                                {pathname.includes('/alunos') && (
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0, marginTop: '2px' }}>
                                        Gerencie seus alunos cadastrados e seus progressos.
                                    </p>
                                )}
                                {pathname.includes('servicos') && (
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0, marginTop: '2px' }}>
                                        Configure suas modalidades e durações de treino.
                                    </p>
                                )}
                                {pathname.includes('/contratos') && (
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0, marginTop: '2px' }}>
                                        Gerencie planos ativos e faturamento mensal.
                                    </p>
                                )}
                                {pathname.includes('/agenda') && (
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0, marginTop: '2px' }}>
                                        Acompanhe sua agenda de treinos diária e semanal.
                                    </p>
                                )}
                                {pathname.includes('/notificacoes') && (
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0, marginTop: '2px' }}>
                                        Histórico de mensagens enviadas aos seus alunos.
                                    </p>
                                )}
                                {pathname.includes('/perfil') && (
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0, marginTop: '2px' }}>
                                        Gerencie suas informações pessoais e profissionais.
                                    </p>
                                )}
                                {pathname.includes('/configuracoes') && (
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0, marginTop: '2px' }}>
                                        Gerencie as preferências e segurança da conta.
                                    </p>
                                )}
                                {pathname.includes('/planos') && (
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0, marginTop: '2px' }}>
                                        Evolua sua gestão com recursos Premium.
                                    </p>
                                )}
                            </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                            <Link
                                href="/dashboard/notificacoes"
                                onClick={() => {
                                    localStorage.setItem('last_notifications_view', Date.now().toString())
                                    setNotificacoesCount(0)
                                }}
                                style={{
                                    position: 'relative',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    textDecoration: 'none',
                                    padding: '0.625rem',
                                    borderRadius: '0.75rem',
                                    transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                                    background: 'transparent'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = 'var(--bg-tertiary)'
                                    e.currentTarget.style.boxShadow = 'var(--shadow-sm)'
                                    e.currentTarget.style.transform = 'translateY(-1px)'
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = 'transparent'
                                    e.currentTarget.style.boxShadow = 'none'
                                    e.currentTarget.style.transform = 'translateY(0)'
                                }}
                            >
                                <Icons.Notifications size={22} color="var(--text-secondary)" />
                                {notificacoesCount > 0 && (
                                    <span style={{
                                        position: 'absolute',
                                        top: '4px',
                                        right: '4px',
                                        backgroundColor: '#ef4444',
                                        color: 'white',
                                        fontSize: '0.625rem',
                                        fontWeight: '800',
                                        padding: '2px 5px',
                                        borderRadius: '10px',
                                        border: '2px solid var(--bg-secondary)',
                                        minWidth: '18px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        lineHeight: 1
                                    }}>
                                        {notificacoesCount > 10 ? '10+' : notificacoesCount}
                                    </span>
                                )}
                            </Link>

                            {/* Profile Dropdown */}
                            <div style={{ position: 'relative' }}>
                                <button
                                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                                    className="avatar avatar-sm"
                                    style={{
                                        background: 'linear-gradient(135deg, var(--primary), var(--primary-light))',
                                        border: '1px solid var(--border)',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        transform: profileDropdownOpen ? 'scale(0.95)' : 'scale(1)'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = 'scale(1.05) translateY(-1px)'
                                        e.currentTarget.style.boxShadow = 'var(--shadow)'
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = profileDropdownOpen ? 'scale(0.95)' : 'scale(1)'
                                        e.currentTarget.style.boxShadow = 'none'
                                    }}
                                >
                                    {professor.foto_url ? (
                                        <img src={professor.foto_url} alt={professor.nome} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
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
                                            style={{
                                                position: 'fixed',
                                                top: 0,
                                                left: 0,
                                                right: 0,
                                                bottom: 0,
                                                zIndex: 40
                                            }}
                                        />

                                        <div style={{
                                            position: 'absolute',
                                            top: 'calc(100% + 0.75rem)',
                                            right: 0,
                                            width: '16rem',
                                            backgroundColor: 'var(--bg-secondary)',
                                            border: '1px solid var(--border)',
                                            borderRadius: '0.75rem',
                                            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                                            zIndex: 50,
                                            overflow: 'hidden',
                                            animation: 'slideDown 0.2s ease-out'
                                        }}>
                                            {/* User Info */}
                                            <div style={{
                                                padding: '1rem',
                                                borderBottom: '1px solid var(--border)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.75rem'
                                            }}>
                                                <div className="avatar avatar-sm" style={{
                                                    background: 'linear-gradient(135deg, var(--primary), var(--primary-light))',
                                                    border: '1px solid var(--border)'
                                                }}>
                                                    {professor.foto_url ? (
                                                        <img src={professor.foto_url} alt={professor.nome} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                                                    ) : (
                                                        professor.nome.charAt(0)
                                                    )}
                                                </div>
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    <p style={{
                                                        fontSize: '0.875rem',
                                                        fontWeight: '600',
                                                        color: 'var(--text-primary)',
                                                        whiteSpace: 'nowrap',
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                        margin: 0
                                                    }}>
                                                        {professor.nome}
                                                    </p>
                                                    <p style={{
                                                        fontSize: '0.75rem',
                                                        color: 'var(--text-muted)',
                                                        margin: 0,
                                                        marginTop: '2px',
                                                        whiteSpace: 'nowrap',
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis'
                                                    }}>
                                                        {professor.email}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Menu Items */}
                                            <div style={{ padding: '0.5rem' }}>
                                                <Link
                                                    href="/dashboard/perfil"
                                                    onClick={() => setProfileDropdownOpen(false)}
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '0.75rem',
                                                        padding: '0.625rem 0.75rem',
                                                        borderRadius: '0.5rem',
                                                        textDecoration: 'none',
                                                        color: 'var(--text-primary)',
                                                        fontSize: '0.875rem',
                                                        fontWeight: '500',
                                                        transition: 'all 0.2s',
                                                        cursor: 'pointer'
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)'
                                                        e.currentTarget.style.color = 'var(--primary)'
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.backgroundColor = 'transparent'
                                                        e.currentTarget.style.color = 'var(--text-primary)'
                                                    }}
                                                >
                                                    <Icons.User size={18} />
                                                    <span>Meu Perfil</span>
                                                </Link>
                                            </div>

                                            {/* Logout */}
                                            <div style={{ padding: '0.5rem', borderTop: '1px solid var(--border)' }}>
                                                <button
                                                    onClick={() => {
                                                        setProfileDropdownOpen(false)
                                                        handleLogout()
                                                    }}
                                                    style={{
                                                        width: '100%',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '0.75rem',
                                                        padding: '0.625rem 0.75rem',
                                                        borderRadius: '0.5rem',
                                                        background: 'transparent',
                                                        border: 'none',
                                                        color: '#ef4444',
                                                        fontSize: '0.875rem',
                                                        fontWeight: '500',
                                                        transition: 'all 0.2s',
                                                        cursor: 'pointer',
                                                        textAlign: 'left'
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.08)'
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.backgroundColor = 'transparent'
                                                    }}
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
                    <main style={{ padding: '1.5rem', flex: 1 }} className="page-enter">
                        {children}
                    </main>
                </div>
            </div>

            {/* Mobile Menu Overlay - Unified */}
            {mobileMenuOpen && (
                <>
                    <div
                        onClick={() => setMobileMenuOpen(false)}
                        style={{
                            position: 'fixed',
                            inset: 0,
                            background: 'rgba(0, 0, 0, 0.6)',
                            backdropFilter: 'blur(8px)',
                            zIndex: 110,
                            animation: 'fade-in 0.2s'
                        }}
                    />
                    <div style={{
                        position: 'fixed',
                        bottom: '5.5rem',
                        left: '1rem',
                        right: '1rem',
                        backgroundColor: 'var(--bg-secondary)',
                        borderRadius: '1.5rem',
                        padding: '1.25rem',
                        zIndex: 120,
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                        animation: 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                        border: '1px solid var(--border)',
                        maxHeight: '80vh',
                        overflowY: 'auto'
                    }}>
                        <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
                            <div style={{
                                width: '3rem',
                                height: '4px',
                                background: 'var(--border)',
                                borderRadius: '2px',
                                margin: '0 auto 1.25rem auto',
                                opacity: 0.5
                            }} />
                            <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: '800', color: 'var(--primary)' }}>Navegação</h3>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
                            {[...menuItems, ...planoItems, ...sistemaItems].map((item) => {
                                const IconComponent = Icons[item.icon]
                                const isActive = pathname === item.href

                                // Cores baseadas no ícone/setor
                                let iconBg = 'rgba(16, 185, 129, 0.1)';
                                let iconColor = 'var(--primary)';
                                if (item.icon === 'Notifications') { iconBg = 'rgba(59, 130, 246, 0.1)'; iconColor = '#3b82f6'; }
                                if (item.icon === 'Star') { iconBg = 'rgba(245, 158, 11, 0.1)'; iconColor = '#f59e0b'; }
                                if (item.icon === 'Settings') { iconBg = 'rgba(107, 114, 128, 0.1)'; iconColor = 'var(--text-muted)'; }

                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={() => setMobileMenuOpen(false)}
                                        style={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            gap: '0.5rem',
                                            padding: '0.75rem 0.25rem',
                                            borderRadius: '1rem',
                                            backgroundColor: isActive ? 'var(--bg-tertiary)' : 'transparent',
                                            textDecoration: 'none',
                                            transition: 'all 0.2s',
                                            border: isActive ? '1px solid var(--border)' : '1px solid transparent'
                                        }}
                                    >
                                        <div style={{
                                            width: '2.75rem',
                                            height: '2.75rem',
                                            borderRadius: '0.75rem',
                                            background: isActive ? 'var(--primary)' : iconBg,
                                            color: isActive ? 'white' : iconColor,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}>
                                            <IconComponent size={22} />
                                        </div>
                                        <span style={{
                                            fontSize: '0.7rem',
                                            fontWeight: '600',
                                            color: isActive ? 'var(--primary)' : 'var(--text-primary)',
                                            textAlign: 'center',
                                            lineHeight: 1.1,
                                            position: 'relative'
                                        }}>
                                            {item.label}
                                            {item.label === 'Meus Planos' && professor?.plano && (
                                                <span style={{
                                                    position: 'absolute',
                                                    top: '-3.2rem',
                                                    right: '-0.5rem',
                                                    fontSize: '0.55rem',
                                                    fontWeight: '900',
                                                    padding: '0.1rem 0.3rem',
                                                    borderRadius: '0.5rem',
                                                    background: professor.plano === 'PREMIUM' ? '#f59e0b' : 'var(--primary)',
                                                    color: 'white',
                                                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                                }}>
                                                    {professor.plano.toUpperCase()}
                                                </span>
                                            )}
                                        </span>
                                    </Link>
                                )
                            })}
                        </div>

                        <div style={{
                            borderTop: '1px solid var(--border)',
                            paddingTop: '1.25rem',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.75rem'
                        }}>
                            <Link
                                href="/dashboard/perfil"
                                onClick={() => setMobileMenuOpen(false)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '1rem',
                                    padding: '1rem',
                                    borderRadius: '1rem',
                                    backgroundColor: 'var(--bg-tertiary)',
                                    textDecoration: 'none',
                                    color: 'var(--text-primary)',
                                    border: '1px solid var(--border)'
                                }}
                            >
                                <div className="avatar avatar-md" style={{
                                    background: 'linear-gradient(135deg, var(--primary), var(--primary-light))',
                                    width: '2.5rem',
                                    height: '2.5rem'
                                }}>
                                    {professor.foto_url ? (
                                        <img src={professor.foto_url} alt={professor.nome} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                                    ) : (
                                        professor.nome.charAt(0)
                                    )}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: '700' }}>{professor.nome}</p>
                                    <p style={{ margin: 0, fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Meu Perfil • Editar dados</p>
                                </div>
                                <Icons.ChevronRight size={18} color="var(--text-muted)" />
                            </Link>

                            <button
                                onClick={() => {
                                    setMobileMenuOpen(false)
                                    handleLogout()
                                }}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.75rem',
                                    padding: '1rem',
                                    borderRadius: '1rem',
                                    backgroundColor: 'rgba(239, 68, 68, 0.08)',
                                    border: '1px solid rgba(239, 68, 68, 0.15)',
                                    color: '#ef4444',
                                    fontSize: '0.875rem',
                                    fontWeight: '700',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <Icons.Logout size={20} />
                                <span>Sair da Conta</span>
                            </button>
                        </div>
                    </div>
                </>
            )}
            <BottomNavigation notificacoesCount={notificacoesCount} onMenuClick={() => setMobileMenuOpen(!mobileMenuOpen)} />
        </ToastProvider >
    )
}
