'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Icons } from '@/components/Icons'

export default function Sidebar({
    sidebarOpen,
    pathname,
    menuItems,
    planoItems,
    sistemaItems,
    professor,
    whatsappConnected,
    handleLogout,
}) {
    const [hoveredPath, setHoveredPath] = useState(null)

    return (
        <aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : 'sidebar-collapsed'} flex flex-col fixed top-0 left-0 h-screen z-50 transition-all duration-300`}
            style={{ width: sidebarOpen ? '16rem' : '5rem' }}>

            {/* Logo/Header */}
            <div className="p-6 flex items-center gap-3 border-b border-white/5">
                <div className="flex-center w-10 h-10 rounded-lg bg-white/10 flex-shrink-0 border border-white/10">
                    <Icons.Fitness size={20} className="text-white" />
                </div>
                {sidebarOpen && (
                    <div className="flex flex-col">
                        <h2 className="text-sm font-extrabold text-white leading-tight tracking-tight">
                            Personal Agenda
                        </h2>
                        <p className="text-[0.65rem] font-bold mt-1 text-white/50 tracking-wider">
                            TRAINER MANAGEMENT
                        </p>
                    </div>
                )}
            </div>

            {/* Main Navigation - Scrollable Area */}
            <nav className="no-scrollbar flex-1 overflow-y-auto py-6 px-3">
                {/* Section: MENU */}
                {sidebarOpen && (
                    <p className="text-[0.65rem] font-extrabold text-white/40 mb-4 px-4 uppercase tracking-[0.1em]">
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
                            onMouseEnter={() => setHoveredPath(item.href)}
                            onMouseLeave={() => setHoveredPath(null)}
                            className={`sidebar-link-full ${isActive || hoveredPath === item.href ? 'bg-white/10 text-white font-bold' : 'text-white/60 font-medium'}`}
                        >
                            <span className="flex-shrink-0">
                                <IconComponent size={20} />
                            </span>
                            {sidebarOpen && (
                                <div className="sidebar-content-wrapper">
                                    <span className="sidebar-label">{item.label}</span>
                                    {item.label === 'WhatsApp' && (
                                        <span className={`text-xs font-black px-2 py-0.5 rounded-full border ml-auto animate-pulse ${whatsappConnected
                                            ? 'bg-success/20 text-success border-success/30'
                                            : 'bg-red-500/10 text-red-400 border-red-500/20'
                                            }`}>
                                            {whatsappConnected ? 'CONECTADO' : 'OFFLINE'}
                                        </span>
                                    )}
                                </div>
                            )}
                        </Link>
                    )
                })}

                {/* Section: PLANOS */}
                {sidebarOpen && (
                    <div className="my-6 mx-4 h-px bg-white/10" />
                )}
                {sidebarOpen && (
                    <p className="text-[0.65rem] font-extrabold text-white/40 mb-4 px-4 uppercase tracking-[0.1em]">
                        Planos
                    </p>
                )}
                {planoItems.map((item) => {
                    const IconComponent = Icons[item.icon]
                    const isActive = pathname === item.href

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            onMouseEnter={() => setHoveredPath(item.href)}
                            onMouseLeave={() => setHoveredPath(null)}
                            className={`sidebar-link-full ${isActive || hoveredPath === item.href ? 'bg-white/10 text-white font-bold' : 'text-white/60 font-medium'}`}
                        >
                            <span className="flex-shrink-0">
                                <IconComponent size={20} />
                            </span>
                            {sidebarOpen && (
                                <div className="sidebar-content-wrapper">
                                    <span className="sidebar-label">{item.label}</span>
                                    {item.label === 'Meus Planos' && professor?.plano && (
                                        <span className={`text-xs font-black px-2 py-0.5 rounded-full ml-auto ${professor.plano === 'PREMIUM' ? 'bg-amber-500 text-white shadow-lg' : 'bg-white/20 text-white border border-white/10'}`}>
                                            {professor.plano.toUpperCase()}
                                        </span>
                                    )}
                                </div>
                            )}
                        </Link>
                    )
                })}

                {/* Section: SISTEMA */}
                {sidebarOpen && (
                    <div className="my-6 mx-4 h-px bg-white/10" />
                )}
                {sidebarOpen && (
                    <p className="text-[0.65rem] font-extrabold text-white/40 mb-4 px-4 uppercase tracking-[0.1em]">
                        Sistema
                    </p>
                )}
                {sistemaItems.map((item) => {
                    const IconComponent = Icons[item.icon]
                    const isActive = pathname === item.href

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            onMouseEnter={() => setHoveredPath(item.href)}
                            onMouseLeave={() => setHoveredPath(null)}
                            className={`flex items-center gap-4 px-4 py-3 rounded-lg mb-1 transition-all duration-200 cursor-pointer text-sm ${isActive || hoveredPath === item.href ? 'bg-white/10 text-white font-bold' : 'text-white/60 font-medium'
                                }`}
                        >
                            <span className="flex-shrink-0">
                                <IconComponent size={20} />
                            </span>
                            {sidebarOpen && <span>{item.label}</span>}
                        </Link>
                    )
                })}
            </nav>

            {/* User Profile + Logout - Fixed at Bottom */}
            <div className="mt-auto p-4 flex flex-col border-t border-white/5 bg-black/20 flex-shrink-0">
                {sidebarOpen && (
                    <Link
                        href="/dashboard/perfil"
                        className={`flex items-center gap-3 p-4 mb-4 rounded-xl border transition-all duration-200 ${pathname === '/dashboard/perfil'
                            ? 'bg-primary-light border-white/10'
                            : 'bg-white/5 border-white/5 hover:bg-white/10'
                            }`}
                    >
                        <div className="avatar avatar-sm bg-gradient-to-br from-primary to-primary-light border border-white/10 flex-shrink-0">
                            {professor.foto_url ? (
                                <img src={professor.foto_url} alt={professor.nome} className="w-full h-full rounded-full object-cover" />
                            ) : (
                                professor.nome.charAt(0)
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-white truncate m-0">
                                {professor.nome}
                            </p>
                            <p className="text-[0.65rem] font-medium text-white/50 m-0 mt-0.5">
                                Personal Trainer
                            </p>
                        </div>
                        <Icons.ChevronRight size={14} className="text-white/30" />
                    </Link>
                )}
                <button
                    onClick={handleLogout}
                    className="w-full p-4 flex-center gap-3 font-bold text-[0.8rem] rounded-xl cursor-pointer transition-all duration-200 bg-red-500/10 text-red-400 border border-red-500/15 hover:bg-red-500/20 hover:border-red-500/25"
                >
                    <Icons.Logout size={16} />
                    {sidebarOpen && <span>Sair da Conta</span>}
                </button>
            </div>
        </aside>
    )
}
