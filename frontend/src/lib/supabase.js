import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

/**
 * Cria o cliente Supabase para uso em Client Components.
 * As variáveis NEXT_PUBLIC_SUPABASE_* devem ser configuradas
 * no ambiente (EasyPanel → Environment Variables).
 *
 * ⚠️ NUNCA coloque credenciais hardcoded aqui.
 *    Se as variáveis não estiverem definidas, o build irá falhar
 *    intencionalmente para forçar a configuração correta.
 */
export const createClient = () => createClientComponentClient()
