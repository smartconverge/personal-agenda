# Personal Agenda - Frontend

Interface web moderna para o sistema de gestão de alunos para personal trainers.

## 🚀 Tecnologias

- **Next.js 14** (App Router)
- **React 18**
- **Axios** para requisições HTTP
- **CSS Modules** com variáveis CSS customizadas
- **Dark Mode** por padrão

## 📱 Páginas Implementadas

### Autenticação

- `/login` - Página de login

### Dashboard (Autenticado)

- `/dashboard` - Visão geral com estatísticas e próximas sessões
- `/dashboard/alunos` - Gerenciamento completo de alunos (CRUD)
- `/dashboard/servicos` - Gerenciamento de serviços oferecidos (CRUD)
- `/dashboard/contratos` - Visualização de contratos ativos
- `/dashboard/agenda` - Calendário de sessões com filtro por data
- `/dashboard/notificacoes` - Histórico de mensagens enviadas

## ⚙️ Configuração

### 1. Variáveis de Ambiente

Crie um arquivo `.env.local` (ou use o `.env` existente):

```bash
NEXT_PUBLIC_API_URL=https://api.smartconverge.com.br
```

### 2. Instalar Dependências

```bash
npm install
```

### 3. Rodar em Desenvolvimento

```bash
npm run dev
```

Acesse: `http://localhost:3000`

### 4. Build para Produção

```bash
npm run build
npm start
```

## 🎨 Design System

O projeto usa um sistema de design customizado com:

- **Cores**: Variáveis CSS para fácil customização
- **Componentes**: Botões, inputs, cards, tabelas, badges, modais
- **Responsivo**: Layout adaptável para mobile e desktop
- **Dark Mode**: Interface escura por padrão

### Variáveis CSS Principais

```css
--primary: #6366f1
--success: #10b981
--danger: #ef4444
--warning: #f59e0b
--bg-primary: #0f172a
--bg-secondary: #1e293b
```

## 🔐 Autenticação

O sistema usa JWT armazenado no `localStorage`:

- Token é adicionado automaticamente em todas as requisições
- Redirecionamento automático para `/login` se não autenticado
- Logout limpa o token e redireciona

## 📦 Estrutura de Pastas

```
frontend/
├── src/
│   ├── app/
│   │   ├── layout.js              # Layout raiz
│   │   ├── page.js                # Página inicial (redireciona)
│   │   ├── login/
│   │   │   └── page.js            # Página de login
│   │   └── dashboard/
│   │       ├── layout.js          # Layout do dashboard
│   │       ├── page.js            # Dashboard principal
│   │       ├── alunos/page.js     # Gestão de alunos
│   │       ├── servicos/page.js   # Gestão de serviços
│   │       ├── contratos/page.js  # Visualização de contratos
│   │       ├── agenda/page.js     # Calendário de sessões
│   │       └── notificacoes/page.js # Histórico de notificações
│   ├── lib/
│   │   └── api.js                 # Cliente HTTP configurado
│   └── styles/
│       └── globals.css            # Estilos globais e design system
├── .env                           # Variáveis de ambiente
├── next.config.js                 # Configuração do Next.js
├── package.json
└── Dockerfile                     # Para deploy em container
```

## 🚀 Deploy

### Vercel (Recomendado)

1. Conecte seu repositório no Vercel
2. Configure a variável de ambiente `NEXT_PUBLIC_API_URL`
3. Deploy automático!

### Docker

```bash
docker build -t personal-agenda-frontend .
docker run -p 3000:3000 -e NEXT_PUBLIC_API_URL=https://api.smartconverge.com.br personal-agenda-frontend
```

### VPS Manual

```bash
npm install
npm run build
pm2 start npm --name "personal-agenda-frontend" -- start
```

## 🔧 Funcionalidades Principais

### Alunos

- ✅ Listar todos os alunos
- ✅ Criar novo aluno
- ✅ Editar aluno existente
- ✅ Excluir aluno
- ✅ Controle de notificações ativas/inativas

### Serviços

- ✅ Listar serviços
- ✅ Criar serviço (presencial, online ou ficha)
- ✅ Editar serviço
- ✅ Excluir serviço
- ✅ Configurar duração e valor padrão

### Dashboard

- ✅ Estatísticas gerais (alunos, serviços, contratos, sessões)
- ✅ Próximas sessões do dia
- ✅ Navegação intuitiva

### Agenda

- ✅ Visualização de sessões por data
- ✅ Filtro por data
- ✅ Status das sessões (agendada, concluída, cancelada)

## 📝 Próximas Melhorias

- [ ] Criação de contratos pelo frontend
- [ ] Agendamento de sessões pelo frontend
- [ ] Importação de alunos via CSV
- [ ] Gráficos e relatórios
- [ ] Notificações em tempo real
- [ ] Modo claro (light mode)
- [ ] PWA (Progressive Web App)

## 🆘 Troubleshooting

### Erro de CORS

Certifique-se de que o backend está configurado para aceitar requisições do domínio do frontend.

### Token expirado

O sistema redireciona automaticamente para login. Se persistir, limpe o localStorage:

```javascript
localStorage.clear()
```

### API não responde

Verifique se a URL em `NEXT_PUBLIC_API_URL` está correta e o backend está rodando.

---

**Desenvolvido para Personal Trainers Autônomos** 💪
