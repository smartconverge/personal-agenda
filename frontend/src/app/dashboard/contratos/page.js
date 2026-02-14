'use client'

import { useEffect, useState } from 'react'
import api from '@/lib/api'
import Modal from '@/components/Modal'
import { useToast } from '@/components/Toast'
import { Icons } from '@/components/Icons'

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
                showToast('Contrato atualizado!', 'success')
            } else {
                await api.post('/contratos', formData)
                showToast('Contrato criado!', 'success')
            }
            setShowModal(false)
            resetForm()
            loadData()
        } catch (error) {
            showToast(error.response?.data?.error || 'Erro ao salvar contrato', 'error')
        }
    }

    const handleDelete = async (excluir = false) => {
        try {
            await api.delete(`/contratos/${selectedContrato.id}${excluir ? '?excluir=true' : ''}`)
            showToast(excluir ? 'Contrato excluído!' : 'Contrato cancelado!', 'success')
            setShowDeleteDialog(false)
            loadData()
        } catch (error) {
            showToast('Erro ao processar contrato', 'error')
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
        <div className="page-enter">
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.5rem' }}>
                <button
                    className="btn btn-primary"
                    onClick={openNewModal}
                    style={{ height: '2.75rem', padding: '0 1.5rem' }}
                >
                    <Icons.Plus size={18} />
                    <span>Novo Contrato</span>
                </button>
            </div>

            {/* Filters */}
            <div className="card-flat" style={{ marginBottom: '1.5rem', padding: '0.75rem' }}>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {[
                        { id: 'todos', label: 'Todos', count: contratos.length },
                        { id: 'ativo', label: 'Ativos', color: 'var(--success)' },
                        { id: 'vencido', label: 'Vencidos', color: 'var(--warning)' },
                        { id: 'cancelado', label: 'Cancelados', color: 'var(--danger)' },
                    ].map((f) => (
                        <button
                            key={f.id}
                            className={`btn ${filterStatus === f.id ? 'btn-primary' : 'btn-secondary'}`}
                            onClick={() => setFilterStatus(f.id)}
                            style={{
                                fontSize: '0.8125rem',
                                padding: '0.5rem 1rem',
                                height: 'auto',
                                borderLeft: filterStatus === f.id ? 'none' : `3px solid ${f.color || 'transparent'}`
                            }}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="card-flat" style={{ padding: '0', overflow: 'hidden' }}>
                {filteredContratos.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                        <Icons.Contracts size={48} color="var(--text-muted)" style={{ opacity: 0.3, marginBottom: '1rem' }} />
                        <p style={{ color: 'var(--text-muted)', fontWeight: '500' }}>Nenhum contrato encontrado</p>
                    </div>
                ) : (
                    <>
                        {/* Desktop View Table */}
                        <div className="desktop-only" style={{ overflowX: 'auto' }}>
                            <table className="table" style={{ borderBottom: 'none', margin: '0' }}>
                                <thead>
                                    <tr>
                                        <th style={{ paddingLeft: '1.5rem' }}>Aluno</th>
                                        <th>Serviço</th>
                                        <th>Período</th>
                                        <th>Mensalidade</th>
                                        <th>Status</th>
                                        <th style={{ paddingRight: '1.5rem', textAlign: 'right' }}>Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredContratos.map((contrato) => (
                                        <tr key={contrato.id} className="table-row-hover">
                                            <td style={{ paddingLeft: '1.5rem' }}>
                                                <p style={{ fontWeight: '700', fontSize: '0.9375rem' }}>{contrato.aluno?.nome || 'N/A'}</p>
                                            </td>
                                            <td>
                                                <span className="badge badge-secondary">{contrato.servico?.nome || 'N/A'}</span>
                                            </td>
                                            <td>
                                                <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                                                    <div>Início: {new Date(contrato.data_inicio).toLocaleDateString('pt-BR')}</div>
                                                    <div>Venc.: {new Date(contrato.data_vencimento).toLocaleDateString('pt-BR')}</div>
                                                </div>
                                            </td>
                                            <td>
                                                <p style={{ fontWeight: '800', color: 'var(--primary)', fontSize: '1rem' }}>
                                                    R$ {parseFloat(contrato.valor_mensal).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                                </p>
                                            </td>
                                            <td>
                                                <span className={`badge ${getStatusBadge(contrato.status)}`}>
                                                    {contrato.status.toUpperCase()}
                                                </span>
                                            </td>
                                            <td style={{ paddingRight: '1.5rem', textAlign: 'right' }}>
                                                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                                    <button
                                                        className="btn-icon btn-icon-secondary"
                                                        onClick={() => openEditModal(contrato)}
                                                        title="Editar"
                                                    >
                                                        <Icons.Edit size={16} />
                                                    </button>
                                                    <button
                                                        className="btn-icon btn-icon-danger"
                                                        onClick={() => {
                                                            setSelectedContrato(contrato)
                                                            setShowDeleteDialog(true)
                                                        }}
                                                        title="Cancelar/Excluir"
                                                    >
                                                        <Icons.Delete size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile View Cards */}
                        <div className="mobile-only" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {filteredContratos.map((contrato) => (
                                <div key={contrato.id} className="card-premium" style={{ padding: '1.25rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                        <div>
                                            <h3 style={{ fontSize: '1.125rem', fontWeight: '800', marginBottom: '0.25rem' }}>{contrato.aluno?.nome || 'N/A'}</h3>
                                            <span className="badge badge-secondary" style={{ fontSize: '0.625rem' }}>{contrato.servico?.nome || 'N/A'}</span>
                                        </div>
                                        <span className={`badge ${getStatusBadge(contrato.status)}`}>
                                            {contrato.status}
                                        </span>
                                    </div>

                                    <div style={{
                                        display: 'grid',
                                        gridTemplateColumns: '1fr 1fr',
                                        gap: '1rem',
                                        padding: '1rem',
                                        backgroundColor: 'var(--bg-primary)',
                                        borderRadius: 'var(--radius-sm)',
                                        marginBottom: '1.25rem',
                                        border: '1px solid var(--border)'
                                    }}>
                                        <div>
                                            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Vencimento</p>
                                            <p style={{ fontSize: '0.875rem', fontWeight: '700' }}>{new Date(contrato.data_vencimento).toLocaleDateString('pt-BR')}</p>
                                        </div>
                                        <div>
                                            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Valor</p>
                                            <p style={{ fontSize: '0.875rem', fontWeight: '700', color: 'var(--primary)' }}>R$ {parseFloat(contrato.valor_mensal).toFixed(2)}</p>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button
                                            className="btn btn-secondary"
                                            style={{ flex: 1, gap: '0.5rem' }}
                                            onClick={() => openEditModal(contrato)}
                                        >
                                            <Icons.Edit size={16} />
                                            <span>Editar</span>
                                        </button>
                                        <button
                                            className="btn btn-danger"
                                            style={{ width: '2.5rem', height: '2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                            onClick={() => {
                                                setSelectedContrato(contrato)
                                                setShowDeleteDialog(true)
                                            }}
                                        >
                                            <Icons.Delete size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
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

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                        <div>
                            <label className="label">Data de Início</label>
                            <input
                                type="date"
                                className="input"
                                value={formData.data_inicio}
                                onChange={(e) => setFormData({ ...formData, data_inicio: e.target.value })}
                                required
                            />
                        </div>
                        <div>
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
                    </div>

                    <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '2rem' }}>
                        <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                            Cancelar
                        </button>
                        <button type="submit" className="btn btn-primary" style={{ padding: '0.625rem 2rem' }}>
                            {selectedContrato ? 'Salvar Contrato' : 'Criar Contrato'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Modal de Cancelamento/Exclusão */}
            <Modal
                isOpen={showDeleteDialog}
                onClose={() => setShowDeleteDialog(false)}
                title="Gerenciar Contrato"
            >
                <div>
                    <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                        <div style={{
                            width: '4rem',
                            height: '4rem',
                            borderRadius: '50%',
                            backgroundColor: 'rgba(239, 68, 68, 0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 1rem',
                            color: 'var(--danger)'
                        }}>
                            <Icons.Alert size={32} />
                        </div>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '0.5rem' }}>O que deseja fazer?</h3>
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                            Contrato de <strong>{selectedContrato?.aluno?.nome}</strong>
                        </p>
                    </div>

                    <div style={{
                        backgroundColor: 'rgba(245, 158, 11, 0.1)',
                        border: '1px solid rgba(245, 158, 11, 0.2)',
                        padding: '1rem',
                        borderRadius: 'var(--radius-sm)',
                        marginBottom: '1.5rem',
                        fontSize: '0.8125rem',
                        color: 'hsl(35, 92%, 35%)',
                        display: 'flex',
                        gap: '0.75rem'
                    }}>
                        <Icons.Info size={18} style={{ flexShrink: 0 }} />
                        <p>Aulas futuras agendadas para este contrato serão <strong>canceladas automaticamente</strong>.</p>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <button
                            className="btn btn-secondary"
                            onClick={() => handleDelete(false)}
                            style={{ justifyContent: 'center', border: '1px solid var(--warning)', color: 'var(--warning)', height: '3.5rem' }}
                        >
                            <div style={{ textAlign: 'left' }}>
                                <p style={{ fontWeight: '700', fontSize: '0.9375rem' }}>Apenas Cancelar</p>
                                <p style={{ fontSize: '0.7rem', opacity: 0.8 }}>Mantém o registro histórico no sistema</p>
                            </div>
                        </button>

                        <button
                            className="btn btn-danger"
                            onClick={() => handleDelete(true)}
                            style={{ justifyContent: 'center', height: '3.5rem' }}
                        >
                            <div style={{ textAlign: 'left' }}>
                                <p style={{ fontWeight: '700', fontSize: '0.9375rem' }}>Excluir Definitivamente</p>
                                <p style={{ fontSize: '0.7rem', opacity: 0.8 }}>Remove completamente do banco de dados</p>
                            </div>
                        </button>

                        <button
                            className="btn btn-secondary"
                            onClick={() => setShowDeleteDialog(false)}
                            style={{ marginTop: '0.5rem', justifyContent: 'center' }}
                        >
                            Voltar
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    )
}
