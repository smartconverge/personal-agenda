# Personal Agenda - Guia de Configuração e Deploy

## 📋 Pré-requisitos

1. Conta no Supabase
2. Instância da Evolution API configurada
3. VPS com EasyPanel instalado
4. Node.js 18+ (para desenvolvimento local)

## 🗄️ FASE 1: Configurar Banco de Dados (Supabase)

### 1.1 Criar Projeto no Supabase

1. Acesse <https://supabase.com>
2. Crie um novo projeto
3. Anote as credenciais:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

### 1.2 Executar Schema SQL

1. No painel do Supabase, vá em **SQL Editor**
2. Copie todo o conteúdo de `database/schema.sql`
3. Execute o script
4. Verifique se todas as tabelas foram criadas

### 1.3 Criar Primeiro Professor

No SQL Editor, execute:

```sql
-- Criar professor via Supabase Auth
-- Faça isso via interface do Supabase Auth ou via código
-- Depois, insira na tabela professores:

INSERT INTO professores (id, email, nome, telefone_whatsapp)
VALUES (
  'UUID-DO-USUARIO-CRIADO-NO-AUTH',
  'professor@email.com',
  'Nome do Professor',
  '5511999999999'  -- Formato E.164
);
```

## 🔧 FASE 2: Configurar Backend

### 2.1 Variáveis de Ambiente

Copie `.env.example` para `.env` e preencha:

```bash
# Servidor
PORT=3000
NODE_ENV=production
TZ=America/Sao_Paulo

# Supabase (copiar do painel)
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_ANON_KEY=sua-chave-anon
SUPABASE_SERVICE_ROLE_KEY=sua-chave-service-role

# Evolution API
EVOLUTION_API_URL=https://sua-evolution-api.com
EVOLUTION_API_TOKEN=seu-token
EVOLUTION_INSTANCE_NAME=personal-agenda

# WhatsApp
WEBHOOK_SECRET=gere-um-secret-aleatorio

# Jobs Cron (opcional, usar padrões)
CRON_RESUMO_DIARIO=0 6 * * *
CRON_LEMBRETE_SESSAO=*/15 * * * *
CRON_LEMBRETE_VENCIMENTO=0 9 * * *
LEMBRETE_SESSAO_HORAS_ANTES=2
LEMBRETE_VENCIMENTO_DIAS_ANTES=3
```

### 2.2 Testar Localmente

```bash
cd backend
npm install
npm run dev
```

Acesse: <http://localhost:3000/health>

## 🎨 FASE 3: Configurar Frontend

### 3.1 Variáveis de Ambiente

Copie `.env.example` para `.env`:

```bash
NEXT_PUBLIC_API_URL=https://api.smartconverge.com.br
```

### 3.2 Testar Localmente

```bash
cd frontend
npm install
npm run dev
```

Acesse: <http://localhost:3001>

## 📱 FASE 4: Configurar Evolution API

### 4.1 Criar Instância

1. Acesse sua Evolution API
2. Crie uma instância chamada `personal-agenda`
3. Conecte ao WhatsApp via QR Code
4. Anote o token da instância

### 4.2 Configurar Webhook

Configure o webhook para:

```
URL: https://webhook.smartconverge.com.br/webhook/whatsapp
Método: POST
Eventos: message.received
```

## 🚀 FASE 5: Deploy no EasyPanel

### 5.1 Criar Serviço Backend

1. No EasyPanel, crie novo serviço
2. Tipo: **Docker**
3. Nome: `personal-agenda-backend`
4. Repositório: (seu repositório Git)
5. Dockerfile: `backend/Dockerfile`
6. Porta: `3000`

**Variáveis de Ambiente:**

- Adicione todas as variáveis do `.env`

**Domínio:**

- `api.smartconverge.com.br` → porta 3000
- `webhook.smartconverge.com.br` → porta 3000

### 5.2 Criar Serviço Frontend

1. Crie novo serviço
2. Tipo: **Docker**
3. Nome: `personal-agenda-frontend`
4. Repositório: (seu repositório Git)
5. Dockerfile: `frontend/Dockerfile`
6. Porta: `3000`

**Variáveis de Ambiente:**

- `NEXT_PUBLIC_API_URL=https://api.smartconverge.com.br`

**Domínio:**

- `app.smartconverge.com.br` → porta 3000

### 5.3 Verificar Deploy

