'use client'

import { useEffect, useState } from 'react'
import api from '@/lib/api'
import Modal from '@/components/Modal'
import ConfirmDialog from '@/components/ConfirmDialog'
import { useToast } from '@/components/Toast'

export default function ContratosPage() {
    const { showToast } = useToast()
    const [contratos, setContratos] = useState([])
    const [alunos, setAlunos] = useState([])
    const [servicos, setServicos] = useState([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [showDeleteDialog, setShowDeleteDialog] = useState(false)
    const [selectedContrato, setSelectedContrato] = useState(null)
    const [formData, setFormData] = useState({
        aluno_id: '',
        servico_id: '',
        data_inicio: '',
        valor_mensal: ''
    })
    const [filterStatus, setFilterStatus] = useState('todos')

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        try {
            const [contratosRes, alunosRes, servicosRes] = await Promise.all([
                api.get('/contratos'),
                api.get('/alunos'),
                api.get('/servicos')
            ])
            setContratos(contratosRes.data.data)
            setAlunos(alunosRes.data.data)
            setServicos(servicosRes.data.data)
        } catch (error) {
            showToast('Erro ao carregar dados', 'error')
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            if (selectedContrato) {
                await api.put(`/contratos/${selectedContrato.id}`, formData)
                showToast('Contrato atualizado com sucesso!', 'success')
            } else {
                await api.post('/contratos', formData)
                showToast('Contrato criado com sucesso!', 'success')
            }
            setShowModal(false)
            resetForm()
            loadData()
        } catch (error) {
            showToast(error.response?.data?.error || 'Erro ao salvar contrato', 'error')
        }
    }

    const handleDelete = async () => {
        try {
            await api.delete(`/contratos/${selectedContrato.id}`)
            showToast('Contrato cancelado com sucesso!', 'success')
            loadData()
        } catch (error) {
            showToast('Erro ao cancelar contrato', 'error')
        }
    }

    const openEditModal = (contrato) => {
        setSelectedContrato(contrato)
        setFormData({
            aluno_id: contrato.aluno_id,
            servico_id: contrato.servico_id,
            data_inicio: contrato.data_inicio,
            valor_mensal: contrato.valor_mensal
        })
        setShowModal(true)
    }

    const openNewModal = () => {
        resetForm()
        setShowModal(true)
    }

    const resetForm = () => {
        setSelectedContrato(null)
        setFormData({
            aluno_id: '',
            servico_id: '',
            data_inicio: new Date().toISOString().split('T')[0],
            valor_mensal: ''
        })
    }

    const getStatusBadge = (status) => {
        switch (status) {
            case 'ativo': return 'badge-success'
            case 'vencido': return 'badge-warning'
            case 'cancelado': return 'badge-danger'
            default: return 'badge-secondary'
        }
    }

    const filteredContratos = contratos.filter(c =>
        filterStatus === 'todos' || c.status === filterStatus
    )

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
                    Contratos
                </h1>
                <button className="btn btn-primary" onClick={openNewModal}>
                    + Novo Contrato
                </button>
            </div>

            <div className="card" style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <button
                        className={`btn ${filterStatus === 'todos' ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setFilterStatus('todos')}
                    >
                        Todos
                    </button>
                    <button
                        className={`btn ${filterStatus === 'ativo' ? 'btn-success' : 'btn-secondary'}`}
                        onClick={() => setFilterStatus('ativo')}
                    >
                        Ativos
                    </button>
                    <button
                        className={`btn ${filterStatus === 'vencido' ? 'btn-warning' : 'btn-secondary'}`}
                        onClick={() => setFilterStatus('vencido')}
                    >
                        Vencidos
                    </button>
                    <button
                        className={`btn ${filterStatus === 'cancelado' ? 'btn-danger' : 'btn-secondary'}`}
                        onClick={() => setFilterStatus('cancelado')}
                    >
                        Cancelados
                    </button>
                </div>
            </div>

            <div className="card">
                {filteredContratos.length === 0 ? (
                    <p className="text-muted">Nenhum contrato encontrado</p>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Aluno</th>
                                    <th>Serviço</th>
                                    <th>Início</th>
                                    <th>Vencimento</th>
                                    <th>Valor</th>
                                    <th>Status</th>
                                    <th>Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredContratos.map((contrato) => (
                                    <tr key={contrato.id}>
                                        <td style={{ fontWeight: '500' }}>{contrato.aluno?.nome || 'N/A'}</td>
                                        <td>{contrato.servico?.nome || 'N/A'}</td>
                                        <td>{new Date(contrato.data_inicio).toLocaleDateString('pt-BR')}</td>
                                        <td>{new Date(contrato.data_vencimento).toLocaleDateString('pt-BR')}</td>
                                        <td>R$ {parseFloat(contrato.valor_mensal).toFixed(2)}</td>
                                        <td>
                                            <span className={`badge ${getStatusBadge(contrato.status)}`}>
                                                {contrato.status}
                                            </span>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <button
                                                    className="btn btn-sm btn-secondary"
                                                    onClick={() => openEditModal(contrato)}
                                                >
                                                    ✏️ Editar
                                                </button>
                                                <button
                                                    className="btn btn-sm btn-danger"
                                                    onClick={() => {
                                                        setSelectedContrato(contrato)
                                                        setShowDeleteDialog(true)
                                                    }}
                                                >
                                                    ❌ Cancelar
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title={selectedContrato ? 'Editar Contrato' : 'Novo Contrato'}
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
                                <option key={servico.id} value={servico.id}>{servico.nome}</option>
                            ))}
                        </select>
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                        <label className="label">Data de Início</label>
                        <input
                            type="date"
                            className="input"
                            value={formData.data_inicio}
                            onChange={(e) => setFormData({ ...formData, data_inicio: e.target.value })}
                            required
                        />
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label className="label">Valor Mensal (R$)</label>
                        <input
                            type="number"
                            className="input"
                            min="0"
                            step="0.01"
                            placeholder="150.00"
                            value={formData.valor_mensal}
                            onChange={(e) => setFormData({ ...formData, valor_mensal: e.target.value })}
                            required
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                        <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                            Cancelar
                        </button>
                        <button type="submit" className="btn btn-primary">
                            {selectedContrato ? 'Atualizar' : 'Criar'}
                        </button>
                    </div>
                </form>
            </Modal>

            <ConfirmDialog
                isOpen={showDeleteDialog}
                onClose={() => setShowDeleteDialog(false)}
                onConfirm={handleDelete}
                title="Cancelar Contrato"
                message={`Tem certeza que deseja cancelar o contrato de ${selectedContrato?.aluno?.nome}?`}
                confirmText="Cancelar Contrato"
                danger
            />
        </div>
    )
}
