const axios = require('axios');

const EVOLUTION_API_URL = process.env.EVOLUTION_API_URL;
const EVOLUTION_API_TOKEN = process.env.EVOLUTION_API_TOKEN;
const EVOLUTION_INSTANCE_NAME = process.env.EVOLUTION_INSTANCE_NAME;

if (!EVOLUTION_API_URL || !EVOLUTION_API_TOKEN || !EVOLUTION_INSTANCE_NAME) {
    console.warn('⚠️  Variáveis de ambiente da Evolution API não configuradas');
}

/**
 * Envia mensagem via Evolution API
 */
async function enviarMensagem(destinatario, mensagem) {
    try {
        const response = await axios.post(
            `${EVOLUTION_API_URL}/message/sendText/${EVOLUTION_INSTANCE_NAME}`,
            {
                number: destinatario,
                text: mensagem
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': EVOLUTION_API_TOKEN
                }
            }
        );

        return {
            success: true,
            data: response.data
        };
    } catch (error) {
        console.error('Erro ao enviar mensagem via Evolution:', error.message);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Verifica status da instância Evolution
 */
async function verificarStatus() {
    try {
        const response = await axios.get(
            `${EVOLUTION_API_URL}/instance/connectionState/${EVOLUTION_INSTANCE_NAME}`,
            {
                headers: {
                    'apikey': EVOLUTION_API_TOKEN
                }
            }
        );

        return {
            success: true,
            connected: response.data?.state === 'open',
            data: response.data
        };
    } catch (error) {
        console.error('Erro ao verificar status Evolution:', error.message);
        return {
            success: false,
            connected: false,
            error: error.message
        };
    }
}

module.exports = {
    enviarMensagem,
    verificarStatus
};
