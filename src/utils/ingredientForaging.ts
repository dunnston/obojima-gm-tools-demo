import { ingredients, Ingredient } from '@/data/ingredients';

export const LOCATIONS = [
  'Brackwater Wetlands',
  'Coastal Highlands', 
  'Gale Fields',
  'Gift of Shuritashi',
  'Land of Hot Water',
  'Mount Arbora',
  'Shallows',
  'Spirit Realm'
] as const;

export type Location = typeof LOCATIONS[number];

export type SearchType = 'survival' | 'salvage';

export interface ForagingResult {
  success: boolean;
  ingredient?: Ingredient;
  dcMet: number;
  dcRequired: number;
  searchType: SearchType;
  location: Location;
  targetIngredient?: string;
  message: string;
}

export interface ForagingAttempt {
  searchType: SearchType;
  location: Location;
  rollResult: number;
  targetIngredient?: string; // For specific searches
}

// DC calculation based on your rules
export function calculateDC(ingredient: Ingredient, location: Location, isSpecificSearch: boolean = false): number {
  const isNative = ingredient.locations.includes(location);
  let baseDC = 0;

  if (ingredient.rarity === 'Common' && isNative) {
    baseDC = Math.floor(Math.random() * 6) + 10; // 10-15
  } else if (
    (ingredient.rarity === 'Uncommon' && isNative) || 
    (ingredient.rarity === 'Common' && !isNative)
  ) {
    baseDC = Math.floor(Math.random() * 5) + 16; // 16-20
  } else if (ingredient.rarity === 'Uncommon' && !isNative) {
    baseDC = Math.floor(Math.random() * 5) + 21; // 21-25
  } else if (ingredient.rarity === 'Rare') {
    baseDC = 30; // Rare ingredients aren't normally found foraging
  }

  // Increase DC slightly for specific searches
  if (isSpecificSearch) {
    baseDC += Math.floor(Math.random() * 3) + 2; // +2 to +4
  }

  return baseDC;
}

// Get all ingredients available in a location (native or not)
export function getIngredientsInLocation(location: Location, searchType: SearchType): {
  native: Ingredient[];
  nonNative: Ingredient[];
} {
  // Filter by type based on search type
  const typeFilter = (ingredient: Ingredient) => {
    if (searchType === 'salvage') {
      // Salvage only finds Other and Salvage types
      return ingredient.type === 'Other' || ingredient.type === 'Salvage';
    } else {
      // Survival finds everything except Other and Salvage
      return ingredient.type !== 'Other' && ingredient.type !== 'Salvage';
    }
  };
  
  const native = ingredients.filter(ingredient => 
    ingredient.locations.includes(location) && 
    ingredient.rarity !== 'Rare' &&
    typeFilter(ingredient)
  );
  
  const nonNative = ingredients.filter(ingredient => 
    !ingredient.locations.includes(location) && 
    ingredient.rarity !== 'Rare' &&
    typeFilter(ingredient)
  );

  return { native, nonNative };
}

// Random foraging - find whatever is available based on roll
export function performRandomForaging(attempt: ForagingAttempt): ForagingResult {
  const { location, rollResult, searchType } = attempt;
  const { native, nonNative } = getIngredientsInLocation(location, searchType);
  
  // Create weighted pools based on rarity and location
  const commonNative = native.filter(i => i.rarity === 'Common');
  const uncommonNative = native.filter(i => i.rarity === 'Uncommon');
  const commonNonNative = nonNative.filter(i => i.rarity === 'Common');
  const uncommonNonNative = nonNative.filter(i => i.rarity === 'Uncommon');

  // Collect all possible finds with their calculated DCs
  const possibleFinds: { ingredient: Ingredient; dc: number; tier: number }[] = [];

  // Add Common Native ingredients (DC 10-15, tier 1)
  commonNative.forEach(ingredient => {
    const dc = calculateDC(ingredient, location);
    if (rollResult >= dc) {
      possibleFinds.push({ ingredient, dc, tier: 1 });
    }
  });

  // Add Uncommon Native and Common Non-Native (DC 16-20, tier 2)
  [...uncommonNative, ...commonNonNative].forEach(ingredient => {
    const dc = calculateDC(ingredient, location);
    if (rollResult >= dc) {
      possibleFinds.push({ ingredient, dc, tier: 2 });
    }
  });

  // Add Uncommon Non-Native (DC 21-25, tier 3)
  uncommonNonNative.forEach(ingredient => {
    const dc = calculateDC(ingredient, location);
    if (rollResult >= dc) {
      possibleFinds.push({ ingredient, dc, tier: 3 });
    }
  });

  let foundIngredient: Ingredient | undefined;
  let dcRequired = 0;

  if (possibleFinds.length > 0) {
    // Sort by tier (higher is better), then by DC (higher DC = rarer)
    possibleFinds.sort((a, b) => {
      if (a.tier !== b.tier) return b.tier - a.tier; // Higher tier first
      return b.dc - a.dc; // Higher DC first within same tier
    });

    // With high rolls, prefer rarer ingredients
    // Use weighted selection favoring higher tiers
    let selectedFind;
    if (rollResult >= 25) {
      // Very high roll: 70% chance for highest tier available
      const highestTier = possibleFinds[0].tier;
      const highestTierFinds = possibleFinds.filter(f => f.tier === highestTier);
      selectedFind = Math.random() < 0.7 
        ? highestTierFinds[Math.floor(Math.random() * highestTierFinds.length)]
        : possibleFinds[Math.floor(Math.random() * possibleFinds.length)];
    } else if (rollResult >= 20) {
      // High roll: 50% chance for highest tier available
      const highestTier = possibleFinds[0].tier;
      const highestTierFinds = possibleFinds.filter(f => f.tier === highestTier);
      selectedFind = Math.random() < 0.5 
        ? highestTierFinds[Math.floor(Math.random() * highestTierFinds.length)]
        : possibleFinds[Math.floor(Math.random() * possibleFinds.length)];
    } else {
      // Lower roll: random selection from all possibilities
      selectedFind = possibleFinds[Math.floor(Math.random() * possibleFinds.length)];
    }

    foundIngredient = selectedFind.ingredient;
    dcRequired = selectedFind.dc;
  }

  // If no specific ingredient was found, set a reasonable DC for the failure
  if (!dcRequired) {
    if (rollResult < 10) dcRequired = 10;
    else if (rollResult < 16) dcRequired = 16;
    else if (rollResult < 21) dcRequired = 21;
    else dcRequired = 25;
  }

  const success = foundIngredient !== undefined;
  const searchTypeText = searchType === 'survival' ? 'foraging' : 'salvaging';
  
  return {
    success,
    ingredient: foundIngredient,
    dcMet: rollResult,
    dcRequired,
    searchType,
    location,
    message: success 
      ? `Successfully found ${foundIngredient!.name} while ${searchTypeText} in ${location}!`
      : `Failed to find anything while ${searchTypeText} in ${location}. Needed ${dcRequired}, rolled ${rollResult}.`
  };
}

