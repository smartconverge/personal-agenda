import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Icons } from './Icons'
import styles from './BottomNavigation.module.css'

export default function BottomNavigation({ notificacoesCount = 0, onMenuClick }) {
    const pathname = usePathname()

    const navItems = [
        { href: '/dashboard', label: 'Início', icon: 'Dashboard' },
        { href: '/dashboard/agenda', label: 'Agenda', icon: 'Calendar' },
        { href: '/dashboard/alunos', label: 'Alunos', icon: 'Students' },
        { href: '/dashboard/notificacoes', label: 'Avisos', icon: 'Notifications', badge: notificacoesCount },
    ]

    return (
        <nav className={styles.bottomNav}>
            {navItems.map((item) => {
                const IconComponent = Icons[item.icon]
                const isActive = pathname === item.href

                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={`${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
                    >
                        <div className={styles.iconWrapper}>
                            <IconComponent size={24} color={isActive ? 'var(--color-primary)' : 'var(--text-muted)'} />
                            {item.badge > 0 && (
                                <span className={styles.badge}>
                                    {item.badge}
                                </span>
                            )}
                        </div>
                        <span className={styles.label}>{item.label}</span>
                    </Link>
                )
            })}

            <button
                onClick={onMenuClick}
                className={styles.navItem}
            >
                <Icons.Menu size={24} color="var(--text-muted)" />
                <span className={styles.label}>Menu</span>
            </button>
        </nav>
    )
}
