'use client'
import { createPortal } from 'react-dom'
import { useEffect, useState } from 'react'
import styles from './Modal.module.css'

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

    const modalContent = (
        <div className="overlay" onClick={onClose}>
            <div
                className={`${styles.panel} ${styles[`panel--${size}`]}`}
                onClick={(e) => e.stopPropagation()}
            >
                <div className={styles.header}>
                    <h2 className={styles.title}>{title}</h2>
                    <button
                        onClick={onClose}
                        className={styles.closeBtn}
                        aria-label="Fechar modal"
                    >
                        ×
                    </button>
                </div>
                <div className={styles.body}>
                    {children}
                </div>
            </div>
        </div>
    )

    return createPortal(modalContent, document.body)
}
