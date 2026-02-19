export interface VendingMachineSettings {
  categories: {
    potions: boolean;
    ingredients: boolean;
    magicItems: boolean;
  };
  potionQuantities: {
    common: number;
    uncommon: number;
    rare: number;
  };
  ingredientQuantities: {
    common: number;
    uncommon: number;
    rare: number;
  };
  magicItemQuantities: {
    weapons: number;
    wondrous: number;  
    rare: number; // rare items of any type
  };
  excludedItems: {
    potions: string[]; // potion names to exclude
    ingredients: string[]; // ingredient names to exclude
    magicItems: string[]; // magic item names to exclude
  };
  includedItems: {
    potions: string[]; // potion names to always include
    ingredients: string[]; // ingredient names to always include
    magicItems: string[]; // magic item names to always include
  };
}

// Default vending machine settings (matches current behavior)
export const defaultVendingMachineSettings: VendingMachineSettings = {
  categories: {
    potions: true,
    ingredients: true,
    magicItems: true,
  },
  potionQuantities: {
    common: 4,
    uncommon: 2,
    rare: 1,
  },
  ingredientQuantities: {
    common: 6,
    uncommon: 3,
    rare: 1,
  },
  magicItemQuantities: {
    weapons: 1,
    wondrous: 1,
    rare: 1,
  },
  excludedItems: {
    potions: [],
    ingredients: [],
    magicItems: [],
  },
  includedItems: {
    potions: [],
    ingredients: [],
    magicItems: [],
  },
};

export interface NetworkSharingSettings {
  enabled: boolean;
  port: number;
  autoStart: boolean;
  pinEnabled: boolean;
  pin: string; // 4-6 digit PIN stored as string
}

export const defaultNetworkSharingSettings: NetworkSharingSettings = {
  enabled: false,
  port: 3001,
  autoStart: false,
  pinEnabled: false,
  pin: '',
};

export interface AppSettings {
  vendingMachine: VendingMachineSettings;
  networkSharing: NetworkSharingSettings;
  currentObojimaDate?: {
    year: number;
    season: string;
    phase: string;
    day: number;
    cycle: number;
  };
  // Future settings can be added here
  // ui: UISettings;
  // gameplay: GameplaySettings;
}

export const defaultAppSettings: AppSettings = {
  vendingMachine: defaultVendingMachineSettings,
  networkSharing: defaultNetworkSharingSettings,
};

// Settings management functions
function mergeVendingMachine(saved?: Partial<VendingMachineSettings>): VendingMachineSettings {
  if (!saved) return defaultVendingMachineSettings;
  return {
    ...defaultVendingMachineSettings,
    ...saved,
    excludedItems: {
      ...defaultVendingMachineSettings.excludedItems,
      ...saved.excludedItems,
    },
    includedItems: {
      ...defaultVendingMachineSettings.includedItems,
      ...saved.includedItems,
    },
  };
}

export function getSettings(): AppSettings {
  if (typeof window === 'undefined') return defaultAppSettings;

  try {
    const saved = localStorage.getItem('appSettings');
    if (saved) {
      const parsed = JSON.parse(saved);
      // Merge with defaults to ensure all properties exist
      return {
        ...defaultAppSettings,
        ...parsed,
        vendingMachine: mergeVendingMachine(parsed.vendingMachine),
        networkSharing: {
          ...defaultNetworkSharingSettings,
          ...parsed.networkSharing,
        },
      };
    }
  } catch (error) {
    console.error('Error loading settings:', error);
  }

  return defaultAppSettings;
}

export function saveSettings(settings: AppSettings): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem('appSettings', JSON.stringify(settings));
  } catch (error) {
    console.error('Error saving settings:', error);
  }
}

export function resetSettings(): AppSettings {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('appSettings');
  }
  return defaultAppSettings;
}

// Sync-enabled settings functions
import { syncService } from '@/services/sync';

export async function getSettingsWithSync(): Promise<AppSettings> {
  if (typeof window === 'undefined') return defaultAppSettings;
  
  try {
    const result = await syncService.getSettings();
    if (result.success && result.data) {
      // Sync may store under appSettings key or at top level
      const syncData = result.data.appSettings || result.data;
      // Merge with defaults to ensure all properties exist
      return {
        ...defaultAppSettings,
        ...syncData,
        vendingMachine: mergeVendingMachine(syncData.vendingMachine),
        networkSharing: {
          ...defaultNetworkSharingSettings,
          ...syncData.networkSharing,
        },
      };
    } else {
      // Fall back to localStorage
      return getSettings();
    }
  } catch (error) {
    console.error('Error loading settings with sync:', error);
    return getSettings();
  }
}

export async function saveSettingsWithSync(settings: AppSettings): Promise<void> {
  if (typeof window === 'undefined') return;
  
  try {
    // Save to localStorage first for offline support
    localStorage.setItem('appSettings', JSON.stringify(settings));
    
    // Save to sync service
    const result = await syncService.saveSetting('appSettings', settings);
    if (!result.success) {
      console.warn('Settings saved locally but sync failed');
    }
  } catch (error) {
    console.error('Error saving settings with sync:', error);
  }
}