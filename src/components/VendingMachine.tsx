'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { generateVendingMachineInventory, VendingMachineInventory } from '@/utils/vendingMachine';
import { syncService } from '@/services/sync';
import type { Potion } from '@/data/potions';
import { ArrowPathIcon, SparklesIcon, BeakerIcon, WrenchScrewdriverIcon, CogIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import { getPotionImagePath, getIngredientImagePath, getMagicItemImagePath } from '@/utils/imageUtils';
import { useItemTranslation } from '@/hooks/useItemTranslation';
import CurrencyDisplay from '@/components/CurrencyDisplay';

// Module-level cache so inventory persists across navigation
let cachedInventory: VendingMachineInventory | null = null;

export default function VendingMachine() {
  const [inventory, setInventory] = useState<VendingMachineInventory | null>(() => cachedInventory);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [selectedItemType, setSelectedItemType] = useState<'ingredient' | 'potion' | 'magicItem' | null>(null);
  const { t } = useTranslation();
  const { translatePotionName, translateIngredientName } = useItemTranslation();

  const loadCustomPotions = async (): Promise<Potion[]> => {
    try {
      const data = await syncService.syncWithFallback('user-potions', 'modifiedPotions');
      return Array.isArray(data) ? (data as Potion[]) : [];
    } catch (error) {
      console.error('Error loading custom potions:', error);
      return [];
    }
  };

  const refreshInventory = async () => {
    setIsRefreshing(true);
    // Add a small delay for visual feedback
    await new Promise(resolve => setTimeout(resolve, 500));
    const customPotions = await loadCustomPotions();
    const newInventory = generateVendingMachineInventory(customPotions);
    cachedInventory = newInventory;
    setInventory(newInventory);
    setIsRefreshing(false);
  };

  useEffect(() => {
    if (cachedInventory) return;
    (async () => {
      const customPotions = await loadCustomPotions();
      cachedInventory = generateVendingMachineInventory(customPotions);
      setInventory(cachedInventory);
    })();
  }, []);

  const openItemModal = (item: any, type: 'ingredient' | 'potion' | 'magicItem') => {
    setSelectedItem(item);
    setSelectedItemType(type);
  };

  const closeItemModal = () => {
    setSelectedItem(null);
    setSelectedItemType(null);
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity.toLowerCase()) {
      case 'common': return 'border-gray-400/50 bg-gray-400/10 text-gray-300';
      case 'uncommon': return 'border-green-400/50 bg-green-400/10 text-green-300';
      case 'rare': return 'border-blue-400/50 bg-blue-400/10 text-blue-300';
      case 'very rare': return 'border-purple-400/50 bg-purple-400/10 text-purple-300';
      case 'legendary': return 'border-yellow-400/50 bg-yellow-400/10 text-yellow-300';
      default: return 'border-gray-400/50 bg-gray-400/10 text-gray-300';
    }
  };

  const getMagicItemIcon = (type: string) => {
    if (type.includes('Weapon')) {
      return '⚔️';
    } else if (type === 'Ring') {
      return '💍';
    } else {
      return '✨';
    }
  };

  if (!inventory) {
    return <div className="flex justify-center items-center h-64">{t('vendingMachine.loading')}</div>;
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <SparklesIcon className="h-8 w-8 text-emerald-400" />
          <h1 className="text-3xl font-bold text-white">{t('vendingMachine.title')}</h1>
        </div>
        <p className="text-slate-400">{t('vendingMachine.subtitle')}</p>
        
        {/* Settings Notification */}
        <div className="max-w-2xl mx-auto bg-blue-500/10 border border-blue-400/30 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-3 text-blue-300">
            <InformationCircleIcon className="h-5 w-5 flex-shrink-0" />
            <div className="text-sm">
              {t('vendingMachine.settingsNotification')}
            </div>
          </div>
        </div>
        
        {/* Refresh Button */}
        <button
          onClick={refreshInventory}
          disabled={isRefreshing}
          className="flex items-center gap-2 mx-auto px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all duration-200 shadow-lg"
        >
          <ArrowPathIcon className={`h-5 w-5 ${isRefreshing ? 'animate-spin' : ''}`} />
          {isRefreshing ? t('vendingMachine.refreshing') : t('vendingMachine.refresh')}
        </button>
      </div>

      {/* Ingredients Section */}
      {inventory.ingredients.length > 0 && (
        <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
          <div className="flex items-center gap-3 mb-6">
            <BeakerIcon className="h-6 w-6 text-green-400" />
            <h2 className="text-xl font-semibold text-white">{t('vendingMachine.sections.ingredients')} ({inventory.ingredients.length})</h2>
            <span className="text-sm text-slate-400">
              {inventory.ingredients.filter(i => i.rarity === 'Common').length} {t('vendingMachine.rarities.common')} • {' '}
              {inventory.ingredients.filter(i => i.rarity === 'Uncommon').length} {t('vendingMachine.rarities.uncommon')} • {' '}
              {inventory.ingredients.filter(i => i.rarity === 'Rare').length} {t('vendingMachine.rarities.rare')}
            </span>
          </div>
        
        <div className="grid grid-cols-3 md:grid-cols-6 lg:grid-cols-8 gap-3">
          {inventory.ingredients.map((ingredient, index) => (
            <button
              key={index}
              onClick={() => openItemModal(ingredient, 'ingredient')}
              className={`aspect-square p-3 rounded-xl border ${getRarityColor(ingredient.rarity)} transition-all duration-200 hover:scale-105 hover:shadow-lg cursor-pointer group`}
            >
              <div className="w-full h-full bg-slate-700/50 rounded-lg flex items-center justify-center group-hover:bg-slate-600/50 transition-colors">
                <img
                  src={getIngredientImagePath(ingredient.name)}
                  alt={ingredient.name}
                  className="w-full h-full object-cover rounded"
                  onError={(e) => {
                    const img = e.target as HTMLImageElement;
                    img.style.display = 'none';
                    const parent = img.parentElement;
                    if (parent) {
                      parent.innerHTML = '<span class="text-2xl">🌿</span>';
                    }
                  }}
                />
              </div>
            </button>
          ))}
        </div>
      </div>
      )}

      {/* Potions Section */}
      {inventory.potions.length > 0 && (
        <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
          <div className="flex items-center gap-3 mb-6">
            <WrenchScrewdriverIcon className="h-6 w-6 text-orange-400" />
            <h2 className="text-xl font-semibold text-white">{t('vendingMachine.sections.potions')} ({inventory.potions.length})</h2>
            <span className="text-sm text-slate-400">
              {inventory.potions.filter(p => p.rarity === 'Common').length} {t('vendingMachine.rarities.common')} • {' '}
              {inventory.potions.filter(p => p.rarity === 'Uncommon').length} {t('vendingMachine.rarities.uncommon')} • {' '}
              {inventory.potions.filter(p => p.rarity === 'Rare').length} {t('vendingMachine.rarities.rare')}
            </span>
          </div>
        
        <div className="grid grid-cols-3 md:grid-cols-6 lg:grid-cols-8 gap-3">
          {inventory.potions.map((potion, index) => (
            <button
              key={index}
              onClick={() => openItemModal(potion, 'potion')}
              className={`aspect-square p-3 rounded-xl border ${getRarityColor(potion.rarity)} transition-all duration-200 hover:scale-105 hover:shadow-lg cursor-pointer group`}
            >
              <div className="w-full h-full bg-slate-700/50 rounded-lg flex items-center justify-center group-hover:bg-slate-600/50 transition-colors">
                <img
                  src={getPotionImagePath(potion.name, potion.number)}
                  alt={potion.name}
                  className="w-full h-full object-cover rounded"
                  onError={(e) => {
                    const img = e.target as HTMLImageElement;
                    img.style.display = 'none';
                    const parent = img.parentElement;
                    if (parent) {
                      parent.innerHTML = '<span class="text-2xl">🧪</span>';
                    }
                  }}
                />
              </div>
            </button>
          ))}
        </div>
      </div>
      )}

      {/* Magic Items Section */}
      {inventory.magicItems.length > 0 && (
        <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
          <div className="flex items-center gap-3 mb-6">
            <SparklesIcon className="h-6 w-6 text-purple-400" />
            <h2 className="text-xl font-semibold text-white">{t('vendingMachine.sections.magicItems')} ({inventory.magicItems.length})</h2>
            <span className="text-sm text-slate-400">
              {inventory.magicItems.filter(item => item.type === 'Wondrous Item' || item.type === 'Ring').length} {t('vendingMachine.itemTypes.wondrous')} • {' '}
              {inventory.magicItems.filter(item => item.type.includes('Weapon')).length} {t('vendingMachine.itemTypes.weapons')} • {' '}
              {inventory.magicItems.filter(item => item.rarity === 'Rare' || item.rarity === 'Very Rare' || item.rarity === 'Legendary').length} {t('vendingMachine.itemTypes.rarePlus')}
            </span>
          </div>
        
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {inventory.magicItems.map((item, index) => (
            <button
              key={index}
              onClick={() => openItemModal(item, 'magicItem')}
              className={`aspect-square p-3 rounded-xl border ${getRarityColor(item.rarity)} transition-all duration-200 hover:scale-105 hover:shadow-lg cursor-pointer group`}
            >
              <div className="w-full h-full bg-slate-700/50 rounded-lg flex items-center justify-center group-hover:bg-slate-600/50 transition-colors">
                <img
                  src={getMagicItemImagePath(item.name)}
                  alt={item.name}
                  className="w-full h-full object-cover rounded"
                  onError={(e) => {
                    const img = e.target as HTMLImageElement;
                    img.style.display = 'none';
                    const parent = img.parentElement;
                    if (parent) {
                      parent.innerHTML = `<span class="text-3xl">${getMagicItemIcon(item.type)}</span>`;
                    }
                  }}
                />
              </div>
            </button>
          ))}
        </div>
      </div>
      )}

      {/* Item Detail Modal */}
      {selectedItem && selectedItemType && (
        <ItemDetailModal
          item={selectedItem}
          itemType={selectedItemType}
          onClose={closeItemModal}
        />
      )}
    </div>
  );
}

