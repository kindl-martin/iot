FROM node:22
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build -w=consumer
CMD ["npm", "run", "start:prod", "-w=consumer"]
