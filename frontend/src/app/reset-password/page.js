'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'
import { Icons } from '@/components/Icons'

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
            // O Supabase coloca o token no hash da URL automaticamente após o clique no email de reset
            // Ao chamar update com uma nova senha, ele usa esse contexto da sessão ativa pelo link
            const { createClientComponentClient } = await import('@supabase/auth-helpers-nextjs')
            const supabase = createClientComponentClient()

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

    if (status === 'success') {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '1rem',
                background: 'var(--bg-secondary)',
                backgroundImage: 'radial-gradient(circle at 10% 20%, rgba(16, 185, 129, 0.05) 0%, transparent 20%), radial-gradient(circle at 90% 80%, rgba(59, 130, 246, 0.05) 0%, transparent 20%)'
            }}>
                <div className="card-premium" style={{ maxWidth: '450px', width: '100%', padding: '3rem', textAlign: 'center', background: 'white' }}>
                    <div style={{ width: '4rem', height: '4rem', backgroundColor: 'rgba(16, 185, 129, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                        <Icons.CheckCircle size={40} color="var(--success)" />
                    </div>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '1rem', color: 'var(--success)' }}>Senha Redefinida!</h1>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Sua senha foi atualizada com sucesso. Você será redirecionado para o login em instantes.</p>
                    <button onClick={() => router.push('/login')} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>Ir para Login</button>
                </div>
            </div>
        )
    }

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            background: 'var(--bg-secondary)',
            backgroundImage: 'radial-gradient(circle at 10% 20%, rgba(16, 185, 129, 0.05) 0%, transparent 20%), radial-gradient(circle at 90% 80%, rgba(59, 130, 246, 0.05) 0%, transparent 20%)'
        }}>
            <div className="card-premium" style={{ maxWidth: '450px', width: '100%', padding: '2.5rem', background: 'white' }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <h1 style={{ fontSize: '1.875rem', fontWeight: '700', marginBottom: '0.5rem' }}>Nova Senha</h1>
                    <p className="text-muted">Crie uma senha forte e segura para sua conta</p>
                </div>

                {error && (
                    <div style={{ padding: '0.75rem', backgroundColor: '#fee2e2', border: '1px solid #ef4444', borderRadius: '0.375rem', marginBottom: '1rem', color: '#b91c1c', fontSize: '0.875rem' }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '1rem' }}>
                        <label className="label">Nova Senha</label>
                        <input
                            type="password"
                            className="input"
                            value={formData.senha}
                            onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
                            placeholder="Mínimo 8 caracteres"
                            required
                            disabled={loading}
                        />
                        <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
                            Dica: Use maiúsculas, números e um símbolo (ex: @, #, !).
                        </p>
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label className="label">Confirmar Nova Senha</label>
                        <input
                            type="password"
                            className="input"
                            value={formData.confirmarSenha}
                            onChange={(e) => setFormData({ ...formData, confirmarSenha: e.target.value })}
                            placeholder="Confirme sua nova senha"
                            required
                            disabled={loading}
                        />
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
                        {loading ? <div className="spinner" /> : 'Redefinir Senha'}
                    </button>
                </form>
            </div>
        </div>
    )
}
