'use client'

import { createContext, useContext, useState, useCallback } from 'react'
import styles from './Toast.module.css'

const ToastContext = createContext(null)

const TOAST_DURATION = 3500

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([])

    const showToast = useCallback((message, type = 'info') => {
        const id = Date.now()
        setToasts(prev => [...prev, { id, message, type }])
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id))
        }, TOAST_DURATION)
    }, [])

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div className={styles.container} aria-live="polite" aria-atomic="false">
                {toasts.map(toast => (
                    <div
                        key={toast.id}
                        className={`${styles.toast} ${styles[`toast--${toast.type}`] || styles['toast--info']}`}
                        role="status"
                    >
                        {toast.message}
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    )
}

export function useToast() {
    const context = useContext(ToastContext)
    if (!context) {
        throw new Error('useToast deve ser usado dentro de <ToastProvider>')
    }
    return context
}
