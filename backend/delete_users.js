require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Erro: Variáveis de ambiente SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são obrigatórias.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function deleteUsers() {
    console.log('Iniciando remoção de usuários de teste...');

    // Lista de emails para apagar
    const emailsToDelete = [
        'admin@personalagenda.com',
        'teste@personalagenda.com', // caso tenha criado algum teste
        // Adicione outros emails se necessário
    ];

    // 1. Apagar da tabela de professores (relacional)
    console.log('Removendo registros da tabela professores...');
    const { error: dbError } = await supabase
        .from('professores')
        .delete()
        .in('email', emailsToDelete);

    if (dbError) {
        console.error('Erro ao limpar tabela professores:', dbError.message);
    } else {
        console.log('Registros de professores removidos.');
    }

    // 2. Apagar do Auth (usuários logados)
    console.log('Removendo usuários do sistema de autenticação...');
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();

    if (listError) {
        console.error('Erro ao listar usuários:', listError.message);
        return;
    }

    const usersToDelete = users.filter(u => emailsToDelete.includes(u.email));

    for (const user of usersToDelete) {
        const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id);
        if (deleteError) {
            console.error(`Erro ao apagar usuário ${user.email}:`, deleteError.message);
        } else {
            console.log(`Usuário ${user.email} removido do Auth com sucesso.`);
        }
    }

    console.log('\n==================================================');
    console.log('✅ USUÁRIOS REMOVIDOS COM SUCESSO');
    console.log('==================================================');
    console.log('Agora você pode testar o cadastro do zero na tela de login!');
}

deleteUsers();
