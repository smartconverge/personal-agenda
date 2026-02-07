# Personal Agenda - SaaS para Personal Trainers

Sistema profissional de gestão de agenda para personal trainers autônomos.

## 📋 Visão Geral

**Personal Agenda** é um SaaS web-first que permite personal trainers gerenciarem:

- ✅ Alunos (cadastro manual e importação CSV)
- ✅ Serviços (presencial, online, ficha)
- ✅ Contratos mensais
- ✅ Agenda com sessões recorrentes
- ✅ Notificações automáticas via WhatsApp
- ✅ Comandos WhatsApp simples (HOJE, AMANHÃ, SEMANA, VENCIMENTOS)

## 🏗️ Arquitetura

### Stack Tecnológica

- **Frontend:** Next.js 14 (React)
- **Backend:** Node.js + Express
- **Banco de Dados:** Supabase (PostgreSQL)
- **Autenticação:** Supabase Auth (JWT)
- **WhatsApp:** Evolution API
- **Infraestrutura:** EasyPanel + VPS
- **Jobs:** node-cron (interno no backend)

### URLs de Produção

- Frontend: <https://app.smartconverge.com.br>
- Backend API: <https://api.smartconverge.com.br>
- Webhook WhatsApp: <https://webhook.smartconverge.com.br>

## 📁 Estrutura do Projeto

```
Personal Agenda/
├── database/
│   └── schema.sql              # Schema completo do Supabase
├── backend/
│   ├── src/
│   │   ├── config/             # Supabase e Evolution
│   │   ├── middleware/         # Auth e error handler
│   │   ├── routes/             # 7 rotas principais
│   │   ├── jobs/               # 3 jobs cron
│   │   └── server.js           # Servidor Express
│   ├── Dockerfile
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── app/                # Pages Next.js
│   │   ├── components/         # Componentes React
│   │   └── lib/                # API client
│   ├── Dockerfile
│   ├── package.json
│   └── .env.example
├── SETUP.md                    # Guia de configuração
├── README.md                   # Este arquivo
└── CHECKLIST.md                # Validação completa
```

## 🚀 Quick Start

### 1. Configurar Banco de Dados

```bash
# No Supabase SQL Editor, execute:
database/schema.sql
```

### 2. Configurar Backend

```bash
cd backend
cp .env.example .env
# Editar .env com suas credenciais
npm install
npm run dev
```

### 3. Configurar Frontend

```bash
cd frontend
cp .env.example .env
# Editar .env
npm install
npm run dev
```

### 4. Configurar Evolution API

- Criar instância `personal-agenda`
- Configurar webhook: `https://webhook.smartconverge.com.br/webhook/whatsapp`

## 📖 Documentação Completa

- **[SETUP.md](./SETUP.md)** - Guia completo de configuração e deploy
- **[arquitetura_personal_agenda.md](./arquitetura_personal_agenda.md)** - Arquitetura do sistema
- **[contrato_sistema_personal_agenda.md](./contrato_sistema_personal_agenda.md)** - Contrato técnico completo

## ✅ Funcionalidades Implementadas

### Gestão de Alunos

- [x] Cadastro manual
- [x] Importação via CSV
- [x] Normalização automática de telefone (E.164)
- [x] Ativar/desativar notificações por aluno
- [x] Soft delete

### Gestão de Serviços

- [x] 3 modalidades: presencial, online, ficha
- [x] Duração configurável
- [x] Presencial e online bloqueiam agenda
- [x] Ficha não bloqueia agenda

### Gestão de Contratos

- [x] Contratos mensais
- [x] Cálculo automático de vencimento
- [x] Valor por contrato (não por serviço)
- [x] Status: ativo, vencido, cancelado

### Agenda de Sessões

- [x] Sessões únicas e recorrentes (semanal)
- [x] Validação de conflitos de horário
- [x] Cancelamento (individual ou todas futuras)
- [x] Remarcação com validação
- [x] Conclusão de sessão

### Notificações Automáticas

- [x] Resumo diário às 06:00 (para professor)
- [x] Lembrete de sessão (2h antes)
- [x] Lembrete de vencimento (3 dias antes)
- [x] Idempotência (não duplica)
- [x] Log completo de envios

### WhatsApp

- [x] Envio automático via Evolution API
- [x] Comandos do professor:
  - `HOJE` - Sessões do dia
  - `AMANHÃ` - Sessões de amanhã
  - `SEMANA` - Sessões da semana
  - `VENCIMENTOS` - Contratos vencendo
- [x] Mensagens de alunos são ignoradas
- [x] Webhook idempotente

### Segurança

- [x] Autenticação JWT (Supabase Auth)
- [x] Multi-tenancy (RLS + validação backend)
- [x] Isolamento por professor_id
- [x] HTTPS obrigatório

## 🔧 Variáveis de Ambiente

### Backend

