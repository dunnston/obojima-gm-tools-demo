import { StorageAdapter } from './types';
import { LocalStorageAdapter } from './localStorageAdapter';
import { MemoryAdapter } from './memoryAdapter';

let clientStorageAdapter: StorageAdapter | null = null;
let serverStorageAdapter: StorageAdapter | null = null;
let sqliteStorageAdapter: StorageAdapter | null = null;
let tauriStorageAdapter: StorageAdapter | null = null;

// Check if we're in Tauri environment (only works on client)
// Tauri 2.x uses __TAURI_INTERNALS__ and __TAURI_IPC__, Tauri 1.x uses __TAURI__
export function isTauriEnvironment(): boolean {
  if (typeof window === 'undefined') return false;
  // __TAURI_IPC__ is the most reliable indicator - it's always present in Tauri
  return '__TAURI_IPC__' in window || '__TAURI_INTERNALS__' in window || '__TAURI__' in window;
}

export function getStorageAdapter(): StorageAdapter {
  const isClient = typeof window !== 'undefined';
  const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

  // Client-side logic
  if (isClient) {
    // Check if we're running in Tauri
    if (isTauriEnvironment()) {
      if (!tauriStorageAdapter) {
        console.log('🖥️ Tauri mode - using Tauri SQL');
        // Dynamic import would be ideal but we need sync access
        // TauriSQLAdapter is safe to import on client since it only uses @tauri-apps/plugin-sql
        const { TauriSQLAdapter } = require('./tauriSqlAdapter');
        tauriStorageAdapter = new TauriSQLAdapter();
      }
      return tauriStorageAdapter;
    }

    // Demo mode on client: use localStorage
    if (isDemoMode) {
      if (!clientStorageAdapter) {
        console.log('🎮 Demo mode (client) - using localStorage');
        clientStorageAdapter = new LocalStorageAdapter();
      }
      return clientStorageAdapter;
    }

    // Non-demo mode on client: also use localStorage as fallback
    // (API routes will use SQLite on server)
    if (!clientStorageAdapter) {
      console.log('📱 Client mode - using localStorage');
      clientStorageAdapter = new LocalStorageAdapter();
    }
    return clientStorageAdapter;
  }

  // Server-side logic
  if (isDemoMode) {
    if (!serverStorageAdapter) {
      console.log('🎮 Demo mode (server) - using memory storage');
      serverStorageAdapter = new MemoryAdapter();
    }
    return serverStorageAdapter;
  }

  // Production mode on server: use SQLite
  if (!sqliteStorageAdapter) {
    console.log('💾 Production mode - using SQLite');
    // Dynamic require to avoid bundling better-sqlite3 for client
    const { SQLiteAdapter } = require('./sqliteAdapter');
    sqliteStorageAdapter = new SQLiteAdapter();
  }
  return sqliteStorageAdapter;
}

// Export types for convenience
export type { StorageAdapter, StorageTable } from './types';
export { LocalStorageAdapter } from './localStorageAdapter';
export { MemoryAdapter } from './memoryAdapter';

// Note: SQLiteAdapter and TauriSQLAdapter are dynamically imported to avoid bundling issues
// They can still be imported directly where needed:
// import { SQLiteAdapter } from './sqliteAdapter';  // Server only
// import { TauriSQLAdapter } from './tauriSqlAdapter';  // Tauri client only
