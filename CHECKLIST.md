# Checklist de Validação - Personal Agenda

## ✅ FASE 1: Banco de Dados (Supabase)

### Estrutura

- [ ] Tabela `professores` criada
- [ ] Tabela `alunos` criada com constraint unique (professor_id, telefone_whatsapp)
- [ ] Tabela `servicos` criada com enum tipo_servico
- [ ] Tabela `contratos` criada
- [ ] Tabela `sessoes` criada
- [ ] Tabela `notification_log` criada
- [ ] Tabela `webhooks_processados` criada

### RLS (Row Level Security)

- [ ] RLS habilitado em todas as tabelas
- [ ] Policy de professores funcionando
- [ ] Policy de alunos funcionando
- [ ] Policy de serviços funcionando
- [ ] Policy de contratos funcionando
- [ ] Policy de sessões funcionando

### Funções

- [ ] Função `normalizar_telefone()` criada
- [ ] Função `importar_alunos_csv()` criada
- [ ] Função `update_updated_at_column()` criada
- [ ] Triggers de updated_at funcionando

### Views

- [ ] View `v_sessoes_detalhadas` criada
- [ ] View `v_contratos_vencendo` criada

### Dados Iniciais

- [ ] Primeiro professor criado via Supabase Auth
- [ ] Professor inserido na tabela `professores`
- [ ] Telefone do professor no formato E.164

---

## ✅ FASE 2: Backend (API REST)

### Configuração

- [ ] Variáveis de ambiente configuradas
- [ ] Conexão com Supabase funcionando
- [ ] Conexão com Evolution API funcionando
- [ ] Endpoint `/health` respondendo

### Autenticação

- [ ] POST `/auth/login` funcionando
- [ ] JWT sendo gerado corretamente
- [ ] Middleware de autenticação validando token
- [ ] POST `/auth/logout` funcionando
- [ ] POST `/auth/recuperar-senha` funcionando

### Alunos

- [ ] GET `/alunos` listando apenas alunos do professor
- [ ] POST `/alunos` criando aluno
- [ ] PUT `/alunos/:id` atualizando aluno
- [ ] DELETE `/alunos/:id` fazendo soft delete
- [ ] POST `/alunos/importar-csv` importando CSV
- [ ] Normalização de telefone funcionando
- [ ] Validação de duplicação por telefone

### Serviços

- [ ] GET `/servicos` listando serviços
- [ ] POST `/servicos` criando serviço
- [ ] Validação de tipo (presencial, online, ficha)
- [ ] PUT `/servicos/:id` atualizando serviço
- [ ] DELETE `/servicos/:id` fazendo soft delete

### Contratos

- [ ] GET `/contratos` listando contratos
- [ ] POST `/contratos` criando contrato
- [ ] Cálculo automático de vencimento (+ 1 mês)
- [ ] PUT `/contratos/:id` atualizando contrato
- [ ] DELETE `/contratos/:id` cancelando contrato

### Sessões

- [ ] GET `/sessoes` listando sessões
- [ ] POST `/sessoes` criando sessão única
- [ ] POST `/sessoes` criando sessões recorrentes (semanal)
- [ ] Validação de conflito de horário funcionando
- [ ] Presencial e online bloqueando agenda
- [ ] Ficha NÃO bloqueando agenda
- [ ] PUT `/sessoes/:id/cancelar` cancelando sessão única
- [ ] PUT `/sessoes/:id/cancelar` cancelando sessões futuras
- [ ] PUT `/sessoes/:id/remarcar` remarcando sessão
- [ ] Validação de conflito na remarcação
- [ ] PUT `/sessoes/:id/concluir` concluindo sessão

### Notificações

- [ ] GET `/notificacoes` listando histórico
- [ ] POST `/notificacoes/testar` enviando teste

### Webhook WhatsApp

