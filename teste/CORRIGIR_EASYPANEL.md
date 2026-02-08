# 🔧 Corrigir Deploy no EasyPanel

## ❌ Problema Identificado

O erro acontece porque o EasyPanel não está encontrando a pasta `src/app/`:

```
Error: > Couldn't find any `pages` or `app` directory.
```

Isso significa que a estrutura de pastas está incorreta no GitHub.

---

## ✅ Solução: Estrutura Correta

A estrutura do repositório deve ser:

```
personal-agenda-frontend/  ← Raiz do repositório
├── src/
│   ├── app/
│   │   ├── layout.js
│   │   ├── page.js
│   │   ├── login/
│   │   └── dashboard/
│   ├── lib/
│   │   └── api.js
│   └── styles/
│       └── globals.css
├── package.json
├── next.config.js
├── Dockerfile
├── .dockerignore
└── .env
```

**NÃO DEVE TER** pasta `frontend/frontend/` duplicada!

---

## 🚀 Como Corrigir

### Método 1: Refazer o Repositório GitHub

1. **Delete o repositório atual** (se quiser recomeçar)
   - Vá em Settings > Delete repository

2. **Crie um novo repositório**
   - Nome: `personal-agenda-frontend`
   - Público ou Privado (tanto faz)

3. **No seu PC, faça upload correto:**

   ```powershell
   # Vá para a pasta CORRETA (sem duplicação)
   cd "f:\Projetos\Automações\Personal Agenda\frontend"
   
   # Verifique se está na pasta certa (deve mostrar: src, package.json, etc.)
   dir
   
   # Inicialize o Git
   git init
   
   # Adicione todos os arquivos
   git add .
   
   # Faça o commit
   git commit -m "Frontend completo - estrutura correta"
   
   # Conecte ao repositório
   git remote add origin https://github.com/SEU-USUARIO/personal-agenda-frontend.git
   
   # Faça o push
   git branch -M main
   git push -u origin main
   ```

4. **No EasyPanel:**
   - Delete o serviço atual
   - Crie um novo apontando para o repositório corrigido
   - Configure as variáveis de ambiente:

     ```
     NEXT_PUBLIC_API_URL=https://api.smartconverge.com.br
     ```

---

### Método 2: Corrigir Configuração no EasyPanel

Se não quiser mexer no GitHub:

1. **No EasyPanel**, vá nas configurações do serviço
2. Procure por **"Build Context"** ou **"Context Path"**
3. Se a pasta estiver duplicada como `frontend/frontend/`, configure:
   - **Context Path**: `frontend`
   - Ou **Dockerfile Path**: `frontend/Dockerfile`

---

## 🎯 Checklist Antes de Fazer Deploy

- [ ] A pasta `src/` está na raiz do repositório?
- [ ] O arquivo `package.json` está na raiz?
- [ ] O arquivo `Dockerfile` está na raiz?
- [ ] Não tem pasta `frontend/frontend/` duplicada?
- [ ] O arquivo `.env` tem `NEXT_PUBLIC_API_URL`?

---

## 🆘 Se Continuar Dando Erro

Me mande:

1. A estrutura de pastas do seu repositório GitHub
2. O conteúdo do arquivo `Dockerfile`
3. A configuração do EasyPanel (screenshot ou texto)

---

**Dica**: Se o EasyPanel continuar dando problema, use a **Vercel**. É muito mais fácil! 😄
