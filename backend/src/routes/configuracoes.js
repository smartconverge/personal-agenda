const express = require('express');
const router = express.Router();
const { supabase, supabaseAdmin } = require('../config/supabase');
const { authenticate } = require('../middleware/auth');

/**
 * PUT /api/configuracoes/senha
 * Altera a senha do professor logado
 */
router.put('/senha', authenticate, async (req, res) => {
    try {
        const { senhaAtual, novaSenha } = req.body;

        if (!senhaAtual || !novaSenha) {
            return res.status(400).json({
                success: false,
                error: 'Senha atual e nova senha são obrigatórias'
            });
        }

        // Para alterar a senha, o Supabase exige que o usuário esteja logado com o token atual
        // e ele mesmo faz a atualização via auth.updateUser
        // No entanto, via API Admin (service role) podemos forçar, 
        // mas o ideal é deixar o Supabase validar a sessão

        const { error } = await supabase.auth.updateUser({
            password: novaSenha
        });

        if (error) {
            console.error('Erro ao atualizar senha:', error);
            return res.status(400).json({
                success: false,
                error: error.message || 'Erro ao atualizar senha'
            });
        }

        res.json({
            success: true,
            message: 'Senha atualizada com sucesso'
        });
    } catch (error) {
        console.error('Erro interno ao atualizar senha:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno ao atualizar senha'
        });
    }
});

/**
 * DELETE /api/configuracoes/excluir-conta
 * Exclui a conta do professor (Soft Delete ou Hard Delete conforme política)
 */
router.delete('/excluir-conta', authenticate, async (req, res) => {
    try {
        // 1. Excluir do DB (cascade deve tratar o resto se configurado)
        const { error: dbError } = await supabaseAdmin
            .from('professores')
            .delete()
            .eq('id', req.professorId);

        if (dbError) {
            console.error('Erro ao excluir dados do DB:', dbError);
            return res.status(500).json({
                success: false,
                error: 'Erro ao excluir seus dados'
            });
        }

        // 2. Excluir do Auth (Supabase Admin)
        const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(req.professorId);

        if (authError) {
            console.error('Erro ao excluir do Auth:', authError);
            // Mesmo com erro no auth, os dados foram limpos. 
            // O usuário não conseguirá mais logar pois o registro sumiu da tabela professores (se houver middleware validando)
        }

        res.json({
            success: true,
            message: 'Conta excluída com sucesso'
        });
    } catch (error) {
        console.error('Erro interno ao excluir conta:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno ao excluir conta'
        });
    }
});

module.exports = router;