- [ ] POST `/webhook/whatsapp` recebendo webhooks
- [ ] Identificação de professor por telefone
- [ ] Comando HOJE funcionando
- [ ] Comando AMANHÃ funcionando
- [ ] Comando SEMANA funcionando
- [ ] Comando VENCIMENTOS funcionando
- [ ] Mensagens de alunos sendo ignoradas
- [ ] Idempotência de webhook (hash)
- [ ] Registro em `webhooks_processados`

---

## ✅ FASE 3: Jobs Cron

### Resumo Diário

- [ ] Job agendado para 06:00
- [ ] Timezone America/Sao_Paulo configurado
- [ ] Busca sessões do dia
- [ ] Envia mensagem para professor
- [ ] Registra em `notification_log`
- [ ] Idempotência (não envia duplicado)

### Lembrete de Sessão

- [ ] Job executando a cada 15 minutos
- [ ] Busca sessões nas próximas 2 horas
- [ ] Verifica `notificacoes_ativas` do aluno
- [ ] Envia mensagem para aluno
- [ ] Registra em `notification_log`
- [ ] Idempotência (não envia duplicado)

### Lembrete de Vencimento

- [ ] Job agendado para 09:00
- [ ] Busca contratos vencendo em 3 dias
- [ ] Verifica `notificacoes_ativas` do aluno
- [ ] Envia mensagem para aluno
- [ ] Registra em `notification_log`
- [ ] Idempotência (não envia duplicado)

---

## ✅ FASE 4: Frontend (Web App)

### Configuração

- [ ] Variáveis de ambiente configuradas
- [ ] API client configurado
- [ ] Interceptors de autenticação funcionando

### Telas Essenciais

- [ ] Tela de Login
- [ ] Dashboard
- [ ] Lista de Alunos
- [ ] Formulário de Aluno
- [ ] Importação CSV
- [ ] Lista de Serviços
- [ ] Formulário de Serviço
- [ ] Lista de Contratos
- [ ] Formulário de Contrato
- [ ] Agenda (visualização)
- [ ] Formulário de Sessão
- [ ] Configurações

### Funcionalidades

- [ ] Login e logout
- [ ] Redirecionamento após login
- [ ] Proteção de rotas autenticadas
- [ ] CRUD de alunos
- [ ] Upload de CSV
- [ ] CRUD de serviços
- [ ] CRUD de contratos
- [ ] Criação de sessão única
- [ ] Criação de sessão recorrente
- [ ] Cancelamento de sessão
- [ ] Remarcação de sessão
- [ ] Visualização de notificações

### Responsividade

- [ ] Layout responsivo (desktop)
- [ ] Layout responsivo (mobile)

---

## ✅ FASE 5: Integração Evolution API

### Configuração

- [ ] Instância criada
- [ ] QR Code escaneado
- [ ] WhatsApp conectado
- [ ] Token da instância configurado no backend

### Webhook

- [ ] Webhook configurado para `https://webhook.smartconverge.com.br/webhook/whatsapp`
- [ ] Eventos `message.received` ativados
- [ ] Webhook recebendo mensagens

### Envio de Mensagens

- [ ] Backend consegue enviar mensagens
- [ ] Mensagens chegando no WhatsApp
- [ ] Formato de telefone E.164 funcionando

---

## ✅ FASE 6: Deploy (EasyPanel)

### Backend

- [ ] Serviço criado no EasyPanel
- [ ] Dockerfile buildando corretamente
- [ ] Variáveis de ambiente configuradas
- [ ] Porta 3000 exposta
- [ ] Domínio `api.smartconverge.com.br` configurado
- [ ] Domínio `webhook.smartconverge.com.br` configurado
- [ ] SSL/HTTPS funcionando
- [ ] Health check respondendo

### Frontend

- [ ] Serviço criado no EasyPanel
- [ ] Dockerfile buildando corretamente
- [ ] Variável `NEXT_PUBLIC_API_URL` configurada
- [ ] Porta 3000 exposta
- [ ] Domínio `app.smartconverge.com.br` configurado
- [ ] SSL/HTTPS funcionando
- [ ] Aplicação carregando

