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
            <div className="flex-center p-12">
                <div className="spinner !w-12 !h-12" />
            </div>
        )
    }

    return (
        <div className="page-enter">
            {/* Actions Bar */}
            <div className="flex-between mb-6 gap-4 flex-wrap">
                <div className="flex-1" />
                <button
                    className="btn btn-primary"
                    onClick={openNewModal}
                >
                    <Icons.Plus size={18} />
                    <span>Novo Serviço</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-2">
                {servicos.length === 0 ? (
                    <div className="card-flat text-center py-16 px-8 col-span-full">
                        <Icons.Services size={48} className="text-muted opacity-30 mb-4 mx-auto" />
                        <p className="text-muted font-medium">Nenhum serviço cadastrado</p>
                    </div>
                ) : (
                    servicos.map((servico) => (
                        <div
                            key={servico.id}
                            className="card-premium p-7 flex flex-col relative !bg-secondary transition-all duration-300 hover:-translate-y-1 hover:shadow-lg cursor-default group"
                        >
                            {/* Header Row */}
                            <div className="flex-between items-start mb-6">
                                <div className="w-12 h-12 rounded-xl flex-center text-primary border border-border !bg-secondary">
                                    {getTipoIcon(servico.tipo)}
                                </div>
                                <span className="text-[0.65rem] font-extrabold px-3 py-1.5 rounded-full bg-primary-light text-secondary tracking-wider uppercase">
                                    ATIVO
                                </span>
                            </div>

                            {/* Content */}
                            <div className="flex-1">
                                <h3 className="text-xl font-extrabold text-primary mb-2 tracking-tight">
                                    {servico.nome}
                                </h3>
                                <p className="text-sm text-secondary mb-5 leading-relaxed">
                                    {servico.tipo === 'presencial' ? 'Sessões presenciais personalizadas com foco em resultados reais.' :
                                        servico.tipo === 'online' ? 'Consultoria remota completa com vídeos e acompanhamento semanal.' :
                                            'Planejamento de treinos detalhado para execução independente.'}
                                </p>

                                <div className="flex items-center gap-4 text-[0.8rem] text-muted mb-8">
                                    <div className="flex items-center gap-1.5">
                                        <Icons.Calendar size={14} />
                                        <span>{servico.duracao_minutos > 0 ? `${servico.duracao_minutos} min` : 'Duração variável'}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Icons.Dashboard size={14} />
                                        <span className="capitalize">{servico.tipo}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Footer Row */}
                            <div className="flex-between pt-6 border-t border-border">
                                <div className="flex items-baseline gap-1">
                                    <span className="text-xl font-extrabold text-primary">R$ ---</span>
                                    <span className="text-xs text-muted">/mês</span>
                                </div>
                                <button
                                    onClick={() => openEditModal(servico)}
                                    className="btn btn-secondary !py-2 !px-4 text-[0.8rem]"
                                >
                                    Detalhes
                                    <Icons.RightArrow size={14} />
                                </button>
                            </div>

                            {/* Delete Action */}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedServico(servico);
                                    setShowDeleteDialog(true);
                                }}
                                className="btn-icon btn-icon-danger absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
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
                    <div className="mb-5">
                        <label className="label">Modalidade</label>
                        <div className="grid grid-cols-3 gap-2">
                            {['presencial', 'online', 'ficha'].map((t) => (
                                <button
                                    key={t}
                                    type="button"
                                    className={`btn ${formData.tipo === t ? 'btn-primary' : 'btn-secondary'} !h-auto !py-3 !px-2 flex-col gap-1.5 text-[0.7rem]`}
                                    onClick={() => setFormData({
                                        ...formData,
                                        tipo: t,
                                        duracao_minutos: t === 'ficha' ? 0 : (formData.duracao_minutos || 60)
                                    })}
                                >
                                    {getTipoIcon(t)}
                                    <span className="capitalize">{t}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="mb-5">
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
                        <div className="mb-6">
                            <label className="label">Duração (minutos)</label>
                            <div className="flex gap-2 flex-wrap">
                                {[30, 45, 60, 90].map((m) => (
                                    <button
                                        key={m}
                                        type="button"
                                        className={`btn ${formData.duracao_minutos === m ? 'btn-primary' : 'btn-secondary'} !h-auto !py-2 !px-4 text-[0.8rem]`}
                                        onClick={() => setFormData({ ...formData, duracao_minutos: m })}
                                    >
                                        {m} min
                                    </button>
                                ))}
                                <input
                                    type="number"
                                    className="input !w-20 !h-10"
                                    placeholder="Outro"
                                    value={formData.duracao_minutos}
                                    onChange={(e) => setFormData({ ...formData, duracao_minutos: parseInt(e.target.value) || 0 })}
                                    required
                                />
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end gap-3 mt-8">
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
