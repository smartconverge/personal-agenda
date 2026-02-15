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
                        radial-gradient(circle at 10% 20%, rgba(236, 72, 153, 0.05) 0%, transparent 30%),
                        radial-gradient(circle at 90% 80%, rgba(59, 130, 246, 0.05) 0%, transparent 30%);
                    position: relative;
                    overflow: hidden;
                    font-family: 'Plus Jakarta Sans', sans-serif;
                }

                /* Floating Fitness Icons */
                .bg-icon {
                    position: absolute;
                    opacity: 0.1;
                    color: white;
                    z-index: 0;
                    pointer-events: none;
                    animation: float 6s ease-in-out infinite;
                }

                @keyframes float {
                    0%, 100% { transform: translateY(0) rotate(0deg); }
                    50% { transform: translateY(-20px) rotate(10deg); }
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

                .brand-logo {
                    text-align: center;
                    margin-bottom: 2.5rem;
                }

                .brand-logo h1 {
                    font-size: 2.5rem;
                    font-weight: 900;
                    margin-bottom: 0.5rem;
                    background: linear-gradient(to right, #f472b6, #60a5fa, #34d399);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    letter-spacing: -0.04em;
                }

                .brand-logo p {
                    color: #94a3b8;
                    font-size: 0.875rem;
                    letter-spacing: 0.05em;
                    text-transform: uppercase;
                    font-weight: 700;
                }

                .input-group {
                    position: relative;
                    margin-bottom: 1.5rem;
                }

                .input-group label {
                    display: block;
                    margin-bottom: 0.5rem;
                    font-size: 0.75rem;
                    font-weight: 800;
                    color: #64748b;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }

                .input-field {
                    width: 100%;
                    background: rgba(30, 41, 59, 0.5);
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    border-radius: 1rem;
                    padding: 1rem 1rem 1rem 3rem;
                    color: white;
                    font-size: 1rem;
                    transition: all 0.3s;
                }

                .input-field:focus {
                    outline: none;
                    background: rgba(30, 41, 59, 0.8);
                    border-color: #10b981;
                    box-shadow: 0 0 20px rgba(16, 185, 129, 0.1);
                }

                .input-icon {
                    position: absolute;
                    left: 1rem;
                    top: 2.35rem;
                    color: #475569;
                    transition: color 0.3s;
                }

                .input-field:focus + .input-icon {
                    color: #10b981;
                }

                .login-btn {
                    width: 100%;
                    padding: 1.1rem;
                    background: linear-gradient(135deg, #10b981 0%, #3b82f6 100%);
                    border: none;
                    border-radius: 1rem;
                    color: white;
                    font-size: 1.125rem;
                    font-weight: 800;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.75rem;
                    transition: all 0.3s;
                    box-shadow: 0 10px 15px -3px rgba(16, 185, 129, 0.3);
                    margin-top: 2rem;
                }

                .login-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 20px 25px -5px rgba(16, 185, 129, 0.4);
                    filter: brightness(1.1);
                }

                .login-footer {
                    margin-top: 2rem;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    font-size: 0.8125rem;
                }

                .footer-link {
                    color: #94a3b8;
                    text-decoration: none;
                    transition: color 0.2s;
                    font-weight: 600;
                }

                .footer-link:hover {
                    color: white;
                }

                .pulse-heart {
                    position: absolute;
                    top: 1.5rem;
                    left: 50%;
                    transform: translateX(-50%);
                    color: #f43f5e;
                    animation: heartbeat 1.5s ease-in-out infinite;
                    opacity: 0.4;
                }

                @keyframes heartbeat {
                    0%, 100% { transform: translateX(-50%) scale(1); }
                    10% { transform: translateX(-50%) scale(1.2); }
                    20% { transform: translateX(-50%) scale(1.1); }
                    30% { transform: translateX(-50%) scale(1.3); }
                }
            `}</style>

            {/* Background elements */}
            <div className="bg-icon" style={{ top: '15%', left: '10%' }}><Icons.Fitness size={64} /></div>
            <div className="bg-icon" style={{ top: '70%', left: '15%', animationDelay: '1s' }}><Icons.TrendingUp size={48} /></div>
            <div className="bg-icon" style={{ top: '20%', right: '12%', animationDelay: '2s' }}><Icons.Calendar size={56} /></div>
            <div className="bg-icon" style={{ top: '65%', right: '8%', animationDelay: '3s' }}><Icons.Clock size={52} /></div>

            <div className="login-card">
                <div className="pulse-heart">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                    </svg>
                </div>

                <div className="brand-logo">
                    <h1>Personal Agenda</h1>
                    <p>Sua jornada fit começa aqui</p>
                </div>

                {error && (
                    <div style={{
                        padding: '1rem',
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.2)',
                        borderRadius: '0.75rem',
                        marginBottom: '1.5rem',
                        color: '#f87171',
                        fontSize: '0.8125rem',
                        textAlign: 'center',
                        fontWeight: '600'
                    }}>
                        {error}
                    </div>
                )}

                {successMsg && (
                    <div style={{
                        padding: '1rem',
                        background: 'rgba(16, 185, 129, 0.1)',
                        border: '1px solid rgba(16, 185, 129, 0.2)',
                        borderRadius: '0.75rem',
                        marginBottom: '1.5rem',
                        color: '#34d399',
                        fontSize: '0.8125rem',
                        textAlign: 'center',
                        fontWeight: '600'
                    }}>
                        {successMsg}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label>E-mail</label>
                        <input
                            type="email"
                            className="input-field"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            placeholder="seu@email.com"
                            required
                            disabled={loading}
                        />
                        <div className="input-icon">
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
                            className="input-field"
                            value={formData.senha}
                            onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
                            placeholder="••••••••"
                            required
                            disabled={loading}
                        />
                        <div className="input-icon">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                            </svg>
                        </div>
                    </div>

                    <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', fontSize: '0.8125rem', color: '#94a3b8', fontWeight: '600' }}>
                            <input
                                type="checkbox"
                                checked={lembrar}
                                onChange={(e) => setLembrar(e.target.checked)}
                                style={{
                                    accentColor: '#10b981',
                                    width: '1rem',
                                    height: '1rem'
                                }}
                            />
                            Lembrar meu email
                        </label>
                        <a
                            href="#"
                            className="footer-link"
                            style={{ fontSize: '0.8125rem' }}
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
                        className="login-btn"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <div className="spinner" style={{ width: '1.25rem', height: '1.25rem', borderTopColor: 'white' }} />
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

                <div className="login-footer">
                    <a href="/register" className="footer-link" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Icons.Plus size={16} color="#10b981" />
                        Criar conta gratuita
                    </a>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <div style={{ width: '1px', height: '12px', background: 'rgba(255,255,255,0.1)' }} />
                        <span style={{ color: '#475569', fontSize: '0.75rem', fontWeight: '700' }}>v1.2.0</span>
                    </div>
                </div>
            </div>
        </div>
    )
}
