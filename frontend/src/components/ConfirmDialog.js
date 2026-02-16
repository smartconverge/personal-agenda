'use client'
import { createPortal } from 'react-dom'
import { useEffect, useState } from 'react'

export default function ConfirmDialog({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirmar', cancelText = 'Cancelar', danger = false }) {
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
        if (isOpen) {
            document.body.style.overflow = 'hidden'
        }
        return () => {
            document.body.style.overflow = 'unset'
        }
    }, [isOpen])

    if (!isOpen || !mounted) return null

    const dialogContent = (
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.65)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 99999,
                padding: '1rem',
                backdropFilter: 'blur(4px)',
                animation: 'fade-in 0.2s'
            }}
            onClick={onClose}
        >
            <div
                className="card"
                style={{
                    maxWidth: '400px',
                    width: '100%',
                    margin: '0',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                    animation: 'scale-up 0.2s ease-out'
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <h3 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '1rem', color: danger ? 'var(--danger)' : 'var(--primary)' }}>
                    {title}
                </h3>
                <p className="text-muted" style={{ marginBottom: '1.5rem', fontSize: '0.9375rem' }}>
                    {message}
                </p>
                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                    <button
                        className="btn btn-secondary"
                        style={{ padding: '0.625rem 1.25rem', fontWeight: '700' }}
                        onClick={onClose}
                    >
                        {cancelText}
                    </button>
                    <button
                        className={`btn ${danger ? 'btn-danger' : 'btn-primary'}`}
                        style={{ padding: '0.625rem 1.25rem', fontWeight: '700' }}
                        onClick={() => {
                            onConfirm()
                            onClose()
                        }}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
            <style jsx>{`
                @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
                @keyframes scale-up { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
            `}</style>
        </div>
    )

    return createPortal(dialogContent, document.body)
}
