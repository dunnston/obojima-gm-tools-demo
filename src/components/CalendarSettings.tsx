'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowUpIcon,
  ArrowDownIcon,
  TrashIcon,
  PlusIcon,
  ArrowPathIcon,
  CheckIcon,
  XMarkIcon,
  CalendarDaysIcon,
  InformationCircleIcon,
  ExclamationTriangleIcon,
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
} from '@heroicons/react/24/outline';
import {
  CalendarConfig,
  PhaseConfig,
  SeasonConfig,
  DEFAULT_CALENDAR_CONFIG,
  getDaysPerCycle,
  getSeasonDays,
  getYearDays,
} from '@/data/obojimaCalendar';
import { isValidCalendarConfig } from '@/data/settings';
import { syncService } from '@/services/sync';
import { useCalendarConfigContext } from '@/contexts/CalendarConfigContext';

interface ImpactReport {
  removedSeasonIds: string[];
  removedPhaseIds: string[];
  currentDateAffected: boolean;
  eventsAffected: number;
  sessionsAffected: number;
  totalAffected: number;
}

async function scanImpact(draft: CalendarConfig, prev: CalendarConfig): Promise<ImpactReport> {
  const newSeasonsById = new Map(draft.seasons.map(s => [s.id, s]));
  const newPhasesById = new Map(draft.phases.map(p => [p.id, p]));
  const newSeasonIds = new Set(newSeasonsById.keys());
  const newPhaseIds = new Set(newPhasesById.keys());
  const removedSeasonIds = prev.seasons
    .filter(s => !newSeasonIds.has(s.id))
    .map(s => s.id);
  const removedPhaseIds = prev.phases
    .filter(p => !newPhaseIds.has(p.id))
    .map(p => p.id);

  if (removedSeasonIds.length === 0 && removedPhaseIds.length === 0) {
    // Still destructive if a season's cycle count shrank or a phase's day
    // count shrank — either can orphan a stored date.
    const cycleShrunk = prev.seasons.some(ps => {
      const matched = newSeasonsById.get(ps.id);
      return matched && matched.cycles < ps.cycles;
    });
    const phaseDaysShrunk = prev.phases.some(pp => {
      const matched = newPhasesById.get(pp.id);
      return matched && matched.days < pp.days;
    });
    if (!cycleShrunk && !phaseDaysShrunk) {
      return {
        removedSeasonIds: [],
        removedPhaseIds: [],
        currentDateAffected: false,
        eventsAffected: 0,
        sessionsAffected: 0,
        totalAffected: 0,
      };
    }
  }

  const [settingsResult, eventsResult, sessionsResult] = await Promise.all([
    syncService.getSettings().catch(() => ({ success: false, data: null })),
    syncService.getCalendarEvents().catch(() => ({ success: false, data: [] })),
    syncService.getSessions().catch(() => ({ success: false, data: [] })),
  ]);

  const isDateAffected = (d: { season?: string; phase?: string; cycle?: number; day?: number }): boolean => {
    if (!d) return false;
    if (d.season && !newSeasonIds.has(d.season)) return true;
    if (d.phase && !newPhaseIds.has(d.phase)) return true;
    if (d.season && typeof d.cycle === 'number') {
      const newSeason = newSeasonsById.get(d.season);
      if (newSeason && d.cycle > newSeason.cycles) return true;
    }
    if (d.phase && typeof d.day === 'number') {
      const newPhase = newPhasesById.get(d.phase);
      if (newPhase && d.day > newPhase.days) return true;
    }
    return false;
  };

  const settingsAny = (settingsResult as { data?: { currentObojimaDate?: { season?: string; phase?: string; cycle?: number; day?: number } } }).data;
  const currentDate = settingsAny?.currentObojimaDate;
  const currentDateAffected = currentDate ? isDateAffected(currentDate) : false;

  // Normalize sync responses. syncService.getData unwraps via `data[Object.keys(data)[0]]`,
  // which breaks when the API returns a bare array (keys become numeric
  // indices, so we end up with a single record instead of the array).
  // Coerce to an array here so the scanner is correct regardless.
  const asArray = <T,>(raw: unknown): T[] => {
    if (Array.isArray(raw)) return raw as T[];
    if (raw && typeof raw === 'object') return [raw as T];
    return [];
  };
  const events = asArray<{ date?: { season?: string; phase?: string; cycle?: number; day?: number } }>(
    (eventsResult as { data?: unknown }).data,
  );
  const eventsAffected = events.filter(e => e.date && isDateAffected(e.date)).length;

  const sessions = asArray<{ gameDate?: { season?: string; phase?: string; cycle?: number; day?: number } }>(
    (sessionsResult as { data?: unknown }).data,
  );
  const sessionsAffected = sessions.filter(s => s.gameDate && isDateAffected(s.gameDate)).length;

  const totalAffected = (currentDateAffected ? 1 : 0) + eventsAffected + sessionsAffected;

  return {
    removedSeasonIds,
    removedPhaseIds,
    currentDateAffected,
    eventsAffected,
    sessionsAffected,
    totalAffected,
  };
}

