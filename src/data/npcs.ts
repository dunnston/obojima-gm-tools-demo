export type Ability = 'STR' | 'DEX' | 'CON' | 'INT' | 'WIS' | 'CHA';

export type AbilityScores = Record<Ability, number>;
export type SavingThrowProficiencies = Record<Ability, boolean>;

export const ABILITIES: Ability[] = ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'];

export const SIZE_OPTIONS = [
  'Tiny',
  'Small',
  'Medium',
  'Large',
  'Huge',
  'Gargantuan',
] as const;
export type Size = typeof SIZE_OPTIONS[number];

export const CREATURE_TYPE_OPTIONS = [
  'Aberration',
  'Beast',
  'Celestial',
  'Construct',
  'Dragon',
  'Elemental',
  'Fey',
  'Fiend',
  'Giant',
  'Humanoid',
  'Monstrosity',
  'Ooze',
  'Plant',
  'Undead',
] as const;

export const ALIGNMENT_OPTIONS = [
  'Lawful Good',
  'Neutral Good',
  'Chaotic Good',
  'Lawful Neutral',
  'True Neutral',
  'Chaotic Neutral',
  'Lawful Evil',
  'Neutral Evil',
  'Chaotic Evil',
  'Unaligned',
] as const;

export const DEFAULT_ABILITY_SCORES: AbilityScores = {
  STR: 10,
  DEX: 10,
  CON: 10,
  INT: 10,
  WIS: 10,
  CHA: 10,
};

export const DEFAULT_SAVING_THROW_PROFICIENCIES: SavingThrowProficiencies = {
  STR: false,
  DEX: false,
  CON: false,
  INT: false,
  WIS: false,
  CHA: false,
};

export const getAbilityModifier = (score: number): number =>
  Math.floor(((Number.isFinite(score) ? score : 10) - 10) / 2);

export const formatModifier = (mod: number): string =>
  mod >= 0 ? `+${mod}` : `${mod}`;

export interface NPCFeature {
  name: string;
  description: string;
}

export interface NPCAction {
  name: string;
  description: string;
  attack_bonus?: number;
  damage_dice?: string;
  damage_type?: string;
  range?: string;
  spell_save_dc?: number;
}

export interface NPC {
  id: string;
  name: string;
  portrait?: string;
  details: string;
  location?: string;
  occupation?: string;
  tags?: string[];

  // Identity
  race?: string;
  class?: string;
  pronouns?: string;
  size?: Size;
  creature_type?: string;
  creature_subtype?: string;
  alignment?: string;

  // Descriptions
  physical_description?: string;

  // Personality Traits
  personality?: string;
  ideals?: string;
  bonds?: string;
  flaws?: string;

  // Stats
  ability_scores?: AbilityScores;
  saving_throw_proficiencies?: SavingThrowProficiencies;
  proficiency_bonus?: number;

  // Features & Actions
  features?: NPCFeature[];
  actions?: NPCAction[];

  created_at: Date;
  updated_at: Date;
}

// Empty array for NPCs - users will add their own
export const npcs: NPC[] = [];

// Helper functions
export const getNPCById = (id: string): NPC | undefined => {
  return npcs.find(npc => npc.id === id);
};

export const getNPCsByTag = (tag: string): NPC[] => {
  return npcs.filter(npc => npc.tags?.includes(tag));
};

export const searchNPCs = (query: string): NPC[] => {
  const lowercaseQuery = query.toLowerCase();
  return npcs.filter(npc =>
    npc.name.toLowerCase().includes(lowercaseQuery) ||
    npc.details.toLowerCase().includes(lowercaseQuery) ||
    npc.location?.toLowerCase().includes(lowercaseQuery) ||
    npc.occupation?.toLowerCase().includes(lowercaseQuery)
  );
};
