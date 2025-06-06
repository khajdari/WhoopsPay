import Database from 'better-sqlite3';

export function clearAndReinitializeDatabase() {
  const db = new Database('./data/whoopspay.db');
  
  console.log('Starting database cleanup and reinitialization...');
  
  // Drop all tables to ensure clean state
  const tables = [
    'sessions',
    'users', 
    'transactions',
    'payment_methods',
    'user_sessions',
    'notifications',
    'issue_reports'
  ];
  
  tables.forEach(table => {
    try {
      db.exec(`DROP TABLE IF EXISTS ${table}`);
      console.log(`Dropped table: ${table}`);
    } catch (error) {
      console.log(`Note: Table ${table} did not exist`);
    }
  });
  
  console.log('All tables cleared. Creating fresh database structure...');
  
  db.close();
  
  // Now initialize with fresh tables
  initializeDatabase();
}

export function initializeDatabase() {
  const db = new Database('./data/whoopspay.db');
  
  // Create sessions table
  db.exec(`
    CREATE TABLE IF NOT EXISTS sessions (
      sid TEXT PRIMARY KEY,
      sess TEXT NOT NULL,
      expire INTEGER NOT NULL
    );
  `);
  
  db.exec(`CREATE INDEX IF NOT EXISTS IDX_session_expire ON sessions(expire);`);

  // Create users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY NOT NULL,
      email TEXT,
      first_name TEXT,
      last_name TEXT,
      profile_image_url TEXT,
      created_at INTEGER,
      updated_at INTEGER,
      password TEXT,
      ssn TEXT,
      address TEXT,
      phone_number TEXT,
      date_of_birth TEXT,
      nationality TEXT,
      gender TEXT,
      balance REAL,
      is_admin INTEGER
    );
  `);

  // Create transactions table
  db.exec(`
    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      from_user_id TEXT NOT NULL,
      to_user_id TEXT NOT NULL,
      amount REAL NOT NULL,
      description TEXT,
      status TEXT,
      type TEXT,
      created_at INTEGER,
      external_order_id TEXT,
      external_source TEXT,
      return_url TEXT,
      cancel_url TEXT,
      external_metadata TEXT
    );
  `);

  // Create payment_methods table
  db.exec(`
    CREATE TABLE IF NOT EXISTS payment_methods (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      type TEXT NOT NULL,
      card_number TEXT,
      card_name TEXT,
      bank_name TEXT,
      account_number TEXT,
      iban TEXT,
      is_default INTEGER,
      created_at INTEGER
    );
  `);

  // Create user_sessions table
  db.exec(`
    CREATE TABLE IF NOT EXISTS user_sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      session_token TEXT NOT NULL,
      ip_address TEXT,
      user_agent TEXT,
      is_active INTEGER,
      created_at INTEGER,
      expires_at INTEGER
    );
  `);

  // Create notifications table
  db.exec(`
    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      type TEXT,
      is_read INTEGER,
      created_at INTEGER
    );
  `);

  // Create issue_reports table
  db.exec(`
    CREATE TABLE IF NOT EXISTS issue_reports (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      category TEXT NOT NULL,
      priority TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'open',
      admin_notes TEXT,
      assigned_to TEXT,
      attachment_url TEXT,
      user_agent TEXT,
      ip_address TEXT,
      created_at INTEGER,
      updated_at INTEGER,
      resolved_at INTEGER
    );
  `);

  db.close();
  console.log('Database tables initialized successfully');
}