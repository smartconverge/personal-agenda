'use client'
import { createPortal } from 'react-dom'
import { useEffect, useState } from 'react'

export default function Modal({ isOpen, onClose, title, children, size = 'md' }) {
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

    const sizes = {
        sm: '400px',
        md: '600px',
        lg: '800px',
        xl: '1000px'
    }

    const modalContent = (
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.65)',
                display: 'grid',
                placeItems: 'center',
                zIndex: 9999,
                padding: '2rem 1rem',
                overflowY: 'auto',
                backdropFilter: 'blur(4px)'
            }}
            onClick={onClose}
        >
            <div
                className="card"
                style={{
                    maxWidth: sizes[size],
                    width: '100%',
                    margin: 'auto',
                    position: 'relative',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                    animation: 'scale-up 0.2s ease-out'
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '1.5rem',
                    paddingBottom: '1rem',
                    borderBottom: '1px solid var(--border)'
                }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: '800', margin: 0, color: 'var(--primary)' }}>
                        {title}
                    </h2>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'var(--bg-tertiary)',
                            border: 'none',
                            width: '2.5rem',
                            height: '2.5rem',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.5rem',
                            cursor: 'pointer',
                            color: 'var(--text-muted)',
                            transition: 'all 0.2s'
                        }}
                    >
                        ×
                    </button>
                </div>
                {children}
            </div>
            <style jsx>{`
                @keyframes scale-up {
                    from { opacity: 0; transform: scale(0.95); }
                    to { opacity: 1; transform: scale(1); }
                }
            `}</style>
        </div>
    )

    return createPortal(modalContent, document.body)
}
