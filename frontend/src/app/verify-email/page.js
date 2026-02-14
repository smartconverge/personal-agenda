'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Icons } from '@/components/Icons'

export default function VerifyEmailPage() {
    const router = useRouter()
    const [status, setStatus] = useState('verifying') // verifying, success, error

    useEffect(() => {
        // O Supabase redireciona para cá após o clique no email.
        // Se houver um hash ou query params de erro, capturamos.
        const hash = window.location.hash
        if (hash.includes('error=access_denied') || hash.includes('error_description=Email+link+is+invalid+or+has+expired')) {
            setStatus('error')
        } else if (hash.includes('access_token=')) {
            setStatus('success')
            // Opcional: Auto-redirect após alguns segundos
            setTimeout(() => router.push('/dashboard'), 5000)
        }
    }, [router])

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

                {status === 'verifying' && (
                    <>
                        <div className="spinner" style={{ width: '3rem', height: '3rem', margin: '0 auto 1.5rem', borderTopColor: 'var(--primary)' }} />
                        <h1 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '1rem' }}>Verificando seu email...</h1>
                        <p style={{ color: 'var(--text-secondary)' }}>Estamos confirmando seu acesso ao sistema. Aguarde um instante.</p>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <div style={{
                            width: '4rem',
                            height: '4rem',
                            backgroundColor: 'rgba(16, 185, 129, 0.1)',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 1.5rem'
                        }}>
                            <Icons.CheckCircle size={40} color="var(--success)" />
                        </div>
                        <h1 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '1rem', color: 'var(--success)' }}>Email Confirmado!</h1>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                            Sua conta foi verificada com sucesso. Você já pode acessar todas as funcionalidades do Personal Agenda.
                        </p>
                        <Link href="/dashboard" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                            Ir para o Dashboard
                        </Link>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <div style={{
                            width: '4rem',
                            height: '4rem',
                            backgroundColor: 'rgba(239, 68, 68, 0.1)',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 1.5rem'
                        }}>
                            <Icons.Error size={40} color="var(--danger)" />
                        </div>
                        <h1 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '1rem', color: 'var(--danger)' }}>Link Expirado ou Inválido</h1>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                            O link de verificação que você utilizou expirou ou já foi processado. Por favor, tente fazer login ou solicite um novo link.
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <Link href="/login" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                                Voltar para o Login
                            </Link>
                            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '1rem' }}>
                                Dica: Links de segurança expiram por proteção. Tente realizar o processo novamente.
                            </p>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}
