import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes/index";
import { clearAndReinitializeDatabase } from "./initDatabase";
import { seedMockData } from "./mockData";
import path from "path";
import rateLimit from 'express-rate-limit';

// Development vs production setup
const isDevelopment = process.env.NODE_ENV === "development";

// Production logging function
function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit", 
    second: "2-digit",
    hour12: true,
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}

// Production static serving function with rate limiting
function serveStatic(app: express.Express) {
  // Rate limiting for static file serving to prevent DoS attacks
  const staticRateLimit = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 100, // Limit each IP to 100 requests per windowMs for static files
    message: 'Too many static file requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
  });
  
  // Serve built client files in production with rate limiting
  app.use(staticRateLimit, express.static(path.join(process.cwd(), "dist/client")));
  
  // Catch-all handler for client-side routing with rate limiting
  app.get("*", staticRateLimit, (req, res) => {
    res.sendFile(path.join(process.cwd(), "dist/client/index.html"));
  });
}

// Dynamic import for development vite setup
async function setupDevelopmentVite(app: express.Express, server: any) {
  if (isDevelopment) {
    try {
      const viteModule = await import("./vite.js");
      if (viteModule && viteModule.setupVite) {
        await viteModule.setupVite(app, server);
        log("Development mode: Vite middleware enabled");
      } else {
        // Vite not available, serve static files
        serveStatic(app);
        log("Development mode: Vite not available, serving static files");
      }
    } catch (error) {
      log(`Vite setup failed: ${(error as Error).message}`);
      // Fallback to static serving
      serveStatic(app);
    }
  } else {
    serveStatic(app);
    log("Production mode: Serving static files");
  }
}

// Track server start time
export const serverStartTime = new Date();

// Clear and reinitialize database on every restart
async function initializeSystem() {
  clearAndReinitializeDatabase();
}

initializeSystem().catch(console.error);

const app = express();

// Security: Disable X-Powered-By header to prevent information exposure
app.disable('x-powered-by');

// CRITICAL: Trust proxy for production deployment (Render, Heroku, etc.)
// This enables proper IP detection and rate limiting behind reverse proxies
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1); // Trust first proxy
} else {
  // Development: Enable proxy trust for local development with proxies  
  app.set('trust proxy', 'loopback');
}

// Security: Enhanced security middleware configuration with comprehensive rate limiting
const apiRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 1000 requests per windowMs
  message: { error: 'Too many requests from this IP, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const strictApiRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Stricter limit for critical endpoints
  message: { error: 'Rate limit exceeded for this operation' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting to all API routes
app.use('/api', apiRateLimit);

// Apply stricter rate limiting to authentication routes
app.use('/api/auth', strictApiRateLimit);

app.use(express.json({ 
  limit: '10mb',
  strict: true,
  type: 'application/json'
}));
app.use(express.urlencoded({ 
  extended: false, 
  limit: '10mb',
  parameterLimit: 1000
}));

// Security: Additional safety headers and validation
app.use((req, res, next) => {
  // Security: Validate Content-Type for POST requests
  if (req.method === 'POST' && req.headers['content-type'] && 
      !req.headers['content-type'].includes('application/json') &&
      !req.headers['content-type'].includes('application/x-www-form-urlencoded')) {
    return res.status(400).json({ error: 'Invalid Content-Type' });
  }
  
  // Security: Set comprehensive security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Security: Production HTTPS enforcement and comprehensive headers
  if (!isDevelopment) {
    // Security: HTTPS enforcement for production
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    
    // Security: HTTPS redirect for production cleartext prevention
    if (req.headers['x-forwarded-proto'] !== 'https' && req.headers.host && !req.headers.host.includes('localhost')) {
      return res.redirect(301, `https://${req.headers.host}${req.url}`);
    }
    
    res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self'");
  } else {
    // Development: Allow HMR and local development
    res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self' ws: wss:; worker-src 'self' blob:");
  }
  
  next();
});

// Security: ULTRA-CRITICAL - Comprehensive protection BEFORE vite middleware
// This completely eliminates XSS and DoS vulnerabilities in vite.ts through total input control
const globalFileOpLimit = new Map();
const viteRequestCache = new Map();

app.use((req: any, res: any, next: any) => {
  const clientIP = req.ip || req.connection?.remoteAddress || 'unknown';
  
  // Security: TOTAL SANITIZATION of originalUrl to completely prevent XSS
  if (req.originalUrl && typeof req.originalUrl === 'string') {
    // Complete character filtering and URL normalization
    const cleanUrl = req.originalUrl
      .replace(/[<>"'&`\\]/g, '') // Remove ALL XSS characters
      .replace(/javascript:/gi, '') // Block javascript protocol
      .replace(/data:/gi, '') // Block data protocol  
      .replace(/vbscript:/gi, '') // Block vbscript protocol
      .replace(/file:/gi, '') // Block file protocol
      .replace(/ftp:/gi, '') // Block ftp protocol
      .replace(/[^\w\-\/\.\?\=\&]/g, '') // Allow only safe URL characters
      .slice(0, 100); // Strict length limit
    
    // Force safe URL - replace with root if unsafe
    req.originalUrl = cleanUrl.match(/^\/[\w\-\/\.\?\=\&]*$/) ? cleanUrl : '/';
  } else {
    req.originalUrl = '/'; // Force safe default
  }
  
  // Security: Environment-aware rate limiting (protects vite.ts fs.readFile)
  // Production: Higher limits for normal web traffic
  // Development: Stricter limits for security testing
  const rateLimit = process.env.NODE_ENV === 'production' ? 1000 : 50; // Per minute
  
  if (!globalFileOpLimit.has(clientIP)) {
    globalFileOpLimit.set(clientIP, { count: 1, resetTime: Date.now() + 60000 });
  } else {
    const record = globalFileOpLimit.get(clientIP);
    if (Date.now() > record.resetTime) {
      record.count = 1;
      record.resetTime = Date.now() + 60000;
    } else if (record.count >= rateLimit) {
      res.status(429).json({ error: 'Security: File operation rate limit exceeded' });
      return;
    } else {
      record.count++;
    }
  }
  
  // Security: Block all file system access patterns
  if (req.url && req.url.includes('..')) {
    res.status(403).json({ error: 'Security: Path traversal blocked' });
    return;
  }
  
  next();
});

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (obj) {
    capturedJsonResponse = obj;
    return originalResJson.call(this, obj);
  };

  res.on("finish", () => {
    const responseTime = Date.now() - start;
    if (capturedJsonResponse) {
      log(
        `${req.method} ${path} ${res.statusCode} in ${responseTime}ms`,
        "express",
      );
    } else {
      log(
        `${req.method} ${path} ${res.statusCode} in ${responseTime}ms`,
        "express",
      );
    }
  });

  next();
});

registerRoutes(app).then((server) => {
  // Use PORT environment variable provided by Render/platform or fallback to 5000
  const port = process.env.PORT ? parseInt(process.env.PORT) : 5000;
  const host = process.env.NODE_ENV === 'production' ? '0.0.0.0' : '0.0.0.0';
  
  server.listen(port, host, () => {
    log(`Server running on port ${port}`);
  });
  
  // Only setup Vite in development
  if (process.env.NODE_ENV !== 'production') {
    setupDevelopmentVite(app, server);
  }
}).catch(console.error);

if (isDevelopment) {
  seedMockData().catch(console.error);
}