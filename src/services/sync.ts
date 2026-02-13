const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';
const IS_DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

// Import demo data
import { DEMO_NPCS, DEMO_COMPANIONS, mergeWithDemoData, shouldUseDemoData } from '@/data/demoData';

// Import Tauri storage adapter
import { getStorageAdapter, isTauriEnvironment, isNetworkClient } from '@/lib/storage';

// Import validation utilities
import { validateFileSize, getMaxFileSizeForType, formatFileSize } from '@/lib/utils/validation';
import { logger } from '@/lib/utils/logger';

// Check if we're in Tauri environment
function isTauri(): boolean {
  return typeof window !== 'undefined' && isTauriEnvironment();
}

// Check if we should use the storage adapter directly (Tauri or network client)
function useDirectStorageAdapter(): boolean {
  const isTauriEnv = isTauri();
  const isNetClient = isNetworkClient();
  const result = isTauriEnv || isNetClient;
  console.log(`[SyncService] useDirectStorageAdapter: isTauri=${isTauriEnv}, isNetworkClient=${isNetClient}, result=${result}`);
  return result;
}

// Map data types to table names for storage adapter
const DATA_TYPE_TO_TABLE: Record<DataType, string> = {
  'characters': 'characters',
  'sessions': 'sessions',
  'quests': 'quests',
  'encounters': 'encounters',
  'downtime': 'downtime_activities',
  'companions': 'companions',
  'npcs': 'npcs',
  'settings': 'settings',
  'user-potions': 'user_potions',
  'user-ingredients': 'user_ingredients',
  'user-creatures': 'user_creatures',
  'user-magic-items': 'user_magic_items',
  'user-companion-types': 'user_companion_types',
  'calendar-events': 'calendar_events',
};

export interface SyncResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface BatchResult<T> {
  success: boolean;
  successCount: number;
  failureCount: number;
  errors: BatchItemError<T>[];
  duration: number;
}

export interface BatchItemError<T> {
  item: T;
  error: string;
  index: number;
}

export type DataType = 'characters' | 'sessions' | 'quests' | 'encounters' | 'downtime' | 'companions' | 'npcs' | 'settings' | 'user-potions' | 'user-ingredients' | 'user-creatures' | 'user-magic-items' | 'user-companion-types' | 'calendar-events';

// Concurrency and batching configuration
const BATCH_SIZE = 10;
const MAX_CONCURRENCY = 5;

/**
 * Semaphore for controlling concurrency
 */
class Semaphore {
  private permits: number;
  private queue: (() => void)[] = [];

  constructor(permits: number) {
    this.permits = permits;
  }

  async acquire<T>(operation: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      const tryAcquire = () => {
        if (this.permits > 0) {
          this.permits--;
          operation()
            .then(resolve)
            .catch(reject)
            .finally(() => {
              this.permits++;
              if (this.queue.length > 0) {
                const next = this.queue.shift()!;
                next();
              }
            });
        } else {
          this.queue.push(tryAcquire);
        }
      };

      tryAcquire();
    });
  }
}

class SyncService {
  private cache: Map<string, any> = new Map();
  private syncInterval: NodeJS.Timeout | null = null;
  private syncCallbacks: Map<string, (() => void)[]> = new Map();

  /**
   * Execute operations with bounded concurrency and batching
   * Maintains ordering guarantee: deletes before saves
   * @param items Array of items to process
   * @param operation Function to execute for each item
   * @param operationType Type of operation for logging
   * @returns BatchResult with success/failure details
   */
  private async executeBatched<T>(
    items: T[],
    operation: (item: T) => Promise<void>,
    operationType: string
  ): Promise<BatchResult<T>> {
    const startTime = performance.now();
    const errors: BatchItemError<T>[] = [];
    let successCount = 0;

    // Log batch start
    if (process.env.NODE_ENV === 'development') {
      console.log(`Batch ${operationType}: Processing ${items.length} items with concurrency ${MAX_CONCURRENCY}`);
    }

    // Create semaphore for concurrency control
    const semaphore = new Semaphore(MAX_CONCURRENCY);

    // Process items in batches with concurrency control
    const batches = this.chunkArray(items, BATCH_SIZE);

    for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
      const batch = batches[batchIndex];

      // Process batch items concurrently
      const batchPromises = batch.map(async (item, itemIndex) => {
        const globalIndex = batchIndex * BATCH_SIZE + itemIndex;

        return semaphore.acquire(async () => {
          try {
            await operation(item);
            successCount++;
          } catch (error) {
            errors.push({
              item,
              error: error instanceof Error ? error.message : String(error),
              index: globalIndex
            });
          }
        });
      });

      // Wait for current batch to complete before proceeding
      await Promise.all(batchPromises);
    }

