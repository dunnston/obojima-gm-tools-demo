const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

export interface SyncResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

class SyncService {
  private cache: Map<string, any> = new Map();
  private syncInterval: NodeJS.Timeout | null = null;

  async getCharacters(): Promise<SyncResult<any[]>> {
    try {
      const response = await fetch(`${API_BASE}/api/characters`);
      if (!response.ok) throw new Error('Failed to fetch');
      
      const data = await response.json();
      this.cache.set('characters', data.characters);
      return { success: true, data: data.characters };
    } catch (error) {
      console.error('Sync error:', error);
      // Fall back to cache if available
      const cached = this.cache.get('characters');
      if (cached) {
        return { success: true, data: cached };
      }
      return { success: false, error: 'Failed to sync characters' };
    }
  }

  async saveCharacter(character: any): Promise<SyncResult<void>> {
    try {
      const response = await fetch(`${API_BASE}/api/characters`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(character),
      });
      
      if (!response.ok) throw new Error('Failed to save');
      return { success: true };
    } catch (error) {
      console.error('Save error:', error);
      return { success: false, error: 'Failed to save character' };
    }
  }

  async deleteCharacter(id: string): Promise<SyncResult<void>> {
    try {
      const response = await fetch(`${API_BASE}/api/characters?id=${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) throw new Error('Failed to delete');
      return { success: true };
    } catch (error) {
      console.error('Delete error:', error);
      return { success: false, error: 'Failed to delete character' };
    }
  }

  // Start polling for updates
  startSync(onUpdate: () => void, interval = 5000) {
    this.stopSync();
    
    // Initial sync
    onUpdate();
    
    // Poll for updates
    this.syncInterval = setInterval(onUpdate, interval);
  }

  stopSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  // Generic methods for other data types
  async getData(endpoint: string): Promise<SyncResult<any>> {
    try {
      const response = await fetch(`${API_BASE}/api/${endpoint}`);
      if (!response.ok) throw new Error('Failed to fetch');
      
      const data = await response.json();
      this.cache.set(endpoint, data);
      return { success: true, data };
    } catch (error) {
      const cached = this.cache.get(endpoint);
      if (cached) {
        return { success: true, data: cached };
      }
      return { success: false, error: `Failed to sync ${endpoint}` };
    }
  }

  async saveData(endpoint: string, data: any): Promise<SyncResult<void>> {
    try {
      const response = await fetch(`${API_BASE}/api/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) throw new Error('Failed to save');
      return { success: true };
    } catch (error) {
      return { success: false, error: `Failed to save to ${endpoint}` };
    }
  }
}

export const syncService = new SyncService();