'use client'
import { createPortal } from 'react-dom'
import { useEffect, useState } from 'react'
import styles from './ConfirmDialog.module.css'

export default function ConfirmDialog({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirmar',
    cancelText = 'Cancelar',
    danger = false
}) {
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
        <div className="overlay" onClick={onClose}>
            <div
                className={styles.panel}
                onClick={(e) => e.stopPropagation()}
            >
                <h3 className={`${styles.title} ${danger ? styles['title--danger'] : styles['title--default']}`}>
                    {title}
                </h3>
                <p className={styles.message}>
                    {message}
                </p>
                <div className={styles.actions}>
                    <button
                        className={styles.btnCancel}
                        onClick={onClose}
                    >
                        {cancelText}
                    </button>
                    <button
                        className={`${styles.btnConfirm} ${danger ? styles['btnConfirm--danger'] : styles['btnConfirm--default']}`}
                        onClick={() => {
                            onConfirm()
                            onClose()
                        }}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    )

    return createPortal(dialogContent, document.body)
}
