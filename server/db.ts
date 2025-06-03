import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";
import { logStore } from './adminMiddleware';

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Create a proxy to log all database operations
const originalQuery = pool.query.bind(pool);
pool.query = function(text: any, params?: any) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] DB Query: ${typeof text === 'string' ? text : text.text} ${params ? `Params: ${JSON.stringify(params)}` : ''}`;
  logStore.addDbLog(logMessage);
  return originalQuery(text, params);
};

export const db = drizzle({ client: pool, schema });