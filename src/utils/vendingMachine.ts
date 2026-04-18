import { ingredients, Ingredient } from '@/data/ingredients';
import { combatPotions, utilityPotions, whimsyPotions, Potion } from '@/data/potions';
import { magicItems, MagicItem, getWondrousItems, getWeapons, getRareItems } from '@/data/magicItems';
import { getSettings, VendingMachineSettings } from '@/data/settings';

export interface VendingMachineInventory {
  ingredients: Ingredient[];
  potions: Potion[];
  magicItems: MagicItem[];
}

// Helper function to get random items from an array
function getRandomItems<T>(array: T[], count: number): T[] {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

// Helper function to filter items by rarity
function filterByRarity<T extends { rarity: string }>(items: T[], rarity: string): T[] {
  return items.filter(item => item.rarity === rarity);
}

export function generateVendingMachineInventory(customPotions: Potion[] = []): VendingMachineInventory {
  const settings = getSettings().vendingMachine;

  return {
    ingredients: generateIngredients(settings),
    potions: generatePotions(settings, customPotions),
    magicItems: generateMagicItems(settings)
  };
}

function generateIngredients(settings: VendingMachineSettings): Ingredient[] {
  if (!settings.categories.ingredients) return [];

  const forcedNames = settings.includedItems?.ingredients || [];
  const forcedItems = ingredients.filter(i => forcedNames.includes(i.name));

  const availableIngredients = ingredients.filter(
    ingredient => !settings.excludedItems.ingredients.includes(ingredient.name) &&
                  !forcedNames.includes(ingredient.name)
  );

  const commonIngredients = filterByRarity(availableIngredients, 'Common');
  const uncommonIngredients = filterByRarity(availableIngredients, 'Uncommon');
  const rareIngredients = filterByRarity(availableIngredients, 'Rare');

  return [
    ...forcedItems,
    ...getRandomItems(commonIngredients, settings.ingredientQuantities.common),
    ...getRandomItems(uncommonIngredients, settings.ingredientQuantities.uncommon),
    ...getRandomItems(rareIngredients, settings.ingredientQuantities.rare)
  ];
}

function generatePotions(settings: VendingMachineSettings, customPotions: Potion[]): Potion[] {
  if (!settings.categories.potions) return [];

  const allPotions = [...combatPotions, ...utilityPotions, ...whimsyPotions, ...customPotions];

  const forcedNames = settings.includedItems?.potions || [];
  const forcedItems = allPotions.filter(p => forcedNames.includes(p.name));

  const availablePotions = allPotions.filter(
    potion => !settings.excludedItems.potions.includes(potion.name) &&
              !forcedNames.includes(potion.name)
  );

  const commonPotions = filterByRarity(availablePotions, 'Common');
  const uncommonPotions = filterByRarity(availablePotions, 'Uncommon');
  const rarePotions = filterByRarity(availablePotions, 'Rare');

  return [
    ...forcedItems,
    ...getRandomItems(commonPotions, settings.potionQuantities.common),
    ...getRandomItems(uncommonPotions, settings.potionQuantities.uncommon),
    ...getRandomItems(rarePotions, settings.potionQuantities.rare)
  ];
}

function generateMagicItems(settings: VendingMachineSettings): MagicItem[] {
  if (!settings.categories.magicItems) return [];

  const forcedNames = settings.includedItems?.magicItems || [];
  const forcedItems = magicItems.filter(i => forcedNames.includes(i.name));

  const availableMagicItems = magicItems.filter(
    item => !settings.excludedItems.magicItems.includes(item.name) &&
            !forcedNames.includes(item.name)
  );

  const wondrousItems = availableMagicItems.filter(item =>
    item.type === 'Wondrous Item' || item.type === 'Ring'
  );
  const weapons = availableMagicItems.filter(item =>
    item.type.includes('Weapon')
  );
  const rareItems = availableMagicItems.filter(item =>
    item.rarity === 'Rare' || item.rarity === 'Very Rare' || item.rarity === 'Legendary'
  );

  return [
    ...forcedItems,
    ...getRandomItems(wondrousItems, settings.magicItemQuantities.wondrous),
    ...getRandomItems(weapons, settings.magicItemQuantities.weapons),
    ...getRandomItems(rareItems, settings.magicItemQuantities.rare)
  ];
}