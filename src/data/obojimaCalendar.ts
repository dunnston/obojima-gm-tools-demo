// Obojima Calendar System
//
// The calendar is driven by a CalendarConfig that defines seasons, phases,
// and per-season cycle counts. The default config reproduces the original
// 360-day Obojima calendar (4 seasons × 3 cycles × [8,7,8,7] = 360 days).
//
// All math/format functions take an optional CalendarConfig parameter that
// defaults to DEFAULT_CALENDAR_CONFIG — so existing callers continue to work
// unchanged. Runtime custom configs are wired in a later phase.

// Season / MoonPhase are now string aliases. The value stored in an
// ObojimaDate is a stable id from the active CalendarConfig (for the
// default config, the id matches the display name).
export type Season = string;
export type MoonPhase = string;

export interface ObojimaDate {
  year: number;
  season: Season;
  phase: MoonPhase;
  day: number;
  cycle: number;
}

// --- Config-driven model ---------------------------------------------------

export interface PhaseConfig {
  id: string;
  name: string;
  days: number;
  description?: string;
  emoji?: string;
}

export interface SeasonConfig {
  id: string;
  name: string;
  cycles: number;
  description?: string;
  emoji?: string;
}

export interface CalendarConfig {
  phases: PhaseConfig[];
  seasons: SeasonConfig[];
}

export const DEFAULT_CALENDAR_CONFIG: CalendarConfig = {
  phases: [
    { id: 'New Moon', name: 'New Moon', days: 8, description: 'A time of beginnings and ritual', emoji: '🌑' },
    { id: 'Waxing Moon', name: 'Waxing Moon', days: 7, description: 'Growth, planting, preparation', emoji: '🌓' },
    { id: 'Full Moon', name: 'Full Moon', days: 8, description: 'Festivals, climax, abundance', emoji: '🌕' },
    { id: 'Waning Moon', name: 'Waning Moon', days: 7, description: 'Reflection, endings, rest', emoji: '🌗' },
  ],
  seasons: [
    { id: 'Spring', name: 'Spring', cycles: 3, description: 'Season of renewal and growth', emoji: '🌸' },
    { id: 'Summer', name: 'Summer', cycles: 3, description: 'Season of abundance and energy', emoji: '☀️' },
    { id: 'Autumn', name: 'Autumn', cycles: 3, description: 'Season of harvest and preparation', emoji: '🍂' },
    { id: 'Winter', name: 'Winter', cycles: 3, description: 'Season of rest and reflection', emoji: '❄️' },
  ],
};

// --- Validation of the CalendarConfig shape -------------------------------

// Upper bounds are defensive. A directly-edited localStorage value must
// not ship a pathological config to the math engine or rendering layer.
// The editor UI caps well below these limits.
export const CALENDAR_CONFIG_LIMITS = {
  MAX_PHASES: 64,
  MAX_SEASONS: 64,
  MAX_DAYS_PER_PHASE: 365,
  MAX_CYCLES_PER_SEASON: 1000,
  MAX_ID_LENGTH: 64,
  MAX_NAME_LENGTH: 200,
} as const;

