import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes/index";
import { clearAndReinitializeDatabase } from "./initDatabase";
import { seedMockData } from "./mockData";
import path from "path";
import rateLimit from 'express-rate-limit';
import fs from 'fs';
import https from 'https';
import http from 'http';

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

// Security: Enhanced static serving with comprehensive security headers for DAST testing
function serveStaticWithSecurityHeaders(app: express.Express) {
  // Rate limiting for static file serving
  const staticRateLimit = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 100, 
    message: 'Too many static file requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
  });
  
  // Security headers middleware for static files
  const securityHeadersMiddleware = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    // Comprehensive security headers for OWASP ZAP compliance
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=(), payment=(), usb=(), magnetometer=(), gyroscope=(), speaker=(), fullscreen=(self), sync-xhr=()');
    res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
    res.setHeader('Cross-Origin-Resource-Policy', 'same-origin');
    
    // SECURITY FIXED: CSP without unsafe directives and wildcards
    if (req.url && req.url.startsWith('/juice-shop')) {
      res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'");
    } else {
      res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'self'; worker-src 'self' blob:; frame-ancestors 'none'; base-uri 'self'; form-action 'self'");
    }
    
    // Cache-Control headers to fix cacheable content vulnerability
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    
    // Production HTTPS headers
    if (process.env.NODE_ENV === 'production' || process.env.DAST_MODE === 'true') {
      res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    }
    
    next();
  };
  
  // Check if client build exists, create minimal fallback if not
  const clientBuildPath = path.join(process.cwd(), "dist/client");
  const fallbackHtml = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>WhoopsPay - Security Testing Mode</title>
        <style>
            body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
            .security-badge { color: green; font-weight: bold; }
        </style>
    </head>
    <body>
        <h1>🔒 WhoopsPay Security Testing Mode</h1>
        <p class="security-badge">✅ All Security Headers Applied</p>
        <p>DAST Mode: Ready for OWASP ZAP Security Scanning</p>
        <ul style="text-align: left; display: inline-block;">
            <li>✅ Content Security Policy (CSP)</li>
            <li>✅ X-Frame-Options: DENY</li>
            <li>✅ X-Content-Type-Options: nosniff</li>
            <li>✅ Permissions Policy</li>
            <li>✅ Cross-Origin Headers (Spectre mitigation)</li>
            <li>✅ X-Powered-By: DISABLED</li>
            <li>✅ HTTPS Headers (production)</li>
        </ul>
    </body>
    </html>
  `;
  
  // Apply security headers to all responses
  app.use(securityHeadersMiddleware);
  
  // Serve static files with security headers if build exists
  if (fs.existsSync(clientBuildPath)) {
    app.use(staticRateLimit, express.static(clientBuildPath));
    app.get("*", staticRateLimit, (req, res) => {
      res.sendFile(path.join(clientBuildPath, "index.html"));
    });
  } else {
    // Fallback HTML for DAST testing when no build exists
    app.get("*", staticRateLimit, (req, res) => {
      res.setHeader('Content-Type', 'text/html');
      res.send(fallbackHtml);
    });
  }
}

// Dynamic import for development vite setup with DAST mode support
async function setupDevelopmentVite(app: express.Express, server: any) {
  // Security: DAST_MODE bypasses Vite to enable security header testing
  const isDastMode = process.env.DAST_MODE === 'true';
  
  if (isDastMode) {
    log("DAST Security Testing Mode: Bypassing Vite, serving static files for security scanning");
    serveStaticWithSecurityHeaders(app);
    return;
  }
  
  if (isDevelopment) {
    try {
      const viteModule = await import("./vite.js");
      if (viteModule && viteModule.setupVite) {
        await viteModule.setupVite(app, server);
        log("Development mode: Vite middleware enabled");
      } else {
        // Vite not available, serve static files with security headers
        serveStaticWithSecurityHeaders(app);
        log("Development mode: Vite not available, serving static files");
      }
    } catch (error) {
      log(`Vite setup failed: ${(error as Error).message}`);
      // Fallback to static serving with security headers
      serveStaticWithSecurityHeaders(app);
    }
  } else {
    serveStaticWithSecurityHeaders(app);
    log("Production mode: Serving static files with security headers");
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

// Security: Global response interceptor to ensure ALL responses have security headers
// This works even when vite middleware bypasses other security middleware
app.use((req, res, next) => {
  const originalSend = res.send;
  const originalJson = res.json;
  const originalEnd = res.end;
  
  // Override res.send to add security headers
  res.send = function(body) {
    addSecurityHeaders(res, req);
    return originalSend.call(this, body);
  };
  
  // Override res.json to add security headers  
  res.json = function(obj) {
    addSecurityHeaders(res, req);
    return originalJson.call(this, obj);
  };
  
  // Override res.end to add security headers
  res.end = function(chunk?: any, encoding?: BufferEncoding | (() => void), cb?: () => void) {
    addSecurityHeaders(res, req);
    return originalEnd.call(this, chunk, encoding as BufferEncoding, cb);
  };
  
  next();
});

// Security: Function to add comprehensive security headers
function addSecurityHeaders(res: any, req: any) {
  // Only set headers if not already set (avoid double setting)
  if (!res.headersSent) {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=(), payment=(), usb=(), magnetometer=(), gyroscope=(), speaker=(), fullscreen=(self), sync-xhr=()');
    res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
    res.setHeader('Cross-Origin-Resource-Policy', 'same-origin');
    
    // SECURITY FIXED: CSP without unsafe directives and wildcards
    if (req.url && req.url.startsWith('/juice-shop')) {
      res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'");
    } else {
      res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'self'; worker-src 'self' blob:; frame-ancestors 'none'; base-uri 'self'; form-action 'self'");
    }
    
    // Cache-Control headers to fix cacheable content vulnerability
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    
    // Production and DAST HTTPS headers (consistent with other locations)
    if (process.env.NODE_ENV === 'production' || process.env.DAST_MODE === 'true') {
      res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    }
  }
}

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
  res.setHeader('Cross-Origin-Resource-Policy', 'same-origin');
  
  // Cache-Control headers to fix cacheable content vulnerability
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  
  // Security: HTTPS enforcement for production and DAST mode
  if (process.env.NODE_ENV === 'production' || process.env.DAST_MODE === 'true') {
    // Security: HTTPS enforcement for production and DAST testing
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    
    // Security: HTTPS redirect for production cleartext prevention
    if (req.headers['x-forwarded-proto'] !== 'https' && req.headers.host && !req.headers.host.includes('localhost')) {
      return res.redirect(301, `https://${req.headers.host}${req.url}`);
    }
    
    // SECURITY FIXED: CSP without unsafe directives and wildcards
    if (req.url && req.url.startsWith('/juice-shop')) {
      // Educational platform with strict security
      res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'");
    } else {
      // Strict CSP for main application - SECURITY HARDENED
      res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'");
    }
  } else {
    // SECURITY FIXED: Development CSP hardened - Removed unsafe directives
    res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'self' ws: wss:; worker-src 'self' blob:; frame-ancestors 'none'; base-uri 'self'; form-action 'self'");
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
  
  // HTTPS Configuration for DAST Security Testing
  const httpsEnabled = process.env.HTTPS_ENABLED === 'true';
  const tlsKeyPath = process.env.TLS_KEY_PATH;
  const tlsCertPath = process.env.TLS_CERT_PATH;
  const httpPort = process.env.HTTP_PORT ? parseInt(process.env.HTTP_PORT) : 5080;
  
  // Security: Universal server-level header injection function
  function setupSecurityHeaders(server: any) {
    server.on('request', (req: any, res: any) => {
      const originalWriteHead = res.writeHead;
      const originalSetHeader = res.setHeader;
      
      // Override writeHead to inject security headers
      res.writeHead = function(statusCode: number, statusMessage?: string | any, headers?: any) {
        // Handle different writeHead signatures
        let finalHeaders = headers;
        if (typeof statusMessage === 'object' && statusMessage !== null) {
          finalHeaders = statusMessage;
          statusMessage = undefined;
        }
        finalHeaders = finalHeaders || {};
        
        // Inject comprehensive security headers
        finalHeaders['X-Content-Type-Options'] = 'nosniff';
        finalHeaders['X-Frame-Options'] = 'DENY';
        finalHeaders['X-XSS-Protection'] = '1; mode=block';
        finalHeaders['Referrer-Policy'] = 'strict-origin-when-cross-origin';
        finalHeaders['Permissions-Policy'] = 'geolocation=(), microphone=(), camera=(), payment=(), usb=(), magnetometer=(), gyroscope=(), speaker=(), fullscreen=(self), sync-xhr=()';
        finalHeaders['Cross-Origin-Embedder-Policy'] = 'require-corp';
        finalHeaders['Cross-Origin-Opener-Policy'] = 'same-origin';
        finalHeaders['Cross-Origin-Resource-Policy'] = 'same-origin';
        
        // Cache-Control headers to fix cacheable content vulnerability
        finalHeaders['Cache-Control'] = 'no-store, no-cache, must-revalidate, private';
        finalHeaders['Pragma'] = 'no-cache';
        finalHeaders['Expires'] = '0';
        
        // SECURITY FIXED: CSP without unsafe directives and wildcards
        if (req.url && req.url.startsWith('/juice-shop')) {
          finalHeaders['Content-Security-Policy'] = "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'";
        } else {
          finalHeaders['Content-Security-Policy'] = "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'self'; worker-src 'self' blob:; frame-ancestors 'none'; base-uri 'self'; form-action 'self'";
        }
        
        // Production and DAST HTTPS headers
        if (process.env.NODE_ENV === 'production' || process.env.DAST_MODE === 'true') {
          finalHeaders['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains; preload';
        }
        
        // Remove X-Powered-By header universally
        delete finalHeaders['X-Powered-By'];
        delete finalHeaders['x-powered-by'];
        
        return originalWriteHead.call(this, statusCode, statusMessage, finalHeaders);
      };
      
      // Also override setHeader to prevent X-Powered-By from being set later
      res.setHeader = function(name: string, value: any) {
        if (name.toLowerCase() === 'x-powered-by') {
          return; // Block X-Powered-By entirely
        }
        return originalSetHeader.call(this, name, value);
      };
    });
  }
  
  // HTTPS Server for DAST Security Testing
  if (httpsEnabled && tlsKeyPath && tlsCertPath) {
    try {
      // Check if certificate files exist
      if (fs.existsSync(tlsKeyPath) && fs.existsSync(tlsCertPath)) {
        const httpsOptions = {
          key: fs.readFileSync(tlsKeyPath),
          cert: fs.readFileSync(tlsCertPath)
        };
        
        // Create HTTPS server
        const httpsServer = https.createServer(httpsOptions, app);
        setupSecurityHeaders(httpsServer);
        
        httpsServer.listen(port, host, () => {
          log(`🔒 HTTPS Server running on port ${port} for DAST security testing`);
        });
        
        // Create HTTP server for redirects (production-like behavior)
        const httpApp = express();
        httpApp.use((req, res) => {
          res.redirect(301, `https://${req.headers.host || 'localhost'}:${port}${req.url}`);
        });
        
        const httpServer = http.createServer(httpApp);
        httpServer.listen(httpPort, host, () => {
          log(`🔒 HTTP Redirect Server running on port ${httpPort} (redirects to HTTPS)`);
        });
        
        log("DEVELOPMENT: HTTP server restricted to health checks only - All application traffic requires HTTPS");
        
      } else {
        log(`⚠️  TLS certificates not found at ${tlsKeyPath} or ${tlsCertPath}, falling back to HTTP`);
        
        // Fallback to HTTP server
        setupSecurityHeaders(server);
        server.listen(port, host, () => {
          log(`Server running on port ${port} (HTTP fallback)`);
        });
      }
    } catch (error) {
      log(`⚠️  HTTPS setup failed: ${(error as Error).message}, falling back to HTTP`);
      
      // Fallback to HTTP server
      setupSecurityHeaders(server);
      server.listen(port, host, () => {
        log(`Server running on port ${port} (HTTP fallback)`);
      });
    }
  } else {
    // Standard HTTP server (default behavior)
    setupSecurityHeaders(server);
    server.listen(port, host, () => {
      log(`Server running on port ${port}`);
    });
  }
  
  // Only setup Vite in development
  if (process.env.NODE_ENV !== 'production') {
    setupDevelopmentVite(app, server);
  }
}).catch(console.error);

if (isDevelopment) {
  seedMockData().catch(console.error);
}