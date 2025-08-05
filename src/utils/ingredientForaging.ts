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
  possibleIngredients?: Ingredient[]; // For non-auto mode
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

// DC ranges based on the new rules
export function getDCRange(ingredient: Ingredient, location: Location, isSpecificSearch: boolean = false): { min: number; max: number } {
  const isNative = ingredient.locations.includes(location);
  
  if (!isSpecificSearch) {
    // Random search DCs
    if (ingredient.rarity === 'Common' && isNative) {
      return { min: 10, max: 12 };
    } else if (ingredient.rarity === 'Uncommon' && isNative) {
      return { min: 16, max: 18 };
    }
    // Non-native items can't be found in random searches
    return { min: 999, max: 999 };
  } else {
    // Specific search DCs
    if (ingredient.rarity === 'Common' && isNative) {
      return { min: 13, max: 15 };
    } else if (
      (ingredient.rarity === 'Uncommon' && isNative) || 
      (ingredient.rarity === 'Common' && !isNative)
    ) {
      return { min: 19, max: 20 };
    } else if (ingredient.rarity === 'Uncommon' && !isNative) {
      return { min: 21, max: 25 };
    }
    // Rare ingredients can't be found foraging
    return { min: 999, max: 999 };
  }
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

// Random foraging - show all possible ingredients for the roll (non-auto mode)
export function performRandomForagingAllPossible(attempt: ForagingAttempt): ForagingResult {
  const { location, rollResult, searchType } = attempt;
  const { native } = getIngredientsInLocation(location, searchType);
  
  // Only native ingredients can be found in random searches
  const commonNative = native.filter(i => i.rarity === 'Common');
  const uncommonNative = native.filter(i => i.rarity === 'Uncommon');

  let possibleIngredients: Ingredient[] = [];
  let dcRequired = 10; // Default to minimum common DC

  // Check what could be found based on roll
  // Uncommon native (DC 16-18)
  if (rollResult >= 16 && rollResult <= 18) {
    possibleIngredients = [...uncommonNative];
    dcRequired = 16;
  }
  // Common native (DC 10-15) - expanded range to include 13-15  
  else if (rollResult >= 10 && rollResult <= 15) {
    possibleIngredients = [...commonNative];
    dcRequired = 10;
  }
  // Higher rolls that still find something
  else if (rollResult > 18) {
    // With very high rolls, could find either uncommon or common
    possibleIngredients = [...uncommonNative, ...commonNative];
    dcRequired = uncommonNative.length > 0 ? 16 : 10;
  }

  const success = possibleIngredients.length > 0;
  const searchTypeText = searchType === 'survival' ? 'foraging' : 'salvaging';
  
  let message: string;
  if (success) {
    const rarityText = rollResult >= 16 && rollResult <= 18 
      ? 'uncommon' 
      : rollResult >= 10 && rollResult <= 15 
        ? 'common' 
        : rollResult > 18 && uncommonNative.length > 0 
          ? 'uncommon or common'
          : 'common';
    message = `Roll ${rollResult} could find any ${rarityText} native ingredient while ${searchTypeText} in ${location}.`;
  } else {
    message = rollResult < 10
      ? `Failed to find anything while ${searchTypeText} in ${location}. Rolled ${rollResult}, needed at least 10.`
      : `Failed to find anything while ${searchTypeText} in ${location}. Rolled ${rollResult}.`;
  }
  
  return {
    success,
    possibleIngredients,
    dcMet: rollResult,
    dcRequired,
    searchType,
    location,
    message
  };
}

// Random foraging - find whatever is available based on roll
export function performRandomForaging(attempt: ForagingAttempt): ForagingResult {
  const { location, rollResult, searchType } = attempt;
  const { native } = getIngredientsInLocation(location, searchType);
  
  // Only native ingredients can be found in random searches
  const commonNative = native.filter(i => i.rarity === 'Common');
  const uncommonNative = native.filter(i => i.rarity === 'Uncommon');

  let foundIngredient: Ingredient | undefined;
  let dcRequired = 10; // Default to minimum common DC

  // Check for uncommon native first (DC 16-18)
  if (rollResult >= 16 && rollResult <= 18 && uncommonNative.length > 0) {
    // Randomly select an uncommon native ingredient
    foundIngredient = uncommonNative[Math.floor(Math.random() * uncommonNative.length)];
    dcRequired = 16;
  }
  // Check for common native (DC 10-15) - expanded range to include 13-15
  else if (rollResult >= 10 && rollResult <= 15 && commonNative.length > 0) {
    // Randomly select a common native ingredient
    foundIngredient = commonNative[Math.floor(Math.random() * commonNative.length)];
    dcRequired = 10;
  }
  // Higher rolls that still find something
  else if (rollResult > 18) {
    // With very high rolls, still find uncommon if available, otherwise common
    if (uncommonNative.length > 0) {
      foundIngredient = uncommonNative[Math.floor(Math.random() * uncommonNative.length)];
      dcRequired = 16;
    } else if (commonNative.length > 0) {
      foundIngredient = commonNative[Math.floor(Math.random() * commonNative.length)];
      dcRequired = 10;
    }
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
      : rollResult < 10
        ? `Failed to find anything while ${searchTypeText} in ${location}. Rolled ${rollResult}, needed at least 10.`
        : `Failed to find anything while ${searchTypeText} in ${location}. Rolled ${rollResult}.`
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

  const dcRange = getDCRange(ingredient, location, true);
  const isNative = ingredient.locations.includes(location);
  
  // Check if the roll falls within the valid DC range for this ingredient
  const success = rollResult >= dcRange.min && rollResult <= dcRange.max;
  
  const searchTypeText = searchType === 'survival' ? 'foraging' : 'salvaging';
  const nativeText = isNative ? 'native to' : 'not native to';

  // Determine the appropriate message based on the ingredient type and roll
  let message: string;
  if (dcRange.min === 999) {
    message = `${ingredient.name} cannot be found through foraging (${ingredient.rarity}, ${nativeText} this area).`;
  } else if (success) {
    message = `Successfully found ${ingredient.name} while ${searchTypeText} in ${location}! (${ingredient.rarity}, ${nativeText} this area)`;
  } else if (rollResult < dcRange.min) {
    message = `Failed to find ${ingredient.name} while ${searchTypeText} in ${location}. Rolled ${rollResult}, needed ${dcRange.min}-${dcRange.max}. (${ingredient.rarity}, ${nativeText} this area)`;
  } else {
    message = `Rolled ${rollResult}, which is too high for finding ${ingredient.name}. Needed ${dcRange.min}-${dcRange.max}. (${ingredient.rarity}, ${nativeText} this area)`;
  }

  return {
    success,
    ingredient,
    dcMet: rollResult,
    dcRequired: dcRange.min,
    searchType,
    location, 
    targetIngredient,
    message
  };
}

// Get foraging recommendations for a location
export function getLocationInfo(location: Location): {
  nativeCommon: Ingredient[];
  nativeUncommon: Ingredient[];
  totalNative: number;
  description: string;
} {
  const { native } = getIngredientsInLocation(location, 'survival');
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