export function isValidCalendarConfig(value: unknown): value is CalendarConfig {
  if (!value || typeof value !== 'object') return false;
  const obj = value as Record<string, unknown>;
  if (!Array.isArray(obj.phases) || obj.phases.length === 0 || obj.phases.length > CALENDAR_CONFIG_LIMITS.MAX_PHASES) return false;
  if (!Array.isArray(obj.seasons) || obj.seasons.length === 0 || obj.seasons.length > CALENDAR_CONFIG_LIMITS.MAX_SEASONS) return false;

  const seenPhaseIds = new Set<string>();
  const phasesValid = obj.phases.every((p) => {
    if (!p || typeof p !== 'object') return false;
    const rec = p as Record<string, unknown>;
    if (typeof rec.id !== 'string' || rec.id.length === 0 || rec.id.length > CALENDAR_CONFIG_LIMITS.MAX_ID_LENGTH) return false;
    if (typeof rec.name !== 'string' || rec.name.length > CALENDAR_CONFIG_LIMITS.MAX_NAME_LENGTH) return false;
    if (typeof rec.days !== 'number' || !Number.isFinite(rec.days) || rec.days < 1 || rec.days > CALENDAR_CONFIG_LIMITS.MAX_DAYS_PER_PHASE) return false;
    if (seenPhaseIds.has(rec.id)) return false;
    seenPhaseIds.add(rec.id);
    return true;
  });
  if (!phasesValid) return false;

  const seenSeasonIds = new Set<string>();
  const seasonsValid = obj.seasons.every((s) => {
    if (!s || typeof s !== 'object') return false;
    const rec = s as Record<string, unknown>;
    if (typeof rec.id !== 'string' || rec.id.length === 0 || rec.id.length > CALENDAR_CONFIG_LIMITS.MAX_ID_LENGTH) return false;
    if (typeof rec.name !== 'string' || rec.name.length > CALENDAR_CONFIG_LIMITS.MAX_NAME_LENGTH) return false;
    if (typeof rec.cycles !== 'number' || !Number.isFinite(rec.cycles) || rec.cycles < 1 || rec.cycles > CALENDAR_CONFIG_LIMITS.MAX_CYCLES_PER_SEASON) return false;
    if (seenSeasonIds.has(rec.id)) return false;
    seenSeasonIds.add(rec.id);
    return true;
  });
  return seasonsValid;
}

// --- Derived helpers -------------------------------------------------------

export const getDaysPerCycle = (config: CalendarConfig = DEFAULT_CALENDAR_CONFIG): number =>
  config.phases.reduce((sum, p) => sum + p.days, 0);

export const getSeasonDays = (
  season: SeasonConfig,
  config: CalendarConfig = DEFAULT_CALENDAR_CONFIG
): number => season.cycles * getDaysPerCycle(config);

export const getYearDays = (config: CalendarConfig = DEFAULT_CALENDAR_CONFIG): number =>
  config.seasons.reduce((sum, s) => sum + getSeasonDays(s, config), 0);

export const resolveSeason = (
  id: string,
  config: CalendarConfig = DEFAULT_CALENDAR_CONFIG
): SeasonConfig | undefined => config.seasons.find(s => s.id === id);

export const resolvePhase = (
  id: string,
  config: CalendarConfig = DEFAULT_CALENDAR_CONFIG
): PhaseConfig | undefined => config.phases.find(p => p.id === id);

const getSeasonIndex = (id: string, config: CalendarConfig): number => {
  const idx = config.seasons.findIndex(s => s.id === id);
  return idx >= 0 ? idx : 0;
};

const getPhaseIndex = (id: string, config: CalendarConfig): number => {
  const idx = config.phases.findIndex(p => p.id === id);
  return idx >= 0 ? idx : 0;
};

// --- Back-compat exports ---------------------------------------------------
// Existing callers import SEASONS / MOON_PHASES / the numeric constants.
// These remain as derived views of the default config so no consumer breaks
// during the phased rollout.

export interface CalendarPhase {
  name: MoonPhase;
  description: string;
  days: number;
}

export interface CalendarSeason {
  name: Season;
  phases: CalendarPhase[];
  description: string;
  totalDays: number;
}

export const MOON_PHASES: CalendarPhase[] = DEFAULT_CALENDAR_CONFIG.phases.map(p => ({
  name: p.id,
  description: p.description ?? '',
  days: p.days,
}));

export const SEASONS: CalendarSeason[] = DEFAULT_CALENDAR_CONFIG.seasons.map(s => ({
  name: s.id,
  phases: MOON_PHASES,
  description: s.description ?? '',
  totalDays: getSeasonDays(s, DEFAULT_CALENDAR_CONFIG),
}));

