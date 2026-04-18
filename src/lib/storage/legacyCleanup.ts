import { isTauriEnvironment, isNetworkClient, getStorageAdapter } from './index';

// Legacy localStorage keys → the SQLite table name that supersedes them.
// Purging a key is safe only once its table is populated (meaning sync has written
// that data type at least once). If a table is empty, the key may still hold
// pre-migration data and must be preserved.
const LEGACY_KEY_TO_TABLE: Record<string, string> = {
  'obojima-sessions': 'sessions',
  'obojima-characters': 'characters',
  'obojima-downtime-activities': 'downtime_activities',
  'obojima-quests': 'quests',
  'obojima-locations': 'locations',
  'obojima-npcs': 'npcs',
  'obojima-encounters': 'encounters',
  'modifiedPotions': 'user_potions',
  'modifiedIngredients': 'user_ingredients',
  'modifiedCreatures': 'user_creatures',
  'modifiedMagicItems': 'user_magic_items',
  'modifiedNPCs': 'npcs',
  'modifiedCompanionTypes': 'user_companion_types',
  'modifiedCompanions': 'companions',
};

// Sentinel bumped whenever cleanup semantics change. Cleared ONLY when every
// present legacy key has been purged OR proven orphaned — otherwise we retry
// on the next launch so keys whose SQLite tables later receive data can get
// cleaned up in the future.
const CLEANUP_MARKER_KEY = 'obojima-legacy-localstorage-cleared-v3';

// Clears legacy content-data keys out of localStorage on Tauri desktop and network clients.
//
// Per-key safety: each legacy key is purged only if its corresponding SQLite table has rows.
// A key whose table is empty is left in place — it may hold pre-migration data that the
// app has not yet re-ingested. Over time, as the app writes to each table via syncService,
// subsequent launches will clear the corresponding keys.
//
// On network clients, any localStorage content is per-device noise — the host's SQLite is
// authoritative. We skip the per-key probe and purge everything directly.
//
// Safe no-op on the web demo.
export async function clearLegacyContentStorageIfHost(): Promise<void> {
  if (typeof window === 'undefined') return;
  if (!isTauriEnvironment() && !isNetworkClient()) return;

  try {
    if (localStorage.getItem(CLEANUP_MARKER_KEY)) return;

    // Network client: its localStorage content is per-device noise. Purge all.
    if (isNetworkClient()) {
      let cleared = 0;
      for (const key of Object.keys(LEGACY_KEY_TO_TABLE)) {
        if (localStorage.getItem(key) !== null) {
          localStorage.removeItem(key);
          cleared++;
        }
      }
      localStorage.setItem(CLEANUP_MARKER_KEY, new Date().toISOString());
      if (cleared > 0) {
        console.log(`[legacyCleanup] Cleared ${cleared} legacy localStorage key(s) on network client.`);
      }
      return;
    }

    // Tauri: per-key probe. Only purge a key if its SQLite table has rows.
    const adapter = getStorageAdapter();
    let cleared = 0;
    let preserved = 0;
    const tableCache = new Map<string, boolean>();

    for (const [key, table] of Object.entries(LEGACY_KEY_TO_TABLE)) {
      if (localStorage.getItem(key) === null) continue;

      let tableHasData = tableCache.get(table);
      if (tableHasData === undefined) {
        try {
          const rows = await adapter.getAll(table);
          tableHasData = Array.isArray(rows) && rows.length > 0;
        } catch (error) {
          console.warn(`[legacyCleanup] Probe failed for table "${table}":`, error);
          tableHasData = false;
        }
        tableCache.set(table, tableHasData);
      }

      if (tableHasData) {
        localStorage.removeItem(key);
        cleared++;
      } else {
        preserved++;
      }
    }

    // Only mark complete if we didn't preserve any keys. If we preserved some,
    // they represent potentially-unmigrated data — retry on next launch in case
    // their tables get populated later.
    if (preserved === 0) {
      localStorage.setItem(CLEANUP_MARKER_KEY, new Date().toISOString());
    }

    if (cleared > 0 || preserved > 0) {
      console.log(
        `[legacyCleanup] Tauri cleanup: cleared=${cleared}, preserved=${preserved} ` +
        `(preserved keys have empty SQLite tables and may hold unmigrated data).`
      );
    }
  } catch (error) {
    // Never block app startup on this.
    console.warn('[legacyCleanup] Cleanup failed:', error);
  }
}
