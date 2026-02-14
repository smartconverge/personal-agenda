const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
    console.error('❌ CRÍTICO: Variáveis de ambiente do Supabase não configuradas no .env');
}

// Cliente para operações autenticadas (com RLS)
let supabase = null;
let supabaseAdmin = null;

if (supabaseUrl && supabaseAnonKey && supabaseServiceKey) {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
    supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
} else {
    // Se não houver config, exportamos objetos vazios para não quebrar o boot
    console.warn('⚠️  Clientes Supabase não inicializados por falta de variáveis no .env');
    supabase = {};
    supabaseAdmin = {};
}

module.exports = {
    supabase,
    supabaseAdmin
};
