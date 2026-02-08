'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function HomePage() {
    const router = useRouter()

    useEffect(() => {
        const token = localStorage.getItem('token')
        if (token) {
            router.push('/dashboard')
        } else {
            router.push('/login')
        }
    }, [router])

    return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
            <div className="spinner" style={{ width: '3rem', height: '3rem' }} />
        </div>
    )
}
