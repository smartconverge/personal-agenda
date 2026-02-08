'use client'

import { createContext, useContext, useState } from 'react'

const ToastContext = createContext()

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([])

    const showToast = (message, type = 'info') => {
        const id = Date.now()
        setToasts(prev => [...prev, { id, message, type }])
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id))
        }, 3000)
    }

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div style={{
                position: 'fixed',
                top: '1rem',
                right: '1rem',
                zIndex: 9999,
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem'
            }}>
                {toasts.map(toast => (
                    <div
                        key={toast.id}
                        className={`toast toast-${toast.type}`}
                        style={{
                            padding: '1rem',
                            borderRadius: '0.5rem',
                            backgroundColor: toast.type === 'success' ? 'var(--success)' :
                                toast.type === 'error' ? 'var(--danger)' :
                                    toast.type === 'warning' ? 'var(--warning)' :
                                        'var(--primary)',
                            color: 'white',
                            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                            minWidth: '250px',
                            animation: 'slideIn 0.3s ease-out'
                        }}
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
        throw new Error('useToast must be used within ToastProvider')
    }
    return context
}
