import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

// No Next.js, variáveis para o frontend DEVEM começar com NEXT_PUBLIC_
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

/**
 * Cria um cliente Supabase para uso em Componentes Client.
 * Ele automaticamente utiliza os cookies para manter a sessão.
 */
export const createClient = () => {
    // Se as variáveis estiverem configuradas no ambiente (ideal para produção/VPS)
    if (supabaseUrl && supabaseAnonKey) {
        return createClientComponentClient()
    }

    // Fallback de desenvolvimento (usando as chaves identificadas no projeto)
    // Isso garante que o build não quebre e o sistema funcione enquanto as Vars não são setadas no VPS
    return createClientComponentClient({
        supabaseUrl: 'https://pzvnwgpjszlufuoqlniv.supabase.co',
        supabaseKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB6dm53Z3Bqc3psdWZ1b3Fsbml2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA0OTIyNTEsImV4cCI6MjA4NjA2ODI1MX0.CjWR6xI0Dr-TZRffsuLXF4ResmBXQ9GadLA4Ea-I5kk'
    })
}
