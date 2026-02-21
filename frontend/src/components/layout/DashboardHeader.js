'use client'

import Link from 'next/link'
import { Icons } from '@/components/Icons'
import { dashboardMeta } from '@/config/dashboard'
import styles from './DashboardHeader.module.css'

export default function DashboardHeader({
    pathname,
    professor,
    notificacoesCount,
    setNotificacoesCount,
    sidebarOpen,
    setSidebarOpen,
    profileDropdownOpen,
    setProfileDropdownOpen,
    handleLogout,
}) {
    const safePathname = pathname || ''
    const fallback = { title: 'Personal Agenda', subtitle: '' }
    const metaEntry = Object.entries(dashboardMeta)
        .sort((a, b) => b[0].length - a[0].length)
        .find(([route]) => safePathname.startsWith(route))
    const meta = metaEntry ? metaEntry[1] : fallback
    const title = meta.title
    const subtitle = meta.getSubtitle ? meta.getSubtitle(professor) : meta.subtitle

    return (
        <header className={styles.header}>
            <div className={styles.left}>
                <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className={styles.toggleBtn}
                    aria-label="Toggle sidebar"
                >
                    <Icons.Menu size={20} />
                </button>

                <div className={styles.separator} />

                <div className={styles.titleBlock}>
                    <h1>{title}</h1>
                    {subtitle && <p>{subtitle}</p>}
                </div>
            </div>

            <div className={styles.right}>
                {/* Notificações */}
                <Link
                    href="/dashboard/notificacoes"
                    className={styles.notifBtn}
                    onClick={() => {
                        localStorage.setItem('last_notifications_view', Date.now().toString())
                        setNotificacoesCount(0)
                    }}
                    aria-label="Notificações"
                >
                    <Icons.Notifications size={22} />
                    {notificacoesCount > 0 && (
                        <span className={styles.notifBadge}>
                            {notificacoesCount > 10 ? '10+' : notificacoesCount}
                        </span>
                    )}
                </Link>

                {/* Perfil */}
                <div className={styles.dropdownWrapper}>
                    <button
                        onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                        className={`avatar avatar--sm ${styles.profileBtn}`}
                        aria-label="Menu do perfil"
                        aria-expanded={profileDropdownOpen}
                    >
                        {professor?.foto_url
                            ? <img src={professor.foto_url} alt={professor.nome} />
                            : professor?.nome?.charAt(0) || 'P'
                        }
                    </button>

                    {profileDropdownOpen && (
                        <>
                            <div
                                className={styles.dropdownBackdrop}
                                onClick={() => setProfileDropdownOpen(false)}
                            />
                            <div className={styles.dropdown}>
                                <div className={styles.dropdownUser}>
                                    <div className="avatar avatar--sm">
                                        {professor?.foto_url
                                            ? <img src={professor.foto_url} alt={professor.nome} />
                                            : professor?.nome?.charAt(0) || 'P'
                                        }
                                    </div>
                                    <div className={styles.dropdownUserInfo}>
                                        <p>{professor?.nome}</p>
                                        <p>{professor?.email}</p>
                                    </div>
                                </div>

                                <div className={styles.dropdownBody}>
                                    <Link
                                        href="/dashboard/perfil"
                                        onClick={() => setProfileDropdownOpen(false)}
                                        className={styles.dropdownItem}
                                    >
                                        <Icons.User size={16} />
                                        Meu Perfil
                                    </Link>
                                </div>

                                <div className={styles.dropdownFooter}>
                                    <button
                                        onClick={() => {
                                            setProfileDropdownOpen(false)
                                            handleLogout()
                                        }}
                                        className={`${styles.dropdownItem} ${styles['dropdownItem--danger']}`}
                                    >
                                        <Icons.Logout size={16} />
                                        Sair
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </header>
    )
}
