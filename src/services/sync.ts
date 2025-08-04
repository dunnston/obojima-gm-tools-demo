const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

export interface SyncResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export type DataType = 'characters' | 'sessions' | 'quests' | 'encounters' | 'downtime' | 'companions' | 'npcs' | 'settings' | 'user-potions' | 'user-ingredients' | 'user-creatures' | 'user-magic-items' | 'user-companion-types';

class SyncService {
  private cache: Map<string, any> = new Map();
  private syncInterval: NodeJS.Timeout | null = null;
  private syncCallbacks: Map<string, (() => void)[]> = new Map();

  // Generic data fetching
  async getData(dataType: DataType): Promise<SyncResult<any[]>> {
    try {
      const response = await fetch(`${API_BASE}/api/${dataType}`);
      if (!response.ok) throw new Error('Failed to fetch');
      
      const data = await response.json();
      const dataKey = Object.keys(data)[0]; // e.g., 'characters', 'sessions', etc.
      const items = data[dataKey] || [];
      
      this.cache.set(dataType, items);
      return { success: true, data: items };
    } catch (error) {
      console.error(`Sync error for ${dataType}:`, error);
      // Fall back to cache if available
      const cached = this.cache.get(dataType);
      if (cached) {
        return { success: true, data: cached };
      }
      return { success: false, error: `Failed to sync ${dataType}` };
    }
  }

