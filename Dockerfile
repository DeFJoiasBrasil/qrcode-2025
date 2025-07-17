# Usa uma imagem estável do Node.js
FROM node:18

# Define o diretório de trabalho dentro do container
WORKDIR /app

# Copia os arquivos de dependência para o container
COPY package*.json ./

# Instala as dependências
RUN npm install

# Copia o restante dos arquivos da aplicação para dentro do container
COPY . .

# Expõe a porta que o app usará
EXPOSE 8080

# Comando para iniciar a aplicação
CMD ["npm", "start"]
