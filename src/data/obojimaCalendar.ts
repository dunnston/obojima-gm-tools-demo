// Obojima Calendar System
// 360-day year with 4 seasons of 90 days each
// Each season has 12 phases (3 complete moon cycles)
// Each phase alternates: New Moon (8 days), Waxing (7 days), Full Moon (8 days), Waning (7 days)

export type Season = 'Spring' | 'Summer' | 'Autumn' | 'Winter';
export type MoonPhase = 'New Moon' | 'Waxing Moon' | 'Full Moon' | 'Waning Moon';

export interface ObojimaDate {
  year: number;
  season: Season;
  phase: MoonPhase;
  day: number; // 1-8 within the phase (New/Full: 1-8, Waxing/Waning: 1-7)
  cycle: number; // 1-3 (which moon cycle within the season)
}

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

// Calendar configuration
export const MOON_PHASES: CalendarPhase[] = [
  {
    name: 'New Moon',
    description: 'A time of beginnings and ritual',
    days: 8
  },
  {
    name: 'Waxing Moon', 
    description: 'Growth, planting, preparation',
    days: 7
  },
  {
    name: 'Full Moon',
    description: 'Festivals, climax, abundance', 
    days: 8
  },
  {
    name: 'Waning Moon',
    description: 'Reflection, endings, rest',
    days: 7
  }
];

export const SEASONS: CalendarSeason[] = [
  {
    name: 'Spring',
    phases: MOON_PHASES,
    description: 'Season of renewal and growth',
    totalDays: 90
  },
  {
    name: 'Summer', 
    phases: MOON_PHASES,
    description: 'Season of abundance and energy',
    totalDays: 90
  },
  {
    name: 'Autumn',
    phases: MOON_PHASES, 
    description: 'Season of harvest and preparation',
    totalDays: 90
  },
  {
    name: 'Winter',
    phases: MOON_PHASES,
    description: 'Season of rest and reflection', 
    totalDays: 90
  }
];

export const DAYS_PER_YEAR = 360;
export const DAYS_PER_SEASON = 90;
export const PHASES_PER_SEASON = 12;
export const CYCLES_PER_SEASON = 3;

// Utility functions
export const createObojimaDate = (year: number, season: Season, phase: MoonPhase, day: number, cycle: number = 1): ObojimaDate => {
  return { year, season, phase, day, cycle };
};

export const getCurrentObojimaDate = (): ObojimaDate => {
  // Default starting date - can be customized
  return createObojimaDate(1, 'Spring', 'New Moon', 1, 1);
};

export const formatObojimaDate = (date: ObojimaDate): string => {
  const ordinal = getOrdinal(date.day);
  const cycleOrdinal = getOrdinal(date.cycle);
  return `${ordinal} day of the ${date.phase} (${cycleOrdinal} cycle), ${date.season}, Year ${date.year}`;
};

export const formatObojimaDateShort = (date: ObojimaDate): string => {
  return `${date.season} ${date.phase} ${date.day} (C${date.cycle}), Y${date.year}`;
};

const getOrdinal = (num: number): string => {
  const suffix = ["th", "st", "nd", "rd"];
  const v = num % 100;
  return num + (suffix[(v - 20) % 10] || suffix[v] || suffix[0]);
};

// Helper function to get the maximum days for a phase
const getPhaseMaxDays = (phase: MoonPhase): number => {
  switch (phase) {
    case 'New Moon':
    case 'Full Moon':
      return 8;
    case 'Waxing Moon':
    case 'Waning Moon':
      return 7;
    default:
      throw new Error(`Invalid phase: ${phase}`);
  }
};

export const addDaysToObojimaDate = (date: ObojimaDate, daysToAdd: number): ObojimaDate => {
  let { year, season, phase, day, cycle } = date;
  let remainingDays = daysToAdd;

  while (remainingDays > 0) {
    const currentPhaseMaxDays = getPhaseMaxDays(phase);
    const daysLeftInPhase = currentPhaseMaxDays - day;
    
    if (remainingDays <= daysLeftInPhase) {
      // Fits within current phase
      day += remainingDays;
      remainingDays = 0;
    } else {
      // Move to next phase
      remainingDays -= (daysLeftInPhase + 1);
      day = 1;
      
      const nextPhaseResult = getNextPhase(season, phase, cycle);
      season = nextPhaseResult.season;
      phase = nextPhaseResult.phase;
      cycle = nextPhaseResult.cycle;
      
      if (nextPhaseResult.newYear) {
        year++;
      }
    }
  }

  return { year, season, phase, day, cycle };
};

export const subtractDaysFromObojimaDate = (date: ObojimaDate, daysToSubtract: number): ObojimaDate => {
  let { year, season, phase, day, cycle } = date;
  let remainingDays = daysToSubtract;

  while (remainingDays > 0) {
    if (remainingDays < day) {
      // Fits within current phase
      day -= remainingDays;
      remainingDays = 0;
    } else {
      // Move to previous phase
      remainingDays -= day;

      const prevPhaseResult = getPreviousPhase(season, phase, cycle);
      season = prevPhaseResult.season;
      phase = prevPhaseResult.phase;
      cycle = prevPhaseResult.cycle;

      if (prevPhaseResult.newYear) {
        year--;
      }

      const prevPhase = MOON_PHASES.find(p => p.name === phase);
      day = prevPhase!.days;
    }
  }

  return { year, season, phase, day, cycle };
};

