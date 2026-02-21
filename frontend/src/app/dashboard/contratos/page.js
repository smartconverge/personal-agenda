'use client'

import { useEffect, useState } from 'react'
import api from '@/lib/api'
import { useToast } from '@/components/Toast'
import { Icons } from '@/components/Icons'
import Modal from '@/components/Modal'
import Pagination from '@/components/Pagination'
import styles from './Contracts.module.css'

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

    // Pagination
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [totalItems, setTotalItems] = useState(0)
    const itemsPerPage = 10

    useEffect(() => {
        loadDependencies()
    }, [])

    useEffect(() => {
        loadContratos()
    }, [page, filterStatus])

    const loadDependencies = async () => {
        try {
            const [alunosRes, servicosRes] = await Promise.all([
                api.get('/alunos?limit=1000'), // Carregar todos para o select
                api.get('/servicos')
            ])
            setAlunos(alunosRes.data.data)
            setServicos(servicosRes.data.data)
        } catch (error) {
            console.error('Erro ao carregar dependências', error)
        }
    }

    const loadContratos = async () => {
        setLoading(true)
        try {
            const response = await api.get('/contratos', {
                params: {
                    page,
                    limit: itemsPerPage,
                    status: filterStatus === 'todos' ? undefined : filterStatus
                }
            })
            if (response.data.success) {
                setContratos(response.data.data || [])
                setTotalPages(response.data.meta?.totalPages || 1)
                setTotalItems(response.data.meta?.total || 0)
            }
        } catch (error) {
            showToast('Erro ao carregar contratos', 'error')
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
            loadContratos()
        } catch (error) {
            showToast(error.response?.data?.error || 'Erro ao salvar contrato', 'error')
        }
    }

    const handleDelete = async (excluir = false) => {
        try {
            await api.delete(`/contratos/${selectedContrato.id}${excluir ? '?excluir=true' : ''}`)
            showToast(excluir ? 'Contrato excluído!' : 'Contrato cancelado!', 'success')
            setShowDeleteDialog(false)
            loadContratos()
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

    if (loading && contratos.length === 0) {
        return (
            <div className="flex justify-center p-20">
                <div className="spinner !w-12 !h-12" />
            </div>
        )
    }

    return (
        <div className={styles.container}>
            <div className={styles.actionBar}>
                <button
                    className="btn btn-primary !h-11"
                    onClick={openNewModal}
                >
                    <Icons.Plus size={18} />
                    <span>Novo Contrato</span>
                </button>
            </div>

            {/* Filters Bar */}
            <div className={styles.filterBar}>
                <div className={styles.filterList}>
                    {[
                        { id: 'todos', label: 'Todos' },
                        { id: 'ativo', label: 'Ativos' },
                        { id: 'vencido', label: 'Vencidos' },
                        { id: 'cancelado', label: 'Cancelados' },
                    ].map((f) => (
                        <button
                            key={f.id}
                            className={`${styles.filterBtn} ${styles[`filterBtn--${f.id}`]} ${filterStatus === f.id ? styles['filterBtn--active'] : ''}`}
                            onClick={() => setFilterStatus(f.id)}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Contracts Grid */}
            <div className={styles.grid}>
                {contratos.length === 0 ? (
                    <div className={styles.emptyState}>
                        <div className={styles.emptyState__icon}>
                            <Icons.Contracts size={48} />
                        </div>
                        <p className={styles.emptyState__text}>Nenhum contrato encontrado</p>
                    </div>
                ) : (
                    contratos.map((contrato) => (
                        <div
                            key={contrato.id}
                            className={styles.contractCard}
                        >
                            {/* Header: Student + Status */}
                            <div className={styles.contractCard__header}>
                                <div className={styles.contractCard__student}>
                                    <h3 className={styles.contractCard__name}>
                                        {contrato.aluno?.nome || 'N/A'}
                                    </h3>
                                    <span className={styles.contractCard__service}>
                                        {contrato.servico?.nome || 'N/A'}
                                    </span>
                                </div>
                                <span className={`badge ${getStatusBadge(contrato.status)} !text-[0.65rem] !px-3 font-extrabold uppercase`}>
                                    {contrato.status}
                                </span>
                            </div>

                            {/* Billing Info Box */}
                            <div className={styles.contractCard__billing}>
                                <div>
                                    <p className={styles.billingItem__label}>Valor Mensal</p>
                                    <p className={styles.billingItem__value}>
                                        R$ {parseFloat(contrato.valor_mensal).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className={styles.billingItem__label}>Próx. Venc.</p>
                                    <p className={styles.billingItem__date}>
                                        {new Date(contrato.data_vencimento).toLocaleDateString('pt-BR')}
                                    </p>
                                </div>
                            </div>

                            {/* Timeline Info */}
                            <div className={styles.contractCard__timeline}>
                                <Icons.Calendar size={14} />
                                <span>Início: {new Date(contrato.data_inicio).toLocaleDateString('pt-BR')}</span>
                            </div>

                            {/* Actions Group */}
                            <div className={styles.contractCard__actions}>
                                <button
                                    className="btn btn-icon btn-icon-primary !w-10 !h-10"
                                    onClick={() => openEditModal(contrato)}
                                    title="Editar"
                                >
                                    <Icons.Edit size={18} />
                                </button>
                                <button
                                    className="btn btn-icon btn-icon-danger !w-10 !h-10"
                                    onClick={() => {
                                        setSelectedContrato(contrato);
                                        setShowDeleteDialog(true);
                                    }}
                                    title="Cancelar ou Excluir"
                                >
                                    <Icons.Delete size={18} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Modal de Formulário */}
            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title={selectedContrato ? 'Editar Contrato' : 'Novo Contrato'}
            >
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="label">Aluno *</label>
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

                    <div className="mb-4">
                        <label className="label">Serviço *</label>
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

                    <div className="grid grid-cols-2 gap-4 mb-8">
                        <div>
                            <label className="label">Data de Início *</label>
                            <input
                                type="date"
                                className="input"
                                value={formData.data_inicio}
                                onChange={(e) => setFormData({ ...formData, data_inicio: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label className="label">Valor Mensal (R$) *</label>
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

                    <div className="flex justify-end gap-3 pt-6 border-t border-border">
                        <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                            Cancelar
                        </button>
                        <button type="submit" className="btn btn-primary !px-8">
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
                <div className={styles.decisionModal}>
                    <div className={styles.decisionModal__iconBox}>
                        <Icons.Alert size={32} />
                    </div>
                    <h3 className={styles.decisionModal__title}>O que deseja fazer?</h3>
                    <p className={styles.decisionModal__subtitle}>
                        Contrato de <strong className="text-primary">{selectedContrato?.aluno?.nome}</strong>
                    </p>

                    <div className={styles.decisionModal__alert}>
                        <Icons.Info size={20} className="text-yellow-600 flex-shrink-0 mt-0.5" />
                        <p className={styles.decisionModal__alertText}>
                            Aulas futuras agendadas para este contrato serão
                            <strong className="font-extrabold uppercase"> canceladas automaticamente</strong>.
                        </p>
                    </div>

                    <div className={styles.decisionModal__btnGroup}>
                        <button
                            className={`btn btn-secondary ${styles.decisionModal__btn} ${styles.decisionModal__btnPrimary}`}
                            onClick={() => handleDelete(false)}
                        >
                            <div>
                                <p className={styles.decisionModal__btnText}>Apenas Cancelar</p>
                                <p className={styles.decisionModal__btnSubtext}>Mantém o registro histórico no sistema</p>
                            </div>
                        </button>

                        <button
                            className={`btn btn-danger ${styles.decisionModal__btn} ${styles.decisionModal__btnDanger}`}
                            onClick={() => handleDelete(true)}
                        >
                            <div>
                                <p className={styles.decisionModal__btnText}>Excluir Definitivamente</p>
                                <p className={styles.decisionModal__btnSubtext}>Remove completamente do banco de dados</p>
                            </div>
                        </button>

                        <button
                            className="btn btn-secondary !mt-4 !justify-center"
                            onClick={() => setShowDeleteDialog(false)}
                        >
                            Voltar
                        </button>
                    </div>
                </div>
            </Modal>

            <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={(newPage) => setPage(newPage)}
                totalItems={totalItems}
                itemsPerPage={itemsPerPage}
            />
        </div>
    )
}
