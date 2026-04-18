'use client';

import { createContext, useCallback, useContext, useEffect, useState, ReactNode } from 'react';
import { CalendarConfig, DEFAULT_CALENDAR_CONFIG, isValidCalendarConfig } from '@/data/obojimaCalendar';
import { syncService } from '@/services/sync';

// Persist calendarConfig to localStorage under the existing appSettings key so
// it survives a refresh even when the sync backend is a no-op (web demo mode).
// Sync is still the source of truth when available (Tauri / network client);
// localStorage is the fallback.
function readLocalConfig(): CalendarConfig | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem('appSettings');
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return isValidCalendarConfig(parsed?.calendarConfig) ? parsed.calendarConfig : null;
  } catch {
    return null;
  }
}

function writeLocalConfig(config: CalendarConfig): void {
  if (typeof window === 'undefined') return;
  try {
    const raw = window.localStorage.getItem('appSettings');
    const parsed = raw ? JSON.parse(raw) : {};
    parsed.calendarConfig = config;
    window.localStorage.setItem('appSettings', JSON.stringify(parsed));
  } catch (error) {
    console.warn('CalendarConfigContext: failed to write calendarConfig to localStorage', error);
  }
}

interface CalendarConfigContextValue {
  config: CalendarConfig;
  isLoaded: boolean;
  setConfig: (config: CalendarConfig) => Promise<void>;
  resetConfig: () => Promise<void>;
  refresh: () => Promise<void>;
}

const defaultValue: CalendarConfigContextValue = {
  config: DEFAULT_CALENDAR_CONFIG,
  isLoaded: false,
  setConfig: async () => {},
  resetConfig: async () => {},
  refresh: async () => {},
};

const CalendarConfigContext = createContext<CalendarConfigContextValue>(defaultValue);

export function CalendarConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfigState] = useState<CalendarConfig>(DEFAULT_CALENDAR_CONFIG);
  const [isLoaded, setIsLoaded] = useState(false);

  const loadConfig = useCallback(async () => {
    try {
      const result = await syncService.getSettings();
      const fromSync = result.success && result.data ? result.data.calendarConfig : undefined;
      if (isValidCalendarConfig(fromSync)) {
        setConfigState(fromSync);
        // Mirror to localStorage so subsequent loads work offline / in demo mode.
        writeLocalConfig(fromSync);
        return;
      }
      // Sync didn't have it (or failed in demo mode) — fall back to localStorage.
      const fromLocal = readLocalConfig();
      if (fromLocal) {
        setConfigState(fromLocal);
        return;
      }
      setConfigState(DEFAULT_CALENDAR_CONFIG);
    } catch (error) {
      console.warn('CalendarConfigContext: sync failed, checking localStorage', error);
      const fromLocal = readLocalConfig();
      setConfigState(fromLocal ?? DEFAULT_CALENDAR_CONFIG);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  const setConfig = useCallback(async (next: CalendarConfig) => {
    setConfigState(next);
    // Persist to localStorage synchronously — this is the reliable path in
    // demo/web-dev mode where saveSetting is a no-op. Sync is best-effort.
    writeLocalConfig(next);
    try {
      await syncService.saveSetting('calendarConfig', next);
    } catch (error) {
      console.error('CalendarConfigContext: failed to save to sync (localStorage copy still valid)', error);
    }
  }, []);

  const resetConfig = useCallback(async () => {
    await setConfig(DEFAULT_CALENDAR_CONFIG);
  }, [setConfig]);

  return (
    <CalendarConfigContext.Provider
      value={{ config, isLoaded, setConfig, resetConfig, refresh: loadConfig }}
    >
      {children}
    </CalendarConfigContext.Provider>
  );
}

// Returns the active CalendarConfig. Falls back to DEFAULT_CALENDAR_CONFIG
// if called outside a provider (defensive — should not happen in normal flow).
export function useCalendarConfig(): CalendarConfig {
  return useContext(CalendarConfigContext).config;
}

// Returns { config, isLoaded } — for components that want to defer rendering
// until the async load resolves (avoids the default-config flicker for GMs
// with a custom calendar).
export function useCalendarConfigReady(): { config: CalendarConfig; isLoaded: boolean } {
  const ctx = useContext(CalendarConfigContext);
  return { config: ctx.config, isLoaded: ctx.isLoaded };
}

// Full context access (mutators + loaded flag) for components that edit the
// config or need to wait on the initial load.
export function useCalendarConfigContext(): CalendarConfigContextValue {
  return useContext(CalendarConfigContext);
}
