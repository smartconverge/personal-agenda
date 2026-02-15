'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import api from '@/lib/api'
import { Icons } from '@/components/Icons'

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

            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
            const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString()

            const results = await Promise.allSettled([
                api.get('/alunos'),
                api.get('/contratos'),
                api.get('/sessoes', { params: { data_inicio: startOfDay, data_fim: endOfDay, status: 'agendada' } }),
                api.get('/sessoes', { params: { data_inicio: startOfMonth, data_fim: endOfMonth, status: 'concluida' } }),
            ])

            const alunosRes = results[0].status === 'fulfilled' ? results[0].value : { data: { data: [] } }
            const contratosRes = results[1].status === 'fulfilled' ? results[1].value : { data: { data: [] } }
            const sessoesHojeRes = results[2].status === 'fulfilled' ? results[2].value : { data: { data: [] } }
            const sessoesMesRes = results[3].status === 'fulfilled' ? results[3].value : { data: { data: [] } }

            const alunosAtivos = alunosRes.data?.data?.filter(a => !a.deleted_at) || []
            const contratosAtivos = contratosRes.data?.data?.filter(c => c.status === 'ativo' && !c.deleted_at) || []
            const faturamentoTotal = contratosAtivos.reduce((acc, curr) => acc + (parseFloat(curr.valor_mensal) || 0), 0)
            const sessoesHoje = sessoesHojeRes.data?.data || []
            const sessoesMes = sessoesMesRes.data?.data || []

            let nomeProfessor = 'João'
            try {
                const professorData = localStorage.getItem('professor')
                if (professorData) {
                    nomeProfessor = JSON.parse(professorData).nome.split(' ')[0]
                }
            } catch (e) {
                console.error('Erro ao ler nome do professor:', e)
            }

            setStats({
                totalAlunos: alunosAtivos.length,
                sessoesHoje: sessoesHoje.length,
                faturamentoMensal: faturamentoTotal,
                contratosAtivos: contratosAtivos.length,
                sessoesMes: sessoesMes.length,
                nomeProfessor
            })

            setSessoes(sessoesHoje.slice(0, 5))

        } catch (error) {
            console.error('Erro ao carregar dashboard:', error)
        } finally {
            setLoading(false)
        }
    }

    const getStatusBadge = (status) => {
        const badges = {
            'agendada': 'badge-info',
            'confirmada': 'badge-success',
            'concluida': 'badge-success',
            'cancelada': 'badge-danger',
            'pendente': 'badge-warning'
        }
        return badges[status] || 'badge-secondary'
    }

    const getStatusText = (status) => {
        const texts = {
            'agendada': 'AGENDADA',
            'confirmada': 'CONFIRMADA',
            'concluida': 'CONCLUÍDA',
            'cancelada': 'CANCELADA',
            'pendente': 'PENDENTE'
        }
        return texts[status] || status.toUpperCase()
    }

    const getInitials = (name) => {
        if (!name) return '?'
        const parts = name.split(' ')
        if (parts.length >= 2) {
            return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
        }
        return name.substring(0, 2).toUpperCase()
    }

    const getAvatarColor = (index) => {
        const colors = [
            'linear-gradient(135deg, #10b981, #059669)',
            'linear-gradient(135deg, #3b82f6, #2563eb)',
            'linear-gradient(135deg, #8b5cf6, #7c3aed)',
            'linear-gradient(135deg, #f59e0b, #d97706)',
            'linear-gradient(135deg, #ef4444, #dc2626)',
        ]
        return colors[index % colors.length]
    }

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
                <div className="spinner" style={{ width: '3rem', height: '3rem' }} />
            </div>
        )
    }

    const statCards = [
        {
            label: 'Alunos Ativos',
            value: stats?.totalAlunos || 0,
            change: '+2 este mês',
            iconComponent: Icons.Students,
            color: 'var(--primary)'
        },
        {
            label: 'Sessões Hoje',
            value: stats?.sessoesHoje || 0,
            change: '3 confirmadas',
            iconComponent: Icons.Calendar,
            color: 'var(--primary)'
        },
        {
            label: 'Receita Mensal',
            value: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(stats?.faturamentoMensal || 0),
            change: '+12% vs mês anterior',
            iconComponent: Icons.Money,
            color: 'var(--primary)',
            highlight: true
        },
        {
            label: 'Contratos Ativos',
            value: stats?.contratosAtivos || 0,
            change: '2 a vencer em breve',
            iconComponent: Icons.Contracts,
            color: 'var(--primary)'
        },
    ]

    return (
        <div>

            {/* Stats Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                gap: '1.25rem',
                marginBottom: '2rem'
            }}>
                {statCards.map((stat, index) => {
                    const IconComponent = stat.iconComponent

                    return (
                        <div
                            key={index}
                            className={stat.highlight ? "card-highlight" : "card-premium"}
                            style={{
                                padding: '1.25rem',
                                position: 'relative',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '0.5rem',
                                border: stat.highlight ? 'none' : '1px solid var(--border)',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <p className="stat-label" style={{
                                    color: stat.highlight ? 'rgba(255, 255, 255, 0.85)' : 'var(--text-secondary)',
                                    fontSize: '0.8125rem',
                                    fontWeight: '600'
                                }}>
                                    {stat.label}
                                </p>
                                <div style={{
                                    width: '2.5rem',
                                    height: '2.5rem',
                                    borderRadius: '0.75rem',
                                    background: stat.highlight ? 'rgba(255, 255, 255, 0.2)' : 'hsla(155, 72%, 32%, 0.1)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: stat.highlight ? 'white' : 'var(--primary)'
                                }}>
                                    <IconComponent size={20} />
                                </div>
                            </div>

                            <p className="stat-value" style={{
                                fontSize: '1.75rem',
                                fontWeight: '800',
                                color: stat.highlight ? 'white' : 'var(--text-primary)',
                                margin: '0.25rem 0'
                            }}>
                                {stat.value}
                            </p>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                                <div style={{
                                    fontSize: '0.75rem',
                                    fontWeight: '600',
                                    color: stat.highlight ? 'white' : 'var(--success)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.25rem',
                                    padding: '0.125rem 0.5rem',
                                    backgroundColor: stat.highlight ? 'rgba(255, 255, 255, 0.2)' : 'hsla(155, 72%, 32%, 0.1)',
                                    borderRadius: '0.5rem'
                                }}>
                                    <Icons.TrendingUp size={12} />
                                    {stat.change}
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Today's Sessions */}
            <div style={{ marginTop: '2rem' }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '1.5rem'
                }}>
                    <div>
                        <h2 style={{
                            fontSize: '1.25rem',
                            fontWeight: '800',
                            marginBottom: '0.25rem',
                            color: 'var(--text-primary)'
                        }}>
                            Sessões de Hoje
                        </h2>
                        <p style={{
                            fontSize: '0.875rem',
                            color: 'var(--text-secondary)'
                        }}>
                            {sessoes.length} {sessoes.length === 1 ? 'sessão agendada' : 'sessões agendadas'} para hoje
                        </p>
                    </div>
                    <Link href="/dashboard/agenda" className="btn btn-primary">
                        <Icons.Calendar size={18} />
                        <span>Ver Agenda Completa</span>
                    </Link>
                </div>

                {sessoes.length === 0 ? (
                    <div className="card-flat" style={{
                        textAlign: 'center',
                        padding: '4rem 2rem',
                        color: 'var(--text-muted)'
                    }}>
                        <div style={{
                            width: '4rem',
                            height: '4rem',
                            backgroundColor: 'var(--bg-secondary)',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 1.5rem'
                        }}>
                            <Icons.Calendar size={32} color="var(--text-muted)" />
                        </div>
                        <h3 style={{ fontSize: '1.125rem', fontWeight: '700', marginBottom: '0.5rem' }}>
                            Dia livre!
                        </h3>
                        <p style={{ fontSize: '0.875rem' }}>
                            Nenhuma sessão agendada para hoje. Aproveite para descansar ou planejar.
                        </p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
                        {sessoes.map((sessao, index) => (
                            <div
                                key={sessao.id}
                                className="card-premium"
                                style={{
                                    padding: '1.5rem',
                                    position: 'relative',
                                    background: 'white',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'space-between',
                                    minHeight: '180px'
                                }}
                            >
                                {/* Header: Time & Status */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        background: 'var(--bg-primary)',
                                        padding: '0.375rem 0.75rem',
                                        borderRadius: '0.5rem'
                                    }}>
                                        <Icons.Clock size={14} color="var(--primary)" />
                                        <span style={{ fontWeight: '800', fontSize: '0.9375rem', color: 'var(--text-primary)' }}>
                                            {new Date(sessao.data_hora_inicio).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <span className={`badge ${getStatusBadge(sessao.status)}`}>
                                        {getStatusText(sessao.status)}
                                    </span>
                                </div>

                                {/* Student Info */}
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                                        <div
                                            className="avatar avatar-sm"
                                            style={{
                                                background: getAvatarColor(index),
                                                color: 'white',
                                                fontSize: '0.75rem',
                                                fontWeight: '800'
                                            }}
                                        >
                                            {getInitials(sessao.aluno?.nome)}
                                        </div>
                                        <h3 style={{
                                            fontWeight: '800',
                                            fontSize: '1.125rem',
                                            color: 'var(--text-primary)',
                                            margin: 0,
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis'
                                        }}>
                                            {sessao.aluno?.nome || 'Aluno não identificado'}
                                        </h3>
                                    </div>
                                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', paddingLeft: '3rem' }}>
                                        {sessao.servico?.nome || 'Serviço'} • {sessao.servico?.duracao_minutos || 0} min
                                    </p>
                                </div>

                                {/* Footer Action */}
                                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem', marginTop: 'auto' }}>
                                    <Link
                                        href={`/dashboard/alunos/${sessao.aluno_id}`}
                                        style={{
                                            fontSize: '0.8125rem',
                                            fontWeight: '600',
                                            color: 'var(--primary)',
                                            textDecoration: 'none',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem',
                                            width: 'fit-content'
                                        }}
                                    >
                                        Ver Detalhes <Icons.ArrowRight size={14} />
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
