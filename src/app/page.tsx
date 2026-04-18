'use client';

import { useState, useEffect, useCallback } from 'react';
import Sidebar from '@/components/Sidebar';
import PotionBrewing from '@/components/PotionBrewing';
import VendingMachine from '@/components/VendingMachine';
import EncounterCreator from '@/components/EncounterCreator';
import IngredientForaging from '@/components/IngredientForaging';
import CharacterManager from '@/components/CharacterManager';
import NPCManager from '@/components/NPCManager';
import SessionPlanner from '@/components/SessionPlanner';
import DatabaseView from '@/components/DatabaseView';
import Settings from '@/components/Settings';
import InitiativeTracker from '@/components/InitiativeTracker';
import QuestLog from '@/components/QuestLog';
import Credits from '@/components/Credits';
import DowntimeTracker from '@/components/DowntimeTracker';
import EnhancedObojimaCalendar from '@/components/EnhancedObojimaCalendar';
import PlayerQuickView from '@/components/PlayerQuickView';
import LocalSetupPage from './local-setup/page';
import { NPCProvider } from '@/contexts/NPCContext';
import { CalendarConfigProvider, useCalendarConfig } from '@/contexts/CalendarConfigContext';
import { UserGroupIcon } from '@heroicons/react/24/outline';
import { syncService } from '@/services/sync';
import { webDemoOnlyStorage } from '@/lib/storage/webDemoOnlyStorage';
import { clearLegacyContentStorageIfHost } from '@/lib/storage/legacyCleanup';
import { ObojimaDate, createObojimaDate, safeObojimaDate, DEFAULT_CALENDAR_CONFIG, CalendarConfig } from '@/data/obojimaCalendar';
import { isValidCalendarConfig } from '@/data/settings';
import { isSameObojimaDate } from '@/data/calendarEvents';

