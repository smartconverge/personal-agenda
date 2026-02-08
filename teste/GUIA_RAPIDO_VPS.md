# 🚀 GUIA RÁPIDO - Deploy VPS Hostinger

## ⚡ Resumo Executivo

Este é o guia simplificado para fazer deploy do Personal Agenda Backend na sua VPS Hostinger.

---

## 📦 Arquivos Importantes

- **DEPLOY_VPS_HOSTINGER.md** - Guia completo passo a passo
- **COMANDOS_VPS.sh** - Cheat sheet com todos os comandos
- **install-vps.sh** - Script de instalação automática
- **deploy-vps.sh** - Script de deploy automático
- **.env** - Variáveis de ambiente (já configuradas)

---

## 🎯 Passo a Passo Simplificado

### **1. Conectar na VPS**

```bash
ssh root@SEU_IP_DA_VPS
```

### **2. Instalar Dependências (UMA VEZ)**

```bash
# Atualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Instalar PM2
sudo npm install -g pm2

# Instalar Nginx
sudo apt install -y nginx

# Criar diretório
sudo mkdir -p /var/www/personal-agenda-backend
```

### **3. Fazer Upload dos Arquivos**

**Do seu computador Windows (PowerShell):**

```powershell
cd "f:\Projetos\Automações\Personal Agenda\backend"
scp -r * root@SEU_IP_DA_VPS:/var/www/personal-agenda-backend/
```

**OU use FileZilla/WinSCP:**

- Host: `SEU_IP_DA_VPS`
- Porta: `22`
- Usuário: `root`
- Upload para: `/var/www/personal-agenda-backend/`

### **4. Fazer Deploy (na VPS)**

```bash
cd /var/www/personal-agenda-backend
npm install --production
pm2 start src/server.js --name personal-agenda
pm2 startup
pm2 save
```

### **5. Configurar Nginx**

```bash
sudo nano /etc/nginx/sites-available/personal-agenda
```

Cole:

```nginx
server {
    listen 80;
    server_name api.smartconverge.com.br;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Ativar:

```bash
sudo ln -s /etc/nginx/sites-available/personal-agenda /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### **6. Configurar SSL**

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d api.smartconverge.com.br
```

### **7. Configurar Firewall**

```bash
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

---

## ✅ Testar

```bash
# Na VPS
curl http://localhost:3000/health

# Do seu computador
curl https://api.smartconverge.com.br/health
```

---

## 🔧 Comandos Úteis

```bash
pm2 logs personal-agenda    # Ver logs
pm2 restart personal-agenda  # Reiniciar
pm2 status                   # Ver status
pm2 monit                    # Monitorar
```

---

## 🆘 Precisa de Ajuda?

Consulte:

1. **DEPLOY_VPS_HOSTINGER.md** - Guia completo
2. **COMANDOS_VPS.sh** - Todos os comandos
3. Logs: `pm2 logs personal-agenda`

---

**Pronto! Seu backend está no ar! 🎉**
