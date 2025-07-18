FROM node:20-slim

# Install required dependencies for Chromium
RUN apt-get update && apt-get install -y \
  wget \
  ca-certificates \
  fonts-liberation \
  libappindicator3-1 \
  libasound2 \
  libatk-bridge2.0-0 \
  libatk1.0-0 \
  libcups2 \
  libdbus-1-3 \
  libgdk-pixbuf2.0-0 \
  libnspr4 \
  libnss3 \
  libx11-xcb1 \
  libxcomposite1 \
  libxdamage1 \
  libxrandr2 \
  xdg-utils \
  libgbm1 \
  libgtk-3-0 \
  chromium \
  --no-install-recommends && \
  apt-get clean && \
  rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy and install Node dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Compile contracts and build project
RUN \
  # npm run drizzle:generate \
  # && npm run drizzle:migrate \
  npx hardhat compile && npm run build

  # Expose your NestJS port
  EXPOSE 5000

# Set Puppeteer to use installed Chromium
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

# Run app
CMD ["npm", "run", "start:prod"]
