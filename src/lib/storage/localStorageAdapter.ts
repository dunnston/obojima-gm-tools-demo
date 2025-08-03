import { StorageAdapter } from './types';

export class LocalStorageAdapter implements StorageAdapter {
  private prefix = 'obojima-demo-';

  private getStorageKey(table: string): string {
    return `${this.prefix}${table}`;
  }

  private getSettingKey(key: string): string {
    return `${this.prefix}setting-${key}`;
  }

  async getAll(table: string): Promise<any[]> {
    try {
      const key = this.getStorageKey(table);
      const data = localStorage.getItem(key);
      
      if (!data) return [];
      
      const items = JSON.parse(data);
      return Object.values(items).sort((a: any, b: any) => {
        const dateA = new Date(a._lastUpdated || 0).getTime();
        const dateB = new Date(b._lastUpdated || 0).getTime();
        return dateB - dateA;
      });
    } catch (error) {
      console.error(`Error fetching from localStorage ${table}:`, error);
      return [];
    }
  }

  async get(table: string, id: string): Promise<any | null> {
    try {
      const key = this.getStorageKey(table);
      const data = localStorage.getItem(key);
      
      if (!data) return null;
      
      const items = JSON.parse(data);
      return items[id] || null;
    } catch (error) {
      console.error(`Error fetching ${id} from localStorage ${table}:`, error);
      return null;
    }
  }

  async create(table: string, id: string, data: any): Promise<void> {
    try {
      const key = this.getStorageKey(table);
      const existingData = localStorage.getItem(key);
      const items = existingData ? JSON.parse(existingData) : {};
      
      items[id] = {
        ...data,
        id,
        _lastUpdated: new Date().toISOString()
      };
      
      localStorage.setItem(key, JSON.stringify(items));
    } catch (error) {
      console.error(`Error creating in localStorage ${table}:`, error);
      throw error;
    }
  }

  async update(table: string, id: string, data: any): Promise<void> {
    try {
      const key = this.getStorageKey(table);
      const existingData = localStorage.getItem(key);
      const items = existingData ? JSON.parse(existingData) : {};
      
      if (!items[id]) {
        throw new Error(`Item ${id} not found in ${table}`);
      }
      
      items[id] = {
        ...data,
        id,
        _lastUpdated: new Date().toISOString()
      };
      
      localStorage.setItem(key, JSON.stringify(items));
    } catch (error) {
      console.error(`Error updating in localStorage ${table}:`, error);
      throw error;
    }
  }

  async delete(table: string, id: string): Promise<void> {
    try {
      const key = this.getStorageKey(table);
      const existingData = localStorage.getItem(key);
      
      if (!existingData) return;
      
      const items = JSON.parse(existingData);
      delete items[id];
      
      localStorage.setItem(key, JSON.stringify(items));
    } catch (error) {
      console.error(`Error deleting from localStorage ${table}:`, error);
      throw error;
    }
  }

  async getSetting(key: string): Promise<any | null> {
    try {
      const storageKey = this.getSettingKey(key);
      const value = localStorage.getItem(storageKey);
      
      if (!value) return null;
      
      return JSON.parse(value);
    } catch (error) {
      console.error(`Error fetching setting ${key} from localStorage:`, error);
      return null;
    }
  }

  async setSetting(key: string, value: any): Promise<void> {
    try {
      const storageKey = this.getSettingKey(key);
      localStorage.setItem(storageKey, JSON.stringify(value));
    } catch (error) {
      console.error(`Error saving setting ${key} to localStorage:`, error);
      throw error;
    }
  }

  // Helper method to clear all demo data
  clearAll(): void {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith(this.prefix)) {
        localStorage.removeItem(key);
      }
    });
  }

  // Helper method to export all data
  exportData(): string {
    const data: Record<string, any> = {};
    const keys = Object.keys(localStorage);
    
    keys.forEach(key => {
      if (key.startsWith(this.prefix)) {
        const value = localStorage.getItem(key);
        if (value) {
          data[key.replace(this.prefix, '')] = JSON.parse(value);
        }
      }
    });
    
    return JSON.stringify(data, null, 2);
  }

  // Helper method to import data
  importData(jsonData: string): void {
    try {
      const data = JSON.parse(jsonData);
      
      Object.entries(data).forEach(([key, value]) => {
        localStorage.setItem(this.prefix + key, JSON.stringify(value));
      });
    } catch (error) {
      console.error('Error importing data:', error);
      throw error;
    }
  }
}