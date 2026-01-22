import { StorageAdapter } from './types';

// Dynamically get db to avoid bundling better-sqlite3 for client
function getDb() {
  // Use a variable to hide the path from static analysis
  const dbPath = '../db-wrapper';
  return require(dbPath).default;
}

export class SQLiteAdapter implements StorageAdapter {
  async getAll(table: string): Promise<any[]> {
    try {
      const db = getDb();
      if (!db) return [];

      const stmt = db.prepare(`SELECT * FROM ${table} ORDER BY updated_at DESC`);
      const rows = stmt.all();
      
      return rows.map((row: any) => ({
        id: row.id,
        ...JSON.parse(row.data),
        _lastUpdated: row.updated_at
      }));
    } catch (error) {
      console.error(`Error fetching from ${table}:`, error);
      return [];
    }
  }

  async get(table: string, id: string): Promise<any | null> {
    try {
      const db = getDb();
      if (!db) return null;

      const stmt = db.prepare(`SELECT * FROM ${table} WHERE id = ?`);
      const row = stmt.get(id) as any;

      if (!row) return null;

      return {
        id: row.id,
        ...JSON.parse(row.data),
        _lastUpdated: row.updated_at
      };
    } catch (error) {
      console.error(`Error fetching ${id} from ${table}:`, error);
      return null;
    }
  }

  async create(table: string, id: string, data: any): Promise<void> {
    try {
      const db = getDb();
      if (!db) return;

      const stmt = db.prepare(`
        INSERT INTO ${table} (id, data, updated_at)
        VALUES (?, ?, CURRENT_TIMESTAMP)
      `);

      const { id: _, ...dataWithoutId } = data;
      stmt.run(id, JSON.stringify(dataWithoutId));
    } catch (error) {
      console.error(`Error creating in ${table}:`, error);
      throw error;
    }
  }

  async update(table: string, id: string, data: any): Promise<void> {
    try {
      const db = getDb();
      if (!db) return;

      const stmt = db.prepare(`
        UPDATE ${table}
        SET data = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `);

      const { id: _, ...dataWithoutId } = data;
      stmt.run(JSON.stringify(dataWithoutId), id);
    } catch (error) {
      console.error(`Error updating in ${table}:`, error);
      throw error;
    }
  }

  async delete(table: string, id: string): Promise<void> {
    try {
      const db = getDb();
      if (!db) return;

      const stmt = db.prepare(`DELETE FROM ${table} WHERE id = ?`);
      stmt.run(id);
    } catch (error) {
      console.error(`Error deleting from ${table}:`, error);
      throw error;
    }
  }

  async getSetting(key: string): Promise<any | null> {
    try {
      const db = getDb();
      if (!db) return null;

      const stmt = db.prepare('SELECT value FROM settings WHERE key = ?');
      const row = stmt.get(key) as any;

      if (!row) return null;

      return JSON.parse(row.value);
    } catch (error) {
      console.error(`Error fetching setting ${key}:`, error);
      return null;
    }
  }

  async setSetting(key: string, value: any): Promise<void> {
    try {
      const db = getDb();
      if (!db) return;

      const stmt = db.prepare(`
        INSERT OR REPLACE INTO settings (key, value, updated_at)
        VALUES (?, ?, CURRENT_TIMESTAMP)
      `);

      stmt.run(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error saving setting ${key}:`, error);
      throw error;
    }
  }
}