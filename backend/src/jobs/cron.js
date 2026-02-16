const cron = require('node-cron');
const notificationService = require('../services/notificationService');
const { supabaseAdmin } = require('../config/supabase');

/**
 * Inicializa os agendamentos automáticos (Cron Jobs)
 */
function initCronJobs() {
    console.log('⏰ Configurando Cron Jobs de Notificações...');

    // 1. Resumo Matinal - Todo dia às 06:00
    try {
        cron.schedule('0 6 * * *', async () => {
            console.log('📢 Executando Resumo Matinal (06h)...');
            await sendSummariesToAllProfessors(false);
        }, { timezone: "America/Sao_Paulo" });
    } catch (e) { console.error('Erro cron 06h:', e); }

    // 2. Resumo do Meio-dia (Aulas Restantes) - Todo dia às 12:00
    try {
        cron.schedule('0 12 * * *', async () => {
            console.log('📢 Executando Resumo Meio-dia (12h)...');
            await sendSummariesToAllProfessors(true);
        }, { timezone: "America/Sao_Paulo" });
    } catch (e) { console.error('Erro cron 12h:', e); }

    // 3. Resumo Semanal (Domingos às 18:00)
    try {
        cron.schedule('0 18 * * 0', async () => {
            console.log('📊 Executando Resumo Semanal (Domingo 18h)...');
            await sendWeeklySummariesToAllProfessors();
        }, { timezone: "America/Sao_Paulo" });
    } catch (e) { console.error('Erro cron semanal:', e); }

    // 4. Lembrete Diário para ALUNOS - Todo dia às 08:00 (Aulas do dia)
    try {
        cron.schedule('0 8 * * *', async () => {
            console.log('📢 Enviando lembretes diários para alunos (08h)...');
            await notificationService.sendStudentReminders('daily');
        }, { timezone: "America/Sao_Paulo" });
    } catch (e) { console.error('Erro cron alunos 08h:', e); }

    // 5. Lembrete de Aula Próxima (1h antes) - A cada 15 minutos
    try {
        cron.schedule('*/15 * * * *', async () => {
            console.log('⏰ Verificando aulas próximas (1h) para lembrete...');
            await notificationService.sendStudentReminders('hourly');
        }, { timezone: "America/Sao_Paulo" });
    } catch (e) { console.error('Erro cron lembrete 1h:', e); }
}

/**
 * Auxiliar para enviar o resumo diário para todos os professores ativos
 */
async function sendSummariesToAllProfessors(isAfternoon) {
    try {
        // Buscamos todos os professores cadastrados
        const { data: professores, error } = await supabaseAdmin
            .from('professores')
            .select('id');

        if (error || !professores) return;

        for (const prof of professores) {
            await notificationService.sendDailySummary(prof.id, isAfternoon);
            // Delay anti-ban entre professores
            await notificationService.randomDelay(3000, 8000);
        }
    } catch (err) {
        console.error('Erro ao processar resumos diários:', err);
    }
}

/**
 * Auxiliar para enviar o resumo semanal para todos os professores
 */
async function sendWeeklySummariesToAllProfessors() {
    try {
        const { data: professores, error } = await supabaseAdmin
            .from('professores')
            .select('id');

        if (error || !professores) return;

        for (const prof of professores) {
            await notificationService.sendWeeklySummary(prof.id);
            // Delay anti-ban entre professores
            await notificationService.randomDelay(5000, 10000);
        }
    } catch (err) {
        console.error('Erro ao processar resumos semanais:', err);
    }
}

module.exports = { initCronJobs };
