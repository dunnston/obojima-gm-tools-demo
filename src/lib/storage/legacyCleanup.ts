import { isTauriEnvironment, isNetworkClient, getStorageAdapter } from './index';

// Keys that previously held content data in localStorage. On Tauri, SQLite is authoritative.
// On network clients, the host's SQLite is authoritative. Clearing these reclaims quota and
// prevents stale per-device copies from leaking into the UI via legacy fallback reads.
const LEGACY_CONTENT_KEYS = [
  'obojima-sessions',
  'obojima-characters',
  'obojima-downtime-activities',
  'obojima-quests',
  'obojima-locations',
  'obojima-npcs',
  'obojima-encounters',
  'modifiedPotions',
  'modifiedIngredients',
  'modifiedCreatures',
  'modifiedMagicItems',
  'modifiedNPCs',
  'modifiedCompanionTypes',
  'modifiedCompanions',
] as const;

// Sentinel so we only run this once per install.
const CLEANUP_MARKER_KEY = 'obojima-legacy-localstorage-cleared-v2';

// Tables we'll probe to decide if SQLite already has this user's data.
// If any of these contains rows, we consider the user already migrated.
const SAFETY_PROBE_TABLES = ['characters', 'sessions', 'npcs', 'downtime_activities'] as const;

// Clears legacy content-data keys out of localStorage on Tauri desktop and network clients.
//
// Safety: on Tauri, we first probe SQLite for any existing content. If SQLite is completely
// empty AND localStorage has legacy content keys, we refuse to purge — that would silently
// delete a legacy user's only copy of their data. We do not set the marker in that case, so
// we'll retry on the next launch (by which point SQLite may be populated via sync).
//
// On network clients, any localStorage content is per-device noise — the host's SQLite is
// authoritative. We skip the probe and purge directly.
//
// A one-shot op (marker-gated). Safe no-op on the web demo.
export async function clearLegacyContentStorageIfHost(): Promise<void> {
  if (typeof window === 'undefined') return;
  if (!isTauriEnvironment() && !isNetworkClient()) return;

  try {
    if (localStorage.getItem(CLEANUP_MARKER_KEY)) return;

    const hasLegacyLocal = LEGACY_CONTENT_KEYS.some(k => localStorage.getItem(k) !== null);

    // Tauri-only safety check: verify SQLite has data before wiping localStorage.
    if (isTauriEnvironment() && hasLegacyLocal) {
      try {
        const adapter = getStorageAdapter();
        let sqliteHasData = false;
        for (const table of SAFETY_PROBE_TABLES) {
          const rows = await adapter.getAll(table);
          if (rows && rows.length > 0) {
            sqliteHasData = true;
            break;
          }
        }
        if (!sqliteHasData) {
          console.warn(
            '[legacyCleanup] SQLite appears empty but localStorage has legacy content. ' +
            'Refusing to purge — the user may not yet be migrated. Will retry on next launch.'
          );
          return;
        }
      } catch (probeError) {
        // If we can't probe SQLite, be conservative and don't purge.
        console.warn('[legacyCleanup] SQLite probe failed; skipping cleanup:', probeError);
        return;
      }
    }

    let cleared = 0;
    for (const key of LEGACY_CONTENT_KEYS) {
      if (localStorage.getItem(key) !== null) {
        localStorage.removeItem(key);
        cleared++;
      }
    }

    localStorage.setItem(CLEANUP_MARKER_KEY, new Date().toISOString());

    if (cleared > 0) {
      console.log(`[legacyCleanup] Cleared ${cleared} legacy localStorage key(s). SQLite is authoritative.`);
    }
  } catch (error) {
    // Never block app startup on this.
    console.warn('[legacyCleanup] Cleanup failed:', error);
  }
}
