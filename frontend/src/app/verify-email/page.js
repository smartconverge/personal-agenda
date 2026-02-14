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
                    text-align: center;
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
                }

                .status-icon {
                    width: 5rem;
                    height: 5rem;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0 auto 2rem;
                }

                .brand-logo h1 {
                    font-size: 1.75rem;
                    font-weight: 800;
                    margin-bottom: 1rem;
                    color: white;
                }

                .brand-logo p {
                    color: #94a3b8;
                    margin-bottom: 2rem;
                    line-height: 1.6;
                    font-size: 0.9375rem;
                }

                .action-btn {
                    width: 100%;
                    padding: 1rem;
                    background: linear-gradient(135deg, #10b981 0%, #3b82f6 100%);
                    border: none;
                    border-radius: 1rem;
                    color: white;
                    font-size: 1rem;
                    font-weight: 800;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.75rem;
                    transition: all 0.3s;
                    box-shadow: 0 8px 12px -3px rgba(16, 185, 129, 0.3);
                    text-decoration: none;
                }

                .action-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 15px 20px -5px rgba(16, 185, 129, 0.4);
                }
            `}</style>

            <div className="login-card">
                <div className="brand-logo">
                    {status === 'verifying' && (
                        <>
                            <div className="spinner" style={{ width: '3.5rem', height: '3.5rem', borderTopColor: '#10b981', margin: '0 auto 2rem' }} />
                            <h1>Verificando Email</h1>
                            <p>Estamos confirmando seu acesso ao sistema. Um momento...</p>
                        </>
                    )}

                    {status === 'success' && (
                        <>
                            <div className="status-icon" style={{ background: 'rgba(16, 185, 129, 0.1)' }}>
                                <Icons.CheckCircle size={48} color="#10b981" />
                            </div>
                            <h1>Email Confirmado!</h1>
                            <p>Sua conta foi verificada com sucesso. Você já pode acessar o painel.</p>
                            <Link href="/dashboard" className="action-btn">
                                Acessar Painel <Icons.TrendingUp size={18} />
                            </Link>
                        </>
                    )}

                    {status === 'error' && (
                        <>
                            <div className="status-icon" style={{ background: 'rgba(239, 68, 68, 0.1)' }}>
                                <Icons.Error size={48} color="#f87171" />
                            </div>
                            <h1>Link Inválido</h1>
                            <p>O link de verificação expirou ou já foi utilizado. Tente entrar novamente.</p>
                            <Link href="/login" className="action-btn">
                                Voltar para Login
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}
