FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application files
COPY . .

# Build if needed
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"] 