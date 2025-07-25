import { Ingredient } from '@/data/ingredients';
import { Potion, getPotionByNumberAndCategory } from '@/data/potions';

export interface BrewingResult {
  combat: number;
  utility: number;
  whimsy: number;
  winner: 'Combat' | 'Utility' | 'Whimsy' | 'Tie';
  potion?: Potion;
  tiedCategories?: ('Combat' | 'Utility' | 'Whimsy')[];
}

export function brewPotion(ingredient1: Ingredient, ingredient2: Ingredient, ingredient3: Ingredient): BrewingResult {
  const combat = ingredient1.combat + ingredient2.combat + ingredient3.combat;
  const utility = ingredient1.utility + ingredient2.utility + ingredient3.utility;
  const whimsy = ingredient1.whimsy + ingredient2.whimsy + ingredient3.whimsy;

  // Find the winning category or detect ties
  const maxValue = Math.max(combat, utility, whimsy);
  const winners: ('Combat' | 'Utility' | 'Whimsy')[] = [];
  
  if (combat === maxValue) winners.push('Combat');
  if (utility === maxValue) winners.push('Utility');
  if (whimsy === maxValue) winners.push('Whimsy');

  if (winners.length === 1) {
    // Single winner - auto-select potion
    const winner = winners[0];
    const potionNumber = maxValue;
    const potion = getPotionByNumberAndCategory(potionNumber, winner);
    
    return {
      combat,
      utility,
      whimsy,
      winner,
      potion
    };
  } else {
    // Tie - need manual selection
    return {
      combat,
      utility,
      whimsy,
      winner: 'Tie',
      tiedCategories: winners
    };
  }
}

export function selectPotionFromTie(brewingResult: BrewingResult, selectedCategory: 'Combat' | 'Utility' | 'Whimsy'): Potion | undefined {
  if (brewingResult.winner !== 'Tie' || !brewingResult.tiedCategories?.includes(selectedCategory)) {
    return undefined;
  }

  const potionNumber = selectedCategory === 'Combat' ? brewingResult.combat :
                       selectedCategory === 'Utility' ? brewingResult.utility :
                       brewingResult.whimsy;

  return getPotionByNumberAndCategory(potionNumber, selectedCategory);
}