// Specific ingredient search
export function performSpecificSearch(attempt: ForagingAttempt): ForagingResult {
  const { location, rollResult, searchType, targetIngredient } = attempt;
  
  if (!targetIngredient) {
    return {
      success: false,
      dcMet: rollResult,
      dcRequired: 0,
      searchType,
      location,
      message: 'No target ingredient specified for specific search.'
    };
  }

  const ingredient = ingredients.find(i => 
    i.name.toLowerCase() === targetIngredient.toLowerCase()
  );

  if (!ingredient) {
    return {
      success: false,
      dcMet: rollResult,
      dcRequired: 0,
      searchType,
      location,
      targetIngredient,
      message: `Unknown ingredient: ${targetIngredient}`
    };
  }

  // Check if the ingredient type matches the search type
  const isValidType = searchType === 'salvage' 
    ? (ingredient.type === 'Other' || ingredient.type === 'Salvage')
    : (ingredient.type !== 'Other' && ingredient.type !== 'Salvage');

  if (!isValidType) {
    const searchMethodText = searchType === 'salvage' ? 'salvaging' : 'survival foraging';
    const typeText = searchType === 'salvage' 
      ? 'can only find Other or Salvage type ingredients'
      : 'cannot find Other or Salvage type ingredients';
    
    return {
      success: false,
      ingredient,
      dcMet: rollResult,
      dcRequired: 0,
      searchType,
      location,
      targetIngredient,
      message: `${ingredient.name} is a ${ingredient.type} type ingredient. ${searchMethodText.charAt(0).toUpperCase() + searchMethodText.slice(1)} ${typeText}.`
    };
  }

  if (ingredient.rarity === 'Rare') {
    return {
      success: false,
      ingredient,
      dcMet: rollResult,
      dcRequired: 30,
      searchType,
      location,
      targetIngredient,
      message: `${ingredient.name} is too rare to be found through normal foraging.`
    };
  }

  const dcRequired = calculateDC(ingredient, location, true);
  const success = rollResult >= dcRequired;
  const searchTypeText = searchType === 'survival' ? 'foraging' : 'salvaging';
  const nativeText = ingredient.locations.includes(location) ? 'native to' : 'not native to';

  return {
    success,
    ingredient,
    dcMet: rollResult,
    dcRequired,
    searchType,
    location, 
    targetIngredient,
    message: success
      ? `Successfully found ${ingredient.name} while ${searchTypeText} in ${location}! (${ingredient.rarity}, ${nativeText} this area)`
      : `Failed to find ${ingredient.name} while ${searchTypeText} in ${location}. Needed ${dcRequired}, rolled ${rollResult}. (${ingredient.rarity}, ${nativeText} this area)`
  };
}

// Get foraging recommendations for a location
export function getLocationInfo(location: Location): {
  nativeCommon: Ingredient[];
  nativeUncommon: Ingredient[];
  totalNative: number;
  description: string;
} {
  const { native } = getIngredientsInLocation(location);
  const nativeCommon = native.filter(i => i.rarity === 'Common');
  const nativeUncommon = native.filter(i => i.rarity === 'Uncommon');

  const descriptions: Record<Location, string> = {
    'Brackwater Wetlands': 'Murky swamplands filled with strange plants and abandoned machinery',
    'Coastal Highlands': 'Rocky clifftops overlooking the sea with hardy vegetation',
    'Gale Fields': 'Windswept plains with diverse flora swaying in constant breezes', 
    'Gift of Shuritashi': 'Sacred bamboo groves and fertile gardens blessed by spirits',
    'Land of Hot Water': 'Geothermal springs and volcanic soil rich with unique minerals',
    'Mount Arbora': 'Ancient mountain forests with towering trees and rare fungi',
    'Shallows': 'Tidal pools and shallow waters teeming with marine life',
    'Spirit Realm': 'Mystical plane where spiritual essence infuses all matter'
  };

  return {
    nativeCommon,
    nativeUncommon,
    totalNative: native.length,
    description: descriptions[location]
  };
}