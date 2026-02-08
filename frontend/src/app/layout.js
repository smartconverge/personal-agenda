import '../styles/globals.css'

export default function RootLayout({ children }) {
    return (
        <html lang="pt-BR">
            <head>
                <title>Personal Agenda - Gestão de Alunos</title>
                <meta name="description" content="Sistema de gestão para personal trainers" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
            </head>
            <body>{children}</body>
        </html>
    )
}
