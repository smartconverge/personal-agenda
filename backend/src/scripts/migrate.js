const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
    host: 'aws-0-us-east-1.pooler.supabase.com',
    port: 6543,
    user: 'postgres.pzvnwgpjszlufuoqlniv',
    password: '4e3&v4-Hm2!AZVG',
    database: 'postgres',
    ssl: {
        rejectUnauthorized: false
    }
});

const sql = `
ALTER TABLE professores 
ADD COLUMN IF NOT EXISTS whatsapp TEXT,
ADD COLUMN IF NOT EXISTS data_nascimento DATE,
ADD COLUMN IF NOT EXISTS cref TEXT,
ADD COLUMN IF NOT EXISTS especialidade TEXT,
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS foto_url TEXT,
ADD COLUMN IF NOT EXISTS plano TEXT DEFAULT 'STARTER',
ADD COLUMN IF NOT EXISTS plano_expira_em TIMESTAMP WITH TIME ZONE;
`;

async function runMigration() {
    try {
        console.log('🔄 Iniciando conexão com o banco de dados...');
        await client.connect();
        console.log('✅ Conectado com sucesso!');

        console.log('🚀 Executando migração...');
        await client.query(sql);
        console.log('✨ Migração concluída com sucesso!');

    } catch (err) {
        console.error('❌ Erro na migração:', err.message);
        process.exit(1);
    } finally {
        await client.end();
    }
}

runMigration();
