FROM node:20-alpine

WORKDIR /app

# Copy package files first for better caching
COPY package.json ./

# Install production dependencies only
RUN npm install --production

# Copy source code and static files
COPY src/ ./src/
COPY public/ ./public/
COPY data/ ./data/

# Expose port 8080
EXPOSE 8080

# Start the server
CMD ["node", "src/server.js"]
