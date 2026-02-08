FROM node:18-alpine

WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./

# Instalar dependências
RUN npm install

# Copiar todo o código
COPY . .

# Build da aplicação
RUN npm run build

# Expor porta
EXPOSE 3000

# Variável de ambiente
ENV NODE_ENV=production
ENV PORT=3000

# Iniciar aplicação
CMD ["npm", "start"]
