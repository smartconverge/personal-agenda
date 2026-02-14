'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'
import Modal from '@/components/Modal'
import ConfirmDialog from '@/components/ConfirmDialog'
import { useToast } from '@/components/Toast'
import { Icons } from '@/components/Icons'

export default function AgendaPage() {
    const router = useRouter()
    const { showToast } = useToast()

    // Data State
    const [sessoes, setSessoes] = useState([])
    const [alunos, setAlunos] = useState([])
    const [servicos, setServicos] = useState([])
    const [loading, setLoading] = useState(true)

    // UI State
    const [showModal, setShowModal] = useState(false) // Nova Sessão
    const [showDetailModal, setShowDetailModal] = useState(false)
    const [showConcluirDialog, setShowConcluirDialog] = useState(false)
    const [selectedSessao, setSelectedSessao] = useState(null)

    // Filters
    const [viewMode, setViewMode] = useState('semana')
    const [currentDate, setCurrentDate] = useState(new Date())

    // New Session Form
    const [formData, setFormData] = useState({
        aluno_id: '',
        servico_id: '',
        recorrente: false,
        meses_recorrencia: 3,
        horarios: [{ dia_semana: 1, hora: '08:00', data_inicio: new Date().toISOString().split('T')[0] }]
    })

    useEffect(() => {
        loadData()
    }, [currentDate, viewMode])

    const getDateRange = () => {
        const start = new Date(currentDate)
        start.setHours(0, 0, 0, 0)
        const end = new Date(currentDate)
        end.setHours(23, 59, 59, 999)

        if (viewMode === 'dia') {
            return { start: start.toISOString(), end: end.toISOString() }
        } else if (viewMode === 'semana') {
            const day = start.getDay()
            const diff = start.getDate() - day
            start.setDate(diff)
            const endDay = new Date(start)
            endDay.setDate(start.getDate() + 6)
            endDay.setHours(23, 59, 59, 999)
            return { start: start.toISOString(), end: endDay.toISOString() }
        } else {
            const year = currentDate.getFullYear()
            const month = currentDate.getMonth()
            const startMonth = new Date(year, month, 1, 0, 0, 0)
            const endMonth = new Date(year, month + 1, 0, 23, 59, 59, 999)
            return { start: startMonth.toISOString(), end: endMonth.toISOString() }
        }
    }

    const loadData = async () => {
        try {
            setLoading(true)
            const range = getDateRange()

            const results = await Promise.allSettled([
                api.get('/sessoes', { params: { data_inicio: range.start, data_fim: range.end } }),
                api.get('/alunos'),
                api.get('/servicos')
            ])

            if (results[0].status === 'fulfilled') setSessoes(results[0].value.data.data || [])
            if (results[1].status === 'fulfilled') setAlunos(results[1].value.data.data || [])
            if (results[2].status === 'fulfilled') setServicos(results[2].value.data.data || [])
        } catch (error) {
            console.error(error)
            showToast('Erro ao carregar dados', 'error')
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            const promises = formData.horarios.map(async (horario) => {
                const dataHoraInicio = `${horario.data_inicio}T${horario.hora}:00`
                const payload = {
                    aluno_id: formData.aluno_id,
                    servico_id: formData.servico_id,
                    data_hora_inicio: dataHoraInicio,
                    recorrente: formData.recorrente,
                    meses_recorrencia: formData.recorrente ? formData.meses_recorrencia : undefined
                }
                return api.post('/sessoes', payload)
            })
            await Promise.all(promises)
            showToast('Sessões agendadas!', 'success')
            setShowModal(false)
            resetForm()
            loadData()
        } catch (error) {
            showToast('Erro ao criar sessões. Verifique conflitos.', 'error')
        }
    }

    const resetForm = () => {
        setFormData({
            aluno_id: '',
            servico_id: '',
            recorrente: false,
            meses_recorrencia: 3,
            horarios: [{ dia_semana: 1, hora: '08:00', data_inicio: new Date().toISOString().split('T')[0] }]
        })
    }

    const addHorario = () => setFormData({ ...formData, horarios: [...formData.horarios, { dia_semana: 1, hora: '08:00', data_inicio: new Date().toISOString().split('T')[0] }] })
    const removeHorario = (i) => {
        if (formData.horarios.length === 1) return
        const newHorarios = [...formData.horarios]
        newHorarios.splice(i, 1)
        setFormData({ ...formData, horarios: newHorarios })
    }
    const updateHorario = (i, f, v) => {
        const newHorarios = [...formData.horarios]
        newHorarios[i] = { ...newHorarios[i], [f]: v }
        setFormData({ ...formData, horarios: newHorarios })
    }

    const handleConcluir = async () => {
        try {
            await api.put(`/sessoes/${selectedSessao.id}/concluir`)
            showToast('Sessão concluída!', 'success')
            setShowConcluirDialog(false)
            loadData()
        } catch (error) {
            showToast('Erro ao concluir sessão', 'error')
        }
    }

    const handleReabrir = async (sessao) => {
        try {
            await api.put(`/sessoes/${sessao.id}`, { status: 'agendada' })
            showToast('Sessão reaberta!', 'success')
            loadData()
        } catch (error) {
            showToast('Erro ao reabrir sessão', 'error')
        }
    }

    const navigateDate = (direction) => {
        const newDate = new Date(currentDate)
        if (viewMode === 'dia') newDate.setDate(newDate.getDate() + direction)
        else if (viewMode === 'semana') newDate.setDate(newDate.getDate() + (direction * 7))
        else newDate.setMonth(newDate.getMonth() + direction)
        setCurrentDate(newDate)
    }

    const getStatusBadge = (status) => {
        switch (status) {
            case 'agendada': return 'badge-info'
            case 'concluida': return 'badge-success'
            case 'cancelada': return 'badge-danger'
            case 'remarcada': return 'badge-warning'
            default: return 'badge-secondary'
        }
    }

    const getStatusIcon = (status) => {
        switch (status) {
            case 'agendada': return <Icons.Calendar size={14} />
            case 'concluida': return <Icons.CheckCircle size={14} />
            case 'cancelada': return <Icons.Error size={14} />
            case 'remarcada': return <Icons.Info size={14} />
            default: return <Icons.Edit size={14} />
        }
    }

    const filteredSessoes = sessoes.filter(sessao => {
        if (['cancelada', 'remarcada'].includes(sessao.status)) return false
        return true
    }).sort((a, b) => new Date(a.data_hora_inicio) - new Date(b.data_hora_inicio))

    return (
        <div className="page-enter">
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.5rem' }}>
                <button
                    className="btn btn-primary"
                    onClick={() => { resetForm(); setShowModal(true); }}
                    style={{ height: '2.75rem', padding: '0 1.5rem' }}
                >
                    <Icons.Plus size={18} />
                    <span>Nova Sessão</span>
                </button>
            </div>

            {/* View Controls & Navigation */}
            <div className="card-flat" style={{ marginBottom: '1.5rem', padding: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ display: 'flex', gap: '0.25rem' }}>
                            <button className="btn-icon btn-icon-secondary" onClick={() => navigateDate(-1)} style={{ width: '2.5rem', height: '2.5rem' }}>
                                <Icons.ChevronLeft size={20} />
                            </button>
                            <button className="btn-icon btn-icon-secondary" onClick={() => navigateDate(1)} style={{ width: '2.5rem', height: '2.5rem' }}>
                                <Icons.ChevronRight size={20} />
                            </button>
                        </div>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: '800', margin: 0, color: 'var(--text-primary)' }}>
                            {currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }).replace(/^\w/, c => c.toUpperCase())}
                        </h2>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ display: 'flex', background: 'var(--bg-primary)', padding: '0.2rem', borderRadius: '0.6rem', border: '1px solid var(--border)' }}>
                            {['dia', 'semana', 'mes'].map((v) => (
                                <button
                                    key={v}
                                    onClick={() => setViewMode(v)}
                                    style={{
                                        padding: '0.4rem 1rem',
                                        fontSize: '0.75rem',
                                        fontWeight: '700',
                                        borderRadius: '0.4rem',
                                        border: 'none',
                                        background: viewMode === v ? 'white' : 'transparent',
                                        color: viewMode === v ? 'var(--primary)' : 'var(--text-muted)',
                                        boxShadow: viewMode === v ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    {v.charAt(0).toUpperCase() + v.slice(1)}
                                </button>
                            ))}
                        </div>
                        <button
                            className="btn btn-secondary"
                            style={{ height: '2.5rem', padding: '0 1rem', fontSize: '0.8125rem' }}
                            onClick={() => setCurrentDate(new Date())}
                        >
                            Hoje
                        </button>
                    </div>
                </div>
            </div>

            {/* Calendar Content */}
            {loading ? (
                <div className="card-flat" style={{ display: 'flex', justifyContent: 'center', padding: '5rem' }}>
                    <div className="spinner" style={{ width: '3rem', height: '3rem' }} />
                </div>
            ) : viewMode === 'semana' ? (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(7, 1fr)',
                    gap: '1px',
                    backgroundColor: 'var(--border)',
                    borderRadius: 'var(--radius)',
                    overflow: 'hidden',
                    border: '1px solid var(--border)',
                    boxShadow: 'var(--shadow-sm)'
                }}>
                    {/* Day Headers (Week View) */}
                    {(() => {
                        const days = []
                        const startOfWeek = new Date(currentDate)
                        const day = startOfWeek.getDay()
                        const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1) // Start at Monday
                        startOfWeek.setDate(diff)

                        for (let i = 0; i < 7; i++) {
                            const date = new Date(startOfWeek)
                            date.setDate(startOfWeek.getDate() + i)
                            const isToday = date.toDateString() === new Date().toDateString()

                            days.push(
                                <div key={i} style={{
                                    backgroundColor: 'var(--bg-secondary)',
                                    padding: '1.25rem 0.5rem',
                                    textAlign: 'center',
                                    borderBottom: '1px solid var(--border)'
                                }}>
                                    <p style={{
                                        fontSize: '0.7rem',
                                        fontWeight: '700',
                                        color: 'var(--text-muted)',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.05em',
                                        marginBottom: '0.5rem'
                                    }}>
                                        {date.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '').toUpperCase()}
                                    </p>
                                    <div style={{
                                        width: '2.25rem',
                                        height: '2.25rem',
                                        margin: '0 auto',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        borderRadius: '50%',
                                        backgroundColor: isToday ? 'var(--primary)' : 'transparent',
                                        color: isToday ? 'white' : 'var(--text-primary)',
                                        fontSize: '1rem',
                                        fontWeight: '800'
                                    }}>
                                        {date.getDate()}
                                    </div>
                                </div>
                            )
                        }
                        return days
                    })()}

                    {/* Grid Columns (Week View) */}
                    {(() => {
                        const columns = []
                        const startOfWeek = new Date(currentDate)
                        const day = startOfWeek.getDay()
                        const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1)
                        startOfWeek.setDate(diff)

                        for (let i = 0; i < 7; i++) {
                            const date = new Date(startOfWeek)
                            date.setDate(startOfWeek.getDate() + i)
                            const dateStr = date.toISOString().split('T')[0]

                            const daySessoes = filteredSessoes.filter(s =>
                                s.data_hora_inicio.startsWith(dateStr)
                            )

                            columns.push(
                                <div key={i} style={{
                                    backgroundColor: 'white',
                                    minHeight: '600px',
                                    padding: '0.75rem',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '0.75rem'
                                }}>
                                    {daySessoes.length === 0 ? (
                                        <div style={{
                                            height: '100%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            opacity: 0.1
                                        }}>
                                            <Icons.Calendar size={32} color="var(--text-muted)" />
                                        </div>
                                    ) : (
                                        daySessoes.map(sessao => (
                                            <div
                                                key={sessao.id}
                                                className="card-premium"
                                                onClick={() => { setSelectedSessao(sessao); setShowDetailModal(true); }}
                                                style={{
                                                    padding: '0.875rem',
                                                    cursor: 'pointer',
                                                    borderLeft: `3px solid ${sessao.status === 'concluida' ? 'var(--success)' : sessao.status === 'agendada' ? 'var(--primary)' : 'var(--warning)'}`,
                                                    borderRadius: '0.5rem',
                                                    background: 'white',
                                                    position: 'relative'
                                                }}
                                            >
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
                                                    <div style={{
                                                        width: '6px',
                                                        height: '6px',
                                                        borderRadius: '50%',
                                                        backgroundColor: sessao.status === 'concluida' ? 'var(--success)' : 'var(--primary)'
                                                    }} />
                                                    <span style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-primary)' }}>
                                                        {new Date(sessao.data_hora_inicio).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>

                                                <h4 style={{
                                                    fontSize: '0.8125rem',
                                                    fontWeight: '700',
                                                    color: 'black',
                                                    marginBottom: '0.2rem',
                                                    whiteSpace: 'nowrap',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis'
                                                }}>
                                                    {sessao.aluno?.nome}
                                                </h4>

                                                <p style={{
                                                    fontSize: '0.7rem',
                                                    color: 'var(--text-muted)',
                                                    marginBottom: '0.6rem',
                                                    whiteSpace: 'nowrap',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis'
                                                }}>
                                                    {sessao.servico?.nome}
                                                </p>

                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: '600' }}>
                                                        {sessao.servico?.duracao_minutos} min
                                                    </span>
                                                    <span style={{
                                                        fontSize: '0.6rem',
                                                        fontWeight: '800',
                                                        color: sessao.status === 'concluida' ? 'var(--success)' : 'var(--primary)',
                                                        textTransform: 'uppercase',
                                                        letterSpacing: '0.02em'
                                                    }}>
                                                        {sessao.status === 'agendada' ? 'CONFIRMADA' : sessao.status.toUpperCase()}
                                                    </span>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )
                        }
                        return columns
                    })()}
                </div>
            ) : viewMode === 'mes' ? (
                /* Monthly View Grid */
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(7, 1fr)',
                    gap: '1px',
                    backgroundColor: 'var(--border)',
                    borderRadius: 'var(--radius)',
                    overflow: 'hidden',
                    border: '1px solid var(--border)',
                    boxShadow: 'var(--shadow-sm)'
                }}>
                    {/* Headers */}
                    {['SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SAB', 'DOM'].map((day, i) => (
                        <div key={i} style={{
                            backgroundColor: 'white',
                            padding: '0.75rem',
                            textAlign: 'center',
                            fontSize: '0.75rem',
                            fontWeight: '700',
                            color: 'var(--text-muted)',
                            borderBottom: '1px solid var(--border)'
                        }}>
                            {day}
                        </div>
                    ))}

                    {/* Days */}
                    {(() => {
                        const year = currentDate.getFullYear()
                        const month = currentDate.getMonth()
                        const firstDay = new Date(year, month, 1)
                        const lastDay = new Date(year, month + 1, 0)

                        let startDay = firstDay.getDay()
                        if (startDay === 0) startDay = 6 // Sunday -> 6
                        else startDay = startDay - 1 // Mon(1)->0, Tue(2)->1...

                        const daysInMonth = lastDay.getDate()
                        const cells = []

                        // Previous month padding
                        for (let i = 0; i < startDay; i++) {
                            cells.push(<div key={`pad-${i}`} style={{ backgroundColor: 'var(--bg-secondary)', minHeight: '120px' }}></div>)
                        }

                        // Days
                        for (let d = 1; d <= daysInMonth; d++) {
                            const dateStr = new Date(year, month, d).toISOString().split('T')[0]
                            const daySessoes = filteredSessoes.filter(s => s.data_hora_inicio.startsWith(dateStr))
                            const isToday = new Date().toISOString().split('T')[0] === dateStr

                            cells.push(
                                <div key={d} style={{
                                    backgroundColor: 'white',
                                    minHeight: '120px',
                                    padding: '0.5rem',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '0.25rem'
                                }}>
                                    <div style={{
                                        textAlign: 'right',
                                        fontWeight: '700',
                                        fontSize: '0.875rem',
                                        color: isToday ? 'var(--primary)' : 'var(--text-secondary)',
                                        marginBottom: '0.25rem'
                                    }}>
                                        {isToday ? <span style={{ background: 'var(--primary)', color: 'white', padding: '0.1rem 0.4rem', borderRadius: '0.25rem' }}>{d}</span> : d}
                                    </div>

                                    {daySessoes.map(sessao => (
                                        <div
                                            key={sessao.id}
                                            onClick={() => { setSelectedSessao(sessao); setShowDetailModal(true); }}
                                            style={{
                                                fontSize: '0.7rem',
                                                padding: '0.25rem 0.5rem',
                                                borderRadius: '0.25rem',
                                                background: sessao.status === 'concluida' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                                                color: sessao.status === 'concluida' ? 'var(--success)' : 'var(--primary)',
                                                borderLeft: `2px solid ${sessao.status === 'concluida' ? 'var(--success)' : 'var(--primary)'}`,
                                                cursor: 'pointer',
                                                whiteSpace: 'nowrap',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis'
                                            }}
                                            title={`${new Date(sessao.data_hora_inicio).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} - ${sessao.aluno?.nome}`}
                                        >
                                            <span style={{ fontWeight: '700' }}>{new Date(sessao.data_hora_inicio).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span> {sessao.aluno?.nome}
                                        </div>
                                    ))}
                                </div>
                            )
                        }
                        return cells
                    })()}
                </div>
            ) : (
                /* Day View (Simple List) */
                <div className="card-flat" style={{ padding: '0', overflow: 'hidden' }}>
                    {filteredSessoes.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '5rem 2rem' }}>
                            <div style={{ width: '4rem', height: '4rem', backgroundColor: 'var(--bg-secondary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                                <Icons.Calendar size={32} color="var(--text-muted)" />
                            </div>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '0.5rem' }}>Dia livre!</h3>
                            <p style={{ color: 'var(--text-muted)' }}>Nenhuma sessão agendada para esta data.</p>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gap: '1rem', padding: '1.5rem', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
                            {filteredSessoes.map((sessao) => (
                                <div
                                    key={sessao.id}
                                    className="card-premium"
                                    onClick={() => { setSelectedSessao(sessao); setShowDetailModal(true); }}
                                    style={{
                                        padding: '1.25rem',
                                        cursor: 'pointer',
                                        borderLeft: `3px solid ${sessao.status === 'concluida' ? 'var(--success)' : sessao.status === 'agendada' ? 'var(--primary)' : 'var(--warning)'}`,
                                        background: 'white'
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                        <div>
                                            <h4 style={{ fontSize: '1rem', fontWeight: '800', marginBottom: '0.25rem' }}>{sessao.aluno?.nome}</h4>
                                            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{sessao.servico?.nome}</p>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <p style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--primary)' }}>
                                                {new Date(sessao.data_hora_inicio).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                            <span className={`badge ${getStatusBadge(sessao.status)}`} style={{ fontSize: '0.7rem' }}>
                                                {sessao.status.toUpperCase()}
                                            </span>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '1rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                            <Icons.Clock size={14} />
                                            <span>{sessao.servico?.duracao_minutos} min</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Agendar Sessões" size="lg">
                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.5rem' }}>
                        <div>
                            <label className="label">Aluno</label>
                            <select className="input" value={formData.aluno_id} onChange={(e) => setFormData({ ...formData, aluno_id: e.target.value })} required>
                                <option value="">Selecione um aluno</option>
                                {alunos.map(aluno => <option key={aluno.id} value={aluno.id}>{aluno.nome}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="label">Serviço/Modalidade</label>
                            <select className="input" value={formData.servico_id} onChange={(e) => setFormData({ ...formData, servico_id: e.target.value })} required>
                                <option value="">Selecione um serviço</option>
                                {servicos.map(servico => <option key={servico.id} value={servico.id}>{servico.nome} ({servico.duracao_minutos} min)</option>)}
                            </select>
                        </div>
                    </div>

                    <div style={{ marginBottom: '2rem', padding: '1.25rem', backgroundColor: 'var(--bg-primary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                            <h3 style={{ fontSize: '1rem', fontWeight: '800', margin: 0 }}>Horários da Sessão</h3>
                            <button type="button" className="btn btn-secondary" style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem', height: 'auto' }} onClick={addHorario}>+ Add Horário</button>
                        </div>
                        {formData.horarios.map((horario, index) => (
                            <div key={index} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', marginBottom: '1rem', paddingBottom: '1rem', borderBottom: index < formData.horarios.length - 1 ? '1px dashed var(--border)' : 'none' }}>
                                <div style={{ flex: 1 }}>
                                    <label className="label" style={{ fontSize: '0.7rem' }}>Data</label>
                                    <input type="date" className="input" value={horario.data_inicio} onChange={(e) => updateHorario(index, 'data_inicio', e.target.value)} required />
                                </div>
                                <div style={{ width: '120px' }}>
                                    <label className="label" style={{ fontSize: '0.7rem' }}>Hora</label>
                                    <input type="time" className="input" value={horario.hora} onChange={(e) => updateHorario(index, 'hora', e.target.value)} required />
                                </div>
                                {formData.horarios.length > 1 && (
                                    <button type="button" className="btn-icon btn-icon-danger" onClick={() => removeHorario(index)}>
                                        <Icons.Delete size={16} />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>

                    <div style={{ padding: '1.25rem', backgroundColor: 'var(--sidebar-bg)', color: 'white', borderRadius: 'var(--radius-md)', marginBottom: '2rem' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer' }}>
                            <div style={{
                                width: '2.5rem',
                                height: '2.5rem',
                                borderRadius: '50%',
                                backgroundColor: formData.recorrente ? 'var(--primary)' : 'rgba(255,255,255,0.1)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.2s'
                            }}>
                                <Icons.TrendingUp size={18} color="white" />
                            </div>
                            <div style={{ flex: 1 }}>
                                <p style={{ fontWeight: '700', fontSize: '0.9375rem', marginBottom: '0.1rem' }}>Recorrência Semanal</p>
                                <p style={{ fontSize: '0.75rem', opacity: 0.7 }}>Agendar automaticamente para as próximas semanas</p>
                            </div>
                            <input type="checkbox" checked={formData.recorrente} onChange={(e) => setFormData({ ...formData, recorrente: e.target.checked })} style={{ width: '1.25rem', height: '1.25rem', accentColor: 'var(--primary)' }} />
                        </label>

                        {formData.recorrente && (
                            <div style={{ marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <span style={{ fontSize: '0.875rem' }}>Repetir por:</span>
                                <input
                                    type="number"
                                    className="input"
                                    style={{ width: '80px', background: 'rgba(0,0,0,0.2)', border: 'none', color: 'white' }}
                                    min="1" max="12"
                                    value={formData.meses_recorrencia}
                                    onChange={(e) => setFormData({ ...formData, meses_recorrencia: parseInt(e.target.value) })}
                                />
                                <span style={{ fontSize: '0.875rem' }}>meses</span>
                            </div>
                        )}
                    </div>

                    <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                        <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)} style={{ padding: '0.625rem 1.5rem' }}>Cancelar</button>
                        <button type="submit" className="btn btn-primary" style={{ padding: '0.625rem 2.5rem' }}>Agendar Sessões</button>
                    </div>
                </form>
            </Modal>

            {/* Modal Detalhes */}
            <Modal isOpen={showDetailModal} onClose={() => setShowDetailModal(false)} title="Detalhes da Sessão">
                {selectedSessao && (
                    <div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div className="avatar" style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--primary)' }}>
                                    {selectedSessao.aluno?.nome?.substring(0, 2).toUpperCase()}
                                </div>
                                <div>
                                    <h3 style={{ fontSize: '1.125rem', fontWeight: '800' }}>{selectedSessao.aluno?.nome}</h3>
                                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Status: <span className={`badge ${getStatusBadge(selectedSessao.status)}`}>{selectedSessao.status}</span></p>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div className="card-flat" style={{ padding: '0.75rem' }}>
                                    <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Serviço</p>
                                    <p style={{ fontSize: '0.9375rem', fontWeight: '700' }}>{selectedSessao.servico?.nome}</p>
                                </div>
                                <div className="card-flat" style={{ padding: '0.75rem' }}>
                                    <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Duração</p>
                                    <p style={{ fontSize: '0.9375rem', fontWeight: '700' }}>{selectedSessao.servico?.duracao_minutos} min</p>
                                </div>
                                <div className="card-flat" style={{ padding: '0.75rem', gridColumn: 'span 2' }}>
                                    <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Data e Horário</p>
                                    <p style={{ fontSize: '0.9375rem', fontWeight: '700' }}>
                                        {new Date(selectedSessao.data_hora_inicio).toLocaleString('pt-BR', { dateStyle: 'full', timeStyle: 'short' })}
                                    </p>
                                </div>
                            </div>

                            <button
                                className="btn btn-primary"
                                style={{ width: '100%', height: '3rem', marginTop: '1rem' }}
                                onClick={() => router.push(`/dashboard/alunos/${selectedSessao.aluno_id}`)}
                            >
                                <Icons.Students size={18} style={{ marginRight: '0.5rem' }} />
                                Ver Perfil do Aluno
                            </button>
                        </div>
                    </div>
                )}
            </Modal>

            <ConfirmDialog
                isOpen={showConcluirDialog}
                onClose={() => setShowConcluirDialog(false)}
                onConfirm={handleConcluir}
                title="Concluir Sessão"
                message={`Deseja marcar a aula de ${selectedSessao?.aluno?.nome} como concluída? Isso enviará uma notificação de confirmação.`}
                confirmText="Sim, Concluir"
            />
        </div >
    )
}
