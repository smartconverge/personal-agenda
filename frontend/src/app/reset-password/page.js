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
        <div className="auth-container">
            {/* Background Icons */}
            <div className="auth-bg-icon top-[15%] left-[10%]"><Icons.Fitness size={64} /></div>
            <div className="auth-bg-icon bottom-[15%] right-[10%]"><Icons.Plus size={64} /></div>

            <div className="auth-card max-w-[480px]">
                <div className="auth-brand">
                    <h1>Nova Senha</h1>
                    <p>Crie uma senha forte e segura para sua conta</p>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-lg mb-6 text-red-400 text-xs font-semibold text-center">
                        {error}
                    </div>
                )}

                {status === 'success' ? (
                    <div className="text-center">
                        <div className="w-20 h-20 rounded-full flex-center bg-success/10 mx-auto mb-8">
                            <Icons.CheckCircle size={48} className="text-primary" />
                        </div>
                        <h2 className="text-primary text-xl font-extrabold mb-4">Senha Redefinida!</h2>
                        <p className="text-muted text-sm mb-8">Sua senha foi atualizada com sucesso.</p>
                        <button onClick={() => router.push('/login')} className="auth-btn">
                            Ir para Login
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <div className="mb-5 text-left">
                            <label className="label">Nova Senha</label>
                            <div className="relative">
                                <input
                                    type="password"
                                    className="auth-input-field"
                                    value={formData.senha}
                                    onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
                                    placeholder="••••••••"
                                    required
                                    disabled={loading}
                                />
                                <div className="auth-input-icon">
                                    <Icons.Fitness size={20} />
                                </div>
                            </div>
                        </div>

                        <div className="mb-8 text-left">
                            <label className="label">Confirmar Nova Senha</label>
                            <div className="relative">
                                <input
                                    type="password"
                                    className="auth-input-field"
                                    value={formData.confirmarSenha}
                                    onChange={(e) => setFormData({ ...formData, confirmarSenha: e.target.value })}
                                    placeholder="••••••••"
                                    required
                                    disabled={loading}
                                />
                                <div className="auth-input-icon">
                                    <Icons.Plus size={20} />
                                </div>
                            </div>
                        </div>

                        <button type="submit" className="auth-btn" disabled={loading}>
                            {loading ? (
                                <div className="spinner !w-5 !h-5 !border-t-white" />
                            ) : (
                                <>
                                    <Icons.CheckCircle size={20} />
                                    <span>Redefinir Senha</span>
                                </>
                            )}
                        </button>
                    </form>
                )}
            </div>
        </div>
    )
}