export const DAYS_PER_YEAR = getYearDays(DEFAULT_CALENDAR_CONFIG);
export const DAYS_PER_SEASON = getSeasonDays(DEFAULT_CALENDAR_CONFIG.seasons[0], DEFAULT_CALENDAR_CONFIG);
export const CYCLES_PER_SEASON = DEFAULT_CALENDAR_CONFIG.seasons[0].cycles;
export const PHASES_PER_SEASON = CYCLES_PER_SEASON * DEFAULT_CALENDAR_CONFIG.phases.length;

// --- Construction & formatting --------------------------------------------

export const createObojimaDate = (
  year: number,
  season: Season,
  phase: MoonPhase,
  day: number,
  cycle: number = 1
): ObojimaDate => ({ year, season, phase, day, cycle });

export const getCurrentObojimaDate = (
  config: CalendarConfig = DEFAULT_CALENDAR_CONFIG
): ObojimaDate => ({
  year: 1,
  season: config.seasons[0]?.id ?? 'Spring',
  phase: config.phases[0]?.id ?? 'New Moon',
  day: 1,
  cycle: 1,
});

export const formatObojimaDate = (
  date: ObojimaDate,
  config: CalendarConfig = DEFAULT_CALENDAR_CONFIG
): string => {
  const ordinal = getOrdinal(date.day);
  const cycleOrdinal = getOrdinal(date.cycle);
  const phaseName = resolvePhase(date.phase, config)?.name ?? date.phase;
  const seasonName = resolveSeason(date.season, config)?.name ?? date.season;
  return `${ordinal} day of the ${phaseName} (${cycleOrdinal} cycle), ${seasonName}, Year ${date.year}`;
};

export const formatObojimaDateShort = (
  date: ObojimaDate,
  config: CalendarConfig = DEFAULT_CALENDAR_CONFIG
): string => {
  const phaseName = resolvePhase(date.phase, config)?.name ?? date.phase;
  const seasonName = resolveSeason(date.season, config)?.name ?? date.season;
  return `${seasonName} ${phaseName} ${date.day} (C${date.cycle}), Y${date.year}`;
};

const getOrdinal = (num: number): string => {
  const suffix = ['th', 'st', 'nd', 'rd'];
  const v = num % 100;
  return num + (suffix[(v - 20) % 10] || suffix[v] || suffix[0]);
};

// --- Absolute-day conversion (canonical math engine) ----------------------

export const obojimaDateToAbsoluteDays = (
  date: ObojimaDate,
  config: CalendarConfig = DEFAULT_CALENDAR_CONFIG
): number => {
  const yearDays = getYearDays(config);
  const daysPerCycle = getDaysPerCycle(config);
  let total = (date.year - 1) * yearDays;

  const seasonIdx = getSeasonIndex(date.season, config);
  for (let i = 0; i < seasonIdx; i++) {
    total += getSeasonDays(config.seasons[i], config);
  }

  const cycle = Math.max(1, date.cycle || 1);
  total += (cycle - 1) * daysPerCycle;

  const phaseIdx = getPhaseIndex(date.phase, config);
  for (let i = 0; i < phaseIdx; i++) {
    total += config.phases[i].days;
  }

  total += date.day;
  return total;
};

