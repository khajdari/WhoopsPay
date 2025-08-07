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
- **OWASP Juice Shop**: http://localhost:3001

## Available Commands

```bash
# Build the WhoopsPay Docker image
npm run docker:build

# Start all services in background
npm run docker:run

# Stop all services
npm run docker:stop

# View real-time logs
npm run docker:logs

# Build and start services
docker-compose up --build

# Start only WhoopsPay
docker-compose up whoopspay

# Start only Juice Shop
docker-compose up juice-shop
```

## Configuration

### Environment Variables

The Docker setup uses these environment variables:

- `WHOOPSPAY_URL=http://localhost:3000`
- `JUICE_SHOP_URL=http://localhost:3001`
- `SESSION_SECRET=your-secure-session-secret-change-in-production`

### Port Mapping

- Host port 3000 → WhoopsPay container port 5000
- Host port 3001 → Juice Shop container port 3000

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

3. **Port conflicts**: If ports 3000 or 3001 are in use, modify the port mappings in `docker-compose.yml`

4. **Database issues**: Clear the database volume:
   ```bash
   docker-compose down -v
   docker-compose up
   ```

5. **Permission issues**: Ensure Docker has access to the project directory

6. **Build failures**: Clear Docker cache:
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
docker logs whoopspay-juice-shop
```

## Security Considerations

- Change the `SESSION_SECRET` in production
- The setup includes health checks for both services
- Containers run with non-root users where possible
- Network isolation between containers

## Integration Testing

Both services are configured to communicate with each other:

1. WhoopsPay connects to Juice Shop for external payment processing
2. Payment flows between the applications work seamlessly
3. Both applications maintain their intentional vulnerabilities for educational purposes

## Production Deployment

For production use:

1. Update environment variables in `docker-compose.yml`
2. Use proper SSL certificates
3. Configure proper database backups
4. Set appropriate resource limits
5. Use container orchestration (Kubernetes, Docker Swarm)

## Architecture

```
┌─────────────────┐    ┌─────────────────┐
│   WhoopsPay     │    │   Juice Shop    │
│   localhost:3000│◄──►│   localhost:3001│
│                 │    │                 │
│   SQLite DB     │    │   File Storage  │
│   (volume)      │    │   (ephemeral)   │
└─────────────────┘    └─────────────────┘
         │                       │
         └───────────────────────┘
              Docker Network
```