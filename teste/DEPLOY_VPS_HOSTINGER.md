# 🚀 Deploy no VPS Hostinger - Personal Agenda Backend

## ✅ Pré-requisitos

Sua VPS Hostinger já deve ter:

- ✅ Ubuntu/Debian Linux
- ✅ Acesso SSH
- ✅ Usuário root ou sudo

---

## 📋 Passo a Passo Completo

### **1️⃣ Conectar na VPS via SSH**

Abra o terminal (PowerShell no Windows) e conecte:

```bash
ssh root@SEU_IP_DA_VPS
# ou
ssh usuario@SEU_IP_DA_VPS
```

---

### **2️⃣ Instalar Dependências (Node.js e PM2)**

Execute os comandos abaixo na VPS:

```bash
# Atualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Node.js 18.x (LTS)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Verificar instalação
node --version  # Deve mostrar v18.x.x
npm --version

# Instalar PM2 (gerenciador de processos)
sudo npm install -g pm2

# Instalar Git (se não tiver)
sudo apt install -y git
```

---

### **3️⃣ Criar Diretório do Projeto**

```bash
# Criar diretório para aplicações
sudo mkdir -p /var/www
cd /var/www

# Criar diretório do projeto
sudo mkdir personal-agenda-backend
cd personal-agenda-backend
```

---

### **4️⃣ Fazer Upload dos Arquivos**

**Opção A - Via SCP (do seu computador Windows):**

Abra um **novo terminal** no seu computador (não feche a conexão SSH):

```powershell
# Navegar até a pasta do projeto
cd "f:\Projetos\Automações\Personal Agenda\backend"

# Fazer upload via SCP
scp -r * root@SEU_IP_DA_VPS:/var/www/personal-agenda-backend/
```

**Opção B - Via SFTP (FileZilla/WinSCP):**

1. Abra FileZilla ou WinSCP
2. Conecte no servidor: `SEU_IP_DA_VPS` (porta 22)
3. Navegue até `/var/www/personal-agenda-backend/`
4. Faça upload de todos os arquivos da pasta `backend/`

**Opção C - Via Git (se tiver repositório):**

```bash
# Na VPS
cd /var/www/personal-agenda-backend
git clone https://github.com/SEU-USUARIO/personal-agenda-backend.git .
```

---

### **5️⃣ Configurar Variáveis de Ambiente**

Na VPS, crie o arquivo `.env`:

```bash
cd /var/www/personal-agenda-backend
nano .env
```

Cole o conteúdo (Ctrl+Shift+V):

```bash
PORT=3000
NODE_ENV=production
TZ=America/Sao_Paulo

SUPABASE_URL=https://pzvnwgpjszlufuoqlniv.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB6dm53Z3Bqc3psdWZ1b3Fsbml2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA0OTIyNTEsImV4cCI6MjA4NjA2ODI1MX0.CjWR6xI0Dr-TZRffsuLXF4ResmBXQ9GadLA4Ea-I5kk
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB6dm53Z3Bqc3psdWZ1b3Fsbml2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDQ5MjI1MSwiZXhwIjoyMDg2MDY4MjUxfQ.A_QqgcaJJnZTidrYuPjHLVpHkuhps-0ZX8J9Nb5yusk

EVOLUTION_API_URL=https://evolution.smartconverge.com.br
EVOLUTION_API_TOKEN=9F3A6C8E2D4B7A1C5E0F9B6D3C8A2E71
EVOLUTION_INSTANCE_NAME=agendapersonal

WEBHOOK_SECRET=personal-agenda-webhook-secret-2026

CRON_RESUMO_DIARIO=0 6 * * *
CRON_LEMBRETE_SESSAO=*/15 * * * *
CRON_LEMBRETE_VENCIMENTO=0 9 * * *
LEMBRETE_SESSAO_HORAS_ANTES=2
LEMBRETE_VENCIMENTO_DIAS_ANTES=3
```

Salve e saia: `Ctrl+X`, depois `Y`, depois `Enter`

---

### **6️⃣ Instalar Dependências do Projeto**

```bash
cd /var/www/personal-agenda-backend
npm install --production
```

