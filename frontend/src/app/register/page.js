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
        <div className="auth-container">
            {/* Background elements */}
            <div className="auth-bg-icon" style={{ top: '10%', left: '15%' }}><Icons.Users size={64} /></div>
            <div className="auth-bg-icon" style={{ top: '75%', left: '10%', animationDelay: '1.5s' }}><Icons.Fitness size={48} /></div>
            <div className="auth-bg-icon" style={{ top: '25%', right: '15%', animationDelay: '2.5s' }}><Icons.Money size={56} /></div>
            <div className="auth-bg-icon" style={{ top: '65%', right: '12%', animationDelay: '3.5s' }}><Icons.Calendar size={52} /></div>

            <div className="auth-card !max-w-[480px]">
                <div className="auth-brand">
                    <h1 className="text-xl">Crie sua Conta</h1>
                    <p>Junte-se ao time Personal Agenda</p>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-lg mb-5 text-red-500 text-xs text-center font-bold">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="label">Nome Completo</label>
                        <div className="relative">
                            <input
                                type="text"
                                className="auth-input-field"
                                value={formData.nome}
                                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                                placeholder="Seu nome"
                                required
                                disabled={loading}
                            />
                            <div className="auth-input-icon">
                                <Icons.Users size={18} />
                            </div>
                        </div>
                    </div>

                    <div className="mb-4">
                        <label className="label">E-mail</label>
                        <div className="relative">
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
                                <Icons.Mail size={18} />
                            </div>
                        </div>
                    </div>

                    <div className="mb-4">
                        <label className="label">WhatsApp</label>
                        <div className="relative">
                            <input
                                type="text"
                                className="auth-input-field"
                                value={formData.telefone_whatsapp}
                                onChange={(e) => setFormData({ ...formData, telefone_whatsapp: e.target.value })}
                                placeholder="5511999999999"
                                disabled={loading}
                            />
                            <div className="auth-input-icon">
                                <Icons.WhatsApp size={18} />
                            </div>
                        </div>
                    </div>

                    <div className="mb-4">
                        <label className="label">Senha Forte</label>
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
                                <Icons.Lock size={18} />
                            </div>
                        </div>
                        <p className="text-xs text-muted mt-2 opacity-70">
                            Use letras (A-z), números (0-9) e símbolos (@, #, !).
                        </p>
                    </div>

                    <div className="mb-8">
                        <label className="label">Confirmar Senha</label>
                        <div className="relative">
                            <input
                                type="password"
                                className="auth-input-field"
                                value={formData.confirmarSenha}
                                onChange={(e) => setFormData({ ...formData, confirmarSenha: e.target.value })}
                                placeholder="Repita a senha"
                                required
                                disabled={loading}
                            />
                            <div className="auth-input-icon">
                                <Icons.Lock size={18} />
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="auth-btn"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <div className="spinner !w-5 !h-5 !border-t-white" />
                                <span>Criando sua conta...</span>
                            </>
                        ) : (
                            <>
                                <span>Começar Agora</span>
                                <Icons.TrendingUp size={20} />
                            </>
                        )}
                    </button>
                </form>

                <div className="auth-footer flex-center gap-2">
                    <span className="text-muted">Já tem uma conta?</span>
                    <Link href="/login" className="text-primary font-bold">
                        Fazer Login
                    </Link>
                </div>
            </div>
        </div>
    )
}
