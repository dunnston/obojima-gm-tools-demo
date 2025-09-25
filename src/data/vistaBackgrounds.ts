/**
 * Vista Parallax Scene Editor - Background Presets
 *
 * This module defines preset background configurations for common scene types.
 */

export interface BackgroundPreset {
  id: string;
  name: string;
  description: string;
  imagePath: string;
  category: 'interior' | 'exterior' | 'dungeon' | 'special';
  suggestedBrightness?: number;
  suggestedBlur?: number;
  suggestedTint?: string;
  tags: string[];
  thumbnail?: string;
}

/**
 * Built-in background presets
 */
export const BACKGROUND_PRESETS: BackgroundPreset[] = [
  {
    id: 'convenience-store',
    name: 'Convenience Store',
    description: 'A modern convenience store with shelves and products',
    imagePath: '/images/vista/backgrounds/convience-store.png',
    category: 'interior',
    suggestedBrightness: 1.0,
    tags: ['store', 'indoor', 'modern', 'shop', 'retail'],
    thumbnail: '/images/vista/backgrounds/convience-store.png'
  },
  {
    id: 'forest',
    name: 'Forest',
    description: 'A lush forest with tall trees and natural beauty',
    imagePath: '/images/vista/backgrounds/forest.png',
    category: 'exterior',
    suggestedBrightness: 1.0,
    tags: ['forest', 'outdoor', 'nature', 'trees', 'wilderness'],
    thumbnail: '/images/vista/backgrounds/forest.png'
  },
  {
    id: 'house-on-cliff',
    name: 'House on Cliff',
    description: 'A dramatic house perched on a cliff overlooking the landscape',
    imagePath: '/images/vista/backgrounds/house-on-cliff.png',
    category: 'exterior',
    suggestedBrightness: 1.0,
    tags: ['house', 'cliff', 'outdoor', 'dramatic', 'scenic'],
    thumbnail: '/images/vista/backgrounds/house-on-cliff.png'
  },
  {
    id: 'koi-pond',
    name: 'Koi Pond',
    description: 'A serene koi pond with Japanese aesthetic',
    imagePath: '/images/vista/backgrounds/koi-pond.png',
    category: 'exterior',
    suggestedBrightness: 1.0,
    tags: ['pond', 'koi', 'japanese', 'peaceful', 'water', 'garden'],
    thumbnail: '/images/vista/backgrounds/koi-pond.png'
  },
  {
    id: 'marketplace',
    name: 'Marketplace',
    description: 'A bustling marketplace with vendors and stalls',
    imagePath: '/images/vista/backgrounds/market-place.png',
    category: 'exterior',
    suggestedBrightness: 1.1,
    tags: ['market', 'outdoor', 'social', 'vendors', 'bustling'],
    thumbnail: '/images/vista/backgrounds/market-place.png'
  },
  {
    id: 'mountain-shrine',
    name: 'Mountain Shrine',
    description: 'A sacred shrine nestled in the mountains',
    imagePath: '/images/vista/backgrounds/moutain-shrine.png',
    category: 'exterior',
    suggestedBrightness: 1.0,
    tags: ['shrine', 'mountain', 'sacred', 'spiritual', 'outdoor'],
    thumbnail: '/images/vista/backgrounds/moutain-shrine.png'
  },
  {
    id: 'ramen-shop',
    name: 'Ramen Shop',
    description: 'A cozy ramen shop with counter seating',
    imagePath: '/images/vista/backgrounds/ramen-shop.png',
    category: 'interior',
    suggestedBrightness: 0.95,
    suggestedTint: '#ffcc99',
    tags: ['ramen', 'restaurant', 'indoor', 'food', 'japanese'],
    thumbnail: '/images/vista/backgrounds/ramen-shop.png'
  },
  {
    id: 'sandcastle-village',
    name: 'Sandcastle Village',
    description: 'A whimsical village made of sand structures',
    imagePath: '/images/vista/backgrounds/sandcastle-villiage.png',
    category: 'exterior',
    suggestedBrightness: 1.1,
    tags: ['sand', 'village', 'whimsical', 'beach', 'outdoor'],
    thumbnail: '/images/vista/backgrounds/sandcastle-villiage.png'
  },
  {
    id: 'shop',
    name: 'Shop',
    description: 'A general shop interior with various goods',
    imagePath: '/images/vista/backgrounds/shop.png',
    category: 'interior',
    suggestedBrightness: 1.0,
    tags: ['shop', 'indoor', 'retail', 'merchant', 'goods'],
    thumbnail: '/images/vista/backgrounds/shop.png'
  },
  {
    id: 'snowy-village',
    name: 'Snowy Village',
    description: 'A peaceful village covered in snow',
    imagePath: '/images/vista/backgrounds/snowy-village.png',
    category: 'exterior',
    suggestedBrightness: 1.1,
    suggestedTint: '#e6f2ff',
    tags: ['snow', 'village', 'winter', 'cold', 'outdoor'],
    thumbnail: '/images/vista/backgrounds/snowy-village.png'
  },
  {
    id: 'swamp',
    name: 'Swamp',
    description: 'A mysterious swamp with murky waters',
    imagePath: '/images/vista/backgrounds/swamp.png',
    category: 'exterior',
    suggestedBrightness: 0.85,
    suggestedTint: '#99cc99',
    tags: ['swamp', 'outdoor', 'mysterious', 'nature', 'wetland'],
    thumbnail: '/images/vista/backgrounds/swamp.png'
  },
  {
    id: 'village',
    name: 'Village',
    description: 'A charming village with traditional architecture',
    imagePath: '/images/vista/backgrounds/villiage.png',
    category: 'exterior',
    suggestedBrightness: 1.0,
    tags: ['village', 'outdoor', 'peaceful', 'community', 'traditional'],
    thumbnail: '/images/vista/backgrounds/villiage.png'
  }
];

