'use client'

import { useEffect, useState } from 'react'
import api from '@/lib/api'
import Modal from '@/components/Modal'
import ConfirmDialog from '@/components/ConfirmDialog'
import { useToast } from '@/components/Toast'
import { Icons } from '@/components/Icons'
import styles from './Services.module.css'

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

    const getTipoIcon = (tipo, size = 18) => {
        switch (tipo) {
            case 'presencial': return <Icons.Fitness size={size} />
            case 'online': return <Icons.Dashboard size={size} />
            case 'ficha': return <Icons.Contracts size={size} />
            default: return <Icons.Services size={size} />
        }
    }

    if (loading) {
        return (
            <div className="flex justify-center p-20">
                <div className="spinner !w-12 !h-12" />
            </div>
        )
    }

    return (
        <div className={styles.container}>
            {/* Actions Bar */}
            <div className={styles.actionBar}>
                <button
                    className="btn btn-primary"
                    onClick={openNewModal}
                >
                    <Icons.Plus size={18} />
                    <span>Novo Serviço</span>
                </button>
            </div>

            <div className={styles.grid}>
                {servicos.length === 0 ? (
                    <div className={styles.emptyState}>
                        <Icons.Services className={styles.emptyState__icon} />
                        <p className={styles.emptyState__text}>Nenhum serviço cadastrado ainda.</p>
                    </div>
                ) : (
                    servicos.map((servico) => (
                        <div
                            key={servico.id}
                            className={styles.serviceCard}
                        >
                            {/* Header Row */}
                            <div className={styles.serviceCard__header}>
                                <div className={styles.serviceCard__iconBox}>
                                    {getTipoIcon(servico.tipo, 24)}
                                </div>
                                <span className={styles.serviceCard__status}>
                                    ATIVO
                                </span>
                            </div>

                            {/* Content */}
                            <div className={styles.serviceCard__body}>
                                <h3 className={styles.serviceCard__title}>
                                    {servico.nome}
                                </h3>
                                <p className={styles.serviceCard__description}>
                                    {servico.tipo === 'presencial' ? 'Sessões presenciais personalizadas com foco em resultados reais.' :
                                        servico.tipo === 'online' ? 'Consultoria remota completa com vídeos e acompanhamento semanal.' :
                                            'Planejamento de treinos detalhado para execução independente.'}
                                </p>

                                <div className={styles.serviceCard__metaList}>
                                    <div className={styles.serviceCard__metaItem}>
                                        <Icons.Clock size={16} />
                                        <span>{servico.duracao_minutos > 0 ? `${servico.duracao_minutos} min` : 'Duração variável'}</span>
                                    </div>
                                    <div className={styles.serviceCard__metaItem}>
                                        <Icons.Services size={16} />
                                        <span>{servico.tipo}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Footer Row */}
                            <div className={styles.serviceCard__footer}>
                                <div className={styles.serviceCard__priceBox}>
                                    <span className={styles.serviceCard__price}>R$ ---</span>
                                    <span className={styles.serviceCard__period}>/mês</span>
                                </div>
                                <button
                                    onClick={() => openEditModal(servico)}
                                    className="btn btn-secondary !py-2 !px-4 text-[0.8rem]"
                                >
                                    <span>Ver Detalhes</span>
                                    <Icons.ArrowRight size={14} />
                                </button>
                            </div>

                            {/* Delete Action */}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedServico(servico);
                                    setShowDeleteDialog(true);
                                }}
                                className={styles.serviceCard__deleteBtn}
                                title="Excluir serviço"
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
                    <div className="mb-6">
                        <label className="label">Modalidade do Treino</label>
                        <div className={styles.formGrid}>
                            {['presencial', 'online', 'ficha'].map((t) => (
                                <button
                                    key={t}
                                    type="button"
                                    className={`${styles.typeBtn} ${formData.tipo === t ? styles['typeBtn--active'] : ''}`}
                                    onClick={() => setFormData({
                                        ...formData,
                                        tipo: t,
                                        duracao_minutos: t === 'ficha' ? 0 : (formData.duracao_minutos || 60)
                                    })}
                                >
                                    {getTipoIcon(t, 20)}
                                    <span>{t}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="mb-6">
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
                        <div className="mb-8">
                            <label className="label">Duração Padrão (minutos)</label>
                            <div className={styles.durationGrid}>
                                {[30, 45, 60, 90].map((m) => (
                                    <button
                                        key={m}
                                        type="button"
                                        className={`${styles.durationBtn} ${formData.duracao_minutos === m ? styles['durationBtn--active'] : ''}`}
                                        onClick={() => setFormData({ ...formData, duracao_minutos: m })}
                                    >
                                        {m} min
                                    </button>
                                ))}
                                <input
                                    type="number"
                                    className="input !w-24"
                                    placeholder="Outro"
                                    value={formData.duracao_minutos || ''}
                                    onChange={(e) => setFormData({ ...formData, duracao_minutos: parseInt(e.target.value) || 0 })}
                                    required
                                />
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end gap-3 pt-4 border-t border-border">
                        <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                            Cancelar
                        </button>
                        <button type="submit" className="btn btn-primary">
                            {selectedServico ? 'Salvar Alterações' : 'Criar Serviço'}
                        </button>
                    </div>
                </form>
            </Modal>

            <ConfirmDialog
                isOpen={showDeleteDialog}
                onClose={() => setShowDeleteDialog(false)}
                onConfirm={handleDelete}
                title="Excluir Serviço"
                message={`Tem certeza que deseja excluir "${selectedServico?.nome}"? Esta ação não pode ser desfeita.`}
                confirmText="Sim, Excluir"
                danger
            />
        </div>
    )
}
