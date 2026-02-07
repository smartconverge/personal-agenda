# Contrato de Sistema — Personal Agenda

**Versão:** 1.0  
**Data:** 07/02/2026  
**Tipo:** Especificação Técnica Contratual  
**Produto:** Personal Agenda  
**Público-alvo:** Personal Trainers autônomos  
**Idioma:** PT-BR  
**Timezone:** America/Sao_Paulo

---

## Propósito deste Documento

Este documento define o **contrato técnico imutável** do sistema Personal Agenda.

Ele especifica:

- **O QUE** o sistema faz (entidades, relações, endpoints)
- **COMO** os componentes se comunicam (fluxos)
- **ONDE** as regras são aplicadas (backend, banco, frontend)
- **O QUE NÃO FAZER** (anti-padrões)

Este contrato é **independente de implementação**. Pode ser usado para gerar código automaticamente ou para validar implementações manuais.

---

## 1️⃣ DEFINIÇÃO DAS ENTIDADES (CONCEITUAL)

### 1.1 Professor

**Propósito:**  
Representa o personal trainer, único usuário com login no sistema.

**Campos principais:**

- Identificador único
- Nome completo
- Email (usado para login)
- Telefone WhatsApp (para receber resumo diário)
- Data de criação

**O que representa:**

- O dono dos dados (tenant)
- Quem gerencia alunos, serviços, contratos e sessões
- Quem recebe notificações de resumo diário

**O que NÃO representa:**

- Aluno (alunos não têm login)
- Administrador do sistema (não há hierarquia)

**Relações:**

- 1 Professor → N Alunos
- 1 Professor → N Serviços
- 1 Professor → N Contratos
- 1 Professor → N Sessões
- 1 Professor → N NotificaçõesLog

---

### 1.2 Aluno

**Propósito:**  
Representa o cliente do personal trainer. NÃO possui login.

**Campos principais:**

- Identificador único
- Referência ao professor (tenant)
- Nome completo
- Telefone WhatsApp
- Flag: notificações ativas (padrão: false)
- Data de criação

**O que representa:**

- Cliente do professor
- Destinatário de notificações (se ativado)
- Participante de sessões

**O que NÃO representa:**

- Usuário do sistema (não faz login)
- Entidade independente (sempre vinculado a um professor)

**Relações:**

- N Alunos → 1 Professor
- 1 Aluno → N Contratos
- 1 Aluno → N Sessões
- 1 Aluno → N NotificaçõesLog

---

### 1.3 Serviço

**Propósito:**  
Representa uma modalidade de atendimento oferecida pelo professor.

**Campos principais:**

- Identificador único
- Referência ao professor (tenant)
- Tipo (enum: presencial | online | ficha)
- Nome descritivo (ex: "Treino Presencial 1h")
- Duração em minutos
- Data de criação

**O que representa:**

- Modalidade de atendimento
- Template para criação de contratos
- Tipo de sessão agendável

**O que NÃO representa:**

- Plano de assinatura (não há planos Starter/Pro)
- Contrato (valor e vencimento pertencem ao Contrato)
- Sessão agendada (sessões são criadas a partir de contratos)

**Relações:**

- N Serviços → 1 Professor
- 1 Serviço → N Contratos
- 1 Serviço → N Sessões

**Regra crítica:**

- Presencial e online bloqueiam agenda igualmente
- Ficha NÃO bloqueia agenda (é apenas entrega de documento)

---

### 1.4 Contrato

**Propósito:**  
Representa o acordo mensal entre professor e aluno para um serviço específico.

**Campos principais:**

- Identificador único
- Referência ao professor (tenant)
- Referência ao aluno
- Referência ao serviço
- Data de início
- Data de vencimento
- Valor mensal
- Status (enum: ativo | vencido | cancelado)
- Data de criação

**O que representa:**

- Compromisso mensal de prestação de serviço
- Fonte de verdade para valor e vencimento
- Gatilho para notificações de vencimento

**O que NÃO representa:**

- Pagamento (não há integração de pagamento no MVP)
- Sessão agendada (sessões são criadas separadamente)

**Relações:**

- N Contratos → 1 Professor
- N Contratos → 1 Aluno
- N Contratos → 1 Serviço

**Regra crítica:**

- Um aluno pode ter múltiplos contratos simultâneos (ex: presencial + ficha)
- Vencimento é calculado mensalmente a partir da data de início
- Notificação de vencimento é enviada X dias antes (configurável)

---

### 1.5 Sessão

**Propósito:**  
Representa um agendamento específico de atendimento.

**Campos principais:**

- Identificador único
- Referência ao professor (tenant)
- Referência ao aluno
- Referência ao serviço
- Data e hora de início
- Data e hora de fim
- Tipo de recorrência (enum: única | semanal)
- Status (enum: agendada | cancelada | concluída | remarcada)
- Referência à sessão original (se remarcada)
- Data de criação

**O que representa:**

- Agendamento concreto na agenda
- Bloqueio de horário (para presencial e online)
- Gatilho para lembrete de sessão

**O que NÃO representa:**

