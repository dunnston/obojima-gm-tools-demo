'use client';

import { useState, useEffect } from 'react';
import { CogIcon, BuildingStorefrontIcon, MagnifyingGlassIcon, XMarkIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { AppSettings, getSettings, saveSettings, resetSettings, VendingMachineSettings, getSettingsWithSync, saveSettingsWithSync } from '@/data/settings';
import { combatPotions, utilityPotions, whimsyPotions } from '@/data/potions';
import { ingredients } from '@/data/ingredients';
import { magicItems } from '@/data/magicItems';

export default function Settings() {
  const [settings, setSettings] = useState<AppSettings>(getSettings());
  const [activeTab, setActiveTab] = useState<'vendingMachine'>('vendingMachine');
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'error'>('idle');

  // Load settings with sync on component mount
  useEffect(() => {
    loadSettings();
  }, []);

  // Auto-save settings when they change
  useEffect(() => {
    if (settings !== getSettings()) {
      saveSettingsAsync(settings);
    }
  }, [settings]);

  const loadSettings = async () => {
    setSyncStatus('syncing');
    try {
      const syncedSettings = await getSettingsWithSync();
      setSettings(syncedSettings);
      setSyncStatus('idle');
    } catch (error) {
      console.error('Error loading settings:', error);
      setSyncStatus('error');
    }
  };

  const saveSettingsAsync = async (newSettings: AppSettings) => {
    try {
      await saveSettingsWithSync(newSettings);
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  const updateVendingMachineSettings = (updates: Partial<VendingMachineSettings>) => {
    setSettings(prev => ({
      ...prev,
      vendingMachine: {
        ...prev.vendingMachine,
        ...updates,
      },
    }));
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all settings to default? This cannot be undone.')) {
      const newSettings = resetSettings();
      setSettings(newSettings);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <CogIcon className="h-8 w-8 text-slate-400" />
          <h1 className="text-3xl font-bold text-white">Settings</h1>
          {/* Minimal sync status indicator */}
          {syncStatus === 'syncing' && (
            <ArrowPathIcon className="h-5 w-5 text-blue-400 animate-spin" />
          )}
          {syncStatus === 'error' && (
            <span className="text-xs text-amber-400">Offline</span>
          )}
        </div>
        <div className="flex items-center justify-center gap-3">
          <p className="text-slate-400">Customize your app preferences and behavior</p>
          <button
            onClick={loadSettings}
            className="p-2 text-slate-400 hover:text-white transition-colors"
            title="Refresh"
          >
            <ArrowPathIcon className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Settings Navigation */}
      <div className="flex justify-center">
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-1 border border-white/10">
          <button
            onClick={() => setActiveTab('vendingMachine')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
              activeTab === 'vendingMachine'
                ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg'
                : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <BuildingStorefrontIcon className="h-5 w-5" />
            Vending Machine
          </button>
        </div>
      </div>

      {/* Settings Content */}
      <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
        {activeTab === 'vendingMachine' && (
          <VendingMachineSettings 
            settings={settings.vendingMachine} 
            onUpdate={updateVendingMachineSettings}
          />
        )}
      </div>

      {/* Reset Button */}
      <div className="flex justify-center">
        <button
          onClick={handleReset}
          className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium"
        >
          Reset All Settings
        </button>
      </div>
    </div>
  );
}

interface VendingMachineSettingsProps {
  settings: VendingMachineSettings;
  onUpdate: (updates: Partial<VendingMachineSettings>) => void;
}

function VendingMachineSettings({ settings, onUpdate }: VendingMachineSettingsProps) {
  const [excludeSearch, setExcludeSearch] = useState({
    potions: '',
    ingredients: '',
    magicItems: '',
  });

  const allPotions = [...combatPotions, ...utilityPotions, ...whimsyPotions];

  const handleCategoryChange = (category: keyof VendingMachineSettings['categories'], enabled: boolean) => {
    onUpdate({
      categories: {
        ...settings.categories,
        [category]: enabled,
      },
    });
  };

  const handleQuantityChange = (
    type: 'potionQuantities' | 'ingredientQuantities' | 'magicItemQuantities',
    rarity: string,
    value: number
  ) => {
    onUpdate({
      [type]: {
        ...settings[type],
        [rarity]: Math.max(0, value),
      },
    });
  };

  const toggleExcludeItem = (category: keyof VendingMachineSettings['excludedItems'], itemName: string) => {
    const currentExcluded = settings.excludedItems[category];
    const isExcluded = currentExcluded.includes(itemName);
    
    onUpdate({
      excludedItems: {
        ...settings.excludedItems,
        [category]: isExcluded
          ? currentExcluded.filter(name => name !== itemName)
          : [...currentExcluded, itemName],
      },
    });
  };

  const getFilteredItems = (category: 'potions' | 'ingredients' | 'magicItems', searchTerm: string) => {
    let items: any[] = [];
    
    switch (category) {
      case 'potions':
        items = allPotions;
        break;
      case 'ingredients':
        items = ingredients;
        break;
      case 'magicItems':
        items = magicItems;
        break;
    }
    
    return items.filter(item => 
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Vending Machine Settings</h2>
        <p className="text-slate-400">Customize what appears in your vending machine</p>
      </div>

      {/* Categories */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-white">Categories</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(settings.categories).map(([category, enabled]) => (
            <div key={category} className="bg-slate-700/30 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="text-white font-medium capitalize">{category}</span>
                <input
                  type="checkbox"
                  checked={enabled}
                  onChange={(e) => handleCategoryChange(category as keyof VendingMachineSettings['categories'], e.target.checked)}
                  className="w-4 h-4 text-orange-600 bg-slate-700 border-slate-600 rounded focus:ring-orange-500 focus:ring-2"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quantities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Potion & Ingredient Quantities */}
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold text-white mb-4">Potion Quantities</h3>
            <div className="space-y-3">
              {Object.entries(settings.potionQuantities).map(([rarity, quantity]) => (
                <div key={rarity} className="flex items-center justify-between bg-slate-700/30 rounded-lg p-3">
                  <span className="text-white capitalize">{rarity}</span>
                  <input
                    type="number"
                    min="0"
                    max="20"
                    value={quantity}
                    onChange={(e) => handleQuantityChange('potionQuantities', rarity, parseInt(e.target.value) || 0)}
                    className="w-16 px-2 py-1 bg-slate-600 border border-slate-500 rounded text-white text-center"
                  />
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-white mb-4">Ingredient Quantities</h3>
            <div className="space-y-3">
              {Object.entries(settings.ingredientQuantities).map(([rarity, quantity]) => (
                <div key={rarity} className="flex items-center justify-between bg-slate-700/30 rounded-lg p-3">
                  <span className="text-white capitalize">{rarity}</span>
                  <input
                    type="number"
                    min="0"
                    max="20"
                    value={quantity}
                    onChange={(e) => handleQuantityChange('ingredientQuantities', rarity, parseInt(e.target.value) || 0)}
                    className="w-16 px-2 py-1 bg-slate-600 border border-slate-500 rounded text-white text-center"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Magic Item Quantities */}
        <div>
          <h3 className="text-xl font-semibold text-white mb-4">Magic Item Quantities</h3>
          <div className="space-y-3">
            {Object.entries(settings.magicItemQuantities).map(([type, quantity]) => (
              <div key={type} className="flex items-center justify-between bg-slate-700/30 rounded-lg p-3">
                <span className="text-white capitalize">{type === 'wondrous' ? 'Wondrous Items' : type}</span>
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={quantity}
                  onChange={(e) => handleQuantityChange('magicItemQuantities', type, parseInt(e.target.value) || 0)}
                  className="w-16 px-2 py-1 bg-slate-600 border border-slate-500 rounded text-white text-center"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Exclude Lists */}
      <div className="space-y-6">
        <h3 className="text-xl font-semibold text-white">Exclude Items</h3>
        <p className="text-slate-400">Select items to never appear in the vending machine</p>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {(['potions', 'ingredients', 'magicItems'] as const).map((category) => (
            <ExcludeItemsSection
              key={category}
              category={category}
              items={getFilteredItems(category, excludeSearch[category])}
              excludedItems={settings.excludedItems[category]}
              searchTerm={excludeSearch[category]}
              onSearchChange={(term) => setExcludeSearch(prev => ({ ...prev, [category]: term }))}
              onToggleExclude={(itemName) => toggleExcludeItem(category, itemName)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

interface ExcludeItemsSectionProps {
  category: 'potions' | 'ingredients' | 'magicItems';
  items: any[];
  excludedItems: string[];
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onToggleExclude: (itemName: string) => void;
}

function ExcludeItemsSection({ 
  category, 
  items, 
  excludedItems, 
  searchTerm, 
  onSearchChange, 
  onToggleExclude 
}: ExcludeItemsSectionProps) {
  return (
    <div className="bg-slate-700/30 rounded-lg p-4">
      <h4 className="text-lg font-medium text-white mb-3 capitalize">{category}</h4>
      
      {/* Search */}
      <div className="relative mb-3">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          type="text"
          placeholder={`Search ${category}...`}
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white text-sm placeholder-slate-400 focus:outline-none focus:border-orange-400"
        />
      </div>

      {/* Items List */}
      <div className="max-h-60 overflow-y-auto space-y-2">
        {items.map((item) => (
          <div
            key={item.name}
            className="flex items-center justify-between p-2 rounded bg-slate-600/50 hover:bg-slate-600/70 transition-colors"
          >
            <div className="flex-1 min-w-0">
              <span className="text-white text-sm truncate block">{item.name}</span>
              <span className="text-slate-400 text-xs">{item.rarity}</span>
            </div>
            <button
              onClick={() => onToggleExclude(item.name)}
              className={`ml-2 p-1 rounded transition-colors ${
                excludedItems.includes(item.name)
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-slate-500 hover:bg-slate-400 text-slate-200'
              }`}
            >
              {excludedItems.includes(item.name) ? (
                <XMarkIcon className="h-4 w-4" />
              ) : (
                <span className="block w-4 h-4 text-xs font-bold">+</span>
              )}
            </button>
          </div>
        ))}
        
        {items.length === 0 && (
          <div className="text-center py-4 text-slate-400 text-sm">
            No items found
          </div>
        )}
      </div>

      {/* Excluded count */}
      {excludedItems.length > 0 && (
        <div className="mt-3 pt-3 border-t border-slate-600">
          <span className="text-red-400 text-sm">
            {excludedItems.length} item{excludedItems.length !== 1 ? 's' : ''} excluded
          </span>
        </div>
      )}
    </div>
  );
}