FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN \
  # npm run drizzle:generate \
  # && npm run drizzle:migrate \
  npx hardhat compile \
  && npm run build
EXPOSE 5000
CMD ["npm", "run", "start:prod"]