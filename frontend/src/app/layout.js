import '../styles/globals.css'

export default function RootLayout({ children }) {
    return (
        <html lang="pt-BR">
            <head>
                <title>Personal Agenda - Gestão de Alunos</title>
                <meta name="description" content="Sistema de gestão para personal trainers" />
                <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0" />
                <link rel="manifest" href="/manifest.json" />
                <meta name="theme-color" content="#6366f1" />
                <meta name="apple-mobile-web-app-capable" content="yes" />
                <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
            </head>
            <body>{children}</body>
        </html>
    )
}