// Preset: a plain 12-month, 30-day calendar (no moon phases).
const TWELVE_MONTH_PRESET: CalendarConfig = {
  phases: [
    { id: 'month-phase', name: 'Days', days: 30, description: '30 days per month', emoji: '📅' },
  ],
  seasons: [
    { id: 'january',   name: 'January',   cycles: 1, emoji: '❄️' },
    { id: 'february',  name: 'February',  cycles: 1, emoji: '❄️' },
    { id: 'march',     name: 'March',     cycles: 1, emoji: '🌱' },
    { id: 'april',     name: 'April',     cycles: 1, emoji: '🌸' },
    { id: 'may',       name: 'May',       cycles: 1, emoji: '🌼' },
    { id: 'june',      name: 'June',      cycles: 1, emoji: '☀️' },
    { id: 'july',      name: 'July',      cycles: 1, emoji: '☀️' },
    { id: 'august',    name: 'August',    cycles: 1, emoji: '🌾' },
    { id: 'september', name: 'September', cycles: 1, emoji: '🍂' },
    { id: 'october',   name: 'October',   cycles: 1, emoji: '🍁' },
    { id: 'november',  name: 'November',  cycles: 1, emoji: '🌧️' },
    { id: 'december',  name: 'December',  cycles: 1, emoji: '❄️' },
  ],
};

