# Arquitetura do SaaS Personal Agenda

**Versão:** 1.0  
**Data:** 07/02/2026  
**Produto:** Personal Agenda  
**Público-alvo:** Personal Trainers autônomos  
**Idioma:** PT-BR  
**Fuso horário:** America/Sao_Paulo

---

## 1. Visão Geral da Arquitetura

O **Personal Agenda** é um sistema SaaS profissional de gestão de agenda para personal trainers, construído com arquitetura **web-first** e WhatsApp como canal auxiliar de notificações.

### 1.1 Princípios Arquiteturais

- **Simplicidade operacional**: Stack enxuta e consolidada
- **Debugabilidade**: Logs centralizados e fluxos rastreáveis
- **Resiliência**: WhatsApp é opcional; core funciona independentemente
- **Multi-tenancy**: Isolamento total de dados por professor
- **Profissionalismo**: Adequado para venda como produto SaaS

### 1.2 Diagrama de Camadas

```
┌─────────────────────────────────────────────────────────┐
│                    USUÁRIO FINAL                        │
│              (Personal Trainer via Browser)             │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│                  FRONTEND WEB APP                       │
│          https://app.smartconverge.com.br               │
│                                                         │
│  • Interface responsiva (SPA/SSR)                       │
│  • Gestão de alunos, serviços e agenda                  │
│  • Visualização de notificações enviadas                │
└────────────────────┬────────────────────────────────────┘
                     │ HTTPS/REST
                     ▼
┌─────────────────────────────────────────────────────────┐
│                   BACKEND API REST                      │
│          https://api.smartconverge.com.br               │
│                                                         │
│  • Lógica de negócio centralizada                       │
│  • Validações e regras de sobreposição                  │
│  • Jobs agendados (cron interno)                        │
│  • Orquestração de notificações                         │
└──────┬──────────────────────────────────────┬───────────┘
       │                                      │
       ▼                                      ▼
┌──────────────────────┐          ┌──────────────────────┐
│   SUPABASE           │          │  EVOLUTION API       │
│                      │          │  (WhatsApp)          │
│ • PostgreSQL         │          │                      │
│ • Auth (JWT)         │          │ webhook:             │
│ • Row Level Security │          │ webhook.smart...     │
│ • Storage (opcional) │          │                      │
└──────────────────────┘          └──────────────────────┘
```

---

## 2. Responsabilidades por Camada

### 2.1 Frontend Web App

**URL:** `https://app.smartconverge.com.br`

**Tecnologia:** SPA ou SSR (React, Vue, Next.js, Nuxt, etc.)

**Responsabilidades:**
- Autenticação do personal trainer via Supabase Auth
- Interface para CRUD de alunos (manual e importação CSV)
- Gestão de serviços (presencial, online, ficha)
- Calendário visual de sessões com recorrência semanal
- Cancelamento e remarcação de sessões
- Visualização de contratos mensais
- Configuração de notificações (ativar/desativar por aluno)
- Histórico de mensagens enviadas via WhatsApp
- Painel de resumo diário

**O que NÃO faz:**
- Lógica de validação de sobreposição (delega ao backend)
- Envio direto de mensagens WhatsApp
- Processamento de comandos WhatsApp
- Cálculos de vencimento de contratos

---

### 2.2 Backend API REST

**URL:** `https://api.smartconverge.com.br`

**Tecnologia:** Node.js, Python (FastAPI/Django), Go, etc.

**Responsabilidades:**

#### 2.2.1 Lógica de Negócio
- Validar sobreposição de horários (presencial e online bloqueiam igualmente)
- Aplicar regras de multi-tenancy (professor só vê seus dados)
- Gerenciar recorrência de sessões
- Calcular vencimentos de contratos mensais
- Processar importação de CSV

#### 2.2.2 Orquestração de Notificações
- **Resumo diário** (06:00 AM): consulta sessões do dia e envia ao professor
- **Lembrete de sessão**: envia X minutos antes (configurável)
- **Lembrete de vencimento**: envia Y dias antes do vencimento do contrato
- Controle de duplicidade (flag `enviado_em` no banco)
- Respeitar configuração de notificações ativadas/desativadas por aluno

