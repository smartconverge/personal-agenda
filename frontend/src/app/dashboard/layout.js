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
            setProfessor(JSON.parse(professorData))
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
                            borderRadius: '0.5rem',
                            background: 'linear-gradient(135deg, var(--primary-light), var(--primary))',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.25rem',
                            flexShrink: 0
                        }}>
                            💪
                        </div>
                        {sidebarOpen && (
                            <div>
                                <h2 style={{
                                    fontSize: '1rem',
                                    fontWeight: '800',
                                    color: 'white',
                                    lineHeight: 1,
                                    marginBottom: '0.125rem'
                                }}>
                                    Personal Agenda
                                </h2>
                                <p style={{
                                    fontSize: '0.7rem',
                                    color: 'var(--sidebar-text)',
                                    opacity: 0.7
                                }}>
                                    Gestão de Treinos
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Navigation */}
                    <nav style={{ padding: '1rem 0.75rem' }}>
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
                                marginBottom: '0.75rem',
                                padding: '0.5rem',
                                borderRadius: '0.5rem',
                                background: 'rgba(255, 255, 255, 0.05)'
                            }}>
                                <div className="avatar avatar-sm">
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
                                padding: '0.625rem',
                                background: 'rgba(239, 68, 68, 0.15)',
                                color: '#ff6b6b',
                                border: '1px solid rgba(239, 68, 68, 0.3)',
                                borderRadius: '0.5rem',
                                fontSize: '0.875rem',
                                fontWeight: '600',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem'
                            }}
                        >
                            <Icons.Logout size={18} color="#ff6b6b" />
                            {sidebarOpen && <span>Sair</span>}
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
                        boxShadow: 'var(--shadow-sm)'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <button
                                    onClick={() => setSidebarOpen(!sidebarOpen)}
                                    className="btn btn-secondary desktop-only"
                                    style={{
                                        padding: '0.5rem',
                                        width: '2.5rem',
                                        height: '2.5rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                >
                                    <Icons.Menu size={20} />
                                </button>
                                <h1 className="mobile-only" style={{
                                    fontSize: '1.25rem',
                                    fontWeight: '800',
                                    margin: 0,
                                    background: 'linear-gradient(135deg, var(--primary), var(--primary-light))',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    backgroundClip: 'text'
                                }}>
                                    Personal Agenda
                                </h1>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{ textAlign: 'right' }} className="desktop-only">
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0' }}>
                                        Bem-vindo,
                                    </p>
                                    <p style={{ fontSize: '0.875rem', fontWeight: '700', marginTop: '-2px' }}>
                                        {professor.nome}
                                    </p>
                                </div>
                                <div className="avatar">
                                    {professor.nome.charAt(0)}
                                </div>
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
