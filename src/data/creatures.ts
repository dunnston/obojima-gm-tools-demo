// This file conditionally exports creatures based on the environment
// In demo mode, it uses the public subset; otherwise uses the full set

// Re-export types that are the same in both files
export type {
  CreatureAbilityScores,
  CreatureSpeed,
  CreatureSenses,
  CreatureSkills,
  CreatureSavingThrows,
  CreatureTrait,
  CreatureAction,
  Creature,
  Encounter
} from './creatures-public';

// Import the public creatures (always available)
import { creatures as publicCreatures } from './creatures-public';

// Try to import full creatures if available
let fullCreatures: any[] = [];
try {
  // This will only work if creatures-full.ts exists (local dev)
  const creaturesModule = require('./creatures-full');
  fullCreatures = creaturesModule.creatures || [];
} catch (e) {
  // File doesn't exist - that's fine for production/demo
}

// Export the appropriate creatures based on environment
export const creatures = process.env.NEXT_PUBLIC_DEMO_MODE === 'true'
  ? publicCreatures
  : (fullCreatures.length > 0 ? fullCreatures : publicCreatures);