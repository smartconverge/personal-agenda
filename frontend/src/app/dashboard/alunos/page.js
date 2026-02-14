'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'
import { useToast } from '@/components/Toast'
import { Icons } from '@/components/Icons'

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
        objetivo: '',
        plano: 'Basic'
    })
    const [searchTerm, setSearchTerm] = useState('')

    useEffect(() => {
        loadAlunos()
    }, [])

    const loadAlunos = async () => {
        try {
            const response = await api.get('/alunos')
            setAlunos(response.data.data || [])
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
            setFormData({ nome: '', email: '', telefone_whatsapp: '', notificacoes_ativas: true, objetivo: '', plano: 'Basic' })
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
            objetivo: aluno.objetivo || '',
            plano: aluno.plano || 'Basic'
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

    const filteredAlunos = alunos.filter(aluno =>
        aluno.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (aluno.email && aluno.email.toLowerCase().includes(searchTerm.toLowerCase()))
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
                        placeholder="Buscar por nome ou email..."
                        className="input"
                        style={{ paddingLeft: '3rem', height: '2.75rem', borderRadius: '0.75rem' }}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <button
                    onClick={() => {
                        setEditingAluno(null)
                        setFormData({ nome: '', email: '', telefone_whatsapp: '', notificacoes_ativas: true, objetivo: '', plano: 'Basic' })
                        setShowModal(true)
                    }}
                    className="btn btn-primary"
                    style={{ height: '2.75rem', padding: '0 1.5rem' }}
                >
                    <Icons.Plus size={18} />
                    <span>Novo Aluno</span>
                </button>
            </div>

            {/* Students Table */}
            <div className="card-flat" style={{ padding: '0', overflow: 'hidden' }}>
                {filteredAlunos.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '5rem 2rem' }}>
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
                    <>
                        <div className="desktop-only" style={{ overflowX: 'auto' }}>
                            <table className="table" style={{ margin: 0 }}>
                                <thead style={{ background: 'var(--bg-tertiary)40' }}>
                                    <tr>
                                        <th style={{ paddingLeft: '1.5rem', fontSize: '0.6875rem', letterSpacing: '0.05em' }}>NOME</th>
                                        <th style={{ fontSize: '0.6875rem', letterSpacing: '0.05em' }}>EMAIL</th>
                                        <th style={{ fontSize: '0.6875rem', letterSpacing: '0.05em' }}>WHATSAPP</th>
                                        <th style={{ fontSize: '0.6875rem', letterSpacing: '0.05em' }}>OBJETIVO</th>
                                        <th style={{ fontSize: '0.6875rem', letterSpacing: '0.05em' }}>PLANO</th>
                                        <th style={{ fontSize: '0.6875rem', letterSpacing: '0.05em' }}>STATUS</th>
                                        <th style={{ paddingRight: '1.5rem', textAlign: 'right', fontSize: '0.6875rem', letterSpacing: '0.05em' }}>AÇÕES</th>
                                    </tr>
                                </thead>
                                <tbody style={{ borderTop: '1px solid var(--border)' }}>
                                    {filteredAlunos.map((aluno) => (
                                        <tr key={aluno.id} className="table-row-hover">
                                            <td style={{ paddingLeft: '1.5rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                    <div className="avatar avatar-sm" style={{
                                                        background: 'var(--primary)',
                                                        color: 'white',
                                                        fontSize: '0.75rem',
                                                        fontWeight: '800'
                                                    }}>
                                                        {getInitials(aluno.nome)}
                                                    </div>
                                                    <span style={{ fontWeight: '700', fontSize: '0.875rem' }}>{aluno.nome}</span>
                                                </div>
                                            </td>
                                            <td style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                                {aluno.email || '-'}
                                            </td>
                                            <td style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                                {aluno.telefone_whatsapp}
                                            </td>
                                            <td style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                                {aluno.objetivo || '-'}
                                            </td>
                                            <td>
                                                <span className="badge badge-secondary" style={{
                                                    fontSize: '0.6875rem',
                                                    padding: '0.25rem 0.625rem',
                                                    background: 'var(--bg-tertiary)'
                                                }}>
                                                    {aluno.plano || 'Basic'}
                                                </span>
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                                                    <div style={{
                                                        width: '6px',
                                                        height: '6px',
                                                        borderRadius: '50%',
                                                        background: aluno.notificacoes_ativas ? 'var(--primary)' : 'var(--danger)'
                                                    }} />
                                                    <span style={{
                                                        fontSize: '0.6875rem',
                                                        fontWeight: '800',
                                                        color: aluno.notificacoes_ativas ? 'var(--primary)' : 'var(--danger)',
                                                        textTransform: 'uppercase'
                                                    }}>
                                                        {aluno.notificacoes_ativas ? 'Ativo' : 'Inativo'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td style={{ paddingRight: '1.5rem', textAlign: 'right' }}>
                                                <div style={{ display: 'flex', gap: '0.25rem', justifyContent: 'flex-end' }}>
                                                    <button
                                                        onClick={() => router.push(`/dashboard/alunos/${aluno.id}`)}
                                                        className="btn-icon btn-icon-secondary"
                                                        style={{ width: '2rem', height: '2rem' }}
                                                    >
                                                        <Icons.Calendar size={14} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleEdit(aluno)}
                                                        className="btn-icon btn-icon-secondary"
                                                        style={{ width: '2rem', height: '2rem' }}
                                                    >
                                                        <Icons.Edit size={14} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(aluno.id)}
                                                        className="btn-icon btn-icon-danger"
                                                        style={{ width: '2rem', height: '2rem' }}
                                                    >
                                                        <Icons.Delete size={14} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile View */}
                        <div className="mobile-only" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {filteredAlunos.map((aluno) => (
                                <div key={aluno.id} className="card-premium" style={{ padding: '1.25rem' }}>
                                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.25rem' }}>
                                        <div className="avatar" style={{ background: 'var(--primary)', color: 'white' }}>
                                            {getInitials(aluno.nome)}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                <h3 style={{ fontSize: '1rem', fontWeight: '800', marginBottom: '0.25rem' }}>{aluno.nome}</h3>
                                                <span className="badge badge-secondary" style={{ fontSize: '0.625rem' }}>
                                                    {aluno.plano || 'Basic'}
                                                </span>
                                            </div>
                                            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{aluno.email || 'Sem email'}</p>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button
                                            onClick={() => router.push(`/dashboard/alunos/${aluno.id}`)}
                                            className="btn btn-secondary"
                                            style={{ flex: 1, fontSize: '0.75rem', height: '2.5rem' }}
                                        >
                                            <Icons.Calendar size={14} />
                                            <span>Agenda</span>
                                        </button>
                                        <button
                                            onClick={() => handleEdit(aluno)}
                                            className="btn btn-secondary"
                                            style={{ width: '2.5rem', height: '2.5rem' }}
                                        >
                                            <Icons.Edit size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(aluno.id)}
                                            className="btn btn-danger"
                                            style={{ width: '2.5rem', height: '2.5rem' }}
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

                                <div>
                                    <label className="label">Plano</label>
                                    <select
                                        className="input"
                                        value={formData.plano}
                                        onChange={(e) => setFormData({ ...formData, plano: e.target.value })}
                                    >
                                        <option value="Basic">Basic</option>
                                        <option value="Premium">Premium</option>
                                    </select>
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
        </div>
    )
}
