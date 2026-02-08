require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ ERRO: Faltam variáveis de ambiente!');
    process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function resetPassword() {
    const email = 'smartconverge@gmail.com'; // O email que está dando erro
    const newPassword = 'NovaSenha123!';

    console.log(`🔄 Resetando senha para o usuário: ${email}...`);

    // 1. Encontrar o usuário pelo email
    const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers();

    if (listError) {
        console.error('❌ Erro ao listar usuários:', listError.message);
        return;
    }

    const user = users.find(u => u.email === email);

    if (!user) {
        console.error('❌ Usuário não encontrado no Auth. Verifique o email.');
        return;
    }

    // 2. Atualizar a senha
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
        user.id,
        { password: newPassword }
    );

    if (updateError) {
        console.error('❌ Erro ao atualizar senha:', updateError.message);
    } else {
        console.log('\n==================================================');
        console.log('✅ SENHA ATUALIZADA COM SUCESSO');
        console.log('==================================================');
        console.log(`📧 Email: ${email}`);
        console.log(`🔑 Nova Senha: ${newPassword}`);
        console.log('==================================================\n');
        console.log('Tente fazer login agora com essa nova senha.');
    }
}

resetPassword();
