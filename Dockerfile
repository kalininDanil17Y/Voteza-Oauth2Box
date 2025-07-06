FROM node:20-alpine
WORKDIR /app
RUN apk add --no-cache nano vim
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 8080
CMD ["npm","start"]