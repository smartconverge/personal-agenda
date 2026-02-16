const express = require('express');
const router = express.Router();
const axios = require('axios');
const { authenticate } = require('../middleware/auth');
const { supabaseAdmin } = require('../config/supabase');

// Configurações da Evolution API
const EVOLUTION_API_URL = process.env.EVOLUTION_API_URL;
const EVOLUTION_API_TOKEN = process.env.EVOLUTION_API_TOKEN;

// Headers padrão para Evolution API
const evolutionHeaders = {
    'Content-Type': 'application/json',
    'apikey': EVOLUTION_API_TOKEN
};

/**
 * GET /api/whatsapp/status
 * Verifica o status da conexão do professor
 */
router.get('/status', authenticate, async (req, res) => {
    try {
        // 1. Buscar instância salva no perfil do professor
        const { data: professor, error } = await supabaseAdmin
            .from('professores')
            .select('whatsapp_instance')
            .eq('id', req.professorId)
            .single();

        if (error || !professor) {
            return res.status(404).json({ success: false, error: 'Professor não encontrado' });
        }

        const instanceName = professor.whatsapp_instance;

        // Se não tiver instância salva, retornar desconectado
        if (!instanceName) {
            return res.json({
                success: true,
                connected: false,
                instance: null,
                message: 'Nenhuma instância configurada'
            });
        }

        // 2. Consultar status na Evolution API
        try {
            const response = await axios.get(
                `${EVOLUTION_API_URL}/instance/connectionState/${instanceName}`,
                { headers: evolutionHeaders }
            );

            const state = response.data?.instance?.state || response.data?.state;
            const isConnected = state === 'open';

            res.json({
                success: true,
                connected: isConnected,
                instance: instanceName,
                state: state
            });

        } catch (evoError) {
            // Se der 404 na Evolution, a instância não existe mais lá
            if (evoError.response && evoError.response.status === 404) {
                // Opcional: Limpar do banco se não existe na API
                await supabaseAdmin.from('professores').update({ whatsapp_instance: null }).eq('id', req.professorId);

                return res.json({
                    success: true,
                    connected: false,
                    instance: null,
                    message: 'Instância não encontrada na API'
                });
            }
            throw evoError;
        }

    } catch (error) {
        console.error('Erro ao verificar status WhatsApp:', error.message);
        res.status(500).json({ success: false, error: 'Erro ao verificar status' });
    }
});

/**
 * POST /api/whatsapp/criar-instancia
 * Cria uma nova instância para o professor
 */
router.post('/criar-instancia', authenticate, async (req, res) => {
    try {
        // Nome da instância será "prof_{id}" para garantir unicidade
        const instanceName = `prof_${req.professorId.replace(/-/g, '')}`; // Remove hifens para encurtar

        // 1. Criar instância na Evolution API
        try {
            console.log(`🔌 Tentando criar instância na Evolution: ${EVOLUTION_API_URL}/instance/create`);
            const payload = {
                instanceName: instanceName,
                token: process.env.EVOLUTION_API_TOKEN,
                qrcode: true,
                integration: "WHATSAPP-BAILEYS" // Padrão v2
            };

            await axios.post(
                `${EVOLUTION_API_URL}/instance/create`,
                payload,
                { headers: evolutionHeaders }
            );
        } catch (evoError) {
            console.error('❌ Erro Evolution:', evoError.response?.status, evoError.response?.data);

            // Se erro for "instance already exists" (409 ou 400), tudo bem
            if (evoError.response?.status === 409 || evoError.response?.data?.error === 'Instance already exists' || (evoError.response?.data?.response?.message || []).includes('already exists')) {
                console.log('ℹ️ Instância já existe, prosseguindo...');
            } else {
                // Retorna o erro exato da Evolution para o frontend
                const status = evoError.response?.status || 500;
                const msg = evoError.response?.data?.message || evoError.message;
                return res.status(status).json({
                    success: false,
                    error: `Falha na Evolution (${status}): ${msg}`
                });
            }
        }

        // 2. Salvar nome da instância no banco (se já não estiver)
        await supabaseAdmin
            .from('professores')
            .update({ whatsapp_instance: instanceName })
            .eq('id', req.professorId);

        res.json({
            success: true,
            instance: instanceName,
            message: 'Instância criada com sucesso'
        });

    } catch (error) {
        console.error('Erro ao criar instância WhatsApp:', error);
        res.status(500).json({ success: false, error: 'Erro interno ao criar instância' });
    }
});

/**
 * GET /api/whatsapp/qrcode
 * Retorna o QR Code para conexão
 */
router.get('/qrcode', authenticate, async (req, res) => {
    try {
        // 1. Buscar instância do professor
        const { data: professor } = await supabaseAdmin
            .from('professores')
            .select('whatsapp_instance')
            .eq('id', req.professorId)
            .single();

        if (!professor?.whatsapp_instance) {
            return res.status(400).json({ success: false, error: 'Instância não criada. Crie a instância primeiro.' });
        }

        // 2. Solicitar conexão (QR Code) à Evolution API
        const response = await axios.get(
            `${EVOLUTION_API_URL}/instance/connect/${professor.whatsapp_instance}`,
            { headers: evolutionHeaders }
        );

        // A Evolution retorna { code, base64, ... } ou direto base64 dependendo da versão. 
        // Geralmente V2: { base64: "data:image..." } ou { code: "..." }

        const qrCode = response.data?.base64 || response.data?.code || response.data;

        if (!qrCode) {
            return res.status(500).json({ success: false, error: 'QR Code não retornado pela API' });
        }

        res.json({
            success: true,
            qrcode: qrCode,
            // Alguns retornos da evolution vem com "pairingCode" também, se quiser implementar depois
        });

    } catch (error) {
        console.error('Erro ao buscar QR Code:', error.message);
        // Se a instância já estiver conectada, a Evolution pode retornar erro ou status diferente.
        // O ideal é o frontend checar status antes de pedir QR.
        res.status(500).json({ success: false, error: 'Erro ao gerar QR Code' });
    }
});

/**
 * DELETE /api/whatsapp/desconectar
 * Remove a conexão e a instância
 */
router.delete('/desconectar', authenticate, async (req, res) => {
    try {
        const { data: professor } = await supabaseAdmin
            .from('professores')
            .select('whatsapp_instance')
            .eq('id', req.professorId)
            .single();

        if (professor?.whatsapp_instance) {
            // 1. Tentar deletar/logout na Evolution
            try {
                await axios.delete(
                    `${EVOLUTION_API_URL}/instance/delete/${professor.whatsapp_instance}`,
                    { headers: evolutionHeaders }
                );
            } catch (evoError) {
                console.warn('Erro ao deletar instância na API (pode já não existir):', evoError.message);
            }

            // 2. Limpar do banco
            await supabaseAdmin
                .from('professores')
                .update({ whatsapp_instance: null })
                .eq('id', req.professorId);
        }

        res.json({ success: true, message: 'Desconectado com sucesso' });

    } catch (error) {
        console.error('Erro ao desconectar:', error);
        res.status(500).json({ success: false, error: 'Erro ao desconectar' });
    }
});

module.exports = router;
