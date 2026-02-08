'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import api from '@/lib/api'

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

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')

        if (formData.senha !== formData.confirmarSenha) {
            setError('As senhas não coincidem')
            return
        }

        if (formData.senha.length < 6) {
            setError('A senha deve ter pelo menos 6 caracteres')
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
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            backgroundColor: '#f3f4f6'
        }}>
            <div className="card" style={{ maxWidth: '450px', width: '100%', padding: '2rem' }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <h1 style={{ fontSize: '1.875rem', fontWeight: '700', marginBottom: '0.5rem', color: '#111827' }}>
                        Crie sua conta
                    </h1>
                    <p className="text-muted">
                        Comece a organizar sua agenda hoje mesmo
                    </p>
                </div>

                {error && (
                    <div style={{
                        padding: '0.75rem',
                        backgroundColor: '#fee2e2',
                        border: '1px solid #ef4444',
                        borderRadius: '0.375rem',
                        marginBottom: '1rem',
                        color: '#b91c1c',
                        fontSize: '0.875rem'
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500' }}>
                            Nome Completo
                        </label>
                        <input
                            type="text"
                            className="input"
                            value={formData.nome}
                            onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                            placeholder="Seu nome"
                            required
                            disabled={loading}
                        />
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500' }}>
                            Email
                        </label>
                        <input
                            type="email"
                            className="input"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            placeholder="seu@email.com"
                            required
                            disabled={loading}
                        />
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500' }}>
                            WhatsApp (opcional)
                        </label>
                        <input
                            type="text"
                            className="input"
                            value={formData.telefone_whatsapp}
                            onChange={(e) => setFormData({ ...formData, telefone_whatsapp: e.target.value })}
                            placeholder="5511999999999"
                            disabled={loading}
                        />
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500' }}>
                            Senha
                        </label>
                        <input
                            type="password"
                            className="input"
                            value={formData.senha}
                            onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
                            placeholder="Mínimo 6 caracteres"
                            required
                            disabled={loading}
                        />
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500' }}>
                            Confirmar Senha
                        </label>
                        <input
                            type="password"
                            className="input"
                            value={formData.confirmarSenha}
                            onChange={(e) => setFormData({ ...formData, confirmarSenha: e.target.value })}
                            placeholder="Confirme sua senha"
                            required
                            disabled={loading}
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary"
                        style={{ width: '100%', justifyContent: 'center' }}
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <div className="spinner" />
                                Criando conta...
                            </>
                        ) : (
                            'Criar Conta Grátis'
                        )}
                    </button>
                </form>

                <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                    <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                        Já tem uma conta?{' '}
                        <Link href="/login" style={{ color: '#4f46e5', fontWeight: '500', textDecoration: 'none' }}>
                            Fazer Login
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}
