# GitHub Deployment Guide for PayPwned

## Quick Setup Commands

Follow these steps to push your PayPwned application to GitHub:

### 1. Initialize Git Repository (if not already done)
```bash
git init
git add .
git commit -m "Initial commit: PayPwned cybersecurity training platform"
```

### 2. Create GitHub Repository
1. Go to [github.com](https://github.com) and sign in
2. Click the "+" icon in the top right corner
3. Select "New repository"
4. Repository name: `paypwned`
5. Description: `Cybersecurity training platform with intentional OWASP vulnerabilities`
6. Set to **Public** (for educational sharing) or **Private** (for restricted access)
7. Do NOT initialize with README (we already have one)
8. Click "Create repository"

### 3. Connect Local Repository to GitHub
Replace `yourusername` with your actual GitHub username:
```bash
git remote add origin https://github.com/yourusername/paypwned.git
git branch -M main
git push -u origin main
```

### 4. Create Development Branch
```bash
git checkout -b develop
git push -u origin develop
```

## Repository Structure for GitHub

Your repository will contain:

```
paypwned/
├── .env.example              # Environment template
├── .gitignore               # Git ignore file
├── README.md                # Project documentation
├── LICENSE                  # MIT License
├── DEPLOYMENT.md            # This deployment guide
├── package.json             # Dependencies
├── package-lock.json        # Lock file
├── tsconfig.json           # TypeScript config
├── vite.config.ts          # Vite configuration
├── tailwind.config.ts      # Tailwind CSS config
├── drizzle.config.ts       # Database config
├── components.json         # UI components config
├── client/                 # Frontend React app
│   ├── src/
│   │   ├── components/     # UI components
│   │   ├── pages/          # Application pages
│   │   ├── hooks/          # React hooks
│   │   ├── lib/            # Utilities
│   │   └── App.tsx         # Main app
├── server/                 # Backend Express app
│   ├── routes.ts           # API routes
│   ├── storage.ts          # Database layer
│   ├── db.ts              # DB connection
│   └── index.ts           # Server entry
└── shared/                 # Shared code
    └── schema.ts          # Database schema
```

## Environment Setup for Collaborators

When others clone your repository, they need to:

### 1. Clone and Setup
```bash
git clone https://github.com/yourusername/paypwned.git
cd paypwned
npm install
```

### 2. Environment Configuration
```bash
cp .env.example .env
```

Then edit `.env` with their database details:
```env
DATABASE_URL=file:./server/database.db
SESSION_SECRET=their-unique-secret-key
NODE_ENV=development
PORT=5000
```

### 3. Database Setup
```bash
npm run db:push
```

### 4. Start Development
```bash
npm run dev
```

## Security Considerations for GitHub

### Files to Keep Private
Your `.gitignore` already excludes:
- `.env` (contains sensitive data)
- `node_modules/` (large dependency folder)
- Build artifacts and logs

### Public Repository Warning
If making the repository public:
- Remove any real API keys or secrets
- Ensure `.env.example` contains only placeholder values
- Add clear warnings about educational use only
- Consider adding vulnerability disclosure policy

## Collaboration Workflow

### For Team Development:
1. **Main Branch**: Stable, production-ready code
2. **Develop Branch**: Integration branch for features
3. **Feature Branches**: Individual features (`feature/money-requests`)
4. **Hotfix Branches**: Quick fixes (`hotfix/security-patch`)

### Recommended Git Workflow:
```bash
# Create feature branch
git checkout develop
git pull origin develop
git checkout -b feature/new-vulnerability

# Make changes and commit
git add .
git commit -m "Add: SQL injection vulnerability example"

# Push and create pull request
git push origin feature/new-vulnerability
```

## Repository Settings Recommendations

### Branch Protection (for main branch):
1. Go to Settings > Branches
2. Add rule for `main` branch
3. Enable:
   - Require pull request reviews
   - Require status checks
   - Require branches to be up to date
   - Restrict pushes to main

### Security Settings:
1. Enable Dependabot alerts
2. Enable secret scanning
3. Set up code scanning (for educational purposes)

## Documentation Updates

Keep these files updated:
- `README.md` - Project overview and setup
- `DEPLOYMENT.md` - This deployment guide
- Inline code comments for vulnerability explanations
- API documentation for endpoints

## Continuous Integration

The application includes a GitHub Actions workflow that:
- Runs TypeScript checks
- Performs linting
- Builds the application
- Runs security scans (for educational purposes)

## Educational Use Disclaimer

When sharing on GitHub, always include:
- Clear educational purpose statements
- Vulnerability warnings
- Setup instructions for safe environments
- Legal disclaimers about intentional vulnerabilities

Your PayPwned repository is now ready for GitHub deployment and collaborative cybersecurity education!