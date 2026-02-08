'use client'

import { useEffect, useState } from 'react'
import api from '@/lib/api'

export default function ServicosPage() {
    const [servicos, setServicos] = useState([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [editingServico, setEditingServico] = useState(null)
    const [formData, setFormData] = useState({
        nome: '',
        tipo: 'presencial',
        duracao_minutos: 60,
        valor_padrao: ''
    })

    useEffect(() => {
        loadServicos()
    }, [])

    const loadServicos = async () => {
        try {
            const response = await api.get('/api/servicos')
            setServicos(response.data)
        } catch (error) {
            alert('Erro ao carregar serviços')
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        try {
            if (editingServico) {
                await api.put(`/api/servicos/${editingServico.id}`, formData)
            } else {
                await api.post('/api/servicos', formData)
            }

            setShowModal(false)
            setEditingServico(null)
            setFormData({ nome: '', tipo: 'presencial', duracao_minutos: 60, valor_padrao: '' })
            loadServicos()
        } catch (error) {
            alert(error.response?.data?.error || 'Erro ao salvar serviço')
        }
    }

    const handleEdit = (servico) => {
        setEditingServico(servico)
        setFormData({
            nome: servico.nome,
            tipo: servico.tipo,
            duracao_minutos: servico.duracao_minutos,
            valor_padrao: servico.valor_padrao || ''
        })
        setShowModal(true)
    }

    const handleDelete = async (id) => {
        if (!confirm('Tem certeza que deseja excluir este serviço?')) return

        try {
            await api.delete(`/api/servicos/${id}`)
            loadServicos()
        } catch (error) {
            alert('Erro ao excluir serviço')
        }
    }

    const getTipoBadge = (tipo) => {
        const badges = {
            presencial: { class: 'badge-success', label: '🏋️ Presencial' },
            online: { class: 'badge-info', label: '💻 Online' },
            ficha: { class: 'badge-warning', label: '📋 Ficha' }
        }
        return badges[tipo] || badges.presencial
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
                    Serviços
                </h1>
                <button
                    onClick={() => {
                        setEditingServico(null)
                        setFormData({ nome: '', tipo: 'presencial', duracao_minutos: 60, valor_padrao: '' })
                        setShowModal(true)
                    }}
                    className="btn btn-primary"
                >
                    ➕ Novo Serviço
                </button>
            </div>

            <div className="card">
                {servicos.length === 0 ? (
                    <p className="text-muted">Nenhum serviço cadastrado</p>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Nome</th>
                                    <th>Tipo</th>
                                    <th>Duração</th>
                                    <th>Valor Padrão</th>
                                    <th>Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {servicos.map((servico) => {
                                    const badge = getTipoBadge(servico.tipo)
                                    return (
                                        <tr key={servico.id}>
                                            <td style={{ fontWeight: '500' }}>{servico.nome}</td>
                                            <td>
                                                <span className={`badge ${badge.class}`}>
                                                    {badge.label}
                                                </span>
                                            </td>
                                            <td>{servico.duracao_minutos} min</td>
                                            <td>
                                                {servico.valor_padrao
                                                    ? `R$ ${parseFloat(servico.valor_padrao).toFixed(2)}`
                                                    : '-'
                                                }
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                    <button
                                                        onClick={() => handleEdit(servico)}
                                                        className="btn btn-secondary"
                                                        style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem' }}
                                                    >
                                                        ✏️ Editar
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(servico.id)}
                                                        className="btn btn-danger"
                                                        style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem' }}
                                                    >
                                                        🗑️ Excluir
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })}
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
                                {editingServico ? 'Editar Serviço' : 'Novo Serviço'}
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
                                    placeholder="Ex: Personal Training"
                                    required
                                />
                            </div>

                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500' }}>
                                    Tipo *
                                </label>
                                <select
                                    className="input"
                                    value={formData.tipo}
                                    onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                                    required
                                >
                                    <option value="presencial">🏋️ Presencial</option>
                                    <option value="online">💻 Online</option>
                                    <option value="ficha">📋 Ficha de Treino</option>
                                </select>
                            </div>

                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500' }}>
                                    Duração (minutos) *
                                </label>
                                <input
                                    type="number"
                                    className="input"
                                    value={formData.duracao_minutos}
                                    onChange={(e) => setFormData({ ...formData, duracao_minutos: parseInt(e.target.value) })}
                                    min="15"
                                    step="15"
                                    required
                                />
                            </div>

                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500' }}>
                                    Valor Padrão (R$)
                                </label>
                                <input
                                    type="number"
                                    className="input"
                                    value={formData.valor_padrao}
                                    onChange={(e) => setFormData({ ...formData, valor_padrao: e.target.value })}
                                    placeholder="0.00"
                                    step="0.01"
                                    min="0"
                                />
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
                                    {editingServico ? 'Salvar' : 'Criar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