interface ItemDetailModalProps {
  item: any;
  itemType: 'ingredient' | 'potion' | 'magicItem';
  onClose: () => void;
}

function ItemDetailModal({ item, itemType, onClose }: ItemDetailModalProps) {
  const { t } = useTranslation();
  const { translatePotionName, translateIngredientName } = useItemTranslation();
  const getRarityColor = (rarity: string) => {
    switch (rarity.toLowerCase()) {
      case 'common': return 'border-gray-400/50 bg-gray-400/10 text-gray-300';
      case 'uncommon': return 'border-green-400/50 bg-green-400/10 text-green-300';
      case 'rare': return 'border-blue-400/50 bg-blue-400/10 text-blue-300';
      case 'very rare': return 'border-purple-400/50 bg-purple-400/10 text-purple-300';
      case 'legendary': return 'border-yellow-400/50 bg-yellow-400/10 text-yellow-300';
      default: return 'border-gray-400/50 bg-gray-400/10 text-gray-300';
    }
  };

  const getMagicItemIcon = (type: string) => {
    if (type.includes('Weapon')) {
      return '⚔️';
    } else if (type === 'Ring') {
      return '💍';
    } else {
      return '✨';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-white/10 p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">{t('common.details')}</h2>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="space-y-6">
          {/* Item Image */}
          <div className="text-center">
            <div className={`inline-block p-4 rounded-xl border ${getRarityColor(item.rarity)}`}>
              {itemType === 'ingredient' && (
                <div className="w-32 h-32 bg-slate-700/50 rounded-lg flex items-center justify-center">
                  <img
                    src={getIngredientImagePath(item.name)}
                    alt={item.name}
                    className="w-28 h-28 object-cover rounded"
                    onError={(e) => {
                      const img = e.target as HTMLImageElement;
                      img.style.display = 'none';
                      const parent = img.parentElement;
                      if (parent) {
                        parent.innerHTML = '<span class="text-6xl">🌿</span>';
                      }
                    }}
                  />
                </div>
              )}
              
              {itemType === 'potion' && (
                <div className="w-32 h-32 bg-slate-700/50 rounded-lg flex items-center justify-center">
                  <img
                    src={getPotionImagePath(item.name, item.number)}
                    alt={item.name}
                    className="w-28 h-28 object-cover rounded"
                    onError={(e) => {
                      const img = e.target as HTMLImageElement;
                      img.style.display = 'none';
                      const parent = img.parentElement;
                      if (parent) {
                        parent.innerHTML = '<span class="text-6xl">🧪</span>';
                      }
                    }}
                  />
                </div>
              )}
              
              {itemType === 'magicItem' && (
                <div className="w-32 h-32 bg-slate-700/50 rounded-lg flex items-center justify-center">
                  <img
                    src={getMagicItemImagePath(item.name)}
                    alt={item.name}
                    className="w-28 h-28 object-cover rounded"
                    onError={(e) => {
                      const img = e.target as HTMLImageElement;
                      img.style.display = 'none';
                      const parent = img.parentElement;
                      if (parent) {
                        parent.innerHTML = `<span class="text-6xl">${getMagicItemIcon(item.type)}</span>`;
                      }
                    }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Item Details */}
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-white mb-2">
                {itemType === 'potion' ? translatePotionName(item.name) :
                 itemType === 'ingredient' ? translateIngredientName(item.name) :
                 item.name}
              </h3>
              <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getRarityColor(item.rarity)}`}>
                {item.rarity}
              </div>
            </div>

            {/* Type-specific details */}
            {itemType === 'ingredient' && (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="bg-slate-700/30 rounded-lg p-3">
                    <div className="text-red-400 text-lg">⚔️</div>
                    <div className="text-white font-medium">{item.combat}</div>
                    <div className="text-slate-400 text-xs">{t('vendingMachine.details.combat')}</div>
                  </div>
                  <div className="bg-slate-700/30 rounded-lg p-3">
                    <div className="text-blue-400 text-lg">🔧</div>
                    <div className="text-white font-medium">{item.utility}</div>
                    <div className="text-slate-400 text-xs">{t('vendingMachine.details.utility')}</div>
                  </div>
                  <div className="bg-slate-700/30 rounded-lg p-3">
                    <div className="text-purple-400 text-lg">✨</div>
                    <div className="text-white font-medium">{item.whimsy}</div>
                    <div className="text-slate-400 text-xs">{t('vendingMachine.details.whimsy')}</div>
                  </div>
                </div>
                <div className="bg-slate-700/30 rounded-lg p-4 text-center">
                  <div className="flex justify-center mb-1">
                    <CurrencyDisplay goldValue={item.price || 0} size="lg" className="text-yellow-400" />
                  </div>
                  <div className="text-slate-400 text-sm">{t('vendingMachine.details.price')}</div>
                </div>
              </div>
            )}

            {itemType === 'potion' && (
              <div className="space-y-4">
                <div className="bg-slate-700/30 rounded-lg p-4">
                  <div className="text-slate-400 text-sm mb-1">{t('common.category')}</div>
                  <div className="text-white font-medium">{item.category}</div>
                </div>
                {item.description && (
                  <div className="bg-slate-700/30 rounded-lg p-4">
                    <div className="text-slate-400 text-sm mb-2">{t('common.description')}</div>
                    <div className="text-white text-sm">{item.description}</div>
                  </div>
                )}
                <div className="bg-slate-700/30 rounded-lg p-4 text-center">
                  <div className="flex justify-center mb-1">
                    <CurrencyDisplay goldValue={item.price || 0} size="lg" className="text-yellow-400" />
                  </div>
                  <div className="text-slate-400 text-sm">{t('vendingMachine.details.price')}</div>
                </div>
              </div>
            )}

            {itemType === 'magicItem' && (
              <div className="space-y-4">
                <div className="bg-slate-700/30 rounded-lg p-4">
                  <div className="text-slate-400 text-sm mb-1">{t('vendingMachine.details.type')}</div>
                  <div className="text-white font-medium">{item.type}</div>
                </div>
                {item.requiresAttunement && (
                  <div className="bg-yellow-500/10 border border-yellow-400/30 rounded-lg p-4">
                    <div className="text-yellow-400 font-medium text-center">⚠️ {t('vendingMachine.details.attunement')}</div>
                  </div>
                )}
                {item.effect && (
                  <div className="bg-slate-700/30 rounded-lg p-4">
                    <div className="text-slate-400 text-sm mb-2">{t('vendingMachine.details.effect')}</div>
                    <div className="text-white text-sm">{item.effect}</div>
                  </div>
                )}
                <div className="bg-slate-700/30 rounded-lg p-4 text-center">
                  <div className="flex justify-center mb-1">
                    <CurrencyDisplay goldValue={item.price || 0} size="lg" className="text-yellow-400" />
                  </div>
                  <div className="text-slate-400 text-sm">{t('vendingMachine.details.price')}</div>
                </div>
              </div>
            )}
          </div>

          {/* Close Button */}
          <div className="text-center pt-4">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition-colors"
            >
              {t('vendingMachine.details.close')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}