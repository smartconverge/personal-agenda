'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import api from '@/lib/api'
import { Icons } from '@/components/Icons'
import styles from './Dashboard.module.css'
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

            let nomeProfessor = 'Professor'
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
            <div className="flex justify-center p-20">
                <div className="spinner spinner--dark" style={{ width: '3rem', height: '3rem' }} />
            </div>
        )
    }

    const statCards = [
        {
            label: 'Alunos Ativos',
            value: stats?.totalAlunos || 0,
            change: stats?.totalAlunos > 0 ? `${stats.totalAlunos} cadastrado${stats.totalAlunos > 1 ? 's' : ''}` : 'Nenhum cadastrado',
            iconComponent: Icons.Students,
        },
        {
            label: 'Sessões Hoje',
            value: stats?.sessoesHoje || 0,
            change: stats?.sessoesHoje > 0 ? `${stats.sessoesHoje} agendada${stats.sessoesHoje > 1 ? 's' : ''}` : 'Dia livre',
            iconComponent: Icons.Calendar,
        },
        {
            label: 'Receita Mensal',
            value: formatCurrency(stats?.faturamentoMensal || 0),
            change: stats?.contratosAtivos > 0 ? `${stats.contratosAtivos} contrato${stats.contratosAtivos > 1 ? 's' : ''} ativo${stats.contratosAtivos > 1 ? 's' : ''}` : 'Sem contratos ativos',
            iconComponent: Icons.Money,
            highlight: true
        },
        {
            label: 'Contratos Ativos',
            value: stats?.contratosAtivos || 0,
            change: stats?.sessoesMes > 0 ? `${stats.sessoesMes} sessõ${stats.sessoesMes > 1 ? 'es' : ''} no mês` : 'Sem sessões este mês',
            iconComponent: Icons.Contracts,
        },
    ]

    return (
        <div className="animate-fade-in">
            {/* Stats Grid */}
            <div className={styles.grid}>
                {statCards.map((stat, index) => {
                    const IconComponent = stat.iconComponent

                    return (
                        <div
                            key={index}
                            className={`${styles.statCard} ${stat.highlight ? styles['statCard--highlight'] : ''}`}
                        >
                            <div className="flex justify-between items-start">
                                <p className={styles.label}>
                                    {stat.label}
                                </p>
                                <div className={styles.iconWrapper} style={{
                                    background: stat.highlight ? 'rgba(255,255,255,0.2)' : 'var(--color-primary-light)',
                                    color: stat.highlight ? 'white' : 'var(--color-primary)'
                                }}>
                                    <IconComponent size={24} />
                                </div>
                            </div>

                            <div>
                                <p className={styles.value}>
                                    {stat.value}
                                </p>

                                <div className="flex items-center gap-2">
                                    <div className={styles.changeBadge} style={{
                                        background: stat.highlight ? 'rgba(255,255,255,0.2)' : 'rgba(22, 163, 74, 0.1)',
                                        color: stat.highlight ? 'white' : 'var(--color-success)'
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
            <div className="mt-8">
                <div className={styles.sectionHeader}>
                    <div>
                        <h2 className={styles.title}>
                            Sessões de Hoje
                        </h2>
                        <p className={styles.subtitle}>
                            {sessoes.length} {sessoes.length === 1 ? 'sessão agendada' : 'sessões agendadas'} para hoje
                        </p>
                    </div>
                    <Link href="/dashboard/agenda" className="btn btn-primary">
                        <Icons.Calendar size={18} />
                        <span>Ver Agenda Completa</span>
                    </Link>
                </div>

                {sessoes.length === 0 ? (
                    <div className={styles.emptyState}>
                        <div className={styles.emptyIconBox}>
                            <Icons.Calendar size={32} />
                        </div>
                        <h3 className="text-lg font-extrabold mb-2">
                            Dia livre!
                        </h3>
                        <p className="text-sm text-muted">
                            Nenhuma sessão agendada para hoje. Aproveite para descansar ou planejar.
                        </p>
                    </div>
                ) : (
                    <div className={styles.sessionGrid}>
                        {sessoes.map((sessao, index) => (
                            <div
                                key={sessao.id}
                                className={styles.sessionCard}
                            >
                                {/* Header: Time & Status */}
                                <div className="flex justify-between items-start mb-4">
                                    <div className={styles.timeBadge}>
                                        <Icons.Clock size={14} />
                                        <span>
                                            {formatTime(sessao.data_hora_inicio)}
                                        </span>
                                    </div>
                                    <span className={`badge ${getStatusBadge(sessao.status)}`}>
                                        {getStatusText(sessao.status)}
                                    </span>
                                </div>

                                {/* Student Info */}
                                <div className="mb-6">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div
                                            className="avatar font-extrabold text-xs text-white"
                                            style={{
                                                background: getAvatarColor(index),
                                                width: '2rem', height: '2rem'
                                            }}
                                        >
                                            {getInitials(sessao.aluno?.nome)}
                                        </div>
                                        <h3 className="font-extrabold text-lg text-primary m-0 truncate">
                                            {sessao.aluno?.nome || 'Aluno não identificado'}
                                        </h3>
                                    </div>
                                    <p className="text-sm text-muted" style={{ paddingLeft: '2.5rem' }}>
                                        {sessao.servico?.nome || 'Serviço'} • {sessao.servico?.duracao_minutos || 0} min
                                    </p>
                                </div>

                                {/* Footer Action */}
                                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem' }}>
                                    <Link
                                        href={`/dashboard/alunos/${sessao.aluno_id}`}
                                        className="text-xs font-bold text-primary flex items-center gap-2"
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