export const absoluteDaysToObojimaDate = (
  absoluteDays: number,
  config: CalendarConfig = DEFAULT_CALENDAR_CONFIG
): ObojimaDate => {
  const yearDays = getYearDays(config);
  const daysPerCycle = getDaysPerCycle(config);

  if (yearDays <= 0 || daysPerCycle <= 0 || config.seasons.length === 0 || config.phases.length === 0) {
    return getCurrentObojimaDate(config);
  }

  const zeroBased = absoluteDays - 1;
  // Math.floor handles negative years correctly (e.g. subtracting past Year 1).
  const year = Math.floor(zeroBased / yearDays) + 1;
  let remaining = ((zeroBased % yearDays) + yearDays) % yearDays;

  // Find season.
  let seasonIdx = 0;
  for (let i = 0; i < config.seasons.length; i++) {
    const sDays = getSeasonDays(config.seasons[i], config);
    if (remaining < sDays) {
      seasonIdx = i;
      break;
    }
    remaining -= sDays;
    seasonIdx = i + 1;
  }
  // Clamp if we walked past the last season (defensive).
  if (seasonIdx >= config.seasons.length) {
    seasonIdx = config.seasons.length - 1;
    remaining = getSeasonDays(config.seasons[seasonIdx], config) - 1;
  }
  const season = config.seasons[seasonIdx];

  // Find cycle. Clamp defensively in case a degenerate config slipped past
  // validation — the season invariant is cycle ∈ [1, season.cycles].
  const cycle = Math.min(season.cycles, Math.floor(remaining / daysPerCycle) + 1);
  remaining = remaining % daysPerCycle;

  // Find phase + day.
  let phaseIdx = 0;
  for (let i = 0; i < config.phases.length; i++) {
    if (remaining < config.phases[i].days) {
      phaseIdx = i;
      break;
    }
    remaining -= config.phases[i].days;
    phaseIdx = i + 1;
  }
  if (phaseIdx >= config.phases.length) {
    phaseIdx = config.phases.length - 1;
    remaining = config.phases[phaseIdx].days - 1;
  }

  return {
    year,
    season: season.id,
    phase: config.phases[phaseIdx].id,
    day: remaining + 1,
    cycle,
  };
};

// --- Arithmetic ------------------------------------------------------------

export const addDaysToObojimaDate = (
  date: ObojimaDate,
  daysToAdd: number,
  config: CalendarConfig = DEFAULT_CALENDAR_CONFIG
): ObojimaDate => {
  const total = obojimaDateToAbsoluteDays(date, config) + daysToAdd;
  return absoluteDaysToObojimaDate(total, config);
};

export const subtractDaysFromObojimaDate = (
  date: ObojimaDate,
  daysToSubtract: number,
  config: CalendarConfig = DEFAULT_CALENDAR_CONFIG
): ObojimaDate => addDaysToObojimaDate(date, -daysToSubtract, config);

export const daysBetweenObojimaDate = (
  startDate: ObojimaDate,
  endDate: ObojimaDate,
  config: CalendarConfig = DEFAULT_CALENDAR_CONFIG
): number =>
  obojimaDateToAbsoluteDays(endDate, config) - obojimaDateToAbsoluteDays(startDate, config);

// Absolute 0-based index of the phase that contains this date. Monotonic
// across years. Used by phasesBetweenObojimaDate for O(1) computation.
const absolutePhaseIndex = (date: ObojimaDate, config: CalendarConfig): number => {
  const phasesPerCycle = config.phases.length;
  const phasesPerYear = config.seasons.reduce(
    (n, s) => n + s.cycles * phasesPerCycle,
    0,
  );
  let idx = (date.year - 1) * phasesPerYear;
  for (const s of config.seasons) {
    if (s.id === date.season) break;
    idx += s.cycles * phasesPerCycle;
  }
  idx += (Math.max(1, date.cycle || 1) - 1) * phasesPerCycle;
  const phaseIdx = config.phases.findIndex(p => p.id === date.phase);
  idx += Math.max(0, phaseIdx);
  return idx;
};

// Count phase boundaries crossed advancing from startDate to endDate.
// Preserves the historical walk semantics that downtime mechanics depend
// on: (a) returns 0 iff endDate ≤ startDate; (b) when startDate < endDate
// and endDate is mid-phase, the count includes the implicit advance out
// of endDate's phase. Implemented in O(seasons + phases), no iteration
// bounded by day span — safe for any config or date range.
export const phasesBetweenObojimaDate = (
  startDate: ObojimaDate,
  endDate: ObojimaDate,
  config: CalendarConfig = DEFAULT_CALENDAR_CONFIG
): number => {
  const startAbs = obojimaDateToAbsoluteDays(startDate, config);
  const endAbs = obojimaDateToAbsoluteDays(endDate, config);
  if (endAbs <= startAbs) return 0;

  const startIdx = absolutePhaseIndex(startDate, config);
  // If endDate is not at day 1 of its phase, the walk would overshoot into
  // the next phase, counting one extra step.
  const endIdx = absolutePhaseIndex(endDate, config) + (endDate.day === 1 ? 0 : 1);
  // The walk always advances at least once when startAbs < endAbs.
  return Math.max(1, endIdx - startIdx);
};

