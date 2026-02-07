# ========================================
# CONFIGURAR WEBHOOK NA EVOLUTION API
# ========================================

## 🎯 O QUE VOCÊ PRECISA FAZER

Depois que o backend estiver rodando, você precisa configurar o webhook na Evolution para receber mensagens do WhatsApp.

---

## 📍 PASSO A PASSO

### 1. Acessar a Evolution API

Acesse: https://evolution.smartconverge.com.br

### 2. Ir para a instância

- Clique na instância **`agendapersonal`**
- Ou vá em **Configurations** → **Webhooks**

### 3. Configurar o Webhook

Preencha os seguintes campos:

**URL do Webhook:**
```
https://webhook.smartconverge.com.br/webhook/whatsapp
```

**Eventos que devem ser capturados:**
- ✅ `messages.upsert` (ou `message.received`)
- ✅ Marque apenas eventos de mensagem recebida

**Método HTTP:**
- POST

**Headers (opcional):**
Se quiser adicionar segurança extra, adicione:
```
X-Webhook-Secret: personal-agenda-webhook-secret-2026
```

### 4. Salvar e Testar

1. Clique em **Salvar**
2. Envie uma mensagem de teste para o WhatsApp conectado
3. Verifique os logs do backend para ver se o webhook está sendo recebido

---

## ✅ VALIDAÇÃO

Para testar se está funcionando:

1. Envie "HOJE" para o WhatsApp: +5511979949100
2. O sistema deve responder com as sessões do dia
3. Se não responder, verifique:
   - Backend está rodando?
   - Webhook configurado corretamente?
   - URL está acessível?

---

## 🔧 TROUBLESHOOTING

### Webhook não está recebendo mensagens

1. Verifique se o backend está rodando
2. Verifique se a URL está acessível (https://webhook.smartconverge.com.br/webhook/whatsapp)
3. Verifique os logs da Evolution API
4. Teste manualmente com curl:

```bash
curl -X POST https://webhook.smartconverge.com.br/webhook/whatsapp \
  -H "Content-Type: application/json" \
  -d '{"test": true}'
```

### Backend responde mas WhatsApp não envia mensagem

1. Verifique se a Evolution está conectada
2. Verifique se o telefone do professor no banco está correto (+5511979949100)
3. Verifique os logs do backend para ver erros de envio

---

**IMPORTANTE:** O webhook só funcionará depois que o backend estiver em produção (deploy feito)!