/**
 * Scene templates with pre-configured tokens and settings
 */
export interface SceneTemplate {
  id: string;
  name: string;
  description: string;
  backgroundPresetId: string;
  suggestedTokens: {
    name: string;
    portrait: string;
    position: { x: number; y: number };
    depth: 'background' | 'midground' | 'foreground';
  }[];
  gridEnabled: boolean;
  depthIndicatorsVisible: boolean;
}

export const SCENE_TEMPLATES: SceneTemplate[] = [
  {
    id: 'bar-fight',
    name: 'Bar Fight',
    description: 'A tavern brawl scenario with combatants',
    backgroundPresetId: 'ramen-shop',
    suggestedTokens: [
      {
        name: 'Barkeep',
        portrait: '/images/vista/tokens/defaults/barkeep.png',
        position: { x: 960, y: 400 },
        depth: 'background'
      },
      {
        name: 'Drunk Patron',
        portrait: '/images/vista/tokens/defaults/drunk.png',
        position: { x: 600, y: 600 },
        depth: 'midground'
      },
      {
        name: 'Brawler',
        portrait: '/images/vista/tokens/defaults/brawler.png',
        position: { x: 1200, y: 700 },
        depth: 'midground'
      }
    ],
    gridEnabled: true,
    depthIndicatorsVisible: false
  },
  {
    id: 'forest-ambush',
    name: 'Forest Ambush',
    description: 'Hidden enemies in a forest clearing',
    backgroundPresetId: 'forest',
    suggestedTokens: [
      {
        name: 'Bandit Leader',
        portrait: '/images/vista/tokens/defaults/bandit.png',
        position: { x: 400, y: 300 },
        depth: 'background'
      },
      {
        name: 'Archer',
        portrait: '/images/vista/tokens/defaults/archer.png',
        position: { x: 1400, y: 350 },
        depth: 'background'
      },
      {
        name: 'Traveler',
        portrait: '/images/vista/tokens/defaults/traveler.png',
        position: { x: 960, y: 600 },
        depth: 'midground'
      }
    ],
    gridEnabled: false,
    depthIndicatorsVisible: true
  },
  {
    id: 'throne-audience',
    name: 'Royal Audience',
    description: 'Meeting with the monarch in the throne room',
    backgroundPresetId: 'mountain-shrine',
    suggestedTokens: [
      {
        name: 'Monarch',
        portrait: '/images/vista/tokens/defaults/monarch.png',
        position: { x: 960, y: 200 },
        depth: 'background'
      },
      {
        name: 'Royal Guard',
        portrait: '/images/vista/tokens/defaults/guard.png',
        position: { x: 700, y: 350 },
        depth: 'midground'
      },
      {
        name: 'Royal Guard',
        portrait: '/images/vista/tokens/defaults/guard.png',
        position: { x: 1220, y: 350 },
        depth: 'midground'
      },
      {
        name: 'Advisor',
        portrait: '/images/vista/tokens/defaults/advisor.png',
        position: { x: 850, y: 400 },
        depth: 'midground'
      }
    ],
    gridEnabled: false,
    depthIndicatorsVisible: false
  },
  {
    id: 'dungeon-encounter',
    name: 'Dungeon Encounter',
    description: 'Face monsters in a dungeon chamber',
    backgroundPresetId: 'swamp',
    suggestedTokens: [
      {
        name: 'Skeleton',
        portrait: '/images/vista/tokens/defaults/skeleton.png',
        position: { x: 500, y: 400 },
        depth: 'midground'
      },
      {
        name: 'Skeleton',
        portrait: '/images/vista/tokens/defaults/skeleton.png',
        position: { x: 1400, y: 400 },
        depth: 'midground'
      },
      {
        name: 'Necromancer',
        portrait: '/images/vista/tokens/defaults/necromancer.png',
        position: { x: 960, y: 250 },
        depth: 'background'
      }
    ],
    gridEnabled: true,
    depthIndicatorsVisible: false
  },
  {
    id: 'market-day',
    name: 'Market Day',
    description: 'Browse wares at the marketplace',
    backgroundPresetId: 'marketplace',
    suggestedTokens: [
      {
        name: 'Fruit Vendor',
        portrait: '/images/vista/tokens/defaults/vendor.png',
        position: { x: 400, y: 500 },
        depth: 'midground'
      },
      {
        name: 'Blacksmith',
        portrait: '/images/vista/tokens/defaults/blacksmith.png',
        position: { x: 1500, y: 450 },
        depth: 'midground'
      },
      {
        name: 'Street Performer',
        portrait: '/images/vista/tokens/defaults/performer.png',
        position: { x: 960, y: 700 },
        depth: 'foreground'
      },
      {
        name: 'Town Guard',
        portrait: '/images/vista/tokens/defaults/guard.png',
        position: { x: 200, y: 600 },
        depth: 'midground'
      }
    ],
    gridEnabled: false,
    depthIndicatorsVisible: false
  }
];