// --- Phase/season navigation (used by phasesBetween + UI) -----------------

export interface PhaseNavResult {
  season: Season;
  phase: MoonPhase;
  cycle: number;
  newYear: boolean;
}

export const getNextPhase = (
  currentSeason: Season,
  currentPhase: MoonPhase,
  currentCycle: number,
  config: CalendarConfig = DEFAULT_CALENDAR_CONFIG
): PhaseNavResult => {
  const phaseIdx = getPhaseIndex(currentPhase, config);
  const seasonIdx = getSeasonIndex(currentSeason, config);
  const season = config.seasons[seasonIdx];

  if (phaseIdx < config.phases.length - 1) {
    return {
      season: currentSeason,
      phase: config.phases[phaseIdx + 1].id,
      cycle: currentCycle,
      newYear: false,
    };
  }

  // End of phase list — advance cycle or season.
  if (currentCycle < season.cycles) {
    return {
      season: currentSeason,
      phase: config.phases[0].id,
      cycle: currentCycle + 1,
      newYear: false,
    };
  }

  // End of season — advance to next season or year.
  if (seasonIdx < config.seasons.length - 1) {
    return {
      season: config.seasons[seasonIdx + 1].id,
      phase: config.phases[0].id,
      cycle: 1,
      newYear: false,
    };
  }

  return {
    season: config.seasons[0].id,
    phase: config.phases[0].id,
    cycle: 1,
    newYear: true,
  };
};

export const getPreviousPhase = (
  currentSeason: Season,
  currentPhase: MoonPhase,
  currentCycle: number,
  config: CalendarConfig = DEFAULT_CALENDAR_CONFIG
): PhaseNavResult => {
  const phaseIdx = getPhaseIndex(currentPhase, config);
  const seasonIdx = getSeasonIndex(currentSeason, config);

  if (phaseIdx > 0) {
    return {
      season: currentSeason,
      phase: config.phases[phaseIdx - 1].id,
      cycle: currentCycle,
      newYear: false,
    };
  }

  if (currentCycle > 1) {
    return {
      season: currentSeason,
      phase: config.phases[config.phases.length - 1].id,
      cycle: currentCycle - 1,
      newYear: false,
    };
  }

  if (seasonIdx > 0) {
    const prevSeason = config.seasons[seasonIdx - 1];
    return {
      season: prevSeason.id,
      phase: config.phases[config.phases.length - 1].id,
      cycle: prevSeason.cycles,
      newYear: false,
    };
  }

  const lastSeason = config.seasons[config.seasons.length - 1];
  return {
    season: lastSeason.id,
    phase: config.phases[config.phases.length - 1].id,
    cycle: lastSeason.cycles,
    newYear: true,
  };
};

// --- Validation / safety --------------------------------------------------

export const isValidObojimaDate = (
  date: ObojimaDate,
  config: CalendarConfig = DEFAULT_CALENDAR_CONFIG
): boolean => {
  if (date.year < 1) return false;
  const season = resolveSeason(date.season, config);
  if (!season) return false;
  const phase = resolvePhase(date.phase, config);
  if (!phase) return false;
  if (date.cycle < 1 || date.cycle > season.cycles) return false;
  return date.day >= 1 && date.day <= phase.days;
};

export const isObojimaDate = (
  value: unknown,
  config: CalendarConfig = DEFAULT_CALENDAR_CONFIG
): value is ObojimaDate => {
  if (!value || typeof value !== 'object') return false;
  const obj = value as Record<string, unknown>;

  if (typeof obj.year !== 'number' || obj.year < 1) return false;
  if (typeof obj.season !== 'string') return false;
  if (typeof obj.phase !== 'string') return false;
  if (typeof obj.day !== 'number' || obj.day < 1) return false;
  if (typeof obj.cycle !== 'number') return false;

  const season = resolveSeason(obj.season, config);
  if (!season) return false;
  if (obj.cycle < 1 || obj.cycle > season.cycles) return false;

  const phase = resolvePhase(obj.phase, config);
  if (!phase) return false;
  if (obj.day > phase.days) return false;

  return true;
};

