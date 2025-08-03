import { StorageAdapter } from './types';
import { SQLiteAdapter } from './sqliteAdapter';
import { LocalStorageAdapter } from './localStorageAdapter';

let storageAdapter: StorageAdapter | null = null;

export function getStorageAdapter(): StorageAdapter {
  if (!storageAdapter) {
    // Check if we're in demo mode
    const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';
    
    if (isDemoMode) {
      console.log('🎮 Demo mode enabled - using localStorage');
      storageAdapter = new LocalStorageAdapter();
    } else {
      console.log('💾 Production mode - using SQLite');
      storageAdapter = new SQLiteAdapter();
    }
  }
  
  return storageAdapter;
}

// Export types for convenience
export type { StorageAdapter, StorageTable } from './types';
export { LocalStorageAdapter } from './localStorageAdapter';
export { SQLiteAdapter } from './sqliteAdapter';