/**
 * Get background preset by ID
 */
export function getBackgroundPreset(id: string): BackgroundPreset | undefined {
  return BACKGROUND_PRESETS.find(preset => preset.id === id);
}

/**
 * Get backgrounds by category
 */
export function getBackgroundsByCategory(category: BackgroundPreset['category']): BackgroundPreset[] {
  return BACKGROUND_PRESETS.filter(preset => preset.category === category);
}

/**
 * Get scene template by ID
 */
export function getSceneTemplate(id: string): SceneTemplate | undefined {
  return SCENE_TEMPLATES.find(template => template.id === id);
}

/**
 * Search backgrounds by tags
 */
export function searchBackgroundsByTags(tags: string[]): BackgroundPreset[] {
  return BACKGROUND_PRESETS.filter(preset =>
    tags.some(tag => preset.tags.includes(tag.toLowerCase()))
  );
}

/**
 * Default token portraits for quick use
 * Using CSS-generated tokens as fallbacks until actual images are added
 */
export const DEFAULT_TOKEN_PORTRAITS = {
  // Player Classes
  warrior: '/images/vista/Portraits/NPCs/ArcosSarinland.webp',
  mage: '/images/vista/Portraits/NPCs/AshkaC.webp',
  rogue: '/images/vista/Portraits/NPCs/Leeph.webp',
  cleric: '/images/vista/Portraits/NPCs/Casia.webp',
  ranger: '/images/vista/Portraits/NPCs/VrjnharA.webp',
  bard: '',
  paladin: '',
  barbarian: '',
  druid: '',
  monk: '',
  warlock: '',
  sorcerer: '',
  // NPCs
  merchant: '/images/vista/Portraits/NPCs/ArcosSarinland.webp',
  guard: '/images/vista/Portraits/NPCs/VrjnharA.webp',
  noble: '/images/vista/Portraits/NPCs/Casia.webp',
  commoner: '/images/vista/Portraits/NPCs/Leeph.webp',
  // Background Elements (for positioning in scenes)
  arcturianCouple: '/images/vista/Portraits/Background/ArcturianCouplePicnicDistant.webp',
  arcturianTravelers: '/images/vista/Portraits/Background/ArcturianCoupleInjuredWalking.webp',
  musician: '/images/vista/Portraits/Background/OrdaniMusicianDrum.webp',
  // Monsters
  goblin: '',
  orc: '',
  skeleton: '',
  zombie: '',
  dragon: '',
  wolf: ''
};

