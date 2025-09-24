/**
 * Obojima Currency System
 *
 * The island of Obojima uses a nature-based currency system:
 * - Copper Bud (cb) = 1 copper piece equivalent
 * - Sea Petal (sp) = 1 silver piece equivalent (10 Copper Buds)
 * - Gold Flower (gf) = 1 gold piece equivalent (10 Sea Petals or 100 Copper Buds)
 */

export interface ObojimaCurrency {
  goldFlowers: number;
  seaPetals: number;
  copperBuds: number;
}

export const CURRENCY_NAMES = {
  goldFlower: 'Gold Flower',
  goldFlowers: 'Gold Flowers',
  seaPetal: 'Sea Petal',
  seaPetals: 'Sea Petals',
  copperBud: 'Copper Bud',
  copperBuds: 'Copper Buds'
} as const;

export const CURRENCY_SYMBOLS = {
  goldFlower: 'gf',
  seaPetal: 'sp',
  copperBud: 'cb'
} as const;

export const CURRENCY_CONVERSION = {
  goldFlowerToCopperBuds: 100,
  goldFlowerToSeaPetals: 10,
  seaPetalToCopperBuds: 10
} as const;

/**
 * Convert a total value in copper buds to the currency object
 */
export const copperBudsToCurrency = (totalCopperBuds: number): ObojimaCurrency => {
  const goldFlowers = Math.floor(totalCopperBuds / CURRENCY_CONVERSION.goldFlowerToCopperBuds);
  const remainingAfterGold = totalCopperBuds % CURRENCY_CONVERSION.goldFlowerToCopperBuds;

  const seaPetals = Math.floor(remainingAfterGold / CURRENCY_CONVERSION.seaPetalToCopperBuds);
  const copperBuds = remainingAfterGold % CURRENCY_CONVERSION.seaPetalToCopperBuds;

  return { goldFlowers, seaPetals, copperBuds };
};

/**
 * Convert currency object to total value in copper buds
 */
export const currencyToCopperBuds = (currency: ObojimaCurrency): number => {
  return (
    currency.goldFlowers * CURRENCY_CONVERSION.goldFlowerToCopperBuds +
    currency.seaPetals * CURRENCY_CONVERSION.seaPetalToCopperBuds +
    currency.copperBuds
  );
};

/**
 * Format currency for display
 * @param currency The currency object to format
 * @param options Display options
 */
export const formatCurrency = (
  currency: ObojimaCurrency,
  options: {
    showZero?: boolean;
    abbreviated?: boolean;
    singleLine?: boolean;
  } = {}
): string => {
  const { showZero = false, abbreviated = false, singleLine = true } = options;
  const parts: string[] = [];

  if (currency.goldFlowers > 0 || showZero) {
    const name = abbreviated
      ? CURRENCY_SYMBOLS.goldFlower
      : currency.goldFlowers === 1 ? CURRENCY_NAMES.goldFlower : CURRENCY_NAMES.goldFlowers;
    parts.push(`${currency.goldFlowers} ${name}`);
  }

  if (currency.seaPetals > 0 || (showZero && parts.length === 0)) {
    const name = abbreviated
      ? CURRENCY_SYMBOLS.seaPetal
      : currency.seaPetals === 1 ? CURRENCY_NAMES.seaPetal : CURRENCY_NAMES.seaPetals;
    parts.push(`${currency.seaPetals} ${name}`);
  }

  if (currency.copperBuds > 0 || (showZero && parts.length === 0)) {
    const name = abbreviated
      ? CURRENCY_SYMBOLS.copperBud
      : currency.copperBuds === 1 ? CURRENCY_NAMES.copperBud : CURRENCY_NAMES.copperBuds;
    parts.push(`${currency.copperBuds} ${name}`);
  }

  if (parts.length === 0) {
    return abbreviated ? '0 cb' : '0 Copper Buds';
  }

  return singleLine ? parts.join(', ') : parts.join('\n');
};

/**
 * Format a simple gold value (used for backward compatibility)
 * Treats the value as Gold Flowers
 */
export const formatGoldValue = (goldValue: number, abbreviated: boolean = false): string => {
  if (goldValue === 0) {
    return abbreviated ? '0 gf' : '0 Gold Flowers';
  }

  const name = abbreviated
    ? CURRENCY_SYMBOLS.goldFlower
    : goldValue === 1 ? CURRENCY_NAMES.goldFlower : CURRENCY_NAMES.goldFlowers;

  return `${goldValue} ${name}`;
};

