'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ingredients, Ingredient } from '@/data/ingredients';
import { brewPotion, selectPotionFromTie, BrewingResult } from '@/utils/potionBrewing';
import { BeakerIcon, SparklesIcon, ShieldCheckIcon, WrenchScrewdriverIcon } from '@heroicons/react/24/outline';
import SearchableDropdown from './SearchableDropdown';
import { getPotionImagePath } from '@/utils/imageUtils';

export default function PotionBrewing() {
  const [selectedIngredients, setSelectedIngredients] = useState<(Ingredient | null)[]>([null, null, null]);
  const [brewingResult, setBrewingResult] = useState<BrewingResult | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<'Combat' | 'Utility' | 'Whimsy' | null>(null);
  const { t } = useTranslation();

  const handleIngredientSelect = (ingredient: Ingredient | null, slotIndex: number) => {
    const newSelection = [...selectedIngredients];
    newSelection[slotIndex] = ingredient;
    setSelectedIngredients(newSelection);
    setBrewingResult(null);
    setSelectedCategory(null);
  };

  const handleBrew = () => {
    if (selectedIngredients.every(ingredient => ingredient !== null)) {
      const [ing1, ing2, ing3] = selectedIngredients as [Ingredient, Ingredient, Ingredient];
      const result = brewPotion(ing1, ing2, ing3);
      setBrewingResult(result);
      setSelectedCategory(null);
    }
  };

  const handleCategorySelect = (category: 'Combat' | 'Utility' | 'Whimsy') => {
    if (brewingResult && brewingResult.winner === 'Tie') {
      const potion = selectPotionFromTie(brewingResult, category);
      if (potion) {
        setSelectedCategory(category);
        setBrewingResult({
          ...brewingResult,
          winner: category,
          potion
        });
      }
    }
  };

  const clearAll = () => {
    setSelectedIngredients([null, null, null]);
    setBrewingResult(null);
    setSelectedCategory(null);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Combat': return <ShieldCheckIcon className="h-5 w-5" />;
      case 'Utility': return <WrenchScrewdriverIcon className="h-5 w-5" />;
      case 'Whimsy': return <SparklesIcon className="h-5 w-5" />;
      default: return null;
    }
  };

  const getCategoryTranslation = (category: string) => {
    switch (category) {
      case 'Combat': return t('potions.categories.combat');
      case 'Utility': return t('potions.categories.utility');
      case 'Whimsy': return t('potions.categories.whimsy');
      default: return category;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Combat': return 'text-red-400 border-red-400/50 bg-red-400/10';
      case 'Utility': return 'text-blue-400 border-blue-400/50 bg-blue-400/10';
      case 'Whimsy': return 'text-purple-400 border-purple-400/50 bg-purple-400/10';
      default: return 'text-gray-400 border-gray-400/50 bg-gray-400/10';
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-3">
          <BeakerIcon className="h-8 w-8 text-emerald-400" />
          <h1 className="text-3xl font-bold text-white">{t('potions.brewingStation.title')}</h1>
        </div>
        <p className="text-slate-400">{t('potions.brewingStation.subtitle')}</p>
      </div>

      {/* Ingredient Selection */}
      <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
        <h2 className="text-xl font-semibold text-white mb-4">{t('potions.brewingStation.selectIngredients')}</h2>
        
        {/* Ingredient Slots */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {selectedIngredients.map((ingredient, index) => (
            <div key={index} className="space-y-3">
              <label className="block text-sm font-medium text-slate-300">
                {t('potions.brewingStation.ingredient')} {index + 1}
              </label>
              
              <SearchableDropdown
                ingredients={ingredients}
                selectedIngredient={ingredient}
                onSelect={(selected) => handleIngredientSelect(selected, index)}
                placeholder={`${t('potions.brewingStation.chooseIngredient')} ${index + 1}...`}
              />
            </div>
          ))}
        </div>

        {/* Brew Button */}
        <div className="flex gap-4">
          <button
            onClick={handleBrew}
            disabled={selectedIngredients.some(ing => ing === null)}
            className="flex-1 bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg"
          >
            🧪 {t('potions.brewingStation.brewPotion')}
          </button>
          <button
            onClick={clearAll}
            className="px-6 py-3 bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 rounded-xl transition-all duration-200 border border-slate-600"
          >
            {t('potions.brewingStation.clearAll')}
          </button>
        </div>
      </div>

      {/* Brewing Results */}
      {brewingResult && (
        <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
          <h2 className="text-xl font-semibold text-white mb-6">{t('potions.brewingStation.brewingResults')}</h2>
          
          {/* Final Potion Result - Now First! */}
          {brewingResult.potion && (
            <div className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-xl border border-yellow-400/30 p-8 mb-6">
              <div className="flex items-center gap-6">
                {/* Large Potion Image */}
                <div className="w-32 h-32 bg-gradient-to-br from-yellow-400/10 to-orange-500/10 rounded-2xl flex items-center justify-center border border-yellow-400/30 flex-shrink-0 relative overflow-hidden">
                  <img
                    src={getPotionImagePath(brewingResult.potion.name, brewingResult.potion.number)}
                    alt={brewingResult.potion.name}
                    className="w-28 h-28 object-cover rounded-xl"
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
                
                {/* Potion Details */}
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-white mb-3">{brewingResult.potion.name}</h3>
                  <div className="flex items-center gap-3 mb-3">
                    <span className={`px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 ${getCategoryColor(brewingResult.potion.category)}`}>
                      {getCategoryIcon(brewingResult.potion.category)}
                      {brewingResult.potion.category}
                    </span>
                    <span className="px-4 py-2 rounded-full text-sm font-medium bg-gray-600/50 text-gray-300">
                      {brewingResult.potion.rarity}
                    </span>
                  </div>
                  <div className="text-slate-300 text-lg">
                    <span className="font-semibold text-yellow-400">Potion #{brewingResult.potion.number}</span>
                    <span className="mx-2">•</span>
                    <span>Total Score: <span className="font-semibold text-white">{
                      brewingResult.potion.category === 'Combat' ? brewingResult.combat :
                      brewingResult.potion.category === 'Utility' ? brewingResult.utility :
                      brewingResult.whimsy
                    }</span></span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tie Resolution */}
          {brewingResult.winner === 'Tie' && brewingResult.tiedCategories && !brewingResult.potion && (
            <div className="mb-6">
              <h3 className="text-lg font-medium text-white mb-3">{t('potions.brewingStation.categoryTie')} {t('potions.brewingStation.selectCategory')}</h3>
              <div className="flex gap-3 justify-center">
                {brewingResult.tiedCategories.map((category) => (
                  <button
                    key={category}
                    onClick={() => handleCategorySelect(category)}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl border transition-all duration-200 ${getCategoryColor(category)} hover:bg-opacity-20`}
                  >
                    {getCategoryIcon(category)}
                    {getCategoryTranslation(category)}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {/* Attribute Totals - Now Below the Potion */}
          <div className="grid grid-cols-3 gap-4">
            <div className={`p-4 rounded-xl border ${getCategoryColor('Combat')}`}>
              <div className="flex items-center gap-2 mb-2">
                {getCategoryIcon('Combat')}
                <span className="font-medium">{t('potions.categories.combat')}</span>
              </div>
              <div className="text-2xl font-bold">{brewingResult.combat}</div>
            </div>
            <div className={`p-4 rounded-xl border ${getCategoryColor('Utility')}`}>
              <div className="flex items-center gap-2 mb-2">
                {getCategoryIcon('Utility')}
                <span className="font-medium">{t('potions.categories.utility')}</span>
              </div>
              <div className="text-2xl font-bold">{brewingResult.utility}</div>
            </div>
            <div className={`p-4 rounded-xl border ${getCategoryColor('Whimsy')}`}>
              <div className="flex items-center gap-2 mb-2">
                {getCategoryIcon('Whimsy')}
                <span className="font-medium">{t('potions.categories.whimsy')}</span>
              </div>
              <div className="text-2xl font-bold">{brewingResult.whimsy}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}