### Logs

- [ ] Logs do backend visíveis
- [ ] Logs do frontend visíveis
- [ ] Erros sendo capturados

---

## ✅ FASE 7: Testes de Validação

### 1. Login

- [ ] Acessar `https://app.smartconverge.com.br`
- [ ] Fazer login com credenciais do professor
- [ ] Verificar redirecionamento para dashboard
- [ ] Verificar token armazenado no localStorage

### 2. Cadastro Manual de Aluno

- [ ] Acessar tela de Alunos
- [ ] Clicar em "Novo Aluno"
- [ ] Preencher nome e telefone
- [ ] Marcar "Ativar notificações"
- [ ] Salvar
- [ ] Verificar aluno na lista
- [ ] Verificar telefone normalizado no banco

### 3. Importação CSV

- [ ] Criar arquivo CSV com formato correto
- [ ] Acessar tela de Alunos
- [ ] Clicar em "Importar CSV"
- [ ] Selecionar arquivo
- [ ] Verificar resumo de importação
- [ ] Verificar alunos importados na lista
- [ ] Verificar que alunos duplicados foram atualizados

### 4. Criação de Contrato

- [ ] Acessar tela de Contratos
- [ ] Clicar em "Novo Contrato"
- [ ] Selecionar aluno
- [ ] Selecionar serviço
- [ ] Definir data de início
- [ ] Definir valor mensal
- [ ] Salvar
- [ ] Verificar contrato criado
- [ ] Verificar data de vencimento calculada (+1 mês)

### 5. Criação de Sessões Recorrentes

- [ ] Acessar Agenda
- [ ] Clicar em "Nova Sessão"
- [ ] Selecionar aluno
- [ ] Selecionar serviço (presencial ou online)
- [ ] Definir data/hora de início
- [ ] Marcar "Recorrência semanal"
- [ ] Salvar
- [ ] Verificar múltiplas sessões criadas (próximos 3 meses)
- [ ] Verificar sessões no mesmo dia da semana

### 6. Bloqueio de Conflito de Horário

- [ ] Criar sessão presencial às 10:00
- [ ] Tentar criar sessão online às 10:00 (mesmo dia)
- [ ] Verificar erro 409 Conflict
- [ ] Verificar mensagem de erro clara
- [ ] Criar sessão ficha às 10:00 (deve permitir)

### 7. Cancelamento de Sessão

- [ ] Selecionar sessão recorrente
- [ ] Clicar em "Cancelar"
- [ ] Escolher "Apenas esta"
- [ ] Verificar apenas uma sessão cancelada
- [ ] Selecionar outra sessão recorrente
- [ ] Escolher "Todas futuras"
- [ ] Verificar todas as futuras canceladas

### 8. Remarcação de Sessão

- [ ] Selecionar sessão
- [ ] Clicar em "Remarcar"
- [ ] Escolher novo horário
- [ ] Salvar
- [ ] Verificar nova sessão criada
- [ ] Verificar sessão original com status "remarcada"

### 9. Resumo Diário

- [ ] Criar sessões para hoje
- [ ] Aguardar 06:00 (ou ajustar cron para teste)
- [ ] Verificar mensagem WhatsApp recebida pelo professor
- [ ] Verificar formato da mensagem
- [ ] Verificar registro em `notification_log`
- [ ] Verificar que não envia duplicado

### 10. Lembrete de Sessão

- [ ] Criar sessão para daqui a 2 horas
- [ ] Ativar notificações do aluno
- [ ] Aguardar job executar (a cada 15 min)
- [ ] Verificar mensagem WhatsApp recebida pelo aluno
- [ ] Verificar registro em `notification_log`
- [ ] Verificar que não envia duplicado

### 11. Lembrete de Vencimento

