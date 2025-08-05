'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  LOCATIONS, 
  Location, 
  SearchType, 
  ForagingResult, 
  ForagingAttempt,
  performRandomForaging,
  performSpecificSearch,
  getLocationInfo
} from '@/utils/ingredientForaging';
import { ingredients } from '@/data/ingredients';
import { getIngredientImagePath } from '@/utils/imageUtils';
import { MagnifyingGlassIcon, MapPinIcon, BeakerIcon, Cog6ToothIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { useItemTranslation } from '@/hooks/useItemTranslation';

export default function IngredientForaging() {
  const [selectedLocation, setSelectedLocation] = useState<Location>('Gale Fields');
  const [searchType, setSearchType] = useState<SearchType>('survival');
  const [rollResult, setRollResult] = useState<number>(10);
  const [targetIngredient, setTargetIngredient] = useState<string>('');
  const [isSpecificSearch, setIsSpecificSearch] = useState<boolean>(false);
  const [foragingResult, setForagingResult] = useState<ForagingResult | null>(null);
  const [searchHistory, setSearchHistory] = useState<ForagingResult[]>([]);
  const [ingredientDropdownOpen, setIngredientDropdownOpen] = useState<boolean>(false);
  const [ingredientSearchTerm, setIngredientSearchTerm] = useState<string>('');
  const { t } = useTranslation();
  const { translateIngredientName } = useItemTranslation();

  const locationInfo = getLocationInfo(selectedLocation);

  // Filter ingredients based on search type and search term
  const getFilteredIngredients = () => {
    const typeFilter = (ingredient: any) => {
      if (searchType === 'salvage') {
        return ingredient.type === 'Other' || ingredient.type === 'Salvage';
      } else {
        return ingredient.type !== 'Other' && ingredient.type !== 'Salvage';
      }
    };

    return ingredients
      .filter(typeFilter)
      .filter(ingredient => {
        const translatedName = translateIngredientName(ingredient.name);
        return ingredient.name.toLowerCase().includes(ingredientSearchTerm.toLowerCase()) ||
               translatedName.toLowerCase().includes(ingredientSearchTerm.toLowerCase());
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  };

  const filteredIngredients = getFilteredIngredients();

  const handleIngredientSelect = (ingredientName: string) => {
    setTargetIngredient(ingredientName);
    setIngredientDropdownOpen(false);
    setIngredientSearchTerm('');
  };

  const performSearch = () => {
    const attempt: ForagingAttempt = {
      searchType,
      location: selectedLocation,
      rollResult,
      targetIngredient: isSpecificSearch ? targetIngredient : undefined
    };

    const result = isSpecificSearch 
      ? performSpecificSearch(attempt)
      : performRandomForaging(attempt);

    setForagingResult(result);
    setSearchHistory(prev => [result, ...prev.slice(0, 9)]); // Keep last 10 results
  };

  const rollDice = (sides: number) => {
    const roll = Math.floor(Math.random() * sides) + 1;
    setRollResult(roll);
    return roll;
  };

  const getResultColor = (result: ForagingResult) => {
    if (!result.success) return 'border-red-400/50 bg-red-400/10';
    if (result.ingredient?.rarity === 'Uncommon') return 'border-green-400/50 bg-green-400/10';
    return 'border-blue-400/50 bg-blue-400/10';
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-3">
          <MagnifyingGlassIcon className="h-8 w-8 text-emerald-400" />
          <h1 className="text-3xl font-bold text-white">{t('ingredients.foraging.title')}</h1>
        </div>
        <p className="text-slate-400">{t('ingredients.foraging.subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Foraging Setup */}
        <div className="space-y-6">
          {/* Location & Search Setup */}
          <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
            <h2 className="text-xl font-semibold text-white mb-4">{t('ingredients.foraging.title')}</h2>
            
            <div className="space-y-4">
              {/* Location Selection */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  {t('ingredients.foraging.location')}
                </label>
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value as Location)}
                  className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-emerald-400"
                >
                  {LOCATIONS.map(location => (
                    <option key={location} value={location}>{location}</option>
                  ))}
                </select>
              </div>

              {/* Search Type */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  {t('ingredients.foraging.searchType')}
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setSearchType('survival')}
                    className={`p-3 rounded-lg border transition-colors ${
                      searchType === 'survival' 
                        ? 'border-emerald-400 bg-emerald-400/10 text-emerald-400' 
                        : 'border-slate-600 bg-slate-700/30 text-slate-300 hover:border-slate-500'
                    }`}
                  >
                    <BeakerIcon className="h-5 w-5 mx-auto mb-1" />
                    <div className="text-sm font-medium">{t('ingredients.foraging.searchTypes.survival')}</div>
                    <div className="text-xs opacity-75">Natural foraging</div>
                  </button>
                  <button
                    onClick={() => setSearchType('salvage')}
                    className={`p-3 rounded-lg border transition-colors ${
                      searchType === 'salvage' 
                        ? 'border-emerald-400 bg-emerald-400/10 text-emerald-400' 
                        : 'border-slate-600 bg-slate-700/30 text-slate-300 hover:border-slate-500'
                    }`}
                  >
                    <Cog6ToothIcon className="h-5 w-5 mx-auto mb-1" />
                    <div className="text-sm font-medium">{t('ingredients.foraging.searchTypes.salvage')}</div>
                    <div className="text-xs opacity-75">Machinery/ruins</div>
                  </button>
                </div>
              </div>

              {/* Search Type Toggle */}
              <div>
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={isSpecificSearch}
                    onChange={(e) => setIsSpecificSearch(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-emerald-400 focus:ring-emerald-400"
                  />
                  <span className="text-slate-300">{t('ingredients.foraging.specificSearch')}</span>
                </label>
              </div>

              {/* Specific Ingredient Dropdown */}
              {isSpecificSearch && (
                <div className="relative">
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    {t('ingredients.foraging.targetIngredient')}
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIngredientDropdownOpen(!ingredientDropdownOpen)}
                      className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-emerald-400 text-left flex items-center justify-between"
                    >
                      <span className={targetIngredient ? 'text-white' : 'text-slate-400'}>
                        {targetIngredient ? translateIngredientName(targetIngredient) : t('ingredients.foraging.selectIngredient')}
                      </span>
                      <ChevronDownIcon className={`h-5 w-5 text-slate-400 transition-transform ${ingredientDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>
                    
                    {ingredientDropdownOpen && (
                      <div className="absolute z-50 w-full mt-1 bg-slate-800 border border-slate-600 rounded-lg shadow-xl max-h-64 overflow-hidden">
                        <div className="p-3 border-b border-slate-600">
                          <input
                            type="text"
                            value={ingredientSearchTerm}
                            onChange={(e) => setIngredientSearchTerm(e.target.value)}
                            placeholder={t('ingredients.foraging.searchIngredients')}
                            className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded text-white placeholder-slate-400 text-sm focus:outline-none focus:border-emerald-400"
                            autoFocus
                          />
                        </div>
                        <div className="max-h-48 overflow-y-auto">
                          {filteredIngredients.length > 0 ? (
                            filteredIngredients.map((ingredient) => (
                              <button
                                key={ingredient.name}
                                onClick={() => handleIngredientSelect(ingredient.name)}
                                className="w-full px-4 py-2 text-left hover:bg-slate-700/50 text-white text-sm flex items-center justify-between transition-colors"
                              >
                                <div>
                                  <div className="font-medium">{translateIngredientName(ingredient.name)}</div>
                                  <div className="text-xs text-slate-400">{ingredient.rarity} • {ingredient.type}</div>
                                </div>
                                <div className="flex gap-1 text-xs">
                                  <span className="text-red-400">⚔️{ingredient.combat}</span>
                                  <span className="text-blue-400">🔧{ingredient.utility}</span>
                                  <span className="text-purple-400">✨{ingredient.whimsy}</span>
                                </div>
                              </button>
                            ))
                          ) : (
                            <div className="px-4 py-3 text-slate-400 text-sm text-center">
                              No ingredients found matching your search
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  {/* Close dropdown when clicking outside */}
                  {ingredientDropdownOpen && (
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setIngredientDropdownOpen(false)}
                    />
                  )}
                </div>
              )}

              {/* Roll Input */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  {searchType === 'survival' ? t('ingredients.foraging.searchTypes.survival') : t('ingredients.foraging.searchTypes.salvage')} {t('ingredients.foraging.rollResult')}
                </label>
                <div className="flex gap-3">
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={rollResult}
                    onChange={(e) => setRollResult(parseInt(e.target.value) || 1)}
                    className="flex-1 px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-emerald-400"
                  />
                  <button
                    onClick={() => rollDice(20)}
                    className="px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition-colors"
                  >
                    Roll d20
                  </button>
                </div>
              </div>

              {/* Search Button */}
              <button
                onClick={performSearch}
                className="w-full bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg"
              >
                🔍 {t('ingredients.foraging.forage')}
              </button>
            </div>
          </div>

          {/* Location Info */}
          <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
            <div className="flex items-center gap-3 mb-4">
              <MapPinIcon className="h-6 w-6 text-blue-400" />
              <h2 className="text-xl font-semibold text-white">{selectedLocation}</h2>
            </div>
            
            <p className="text-slate-300 mb-4">{locationInfo.description}</p>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="text-center p-3 bg-slate-700/30 rounded-lg">
                <div className="text-xl font-bold text-green-400">{locationInfo.nativeCommon.length}</div>
                <div className="text-sm text-slate-400">Common Native</div>
              </div>
              <div className="text-center p-3 bg-slate-700/30 rounded-lg">
                <div className="text-xl font-bold text-blue-400">{locationInfo.nativeUncommon.length}</div>
                <div className="text-sm text-slate-400">Uncommon Native</div>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <h3 className="font-semibold text-slate-300">DC Guidelines:</h3>
              <div className="space-y-1 text-slate-400">
                <div>• Common (native): DC 10-15</div>
                <div>• Uncommon (native) / Common (non-native): DC 16-20</div>
                <div>• Uncommon (non-native): DC 21-25</div>
                <div>• Rare ingredients: Not found foraging</div>
                <div className="text-xs mt-2 text-slate-500">
                  * Specific searches have +2-4 DC increase
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Results */}
        <div className="space-y-6">
          {/* Current Result */}
          {foragingResult && (
            <div className={`bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-2xl border p-6 ${getResultColor(foragingResult)}`}>
              <h2 className="text-xl font-semibold text-white mb-4">
                {foragingResult.success ? `✅ ${t('ingredients.foraging.ingredientFound')}` : `❌ ${t('ingredients.foraging.nothingFound')}`}
              </h2>
              
              {foragingResult.ingredient && (
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-slate-700/50 rounded-lg flex items-center justify-center">
                    <img
                      src={getIngredientImagePath(foragingResult.ingredient.name)}
                      alt={foragingResult.ingredient.name}
                      className="w-12 h-12 object-cover rounded"
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
                  <div>
                    <h3 className="text-lg font-bold text-white">{translateIngredientName(foragingResult.ingredient.name)}</h3>
                    <p className="text-sm text-slate-300">{foragingResult.ingredient.rarity}</p>
                    <div className="flex gap-2 text-xs mt-1">
                      <span className="text-red-400">⚔️{foragingResult.ingredient.combat}</span>
                      <span className="text-blue-400">🔧{foragingResult.ingredient.utility}</span>
                      <span className="text-purple-400">✨{foragingResult.ingredient.whimsy}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-slate-700/30 rounded-lg p-4 mb-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-slate-400">{t('ingredients.foraging.rollResult')}:</span>
                    <span className="text-white font-bold ml-2">{foragingResult.dcMet}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">DC Required:</span>
                    <span className="text-white font-bold ml-2">{foragingResult.dcRequired}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">{t('ingredients.foraging.searchType')}:</span>
                    <span className="text-white ml-2 capitalize">{foragingResult.searchType}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">{t('ingredients.foraging.location')}:</span>
                    <span className="text-white ml-2">{foragingResult.location}</span>
                  </div>
                </div>
              </div>

              <p className="text-slate-300 text-sm">{foragingResult.message}</p>
            </div>
          )}

          {/* Search History */}
          <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
            <h2 className="text-xl font-semibold text-white mb-4">{t('ingredients.foraging.history')}</h2>
            
            {searchHistory.length === 0 ? (
              <p className="text-slate-400 text-center py-8">{t('ingredients.foraging.noResults')}</p>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {searchHistory.map((result, index) => (
                  <div key={index} className={`p-3 rounded-lg border ${result.success ? 'border-green-400/30 bg-green-400/5' : 'border-red-400/30 bg-red-400/5'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className={result.success ? 'text-green-400' : 'text-red-400'}>
                          {result.success ? '✅' : '❌'}
                        </span>
                        <span className="text-white font-medium">
                          {result.ingredient?.name || 'Nothing found'}
                        </span>
                        {result.ingredient && (
                          <span className="text-xs px-2 py-1 bg-slate-700/50 rounded text-slate-300">
                            {result.ingredient.rarity}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-400">
                        {result.dcMet}/{result.dcRequired}
                      </div>
                    </div>
                    <div className="text-xs text-slate-400">
                      {result.searchType} in {result.location}
                      {result.targetIngredient && ` (looking for ${result.targetIngredient})`}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}