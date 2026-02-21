'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'
import Modal from '@/components/Modal'
import ConfirmDialog from '@/components/ConfirmDialog'
import { useToast } from '@/components/Toast'
import { Icons } from '@/components/Icons'

import Pagination from '@/components/Pagination'
import FileUpload from '@/components/FileUpload'
import styles from './Students.module.css'

export default function AlunosPage() {
    const router = useRouter()
    const { showToast } = useToast()
    const [alunos, setAlunos] = useState([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [showDeleteDialog, setShowDeleteDialog] = useState(false)
    const [selectedAluno, setSelectedAluno] = useState(null)
    const [editingAluno, setEditingAluno] = useState(null)
    const [formData, setFormData] = useState({
        nome: '',
        email: '',
        telefone_whatsapp: '',
        notificacoes_ativas: true,
        objetivo: ''
    })
    const [searchTerm, setSearchTerm] = useState('')
    const [showImportModal, setShowImportModal] = useState(false)
    const [importLoading, setImportLoading] = useState(false)
    const [importResults, setImportResults] = useState(null)

    // Pagination Params
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [totalItems, setTotalItems] = useState(0)
    const itemsPerPage = 9 // Grid 3x3

    useEffect(() => {
        loadAlunos()
    }, [page]) // Recarregar quando mudar página

    useEffect(() => {
        const timer = setTimeout(() => {
            if (page === 1) loadAlunos()
            else setPage(1)
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

    const handleImport = async (file) => {
        setImportLoading(true)
        setImportResults(null)

        const formData = new FormData()
        formData.append('arquivo', file)

        try {
            const response = await api.post('/alunos/importar-csv', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            })

            if (response.data.success) {
                setImportResults(response.data.data)
                showToast('Importação concluída!', 'success')
                loadAlunos()
            }
        } catch (error) {
            console.error(error)
            showToast(error.response?.data?.error || 'Erro ao importar arquivo', 'error')
        } finally {
            setImportLoading(false)
        }
    }

    const downloadTemplate = async () => {
        // Cria planilha Excel nativa (.xlsx) - funciona perfeitamente no Excel Brasil
        const XLSX = (await import('xlsx')).default || (await import('xlsx'))

        const data = [
            { nome: 'João Silva', telefone_whatsapp: '11999999999', notificacoes_ativas: 'true' },
            { nome: 'Maria Oliveira', telefone_whatsapp: '11888888888', notificacoes_ativas: 'false' }
        ]

        const ws = XLSX.utils.json_to_sheet(data)
        // Ajusta largura das colunas
        ws['!cols'] = [{ wch: 25 }, { wch: 20 }, { wch: 20 }]

        const wb = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(wb, ws, 'Alunos')
        XLSX.writeFile(wb, 'modelo_alunos.xlsx')
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

    const handleDelete = async () => {
        try {
            await api.delete(`/alunos/${selectedAluno.id}`)
            showToast('Aluno excluído!', 'success')
            loadAlunos()
        } catch (error) {
            showToast('Erro ao excluir aluno', 'error')
        } finally {
            setShowDeleteDialog(false)
            setSelectedAluno(null)
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
            <div className="flex justify-center p-20">
                <div className="spinner !w-12 !h-12" />
            </div>
        )
    }

    return (
        <div className={styles.container}>
            {/* Actions Bar */}
            <div className={styles.actionBar}>
                <div className={styles.searchWrapper}>
                    <div className={styles.searchIcon}>
                        <Icons.Search size={18} strokeWidth={2.5} />
                    </div>
                    <input
                        type="text"
                        placeholder="Buscar por nome..."
                        className={`input ${styles.searchInput}`}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-3 flex-wrap">
                    <button
                        onClick={() => setShowImportModal(true)}
                        className="btn btn-secondary !h-11"
                    >
                        <Icons.Upload size={18} />
                        <span>Importar</span>
                    </button>
                    <button
                        onClick={() => {
                            setEditingAluno(null)
                            setFormData({ nome: '', email: '', telefone_whatsapp: '', notificacoes_ativas: true, objetivo: '' })
                            setShowModal(true)
                        }}
                        className="btn btn-primary !h-11"
                    >
                        <Icons.Plus size={18} />
                        <span>Novo Aluno</span>
                    </button>
                </div>
            </div>

            {/* Students Grid */}
            <div className={styles.grid}>
                {alunos.length === 0 ? (
                    <div className={styles.emptyState}>
                        <div className={styles.emptyState__iconBox}>
                            <Icons.Students size={32} />
                        </div>
                        <h3 className={styles.emptyState__title}>Nenhum aluno encontrado</h3>
                        <p className={styles.emptyState__text}>
                            {searchTerm ? 'Tente ajustar os termos da busca' : 'Cadastre seu primeiro aluno para começar'}
                        </p>
                    </div>
                ) : (
                    alunos.map((aluno) => (
                        <div
                            key={aluno.id}
                            className={styles.studentCard}
                        >
                            {/* Header: Avatar + Info */}
                            <div className={styles.studentCard__header}>
                                <div className={styles.studentCard__avatar}>
                                    {getInitials(aluno.nome)}
                                </div>
                                <div className={styles.studentCard__info}>
                                    <h3 className={styles.studentCard__name}>
                                        {aluno.nome}
                                    </h3>
                                    <div className={styles.studentCard__status}>
                                        <div className={styles.studentCard__statusIcon}>
                                            <Icons.Notifications
                                                size={14}
                                                color={aluno.notificacoes_ativas ? 'var(--color-success)' : 'var(--color-danger)'}
                                            />
                                        </div>
                                        <span>{aluno.notificacoes_ativas ? 'Notificações Ativas' : 'Notificações Inativas'}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Details Grid */}
                            <div className={styles.studentCard__details}>
                                <div className="detailItem">
                                    <p className={styles.detailItem__label}>Contato</p>
                                    <p className={styles.detailItem__value}>{aluno.telefone_whatsapp}</p>
                                </div>
                                <div className="detailItem">
                                    <p className={styles.detailItem__label}>Plano Atual</p>
                                    <p className={`${styles.detailItem__value} ${styles['detailItem__value--primary']}`}>
                                        {aluno.contratos?.find(c => c.status === 'ativo')?.servico?.nome || '—'}
                                    </p>
                                </div>
                                <div className={styles['formGrid--full']}>
                                    <p className={styles.detailItem__label}>Objetivo</p>
                                    <p className={`${styles.detailItem__value} ${styles['detailItem__value--italic']}`}>
                                        {aluno.objetivo || 'Sem objetivo definido'}
                                    </p>
                                </div>
                            </div>

                            {/* Actions Group */}
                            <div className={styles.studentCard__actions}>
                                <button
                                    onClick={() => router.push(`/dashboard/alunos/${aluno.id}`)}
                                    className="btn btn-primary !flex-1 !h-10 !text-sm"
                                >
                                    <Icons.Calendar size={14} />
                                    <span>Ver Agenda</span>
                                </button>
                                <button
                                    onClick={() => handleEdit(aluno)}
                                    className="btn btn-icon btn-icon-primary !w-10 !h-10"
                                    title="Editar"
                                >
                                    <Icons.Edit size={18} />
                                </button>
                            </div>

                            {/* Floating Delete */}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedAluno(aluno);
                                    setShowDeleteDialog(true);
                                }}
                                className={styles.studentCard__deleteBtn}
                                title="Excluir aluno"
                            >
                                <Icons.Delete size={16} />
                            </button>
                        </div>
                    ))
                )}
            </div>

            {/* Modal de Aluno */}
            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title={editingAluno ? 'Editar Aluno' : 'Novo Aluno'}
            >
                <form onSubmit={handleSubmit}>
                    <div className={styles.formGrid}>
                        <div className={styles['formGrid--full']}>
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

                        <div className={styles['formGrid--full']}>
                            <label className="label">WhatsApp (DDD + Número) *</label>
                            <input
                                type="text"
                                className="input"
                                placeholder="11999999999"
                                value={formData.telefone_whatsapp}
                                onChange={(e) => setFormData({ ...formData, telefone_whatsapp: e.target.value })}
                                required
                            />
                        </div>

                        <div className={styles['formGrid--full']}>
                            <label className="label">Email</label>
                            <input
                                type="email"
                                className="input"
                                placeholder="aluno@email.com"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>

                        <div className={styles['formGrid--full']}>
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

                    <div className="mb-6">
                        <label className="flex items-center gap-3 cursor-pointer p-2 hover:bg-black/5 rounded-lg transition-colors">
                            <input
                                type="checkbox"
                                checked={formData.notificacoes_ativas}
                                onChange={(e) => setFormData({ ...formData, notificacoes_ativas: e.target.checked })}
                                className="w-5 h-5 accent-primary"
                            />
                            <span className="text-sm font-bold">Habilitar notificações via WhatsApp</span>
                        </label>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-border">
                        <button
                            type="button"
                            onClick={() => setShowModal(false)}
                            className="btn btn-secondary"
                        >
                            Cancelar
                        </button>
                        <button type="submit" className="btn btn-primary !px-8">
                            {editingAluno ? 'Salvar Alterações' : 'Cadastrar Aluno'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Modal de Importação */}
            <Modal
                isOpen={showImportModal}
                onClose={() => {
                    setShowImportModal(false)
                    setImportResults(null)
                }}
                title="Importar Alunos"
            >
                {!importResults ? (
                    <div>
                        <p className="text-sm text-secondary mb-6">
                            Suba sua lista de alunos de uma vez usando um arquivo CSV ou Excel.
                            Certifique-se de seguir o modelo abaixo para evitar erros.
                        </p>

                        <div className={styles.importInstructions}>
                            <h4 className={styles.importInstructions__title}>Instruções:</h4>
                            <ul className={styles.importInstructions__list}>
                                <li>Formatos aceitos: <strong>.csv</strong>, <strong>.xlsx</strong> ou <strong>.xls</strong></li>
                                <li>Colunas: <strong>nome, telefone_whatsapp, notificacoes_ativas</strong></li>
                                <li>Telefone com DDD apenas números (ex: 11999999999)</li>
                            </ul>
                        </div>

                        <div className={styles.importActions}>
                            <button
                                onClick={downloadTemplate}
                                className="btn btn-secondary"
                            >
                                <Icons.Download size={16} />
                                <span>Baixar Modelo</span>
                            </button>

                            <FileUpload
                                label={importLoading ? 'Importando...' : 'Selecionar Arquivo'}
                                onFileSelect={handleImport}
                                accept=".csv,.xlsx,.xls"
                            />
                        </div>

                        {importLoading && (
                            <div className="text-center mt-6">
                                <div className="spinner !mx-auto !mb-2" />
                                <p className="text-xs text-primary font-bold">Processando lista...</p>
                            </div>
                        )}
                    </div>
                ) : (
                    <div>
                        <div className="text-center py-6">
                            <div className="w-14 h-14 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Icons.Check size={32} />
                            </div>
                            <h3 className="text-xl font-extrabold">Importação Finalizada!</h3>
                        </div>

                        <div className={styles.importResults}>
                            <div className={styles.resultCard}>
                                <span className={styles.resultCard__value}>
                                    {importResults.importados || 0}
                                </span>
                                <span className={styles.resultCard__label}>
                                    Novos Alunos
                                </span>
                            </div>
                            <div className={styles.resultCard}>
                                <span className={styles.resultCard__value}>
                                    {importResults.atualizados || 0}
                                </span>
                                <span className={styles.resultCard__label}>
                                    Atualizados
                                </span>
                            </div>
                        </div>

                        {importResults.erros?.length > 0 && (
                            <div className="mb-8">
                                <h4 className="text-sm font-bold mb-3 text-danger">
                                    Erros Encontrados ({importResults.erros.length}):
                                </h4>
                                <div className={styles.errorList}>
                                    {importResults.erros.map((erro, idx) => (
                                        <div key={idx} className={styles.errorItem}>
                                            <span className={styles.errorItem__label}>Linha {idx + 1}:</span> {erro.erro}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <button
                            onClick={() => {
                                setShowImportModal(false)
                                setImportResults(null)
                            }}
                            className="btn btn-primary w-full"
                        >
                            Concluir e Fechar
                        </button>
                    </div>
                )}
            </Modal>

            <ConfirmDialog
                isOpen={showDeleteDialog}
                onClose={() => setShowDeleteDialog(false)}
                onConfirm={handleDelete}
                title="Excluir Aluno"
                message={`Tem certeza que deseja excluir "${selectedAluno?.nome}"? Todas as sessões e contratos vinculados serão mantidos no histórico.`}
                confirmText="Excluir Aluno"
                danger
            />

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
