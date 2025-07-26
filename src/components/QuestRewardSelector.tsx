'use client';

import { useState } from 'react';
import { QuestReward, QuestRewardType, QUEST_REWARD_TYPES } from '@/data/quests';
import { magicItems } from '@/data/magicItems';
import { combatPotions, utilityPotions, whimsyPotions } from '@/data/potions';
import { ingredients } from '@/data/ingredients';
import { XMarkIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

interface QuestRewardSelectorProps {
  reward: Omit<QuestReward, 'id'>;
  onChange: (reward: Omit<QuestReward, 'id'>) => void;
  onRemove: () => void;
}

export default function QuestRewardSelector({ reward, onChange, onRemove }: QuestRewardSelectorProps) {
  const [showItemSelector, setShowItemSelector] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const handleFieldChange = (field: keyof Omit<QuestReward, 'id'>, value: any) => {
    onChange({ ...reward, [field]: value });
  };

  const getAvailableItems = () => {
    switch (reward.type) {
      case 'magic-item':
        return magicItems.map(item => ({
          name: item.name,
          description: `${item.type} (${item.rarity})`,
          value: item.price
        }));
      case 'potion':
        const allPotions = [...combatPotions, ...utilityPotions, ...whimsyPotions];
        return allPotions.map(potion => ({
          name: potion.name,
          description: `${potion.category} Potion (${potion.rarity})`,
          value: potion.price
        }));
      case 'ingredient':
        return ingredients.map(ingredient => ({
          name: ingredient.name,
          description: `Ingredient (${ingredient.rarity})`,
          value: ingredient.price
        }));
      default:
        return [];
    }
  };

  const availableItems = getAvailableItems();
  const filteredItems = availableItems.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectItem = (item: { name: string; description?: string; value?: number }) => {
    onChange({
      ...reward,
      name: item.name,
      description: item.description,
      value: item.value
    });
    setShowItemSelector(false);
    setSearchTerm('');
  };

  const canSelectFromDatabase = ['magic-item', 'potion', 'ingredient'].includes(reward.type);

  return (
    <div className="p-4 bg-slate-700/30 rounded-lg border border-slate-600">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">
            Type
          </label>
          <select
            value={reward.type}
            onChange={(e) => handleFieldChange('type', e.target.value)}
            className="w-full px-3 py-2 bg-slate-600/50 border border-slate-500 rounded text-white text-sm focus:outline-none focus:border-emerald-400"
          >
            {QUEST_REWARD_TYPES.map(type => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">
            Name
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={reward.name}
              onChange={(e) => handleFieldChange('name', e.target.value)}
              className="flex-1 px-3 py-2 bg-slate-600/50 border border-slate-500 rounded text-white text-sm placeholder-slate-400 focus:outline-none focus:border-emerald-400"
              placeholder="Reward name..."
            />
            {canSelectFromDatabase && (
              <button
                type="button"
                onClick={() => setShowItemSelector(true)}
                className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded transition-colors"
                title="Select from database"
              >
                <MagnifyingGlassIcon className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">
            Quantity
          </label>
          <input
            type="number"
            min="1"
            value={reward.quantity || 1}
            onChange={(e) => handleFieldChange('quantity', parseInt(e.target.value) || 1)}
            className="w-full px-3 py-2 bg-slate-600/50 border border-slate-500 rounded text-white text-sm focus:outline-none focus:border-emerald-400"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">
            Value (gp)
          </label>
          <input
            type="number"
            min="0"
            value={reward.value || ''}
            onChange={(e) => handleFieldChange('value', e.target.value ? parseInt(e.target.value) : undefined)}
            className="w-full px-3 py-2 bg-slate-600/50 border border-slate-500 rounded text-white text-sm placeholder-slate-400 focus:outline-none focus:border-emerald-400"
            placeholder="Optional"
          />
        </div>
      </div>

      <div className="flex items-end gap-3">
        <div className="flex-1">
          <label className="block text-xs font-medium text-slate-400 mb-1">
            Description
          </label>
          <input
            type="text"
            value={reward.description || ''}
            onChange={(e) => handleFieldChange('description', e.target.value)}
            className="w-full px-3 py-2 bg-slate-600/50 border border-slate-500 rounded text-white text-sm placeholder-slate-400 focus:outline-none focus:border-emerald-400"
            placeholder="Optional description..."
          />
        </div>
        <button
          type="button"
          onClick={onRemove}
          className="p-2 text-red-400 hover:text-red-300 hover:bg-slate-600/50 rounded transition-colors"
        >
          <XMarkIcon className="h-4 w-4" />
        </button>
      </div>

      {/* Item Selector Modal */}
      {showItemSelector && canSelectFromDatabase && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 border border-slate-600 rounded-xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-slate-600">
              <h3 className="text-lg font-semibold text-white">
                Select {QUEST_REWARD_TYPES.find(t => t.value === reward.type)?.label}
              </h3>
              <button
                onClick={() => {
                  setShowItemSelector(false);
                  setSearchTerm('');
                }}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="p-4 border-b border-slate-600">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-emerald-400"
                  placeholder="Search items..."
                />
              </div>
            </div>

            <div className="max-h-96 overflow-y-auto">
              {filteredItems.length === 0 ? (
                <div className="p-8 text-center text-slate-400">
                  No items found matching "{searchTerm}"
                </div>
              ) : (
                <div className="p-2">
                  {filteredItems.map((item, index) => (
                    <button
                      key={index}
                      onClick={() => selectItem(item)}
                      className="w-full p-3 text-left hover:bg-slate-700/50 rounded-lg transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-white font-medium">{item.name}</div>
                          {item.description && (
                            <div className="text-sm text-slate-400">{item.description}</div>
                          )}
                        </div>
                        {item.value && (
                          <div className="text-emerald-400 font-medium">
                            {item.value} gp
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}