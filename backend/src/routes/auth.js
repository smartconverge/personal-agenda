const express = require('express');
const router = express.Router();
const { supabase, supabaseAdmin } = require('../config/supabase');

/**
 * POST /auth/register
 * Cadastrar novo professor (SaaS)
 */
router.post('/register', async (req, res) => {
    try {
        const { nome, email, senha, telefone_whatsapp } = req.body;

        if (!nome || !email || !senha) {
            return res.status(400).json({
                success: false,
                error: 'Nome, email e senha são obrigatórios'
            });
        }

        // 1. Criar usuário no Supabase Auth
        // Usamos supabaseAdmin para garantir a criação mesmo com configurações restritivas
        const { data: authUser, error: authError } = await supabase.auth.signUp({
            email,
            password: senha,
            options: {
                data: { nome }
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
        const { data: professor, error: professorError } = await supabase
            .from('professores')
            .select('id, nome, email, telefone_whatsapp')
            .eq('id', data.user.id)
            .single();

        if (professorError) {
            return res.status(500).json({
                success: false,
                error: 'Erro ao buscar dados do professor'
            });
        }

        res.json({
            success: true,
            data: {
                token: data.session.access_token,
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
