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
            const now = new Date()
            const startOfDay = new Date(new Date(now).setHours(0, 0, 0, 0)).toISOString()
            const endOfDay = new Date(new Date(now).setHours(23, 59, 59, 999)).toISOString()

            // Datas para métricas semanais
            const startLastWeek = new Date(now)
            startLastWeek.setDate(now.getDate() - 7)
            const endNextWeek = new Date(now)
            endNextWeek.setDate(now.getDate() + 7)

            // 1. Carrega dados básicos e métricas
            const results = await Promise.allSettled([
                api.get('/alunos'),
                api.get('/servicos'),
                api.get('/contratos'),
                api.get('/sessoes', { params: { data_inicio: startOfDay, data_fim: endOfDay, status: 'agendada' } }),
                api.get('/sessoes', { params: { data_inicio: startLastWeek.toISOString(), data_fim: now.toISOString(), status: 'concluida' } }),
                api.get('/sessoes', { params: { data_inicio: now.toISOString(), data_fim: endNextWeek.toISOString(), status: 'agendada' } }),
                api.get('/sessoes', { params: { status: 'concluida' } }) // Todas as concluídas para o acumulado
            ])

            const alunosRes = results[0].status === 'fulfilled' ? results[0].value : { data: { data: [] } }
            const servicosRes = results[1].status === 'fulfilled' ? results[1].value : { data: { data: [] } }
            const contratosRes = results[2].status === 'fulfilled' ? results[2].value : { data: { data: [] } }
            const sessoesHojeRes = results[3].status === 'fulfilled' ? results[3].value : { data: { data: [] } }
            const sessoesPassadasRes = results[4].status === 'fulfilled' ? results[4].value : { data: { data: [] } }
            const sessoesFuturasRes = results[5].status === 'fulfilled' ? results[5].value : { data: { data: [] } }
            const sessoesTotalRes = results[6].status === 'fulfilled' ? results[6].value : { data: { data: [] } }

            const contratosAtivosData = contratosRes.data?.data?.filter(c => c.status === 'ativo' && !c.deleted_at) || []
            const faturamentoTotal = contratosAtivosData.reduce((acc, curr) => acc + (parseFloat(curr.valor_mensal) || 0), 0)

            // Cálculo de horas acumuladas
            const sessoesConcluidas = sessoesTotalRes.data?.data || []
            const totalMinutos = sessoesConcluidas.reduce((acc, sessao) => acc + (sessao.servico?.duracao_minutos || 0), 0)

            setStats({
                totalAlunos: alunosRes.data?.data?.length || 0,
                totalServicos: servicosRes.data?.data?.length || 0,
                contratosAtivos: contratosAtivosData.length,
                faturamentoMensal: faturamentoTotal,
                sessoesHoje: sessoesHojeRes.data?.data?.length || 0,
                aulasEntreguesSemana: sessoesPassadasRes.data?.data?.length || 0,
                aulasAgendadasProxima: sessoesFuturasRes.data?.data?.length || 0,
                totalSessoesAcumuladas: sessoesConcluidas.length,
                totalMinutosTrabalhados: totalMinutos
            })

            setSessoes(sessoesHojeRes.data?.data?.slice(0, 5) || [])

        } catch (error) {
            console.error('Erro geral ao carregar dashboard:', error)
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
                <div className="card" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: 'white' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                            <p style={{ fontSize: '0.875rem', marginBottom: '0.5rem', opacity: 0.9 }}>
                                Faturamento Mensal
                            </p>
                            <p style={{ fontSize: '2rem', fontWeight: '800' }}>
                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(stats?.faturamentoMensal || 0)}
                            </p>
                        </div>
                        <div style={{ fontSize: '2.5rem', opacity: 0.8 }}>💰</div>
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

            {/* Weekly Performance Section */}
            <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1.25rem', marginTop: '1rem' }}>
                Performance Semanal (Personal)
            </h2>
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '1rem',
                marginBottom: '2rem'
            }}>
                <div className="card" style={{ borderLeft: '4px solid var(--success)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                            <p className="text-muted" style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                                Aulas Entregues (7 dias)
                            </p>
                            <p style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--success)' }}>
                                {stats?.aulasEntreguesSemana || 0}
                            </p>
                            <p style={{ fontSize: '0.75rem', color: '#666' }}>Semanas passadas</p>
                        </div>
                        <div style={{ fontSize: '2.5rem' }}>🏆</div>
                    </div>
                </div>

                <div className="card" style={{ borderLeft: '4px solid var(--primary)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                            <p className="text-muted" style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                                Agendadas (Próx. 7 dias)
                            </p>
                            <p style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--primary)' }}>
                                {stats?.aulasAgendadasProxima || 0}
                            </p>
                            <p style={{ fontSize: '0.75rem', color: '#666' }}>Próxima semana</p>
                        </div>
                        <div style={{ fontSize: '2.5rem' }}>📈</div>
                    </div>
                </div>

                <div className="card" style={{ borderLeft: '4px solid #6366f1' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                            <p className="text-muted" style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                                Trabalho Acumulado
                            </p>
                            <p style={{ fontSize: '2rem', fontWeight: '700', color: '#6366f1' }}>
                                {stats?.totalSessoesAcumuladas || 0} <span style={{ fontSize: '1rem', fontWeight: '400' }}>aulas</span>
                            </p>
                            <p style={{ fontSize: '0.875rem', fontWeight: '500', marginTop: '0.25rem' }}>
                                ⏱️ {Math.floor((stats?.totalMinutosTrabalhados || 0) / 60)}h {(stats?.totalMinutosTrabalhados || 0) % 60}min
                            </p>
                        </div>
                        <div style={{ fontSize: '2.5rem' }}>🔥</div>
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