- [ ] Criar contrato vencendo em 3 dias
- [ ] Ativar notificações do aluno
- [ ] Aguardar 09:00 (ou ajustar cron para teste)
- [ ] Verificar mensagem WhatsApp recebida pelo aluno
- [ ] Verificar registro em `notification_log`
- [ ] Verificar que não envia duplicado

### 12. Comandos WhatsApp - HOJE

- [ ] Criar sessões para hoje
- [ ] Enviar "HOJE" pelo WhatsApp do professor
- [ ] Verificar resposta com lista de sessões
- [ ] Verificar formato da resposta
- [ ] Verificar registro em `notification_log`

### 13. Comandos WhatsApp - AMANHÃ

- [ ] Criar sessões para amanhã
- [ ] Enviar "AMANHÃ" pelo WhatsApp do professor
- [ ] Verificar resposta com lista de sessões
- [ ] Verificar formato da resposta

### 14. Comandos WhatsApp - SEMANA

- [ ] Criar sessões para a semana
- [ ] Enviar "SEMANA" pelo WhatsApp do professor
- [ ] Verificar resposta agrupada por dia
- [ ] Verificar total de sessões

### 15. Comandos WhatsApp - VENCIMENTOS

- [ ] Criar contratos vencendo nos próximos 7 dias
- [ ] Enviar "VENCIMENTOS" pelo WhatsApp do professor
- [ ] Verificar resposta com lista de contratos
- [ ] Verificar dias restantes e valores

### 16. Mensagens de Alunos Ignoradas

- [ ] Enviar mensagem de número não cadastrado
- [ ] Verificar que backend ignora
- [ ] Enviar mensagem de número de aluno
- [ ] Verificar que backend ignora
- [ ] Verificar que apenas professor recebe respostas

### 17. Idempotência de Notificações

- [ ] Forçar reexecução de job de resumo diário
- [ ] Verificar que não envia duplicado
- [ ] Verificar consulta em `notification_log`

### 18. Idempotência de Webhook

- [ ] Enviar mesmo webhook 2 vezes
- [ ] Verificar que processa apenas uma vez
- [ ] Verificar registro em `webhooks_processados`

### 19. Sistema Sem WhatsApp

- [ ] Desconectar Evolution API
- [ ] Acessar sistema web
- [ ] Fazer login
- [ ] Criar aluno
- [ ] Criar sessão
- [ ] Verificar que tudo funciona
- [ ] Verificar que notificações ficam com status "falha"
- [ ] Reconectar Evolution
- [ ] Verificar que sistema volta a enviar

### 20. Multi-tenancy

- [ ] Criar segundo professor no Supabase
- [ ] Fazer login com professor 2
- [ ] Verificar que não vê dados do professor 1
- [ ] Criar aluno para professor 2
- [ ] Fazer login com professor 1
- [ ] Verificar que não vê aluno do professor 2

---

## 📊 Validação Final

### Performance

- [ ] API responde em < 500ms
- [ ] Frontend carrega em < 3s
- [ ] Jobs cron executam sem travar

### Segurança

- [ ] Todas as rotas protegidas com JWT
- [ ] RLS funcionando no Supabase
- [ ] HTTPS em todos os endpoints
- [ ] Senhas hasheadas

### Logs e Monitoramento

- [ ] Logs do backend acessíveis
- [ ] Erros sendo capturados
- [ ] `notification_log` registrando tudo
- [ ] `webhooks_processados` evitando duplicação

### Documentação

- [ ] README.md completo
- [ ] SETUP.md com instruções claras
- [ ] Variáveis de ambiente documentadas
- [ ] Endpoints da API documentados

---

## ✅ Status Final

- [ ] **Todos os testes passaram**
- [ ] **Sistema pronto para produção**
- [ ] **Documentação completa**
- [ ] **Equipe treinada**

---

**Data de Validação:** _**/**_/______  
**Responsável:** _______________________  
**Status:** ⬜ Em andamento | ⬜ Concluído | ⬜ Com pendências
