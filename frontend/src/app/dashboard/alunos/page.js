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

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
                <div className="spinner" style={{ width: '3rem', height: '3rem' }} />
            </div>
        )
    }

    return (
        <div>
            {/* Header */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '2rem',
                gap: '1rem',
                flexWrap: 'wrap'
            }}>
                <div>
                    <h1 style={{
                        fontSize: '2rem',
                        fontWeight: '800',
                        marginBottom: '0.25rem',
                        background: 'linear-gradient(135deg, var(--primary), var(--primary-light))',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text'
                    }}>
                        Alunos
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                        Gerencie seus {alunos.length} alunos cadastrados
                    </p>
                </div>
                <button
                    onClick={() => {
                        setEditingAluno(null)
                        setFormData({ nome: '', email: '', telefone_whatsapp: '', notificacoes_ativas: true, objetivo: '', plano: 'Basic' })
                        setShowModal(true)
                    }}
                    className="btn btn-primary"
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.25rem' }}
                >
                    <Icons.Plus size={18} />
                    <span>Novo Aluno</span>
                </button>
            </div>

            {/* Students Grid/Table */}
            <div className="card-flat" style={{ padding: '0', overflow: 'hidden' }}>
                {alunos.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                        <Icons.Students size={48} color="var(--text-muted)" style={{ opacity: 0.3, marginBottom: '1rem' }} />
                        <p style={{ color: 'var(--text-muted)', fontWeight: '500' }}>Nenhum aluno cadastrado</p>
                    </div>
                ) : (
                    <>
                        {/* Desktop View Table */}
                        <div className="desktop-only" style={{ overflowX: 'auto' }}>
                            <table className="table" style={{ borderBottom: 'none', margin: '0' }}>
                                <thead>
                                    <tr>
                                        <th style={{ paddingLeft: '1.5rem' }}>Aluno</th>
                                        <th>Plano</th>
                                        <th>Objetivo</th>
                                        <th>WhatsApp</th>
                                        <th>Status</th>
                                        <th style={{ paddingRight: '1.5rem', textAlign: 'right' }}>Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {alunos.map((aluno) => (
                                        <tr key={aluno.id} className="table-row-hover">
                                            <td style={{ paddingLeft: '1.5rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                    <div className="avatar avatar-sm" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--primary)' }}>
                                                        {getInitials(aluno.nome)}
                                                    </div>
                                                    <div>
                                                        <p style={{ fontWeight: '700', fontSize: '0.9375rem', marginBottom: '0.1rem' }}>{aluno.nome}</p>
                                                        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{aluno.email || 'Sem email'}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <span className={`badge ${aluno.plano === 'Premium' ? 'badge-info' : 'badge-secondary'}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                                                    {aluno.plano === 'Premium' && <Icons.Star size={10} />}
                                                    {aluno.plano || 'Basic'}
                                                </span>
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                                                    <Icons.Goal size={14} />
                                                    <span style={{ maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                        {aluno.objetivo || '-'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td>
                                                <a
                                                    href={`https://wa.me/55${aluno.telefone_whatsapp}`}
                                                    target="_blank"
                                                    className="text-link"
                                                    style={{ fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                                                >
                                                    {aluno.telefone_whatsapp}
                                                </a>
                                            </td>
                                            <td>
                                                <span className={`badge ${aluno.notificacoes_ativas ? 'badge-success' : 'badge-danger'}`}>
                                                    {aluno.notificacoes_ativas ? 'Ativo' : 'Inativo'}
                                                </span>
                                            </td>
                                            <td style={{ paddingRight: '1.5rem', textAlign: 'right' }}>
                                                <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                                                    <button
                                                        onClick={() => router.push(`/dashboard/alunos/${aluno.id}`)}
                                                        className="btn-icon btn-icon-primary"
                                                        title="Ver Agenda"
                                                    >
                                                        <Icons.Calendar size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleEdit(aluno)}
                                                        className="btn-icon btn-icon-secondary"
                                                        title="Editar"
                                                    >
                                                        <Icons.Edit size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(aluno.id)}
                                                        className="btn-icon btn-icon-danger"
                                                        title="Excluir"
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
                            {alunos.map((aluno) => (
                                <div key={aluno.id} className="card-premium" style={{ padding: '1.25rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <div className="avatar" style={{ background: 'var(--bg-secondary)', color: 'var(--primary)' }}>
                                                {getInitials(aluno.nome)}
                                            </div>
                                            <div>
                                                <h3 style={{ fontSize: '1rem', fontWeight: '800', marginBottom: '0.1rem' }}>{aluno.nome}</h3>
                                                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                                    <span className={`badge ${aluno.plano === 'Premium' ? 'badge-info' : 'badge-secondary'}`} style={{ fontSize: '0.625rem' }}>
                                                        {aluno.plano || 'Basic'}
                                                    </span>
                                                    <span className={`badge ${aluno.notificacoes_ativas ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: '0.625rem' }}>
                                                        {aluno.notificacoes_ativas ? 'On' : 'Off'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.25rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                                            <Icons.Goal size={14} />
                                            <span>Objetivo: {aluno.objetivo || 'Não definido'}</span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                                            <Icons.Students size={14} />
                                            <span>WhatsApp: {aluno.telefone_whatsapp}</span>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button
                                            onClick={() => router.push(`/dashboard/alunos/${aluno.id}`)}
                                            className="btn btn-primary"
                                            style={{ flex: 1, height: '2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', fontSize: '0.8125rem' }}
                                        >
                                            <Icons.Calendar size={14} />
                                            <span>Agenda</span>
                                        </button>
                                        <button
                                            onClick={() => handleEdit(aluno)}
                                            className="btn btn-secondary"
                                            style={{ width: '2.5rem', height: '2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                        >
                                            <Icons.Edit size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(aluno.id)}
                                            className="btn btn-danger"
                                            style={{ width: '2.5rem', height: '2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
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
