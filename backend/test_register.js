require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
    console.error('❌ ERRO: Faltam variáveis de ambiente!');
    console.log(`SUPABASE_URL: ${supabaseUrl ? 'OK' : 'Faltando'}`);
    console.log(`SUPABASE_ANON_KEY: ${supabaseAnonKey ? 'OK' : 'Faltando'}`);
    console.log(`SUPABASE_SERVICE_ROLE_KEY: ${supabaseServiceKey ? 'OK' : 'Faltando'}`);
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function testRegister() {
    console.log('🔄 Testando registro de usuário (Simulação Rota /auth/register)...');

    const email = 'teste_registro_manual@personalagenda.com';
    const password = 'PasswordQualquer123!';
    const nome = 'Teste Registro Manual';
    const telefone = '5511999998888';

    // 1. Tentar criar usuário no Auth
    console.log(`1️⃣ Tentando criar usuário no Auth: ${email}`);
    const { data: authUser, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { nome } }
    });

    if (authError) {
        console.error('❌ Erro no Auth:', authError.message);
        return;
    }

    if (!authUser.user) {
        console.error('❌ Erro: Usuário não retornado pelo Auth. Talvez email confirmation required?');
        // Se precisar confirmar email, o user vem como null se não configurado auto-confirm? Vamos ver.
        console.log('Objeto authUser:', JSON.stringify(authUser, null, 2));
        return;
    }

    console.log(`✅ Usuário criado no Auth com ID: ${authUser.user.id}`);

    // 2. Tentar inserir na tabela de professores
    console.log('2️⃣ Tentando inserir na tabela professores com supabaseAdmin...');
    const { error: dbError } = await supabaseAdmin
        .from('professores')
        .insert([{
            id: authUser.user.id,
            nome,
            email,
            telefone_whatsapp: telefone,
            created_at: new Date()
        }]);

    if (dbError) {
        console.error('❌ Erro no Banco de Dados:', dbError.message);
        console.error('Detalhes:', dbError);
    } else {
        console.log('✅ Registro criado na tabela professores com sucesso!');
        console.log('🎉 O fluxo de cadastro está funcionando corretamente neste script.');
    }

    // Limpeza (opcional)
    console.log('\n🧹 Limpando usuário de teste criado...');
    const { error: delError } = await supabaseAdmin.auth.admin.deleteUser(authUser.user.id);
    if (!delError) console.log('✅ Usuário de teste removido.');
    else console.error('⚠️ Falha ao remover usuário de teste:', delError.message);

    // Remover da tabela também se deleteUser não for cascade
    await supabaseAdmin.from('professores').delete().eq('id', authUser.user.id);
}

testRegister();
