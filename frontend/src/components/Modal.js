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
            className="overlay"
            onClick={onClose}
        >
            <div
                className="card animate-scale-in"
                style={{
                    maxWidth: sizes[size],
                    width: '100%',
                    margin: 'auto',
                    position: 'relative',
                    boxShadow: 'var(--shadow-modal)',
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '1.5rem',
                    paddingBottom: '1rem',
                    borderBottom: '1px solid var(--border-color)'
                }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: '800', margin: 0, color: 'var(--color-primary)' }}>
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