export const parseObojimaDate = (
  value: unknown,
  config: CalendarConfig = DEFAULT_CALENDAR_CONFIG
): ObojimaDate | null => (isObojimaDate(value, config) ? value : null);

// Coerce a possibly-invalid date into the nearest valid one for the active
// config. Keeps as much of the original intent as possible:
// - missing/unknown season id → first season in config
// - missing/unknown phase id  → first phase in config
// - cycle > season.cycles     → clamp to season.cycles
// - cycle < 1                 → clamp to 1
// - day > phase.days          → clamp to phase.days
// - day < 1                   → clamp to 1
// - year < 1                  → clamp to 1
// Returns null only if the config itself is degenerate (no seasons/phases).
export const coerceObojimaDate = (
  value: unknown,
  config: CalendarConfig = DEFAULT_CALENDAR_CONFIG
): ObojimaDate | null => {
  if (config.seasons.length === 0 || config.phases.length === 0) return null;
  if (!value || typeof value !== 'object') return null;

  const obj = value as Record<string, unknown>;
  if (
    typeof obj.year !== 'number' || !Number.isFinite(obj.year)
    || typeof obj.day !== 'number' || !Number.isFinite(obj.day)
    || typeof obj.cycle !== 'number' || !Number.isFinite(obj.cycle)
    || typeof obj.season !== 'string'
    || typeof obj.phase !== 'string'
  ) {
    return null;
  }

  const season =
    resolveSeason(obj.season, config) ?? config.seasons[0];
  const phase =
    resolvePhase(obj.phase, config) ?? config.phases[0];

  const year = Math.max(1, Math.floor(obj.year));
  const cycle = Math.min(season.cycles, Math.max(1, Math.floor(obj.cycle)));
  const day = Math.min(phase.days, Math.max(1, Math.floor(obj.day)));

  return { year, season: season.id, phase: phase.id, day, cycle };
};

export const safeObojimaDate = (
  value: unknown,
  fallback?: ObojimaDate,
  config: CalendarConfig = DEFAULT_CALENDAR_CONFIG
): ObojimaDate => {
  // First try: value already valid for this config.
  if (isObojimaDate(value, config)) return value;

  // Second try: coerce to the nearest valid shape in the active config.
  const coerced = coerceObojimaDate(value, config);
  if (coerced) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('ObojimaDate coerced to fit active config:', { from: value, to: coerced });
    }
    return coerced;
  }

  // Last resort: caller-supplied fallback or the config's "first day".
  const defaultDate: ObojimaDate = fallback || getCurrentObojimaDate(config);
  if (process.env.NODE_ENV === 'development') {
    console.warn('Invalid ObojimaDate data, using fallback:', { value, fallback: defaultDate });
  }
  return defaultDate;
};

// --- JS Date interop ------------------------------------------------------

export const obojimaDateToJSDate = (
  obojimaDate: ObojimaDate,
  baseYear: number = 2024,
  config: CalendarConfig = DEFAULT_CALENDAR_CONFIG
): Date => {
  const absoluteDays = obojimaDateToAbsoluteDays(obojimaDate, config);
  const jsDate = new Date(baseYear, 0, 1);
  jsDate.setDate(jsDate.getDate() + absoluteDays - 1);
  return jsDate;
};

export const jsDateToObojimaDate = (
  jsDate: Date,
  baseYear: number = 2024,
  config: CalendarConfig = DEFAULT_CALENDAR_CONFIG
): ObojimaDate => {
  const baseDate = new Date(baseYear, 0, 1);
  const daysDiff = Math.floor((jsDate.getTime() - baseDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  return absoluteDaysToObojimaDate(daysDiff, config);
};