/**
 * Default token colors and emojis for CSS-based tokens
 */
export const DEFAULT_TOKEN_STYLES = {
  // Player Classes
  warrior: { color: '#dc2626', emoji: '⚔️', bg: '#fee2e2' },
  mage: { color: '#7c3aed', emoji: '🔮', bg: '#ede9fe' },
  rogue: { color: '#374151', emoji: '🗡️', bg: '#f3f4f6' },
  cleric: { color: '#f59e0b', emoji: '✨', bg: '#fef3c7' },
  ranger: { color: '#059669', emoji: '🏹', bg: '#d1fae5' },
  bard: { color: '#db2777', emoji: '🎵', bg: '#fce7f3' },
  paladin: { color: '#0284c7', emoji: '🛡️', bg: '#dbeafe' },
  barbarian: { color: '#ea580c', emoji: '🪓', bg: '#fed7aa' },
  druid: { color: '#65a30d', emoji: '🌿', bg: '#ecfccb' },
  monk: { color: '#7c2d12', emoji: '👊', bg: '#fef7ed' },
  warlock: { color: '#581c87', emoji: '👹', bg: '#f3e8ff' },
  sorcerer: { color: '#be185d', emoji: '⚡', bg: '#fdf2f8' },
  // NPCs
  merchant: { color: '#ca8a04', emoji: '💰', bg: '#fefce8' },
  guard: { color: '#1f2937', emoji: '🛡️', bg: '#f9fafb' },
  noble: { color: '#7c3aed', emoji: '👑', bg: '#f5f3ff' },
  commoner: { color: '#6b7280', emoji: '👤', bg: '#f9fafb' },
  // Background Elements
  arcturianCouple: { color: '#7c3aed', emoji: '👫', bg: '#f5f3ff' },
  arcturianTravelers: { color: '#059669', emoji: '🚶', bg: '#d1fae5' },
  musician: { color: '#db2777', emoji: '🥁', bg: '#fce7f3' },
  // Monsters
  goblin: { color: '#16a34a', emoji: '👺', bg: '#f0fdf4' },
  orc: { color: '#dc2626', emoji: '😈', bg: '#fef2f2' },
  skeleton: { color: '#f3f4f6', emoji: '💀', bg: '#1f2937' },
  zombie: { color: '#65a30d', emoji: '🧟', bg: '#f7fee7' },
  dragon: { color: '#dc2626', emoji: '🐉', bg: '#fef2f2' },
  wolf: { color: '#6b7280', emoji: '🐺', bg: '#f3f4f6' }
};