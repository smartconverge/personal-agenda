require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Erro: Variáveis de ambiente SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são obrigatórias.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createAdmin() {
    console.log('Iniciando criação de usuário administrador...');

    const email = 'admin@personalagenda.com';
    const password = 'Password123!';
    const nome = 'Administrador';
    const telefone = '5511999999999';

    // 1. Verificar se usuário já existe
    const { data: users, error: listError } = await supabase.auth.admin.listUsers();

    if (listError) {
        console.error('Erro ao listar usuários:', listError.message);
        return;
    }

    const existingUser = users.users.find(u => u.email === email);
    let userId;

    if (existingUser) {
        console.log(`Usuário ${email} já existe no Auth (ID: ${existingUser.id}). Atualizando senha...`);
        userId = existingUser.id;

        const { error: updateError } = await supabase.auth.admin.updateUserById(userId, {
            password: password,
            user_metadata: { nome }
        });

        if (updateError) {
            console.error('Erro ao atualizar senha:', updateError.message);
            return;
        }
    } else {
        console.log(`Criando novo usuário Auth: ${email}`);
        const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: { nome }
        });

        if (authError) {
            console.error('Erro ao criar usuário no Auth:', authError.message);
            return;
        }
        userId = authUser.user.id;
    }

    // 2. Criar ou atualizar registro na tabela professores
    console.log('Verificando tabela de professores...');

    const { data: existingProfessor, error: findProfError } = await supabase
        .from('professores')
        .select('*')
        .eq('id', userId)
        .single();

    let dbError;

    if (existingProfessor) {
        console.log('Professor já existe no banco. Atualizando dados...');
        const { error } = await supabase
            .from('professores')
            .update({
                nome,
                email,
                telefone_whatsapp: telefone,
                updated_at: new Date()
            })
            .eq('id', userId);
        dbError = error;
    } else {
        console.log('Inserindo professor no banco...');
        const { error } = await supabase
            .from('professores')
            .insert([
                {
                    id: userId,
                    nome,
                    email,
                    telefone_whatsapp: telefone
                }
            ]);
        dbError = error;
    }

    if (dbError) {
        console.error('Erro ao manipular tabela professores:', dbError.message);
    } else {
        console.log('\n==================================================');
        console.log('✅ ACESSO CONFIGURADO COM SUCESSO');
        console.log('==================================================');
        console.log('📧 Email:', email);
        console.log('🔑 Senha:', password);
        console.log('==================================================\n');
        console.log('Agora você pode fazer login no dashboard!');
    }
}

createAdmin();
