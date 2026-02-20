'use client'

import { useEffect, useState } from 'react'
import api from '@/lib/api'
import { useToast } from '@/components/Toast'
import { Icons } from '@/components/Icons'
import Modal from '@/components/Modal'
import Pagination from '@/components/Pagination'

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

    const filteredContratos = contratos.filter(c =>
        filterStatus === 'todos' || c.status === filterStatus
    )

    if (loading) {
        return (
            <div className="flex-center p-12">
                <div className="spinner !w-12 !h-12" />
            </div>
        )
    }

    return (
        <div className="page-enter">
            <div className="flex justify-end mb-6">
                <button
                    className="btn btn-primary"
                    onClick={openNewModal}
                >
                    <Icons.Plus size={18} />
                    <span>Novo Contrato</span>
                </button>
            </div>

            {/* Filters */}
            <div className="card-flat mb-6 p-3">
                <div className="flex gap-2 flex-wrap">
                    {[
                        { id: 'todos', label: 'Todos', count: contratos.length },
                        { id: 'ativo', label: 'Ativos', color: 'border-l-success' },
                        { id: 'vencido', label: 'Vencidos', color: 'border-l-warning' },
                        { id: 'cancelado', label: 'Cancelados', color: 'border-l-danger' },
                    ].map((f) => (
                        <button
                            key={f.id}
                            className={`btn ${filterStatus === f.id ? 'btn-primary' : 'btn-secondary'} !h-auto !py-2.5 !px-5 text-sm ${filterStatus === f.id ? '' : `border-l-4 ${f.color || ''}`
                                }`}
                            onClick={() => setFilterStatus(f.id)}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Contracts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-2">
                {filteredContratos.length === 0 ? (
                    <div className="card-flat text-center py-16 px-8 col-span-full">
                        <Icons.Contracts size={48} className="text-muted opacity-30 mb-4 mx-auto" />
                        <p className="text-muted font-medium">Nenhum contrato encontrado</p>
                    </div>
                ) : (
                    filteredContratos.map((contrato) => (
                        <div
                            key={contrato.id}
                            className="card-premium p-7 flex flex-col relative !bg-secondary"
                        >
                            {/* Header: Student + Status */}
                            <div className="flex-between items-start mb-6">
                                <div className="min-w-0">
                                    <h3 className="text-lg font-extrabold text-primary mb-1 truncate">
                                        {contrato.aluno?.nome || 'N/A'}
                                    </h3>
                                    <span className="text-sm text-secondary font-semibold">
                                        {contrato.servico?.nome || 'N/A'}
                                    </span>
                                </div>
                                <span className={`badge ${getStatusBadge(contrato.status)} !text-[0.65rem] !px-3 font-extrabold`}>
                                    {contrato.status.toUpperCase()}
                                </span>
                            </div>

                            {/* Billing Info Box */}
                            <div className="!bg-primary/5 p-5 rounded-2xl mb-6 flex-between">
                                <div>
                                    <p className="text-[0.6rem] text-muted uppercase font-extrabold mb-1 tracking-wider">Valor Mensal</p>
                                    <p className="text-xl font-black text-primary">
                                        R$ {parseFloat(contrato.valor_mensal).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[0.6rem] text-muted uppercase font-extrabold mb-1 tracking-wider">Prox. Venc.</p>
                                    <p className="text-sm font-bold text-primary">
                                        {new Date(contrato.data_vencimento).toLocaleDateString('pt-BR')}
                                    </p>
                                </div>
                            </div>

                            {/* Timeline/Dates */}
                            <div className="flex gap-6 mb-7 text-[0.8rem] text-muted">
                                <div className="flex items-center gap-1.5">
                                    <Icons.Calendar size={14} />
                                    <span>Início: {new Date(contrato.data_inicio).toLocaleDateString('pt-BR')}</span>
                                </div>
                            </div>

                            {/* Actions Group */}
                            <div className="flex gap-3 mt-auto">
                                <button
                                    className="btn-icon btn-icon-primary"
                                    onClick={() => openEditModal(contrato)}
                                    title="Editar"
                                >
                                    <Icons.Edit size={18} />
                                </button>
                                <button
                                    className="btn-icon btn-icon-danger"
                                    onClick={() => {
                                        setSelectedContrato(contrato);
                                        setShowDeleteDialog(true);
                                    }}
                                    title="Cancelar/Excluir"
                                >
                                    <Icons.Delete size={18} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title={selectedContrato ? 'Editar Contrato' : 'Novo Contrato'}
            >
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
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

                    <div className="mb-4">
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

                    <div className="grid grid-cols-2 gap-4 mb-6">
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

                    <div className="flex justify-end gap-3 mt-8">
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
                <div className="text-center py-4">
                    <div className="w-16 h-16 rounded-full bg-red-500/10 flex-center mx-auto mb-6 text-red-500">
                        <Icons.Alert size={32} />
                    </div>
                    <h3 className="text-xl font-extrabold mb-2">O que deseja fazer?</h3>
                    <p className="text-sm text-secondary mb-8">
                        Contrato de <strong className="text-primary">{selectedContrato?.aluno?.nome}</strong>
                    </p>

                    <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-xl mb-8 flex gap-3 text-left">
                        <Icons.Info size={20} className="text-yellow-600 flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-yellow-800 font-medium">Aulas futuras agendadas para este contrato serão <strong className="font-extrabold uppercase">canceladas automaticamente</strong>.</p>
                    </div>

                    <div className="flex flex-col gap-3">
                        <button
                            className="btn btn-secondary !h-14 !justify-center border-yellow-500 text-yellow-600 hover:bg-yellow-50"
                            onClick={() => handleDelete(false)}
                        >
                            <div className="text-center">
                                <p className="font-extrabold text-sm mb-0.5">Apenas Cancelar</p>
                                <p className="text-[0.65rem] opacity-70">Mantém o registro histórico no sistema</p>
                            </div>
                        </button>

                        <button
                            className="btn btn-danger !h-14 !justify-center shadow-lg shadow-red-500/20"
                            onClick={() => handleDelete(true)}
                        >
                            <div className="text-center">
                                <p className="font-extrabold text-sm mb-0.5">Excluir Definitivamente</p>
                                <p className="text-[0.65rem] opacity-80 text-white/70">Remove completamente do banco de dados</p>
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
