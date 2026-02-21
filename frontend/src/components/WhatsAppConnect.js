'use client'

import { useState, useEffect, useRef } from 'react'
import api from '@/lib/api'
import { Icons } from './Icons'
import styles from './WhatsAppConnect.module.css'

export default function WhatsAppConnect() {
    const [status, setStatus] = useState('loading')
    const [qrCode, setQrCode] = useState(null)
    const [instanceName, setInstanceName] = useState(null)
    const [loadingAction, setLoadingAction] = useState(false)
    const pollRef = useRef(null)

    useEffect(() => {
        checkStatus()

        pollRef.current = setInterval(() => {
            if (status === 'qrcode' || status === 'loading') {
                checkStatus(true)
            }
        }, 5000)

        return () => clearInterval(pollRef.current)
        // eslint-disable-next-line react-hooks/exhaustive-deps
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
                    setInstanceName(res.data.instance)
                    if (status !== 'qrcode') setStatus('disconnected')
                } else {
                    setStatus('disconnected')
                    setInstanceName(null)
                }
            } else {
                setStatus('disconnected')
            }
        } catch {
            setStatus('disconnected')
        } finally {
            if (!silent) setLoadingAction(false)
        }
    }

    const handleConnect = async () => {
        setLoadingAction(true)
        try {
            await api.post('/whatsapp/criar-instancia')
            const res = await api.get('/whatsapp/qrcode')
            if (res.data.success && res.data.qrcode) {
                setQrCode(res.data.qrcode)
                setStatus('qrcode')
            }
        } catch (error) {
            const msg = error.response?.data?.error || 'Erro desconhecido'
            alert(`Erro ao iniciar conexão: ${msg}`)
        } finally {
            setLoadingAction(false)
        }
    }

    const handleDisconnect = async () => {
        if (!confirm('Você precisará escanear o QR Code novamente para reconectar.')) return
        setLoadingAction(true)
        try {
            await api.delete('/whatsapp/desconectar')
            setStatus('disconnected')
            setInstanceName(null)
            setQrCode(null)
        } catch {
            // silently fail
        } finally {
            setLoadingAction(false)
        }
    }

    const isConnected = status === 'connected'

    return (
        <div className={styles.card}>
            <div className={styles.cardHeader}>
                <div className={`${styles.iconBox} ${isConnected ? styles['iconBox--connected'] : styles['iconBox--disconnected']}`}>
                    <Icons.MessageCircle size={24} />
                </div>
                <div className={styles.cardHeaderText}>
                    <h3>Conexão WhatsApp</h3>
                    <p>Conecte seu WhatsApp para enviar notificações automáticas aos alunos.</p>
                </div>
            </div>

            <div className={styles.statusBox}>
                {status === 'loading' && !qrCode && (
                    <div className={styles.loading}>
                        <div className="spinner spinner--dark" />
                        <span>Verificando conexão...</span>
                    </div>
                )}

                {status === 'connected' && (
                    <div className={styles.statusRow}>
                        <div className={styles.statusIndicator}>
                            <span className={`${styles.dot} ${styles['dot--connected']}`} />
                            <div className={styles.statusText}>
                                <span className={`${styles.statusLabel} ${styles['statusLabel--connected']}`}>Conectado</span>
                                {instanceName && <span className={styles.statusSub}>Instância: {instanceName}</span>}
                            </div>
                        </div>
                        <button
                            className={styles.btnDisconnect}
                            onClick={handleDisconnect}
                            disabled={loadingAction}
                        >
                            {loadingAction ? 'Aguarde...' : 'Desconectar'}
                        </button>
                    </div>
                )}

                {status === 'qrcode' && (
                    <div className={styles.qrBlock}>
                        <p className={styles.qrInstruction}>Escaneie o QR Code no seu WhatsApp</p>
                        <div className={styles.qrWrapper}>
                            {qrCode && <img src={qrCode} alt="QR Code para conexão com WhatsApp" />}
                        </div>
                        <p className={styles.qrHint}>Aguardando conexão… esta tela atualiza automaticamente.</p>
                    </div>
                )}

                {status === 'disconnected' && (
                    <div className={styles.statusRow}>
                        <div className={styles.statusIndicator}>
                            <span className={`${styles.dot} ${styles['dot--disconnected']}`} />
                            <div className={styles.statusText}>
                                <span className={`${styles.statusLabel} ${styles['statusLabel--disconnected']}`}>Não conectado</span>
                            </div>
                        </div>
                        <button
                            className={styles.btnConnect}
                            onClick={handleConnect}
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
