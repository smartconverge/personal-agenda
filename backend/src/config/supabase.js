const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
    throw new Error('Variáveis de ambiente do Supabase não configuradas');
}

// Cliente para operações autenticadas (com RLS)
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Cliente para operações administrativas (bypass RLS)
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

module.exports = {
    supabase,
    supabaseAdmin
};
