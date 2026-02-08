'use client'

import { useEffect, useState } from 'react'
import api from '@/lib/api'

export default function DashboardPage() {
    const [stats, setStats] = useState(null)
    const [loading, setLoading] = useState(true)
    const [sessoes, setSessoes] = useState([])

    useEffect(() => {
        loadDashboard()
    }, [])

    const loadDashboard = async () => {
        try {
            // Carregar estatísticas básicas
            const [alunosRes, servicosRes, contratosRes, sessoesRes] = await Promise.all([
                api.get('/api/alunos'),
                api.get('/api/servicos'),
                api.get('/api/contratos'),
                api.get('/api/sessoes')
            ])

            const hoje = new Date().toISOString().split('T')[0]
            const sessoesHoje = sessoesRes.data.filter(s =>
                s.data_hora_inicio.startsWith(hoje) && s.status === 'agendada'
            )

            setStats({
                totalAlunos: alunosRes.data.length,
                totalServicos: servicosRes.data.length,
                contratosAtivos: contratosRes.data.filter(c => c.status === 'ativo').length,
                sessoesHoje: sessoesHoje.length
            })

            setSessoes(sessoesHoje.slice(0, 5))
        } catch (error) {
            console.error('Erro ao carregar dashboard:', error)
        } finally {
            setLoading(false)
        }
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
                Dashboard
            </h1>

            {/* Stats Cards */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '1rem',
                marginBottom: '2rem'
            }}>
                <div className="card">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                            <p className="text-muted" style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                                Total de Alunos
                            </p>
                            <p style={{ fontSize: '2rem', fontWeight: '700' }}>
                                {stats?.totalAlunos || 0}
                            </p>
                        </div>
                        <div style={{ fontSize: '2.5rem' }}>👥</div>
                    </div>
                </div>

                <div className="card">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                            <p className="text-muted" style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                                Serviços Ativos
                            </p>
                            <p style={{ fontSize: '2rem', fontWeight: '700' }}>
                                {stats?.totalServicos || 0}
                            </p>
                        </div>
                        <div style={{ fontSize: '2.5rem' }}>💪</div>
                    </div>
                </div>

                <div className="card">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                            <p className="text-muted" style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                                Contratos Ativos
                            </p>
                            <p style={{ fontSize: '2rem', fontWeight: '700' }}>
                                {stats?.contratosAtivos || 0}
                            </p>
                        </div>
                        <div style={{ fontSize: '2.5rem' }}>📝</div>
                    </div>
                </div>

                <div className="card">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                            <p className="text-muted" style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                                Sessões Hoje
                            </p>
                            <p style={{ fontSize: '2rem', fontWeight: '700' }}>
                                {stats?.sessoesHoje || 0}
                            </p>
                        </div>
                        <div style={{ fontSize: '2.5rem' }}>📅</div>
                    </div>
                </div>
            </div>

            {/* Próximas Sessões */}
            <div className="card">
                <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>
                    Próximas Sessões Hoje
                </h2>

                {sessoes.length === 0 ? (
                    <p className="text-muted">Nenhuma sessão agendada para hoje</p>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Horário</th>
                                    <th>Aluno</th>
                                    <th>Serviço</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sessoes.map((sessao) => (
                                    <tr key={sessao.id}>
                                        <td>
                                            {new Date(sessao.data_hora_inicio).toLocaleTimeString('pt-BR', {
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </td>
                                        <td>{sessao.aluno?.nome || 'N/A'}</td>
                                        <td>{sessao.servico?.nome || 'N/A'}</td>
                                        <td>
                                            <span className="badge badge-info">
                                                {sessao.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    )
}
