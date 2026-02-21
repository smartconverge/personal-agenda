import '@/styles/globals.css'

export const metadata = {
    title: 'Personal Agenda — Gestão para Personal Trainers',
    description: 'Sistema de gestão de agenda, alunos e contratos para personal trainers.',
    themeColor: '#0a3325',
    manifest: '/manifest.json',
    appleWebApp: {
        capable: true,
        statusBarStyle: 'black-translucent',
    },
    viewport: {
        width: 'device-width',
        initialScale: 1,
        maximumScale: 1,
        userScalable: false,
    },
}

export default function RootLayout({ children }) {
    return (
        <html lang="pt-BR">
            <body>{children}</body>
        </html>
    )
}
