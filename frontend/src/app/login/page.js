'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'

export default function LoginPage() {
    const router = useRouter()
    const [formData, setFormData] = useState({
        email: '',
        senha: ''
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            const response = await api.post('/auth/login', formData)

            if (response.data.token) {
                console.log('Login realizado com sucesso! Token:', response.data.token);
                localStorage.setItem('token', response.data.token)
                localStorage.setItem('professor', JSON.stringify(response.data.professor))
                console.log('Redirecionando para /dashboard...');
                router.push('/dashboard')
            } else {
                console.error('Login retornou sucesso mas sem token:', response.data);
                setError('Erro inesperado no login. Tente novamente.');
            }
        } catch (err) {
            console.error('Erro detalhado no login:', err.response || err);
            const msg = err.response?.data?.error || 'Erro ao realizar login. Verifique o console.';
            setError(msg);
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
            padding: '1rem'
        }}>
            <div className="card" style={{ maxWidth: '400px', width: '100%' }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <h1 style={{ fontSize: '1.875rem', fontWeight: '700', marginBottom: '0.5rem' }}>
                        Personal Agenda
                    </h1>
                    <p className="text-muted">
                        Faça login para acessar o sistema
                    </p>
                </div>

                {error && (
                    <div style={{
                        padding: '0.75rem',
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid var(--danger)',
                        borderRadius: '0.375rem',
                        marginBottom: '1rem',
                        color: 'var(--danger)',
                        fontSize: '0.875rem'
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
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

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500' }}>
                            Senha
                        </label>
                        <input
                            type="password"
                            className="input"
                            value={formData.senha}
                            onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
                            placeholder="••••••••"
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
                                Entrando...
                            </>
                        ) : (
                            'Entrar'
                        )}
                    </button>
                </form>

                <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                    <div style={{ marginBottom: '0.5rem' }}>
                        <a href="/register" style={{ color: 'var(--primary)', fontWeight: '600', textDecoration: 'none' }}>
                            Não tem conta? Crie grátis agora
                        </a>
                    </div>
                    <div>
                        <a
                            href="#"
                            style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', textDecoration: 'none' }}
                            onClick={(e) => {
                                e.preventDefault()
                                alert('Entre em contato com o suporte para recuperar sua senha')
                            }}
                        >
                            Esqueceu sua senha?
                        </a>
                    </div>
                </div>
            </div>
        </div>
    )
}
