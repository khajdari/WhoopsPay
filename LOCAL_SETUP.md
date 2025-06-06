# Local Setup Manual - WhoopsPay & Juice Shop Integration

## System Requirements

### Hardware Requirements
- **CPU**: Dual-core processor (2.4 GHz or higher)
- **RAM**: 4 GB minimum, 8 GB recommended
- **Storage**: 2 GB free disk space
- **Network**: Internet connection for initial setup

### Software Prerequisites
- **Node.js**: Version 18.x or 20.x (LTS recommended)
- **npm**: Version 9.x or higher (comes with Node.js)
- **Git**: Latest version for repository management

## Installation Guide

### Step 1: Environment Setup

#### Install Node.js
```bash
# Download from https://nodejs.org/
# Verify installation
node --version
npm --version
```

# Database is handled automatically with SQLite
# No additional database setup required

### Step 2: Project Setup

#### Clone Repository
```bash
git clone <repository-url>
cd whoopspay-integration
```

#### Install Dependencies
```bash
# Install all project dependencies
npm install

# Verify installation
npm list --depth=0
```

#### Environment Configuration
```bash
# Copy environment template
cp .env.example .env

# Edit environment variables
nano .env
```

#### Required Environment Variables
```env
# Database Configuration
DATABASE_URL=file:./server/database.db

# Application Configuration
NODE_ENV=development
PORT=5000

# Session Configuration
SESSION_SECRET=your-secret-key-here

# Juice Shop Configuration
JUICE_SHOP_PORT=3001
JUICE_SHOP_URL=http://localhost:3001

# WhoopsPay Configuration
WHOOPSPAY_PORT=5000
WHOOPSPAY_URL=http://localhost:5000
```

### Step 3: Database Setup

#### Initialize Database Schema
```bash
# Push database schema
npm run db:push

# Verify tables created
psql -h localhost -U whoopspay -d whoopspay_db -c "\dt"
```

#### Seed Initial Data
```bash
# Start the application (seeds data automatically)
npm run dev

# Or manually seed if needed
npm run db:seed
```

### Step 4: Application Startup

#### Start WhoopsPay Server
```bash
# Terminal 1: Start WhoopsPay (Port 5000)
npm run dev
```

#### Start Juice Shop Server
```bash
# Terminal 2: Start Juice Shop (Port 3001)
node start-juice-shop.cjs
```

#### Verify Services
```bash
# Check WhoopsPay
curl http://localhost:5000/api/health

# Check Juice Shop
curl http://localhost:3001/health
```

## Application Access

### WhoopsPay Interface
- **URL**: http://localhost:5000
- **Admin Panel**: http://localhost:5000/admin
- **API Documentation**: http://localhost:5000/api-docs

### Juice Shop Interface
- **URL**: http://localhost:3001
- **Product Catalog**: Browse products and add to cart
- **Checkout**: Integrated with WhoopsPay payment system

### Demo User Accounts
```
Regular Users:
  Username: @sarah_wilson
  Password: sarah123

  Username: @james_anderson
  Password: james2024

  Username: @elena_kowalski
  Password: elena456

Administrator:
  Username: @admin_maria
  Password: admin2024
```

## Testing the Integration

### Complete Payment Flow Test

#### 1. Access Juice Shop
```bash
# Open browser
http://localhost:3001
```

#### 2. Add Products to Cart
- Browse available products (Apple Pomace, Banana Juice, etc.)
- Click "Add to Cart" for desired items
- Navigate to shopping cart

#### 3. Initiate Payment
- Click "Checkout" button
- Select "Pay with WhoopsPay" option
- System redirects to WhoopsPay

#### 4. Authentication
- Login with demo credentials (@sarah_wilson/sarah123)
- Complete authentication flow

#### 5. Payment Approval
- Review payment details in modal
- Click "Approve Payment" or "Reject Payment"
- Verify transaction status

#### 6. Return to Shop
- Automatic redirect back to Juice Shop
- Verify payment status and order completion

## Development Commands

### Database Management
```bash
# Reset database
npm run db:reset

# View database schema
npm run db:studio

# Generate migration
npm run db:generate

# Push schema changes
npm run db:push
```

### Application Management
```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run tests
npm test

# Lint code
npm run lint
```

### Debugging Commands
```bash
# View application logs
npm run logs

# Check service status
npm run status

# Restart services
npm run restart

# Clear cache
npm run clean
```

## Troubleshooting

### Common Issues

#### Port Already in Use
```bash
# Find process using port
lsof -i :5000
lsof -i :3001

# Kill process
kill -9 <PID>

# Or use different ports in .env file
```

#### Database Connection Issues
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Test database connection
psql -h localhost -U whoopspay -d whoopspay_db

# Reset database permissions
sudo -u postgres psql -c "ALTER USER whoopspay CREATEDB;"
```

#### Node.js Module Issues
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Update npm
npm install -g npm@latest
```

#### Memory Issues
```bash
# Increase Node.js memory limit
export NODE_OPTIONS="--max-old-space-size=4096"
npm run dev

# Or set in package.json scripts
"dev": "NODE_OPTIONS='--max-old-space-size=4096' tsx server/index.ts"
```

### Integration Issues

#### Payment Flow Not Working
1. Verify both servers are running
2. Check database connection
3. Validate environment variables
4. Review application logs for errors

#### Authentication Problems
1. Clear browser cookies/session storage
2. Verify session secret configuration
3. Check user credentials in database
4. Review authentication middleware logs

#### API Endpoint Errors
1. Verify API endpoints with curl commands
2. Check request/response formats
3. Validate authentication headers
4. Review CORS configuration

## Performance Optimization

### Database Optimization
```sql
-- Add database indexes for better performance
CREATE INDEX idx_transactions_user_id ON transactions(from_user_id);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_users_email ON users(email);
```

### Application Optimization
```bash
# Enable production optimizations
NODE_ENV=production npm run build

# Use PM2 for production process management
npm install -g pm2
pm2 start ecosystem.config.js
```

### Memory Management
```javascript
// In server configuration
process.setMaxListeners(0);

// Garbage collection optimization
node --expose-gc --optimize-for-size server/index.js
```

## Security Considerations

### Development Environment
- Use only on isolated development machines
- Never expose ports to external networks
- Regular security updates and patches
- Proper firewall configuration

### Data Protection
- Backup database regularly
- Use environment variables for sensitive data
- Implement proper access controls
- Monitor application logs

### Network Security
```bash
# Configure firewall (Ubuntu)
sudo ufw allow 5000/tcp
sudo ufw allow 3001/tcp
sudo ufw enable

# Verify network configuration
netstat -tlnp | grep :5000
netstat -tlnp | grep :3001
```

## Monitoring and Logging

### Application Monitoring
```bash
# Monitor application performance
npm run monitor

# View real-time logs
tail -f logs/application.log

# Monitor database queries
tail -f logs/database.log
```

### System Monitoring
```bash
# Monitor system resources
htop

# Monitor disk usage
df -h

# Monitor network connections
netstat -an | grep :5000
```

## Support and Maintenance

### Regular Maintenance Tasks
1. Update dependencies monthly
2. Backup database weekly
3. Monitor log files daily
4. Review security patches

### Getting Help
- Check application logs first
- Review this documentation
- Search existing issues in repository
- Create detailed bug reports with:
  - Environment information
  - Steps to reproduce
  - Error messages
  - Log excerpts

### Contributing
1. Fork the repository
2. Create feature branch
3. Test changes thoroughly
4. Submit pull request with detailed description

---

**Note**: This setup is for educational and development purposes only. The application contains intentional security vulnerabilities for training purposes and should never be deployed in production environments.