/**
 * Parse a currency string (e.g., "10 gf", "5 Gold Flowers", "100 Copper Buds")
 */
export const parseCurrencyString = (currencyStr: string): number => {
  const normalized = currencyStr.toLowerCase().trim();

  // Check for gold flowers
  if (normalized.includes('gf') || normalized.includes('gold flower')) {
    const match = normalized.match(/(\d+)/);
    if (match) {
      return parseInt(match[1]) * CURRENCY_CONVERSION.goldFlowerToCopperBuds;
    }
  }

  // Check for sea petals
  if (normalized.includes('sp') || normalized.includes('sea petal')) {
    const match = normalized.match(/(\d+)/);
    if (match) {
      return parseInt(match[1]) * CURRENCY_CONVERSION.seaPetalToCopperBuds;
    }
  }

  // Check for copper buds
  if (normalized.includes('cb') || normalized.includes('copper bud')) {
    const match = normalized.match(/(\d+)/);
    if (match) {
      return parseInt(match[1]);
    }
  }

  // Default: try to parse as a number (assume gold flowers for backward compatibility)
  const match = normalized.match(/(\d+)/);
  if (match) {
    return parseInt(match[1]) * CURRENCY_CONVERSION.goldFlowerToCopperBuds;
  }

  return 0;
};

/**
 * Currency image paths for display
 */
export const CURRENCY_IMAGES = {
  goldFlower: '/images/currency/goldflower.png',
  seaPetal: '/images/currency/seapetal.png',
  copperBud: '/images/currency/copperbud.png'
} as const;

/**
 * Currency emoji icons for fallback display (when images can't be used)
 */
export const CURRENCY_ICONS = {
  goldFlower: '🌻',  // Sunflower as gold flower
  seaPetal: '🌸',    // Cherry blossom as sea petal
  copperBud: '🌱'    // Seedling as copper bud
} as const;

/**
 * Get formatted price display with icon (fallback text version)
 */
export const formatPriceDisplay = (goldValue: number, abbreviated: boolean = true): string => {
  const currency = copperBudsToCurrency(goldValue * CURRENCY_CONVERSION.goldFlowerToCopperBuds);
  const parts: string[] = [];

  if (currency.goldFlowers > 0) {
    parts.push(`${CURRENCY_ICONS.goldFlower}${currency.goldFlowers}`);
  }
  if (currency.seaPetals > 0) {
    parts.push(`${CURRENCY_ICONS.seaPetal}${currency.seaPetals}`);
  }
  if (currency.copperBuds > 0) {
    parts.push(`${CURRENCY_ICONS.copperBud}${currency.copperBuds}`);
  }

  if (parts.length === 0) {
    return `${CURRENCY_ICONS.copperBud}0`;
  }

  return parts.join(' ');
};

/**
 * Get currency breakdown for React components
 */
export const getCurrencyBreakdown = (goldValue: number): Array<{
  type: 'goldFlower' | 'seaPetal' | 'copperBud';
  amount: number;
  image: string;
  icon: string;
}> => {
  const currency = copperBudsToCurrency(goldValue * CURRENCY_CONVERSION.goldFlowerToCopperBuds);
  const breakdown: Array<{
    type: 'goldFlower' | 'seaPetal' | 'copperBud';
    amount: number;
    image: string;
    icon: string;
  }> = [];

  if (currency.goldFlowers > 0) {
    breakdown.push({
      type: 'goldFlower',
      amount: currency.goldFlowers,
      image: CURRENCY_IMAGES.goldFlower,
      icon: CURRENCY_ICONS.goldFlower
    });
  }
  if (currency.seaPetals > 0) {
    breakdown.push({
      type: 'seaPetal',
      amount: currency.seaPetals,
      image: CURRENCY_IMAGES.seaPetal,
      icon: CURRENCY_ICONS.seaPetal
    });
  }
  if (currency.copperBuds > 0) {
    breakdown.push({
      type: 'copperBud',
      amount: currency.copperBuds,
      image: CURRENCY_IMAGES.copperBud,
      icon: CURRENCY_ICONS.copperBud
    });
  }

  if (breakdown.length === 0) {
    breakdown.push({
      type: 'copperBud',
      amount: 0,
      image: CURRENCY_IMAGES.copperBud,
      icon: CURRENCY_ICONS.copperBud
    });
  }

  return breakdown;
};