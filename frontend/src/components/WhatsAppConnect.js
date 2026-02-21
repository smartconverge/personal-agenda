'use client'

import { useState, useEffect, useRef } from 'react'
import api from '@/lib/api'
import { Icons } from './Icons'

export default function WhatsAppConnect() {
    const [status, setStatus] = useState('loading') // loading, connected, disconnected, qrcode
    const [qrCode, setQrCode] = useState(null)
    const [instanceName, setInstanceName] = useState(null)
    const [loadingAction, setLoadingAction] = useState(false)
    const pollInterval = useRef(null)

    useEffect(() => {
        checkStatus()
        // Polling para verificar status a cada 5s se estiver tentando conectar
        pollInterval.current = setInterval(() => {
            if (status === 'qrcode' || status === 'loading') {
                checkStatus(true) // silent check
            }
        }, 5000)

        return () => clearInterval(pollInterval.current)
    }, [status])

    const checkStatus = async (silent = false) => {
        if (!silent) setLoadingAction(true)
        try {
            const res = await api.get('/whatsapp/status')
            if (res.data.success) {
                if (res.data.connected) {
                    setStatus('connected')
                    setInstanceName(res.data.instance)
                    setQrCode(null)
                } else if (res.data.instance) {
                    // Tem instância mas não tá conectada (talvez precise de QR novo)
                    setInstanceName(res.data.instance)
                    if (status !== 'qrcode') setStatus('disconnected')
                } else {
                    setStatus('disconnected')
                    setInstanceName(null)
                }
            } else {
                setStatus('disconnected')
            }
        } catch (error) {
            console.error('Erro ao verificar status:', error)
            setStatus('disconnected') // Em caso de erro, libera para tentar conectar
        } finally {
            if (!silent) setLoadingAction(false)
        }
    }

    const handleCreateInstance = async () => {
        setLoadingAction(true)
        try {
            // 1. Criar instância
            await api.post('/whatsapp/criar-instancia')

            // 2. Pedir QR Code
            await fetchQrCode()
        } catch (error) {
            console.error('Erro ao criar instância:', error)
            const msg = error.response?.data?.error || error.message || 'Erro desconhecido'
            alert(`Erro ao iniciar conexão: ${msg}`)
            setLoadingAction(false)
        }
    }

    const fetchQrCode = async () => {
        try {
            const res = await api.get('/whatsapp/qrcode')
            if (res.data.success && res.data.qrcode) {
                setQrCode(res.data.qrcode)
                setStatus('qrcode')
            }
        } catch (error) {
            console.error('Erro ao buscar QR:', error)
        } finally {
            setLoadingAction(false)
        }
    }

    const handleDisconnect = async () => {
        if (!confirm('Tem certeza? Você precisará escanear o QR Code novamente para reconectar.')) return

        setLoadingAction(true)
        try {
            await api.delete('/whatsapp/desconectar')
            setStatus('disconnected')
            setInstanceName(null)
            setQrCode(null)
        } catch (error) {
            console.error('Erro ao desconectar:', error)
        } finally {
            setLoadingAction(false)
        }
    }

    return (
        <div className="card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{
                    padding: '0.75rem',
                    borderRadius: '50%',
                    background: status === 'connected' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(107, 114, 128, 0.1)',
                    color: status === 'connected' ? '#10b981' : '#6b7280'
                }}>
                    <Icons.MessageCircle size={24} />
                </div>
                <div>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.25rem' }}>
                        Conexão WhatsApp
                    </h3>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                        Conecte seu WhatsApp para enviar notificações automáticas aos alunos.
                    </p>
                </div>
            </div>

            <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'var(--bg-page)', borderRadius: '0.75rem', border: '1px solid var(--border-color)' }}>
                {status === 'loading' && !qrCode ? (
                    <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                        <div className="spinner" style={{ width: '1.5rem', height: '1.5rem', margin: '0 auto 0.5rem' }} />
                        Verificando conexão...
                    </div>
                ) : status === 'connected' ? (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 0 4px rgba(16, 185, 129, 0.2)' }} />
                            <div>
                                <p style={{ fontWeight: '600', color: '#10b981' }}>Conectado</p>
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Instância: {instanceName}</p>
                            </div>
                        </div>
                        <button
                            onClick={handleDisconnect}
                            className="btn btn-danger"
                            disabled={loadingAction}
                            style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                        >
                            {loadingAction ? '...' : 'Desconectar'}
                        </button>
                    </div>
                ) : status === 'qrcode' ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                        <p style={{ fontWeight: '500' }}>Escaneie o QR Code no seu WhatsApp:</p>
                        <div style={{ padding: '1rem', background: 'white', borderRadius: '0.5rem' }}>
                            {qrCode && <img src={qrCode} alt="QR Code WhatsApp" style={{ maxWidth: '250px' }} />}
                        </div>
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                            Aguardando conexão... (Esta tela atualizará automaticamente)
                        </p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444' }} />
                            <p style={{ color: 'var(--text-secondary)' }}>Não conectado</p>
                        </div>
                        <button
                            onClick={handleCreateInstance}
                            className="btn btn-primary"
                            disabled={loadingAction}
                        >
                            {loadingAction ? 'Gerando QR Code...' : 'Conectar WhatsApp'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}
