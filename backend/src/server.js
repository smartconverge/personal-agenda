const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

// ESCUDO GLOBAL CONTRA QUEDAS - Impede o servidor de morrer por qualquer erro
process.on('uncaughtException', (err) => {
  console.error('🔥 ERRO CRÍTICO (Uncaught):', err);
});
process.on('unhandledRejection', (reason, promise) => {
  console.error('🔥 ERRO CRÍTICO (Unhandled Rejection):', reason);
});

console.log('📦 Carregando rotas...');
const authRoutes = require('./routes/auth');
console.log('✅ Auth carregado');
const alunosRoutes = require('./routes/alunos');
console.log('✅ Alunos carregados');
const servicosRoutes = require('./routes/servicos');
console.log('✅ Serviços carregados');
const contratosRoutes = require('./routes/contratos');
console.log('✅ Contratos carregados');
const sessoesRoutes = require('./routes/sessoes');
console.log('✅ Sessões carregadas');
const notificacoesRoutes = require('./routes/notificacoes');
console.log('✅ Notificações carregadas');
const webhookRoutes = require('./routes/webhook');
console.log('✅ Webhook carregado');

const { initCronJobs } = require('./jobs/cron');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rota Raiz (Imediata para o Coolify)
app.get('/', (req, res) => {
  res.json({ status: 'online', message: 'API Rodando' });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Registrar rotas
app.use('/auth', authRoutes);
app.use('/alunos', alunosRoutes);
app.use('/servicos', servicosRoutes);
app.use('/contratos', contratosRoutes);
app.use('/sessoes', sessoesRoutes);
app.use('/notificacoes', notificacoesRoutes);
app.use('/webhook', webhookRoutes);

// Error handler
app.use(errorHandler);

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Backend rodando na porta ${PORT}`);
  console.log(`🌍 Timezone: ${process.env.TZ || 'America/Sao_Paulo'}`);
  console.log(`📅 Ambiente: ${process.env.NODE_ENV || 'development'}`);

  // Iniciar jobs cron (com segurança para não derrubar o servidor)
  try {
    initCronJobs();
    console.log('⏰ Jobs cron inicializados');
  } catch (cronError) {
    console.error('❌ Falha ao inicializar Cron Jobs:', cronError);
  }
});

module.exports = app;
