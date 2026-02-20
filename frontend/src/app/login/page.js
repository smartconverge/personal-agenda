'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'
import { Icons } from '@/components/Icons'


export default function LoginPage() {
    const router = useRouter()
    const [formData, setFormData] = useState({
        email: typeof window !== 'undefined' ? localStorage.getItem('remember_email') || '' : '',
        senha: ''
    })
    const [lembrar, setLembrar] = useState(typeof window !== 'undefined' ? !!localStorage.getItem('remember_email') : false)
    const [loading, setLoading] = useState(false)
    const [recuperando, setRecuperando] = useState(false)
    const [successMsg, setSuccessMsg] = useState('')
    const [error, setError] = useState('')

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            const response = await api.post('/auth/login', formData)

            // Debug avançado da estrutura
            console.log('Resposta bruta do login:', JSON.stringify(response.data, null, 2));

            // Tentativa resiliente de pegar o token
            // Pode estar em response.data.token (se backend mudou) ou response.data.data.token (padrão atual)
            const professor = response.data?.professor || response.data?.data?.professor;

            if (response.data.success) {
                console.log('Login realizado com sucesso! Cookie HttpOnly definido.');

                if (lembrar) {
                    localStorage.setItem('remember_email', formData.email)
                } else {
                    localStorage.removeItem('remember_email')
                }

                // Token agora é HttpOnly Cookie, não salvamos no localStorage
                localStorage.removeItem('token'); // Limpar qualquer token antigo

                if (professor) {
                    localStorage.setItem('professor', JSON.stringify(professor))
                }

                console.log('Redirecionando para /dashboard...');
                router.push('/dashboard')
            } else {
                console.error('Login falhou sem erro explícito');
                setError('Erro inesperado ao realizar login.');
            }
        } catch (err) {
            console.error('Erro detalhado no login:', err.response || err);
            const msg = err.response?.data?.error || 'Erro ao realizar login. Verifique o console.';
            setError(msg);
        } finally {
            setLoading(false)
        }
    }

    const handleRecuperarSenha = async () => {
        if (!formData.email) {
            setError('Digite seu email para recuperar a senha.')
            return
        }

        setRecuperando(true)
        setError('')
        setSuccessMsg('')

        try {
            await api.post('/auth/recuperar-senha', { email: formData.email })
            setSuccessMsg('Um link de recuperação foi enviado para o seu email.')
        } catch (err) {
            setError('Erro ao enviar email de recuperação. Verifique se o email está correto.')
        } finally {
            setRecuperando(false)
        }
    }

    return (
        <div className="auth-container">
            {/* Background elements */}
            <div className="auth-bg-icon" style={{ top: '15%', left: '10%' }}><Icons.Fitness size={64} /></div>
            <div className="auth-bg-icon" style={{ top: '70%', left: '15%', animationDelay: '1s' }}><Icons.TrendingUp size={48} /></div>
            <div className="auth-bg-icon" style={{ top: '20%', right: '12%', animationDelay: '2s' }}><Icons.Calendar size={56} /></div>
            <div className="auth-bg-icon" style={{ top: '65%', right: '8%', animationDelay: '3s' }}><Icons.Clock size={52} /></div>

            <div className="auth-card">
                <div className="auth-pulse-heart">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                    </svg>
                </div>

                <div className="auth-brand">
                    <h1>Personal Agenda</h1>
                    <p>Sua jornada fit começa aqui</p>
                </div>

                {error && (
                    <div className="card-flat p-4 !bg-red-500/10 border-red-500/20 text-red-500 text-xs text-center font-bold mb-6">
                        {error}
                    </div>
                )}

                {successMsg && (
                    <div className="card-flat p-4 !bg-green-500/10 border-green-500/20 text-green-500 text-xs text-center font-bold mb-6">
                        {successMsg}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label>E-mail</label>
                        <input
                            type="email"
                            className="auth-input-field"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            placeholder="seu@email.com"
                            required
                            disabled={loading}
                        />
                        <div className="auth-input-icon">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                                <polyline points="22,6 12,13 2,6" />
                            </svg>
                        </div>
                    </div>

                    <div className="input-group">
                        <label>Senha</label>
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
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                            </svg>
                        </div>
                    </div>

                    <div className="flex-between mb-6 text-xs text-muted font-bold">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={lembrar}
                                onChange={(e) => setLembrar(e.target.checked)}
                                className="accent-primary w-4 h-4"
                            />
                            Lembrar meu email
                        </label>
                        <a
                            href="#"
                            className="text-primary hover:underline"
                            onClick={(e) => {
                                e.preventDefault()
                                handleRecuperarSenha()
                            }}
                        >
                            {recuperando ? 'Enviando...' : 'Esqueceu a senha?'}
                        </a>
                    </div>

                    <button
                        type="submit"
                        className="auth-btn"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <div className="spinner !w-5 !h-5 !border-white" />
                                Processando...
                            </>
                        ) : (
                            <>
                                <span>Acessar Painel</span>
                                <Icons.TrendingUp size={20} />
                            </>
                        )}
                    </button>
                </form>

                <div className="auth-footer">
                    <a href="/register" className="flex items-center gap-2 text-primary font-bold hover:underline">
                        <Icons.Plus size={16} />
                        Criar conta gratuita
                    </a>
                    <div className="flex items-center gap-4 py-2 opacity-50">
                        <div className="w-px h-3 bg-white/10" />
                        <span className="text-[0.65rem] font-black uppercase tracking-tighter">v1.2.0</span>
                    </div>
                </div>
            </div>
        </div>
    )
}
