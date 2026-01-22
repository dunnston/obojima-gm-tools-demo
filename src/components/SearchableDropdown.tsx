'use client';

import { useState, useRef, useEffect } from 'react';
import { Ingredient } from '@/data/ingredients';
import { ChevronDownIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useItemTranslation } from '@/hooks/useItemTranslation';
import { getIngredientImagePath } from '@/utils/imageUtils';

interface SearchableDropdownProps {
  ingredients: Ingredient[];
  selectedIngredient: Ingredient | null;
  onSelect: (ingredient: Ingredient | null) => void;
  placeholder: string;
}

export default function SearchableDropdown({ 
  ingredients, 
  selectedIngredient, 
  onSelect, 
  placeholder 
}: SearchableDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { translateIngredientName } = useItemTranslation();

  // Filter ingredients based on search term
  const filteredIngredients = ingredients.filter(ingredient => {
    const translatedName = translateIngredientName(ingredient.name);
    return ingredient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           translatedName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  const handleSelect = (ingredient: Ingredient) => {
    onSelect(ingredient);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleClear = () => {
    onSelect(null);
    setIsOpen(false);
    setSearchTerm('');
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'Common': return 'text-gray-400';
      case 'Uncommon': return 'text-blue-400';
      case 'Rare': return 'text-purple-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Selected Ingredient Display */}
      {selectedIngredient ? (
        <div className="relative group">
          <div className="bg-gradient-to-br from-emerald-500/20 to-blue-500/20 backdrop-blur-sm rounded-xl border border-white/20 p-4 transition-all duration-200">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg overflow-hidden bg-white/10 flex items-center justify-center">
                <img
                  src={getIngredientImagePath(selectedIngredient.name)}
                  alt={selectedIngredient.name}
                  className="w-full h-full object-cover"
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
              <div className="flex-1">
                <h3 className="font-medium text-white">{translateIngredientName(selectedIngredient.name)}</h3>
                <div className="flex gap-2 text-xs mt-1">
                  <span className="text-red-400">⚔️ {selectedIngredient.combat}</span>
                  <span className="text-blue-400">🔧 {selectedIngredient.utility}</span>
                  <span className="text-purple-400">✨ {selectedIngredient.whimsy}</span>
                  <span className={getRarityColor(selectedIngredient.rarity)}>
                    {selectedIngredient.rarity}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <button
            onClick={handleClear}
            className="absolute top-2 right-2 w-6 h-6 bg-red-500/80 rounded-full text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity"
          >
            ×
          </button>
        </div>
      ) : (
        /* Dropdown Button */
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-3 text-left text-white hover:bg-slate-600/50 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400/50 transition-all duration-200 flex items-center justify-between"
        >
          <span className="text-slate-400">
            {placeholder}
          </span>
          <ChevronDownIcon className={`h-5 w-5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      )}

      {/* Dropdown Menu */}
      {isOpen && !selectedIngredient && (
        <div className="absolute z-50 w-full mt-2 bg-slate-800/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl max-h-80 overflow-hidden">
          {/* Search Input */}
          <div className="p-3 border-b border-white/10">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search ingredients..."
                className="w-full bg-slate-700/50 border border-slate-600 rounded-lg pl-10 pr-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400/50"
              />
            </div>
          </div>

          {/* Ingredients List */}
          <div className="max-h-64 overflow-y-auto">
            {filteredIngredients.length > 0 ? (
              filteredIngredients.map((ingredient) => (
                <button
                  key={ingredient.name}
                  onClick={() => handleSelect(ingredient)}
                  className="w-full px-4 py-3 text-left hover:bg-white/10 transition-colors border-b border-white/5 last:border-b-0"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-md overflow-hidden bg-white/10 flex-shrink-0 flex items-center justify-center">
                      <img
                        src={getIngredientImagePath(ingredient.name)}
                        alt={ingredient.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const img = e.target as HTMLImageElement;
                          img.style.display = 'none';
                          const parent = img.parentElement;
                          if (parent) {
                            parent.innerHTML = '<span class="text-lg">🌿</span>';
                          }
                        }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-white font-medium truncate">{translateIngredientName(ingredient.name)}</span>
                        <span className={`text-xs ${getRarityColor(ingredient.rarity)}`}>
                          {ingredient.rarity}
                        </span>
                      </div>
                      <div className="flex gap-2 text-xs mt-1">
                        <span className="text-red-400">⚔️{ingredient.combat}</span>
                        <span className="text-blue-400">🔧{ingredient.utility}</span>
                        <span className="text-purple-400">✨{ingredient.whimsy}</span>
                      </div>
                    </div>
                  </div>
                </button>
              ))
            ) : (
              <div className="px-4 py-8 text-center text-slate-400">
                No ingredients found matching "{searchTerm}"
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}