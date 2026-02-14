'use client'

import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { ToastProvider } from '@/components/Toast'
import { Icons } from '@/components/Icons'

export default function DashboardLayout({ children }) {
    const router = useRouter()
    const pathname = usePathname()
    const [professor, setProfessor] = useState(null)
    const [sidebarOpen, setSidebarOpen] = useState(true)

    useEffect(() => {
        const token = localStorage.getItem('token')
        const professorData = localStorage.getItem('professor')

        if (!token) {
            router.push('/login')
            return
        }

        if (professorData) {
            try {
                setProfessor(JSON.parse(professorData))
            } catch (error) {
                console.error('Erro ao ler dados do professor:', error)
                router.push('/login')
            }
        }
    }, [router])

    const handleLogout = () => {
        localStorage.removeItem('token')
        localStorage.removeItem('professor')
        router.push('/login')
    }

    const menuItems = [
        { href: '/dashboard', label: 'Dashboard', icon: 'Dashboard' },
        { href: '/dashboard/alunos', label: 'Alunos', icon: 'Students' },
        { href: '/dashboard/meus-servicos', label: 'Serviços', icon: 'Services' },
        { href: '/dashboard/contratos', label: 'Contratos', icon: 'Contracts' },
        { href: '/dashboard/agenda', label: 'Agenda', icon: 'Calendar' },
        { href: '/dashboard/notificacoes', label: 'Notificações', icon: 'Notifications' },
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
                    overflowY: 'auto',
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

                    {/* Navigation */}
                    <nav style={{ padding: '1.5rem 0.75rem' }}>
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
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.875rem',
                                        padding: '0.75rem 1rem',
                                        borderRadius: '0.625rem',
                                        marginBottom: '0.25rem',
                                        textDecoration: 'none',
                                        color: isActive ? 'white' : 'var(--sidebar-text)',
                                        backgroundColor: isActive ? 'var(--sidebar-accent)' : 'transparent',
                                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                        cursor: 'pointer',
                                        fontWeight: isActive ? '700' : '500',
                                        fontSize: '0.875rem'
                                    }}
                                >
                                    <span style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                                        <IconComponent size={20} color={isActive ? 'white' : 'var(--sidebar-text)'} />
                                    </span>
                                    {sidebarOpen && <span>{item.label}</span>}
                                </Link>
                            )
                        })}
                    </nav>

                    {/* User Profile + Logout */}
                    <div style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        padding: '1rem',
                        borderTop: '1px solid var(--sidebar-border)',
                        background: 'var(--sidebar-bg-dark)'
                    }}>
                        {sidebarOpen && (
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                marginBottom: '1rem',
                                padding: '0.75rem',
                                borderRadius: '0.75rem',
                                background: 'rgba(255, 255, 255, 0.04)',
                                border: '1px solid rgba(255, 255, 255, 0.05)'
                            }}>
                                <div className="avatar avatar-sm" style={{
                                    background: 'linear-gradient(135deg, var(--primary), var(--primary-light))',
                                    border: '1px solid rgba(255, 255, 255, 0.1)'
                                }}>
                                    {professor.nome.charAt(0)}
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <p style={{
                                        fontSize: '0.875rem',
                                        fontWeight: '600',
                                        color: 'white',
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis'
                                    }}>
                                        {professor.nome}
                                    </p>
                                    <p style={{
                                        fontSize: '0.7rem',
                                        color: 'var(--sidebar-text)',
                                        opacity: 0.7
                                    }}>
                                        Personal Trainer
                                    </p>
                                </div>
                            </div>
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
                                    padding: '0.5rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    background: 'transparent',
                                    border: 'none',
                                    cursor: 'pointer',
                                    color: 'var(--text-secondary)',
                                    borderRadius: '0.5rem',
                                    transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
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
                                            pathname.includes('/servicos') ? 'Serviços' :
                                                pathname.includes('/contratos') ? 'Contratos' :
                                                    pathname.includes('/agenda') ? 'Agenda' : 'Personal Agenda'}
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
                                {pathname.includes('/servicos') && (
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
                            </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                            <div style={{ position: 'relative', cursor: 'pointer' }}>
                                <Icons.Notifications size={22} color="var(--text-secondary)" />
                                <span style={{
                                    position: 'absolute',
                                    top: '-2px',
                                    right: '-2px',
                                    width: '12px',
                                    height: '12px',
                                    backgroundColor: '#ef4444',
                                    borderRadius: '50%',
                                    border: '2px solid var(--bg-secondary)'
                                }} />
                            </div>
                            <div className="avatar avatar-sm" style={{
                                background: 'linear-gradient(135deg, var(--primary), var(--primary-light))',
                                border: '1px solid var(--border)'
                            }}>
                                {professor.nome.charAt(0)}
                            </div>
                        </div>
                    </header>

                    {/* Page Content */}
                    <main style={{ padding: '1.5rem', flex: 1 }} className="page-enter">
                        {children}
                    </main>
                </div>

                {/* Bottom Navigation - Mobile Only */}
                <nav className="bottom-nav">
                    {menuItems.slice(0, 5).map((item) => {
                        const IconComponent = Icons[item.icon]
                        const isActive = pathname === item.href

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`bottom-nav-item ${isActive ? 'active' : ''}`}
                            >
                                <span className="bottom-nav-icon">
                                    <IconComponent size={22} color={isActive ? 'var(--primary)' : 'var(--text-muted)'} />
                                </span>
                                <span>{item.label}</span>
                            </Link>
                        )
                    })}
                </nav>
            </div>
        </ToastProvider>
    )
}