const getNextPhase = (currentSeason: Season, currentPhase: MoonPhase, currentCycle: number): { season: Season; phase: MoonPhase; cycle: number; newYear: boolean } => {
  const phaseIndex = MOON_PHASES.findIndex(p => p.name === currentPhase);
  const seasonIndex = SEASONS.findIndex(s => s.name === currentSeason);
  
  if (phaseIndex < MOON_PHASES.length - 1) {
    // Next phase in same cycle
    return {
      season: currentSeason,
      phase: MOON_PHASES[phaseIndex + 1].name,
      cycle: currentCycle,
      newYear: false
    };
  } else {
    // End of cycle - move to next cycle or season
    if (currentCycle < CYCLES_PER_SEASON) {
      // Next cycle in same season
      return {
        season: currentSeason,
        phase: MOON_PHASES[0].name,
        cycle: currentCycle + 1,
        newYear: false
      };
    } else {
      // Next season
      if (seasonIndex < SEASONS.length - 1) {
        return {
          season: SEASONS[seasonIndex + 1].name,
          phase: MOON_PHASES[0].name,
          cycle: 1,
          newYear: false
        };
      } else {
        // New year
        return {
          season: SEASONS[0].name,
          phase: MOON_PHASES[0].name,
          cycle: 1,
          newYear: true
        };
      }
    }
  }
};

const getPreviousPhase = (currentSeason: Season, currentPhase: MoonPhase, currentCycle: number): { season: Season; phase: MoonPhase; cycle: number; newYear: boolean } => {
  const phaseIndex = MOON_PHASES.findIndex(p => p.name === currentPhase);
  const seasonIndex = SEASONS.findIndex(s => s.name === currentSeason);

  if (phaseIndex > 0) {
    // Previous phase in same cycle
    return {
      season: currentSeason,
      phase: MOON_PHASES[phaseIndex - 1].name,
      cycle: currentCycle,
      newYear: false
    };
  } else {
    // End of cycle - move to previous cycle or season
    if (currentCycle > 1) {
      // Previous cycle in same season
      return {
        season: currentSeason,
        phase: MOON_PHASES[MOON_PHASES.length - 1].name,
        cycle: currentCycle - 1,
        newYear: false
      };
    } else {
      // Previous season
      if (seasonIndex > 0) {
        return {
          season: SEASONS[seasonIndex - 1].name,
          phase: MOON_PHASES[MOON_PHASES.length - 1].name,
          cycle: CYCLES_PER_SEASON,
          newYear: false
        };
      } else {
        // Previous year
        return {
          season: SEASONS[SEASONS.length - 1].name,
          phase: MOON_PHASES[MOON_PHASES.length - 1].name,
          cycle: CYCLES_PER_SEASON,
          newYear: true
        };
      }
    }
  }
};

export const daysBetweenObojimaDate = (startDate: ObojimaDate, endDate: ObojimaDate): number => {
  // Convert both dates to absolute days and find difference
  const startDays = obojimaDateToAbsoluteDays(startDate);
  const endDays = obojimaDateToAbsoluteDays(endDate);
  return endDays - startDays;
};

export const obojimaDateToAbsoluteDays = (date: ObojimaDate): number => {
  let totalDays = 0;
  
  // Add complete years
  totalDays += (date.year - 1) * DAYS_PER_YEAR;
  
  // Add complete seasons in current year
  const seasonIndex = SEASONS.findIndex(s => s.name === date.season);
  totalDays += seasonIndex * DAYS_PER_SEASON;
  
  // Add complete cycles in current season (each cycle = 4 phases = 30 days)
  const completeCycles = (date.cycle || 1) - 1;
  totalDays += completeCycles * 30; // Each cycle is exactly 30 days (8+7+8+7)
  
  // Add complete phases in current cycle
  const phaseIndex = MOON_PHASES.findIndex(p => p.name === date.phase);
  for (let i = 0; i < phaseIndex; i++) {
    totalDays += MOON_PHASES[i].days;
  }
  
  // Add days in current phase
  totalDays += date.day;
  
  return totalDays;
};

