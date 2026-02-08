'use client'

import { useEffect, useState } from 'react'
import api from '@/lib/api'

export default function AgendaPage() {
    const [sessoes, setSessoes] = useState([])
    const [loading, setLoading] = useState(true)
    const [filtroData, setFiltroData] = useState(new Date().toISOString().split('T')[0])

    useEffect(() => {
        loadSessoes()
    }, [filtroData])

    const loadSessoes = async () => {
        try {
            const response = await api.get('/api/sessoes')
            const filtered = response.data.filter(s =>
                s.data_hora_inicio.startsWith(filtroData)
            )
            setSessoes(filtered)
        } catch (error) {
            alert('Erro ao carregar sessões')
        } finally {
            setLoading(false)
        }
    }

    const getStatusBadge = (status) => {
        const badges = {
            agendada: { class: 'badge-info', label: 'Agendada' },
            concluida: { class: 'badge-success', label: 'Concluída' },
            cancelada: { class: 'badge-danger', label: 'Cancelada' }
        }
        return badges[status] || badges.agendada
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
            <div style={{ marginBottom: '1.5rem' }}>
                <h1 style={{ fontSize: '1.875rem', fontWeight: '700', marginBottom: '1rem' }}>
                    Agenda
                </h1>

                <div style={{ maxWidth: '300px' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500' }}>
                        Filtrar por data
                    </label>
                    <input
                        type="date"
                        className="input"
                        value={filtroData}
                        onChange={(e) => setFiltroData(e.target.value)}
                    />
                </div>
            </div>

            <div className="card">
                {sessoes.length === 0 ? (
                    <p className="text-muted">Nenhuma sessão agendada para esta data</p>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Horário</th>
                                    <th>Aluno</th>
                                    <th>Serviço</th>
                                    <th>Duração</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sessoes.map((sessao) => {
                                    const badge = getStatusBadge(sessao.status)
                                    const inicio = new Date(sessao.data_hora_inicio)
                                    const fim = new Date(sessao.data_hora_fim)

                                    return (
                                        <tr key={sessao.id}>
                                            <td style={{ fontWeight: '500' }}>
                                                {inicio.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                                {' - '}
                                                {fim.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                            </td>
                                            <td>{sessao.aluno?.nome || 'N/A'}</td>
                                            <td>{sessao.servico?.nome || 'N/A'}</td>
                                            <td>{sessao.servico?.duracao_minutos || 0} min</td>
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