- Contrato (sessões podem existir sem contrato ativo)
- Pagamento (não há vínculo com financeiro)

**Relações:**

- N Sessões → 1 Professor
- N Sessões → 1 Aluno
- N Sessões → 1 Serviço
- 1 Sessão → 1 Sessão original (se remarcada)

**Regra crítica:**

- Sessões NÃO podem sobrepor horário (mesmo professor)
- Presencial e online bloqueiam igualmente
- Ficha NÃO bloqueia agenda
- Recorrência semanal cria múltiplas sessões automaticamente
- Cancelar sessão recorrente pode cancelar apenas uma ou todas futuras

---

### 1.6 NotificaçãoLog

**Propósito:**  
Registra todas as notificações enviadas pelo sistema.

**Campos principais:**

- Identificador único
- Referência ao professor (tenant)
- Referência ao aluno (nullable, se for resumo diário para professor)
- Tipo (enum: resumo_diario | lembrete_sessao | vencimento_contrato)
- Canal (enum: whatsapp | email)
- Mensagem enviada (texto completo)
- Data/hora de envio
- Status (enum: enviado | falha | pendente)
- Referência à sessão (se lembrete_sessao)
- Referência ao contrato (se vencimento_contrato)
- Data de criação

**O que representa:**

- Auditoria completa de notificações
- Mecanismo de idempotência (evita duplicação)
- Histórico para debug

**O que NÃO representa:**

- Conversa de chat (não armazena mensagens recebidas)
- Fila de envio (envio é síncrono)

**Relações:**

- N NotificaçõesLog → 1 Professor
- N NotificaçõesLog → 1 Aluno (nullable)
- N NotificaçõesLog → 1 Sessão (nullable)
- N NotificaçõesLog → 1 Contrato (nullable)

**Regra crítica:**

- Antes de enviar notificação, verificar se já existe log com mesmo tipo + destinatário + referência
- Se status = falha, permitir reenvio

---

### 1.7 Canal

**Propósito:**  
Representa um canal de comunicação configurado (WhatsApp, Email, etc.).

**Campos principais:**

- Identificador único
- Tipo (enum: whatsapp | email)
- Status (enum: ativo | inativo)
- Configuração (JSON com credenciais/endpoints)
- Data de criação

**O que representa:**

- Configuração de integração externa
- Ponto de falha isolado (se WhatsApp cair, sistema continua)

**O que NÃO representa:**

- Destinatário (alunos e professores têm seus próprios contatos)
- Mensagem (mensagens estão em NotificaçãoLog)

**Relações:**

- Entidade independente (não vinculada a professor)
- Usada por NotificaçãoLog para determinar canal de envio

**Regra crítica:**

- Se canal está inativo, notificações desse tipo ficam pendentes
- Sistema web funciona independentemente do status do canal

---

## 2️⃣ CONTRATO DA API REST (ENDPOINTS)

### Princípios Gerais

1. **Autenticação obrigatória**: Todos os endpoints (exceto login) exigem JWT válido
2. **Multi-tenancy**: Todos os recursos são filtrados por `professor_id` extraído do JWT
3. **Validação no backend**: Frontend NÃO toma decisões críticas
4. **Idempotência**: Operações críticas (notificações, sessões) são idempotentes
5. **Respostas padronizadas**: JSON com estrutura `{ success: boolean, data: object, error: string }`

---

### 2.1 Autenticação

#### POST /auth/login

- **Objetivo**: Autenticar professor e retornar JWT
- **Quem pode chamar**: Qualquer usuário (não autenticado)
- **Payload**: `{ email, senha }`
- **Resposta**: `{ token, professor: { id, nome, email } }`
- **Regra crítica**: Usar Supabase Auth para validação

#### POST /auth/logout

- **Objetivo**: Invalidar sessão (opcional, JWT expira automaticamente)
- **Quem pode chamar**: Professor autenticado
- **Regra crítica**: Limpar token no frontend

#### POST /auth/recuperar-senha

- **Objetivo**: Enviar email de recuperação
- **Quem pode chamar**: Qualquer usuário
- **Payload**: `{ email }`
- **Regra crítica**: Usar Supabase Auth

---

### 2.2 Alunos

#### GET /alunos

- **Objetivo**: Listar todos os alunos do professor
- **Quem pode chamar**: Professor autenticado
- **Filtros opcionais**: `?nome=X&notificacoes_ativas=true`
- **Resposta**: Array de alunos
- **Regra crítica**: Filtrar por `professor_id` do JWT

#### POST /alunos

- **Objetivo**: Criar novo aluno
- **Quem pode chamar**: Professor autenticado
- **Payload**: `{ nome, telefone_whatsapp, notificacoes_ativas }`
- **Resposta**: Aluno criado
- **Regra crítica**: Vincular ao `professor_id` do JWT

#### PUT /alunos/:id

- **Objetivo**: Atualizar dados do aluno
- **Quem pode chamar**: Professor autenticado (dono do aluno)
- **Payload**: `{ nome?, telefone_whatsapp?, notificacoes_ativas? }`
- **Regra crítica**: Validar que aluno pertence ao professor

