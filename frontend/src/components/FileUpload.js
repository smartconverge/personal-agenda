'use client'

import { useRef } from 'react'

export default function FileUpload({ onFileSelect, accept = '.csv', label = 'Selecionar arquivo' }) {
    const fileInputRef = useRef(null)

    const handleClick = () => {
        fileInputRef.current?.click()
    }

    const handleChange = (e) => {
        const file = e.target.files?.[0]
        if (file) {
            onFileSelect(file)
        }
    }

    return (
        <div>
            <input
                ref={fileInputRef}
                type="file"
                accept={accept}
                onChange={handleChange}
                style={{ display: 'none' }}
            />
            <button
                type="button"
                className="btn btn-secondary"
                onClick={handleClick}
            >
                📁 {label}
            </button>
        </div>
    )
}
