import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from "@shared/schema";
import { logStore } from './adminMiddleware';

const sqlite = new Database('paypal.db');
sqlite.pragma('journal_mode = WAL');

export const db = drizzle(sqlite, { schema });