#### 2.2.3 Integração WhatsApp
- Enviar mensagens via Evolution API (POST para endpoint da Evolution)
- Receber webhooks de comandos simples: `HOJE`, `AMANHÃ`, `SEMANA`, `VENCIMENTOS`
- Processar comandos e retornar resposta estruturada
- **NÃO** armazena histórico de chat (apenas log de envios)

#### 2.2.4 Jobs Agendados (Cron Interno)
- Job diário às 06:00: resumo do dia
- Job recorrente (a cada X minutos): verificar lembretes de sessão
- Job diário: verificar vencimentos de contratos

**O que NÃO faz:**
- Renderizar interface visual
- Armazenar dados de forma duplicada (Supabase é fonte única)

---

### 2.3 Supabase

**Papel:** Banco de dados + Autenticação + Segurança

**Responsabilidades:**

#### 2.3.1 PostgreSQL
- Armazenamento de todas as entidades:
  - `professores` (personal trainers)
  - `alunos`
  - `servicos` (presencial, online, ficha)
  - `sessoes` (agendamentos)
  - `contratos` (mensalidades)
  - `notificacoes_log` (histórico de envios)
- Fonte única de verdade (single source of truth)

#### 2.3.2 Autenticação (Supabase Auth)
- Login/logout de professores
- Geração de tokens JWT
- Recuperação de senha
- Sessões seguras

#### 2.3.3 Row Level Security (RLS)
- Políticas de acesso por `professor_id`
- Garantir que cada professor só acessa seus próprios dados
- Isolamento total entre tenants

**O que NÃO faz:**
- Lógica de negócio (validações complexas ficam no backend)
- Envio de notificações

---

### 2.4 WhatsApp (Evolution API)

**URL Webhook:** `https://webhook.smartconverge.com.br`

**Papel:** Canal de notificação e comandos simples

**Responsabilidades:**

#### 2.4.1 Envio de Mensagens
- Receber requisições do backend com:
  - Número do destinatário
  - Texto da mensagem
- Entregar mensagem via WhatsApp
- Retornar status de envio (sucesso/falha)

#### 2.4.2 Recepção de Comandos
- Receber webhooks de mensagens recebidas
- Encaminhar para o backend via `https://webhook.smartconverge.com.br`
- Comandos suportados:
  - `HOJE`: retorna sessões do dia
  - `AMANHÃ`: retorna sessões do dia seguinte
  - `SEMANA`: retorna sessões da semana
  - `VENCIMENTOS`: retorna contratos próximos do vencimento

**O que NÃO faz:**
- Armazenar dados de alunos ou sessões
- Processar lógica de negócio
- Substituir o sistema web (é apenas auxiliar)

**Comportamento em caso de falha:**
- Se Evolution API cair, o sistema web continua 100% funcional
- Notificações ficam em fila para reenvio (opcional)
- Professor pode consultar tudo pelo painel web

---

### 2.5 EasyPanel (Infraestrutura)

**Papel:** Orquestração de containers e deploy

**Responsabilidades:**
- Hospedar frontend (servir arquivos estáticos ou SSR)
- Hospedar backend (API REST)
- Gerenciar variáveis de ambiente
- Configurar domínios e SSL (app.*, api.*, webhook.*)
- Logs centralizados
- Restart automático em caso de falha

**O que NÃO faz:**
- Executar lógica de negócio
- Armazenar dados persistentes (usa Supabase)

---

## 3. Fluxos Principais

### 3.1 Fluxo de Criação de Sessão

```
1. Professor acessa frontend → Cria sessão recorrente
2. Frontend → POST /api/sessoes (backend)
3. Backend valida:
   - Sobreposição de horário?
   - Professor autenticado?
   - Serviço existe?
4. Backend → INSERT no Supabase (tabela sessoes)
5. Supabase retorna sucesso
6. Backend retorna sessão criada ao frontend
7. Frontend atualiza calendário
```

