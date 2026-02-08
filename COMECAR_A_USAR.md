# 🚀 COMEÇAR A USAR - Personal Agenda

## ⚡ Guia Rápido de Início

---

## 📋 Pré-requisitos

Antes de começar, certifique-se de que:

- [x] Backend está rodando na VPS (<https://api.smartconverge.com.br>)
- [x] Supabase está configurado
- [x] Evolution API está configurada
- [ ] Frontend será deployado (próximo passo)

---

## 🎯 Passo 1: Criar Primeiro Professor

### No Supabase

1. **Acesse:** <https://supabase.com/dashboard>
2. **Vá em:** Authentication > Users
3. **Clique em:** "Add user" > "Create new user"
4. **Preencha:**
   - Email: <seu@email.com>
   - Password: sua_senha_segura
   - Auto Confirm User: ✅ (marque)
5. **Copie o UUID** do usuário criado

6. **Vá em:** SQL Editor
7. **Execute:**

   ```sql
   INSERT INTO professores (id, nome, email, telefone_whatsapp)
   VALUES (
     'COLE_O_UUID_AQUI',
     'Seu Nome Completo',
     'seu@email.com',
     '11999999999'
   );
   ```

✅ Pronto! Seu usuário está criado.

---

## 🎯 Passo 2: Deploy do Frontend

### Opção Recomendada: Vercel (5 minutos)

1. **Acesse:** <https://vercel.com>
2. **Faça login** com GitHub
3. **Clique em:** "Add New Project"
4. **Importe:** A pasta `frontend/` ou repositório
5. **Configure:**
   - Framework Preset: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`
6. **Adicione variável de ambiente:**
   - Name: `NEXT_PUBLIC_API_URL`
   - Value: `https://api.smartconverge.com.br`
7. **Clique em:** "Deploy"

⏳ Aguarde 1-2 minutos...

✅ Seu frontend estará no ar em: `https://seu-projeto.vercel.app`

---

## 🎯 Passo 3: Primeiro Login

1. **Acesse** a URL do frontend
2. **Faça login** com:
   - Email: o que você criou no Supabase
   - Senha: a que você definiu
3. **Pronto!** Você está dentro do sistema

---

## 🎯 Passo 4: Configuração Inicial

### 4.1 Cadastrar Serviços

1. Vá em **"Serviços"** no menu
2. Clique em **"➕ Novo Serviço"**
3. Crie seus serviços:
   - **Personal Training** (Presencial, 60 min, R$ 150)
   - **Consultoria Online** (Online, 45 min, R$ 100)
   - **Ficha de Treino** (Ficha, 0 min, R$ 80)

### 4.2 Cadastrar Alunos

1. Vá em **"Alunos"** no menu
2. Clique em **"➕ Novo Aluno"**
3. Preencha:
   - Nome: Nome do aluno
   - WhatsApp: 11999999999 (com DDD)
   - Email: (opcional)
   - Notificações: ✅ Ativas

### 4.3 Criar Contratos (via API)

Use Postman/Insomnia ou curl:

```bash
curl -X POST https://api.smartconverge.com.br/api/contratos \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "aluno_id": "UUID_DO_ALUNO",
    "servico_id": "UUID_DO_SERVICO",
    "valor_mensal": 150.00,
    "dia_vencimento": 10
  }'
```

### 4.4 Agendar Sessões (via API)

```bash
curl -X POST https://api.smartconverge.com.br/api/sessoes \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "aluno_id": "UUID_DO_ALUNO",
    "servico_id": "UUID_DO_SERVICO",
    "data_hora_inicio": "2026-02-10T10:00:00",
    "recorrencia": {
      "tipo": "semanal",
      "dias_semana": [1, 3, 5],
      "data_fim": "2026-03-10"
    }
  }'
```

---

## 🎯 Passo 5: Configurar Webhook WhatsApp

### Na Evolution API

1. **Acesse** o painel da Evolution API
2. **Vá em:** Configurações da instância `agendapersonal`
3. **Configure Webhook:**
   - URL: `https://api.smartconverge.com.br/api/webhook/whatsapp`
   - Events: `messages.upsert`
4. **Salve**

### Testar

Envie uma mensagem para o WhatsApp da instância:

- `HOJE` - Ver sessões de hoje
- `AMANHÃ` - Ver sessões de amanhã
- `SEMANA` - Ver sessões da semana
- `VENCIMENTOS` - Ver contratos vencendo

---

## ✅ Checklist de Validação

Teste cada funcionalidade:

### Frontend

- [ ] Login funciona
- [ ] Dashboard mostra estatísticas
- [ ] Consegue criar aluno
- [ ] Consegue editar aluno
- [ ] Consegue excluir aluno
- [ ] Consegue criar serviço
- [ ] Consegue editar serviço
- [ ] Consegue excluir serviço
- [ ] Contratos aparecem na lista
- [ ] Agenda mostra sessões
- [ ] Notificações aparecem no histórico
- [ ] Logout funciona

### WhatsApp

- [ ] Comando `HOJE` funciona
- [ ] Comando `AMANHÃ` funciona
- [ ] Comando `SEMANA` funciona
- [ ] Comando `VENCIMENTOS` funciona

### Jobs Automáticos

- [ ] Resumo diário chega às 06:00
- [ ] Lembrete de sessão chega 2h antes
- [ ] Lembrete de vencimento chega 3 dias antes

---

## 📚 Documentação de Referência

- **Visão Geral:** `README.md`
- **Configuração:** `SETUP.md`
- **Testes:** `CHECKLIST.md`
- **Deploy Frontend:** `DEPLOY_FRONTEND.md`
- **Deploy Backend:** `DEPLOY_VPS_HOSTINGER.md`
- **Resumo Completo:** `PROJETO_COMPLETO.md`

---

## 🆘 Precisa de Ajuda?

### Problemas Comuns

**Login não funciona:**

- Verifique se criou o professor no Supabase
- Verifique se o email e senha estão corretos

**Dashboard vazio:**

- Cadastre alunos e serviços primeiro
- Crie contratos e sessões via API

**WhatsApp não responde:**

- Verifique se o webhook está configurado
- Verifique logs: `pm2 logs personal-agenda`

**Jobs não executam:**

- Verifique se PM2 está rodando: `pm2 status`
- Verifique logs: `pm2 logs personal-agenda`

---

## 🎉 Pronto

Agora você tem um sistema completo de gestão rodando!

### O que você pode fazer

- ✅ Gerenciar alunos
- ✅ Gerenciar serviços
- ✅ Visualizar contratos
- ✅ Ver agenda de sessões
- ✅ Receber lembretes automáticos
- ✅ Interagir via WhatsApp

### Próximos passos

1. Explore todas as funcionalidades
2. Cadastre seus alunos reais
3. Configure seus serviços
4. Crie contratos e sessões
5. Aproveite a automação!

---

**Bom trabalho! 💪**
