# 🚀 GUIA AJUSTADO - Deploy com EasyPanel Instalado

Como você já tem o **EasyPanel (Docker)** rodando, ele ocupa a porta 80.
**NÃO instale o Nginx nem o Certbot** na VPS, pois vai quebrar o EasyPanel.

Vamos rodar o Backend direto no sistema (Host) na porta **3000** e deixar o EasyPanel gerenciar o resto.

---

## 🎯 Passo a Passo Atualizado

### **1. Conectar na VPS**

```bash
ssh root@SEU_IP_DA_VPS
```

### **2. Preparar Ambiente (Node.js + PM2)**

Ignore o erro do Nginx e execute:

```bash
# Atualizar sistema
sudo apt update

# Instalar Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Instalar PM2 (Gerenciador de Processos)
sudo npm install -g pm2

# Criar diretório
sudo mkdir -p /var/www/personal-agenda-backend
```

### **3. Fazer Upload dos Arquivos**

**Do seu computador Windows (PowerShell):**
 Abra um novo terminal no seu PC e rode:

```powershell
cd "f:\Projetos\Automações\Personal Agenda\backend"
scp -r * root@SEU_IP_DA_VPS:/var/www/personal-agenda-backend/
```

**OU use FileZilla/WinSCP:**

- Upload de `backend/*` para `/var/www/personal-agenda-backend/`

### **4. Iniciar o Backend**

Volte para o terminal da VPS e rode:

```bash
cd /var/www/personal-agenda-backend

# Instalar dependências
npm install --production

# Iniciar com PM2 na porta 3000
pm2 start src/server.js --name personal-agenda

# Salvar para iniciar no boot
pm2 startup
pm2 save
```

### **5. Liberar Porta 3000 (Firewall)**

Como não vamos usar o Nginx (o EasyPanel já usa a porta 80), precisamos liberar a porta 3000 para acesso direto ou configuração.

```bash
sudo ufw allow 3000
```

---

## 🔗 Como Configurar o Domínio (SSL) no EasyPanel

Agora que seu backend está rodando em `http://IP-DA-VPS:3000`, você tem duas opções:

### **Opção A: Acessar via IP (Imediato)**

Use `http://SEU_IP_DA_VPS:3000`

### **Opção B: Configurar Proxy no EasyPanel (Recomendado)**

Para ter HTTPS (`api.smartconverge.com.br`):

1. Vá no EasyPanel
2. Crie um novo serviço do tipo **"App"** (ou Custom)
3. Na configuração de **Docker Image**, use uma imagem leve (ex: `nginx:alpine`) apenas para segurar o serviço, **OU** procure por uma opção de **"Proxy Service"**.
4. Se o EasyPanel permitir proxy para IP externo/interno:
   - Aponte para `http://172.17.0.1:3000` (IP do host Docker)
   - Ou `http://IP_PUBLICO:3000`

**DICA:** Se o EasyPanel for muito restrito, usar a **porta 3000 direto** é a solução mais rápida agora.

---

## ✅ Testar Backend

```bash
curl http://localhost:3000/health
```