#### DELETE /alunos/:id

- **Objetivo**: Excluir aluno (soft delete recomendado)
- **Quem pode chamar**: Professor autenticado (dono do aluno)
- **Regra crítica**: Verificar se aluno tem contratos/sessões ativas

#### POST /alunos/importar-csv

- **Objetivo**: Importar múltiplos alunos via CSV
- **Quem pode chamar**: Professor autenticado
- **Payload**: Arquivo CSV com colunas `nome,telefone_whatsapp,notificacoes_ativas`
- **Resposta**: `{ importados: N, erros: [...] }`
- **Regra crítica**: Validar formato, evitar duplicação por telefone

---

### 2.3 Serviços

#### GET /servicos

- **Objetivo**: Listar serviços do professor
- **Quem pode chamar**: Professor autenticado
- **Filtros opcionais**: `?tipo=presencial`
- **Resposta**: Array de serviços
- **Regra crítica**: Filtrar por `professor_id`

#### POST /servicos

- **Objetivo**: Criar novo serviço
- **Quem pode chamar**: Professor autenticado
- **Payload**: `{ tipo, nome, duracao_minutos }`
- **Resposta**: Serviço criado
- **Regra crítica**: Validar tipo (presencial|online|ficha)

#### PUT /servicos/:id

- **Objetivo**: Atualizar serviço
- **Quem pode chamar**: Professor autenticado (dono do serviço)
- **Payload**: `{ nome?, duracao_minutos? }`
- **Regra crítica**: NÃO permitir alterar tipo (criar novo serviço)

#### DELETE /servicos/:id

- **Objetivo**: Excluir serviço
- **Quem pode chamar**: Professor autenticado (dono do serviço)
- **Regra crítica**: Verificar se há contratos/sessões vinculados

---

### 2.4 Contratos

#### GET /contratos

- **Objetivo**: Listar contratos do professor
- **Quem pode chamar**: Professor autenticado
- **Filtros opcionais**: `?aluno_id=X&status=ativo`
- **Resposta**: Array de contratos com dados de aluno e serviço
- **Regra crítica**: Filtrar por `professor_id`

#### POST /contratos

- **Objetivo**: Criar novo contrato mensal
- **Quem pode chamar**: Professor autenticado
- **Payload**: `{ aluno_id, servico_id, data_inicio, valor_mensal }`
- **Resposta**: Contrato criado com `data_vencimento` calculada
- **Regra crítica**: Calcular vencimento = data_inicio + 1 mês

#### PUT /contratos/:id

- **Objetivo**: Atualizar contrato (renovar, alterar valor)
- **Quem pode chamar**: Professor autenticado (dono do contrato)
- **Payload**: `{ valor_mensal?, data_vencimento?, status? }`
- **Regra crítica**: Validar que contrato pertence ao professor

#### DELETE /contratos/:id

- **Objetivo**: Cancelar contrato
- **Quem pode chamar**: Professor autenticado (dono do contrato)
- **Regra crítica**: Alterar status para `cancelado`, não deletar fisicamente

---

### 2.5 Sessões / Agenda

#### GET /sessoes

- **Objetivo**: Listar sessões do professor
- **Quem pode chamar**: Professor autenticado
- **Filtros obrigatórios**: `?data_inicio=YYYY-MM-DD&data_fim=YYYY-MM-DD`
- **Filtros opcionais**: `?aluno_id=X&status=agendada`
- **Resposta**: Array de sessões com dados de aluno e serviço
- **Regra crítica**: Filtrar por `professor_id` e intervalo de datas

#### POST /sessoes

- **Objetivo**: Criar sessão(ões)
- **Quem pode chamar**: Professor autenticado
- **Payload**: `{ aluno_id, servico_id, data_hora_inicio, recorrencia }`
- **Resposta**: Sessão(ões) criada(s)
- **Regra crítica**:
  - Validar sobreposição de horário (presencial e online)
  - Se recorrência = semanal, criar múltiplas sessões (ex: próximos 3 meses)
  - Calcular `data_hora_fim` = `data_hora_inicio` + `duracao_minutos` do serviço

#### PUT /sessoes/:id/cancelar

- **Objetivo**: Cancelar sessão
- **Quem pode chamar**: Professor autenticado (dono da sessão)
- **Payload**: `{ cancelar_futuras: boolean }` (se recorrente)
- **Resposta**: Sessão(ões) cancelada(s)
- **Regra crítica**: Se `cancelar_futuras=true`, cancelar todas sessões futuras da mesma recorrência

#### PUT /sessoes/:id/remarcar

- **Objetivo**: Remarcar sessão
- **Quem pode chamar**: Professor autenticado (dono da sessão)
- **Payload**: `{ nova_data_hora_inicio }`
- **Resposta**: Nova sessão criada, antiga marcada como `remarcada`
- **Regra crítica**:
  - Validar sobreposição no novo horário
  - Criar nova sessão vinculada à original
  - Alterar status da original para `remarcada`

