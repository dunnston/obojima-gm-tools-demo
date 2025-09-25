import {
  ObojimaDate,
  addDaysToObojimaDate,
  subtractDaysFromObojimaDate,
  MOON_PHASES,
  CYCLES_PER_SEASON,
  createObojimaDate
} from './obojimaCalendar';
import { isSameObojimaDate } from './calendarEvents';

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