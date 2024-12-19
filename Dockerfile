# Use the latest LTS version of Node.js
FROM node:23.4-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 7777
 
CMD ["npm", "run", "dev"]