```bash
# Servidor
PORT=3000
NODE_ENV=production
TZ=America/Sao_Paulo

# Supabase
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_ANON_KEY=sua-chave-anon
SUPABASE_SERVICE_ROLE_KEY=sua-chave-service-role

# Evolution API
EVOLUTION_API_URL=https://sua-evolution-api.com
EVOLUTION_API_TOKEN=seu-token
EVOLUTION_INSTANCE_NAME=personal-agenda

# Jobs Cron
CRON_RESUMO_DIARIO=0 6 * * *
CRON_LEMBRETE_SESSAO=*/15 * * * *
CRON_LEMBRETE_VENCIMENTO=0 9 * * *
LEMBRETE_SESSAO_HORAS_ANTES=2
LEMBRETE_VENCIMENTO_DIAS_ANTES=3
```

### Frontend

```bash
NEXT_PUBLIC_API_URL=https://api.smartconverge.com.br
```

## 📊 Endpoints da API

### Autenticação

- `POST /auth/login` - Login do professor
- `POST /auth/logout` - Logout
- `POST /auth/recuperar-senha` - Recuperar senha

### Alunos

- `GET /alunos` - Listar alunos
- `POST /alunos` - Criar aluno
- `PUT /alunos/:id` - Atualizar aluno
- `DELETE /alunos/:id` - Excluir aluno (soft delete)
- `POST /alunos/importar-csv` - Importar CSV

### Serviços

- `GET /servicos` - Listar serviços
- `POST /servicos` - Criar serviço
- `PUT /servicos/:id` - Atualizar serviço
- `DELETE /servicos/:id` - Excluir serviço

### Contratos

- `GET /contratos` - Listar contratos
- `POST /contratos` - Criar contrato
- `PUT /contratos/:id` - Atualizar contrato
- `DELETE /contratos/:id` - Cancelar contrato

### Sessões

- `GET /sessoes` - Listar sessões
- `POST /sessoes` - Criar sessão(ões)
- `PUT /sessoes/:id/cancelar` - Cancelar sessão
- `PUT /sessoes/:id/remarcar` - Remarcar sessão
- `PUT /sessoes/:id/concluir` - Concluir sessão

### Notificações

- `GET /notificacoes` - Histórico de notificações
- `POST /notificacoes/testar` - Enviar teste

### Webhook

- `POST /webhook/whatsapp` - Receber webhooks Evolution

## 🧪 Testes

Ver checklist completo em **[CHECKLIST.md](./CHECKLIST.md)**

Principais testes:

1. Login e autenticação
2. CRUD de alunos (manual + CSV)
3. Criação de sessões com validação de conflitos
4. Jobs cron (resumo, lembretes)
5. Comandos WhatsApp
6. Idempotência de notificações
7. Sistema funcionando sem WhatsApp

## 🐛 Troubleshooting

### Backend não inicia

- Verificar variáveis de ambiente
- Testar conexão com Supabase
- Verificar logs no EasyPanel

### Jobs cron não executam

- Verificar timezone (America/Sao_Paulo)
- Verificar expressões cron
- Verificar logs do backend

### WhatsApp não responde

- Verificar Evolution conectada
- Verificar webhook configurado
- Verificar telefone do professor no banco

### Notificações não chegam

- Verificar `notificacoes_ativas = true`
- Verificar telefone no formato E.164
- Verificar logs em `notification_log`

## 📝 Regras de Negócio Críticas

1. ✅ Apenas PROFESSOR tem login
2. ✅ Alunos NÃO têm login
3. ✅ Presencial e online bloqueiam agenda igualmente
4. ✅ Ficha NÃO bloqueia agenda
5. ✅ Sessões NÃO podem sobrepor horário
6. ✅ WhatsApp NÃO é fonte de verdade
7. ✅ Sistema funciona sem WhatsApp
8. ✅ Notificações NÃO duplicam
9. ✅ Notificações para alunos DESLIGADAS por padrão
10. ✅ Comandos WhatsApp SÓ do professor

## 🔐 Segurança

- JWT com expiração
- RLS no Supabase
- Validação backend em todas as rotas
- Multi-tenancy por professor_id
- HTTPS obrigatório
- Soft delete (auditoria)

## 📈 Monitoramento

### Logs Importantes

```sql
-- Notificações recentes
SELECT * FROM notification_log
ORDER BY created_at DESC LIMIT 50;

-- Sessões futuras
SELECT * FROM v_sessoes_detalhadas
WHERE data_hora_inicio >= CURRENT_DATE
ORDER BY data_hora_inicio;

-- Contratos vencendo
SELECT * FROM v_contratos_vencendo;
```

## 🎯 Roadmap (Fora do MVP)

- [ ] Autenticação 2FA
- [ ] Relatórios de sessões
- [ ] Integração Google Calendar
- [ ] App mobile nativo
- [ ] Pagamentos online
- [ ] Multi-idioma

## 📄 Licença

Proprietary - Todos os direitos reservados

## 👥 Suporte

Para suporte, entre em contato via:

- Email: <suporte@smartconverge.com.br>
- WhatsApp: (11) 99999-9999

---

**Versão:** 1.0.0  
**Data:** 07/02/2026  
**Status:** ✅ Pronto para produção