---

### **7️⃣ Iniciar Aplicação com PM2**

```bash
# Iniciar aplicação
pm2 start src/server.js --name personal-agenda

# Configurar PM2 para iniciar automaticamente no boot
pm2 startup
pm2 save

# Ver logs
pm2 logs personal-agenda

# Ver status
pm2 status
```

---

### **8️⃣ Configurar Nginx (Proxy Reverso)**

Instalar Nginx:

```bash
sudo apt install -y nginx
```

Criar configuração do site:

```bash
sudo nano /etc/nginx/sites-available/personal-agenda
```

Cole esta configuração:

```nginx
server {
    listen 80;
    server_name api.smartconverge.com.br;  # Altere para seu domínio

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Salve (`Ctrl+X`, `Y`, `Enter`) e ative:

```bash
# Criar link simbólico
sudo ln -s /etc/nginx/sites-available/personal-agenda /etc/nginx/sites-enabled/

# Testar configuração
sudo nginx -t

# Reiniciar Nginx
sudo systemctl restart nginx
```

---

### **9️⃣ Configurar SSL (HTTPS) com Let's Encrypt**

```bash
# Instalar Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obter certificado SSL (altere o domínio)
sudo certbot --nginx -d api.smartconverge.com.br

# Seguir as instruções do Certbot
# Escolha: Redirecionar HTTP para HTTPS (opção 2)
```

---

### **🔟 Configurar Firewall**

```bash
# Permitir SSH, HTTP e HTTPS
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw enable

# Verificar status
sudo ufw status
```

---

## ✅ Verificar Deploy

Teste a API:

```bash
# Teste local (na VPS)
curl http://localhost:3000/health

# Teste externo (do seu computador)
curl http://SEU_IP_DA_VPS/health
# ou
curl https://api.smartconverge.com.br/health
```

---

## 🔧 Comandos Úteis PM2

```bash
# Ver logs em tempo real
pm2 logs personal-agenda

# Reiniciar aplicação
pm2 restart personal-agenda

# Parar aplicação
pm2 stop personal-agenda

# Ver status
pm2 status

# Ver uso de recursos
pm2 monit

# Deletar aplicação do PM2
pm2 delete personal-agenda
```

---

## 🔄 Atualizar Aplicação (Deploy de Novas Versões)

```bash
# Conectar na VPS
ssh root@SEU_IP_DA_VPS

# Navegar até o projeto
cd /var/www/personal-agenda-backend

# Fazer backup do .env
cp .env .env.backup

# Fazer upload dos novos arquivos (via SCP/SFTP)
# ou fazer git pull se usar Git

# Instalar novas dependências (se houver)
npm install --production

# Reiniciar aplicação
pm2 restart personal-agenda

# Ver logs
pm2 logs personal-agenda
```

---

## 🆘 Troubleshooting

### Aplicação não inicia

```bash
# Ver logs de erro
pm2 logs personal-agenda --err

# Verificar se a porta 3000 está livre
sudo netstat -tulpn | grep 3000

# Testar manualmente
cd /var/www/personal-agenda-backend
node src/server.js
```

### Nginx não funciona

```bash
# Ver logs do Nginx
sudo tail -f /var/log/nginx/error.log

# Testar configuração
sudo nginx -t

# Reiniciar Nginx
sudo systemctl restart nginx
```

### Porta 3000 já em uso

```bash
# Ver o que está usando a porta
sudo lsof -i :3000

# Matar processo
sudo kill -9 PID_DO_PROCESSO
```

---

## 📊 Monitoramento

Configurar monitoramento com PM2 Plus (opcional):

```bash
pm2 link YOUR_SECRET_KEY YOUR_PUBLIC_KEY
```

---

## 🎯 Próximos Passos

1. ✅ Configurar DNS do domínio para apontar para o IP da VPS
2. ✅ Configurar webhook da Evolution API: `https://api.smartconverge.com.br/api/webhook/whatsapp`
3. ✅ Testar todas as rotas da API
4. ✅ Configurar backup automático do banco de dados

---

**Pronto! Seu backend está rodando na VPS Hostinger! 🚀**
