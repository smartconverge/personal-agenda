# ========================================
# COMANDOS RÁPIDOS - VPS HOSTINGER
# Personal Agenda Backend
# ========================================

# 1. CONECTAR NA VPS
ssh root@SEU_IP_DA_VPS

# 2. INSTALAR DEPENDÊNCIAS (executar UMA VEZ)
cd /tmp
wget https://raw.githubusercontent.com/SEU-REPO/personal-agenda-backend/main/install-vps.sh
chmod +x install-vps.sh
sudo bash install-vps.sh

# 3. FAZER UPLOAD DOS ARQUIVOS (do seu computador)
# Opção A - Via SCP
cd "f:\Projetos\Automações\Personal Agenda\backend"
scp -r * root@SEU_IP_DA_VPS:/var/www/personal-agenda-backend/

# Opção B - Via SFTP (FileZilla/WinSCP)
# Host: SEU_IP_DA_VPS
# Porta: 22
# Usuário: root
# Upload para: /var/www/personal-agenda-backend/

# 4. FAZER DEPLOY (na VPS)
cd /var/www/personal-agenda-backend
chmod +x deploy-vps.sh
bash deploy-vps.sh

# 5. CONFIGURAR NGINX (na VPS)
sudo nano /etc/nginx/sites-available/personal-agenda
# Cole a configuração do DEPLOY_VPS_HOSTINGER.md
sudo ln -s /etc/nginx/sites-available/personal-agenda /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# 6. CONFIGURAR SSL (na VPS)
sudo certbot --nginx -d api.smartconverge.com.br

# 7. CONFIGURAR FIREWALL (na VPS)
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw enable

# ========================================
# COMANDOS ÚTEIS PM2
# ========================================

# Ver logs em tempo real
pm2 logs personal-agenda

# Ver status
pm2 status

# Reiniciar aplicação
pm2 restart personal-agenda

# Parar aplicação
pm2 stop personal-agenda

# Monitorar recursos
pm2 monit

# Ver informações detalhadas
pm2 show personal-agenda

# ========================================
# ATUALIZAR APLICAÇÃO
# ========================================

# 1. Fazer upload dos novos arquivos (SCP/SFTP)
# 2. Na VPS:
cd /var/www/personal-agenda-backend
npm install --production
pm2 restart personal-agenda
pm2 logs personal-agenda

# ========================================
# TROUBLESHOOTING
# ========================================

# Ver logs de erro
pm2 logs personal-agenda --err

# Verificar porta 3000
sudo netstat -tulpn | grep 3000

# Testar aplicação manualmente
cd /var/www/personal-agenda-backend
node src/server.js

# Ver logs do Nginx
sudo tail -f /var/log/nginx/error.log

# Reiniciar Nginx
sudo systemctl restart nginx

# Verificar status do Nginx
sudo systemctl status nginx

# ========================================
# BACKUP
# ========================================

# Fazer backup do .env
cp .env .env.backup

# Fazer backup completo
cd /var/www
tar -czf personal-agenda-backup-$(date +%Y%m%d).tar.gz personal-agenda-backend/

# Restaurar backup
tar -xzf personal-agenda-backup-YYYYMMDD.tar.gz
