# Docker Guide for WhoopsPay

## 🐳 Overview

WhoopsPay includes comprehensive Docker support for consistent development, testing, and deployment environments. The application is containerized with all dependencies and can be deployed to any Docker-compatible platform.

## 📦 Docker Configuration

WhoopsPay includes a production-ready Dockerfile for containerized deployment with SQLite database persistence.

### Dockerfile Structure

The current Dockerfile creates an optimized container for WhoopsPay:

```dockerfile
# Multi-stage build for optimal production image size

# Build stage
FROM node:18-alpine AS builder
WORKDIR /app

# Copy package files and config
COPY package*.json ./
COPY tsconfig.json ./
COPY vite.config.ts ./
COPY tailwind.config.ts ./
COPY postcss.config.js ./
COPY components.json ./

# Install all dependencies (including devDependencies for build)
RUN npm ci

# Copy source code and database
COPY client/ ./client/
COPY server/ ./server/
COPY shared/ ./shared/
COPY data/ ./data/

# Build the application
RUN npm run build

# Production stage
FROM node:18-alpine AS production
WORKDIR /app

# Install production dependencies
COPY package*.json ./
RUN npm ci && npm cache clean --force

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/data ./data
COPY --from=builder /app/server/modules ./server/modules
COPY --from=builder /app/dist/public ./dist/client

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S whoopspay -u 1001

# Set ownership and switch to non-root user
RUN chown -R whoopspay:nodejs /app
USER whoopspay

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:5000/api/health', (res) => process.exit(res.statusCode === 200 ? 0 : 1))"

# Start the application
CMD ["npm", "run", "start"]
```

### Key Features
- **Multi-stage build** for optimized production image size
- **Node.js 18 Alpine** base for minimal footprint and security
- **Non-root user** (whoopspay) for enhanced container security
- **Built-in health checks** for container monitoring
- **SQLite database** with persistent data directory
- **Production build** with Vite-optimized assets
- **Single port deployment** (5000) serving both frontend and backend

## 🚀 Running with Docker

### Local Development

```bash
# Build the Docker image
docker build -t whoopspay:latest .

# Run with environment variables
docker run -p 5000:5000 \
  -e DATABASE_URL="postgresql://user:pass@host:5432/whoopspay" \
  -e NODE_ENV="production" \
  whoopspay:latest

# Run with docker-compose (recommended)
docker-compose up -d
```

### Docker Compose Configuration

For local development and testing with Docker:

```yaml
version: '3.8'

services:
  whoopspay:
    build: .
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - WHOOPSPAY_URL=http://localhost:5000
    volumes:
      - ./data:/app/data  # Persist SQLite database
    restart: unless-stopped

# Note: No separate database service needed - SQLite runs in-process
```

### SQLite Database Persistence
The SQLite database (`data/whoopspay.db`) is persisted using volume mounts to ensure data survives container restarts.

## 🏗️ CI/CD Integration

### GitHub Actions Workflow

The application includes automated Docker builds in the SSDLC pipeline:

```yaml
# Build and push Docker image
- name: Build and push Docker image
  uses: docker/build-push-action@v5
  with:
    context: .
    push: true
    tags: |
      ghaidaris/whoopspay:${{ needs.setup-version.outputs.version }}
      ghaidaris/whoopspay:latest
    cache-from: type=gha
    cache-to: type=gha,mode=max
```

### Automated Pipeline
1. **Security Testing** → Complete 4-phase security analysis
2. **Docker Build** → Multi-platform image creation
3. **Registry Push** → Docker Hub publication
4. **Render Deployment** → Automatic cloud deployment to production

## 🎯 Deployment Options

### Docker Hub Registry
- **Repository**: `ghaidaris/whoopspay`
- **Tags**: Semantic versioning with build timestamps (e.g., `1.0.0_20250913_132216`)
- **Latest Tag**: Always points to the most recent build
- **Auto-build**: Triggered by CI/CD pipeline on every push to main branch

### Supported Deployment Platforms

#### **Container-based Platforms**
Most container platforms can run WhoopsPay using the Docker Hub image:

```bash
# Basic Docker run command
docker run -p 5000:5000 \
  -v $(pwd)/data:/app/data \
  ghaidaris/whoopspay:latest
```

