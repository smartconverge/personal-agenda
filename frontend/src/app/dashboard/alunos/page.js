'use client'

import { useEffect, useState } from 'react'
import api from '@/lib/api'

export default function AlunosPage() {
    const [alunos, setAlunos] = useState([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [editingAluno, setEditingAluno] = useState(null)
    const [formData, setFormData] = useState({
        nome: '',
        email: '',
        telefone_whatsapp: '',
        notificacoes_ativas: true
    })

    useEffect(() => {
        loadAlunos()
    }, [])

    const loadAlunos = async () => {
        try {
            const response = await api.get('/api/alunos')
            setAlunos(response.data)
        } catch (error) {
            alert('Erro ao carregar alunos')
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        try {
            if (editingAluno) {
                await api.put(`/api/alunos/${editingAluno.id}`, formData)
            } else {
                await api.post('/api/alunos', formData)
            }

            setShowModal(false)
            setEditingAluno(null)
            setFormData({ nome: '', email: '', telefone_whatsapp: '', notificacoes_ativas: true })
            loadAlunos()
        } catch (error) {
            alert(error.response?.data?.error || 'Erro ao salvar aluno')
        }
    }

    const handleEdit = (aluno) => {
        setEditingAluno(aluno)
        setFormData({
            nome: aluno.nome,
            email: aluno.email || '',
            telefone_whatsapp: aluno.telefone_whatsapp,
            notificacoes_ativas: aluno.notificacoes_ativas
        })
        setShowModal(true)
    }

    const handleDelete = async (id) => {
        if (!confirm('Tem certeza que deseja excluir este aluno?')) return

        try {
            await api.delete(`/api/alunos/${id}`)
            loadAlunos()
        } catch (error) {
            alert('Erro ao excluir aluno')
        }
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
                <h1 style={{ fontSize: '1.875rem', fontWeight: '700' }}>
                    Alunos
                </h1>
                <button
                    onClick={() => {
                        setEditingAluno(null)
                        setFormData({ nome: '', email: '', telefone_whatsapp: '', notificacoes_ativas: true })
                        setShowModal(true)
                    }}
                    className="btn btn-primary"
                >
                    ➕ Novo Aluno
                </button>
            </div>

            <div className="card">
                {alunos.length === 0 ? (
                    <p className="text-muted">Nenhum aluno cadastrado</p>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Nome</th>
                                    <th>WhatsApp</th>
                                    <th>Email</th>
                                    <th>Notificações</th>
                                    <th>Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {alunos.map((aluno) => (
                                    <tr key={aluno.id}>
                                        <td style={{ fontWeight: '500' }}>{aluno.nome}</td>
                                        <td>{aluno.telefone_whatsapp}</td>
                                        <td className="text-muted">{aluno.email || '-'}</td>
                                        <td>
                                            <span className={`badge ${aluno.notificacoes_ativas ? 'badge-success' : 'badge-danger'}`}>
                                                {aluno.notificacoes_ativas ? 'Ativas' : 'Inativas'}
                                            </span>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <button
                                                    onClick={() => handleEdit(aluno)}
                                                    className="btn btn-secondary"
                                                    style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem' }}
                                                >
                                                    ✏️ Editar
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(aluno.id)}
                                                    className="btn btn-danger"
                                                    style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem' }}
                                                >
                                                    🗑️ Excluir
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

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)' }}>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: '600' }}>
                                {editingAluno ? 'Editar Aluno' : 'Novo Aluno'}
                            </h2>
                        </div>

                        <form onSubmit={handleSubmit} style={{ padding: '1.5rem' }}>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500' }}>
                                    Nome *
                                </label>
                                <input
                                    type="text"
                                    className="input"
                                    value={formData.nome}
                                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                                    required
                                />
                            </div>

                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500' }}>
                                    WhatsApp * (com DDD)
                                </label>
                                <input
                                    type="text"
                                    className="input"
                                    value={formData.telefone_whatsapp}
                                    onChange={(e) => setFormData({ ...formData, telefone_whatsapp: e.target.value })}
                                    placeholder="11999999999"
                                    required
                                />
                            </div>

                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500' }}>
                                    Email
                                </label>
                                <input
                                    type="email"
                                    className="input"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    placeholder="aluno@email.com"
                                />
                            </div>

                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                    <input
                                        type="checkbox"
                                        checked={formData.notificacoes_ativas}
                                        onChange={(e) => setFormData({ ...formData, notificacoes_ativas: e.target.checked })}
                                    />
                                    <span style={{ fontSize: '0.875rem' }}>Notificações ativas</span>
                                </label>
                            </div>

                            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="btn btn-secondary"
                                >
                                    Cancelar
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    {editingAluno ? 'Salvar' : 'Criar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