#### PUT /sessoes/:id/concluir

- **Objetivo**: Marcar sessão como concluída
- **Quem pode chamar**: Professor autenticado (dono da sessão)
- **Resposta**: Sessão atualizada
- **Regra crítica**: Apenas sessões `agendadas` podem ser concluídas

---

### 2.6 Notificações

#### GET /notificacoes

- **Objetivo**: Listar histórico de notificações enviadas
- **Quem pode chamar**: Professor autenticado
- **Filtros opcionais**: `?tipo=lembrete_sessao&status=enviado`
- **Resposta**: Array de NotificaçãoLog
- **Regra crítica**: Filtrar por `professor_id`

#### POST /notificacoes/testar

- **Objetivo**: Enviar notificação de teste (para debug)
- **Quem pode chamar**: Professor autenticado
- **Payload**: `{ aluno_id, mensagem }`
- **Resposta**: Status de envio
- **Regra crítica**: Registrar em NotificaçãoLog com tipo `teste`

---

### 2.7 WhatsApp (Comandos)

#### POST /webhook/whatsapp

- **Objetivo**: Receber webhooks da Evolution API
- **Quem pode chamar**: Evolution API (validar IP ou token)
- **Payload**: `{ from, body, ... }` (formato Evolution)
- **Resposta**: `200 OK`
- **Regra crítica**:
  - Identificar professor pelo número `from`
  - Processar comandos: HOJE, AMANHÃ, SEMANA, VENCIMENTOS
  - Enviar resposta via Evolution API
  - NÃO processar mensagens de alunos (apenas professor)

#### POST /whatsapp/enviar (interno, não exposto)

- **Objetivo**: Enviar mensagem via Evolution API
- **Quem pode chamar**: Backend (jobs cron, comandos)
- **Payload**: `{ destinatario, mensagem }`
- **Resposta**: Status de envio
- **Regra crítica**: Registrar em NotificaçãoLog antes de enviar

---

## 3️⃣ FLUXOS PRINCIPAIS (PASSO A PASSO)

### 3.1 Cadastro de Aluno (Manual)

1. Professor acessa frontend → tela "Alunos" → botão "Novo Aluno"
2. Frontend exibe formulário: nome, telefone WhatsApp, checkbox "Ativar notificações"
3. Professor preenche e clica "Salvar"
4. Frontend → `POST /alunos` com payload
5. Backend valida:
   - JWT válido?
   - Campos obrigatórios preenchidos?
   - Telefone no formato válido?
6. Backend extrai `professor_id` do JWT
7. Backend → `INSERT` no Supabase (tabela `alunos`)
8. Supabase retorna aluno criado
9. Backend → retorna aluno ao frontend
10. Frontend exibe mensagem de sucesso e atualiza lista

---

### 3.2 Importação de Alunos via CSV

1. Professor acessa frontend → tela "Alunos" → botão "Importar CSV"
2. Frontend exibe upload de arquivo
3. Professor seleciona arquivo CSV (formato: `nome,telefone_whatsapp,notificacoes_ativas`)
4. Frontend → `POST /alunos/importar-csv` com arquivo
5. Backend valida:
   - JWT válido?
   - Arquivo é CSV?
   - Colunas corretas?
6. Backend processa linha por linha:
   - Valida formato de telefone
   - Verifica duplicação (mesmo telefone + mesmo professor)
   - Se válido: `INSERT` no Supabase
   - Se inválido: adiciona a lista de erros
7. Backend retorna: `{ importados: N, erros: [...] }`
8. Frontend exibe resumo: "X alunos importados, Y erros"
9. Se houver erros, exibe lista para correção manual

---

### 3.3 Criação de Contrato Mensal

1. Professor acessa frontend → tela "Contratos" → botão "Novo Contrato"
2. Frontend exibe formulário:
   - Selecionar aluno (dropdown)
   - Selecionar serviço (dropdown)
   - Data de início (date picker)
   - Valor mensal (input numérico)
3. Professor preenche e clica "Salvar"
4. Frontend → `POST /contratos` com payload
5. Backend valida:
   - JWT válido?
   - Aluno e serviço pertencem ao professor?
   - Data de início válida?
6. Backend calcula `data_vencimento` = `data_inicio` + 1 mês
7. Backend → `INSERT` no Supabase (tabela `contratos`)
8. Supabase retorna contrato criado
9. Backend → retorna contrato ao frontend
10. Frontend exibe mensagem de sucesso e redireciona para lista de contratos

---

### 3.4 Criação de Sessão Recorrente

1. Professor acessa frontend → tela "Agenda" → botão "Nova Sessão"
2. Frontend exibe formulário:
   - Selecionar aluno
   - Selecionar serviço
   - Data e hora de início (datetime picker)
   - Checkbox "Recorrência semanal"
3. Professor preenche, marca recorrência, clica "Salvar"
4. Frontend → `POST /sessoes` com `{ aluno_id, servico_id, data_hora_inicio, recorrencia: "semanal" }`
5. Backend valida:
   - JWT válido?
   - Aluno e serviço pertencem ao professor?
   - Horário futuro?
