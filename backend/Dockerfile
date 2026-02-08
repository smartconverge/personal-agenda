FROM node:18-alpine

WORKDIR /app

# Copiar package files
COPY package*.json ./

# Instalar dependências
RUN npm install --production

# Copiar código fonte
COPY src ./src

# Expor porta
EXPOSE 3000

# Definir timezone
ENV TZ=America/Sao_Paulo

# Iniciar aplicação
CMD ["node", "src/server.js"]

Fix: Change npm ci to npm install
