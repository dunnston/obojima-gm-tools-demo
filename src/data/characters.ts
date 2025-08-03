export interface PlayerCharacter {
  id: string;
  characterName: string;
  playerName: string;
  class: string;
  level: number;
  armorClass: number;
  hitPoints: number;
  maxHitPoints: number;
  passivePerception: number;
  passiveInsight: number;
  passiveInvestigation: number;
  characterGoal: string;
  boons: string[];
  personalityTraits: string[];
  ideals: string[];
  bonds: string[];
  flaws: string[];
  notes?: string;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CharacterFormData {
  characterName: string;
  playerName: string;
  class: string;
  level: number | string;
  armorClass: number | string;
  hitPoints: number | string;
  maxHitPoints: number | string;
  passivePerception: number | string;
  passiveInsight: number | string;
  passiveInvestigation: number | string;
  characterGoal: string;
  boons: string;
  personalityTraits: string;
  ideals: string;
  bonds: string;
  flaws: string;
  notes?: string;
  imageUrl?: string;
}

// Helper functions for character management
export const createEmptyCharacter = (): CharacterFormData => ({
  characterName: '',
  playerName: '',
  class: '',
  level: 1,
  armorClass: '',
  hitPoints: '',
  maxHitPoints: '',
  passivePerception: '',
  passiveInsight: '',
  passiveInvestigation: '',
  characterGoal: '',
  boons: '',
  personalityTraits: '',
  ideals: '',
  bonds: '',
  flaws: '',
  notes: '',
  imageUrl: ''
});

export const formDataToCharacter = (formData: CharacterFormData): Omit<PlayerCharacter, 'id' | 'createdAt' | 'updatedAt'> => ({
  characterName: formData.characterName,
  playerName: formData.playerName,
  class: formData.class,
  level: typeof formData.level === 'string' ? parseInt(formData.level) || 1 : formData.level,
  armorClass: typeof formData.armorClass === 'string' ? parseInt(formData.armorClass) || 0 : formData.armorClass,
  hitPoints: typeof formData.hitPoints === 'string' ? parseInt(formData.hitPoints) || 0 : formData.hitPoints,
  maxHitPoints: typeof formData.maxHitPoints === 'string' ? parseInt(formData.maxHitPoints) || 0 : formData.maxHitPoints,
  passivePerception: typeof formData.passivePerception === 'string' ? parseInt(formData.passivePerception) || 0 : formData.passivePerception,
  passiveInsight: typeof formData.passiveInsight === 'string' ? parseInt(formData.passiveInsight) || 0 : formData.passiveInsight,
  passiveInvestigation: typeof formData.passiveInvestigation === 'string' ? parseInt(formData.passiveInvestigation) || 0 : formData.passiveInvestigation,
  characterGoal: formData.characterGoal,
  boons: formData.boons.split('\n').filter(item => item.trim() !== ''),
  personalityTraits: formData.personalityTraits.split('\n').filter(item => item.trim() !== ''),
  ideals: formData.ideals.split('\n').filter(item => item.trim() !== ''),
  bonds: formData.bonds.split('\n').filter(item => item.trim() !== ''),
  flaws: formData.flaws.split('\n').filter(item => item.trim() !== ''),
  notes: formData.notes,
  imageUrl: formData.imageUrl
});

export const characterToFormData = (character: PlayerCharacter): CharacterFormData => ({
  characterName: character.characterName,
  playerName: character.playerName,
  class: character.class,
  level: character.level || 1,
  armorClass: character.armorClass,
  hitPoints: character.hitPoints,
  maxHitPoints: character.maxHitPoints,
  passivePerception: character.passivePerception,
  passiveInsight: character.passiveInsight,
  passiveInvestigation: character.passiveInvestigation,
  characterGoal: character.characterGoal,
  boons: character.boons.join('\n'),
  personalityTraits: character.personalityTraits.join('\n'),
  ideals: character.ideals.join('\n'),
  bonds: character.bonds.join('\n'),
  flaws: character.flaws.join('\n'),
  notes: character.notes || '',
  imageUrl: character.imageUrl || ''
});

// Common D&D 5e classes for the dropdown
export const DND_CLASSES = [
  'Artificer',
  'Barbarian', 
  'Bard',
  'Cleric',
  'Druid',
  'Fighter',
  'Monk',
  'Paladin',
  'Ranger',
  'Rogue',
  'Sorcerer',
  'Warlock',
  'Wizard',
  'Other'
] as const;