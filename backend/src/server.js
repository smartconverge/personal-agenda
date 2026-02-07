const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const alunosRoutes = require('./routes/alunos');
const servicosRoutes = require('./routes/servicos');
const contratosRoutes = require('./routes/contratos');
const sessoesRoutes = require('./routes/sessoes');
const notificacoesRoutes = require('./routes/notificacoes');
const webhookRoutes = require('./routes/webhook');

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

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    timezone: process.env.TZ || 'America/Sao_Paulo'
  });
});

// Rotas
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
  
  // Iniciar jobs cron
  initCronJobs();
  console.log('⏰ Jobs cron inicializados');
});

module.exports = app;
