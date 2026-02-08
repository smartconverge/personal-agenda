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
        { href: '/dashboard/servicos', label: 'Serviços', icon: '💪' },
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
            <div style={{ display: 'flex', minHeight: '100vh' }}>
                {/* Sidebar */}
                <aside style={{
                    width: sidebarOpen ? '16rem' : '4rem',
                    backgroundColor: 'var(--bg-secondary)',
                    borderRight: '1px solid var(--border)',
                    transition: 'width 0.3s',
                    position: 'fixed',
                    height: '100vh',
                    overflowY: 'auto',
                    zIndex: 40
                }}>
                    <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)' }}>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: '700', whiteSpace: 'nowrap', overflow: 'hidden' }}>
                            {sidebarOpen ? 'Personal Agenda' : 'PA'}
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
                                    gap: '0.75rem',
                                    padding: '0.75rem',
                                    borderRadius: '0.375rem',
                                    marginBottom: '0.5rem',
                                    textDecoration: 'none',
                                    color: pathname === item.href ? 'var(--primary)' : 'var(--text-secondary)',
                                    backgroundColor: pathname === item.href ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                                    transition: 'all 0.2s',
                                    cursor: 'pointer'
                                }}
                            >
                                <span style={{ fontSize: '1.25rem' }}>{item.icon}</span>
                                {sidebarOpen && <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>{item.label}</span>}
                            </Link>
                        ))}
                    </nav>

                    <div style={{ position: 'absolute', bottom: '1rem', left: '1rem', right: '1rem' }}>
                        <button
                            onClick={handleLogout}
                            className="btn btn-danger"
                            style={{ width: '100%', justifyContent: 'center' }}
                        >
                            {sidebarOpen ? '🚪 Sair' : '🚪'}
                        </button>
                    </div>
                </aside>

                {/* Main Content */}
                <div style={{
                    marginLeft: sidebarOpen ? '16rem' : '4rem',
                    flex: 1,
                    transition: 'margin-left 0.3s'
                }}>
                    {/* Header */}
                    <header style={{
                        backgroundColor: 'var(--bg-secondary)',
                        borderBottom: '1px solid var(--border)',
                        padding: '1rem 1.5rem',
                        position: 'sticky',
                        top: 0,
                        zIndex: 30
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <button
                                onClick={() => setSidebarOpen(!sidebarOpen)}
                                className="btn btn-secondary"
                            >
                                ☰
                            </button>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <span className="text-sm text-muted">
                                    Olá, <strong>{professor.nome}</strong>
                                </span>
                            </div>
                        </div>
                    </header>

                    {/* Page Content */}
                    <main style={{ padding: '1.5rem' }}>
                        {children}
                    </main>
                </div>
            </div>
        </ToastProvider>
    )
}
