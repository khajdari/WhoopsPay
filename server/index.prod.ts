import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes/index";
import { clearAndReinitializeDatabase } from "./initDatabase";
import { seedMockData } from "./mockData";
import path from "path";

// Production-only server entry point (no vite imports)

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

// Track server start time
export const serverStartTime = new Date();

// Clear and reinitialize database on every restart
async function initializeSystem() {
  clearAndReinitializeDatabase();
}

async function startServer() {
  const app = express();
  
  // Clear and reinitialize database
  await initializeSystem();

  // Seed mock data after database initialization
  try {
    await seedMockData();
    log("Database seeded with mock data", "database");
  } catch (error) {
    log(`Mock data seeding failed: ${error.message}`, "database");
  }

  // Register all API routes
  const httpServer = await registerRoutes(app);
  
  // Serve static files in production
  serveStatic(app);
  log("Production mode: Serving static files");

  const port = Number(process.env.PORT) || 5000;
  
  httpServer.listen(port, "0.0.0.0", () => {
    log(`serving on port ${port}`);
  });
}

// Handle uncaught errors
process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});

// Start the server
startServer().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});