import { StorageAdapter } from './types';
import { validateTableName } from '@/lib/utils/tableValidator';
import { safeJsonParseOrDefault, safeJsonStringify } from '@/lib/utils/safeJson';
import { logger } from '@/lib/utils/logger';

// Dynamically get db to avoid bundling better-sqlite3 for client
function getDb() {
  // Use a variable to hide the path from static analysis
  const dbPath = '../db-wrapper';
  return require(dbPath).default;
}

export class SQLiteAdapter implements StorageAdapter {
  async getAll(table: string): Promise<any[]> {
    try {
      // Validate table name to prevent SQL injection
      const validTable = validateTableName(table);

      const db = getDb();
      if (!db) return [];

      const stmt = db.prepare(`SELECT * FROM ${validTable} ORDER BY updated_at DESC`);
      const rows = stmt.all();

      // Handle null/undefined rows
      if (!rows || !Array.isArray(rows)) {
        logger.warn(`Invalid rows returned for table ${table}`);
        return [];
      }

      return rows
        .map((row: any) => {
          if (!row || !row.data) {
            logger.warn(`Skipping invalid row in ${table}:`, row?.id);
            return null;
          }

          const parsedData = safeJsonParseOrDefault(row.data, {});
          return {
            id: row.id,
            ...parsedData,
            _lastUpdated: row.updated_at
          };
        })
        .filter(Boolean);
    } catch (error) {
      logger.error(`Error fetching from ${table}:`, error);
      return [];
    }
  }

  async get(table: string, id: string): Promise<any | null> {
    try {
      // Validate table name to prevent SQL injection
      const validTable = validateTableName(table);

      const db = getDb();
      if (!db) return null;

      const stmt = db.prepare(`SELECT * FROM ${validTable} WHERE id = ?`);
      const row = stmt.get(id) as any;

      if (!row || !row.data) return null;

      const parsedData = safeJsonParseOrDefault(row.data, {});
      return {
        id: row.id,
        ...parsedData,
        _lastUpdated: row.updated_at
      };
    } catch (error) {
      logger.error(`Error fetching ${id} from ${table}:`, error);
      return null;
    }
  }

  async create(table: string, id: string, data: any): Promise<void> {
    try {
      // Validate table name to prevent SQL injection
      const validTable = validateTableName(table);

      const db = getDb();
      if (!db) return;

      const stmt = db.prepare(`
        INSERT INTO ${validTable} (id, data, updated_at)
        VALUES (?, ?, CURRENT_TIMESTAMP)
      `);

      const { id: _, ...dataWithoutId } = data;
      const jsonData = safeJsonStringify(dataWithoutId);
      if (jsonData === null) {
        throw new Error('Failed to serialize data');
      }
      stmt.run(id, jsonData);
    } catch (error) {
      logger.error(`Error creating in ${table}:`, error);
      throw error;
    }
  }

  async update(table: string, id: string, data: any): Promise<void> {
    try {
      // Validate table name to prevent SQL injection
      const validTable = validateTableName(table);

      const db = getDb();
      if (!db) return;

      const stmt = db.prepare(`
        UPDATE ${validTable}
        SET data = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `);

      const { id: _, ...dataWithoutId } = data;
      const jsonData = safeJsonStringify(dataWithoutId);
      if (jsonData === null) {
        throw new Error('Failed to serialize data');
      }
      stmt.run(jsonData, id);
    } catch (error) {
      logger.error(`Error updating in ${table}:`, error);
      throw error;
    }
  }

  async delete(table: string, id: string): Promise<void> {
    try {
      // Validate table name to prevent SQL injection
      const validTable = validateTableName(table);

      const db = getDb();
      if (!db) return;

      const stmt = db.prepare(`DELETE FROM ${validTable} WHERE id = ?`);
      stmt.run(id);
    } catch (error) {
      logger.error(`Error deleting from ${table}:`, error);
      throw error;
    }
  }

  async getSetting(key: string): Promise<any | null> {
    try {
      const db = getDb();
      if (!db) return null;

      const stmt = db.prepare('SELECT value FROM settings WHERE key = ?');
      const row = stmt.get(key) as any;

      if (!row || !row.value) return null;

      return safeJsonParseOrDefault(row.value, null);
    } catch (error) {
      logger.error(`Error fetching setting ${key}:`, error);
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

      const jsonValue = safeJsonStringify(value);
      if (jsonValue === null) {
        throw new Error('Failed to serialize setting value');
      }
      stmt.run(key, jsonValue);
    } catch (error) {
      logger.error(`Error saving setting ${key}:`, error);
      throw error;
    }
  }
}
