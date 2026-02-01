import Database from 'better-sqlite3';
import path from 'path';
import { mkdirSync } from 'fs';

// Create database in a data directory
const dbPath = path.join(process.cwd(), 'data', 'obojima.db');

// Singleton instance and initialization state
let dbInstance: Database.Database | null = null;
let isInitializing = false;
let initError: Error | null = null;

/**
 * Initialize the database with proper singleton pattern.
 * Prevents race conditions during concurrent initialization.
 */
function initializeDatabase(): Database.Database {
  // Return existing instance if available
  if (dbInstance) {
    return dbInstance;
  }

  // Check if we hit an initialization error previously
  if (initError) {
    throw initError;
  }

  // Prevent concurrent initialization
  if (isInitializing) {
    throw new Error('Database initialization in progress. Please retry.');
  }

  isInitializing = true;

  try {
    // Ensure data directory exists
    try {
      mkdirSync(path.dirname(dbPath), { recursive: true });
    } catch (error) {
      // Directory might already exist, which is fine
    }

    const db = new Database(dbPath);

    // Configure SQLite for better concurrency
    db.pragma('journal_mode = WAL');
    db.pragma('busy_timeout = 5000'); // Wait up to 5 seconds for locks
    db.pragma('synchronous = NORMAL'); // Good balance of safety and performance

    // Initialize tables
    db.exec(`
      CREATE TABLE IF NOT EXISTS characters (
        id TEXT PRIMARY KEY,
        data TEXT NOT NULL,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY,
        data TEXT NOT NULL,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS quests (
        id TEXT PRIMARY KEY,
        data TEXT NOT NULL,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS downtime_activities (
        id TEXT PRIMARY KEY,
        data TEXT NOT NULL,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS companions (
        id TEXT PRIMARY KEY,
        data TEXT NOT NULL,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS npcs (
        id TEXT PRIMARY KEY,
        data TEXT NOT NULL,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS encounters (
        id TEXT PRIMARY KEY,
        data TEXT NOT NULL,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS user_potions (
        id TEXT PRIMARY KEY,
        data TEXT NOT NULL,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS user_ingredients (
        id TEXT PRIMARY KEY,
        data TEXT NOT NULL,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS user_creatures (
        id TEXT PRIMARY KEY,
        data TEXT NOT NULL,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS user_magic_items (
        id TEXT PRIMARY KEY,
        data TEXT NOT NULL,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS user_companion_types (
        id TEXT PRIMARY KEY,
        data TEXT NOT NULL,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS calendar_events (
        id TEXT PRIMARY KEY,
        data TEXT NOT NULL,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    dbInstance = db;
    return db;
  } catch (error) {
    initError = error instanceof Error ? error : new Error(String(error));
    throw initError;
  } finally {
    isInitializing = false;
  }
}

// Initialize on module load (preserves existing behavior)
const db = initializeDatabase();

export default db;

/**
 * Get the database instance.
 * Useful when you need explicit access to the singleton.
 */
export function getDatabase(): Database.Database {
  if (!dbInstance) {
    return initializeDatabase();
  }
  return dbInstance;
}
