const express = require('express');
const router = express.Router();
const { supabase, supabaseAdmin } = require('../config/supabase');

/**
 * POST /auth/register
 * Cadastrar novo professor (SaaS)
 */
router.post('/register', async (req, res) => {
    try {
        let { nome, email, senha, telefone_whatsapp } = req.body;

        if (!nome || !email || !senha) {
            return res.status(400).json({
                success: false,
                error: 'Nome, email e senha são obrigatórios'
            });
        }

        // Normalização de telefone
        if (telefone_whatsapp) {
            telefone_whatsapp = telefone_whatsapp.replace(/\D/g, '');
        }

        // 1. Criar usuário no Supabase Auth
        // Usamos supabaseAdmin para garantir a criação mesmo com configurações restritivas
        const { data: authUser, error: authError } = await supabase.auth.signUp({
            email,
            password: senha,
            options: {
                data: { nome },
                emailRedirectTo: 'https://app.smartconverge.com.br/login'
            }
        });

        if (authError) {
            console.error('Erro Supabase Auth:', authError);
            return res.status(400).json({
                success: false,
                error: authError.message || 'Erro ao criar conta de usuário.'
            });
        }

        if (!authUser.user) {
            return res.status(400).json({
                success: false,
                error: 'Erro ao criar usuário. Tente novamente.'
            });
        }

        // 2. Criar registro na tabela de professores usando admin client (bypass RLS)
        const { error: dbError } = await supabaseAdmin
            .from('professores')
            .insert([
                {
                    id: authUser.user.id,
                    nome,
                    email,
                    telefone_whatsapp,
                    plano: 'STARTER', // Novo Trial focado no plano STARTER
                    plano_expira_em: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                    created_at: new Date()
                }
            ]);

        if (dbError) {
            console.error('Erro ao criar professor na tabela (DB):', dbError);

            // Tentar mensagem amigável para chave duplicada
            if (dbError.code === '23505') {
                return res.status(400).json({
                    success: false,
                    error: 'Este email já está cadastrado como professor.'
                });
            }

            return res.status(500).json({
                success: false,
                error: 'Erro ao salvar dados do perfil do professor.'
            });
        }

        res.status(201).json({
            success: true,
            data: {
                message: 'Cadastro realizado com sucesso! Faça login para continuar.',
                user: authUser.user
            }
        });

    } catch (error) {
        console.error('Erro no cadastro:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno ao realizar cadastro'
        });
    }
});

/**
 * POST /auth/login
 * Autenticar professor
 */
router.post('/login', async (req, res) => {
    try {
        const { email, senha } = req.body;

        if (!email || !senha) {
            return res.status(400).json({
                success: false,
                error: 'Email e senha são obrigatórios'
            });
        }

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password: senha
        });

        if (error) {
            return res.status(401).json({
                success: false,
                error: 'Credenciais inválidas'
            });
        }

        // Buscar dados do professor
        let { data: professor, error: professorError } = await supabaseAdmin
            .from('professores')
            .select('id, nome, email, telefone_whatsapp, foto_url, plano, plano_expira_em')
            .eq('id', data.user.id)
            .maybeSingle(); // Usa maybeSingle para não estourar erro se não achar

        // Se o professor não existe na tabela (comum após reset de banco), criamos agora!
        if (!professor && !professorError) {
            console.log('👷 Perfil não encontrado. Criando perfil automático para:', data.user.email);

            const { data: newProfessor, error: createError } = await supabaseAdmin
                .from('professores')
                .insert([{
                    id: data.user.id,
                    nome: data.user.user_metadata?.nome || 'Professor',
                    email: data.user.email,
                    telefone_whatsapp: '', // Inicializa vazio
                    plano: 'STARTER', // Novo Trial focado no plano STARTER
                    plano_expira_em: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                    created_at: new Date()
                }])
                .select()
                .single();

            if (createError) {
                console.error('Erro ao criar perfil automático:', createError);
                return res.status(500).json({
                    success: false,
                    error: 'Erro ao criar seu perfil de professor.'
                });
            }
            professor = newProfessor;
        } else if (professor) {
            // Se já existe mas não tem plano definido (legado ou erro de migração), inicializa Trial
            if (!professor.plano || !professor.plano_expira_em) {
                console.log('🔄 Inicializando Trial para professor existente:', professor.email);
                const { data: updatedProfessor, error: updateError } = await supabaseAdmin
                    .from('professores')
                    .update({
                        plano: 'STARTER',
                        plano_expira_em: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
                    })
                    .eq('id', professor.id)
                    .select()
                    .single();

                if (!updateError) {
                    professor = updatedProfessor;
                }
            }
        } else if (professorError) {
            console.error('Erro ao buscar professor:', professorError);
            return res.status(500).json({
                success: false,
                error: 'Erro ao buscar dados do professor'
            });
        }

        res.cookie('token', data.session.access_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', // true em produção (HTTPS)
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // 'none' para cross-site/subdomain
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 dias
        });

        res.json({
            success: true,
            data: {
                // token: data.session.access_token, // Opcional: não enviar token no body se for puramente cookie
                professor
            }
        });
    } catch (error) {
        console.error('Erro no login:', error);
        res.status(500).json({
            success: false,
            error: 'Erro ao realizar login'
        });
    }
});

/**
 * POST /auth/logout
 * Logout do professor
 */
router.post('/logout', async (req, res) => {
    try {
        const { error } = await supabase.auth.signOut();

        if (error) {
            return res.status(500).json({
                success: false,
                error: 'Erro ao realizar logout'
            });
        }

        res.clearCookie('token');

        res.json({
            success: true,
            data: { message: 'Logout realizado com sucesso' }
        });
    } catch (error) {
        console.error('Erro no logout:', error);
        res.status(500).json({
            success: false,
            error: 'Erro ao realizar logout'
        });
    }
});

/**
 * POST /auth/recuperar-senha
 * Recuperar senha
 */
router.post('/recuperar-senha', async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                error: 'Email é obrigatório'
            });
        }

        const { error } = await supabase.auth.resetPasswordForEmail(email);

        if (error) {
            return res.status(500).json({
                success: false,
                error: 'Erro ao enviar email de recuperação'
            });
        }

        res.json({
            success: true,
            data: { message: 'Email de recuperação enviado com sucesso' }
        });
    } catch (error) {
        console.error('Erro na recuperação de senha:', error);
        res.status(500).json({
            success: false,
            error: 'Erro ao recuperar senha'
        });
    }
});

module.exports = router;
