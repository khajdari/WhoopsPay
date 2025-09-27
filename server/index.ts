import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes/index";
import { clearAndReinitializeDatabase } from "./initDatabase";
import { seedMockData } from "./mockData";
import path from "path";

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

// Production static serving function
function serveStatic(app: express.Express) {
  // Serve built client files in production
  app.use(express.static(path.join(process.cwd(), "dist/client")));
  
  // Catch-all handler for client-side routing
  app.get("*", (req, res) => {
    res.sendFile(path.join(process.cwd(), "dist/client/index.html"));
  });
}

// Dynamic import for development vite setup
async function setupDevelopmentVite(app: express.Express, server: any) {
  if (isDevelopment) {
    try {
      // Only try to load Vite if we're in true development (with source files)
      const viteModule = await import("./vite.js").catch(() => null);
      
      if (viteModule && viteModule.setupVite) {
        await viteModule.setupVite(app, server);
        log("Development mode: Vite middleware enabled");
      } else {
        // Vite not available, serve static files
        serveStatic(app);
        log("Development mode: Vite not available, serving static files");
      }
    } catch (error) {
      log(`Vite setup failed: ${error.message}`);
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

// Security: Comprehensive security headers middleware for DAST compliance
app.use((req, res, next) => {
  // Security: Validate Content-Type for POST requests
  if (req.method === 'POST' && req.headers['content-type'] && 
      !req.headers['content-type'].includes('application/json') &&
      !req.headers['content-type'].includes('application/x-www-form-urlencoded')) {
    return res.status(400).json({ error: 'Invalid Content-Type' });
  }
  
  // Security: Set comprehensive security headers for DAST compliance
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Security: Permissions Policy Header for feature control
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=(), payment=(), usb=(), magnetometer=(), gyroscope=(), speaker=(), fullscreen=(self), sync-xhr=()');
  
  // Security: Cross-Origin Headers for Spectre vulnerability mitigation
  res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  res.setHeader('Cross-Origin-Resource-Policy', 'same-site');
  
  // Security: Production HTTPS enforcement and comprehensive headers
  if (process.env.NODE_ENV === 'production') {
    // Security: HTTPS enforcement for production
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    
    // Security: HTTPS redirect for production cleartext prevention
    if (req.headers['x-forwarded-proto'] !== 'https' && req.headers.host && !req.headers.host.includes('localhost')) {
      return res.redirect(301, `https://${req.headers.host}${req.url}`);
    }
    
    // Security: Strict CSP for production
    res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'");
  } else {
    // Development: Allow HMR and local development
    res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self' ws: wss:; worker-src 'self' blob:; frame-ancestors 'none'; base-uri 'self'; form-action 'self'");
  }
  
  next();
});

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // Setup development or production serving
  // This is done after setting up all API routes so the catch-all route
  // doesn't interfere with API endpoints
  await setupDevelopmentVite(app, server);

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 5000;
  server.listen({
    port,
    host: "0.0.0.0",  // Bind to all interfaces for Docker
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
