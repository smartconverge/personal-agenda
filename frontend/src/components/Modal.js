'use client'

export default function Modal({ isOpen, onClose, title, children, size = 'md' }) {
    if (!isOpen) return null

    const sizes = {
        sm: '400px',
        md: '600px',
        lg: '800px',
        xl: '1000px'
    }

    return (
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                display: 'grid',
                placeItems: 'center',
                zIndex: 1000,
                padding: '2rem 1rem',
                overflowY: 'auto'
            }}
            onClick={onClose}
        >
            <div
                className="card"
                style={{
                    maxWidth: sizes[size],
                    width: '100%',
                    margin: 'auto',
                    position: 'relative'
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '1.5rem'
                }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: '600', margin: 0 }}>
                        {title}
                    </h2>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'none',
                            border: 'none',
                            fontSize: '1.5rem',
                            cursor: 'pointer',
                            padding: '0.25rem',
                            color: 'var(--text-muted)'
                        }}
                    >
                        ×
                    </button>
                </div>
                {children}
            </div>
        </div>
    )
}
