# Docker Setup for WhoopsPay

**⚠️ WARNING: This application contains intentional security vulnerabilities for educational purposes. NEVER use this code in production environments!**

This guide explains how to run WhoopsPay and OWASP Juice Shop using Docker on localhost.

## Prerequisites

- Docker Desktop installed and running
- Docker Compose (included with Docker Desktop)
- At least 4GB of available RAM

## Quick Start

### 1. Build and Run with Docker Compose

```bash
# Start both WhoopsPay and Juice Shop
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### 2. Access the Applications

- **WhoopsPay**: http://localhost:3000
- **WhoopsPay's Custom Juice Shop**: http://localhost:3000/juice-shop
- **Official OWASP Juice Shop**: http://localhost:3002 (optional, requires --profile optional)

## Available Commands

### Using the Management Script (Recommended)

```bash
# SIMPLE COMMANDS FOR LOCAL DEVELOPMENT:

# FORCE CLEAN REBUILD (required for vite fix):
docker-compose down --volumes --remove-orphans
docker image rm whoopspay:latest || true
docker system prune -f
docker-compose build --no-cache whoopspay
docker-compose up -d whoopspay

# View logs
docker-compose logs -f whoopspay
```

### Using Docker Compose Directly

```bash
# Build and start services
docker-compose up --build

# Start only WhoopsPay
docker-compose up whoopspay

# Start with optional official Juice Shop
docker-compose --profile optional up

# View real-time logs
docker-compose logs -f whoopspay
```

### Using NPM Scripts

```bash
# Build the WhoopsPay Docker image
npm run docker:build

# Start all services in background
npm run docker:run

# Stop all services
npm run docker:stop

# View real-time logs
npm run docker:logs
```

## Configuration

### Environment Variables

The Docker setup uses these environment variables:

- `WHOOPSPAY_URL=http://localhost:3000`
- `JUICE_SHOP_URL=http://localhost:3000/juice-shop` (integrated custom version)
- `SESSION_SECRET=your-secure-session-secret-change-in-production`

### Port Mapping

- Host port 3000 → WhoopsPay container port 5000 (includes integrated Juice Shop at /juice-shop)
- Host port 3002 → Official Juice Shop container port 3000 (optional)

### Persistent Data

- SQLite database: `./data/database.db` (mounted as volume)
- Application logs: `./logs/` (mounted as volume)

## Development Mode

For development with hot reload:

```bash
# Use the development override
docker-compose -f docker-compose.yml -f docker-compose.override.yml up
```

## Troubleshooting

### Common Issues

1. **Version warnings**: The `version` attribute in docker-compose files is now obsolete and has been removed

2. **Asset loading errors**: If you see errors about missing assets (uk.png, gr.jpg), ensure the required files are in `client/src/assets/`

3. **"tsx: not found" error**: This occurs when the development override tries to run `tsx` in a production container. The current setup uses the production build for consistency

4. **Port conflicts**: If ports 3000 or 3001 are in use, modify the port mappings in `docker-compose.yml`

5. **Database issues**: Clear the database volume:
   ```bash
   docker-compose down -v
   docker-compose up
   ```

6. **Permission issues**: Ensure Docker has access to the project directory

7. **Build failures**: Clear Docker cache:
   ```bash
   docker system prune -a
   docker-compose build --no-cache
   ```

### Viewing Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f whoopspay
docker-compose logs -f juice-shop

# Container logs
docker logs whoopspay-app
docker logs whoopspay-juice-shop-official  # Only if using --profile optional
```

## Troubleshooting

### Common Issues

**Container keeps restarting with "Cannot find package 'vite'" error:**
- Fixed by installing all dependencies in production stage (not just --only=production)  
- vite is now available in the production container
- Solution: `docker-compose build --no-cache whoopspay`

**Build fails with "dist/client not found" error:**
- Fixed by correcting Vite output path mapping in Docker
- Vite builds client to `/dist/public`, Docker now maps this correctly

**Juice Shop shows "ENOENT: no such file" error:**
- Fixed by copying server/modules directory to production container
- Juice Shop static files now available at runtime

**Port already in use:**
- Stop existing containers: `./docker-run.sh stop`
- Or use different ports in docker-compose.yml

**Database issues:**
- Clean up and restart: `./docker-run.sh clean` then `./docker-run.sh build`

## Security Considerations

- Change the `SESSION_SECRET` in production
- The setup includes health checks for both services
- Containers run with non-root users where possible
- Network isolation between containers
- Development dependencies excluded from production image

## Integration Testing

### Custom Juice Shop Integration (Default)

- WhoopsPay includes integrated custom Juice Shop at `/juice-shop`
- Features WhoopsPay-themed products and financial services
- Custom payment flow integration for educational security training
- Maintains intentional vulnerabilities for OWASP learning

### Optional Official Juice Shop

- Available at port 3002 when using `--profile optional`
- Standard OWASP Juice Shop with original products
- Useful for comparing with official vulnerability examples
- Both versions maintain educational security vulnerabilities

## Production Deployment

For production use:

1. Update environment variables in `docker-compose.yml`
2. Use proper SSL certificates
3. Configure proper database backups
4. Set appropriate resource limits
5. Use container orchestration (Kubernetes, Docker Swarm)

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    localhost:3000                       │
│  ┌─────────────────┐    ┌─────────────────────────────┐│
│  │   WhoopsPay     │    │   Custom Juice Shop         ││
│  │     Main App    │◄──►│   (/juice-shop)             ││
│  │                 │    │                             ││
│  │   SQLite DB     │    │   Integrated Service        ││
│  │   (volume)      │    │   (same container)          ││
│  └─────────────────┘    └─────────────────────────────┘│
└─────────────────────────────────────────────────────────┘
                               │
                               │ (optional)
                               ▼
┌─────────────────────────────────────────────────────────┐
│                    localhost:3002                       │
│  ┌─────────────────────────────────────────────────────┐│
│  │            Official OWASP Juice Shop                ││
│  │              (--profile optional)                   ││
│  │                                                     ││
│  │            File Storage (ephemeral)                 ││
│  └─────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────┘
                               │
                ┌──────────────┴──────────────┐
                │        Docker Network       │
                └─────────────────────────────┘
```