import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from "@shared/schema";

// Use SQLite for reliable local development
const sqlite = new Database('./data/whoopspay.db');
export const db = drizzle(sqlite, { schema });