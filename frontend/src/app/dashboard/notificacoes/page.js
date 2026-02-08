'use client'

import { useEffect, useState } from 'react'
import api from '@/lib/api'

export default function NotificacoesPage() {
    const [notificacoes, setNotificacoes] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadNotificacoes()
    }, [])

    const loadNotificacoes = async () => {
        try {
            const response = await api.get('/api/notificacoes')
            setNotificacoes(response.data)
        } catch (error) {
            alert('Erro ao carregar notificações')
        } finally {
            setLoading(false)
        }
    }

    const getStatusBadge = (status) => {
        const badges = {
            enviado: { class: 'badge-success', label: '✓ Enviado' },
            erro: { class: 'badge-danger', label: '✗ Erro' },
            pendente: { class: 'badge-warning', label: '⏳ Pendente' }
        }
        return badges[status] || badges.pendente
    }

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
                <div className="spinner" style={{ width: '3rem', height: '3rem' }} />
            </div>
        )
    }

    return (
        <div>
            <h1 style={{ fontSize: '1.875rem', fontWeight: '700', marginBottom: '1.5rem' }}>
                Notificações
            </h1>

            <div className="card">
                {notificacoes.length === 0 ? (
                    <p className="text-muted">Nenhuma notificação registrada</p>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Data/Hora</th>
                                    <th>Destinatário</th>
                                    <th>Tipo</th>
                                    <th>Mensagem</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {notificacoes.map((notif) => {
                                    const badge = getStatusBadge(notif.status)
                                    return (
                                        <tr key={notif.id}>
                                            <td style={{ fontSize: '0.875rem' }}>
                                                {new Date(notif.created_at).toLocaleString('pt-BR')}
                                            </td>
                                            <td>{notif.telefone_destino}</td>
                                            <td>
                                                <span className="badge badge-info">
                                                    {notif.tipo}
                                                </span>
                                            </td>
                                            <td style={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {notif.mensagem}
                                            </td>
                                            <td>
                                                <span className={`badge ${badge.class}`}>
                                                    {badge.label}
                                                </span>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    )
}
