# WhoopsPay Application Dockerfile
# Multi-stage build for optimal production image size

# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files for dependency installation
COPY package*.json ./
COPY tsconfig.json ./
COPY vite.config.ts ./
COPY tailwind.config.ts ./
COPY postcss.config.js ./
COPY components.json ./

# Install all dependencies (including devDependencies for build)
RUN npm ci

# Copy source code
COPY client/ ./client/
COPY server/ ./server/
COPY shared/ ./shared/
COPY data/ ./data/

# Build client first
RUN npx vite build

# Build server with production entry point (no vite imports)
RUN node build-server.js

# Production stage
FROM node:18-alpine AS production

WORKDIR /app

# Install only production dependencies
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/data ./data

# Copy client assets for production serving
COPY --from=builder /app/dist/client ./dist/client

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S whoopspay -u 1001

# Set ownership
RUN chown -R whoopspay:nodejs /app
USER whoopspay

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:5000/api/health', (res) => process.exit(res.statusCode === 200 ? 0 : 1))"

# Start the application
CMD ["npm", "run", "start"]