6. Backend consulta duração do serviço
7. Backend calcula `data_hora_fim` = `data_hora_inicio` + `duracao_minutos`
8. Backend verifica sobreposição:
   - Query: sessões do mesmo professor no mesmo intervalo de tempo
   - Se tipo do serviço = presencial ou online → bloqueia
   - Se tipo = ficha → permite
9. Se houver sobreposição → retorna erro `409 Conflict`
10. Se OK, backend cria múltiplas sessões:
    - Sessão inicial
    - Sessões futuras (mesmo dia da semana, próximos 3 meses)
11. Backend → `INSERT` múltiplo no Supabase
12. Supabase retorna sessões criadas
13. Backend → retorna sessões ao frontend
14. Frontend atualiza calendário com todas as sessões

---

### 3.5 Cancelamento/Remarcação de Sessão

#### Cancelamento

1. Professor acessa frontend → calendário → clica em sessão → botão "Cancelar"
2. Se sessão é recorrente, frontend exibe modal: "Cancelar apenas esta ou todas futuras?"
3. Professor escolhe e confirma
4. Frontend → `PUT /sessoes/:id/cancelar` com `{ cancelar_futuras: boolean }`
5. Backend valida:
   - JWT válido?
   - Sessão pertence ao professor?
6. Se `cancelar_futuras = true`:
   - Backend busca todas sessões futuras da mesma recorrência
   - Atualiza status de todas para `cancelada`
7. Se `cancelar_futuras = false`:
   - Atualiza apenas a sessão selecionada
8. Backend → `UPDATE` no Supabase
9. Backend → retorna sessões canceladas
10. Frontend atualiza calendário

#### Remarcação

1. Professor acessa frontend → calendário → clica em sessão → botão "Remarcar"
2. Frontend exibe datetime picker com novo horário
3. Professor escolhe novo horário e confirma
4. Frontend → `PUT /sessoes/:id/remarcar` com `{ nova_data_hora_inicio }`
5. Backend valida:
   - JWT válido?
   - Sessão pertence ao professor?
   - Novo horário futuro?
6. Backend verifica sobreposição no novo horário (mesma lógica de criação)
7. Se houver sobreposição → retorna erro `409 Conflict`
8. Se OK:
   - Backend cria nova sessão com novo horário
   - Vincula à sessão original (campo `sessao_original_id`)
   - Atualiza status da original para `remarcada`
9. Backend → `INSERT` nova sessão + `UPDATE` original no Supabase
10. Backend → retorna nova sessão
11. Frontend atualiza calendário (remove original, adiciona nova)

---

### 3.6 Resumo Diário às 06:00

1. Cron interno do backend executa job às 06:00 (America/Sao_Paulo)
2. Backend consulta Supabase:
   - Todos os professores ativos
3. Para cada professor:
   a. Backend consulta sessões do dia (status = agendada)
   b. Se houver sessões:
      - Backend monta mensagem formatada:

        ```
        Bom dia! Suas sessões de hoje:
        - 08:00 - João Silva (Treino Presencial)
        - 10:00 - Maria Santos (Treino Online)
        Total: 2 sessões
        ```

   c. Backend verifica se já enviou resumo hoje (consulta NotificaçãoLog)
   d. Se já enviou → pula
   e. Se não enviou:
      - Backend → `POST` para Evolution API (enviar para WhatsApp do professor)
      - Backend registra em NotificaçãoLog:
        - `tipo = resumo_diario`
        - `aluno_id = null` (é para o professor)
        - `status = enviado` ou `falha`
4. Job finaliza

---

### 3.7 Lembrete de Sessão

1. Cron interno do backend executa job a cada 15 minutos
2. Backend consulta Supabase:
   - Sessões nas próximas X horas (ex: 2 horas)
   - Status = agendada
   - Alunos com `notificacoes_ativas = true`
3. Para cada sessão:
   a. Backend verifica se já enviou lembrete (consulta NotificaçãoLog)
   b. Se já enviou → pula
   c. Se não enviou:
      - Backend monta mensagem:

        ```
        Olá [Nome do Aluno]! Lembrete: você tem treino hoje às [HH:MM] com [Nome do Professor].
        ```

      - Backend → `POST` para Evolution API (enviar para WhatsApp do aluno)
      - Backend registra em NotificaçãoLog:
        - `tipo = lembrete_sessao`
        - `aluno_id = [id do aluno]`
        - `sessao_id = [id da sessão]`
        - `status = enviado` ou `falha`
4. Job finaliza

---

### 3.8 Lembrete de Vencimento

1. Cron interno do backend executa job diariamente às 09:00
2. Backend consulta Supabase:
   - Contratos com vencimento nos próximos Y dias (ex: 3 dias)
   - Status = ativo
   - Alunos com `notificacoes_ativas = true`
