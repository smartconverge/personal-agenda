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
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '2rem',
                gap: '1rem',
                flexWrap: 'wrap'
            }}>
                <div>
                    <h1 style={{
                        fontSize: '2rem',
                        fontWeight: '800',
                        marginBottom: '0.25rem',
                        background: 'linear-gradient(135deg, var(--primary), var(--primary-light))',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text'
                    }}>
                        Agenda Geral
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                        Visualize e gerencie todos os seus horários
                    </p>
                </div>
                <button
                    className="btn btn-primary"
                    onClick={() => { resetForm(); setShowModal(true); }}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.25rem' }}
                >
                    <Icons.Plus size={18} />
                    <span>Nova Sessão</span>
                </button>
            </div>

            {/* View Controls */}
            <div className="card-flat" style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
                    <div style={{ display: 'flex', background: 'var(--bg-primary)', padding: '0.25rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                        {[
                            { id: 'dia', label: 'Dia' },
                            { id: 'semana', label: 'Semana' },
                            { id: 'mes', label: 'Mês' },
                        ].map((v) => (
                            <button
                                key={v.id}
                                className={`btn ${viewMode === v.id ? 'btn-primary' : ''}`}
                                style={{
                                    padding: '0.5rem 1.25rem',
                                    fontSize: '0.8125rem',
                                    height: 'auto',
                                    background: viewMode === v.id ? 'var(--primary)' : 'transparent',
                                    color: viewMode === v.id ? 'white' : 'var(--text-secondary)',
                                    boxShadow: 'none'
                                }}
                                onClick={() => setViewMode(v.id)}
                            >
                                {v.label}
                            </button>
                        ))}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <button className="btn-icon btn-icon-secondary" onClick={() => navigateDate(-1)}><Icons.Menu size={16} style={{ transform: 'rotate(90deg)' }} /></button>
                        <div style={{ textAlign: 'center', minWidth: '180px' }}>
                            <p style={{ fontWeight: '800', fontSize: '1rem', color: 'var(--text-primary)' }}>
                                {viewMode === 'dia' ? currentDate.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' }) :
                                    viewMode === 'semana' ? 'Esta Semana' :
                                        currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                            </p>
                            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                {currentDate.getFullYear()}
                            </p>
                        </div>
                        <button className="btn-icon btn-icon-secondary" onClick={() => navigateDate(1)}><Icons.Menu size={16} style={{ transform: 'rotate(-90deg)' }} /></button>
                        <button
                            className="btn btn-secondary"
                            style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem', height: 'auto', marginLeft: '0.5rem' }}
                            onClick={() => setCurrentDate(new Date())}
                        >
                            Hoje
                        </button>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="card-flat" style={{ padding: '0', overflow: 'hidden' }}>
                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}><div className="spinner" /></div>
                ) : filteredSessoes.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '5rem 2rem' }}>
                        <div style={{ width: '4rem', height: '4rem', backgroundColor: 'var(--bg-secondary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                            <Icons.Calendar size={32} color="var(--text-muted)" />
                        </div>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '0.5rem' }}>Tudo limpo por aqui!</h3>
                        <p style={{ color: 'var(--text-muted)' }}>Você não possui sessões agendadas para este período.</p>
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table className="table" style={{ margin: 0 }}>
                            <thead>
                                <tr>
                                    <th style={{ paddingLeft: '1.5rem' }}>Horário</th>
                                    <th>Aluno</th>
                                    <th>Serviço</th>
                                    <th>Status</th>
                                    <th style={{ paddingRight: '1.5rem', textAlign: 'right' }}>Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredSessoes.map((sessao) => (
                                    <tr key={sessao.id} className="table-row-hover">
                                        <td style={{ paddingLeft: '1.5rem' }}>
                                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                <span style={{ fontWeight: '800', color: 'var(--text-primary)', fontSize: '1rem' }}>
                                                    {new Date(sessao.data_hora_inicio).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                                                    {new Date(sessao.data_hora_inicio).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                                                </span>
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                <div className="avatar avatar-sm" style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--primary)', fontSize: '0.75rem' }}>
                                                    {sessao.aluno?.nome?.substring(0, 2).toUpperCase()}
                                                </div>
                                                <button
                                                    onClick={() => router.push(`/dashboard/alunos/${sessao.aluno_id}`)}
                                                    className="text-link"
                                                    style={{ fontWeight: '700', fontSize: '0.9375rem' }}
                                                >
                                                    {sessao.aluno?.nome || 'N/A'}
                                                </button>
                                            </div>
                                        </td>
                                        <td>
                                            <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{sessao.servico?.nome || 'N/A'}</span>
                                        </td>
                                        <td>
                                            <span className={`badge ${getStatusBadge(sessao.status)}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                                                {getStatusIcon(sessao.status)}
                                                {sessao.status.charAt(0).toUpperCase() + sessao.status.slice(1)}
                                            </span>
                                        </td>
                                        <td style={{ paddingRight: '1.5rem', textAlign: 'right' }}>
                                            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                                <button className="btn-icon btn-icon-secondary" onClick={() => { setSelectedSessao(sessao); setShowDetailModal(true); }} title="Ver detalhes">
                                                    <Icons.Info size={16} />
                                                </button>
                                                {sessao.status === 'agendada' && (
                                                    <button className="btn-icon btn-icon-primary" onClick={() => { setSelectedSessao(sessao); setShowConcluirDialog(true); }} title="Concluir">
                                                        <Icons.CheckCircle size={16} />
                                                    </button>
                                                )}
                                                {sessao.status === 'concluida' && (
                                                    <button className="btn-icon btn-icon-secondary" onClick={() => handleReabrir(sessao)} title="Desfazer conclusão">
                                                        <Icons.Logout size={16} style={{ transform: 'rotate(180deg)' }} />
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

            {/* Modals similar to existing but with premium styling */}
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
        </div>
    )
}
