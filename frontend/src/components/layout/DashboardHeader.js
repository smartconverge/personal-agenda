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
    handleLogout
}) {
    // Match seguro — suporta rotas dinâmicas como /alunos/123
    const safePathname = pathname || '';
    const fallbackMeta = { title: 'Personal Agenda', subtitle: '' };
    const metaEntry = Object.entries(dashboardMeta)
        .sort((a, b) => b[0].length - a[0].length)
        .find(([route]) => safePathname.startsWith(route));
    const meta = metaEntry ? metaEntry[1] : fallbackMeta;
    const displayTitle = meta.title;
    const displaySubtitle = meta.getSubtitle ? meta.getSubtitle(professor) : meta.subtitle;

    return (
        <header className={styles.header}>
            <div className="flex items-center gap-4">
                <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className={`${styles.btnGhost} ${styles.desktopOnly}`}
                >
                    <Icons.SidebarToggle size={20} />
                </button>

                {/* Vertical Separator */}
                <div className={`${styles.desktopOnly} ${styles.separator}`} />

                <div className={styles.titleContainer}>
                    <h1 className={styles.title}>
                        {displayTitle}
                    </h1>
                    {displaySubtitle && (
                        <p className={styles.subtitle}>
                            {displaySubtitle}
                        </p>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-5">
                <Link
                    href="/dashboard/notificacoes"
                    onClick={() => {
                        localStorage.setItem('last_notifications_view', Date.now().toString())
                        setNotificacoesCount(0)
                    }}
                    className={styles.btnGhost}
                    style={{ position: 'relative' }}
                >
                    <Icons.Notifications size={22} />
                    {notificacoesCount > 0 && (
                        <span className={styles.notifBadge}>
                            {notificacoesCount > 10 ? '10+' : notificacoesCount}
                        </span>
                    )}
                </Link>

                {/* Profile Dropdown */}
                <div className={styles.dropdownContainer}>
                    <button
                        onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                        className={`avatar avatar--sm ${profileDropdownOpen ? 'scale-95' : 'hover:scale-105'} transition-all duration-200`}
                        style={{ border: '1px solid var(--border-color)', cursor: 'pointer' }}
                    >
                        {professor.foto_url ? (
                            <img src={professor.foto_url} alt={professor.nome} />
                        ) : (
                            professor.nome?.charAt(0) || 'P'
                        )}
                    </button>

                    {/* Dropdown Menu */}
                    {profileDropdownOpen && (
                        <>
                            {/* Backdrop para fechar ao clicar fora */}
                            <div
                                onClick={() => setProfileDropdownOpen(false)}
                                className={styles.backdrop}
                            />

                            <div className={styles.dropdownMenu}>
                                {/* User Info */}
                                <div className={styles.userInfo}>
                                    <div className="avatar avatar--sm" style={{ border: '1px solid var(--border-color)' }}>
                                        {professor.foto_url ? (
                                            <img src={professor.foto_url} alt={professor.nome} />
                                        ) : (
                                            professor.nome?.charAt(0) || 'P'
                                        )}
                                    </div>
                                    <div className={styles.userTexts}>
                                        <p className={styles.userName}>
                                            {professor.nome}
                                        </p>
                                        <p className={styles.userEmail}>
                                            {professor.email}
                                        </p>
                                    </div>
                                </div>

                                {/* Menu Items */}
                                <div className={styles.menuBody}>
                                    <Link
                                        href="/dashboard/perfil"
                                        onClick={() => setProfileDropdownOpen(false)}
                                        className={styles.dropdownItem}
                                    >
                                        <Icons.User size={18} />
                                        <span>Meu Perfil</span>
                                    </Link>
                                </div>

                                {/* Logout */}
                                <div className={styles.menuFooter}>
                                    <button
                                        onClick={() => {
                                            setProfileDropdownOpen(false)
                                            handleLogout()
                                        }}
                                        className={`${styles.dropdownItem} ${styles.dropdownItemDanger}`}
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
    )
}
