'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import api from '@/lib/api'
import Modal from '@/components/Modal'
import ConfirmDialog from '@/components/ConfirmDialog'
import { useToast } from '@/components/Toast'
import { Icons } from '@/components/Icons'

export default function AlunoDetalhesPage() {
    const router = useRouter()
    const params = useParams()
    const id = params?.id
    const { showToast } = useToast()

    const [aluno, setAluno] = useState(null)
    const [sessoes, setSessoes] = useState([])
    const [servicos, setServicos] = useState([])
    const [loading, setLoading] = useState(true)

    // Modals & Dialogs
    const [showModal, setShowModal] = useState(false)
    const [showDetailModal, setShowDetailModal] = useState(false)
    const [showCancelDialog, setShowCancelDialog] = useState(false)
    const [showRemarcarModal, setShowRemarcarModal] = useState(false)
    const [showConcluirDialog, setShowConcluirDialog] = useState(false)
    const [showLimparDialog, setShowLimparDialog] = useState(false)
    const [selectedSessao, setSelectedSessao] = useState(null)

    // Form Creation
    const [formData, setFormData] = useState({
        servico_id: '',
        recorrente: false,
        meses_recorrencia: 3,
        notificar: false,
        selectedDays: [],
        horarios: [{ dia_semana: new Date().getDay(), hora: '08:00', data_inicio: new Date().toISOString().split('T')[0] }]
    })

    // Reschedule & Cancel Data
    const [remarcarData, setRemarcarData] = useState({
        nova_data: '',
        nova_hora: '',
        observacoes: ''
    })
    const [cancelarData, setCancelarData] = useState({
        observacoes: ''
    })

    // View State
    const [viewMode, setViewMode] = useState('mes')
    const [currentDate, setCurrentDate] = useState(new Date())

    useEffect(() => {
        if (id) {
            loadAluno()
            loadServicos()
        }
    }, [id])

    useEffect(() => {
        if (id) {
            loadSessoes()
        }
    }, [id, currentDate, viewMode])

    const loadAluno = async () => {
        try {
            const res = await api.get(`/alunos/${id}`)
            setAluno(res.data.data)
        } catch (error) {
            showToast('Erro ao carregar aluno', 'error')
            router.push('/dashboard/alunos')
        }
    }

    const loadServicos = async () => {
        try {
            const res = await api.get('/servicos')
            setServicos(res.data.data)
        } catch (error) {
            console.error(error)
        }
    }

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
            return { start: start.toISOString(), end: endDay.toISOString() }
        } else {
            const year = currentDate.getFullYear()
            const month = currentDate.getMonth()
            const startMonth = new Date(year, month, 1, 0, 0, 0)
            const endMonth = new Date(year, month + 1, 0, 23, 59, 59, 999)
            return { start: startMonth.toISOString(), end: endMonth.toISOString() }
        }
    }

    const loadSessoes = async () => {
        try {
            setLoading(true)
            const { start, end } = getDateRange()
            const res = await api.get('/sessoes', {
                params: {
                    aluno_id: id,
                    data_inicio: start,
                    data_fim: end
                }
            })
            setSessoes(res.data.data || [])
        } catch (error) {
            showToast('Erro ao carregar sessões', 'error')
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            setLoading(true)
            const promises = formData.horarios.map(async (horario) => {
                const dataHoraInicio = `${horario.data_inicio}T${horario.hora}:00`
                const payload = {
                    aluno_id: id,
                    servico_id: formData.servico_id,
                    data_hora_inicio: dataHoraInicio,
                    recorrente: formData.recorrente,
                    meses_recorrencia: formData.recorrente ? formData.meses_recorrencia : undefined,
                    notificar: false // Sempre silencioso na criação individual para evitar spam
                }
                return api.post('/sessoes', payload)
            })
            await Promise.all(promises)

            // Se o professor marcou para notificar, envia o resumo consolidado uma única vez
            if (formData.notificar) {
                await api.post('/notificacoes/resumo-aluno', { aluno_id: id })
            }

            showToast('Sessões agendadas com sucesso!', 'success')
            setShowModal(false)
            resetForm()
            loadSessoes()
        } catch (error) {
            console.error(error)
            showToast('Erro ao criar sessões. Verifique conflitos.', 'error')
        } finally {
            setLoading(false)
        }
    }

    const handleCancelar = async (e) => {
        e.preventDefault()
        try {
            await api.put(`/sessoes/${selectedSessao.id}/cancelar`, {
                observacoes: cancelarData.observacoes
            })
            showToast('Sessão cancelada!', 'success')
            loadSessoes()
            setShowDetailModal(false)
            setShowCancelDialog(false)
        } catch (error) {
            showToast('Erro ao cancelar sessão', 'error')
        }
    }

    const handleRemarcar = async (e) => {
        e.preventDefault()
        try {
            const novaDataHora = `${remarcarData.nova_data}T${remarcarData.nova_hora}:00`
            await api.put(`/sessoes/${selectedSessao.id}/remarcar`, {
                nova_data_hora_inicio: novaDataHora,
                observacoes: remarcarData.observacoes
            })
            showToast('Sessão remarcada!', 'success')
            setShowRemarcarModal(false)
            setShowDetailModal(false)
            loadSessoes()
        } catch (error) {
            showToast(error.response?.data?.error || 'Erro ao remarcar sessão', 'error')
        }
    }

    const handleConcluir = async () => {
        try {
            await api.put(`/sessoes/${selectedSessao.id}/concluir`)
            showToast('Sessão concluída!', 'success')
            setShowConcluirDialog(false)
            loadSessoes()
        } catch (error) {
            showToast('Erro ao concluir sessão', 'error')
        }
    }

    const handleReabrir = async (sessao) => {
        try {
            await api.put(`/sessoes/${sessao.id}`, { status: 'agendada' })
            showToast('Sessão reaberta!', 'success')
            loadSessoes()
        } catch (error) {
            showToast('Erro ao reabrir sessão', 'error')
        }
    }

    const handleLimparAgenda = async () => {
        try {
            setLoading(true)
            const response = await api.delete('/sessoes/limpar-aluno', { params: { aluno_id: id } })
            showToast(response.data.data.message, 'success')
            setShowLimparDialog(false)
            loadSessoes()
        } catch (error) {
            console.error(error)
            showToast('Erro ao limpar agenda.', 'error')
        } finally {
            setLoading(false)
        }
    }

    const handleAvisarAgendamentos = async () => {
        try {
            setLoading(true)
            await api.post('/notificacoes/resumo-aluno', { aluno_id: id })
            showToast('Resumo enviado para o WhatsApp!', 'success')
        } catch (error) {
            console.error(error)
            const msg = error.response?.data?.error || 'Erro ao enviar resumo.'
            showToast(msg, 'error')
        } finally {
            setLoading(false)
        }
    }

    const resetForm = () => {
        setFormData({
            servico_id: '',
            recorrente: false,
            meses_recorrencia: 3,
            notificar: false,
            selectedDays: [],
            horarios: [{ dia_semana: new Date().getDay(), hora: '08:00', data_inicio: new Date().toISOString().split('T')[0] }]
        })
    }

    const addHorario = () => {
        const lastHorario = formData.horarios.length > 0 ? formData.horarios[formData.horarios.length - 1] : null
        const today = new Date()
        today.setHours(12, 0, 0, 0)

        let nextDate
        if (lastHorario) {
            const lastDate = new Date(lastHorario.data_inicio + 'T12:00:00')
            nextDate = new Date(lastDate)

            if (formData.selectedDays && formData.selectedDays.length > 0) {
                const currentDay = lastDate.getDay()
                const sortedPattern = [...formData.selectedDays].sort((a, b) => a - b)
                const nextPatternDay = sortedPattern.find(d => d > currentDay)

                if (nextPatternDay !== undefined) {
                    const diff = nextPatternDay - currentDay
                    nextDate.setDate(lastDate.getDate() + diff)
                } else {
                    const diff = (sortedPattern[0] - currentDay + 7) % 7
                    nextDate.setDate(lastDate.getDate() + (diff === 0 ? 7 : diff))
                }
            } else {
                nextDate.setDate(lastDate.getDate() + 1)
            }
        } else {
            nextDate = today
        }

        const nextHorario = {
            dia_semana: nextDate.getDay(),
            hora: lastHorario ? lastHorario.hora : '08:00',
            data_inicio: nextDate.toISOString().split('T')[0]
        }

        setFormData({ ...formData, horarios: [...formData.horarios, nextHorario] })
    }
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
    const navigateDate = (d) => {
        const newDate = new Date(currentDate)
        if (viewMode === 'dia') newDate.setDate(newDate.getDate() + d)
        else if (viewMode === 'semana') newDate.setDate(newDate.getDate() + (d * 7))
        else newDate.setMonth(newDate.getMonth() + d)
        setCurrentDate(newDate)
    }

    if (!aluno) return <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}><div className="spinner" /></div>
    const sortedSessoes = [...sessoes].sort((a, b) => new Date(a.data_hora_inicio) - new Date(b.data_hora_inicio))

    return (
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
            {/* Header / Infobar */}
            <div style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                    <button className="btn-icon btn-icon-secondary" onClick={() => router.push('/dashboard/alunos')}>
                        <Icons.Logout size={18} style={{ transform: 'rotate(180deg)' }} />
                    </button>
                    <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Voltar para Alunos</span>
                </div>

                <div className="card-premium" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                        <div className="avatar avatar-lg" style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--primary)', border: '2px solid var(--primary-light)' }}>
                            {aluno.nome?.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                                <h1 style={{ fontSize: '1.75rem', fontWeight: '900', color: 'var(--text-primary)' }}>{aluno.nome}</h1>
                                <span className={`badge ${aluno.plano === 'Premium' ? 'badge-info' : 'badge-secondary'}`}>
                                    {aluno.plano || 'Basic'}
                                </span>
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                    <Icons.Goal size={14} />
                                    <span>Objetivo: <strong>{aluno.objetivo || 'Não definido'}</strong></span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                    <Icons.Students size={14} />
                                    <span>WhatsApp: {aluno.telefone_whatsapp}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                        <button
                            className="btn btn-danger"
                            style={{ padding: '0.75rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: 0.9 }}
                            onClick={() => setShowLimparDialog(true)}
                            disabled={loading}
                        >
                            <Icons.Delete size={18} />
                            <span>Limpar Agenda Futura</span>
                        </button>

                        <button
                            className="btn btn-secondary"
                            style={{ padding: '0.75rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                            onClick={handleAvisarAgendamentos}
                            disabled={loading}
                        >
                            <Icons.Students size={18} />
                            <span>Avisar Agendamentos (WhatsApp)</span>
                        </button>

                        <button className="btn btn-primary" style={{ padding: '0.75rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }} onClick={() => { resetForm(); setShowModal(true); }}>
                            <Icons.Plus size={18} />
                            <span>Novo Agendamento</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* View Controls */}
            <div className="card-flat" style={{ marginBottom: '1.5rem', padding: '0.75rem 1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                    <div style={{ display: 'flex', background: 'var(--bg-primary)', padding: '0.25rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                        {['dia', 'semana', 'mes'].map((v) => (
                            <button
                                key={v}
                                className={`btn ${viewMode === v ? '' : ''}`}
                                style={{
                                    padding: '0.5rem 1.25rem',
                                    fontSize: '0.8125rem',
                                    height: 'auto',
                                    background: viewMode === v ? 'var(--primary)' : 'transparent',
                                    color: viewMode === v ? 'white' : 'var(--text-secondary)',
                                    boxShadow: 'none',
                                    textTransform: 'capitalize'
                                }}
                                onClick={() => setViewMode(v)}
                            >
                                {v}
                            </button>
                        ))}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <button className="btn-icon btn-icon-secondary" onClick={() => navigateDate(-1)}><Icons.Menu size={16} style={{ transform: 'rotate(90deg)' }} /></button>
                        <span style={{ fontWeight: '800', fontSize: '1rem', color: 'var(--text-primary)', minWidth: '180px', textAlign: 'center' }}>
                            {currentDate.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                        </span>
                        <button className="btn-icon btn-icon-secondary" onClick={() => navigateDate(1)}><Icons.Menu size={16} style={{ transform: 'rotate(-90deg)' }} /></button>
                    </div>
                </div>
            </div>

            {/* Sessions List */}
            <div className="card-flat" style={{ padding: '0', overflow: 'hidden' }}>
                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}><div className="spinner" /></div>
                ) : sortedSessoes.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                        <Icons.Calendar size={48} color="var(--text-muted)" style={{ opacity: 0.3, marginBottom: '1rem' }} />
                        <p style={{ color: 'var(--text-muted)', fontWeight: '500' }}>Nenhuma sessão agendada para este período</p>
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table className="table" style={{ margin: 0 }}>
                            <thead>
                                <tr>
                                    <th style={{ paddingLeft: '1.5rem' }}>Data e Horário</th>
                                    <th>Serviço</th>
                                    <th>Status</th>
                                    <th>Obs</th>
                                    <th style={{ paddingRight: '1.5rem', textAlign: 'right' }}>Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sortedSessoes.map((sessao) => (
                                    <tr key={sessao.id} className="table-row-hover">
                                        <td style={{ paddingLeft: '1.5rem' }}>
                                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                <span style={{ fontWeight: '800', color: 'var(--text-primary)', fontSize: '0.9375rem' }}>
                                                    {new Date(sessao.data_hora_inicio).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                                    {new Date(sessao.data_hora_inicio).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                                                </span>
                                            </div>
                                        </td>
                                        <td>
                                            <span style={{ fontWeight: '600' }}>{sessao.servico?.nome || 'N/A'}</span>
                                        </td>
                                        <td>
                                            <span className={`badge ${getStatusBadge(sessao.status)}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                                                {getStatusIcon(sessao.status)}
                                                {sessao.status.toUpperCase()}
                                            </span>
                                        </td>
                                        <td>{sessao.observacoes ? <Icons.Info size={16} color="var(--primary)" title={sessao.observacoes} /> : <span style={{ opacity: 0.3 }}>-</span>}</td>
                                        <td style={{ paddingRight: '1.5rem', textAlign: 'right' }}>
                                            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                                <button className="btn-icon btn-icon-secondary" onClick={() => { setSelectedSessao(sessao); setShowDetailModal(true); }}>
                                                    <Icons.Info size={16} />
                                                </button>
                                                {sessao.status === 'agendada' && (
                                                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                                                        <button className="btn-icon btn-icon-primary" onClick={() => { setSelectedSessao(sessao); setShowConcluirDialog(true); }}>
                                                            <Icons.CheckCircle size={16} />
                                                        </button>
                                                        <button className="btn-icon btn-icon-secondary" onClick={() => {
                                                            setSelectedSessao(sessao);
                                                            const d = new Date(sessao.data_hora_inicio);
                                                            setRemarcarData({ nova_data: d.toISOString().split('T')[0], nova_hora: d.toTimeString().slice(0, 5), observacoes: sessao.observacoes || '' });
                                                            setShowRemarcarModal(true);
                                                        }}>
                                                            <Icons.TrendingUp size={16} />
                                                        </button>
                                                        <button className="btn-icon btn-icon-danger" onClick={() => {
                                                            setSelectedSessao(sessao);
                                                            setCancelarData({ observacoes: '' });
                                                            setShowCancelDialog(true);
                                                        }}>
                                                            <Icons.Delete size={16} />
                                                        </button>
                                                    </div>
                                                )}
                                                {sessao.status === 'concluida' && (
                                                    <button className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.7rem', height: 'auto' }} onClick={() => handleReabrir(sessao)}>
                                                        ↩ Reabrir
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal Nova Sessão */}
            <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Nova(s) Sessão(ões)" size="lg">
                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label className="label">Escolha a Modalidade</label>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.75rem' }}>
                            {servicos.map(servico => (
                                <button
                                    key={servico.id}
                                    type="button"
                                    className={`card-flat ${formData.servico_id === servico.id ? 'active' : ''}`}
                                    style={{
                                        padding: '1rem',
                                        textAlign: 'left',
                                        border: formData.servico_id === servico.id ? '2px solid var(--primary)' : '1px solid var(--border)',
                                        backgroundColor: formData.servico_id === servico.id ? 'var(--primary-light)10' : 'transparent',
                                        transition: 'all 0.2s'
                                    }}
                                    onClick={() => setFormData({ ...formData, servico_id: servico.id })}
                                >
                                    <p style={{ fontWeight: '800', fontSize: '0.875rem', marginBottom: '0.25rem' }}>{servico.nome}</p>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{servico.duracao_minutos} min • {servico.tipo}</p>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div style={{ marginBottom: '1.5rem', backgroundColor: 'var(--bg-primary)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <h3 style={{ fontSize: '0.9375rem', fontWeight: '800', margin: 0 }}>Preenchimento Automático (Sugestão)</h3>
                        </div>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>Marque os dias e clique em &quot;Gerar Horários&quot; para preencher a lista abaixo automaticamente.</p>

                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
                            {[
                                { id: 1, label: 'Seg' }, { id: 2, label: 'Ter' }, { id: 3, label: 'Qua' },
                                { id: 4, label: 'Qui' }, { id: 5, label: 'Sex' }, { id: 6, label: 'Sáb' }, { id: 0, label: 'Dom' }
                            ].map(dia => (
                                <button
                                    key={dia.id}
                                    type="button"
                                    className={`btn ${formData.selectedDays.includes(dia.id) ? 'btn-primary' : 'btn-secondary'}`}
                                    style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', height: 'auto', minWidth: '50px' }}
                                    onClick={() => {
                                        const isSelected = formData.selectedDays.includes(dia.id)
                                        let newSelectedDays
                                        let newHorarios = [...formData.horarios]

                                        if (isSelected) {
                                            newSelectedDays = formData.selectedDays.filter(id => id !== dia.id)
                                            newHorarios = newHorarios.filter(h => h.dia_semana !== dia.id)
                                            if (newHorarios.length === 0) {
                                                const today = new Date()
                                                newHorarios = [{ dia_semana: today.getDay(), hora: '08:00', data_inicio: today.toISOString().split('T')[0] }]
                                            }
                                        } else {
                                            newSelectedDays = [...formData.selectedDays, dia.id].sort((a, b) => a - b)
                                            const today = new Date()
                                            const currentDay = today.getDay()
                                            const diff = (dia.id - currentDay + 7) % 7
                                            const nextDate = new Date(today)
                                            nextDate.setDate(today.getDate() + (diff === 0 && formData.horarios.length > 0 ? 0 : diff))

                                            // Se o primeiro slot for apenas o padrão e data for hoje, talvez queiramos substituir?
                                            // Por enquanto apenas adicionamos
                                            newHorarios.push({
                                                dia_semana: dia.id,
                                                hora: '08:00',
                                                data_inicio: nextDate.toISOString().split('T')[0]
                                            })
                                        }

                                        newHorarios.sort((a, b) => new Date(a.data_inicio) - new Date(b.data_inicio))
                                        setFormData({ ...formData, selectedDays: newSelectedDays, horarios: newHorarios })
                                    }}
                                >
                                    {dia.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div style={{ marginBottom: '1.5rem', backgroundColor: 'var(--bg-primary)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <h3 style={{ fontSize: '0.9375rem', fontWeight: '800', margin: 0 }}>Lista de Horários Gerados</h3>
                            <button type="button" className="btn btn-secondary" style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem', height: 'auto' }} onClick={addHorario}>+ Add Manual</button>
                        </div>
                        {formData.horarios.map((horario, index) => (
                            <div key={index} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', marginBottom: '1rem', paddingBottom: '1rem', borderBottom: index < formData.horarios.length - 1 ? '1px dashed var(--border)' : 'none' }}>
                                <div style={{ flex: 1 }}>
                                    <label className="label">Data</label>
                                    <input type="date" className="input" value={horario.data_inicio} onChange={(e) => updateHorario(index, 'data_inicio', e.target.value)} required />
                                </div>
                                <div style={{ width: '130px' }}>
                                    <label className="label">Hora de Início</label>
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

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
                        <div style={{
                            padding: '1.25rem',
                            backgroundColor: formData.notificar ? 'rgba(239, 68, 68, 0.08)' : 'var(--bg-secondary)',
                            borderRadius: 'var(--radius-md)',
                            border: formData.notificar ? '1px solid rgba(239, 68, 68, 0.2)' : '1px solid var(--border)',
                            transition: 'all 0.2s'
                        }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', marginBottom: '0.5rem' }}>
                                <input
                                    type="checkbox"
                                    checked={formData.notificar}
                                    onChange={(e) => setFormData({ ...formData, notificar: e.target.checked })}
                                    style={{ width: '1.25rem', height: '1.25rem', accentColor: 'var(--danger)' }}
                                />
                                <span style={{ fontWeight: '800', fontSize: '1rem', color: formData.notificar ? 'var(--danger)' : 'var(--text-primary)' }}>
                                    NOTIFICAR ALUNO AGORA VIA WHATSAPP?
                                </span>
                            </label>

                            <div style={{
                                marginLeft: '2rem',
                                padding: '0.75rem',
                                backgroundColor: 'rgba(0,0,0,0.03)',
                                borderRadius: 'var(--radius-sm)',
                                borderLeft: `4px solid ${formData.notificar ? 'var(--danger)' : 'var(--text-muted)'}`
                            }}>
                                <p style={{ fontSize: '0.8125rem', color: 'var(--text-primary)', fontWeight: '600', marginBottom: '0.25rem' }}>
                                    ⚠️ ATENÇÃO: Use com moderação!
                                </p>
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                                    Marque esta opção **SOMENTE** para agendamentos avulsos ou modificações pontuais.
                                    <br />
                                    Para agendar o mês inteiro, **deixe desmarcado** e use o botão <strong style={{ color: 'var(--primary)' }}>&quot;Avisar Agendamentos&quot;</strong> na tela anterior para enviar um único resumo e evitar spam.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                        <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)} style={{ padding: '0.625rem 1.5rem' }}>Cancelar</button>
                        <button type="submit" className="btn btn-primary" style={{ padding: '0.625rem 2.5rem' }}>Agendar</button>
                    </div>
                </form>
            </Modal>

            {/* Modal Detalhes */}
            <Modal isOpen={showDetailModal} onClose={() => setShowDetailModal(false)} title="Detalhes da Sessão">
                {selectedSessao && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        <div style={{ padding: '1.25rem', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Modalidade</p>
                                <p style={{ fontSize: '1.125rem', fontWeight: '800', color: 'var(--primary)' }}>{selectedSessao.servico?.nome}</p>
                            </div>
                            <span className={`badge ${getStatusBadge(selectedSessao.status)}`}>{selectedSessao.status}</span>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div>
                                <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Data</p>
                                <p style={{ fontWeight: '700' }}>{new Date(selectedSessao.data_hora_inicio).toLocaleDateString('pt-BR', { dateStyle: 'long' })}</p>
                            </div>
                            <div>
                                <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Horário</p>
                                <p style={{ fontWeight: '700' }}>{new Date(selectedSessao.data_hora_inicio).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
                            </div>
                        </div>

                        {selectedSessao.observacoes && (
                            <div style={{ padding: '1rem', backgroundColor: 'var(--primary-light)10', borderRadius: 'var(--radius-sm)', borderLeft: '4px solid var(--primary)' }}>
                                <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: '800' }}>OBSERVAÇÕES / JUSTIFICATIVA</p>
                                <p style={{ fontSize: '0.875rem', lineHeight: '1.5' }}>{selectedSessao.observacoes}</p>
                            </div>
                        )}

                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                            <button className="btn btn-secondary" style={{ flex: 1, gap: '0.5rem' }} onClick={() => {
                                setShowDetailModal(false);
                                const d = new Date(selectedSessao.data_hora_inicio);
                                setRemarcarData({ nova_data: d.toISOString().split('T')[0], nova_hora: d.toTimeString().slice(0, 5), observacoes: selectedSessao.observacoes || '' });
                                setShowRemarcarModal(true);
                            }}>
                                <Icons.TrendingUp size={16} />
                                <span>Remarcar / Editar</span>
                            </button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Modal Remarcar */}
            <Modal isOpen={showRemarcarModal} onClose={() => setShowRemarcarModal(false)} title="Remarcar Sessão">
                <form onSubmit={handleRemarcar}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                        <div><label className="label">Nova Data</label><input type="date" className="input" value={remarcarData.nova_data} onChange={(e) => setRemarcarData({ ...remarcarData, nova_data: e.target.value })} required /></div>
                        <div><label className="label">Nova Hora</label><input type="time" className="input" value={remarcarData.nova_hora} onChange={(e) => setRemarcarData({ ...remarcarData, nova_hora: e.target.value })} required /></div>
                    </div>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label className="label">O que aconteceu? (Opcional)</label>
                        <textarea className="input" rows="3" value={remarcarData.observacoes} onChange={(e) => setRemarcarData({ ...remarcarData, observacoes: e.target.value })} placeholder="Ex: Aluno solicitou mudança em cima da hora." />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                        <button type="button" className="btn btn-secondary" onClick={() => setShowRemarcarModal(false)}>Voltar</button>
                        <button type="submit" className="btn btn-primary" style={{ padding: '0.625rem 2rem' }}>Confirmar Alteração</button>
                    </div>
                </form>
            </Modal>

            {/* Modal Cancelar */}
            <Modal isOpen={showCancelDialog} onClose={() => setShowCancelDialog(false)} title="Cancelar Sessão">
                <form onSubmit={handleCancelar}>
                    <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                        <div style={{ width: '3.5rem', height: '3.5rem', borderRadius: '50%', backgroundColor: 'var(--danger)10', color: 'var(--danger)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                            <Icons.Alert size={24} />
                        </div>
                        <h3 style={{ fontWeight: '800' }}>Confirmar Cancelamento?</h3>
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Esta ação não pode ser desfeita.</p>
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label className="label">Motivo (Opcional)</label>
                        <textarea className="input" rows="3" value={cancelarData.observacoes} onChange={(e) => setCancelarData({ ...cancelarData, observacoes: e.target.value })} placeholder="Ex: Doença, imprevisto, etc." />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem' }}>
                        <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowCancelDialog(false)}>Voltar</button>
                        <button type="submit" className="btn btn-danger" style={{ flex: 1 }}>Sim, Cancelar</button>
                    </div>
                </form>
            </Modal>

            <ConfirmDialog
                isOpen={showConcluirDialog}
                onClose={() => setShowConcluirDialog(false)}
                onConfirm={handleConcluir}
                title="Concluir Aula"
                message="Deseja marcar esta sessão como concluída?"
                confirmText="Sim, Concluir"
            />
            <ConfirmDialog
                isOpen={showLimparDialog}
                onClose={() => setShowLimparDialog(false)}
                onConfirm={handleLimparAgenda}
                title="Limpar Toda a Agenda Futura"
                message={`Tem certeza que deseja EXCLUIR permanentemente todas as aulas futuras de ${aluno.nome}? Esta ação não pode ser desfeita.`}
                confirmText="Sim, Limpar Tudo"
            />
        </div>
    )
}
