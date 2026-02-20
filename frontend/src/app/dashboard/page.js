'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import api from '@/lib/api'
import { Icons } from '@/components/Icons'
import {
    getInitials,
    getAvatarColor,
    getStatusBadge,
    getStatusText,
    formatCurrency,
    formatTime
} from '@/utils/formatters'

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
            change: stats?.totalAlunos > 0 ? `${stats.totalAlunos} cadastrado${stats.totalAlunos > 1 ? 's' : ''}` : 'Nenhum cadastrado',
            iconComponent: Icons.Students,
            color: 'var(--primary)'
        },
        {
            label: 'Sessões Hoje',
            value: stats?.sessoesHoje || 0,
            change: stats?.sessoesHoje > 0 ? `${stats.sessoesHoje} agendada${stats.sessoesHoje > 1 ? 's' : ''}` : 'Dia livre',
            iconComponent: Icons.Calendar,
            color: 'var(--primary)'
        },
        {
            label: 'Receita Mensal',
            value: formatCurrency(stats?.faturamentoMensal || 0),
            change: stats?.contratosAtivos > 0 ? `${stats.contratosAtivos} contrato${stats.contratosAtivos > 1 ? 's' : ''} ativo${stats.contratosAtivos > 1 ? 's' : ''}` : 'Sem contratos ativos',
            iconComponent: Icons.Money,
            color: 'var(--primary)',
            highlight: true
        },
        {
            label: 'Contratos Ativos',
            value: stats?.contratosAtivos || 0,
            change: stats?.sessoesMes > 0 ? `${stats.sessoesMes} sessõ${stats.sessoesMes > 1 ? 'es' : ''} no mês` : 'Sem sessões este mês',
            iconComponent: Icons.Contracts,
            color: 'var(--primary)'
        },
    ]

    return (
        <div>

            {/* Stats Grid */}
            {/* Finebank Stats Grid */}
            <div className="dashboard-grid">
                {statCards.map((stat, index) => {
                    const IconComponent = stat.iconComponent

                    return (
                        <div
                            key={index}
                            className={stat.highlight ? "card-highlight finebank-card" : "finebank-card"}
                            style={{
                                border: stat.highlight ? 'none' : '1px solid var(--border)',
                                boxShadow: stat.highlight ? 'var(--shadow-lg)' : 'var(--shadow)'
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <p className="finebank-label" style={{
                                    color: stat.highlight ? 'rgba(255, 255, 255, 0.9)' : 'var(--text-secondary)'
                                }}>
                                    {stat.label}
                                </p>
                                <div className="finebank-icon-wrapper" style={{
                                    background: stat.highlight ? 'rgba(255, 255, 255, 0.25)' : 'var(--bg-tertiary)',
                                    color: stat.highlight ? 'white' : 'var(--primary)'
                                }}>
                                    <IconComponent size={24} />
                                </div>
                            </div>

                            <div>
                                <p className="finebank-value" style={{
                                    color: stat.highlight ? 'white' : 'var(--text-primary)'
                                }}>
                                    {stat.value}
                                </p>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <div style={{
                                        fontSize: '0.75rem',
                                        fontWeight: '700',
                                        color: stat.highlight ? 'white' : 'var(--success)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.25rem',
                                        padding: '0.25rem 0.75rem',
                                        backgroundColor: stat.highlight ? 'rgba(255, 255, 255, 0.2)' : 'rgba(119, 242, 161, 0.15)',
                                        borderRadius: '999px'
                                    }}>
                                        <Icons.TrendingUp size={14} />
                                        {stat.change}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Today's Sessions */}
            <div style={{ marginTop: '2rem' }}>
                <div className="dashboard-section-header">
                    <div>
                        <h2 className="dashboard-title">
                            Sessões de Hoje
                        </h2>
                        <p className="dashboard-subtitle">
                            {sessoes.length} {sessoes.length === 1 ? 'sessão agendada' : 'sessões agendadas'} para hoje
                        </p>
                    </div>
                    <Link href="/dashboard/agenda" className="btn btn-primary">
                        <Icons.Calendar size={18} />
                        <span>Ver Agenda Completa</span>
                    </Link>
                </div>

                {sessoes.length === 0 ? (
                    <div className="card-flat empty-state-card">
                        <div className="empty-state-icon-wrapper">
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
                    <div className="session-card-grid">
                        {sessoes.map((sessao, index) => (
                            <div
                                key={sessao.id}
                                className="card-premium"
                                style={{
                                    padding: '1.5rem',
                                    position: 'relative',
                                    background: 'var(--bg-secondary)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'space-between',
                                    minHeight: '180px',
                                    boxShadow: 'var(--shadow)'
                                }}
                            >
                                {/* Header: Time & Status */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                    <div className="session-time-badge">
                                        <Icons.Clock size={14} color="var(--primary)" />
                                        <span style={{ fontWeight: '800', fontSize: '0.9375rem', color: 'var(--text-primary)' }}>
                                            {formatTime(sessao.data_hora_inicio)}
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
