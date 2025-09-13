# Docker Guide for WhoopsPay

## 🐳 Overview

WhoopsPay includes comprehensive Docker support for consistent development, testing, and deployment environments. The application is containerized with all dependencies and can be deployed to any Docker-compatible platform.

## 📦 Docker Configuration

### Dockerfile Structure

```dockerfile
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application code
COPY . .

# Build the application
RUN npm run build

# Expose port
EXPOSE 5000

# Start the application
CMD ["npm", "start"]
```

### Key Features
- **Multi-stage builds** for optimized image size
- **Alpine Linux** base for security and minimal footprint
- **Production dependencies only** in final image
- **Non-root user** for enhanced security
- **Health checks** for container monitoring

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

```yaml
version: '3.8'

services:
  whoopspay:
    build: .
    ports:
      - "5000:5000"
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/whoopspay
      - NODE_ENV=production
    depends_on:
      - db
    restart: unless-stopped

  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=whoopspay
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

volumes:
  postgres_data:
```

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
      khajdari/whoopspay:${{ needs.setup-version.outputs.version }}
      khajdari/whoopspay:latest
    cache-from: type=gha
    cache-to: type=gha,mode=max
```

### Automated Pipeline
1. **Security Testing** → Complete 4-phase security analysis
2. **Docker Build** → Multi-platform image creation
3. **Registry Push** → Docker Hub publication
4. **Deployment** → Automatic deployment to production

## 🎯 Deployment Platforms

### Docker Hub Registry
- **Repository**: `khajdari/whoopspay`
- **Tags**: Semantic versioning + build timestamps
- **Auto-build**: Triggered on every push to main branch

### Platform Support

#### Render
```bash
# Deploy to Render using Docker image
Service Type: Web Service
Image: docker.io/khajdari/whoopspay:latest
Port: 5000
```

#### Railway
```bash
# Deploy using Docker image
railway up --detach
```

#### DigitalOcean App Platform
```yaml
name: whoopspay
services:
- name: web
  source_dir: /
  image:
    registry_type: DOCKER_HUB
    registry: khajdari
    repository: whoopspay
    tag: latest
  http_port: 5000
```

#### AWS ECS/Fargate
```json
{
  "family": "whoopspay",
  "containerDefinitions": [
    {
      "name": "whoopspay",
      "image": "khajdari/whoopspay:latest",
      "portMappings": [
        {
          "containerPort": 5000,
          "protocol": "tcp"
        }
      ]
    }
  ]
}
```

## 🔧 Configuration

### Environment Variables

```bash
# Database Configuration
DATABASE_URL=postgresql://user:pass@host:5432/db

# Application Settings  
NODE_ENV=production
PORT=5000

# External Services
WHOOPSPAY_URL=https://your-domain.com
JUICE_SHOP_URL=https://your-juice-shop.com

# Security Settings (Educational)
SESSION_SECRET=your-session-secret
```

### Volume Mounts

```bash
# Development with live reload
docker run -v $(pwd):/app -p 5000:5000 whoopspay:dev

# Production with persistent data
docker run -v /data/uploads:/app/uploads whoopspay:latest
```

## 🔍 Monitoring and Debugging

### Health Checks

```dockerfile
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:5000/health || exit 1
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
```dockerfile
# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM node:20-alpine AS production
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
RUN npm ci --only=production
CMD ["npm", "start"]
```

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
docker build -t khajdari/whoopspay:1.0.0 .

# Push to registry
docker push khajdari/whoopspay:1.0.0

# Pull latest
docker pull khajdari/whoopspay:latest
```

This Docker setup provides a complete containerization solution for WhoopsPay, supporting development, testing, and production deployments across multiple platforms.