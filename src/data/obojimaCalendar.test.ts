import {
  ObojimaDate,
  CalendarConfig,
  addDaysToObojimaDate,
  subtractDaysFromObojimaDate,
  MOON_PHASES,
  CYCLES_PER_SEASON,
  DAYS_PER_YEAR,
  DAYS_PER_SEASON,
  DEFAULT_CALENDAR_CONFIG,
  getDaysPerCycle,
  getYearDays,
  getSeasonDays,
  obojimaDateToAbsoluteDays,
  absoluteDaysToObojimaDate,
  createObojimaDate,
  isValidObojimaDate,
  safeObojimaDate,
  coerceObojimaDate,
  phasesBetweenObojimaDate,
  isValidCalendarConfig,
} from './obojimaCalendar';
import { isSameObojimaDate, compareObojimaDate } from './calendarEvents';

const P = MOON_PHASES.length; // 4 phases
const C = CYCLES_PER_SEASON; // 3 cycles per season
const DAYS_PER_CYCLE = 30; // 8+7+8+7

function testCalendarNavigation() {
  console.log('Running Obojima Calendar backward navigation tests...\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, expected: any, actual: any) {
    if (condition) {
      console.log(`✓ ${testName}`);
      passed++;
    } else {
      console.log(`✗ ${testName}`);
      console.log(`  Expected:`, expected);
      console.log(`  Actual:`, actual);
      failed++;
    }
  }

  function assertDate(actual: ObojimaDate, expected: ObojimaDate, testName: string) {
    const match = isSameObojimaDate(actual, expected);
    assert(match, testName, expected, actual);
  }

  // Test A: Simple phase step (no wrap)
  console.log('\nTest A: Simple phase step (no wrap)');
  const testA = createObojimaDate(2024, 'Summer', 'Full Moon', 5, 2);
  const resultA = subtractDaysFromObojimaDate(testA, 1);
  assertDate(resultA, createObojimaDate(2024, 'Summer', 'Full Moon', 4, 2),
    'Subtract 1 day from mid-phase stays in same phase/cycle');

  // Test B: Phase wrap within same season/cycle-1
  console.log('\nTest B: Phase wrap within same season (cycle decrement)');
  const testB = createObojimaDate(2024, 'Summer', 'New Moon', 1, 3);
  const resultB = subtractDaysFromObojimaDate(testB, 1);
  assertDate(resultB, createObojimaDate(2024, 'Summer', 'Waning Moon', 7, 2),
    'From first day of phase in cycle 3, go to last day of previous phase in cycle 2');

  // Test C: Cycle wrap to previous season
  console.log('\nTest C: Cycle wrap to previous season');
  const testC = createObojimaDate(2024, 'Summer', 'New Moon', 1, 1);
  const resultC = subtractDaysFromObojimaDate(testC, 1);
  assertDate(resultC, createObojimaDate(2024, 'Spring', 'Waning Moon', 7, C),
    'From first phase of cycle 1 in Summer, go to last phase of last cycle in Spring');

  // Test D: Year wrap (season wrap that crosses year boundary)
  console.log('\nTest D: Year wrap (crossing year boundary)');
  const testD = createObojimaDate(2024, 'Spring', 'New Moon', 1, 1);
  const resultD = subtractDaysFromObojimaDate(testD, 1);
  assertDate(resultD, createObojimaDate(2023, 'Winter', 'Waning Moon', 7, C),
    'From first day of Spring, go to last day of Winter in previous year');

  // Test E1: Multi-day subtraction spanning multiple boundaries
  console.log('\nTest E1: Multi-day subtraction across year boundary');
  const testE1 = createObojimaDate(2024, 'Spring', 'New Moon', 1, 1);
  const resultE1 = subtractDaysFromObojimaDate(testE1, 9); // Subtract P+1 days would be 5, but using 9 for clear boundary crossing
  assertDate(resultE1, createObojimaDate(2023, 'Winter', 'Full Moon', 7, C),
    'Subtract 9 days from Spring New Moon day 1 crosses into previous year');

  // Test E2: Multi-day subtraction across cycles
  console.log('\nTest E2: Multi-day subtraction across cycles');
  const testE2 = createObojimaDate(2024, 'Autumn', 'Waxing Moon', 2, 2);
  const daysToSubtract = DAYS_PER_CYCLE + 2; // 32 days
  const resultE2 = subtractDaysFromObojimaDate(testE2, daysToSubtract);
  // From Autumn Waxing 2 (cycle 2), back 32 days:
  // This crosses from cycle 2 to cycle 1, ending at Autumn New Moon day 8 cycle 1
  assertDate(resultE2, createObojimaDate(2024, 'Autumn', 'New Moon', 8, 1),
    'Subtract 32 days crosses cycle boundary correctly');

  // Test F: Idempotent round-trip
  console.log('\nTest F: Idempotent round-trip');
  const testF = createObojimaDate(2024, 'Autumn', 'Full Moon', 3, 2);
  const forward15 = addDaysToObojimaDate(testF, 15);
  const backward15 = subtractDaysFromObojimaDate(forward15, 15);
  assertDate(backward15, testF, 'Add 15 days then subtract 15 returns to original');

  // Test G: Comparison stability
  console.log('\nTest G: Comparison stability');
  const testG1 = createObojimaDate(2024, 'Winter', 'Waxing Moon', 4, 2);
  const testG2 = createObojimaDate(2024, 'Winter', 'Waxing Moon', 4, 2);
  assert(isSameObojimaDate(testG1, testG2),
    'Two identical dates including cycle compare as equal', true, isSameObojimaDate(testG1, testG2));

  const forward1 = addDaysToObojimaDate(testG1, 1);
  const roundTrip = subtractDaysFromObojimaDate(forward1, 1);
  assertDate(roundTrip, testG1, 'Round trip preserves cycle field');

  // Test H: Type guarantees - check cycle is always present
  console.log('\nTest H: Type guarantees - cycle field presence');
  const dates = [
    createObojimaDate(2024, 'Spring', 'New Moon', 1, 1),
    addDaysToObojimaDate(createObojimaDate(2024, 'Summer', 'Full Moon', 5, 2), 10),
    subtractDaysFromObojimaDate(createObojimaDate(2024, 'Winter', 'Waning Moon', 3, 3), 20)
  ];

  dates.forEach((date, i) => {
    assert(typeof date.cycle === 'number' && date.cycle >= 1 && date.cycle <= C,
      `Date ${i} has valid cycle field`, `cycle: 1-${C}`, `cycle: ${date.cycle}`);
  });

  // Additional edge cases
  console.log('\nAdditional edge cases:');

  // Subtract from last day of year
  const lastDay = createObojimaDate(2024, 'Winter', 'Waning Moon', 7, 3);
  const nextToLast = subtractDaysFromObojimaDate(lastDay, 1);
  assertDate(nextToLast, createObojimaDate(2024, 'Winter', 'Waning Moon', 6, 3),
    'Subtract 1 from last day of year stays in same year');

  // Subtract exactly one phase worth of days
  const phaseTest = createObojimaDate(2024, 'Summer', 'Waxing Moon', 1, 2);
  const backOnePhase = subtractDaysFromObojimaDate(phaseTest, 8); // New Moon has 8 days
  assertDate(backOnePhase, createObojimaDate(2024, 'Summer', 'New Moon', 1, 2),
    'Subtract exactly one phase worth of days');

  // --- Default config invariants (Phase 0 regression guards) -------------
  console.log('\nDefault config invariants:');
  assert(getDaysPerCycle() === DAYS_PER_CYCLE,
    'DEFAULT config days-per-cycle matches legacy 30', DAYS_PER_CYCLE, getDaysPerCycle());
  assert(getYearDays() === DAYS_PER_YEAR,
    'DEFAULT config year-days matches legacy 360', DAYS_PER_YEAR, getYearDays());
  assert(DAYS_PER_YEAR === 360, 'DAYS_PER_YEAR back-compat constant is 360', 360, DAYS_PER_YEAR);
  assert(DAYS_PER_SEASON === 90, 'DAYS_PER_SEASON back-compat constant is 90', 90, DAYS_PER_SEASON);
  assert(CYCLES_PER_SEASON === 3, 'CYCLES_PER_SEASON back-compat constant is 3', 3, CYCLES_PER_SEASON);
  assert(MOON_PHASES.length === 4, 'MOON_PHASES back-compat array has 4 entries', 4, MOON_PHASES.length);

  // Round-trip: every absolute-day in the first year should map back to itself.
  let rtOk = true;
  for (let d = 1; d <= DAYS_PER_YEAR; d++) {
    const date = absoluteDaysToObojimaDate(d);
    const back = obojimaDateToAbsoluteDays(date);
    if (back !== d) { rtOk = false; break; }
  }
  assert(rtOk, 'Every day in year 1 round-trips abs → date → abs', 'all equal', 'mismatch');

  // Comparison order respects config.
  const springDay1 = createObojimaDate(1, 'Spring', 'New Moon', 1, 1);
  const summerDay1 = createObojimaDate(1, 'Summer', 'New Moon', 1, 1);
  assert(compareObojimaDate(springDay1, summerDay1) < 0,
    'Spring sorts before Summer', 'negative', compareObojimaDate(springDay1, summerDay1));

  assert(isValidObojimaDate(springDay1) === true,
    'Default Spring day 1 is valid', true, isValidObojimaDate(springDay1));
  assert(isValidObojimaDate({ ...springDay1, day: 99 }) === false,
    'Day 99 of New Moon (8 days) is invalid', false, isValidObojimaDate({ ...springDay1, day: 99 }));

  // --- Parametric: custom 2-season config, uneven season lengths --------
  console.log('\nParametric: custom 2-season calendar');
  const customConfig: CalendarConfig = {
    phases: [
      { id: 'dawn', name: 'Dawn', days: 5 },
      { id: 'dusk', name: 'Dusk', days: 5 },
    ],
    seasons: [
      { id: 'light', name: 'Season of Light', cycles: 4 }, // 4 * 10 = 40 days
      { id: 'dark', name: 'Season of Dark', cycles: 2 },   // 2 * 10 = 20 days
    ],
  };

  assert(getYearDays(customConfig) === 60,
    'Custom config year = 40 + 20 = 60 days', 60, getYearDays(customConfig));
  assert(getDaysPerCycle(customConfig) === 10,
    'Custom config cycle = 10 days', 10, getDaysPerCycle(customConfig));

  const customStart: ObojimaDate = { year: 1, season: 'light', phase: 'dawn', day: 1, cycle: 1 };
  const plus40 = addDaysToObojimaDate(customStart, 40, customConfig);
  assert(
    isSameObojimaDate(plus40, { year: 1, season: 'dark', phase: 'dawn', day: 1, cycle: 1 }),
    'Custom +40 days crosses from Light to Dark',
    { year: 1, season: 'dark', phase: 'dawn', day: 1, cycle: 1 },
    plus40
  );
  const plus60 = addDaysToObojimaDate(customStart, 60, customConfig);
  assert(
    isSameObojimaDate(plus60, { year: 2, season: 'light', phase: 'dawn', day: 1, cycle: 1 }),
    'Custom +60 days rolls the year over',
    { year: 2, season: 'light', phase: 'dawn', day: 1, cycle: 1 },
    plus60
  );

  // Per-season cycle counts respected by Dark (2 cycles) — day 21 of Dark = year 2 day 1.
  const darkStart: ObojimaDate = { year: 1, season: 'dark', phase: 'dawn', day: 1, cycle: 1 };
  const darkRollover = addDaysToObojimaDate(darkStart, 20, customConfig);
  assert(
    isSameObojimaDate(darkRollover, { year: 2, season: 'light', phase: 'dawn', day: 1, cycle: 1 }),
    'Dark (2 cycles × 10 days) rolls over after 20 days',
    { year: 2, season: 'light', phase: 'dawn', day: 1, cycle: 1 },
    darkRollover
  );

  // --- Asymmetric seasons: each season has a different cycle count ------
  console.log('\nParametric: asymmetric 4-season calendar (cycles 1/2/3/4)');
  const asymConfig: CalendarConfig = {
    phases: [
      { id: 'a', name: 'A', days: 5 },
      { id: 'b', name: 'B', days: 5 },
    ],
    seasons: [
      { id: 's1', name: 'One',   cycles: 1 }, //  10 days
      { id: 's2', name: 'Two',   cycles: 2 }, //  20
      { id: 's3', name: 'Three', cycles: 3 }, //  30
      { id: 's4', name: 'Four',  cycles: 4 }, //  40 → year = 100
    ],
  };
  assert(getYearDays(asymConfig) === 100, 'Asymmetric year = 10+20+30+40 = 100', 100, getYearDays(asymConfig));
  assert(getSeasonDays(asymConfig.seasons[3], asymConfig) === 40,
    'Fourth season = 40 days', 40, getSeasonDays(asymConfig.seasons[3], asymConfig));

  const asymStart: ObojimaDate = { year: 1, season: 's1', phase: 'a', day: 1, cycle: 1 };
  const afterOneYear = addDaysToObojimaDate(asymStart, 100, asymConfig);
  assert(
    isSameObojimaDate(afterOneYear, { year: 2, season: 's1', phase: 'a', day: 1, cycle: 1 }),
    'Adding exactly one year wraps cleanly through all asymmetric seasons',
    { year: 2, season: 's1', phase: 'a', day: 1, cycle: 1 },
    afterOneYear
  );

  // Absolute-day ↔ date round-trip for the asymmetric config across entire year.
  let asymOk = true;
  for (let d = 1; d <= 100; d++) {
    const date = absoluteDaysToObojimaDate(d, asymConfig);
    const back = obojimaDateToAbsoluteDays(date, asymConfig);
    if (back !== d) { asymOk = false; break; }
  }
  assert(asymOk, 'Every day in asymmetric year 1 round-trips abs→date→abs', 'all equal', 'mismatch');

  // --- Minimal config: 1 season × 1 cycle × 1 phase (365-day year) -----
  console.log('\nParametric: minimal 1-season 365-day calendar');
  const minimalConfig: CalendarConfig = {
    phases: [{ id: 'day', name: 'Day', days: 365 }],
    seasons: [{ id: 'year', name: 'Year', cycles: 1 }],
  };
  assert(getYearDays(minimalConfig) === 365, 'Minimal year = 365 days', 365, getYearDays(minimalConfig));
  const day200 = addDaysToObojimaDate(
    { year: 1, season: 'year', phase: 'day', day: 1, cycle: 1 }, 199, minimalConfig
  );
  assert(
    isSameObojimaDate(day200, { year: 1, season: 'year', phase: 'day', day: 200, cycle: 1 }),
    'Minimal +199 days lands on day 200',
    { year: 1, season: 'year', phase: 'day', day: 200, cycle: 1 },
    day200
  );

  // --- Coercion: preserves intent when stored data doesn't fit new config
  console.log('\nCoercion / safeObojimaDate:');
  // Stored: Winter cycle 3 day 7, but new config shrinks Winter to 1 cycle, Waning to 5 days.
  const shrunkConfig: CalendarConfig = {
    phases: [
      { id: 'New Moon', name: 'New Moon', days: 8 },
      { id: 'Waxing Moon', name: 'Waxing Moon', days: 7 },
      { id: 'Full Moon', name: 'Full Moon', days: 8 },
      { id: 'Waning Moon', name: 'Waning Moon', days: 5 }, // was 7
    ],
    seasons: [
      { id: 'Spring', name: 'Spring', cycles: 3 },
      { id: 'Summer', name: 'Summer', cycles: 3 },
      { id: 'Autumn', name: 'Autumn', cycles: 3 },
      { id: 'Winter', name: 'Winter', cycles: 1 }, // was 3
    ],
  };
  const storedWinter = { year: 5, season: 'Winter', phase: 'Waning Moon', day: 7, cycle: 3 };
  const coercedWinter = coerceObojimaDate(storedWinter, shrunkConfig);
  assert(
    coercedWinter !== null && isSameObojimaDate(coercedWinter, {
      year: 5, season: 'Winter', phase: 'Waning Moon', day: 5, cycle: 1,
    }),
    'Coerce clamps cycle 3→1 and day 7→5 while keeping year/season/phase',
    { year: 5, season: 'Winter', phase: 'Waning Moon', day: 5, cycle: 1 },
    coercedWinter
  );

  // Unknown season substitutes first; keeps valid phase + clamped day/cycle.
  const storedAlien = { year: 2, season: 'Mistmoor', phase: 'Full Moon', day: 99, cycle: 99 };
  const coercedAlien = coerceObojimaDate(storedAlien, DEFAULT_CALENDAR_CONFIG);
  assert(
    coercedAlien !== null
      && coercedAlien.season === 'Spring'
      && coercedAlien.phase === 'Full Moon'
      && coercedAlien.cycle === 3
      && coercedAlien.day === 8,
    'Coerce maps unknown season to first, clamps cycle 99→3 and day 99→8',
    'Spring / Full Moon / cycle 3 / day 8',
    coercedAlien
  );

  // safeObojimaDate wraps coerce — falls back only if coerce can't produce anything.
  const safe = safeObojimaDate(storedWinter, undefined, shrunkConfig);
  assert(safe.cycle === 1 && safe.day === 5,
    'safeObojimaDate returns coerced value when possible',
    'cycle 1 / day 5',
    `cycle ${safe.cycle} / day ${safe.day}`);

  // --- phasesBetweenObojimaDate: closed-form correctness & performance -
  console.log('\nphasesBetweenObojimaDate (closed-form):');
  // 1 day forward within the same phase still counts 1 (legacy walk semantics).
  const pStart = createObojimaDate(1, 'Spring', 'New Moon', 5, 1);
  const pSamePhase = createObojimaDate(1, 'Spring', 'New Moon', 6, 1);
  assert(phasesBetweenObojimaDate(pStart, pSamePhase) === 1,
    'Mid-phase 1-day advance counts 1 phase (legacy semantics)',
    1, phasesBetweenObojimaDate(pStart, pSamePhase));

  // Same date → 0.
  assert(phasesBetweenObojimaDate(pStart, pStart) === 0,
    'Same-date returns 0 phases', 0, phasesBetweenObojimaDate(pStart, pStart));

  // End before start → 0.
  assert(phasesBetweenObojimaDate(pSamePhase, pStart) === 0,
    'End-before-start returns 0', 0, phasesBetweenObojimaDate(pSamePhase, pStart));

  // End at day 1 of next phase → exactly 1.
  const pNextPhaseStart = createObojimaDate(1, 'Spring', 'Waxing Moon', 1, 1);
  assert(phasesBetweenObojimaDate(pStart, pNextPhaseStart) === 1,
    'Day 5 NM → day 1 Waxing counts 1 phase',
    1, phasesBetweenObojimaDate(pStart, pNextPhaseStart));

  // End mid-next-phase → counts 2 (walk would overshoot).
  const pMidNextPhase = createObojimaDate(1, 'Spring', 'Waxing Moon', 2, 1);
  assert(phasesBetweenObojimaDate(pStart, pMidNextPhase) === 2,
    'Day 5 NM → day 2 Waxing counts 2 phases',
    2, phasesBetweenObojimaDate(pStart, pMidNextPhase));

  // Full year worth of phases: 48 for default config.
  const pNextYear = createObojimaDate(2, 'Spring', 'New Moon', 1, 1);
  const yearPhaseStart = createObojimaDate(1, 'Spring', 'New Moon', 1, 1);
  assert(phasesBetweenObojimaDate(yearPhaseStart, pNextYear) === 48,
    'One full year = 48 phases (4 seasons × 3 cycles × 4 phases)',
    48, phasesBetweenObojimaDate(yearPhaseStart, pNextYear));

  // Performance: closed-form handles spans the old walk would have capped.
  const far = createObojimaDate(10000, 'Spring', 'New Moon', 1, 1);
  const farPhases = phasesBetweenObojimaDate(yearPhaseStart, far);
  assert(farPhases === 9999 * 48,
    'Phases over 9999 years computed in O(1), no iteration cap',
    9999 * 48, farPhases);

  // --- compareObojimaDate: deterministic for unknown ids ---------------
  console.log('\ncompareObojimaDate: unknown-id tiebreaker:');
  // Two events with unknown seasons should sort in a stable, id-based order.
  const eA: ObojimaDate = { year: 1, season: 'Alpha', phase: 'Unknown', day: 1, cycle: 1 };
  const eB: ObojimaDate = { year: 1, season: 'Beta', phase: 'Unknown', day: 1, cycle: 1 };
  const cmpAB = compareObojimaDate(eA, eB, DEFAULT_CALENDAR_CONFIG);
  const cmpBA = compareObojimaDate(eB, eA, DEFAULT_CALENDAR_CONFIG);
  assert(cmpAB < 0 && cmpBA > 0,
    'Unknown-season ids sort stably by string compare',
    'signed pair', `${cmpAB}/${cmpBA}`);

  // --- isValidCalendarConfig: hardened guards --------------------------
  console.log('\nisValidCalendarConfig guards:');
  assert(isValidCalendarConfig(DEFAULT_CALENDAR_CONFIG),
    'Default config passes validation', true, isValidCalendarConfig(DEFAULT_CALENDAR_CONFIG));

  const configWithDuplicates = {
    phases: [
      { id: 'p', name: 'P', days: 5 },
      { id: 'p', name: 'P2', days: 5 },  // duplicate id
    ],
    seasons: [{ id: 's', name: 'S', cycles: 1 }],
  };
  assert(!isValidCalendarConfig(configWithDuplicates),
    'Duplicate phase ids rejected', false, isValidCalendarConfig(configWithDuplicates));

  const configWithEmptyId = {
    phases: [{ id: '', name: 'Nameless', days: 5 }],
    seasons: [{ id: 's', name: 'S', cycles: 1 }],
  };
  assert(!isValidCalendarConfig(configWithEmptyId),
    'Empty string id rejected', false, isValidCalendarConfig(configWithEmptyId));

  const configWithHugeDays = {
    phases: [{ id: 'p', name: 'P', days: 1_000_000 }],
    seasons: [{ id: 's', name: 'S', cycles: 1 }],
  };
  assert(!isValidCalendarConfig(configWithHugeDays),
    '1M days per phase rejected (DoS guard)', false, isValidCalendarConfig(configWithHugeDays));

  const configWithHugeCycles = {
    phases: [{ id: 'p', name: 'P', days: 5 }],
    seasons: [{ id: 's', name: 'S', cycles: 1_000_000 }],
  };
  assert(!isValidCalendarConfig(configWithHugeCycles),
    '1M cycles per season rejected (DoS guard)', false, isValidCalendarConfig(configWithHugeCycles));

  const configWithNaN = {
    phases: [{ id: 'p', name: 'P', days: NaN }],
    seasons: [{ id: 's', name: 'S', cycles: 1 }],
  };
  assert(!isValidCalendarConfig(configWithNaN),
    'NaN days rejected', false, isValidCalendarConfig(configWithNaN));

  const configWithTooManySeasons = {
    phases: [{ id: 'p', name: 'P', days: 1 }],
    seasons: Array.from({ length: 65 }, (_, i) => ({ id: `s${i}`, name: `S${i}`, cycles: 1 })),
  };
  assert(!isValidCalendarConfig(configWithTooManySeasons),
    '>64 seasons rejected', false, isValidCalendarConfig(configWithTooManySeasons));

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log(`Test Results: ${passed} passed, ${failed} failed`);
  console.log('='.repeat(50));

  return failed === 0;
}

// Run the tests
if (typeof window === 'undefined') {
  // Node.js environment
  const success = testCalendarNavigation();
  process.exit(success ? 0 : 1);
} else {
  // Browser environment
  testCalendarNavigation();
}