    const duration = performance.now() - startTime;

    // Log batch completion
    if (process.env.NODE_ENV === 'development') {
      console.log(`Batch ${operationType} completed: ${successCount} succeeded, ${errors.length} failed in ${duration.toFixed(2)}ms`);
      if (errors.length > 0) {
        console.warn(`Batch ${operationType} errors:`, errors.map(e => ({ index: e.index, error: e.error })));
      }
    }

    return {
      success: errors.length === 0,
      successCount,
      failureCount: errors.length,
      errors,
      duration
    };
  }

  /**
   * Helper to chunk array into smaller batches
   */
  private chunkArray<T>(array: T[], chunkSize: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  }

  /**
   * Convert BatchResult to legacy SyncResult for backward compatibility
   * Provides "best-effort" semantics for UI components
   */
  batchResultToSyncResult<T>(batchResult: BatchResult<T>): SyncResult<void> {
    if (batchResult.success) {
      return { success: true };
    }

    // If some items succeeded, it's a partial success
    if (batchResult.successCount > 0) {
      const errorSummary = batchResult.errors.length > 0 ?
        `${batchResult.failureCount} of ${batchResult.successCount + batchResult.failureCount} items failed` :
        'Some operations failed';

      return {
        success: false,
        error: errorSummary
      };
    }

    // Complete failure
    const firstError = batchResult.errors[0]?.error || 'Unknown error';
    return {
      success: false,
      error: `Batch operation failed: ${firstError}`
    };
  }

  /**
   * Log batch result summary for telemetry and debugging
   */
  private logBatchResult<T>(operation: string, result: BatchResult<T>): void {
    if (process.env.NODE_ENV === 'development') {
      console.log(`Batch ${operation} summary:`, {
        success: result.success,
        total: result.successCount + result.failureCount,
        succeeded: result.successCount,
        failed: result.failureCount,
        duration: `${result.duration.toFixed(2)}ms`,
        avgTimePerItem: result.successCount > 0 ?
          `${(result.duration / (result.successCount + result.failureCount)).toFixed(2)}ms` : 'N/A'
      });

      if (result.errors.length > 0) {
        console.warn(`Batch ${operation} failures:`, result.errors.slice(0, 5)); // Log first 5 errors
        if (result.errors.length > 5) {
          console.warn(`... and ${result.errors.length - 5} more errors`);
        }
      }
    }
  }

  // Generic data fetching
  async getData(dataType: DataType): Promise<SyncResult<any[]>> {
    console.log(`[SyncService] getData called for: ${dataType}`);
    try {
      // In Tauri or network client mode, use storage adapter directly
      if (useDirectStorageAdapter()) {
        console.log(`[SyncService] Using direct storage adapter for ${dataType}`);
        const storage = getStorageAdapter();
        console.log(`[SyncService] Got storage adapter:`, storage.constructor.name);
        const tableName = DATA_TYPE_TO_TABLE[dataType];
        console.log(`[SyncService] Table name: ${tableName}`);
        const items = await storage.getAll(tableName);
        console.log(`[SyncService] Got ${items.length} items from storage`);
        this.cache.set(dataType, items);
        return { success: true, data: items };
      }

      console.log(`[SyncService] Using fetch API for ${dataType}, API_BASE: "${API_BASE}"`);
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
      // In Tauri or network client mode, use storage adapter directly
      if (useDirectStorageAdapter()) {
        const storage = getStorageAdapter();
        const tableName = DATA_TYPE_TO_TABLE[dataType];
        const existing = await storage.get(tableName, item.id);
        if (existing) {
          await storage.update(tableName, item.id, item);
        } else {
          await storage.create(tableName, item.id, item);
        }

        // Broadcast change to network clients
        this.broadcastChange('update', tableName, item.id, item);

        return { success: true };
      }

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
      // In Tauri or network client mode, use storage adapter directly
      if (useDirectStorageAdapter()) {
        const storage = getStorageAdapter();
        const tableName = DATA_TYPE_TO_TABLE[dataType];
        await storage.delete(tableName, id);

        // Broadcast change to network clients
        this.broadcastChange('delete', tableName, id);

        return { success: true };
      }

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
    // In Tauri or network client mode, use storage adapter directly
    if (useDirectStorageAdapter()) {
      try {
        const storage = getStorageAdapter();
        const settings = await storage.getAll('settings');
        const settingsMap: Record<string, any> = {};
        settings.forEach((s: any) => {
          if (s.key) {
            settingsMap[s.key] = s.value || s;
          }
        });
        this.cache.set('settings', settingsMap);
        return { success: true, data: settingsMap };
      } catch (error) {
        console.error('Tauri settings sync error:', error);
        return { success: false, error: 'Failed to sync settings' };
      }
    }

    // In demo mode, skip server requests entirely
    if (IS_DEMO_MODE || !API_BASE) {
      console.log('Demo mode: Loading settings from localStorage only');
      return { success: false, error: 'Demo mode - no server sync' };
    }

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
    // In Tauri or network client mode, use storage adapter directly
    if (useDirectStorageAdapter()) {
      try {
        const storage = getStorageAdapter();
        await storage.setSetting(key, value);
        return { success: true };
      } catch (error) {
        console.error('Tauri settings save error:', error);
        return { success: false, error: 'Failed to save setting' };
      }
    }

    // In demo mode, skip server requests entirely
    if (IS_DEMO_MODE || !API_BASE) {
      console.log('Demo mode: Settings saved to localStorage only');
      return { success: true };
    }

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
    const result = await this.getData('companions');

    // In demo mode or when appropriate, merge with demo data
    if (shouldUseDemoData()) {
      const userData = result.success ? (result.data || []) : [];
      const mergedData = mergeWithDemoData(userData, DEMO_COMPANIONS);
      return { success: true, data: mergedData };
    }

    return result;
  }

  async saveCompanion(companion: any): Promise<SyncResult<void>> {
    return this.saveData('companions', companion);
  }

  async deleteCompanion(id: string): Promise<SyncResult<void>> {
    return this.deleteData('companions', id);
  }

  async getNpcs(): Promise<SyncResult<any[]>> {
    const result = await this.getData('npcs');

    // In demo mode or when appropriate, merge with demo data
    if (shouldUseDemoData()) {
      const userData = result.success ? (result.data || []) : [];
      const mergedData = mergeWithDemoData(userData, DEMO_NPCS);
      return { success: true, data: mergedData };
    }

    return result;
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

  // Calendar events methods
  async getCalendarEvents(): Promise<SyncResult<any[]>> {
    return this.getData('calendar-events');
  }

  async saveCalendarEvent(event: any): Promise<SyncResult<void>> {
    return this.saveData('calendar-events', event);
  }

  async deleteCalendarEvent(id: string): Promise<SyncResult<void>> {
    return this.deleteData('calendar-events', id);
  }

  // Register callbacks for specific data types
  onDataUpdate(dataType: DataType, callback: () => void) {
    if (!this.syncCallbacks.has(dataType)) {
      this.syncCallbacks.set(dataType, []);
    }
    this.syncCallbacks.get(dataType)?.push(callback);
  }

  // Overloads for startSync method
  startSync(callback: () => void, interval?: number): void;
  startSync(dataTypes: DataType[], onUpdate?: () => void, interval?: number): () => void;

  // Start polling for updates with support for multiple data types
  startSync(dataTypes: DataType[] | (() => void), onUpdate?: (() => void) | number, interval = 5000): void | (() => void) {
    this.stopSync();

    // Handle backward compatibility
    if (typeof dataTypes === 'function') {
      // Old API: startSync(callback, interval)
      const callback = dataTypes;
      const oldInterval = typeof onUpdate === 'number' ? onUpdate : interval;

      try {
        callback();
      } catch (error) {
        console.error('Error in sync callback (initial):', error);
      }

      this.syncInterval = setInterval(() => {
        try {
          callback();
        } catch (error) {
          console.error('Error in sync callback (polling):', error);
        }
      }, oldInterval);
      return;
    }

    // New API: startSync(['characters', 'sessions'], callback?, interval)
    const types = dataTypes as DataType[];
    const callback = typeof onUpdate === 'function' ? onUpdate : undefined;

    // Helper function to safely call the callback
    const safeCallCallback = () => {
      if (callback) {
        try {
          callback();
        } catch (error) {
          console.error('Error in sync callback:', error);
        }
      }
    };

    // Helper function to trigger specific data type callbacks
    const triggerDataTypeCallbacks = () => {
      types.forEach(dataType => {
        const callbacks = this.syncCallbacks.get(dataType) || [];
        callbacks.forEach(cb => {
          try {
            cb();
          } catch (error) {
            console.error(`Error in data type callback for ${dataType}:`, error);
          }
        });
      });
    };

    // Initial sync
    safeCallCallback();
    triggerDataTypeCallbacks();

    // Poll for updates
    this.syncInterval = setInterval(() => {
      safeCallCallback();
      triggerDataTypeCallbacks();
    }, interval);

    // Return stop function for convenience
    return () => this.stopSync();
  }

  stopSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  // Helper method to sync data with localStorage fallback
  async syncWithFallback(dataType: DataType, localStorageKey: string, validator?: (item: any) => any): Promise<any[]> {
    // In demo mode, always use localStorage
    if (IS_DEMO_MODE || !API_BASE) {
      const savedData = localStorage.getItem(localStorageKey);
      if (savedData) {
        try {
          let parsed = JSON.parse(savedData);

          // Fix old potion IDs that don't include category
          if (dataType === 'user-potions' && parsed.length > 0) {
            parsed = parsed.map((potion: any) => {
              // Fix old ID format (potion-1) to new format (potion-Combat-1)
              if (potion.id && !potion.id.includes(`-${potion.category}-`)) {
                return {
                  ...potion,
                  id: `potion-${potion.category}-${potion.number}`
                };
              }
              return {
                ...potion,
                id: potion.id || `potion-${potion.category}-${potion.number}`
              };
            });
            // Save the fixed data back to localStorage
            localStorage.setItem(localStorageKey, JSON.stringify(parsed));
          }

          return validator ? parsed.map(validator) : parsed;
        } catch (e) {
          console.error(`Error parsing localStorage data for ${localStorageKey}:`, e);
          return [];
        }
      }
      return [];
    }

    // Non-demo mode: try to sync with server
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

        // Update localStorage as backup (skip in Tauri/network mode to avoid quota issues)
        if (!useDirectStorageAdapter()) {
          try {
            localStorage.setItem(localStorageKey, JSON.stringify(validatedData));
          } catch (storageError) {
            if (storageError instanceof DOMException && storageError.name === 'QuotaExceededError') {
              console.warn(`[SyncService] localStorage quota exceeded for ${localStorageKey}, skipping backup`);
            }
          }
        }
        return validatedData;
      } else {
        // Fall back to localStorage
        const savedData = localStorage.getItem(localStorageKey);
        if (savedData) {
          let parsed = JSON.parse(savedData);

          // Fix old potion IDs that don't include category
          if (dataType === 'user-potions') {
            parsed = parsed.map((potion: any) => {
              // Fix old ID format (potion-1) to new format (potion-Combat-1)
              if (potion.id && !potion.id.includes(`-${potion.category}-`)) {
                return {
                  ...potion,
                  id: `potion-${potion.category}-${potion.number}`
                };
              }
              return {
                ...potion,
                id: potion.id || `potion-${potion.category}-${potion.number}`
              };
            });
            // Save the fixed data back to localStorage
            localStorage.setItem(localStorageKey, JSON.stringify(parsed));
          }

          return validator ? parsed.map(validator) : parsed;
        }
        return [];
      }
    } catch (error) {
      console.error(`Error syncing ${dataType}:`, error);

      // Fall back to localStorage
      const savedData = localStorage.getItem(localStorageKey);
      if (savedData) {
        let parsed = JSON.parse(savedData);

        // Fix old potion IDs that don't include category
        if (dataType === 'user-potions') {
          parsed = parsed.map((potion: any) => {
            // Fix old ID format (potion-1) to new format (potion-Combat-1)
            if (potion.id && !potion.id.includes(`-${potion.category}-`)) {
              return {
                ...potion,
                id: `potion-${potion.category}-${potion.number}`
              };
            }
            return {
              ...potion,
              id: potion.id || `potion-${potion.category}-${potion.number}`
            };
          });
          // Save the fixed data back to localStorage
          localStorage.setItem(localStorageKey, JSON.stringify(parsed));
        }

        return validator ? parsed.map(validator) : parsed;
      }
      return [];
    }
  }

  /**
   * Save data with localStorage backup and batched server operations
   * Ensures ordering: deletes before saves
   * @param dataType Type of data being saved
   * @param localStorageKey Key for localStorage backup
   * @param items Items to save
   * @returns Structured result with partial failure handling
   */
  async saveWithFallback(dataType: DataType, localStorageKey: string, items: any[]): Promise<BatchResult<any>> {
    try {
      // In Tauri or network client mode, skip localStorage (data goes directly to SQLite/server)
      // This avoids localStorage quota issues when storing large base64 images
      if (!useDirectStorageAdapter()) {
        // Save to localStorage immediately for offline support (web mode only)
        try {
          localStorage.setItem(localStorageKey, JSON.stringify(items));
        } catch (storageError) {
          // Handle quota exceeded gracefully - log but continue with server sync
          if (storageError instanceof DOMException && storageError.name === 'QuotaExceededError') {
            console.warn(`[SyncService] localStorage quota exceeded for ${localStorageKey}, skipping local backup`);
          } else {
            throw storageError;
          }
        }
      }

      // In demo mode, skip server sync entirely
      if (IS_DEMO_MODE || !API_BASE) {
        console.log(`Demo mode: ${dataType} saved to localStorage only`);
        return {
          success: true,
          successCount: items.length,
          failureCount: 0,
          errors: [],
          duration: 0
        };
      }

      // For user content types, we need special handling to avoid duplicates and properly sync deletions
      let result: BatchResult<any>;
      if (dataType === 'user-potions' || dataType === 'user-magic-items' || dataType === 'user-creatures' || dataType === 'user-ingredients' || dataType === 'user-companion-types') {
        result = await this.saveWithDuplicateHandling(dataType, items);
      } else {
        // Standard batch save for other data types
        result = await this.executeBatched(
          items,
          async (item) => {
            await this.saveData(dataType, item);
          },
          `save-${dataType}`
        );
      }

      // Log batch result for telemetry
      this.logBatchResult(`saveWithFallback-${dataType}`, result);

      return result;
    } catch (error) {
      console.error(`Error saving ${dataType}:`, error);
      // Return partial success result even on localStorage failure
      return {
        success: false,
        successCount: 0,
        failureCount: items.length,
        errors: items.map((item, index) => ({
          item,
          error: error instanceof Error ? error.message : String(error),
          index
        })),
        duration: 0
      };
    }
  }

  /**
   * Handle save operations for data types that need duplicate checking
   * Maintains ordering: deletes before saves
   *
   * Duplicate policy: Items are considered unique by ID.
   * - Deletes server items not present in the local items array
   * - Updates existing items with matching IDs
   * - Creates new items without existing IDs
   * This ensures idempotent operations where repeated saves with the same
   * items array result in the same server state.
   */
  private async saveWithDuplicateHandling(dataType: DataType, items: any[]): Promise<BatchResult<any>> {
    const startTime = performance.now();

    // First, get all existing items from the server
    const existingResult = await this.getData(dataType);
    const existingItems = existingResult.data || [];

    // Phase 1: Delete items that are no longer in the items array (ordering guarantee)
    const itemsToDelete = existingItems.filter(existing =>
      !items.find(item => item.id === existing.id)
    );

    const deleteResult = await this.executeBatched(
      itemsToDelete,
      async (item) => {
        await this.deleteData(dataType, item.id);
      },
      `delete-${dataType}`
    );

    // Phase 2: Save/update items (after deletes complete)
    const saveResult = await this.executeBatched(
      items,
      async (item) => {
        await this.saveData(dataType, item);
      },
      `save-${dataType}`
    );

    // Combine results
    const totalDuration = performance.now() - startTime;
    const totalErrors = [...deleteResult.errors, ...saveResult.errors];

    return {
      success: deleteResult.success && saveResult.success,
      successCount: deleteResult.successCount + saveResult.successCount,
      failureCount: deleteResult.failureCount + saveResult.failureCount,
      errors: totalErrors,
      duration: totalDuration
    };
  }

  /**
   * Legacy wrapper for saveWithFallback that maintains backward compatibility
   * Throws on failure for existing error handling patterns
   */
  async saveWithFallbackLegacy(dataType: DataType, localStorageKey: string, items: any[]): Promise<void> {
    const result = await this.saveWithFallback(dataType, localStorageKey, items);

    if (!result.success) {
      const syncResult = this.batchResultToSyncResult(result);
      throw new Error(syncResult.error || 'Batch operation failed');
    }
  }

  // Backup tables for export
  private readonly BACKUP_TABLES = [
    'characters',
    'sessions',
    'quests',
    'downtime_activities',
    'companions',
    'npcs',
    'encounters',
    'user_potions',
    'user_ingredients',
    'user_creatures',
    'user_magic_items',
    'user_companion_types',
    'calendar_events',
  ];

  /**
   * Create a backup of all data
   * Works in both Tauri mode (using storage adapter) and web mode (using API)
   */
  async createBackup(): Promise<SyncResult<any>> {
    if (useDirectStorageAdapter()) {
      try {
        const storage = getStorageAdapter();
        const backup: Record<string, any[]> = {};

        // Export all tables
        for (const table of this.BACKUP_TABLES) {
          try {
            const rows = await storage.getAll(table);
            backup[table] = rows.map((row: any) => ({
              id: row.id,
              data: JSON.stringify(row),
              updated_at: row._lastUpdated
            }));
          } catch (error) {
            console.error(`Error exporting ${table}:`, error);
            backup[table] = [];
          }
        }

        // Export settings separately
        try {
          const settings = await storage.getAll('settings');
          backup['settings'] = settings.map((s: any) => ({
            key: s.key || s.id,
            value: JSON.stringify(s.value || s),
            updated_at: s._lastUpdated
          }));
        } catch (error) {
          console.error('Error exporting settings:', error);
          backup['settings'] = [];
        }

        const exportData = {
          version: 1,
          exportedAt: new Date().toISOString(),
          appName: 'Obojima GM Tools',
          data: backup
        };

        return { success: true, data: exportData };
      } catch (error) {
        console.error('Backup error:', error);
        return { success: false, error: 'Failed to create backup' };
      }
    }

    // Web mode - use API
    try {
      const response = await fetch(`${API_BASE}/api/backup`);
      if (!response.ok) throw new Error('Failed to create backup');
      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('Backup error:', error);
      return { success: false, error: 'Failed to create backup' };
    }
  }

  /**
   * Restore data from a backup
   * Works in both Tauri mode (using storage adapter) and web mode (using API)
   */
  async restoreBackup(backupData: any): Promise<SyncResult<{ restoredTables: string[] }>> {
    if (!backupData.version || !backupData.data) {
      return { success: false, error: 'Invalid backup file format' };
    }

    if (useDirectStorageAdapter()) {
      try {
        const storage = getStorageAdapter();
        const restoredTables: string[] = [];

        // Restore all tables
        for (const table of this.BACKUP_TABLES) {
          const tableData = backupData.data[table];
          if (tableData && Array.isArray(tableData)) {
            for (const row of tableData) {
              try {
                const parsedData = typeof row.data === 'string' ? JSON.parse(row.data) : row.data;
                const existing = await storage.get(table, row.id);
                if (existing) {
                  await storage.update(table, row.id, parsedData);
                } else {
                  await storage.create(table, row.id, parsedData);
                }
              } catch (error) {
                console.error(`Error restoring item in ${table}:`, error);
              }
            }
            restoredTables.push(table);
          }
        }

        // Restore settings
        const settingsData = backupData.data['settings'];
        if (settingsData && Array.isArray(settingsData)) {
          for (const setting of settingsData) {
            try {
              const value = typeof setting.value === 'string' ? JSON.parse(setting.value) : setting.value;
              await storage.setSetting(setting.key, value);
            } catch (error) {
              console.error(`Error restoring setting ${setting.key}:`, error);
            }
          }
          restoredTables.push('settings');
        }

        return { success: true, data: { restoredTables } };
      } catch (error) {
        console.error('Restore error:', error);
        return { success: false, error: 'Failed to restore backup' };
      }
    }

    // Web mode - use API
    try {
      const response = await fetch(`${API_BASE}/api/restore`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(backupData),
      });

      if (!response.ok) throw new Error('Failed to restore backup');
      const result = await response.json();
      return { success: true, data: result };
    } catch (error) {
      console.error('Restore error:', error);
      return { success: false, error: 'Failed to restore backup' };
    }
  }

  /**
   * Upload a file (image or audio)
   * In Tauri mode, uses Tauri's filesystem. In web mode, uses API.
   * In Tauri mode, returns the data URL directly so it can be used for display.
   */
  async uploadFile(file: File, subfolder: string, filename: string): Promise<SyncResult<{ path: string; dataUrl?: string }>> {
    // Determine the base path for the file type
    const isAudio = subfolder === 'audio' || file.type.startsWith('audio/');
    const basePath = isAudio ? '/audio' : '/images';

    // Validate file size (especially important for Tauri mode where files are stored as base64)
    // Pass fallback type based on subfolder in case MIME type is missing or generic
    const maxSize = getMaxFileSizeForType(file.type, isAudio ? 'audio' : 'image');
    if (!validateFileSize(file.size, maxSize)) {
      const errorMsg = `File size (${formatFileSize(file.size)}) exceeds maximum allowed (${formatFileSize(maxSize)})`;
      logger.warn('File upload rejected:', errorMsg);
      return { success: false, error: errorMsg };
    }

    if (useDirectStorageAdapter()) {
      try {
        // For Tauri and network clients, we'll store as base64 data URL in the database
        const reader = new FileReader();
        const dataUrl = await new Promise<string>((resolve, reject) => {
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        // Store the data URL in settings keyed by the path
        const storage = getStorageAdapter();
        const path = isAudio ? `${basePath}/${filename}` : `${basePath}/${subfolder}/${filename}`;
        await storage.setSetting(`uploaded_file:${path}`, dataUrl);

        // Return both path and dataUrl
        return { success: true, data: { path, dataUrl } };
      } catch (error) {
        logger.error('File upload error:', error);
        return { success: false, error: 'Failed to upload file' };
      }
    }

    // Web mode - use API
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('filename', filename);
      if (!isAudio) {
        formData.append('subfolder', subfolder);
      }

      const apiEndpoint = isAudio ? `${API_BASE}/api/upload-audio` : `${API_BASE}/api/upload-image`;
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to upload file');
      }

      const result = await response.json();
      return { success: true, data: { path: result.path } };
    } catch (error) {
      logger.error('File upload error (Web):', error);
      return { success: false, error: error instanceof Error ? error.message : 'Failed to upload file' };
    }
  }

  /**
   * Get an uploaded file's data URL (Tauri or network client mode)
   */
  async getUploadedFile(path: string): Promise<string | null> {
    if (useDirectStorageAdapter()) {
      try {
        const storage = getStorageAdapter();
        const dataUrl = await storage.getSetting(`uploaded_file:${path}`);
        return dataUrl || null;
      } catch (error) {
        console.error('Error getting uploaded file:', error);
        return null;
      }
    }
    return null;
  }

  /**
   * Broadcast a change to network clients via Tauri command.
   * This is called when data changes in the desktop app to notify
   * all connected browser clients via WebSocket.
   */
  private async broadcastChange(
    msgType: 'update' | 'delete',
    table: string,
    id: string,
    data?: any
  ): Promise<void> {
    if (!isTauri()) return;

    try {
      const { invoke } = await import('@tauri-apps/api/core');
      await invoke('broadcast_sync_message', {
        table,
        id,
        data: data || {},
        msgType,
      });
    } catch (error) {
      // Non-critical error - log but don't fail the operation
      console.warn('[SyncService] Failed to broadcast change:', error);
    }
  }
}

export const syncService = new SyncService();