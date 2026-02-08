require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ ERRO: Faltam variáveis de ambiente!');
    process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function confirmEmail() {
    const email = 'smartconverge@gmail.com';

    console.log(`🔄 Confirmando email manualmente para: ${email}...`);

    // 1. Encontrar o usuário
    const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers();

    if (listError) { console.error('❌ Erro listar usuários:', listError); return; }

    const user = users.find(u => u.email === email);

    if (!user) { console.error('❌ Usuário não encontrado.'); return; }

    console.log(`✅ Usuário encontrado: ${user.id}`);
    console.log(`📅 Status atual: Confirmado em: ${user.email_confirmed_at}`);

    // 2. Atualizar para confirmado
    const { data: updatedUser, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
        user.id,
        { email_confirm: true } // Força confirmação de email
    );

    if (updateError) {
        console.error('❌ Erro ao confirmar email:', updateError.message);
    } else {
        console.log('\n==================================================');
        console.log('✅ EMAIL CONFIRMADO COM SUCESSO!');
        console.log('==================================================');
        console.log('Agora você pode fazer login sem clicar no link do email.');
        console.log(`📧 Email: ${email}`);
        console.log('Use a senha que definimos antes: NovaSenha123!');
    }
}

confirmEmail();
