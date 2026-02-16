const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Rotas
const authRoutes = require('./routes/auth');
const alunosRoutes = require('./routes/alunos');
const servicosRoutes = require('./routes/servicos');
const contratosRoutes = require('./routes/contratos');
const sessoesRoutes = require('./routes/sessoes');
const notificacoesRoutes = require('./routes/notificacoes');
const webhookRoutes = require('./routes/webhook');
const perfilRoutes = require('./routes/perfil');
const configuracoesRoutes = require('./routes/configuracoes');
const whatsappRoutes = require('./routes/whatsapp');

// Middlewares e Jobs
const { initCronJobs } = require('./jobs/cron');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();
app.set('trust proxy', 1); // Confia no proxy (necessário para cookies seguros e rate limit atrás de LB)
const PORT = process.env.PORT || 3000;

// ROTA DE DIAGNÓSTICO (DEBUG DEPLOY)
app.get('/status-deploy', (req, res) => {
  res.json({
    status: 'online',
    version: 'v1.1-whatsapp-fix',
    timestamp: new Date().toISOString(),
    routes_loaded: {
      whatsapp: true
    }
  });
});

// Middleware Base
app.use(helmet());
app.use(cookieParser());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS restrito às origens permitidas
// CORS restrito às origens permitidas
const allowedOrigins = [
  'https://app.smartconverge.com.br',
  'http://localhost:3000',
  'http://localhost:3001',
  ...(process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : [])
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
app.use('/whatsapp', whatsappRoutes);

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
