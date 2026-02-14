'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import api from '@/lib/api'
import Modal from '@/components/Modal'
import ConfirmDialog from '@/components/ConfirmDialog'
import { useToast } from '@/components/Toast'

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
    const [showCancelDialog, setShowCancelDialog] = useState(false) // This acts as the Cancel Modal now
    const [showRemarcarModal, setShowRemarcarModal] = useState(false)
    const [showConcluirDialog, setShowConcluirDialog] = useState(false)
    const [selectedSessao, setSelectedSessao] = useState(null)

    // Form Creation
    const [formData, setFormData] = useState({
        servico_id: '',
        recorrente: false,
        meses_recorrencia: 3,
        horarios: [{ dia_semana: 1, hora: '08:00', data_inicio: new Date().toISOString().split('T')[0] }]
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
            // current date
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
        return { start: start.toISOString(), end: end.toISOString() }
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
            const promises = formData.horarios.map(async (horario) => {
                const dataHoraInicio = `${horario.data_inicio}T${horario.hora}:00`
                const payload = {
                    aluno_id: id,
                    servico_id: formData.servico_id,
                    data_hora_inicio: dataHoraInicio,
                    recorrente: formData.recorrente,
                    meses_recorrencia: formData.recorrente ? formData.meses_recorrencia : undefined
                }
                return api.post('/sessoes', payload)
            })
            await Promise.all(promises)
            showToast('Sessões criadas com sucesso!', 'success')
            setShowModal(false)
            resetForm()
            loadSessoes()
        } catch (error) {
            showToast('Erro ao criar sessões. Verifique conflitos.', 'error')
        }
    }

    const handleCancelar = async (e) => {
        e.preventDefault()
        try {
            await api.put(`/sessoes/${selectedSessao.id}/cancelar`, {
                observacoes: cancelarData.observacoes
            })
            showToast('Sessão cancelada com sucesso!', 'success')
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
            showToast('Sessão remarcada com sucesso!', 'success')
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
            showToast('Sessão concluída com sucesso!', 'success')
            setShowConcluirDialog(false)
            loadSessoes()
        } catch (error) {
            showToast('Erro ao concluir sessão', 'error')
        }
    }

    const handleReabrir = async (sessao) => {
        try {
            await api.put(`/sessoes/${sessao.id}`, { status: 'agendada' })
            showToast('Sessão reaberta com sucesso!', 'success')
            loadSessoes()
        } catch (error) {
            showToast('Erro ao reabrir sessão', 'error')
        }
    }

    const resetForm = () => {
        setFormData({
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
            case 'agendada': return '📅'
            case 'concluida': return '✅'
            case 'cancelada': return '❌'
            case 'remarcada': return '🔄'
            default: return '📝'
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
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button className="btn btn-secondary" onClick={() => router.push('/dashboard/alunos')}>⬅ Voltar</button>
                    <div>
                        <h1 style={{ fontSize: '1.875rem', fontWeight: '700', margin: 0 }}>{aluno.nome}</h1>
                        <p className="text-muted" style={{ margin: 0 }}>Gestão de Aulas</p>
                    </div>
                </div>
                <button className="btn btn-primary" onClick={() => { resetForm(); setShowModal(true); }}>+ Nova Sessão</button>
            </div>

            <div className="card" style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button className={`btn ${viewMode === 'dia' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setViewMode('dia')}>Dia</button>
                        <button className={`btn ${viewMode === 'semana' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setViewMode('semana')}>Semana</button>
                        <button className={`btn ${viewMode === 'mes' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setViewMode('mes')}>Mês</button>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <button className="btn btn-secondary" onClick={() => navigateDate(-1)}>◀</button>
                        <span style={{ fontWeight: '600', minWidth: '200px', textAlign: 'center' }}>{currentDate.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
                        <button className="btn btn-secondary" onClick={() => navigateDate(1)}>▶</button>
                        <button className="btn btn-secondary" onClick={() => setCurrentDate(new Date())}>Hoje</button>
                    </div>
                </div>
            </div>

            <div className="card">
                {sortedSessoes.length === 0 ? (
                    <p className="text-muted">Nenhuma sessão encontrada para este período</p>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Data/Hora</th>
                                    <th>Serviço</th>
                                    <th>Status</th>
                                    <th>Obs</th>
                                    <th>Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sortedSessoes.map((sessao) => (
                                    <tr key={sessao.id}>
                                        <td style={{ fontWeight: '500' }}>
                                            {new Date(sessao.data_hora_inicio).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                                        </td>
                                        <td>{sessao.servico?.nome || 'N/A'}</td>
                                        <td><span className={`badge ${getStatusBadge(sessao.status)}`}>{getStatusIcon(sessao.status)} {sessao.status}</span></td>
                                        <td>{sessao.observacoes ? <span title={sessao.observacoes}>📝</span> : '-'}</td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                                <button className="btn btn-sm btn-secondary" onClick={() => { setSelectedSessao(sessao); setShowDetailModal(true); }}>👁️ Ver</button>
                                                {sessao.status === 'agendada' && (
                                                    <>
                                                        <button className="btn btn-sm btn-success" onClick={() => { setSelectedSessao(sessao); setShowConcluirDialog(true); }}>✅ Concluir</button>
                                                        <button className="btn btn-sm btn-warning" onClick={() => {
                                                            setSelectedSessao(sessao);
                                                            const d = new Date(sessao.data_hora_inicio);
                                                            setRemarcarData({ nova_data: d.toISOString().split('T')[0], nova_hora: d.toTimeString().slice(0, 5), observacoes: '' });
                                                            setShowRemarcarModal(true);
                                                        }}>🔄 Remarcar</button>
                                                        <button className="btn btn-sm btn-danger" onClick={() => {
                                                            setSelectedSessao(sessao);
                                                            setCancelarData({ observacoes: '' });
                                                            setShowCancelDialog(true);
                                                        }}>❌ Cancelar</button>
                                                    </>
                                                )}
                                                {sessao.status === 'concluida' && (
                                                    <button className="btn btn-sm btn-secondary" onClick={() => handleReabrir(sessao)} title="Desfazer conclusão">↩️ Desfazer</button>
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
                    <div style={{ marginBottom: '1rem' }}>
                        <label className="label">Serviço</label>
                        <select className="input" value={formData.servico_id} onChange={(e) => setFormData({ ...formData, servico_id: e.target.value })} required>
                            <option value="">Selecione um serviço</option>
                            {servicos.map(servico => <option key={servico.id} value={servico.id}>{servico.nome} ({servico.duracao_minutos} min)</option>)}
                        </select>
                    </div>
                    <div style={{ marginBottom: '1.5rem', border: '1px solid #eee', padding: '1rem', borderRadius: '0.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                            <h3 style={{ fontSize: '1rem', margin: 0 }}>Horários</h3>
                            <button type="button" className="btn btn-sm btn-secondary" onClick={addHorario}>+ Adicionar Horário</button>
                        </div>
                        {formData.horarios.map((horario, index) => (
                            <div key={index} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px dashed #eee' }}>
                                <div style={{ flex: 1 }}>
                                    <label className="label">Data de Início</label>
                                    <input type="date" className="input" value={horario.data_inicio} onChange={(e) => updateHorario(index, 'data_inicio', e.target.value)} required />
                                </div>
                                <div style={{ width: '120px' }}>
                                    <label className="label">Hora</label>
                                    <input type="time" className="input" value={horario.hora} onChange={(e) => updateHorario(index, 'hora', e.target.value)} required />
                                </div>
                                {formData.horarios.length > 1 && <button type="button" className="btn btn-danger" style={{ height: '42px' }} onClick={() => removeHorario(index)}>🗑️</button>}
                            </div>
                        ))}
                    </div>
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                            <input type="checkbox" checked={formData.recorrente} onChange={(e) => setFormData({ ...formData, recorrente: e.target.checked })} />
                            <span>Repetir semanalmente?</span>
                        </label>
                    </div>
                    {formData.recorrente && (
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label className="label">Por quantos meses?</label>
                            <input type="number" className="input" min="1" max="12" value={formData.meses_recorrencia} onChange={(e) => setFormData({ ...formData, meses_recorrencia: parseInt(e.target.value) })} />
                        </div>
                    )}
                    <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                        <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                        <button type="submit" className="btn btn-primary">Agendar</button>
                    </div>
                </form>
            </Modal>

            {/* Modal Detalhes */}
            <Modal isOpen={showDetailModal} onClose={() => setShowDetailModal(false)} title="Detalhes da Sessão">
                {selectedSessao && (
                    <div>
                        <div style={{ marginBottom: '0.5rem' }}><strong>Serviço:</strong> {selectedSessao.servico?.nome}</div>
                        <div style={{ marginBottom: '0.5rem' }}><strong>Data:</strong> {new Date(selectedSessao.data_hora_inicio).toLocaleString('pt-BR')}</div>
                        <div style={{ marginBottom: '1rem' }}><strong>Status:</strong> {selectedSessao.status}</div>
                        {selectedSessao.observacoes && (
                            <div style={{ marginBottom: '1rem', padding: '0.5rem', background: '#f5f5f5', borderRadius: '4px' }}>
                                <strong>Observações:</strong>
                                <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{selectedSessao.observacoes}</p>
                            </div>
                        )}
                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                            <button className="btn btn-warning" onClick={() => {
                                setShowDetailModal(false);
                                const d = new Date(selectedSessao.data_hora_inicio);
                                setRemarcarData({ nova_data: d.toISOString().split('T')[0], nova_hora: d.toTimeString().slice(0, 5), observacoes: selectedSessao.observacoes || '' });
                                setShowRemarcarModal(true);
                            }}>Editar / Remarcar</button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Modal Remarcar */}
            <Modal isOpen={showRemarcarModal} onClose={() => setShowRemarcarModal(false)} title="Remarcar Sessão">
                <form onSubmit={handleRemarcar}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                        <div><label className="label">Nova Data</label><input type="date" className="input" value={remarcarData.nova_data} onChange={(e) => setRemarcarData({ ...remarcarData, nova_data: e.target.value })} required /></div>
                        <div><label className="label">Nova Hora</label><input type="time" className="input" value={remarcarData.nova_hora} onChange={(e) => setRemarcarData({ ...remarcarData, nova_hora: e.target.value })} required /></div>
                    </div>
                    <div style={{ marginBottom: '1rem' }}>
                        <label className="label">Justificativa / Observação (Opcional)</label>
                        <textarea className="input" rows="3" value={remarcarData.observacoes} onChange={(e) => setRemarcarData({ ...remarcarData, observacoes: e.target.value })} placeholder="Ex: Aluno solicitou mudança, Imprevisto, etc." />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                        <button type="button" className="btn btn-secondary" onClick={() => setShowRemarcarModal(false)}>Cancelar</button>
                        <button type="submit" className="btn btn-primary">Confirmar</button>
                    </div>
                </form>
            </Modal>

            {/* Modal Cancelar (Substituindo ConfirmDialog simples) */}
            <Modal isOpen={showCancelDialog} onClose={() => setShowCancelDialog(false)} title="Cancelar Sessão">
                <form onSubmit={handleCancelar}>
                    <p style={{ marginBottom: '1rem' }}>Tem certeza que deseja cancelar esta sessão?</p>
                    <div style={{ marginBottom: '1rem' }}>
                        <label className="label">Motivo do Cancelamento (Opcional)</label>
                        <textarea className="input" rows="3" value={cancelarData.observacoes} onChange={(e) => setCancelarData({ ...cancelarData, observacoes: e.target.value })} placeholder="Ex: Aluno doente, Feriado, etc." />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                        <button type="button" className="btn btn-secondary" onClick={() => setShowCancelDialog(false)}>Voltar</button>
                        <button type="submit" className="btn btn-danger">Sim, Cancelar</button>
                    </div>
                </form>
            </Modal>

            <ConfirmDialog isOpen={showConcluirDialog} onClose={() => setShowConcluirDialog(false)} onConfirm={handleConcluir} title="Concluir Sessão" message="Marcar sessão como concluída?" confirmText="Sim, Concluir" />
        </div>
    )
}