// The actual page body. Must live inside CalendarConfigProvider so it can
// call useCalendarConfig() — which is how we re-coerce the stored date
// whenever the GM changes the calendar configuration.
function HomeContent() {
  const calendarConfig = useCalendarConfig();
  const [currentPage, setCurrentPage] = useState('potions');

  /**
   * Obojima calendar date state - strictly typed as ObojimaDate
   * This ensures type safety across all date operations and prevents
   * malformed date objects from breaking the application.
   * Fallback behavior: Invalid dates are replaced with a safe default
   * and warnings are logged in development mode.
   */
  const [currentObojimaDate, setCurrentObojimaDate] = useState<ObojimaDate>(() =>
    createObojimaDate(
      1,
      calendarConfig.seasons[0]?.id ?? 'Spring',
      calendarConfig.phases[0]?.id ?? 'New Moon',
      1,
      1,
    )
  );
  const [calendarSyncStatus, setCalendarSyncStatus] = useState<'idle' | 'syncing' | 'error'>('idle');
  const [showQuickStats, setShowQuickStats] = useState(false);
  const [isHoldingKey, setIsHoldingKey] = useState(false);

  // Quick Stats hotkey: hold backtick to view, release to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target instanceof HTMLElement && e.target.isContentEditable)
      ) {
        return;
      }
      if (e.key === '`' || e.key === '~') {
        e.preventDefault();
        if (!isHoldingKey) {
          setIsHoldingKey(true);
          setShowQuickStats(true);
        }
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === '`' || e.key === '~') {
        e.preventDefault();
        setIsHoldingKey(false);
        setShowQuickStats(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, [isHoldingKey]);

  // One-shot: purge legacy content keys from localStorage on Tauri / network client.
  useEffect(() => {
    clearLegacyContentStorageIfHost().catch(err => {
      console.warn('[page] legacy cleanup failed:', err);
    });
  }, []);

  // Load saved date from settings with sync after component mounts
  useEffect(() => {
    loadCalendarDate();
    
    // Set up automatic sync every 30 minutes (1800000 ms)
    const syncInterval = setInterval(() => {
      loadCalendarDate();
    }, 30 * 60 * 1000); // 30 minutes
    
    // Cleanup interval on component unmount
    return () => clearInterval(syncInterval);
  }, []);

  // Resolve the active calendar config. Prefer sync (authoritative when
  // available), fall back to localStorage (needed in demo/web-dev mode
  // where sync.saveSetting is a no-op). Default config only if neither
  // source has a valid value. Must happen before safeObojimaDate so stored
  // dates aren't coerced against the wrong config.
  const resolveConfig = (settingsData: unknown): CalendarConfig => {
    const fromSync = (settingsData as { calendarConfig?: unknown })?.calendarConfig;
    if (isValidCalendarConfig(fromSync)) return fromSync;
    try {
      const raw = localStorage.getItem('appSettings');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (isValidCalendarConfig(parsed?.calendarConfig)) return parsed.calendarConfig;
      }
    } catch {
      // fall through
    }
    return DEFAULT_CALENDAR_CONFIG;
  };

  const loadCalendarDate = async () => {
    setCalendarSyncStatus('syncing');
    try {
      const result = await syncService.getSettings();
      const activeConfig = resolveConfig(result.data);
      const defaultDate = createObojimaDate(1, activeConfig.seasons[0]?.id ?? 'Spring', activeConfig.phases[0]?.id ?? 'New Moon', 1, 1);
      if (result.success && result.data && result.data.currentObojimaDate) {
        // Validate against the active config — critical for custom-config users.
        const validDate = safeObojimaDate(
          result.data.currentObojimaDate,
          defaultDate,
          activeConfig,
        );
        setCurrentObojimaDate(validDate);
        // Mirror to localStorage so the raw stored value stays in sync with
        // what we actually render (important when coercion rewrote it).
        try { webDemoOnlyStorage.setItem('obojima-current-date', JSON.stringify(validDate)); } catch {}
        setCalendarSyncStatus('idle');
      } else {
        // Fall back to localStorage for migration (web demo only)
        const saved = webDemoOnlyStorage.getItem('obojima-current-date');
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            const validDate = safeObojimaDate(parsed, defaultDate, activeConfig);
            setCurrentObojimaDate(validDate);

            // Persist the coerced value so localStorage reflects what we render.
            try { webDemoOnlyStorage.setItem('obojima-current-date', JSON.stringify(validDate)); } catch {}

            // Migrate validated date to sync
            await syncService.saveSetting('currentObojimaDate', validDate);
            setCalendarSyncStatus('idle');
          } catch {
            // JSON parse failed, keep default value
            setCalendarSyncStatus('error');
          }
        } else {
          setCalendarSyncStatus('idle');
        }
      }
    } catch (error) {
      console.error('Error loading calendar date:', error);
      setCalendarSyncStatus('error');

      // Fall back to localStorage (web demo only)
      const saved = webDemoOnlyStorage.getItem('obojima-current-date');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          // Best-effort: the sync fetch failed, so we don't know the active
          // config. Read it from localStorage directly to avoid coercing
          // against the wrong config.
          let activeConfig: CalendarConfig = DEFAULT_CALENDAR_CONFIG;
          try {
            const appSettings = localStorage.getItem('appSettings');
            if (appSettings) {
              const parsedSettings = JSON.parse(appSettings);
              if (isValidCalendarConfig(parsedSettings.calendarConfig)) {
                activeConfig = parsedSettings.calendarConfig;
              }
            }
          } catch {
            // Keep default config
          }
          const defaultDate = createObojimaDate(1, activeConfig.seasons[0]?.id ?? 'Spring', activeConfig.phases[0]?.id ?? 'New Moon', 1, 1);
          const validDate = safeObojimaDate(parsed, defaultDate, activeConfig);
          setCurrentObojimaDate(validDate);
        } catch {
          // Keep current default value if localStorage is corrupted
        }
      }
    }
  };

  /**
   * Save Obojima date to settings with sync when it changes.
   * Persists to localStorage FIRST (synchronous, can't be lost to a hanging
   * or silently-failing sync), then fires sync as a best-effort update.
   */
  const handleObojimaDateChange = async (newDate: ObojimaDate, _skipEventIds?: string[]) => {
    // Validate the incoming date against the active config. A valid date
    // returns unchanged; otherwise coerce to the nearest valid value.
    const validDate = safeObojimaDate(newDate, currentObojimaDate, calendarConfig);
    setCurrentObojimaDate(validDate);

    // Persist synchronously BEFORE the sync call so a hanging or silently-
    // failing sync can't lose the write. webDemoOnlyStorage is a no-op on
    // Tauri / network client where the SyncService + SQLite are authoritative.
    try {
      webDemoOnlyStorage.setItem('obojima-current-date', JSON.stringify(validDate));
    } catch (error) {
      console.error('Failed to persist calendar date to localStorage:', error);
    }

    // Best-effort sync. If this fails or hangs, web demo still has the localStorage copy.
    try {
      const result = await syncService.saveSetting('currentObojimaDate', validDate);
      if (!result.success) {
        console.warn('Calendar date saved locally but sync failed');
      }
    } catch (error) {
      console.error('Error syncing calendar date:', error);
    }
  };

  // Re-coerce the stored current date whenever the calendar config changes.
  // Without this, stored ids from a previous config (e.g. "Spring", "New Moon")
  // would render as fallback text when the GM switches to a new calendar.
  useEffect(() => {
    setCurrentObojimaDate(prev => {
      const coerced = safeObojimaDate(prev, prev, calendarConfig);
      if (isSameObojimaDate(prev, coerced)) return prev;

      // The date changed — persist the new shape so future loads are consistent.
      // webDemoOnlyStorage is a no-op on Tauri / network client.
      try {
        webDemoOnlyStorage.setItem('obojima-current-date', JSON.stringify(coerced));
      } catch {
        /* non-fatal */
      }
      // Fire-and-forget; the UI is already correct via setCurrentObojimaDate.
      syncService.saveSetting('currentObojimaDate', coerced).catch(err =>
        console.warn('Failed to sync coerced date after config change:', err),
      );
      return coerced;
    });
  }, [calendarConfig]);

  const renderPage = () => {
    switch (currentPage) {
      case 'potions':
        return <PotionBrewing />;
      case 'foraging':
        return <IngredientForaging />;
      case 'characters':
        return <CharacterManager />;
      case 'npcs':
        return <NPCManager />;
      case 'notes':
        return <SessionPlanner onPageChange={setCurrentPage} currentGameDate={currentObojimaDate} onGameDateChange={handleObojimaDateChange} />;
      case 'quests':
        return <QuestLog />;
      case 'encounters':
        return <EncounterCreator />;
      case 'vending':
        return <VendingMachine />;
      case 'database':
        return <DatabaseView />;
      case 'initiative':
        return <InitiativeTracker />;
      case 'calendar':
        return <EnhancedObojimaCalendar currentDate={currentObojimaDate} onDateChange={handleObojimaDateChange} onRefresh={loadCalendarDate} syncStatus={calendarSyncStatus} />;
      case 'downtime':
        return <DowntimeTracker currentObojimaDate={currentObojimaDate} />;
      case 'local-setup':
        return <LocalSetupPage />;
      case 'settings':
        return <Settings />;
      case 'credits':
        return <Credits />;
      default:
        return <PotionBrewing />;
    }
  };

  return (
    <NPCProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        {/* Animated background elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse delay-2000"></div>
        </div>

        <div className="grid grid-cols-[auto_1fr] min-h-screen">
          <Sidebar onPageChange={setCurrentPage} currentPage={currentPage} />
          <div className="min-h-screen">
            {renderPage()}
          </div>
        </div>

        {/* Quick Player Stats Floating Button */}
        <button
          onClick={() => setShowQuickStats(prev => !prev)}
          className="fixed bottom-6 right-6 z-50 p-3.5 bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 rounded-full shadow-lg shadow-blue-900/30 border border-white/10 text-white transition-all duration-200 hover:scale-110 group"
          title="Quick Player Stats (hold ~ key)"
          aria-label="Toggle quick player stats"
        >
          <UserGroupIcon className="h-5 w-5" />
        </button>

        {/* Quick Player Stats Overlay */}
        <PlayerQuickView
          isVisible={showQuickStats}
          onClose={() => {
            setShowQuickStats(false);
            setIsHoldingKey(false);
          }}
          onNavigateToCharacter={() => {
            setShowQuickStats(false);
            setIsHoldingKey(false);
            setCurrentPage('characters');
          }}
        />
      </div>
    </NPCProvider>
  );
}

// Provider wrapper. HomeContent lives inside so it can call useCalendarConfig().
export default function Home() {
  return (
    <CalendarConfigProvider>
      <HomeContent />
    </CalendarConfigProvider>
  );
}