3. Para cada contrato:
   a. Backend verifica se já enviou lembrete de vencimento (consulta NotificaçãoLog)
   b. Se já enviou → pula
   c. Se não enviou:
      - Backend monta mensagem:

        ```
        Olá [Nome do Aluno]! Seu contrato de [Nome do Serviço] vence em [X dias] ([Data]). Valor: R$ [Valor].
        ```

      - Backend → `POST` para Evolution API (enviar para WhatsApp do aluno)
      - Backend registra em NotificaçãoLog:
        - `tipo = vencimento_contrato`
        - `aluno_id = [id do aluno]`
        - `contrato_id = [id do contrato]`
        - `status = enviado` ou `falha`
4. Job finaliza

---

### 3.9 Comando WhatsApp: HOJE

1. Professor envia mensagem "HOJE" via WhatsApp
2. Evolution API → `POST /webhook/whatsapp` com payload:

   ```json
   {
     "from": "5511999999999",
     "body": "HOJE"
   }
   ```

3. Backend recebe webhook
4. Backend identifica professor pelo número `from`:
   - Consulta Supabase: `SELECT * FROM professores WHERE telefone_whatsapp = '5511999999999'`
5. Se professor não encontrado → ignora mensagem
6. Se encontrado:
   a. Backend consulta sessões do dia:
      - `SELECT * FROM sessoes WHERE professor_id = X AND data_hora_inicio::date = CURRENT_DATE AND status = 'agendada'`
   b. Backend monta resposta formatada:

      ```
      Suas sessões de hoje:
      - 08:00 - João Silva (Treino Presencial)
      - 10:00 - Maria Santos (Treino Online)
      Total: 2 sessões
      ```

   c. Se não houver sessões: "Você não tem sessões agendadas para hoje."
7. Backend → `POST` para Evolution API (enviar resposta ao professor)
8. Backend registra em NotificaçãoLog (tipo = comando_whatsapp)
9. Backend retorna `200 OK` ao webhook

---

### 3.10 Comando WhatsApp: SEMANA

1. Professor envia mensagem "SEMANA" via WhatsApp
2. Evolution API → `POST /webhook/whatsapp` com payload
3. Backend recebe webhook
4. Backend identifica professor (mesma lógica do HOJE)
5. Backend consulta sessões da semana:
   - `SELECT * FROM sessoes WHERE professor_id = X AND data_hora_inicio BETWEEN [início da semana] AND [fim da semana] AND status = 'agendada'`
6. Backend agrupa por dia e monta resposta:

   ```
   Suas sessões desta semana:
   
   Segunda (10/02):
   - 08:00 - João Silva
   - 10:00 - Maria Santos
   
   Quarta (12/02):
   - 14:00 - Pedro Oliveira
   
   Total: 3 sessões
   ```

7. Backend → `POST` para Evolution API (enviar resposta)
8. Backend registra em NotificaçãoLog
9. Backend retorna `200 OK`

---

## 4️⃣ POLÍTICAS DE SEGURANÇA E ISOLAMENTO

### 4.1 Identificação do Professor

**Mecanismo:** JWT (JSON Web Token)

**Fluxo:**

1. Professor faz login → Backend valida credenciais via Supabase Auth
2. Supabase retorna JWT contendo:
   - `sub` (subject): `professor_id`
   - `email`
   - `exp` (expiration): timestamp de expiração
3. Frontend armazena JWT (localStorage ou cookie httpOnly)
4. Toda requisição ao backend inclui header: `Authorization: Bearer <JWT>`
5. Backend valida JWT:
   - Assinatura válida?
   - Não expirado?
   - Extrai `professor_id` do payload

**Regra crítica:**

- JWT é a ÚNICA fonte de verdade para identificação
- Backend NUNCA confia em `professor_id` enviado no body da requisição

---

### 4.2 Isolamento por professor_id (Multi-tenancy)

**Camadas de proteção:**

#### 4.2.1 Backend (Validação de Aplicação)

- Todo endpoint que acessa recursos (alunos, sessões, etc.) DEVE:
  1. Extrair `professor_id` do JWT
  2. Adicionar filtro `WHERE professor_id = X` em TODAS as queries
  3. Validar que recursos acessados pertencem ao professor

**Exemplo:**

```
Requisição: PUT /alunos/123
1. Backend extrai professor_id = 456 do JWT
2. Backend executa: UPDATE alunos SET ... WHERE id = 123 AND professor_id = 456
3. Se nenhuma linha afetada → retorna 404 (aluno não existe ou não pertence ao professor)
```

#### 4.2.2 Supabase (Row Level Security - RLS)

- Políticas RLS no banco de dados como camada adicional de segurança
- Exemplo de política para tabela `alunos`:

  ```
  Política: "Professores só veem seus alunos"
  Condição: professor_id = auth.uid()
  ```

- RLS é BACKUP de segurança (não substitui validação no backend)

**Regra crítica:**

- Backend é responsável primário por isolamento
- RLS é camada adicional de defesa (defense in depth)

---

### 4.3 Onde a Validação Acontece

