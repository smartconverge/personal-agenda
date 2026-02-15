'use client'

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

            {/* Contracts Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                gap: '1.5rem',
                padding: '0.5rem'
            }}>
                {filteredContratos.length === 0 ? (
                    <div className="card-flat" style={{ textAlign: 'center', padding: '4rem 2rem', gridColumn: '1 / -1' }}>
                        <Icons.Contracts size={48} color="var(--text-muted)" style={{ opacity: 0.3, marginBottom: '1rem' }} />
                        <p style={{ color: 'var(--text-muted)', fontWeight: '500' }}>Nenhum contrato encontrado</p>
                    </div>
                ) : (
                    filteredContratos.map((contrato) => (
                        <div
                            key={contrato.id}
                            className="card-premium"
                            style={{
                                padding: '1.75rem',
                                display: 'flex',
                                flexDirection: 'column',
                                position: 'relative',
                                background: 'white'
                            }}
                        >
                            {/* Header: Student + Status */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                                <div style={{ minWidth: 0 }}>
                                    <h3 style={{
                                        fontSize: '1.125rem',
                                        fontWeight: '800',
                                        color: 'black',
                                        marginBottom: '0.25rem'
                                    }}>
                                        {contrato.aluno?.nome || 'N/A'}
                                    </h3>
                                    <span style={{
                                        fontSize: '0.75rem',
                                        color: 'var(--text-secondary)',
                                        fontWeight: '600'
                                    }}>
                                        {contrato.servico?.nome || 'N/A'}
                                    </span>
                                </div>
                                <span className={`badge ${getStatusBadge(contrato.status)}`} style={{
                                    fontSize: '0.625rem',
                                    padding: '0.375rem 0.75rem'
                                }}>
                                    {contrato.status.toUpperCase()}
                                </span>
                            </div>

                            {/* Billing Info Box */}
                            <div style={{
                                background: 'var(--bg-primary)',
                                padding: '1.25rem',
                                borderRadius: '0.875rem',
                                marginBottom: '1.5rem',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                                <div>
                                    <p style={{ fontSize: '0.625rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '800', marginBottom: '0.125rem' }}>Valor Mensal</p>
                                    <p style={{ fontSize: '1.25rem', fontWeight: '900', color: 'var(--primary)' }}>
                                        R$ {parseFloat(contrato.valor_mensal).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                    </p>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <p style={{ fontSize: '0.625rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '800', marginBottom: '0.125rem' }}>Prox. Venc.</p>
                                    <p style={{ fontSize: '0.875rem', fontWeight: '700', color: 'black' }}>
                                        {new Date(contrato.data_vencimento).toLocaleDateString('pt-BR')}
                                    </p>
                                </div>
                            </div>

                            {/* Timeline/Dates */}
                            <div style={{
                                display: 'flex',
                                gap: '1.5rem',
                                marginBottom: '1.75rem',
                                fontSize: '0.75rem',
                                color: 'var(--text-muted)'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                    <Icons.Calendar size={14} />
                                    <span>Início: {new Date(contrato.data_inicio).toLocaleDateString('pt-BR')}</span>
                                </div>
                            </div>

                            {/* Actions Group */}
                            <div style={{ display: 'flex', gap: '0.75rem', marginTop: 'auto' }}>
                                <button
                                    className="btn btn-secondary"
                                    onClick={() => openEditModal(contrato)}
                                    style={{ flex: 1, height: '2.5rem', fontSize: '0.8125rem' }}
                                >
                                    <Icons.Edit size={14} />
                                    <span>Editar</span>
                                </button>
                                <button
                                    className="btn btn-icon btn-icon-danger"
                                    onClick={() => {
                                        setSelectedContrato(contrato);
                                        setShowDeleteDialog(true);
                                    }}
                                    style={{ width: '2.5rem', height: '2.5rem', flexShrink: 0 }}
                                    title="Cancelar/Excluir"
                                >
                                    <Icons.Delete size={16} />
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