### 3.2 Fluxo de Notificação Automática (Lembrete de Sessão)

```
1. Cron interno do backend executa a cada 15 minutos
2. Backend consulta Supabase:
   - Sessões nas próximas X horas
   - Alunos com notificações ativadas
   - Notificações ainda não enviadas
3. Para cada sessão:
   a. Backend monta mensagem
   b. Backend → POST para Evolution API
   c. Evolution envia WhatsApp
   d. Backend registra envio em notificacoes_log
```

### 3.3 Fluxo de Comando WhatsApp (HOJE)

```
1. Aluno envia "HOJE" via WhatsApp
2. Evolution API → POST webhook.smartconverge.com.br
3. Backend recebe webhook:
   - Identifica número do remetente
   - Busca aluno no Supabase
   - Consulta sessões do dia
4. Backend monta resposta formatada
5. Backend → POST para Evolution API
6. Evolution envia resposta ao aluno
```

---

## 4. Regras de Negócio Implementadas na Arquitetura

### 4.1 Multi-tenancy
- **Camada:** Supabase (RLS) + Backend (validação)
- **Implementação:** Todas as queries filtram por `professor_id`

### 4.2 Sobreposição de Horários
- **Camada:** Backend
- **Implementação:** Query no Supabase verificando conflitos antes de INSERT

### 4.3 Notificações Não Duplicadas
- **Camada:** Backend
- **Implementação:** Flag `enviado_em` na tabela `notificacoes_log`

### 4.4 WhatsApp Não é Fonte de Verdade
- **Camada:** Arquitetura geral
- **Implementação:** Supabase é único repositório de dados; WhatsApp apenas lê

### 4.5 Alunos Sem Login
- **Camada:** Frontend + Backend
- **Implementação:** Sem tabela de usuários para alunos; apenas cadastro pelo professor

### 4.6 Notificações Desligadas por Padrão
- **Camada:** Backend
- **Implementação:** Campo `notificacoes_ativas` = `false` ao criar aluno

---

## 5. Modelo de Dados Simplificado

### 5.1 Entidades Principais

```
professores
├── id (UUID, PK)
├── email
├── nome
├── telefone_whatsapp
└── created_at

alunos
├── id (UUID, PK)
├── professor_id (FK → professores)
├── nome
├── telefone_whatsapp
├── notificacoes_ativas (boolean, default: false)
└── created_at

servicos
├── id (UUID, PK)
├── professor_id (FK → professores)
├── tipo (enum: presencial, online, ficha)
├── nome
├── duracao_minutos
└── valor_mensal

sessoes
├── id (UUID, PK)
├── professor_id (FK → professores)
├── aluno_id (FK → alunos)
├── servico_id (FK → servicos)
├── data_hora_inicio
├── data_hora_fim
├── recorrencia (enum: semanal, única)
├── status (enum: agendada, cancelada, concluída)
└── created_at

contratos
├── id (UUID, PK)
├── professor_id (FK → professores)
├── aluno_id (FK → alunos)
├── servico_id (FK → servicos)
├── data_inicio
├── data_vencimento
├── valor
└── status (enum: ativo, vencido, cancelado)

notificacoes_log
├── id (UUID, PK)
├── professor_id (FK → professores)
├── aluno_id (FK → alunos, nullable)
├── tipo (enum: resumo_diario, lembrete_sessao, vencimento_contrato)
├── mensagem
├── enviado_em
└── status (enum: enviado, falha)
```

---

## 6. Segurança e Conformidade

### 6.1 Autenticação
- JWT via Supabase Auth
- Tokens com expiração configurável
- Refresh tokens para sessões longas

### 6.2 Autorização
- Row Level Security (RLS) no Supabase
- Middleware no backend validando `professor_id` em cada request

### 6.3 HTTPS
- Todos os endpoints com SSL (EasyPanel gerencia certificados)

