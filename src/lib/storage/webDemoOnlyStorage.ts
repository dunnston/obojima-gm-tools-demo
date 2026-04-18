import { isTauriEnvironment, isNetworkClient } from './index';

// Reads are always permitted (legacy data may still live in localStorage during migration).
// Writes and deletes are no-ops on Tauri desktop and on network clients — SQLite on the host is authoritative.
// On web demo / dev, writes are guarded against QuotaExceededError so the UI degrades instead of crashing.

function isHostMode(): boolean {
  if (typeof window === 'undefined') return false;
  return isTauriEnvironment() || isNetworkClient();
}

export const webDemoOnlyStorage = {
  getItem(key: string): string | null {
    if (typeof window === 'undefined') return null;
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },

  setItem(key: string, value: string): void {
    if (typeof window === 'undefined') return;
    if (isHostMode()) return;
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        console.warn(`[webDemoOnlyStorage] Quota exceeded for "${key}" — skipping write.`);
        return;
      }
      throw error;
    }
  },

  removeItem(key: string): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(key);
    } catch {
      // ignore
    }
  },
};
