# 🚀 Deploy do Frontend - Personal Agenda

## Opção 1: Vercel (Recomendado - Mais Fácil)

### Por que Vercel?

- ✅ **Gratuito** para projetos pessoais
- ✅ **Deploy automático** a cada push no GitHub
- ✅ **SSL/HTTPS** automático
- ✅ **CDN global** (super rápido)
- ✅ **Otimizado para Next.js**

### Passo a Passo

1. **Criar conta no Vercel**
   - Acesse: <https://vercel.com>
   - Faça login com GitHub

2. **Importar Projeto**
   - Clique em "Add New Project"
   - Selecione o repositório do frontend
   - Ou faça upload da pasta `frontend/`

3. **Configurar Variáveis de Ambiente**
   - Na tela de configuração, adicione:

     ```
     NEXT_PUBLIC_API_URL=https://api.smartconverge.com.br
     ```

4. **Deploy!**
   - Clique em "Deploy"
   - Aguarde 1-2 minutos
   - Seu site estará no ar em: `https://seu-projeto.vercel.app`

5. **Configurar Domínio Personalizado (Opcional)**
   - No painel do Vercel, vá em "Settings" > "Domains"
   - Adicione: `app.smartconverge.com.br`
   - Configure o DNS conforme instruções

---

## Opção 2: Netlify (Alternativa Gratuita)

### Passo a Passo

1. **Criar conta no Netlify**
   - Acesse: <https://netlify.com>
   - Faça login com GitHub

2. **Importar Projeto**
   - Clique em "Add new site" > "Import an existing project"
   - Conecte ao GitHub e selecione o repositório

3. **Configurar Build**
   - Build command: `npm run build`
   - Publish directory: `.next`

4. **Variáveis de Ambiente**
   - Em "Site settings" > "Environment variables"
   - Adicione: `NEXT_PUBLIC_API_URL=https://api.smartconverge.com.br`

5. **Deploy!**
   - Clique em "Deploy site"

---

## Opção 3: VPS Hostinger (Mesma do Backend)

### Passo a Passo

1. **Conectar na VPS**

   ```bash
   ssh root@srv1286351.hostinger.com
   ```

2. **Criar Diretório**

   ```bash
   mkdir -p /var/www/personal-agenda-frontend
   cd /var/www/personal-agenda-frontend
   ```

3. **Enviar Arquivos (do seu PC)**

   ```powershell
   cd "f:\Projetos\Automações\Personal Agenda\frontend"
   scp -r * root@srv1286351.hostinger.com:/var/www/personal-agenda-frontend/
   ```

4. **Instalar e Buildar (na VPS)**

   ```bash
   cd /var/www/personal-agenda-frontend
   npm install
   npm run build
   pm2 start npm --name personal-agenda-frontend -- start
   pm2 save
   ```

5. **Configurar Nginx (na VPS)**

   ```bash
   sudo nano /etc/nginx/sites-available/personal-agenda-frontend
   ```

   Cole:

   ```nginx
   server {
       listen 80;
       server_name app.smartconverge.com.br;

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
   sudo ln -s /etc/nginx/sites-available/personal-agenda-frontend /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl reload nginx
   ```

6. **Configurar SSL**

   ```bash
   sudo certbot --nginx -d app.smartconverge.com.br
   ```

---

## Opção 4: Docker (Qualquer Servidor)

### Passo a Passo

1. **Build da Imagem**

   ```bash
   cd "f:\Projetos\Automações\Personal Agenda\frontend"
   docker build -t personal-agenda-frontend .
   ```

2. **Rodar Container**

   ```bash
   docker run -d \
     --name personal-agenda-frontend \
     -p 3000:3000 \
     -e NEXT_PUBLIC_API_URL=https://api.smartconverge.com.br \
     --restart unless-stopped \
     personal-agenda-frontend
   ```

3. **Verificar**

   ```bash
   docker logs -f personal-agenda-frontend
   ```

---

## ⚙️ Configuração de DNS

Para usar domínios personalizados:

### Backend (API)

- **Domínio**: `api.smartconverge.com.br`
- **Tipo**: A Record
- **Valor**: IP da VPS

### Frontend (App)

- **Domínio**: `app.smartconverge.com.br`
- **Tipo**:
  - Se Vercel/Netlify: CNAME para o domínio deles
  - Se VPS: A Record para o IP da VPS

---

## ✅ Checklist Pós-Deploy

- [ ] Frontend está acessível via HTTPS
- [ ] Login funciona corretamente
- [ ] Dashboard carrega as estatísticas
- [ ] Consegue criar/editar/excluir alunos
- [ ] Consegue criar/editar/excluir serviços
- [ ] Agenda mostra as sessões
- [ ] Notificações aparecem no histórico

---

## 🆘 Troubleshooting

### Erro: "Failed to fetch"

- Verifique se `NEXT_PUBLIC_API_URL` está correto
- Verifique se o backend está rodando
- Verifique CORS no backend

### Página em branco

- Verifique os logs: `pm2 logs personal-agenda-frontend`
- Ou no navegador: F12 > Console

### Build falha

- Verifique se todas as dependências foram instaladas
- Rode: `npm install` novamente

---

## 🎯 Recomendação Final

Para um projeto em produção:

- **Frontend**: Vercel (gratuito, rápido, fácil)
- **Backend**: VPS Hostinger (você já tem)

Isso separa as responsabilidades e aproveita o melhor de cada plataforma!

---

**Qualquer dúvida, consulte o README.md do frontend!** 📚