export default function CalendarSettings() {
  const { config: activeConfig, setConfig, resetConfig } = useCalendarConfigContext();
  const [draft, setDraft] = useState<CalendarConfig>(activeConfig);
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [impactReport, setImpactReport] = useState<ImpactReport | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importText, setImportText] = useState('');
  const [importError, setImportError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Track the activeConfig the draft was seeded from. If activeConfig changes
  // (e.g. the async context load resolved after this tab opened) AND the user
  // hasn't started editing, resync the draft so we don't overwrite the newly
  // loaded config with stale defaults on save.
  const draftBaselineRef = useRef<CalendarConfig>(activeConfig);
  useEffect(() => {
    if (JSON.stringify(draft) === JSON.stringify(draftBaselineRef.current)) {
      setDraft(activeConfig);
      draftBaselineRef.current = activeConfig;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeConfig]);

  const dirty = useMemo(
    () => JSON.stringify(draft) !== JSON.stringify(activeConfig),
    [draft, activeConfig]
  );

  const daysPerCycle = getDaysPerCycle(draft);
  const yearDays = getYearDays(draft);

  const validate = (cfg: CalendarConfig): string | null => {
    if (cfg.seasons.length === 0) return 'At least one season is required.';
    if (cfg.phases.length === 0) return 'At least one phase is required.';
    if (cfg.phases.some(p => p.days < 1)) return 'Every phase must have at least 1 day.';
    if (cfg.seasons.some(s => s.cycles < 1)) return 'Every season must have at least 1 cycle.';
    const phaseIds = new Set(cfg.phases.map(p => p.id));
    if (phaseIds.size !== cfg.phases.length) return 'Phase ids must be unique.';
    const seasonIds = new Set(cfg.seasons.map(s => s.id));
    if (seasonIds.size !== cfg.seasons.length) return 'Season ids must be unique.';
    return null;
  };

  const commitSave = async () => {
    setError(null);
    setImpactReport(null);
    setSaveState('saving');
    try {
      await setConfig(draft);
      setSaveState('saved');
      setTimeout(() => setSaveState('idle'), 1500);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save.');
      setSaveState('error');
    }
  };

  const handleSave = async () => {
    const validationError = validate(draft);
    if (validationError) {
      setError(validationError);
      setSaveState('error');
      return;
    }
    setError(null);

    // Scan for stored data that references removed ids or over-shrunk cycles.
    let report: ImpactReport;
    try {
      report = await scanImpact(draft, activeConfig);
    } catch (e) {
      // Don't silently bypass the warning — the scan is the user's only
      // safeguard against accidental data remapping. If it fails, surface
      // the error and let the GM retry (often a sync hiccup resolves itself).
      console.error('Calendar impact scan failed', e);
      setError(
        'Could not check whether saving would affect existing sessions or events. '
        + 'Check your connection and try again. If this keeps happening, export your '
        + 'config and share it — the scan error is in the browser console.'
      );
      setSaveState('error');
      return;
    }

    if (report.totalAffected === 0) {
      await commitSave();
      return;
    }

    // Show the warning modal — commit happens only if user confirms.
    setImpactReport(report);
  };

  // --- Export / import ---

  const handleExport = () => {
    const json = JSON.stringify(draft, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const timestamp = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `obojima-calendar-${timestamp}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportFile = async (file: File) => {
    // Guard: a misclicked 100MB file should not freeze the tab. A legit
    // calendar config is well under 100KB.
    const MAX_IMPORT_BYTES = 1_000_000; // 1 MB
    if (file.size > MAX_IMPORT_BYTES) {
      setImportError(`File is too large (${(file.size / 1024).toFixed(0)} KB). Calendar configs are normally under 100 KB.`);
      setShowImportModal(true);
      return;
    }
    try {
      const text = await file.text();
      setImportText(text);
      setImportError(null);
      setShowImportModal(true);
    } catch (e) {
      setImportError(e instanceof Error ? e.message : 'Could not read file.');
    }
  };

  const applyImport = () => {
    try {
      const parsed = JSON.parse(importText);
      if (!isValidCalendarConfig(parsed)) {
        setImportError('The JSON does not match the calendar config shape.');
        return;
      }
      setDraft(parsed);
      setShowImportModal(false);
      setImportText('');
      setImportError(null);
    } catch (e) {
      setImportError(e instanceof Error ? e.message : 'Invalid JSON.');
    }
  };

  const handleDiscard = () => {
    setDraft(activeConfig);
    setError(null);
    setSaveState('idle');
  };

  const handleReset = async () => {
    if (!confirm('Reset the calendar to the Obojima default? Any custom seasons/phases you\'ve added will be lost.')) {
      return;
    }
    await resetConfig();
    setDraft(DEFAULT_CALENDAR_CONFIG);
  };

  const loadPreset = (preset: CalendarConfig, label: string) => {
    if (!confirm(`Replace the current calendar with the "${label}" preset?`)) return;
    setDraft(preset);
  };

  // --- Phase mutators ---

  const updatePhase = (index: number, updates: Partial<PhaseConfig>) => {
    setDraft(prev => ({
      ...prev,
      phases: prev.phases.map((p, i) => (i === index ? { ...p, ...updates } : p)),
    }));
  };

  const addPhase = () => {
    setDraft(prev => ({
      ...prev,
      phases: [
        ...prev.phases,
        { id: makeUniqueId('phase', prev.phases.map(p => p.id)), name: 'New Phase', days: 7 },
      ],
    }));
  };

  const removePhase = (index: number) => {
    if (draft.phases.length <= 1) {
      setError('Cannot remove the last phase.');
      return;
    }
    setDraft(prev => ({ ...prev, phases: prev.phases.filter((_, i) => i !== index) }));
  };

  const movePhase = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= draft.phases.length) return;
    setDraft(prev => {
      const next = [...prev.phases];
      [next[index], next[target]] = [next[target], next[index]];
      return { ...prev, phases: next };
    });
  };

  // --- Season mutators ---

  const updateSeason = (index: number, updates: Partial<SeasonConfig>) => {
    setDraft(prev => ({
      ...prev,
      seasons: prev.seasons.map((s, i) => (i === index ? { ...s, ...updates } : s)),
    }));
  };

  const addSeason = () => {
    setDraft(prev => ({
      ...prev,
      seasons: [
        ...prev.seasons,
        { id: makeUniqueId('season', prev.seasons.map(s => s.id)), name: 'New Season', cycles: 3 },
      ],
    }));
  };

  const removeSeason = (index: number) => {
    if (draft.seasons.length <= 1) {
      setError('Cannot remove the last season.');
      return;
    }
    setDraft(prev => ({ ...prev, seasons: prev.seasons.filter((_, i) => i !== index) }));
  };

  const moveSeason = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= draft.seasons.length) return;
    setDraft(prev => {
      const next = [...prev.seasons];
      [next[index], next[target]] = [next[target], next[index]];
      return { ...prev, seasons: next };
    });
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2 flex items-center justify-center gap-2">
          <CalendarDaysIcon className="h-7 w-7 text-indigo-400" />
          Calendar
        </h2>
        <p className="text-slate-400 max-w-2xl mx-auto">
          Shape the in-game year to fit your world. Rename seasons, change how many cycles each one has,
          add or remove phases — the whole calendar rebuilds around what you set here.
        </p>
      </div>

      {/* Presets + share */}
      <section className="bg-slate-800/40 border border-slate-700 rounded-lg p-4 space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Presets</h3>
          <div className="flex gap-2">
            <button
              onClick={handleExport}
              className="flex items-center gap-1 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded-md text-sm transition-colors"
              title="Download the current draft as JSON"
            >
              <ArrowDownTrayIcon className="h-4 w-4" />
              Export
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded-md text-sm transition-colors"
              title="Load a calendar config from a JSON file"
            >
              <ArrowUpTrayIcon className="h-4 w-4" />
              Import
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json,.json"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleImportFile(f);
                e.target.value = '';
              }}
            />
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => loadPreset(DEFAULT_CALENDAR_CONFIG, 'Obojima default')}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm transition-colors"
          >
            Obojima default (4 seasons × 3 moon cycles)
          </button>
          <button
            onClick={() => loadPreset(TWELVE_MONTH_PRESET, '12-month year')}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm transition-colors"
          >
            12-month year (Gregorian-style)
          </button>
        </div>
      </section>

      {/* Live summary */}
      <section className="bg-gradient-to-br from-indigo-900/30 to-slate-800/40 border border-indigo-500/20 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <InformationCircleIcon className="h-5 w-5 text-indigo-400 mt-0.5 flex-shrink-0" />
          <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <Stat label="Days per cycle" value={daysPerCycle} />
            <Stat label="Phases" value={draft.phases.length} />
            <Stat label="Seasons" value={draft.seasons.length} />
            <Stat label="Days per year" value={yearDays} highlight />
          </div>
        </div>
      </section>

      {/* Phases editor */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Phases</h3>
          <button
            onClick={addPhase}
            className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-sm transition-colors"
          >
            <PlusIcon className="h-4 w-4" />
            Add phase
          </button>
        </div>
        <p className="text-xs text-slate-500">
          Phases make up a single cycle. Each season has {draft.phases.length} phase{draft.phases.length === 1 ? '' : 's'} repeated per cycle, totaling {daysPerCycle} days per cycle.
        </p>
        <div className="space-y-2">
          {draft.phases.map((phase, i) => (
            <div
              key={phase.id}
              className="bg-slate-800/60 border border-slate-700 rounded-lg p-3 grid grid-cols-[auto_1fr_auto_auto_auto] gap-3 items-center"
            >
              <div className="flex flex-col gap-1">
                <button
                  onClick={() => movePhase(i, -1)}
                  disabled={i === 0}
                  className="p-1 text-slate-500 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                  aria-label="Move up"
                >
                  <ArrowUpIcon className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => movePhase(i, 1)}
                  disabled={i === draft.phases.length - 1}
                  className="p-1 text-slate-500 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                  aria-label="Move down"
                >
                  <ArrowDownIcon className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="flex items-center gap-2 min-w-0">
                <input
                  type="text"
                  value={phase.emoji ?? ''}
                  onChange={(e) => updatePhase(i, { emoji: e.target.value })}
                  placeholder="🌙"
                  maxLength={4}
                  className="w-12 px-2 py-1.5 bg-slate-700/50 border border-slate-600 rounded text-white text-center text-sm"
                  aria-label="Emoji"
                />
                <input
                  type="text"
                  value={phase.name}
                  onChange={(e) => updatePhase(i, { name: e.target.value })}
                  placeholder="Phase name"
                  className="flex-1 px-3 py-1.5 bg-slate-700/50 border border-slate-600 rounded text-white text-sm min-w-0"
                  aria-label="Phase name"
                />
              </div>
              <label className="text-xs text-slate-400 whitespace-nowrap">
                Days
                <input
                  type="number"
                  value={phase.days}
                  onChange={(e) => updatePhase(i, { days: Math.max(1, parseInt(e.target.value) || 1) })}
                  min={1}
                  max={365}
                  className="w-16 ml-2 px-2 py-1.5 bg-slate-700/50 border border-slate-600 rounded text-white text-sm text-center"
                />
              </label>
              <span className="text-xs text-slate-500 hidden sm:inline">id: <code>{phase.id}</code></span>
              <button
                onClick={() => removePhase(i)}
                disabled={draft.phases.length <= 1}
                className="p-2 text-slate-500 hover:text-red-400 disabled:opacity-30 disabled:cursor-not-allowed"
                aria-label="Remove phase"
              >
                <TrashIcon className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Seasons editor */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Seasons</h3>
          <button
            onClick={addSeason}
            className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-sm transition-colors"
          >
            <PlusIcon className="h-4 w-4" />
            Add season
          </button>
        </div>
        <p className="text-xs text-slate-500">
          Each season repeats the phase sequence by its cycle count. Longer seasons have more cycles.
        </p>
        <div className="space-y-2">
          {draft.seasons.map((season, i) => (
            <div
              key={season.id}
              className="bg-slate-800/60 border border-slate-700 rounded-lg p-3 grid grid-cols-[auto_1fr_auto_auto_auto] gap-3 items-center"
            >
              <div className="flex flex-col gap-1">
                <button
                  onClick={() => moveSeason(i, -1)}
                  disabled={i === 0}
                  className="p-1 text-slate-500 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                  aria-label="Move up"
                >
                  <ArrowUpIcon className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => moveSeason(i, 1)}
                  disabled={i === draft.seasons.length - 1}
                  className="p-1 text-slate-500 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                  aria-label="Move down"
                >
                  <ArrowDownIcon className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="flex items-center gap-2 min-w-0">
                <input
                  type="text"
                  value={season.emoji ?? ''}
                  onChange={(e) => updateSeason(i, { emoji: e.target.value })}
                  placeholder="🌸"
                  maxLength={4}
                  className="w-12 px-2 py-1.5 bg-slate-700/50 border border-slate-600 rounded text-white text-center text-sm"
                  aria-label="Emoji"
                />
                <input
                  type="text"
                  value={season.name}
                  onChange={(e) => updateSeason(i, { name: e.target.value })}
                  placeholder="Season name"
                  className="flex-1 px-3 py-1.5 bg-slate-700/50 border border-slate-600 rounded text-white text-sm min-w-0"
                  aria-label="Season name"
                />
              </div>
              <label className="text-xs text-slate-400 whitespace-nowrap">
                Cycles
                <input
                  type="number"
                  value={season.cycles}
                  onChange={(e) => updateSeason(i, { cycles: Math.max(1, parseInt(e.target.value) || 1) })}
                  min={1}
                  max={36}
                  className="w-16 ml-2 px-2 py-1.5 bg-slate-700/50 border border-slate-600 rounded text-white text-sm text-center"
                />
              </label>
              <span className="text-xs text-slate-500 whitespace-nowrap">
                = {getSeasonDays(season, draft)}d
              </span>
              <button
                onClick={() => removeSeason(i)}
                disabled={draft.seasons.length <= 1}
                className="p-2 text-slate-500 hover:text-red-400 disabled:opacity-30 disabled:cursor-not-allowed"
                aria-label="Remove season"
              >
                <TrashIcon className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Error / status */}
      {error && (
        <div className="bg-red-600/10 border border-red-600/30 rounded-lg p-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {/* Save / discard / reset */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-700">
        <button
          onClick={handleReset}
          className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm transition-colors"
        >
          <ArrowPathIcon className="h-4 w-4" />
          Reset to Obojima default
        </button>

        <div className="flex items-center gap-2">
          {saveState === 'saved' && (
            <span className="flex items-center gap-1 text-emerald-400 text-sm">
              <CheckIcon className="h-4 w-4" /> Saved
            </span>
          )}
          {dirty && (
            <button
              onClick={handleDiscard}
              className="flex items-center gap-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg text-sm transition-colors"
            >
              <XMarkIcon className="h-4 w-4" />
              Discard changes
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={!dirty || saveState === 'saving'}
            className="flex items-center gap-1 px-6 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors"
          >
            <CheckIcon className="h-4 w-4" />
            {saveState === 'saving' ? 'Saving…' : 'Save calendar'}
          </button>
        </div>
      </div>

      <p className="text-xs text-slate-500 pt-2">
        Changes take effect immediately across the calendar grid, session planner, and event modals.
        Existing dates that reference seasons or phases you remove will fall back to the first valid one.
      </p>

      {/* Impact warning modal */}
      {impactReport && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 border border-amber-500/40 rounded-lg p-6 max-w-lg w-full space-y-4">
            <div className="flex items-start gap-3">
              <ExclamationTriangleIcon className="h-7 w-7 text-amber-400 flex-shrink-0" />
              <div>
                <h3 className="text-xl font-bold text-white">Heads up — stored dates will be affected</h3>
                <p className="text-sm text-slate-400 mt-1">
                  Your draft removes or shrinks seasons/phases that existing dates refer to.
                  Saving will remap those dates to the nearest valid season and phase.
                </p>
              </div>
            </div>

            {(impactReport.removedSeasonIds.length > 0 || impactReport.removedPhaseIds.length > 0) && (
              <div className="bg-slate-900/60 border border-slate-700 rounded p-3 text-sm space-y-1">
                {impactReport.removedSeasonIds.length > 0 && (
                  <div className="text-slate-300">
                    <span className="text-amber-400 font-medium">Removed seasons:</span>{' '}
                    {impactReport.removedSeasonIds.map(id => (
                      <code key={id} className="px-1.5 py-0.5 bg-slate-700 rounded text-xs mx-0.5">{id}</code>
                    ))}
                  </div>
                )}
                {impactReport.removedPhaseIds.length > 0 && (
                  <div className="text-slate-300">
                    <span className="text-amber-400 font-medium">Removed phases:</span>{' '}
                    {impactReport.removedPhaseIds.map(id => (
                      <code key={id} className="px-1.5 py-0.5 bg-slate-700 rounded text-xs mx-0.5">{id}</code>
                    ))}
                  </div>
                )}
              </div>
            )}

            <ul className="text-sm text-slate-300 space-y-1.5 pl-1">
              {impactReport.currentDateAffected && (
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 mt-0.5">•</span>
                  <span>The current world date will remap.</span>
                </li>
              )}
              {impactReport.eventsAffected > 0 && (
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 mt-0.5">•</span>
                  <span><strong className="text-white">{impactReport.eventsAffected}</strong> calendar event{impactReport.eventsAffected === 1 ? '' : 's'} will remap.</span>
                </li>
              )}
              {impactReport.sessionsAffected > 0 && (
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 mt-0.5">•</span>
                  <span><strong className="text-white">{impactReport.sessionsAffected}</strong> session{impactReport.sessionsAffected === 1 ? '' : 's'} with a game date will remap.</span>
                </li>
              )}
            </ul>

            <p className="text-xs text-slate-500 pt-1 border-t border-slate-700">
              Tip: renaming a season or phase (without deleting it) is always safe — ids stay stable.
              Only removal or reducing a season's cycle count affects stored data.
            </p>

            <div className="flex gap-2 justify-end pt-1">
              <button
                onClick={() => setImpactReport(null)}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={commitSave}
                className="px-6 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Save anyway
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 border border-slate-600 rounded-lg p-6 max-w-2xl w-full space-y-4">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <ArrowUpTrayIcon className="h-5 w-5 text-indigo-400" />
              Import calendar JSON
            </h3>
            <p className="text-sm text-slate-400">
              Paste a previously-exported config, or edit the text loaded from your file. Click Apply to load it into the editor — you'll still need to click Save to commit.
            </p>
            <textarea
              value={importText}
              onChange={(e) => { setImportText(e.target.value); setImportError(null); }}
              rows={16}
              className="w-full px-3 py-2 bg-slate-900/60 border border-slate-700 rounded-lg text-white text-xs font-mono focus:outline-none focus:border-indigo-400"
              placeholder='{\n  "phases": [...],\n  "seasons": [...]\n}'
            />
            {importError && (
              <div className="bg-red-600/10 border border-red-600/30 rounded-lg p-2 text-xs text-red-300">
                {importError}
              </div>
            )}
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => { setShowImportModal(false); setImportText(''); setImportError(null); }}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={applyImport}
                disabled={!importText.trim()}
                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors"
              >
                Apply to editor
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, highlight }: { label: string; value: number; highlight?: boolean }) {
  return (
    <div>
      <div className={`text-2xl font-bold ${highlight ? 'text-indigo-300' : 'text-white'}`}>
        {value}
      </div>
      <div className="text-xs text-slate-400 mt-1">{label}</div>
    </div>
  );
}

// Generate a stable-ish id from a base word, ensuring uniqueness against existing ids.
function makeUniqueId(base: string, existing: string[]): string {
  const slug = base.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'entry';
  let candidate = `${slug}-${Math.random().toString(36).slice(2, 6)}`;
  while (existing.includes(candidate)) {
    candidate = `${slug}-${Math.random().toString(36).slice(2, 6)}`;
  }
  return candidate;
}
