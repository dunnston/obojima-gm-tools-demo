import { StorageAdapter } from './types';
import { SQLiteAdapter } from './sqliteAdapter';
import { LocalStorageAdapter } from './localStorageAdapter';
import { MemoryAdapter } from './memoryAdapter';

let clientStorageAdapter: StorageAdapter | null = null;
let serverStorageAdapter: StorageAdapter | null = null;
let sqliteStorageAdapter: StorageAdapter | null = null;

export function getStorageAdapter(): StorageAdapter {
  // Check if we're in demo mode
  const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

  if (isDemoMode) {
    // Check if we're on the server or client side
    if (typeof window === 'undefined') {
      // Server-side: use in-memory storage
      if (!serverStorageAdapter) {
        console.log('🎮 Demo mode (server) - using memory storage');
        serverStorageAdapter = new MemoryAdapter();
      }
      return serverStorageAdapter;
    } else {
      // Client-side: use localStorage
      if (!clientStorageAdapter) {
        console.log('🎮 Demo mode (client) - using localStorage');
        clientStorageAdapter = new LocalStorageAdapter();
      }
      return clientStorageAdapter;
    }
  } else {
    // Production mode: use SQLite
    if (!sqliteStorageAdapter) {
      console.log('💾 Production mode - using SQLite');
      sqliteStorageAdapter = new SQLiteAdapter();
    }
    return sqliteStorageAdapter;
  }
}

// Export types for convenience
export type { StorageAdapter, StorageTable } from './types';
export { LocalStorageAdapter } from './localStorageAdapter';
export { SQLiteAdapter } from './sqliteAdapter';
export { MemoryAdapter } from './memoryAdapter';