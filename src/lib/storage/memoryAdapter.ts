import { StorageAdapter } from './types';

// In-memory storage for demo mode on server-side
// This data is ephemeral and will be lost when the serverless function restarts
export class MemoryAdapter implements StorageAdapter {
  private static instance: MemoryAdapter;
  private storage: Map<string, Map<string, any>> = new Map();
  private settings: Map<string, any> = new Map();

  constructor() {
    // Singleton to maintain data across requests within the same serverless instance
    if (MemoryAdapter.instance) {
      return MemoryAdapter.instance;
    }
    MemoryAdapter.instance = this;
  }

  async getAll(table: string): Promise<any[]> {
    try {
      const tableData = this.storage.get(table);
      if (!tableData) return [];

      return Array.from(tableData.values()).sort((a: any, b: any) => {
        const dateA = new Date(a._lastUpdated || 0).getTime();
        const dateB = new Date(b._lastUpdated || 0).getTime();
        return dateB - dateA;
      });
    } catch (error) {
      console.error(`Error fetching from memory ${table}:`, error);
      return [];
    }
  }

  async get(table: string, id: string): Promise<any | null> {
    try {
      const tableData = this.storage.get(table);
      if (!tableData) return null;

      return tableData.get(id) || null;
    } catch (error) {
      console.error(`Error fetching ${id} from memory ${table}:`, error);
      return null;
    }
  }

  async create(table: string, id: string, data: any): Promise<void> {
    try {
      if (!this.storage.has(table)) {
        this.storage.set(table, new Map());
      }

      const tableData = this.storage.get(table)!;
      tableData.set(id, {
        ...data,
        id,
        _lastUpdated: new Date().toISOString()
      });
    } catch (error) {
      console.error(`Error creating in memory ${table}:`, error);
      throw error;
    }
  }

  async update(table: string, id: string, data: any): Promise<void> {
    try {
      const tableData = this.storage.get(table);
      if (!tableData || !tableData.has(id)) {
        throw new Error(`Item ${id} not found in ${table}`);
      }

      tableData.set(id, {
        ...data,
        id,
        _lastUpdated: new Date().toISOString()
      });
    } catch (error) {
      console.error(`Error updating in memory ${table}:`, error);
      throw error;
    }
  }

  async delete(table: string, id: string): Promise<void> {
    try {
      const tableData = this.storage.get(table);
      if (!tableData) return;

      tableData.delete(id);
    } catch (error) {
      console.error(`Error deleting from memory ${table}:`, error);
      throw error;
    }
  }

  async getSetting(key: string): Promise<any | null> {
    try {
      return this.settings.get(key) || null;
    } catch (error) {
      console.error(`Error fetching setting ${key}:`, error);
      return null;
    }
  }

  async setSetting(key: string, value: any): Promise<void> {
    try {
      this.settings.set(key, value);
    } catch (error) {
      console.error(`Error saving setting ${key}:`, error);
      throw error;
    }
  }
}