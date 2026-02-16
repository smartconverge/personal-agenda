'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Icons } from './Icons'

export default function BottomNavigation({ notificacoesCount = 0, onMenuClick }) {
    const pathname = usePathname()

    const navItems = [
        { href: '/dashboard', label: 'Início', icon: 'Dashboard' },
        { href: '/dashboard/agenda', label: 'Agenda', icon: 'Calendar' },
        { href: '/dashboard/alunos', label: 'Alunos', icon: 'Students' },
        { href: '/dashboard/notificacoes', label: 'Avisos', icon: 'Notifications', badge: notificacoesCount },
    ]

    return (
        <nav className="bottom-nav">
            {navItems.map((item) => {
                const IconComponent = Icons[item.icon]
                const isActive = pathname === item.href

                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={`bottom-nav-item ${isActive ? 'active' : ''}`}
                    >
                        <div style={{ position: 'relative' }}>
                            <IconComponent size={24} color={isActive ? 'var(--primary)' : 'var(--text-muted)'} />
                            {item.badge > 0 && (
                                <span style={{
                                    position: 'absolute',
                                    top: '-4px',
                                    right: '-6px',
                                    backgroundColor: 'var(--danger)',
                                    color: 'white',
                                    fontSize: '0.625rem',
                                    fontWeight: '800',
                                    padding: '2px 5px',
                                    borderRadius: '10px',
                                    minWidth: '16px',
                                    textAlign: 'center',
                                    border: '2px solid var(--bg-secondary)'
                                }}>
                                    {item.badge}
                                </span>
                            )}
                        </div>
                        <span>{item.label}</span>
                    </Link>
                )
            })}

            <button
                onClick={onMenuClick}
                className="bottom-nav-item"
                style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
            >
                <Icons.Menu size={24} color="var(--text-muted)" />
                <span>Menu</span>
            </button>
        </nav>
    )
}
