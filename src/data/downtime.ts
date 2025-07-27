// Core Types
export type DowntimeActivityType = 
  | 'sword_school' 
  | 'witch_coven' 
  | 'crafting' 
  | 'gathering' 
  | 'carousing' 
  | 'learning' 
  | 'faction_work';

export type DowntimeStatus = 'active' | 'completed' | 'paused' | 'failed';

export interface DowntimeActivity {
  id: string;
  type: DowntimeActivityType;
  characterId: string;
  characterName: string;
  startDate: Date;
  duration: number; // in days
  status: DowntimeStatus;
  dmNotes?: string;
  created_at: Date;
  updated_at: Date;
}

// Sword School Training
export interface SwordSchoolActivity extends DowntimeActivity {
  type: 'sword_school';
  totalWeeksTrained: number;
  currentMasterAC: number; // 30 - weeks trained
  attemptedDuel: boolean;
  duelResult?: 'success' | 'fail';
  nextAttemptDate?: Date; // if failed, +3 months
  masterTechniqueLearned: boolean;
  questsCompleted: string[];
}

// Witch Coven Training
export type CovenStatus = 'apprentice' | 'member' | 'oathbound' | 'rejected';

export interface WitchCovenActivity extends DowntimeActivity {
  type: 'witch_coven';
  covenName: string;
  status: CovenStatus;
  weeksStudied: number;
  oathTaken: boolean;
  accessToResources: string[]; // potions, spells, training
  covenBoons: string[];
  covenQuests: string[];
  rivalryEvents: string[];
  breachOfOath: boolean;
  covenCurse?: string;
}

// Crafting
export interface CraftingActivity extends DowntimeActivity {
  type: 'crafting';
  itemBeingCrafted: string;
  daysRequired: number;
  progress: number; // 0-100 percentage
  dcNeeded?: number;
  toolProficiency?: string;
  materialsUsed: string[];
  result?: 'success' | 'failure' | 'exceptional';
}

// Gathering/Exploration
export type RiskLevel = 'low' | 'medium' | 'high' | 'extreme';

export interface GatheringActivity extends DowntimeActivity {
  type: 'gathering';
  targetResource: string;
  location: string;
  riskLevel: RiskLevel;
  outcome?: {
    success: boolean;
    quantityFound?: number;
    dangerEncountered?: string;
    rollResult?: number;
  };
}

// Carousing
export interface CarousingActivity extends DowntimeActivity {
  type: 'carousing';
  location: string;
  fundsSpent: number;
  rollOutcome?: {
    roll: number;
    result: string; // "Made friends", "Got into trouble", etc.
    friendsMade?: string[];
    favorsEarned?: string[];
    troubleCaused?: string;
    rumorLearned?: string;
  };
}

// Learning/Study
export interface LearningActivity extends DowntimeActivity {
  type: 'learning';
  subject: string;
  instructor?: string;
  daysSpent: number;
  result?: {
    proficiencyGained?: string;
    loreLearned?: string;
    abilityUnlocked?: string;
    progress: number; // 0-100
  };
}

// Faction Work
export interface FactionWorkActivity extends DowntimeActivity {
  type: 'faction_work';
  factionName: string;
  task: string;
  difficultyDC?: number;
  successRoll?: number;
  reputationPoints?: number;
  rewards?: string[];
  consequences?: string[];
}

// Union type for all activity types
export type SpecificDowntimeActivity = 
  | SwordSchoolActivity 
  | WitchCovenActivity 
  | CraftingActivity 
  | GatheringActivity 
  | CarousingActivity 
  | LearningActivity 
  | FactionWorkActivity;

