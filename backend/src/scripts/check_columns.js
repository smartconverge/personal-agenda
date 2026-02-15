const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const { supabaseAdmin } = require('../config/supabase');

async function checkColumns() {
    try {
        console.log('🔍 Verificando se as novas colunas já existem...');
        const { data, error } = await supabaseAdmin
            .from('professores')
            .select('whatsapp, cref, bio')
            .limit(1);

        if (error) {
            if (error.message && error.message.includes('column')) {
                console.log('❌ As colunas ainda não foram criadas.');
            } else {
                console.error('❌ Erro inesperado:', error.message);
            }
        } else {
            console.log('✅ As colunas JÁ EXISTEM! O SQL foi executado com sucesso.');
        }
    } catch (err) {
        console.error('❌ Erro ao verificar:', err.message);
    }
}

checkColumns();
