'use client'

import { useEffect, useState } from 'react'
import api from '@/lib/api'
import Modal from '@/components/Modal'
import ConfirmDialog from '@/components/ConfirmDialog'
import { useToast } from '@/components/Toast'
import { Icons } from '@/components/Icons'

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
                showToast('Serviço atualizado!', 'success')
            } else {
                await api.post('/servicos', formData)
                showToast('Serviço criado!', 'success')
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
            showToast('Serviço excluído!', 'success')
            loadServicos()
        } catch (error) {
            showToast('Erro ao excluir serviço', 'error')
        } finally {
            setShowDeleteDialog(false)
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
            case 'presencial': return <Icons.Fitness size={18} />
            case 'online': return <Icons.Dashboard size={18} />
            case 'ficha': return <Icons.Contracts size={18} />
            default: return <Icons.Services size={18} />
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
        <div className="page-enter">
            {/* Actions Bar */}
            <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                alignItems: 'center',
                marginBottom: '1.5rem',
                gap: '1rem',
                flexWrap: 'wrap'
            }}>
                <button
                    className="btn btn-primary"
                    onClick={openNewModal}
                    style={{ height: '2.75rem', padding: '0 1.5rem' }}
                >
                    <Icons.Plus size={18} />
                    <span>Novo Serviço</span>
                </button>
            </div>

            <div className="card-flat" style={{ padding: '0', overflow: 'hidden' }}>
                {servicos.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                        <Icons.Services size={48} color="var(--text-muted)" style={{ opacity: 0.3, marginBottom: '1rem' }} />
                        <p style={{ color: 'var(--text-muted)', fontWeight: '500' }}>Nenhum serviço cadastrado</p>
                    </div>
                ) : (
                    <>
                        {/* Desktop View Table */}
                        <div className="desktop-only" style={{ overflowX: 'auto' }}>
                            <table className="table" style={{ borderBottom: 'none', margin: '0' }}>
                                <thead style={{ background: 'var(--bg-tertiary)40' }}>
                                    <tr>
                                        <th style={{ paddingLeft: '1.5rem', fontSize: '0.6875rem', letterSpacing: '0.05em' }}>TIPO</th>
                                        <th style={{ fontSize: '0.6875rem', letterSpacing: '0.05em' }}>NOME DO SERVIÇO</th>
                                        <th style={{ fontSize: '0.6875rem', letterSpacing: '0.05em' }}>DURAÇÃO</th>
                                        <th style={{ paddingRight: '1.5rem', textAlign: 'right', fontSize: '0.6875rem', letterSpacing: '0.05em' }}>AÇÕES</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {servicos.map((servico) => (
                                        <tr key={servico.id} className="table-row-hover">
                                            <td style={{ paddingLeft: '1.5rem' }}>
                                                <span className={`badge ${getTipoBadge(servico.tipo)}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                                                    {getTipoIcon(servico.tipo)}
                                                    {servico.tipo.charAt(0).toUpperCase() + servico.tipo.slice(1)}
                                                </span>
                                            </td>
                                            <td style={{ fontWeight: '700', fontSize: '1rem' }}>{servico.nome}</td>
                                            <td style={{ color: 'var(--text-secondary)' }}>
                                                {servico.tipo === 'ficha' ? (
                                                    <span style={{ opacity: 0.5 }}>-</span>
                                                ) : (
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                                        <Icons.Calendar size={14} />
                                                        <span>{servico.duracao_minutos} min</span>
                                                    </div>
                                                )}
                                            </td>
                                            <td style={{ paddingRight: '1.5rem', textAlign: 'right' }}>
                                                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                                    <button
                                                        className="btn-icon btn-icon-secondary"
                                                        onClick={() => openEditModal(servico)}
                                                        title="Editar"
                                                    >
                                                        <Icons.Edit size={16} />
                                                    </button>
                                                    <button
                                                        className="btn-icon btn-icon-danger"
                                                        onClick={() => {
                                                            setSelectedServico(servico)
                                                            setShowDeleteDialog(true)
                                                        }}
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
                            {servicos.map((servico) => (
                                <div key={servico.id} className="card-premium" style={{ padding: '1.25rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                        <div>
                                            <span className={`badge ${getTipoBadge(servico.tipo)}`} style={{ fontSize: '0.625rem', marginBottom: '0.5rem' }}>
                                                {servico.tipo}
                                            </span>
                                            <h3 style={{ fontSize: '1.125rem', fontWeight: '800', color: 'var(--text-primary)' }}>{servico.nome}</h3>
                                        </div>
                                        <div style={{
                                            width: '2.5rem',
                                            height: '2.5rem',
                                            borderRadius: '0.75rem',
                                            backgroundColor: 'var(--bg-secondary)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: 'var(--primary)'
                                        }}>
                                            {getTipoIcon(servico.tipo)}
                                        </div>
                                    </div>

                                    {servico.tipo !== 'ficha' && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
                                            <Icons.Calendar size={14} />
                                            <span>Duração: {servico.duracao_minutos} minutos</span>
                                        </div>
                                    )}

                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button
                                            className="btn btn-secondary"
                                            style={{ flex: 1, height: '2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                                            onClick={() => openEditModal(servico)}
                                        >
                                            <Icons.Edit size={16} />
                                            <span>Editar</span>
                                        </button>
                                        <button
                                            className="btn btn-danger"
                                            style={{ width: '2.5rem', height: '2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                            onClick={() => {
                                                setSelectedServico(servico)
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
                title={selectedServico ? 'Editar Serviço' : 'Novo Serviço'}
            >
                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '1.25rem' }}>
                        <label className="label">Modalidade</label>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                            {['presencial', 'online', 'ficha'].map((t) => (
                                <button
                                    key={t}
                                    type="button"
                                    className={`btn ${formData.tipo === t ? 'btn-primary' : 'btn-secondary'}`}
                                    style={{
                                        padding: '0.75rem 0.5rem',
                                        fontSize: '0.75rem',
                                        flexDirection: 'column',
                                        gap: '0.4rem',
                                        height: 'auto'
                                    }}
                                    onClick={() => setFormData({
                                        ...formData,
                                        tipo: t,
                                        duracao_minutos: t === 'ficha' ? 0 : (formData.duracao_minutos || 60)
                                    })}
                                >
                                    {getTipoIcon(t)}
                                    <span style={{ textTransform: 'capitalize' }}>{t}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div style={{ marginBottom: '1.25rem' }}>
                        <label className="label">Nome do Serviço</label>
                        <input
                            type="text"
                            className="input"
                            placeholder="Ex: Treino Personalizado"
                            value={formData.nome}
                            onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                            required
                        />
                    </div>

                    {formData.tipo !== 'ficha' && (
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label className="label">Duração (minutos)</label>
                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                {[30, 45, 60, 90].map((m) => (
                                    <button
                                        key={m}
                                        type="button"
                                        className={`btn ${formData.duracao_minutos === m ? 'btn-primary' : 'btn-secondary'}`}
                                        style={{ padding: '0.5rem 1rem', fontSize: '0.8125rem', height: 'auto' }}
                                        onClick={() => setFormData({ ...formData, duracao_minutos: m })}
                                    >
                                        {m} min
                                    </button>
                                ))}
                                <input
                                    type="number"
                                    className="input"
                                    style={{ width: '80px', height: '2.5rem' }}
                                    placeholder="Outro"
                                    value={formData.duracao_minutos}
                                    onChange={(e) => setFormData({ ...formData, duracao_minutos: parseInt(e.target.value) || 0 })}
                                    required
                                />
                            </div>
                        </div>
                    )}

                    <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '2rem' }}>
                        <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)} style={{ padding: '0.625rem 1.25rem' }}>
                            Cancelar
                        </button>
                        <button type="submit" className="btn btn-primary" style={{ padding: '0.625rem 2rem' }}>
                            {selectedServico ? 'Salvar' : 'Criar Serviço'}
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