  // Generic data saving
  async saveData(dataType: DataType, item: any): Promise<SyncResult<void>> {
    try {
      const response = await fetch(`${API_BASE}/api/${dataType}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      });
      
      if (!response.ok) throw new Error('Failed to save');
      return { success: true };
    } catch (error) {
      console.error(`Save error for ${dataType}:`, error);
      return { success: false, error: `Failed to save ${dataType}` };
    }
  }

  // Generic data deletion
  async deleteData(dataType: DataType, id: string): Promise<SyncResult<void>> {
    try {
      const response = await fetch(`${API_BASE}/api/${dataType}?id=${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) throw new Error('Failed to delete');
      return { success: true };
    } catch (error) {
      console.error(`Delete error for ${dataType}:`, error);
      return { success: false, error: `Failed to delete ${dataType}` };
    }
  }

  // Settings-specific methods (since they work differently)
  async getSettings(): Promise<SyncResult<any>> {
    try {
      const response = await fetch(`${API_BASE}/api/settings`);
      if (!response.ok) throw new Error('Failed to fetch');
      
      const data = await response.json();
      this.cache.set('settings', data.settings);
      return { success: true, data: data.settings };
    } catch (error) {
      console.error('Settings sync error:', error);
      const cached = this.cache.get('settings');
      if (cached) {
        return { success: true, data: cached };
      }
      return { success: false, error: 'Failed to sync settings' };
    }
  }

  async saveSetting(key: string, value: any): Promise<SyncResult<void>> {
    try {
      const response = await fetch(`${API_BASE}/api/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value }),
      });
      
      if (!response.ok) throw new Error('Failed to save');
      return { success: true };
    } catch (error) {
      console.error('Settings save error:', error);
      return { success: false, error: 'Failed to save setting' };
    }
  }

  // Convenience methods for backward compatibility
  async getCharacters(): Promise<SyncResult<any[]>> {
    return this.getData('characters');
  }

  async saveCharacter(character: any): Promise<SyncResult<void>> {
    return this.saveData('characters', character);
  }

  async deleteCharacter(id: string): Promise<SyncResult<void>> {
    return this.deleteData('characters', id);
  }

  // New convenience methods for other data types
  async getSessions(): Promise<SyncResult<any[]>> {
    return this.getData('sessions');
  }

  async saveSession(session: any): Promise<SyncResult<void>> {
    return this.saveData('sessions', session);
  }

  async deleteSession(id: string): Promise<SyncResult<void>> {
    return this.deleteData('sessions', id);
  }

  async getQuests(): Promise<SyncResult<any[]>> {
    return this.getData('quests');
  }

  async saveQuest(quest: any): Promise<SyncResult<void>> {
    return this.saveData('quests', quest);
  }

  async deleteQuest(id: string): Promise<SyncResult<void>> {
    return this.deleteData('quests', id);
  }

  async getEncounters(): Promise<SyncResult<any[]>> {
    return this.getData('encounters');
  }

  async saveEncounter(encounter: any): Promise<SyncResult<void>> {
    return this.saveData('encounters', encounter);
  }

  async deleteEncounter(id: string): Promise<SyncResult<void>> {
    return this.deleteData('encounters', id);
  }

  async getDowntimeActivities(): Promise<SyncResult<any[]>> {
    return this.getData('downtime');
  }

  async saveDowntimeActivity(activity: any): Promise<SyncResult<void>> {
    return this.saveData('downtime', activity);
  }

  async deleteDowntimeActivity(id: string): Promise<SyncResult<void>> {
    return this.deleteData('downtime', id);
  }

  async getCompanions(): Promise<SyncResult<any[]>> {
    return this.getData('companions');
  }

  async saveCompanion(companion: any): Promise<SyncResult<void>> {
    return this.saveData('companions', companion);
  }

  async deleteCompanion(id: string): Promise<SyncResult<void>> {
    return this.deleteData('companions', id);
  }

  async getNpcs(): Promise<SyncResult<any[]>> {
    return this.getData('npcs');
  }

  async saveNpc(npc: any): Promise<SyncResult<void>> {
    return this.saveData('npcs', npc);
  }

  async deleteNpc(id: string): Promise<SyncResult<void>> {
    return this.deleteData('npcs', id);
  }

  // User-generated content methods
  async getUserPotions(): Promise<SyncResult<any[]>> {
    return this.getData('user-potions');
  }

  async saveUserPotion(potion: any): Promise<SyncResult<void>> {
    return this.saveData('user-potions', potion);
  }

  async deleteUserPotion(id: string): Promise<SyncResult<void>> {
    return this.deleteData('user-potions', id);
  }

  async getUserIngredients(): Promise<SyncResult<any[]>> {
    return this.getData('user-ingredients');
  }

  async saveUserIngredient(ingredient: any): Promise<SyncResult<void>> {
    return this.saveData('user-ingredients', ingredient);
  }

  async deleteUserIngredient(id: string): Promise<SyncResult<void>> {
    return this.deleteData('user-ingredients', id);
  }

  async getUserCreatures(): Promise<SyncResult<any[]>> {
    return this.getData('user-creatures');
  }

  async saveUserCreature(creature: any): Promise<SyncResult<void>> {
    return this.saveData('user-creatures', creature);
  }

  async deleteUserCreature(id: string): Promise<SyncResult<void>> {
    return this.deleteData('user-creatures', id);
  }

  async getUserMagicItems(): Promise<SyncResult<any[]>> {
    return this.getData('user-magic-items');
  }

  async saveUserMagicItem(item: any): Promise<SyncResult<void>> {
    return this.saveData('user-magic-items', item);
  }

  async deleteUserMagicItem(id: string): Promise<SyncResult<void>> {
    return this.deleteData('user-magic-items', id);
  }

  async getUserCompanionTypes(): Promise<SyncResult<any[]>> {
    return this.getData('user-companion-types');
  }

  async saveUserCompanionType(type: any): Promise<SyncResult<void>> {
    return this.saveData('user-companion-types', type);
  }

  async deleteUserCompanionType(id: string): Promise<SyncResult<void>> {
    return this.deleteData('user-companion-types', id);
  }

  // Register callbacks for specific data types
  onDataUpdate(dataType: DataType, callback: () => void) {
    if (!this.syncCallbacks.has(dataType)) {
      this.syncCallbacks.set(dataType, []);
    }
    this.syncCallbacks.get(dataType)?.push(callback);
  }

  // Start polling for updates with support for multiple data types
  startSync(dataTypes: DataType[] | (() => void), onUpdate?: () => void, interval = 5000) {
    this.stopSync();
    
    // Handle backward compatibility
    if (typeof dataTypes === 'function') {
      // Old API: startSync(callback, interval)
      const callback = dataTypes;
      const oldInterval = onUpdate as number || interval;
      callback();
      this.syncInterval = setInterval(callback, oldInterval);
      return;
    }
    
    // New API: startSync(['characters', 'sessions'], callback, interval)
    const types = dataTypes as DataType[];
    const callback = onUpdate!;
    
    // Initial sync
    callback();
    
    // Poll for updates
    this.syncInterval = setInterval(() => {
      callback();
      
      // Trigger specific callbacks for each data type
      types.forEach(dataType => {
        const callbacks = this.syncCallbacks.get(dataType) || [];
        callbacks.forEach(cb => cb());
      });
    }, interval);
  }

  stopSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  // Helper method to sync data with localStorage fallback
  async syncWithFallback(dataType: DataType, localStorageKey: string, validator?: (item: any) => any): Promise<any[]> {
    try {
      const result = await this.getData(dataType);
      
      if (result.success && result.data) {
        let validatedData = validator ? result.data.map(validator) : result.data;
        
        // Special handling for potions to ensure they have IDs
        if (dataType === 'user-potions') {
          validatedData = validatedData.map(potion => ({
            ...potion,
            id: potion.id || `potion-${potion.category}-${potion.number}`
          }));
        }
        
        // Update localStorage as backup
        localStorage.setItem(localStorageKey, JSON.stringify(validatedData));
        return validatedData;
      } else {
        // Fall back to localStorage
        const savedData = localStorage.getItem(localStorageKey);
        if (savedData) {
          const parsed = JSON.parse(savedData);
          return validator ? parsed.map(validator) : parsed;
        }
        return [];
      }
    } catch (error) {
      console.error(`Error syncing ${dataType}:`, error);
      
      // Fall back to localStorage
      const savedData = localStorage.getItem(localStorageKey);
      if (savedData) {
        const parsed = JSON.parse(savedData);
        return validator ? parsed.map(validator) : parsed;
      }
      return [];
    }
  }

  // Helper method to save data with localStorage backup
  async saveWithFallback(dataType: DataType, localStorageKey: string, items: any[]): Promise<void> {
    try {
      // Save to localStorage immediately for offline support
      localStorage.setItem(localStorageKey, JSON.stringify(items));
      
      // For user-potions, we need special handling to avoid duplicates
      if (dataType === 'user-potions') {
        // First, get all existing potions from the server
        const existingResult = await this.getData(dataType);
        const existingPotions = existingResult.data || [];
        
        // Create a map of existing potions by ID
        const existingMap = new Map(existingPotions.map(p => [p.id, true]));
        
        // Delete potions that are no longer in the items array
        for (const existing of existingPotions) {
          if (!items.find(item => item.id === existing.id)) {
            await this.deleteData(dataType, existing.id);
          }
        }
        
        // Save each item (create or update based on whether it exists)
        for (const item of items) {
          if (item.id && existingMap.has(item.id)) {
            // Update existing
            await this.saveData(dataType, item);
          } else {
            // Create new
            await this.saveData(dataType, item);
          }
        }
      } else {
        // Original behavior for other data types
        for (const item of items) {
          await this.saveData(dataType, item);
        }
      }
    } catch (error) {
      console.error(`Error saving ${dataType}:`, error);
      throw new Error(`Error saving data. Data saved locally but may not sync to other devices.`);
    }
  }
}

export const syncService = new SyncService();