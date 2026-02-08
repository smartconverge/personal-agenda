'use client'

import { useEffect, useState } from 'react'
import api from '@/lib/api'
import Modal from '@/components/Modal'
import ConfirmDialog from '@/components/ConfirmDialog'
import { useToast } from '@/components/Toast'

export default function AgendaPage() {
    const { showToast } = useToast()
    const [sessoes, setSessoes] = useState([])
    const [alunos, setAlunos] = useState([])
    const [servicos, setServicos] = useState([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [showDetailModal, setShowDetailModal] = useState(false)
    const [showCancelDialog, setShowCancelDialog] = useState(false)
    const [showRemarcarModal, setShowRemarcarModal] = useState(false)
    const [selectedSessao, setSelectedSessao] = useState(null)
    const [formData, setFormData] = useState({
        aluno_id: '',
        servico_id: '',
        data: '',
        hora: '',
        recorrente: false,
        meses_recorrencia: 3
    })
    const [remarcarData, setRemarcarData] = useState({
        nova_data: '',
        nova_hora: ''
    })
    const [viewMode, setViewMode] = useState('semana') // 'dia', 'semana', 'mes'
    const [currentDate, setCurrentDate] = useState(new Date())

    useEffect(() => {
        loadData()
    }, [currentDate, viewMode])

    const loadData = async () => {
        try {
            const [sessoesRes, alunosRes, servicosRes] = await Promise.all([
                api.get('/sessoes'),
                api.get('/alunos'),
                api.get('/servicos')
            ])
            setSessoes(sessoesRes.data.data || [])
            setAlunos(alunosRes.data.data || [])
            setServicos(servicosRes.data.data || [])
        } catch (error) {
            showToast('Erro ao carregar dados', 'error')
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            const dataHoraInicio = `${formData.data}T${formData.hora}:00`

            const payload = {
                aluno_id: formData.aluno_id,
                servico_id: formData.servico_id,
                data_hora_inicio: dataHoraInicio,
                recorrente: formData.recorrente,
                meses_recorrencia: formData.recorrente ? formData.meses_recorrencia : undefined
            }

            await api.post('/sessoes', payload)
            showToast(formData.recorrente ? 'Sessões recorrentes criadas com sucesso!' : 'Sessão criada com sucesso!', 'success')
            setShowModal(false)
            resetForm()
            loadData()
        } catch (error) {
            showToast(error.response?.data?.error || 'Erro ao criar sessão', 'error')
        }
    }

    const handleCancelar = async () => {
        try {
            await api.put(`/sessoes/${selectedSessao.id}/cancelar`)
            showToast('Sessão cancelada com sucesso!', 'success')
            loadData()
        } catch (error) {
            showToast('Erro ao cancelar sessão', 'error')
        }
    }

    const handleRemarcar = async (e) => {
        e.preventDefault()
        try {
            const novaDataHora = `${remarcarData.nova_data}T${remarcarData.nova_hora}:00`
            await api.put(`/sessoes/${selectedSessao.id}/remarcar`, {
                nova_data_hora_inicio: novaDataHora
            })
            showToast('Sessão remarcada com sucesso!', 'success')
            setShowRemarcarModal(false)
            loadData()
        } catch (error) {
            showToast(error.response?.data?.error || 'Erro ao remarcar sessão', 'error')
        }
    }

    const handleConcluir = async (sessao) => {
        try {
            await api.put(`/sessoes/${sessao.id}/concluir`)
            showToast('Sessão concluída com sucesso!', 'success')
            loadData()
        } catch (error) {
            showToast('Erro ao concluir sessão', 'error')
        }
    }

    const openNewModal = () => {
        resetForm()
        setShowModal(true)
    }

    const resetForm = () => {
        setFormData({
            aluno_id: '',
            servico_id: '',
            data: new Date().toISOString().split('T')[0],
            hora: '08:00',
            recorrente: false,
            meses_recorrencia: 3
        })
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

    const filteredSessoes = sessoes.filter(sessao => {
        const sessaoDate = new Date(sessao.data_hora_inicio)
        const current = new Date(currentDate)

        if (viewMode === 'dia') {
            return sessaoDate.toDateString() === current.toDateString()
        } else if (viewMode === 'semana') {
            const weekStart = new Date(current)
            weekStart.setDate(current.getDate() - current.getDay())
            const weekEnd = new Date(weekStart)
            weekEnd.setDate(weekStart.getDate() + 7)
            return sessaoDate >= weekStart && sessaoDate < weekEnd
        } else {
            return sessaoDate.getMonth() === current.getMonth() &&
                sessaoDate.getFullYear() === current.getFullYear()
        }
    }).sort((a, b) => new Date(a.data_hora_inicio) - new Date(b.data_hora_inicio))

    const navigateDate = (direction) => {
        const newDate = new Date(currentDate)
        if (viewMode === 'dia') {
            newDate.setDate(newDate.getDate() + direction)
        } else if (viewMode === 'semana') {
            newDate.setDate(newDate.getDate() + (direction * 7))
        } else {
            newDate.setMonth(newDate.getMonth() + direction)
        }
        setCurrentDate(newDate)
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h1 style={{ fontSize: '1.875rem', fontWeight: '700', margin: 0 }}>
                    Agenda
                </h1>
                <button className="btn btn-primary" onClick={openNewModal}>
                    + Nova Sessão
                </button>
            </div>

            {/* Controles de Visualização */}
            <div className="card" style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                            className={`btn ${viewMode === 'dia' ? 'btn-primary' : 'btn-secondary'}`}
                            onClick={() => setViewMode('dia')}
                        >
                            Dia
                        </button>
                        <button
                            className={`btn ${viewMode === 'semana' ? 'btn-primary' : 'btn-secondary'}`}
                            onClick={() => setViewMode('semana')}
                        >
                            Semana
                        </button>
                        <button
                            className={`btn ${viewMode === 'mes' ? 'btn-primary' : 'btn-secondary'}`}
                            onClick={() => setViewMode('mes')}
                        >
                            Mês
                        </button>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <button className="btn btn-secondary" onClick={() => navigateDate(-1)}>
                            ◀
                        </button>
                        <span style={{ fontWeight: '600', minWidth: '200px', textAlign: 'center' }}>
                            {currentDate.toLocaleDateString('pt-BR', {
                                day: '2-digit',
                                month: 'long',
                                year: 'numeric'
                            })}
                        </span>
                        <button className="btn btn-secondary" onClick={() => navigateDate(1)}>
                            ▶
                        </button>
                        <button className="btn btn-secondary" onClick={() => setCurrentDate(new Date())}>
                            Hoje
                        </button>
                    </div>
                </div>
            </div>

            {/* Lista de Sessões */}
            <div className="card">
                {filteredSessoes.length === 0 ? (
                    <p className="text-muted">Nenhuma sessão agendada para este período</p>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Data/Hora</th>
                                    <th>Aluno</th>
                                    <th>Serviço</th>
                                    <th>Status</th>
                                    <th>Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredSessoes.map((sessao) => (
                                    <tr key={sessao.id}>
                                        <td style={{ fontWeight: '500' }}>
                                            {new Date(sessao.data_hora_inicio).toLocaleString('pt-BR', {
                                                day: '2-digit',
                                                month: '2-digit',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </td>
                                        <td>{sessao.aluno?.nome || 'N/A'}</td>
                                        <td>{sessao.servico?.nome || 'N/A'}</td>
                                        <td>
                                            <span className={`badge ${getStatusBadge(sessao.status)}`}>
                                                {getStatusIcon(sessao.status)} {sessao.status}
                                            </span>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                                <button
                                                    className="btn btn-sm btn-secondary"
                                                    onClick={() => {
                                                        setSelectedSessao(sessao)
                                                        setShowDetailModal(true)
                                                    }}
                                                >
                                                    👁️ Ver
                                                </button>
                                                {sessao.status === 'agendada' && (
                                                    <>
                                                        <button
                                                            className="btn btn-sm btn-success"
                                                            onClick={() => handleConcluir(sessao)}
                                                        >
                                                            ✅ Concluir
                                                        </button>
                                                        <button
                                                            className="btn btn-sm btn-warning"
                                                            onClick={() => {
                                                                setSelectedSessao(sessao)
                                                                const dataHora = new Date(sessao.data_hora_inicio)
                                                                setRemarcarData({
                                                                    nova_data: dataHora.toISOString().split('T')[0],
                                                                    nova_hora: dataHora.toTimeString().slice(0, 5)
                                                                })
                                                                setShowRemarcarModal(true)
                                                            }}
                                                        >
                                                            🔄 Remarcar
                                                        </button>
                                                        <button
                                                            className="btn btn-sm btn-danger"
                                                            onClick={() => {
                                                                setSelectedSessao(sessao)
                                                                setShowCancelDialog(true)
                                                            }}
                                                        >
                                                            ❌ Cancelar
                                                        </button>
                                                    </>
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
            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title="Nova Sessão"
                size="md"
            >
                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '1rem' }}>
                        <label className="label">Aluno</label>
                        <select
                            className="input"
                            value={formData.aluno_id}
                            onChange={(e) => setFormData({ ...formData, aluno_id: e.target.value })}
                            required
                        >
                            <option value="">Selecione um aluno</option>
                            {alunos.map(aluno => (
                                <option key={aluno.id} value={aluno.id}>{aluno.nome}</option>
                            ))}
                        </select>
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                        <label className="label">Serviço</label>
                        <select
                            className="input"
                            value={formData.servico_id}
                            onChange={(e) => setFormData({ ...formData, servico_id: e.target.value })}
                            required
                        >
                            <option value="">Selecione um serviço</option>
                            {servicos.map(servico => (
                                <option key={servico.id} value={servico.id}>
                                    {servico.nome} ({servico.duracao_minutos} min)
                                </option>
                            ))}
                        </select>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                        <div>
                            <label className="label">Data</label>
                            <input
                                type="date"
                                className="input"
                                value={formData.data}
                                onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label className="label">Hora</label>
                            <input
                                type="time"
                                className="input"
                                value={formData.hora}
                                onChange={(e) => setFormData({ ...formData, hora: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                            <input
                                type="checkbox"
                                checked={formData.recorrente}
                                onChange={(e) => setFormData({ ...formData, recorrente: e.target.checked })}
                            />
                            <span>Sessão recorrente (semanal)</span>
                        </label>
                    </div>

                    {formData.recorrente && (
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label className="label">Duração da recorrência (meses)</label>
                            <input
                                type="number"
                                className="input"
                                min="1"
                                max="12"
                                value={formData.meses_recorrencia}
                                onChange={(e) => setFormData({ ...formData, meses_recorrencia: parseInt(e.target.value) })}
                            />
                            <p className="text-muted" style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>
                                Serão criadas {formData.meses_recorrencia * 4} sessões (4 por mês)
                            </p>
                        </div>
                    )}

                    <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                        <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                            Cancelar
                        </button>
                        <button type="submit" className="btn btn-primary">
                            Criar
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Modal Detalhes */}
            <Modal
                isOpen={showDetailModal}
                onClose={() => setShowDetailModal(false)}
                title="Detalhes da Sessão"
            >
                {selectedSessao && (
                    <div>
                        <div style={{ marginBottom: '1rem' }}>
                            <strong>Aluno:</strong> {selectedSessao.aluno?.nome}
                        </div>
                        <div style={{ marginBottom: '1rem' }}>
                            <strong>Serviço:</strong> {selectedSessao.servico?.nome}
                        </div>
                        <div style={{ marginBottom: '1rem' }}>
                            <strong>Data/Hora:</strong> {new Date(selectedSessao.data_hora_inicio).toLocaleString('pt-BR')}
                        </div>
                        <div style={{ marginBottom: '1rem' }}>
                            <strong>Status:</strong>{' '}
                            <span className={`badge ${getStatusBadge(selectedSessao.status)}`}>
                                {selectedSessao.status}
                            </span>
                        </div>
                        {selectedSessao.recorrencia && (
                            <div style={{ marginBottom: '1rem' }}>
                                <strong>Recorrência:</strong> {selectedSessao.recorrencia}
                            </div>
                        )}
                    </div>
                )}
            </Modal>

            {/* Modal Remarcar */}
            <Modal
                isOpen={showRemarcarModal}
                onClose={() => setShowRemarcarModal(false)}
                title="Remarcar Sessão"
            >
                <form onSubmit={handleRemarcar}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                        <div>
                            <label className="label">Nova Data</label>
                            <input
                                type="date"
                                className="input"
                                value={remarcarData.nova_data}
                                onChange={(e) => setRemarcarData({ ...remarcarData, nova_data: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label className="label">Nova Hora</label>
                            <input
                                type="time"
                                className="input"
                                value={remarcarData.nova_hora}
                                onChange={(e) => setRemarcarData({ ...remarcarData, nova_hora: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                        <button type="button" className="btn btn-secondary" onClick={() => setShowRemarcarModal(false)}>
                            Cancelar
                        </button>
                        <button type="submit" className="btn btn-primary">
                            Remarcar
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Dialog Cancelar */}
            <ConfirmDialog
                isOpen={showCancelDialog}
                onClose={() => setShowCancelDialog(false)}
                onConfirm={handleCancelar}
                title="Cancelar Sessão"
                message={`Tem certeza que deseja cancelar a sessão de ${selectedSessao?.aluno?.nome}?`}
                confirmText="Cancelar Sessão"
                danger
            />
        </div>
    )
}
