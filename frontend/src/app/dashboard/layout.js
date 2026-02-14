'use client'

import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { ToastProvider } from '@/components/Toast'

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
        { href: '/dashboard', label: 'Dashboard', icon: '📊' },
        { href: '/dashboard/alunos', label: 'Alunos', icon: '👥' },
        { href: '/dashboard/meus-servicos', label: 'Serviços', icon: '💪' },
        { href: '/dashboard/contratos', label: 'Contratos', icon: '📝' },
        { href: '/dashboard/agenda', label: 'Agenda', icon: '📅' },
        { href: '/dashboard/notificacoes', label: 'Notificações', icon: '🔔' },
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
                {/* Sidebar - Desktop Only */}
                <aside className="sidebar" style={{
                    width: sidebarOpen ? '16rem' : '4,5rem',
                    backgroundColor: 'var(--bg-secondary)',
                    borderRight: '1px solid var(--border)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    position: 'fixed',
                    height: '100vh',
                    overflowY: 'auto',
                    zIndex: 40,
                    backdropFilter: 'blur(10px)'
                }}>
                    <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <h2 style={{ fontSize: '1.1rem', fontWeight: '800', letterSpacing: '-0.02em', color: 'var(--primary)' }}>
                            {sidebarOpen ? 'PERSONAL AGENDA' : 'PA'}
                        </h2>
                    </div>

                    <nav style={{ padding: '1rem' }}>
                        {menuItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.875rem',
                                    padding: '0.875rem',
                                    borderRadius: '0.75rem',
                                    marginBottom: '0.4rem',
                                    textDecoration: 'none',
                                    color: pathname === item.href ? 'white' : 'var(--text-secondary)',
                                    backgroundColor: pathname === item.href ? 'var(--primary)' : 'transparent',
                                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                    cursor: 'pointer',
                                    boxShadow: pathname === item.href ? '0 4px 12px rgba(99, 102, 241, 0.3)' : 'none'
                                }}
                            >
                                <span style={{ fontSize: '1.25rem' }}>{item.icon}</span>
                                {sidebarOpen && <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>{item.label}</span>}
                            </Link>
                        ))}
                    </nav>

                    <div style={{ position: 'absolute', bottom: '1.5rem', left: '1rem', right: '1rem' }}>
                        <button
                            onClick={handleLogout}
                            className="btn btn-secondary"
                            style={{
                                width: '100%',
                                justifyContent: sidebarOpen ? 'flex-start' : 'center',
                                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                                color: '#ef4444',
                                border: '1px solid rgba(239, 68, 68, 0.2)'
                            }}
                        >
                            <span>🚪</span>
                            {sidebarOpen && <span style={{ fontWeight: '600' }}>Sair</span>}
                        </button>
                    </div>
                </aside>

                {/* Main Content */}
                <div className="main-content" style={{
                    marginLeft: sidebarOpen ? '16rem' : '4.5rem',
                    flex: 1,
                    transition: 'margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    minHeight: '100vh',
                    display: 'flex',
                    flexDirection: 'column'
                }}>
                    {/* Header */}
                    <header style={{
                        backgroundColor: 'rgba(10, 15, 29, 0.8)',
                        backdropFilter: 'blur(12px)',
                        borderBottom: '1px solid var(--border)',
                        padding: '1rem 1.5rem',
                        position: 'sticky',
                        top: 0,
                        zIndex: 30
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <button
                                    onClick={() => setSidebarOpen(!sidebarOpen)}
                                    className="btn btn-secondary desktop-only"
                                    style={{ padding: '0.5rem', width: '2.5rem', height: '2.5rem', justifyContent: 'center' }}
                                >
                                    ☰
                                </button>
                                <h1 className="mobile-only" style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--primary)', margin: 0 }}>
                                    PERSONAL AGENDA
                                </h1>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{ textAlign: 'right' }}>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '-2px' }}>Bem-vindo,</p>
                                    <p style={{ fontSize: '0.85rem', fontWeight: '700' }}>{professor.nome}</p>
                                </div>
                                <div style={{
                                    width: '2.5rem',
                                    height: '2.5rem',
                                    borderRadius: '50%',
                                    background: 'var(--primary)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontWeight: 'bold',
                                    fontSize: '1rem'
                                }}>
                                    {professor.nome.charAt(0)}
                                </div>
                            </div>
                        </div>
                    </header>

                    {/* Page Content */}
                    <main style={{ padding: '1.5rem', flex: 1 }}>
                        <div className="container">
                            {children}
                        </div>
                    </main>
                </div>

                {/* Bottom Navigation - Mobile Only */}
                <nav className="bottom-nav">
                    {menuItems.slice(0, 5).map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`bottom-nav-item ${pathname === item.href ? 'active' : ''}`}
                        >
                            <span className="bottom-nav-icon">{item.icon}</span>
                            <span>{item.label}</span>
                        </Link>
                    ))}
                </nav>
            </div>
        </ToastProvider>
    )
}
