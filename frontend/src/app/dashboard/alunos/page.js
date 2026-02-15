'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'
import { useToast } from '@/components/Toast'
import { Icons } from '@/components/Icons'

import Pagination from '@/components/Pagination'

export default function AlunosPage() {
    const router = useRouter()
    const { showToast } = useToast()
    const [alunos, setAlunos] = useState([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [editingAluno, setEditingAluno] = useState(null)
    const [formData, setFormData] = useState({
        nome: '',
        email: '',
        telefone_whatsapp: '',
        notificacoes_ativas: true,
        objetivo: ''
    })
    const [searchTerm, setSearchTerm] = useState('')

    // Pagination Params
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [totalItems, setTotalItems] = useState(0)
    const itemsPerPage = 9 // Grid 3x3

    useEffect(() => {
        loadAlunos()
    }, [page]) // Recarregar quando mudar página

    // Debounce search ou carregar ao clicar no botão de busca?
    // Para simplificar, vamos carregar ao dar Enter ou clicar no botão, 
    // ou usar um useEffect com debounce. Aqui usaremos useEffect no searchTerm com delay
    useEffect(() => {
        const timer = setTimeout(() => {
            if (page === 1) loadAlunos()
            else setPage(1) // Voltar para pág 1 dispara o outro effect
        }, 500)
        return () => clearTimeout(timer)
    }, [searchTerm])

    const loadAlunos = async () => {
        setLoading(true)
        try {
            const response = await api.get('/alunos', {
                params: {
                    page,
                    limit: itemsPerPage,
                    nome: searchTerm
                }
            })
            if (response.data.success) {
                setAlunos(response.data.data || [])
                setTotalPages(response.data.meta?.totalPages || 1)
                setTotalItems(response.data.meta?.total || 0)
            }
        } catch (error) {
            console.error(error)
            showToast('Erro ao carregar alunos', 'error')
            setAlunos([])
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        try {
            if (editingAluno) {
                await api.put(`/alunos/${editingAluno.id}`, formData)
            } else {
                await api.post('/alunos', formData)
            }

            setShowModal(false)
            setEditingAluno(null)
            setFormData({ nome: '', email: '', telefone_whatsapp: '', notificacoes_ativas: true, objetivo: '' })
            loadAlunos()
            showToast(editingAluno ? 'Aluno atualizado!' : 'Aluno criado!', 'success')
        } catch (error) {
            showToast(error.response?.data?.error || 'Erro ao salvar aluno', 'error')
        }
    }

    const handleEdit = (aluno) => {
        setEditingAluno(aluno)
        setFormData({
            nome: aluno.nome,
            email: aluno.email || '',
            telefone_whatsapp: aluno.telefone_whatsapp,
            notificacoes_ativas: aluno.notificacoes_ativas,
            objetivo: aluno.objetivo || ''
        })
        setShowModal(true)
    }

    const handleDelete = async (id) => {
        if (!confirm('Tem certeza que deseja excluir este aluno?')) return

        try {
            await api.delete(`/alunos/${id}`)
            showToast('Aluno excluído!', 'success')
            loadAlunos()
        } catch (error) {
            showToast('Erro ao excluir aluno', 'error')
        }
    }

    const getInitials = (name) => {
        if (!name) return '?'
        const parts = name.split(' ')
        if (parts.length >= 2) {
            return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
        }
        return name.substring(0, 2).toUpperCase()
    }

    if (loading && alunos.length === 0) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
                <div className="spinner" style={{ width: '3rem', height: '3rem' }} />
            </div>
        )
    }

    return (
        <div className="page-enter">
            {/* Actions Bar */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1.5rem',
                gap: '1rem',
                flexWrap: 'wrap'
            }}>
                <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
                    <div style={{
                        position: 'absolute',
                        left: '1rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: 'var(--text-muted)',
                        pointerEvents: 'none',
                        display: 'flex',
                        alignItems: 'center'
                    }}>
                        <Icons.Search size={18} strokeWidth={2.5} />
                    </div>
                    <input
                        type="text"
                        placeholder="Buscar por nome..."
                        className="input"
                        style={{ paddingLeft: '3rem', height: '2.75rem', borderRadius: '0.75rem' }}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <button
                    onClick={() => {
                        setEditingAluno(null)
                        setFormData({ nome: '', email: '', telefone_whatsapp: '', notificacoes_ativas: true, objetivo: '' })
                        setShowModal(true)
                    }}
                    className="btn btn-primary"
                    style={{ height: '2.75rem', padding: '0 1.5rem' }}
                >
                    <Icons.Plus size={18} />
                    <span>Novo Aluno</span>
                </button>
            </div>

            {/* Students Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: '1.5rem',
                padding: '0.5rem'
            }}>
                {alunos.length === 0 ? (
                    <div className="card-flat" style={{ textAlign: 'center', padding: '5rem 2rem', gridColumn: '1 / -1' }}>
                        <div style={{
                            width: '4rem',
                            height: '4rem',
                            borderRadius: '1.25rem',
                            background: 'var(--bg-tertiary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 1.5rem',
                            color: 'var(--text-muted)'
                        }}>
                            <Icons.Students size={32} />
                        </div>
                        <h3 style={{ fontSize: '1.125rem', fontWeight: '700', marginBottom: '0.5rem' }}>Nenhum aluno encontrado</h3>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                            {searchTerm ? 'Tente ajustar os termos da busca' : 'Cadastre seu primeiro aluno para começar'}
                        </p>
                    </div>
                ) : (
                    alunos.map((aluno) => (
                        <div
                            key={aluno.id}
                            className="card-premium"
                            style={{
                                padding: '1.5rem',
                                display: 'flex',
                                flexDirection: 'column',
                                position: 'relative',
                                background: 'var(--bg-secondary)'
                            }}
                        >
                            {/* Header: Avatar + Info */}
                            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                                <div className="avatar" style={{
                                    width: '3.5rem',
                                    height: '3.5rem',
                                    background: 'var(--bg-tertiary)',
                                    color: 'var(--primary)',
                                    fontSize: '1.125rem',
                                    fontWeight: '800',
                                    border: '1px solid var(--border)'
                                }}>
                                    {getInitials(aluno.nome)}
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <h3 style={{
                                        fontSize: '1.125rem',
                                        fontWeight: '800',
                                        color: 'var(--text-primary)',
                                        marginBottom: '0.25rem',
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis'
                                    }}>
                                        {aluno.nome}
                                    </h3>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                                        <Icons.Notifications size={12} color={aluno.notificacoes_ativas ? 'var(--primary)' : 'var(--danger)'} />
                                        <span>{aluno.notificacoes_ativas ? 'Notificações Ativas' : 'Notificações Inativas'}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Details Grid */}
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: '1fr 1fr',
                                gap: '1rem',
                                marginBottom: '1.5rem',
                                padding: '1rem',
                                background: 'var(--bg-primary)',
                                borderRadius: '0.75rem'
                            }}>
                                <div style={{ gridColumn: 'span 2' }}>
                                    <p style={{ fontSize: '0.625rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700', marginBottom: '0.25rem' }}>Contato</p>
                                    <p style={{ fontSize: '0.8125rem', fontWeight: '600', color: 'var(--text-primary)' }}>{aluno.telefone_whatsapp}</p>
                                </div>
                                <div style={{ gridColumn: 'span 2' }}>
                                    <p style={{ fontSize: '0.625rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700', marginBottom: '0.25rem' }}>Objetivo</p>
                                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                                        {aluno.objetivo || 'Sem objetivo definido'}
                                    </p>
                                </div>
                            </div>

                            {/* Actions Group */}
                            <div style={{ display: 'flex', gap: '0.75rem', marginTop: 'auto' }}>
                                <button
                                    onClick={() => router.push(`/dashboard/alunos/${aluno.id}`)}
                                    className="btn btn-primary"
                                    style={{ flex: 1, height: '2.5rem', fontSize: '0.8125rem' }}
                                >
                                    <Icons.Calendar size={14} />
                                    <span>Agenda</span>
                                </button>
                                <button
                                    onClick={() => handleEdit(aluno)}
                                    className="btn btn-secondary"
                                    style={{ width: '2.5rem', height: '2.5rem', padding: 0 }}
                                    title="Editar"
                                >
                                    <Icons.Edit size={16} />
                                </button>
                            </div>

                            {/* Floating Delete */}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleDelete(aluno.id);
                                }}
                                className="delete-btn-hover"
                                style={{
                                    position: 'absolute',
                                    top: '0.75rem',
                                    right: '0.75rem',
                                    width: '2rem',
                                    height: '2rem',
                                    borderRadius: '50%',
                                    border: 'none',
                                    background: 'transparent',
                                    color: 'var(--danger)',
                                    opacity: 0,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <Icons.Delete size={16} />
                            </button>
                        </div>
                    ))
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay page-enter" onClick={() => setShowModal(false)}>
                    <div className="modal" style={{ maxWidth: '500px' }} onClick={(e) => e.stopPropagation()}>
                        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-primary)' }}>
                                    {editingAluno ? 'Editar Aluno' : 'Novo Aluno'}
                                </h2>
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Preencha os dados do aluno</p>
                            </div>
                            <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                                <Icons.Error size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} style={{ padding: '1.5rem' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                                <div style={{ gridColumn: 'span 2' }}>
                                    <label className="label">Nome Completo *</label>
                                    <input
                                        type="text"
                                        className="input"
                                        placeholder="Ex: João Silva"
                                        value={formData.nome}
                                        onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="label">WhatsApp *</label>
                                    <input
                                        type="text"
                                        className="input"
                                        placeholder="11999999999"
                                        value={formData.telefone_whatsapp}
                                        onChange={(e) => setFormData({ ...formData, telefone_whatsapp: e.target.value })}
                                        required
                                    />
                                </div>



                                <div style={{ gridColumn: 'span 2' }}>
                                    <label className="label">Email</label>
                                    <input
                                        type="email"
                                        className="input"
                                        placeholder="aluno@email.com"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>

                                <div style={{ gridColumn: 'span 2' }}>
                                    <label className="label">Objetivo de Treino</label>
                                    <input
                                        type="text"
                                        className="input"
                                        placeholder="Ex: Emagrecimento, Hipertrofia..."
                                        value={formData.objetivo}
                                        onChange={(e) => setFormData({ ...formData, objetivo: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div style={{ marginBottom: '2rem' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', padding: '0.5rem 0' }}>
                                    <input
                                        type="checkbox"
                                        checked={formData.notificacoes_ativas}
                                        onChange={(e) => setFormData({ ...formData, notificacoes_ativas: e.target.checked })}
                                        style={{ width: '1.125rem', height: '1.125rem', accentColor: 'var(--primary)' }}
                                    />
                                    <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>Habilitar notificações automáticas</span>
                                </label>
                            </div>

                            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="btn btn-secondary"
                                    style={{ padding: '0.625rem 1.25rem' }}
                                >
                                    Cancelar
                                </button>
                                <button type="submit" className="btn btn-primary" style={{ padding: '0.625rem 2rem' }}>
                                    {editingAluno ? 'Salvar Alterações' : 'Cadastrar Aluno'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

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