// Helper functions
export const createEmptyDowntimeActivity = (type: DowntimeActivityType, characterId: string, characterName: string): SpecificDowntimeActivity => {
  const baseActivity = {
    id: `downtime_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    characterId,
    characterName,
    startDate: new Date(),
    duration: 7, // default 1 week
    status: 'active' as DowntimeStatus,
    created_at: new Date(),
    updated_at: new Date()
  };

  switch (type) {
    case 'sword_school':
      return {
        ...baseActivity,
        type: 'sword_school',
        totalWeeksTrained: 0,
        currentMasterAC: 30,
        attemptedDuel: false,
        masterTechniqueLearned: false,
        questsCompleted: []
      };
    
    case 'witch_coven':
      return {
        ...baseActivity,
        type: 'witch_coven',
        covenName: '',
        status: 'apprentice',
        weeksStudied: 0,
        oathTaken: false,
        accessToResources: [],
        covenBoons: [],
        covenQuests: [],
        rivalryEvents: [],
        breachOfOath: false
      };
    
    case 'crafting':
      return {
        ...baseActivity,
        type: 'crafting',
        itemBeingCrafted: '',
        daysRequired: 7,
        progress: 0,
        materialsUsed: []
      };
    
    case 'gathering':
      return {
        ...baseActivity,
        type: 'gathering',
        targetResource: '',
        location: '',
        riskLevel: 'low'
      };
    
    case 'carousing':
      return {
        ...baseActivity,
        type: 'carousing',
        location: '',
        fundsSpent: 0
      };
    
    case 'learning':
      return {
        ...baseActivity,
        type: 'learning',
        subject: '',
        daysSpent: 0
      };
    
    case 'faction_work':
      return {
        ...baseActivity,
        type: 'faction_work',
        factionName: '',
        task: ''
      };
  }
};

// Calculate days elapsed between two dates
export const calculateDaysElapsed = (startDate: Date, endDate: Date = new Date()): number => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

// Calculate weeks elapsed
export const calculateWeeksElapsed = (startDate: Date, endDate: Date = new Date()): number => {
  const days = calculateDaysElapsed(startDate, endDate);
  return Math.floor(days / 7);
};

// Check if a date has passed
export const hasDatePassed = (date: Date): boolean => {
  return new Date(date) <= new Date();
};

// Add days to a date
export const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

// Add months to a date
export const addMonths = (date: Date, months: number): Date => {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
};

// Format date for display
export const formatDowntimeDate = (date: Date): string => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

// Get activity type display name
export const getActivityTypeDisplayName = (type: DowntimeActivityType): string => {
  const displayNames: Record<DowntimeActivityType, string> = {
    sword_school: 'Sword School Training',
    witch_coven: 'Witch Coven',
    crafting: 'Crafting',
    gathering: 'Gathering & Exploration',
    carousing: 'Carousing',
    learning: 'Learning & Study',
    faction_work: 'Faction Work'
  };
  return displayNames[type];
};

// Get status color classes
export const getStatusColorClasses = (status: DowntimeStatus): string => {
  const colors: Record<DowntimeStatus, string> = {
    active: 'bg-green-500/20 text-green-300',
    completed: 'bg-blue-500/20 text-blue-300',
    paused: 'bg-yellow-500/20 text-yellow-300',
    failed: 'bg-red-500/20 text-red-300'
  };
  return colors[status];
};

// Coven names in Obojima
export const covenNames = [
  'The Patchwork Robe',
  'The Fish Head Coven',
  'The Cloud Cap Coven',
  'The Wandering Coven',
  'The Moonlight Sisters'
];

// Common crafting items
export const craftingItems = [
  'Healing Potion',
  'Antitoxin',
  'Alchemist\'s Fire',
  'Acid Vial',
  'Silvered Weapon',
  'Enchanted Amulet',
  'Bag of Holding',
  'Boots of Speed',
  'Cloak of Elvenkind',
  'Ring of Protection'
];

// Gathering locations
export const gatheringLocations = [
  'The Brackwater Wetlands',
  'Mount Arbora',
  'The Gale Fields',
  'The Coastal Highlands',
  'The Shallows',
  'The Gift of Shuritashi',
  'The Land of Hot Water'
];

// Common resources
export const gatheringResources = [
  'Rare Herbs',
  'Magical Crystals',
  'Monster Parts',
  'Ancient Artifacts',
  'Precious Metals',
  'Exotic Woods',
  'Spirit Essence',
  'Dragon Scales'
];

// Faction names
export const factionNames = [
  'The Merchant\'s Guild',
  'The Adventurer\'s League',
  'The Scholar\'s Circle',
  'The Thieves\' Guild',
  'The Royal Guard',
  'The Druid Circle',
  'The Artificer\'s Workshop'
];

// Study subjects
export const studySubjects = [
  'Arcana',
  'History',
  'Nature',
  'Religion',
  'Medicine',
  'Alchemy',
  'Herbalism',
  'Monster Lore',
  'Ancient Languages',
  'Martial Techniques'
];