#### **Platform-Specific Examples**

**Render (Automated via CI/CD):**
- Service Type: Web Service  
- Image: `docker.io/ghaidaris/whoopspay:latest`
- Port: 5000
- Add persistent disk for `/app/data` to preserve SQLite database
- **Auto-deployment**: Triggered automatically after successful Docker Hub push
- **Integration**: Uses GitHub Actions with `RENDER_API` and `RENDER_SERVICE_ID` secrets
- **Zero-downtime**: Seamless deployments with health checks

**Railway:**
- Deploy using Docker image from Docker Hub
- Automatically detects port 5000
- Add volume mount for database persistence

**Local Docker:**
- Use docker-compose for development
- Volume mount for database persistence
- Easy local testing environment

## 🔧 Configuration

### Environment Variables

```bash
# Application Settings  
NODE_ENV=production
PORT=5000

# External Services (optional)
WHOOPSPAY_URL=https://your-domain.com
JUICE_SHOP_URL=https://your-juice-shop.com

# Security Settings (Educational)
SESSION_SECRET=your-session-secret

# Note: No DATABASE_URL needed - SQLite runs in-process
# Database file: /app/data/whoopspay.db
```

### Volume Mounts

```bash
# Production with persistent SQLite database
docker run -v $(pwd)/data:/app/data -p 5000:5000 ghaidaris/whoopspay:latest

# Development with full source mount
docker run -v $(pwd):/app -p 5000:5000 whoopspay:dev

# Backup database
docker run --rm -v whoopspay_data:/data -v $(pwd):/backup \
  alpine cp /data/whoopspay.db /backup/
```

## 🔍 Monitoring and Debugging

### Health Checks

The Dockerfile includes built-in health checks:

```dockerfile
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:5000/api/health', (res) => process.exit(res.statusCode === 200 ? 0 : 1))"
```

### Container Logs

```bash
# View application logs
docker logs whoopspay-container

# Follow logs in real-time
docker logs -f whoopspay-container

# View specific time range
docker logs --since="2023-01-01T00:00:00" whoopspay-container
```

### Debug Mode

```bash
# Run container in debug mode
docker run -it --rm \
  -p 5000:5000 \
  -e DEBUG=* \
  whoopspay:latest
```

## 🔒 Security Considerations

### Container Security
- **Non-root user**: Application runs as unprivileged user
- **Minimal base image**: Alpine Linux for reduced attack surface
- **Secrets management**: Environment variables for sensitive data
- **Network isolation**: Containers communicate only as needed

### Production Hardening
```dockerfile
# Add security-focused user
RUN addgroup -g 1001 -S nodejs && adduser -S whoopspay -u 1001

# Set proper ownership
CHOWN whoopspay:nodejs /app
USER whoopspay

# Remove unnecessary packages
RUN apk del .build-deps
```

### Vulnerability Scanning
```bash
# Scan image for vulnerabilities
docker scout cves whoopspay:latest

# Use Snyk for container scanning
snyk container test whoopspay:latest
```

## 📊 Performance Optimization

### Multi-stage Builds

The Dockerfile uses an optimized multi-stage build process:
- **Builder stage**: Installs all dependencies and builds the application
- **Production stage**: Creates minimal runtime image with only production dependencies
- **Security**: Runs as non-root user with proper ownership
- **Health monitoring**: Built-in health checks for container orchestration

### Image Optimization
- **Layer caching**: Optimized instruction order
- **.dockerignore**: Exclude unnecessary files
- **Minimal dependencies**: Production-only packages

## 🛠️ Development Workflow

### Local Development
```bash
# Development with hot reload
docker-compose -f docker-compose.dev.yml up

# Run tests in container
docker run --rm whoopspay:latest npm test

# Database migrations
docker run --rm whoopspay:latest npm run db:push
```

### Container Registry Management
```bash
# Build and tag
docker build -t ghaidaris/whoopspay:1.0.0 .

# Push to registry
docker push ghaidaris/whoopspay:1.0.0

# Pull latest
docker pull ghaidaris/whoopspay:latest
```

This Docker setup provides a complete containerization solution for WhoopsPay with SQLite database support, security hardening, and efficient multi-stage builds for local development and production deployment.