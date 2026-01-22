import { StorageAdapter } from './types';
import Database from '@tauri-apps/plugin-sql';

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
      const database = await getDb();
      const rows = await database.select<Array<{ id: string; data: string; updated_at: string }>>(
        `SELECT * FROM ${table} ORDER BY updated_at DESC`
      );

      return rows.map((row) => ({
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
      const database = await getDb();
      const rows = await database.select<Array<{ id: string; data: string; updated_at: string }>>(
        `SELECT * FROM ${table} WHERE id = $1`,
        [id]
      );

      if (rows.length === 0) return null;

      const row = rows[0];
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
      const database = await getDb();
      const { id: _, ...dataWithoutId } = data;

      await database.execute(
        `INSERT INTO ${table} (id, data, updated_at) VALUES ($1, $2, datetime('now'))`,
        [id, JSON.stringify(dataWithoutId)]
      );
    } catch (error) {
      console.error(`Error creating in ${table}:`, error);
      throw error;
    }
  }

  async update(table: string, id: string, data: any): Promise<void> {
    try {
      const database = await getDb();
      const { id: _, ...dataWithoutId } = data;

      await database.execute(
        `UPDATE ${table} SET data = $1, updated_at = datetime('now') WHERE id = $2`,
        [JSON.stringify(dataWithoutId), id]
      );
    } catch (error) {
      console.error(`Error updating in ${table}:`, error);
      throw error;
    }
  }

  async delete(table: string, id: string): Promise<void> {
    try {
      const database = await getDb();
      await database.execute(
        `DELETE FROM ${table} WHERE id = $1`,
        [id]
      );
    } catch (error) {
      console.error(`Error deleting from ${table}:`, error);
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

      if (rows.length === 0) return null;

      return JSON.parse(rows[0].value);
    } catch (error) {
      console.error(`Error fetching setting ${key}:`, error);
      return null;
    }
  }

  async setSetting(key: string, value: any): Promise<void> {
    try {
      const database = await getDb();
      await database.execute(
        `INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES ($1, $2, datetime('now'))`,
        [key, JSON.stringify(value)]
      );
    } catch (error) {
      console.error(`Error saving setting ${key}:`, error);
      throw error;
    }
  }
}

export function isTauriEnvironment(): boolean {
  return typeof window !== 'undefined' && '__TAURI__' in window;
}
