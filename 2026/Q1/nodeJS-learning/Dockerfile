# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY src ./src

# Build TypeScript
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Install curl for health checks
RUN apk add --no-cache curl python3 make g++

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install all dependencies
RUN npm ci

# Copy source code
COPY src ./src

# Create uploads directory
RUN mkdir -p /app/uploads

# Expose port
EXPOSE 3000

# Set NODE_ENV
ENV NODE_ENV=development

# Health check
HEALTHCHECK --interval=10s --timeout=5s --retries=5 --start-period=30s \
  CMD curl -f http://localhost:3000/api/health || exit 1

# Start application with ts-node to handle path aliases
CMD ["npx", "ts-node", "-r", "tsconfig-paths/register", "src/index.ts"]
