# 🚀 Deploy Manual no EasyPanel - Personal Agenda Backend

## ⚠️ Método Alternativo (Upload/GitHub não funcionou)

Este guia mostra como fazer o deploy manual do backend no EasyPanel usando a opção de criar um novo serviço do zero.

---

## 📋 Passo a Passo

### **1. Criar Novo Serviço no EasyPanel**

1. Acesse seu painel do EasyPanel
2. Clique em **"Create New Service"** ou **"Add Service"**
3. Escolha **"Docker"** ou **"Node.js"**
4. Nomeie o serviço: `personal-agenda-backend`

---

### **2. Configurar o Dockerfile**

No EasyPanel, crie um novo serviço com o seguinte Dockerfile:

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Configurar timezone
ENV TZ=America/Sao_Paulo
RUN apk add --no-cache tzdata

# Copiar package files
COPY package*.json ./

# Instalar dependências
RUN npm ci --only=production

# Copiar código fonte
COPY . .

# Expor porta
EXPOSE 3000

# Comando de inicialização
CMD ["npm", "start"]
```

---

### **3. Configurar Variáveis de Ambiente**

No painel de configuração do serviço, adicione estas variáveis de ambiente:

```bash
PORT=3000
NODE_ENV=production
TZ=America/Sao_Paulo

# Supabase
SUPABASE_URL=https://pzvnwgpjszlufuoqlniv.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB6dm53Z3Bqc3psdWZ1b3Fsbml2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA0OTIyNTEsImV4cCI6MjA4NjA2ODI1MX0.CjWR6xI0Dr-TZRffsuLXF4ResmBXQ9GadLA4Ea-I5kk
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB6dm53Z3Bqc3psdWZ1b3Fsbml2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDQ5MjI1MSwiZXhwIjoyMDg2MDY4MjUxfQ.A_QqgcaJJnZTidrYuPjHLVpHkuhps-0ZX8J9Nb5yusk

# Evolution API
EVOLUTION_API_URL=https://evolution.smartconverge.com.br
EVOLUTION_API_TOKEN=9F3A6C8E2D4B7A1C5E0F9B6D3C8A2E71
EVOLUTION_INSTANCE_NAME=agendapersonal

# Webhook
WEBHOOK_SECRET=personal-agenda-webhook-secret-2026

# Jobs Cron
CRON_RESUMO_DIARIO=0 6 * * *
CRON_LEMBRETE_SESSAO=*/15 * * * *
CRON_LEMBRETE_VENCIMENTO=0 9 * * *
LEMBRETE_SESSAO_HORAS_ANTES=2
LEMBRETE_VENCIMENTO_DIAS_ANTES=3
```

---

### **4. Opções de Deploy**

#### **Opção A: Via FTP/SFTP (Recomendado)**

Se o EasyPanel fornece acesso FTP/SFTP:

1. Conecte-se ao servidor via FTP/SFTP
2. Faça upload de toda a pasta `backend/` para o diretório do serviço
3. O EasyPanel deve detectar automaticamente e fazer o build

#### **Opção B: Via Terminal SSH**

Se o EasyPanel fornece acesso SSH:

1. Conecte-se ao servidor via SSH
2. Execute:

   ```bash
   cd /caminho/do/servico
   git clone <seu-repo-temporario>
   # ou faça upload manual dos arquivos
   npm install
   npm start
   ```

#### **Opção C: Via Docker Registry**

1. Faça build local da imagem Docker:

   ```bash
   cd "f:\Projetos\Automações\Personal Agenda\backend"
   docker build -t personal-agenda-backend .
   docker tag personal-agenda-backend SEU-REGISTRY/personal-agenda-backend
   docker push SEU-REGISTRY/personal-agenda-backend
   ```

2. No EasyPanel, configure para usar a imagem do registry

#### **Opção D: Via Repositório Privado GitLab/Bitbucket**

Se GitHub não funcionou, tente:

1. Criar repositório no GitLab ou Bitbucket
2. Fazer push do código
3. Conectar o EasyPanel ao novo repositório

---

### **5. Configurar Porta e Domínio**

1. Configure a porta **3000** no EasyPanel
2. Configure o domínio (ex: `api.smartconverge.com.br`)
3. Ative HTTPS/SSL

---

### **6. Testar o Deploy**

Após o deploy, teste:

```bash
# Teste de saúde
curl https://api.smartconverge.com.br/health

# Teste de login
curl -X POST https://api.smartconverge.com.br/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"seu@email.com","senha":"suasenha"}'
```

---

## 🆘 Alternativas ao EasyPanel

Se o EasyPanel continuar com problemas, considere:

1. **Railway.app** - Deploy via GitHub muito simples
2. **Render.com** - Suporta upload de ZIP e GitHub
3. **Fly.io** - Deploy via CLI muito rápido
4. **Vercel** - Para aplicações Node.js
5. **DigitalOcean App Platform** - Deploy via GitHub/GitLab
6. **Heroku** - Clássico e confiável

---

## 📞 Próximos Passos

1. Escolha uma das opções acima
2. Me informe qual método você quer tentar
3. Posso ajustar os arquivos conforme necessário

---

**Qual opção você quer tentar?** 🎯
