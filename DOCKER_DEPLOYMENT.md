# Docker Deployment Guide

Complete containerization setup for WhoopsPay and OWASP Juice Shop integration.

## Quick Start

### Prerequisites
- Docker Engine 20.10+
- Docker Compose 2.0+
- 4GB RAM minimum
- Port 80, 3000, and 5000 available

### Launch Both Applications

```bash
# Clone the repository
git clone <repository-url>
cd whoopspay

# Start all services
docker-compose up -d

# Check service status
docker-compose ps
```

### Access Applications

- **WhoopsPay**: http://localhost:5000
- **Juice Shop**: http://localhost:3000
- **Nginx Gateway**: http://localhost (unified access)

## Service Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│     Nginx       │    │   WhoopsPay     │    │   Juice Shop    │
│  (Port 80/443)  │    │   (Port 5000)   │    │   (Port 3000)   │
│                 │    │                 │    │                 │
│ - Rate Limiting │────┤ - React + API   │────┤ - Vulnerable    │
│ - Load Balancer │    │ - SQLite DB     │    │   Web App       │
│ - SSL Proxy     │    │ - Session Auth  │    │ - Payment Hooks │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │ Payment Network │
                    │ (172.20.0.0/16) │
                    └─────────────────┘
```

## Configuration

### Environment Variables

**WhoopsPay (.env)**
```bash
NODE_ENV=production
PORT=5000
HOST=0.0.0.0
DATABASE_URL=file:./server/database.db
SESSION_SECRET=your-secure-session-secret-key
JUICE_SHOP_URL=http://juice-shop:3000
WHOOPSPAY_URL=http://whoopspay:5000
```

**Juice Shop**
```bash
NODE_ENV=docker
PORT=3000
WHOOPSPAY_API_URL=http://whoopspay:5000/api/juice-shop/payment-request
WHOOPSPAY_PAYMENT_URL=http://localhost:5000/login?redirect=/dashboard
```

### Volume Persistence

```yaml
volumes:
  whoopspay_data:  # SQLite database and user uploads
  juice_shop_data: # Juice Shop challenges and progress
```

## Build Process

### Building WhoopsPay Image

```bash
# Development build
npm run build

# Production Docker build
docker build -t whoopspay:latest .

# Multi-platform build
docker buildx build --platform linux/amd64,linux/arm64 -t whoopspay:latest .
```

### Custom Juice Shop Integration

The integration files are mounted into Juice Shop:
```bash
./juice-shop-integration:/juice-shop/custom
```

## Network Configuration

### Internal Communication
- Services communicate via Docker network `payment_network`
- DNS resolution: `whoopspay:5000`, `juice-shop:3000`
- Isolated from host network for security

### External Access
- Nginx reverse proxy handles all external traffic
- Rate limiting: 10 req/s for API, 5 req/s for payments
- Security headers automatically applied

## Health Monitoring

### Health Check Endpoints

```bash
# WhoopsPay health
curl http://localhost:5000/api/health

# Juice Shop health
curl http://localhost:3000/rest/admin/application-version

# Nginx health
curl http://localhost/health
```

### Container Health Status

```bash
# Check all container health
docker-compose ps

# View logs
docker-compose logs whoopspay
docker-compose logs juice-shop
docker-compose logs nginx
```

## Security Configuration

### Nginx Security Features
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- X-XSS-Protection: enabled
- Strict-Transport-Security: 1 year
- Rate limiting per IP address

### Container Security
- Non-root user execution
- Read-only file systems where possible
- Resource limits enforced
- Network isolation

## Development vs Production

### Development Mode
```bash
# Use development compose file
docker-compose -f docker-compose.dev.yml up -d

# Enable hot reloading
docker-compose exec whoopspay npm run dev
```

### Production Mode
```bash
# Production optimized
docker-compose -f docker-compose.prod.yml up -d

# Enable SSL
mkdir ssl
# Add your certificates to ./ssl/
```

## Integration Testing

### Payment Flow Test

```bash
# 1. Create external payment request
curl -X POST http://localhost:5000/api/juice-shop/payment-request \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 25.99,
    "description": "Apple Juice - Organic",
    "toUserId": "@sarah_wilson",
    "externalOrderId": "TEST_ORDER_001",
    "returnUrl": "http://localhost:3000/checkout/success",
    "cancelUrl": "http://localhost:3000/checkout/cancel"
  }'

# 2. Login to WhoopsPay
# Visit: http://localhost:5000/login
# Username: @sarah_wilson
# Password: sarah123

# 3. Approve payment in dashboard
# 4. Verify redirect back to Juice Shop
```

### Service Communication Test

```bash
# Test internal network connectivity
docker-compose exec whoopspay curl http://juice-shop:3000/rest/admin/application-version
docker-compose exec juice-shop curl http://whoopspay:5000/api/health
```

## Troubleshooting

### Common Issues

**Services won't start:**
```bash
# Check port conflicts
netstat -tlnp | grep :80
netstat -tlnp | grep :3000
netstat -tlnp | grep :5000

# Reset containers
docker-compose down -v
docker-compose up -d
```

**Database issues:**
```bash
# Reset WhoopsPay database
docker-compose exec whoopspay rm -f /app/server/database.db
docker-compose restart whoopspay
```

**Network connectivity:**
```bash
# Inspect network
docker network inspect whoopspay_payment_network

# Test connectivity
docker-compose exec whoopspay ping juice-shop
```

### Log Analysis

```bash
# Follow all logs
docker-compose logs -f

# Filter specific service
docker-compose logs -f whoopspay | grep ERROR

# Export logs
docker-compose logs > deployment.log
```

## Scaling and Performance

### Horizontal Scaling
```yaml
# Scale WhoopsPay instances
whoopspay:
  deploy:
    replicas: 3
  
# Load balancer configuration required
```

### Resource Monitoring
```bash
# Container resource usage
docker stats

# Detailed metrics
docker-compose exec whoopspay top
```

## Backup and Recovery

### Database Backup
```bash
# Backup WhoopsPay database
docker-compose exec whoopspay cp /app/server/database.db /app/backup/
docker cp $(docker-compose ps -q whoopspay):/app/backup/database.db ./backup/
```

### Full System Backup
```bash
# Export volumes
docker run --rm -v whoopspay_whoopspay_data:/data -v $(pwd):/backup busybox tar czf /backup/whoopspay_data.tar.gz -C /data .
```

## Production Checklist

- [ ] SSL certificates configured
- [ ] Environment secrets secured
- [ ] Database backups scheduled
- [ ] Log rotation configured
- [ ] Resource limits set
- [ ] Health monitoring enabled
- [ ] Security scanning completed
- [ ] Performance testing passed

## Support

For deployment issues:
1. Check container logs: `docker-compose logs`
2. Verify network connectivity
3. Confirm environment variables
4. Test health endpoints
5. Review security configurations

Educational use only - Contains intentional vulnerabilities for security training.