1. Backend: <https://api.smartconverge.com.br/health>
2. Frontend: <https://app.smartconverge.com.br>
3. Webhook: <https://webhook.smartconverge.com.br/webhook/whatsapp>

## ✅ FASE 6: Testes de Validação

### 6.1 Teste de Login

- [ ] Acessar <https://app.smartconverge.com.br>
- [ ] Fazer login com credenciais do professor
- [ ] Verificar redirecionamento para dashboard

### 6.2 Teste de Alunos

- [ ] Cadastrar aluno manualmente
- [ ] Importar alunos via CSV
- [ ] Ativar notificações para um aluno

### 6.3 Teste de Serviços

- [ ] Criar serviço presencial
- [ ] Criar serviço online
- [ ] Criar serviço ficha

### 6.4 Teste de Contratos

- [ ] Criar contrato mensal
- [ ] Verificar cálculo automático de vencimento

### 6.5 Teste de Sessões

- [ ] Criar sessão única
- [ ] Criar sessão recorrente (semanal)
- [ ] Tentar criar sessão com conflito de horário (deve falhar)
- [ ] Cancelar sessão
- [ ] Remarcar sessão

### 6.6 Teste de Jobs Cron

- [ ] Aguardar 06:00 e verificar resumo diário
- [ ] Criar sessão para daqui a 2 horas e verificar lembrete
- [ ] Criar contrato vencendo em 3 dias e verificar lembrete

### 6.7 Teste de WhatsApp

- [ ] Enviar "HOJE" pelo WhatsApp do professor
- [ ] Enviar "AMANHÃ"
- [ ] Enviar "SEMANA"
- [ ] Enviar "VENCIMENTOS"
- [ ] Verificar que mensagens de alunos são ignoradas

### 6.8 Teste de Idempotência

- [ ] Verificar que notificações não duplicam
- [ ] Enviar webhook duplicado e verificar que processa apenas uma vez

### 6.9 Teste de Resiliência

- [ ] Desativar Evolution API
- [ ] Verificar que sistema web continua funcionando
- [ ] Verificar que notificações ficam com status "falha"

## 🔍 Troubleshooting

### Backend não inicia

- Verificar logs no EasyPanel
- Verificar variáveis de ambiente
- Testar conexão com Supabase

### Jobs cron não executam

- Verificar timezone (deve ser America/Sao_Paulo)
- Verificar logs do backend
- Verificar expressões cron

### WhatsApp não responde

- Verificar se Evolution está conectada
- Verificar webhook configurado
- Verificar telefone do professor no banco

### Notificações não chegam

- Verificar se aluno tem `notificacoes_ativas = true`
- Verificar telefone no formato E.164
- Verificar logs em `notification_log`

## 📊 Monitoramento

### Logs Importantes

**Backend:**

```bash
# Ver logs no EasyPanel
# Ou localmente:
docker logs -f personal-agenda-backend
```

**Verificar Notificações:**

```sql
SELECT * FROM notification_log
ORDER BY created_at DESC
LIMIT 50;
```

**Verificar Sessões:**

```sql
SELECT * FROM v_sessoes_detalhadas
WHERE data_hora_inicio >= CURRENT_DATE
ORDER BY data_hora_inicio;
```

**Verificar Contratos Vencendo:**

```sql
SELECT * FROM v_contratos_vencendo;
```

## 🔐 Segurança

1. **Nunca commitar** arquivos `.env`
2. **Rotacionar** tokens da Evolution API periodicamente
3. **Backup** do banco Supabase (automático)
4. **Monitorar** logs de erro
5. **Validar** webhook secret

## 📝 Manutenção

### Atualizar Sistema

```bash
# Backend
cd backend
git pull
docker build -t personal-agenda-backend .
# Deploy via EasyPanel

# Frontend
cd frontend
git pull
docker build -t personal-agenda-frontend .
# Deploy via EasyPanel
```

### Limpar Logs Antigos

```sql
-- Deletar logs com mais de 90 dias
DELETE FROM notification_log
WHERE created_at < NOW() - INTERVAL '90 days';

DELETE FROM webhooks_processados
WHERE processado_em < NOW() - INTERVAL '30 days';
```

## 🎯 Próximos Passos (Fora do MVP)

- [ ] Adicionar autenticação de 2 fatores
- [ ] Implementar relatórios de sessões
- [ ] Adicionar integração com Google Calendar
- [ ] Criar app mobile
- [ ] Implementar pagamentos online

---

**Versão:** 1.0  
**Data:** 07/02/2026  
**Status:** Pronto para produção