### 6.4 Dados Sensíveis
- Senhas: hash via Supabase Auth (bcrypt)
- Números de telefone: armazenados sem criptografia (necessários para WhatsApp)

---

## 7. Escalabilidade e Manutenção

### 7.1 Escalabilidade Vertical (MVP)
- Backend pode escalar CPU/RAM no EasyPanel
- Supabase gerencia escalabilidade do banco

### 7.2 Escalabilidade Horizontal (Futuro)
- Backend stateless permite múltiplas instâncias
- Load balancer no EasyPanel

### 7.3 Monitoramento
- Logs do backend centralizados no EasyPanel
- Logs de notificações na tabela `notificacoes_log`
- Alertas de falha de envio via Evolution API

### 7.4 Backup
- Supabase: backups automáticos diários
- Código: versionado em Git

---

## 8. Adequação ao Time Não Técnico

### 8.1 Operação Simplificada
- Deploy via EasyPanel (interface visual)
- Sem necessidade de gerenciar servidores
- Logs acessíveis via painel

### 8.2 Debugabilidade
- Tabela `notificacoes_log` permite rastrear envios
- Erros de API retornam mensagens claras
- Frontend exibe mensagens de erro amigáveis

### 8.3 Suporte
- Stack consolidada (menos pontos de falha)
- Documentação centralizada neste documento
- Evolution API tem suporte ativo

---

## 9. Validação da Arquitetura

### 9.1 ✅ Simplicidade Operacional
- Stack enxuta: 1 frontend + 1 backend + Supabase + Evolution
- EasyPanel centraliza deploy e logs
- Sem microserviços desnecessários

### 9.2 ✅ Debugabilidade
- Logs centralizados
- Tabela de auditoria de notificações
- Fluxos lineares e rastreáveis

### 9.3 ✅ Adequação para Time Não Técnico
- Interface visual de deploy (EasyPanel)
- Sem necessidade de DevOps avançado
- Supabase gerencia banco automaticamente

### 9.4 ✅ Profissionalismo para SaaS
- Multi-tenancy nativo (RLS)
- Segurança (HTTPS, JWT, RLS)
- Escalável verticalmente sem refatoração

### 9.5 ✅ Resiliência
- WhatsApp opcional (sistema funciona sem)
- Backend stateless (fácil restart)
- Supabase com alta disponibilidade

---

## 10. Escopo do MVP (Confirmação)

### 10.1 ✅ Incluído
- Login do personal trainer
- CRUD de alunos (manual + CSV)
- Serviços: presencial, online, ficha
- Agenda com recorrência semanal
- Cancelar e remarcar sessões
- Contratos mensais
- Notificações automáticas (resumo, lembrete, vencimento)
- WhatsApp: envio automático + comandos (HOJE, AMANHÃ, SEMANA, VENCIMENTOS)

### 10.2 ❌ Não Incluído (Confirmado)
- Login de aluno
- Pagamentos online
- IA livre no chat
- App mobile nativo
- Integração com Google Calendar

---

## 11. Próximos Passos (Fora do Escopo desta Fase)

Esta arquitetura está **validada e aprovada** para desenvolvimento.

**Próximas fases** (NÃO executar agora):
1. Modelagem detalhada do banco (DDL Supabase)
2. Definição de endpoints da API REST
3. Wireframes do frontend
4. Implementação do código
5. Testes e deploy

---

## 12. Conclusão

A arquitetura do **Personal Agenda** é:

- **Simples**: Stack consolidada e sem complexidade desnecessária
- **Profissional**: Multi-tenancy, segurança e escalabilidade
- **Operável**: Time não técnico consegue gerenciar via EasyPanel
- **Resiliente**: WhatsApp é auxiliar; core funciona independentemente
- **Adequada ao MVP**: Escopo fechado e bem definido

Esta arquitetura está pronta para ser usada como referência no desenvolvimento.

---

**Documento validado por:** Arquiteto de Software Sênior  
**Data:** 07/02/2026  
**Versão:** 1.0 (Final)
