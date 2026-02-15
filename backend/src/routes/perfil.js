const express = require('express');
const router = express.Router();
const { supabaseAdmin } = require('../config/supabase');
const { authenticate } = require('../middleware/auth');

/**
 * GET /api/perfil
 * Retorna os dados do perfil do professor logado
 */
router.get('/', authenticate, async (req, res) => {
    try {
        const { data, error } = await supabaseAdmin
            .from('professores')
            .select('*')
            .eq('id', req.professorId)
            .single();

        if (error) {
            console.error('Erro ao buscar perfil:', error);
            return res.status(500).json({
                success: false,
                error: 'Erro ao buscar dados do perfil'
            });
        }

        res.json({
            success: true,
            data
        });
    } catch (error) {
        console.error('Erro interno no perfil:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno ao buscar perfil'
        });
    }
});

/**
 * PUT /api/perfil
 * Atualiza os dados do perfil do professor logado
 */
router.put('/', authenticate, async (req, res) => {
    try {
        const {
            nome,
            telefone_whatsapp,
            data_nascimento,
            cref,
            especialidade,
            bio,
            foto_url
        } = req.body;

        const updateData = {};
        if (nome !== undefined) updateData.nome = nome;
        if (telefone_whatsapp !== undefined) updateData.telefone_whatsapp = telefone_whatsapp;
        if (data_nascimento !== undefined) updateData.data_nascimento = data_nascimento;
        if (cref !== undefined) updateData.cref = cref;
        if (especialidade !== undefined) updateData.especialidade = especialidade;
        if (bio !== undefined) updateData.bio = bio;
        if (foto_url !== undefined) updateData.foto_url = foto_url;

        const { data, error } = await supabaseAdmin
            .from('professores')
            .update(updateData)
            .eq('id', req.professorId)
            .select()
            .single();

        if (error) {
            console.error('Erro ao atualizar perfil:', error);
            return res.status(500).json({
                success: false,
                error: 'Erro ao atualizar dados do perfil'
            });
        }

        res.json({
            success: true,
            data,
            message: 'Perfil atualizado com sucesso'
        });
    } catch (error) {
        console.error('Erro interno ao atualizar perfil:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno ao atualizar perfil'
        });
    }
});

// Configurar Multer para upload de arquivos em memória
const multer = require('multer');
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

/**
 * POST /api/perfil/upload-foto
 * Upload de foto de perfil
 */
router.post('/upload-foto', authenticate, upload.single('foto'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, error: 'Nenhum arquivo enviado' });
        }

        const file = req.file;
        const userId = req.professorId;
        const fileExt = file.originalname.split('.').pop();
        const fileName = `${userId}/${Date.now()}.${fileExt}`;

        // 1. Garantir que o bucket existe (Supabase Admin)
        const { data: buckets } = await supabaseAdmin.storage.listBuckets();
        const avatarBucket = buckets.find(b => b.name === 'avatars');

        if (!avatarBucket) {
            await supabaseAdmin.storage.createBucket('avatars', {
                public: true,
                fileSizeLimit: 5242880, // 5MB
                allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/webp']
            });
        }

        // 2. Upload do arquivo
        const { error: uploadError } = await supabaseAdmin
            .storage
            .from('avatars')
            .upload(fileName, file.buffer, {
                contentType: file.mimetype,
                upsert: true
            });

        if (uploadError) {
            throw uploadError;
        }

        // 3. Obter URL pública
        const { data: { publicUrl } } = supabaseAdmin
            .storage
            .from('avatars')
            .getPublicUrl(fileName);

        // 4. Atualizar perfil do professor
        const { error: updateError } = await supabaseAdmin
            .from('professores')
            .update({ foto_url: publicUrl })
            .eq('id', userId);

        if (updateError) {
            throw updateError;
        }

        res.json({
            success: true,
            data: { foto_url: publicUrl },
            message: 'Foto de perfil atualizada com sucesso!'
        });

    } catch (error) {
        console.error('Erro no upload de foto:', error);
        res.status(500).json({
            success: false,
            error: 'Erro ao processar upload da foto'
        });
    }
});

module.exports = router;
