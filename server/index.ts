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
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

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
