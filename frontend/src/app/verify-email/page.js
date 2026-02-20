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
        <div className="auth-container">
            {/* Background elements */}
            <div className="auth-bg-icon top-[20%] right-[15%]"><Icons.Mail size={64} /></div>
            <div className="auth-bg-icon bottom-[20%] left-[15%]"><Icons.CheckCircle size={64} /></div>

            <div className="auth-card">
                <div className="auth-brand">
                    {status === 'verifying' && (
                        <div className="text-center">
                            <div className="spinner !w-12 !h-12 !border-t-primary !mx-auto mb-8" />
                            <h1>Verificando Email</h1>
                            <p>Estamos confirmando seu acesso ao sistema. Um momento...</p>
                        </div>
                    )}

                    {status === 'success' && (
                        <div className="text-center">
                            <div className="w-20 h-20 rounded-full flex-center bg-success/10 mx-auto mb-8">
                                <Icons.CheckCircle size={48} className="text-primary" />
                            </div>
                            <h1>Email Confirmado!</h1>
                            <p>Sua conta foi verificada com sucesso. Você já pode acessar o painel.</p>
                            <Link href="/dashboard" className="auth-btn">
                                Acessar Painel <Icons.TrendingUp size={18} />
                            </Link>
                        </div>
                    )}

                    {status === 'error' && (
                        <div className="text-center">
                            <div className="w-20 h-20 rounded-full flex-center bg-red-500/10 mx-auto mb-8">
                                <Icons.Error size={48} className="text-red-400" />
                            </div>
                            <h1>Link Inválido</h1>
                            <p>O link de verificação expirou ou já foi utilizado. Tente entrar novamente.</p>
                            <Link href="/login" className="auth-btn">
                                Voltar para Login
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
