'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Icons } from './Icons'
import styles from './BottomNavigation.module.css'

const NAV_ITEMS = [
    { href: '/dashboard', label: 'Início', icon: 'Dashboard' },
    { href: '/dashboard/agenda', label: 'Agenda', icon: 'Calendar' },
    { href: '/dashboard/alunos', label: 'Alunos', icon: 'Students' },
    { href: '/dashboard/notificacoes', label: 'Avisos', icon: 'Notifications' },
]

export default function BottomNavigation({ notificacoesCount = 0, onMenuClick }) {
    const pathname = usePathname()

    return (
        <nav className={styles.nav} aria-label="Navegação mobile">
            <div className={styles.navInner}>
                {NAV_ITEMS.map((item) => {
                    const IconComponent = Icons[item.icon]
                    const isActive = pathname === item.href
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`${styles.item} ${isActive ? styles.active : ''}`}
                        >
                            <div className={styles.iconWrapper}>
                                <IconComponent size={22} />
                                {item.icon === 'Notifications' && notificacoesCount > 0 && (
                                    <span className={styles.badge}>{notificacoesCount}</span>
                                )}
                            </div>
                            <span>{item.label}</span>
                        </Link>
                    )
                })}

                <button
                    onClick={onMenuClick}
                    className={styles.item}
                    aria-label="Abrir menu"
                >
                    <div className={styles.iconWrapper}>
                        <Icons.Menu size={22} />
                    </div>
                    <span>Menu</span>
                </button>
            </div>
        </nav>
    )
}
