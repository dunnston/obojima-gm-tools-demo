export interface MagicItem {
  name: string;
  type: string;
  rarity: 'Common' | 'Uncommon' | 'Rare' | 'Very Rare' | 'Legendary';
  effect?: string;
  charges?: string;
  activation?: string;
  locationFound?: string;
  requiresAttunement: boolean;
  flavorText?: string;
  price?: number;
  imageUrl?: string;
}

export const magicItems: MagicItem[] = [
  {
    name: "Anglerfish Helm",
    type: "Wondrous Item",
    rarity: "Uncommon",
    requiresAttunement: true,
    effect: "A mystical helm that grants the wearer underwater vision.",
    price: 500
  },
  {
    name: "Baffled Candle",
    type: "Wondrous Item",
    rarity: "Uncommon",
    requiresAttunement: false
  },
  {
    name: "Bell of Resonance",
    type: "Wondrous Item",
    rarity: "Uncommon",
    requiresAttunement: false
  },
  {
    name: "Boots of the Stampede",
    type: "Wondrous Item",
    rarity: "Uncommon",
    requiresAttunement: false
  },
  {
    name: "Burnbright Brand Hair Dryer",
    type: "Wondrous Item",
    rarity: "Rare",
    requiresAttunement: true
  },
  {
    name: "Censer of Arguing Spirits",
    type: "Wondrous Item",
    rarity: "Rare",
    requiresAttunement: false
  },
  {
    name: "Canseco Bat",
    type: "Weapon (Warhammer)",
    rarity: "Uncommon",
    requiresAttunement: true
  },
  {
    name: "Cloud-Touched Boomerang",
    type: "Weapon (Boomerang)",
    rarity: "Common",
    requiresAttunement: true
  },
  {
    name: "Coin's Edge",
    type: "Wondrous Item",
    rarity: "Common",
    requiresAttunement: false
  },
  {
    name: "Corrupted Pendant",
    type: "Wondrous Item",
    rarity: "Rare",
    requiresAttunement: false
  },
  {
    name: "CRT TV & Chicken Timer",
    type: "Wondrous Item",
    rarity: "Uncommon",
    requiresAttunement: false
  },
  {
    name: "Cube of Cubes",
    type: "Wondrous Item",
    rarity: "Rare",
    requiresAttunement: false
  },
  {
    name: "Eye Kite",
    type: "Wondrous Item",
    rarity: "Common",
    requiresAttunement: true
  },
  {
    name: "Familiar's Collar",
    type: "Wondrous Item",
    rarity: "Uncommon",
    requiresAttunement: true
  },
  {
    name: "Field Cauldron",
    type: "Wondrous Item",
    rarity: "Uncommon",
    requiresAttunement: false
  },
  {
    name: "Fisherman's Spear",
    type: "Weapon (Spear)",
    rarity: "Common",
    requiresAttunement: true
  },
  {
    name: "Flying Broomstick",
    type: "Wondrous Item",
    rarity: "Uncommon",
    requiresAttunement: false
  },
  {
    name: "Keys to the Sandcastle",
    type: "Wondrous Item",
    rarity: "Uncommon",
    requiresAttunement: false
  },
  {
    name: "Keytar",
    type: "Wondrous Item",
    rarity: "Uncommon",
    requiresAttunement: true
  },
  {
    name: "Gametoy",
    type: "Wondrous Item",
    rarity: "Very Rare",
    requiresAttunement: true
  },
  {
    name: "Guardian Spheres",
    type: "Wondrous Item",
    rarity: "Uncommon",
    requiresAttunement: true
  },
  {
    name: "Heron's Eye Ring",
    type: "Ring",
    rarity: "Rare",
    requiresAttunement: true
  },
  {
    name: "Hover Hopper",
    type: "Wondrous Item",
    rarity: "Common",
    requiresAttunement: true
  },
  {
    name: "Hurler's Gloves",
    type: "Wondrous Item",
    rarity: "Uncommon",
    requiresAttunement: true
  },
  {
    name: "Instaprint Camera",
    type: "Wondrous Item",
    rarity: "Uncommon",
    requiresAttunement: false
  },
  {
    name: "Jabbadoon's Feather",
    type: "Wondrous Item",
    rarity: "Uncommon",
    requiresAttunement: false
  },
  {
    name: "Lafula's Iron Teapot",
    type: "Wondrous Item",
    rarity: "Very Rare",
    requiresAttunement: false
  },
  {
    name: "Lunar Weapon",
    type: "Weapon (Any)",
    rarity: "Uncommon",
    requiresAttunement: true
  },
  {
    name: "Oiki's Pinwheel",
    type: "Wondrous Item",
    rarity: "Rare",
    requiresAttunement: false
  },
  {
    name: "Only Members Jacket",
    type: "Wondrous Item",
    rarity: "Uncommon",
    requiresAttunement: false
  },
  {
    name: "Painter's Sun Hat",
    type: "Wondrous Item",
    rarity: "Common",
    requiresAttunement: false
  },
  {
    name: "Pendants of Belonging",
    type: "Wondrous Item",
    rarity: "Uncommon",
    requiresAttunement: false
  },
  {
    name: "Punch Card",
    type: "Wondrous Item",
    rarity: "Uncommon",
    requiresAttunement: false
  },
  {
    name: "Roake's Clay Urn",
    type: "Wondrous Item",
    rarity: "Uncommon",
    requiresAttunement: false
  },
  {
    name: "Ruby Red Bike",
    type: "Wondrous Item",
    rarity: "Rare",
    requiresAttunement: false
  },
  {
    name: "Scarf of Muffling",
    type: "Wondrous Item",
    rarity: "Uncommon",
    requiresAttunement: false
  },
  {
    name: "Scuttling Lantern",
    type: "Wondrous Item",
    rarity: "Common",
    requiresAttunement: false
  },
  {
    name: "Sibling Purses",
    type: "Wondrous Item",
    rarity: "Uncommon",
    requiresAttunement: false
  },
  {
    name: "Soda Cans",
    type: "Wondrous Item",
    rarity: "Uncommon",
    requiresAttunement: false
  },
  {
    name: "Solar Amulet",
    type: "Wondrous Item",
    rarity: "Uncommon",
    requiresAttunement: true
  },
  {
    name: "Splinter Bow",
    type: "Weapon (Any Bow)",
    rarity: "Uncommon",
    requiresAttunement: true
  },
  {
    name: "Sticky Hand",
    type: "Wondrous Item",
    rarity: "Common",
    requiresAttunement: false
  },
  {
    name: "Sunbaked Cassettes",
    type: "Wondrous Item",
    rarity: "Uncommon",
    requiresAttunement: true
  },
  {
    name: "Talisman of the Phoenix",
    type: "Wondrous Item",
    rarity: "Rare",
    requiresAttunement: false
  },
  {
    name: "Travel Wok",
    type: "Weapon (Frying Pan)",
    rarity: "Rare",
    requiresAttunement: false
  },
  {
    name: "Umbrella of Shielding",
    type: "Weapon (Umbrella)",
    rarity: "Uncommon",
    requiresAttunement: true
  },
  {
    name: "Weapon of the Sun and Moon",
    type: "Weapon (Any)",
    rarity: "Rare",
    requiresAttunement: true
  },
  {
    name: "Yappa Mask",
    type: "Wondrous Item",
    rarity: "Uncommon",
    requiresAttunement: false
  }
];

// Helper functions to filter magic items
export const getWondrousItems = () => magicItems.filter(item => item.type === 'Wondrous Item' || item.type === 'Ring');
export const getWeapons = () => magicItems.filter(item => item.type.includes('Weapon'));
export const getRareItems = () => magicItems.filter(item => item.rarity === 'Rare' || item.rarity === 'Very Rare' || item.rarity === 'Legendary');

export const getMagicItemsByRarity = (rarity: string) => {
  return magicItems.filter(item => item.rarity === rarity);
};

export const getMagicItemsByType = (type: string) => {
  return magicItems.filter(item => item.type === type);
};

export const getAttunementItems = () => {
  return magicItems.filter(item => item.requiresAttunement);
};