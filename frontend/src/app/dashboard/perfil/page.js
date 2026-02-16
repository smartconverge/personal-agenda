'use client'

import { useState, useEffect, useRef } from 'react'
import { Icons } from '@/components/Icons'
import api from '@/lib/api'
import { useToast } from '@/components/Toast'

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
        <div className="perfil-container">


            <form onSubmit={handleSubmit} className="perfil-form">
                <div className="perfil-grid">
                    {/* Coluna da Foto */}
                    <div className="photo-section card">
                        <div className="avatar-wrapper">
                            <div className="avatar-large">
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
                                style={{ display: 'none' }}
                            />
                            <button type="button" className="btn btn-secondary" onClick={handlePhotoClick} disabled={loading}>
                                <Icons.Edit size={16} /> Alterar Foto
                            </button>
                        </div>
                        <div className="plan-badge-inline">
                            <span className="label">Plano Atual:</span>
                            <span className={professor.plano === 'PREMIUM' ? 'badge-premium' : 'badge-starter'}>
                                {professor.plano?.toUpperCase() || 'STARTER'}
                            </span>
                        </div>
                    </div>

                    {/* Coluna de Dados Pessoais */}
                    <div className="data-section card">
                        <h3 className="card-title">Informações Pessoais</h3>
                        <div className="input-group-grid">
                            <div className="input-field">
                                <label>Nome Completo</label>
                                <input
                                    type="text"
                                    name="nome"
                                    value={professor.nome}
                                    onChange={handleChange}
                                    placeholder="Seu nome"
                                    required
                                />
                            </div>
                            <div className="input-field">
                                <label>E-mail (Login)</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={professor.email}
                                    disabled
                                    className="disabled-input"
                                />
                            </div>
                            <div className="input-field">
                                <label>WhatsApp</label>
                                <input
                                    type="text"
                                    name="telefone_whatsapp"
                                    value={professor.telefone_whatsapp}
                                    onChange={handleChange}
                                    placeholder="(00) 0 0000-0000"
                                />
                            </div>
                            <div className="input-field">
                                <label>Data de Nascimento</label>
                                <input
                                    type="date"
                                    name="data_nascimento"
                                    value={professor.data_nascimento}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Coluna de Dados Profissionais */}
                    <div className="pro-section card full-width">
                        <h3 className="card-title">Informações Profissionais</h3>
                        <div className="input-group-grid">
                            <div className="input-field">
                                <label>CREF</label>
                                <input
                                    type="text"
                                    name="cref"
                                    value={professor.cref}
                                    onChange={handleChange}
                                    placeholder="000000-G/UF"
                                />
                            </div>
                            <div className="input-field">
                                <label>Especialidades</label>
                                <input
                                    type="text"
                                    name="especialidade"
                                    value={professor.especialidade}
                                    onChange={handleChange}
                                    placeholder="Ex: Musculação, Yoga, Pilates"
                                />
                            </div>
                            <div className="input-field full-width">
                                <label>Bio / Apresentação</label>
                                <textarea
                                    name="bio"
                                    value={professor.bio}
                                    onChange={handleChange}
                                    placeholder="Conte um pouco sobre sua trajetória profissional..."
                                    rows={4}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="form-actions">
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? 'Salvando...' : 'Salvar Alterações'}
                    </button>
                </div>
            </form>

            <style jsx>{`
                .perfil-container {
                    max-width: 1000px;
                    margin: 0 auto;
                }

                .header-perfil {
                    margin-bottom: 2rem;
                }

                .title-section {
                    font-size: 1.75rem;
                    color: var(--primary);
                    margin-bottom: 0.5rem;
                }

                .subtitle-section {
                    color: var(--text-muted);
                    font-size: 0.9375rem;
                }

                .perfil-grid {
                    display: grid;
                    grid-template-columns: 320px 1fr;
                    gap: 1.5rem;
                    margin-bottom: 2rem;
                }

                .card {
                    background: var(--bg-secondary);
                    border: 1px solid var(--border);
                    border-radius: 1rem;
                    padding: 1.5rem;
                    box-shadow: var(--shadow-sm);
                }

                .photo-section {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    text-align: center;
                    gap: 1.5rem;
                }

                .avatar-wrapper {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 1rem;
                }

                .avatar-large {
                    width: 120px;
                    height: 120px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, var(--primary), var(--primary-light));
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 3rem;
                    font-weight: 800;
                    color: white;
                    border: 4px solid var(--bg-primary);
                    box-shadow: var(--shadow);
                    overflow: hidden;
                }

                .avatar-large img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }

                .avatar-large img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }

                .plan-badge-inline {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0.75rem;
                    background: rgba(var(--primary-rgb), 0.05);
                    border-radius: 0.75rem;
                    width: 100%;
                    justify-content: center;
                }

                .badge-premium {
                    background: linear-gradient(135deg, #f59e0b, #d97706);
                    color: white;
                    padding: 0.25rem 0.625rem;
                    border-radius: 2rem;
                    font-size: 0.7rem;
                    font-weight: 800;
                    letter-spacing: 0.05em;
                }

                .badge-starter {
                    background: var(--bg-tertiary);
                    color: var(--text-secondary);
                    padding: 0.25rem 0.625rem;
                    border-radius: 2rem;
                    font-size: 0.7rem;
                    font-weight: 800;
                    letter-spacing: 0.05em;
                    border: 1px solid var(--border);
                }

                .label {
                    font-size: 0.75rem;
                    font-weight: 600;
                    color: var(--text-muted);
                }

                .card-title {
                    font-size: 1rem;
                    font-weight: 700;
                    color: var(--text-primary);
                    margin-bottom: 1.5rem;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }

                .input-group-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1.25rem;
                }

                .full-width {
                    grid-column: span 2;
                }

                .input-field {
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                }

                .input-field label {
                    font-size: 0.75rem;
                    font-weight: 600;
                    color: var(--text-secondary);
                }

                .input-field input, .input-field textarea {
                    padding: 0.75rem;
                    border: 1px solid var(--border);
                    border-radius: 0.625rem;
                    font-size: 0.875rem;
                    background: var(--bg-primary);
                    color: var(--text-primary);
                    transition: all 0.2s;
                }

                .input-field input:focus, .input-field textarea:focus {
                    outline: none;
                    border-color: var(--primary);
                    box-shadow: 0 0 0 3px rgba(var(--primary-rgb), 0.1);
                }

                .disabled-input {
                    background: var(--bg-tertiary) !important;
                    cursor: not-allowed;
                    opacity: 0.7;
                }

                .form-actions {
                    display: flex;
                    justify-content: flex-end;
                    gap: 1rem;
                }

                @media (max-width: 768px) {
                    .perfil-grid {
                        grid-template-columns: 1fr;
                    }
                    .input-group-grid {
                        grid-template-columns: 1fr;
                    }
                    .full-width {
                        grid-column: span 1;
                    }
                }
            `}</style>
        </div>
    )
}
