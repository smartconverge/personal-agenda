'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import api from '@/lib/api'
import { Icons } from '@/components/Icons'


export default function RegisterPage() {
    const router = useRouter()
    const [formData, setFormData] = useState({
        nome: '',
        email: '',
        telefone_whatsapp: '',
        senha: '',
        confirmarSenha: ''
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const validatePassword = (password) => {
        // Pelo menos 8 caracteres, uma letra maiúscula, uma minúscula, um número e um caractere especial
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
            setError('A senha deve ser forte: mínimo 8 caracteres, com letras maiúsculas, minúsculas, números e um símbolo.')
            return
        }

        setLoading(true)

        try {
            await api.post('/auth/register', {
                nome: formData.nome,
                email: formData.email,
                telefone_whatsapp: formData.telefone_whatsapp,
                senha: formData.senha
            })

            // Redirecionar para login com mensagem de sucesso
            // Podemos usar query param ou um toast global, por simplificação vamos alerta e redirect
            alert('Cadastro realizado com sucesso! Faça login para acessar.')
            router.push('/login')
        } catch (err) {
            console.error('Erro detalhado no cadastro:', err.response || err);
            const errorMessage = err.response?.data?.error || 'Erro ao realizar cadastro. Verifique o console.';
            setError(errorMessage);
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
                    max-width: 480px;
                    background: rgba(15, 23, 42, 0.8);
                    backdrop-filter: blur(12px);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 2rem;
                    padding: 2.5rem;
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
                    background: linear-gradient(45deg, #10b981, #3b82f6, #8b5cf6, #ec4899);
                    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
                    mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
                    -webkit-mask-composite: xor;
                    mask-composite: exclude;
                    opacity: 0.5;
                    pointer-events: none;
                }

                .brand-logo {
                    text-align: center;
                    margin-bottom: 2rem;
                }

                .brand-logo h1 {
                    font-size: 2rem;
                    font-weight: 800;
                    margin-bottom: 0.4rem;
                    color: white;
                    letter-spacing: -0.03em;
                }

                .brand-logo p {
                    color: #94a3b8;
                    font-size: 0.875rem;
                    font-weight: 500;
                }

                .input-group {
                    position: relative;
                    margin-bottom: 1.25rem;
                }

                .input-group label {
                    display: block;
                    margin-bottom: 0.4rem;
                    font-size: 0.7rem;
                    font-weight: 800;
                    color: #64748b;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }

                .input-field {
                    width: 100%;
                    background: rgba(30, 41, 59, 0.5);
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    border-radius: 0.75rem;
                    padding: 0.8rem 1rem 0.8rem 2.75rem;
                    color: white;
                    font-size: 0.9375rem;
                    transition: all 0.3s;
                }

                .input-field:focus {
                    outline: none;
                    background: rgba(30, 41, 59, 0.8);
                    border-color: #10b981;
                    box-shadow: 0 0 15px rgba(16, 185, 129, 0.1);
                }

                .input-icon {
                    position: absolute;
                    left: 0.85rem;
                    top: 2.15rem;
                    color: #475569;
                    transition: color 0.3s;
                }

                .input-field:focus + .input-icon {
                    color: #10b981;
                }

                .signup-btn {
                    width: 100%;
                    padding: 1rem;
                    background: linear-gradient(135deg, #10b981 0%, #3b82f6 100%);
                    border: none;
                    border-radius: 0.75rem;
                    color: white;
                    font-size: 1rem;
                    font-weight: 800;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.5rem;
                    transition: all 0.3s;
                    box-shadow: 0 8px 12px -3px rgba(16, 185, 129, 0.3);
                    margin-top: 1.5rem;
                }

                .signup-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 15px 20px -5px rgba(16, 185, 129, 0.4);
                }

                .login-footer {
                    margin-top: 1.5rem;
                    text-align: center;
                    font-size: 0.875rem;
                    color: #94a3b8;
                }

                .footer-link {
                    color: #10b981;
                    text-decoration: none;
                    font-weight: 700;
                    margin-left: 0.4rem;
                }

                .footer-link:hover {
                    text-decoration: underline;
                }

                .requirements {
                    font-size: 0.65rem;
                    color: #64748b;
                    margin-top: 0.35rem;
                    line-height: 1.4;
                }
            `}</style>

            {/* Background elements */}
            <div className="bg-icon" style={{ top: '10%', left: '15%' }}><Icons.Users size={64} /></div>
            <div className="bg-icon" style={{ top: '75%', left: '10%', animationDelay: '1.5s' }}><Icons.Fitness size={48} /></div>
            <div className="bg-icon" style={{ top: '25%', right: '15%', animationDelay: '2.5s' }}><Icons.Money size={56} /></div>
            <div className="bg-icon" style={{ top: '65%', right: '12%', animationDelay: '3.5s' }}><Icons.Calendar size={52} /></div>

            <div className="login-card">
                <div className="brand-logo">
                    <h1>Crie sua Conta</h1>
                    <p>Junte-se ao time Personal Agenda</p>
                </div>

                {error && (
                    <div style={{
                        padding: '0.8rem',
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.2)',
                        borderRadius: '0.75rem',
                        marginBottom: '1.25rem',
                        color: '#f87171',
                        fontSize: '0.75rem',
                        textAlign: 'center',
                        fontWeight: '600'
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label>Nome Completo</label>
                        <input
                            type="text"
                            className="input-field"
                            value={formData.nome}
                            onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                            placeholder="Seu nome"
                            required
                            disabled={loading}
                        />
                        <div className="input-icon">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                <circle cx="12" cy="7" r="4" />
                            </svg>
                        </div>
                    </div>

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
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                                <polyline points="22,6 12,13 2,6" />
                            </svg>
                        </div>
                    </div>

                    <div className="input-group">
                        <label>WhatsApp</label>
                        <input
                            type="text"
                            className="input-field"
                            value={formData.telefone_whatsapp}
                            onChange={(e) => setFormData({ ...formData, telefone_whatsapp: e.target.value })}
                            placeholder="5511999999999"
                            disabled={loading}
                        />
                        <div className="input-icon">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                            </svg>
                        </div>
                    </div>

                    <div className="input-group">
                        <label>Senha Forte</label>
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
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                            </svg>
                        </div>
                        <p className="requirements">
                            Use letras (A-z), números (0-9) e símbolos (@, #, !).
                        </p>
                    </div>

                    <div className="input-group">
                        <label>Confirmar Senha</label>
                        <input
                            type="password"
                            className="input-field"
                            value={formData.confirmarSenha}
                            onChange={(e) => setFormData({ ...formData, confirmarSenha: e.target.value })}
                            placeholder="Repita a senha"
                            required
                            disabled={loading}
                        />
                        <div className="input-icon">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                            </svg>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="signup-btn"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <div className="spinner" style={{ width: '1.2rem', height: '1.2rem', borderTopColor: 'white' }} />
                                Criando sua conta...
                            </>
                        ) : (
                            <>
                                <span>Começar Agora</span>
                                <Icons.TrendingUp size={20} />
                            </>
                        )}
                    </button>
                </form>

                <div className="login-footer">
                    Já tem uma conta?
                    <Link href="/login" className="footer-link">
                        Fazer Login
                    </Link>
                </div>
            </div>
        </div>
    )
}
