'use client'

import Link from 'next/link'
import { Icons } from '@/components/Icons'
import { dashboardMeta } from '@/config/dashboard'

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
        <header className="glass-effect flex-between px-6 py-4 sticky top-0 z-30 min-h-[4.5rem]">
            <div className="flex items-center gap-4">
                <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="btn-ghost-nav desktop-only p-2"
                >
                    <Icons.SidebarToggle size={20} />
                </button>

                {/* Vertical Separator */}
                <div className="desktop-only w-px h-6 bg-border mx-2" />

                <div className="header-title-container">
                    <h1 className="header-title">
                        {displayTitle}
                    </h1>
                    {displaySubtitle && (
                        <p className="header-subtitle truncate max-w-[300px] md:max-w-none">
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
                    className="btn-ghost-nav p-2 relative text-decoration-none"
                >
                    <Icons.Notifications size={22} className="text-secondary" />
                    {notificacoesCount > 0 && (
                        <span className="absolute top-1 right-1 bg-red-500 text-white text-[0.625rem] font-extrabold px-1.5 py-0.5 rounded-full border-2 border-secondary min-w-[18px] flex items-center justify-center leading-none">
                            {notificacoesCount > 10 ? '10+' : notificacoesCount}
                        </span>
                    )}
                </Link>

                {/* Profile Dropdown */}
                <div className="relative">
                    <button
                        onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                        className={`avatar avatar-sm bg-gradient-to-br from-primary to-primary-light border border-border cursor-pointer transition-all duration-200 ${profileDropdownOpen ? 'scale-95' : 'hover:scale-105 hover:-translate-y-px hover:shadow'}`}
                    >
                        {professor.foto_url ? (
                            <img src={professor.foto_url} alt={professor.nome} className="w-full h-full rounded-full object-cover" />
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
                                className="backdrop-invisible"
                            />

                            <div className="dropdown-menu">
                                {/* User Info */}
                                <div className="p-4 flex items-center gap-3 border-b border-border">
                                    <div className="avatar avatar-sm bg-gradient-to-br from-primary to-primary-light border border-border">
                                        {professor.foto_url ? (
                                            <img src={professor.foto_url} alt={professor.nome} className="w-full h-full rounded-full object-cover" />
                                        ) : (
                                            professor.nome?.charAt(0) || 'P'
                                        )}
                                    </div>
                                    <div className="flex flex-col flex-1 min-w-0">
                                        <p className="text-sm font-bold text-primary truncate m-0">
                                            {professor.nome}
                                        </p>
                                        <p className="text-xs text-muted truncate m-0 mt-1">
                                            {professor.email}
                                        </p>
                                    </div>
                                </div>

                                {/* Menu Items */}
                                <div className="p-2">
                                    <Link
                                        href="/dashboard/perfil"
                                        onClick={() => setProfileDropdownOpen(false)}
                                        className="dropdown-item"
                                    >
                                        <Icons.User size={18} />
                                        <span>Meu Perfil</span>
                                    </Link>
                                </div>

                                {/* Logout */}
                                <div className="p-2 border-t border-border">
                                    <button
                                        onClick={() => {
                                            setProfileDropdownOpen(false)
                                            handleLogout()
                                        }}
                                        className="dropdown-item dropdown-item-danger w-full text-left"
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
