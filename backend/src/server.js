const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

console.log('🚀 Iniciando servidor - Verificando arquivos...');
// Rotas
const authRoutes = require('./routes/auth'); console.log('✅ Rota Auth carregada');
const alunosRoutes = require('./routes/alunos'); console.log('✅ Rota Alunos carregada');
const servicosRoutes = require('./routes/servicos'); console.log('✅ Rota Serviços carregada');
const contratosRoutes = require('./routes/contratos'); console.log('✅ Rota Contratos carregada');
const sessoesRoutes = require('./routes/sessoes'); console.log('✅ Rota Sessões carregada');
const notificacoesRoutes = require('./routes/notificacoes'); console.log('✅ Rota Notificações carregada');
const webhookRoutes = require('./routes/webhook'); console.log('✅ Rota Webhook carregada');
const perfilRoutes = require('./routes/perfil'); console.log('✅ Rota Perfil carregada');
const configuracoesRoutes = require('./routes/configuracoes'); console.log('✅ Rota Configurações carregada');
const whatsappRoutes = require('./routes/whatsapp'); console.log('✅ Rota Whatsapp carregada');

// Middlewares e Jobs
console.log('⚙️ Carregando middlewares...');
const { initCronJobs } = require('./jobs/cron');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();
console.log('📦 Express instanciado');
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
  windowMs: 1 * 60 * 1000, // 1 minuto (antes era 15m)
  limit: 1000, // 1000 requisições por IP (antes era 100)
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  skip: (req) => req.path === '/health' || req.path === '/',
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
