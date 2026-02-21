'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Icons } from '@/components/Icons'
import styles from './Sidebar.module.css'

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
        <aside className={`${styles.sidebar} ${sidebarOpen ? styles.open : styles.collapsed}`}>

            {/* Logo/Header */}
            <div className={styles.header}>
                <div className={styles.logoBox}>
                    <Icons.Fitness size={20} style={{ color: 'white' }} />
                </div>
                {sidebarOpen && (
                    <div>
                        <h2 className={styles.brandTitle}>
                            Personal Agenda
                        </h2>
                        <p className={styles.brandSub}>
                            TRAINER MANAGEMENT
                        </p>
                    </div>
                )}
            </div>

            {/* Main Navigation - Scrollable Area */}
            <nav className={styles.nav}>
                {/* Section: MENU */}
                {sidebarOpen && (
                    <p className={styles.sectionTitle}>Menu</p>
                )}
                {menuItems.map((item) => {
                    const IconComponent = Icons[item.icon]
                    const isActive = pathname === item.href
                    const isHighlighted = isActive || hoveredPath === item.href

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            onMouseEnter={() => setHoveredPath(item.href)}
                            onMouseLeave={() => setHoveredPath(null)}
                            className={`${styles.link} ${isHighlighted ? styles.linkActive : ''}`}
                        >
                            <span className={styles.iconWrap}>
                                <IconComponent size={20} />
                            </span>
                            {sidebarOpen && (
                                <div className={styles.contentWrapper}>
                                    <span className={styles.label}>{item.label}</span>
                                    {item.label === 'WhatsApp' && (
                                        <span className={`${styles.badge} ${whatsappConnected ? styles.badgeOnline : styles.badgeOffline}`}>
                                            {whatsappConnected ? 'CONECTADO' : 'OFFLINE'}
                                        </span>
                                    )}
                                </div>
                            )}
                        </Link>
                    )
                })}

                {/* Section: PLANOS */}
                {sidebarOpen && <div className={styles.divider} />}
                {sidebarOpen && (
                    <p className={styles.sectionTitle}>Planos</p>
                )}
                {planoItems.map((item) => {
                    const IconComponent = Icons[item.icon]
                    const isActive = pathname === item.href
                    const isHighlighted = isActive || hoveredPath === item.href

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            onMouseEnter={() => setHoveredPath(item.href)}
                            onMouseLeave={() => setHoveredPath(null)}
                            className={`${styles.link} ${isHighlighted ? styles.linkActive : ''}`}
                        >
                            <span className={styles.iconWrap}>
                                <IconComponent size={20} />
                            </span>
                            {sidebarOpen && (
                                <div className={styles.contentWrapper}>
                                    <span className={styles.label}>{item.label}</span>
                                    {item.label === 'Meus Planos' && professor?.plano && (
                                        <span className={`${styles.badge} ${professor.plano === 'PREMIUM' ? styles.badgePremium : styles.badgeFree}`}>
                                            {professor.plano.toUpperCase()}
                                        </span>
                                    )}
                                </div>
                            )}
                        </Link>
                    )
                })}

                {/* Section: SISTEMA */}
                {sidebarOpen && <div className={styles.divider} />}
                {sidebarOpen && (
                    <p className={styles.sectionTitle}>Sistema</p>
                )}
                {sistemaItems.map((item) => {
                    const IconComponent = Icons[item.icon]
                    const isActive = pathname === item.href
                    const isHighlighted = isActive || hoveredPath === item.href

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            onMouseEnter={() => setHoveredPath(item.href)}
                            onMouseLeave={() => setHoveredPath(null)}
                            className={`${styles.sistemaLink} ${isHighlighted ? styles.sistemaLinkActive : ''}`}
                        >
                            <span className={styles.iconWrap}>
                                <IconComponent size={20} />
                            </span>
                            {sidebarOpen && <span>{item.label}</span>}
                        </Link>
                    )
                })}
            </nav>

            {/* User Profile + Logout - Fixed at Bottom */}
            <div className={styles.footer}>
                {sidebarOpen && (
                    <Link
                        href="/dashboard/perfil"
                        className={`${styles.profileCard} ${pathname === '/dashboard/perfil' ? styles.profileCardActive : ''}`}
                    >
                        <div className={styles.profileAvatar}>
                            {professor.foto_url ? (
                                <img src={professor.foto_url} alt={professor.nome} />
                            ) : (
                                professor.nome.charAt(0)
                            )}
                        </div>
                        <div className={styles.profileInfo}>
                            <p className={styles.profileName}>
                                {professor.nome}
                            </p>
                            <p className={styles.profileRole}>
                                Personal Trainer
                            </p>
                        </div>
                        <Icons.ChevronRight size={14} style={{ color: 'rgba(255,255,255,0.3)' }} />
                    </Link>
                )}
                <button
                    onClick={handleLogout}
                    className={styles.logoutBtn}
                >
                    <Icons.Logout size={16} />
                    {sidebarOpen && <span>Sair da Conta</span>}
                </button>
            </div>
        </aside>
    )
}
