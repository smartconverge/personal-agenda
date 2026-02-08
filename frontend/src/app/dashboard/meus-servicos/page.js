'use client'

import { useEffect, useState } from 'react'
import api from '@/lib/api'
import Modal from '@/components/Modal'
import ConfirmDialog from '@/components/ConfirmDialog'
import { useToast } from '@/components/Toast'

export default function MeusServicosPage() {
    const { showToast } = useToast()
    const [servicos, setServicos] = useState([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [showDeleteDialog, setShowDeleteDialog] = useState(false)
    const [selectedServico, setSelectedServico] = useState(null)
    const [formData, setFormData] = useState({
        tipo: 'presencial',
        nome: '',
        duracao_minutos: 60
    })

    useEffect(() => {
        loadServicos()
    }, [])

    const loadServicos = async () => {
        try {
            const response = await api.get('/servicos')
            setServicos(response.data.data || [])
        } catch (error) {
            showToast('Erro ao carregar serviços', 'error')
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            if (selectedServico) {
                await api.put(`/servicos/${selectedServico.id}`, formData)
                showToast('Serviço atualizado com sucesso!', 'success')
            } else {
                await api.post('/servicos', formData)
                showToast('Serviço criado com sucesso!', 'success')
            }
            setShowModal(false)
            resetForm()
            loadServicos()
        } catch (error) {
            showToast(error.response?.data?.error || 'Erro ao salvar serviço', 'error')
        }
    }

    const handleDelete = async () => {
        try {
            await api.delete(`/servicos/${selectedServico.id}`)
            showToast('Serviço excluído com sucesso!', 'success')
            loadServicos()
        } catch (error) {
            showToast('Erro ao excluir serviço', 'error')
        }
    }

    const openEditModal = (servico) => {
        setSelectedServico(servico)
        setFormData({
            tipo: servico.tipo,
            nome: servico.nome,
            duracao_minutos: servico.duracao_minutos
        })
        setShowModal(true)
    }

    const openNewModal = () => {
        resetForm()
        setShowModal(true)
    }

    const resetForm = () => {
        setSelectedServico(null)
        setFormData({
            tipo: 'presencial',
            nome: '',
            duracao_minutos: 60
        })
    }

    const getTipoIcon = (tipo) => {
        switch (tipo) {
            case 'presencial': return '🏋️'
            case 'online': return '💻'
            case 'ficha': return '📋'
            default: return '📝'
        }
    }

    const getTipoBadge = (tipo) => {
        switch (tipo) {
            case 'presencial': return 'badge-primary'
            case 'online': return 'badge-info'
            case 'ficha': return 'badge-secondary'
            default: return 'badge-secondary'
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
                <h1 style={{ fontSize: '1.875rem', fontWeight: '700', margin: 0 }}>
                    Meus Serviços
                </h1>
                <button className="btn btn-primary" onClick={openNewModal}>
                    + Novo Serviço
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
                                    <th>Tipo</th>
                                    <th>Nome</th>
                                    <th>Duração</th>
                                    <th>Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {servicos.map((servico) => (
                                    <tr key={servico.id}>
                                        <td>
                                            <span className={`badge ${getTipoBadge(servico.tipo)}`}>
                                                {getTipoIcon(servico.tipo)} {servico.tipo}
                                            </span>
                                        </td>
                                        <td style={{ fontWeight: '500' }}>{servico.nome}</td>
                                        <td>{servico.duracao_minutos} min</td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <button
                                                    className="btn btn-sm btn-secondary"
                                                    onClick={() => openEditModal(servico)}
                                                >
                                                    ✏️ Editar
                                                </button>
                                                <button
                                                    className="btn btn-sm btn-danger"
                                                    onClick={() => {
                                                        setSelectedServico(servico)
                                                        setShowDeleteDialog(true)
                                                    }}
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

            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title={selectedServico ? 'Editar Serviço' : 'Novo Serviço'}
            >
                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '1rem' }}>
                        <label className="label">Tipo de Serviço</label>
                        <select
                            className="input"
                            value={formData.tipo}
                            onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                            required
                        >
                            <option value="presencial">🏋️ Presencial</option>
                            <option value="online">💻 Online</option>
                            <option value="ficha">📋 Ficha</option>
                        </select>
                        <p className="text-muted" style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>
                            {formData.tipo === 'ficha' ? 'Ficha não bloqueia agenda' : 'Bloqueia agenda'}
                        </p>
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                        <label className="label">Nome do Serviço</label>
                        <input
                            type="text"
                            className="input"
                            placeholder="Ex: Treino Funcional 1h"
                            value={formData.nome}
                            onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                            required
                        />
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label className="label">Duração (minutos)</label>
                        <input
                            type="number"
                            className="input"
                            min="15"
                            step="15"
                            value={formData.duracao_minutos}
                            onChange={(e) => setFormData({ ...formData, duracao_minutos: parseInt(e.target.value) })}
                            required
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                        <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                            Cancelar
                        </button>
                        <button type="submit" className="btn btn-primary">
                            {selectedServico ? 'Atualizar' : 'Criar'}
                        </button>
                    </div>
                </form>
            </Modal>

            <ConfirmDialog
                isOpen={showDeleteDialog}
                onClose={() => setShowDeleteDialog(false)}
                onConfirm={handleDelete}
                title="Excluir Serviço"
                message={`Tem certeza que deseja excluir ${selectedServico?.nome}?`}
                confirmText="Excluir"
                danger
            />
        </div>
    )
}
