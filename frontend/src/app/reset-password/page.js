'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'
import { Icons } from '@/components/Icons'
import { createClient } from '@/lib/supabase'

export default function ResetPasswordPage() {
    const router = useRouter()
    const [formData, setFormData] = useState({
        senha: '',
        confirmarSenha: ''
    })
    const [loading, setLoading] = useState(false)
    const [status, setStatus] = useState('form') // form, success, error
    const [error, setError] = useState('')

    const validatePassword = (password) => {
        const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
        return regex.test(password)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')

        if (formData.senha !== formData.confirmarSenha) {
            setError('As senhas não coincidem')
            return
        }

        if (!validatePassword(formData.senha)) {
            setError('A senha deve ter pelo menos 8 caracteres, incluindo letras maiúsculas, minúsculas, números e símbolos.')
            return
        }

        setLoading(true)

        try {
            const supabase = createClient()

            const { error: authError } = await supabase.auth.updateUser({
                password: formData.senha
            })

            if (authError) throw authError

            setStatus('success')
            setTimeout(() => router.push('/login'), 5000)
        } catch (err) {
            console.error('Erro ao resetar senha:', err)
            setError(err.message || 'Erro ao redefinir senha. O link pode ter expirado.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="login-container">
            <style>{`
                .login-container {
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 1.5rem;
                    background-color: #0f172a;
                    background-image: 
                        radial-gradient(circle at 50% 50%, rgba(16, 185, 129, 0.05) 0%, transparent 50%),
                        radial-gradient(circle at 10% 20%, rgba(59, 130, 246, 0.05) 0%, transparent 30%),
                        radial-gradient(circle at 90% 80%, rgba(236, 72, 153, 0.05) 0%, transparent 30%);
                    position: relative;
                    overflow: hidden;
                    font-family: 'Plus Jakarta Sans', sans-serif;
                }

                .login-card {
                    width: 100%;
                    max-width: 440px;
                    background: rgba(15, 23, 42, 0.8);
                    backdrop-filter: blur(12px);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 2rem;
                    padding: 3rem;
                    position: relative;
                    z-index: 10;
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
                    text-align: center;
                }

                .login-card::before {
                    content: '';
                    position: absolute;
                    inset: -1px;
                    border-radius: 2rem;
                    padding: 1px;
                    background: linear-gradient(45deg, #ec4899, #8b5cf6, #3b82f6, #10b981);
                    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
                    mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
                    -webkit-mask-composite: xor;
                    mask-composite: exclude;
                    opacity: 0.5;
                    pointer-events: none;
                }

                .brand-logo h1 {
                    font-size: 2rem;
                    font-weight: 800;
                    margin-bottom: 1.5rem;
                    color: white;
                }

                .brand-logo p {
                    color: #94a3b8;
                    margin-bottom: 2rem;
                    line-height: 1.6;
                }

                .action-btn {
                    width: 100%;
                    padding: 1rem;
                    background: linear-gradient(135deg, #10b981 0%, #3b82f6 100%);
                    border: none;
                    border-radius: 1rem;
                    color: white;
                    font-size: 1rem;
                    font-weight: 800;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.75rem;
                    transition: all 0.3s;
                    box-shadow: 0 8px 12px -3px rgba(16, 185, 129, 0.3);
                    text-decoration: none;
                }

                .action-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 15px 20px -5px rgba(16, 185, 129, 0.4);
                }

                .status-icon {
                    width: 5rem;
                    height: 5rem;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0 auto 2rem;
                }

                .input-group {
                    position: relative;
                    margin-bottom: 1.25rem;
                    text-align: left;
                }

                .input-group label {
                    display: block;
                    margin-bottom: 0.5rem;
                    font-size: 0.75rem;
                    font-weight: 800;
                    color: #64748b;
                    text-transform: uppercase;
                }

                .input-field {
                    width: 100%;
                    background: rgba(30, 41, 59, 0.5);
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    border-radius: 1rem;
                    padding: 0.9rem 1rem 0.9rem 3rem;
                    color: white;
                    font-size: 1rem;
                }

                .input-icon {
                    position: absolute;
                    left: 1rem;
                    top: 2.25rem;
                    color: #475569;
                }
            `}</style>

            <div className="login-card">
                <div className="brand-logo">
                    <h1>Nova Senha</h1>
                    <p>Crie uma senha forte e segura para sua conta</p>
                </div>

                {error && (
                    <div style={{
                        padding: '0.8rem',
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.2)',
                        borderRadius: '0.75rem',
                        marginBottom: '1.5rem',
                        color: '#f87171',
                        fontSize: '0.8125rem',
                        fontWeight: '600'
                    }}>
                        {error}
                    </div>
                )}

                {status === 'success' ? (
                    <>
                        <div className="status-icon" style={{ background: 'rgba(16, 185, 129, 0.1)' }}>
                            <Icons.CheckCircle size={48} color="#10b981" />
                        </div>
                        <h2 style={{ color: '#10b981', marginBottom: '1rem' }}>Senha Redefinida!</h2>
                        <p style={{ color: '#94a3b8', marginBottom: '2rem' }}>Sua senha foi atualizada com sucesso.</p>
                        <button onClick={() => router.push('/login')} className="action-btn">
                            Ir para Login
                        </button>
                    </>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <div className="input-group">
                            <label>Nova Senha</label>
                            <input
                                type="password"
                                className="input-field"
                                value={formData.senha}
                                onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
                                placeholder="••••••••"
                                required
                                disabled={loading}
                            />
                            <div className="input-icon">
                                <Icons.Fitness size={20} />
                            </div>
                        </div>

                        <div className="input-group" style={{ marginBottom: '2rem' }}>
                            <label>Confirmar Nova Senha</label>
                            <input
                                type="password"
                                className="input-field"
                                value={formData.confirmarSenha}
                                onChange={(e) => setFormData({ ...formData, confirmarSenha: e.target.value })}
                                placeholder="••••••••"
                                required
                                disabled={loading}
                            />
                            <div className="input-icon">
                                <Icons.Plus size={20} />
                            </div>
                        </div>

                        <button type="submit" className="action-btn" disabled={loading}>
                            {loading ? <div className="spinner" style={{ width: '1.25rem', height: '1.25rem', borderTopColor: 'white' }} /> : 'Redefinir Senha'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    )
}