| Validação | Backend | Banco (RLS) | Frontend |
|-----------|---------|-------------|----------|
| JWT válido | ✅ Obrigatório | ❌ | ❌ |
| Sobreposição de horário | ✅ Obrigatório | ❌ | ⚠️ Apenas UX |
| Campos obrigatórios | ✅ Obrigatório | ✅ Constraints | ⚠️ Apenas UX |
| Isolamento multi-tenant | ✅ Obrigatório | ✅ RLS | ❌ |
| Formato de dados | ✅ Obrigatório | ✅ Tipos | ⚠️ Apenas UX |

**Legenda:**

- ✅ Obrigatório: Validação crítica, DEVE ser implementada
- ⚠️ Apenas UX: Melhora experiência, mas não é segurança
- ❌ Não aplicável

---

### 4.4 Como Evitar Acesso Cruzado

**Cenário de ataque:**

- Professor A (id=1) tenta acessar aluno do Professor B (id=2)
- Requisição maliciosa: `GET /alunos/999` (aluno pertence ao Professor B)

**Proteção:**

1. Backend extrai `professor_id = 1` do JWT
2. Backend executa: `SELECT * FROM alunos WHERE id = 999 AND professor_id = 1`
3. Query retorna vazio (aluno 999 não pertence ao professor 1)
4. Backend retorna `404 Not Found`

**Regra crítica:**

- NUNCA retornar `403 Forbidden` (revela que recurso existe)
- SEMPRE retornar `404 Not Found` (recurso não existe OU não pertence ao usuário)

---

## 5️⃣ REGRAS DE IDEMPOTÊNCIA E CONSISTÊNCIA

### 5.1 Evitar Notificações Duplicadas

**Problema:**

- Job cron executa a cada 15 minutos
- Sessão às 10:00, lembrete deve ser enviado às 08:00
- Job pode executar às 08:00, 08:15, 08:30... → risco de enviar múltiplas vezes

**Solução:**

1. Antes de enviar notificação, backend consulta NotificaçãoLog:

   ```
   SELECT * FROM notificacoes_log
   WHERE tipo = 'lembrete_sessao'
   AND sessao_id = X
   AND status = 'enviado'
   ```

2. Se encontrar registro → pula (já enviado)
3. Se não encontrar:
   a. Backend envia notificação via Evolution API
   b. Backend registra em NotificaçãoLog com `status = enviado`

**Regra crítica:**

- Registro em NotificaçãoLog é ATÔMICO com envio
- Se envio falhar, registrar com `status = falha` (permite retry)

---

### 5.2 Evitar Criação Duplicada de Sessões

**Problema:**

- Professor clica "Salvar" múltiplas vezes rapidamente
- Requisições paralelas podem criar sessões duplicadas

**Solução:**

1. Frontend desabilita botão após primeiro clique (UX)
2. Backend valida sobreposição (já impede duplicação exata)
3. Opcional: Implementar idempotency key:
   - Frontend gera UUID único por requisição
   - Envia no header: `Idempotency-Key: <UUID>`
   - Backend armazena chave processada em cache (Redis ou tabela)
   - Se receber mesma chave → retorna resultado anterior sem reprocessar

**Regra crítica:**

- Validação de sobreposição já protege contra duplicação
- Idempotency key é opcional (melhoria futura)

---

### 5.3 Lidar com Retry de Webhook do WhatsApp

**Problema:**

- Evolution API envia webhook
- Backend processa e responde, mas resposta se perde na rede
- Evolution reenvia webhook (retry)

**Solução:**

1. Backend armazena `webhook_id` (se Evolution fornecer) ou gera hash do payload
2. Antes de processar webhook:

   ```
   SELECT * FROM webhooks_processados WHERE webhook_id = X
   ```

3. Se encontrar → retorna `200 OK` sem reprocessar
4. Se não encontrar:
   a. Processa webhook (comando HOJE, etc.)
   b. Registra em `webhooks_processados`
   c. Retorna `200 OK`

**Regra crítica:**

- Webhooks DEVEM ser idempotentes
- Sempre retornar `200 OK` (mesmo se já processado)

---

### 5.4 Garantir que Jobs Cron São Seguros

**Problema:**

- Job cron executa às 06:00
- Processamento demora 5 minutos
- Próxima execução às 06:00 do dia seguinte pode sobrepor

**Solução:**

1. Implementar lock distribuído (se múltiplas instâncias do backend):
   - Antes de executar job, tentar adquirir lock (Redis, banco)
   - Se lock já existe → pula execução
   - Se adquirir lock → executa job → libera lock
2. Se instância única:
   - Verificar se job anterior finalizou antes de iniciar novo

**Regra crítica:**

- Jobs DEVEM ser idempotentes (executar 2x não causa problema)
- Usar flag `processado_em` em registros para evitar reprocessamento

**Exemplo (Resumo Diário):**

```
SELECT * FROM notificacoes_log
WHERE tipo = 'resumo_diario'
AND professor_id = X
AND DATE(enviado_em) = CURRENT_DATE
```

Se encontrar → já enviou hoje → pula

---

## 6️⃣ O QUE NÃO FAZER (ANTI-PADRÕES)

### 6.1 ❌ Lógica Crítica no Frontend

**Proibido:**

