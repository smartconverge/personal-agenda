'use client'

import { useEffect, useState } from 'react'
import api from '@/lib/api'
import { Icons } from '@/components/Icons'
import Pagination from '@/components/Pagination'

export default function NotificacoesPage() {
    const [notificacoes, setNotificacoes] = useState([])
    const [loading, setLoading] = useState(true)

    // Pagination Params
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [totalItems, setTotalItems] = useState(0)
    const itemsPerPage = 20

    useEffect(() => {
        loadNotificacoes()
    }, [page])

    const loadNotificacoes = async () => {
        setLoading(true)
        try {
            const response = await api.get('/notificacoes', {
                params: {
                    page,
                    limit: itemsPerPage
                }
            })
            if (response.data.success) {
                setNotificacoes(response.data.data || [])
                setTotalPages(response.data.meta.totalPages)
                setTotalItems(response.data.meta.total)
            }
        } catch (error) {
            console.error('Erro ao carregar notificações:', error)
        } finally {
            setLoading(false)
        }
    }

    const getNotificationStyle = (status) => {
        switch (status) {
            case 'enviado':
                return {
                    icon: Icons.CheckCircle,
                    color: 'var(--success)',
                    bg: 'hsl(155, 72%, 32%, 0.1)',
                    statusLabel: 'Enviado',
                    badgeClass: 'badge-success'
                }
            case 'erro':
                return {
                    icon: Icons.Error,
                    color: 'var(--danger)',
                    bg: 'hsl(0, 72%, 55%, 0.1)',
                    statusLabel: 'Erro',
                    badgeClass: 'badge-danger'
                }
            case 'pendente':
                return {
                    icon: Icons.Alert,
                    color: 'var(--warning)',
                    bg: 'hsl(40, 96%, 50%, 0.1)',
                    statusLabel: 'Pendente',
                    badgeClass: 'badge-warning'
                }
            default:
                return {
                    icon: Icons.Info,
                    color: 'var(--info)',
                    bg: 'hsl(215, 85%, 55%, 0.1)',
                    statusLabel: status.toUpperCase(),
                    badgeClass: 'badge-info'
                }
        }
    }

    if (loading && notificacoes.length === 0) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
                <div className="spinner" style={{ width: '3rem', height: '3rem' }} />
            </div>
        )
    }

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <div className="card-premium" style={{ padding: '0', overflow: 'hidden', background: 'var(--bg-secondary)' }}>
                <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end' }}>
                    <span className="badge badge-secondary">
                        {totalItems} total
                    </span>
                </div>

                {notificacoes.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                        <Icons.Notifications size={48} color="var(--text-muted)" style={{ opacity: 0.3, marginBottom: '1rem' }} />
                        <p style={{ color: 'var(--text-muted)', fontWeight: '500' }}>Nenhuma notificação registrada</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        {notificacoes.map((notif, index) => {
                            const style = getNotificationStyle(notif.status)
                            const IconComponent = style.icon

                            return (
                                <div
                                    key={notif.id}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'flex-start',
                                        gap: '1.25rem',
                                        padding: '1.25rem 1.5rem',
                                        borderBottom: index === notificacoes.length - 1 ? 'none' : '1px solid var(--border)',
                                        transition: 'background-color 0.2s',
                                        cursor: 'default'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-primary)'}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                >
                                    <div style={{
                                        width: '2.5rem',
                                        height: '2.5rem',
                                        borderRadius: '50%',
                                        backgroundColor: style.bg,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        flexShrink: 0
                                    }}>
                                        <IconComponent size={20} color={style.color} />
                                    </div>

                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem', gap: '1rem' }}>
                                            <h3 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                                                {notif.tipo.charAt(0).toUpperCase() + notif.tipo.slice(1)}
                                            </h3>
                                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                                                {new Date(notif.created_at).toLocaleString('pt-BR', {
                                                    day: '2-digit',
                                                    month: '2-digit',
                                                    year: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </span>
                                        </div>

                                        <p style={{
                                            fontSize: '0.875rem',
                                            color: 'var(--text-secondary)',
                                            marginBottom: '0.75rem',
                                            lineHeight: '1.5'
                                        }}>
                                            {notif.mensagem}
                                        </p>

                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <Icons.Students size={14} color="var(--text-muted)" />
                                                <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: '500' }}>
                                                    {notif.telefone_destino}
                                                </span>
                                            </div>
                                            <span className={`badge ${style.badgeClass}`} style={{ fontSize: '0.625rem' }}>
                                                {style.statusLabel}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>

            <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={(newPage) => setPage(newPage)}
                totalItems={totalItems}
                itemsPerPage={itemsPerPage}
            />
        </div>
    )
}
