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
const perfilRoutes = require('./routes/perfil');
console.log('✅ Perfil carregado');
const configuracoesRoutes = require('./routes/configuracoes');
console.log('✅ Configurações carregadas');

const { initCronJobs } = require('./jobs/cron');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();
app.set('trust proxy', 1); // Confia no proxy (necessário para cookies seguros e rate limit atrás de LB)
const PORT = process.env.PORT || 3000;

const cookieParser = require('cookie-parser');

// Middleware
app.use(helmet());
app.use(cookieParser());

// CORS restrito às origens permitidas
const allowedOrigins = [
  'https://app.smartconverge.com.br',
  'http://localhost:3000',
  'http://localhost:3001'
];
app.use(cors({
  origin: function (origin, callback) {
    // Permitir requests sem origin (ex: curl, mobile apps, server-to-server)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Bloqueado pelo CORS'), false);
  },
  credentials: true
}));

// Rate Limiting Security
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  skip: (req) => req.path === '/health' || req.path === '/', // Não limita pings de saúde
  message: {
    status: 429,
    error: 'Muitas requisições, tente novamente em breve'
  }
});
app.use(limiter);

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
app.use('/perfil', perfilRoutes);
app.use('/configuracoes', configuracoesRoutes);

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
