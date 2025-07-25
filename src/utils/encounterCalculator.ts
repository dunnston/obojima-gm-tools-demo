import { Creature } from '@/data/creatures';

interface EncounterCreature {
  creature: Creature;
  count: number;
}

// CR to XP conversion table
const crToXp: Record<number | string, number> = {
  0: 10,
  0.125: 25,
  0.25: 50,
  0.5: 100,
  1: 200,
  2: 450,
  3: 700,
  4: 1100,
  5: 1800,
  6: 2300,
  7: 2900,
  8: 3900,
  9: 5000,
  10: 5900,
  11: 7200,
  12: 8400,
  13: 10000,
  14: 11500,
  15: 13000,
  16: 15000,
  17: 18000,
  18: 20000,
  19: 22000,
  20: 25000,
  21: 33000,
  22: 41000,
  23: 50000,
  24: 62000,
  25: 75000,
  26: 90000,
  27: 105000,
  28: 120000,
  29: 135000,
  30: 155000
};

// Encounter multipliers based on number of monsters
const encounterMultipliers: Record<number, number> = {
  1: 1,
  2: 1.5,
  3: 2,
  4: 2,
  5: 2.5,
  6: 2.5,
  7: 3,
  8: 3,
  9: 3.5,
  10: 3.5,
  11: 4,
  12: 4,
  13: 4.5,
  14: 4.5,
  15: 5
};

export interface EncounterDifficulty {
  totalXp: number;
  adjustedXp: number;
  totalCreatures: number;
  averageCr: number;
  highestCr: number;
  lowestCr: number;
  multiplier: number;
  breakdown: {
    creature: string;
    cr: number;
    count: number;
    xpEach: number;
    totalXp: number;
  }[];
}

export function calculateEncounterDifficulty(encounterCreatures: EncounterCreature[]): EncounterDifficulty {
  if (encounterCreatures.length === 0) {
    return {
      totalXp: 0,
      adjustedXp: 0,
      totalCreatures: 0,
      averageCr: 0,
      highestCr: 0,
      lowestCr: 0,
      multiplier: 1,
      breakdown: []
    };
  }

  let totalXp = 0;
  let totalCreatures = 0;
  const breakdown: EncounterDifficulty['breakdown'] = [];
  const allCrs: number[] = [];

  // Calculate base XP and collect CR values
  encounterCreatures.forEach(({ creature, count }) => {
    const cr = creature.challenge_rating;
    const xpEach = crToXp[cr] || 0;
    const totalCreatureXp = xpEach * count;
    
    totalXp += totalCreatureXp;
    totalCreatures += count;
    
    // Add all instances to CR array for average calculation
    for (let i = 0; i < count; i++) {
      allCrs.push(cr);
    }

    breakdown.push({
      creature: creature.name,
      cr,
      count,
      xpEach,
      totalXp: totalCreatureXp
    });
  });

  // Calculate CR statistics
  const highestCr = Math.max(...allCrs);
  const lowestCr = Math.min(...allCrs);
  const averageCr = allCrs.reduce((sum, cr) => sum + cr, 0) / allCrs.length;

  // Determine multiplier based on total number of creatures
  let multiplier = 1;
  if (totalCreatures >= 15) {
    multiplier = 5;
  } else if (totalCreatures >= 11) {
    multiplier = 4.5;
  } else if (totalCreatures >= 7) {
    multiplier = encounterMultipliers[totalCreatures] || 3;
  } else {
    multiplier = encounterMultipliers[totalCreatures] || 1;
  }

  const adjustedXp = Math.round(totalXp * multiplier);

  return {
    totalXp,
    adjustedXp,
    totalCreatures,
    averageCr: Math.round(averageCr * 100) / 100, // Round to 2 decimal places
    highestCr,
    lowestCr,
    multiplier,
    breakdown
  };
}

// Encounter difficulty thresholds for different party levels (4 players)
export const difficultyThresholds = {
  1: { easy: 250, medium: 500, hard: 750, deadly: 1100 },
  2: { easy: 500, medium: 1000, hard: 1500, deadly: 2000 },
  3: { easy: 750, medium: 1500, hard: 2250, deadly: 3400 },
  4: { easy: 1000, medium: 2000, hard: 3000, deadly: 4500 },
  5: { easy: 1250, medium: 2500, hard: 3750, deadly: 5700 },
  6: { easy: 1500, medium: 3000, hard: 4500, deadly: 6800 },
  7: { easy: 1750, medium: 3500, hard: 5250, deadly: 7900 },
  8: { easy: 2000, medium: 4000, hard: 6000, deadly: 9000 },
  9: { easy: 2250, medium: 4500, hard: 6750, deadly: 10100 },
  10: { easy: 2500, medium: 5000, hard: 7500, deadly: 11200 },
  11: { easy: 2750, medium: 5500, hard: 8250, deadly: 12400 },
  12: { easy: 3000, medium: 6000, hard: 9000, deadly: 13500 },
  13: { easy: 3250, medium: 6500, hard: 9750, deadly: 14600 },
  14: { easy: 3500, medium: 7000, hard: 10500, deadly: 15800 },
  15: { easy: 3750, medium: 7500, hard: 11250, deadly: 16900 },
  16: { easy: 4000, medium: 8000, hard: 12000, deadly: 18000 },
  17: { easy: 4250, medium: 8500, hard: 12750, deadly: 19100 },
  18: { easy: 4500, medium: 9000, hard: 13500, deadly: 20300 },
  19: { easy: 4750, medium: 9500, hard: 14250, deadly: 21400 },
  20: { easy: 5000, medium: 10000, hard: 15000, deadly: 22500 }
};

export function getEncounterDifficultyRating(adjustedXp: number, partyLevel: number = 5): string {
  const thresholds = difficultyThresholds[partyLevel as keyof typeof difficultyThresholds] || difficultyThresholds[5];
  
  if (adjustedXp >= thresholds.deadly) return 'Deadly';
  if (adjustedXp >= thresholds.hard) return 'Hard';
  if (adjustedXp >= thresholds.medium) return 'Medium';
  if (adjustedXp >= thresholds.easy) return 'Easy';
  return 'Trivial';
}