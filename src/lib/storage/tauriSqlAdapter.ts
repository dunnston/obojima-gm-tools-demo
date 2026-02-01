import { StorageAdapter } from './types';
import Database from '@tauri-apps/plugin-sql';
import { validateTableName } from '@/lib/utils/tableValidator';
import { safeJsonParseOrDefault, safeJsonStringify } from '@/lib/utils/safeJson';
import { logger } from '@/lib/utils/logger';

let db: Database | null = null;

async function getDb(): Promise<Database> {
  if (!db) {
    db = await Database.load('sqlite:obojima.db');
  }
  return db;
}

export class TauriSQLAdapter implements StorageAdapter {
  async getAll(table: string): Promise<any[]> {
    try {
      // Validate table name to prevent SQL injection
      const validTable = validateTableName(table);

      const database = await getDb();
      const rows = await database.select<Array<{ id: string; data: string; updated_at: string }>>(
        `SELECT * FROM ${validTable} ORDER BY updated_at DESC`
      );

      // Handle null/undefined rows
      if (!rows || !Array.isArray(rows)) {
        logger.warn(`Invalid rows returned for table ${table}`);
        return [];
      }

      return rows
        .map((row) => {
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

      const database = await getDb();
      const rows = await database.select<Array<{ id: string; data: string; updated_at: string }>>(
        `SELECT * FROM ${validTable} WHERE id = $1`,
        [id]
      );

      if (!rows || rows.length === 0) return null;

      const row = rows[0];
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

      const database = await getDb();
      const { id: _, ...dataWithoutId } = data;

      const jsonData = safeJsonStringify(dataWithoutId);
      if (jsonData === null) {
        throw new Error('Failed to serialize data');
      }

      await database.execute(
        `INSERT INTO ${validTable} (id, data, updated_at) VALUES ($1, $2, datetime('now'))`,
        [id, jsonData]
      );
    } catch (error) {
      logger.error(`Error creating in ${table}:`, error);
      throw error;
    }
  }

  async update(table: string, id: string, data: any): Promise<void> {
    try {
      // Validate table name to prevent SQL injection
      const validTable = validateTableName(table);

      const database = await getDb();
      const { id: _, ...dataWithoutId } = data;

      const jsonData = safeJsonStringify(dataWithoutId);
      if (jsonData === null) {
        throw new Error('Failed to serialize data');
      }

      await database.execute(
        `UPDATE ${validTable} SET data = $1, updated_at = datetime('now') WHERE id = $2`,
        [jsonData, id]
      );
    } catch (error) {
      logger.error(`Error updating in ${table}:`, error);
      throw error;
    }
  }

  async delete(table: string, id: string): Promise<void> {
    try {
      // Validate table name to prevent SQL injection
      const validTable = validateTableName(table);

      const database = await getDb();
      await database.execute(
        `DELETE FROM ${validTable} WHERE id = $1`,
        [id]
      );
    } catch (error) {
      logger.error(`Error deleting from ${table}:`, error);
      throw error;
    }
  }

  async getSetting(key: string): Promise<any | null> {
    try {
      const database = await getDb();
      const rows = await database.select<Array<{ value: string }>>(
        'SELECT value FROM settings WHERE key = $1',
        [key]
      );

      if (!rows || rows.length === 0) return null;

      const row = rows[0];
      if (!row || !row.value) return null;

      return safeJsonParseOrDefault(row.value, null);
    } catch (error) {
      logger.error(`Error fetching setting ${key}:`, error);
      return null;
    }
  }

  async setSetting(key: string, value: any): Promise<void> {
    try {
      const database = await getDb();

      const jsonValue = safeJsonStringify(value);
      if (jsonValue === null) {
        throw new Error('Failed to serialize setting value');
      }

      await database.execute(
        `INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES ($1, $2, datetime('now'))`,
        [key, jsonValue]
      );
    } catch (error) {
      logger.error(`Error saving setting ${key}:`, error);
      throw error;
    }
  }
}

export function isTauriEnvironment(): boolean {
  return typeof window !== 'undefined' && '__TAURI__' in window;
}