- Validar sobreposição de horário no frontend
- Calcular vencimento de contrato no frontend
- Decidir se notificação deve ser enviada

**Permitido:**

- Validação de UX (campos obrigatórios, formato de telefone)
- Feedback visual (desabilitar botão, loading)

**Motivo:**

- Frontend pode ser manipulado (DevTools, Postman)
- Lógica crítica DEVE estar no backend

---

### 6.2 ❌ Decisões no WhatsApp

**Proibido:**

- WhatsApp processar lógica de negócio
- WhatsApp armazenar dados
- WhatsApp ser fonte de verdade

**Permitido:**

- WhatsApp receber comandos simples (HOJE, SEMANA)
- WhatsApp enviar notificações

**Motivo:**

- WhatsApp é canal auxiliar
- Se cair, sistema continua funcionando

---

### 6.3 ❌ Triggers SQL Complexas

**Proibido:**

- Trigger que cria sessões recorrentes automaticamente
- Trigger que envia notificações
- Trigger que calcula vencimentos

**Permitido:**

- Trigger para auditoria (created_at, updated_at)
- Constraints de integridade (NOT NULL, UNIQUE)

**Motivo:**

- Triggers são difíceis de debugar
- Lógica de negócio DEVE estar no backend (visível, testável)

---

### 6.4 ❌ Dependência de Automações Externas

**Proibido:**

- Usar Zapier/Make para lógica crítica
- Depender de N8N para criar sessões
- Usar Google Sheets como banco de dados

**Permitido:**

- Usar ferramentas externas para integrações opcionais (ex: enviar email via SendGrid)

**Motivo:**

- Automações externas são pontos de falha
- Sistema DEVE funcionar independentemente

---

### 6.5 ❌ Múltiplas APIs Espalhadas

**Proibido:**

- Frontend chamar Supabase diretamente
- Frontend chamar Evolution API diretamente
- Criar API separada para notificações

**Permitido:**

- Backend único e centralizado
- Backend orquestra todas integrações

**Motivo:**

- Múltiplas APIs dificultam debug
- Backend centralizado facilita manutenção e segurança

---

### 6.6 ❌ Armazenar Senhas em Texto Plano

**Proibido:**

- Armazenar senha do professor sem hash
- Armazenar credenciais da Evolution API no código

**Permitido:**

- Usar Supabase Auth (hash automático)
- Armazenar credenciais em variáveis de ambiente

**Motivo:**

- Segurança básica

---

### 6.7 ❌ Expor professor_id no Frontend

**Proibido:**

- Enviar `professor_id` no body da requisição
- Confiar em `professor_id` enviado pelo frontend

**Permitido:**

- Extrair `professor_id` do JWT no backend

**Motivo:**

- Frontend pode ser manipulado
- JWT é fonte de verdade

---

### 6.8 ❌ Deletar Dados Fisicamente

**Proibido:**

- `DELETE FROM alunos WHERE id = X`
- `DELETE FROM sessoes WHERE id = X`

**Permitido:**

- Soft delete: `UPDATE alunos SET deleted_at = NOW() WHERE id = X`
- Filtrar em queries: `WHERE deleted_at IS NULL`

**Motivo:**

- Auditoria e recuperação de dados
- Histórico de notificações depende de dados antigos

---

### 6.9 ❌ Notificações Sem Registro

**Proibido:**

- Enviar notificação sem registrar em NotificaçãoLog
- Enviar notificação e registrar depois (não atômico)

**Permitido:**

- Registrar em NotificaçãoLog ANTES de enviar
- Atualizar status após envio (enviado/falha)

**Motivo:**

- Auditoria e debug
- Evitar duplicação

---

### 6.10 ❌ Hardcoded de Configurações

**Proibido:**

- Hardcoded de URLs (Evolution API, Supabase)
- Hardcoded de horários de jobs (06:00, 09:00)
- Hardcoded de intervalos de lembrete (2 horas antes)

**Permitido:**

- Variáveis de ambiente para URLs e credenciais
- Tabela de configurações para horários e intervalos

**Motivo:**

- Flexibilidade para mudanças sem redeploy
- Diferentes ambientes (dev, staging, prod)

---

## 7️⃣ RESUMO EXECUTIVO

Este contrato define:

✅ **7 entidades principais** com responsabilidades claras  
✅ **25+ endpoints REST** agrupados por domínio  
✅ **10 fluxos principais** detalhados passo a passo  
✅ **Políticas de segurança** multi-tenant com JWT e RLS  
✅ **Regras de idempotência** para notificações e jobs cron  
✅ **10 anti-padrões** explicitamente proibidos

**Próximos passos (FORA DO ESCOPO DESTE DOCUMENTO):**

1. Implementar DDL do banco (Supabase)
2. Implementar endpoints do backend
3. Implementar frontend
4. Configurar Evolution API
5. Configurar jobs cron
6. Deploy no EasyPanel

---

**Documento validado por:** Arquiteto de Contrato de Sistema  
**Data:** 07/02/2026  
**Versão:** 1.0 (Final)  
**Status:** Pronto para implementação automática
