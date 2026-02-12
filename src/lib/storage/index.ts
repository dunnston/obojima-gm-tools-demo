import { StorageAdapter } from './types';
import { LocalStorageAdapter } from './localStorageAdapter';
import { MemoryAdapter } from './memoryAdapter';

let clientStorageAdapter: StorageAdapter | null = null;
let serverStorageAdapter: StorageAdapter | null = null;
let sqliteStorageAdapter: StorageAdapter | null = null;
let tauriStorageAdapter: StorageAdapter | null = null;
let networkClientAdapter: StorageAdapter | null = null;

// Check if we're in Tauri environment (only works on client)
// Tauri 2.x uses __TAURI_INTERNALS__ and __TAURI_IPC__, Tauri 1.x uses __TAURI__
export function isTauriEnvironment(): boolean {
  if (typeof window === 'undefined') return false;
  // __TAURI_IPC__ is the most reliable indicator - it's always present in Tauri
  return '__TAURI_IPC__' in window || '__TAURI_INTERNALS__' in window || '__TAURI__' in window;
}

// Check if we're running as a network client (browser accessing via network sharing)
// This is true when: in browser, NOT in Tauri, NOT on localhost dev server
export function isNetworkClient(): boolean {
  if (typeof window === 'undefined') return false;
  if (isTauriEnvironment()) return false;

  const hostname = window.location.hostname;
  const port = window.location.port;

  // Not a network client if on localhost (dev server or Vercel preview)
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return false;
  }

  // Not a network client if on Vercel or other deployment
  if (hostname.includes('vercel.app') || hostname.includes('.')) {
    // Check if it's a local IP address (192.168.x.x, 10.x.x.x, etc.)
    const localIpPattern = /^(192\.168\.|10\.|172\.(1[6-9]|2[0-9]|3[0-1])\.)/;
    if (!localIpPattern.test(hostname)) {
      return false;
    }
  }

  // If we're on a local IP address, we're a network client
  return true;
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

    // Check if we're a network client (browser accessing via network sharing)
    if (isNetworkClient()) {
      if (!networkClientAdapter) {
        console.log('🌐 Network client mode - using HTTP API');
        const { getNetworkClientAdapter } = require('./networkClientAdapter');
        networkClientAdapter = getNetworkClientAdapter();
      }
      return networkClientAdapter;
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

// Note: SQLiteAdapter, TauriSQLAdapter, and NetworkClientAdapter are dynamically imported to avoid bundling issues
// They can still be imported directly where needed:
// import { SQLiteAdapter } from './sqliteAdapter';  // Server only
// import { TauriSQLAdapter } from './tauriSqlAdapter';  // Tauri client only
// import { NetworkClientAdapter } from './networkClientAdapter';  // Network client only
