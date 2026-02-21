'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Icons } from '@/components/Icons'
import styles from './Sidebar.module.css'
import { dashboardRoutes, hasPermission } from '@/config/dashboard'

export default function Sidebar({
    sidebarOpen,
    pathname,
    professor,
    whatsappConnected,
    handleLogout,
}) {
    const [hoveredPath, setHoveredPath] = useState(null)

    // Renderiza um item de link de forma padronizada
    const renderLink = (item, isSistema = false) => {
        const IconComponent = Icons[item.icon]
        const isActive = pathname === item.href
        const isHighlighted = isActive || hoveredPath === item.href

        // Validação de permissão para exibir ou não o item
        if (!hasPermission(professor?.plano, item.permission)) return null;

        const linkClass = isSistema
            ? `${styles.sistemaLink} ${isHighlighted ? styles.sistemaLinkActive : ''}`
            : `${styles.link} ${isHighlighted ? styles.linkActive : ''}`;

        return (
            <Link
                key={item.href}
                href={item.href}
                onMouseEnter={() => setHoveredPath(item.href)}
                onMouseLeave={() => setHoveredPath(null)}
                className={linkClass}
            >
                <span className={styles.iconWrap}>
                    <IconComponent size={20} />
                </span>
                {sidebarOpen && !isSistema && (
                    <div className={styles.contentWrapper}>
                        <span className={styles.label}>{item.label}</span>
                        {item.label === 'WhatsApp' && (
                            <span className={`${styles.badge} ${whatsappConnected ? styles.badgeOnline : styles.badgeOffline}`}>
                                {whatsappConnected ? 'CONECTADO' : 'OFFLINE'}
                            </span>
                        )}
                        {item.label === 'Meus Planos' && professor?.plano && (
                            <span className={`${styles.badge} ${professor.plano === 'PREMIUM' ? styles.badgePremium : styles.badgeFree}`}>
                                {professor.plano.toUpperCase()}
                            </span>
                        )}
                    </div>
                )}
                {sidebarOpen && isSistema && <span>{item.label}</span>}
            </Link>
        )
    }

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
                {sidebarOpen && <p className={styles.sectionTitle}>Menu</p>}
                {dashboardRoutes.main.map(item => renderLink(item))}

                {/* Section: PLANOS */}
                {sidebarOpen && <div className={styles.divider} />}
                {sidebarOpen && <p className={styles.sectionTitle}>Planos</p>}
                {dashboardRoutes.planos.map(item => renderLink(item))}

                {/* Section: SISTEMA */}
                {sidebarOpen && <div className={styles.divider} />}
                {sidebarOpen && <p className={styles.sectionTitle}>Sistema</p>}
                {dashboardRoutes.sistema.map(item => renderLink(item, true))}
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
                                professor.nome?.charAt(0) || 'P'
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
