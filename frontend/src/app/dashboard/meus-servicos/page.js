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
                >
                    <Icons.Plus size={18} />
                    <span>Novo Serviço</span>
                </button>
            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                gap: '1.5rem',
                padding: '0.5rem'
            }}>
                {servicos.length === 0 ? (
                    <div className="card-flat" style={{ textAlign: 'center', padding: '4rem 2rem', gridColumn: '1 / -1' }}>
                        <Icons.Services size={48} color="var(--text-muted)" style={{ opacity: 0.3, marginBottom: '1rem' }} />
                        <p style={{ color: 'var(--text-muted)', fontWeight: '500' }}>Nenhum serviço cadastrado</p>
                    </div>
                ) : (
                    servicos.map((servico) => (
                        <div
                            key={servico.id}
                            className="card-premium"
                            style={{
                                padding: '1.75rem',
                                display: 'flex',
                                flexDirection: 'column',
                                position: 'relative',
                                background: 'white',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                cursor: 'default'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-4px)'
                                e.currentTarget.style.boxShadow = '0 12px 24px -10px rgba(0,0,0,0.1)'
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)'
                                e.currentTarget.style.boxShadow = 'var(--shadow)'
                            }}
                        >
                            {/* Header Row */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                                <div style={{
                                    width: '3rem',
                                    height: '3rem',
                                    borderRadius: '0.875rem',
                                    background: 'var(--bg-secondary)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'var(--primary)',
                                    border: '1px solid var(--border)'
                                }}>
                                    {getTipoIcon(servico.tipo)}
                                </div>
                                <span style={{
                                    fontSize: '0.625rem',
                                    fontWeight: '800',
                                    padding: '0.375rem 0.75rem',
                                    borderRadius: '2rem',
                                    background: 'var(--bg-tertiary)40',
                                    color: 'var(--text-secondary)',
                                    letterSpacing: '0.05em',
                                    textTransform: 'uppercase'
                                }}>
                                    ATIVO
                                </span>
                            </div>

                            {/* Content */}
                            <div style={{ flex: 1 }}>
                                <h3 style={{
                                    fontSize: '1.25rem',
                                    fontWeight: '800',
                                    color: 'var(--text-primary)',
                                    marginBottom: '0.5rem',
                                    letterSpacing: '-0.01em'
                                }}>
                                    {servico.nome}
                                </h3>
                                <p style={{
                                    fontSize: '0.875rem',
                                    color: 'var(--text-secondary)',
                                    lineHeight: '1.5',
                                    marginBottom: '1.25rem'
                                }}>
                                    {servico.tipo === 'presencial' ? 'Sessões presenciais personalizadas com foco em resultados reais.' :
                                        servico.tipo === 'online' ? 'Consultoria remota completa com vídeos e acompanhamento semanal.' :
                                            'Planejamento de treinos detalhado para execução independente.'}
                                </p>

                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '1rem',
                                    fontSize: '0.8125rem',
                                    color: 'var(--text-muted)',
                                    marginBottom: '2rem'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                        <Icons.Calendar size={14} />
                                        <span>{servico.duracao_minutos > 0 ? `${servico.duracao_minutos} min` : 'Duração variável'}</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                        <Icons.Dashboard size={14} />
                                        <span>{servico.tipo.charAt(0).toUpperCase() + servico.tipo.slice(1)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Footer Row */}
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                paddingTop: '1.5rem',
                                borderTop: '1px solid var(--border)'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem' }}>
                                    <span style={{ fontSize: '1.25rem', fontWeight: '900', color: 'var(--primary)' }}>R$ ---</span>
                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>/mês</span>
                                </div>
                                <button
                                    onClick={() => openEditModal(servico)}
                                    className="btn btn-secondary"
                                    style={{ fontSize: '0.8125rem', padding: '0.5rem 1rem' }}
                                >
                                    Detalhes
                                    <Icons.RightArrow size={14} />
                                </button>
                            </div>

                            {/* Delete Action (Optional - floating or in edit) */}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedServico(servico);
                                    setShowDeleteDialog(true);
                                }}
                                style={{
                                    position: 'absolute',
                                    top: '0.75rem',
                                    right: '0.75rem',
                                    opacity: 0, // Mantendo opacidade para hover do card
                                }}
                                className="btn-icon btn-icon-danger delete-btn-hover"
                            >
                                <Icons.Delete size={18} />
                            </button>
                        </div>
                    ))
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
                        <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                            Cancelar
                        </button>
                        <button type="submit" className="btn btn-primary">
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
