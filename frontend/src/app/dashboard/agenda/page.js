'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'
import Modal from '@/components/Modal'
import ConfirmDialog from '@/components/ConfirmDialog'
import { useToast } from '@/components/Toast'
import { Icons } from '@/components/Icons'
import styles from './Agenda.module.css'

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
            const diff = start.getDate() - day + (day === 0 ? -6 : 1) // Start at Monday
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

    const filteredSessoes = sessoes.filter(sessao => {
        if (['cancelada', 'remarcada'].includes(sessao.status)) return false
        return true
    }).sort((a, b) => new Date(a.data_hora_inicio) - new Date(b.data_hora_inicio))

    return (
        <div className={styles.container}>
            <div className={styles.actionBar}>
                <button
                    className="btn btn-primary"
                    onClick={() => { resetForm(); setShowModal(true); }}
                >
                    <Icons.Plus size={18} />
                    <span>Nova Sessão</span>
                </button>
            </div>

            {/* View Controls & Navigation */}
            <div className={styles.controlsCard}>
                <div className={styles.controlsWrapper}>
                    <div className={styles.dateNav}>
                        <div className={styles.navGroup}>
                            <button
                                className="btn btn-icon btn-icon-primary"
                                onClick={() => navigateDate(-1)}
                                title="Anterior"
                            >
                                <Icons.ChevronLeft size={20} />
                            </button>
                            <button
                                className="btn btn-icon btn-icon-primary"
                                onClick={() => navigateDate(1)}
                                title="Próximo"
                            >
                                <Icons.ChevronRight size={20} />
                            </button>
                        </div>

                        <div className={styles.datepickerWrapper}>
                            <input
                                type="date"
                                className={styles.datepickerInput}
                                value={currentDate.toISOString().split('T')[0]}
                                onChange={(e) => {
                                    if (e.target.value) {
                                        const [y, m, d] = e.target.value.split('-').map(Number);
                                        setCurrentDate(new Date(y, m - 1, d));
                                    }
                                }}
                            />
                            <h2 className={styles.dateDisplay}>
                                {currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }).replace(/^\w/, c => c.toUpperCase())}
                                <Icons.ChevronDown size={16} color="var(--text-muted)" />
                            </h2>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className={styles.viewSwitcher}>
                            {['semana', 'mes'].map((v) => (
                                <button
                                    key={v}
                                    onClick={() => setViewMode(v)}
                                    className={`${styles.viewBtn} ${viewMode === v ? styles['viewBtn--active'] : ''}`}
                                >
                                    {v === 'semana' ? 'Semana' : 'Mês'}
                                </button>
                            ))}
                        </div>
                        <button
                            className="btn btn-secondary !h-10"
                            onClick={() => setCurrentDate(new Date())}
                        >
                            Hoje
                        </button>
                    </div>
                </div>
            </div>

            {/* Calendar Content */}
            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="spinner !w-12 !h-12" />
                </div>
            ) : viewMode === 'semana' ? (
                <div className={styles.calendarGrid}>
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
                                <div key={i} className={`${styles.calendarCell} ${styles['calendarCell--header']}`}>
                                    <p className={styles.dayLabel}>
                                        {date.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '')}
                                    </p>
                                    <div className={`${styles.dayNumber} ${isToday ? styles['dayNumber--today'] : ''}`}>
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
                                <div key={i} className={styles.calendarCell}>
                                    {daySessoes.length === 0 ? (
                                        <div className="flex justify-center items-center h-full opacity-10">
                                            <Icons.Calendar size={32} className="text-muted" />
                                        </div>
                                    ) : (
                                        daySessoes.map(sessao => (
                                            <div
                                                key={sessao.id}
                                                className={`${styles.sessionCardMini} ${styles[`sessionCardMini--${sessao.status === 'agendada' ? 'agendada' : sessao.status === 'concluida' ? 'concluida' : 'warning'}`]}`}
                                                onClick={() => { setSelectedSessao(sessao); setShowDetailModal(true); }}
                                                title={`${new Date(sessao.data_hora_inicio).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} - ${sessao.aluno?.nome}`}
                                            >
                                                <span className="font-bold">
                                                    {new Date(sessao.data_hora_inicio).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                                <span className="truncate">{sessao.aluno?.nome}</span>
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
                <div className={styles.calendarGrid}>
                    {/* Headers */}
                    {['SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SAB', 'DOM'].map((day, i) => (
                        <div key={i} className={`${styles.calendarCell} ${styles['calendarCell--header']}`}>
                            <span className={styles.dayLabel}>{day}</span>
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
                            cells.push(<div key={`pad-${i}`} className={styles.calendarCell} style={{ opacity: 0.3 }}></div>)
                        }

                        // Days
                        for (let d = 1; d <= daysInMonth; d++) {
                            const dateStr = new Date(year, month, d).toISOString().split('T')[0]
                            const daySessoes = filteredSessoes.filter(s => s.data_hora_inicio.startsWith(dateStr))
                            const isToday = new Date().toISOString().split('T')[0] === dateStr

                            cells.push(
                                <div key={d} className={styles.calendarCell}>
                                    <div className={`${styles.dayNumber} ${isToday ? styles['dayNumber--today'] : ''}`} style={{ margin: '0 0 var(--space-2) auto', fontSize: '0.8rem', width: '1.75rem', height: '1.75rem' }}>
                                        {d}
                                    </div>

                                    {daySessoes.map(sessao => (
                                        <div
                                            key={sessao.id}
                                            onClick={() => { setSelectedSessao(sessao); setShowDetailModal(true); }}
                                            className={`${styles.sessionCardMini} ${styles[`sessionCardMini--${sessao.status === 'concluida' ? 'concluida' : 'agendada'}`]}`}
                                            title={`${new Date(sessao.data_hora_inicio).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} - ${sessao.aluno?.nome}`}
                                        >
                                            <span className="font-bold mr-1">
                                                {new Date(sessao.data_hora_inicio).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                            <span className="truncate">{sessao.aluno?.nome}</span>
                                        </div>
                                    ))}
                                </div>
                            )
                        }
                        return cells
                    })()}
                </div>
            ) : (
                /* Day View fallback */
                <div className={styles.dayViewGrid}>
                    {filteredSessoes.length === 0 ? (
                        <div className={styles.emptyState}>
                            <div className={styles.emptyState__icon}>
                                <Icons.Calendar size={32} />
                            </div>
                            <h3 className="text-xl font-bold mb-2">Dia livre!</h3>
                            <p className="text-muted">Nenhuma sessão agendada para esta data.</p>
                        </div>
                    ) : (
                        filteredSessoes.map((sessao) => (
                            <div
                                key={sessao.id}
                                className={`${styles.sessionDetailCard} ${sessao.status === 'concluida' ? styles['sessionDetailCard--concluida'] : sessao.status === 'remarcada' ? styles['sessionDetailCard--warning'] : ''}`}
                                onClick={() => { setSelectedSessao(sessao); setShowDetailModal(true); }}
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="min-w-0">
                                        <h4 className="text-base font-extrabold mb-1 truncate">{sessao.aluno?.nome}</h4>
                                        <p className="text-sm text-secondary truncate">{sessao.servico?.nome}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xl font-extrabold text-primary mb-1">
                                            {new Date(sessao.data_hora_inicio).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                        <span className={`badge ${getStatusBadge(sessao.status)} !text-[0.65rem] !px-2 uppercase font-bold`}>
                                            {sessao.status}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 text-sm text-muted">
                                    <div className="flex items-center gap-1.5">
                                        <Icons.Clock size={14} />
                                        <span>{sessao.servico?.duracao_minutos} min</span>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* Modals and Dialogs */}
            <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Agendar Sessões" size="lg">
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-2 gap-5 mb-6">
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

                    <div className={styles.formScheduleBox}>
                        <div className="flex justify-between items-center mb-5">
                            <h3 className="text-base font-extrabold m-0">Horários da Sessão</h3>
                            <button type="button" className="btn btn-secondary text-xs !px-3 !py-1.5" onClick={addHorario}>+ Add Horário</button>
                        </div>
                        {formData.horarios.map((horario, index) => (
                            <div key={index} className={`flex gap-4 items-end mb-4 ${index < formData.horarios.length - 1 ? 'pb-4 border-b border-dashed border-border' : ''}`}>
                                <div className="flex-1">
                                    <label className="label text-[0.7rem]">Data</label>
                                    <input type="date" className="input" value={horario.data_inicio} onChange={(e) => updateHorario(index, 'data_inicio', e.target.value)} required />
                                </div>
                                <div className="w-[120px]">
                                    <label className="label text-[0.7rem]">Hora</label>
                                    <input type="time" className="input" value={horario.hora} onChange={(e) => updateHorario(index, 'hora', e.target.value)} required />
                                </div>
                                {formData.horarios.length > 1 && (
                                    <button type="button" className="btn btn-icon btn-icon-danger !w-10 !h-10" onClick={() => removeHorario(index)}>
                                        <Icons.Delete size={16} />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className={styles.recurrenceBox}>
                        <label className={styles.recurrenceToggle}>
                            <div className={`${styles.recurrenceIcon} ${formData.recorrente ? styles['recurrenceIcon--active'] : ''}`}>
                                <Icons.TrendingUp size={18} color="white" />
                            </div>
                            <div className="flex-1">
                                <p className="font-bold text-[0.9375rem] mb-0.5">Recorrência Semanal</p>
                                <p className="text-xs opacity-70">Agendar automaticamente para as próximas semanas</p>
                            </div>
                            <input type="checkbox" checked={formData.recorrente} onChange={(e) => setFormData({ ...formData, recorrente: e.target.checked })} className="w-5 h-5 accent-primary" />
                        </label>

                        {formData.recorrente && (
                            <div className="mt-5 pt-5 border-t border-white/10 flex items-center gap-4">
                                <span className="text-sm">Repetir por:</span>
                                <input
                                    type="number"
                                    className="input !w-20 !bg-black/20 !border-none !text-white"
                                    min="1" max="12"
                                    value={formData.meses_recorrencia}
                                    onChange={(e) => setFormData({ ...formData, meses_recorrencia: parseInt(e.target.value) })}
                                />
                                <span className="text-sm">meses</span>
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                        <button type="submit" className="btn btn-primary !px-8">Agendar Sessões</button>
                    </div>
                </form>
            </Modal>

            {/* Modal Detalhes */}
            <Modal isOpen={showDetailModal} onClose={() => setShowDetailModal(false)} title="Detalhes da Sessão">
                {selectedSessao && (
                    <div className="flex flex-col gap-6">
                        <div className="flex items-center gap-4">
                            <div className="avatar !bg-secondary !text-primary font-bold">
                                {selectedSessao.aluno?.nome?.substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                                <h3 className="text-lg font-extrabold">{selectedSessao.aluno?.nome}</h3>
                                <p className="text-sm text-secondary">
                                    Status: <span className={`badge ${getStatusBadge(selectedSessao.status)} !text-[0.65rem] !px-2 uppercase font-extrabold`}>{selectedSessao.status}</span>
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="card-flat p-4 !bg-secondary/30">
                                <p className="text-[0.7rem] text-muted uppercase font-bold mb-1">Serviço</p>
                                <p className="text-sm font-bold">{selectedSessao.servico?.nome}</p>
                            </div>
                            <div className="card-flat p-4 !bg-secondary/30">
                                <p className="text-[0.7rem] text-muted uppercase font-bold mb-1">Duração</p>
                                <p className="text-sm font-bold">{selectedSessao.servico?.duracao_minutos} min</p>
                            </div>
                            <div className="card-flat p-4 !bg-secondary/30 col-span-2">
                                <p className="text-[0.7rem] text-muted uppercase font-bold mb-1">Data e Horário</p>
                                <p className="text-sm font-bold">
                                    {new Date(selectedSessao.data_hora_inicio).toLocaleString('pt-BR', { dateStyle: 'full', timeStyle: 'short' })}
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-2 pt-4">
                            <button
                                className="btn btn-primary flex-1 !h-12"
                                onClick={() => router.push(`/dashboard/alunos/${selectedSessao.aluno_id}`)}
                            >
                                <Icons.Students size={18} className="mr-2" />
                                Ver Perfil
                            </button>
                            {selectedSessao.status === 'agendada' && (
                                <button
                                    className="btn btn-success !h-12 !px-5"
                                    onClick={() => setShowConcluirDialog(true)}
                                    title="Concluir Aula"
                                >
                                    <Icons.CheckCircle size={20} />
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </Modal>

            <ConfirmDialog
                isOpen={showConcluirDialog}
                onClose={() => setShowConcluirDialog(false)}
                onConfirm={handleConcluir}
                title="Concluir Sessão"
                message={`Deseja marcar a aula de ${selectedSessao?.aluno?.nome} como concluída?`}
                confirmText="Concluir"
            />
        </div>
    )
}