export const absoluteDaysToObojimaDate = (absoluteDays: number): ObojimaDate => {
  let remainingDays = absoluteDays - 1; // Convert to 0-based
  
  // Calculate year
  const year = Math.floor(remainingDays / DAYS_PER_YEAR) + 1;
  remainingDays = remainingDays % DAYS_PER_YEAR;
  
  // Calculate season
  const seasonIndex = Math.floor(remainingDays / DAYS_PER_SEASON);
  remainingDays = remainingDays % DAYS_PER_SEASON;
  
  // Calculate cycle within season (each cycle = 30 days)
  const cycle = Math.floor(remainingDays / 30) + 1;
  remainingDays = remainingDays % 30;
  
  // Calculate phase and day within cycle
  let phaseIndex = 0;
  while (phaseIndex < MOON_PHASES.length && remainingDays >= MOON_PHASES[phaseIndex].days) {
    remainingDays -= MOON_PHASES[phaseIndex].days;
    phaseIndex++;
  }
  
  return {
    year,
    season: SEASONS[seasonIndex].name,
    phase: MOON_PHASES[phaseIndex].name,
    day: remainingDays + 1,
    cycle
  };
};

export const isValidObojimaDate = (date: ObojimaDate): boolean => {
  if (date.year < 1) return false;
  if (!SEASONS.some(s => s.name === date.season)) return false;
  if (!MOON_PHASES.some(p => p.name === date.phase)) return false;
  if (date.cycle && (date.cycle < 1 || date.cycle > 3)) return false;

  const phase = MOON_PHASES.find(p => p.name === date.phase);
  if (!phase) return false;

  return date.day >= 1 && date.day <= phase.days;
};

/**
 * Type guard to check if an unknown value is a valid ObojimaDate
 */
export const isObojimaDate = (value: unknown): value is ObojimaDate => {
  if (!value || typeof value !== 'object') return false;

  const obj = value as Record<string, unknown>;

  // Check required properties exist and have correct types
  if (typeof obj.year !== 'number' || obj.year < 1) return false;
  if (typeof obj.season !== 'string' || !SEASONS.some(s => s.name === obj.season)) return false;
  if (typeof obj.phase !== 'string' || !MOON_PHASES.some(p => p.name === obj.phase)) return false;
  if (typeof obj.day !== 'number' || obj.day < 1) return false;
  if (typeof obj.cycle !== 'number' || obj.cycle < 1 || obj.cycle > CYCLES_PER_SEASON) return false;

  // Validate day is within phase bounds
  const phase = MOON_PHASES.find(p => p.name === obj.phase);
  if (!phase || obj.day > phase.days) return false;

  return true;
};

/**
 * Safely parse and validate an ObojimaDate from unknown data
 * Returns a valid ObojimaDate or null if invalid
 */
export const parseObojimaDate = (value: unknown): ObojimaDate | null => {
  if (isObojimaDate(value)) {
    return value;
  }
  return null;
};

/**
 * Create a safe ObojimaDate with fallback to defaults for invalid data
 * Always returns a valid ObojimaDate, logging warnings in development
 */
export const safeObojimaDate = (value: unknown, fallback?: ObojimaDate): ObojimaDate => {
  const defaultDate: ObojimaDate = fallback || {
    year: 1,
    season: 'Spring',
    phase: 'New Moon',
    day: 1,
    cycle: 1
  };

  if (isObojimaDate(value)) {
    return value;
  }

  // Log warning in development
  if (process.env.NODE_ENV === 'development') {
    console.warn('Invalid ObojimaDate data, using fallback:', { value, fallback: defaultDate });
  }

  return defaultDate;
};

// Calculate phases between two Obojima dates
export const phasesBetweenObojimaDate = (startDate: ObojimaDate, endDate: ObojimaDate): number => {
  const startAbsoluteDays = obojimaDateToAbsoluteDays(startDate);
  const endAbsoluteDays = obojimaDateToAbsoluteDays(endDate);
  
  if (endAbsoluteDays < startAbsoluteDays) return 0;
  
  // Calculate phases by walking through the calendar
  let currentDate = { ...startDate };
  let phasesElapsed = 0;
  
  while (obojimaDateToAbsoluteDays(currentDate) < endAbsoluteDays) {
    // Move to the start of the next phase
    const nextPhaseResult = getNextPhase(currentDate.season, currentDate.phase, currentDate.cycle);
    currentDate = {
      year: nextPhaseResult.newYear ? currentDate.year + 1 : currentDate.year,
      season: nextPhaseResult.season,
      phase: nextPhaseResult.phase,
      cycle: nextPhaseResult.cycle,
      day: 1
    };
    phasesElapsed++;
    
    // Safety check to prevent infinite loops
    if (phasesElapsed > 1000) break;
  }
  
  return phasesElapsed;
};

// Convert between Obojima dates and JavaScript dates (for compatibility)
export const obojimaDateToJSDate = (obojimaDate: ObojimaDate, baseYear: number = 2024): Date => {
  const absoluteDays = obojimaDateToAbsoluteDays(obojimaDate);
  const jsDate = new Date(baseYear, 0, 1); // January 1st of base year
  jsDate.setDate(jsDate.getDate() + absoluteDays - 1);
  return jsDate;
};

export const jsDateToObojimaDate = (jsDate: Date, baseYear: number = 2024): ObojimaDate => {
  const baseDate = new Date(baseYear, 0, 1);
  const daysDiff = Math.floor((jsDate.getTime() - baseDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  return absoluteDaysToObojimaDate(daysDiff);
};