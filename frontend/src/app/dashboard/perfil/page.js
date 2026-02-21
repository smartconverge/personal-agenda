'use client'

import { useState, useEffect, useRef } from 'react'
import { Icons } from '@/components/Icons'
import api from '@/lib/api'
import { useToast } from '@/components/Toast'
import styles from './Profile.module.css'

export default function PerfilPage() {
    const { addToast } = useToast()
    const [loading, setLoading] = useState(false)
    const [professor, setProfessor] = useState({
        nome: '',
        email: '',
        telefone_whatsapp: '',
        data_nascimento: '',
        cref: '',
        especialidade: '',
        bio: '',
        foto_url: ''
    })

    const fileInputRef = useRef(null)

    useEffect(() => {
        const loadPerfil = async () => {
            setLoading(true)
            try {
                const response = await api.get('/perfil')
                if (response.data.success) {
                    setProfessor(prev => ({
                        ...prev,
                        ...response.data.data
                    }))
                }
            } catch (error) {
                console.error('Erro ao carregar perfil:', error)
                addToast('Erro ao carregar dados do perfil.', 'error')
            } finally {
                setLoading(false)
            }
        }
        loadPerfil()
    }, [])

    const handlePhotoClick = () => {
        fileInputRef.current?.click()
    }

    const handlePhotoChange = async (e) => {
        const file = e.target.files?.[0]
        if (!file) return

        if (file.size > 5 * 1024 * 1024) {
            addToast('A imagem deve ter no máximo 5MB', 'error')
            return
        }

        const formData = new FormData()
        formData.append('foto', file)

        try {
            setLoading(true)
            const response = await api.post('/perfil/upload-foto', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            })

            if (response.data.success) {
                const newFotoUrl = response.data.data.foto_url
                setProfessor(prev => ({ ...prev, foto_url: newFotoUrl }))

                // Atualizar localStorage
                const current = JSON.parse(localStorage.getItem('professor') || '{}')
                localStorage.setItem('professor', JSON.stringify({ ...current, foto_url: newFotoUrl }))

                addToast('Foto atualizada com sucesso!', 'success')

                // Disparar evento para atualizar layout
                window.dispatchEvent(new Event('user-profile-updated'))
            }
        } catch (error) {
            console.error('Erro ao enviar foto:', error)
            addToast('Erro ao enviar foto. Tente novamente.', 'error')
        } finally {
            setLoading(false)
            if (fileInputRef.current) fileInputRef.current.value = ''
        }
    }

    const handleChange = (e) => {
        const { name, value } = e.target
        setProfessor(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            const response = await api.put('/perfil', professor)
            if (response.data.success) {
                // Atualizar localStorage com os novos dados
                const currentProfessor = JSON.parse(localStorage.getItem('professor') || '{}')
                localStorage.setItem('professor', JSON.stringify({ ...currentProfessor, ...response.data.data }))
                addToast('Perfil atualizado com sucesso!', 'success')
                window.dispatchEvent(new Event('user-profile-updated'))
            }
        } catch (error) {
            console.error('Erro ao atualizar perfil:', error)
            addToast('Erro ao atualizar perfil.', 'error')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className={styles.container}>
            <form onSubmit={handleSubmit}>
                <div className={styles.grid}>
                    {/* Coluna da Foto */}
                    <div className={`${styles.section} ${styles.avatarSection}`}>
                        <div className={styles.avatarWrapper}>
                            <div className={styles.avatarLarge}>
                                {professor.foto_url ? (
                                    <img src={professor.foto_url} alt={professor.nome} />
                                ) : (
                                    professor.nome?.charAt(0) || 'P'
                                )}
                            </div>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handlePhotoChange}
                                accept="image/*"
                                className="hidden"
                            />
                            <button
                                type="button"
                                className="btn btn-secondary !px-6"
                                onClick={handlePhotoClick}
                                disabled={loading}
                            >
                                <Icons.Edit size={16} /> Alterar Foto
                            </button>
                        </div>
                        <div className={styles.planBadgeInline}>
                            <span className={styles.badgeLabel}>Plano Atual:</span>
                            <span className={professor.plano === 'PREMIUM' ? styles.badgePremium : styles.badgeStarter}>
                                {professor.plano?.toUpperCase() || 'STARTER'}
                            </span>
                        </div>
                    </div>

                    {/* Coluna de Dados Pessoais */}
                    <div className={styles.section}>
                        <h3 className={styles.cardTitle}>
                            <Icons.Students size={20} /> Informações Pessoais
                        </h3>
                        <div className={styles.formGrid}>
                            <div className={styles.inputField}>
                                <label>Nome Completo</label>
                                <input
                                    type="text"
                                    name="nome"
                                    className="input"
                                    value={professor.nome}
                                    onChange={handleChange}
                                    placeholder="Seu nome"
                                    required
                                />
                            </div>
                            <div className={styles.inputField}>
                                <label>E-mail (Login)</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={professor.email}
                                    disabled
                                    className="input !bg-tertiary !cursor-not-allowed !opacity-70"
                                />
                            </div>
                            <div className={styles.inputField}>
                                <label>WhatsApp</label>
                                <input
                                    type="text"
                                    name="telefone_whatsapp"
                                    className="input"
                                    value={professor.telefone_whatsapp}
                                    onChange={handleChange}
                                    placeholder="(00) 0 0000-0000"
                                />
                            </div>
                            <div className={styles.inputField}>
                                <label>Data de Nascimento</label>
                                <input
                                    type="date"
                                    name="data_nascimento"
                                    className="input"
                                    value={professor.data_nascimento}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Dados Profissionais */}
                    <div className={`${styles.section} ${styles.formGridFull}`}>
                        <h3 className={styles.cardTitle}>
                            <Icons.Lock size={20} /> Informações Profissionais
                        </h3>
                        <div className={styles.formGrid}>
                            <div className={styles.inputField}>
                                <label>CREF</label>
                                <input
                                    type="text"
                                    name="cref"
                                    className="input"
                                    value={professor.cref}
                                    onChange={handleChange}
                                    placeholder="000000-G/UF"
                                />
                            </div>
                            <div className={styles.inputField}>
                                <label>Especialidades</label>
                                <input
                                    type="text"
                                    name="especialidade"
                                    className="input"
                                    value={professor.especialidade}
                                    onChange={handleChange}
                                    placeholder="Ex: Musculação, Yoga, Pilates"
                                />
                            </div>
                            <div className={`${styles.inputField} ${styles.formGridFull}`}>
                                <label>Bio / Apresentação</label>
                                <textarea
                                    name="bio"
                                    className="input !h-auto"
                                    value={professor.bio}
                                    onChange={handleChange}
                                    placeholder="Conte um pouco sobre sua trajetória profissional..."
                                    rows={4}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className={styles.actions}>
                    <button type="submit" className="btn btn-primary !px-10 !h-12" disabled={loading}>
                        {loading ? 'Salvando...' : 'Salvar Alterações'}
                    </button>
                </div>
            </form>
        </div>
    )
}
