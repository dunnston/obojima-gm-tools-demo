'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { combatPotions, utilityPotions, whimsyPotions } from '@/data/potions';
import { ingredients } from '@/data/ingredients';
import { creatures } from '@/data/creatures';
import { magicItems } from '@/data/magicItems';
import { PotionEditForm, IngredientEditForm, CreatureEditForm, MagicItemEditForm } from './EditForms';
import { getPotionImagePath, getIngredientImagePath, getCreatureImagePath, getMagicItemImagePath } from '@/utils/imageUtils';
import { 
  BeakerIcon, 
  SparklesIcon, 
  FireIcon,
  GiftIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  EyeIcon
} from '@heroicons/react/24/outline';

type TabType = 'potions' | 'ingredients' | 'creatures' | 'magicItems';

export default function DatabaseView() {
  const [activeTab, setActiveTab] = useState<TabType>('potions');
  const [editingItem, setEditingItem] = useState<any>(null);
  const [editingType, setEditingType] = useState<string>('');
  
  // State for modified data with localStorage persistence
  const [modifiedIngredients, setModifiedIngredients] = useState<any[]>([]);
  const [modifiedPotions, setModifiedPotions] = useState<any[]>([]);
  const [modifiedCreatures, setModifiedCreatures] = useState<any[]>([]);
  const [modifiedMagicItems, setModifiedMagicItems] = useState<any[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load saved data from localStorage on component mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedIngredients = localStorage.getItem('modifiedIngredients');
      const savedPotions = localStorage.getItem('modifiedPotions');
      const savedCreatures = localStorage.getItem('modifiedCreatures');
      const savedMagicItems = localStorage.getItem('modifiedMagicItems');

      if (savedIngredients) {
        try {
          const parsedIngredients = JSON.parse(savedIngredients);
          setModifiedIngredients(parsedIngredients);
        } catch (error) {
          console.error('Error parsing saved ingredients:', error);
        }
      }

      if (savedPotions) {
        try {
          const parsedPotions = JSON.parse(savedPotions);
          setModifiedPotions(parsedPotions);
        } catch (error) {
          console.error('Error parsing saved potions:', error);
        }
      }

      if (savedCreatures) {
        try {
          const parsedCreatures = JSON.parse(savedCreatures);
          setModifiedCreatures(parsedCreatures);
        } catch (error) {
          console.error('Error parsing saved creatures:', error);
        }
      }

      if (savedMagicItems) {
        try {
          const parsedMagicItems = JSON.parse(savedMagicItems);
          setModifiedMagicItems(parsedMagicItems);
        } catch (error) {
          console.error('Error parsing saved magic items:', error);
        }
      }
      
      setIsLoaded(true);
    }
  }, []);

  // Save to localStorage whenever modified data changes
  useEffect(() => {
    if (typeof window !== 'undefined' && isLoaded) {
      localStorage.setItem('modifiedIngredients', JSON.stringify(modifiedIngredients));
    }
  }, [modifiedIngredients, isLoaded]);

  useEffect(() => {
    if (typeof window !== 'undefined' && isLoaded) {
      localStorage.setItem('modifiedPotions', JSON.stringify(modifiedPotions));
    }
  }, [modifiedPotions, isLoaded]);

  useEffect(() => {
    if (typeof window !== 'undefined' && isLoaded) {
      localStorage.setItem('modifiedCreatures', JSON.stringify(modifiedCreatures));
    }
  }, [modifiedCreatures, isLoaded]);

  useEffect(() => {
    if (typeof window !== 'undefined' && isLoaded) {
      localStorage.setItem('modifiedMagicItems', JSON.stringify(modifiedMagicItems));
    }
  }, [modifiedMagicItems, isLoaded]);

  // Combine all potion arrays and apply modifications
  const potions = [...combatPotions, ...utilityPotions, ...whimsyPotions].map(potion => {
    const modified = modifiedPotions.find(p => p.name === potion.name && p.number === potion.number);
    return modified || potion;
  });

  // Apply modifications to ingredients
  const currentIngredients = ingredients.map(ingredient => {
    const modified = modifiedIngredients.find(i => i.name === ingredient.name);
    return modified || ingredient;
  });

  // Apply modifications to creatures
  const currentCreatures = creatures.map(creature => {
    const modified = modifiedCreatures.find(c => c.name === creature.name);
    return modified || creature;
  });

  // Apply modifications to magic items
  const currentMagicItems = magicItems.map(magicItem => {
    const modified = modifiedMagicItems.find(m => m.name === magicItem.name);
    return modified || magicItem;
  });

  const handleEdit = (item: any, type: string) => {
    setEditingItem(item);
    setEditingType(type);
  };

  const handleSave = (updatedItem: any) => {
    
    // Update the appropriate state based on type
    if (editingType === 'ingredient') {
      setModifiedIngredients(prev => {
        const filtered = prev.filter(item => item.name !== updatedItem.name);
        return [...filtered, updatedItem];
      });
    } else if (editingType === 'potion') {
      setModifiedPotions(prev => {
        const filtered = prev.filter(item => !(item.name === updatedItem.name && item.number === updatedItem.number));
        return [...filtered, updatedItem];
      });
    } else if (editingType === 'creature') {
      setModifiedCreatures(prev => {
        const filtered = prev.filter(item => item.name !== updatedItem.name);
        return [...filtered, updatedItem];
      });
    } else if (editingType === 'magicItem') {
      setModifiedMagicItems(prev => {
        const filtered = prev.filter(item => item.name !== updatedItem.name);
        return [...filtered, updatedItem];
      });
    }
    
    setEditingItem(null);
    setEditingType('');
  };

  const handleCancel = () => {
    setEditingItem(null);
    setEditingType('');
  };

  // Function to clear all saved changes (useful for debugging)
  const clearSavedChanges = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('modifiedIngredients');
      localStorage.removeItem('modifiedPotions');
      localStorage.removeItem('modifiedCreatures');
      localStorage.removeItem('modifiedMagicItems');
      setModifiedIngredients([]);
      setModifiedPotions([]);
      setModifiedCreatures([]);
      setModifiedMagicItems([]);
    }
  };

  const tabs = [
    { id: 'potions' as TabType, name: 'Potions', icon: BeakerIcon, count: potions.length },
    { id: 'ingredients' as TabType, name: 'Ingredients', icon: SparklesIcon, count: currentIngredients.length },
    { id: 'creatures' as TabType, name: 'Creatures', icon: FireIcon, count: currentCreatures.length },
    { id: 'magicItems' as TabType, name: 'Magic Items', icon: GiftIcon, count: currentMagicItems.length }
  ];

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <BeakerIcon className="h-8 w-8 text-emerald-400" />
          <h1 className="text-3xl font-bold text-white">Database Explorer</h1>
        </div>
        <p className="text-slate-400">Browse, filter, and edit your game data</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex justify-center">
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-1 border border-white/10">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-emerald-500 to-blue-500 text-white shadow-lg'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                <Icon className="h-5 w-5" />
                {tab.name}
                <span className="bg-slate-700 text-slate-300 px-2 py-1 rounded-full text-xs">
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
        {activeTab === 'potions' && <PotionsTab potions={potions} onEdit={handleEdit} />}
        {activeTab === 'ingredients' && <IngredientsTab ingredients={currentIngredients} onEdit={handleEdit} />}
        {activeTab === 'creatures' && <CreaturesTab creatures={currentCreatures} onEdit={handleEdit} />}
        {activeTab === 'magicItems' && <MagicItemsTab magicItems={currentMagicItems} onEdit={handleEdit} />}
      </div>

      {/* Edit Forms */}
      {editingItem && editingType === 'potion' && (
        <PotionEditForm
          potion={editingItem}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      )}
      {editingItem && editingType === 'ingredient' && (
        <IngredientEditForm
          ingredient={editingItem}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      )}
      {editingItem && editingType === 'creature' && (
        <CreatureEditForm
          creature={editingItem}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      )}
      {editingItem && editingType === 'magicItem' && (
        <MagicItemEditForm
          magicItem={editingItem}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      )}
    </div>
  );
}

function PotionsTab({ potions, onEdit }: { potions: any[]; onEdit: (item: any, type: string) => void }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRarity, setFilterRarity] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterPrice, setFilterPrice] = useState('all');

  const filteredPotions = potions.filter(potion => {
    const matchesSearch = searchTerm === '' || potion.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRarity = filterRarity === 'all' || potion.rarity === filterRarity;
    const matchesCategory = filterCategory === 'all' || potion.category === filterCategory;
    const matchesPrice = filterPrice === 'all' || potion.price.toString() === filterPrice;
    return matchesSearch && matchesRarity && matchesCategory && matchesPrice;
  });

  const rarities = [...new Set(potions.map(p => p.rarity))].sort();
  const categories = [...new Set(potions.map(p => p.category))].sort();
  const prices = ['50', '200', '2000'];

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="flex-1 min-w-64">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search potions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-emerald-400"
            />
          </div>
        </div>
        
        <select
          value={filterRarity}
          onChange={(e) => setFilterRarity(e.target.value)}
          className="px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-emerald-400"
        >
          <option value="all">All Rarities</option>
          {rarities.map(rarity => (
            <option key={rarity} value={rarity}>{rarity}</option>
          ))}
        </select>

        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-emerald-400"
        >
          <option value="all">All Categories</option>
          {categories.map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>

        <select
          value={filterPrice}
          onChange={(e) => setFilterPrice(e.target.value)}
          className="px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-emerald-400"
        >
          <option value="all">All Prices</option>
          {prices.map(price => (
            <option key={price} value={price}>{price}g</option>
          ))}
        </select>
      </div>

      {/* Results Count */}
      <div className="text-slate-400 text-sm">
        Showing {filteredPotions.length} of {potions.length} potions
      </div>

      {/* Potions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredPotions.map((potion, index) => (
          <div key={`${potion.category}-${potion.number}-${index}`} className="bg-slate-700/30 rounded-lg p-4 border border-slate-600/50 hover:border-emerald-400/50 transition-all duration-200">
            {/* Potion Image */}
            <div className="aspect-square mb-3 rounded-lg overflow-hidden bg-slate-800">
              <img 
                src={getPotionImagePath(potion.name, potion.number)} 
                alt={potion.name}
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Potion Info */}
            <div className="space-y-2">
              <div className="flex items-start justify-between">
                <h3 className="font-semibold text-white text-sm">{potion.name}</h3>
                <span className="text-xs text-slate-400">#{potion.number}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className={`text-xs px-2 py-1 rounded-full ${
                  potion.rarity === 'Common' ? 'bg-gray-500/20 text-gray-300' :
                  potion.rarity === 'Uncommon' ? 'bg-green-500/20 text-green-300' :
                  'bg-purple-500/20 text-purple-300'
                }`}>
                  {potion.rarity}
                </span>
                <span className="text-yellow-400 font-bold text-sm">💰{potion.price || 0}g</span>
              </div>
              
              <div className="text-xs text-slate-400">{potion.category}</div>
              
              <div className="flex justify-end">
                <button 
                  onClick={() => onEdit(potion, 'potion')}
                  className="p-2 text-slate-400 hover:text-emerald-400 transition-colors"
                >
                  <PencilIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredPotions.length === 0 && (
        <div className="text-center py-12">
          <BeakerIcon className="h-16 w-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-400 mb-2">No Potions Found</h3>
          <p className="text-slate-500">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  );
}

function IngredientsTab({ ingredients, onEdit }: { ingredients: any[], onEdit: (item: any, type: string) => void }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRarity, setFilterRarity] = useState('all');
  const [filterLocation, setFilterLocation] = useState('all');
  const [sortBy, setSortBy] = useState('name');

  const filteredIngredients = ingredients.filter(ingredient => {
    const matchesSearch = ingredient.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRarity = filterRarity === 'all' || ingredient.rarity === filterRarity;
    const matchesLocation = filterLocation === 'all' || ingredient.locations.some((loc: string) => 
      loc.toLowerCase().includes(filterLocation.toLowerCase())
    );
    return matchesSearch && matchesRarity && matchesLocation;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'name': return a.name.localeCompare(b.name);
      case 'price': return (b.price || 0) - (a.price || 0);
      case 'combat': return b.combat - a.combat;
      case 'utility': return b.utility - a.utility;
      case 'whimsy': return b.whimsy - a.whimsy;
      default: return 0;
    }
  });

  const rarities = [...new Set(ingredients.map(i => i.rarity))];
  const allLocations = [...new Set(ingredients.flatMap(i => i.locations))];

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="flex-1 min-w-64">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search ingredients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-emerald-400"
            />
          </div>
        </div>
        
        <select
          value={filterRarity}
          onChange={(e) => setFilterRarity(e.target.value)}
          className="px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-emerald-400"
        >
          <option value="all">All Rarities</option>
          {rarities.map(rarity => (
            <option key={rarity} value={rarity}>{rarity}</option>
          ))}
        </select>

        <select
          value={filterLocation}
          onChange={(e) => setFilterLocation(e.target.value)}
          className="px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-emerald-400"
        >
          <option value="all">All Locations</option>
          {allLocations.map(location => (
            <option key={location} value={location}>{location}</option>
          ))}
        </select>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-emerald-400"
        >
          <option value="name">Sort by Name</option>
          <option value="price">Sort by Price</option>
          <option value="combat">Sort by Combat</option>
          <option value="utility">Sort by Utility</option>
          <option value="whimsy">Sort by Whimsy</option>
        </select>
      </div>

      {/* Results Count */}
      <div className="text-slate-400 text-sm">
        Showing {filteredIngredients.length} of {ingredients.length} ingredients
      </div>

      {/* Ingredients List */}
      <div className="space-y-4">
        {filteredIngredients.map((ingredient) => (
          <div key={ingredient.name} className="bg-slate-700/30 rounded-lg p-4 border border-slate-600/50 hover:border-emerald-400/50 transition-all duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-800 flex-shrink-0">
                  <img 
                    src={getIngredientImagePath(ingredient.name)} 
                    alt={ingredient.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <div className="space-y-1">
                  <h3 className="font-semibold text-white">{ingredient.name}</h3>
                  <div className="flex items-center gap-4 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      ingredient.rarity === 'Common' ? 'bg-gray-500/20 text-gray-300' :
                      ingredient.rarity === 'Uncommon' ? 'bg-green-500/20 text-green-300' :
                      'bg-purple-500/20 text-purple-300'
                    }`}>
                      {ingredient.rarity}
                    </span>
                    <span className="text-yellow-400 font-bold">💰{ingredient.price || 0}g</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-6">
                {/* Scores */}
                <div className="flex items-center gap-4 text-sm">
                  <div className="text-center">
                    <div className="text-red-400 font-bold">{ingredient.combat}</div>
                    <div className="text-xs text-slate-400">Combat</div>
                  </div>
                  <div className="text-center">
                    <div className="text-blue-400 font-bold">{ingredient.utility}</div>
                    <div className="text-xs text-slate-400">Utility</div>
                  </div>
                  <div className="text-center">
                    <div className="text-purple-400 font-bold">{ingredient.whimsy}</div>
                    <div className="text-xs text-slate-400">Whimsy</div>
                  </div>
                </div>

                {/* Locations */}
                <div className="text-sm text-slate-400 max-w-48">
                  {ingredient.locations.slice(0, 2).join(', ')}
                  {ingredient.locations.length > 2 && ' +' + (ingredient.locations.length - 2)}
                </div>

                {/* Actions */}
                <button 
                  onClick={() => onEdit(ingredient, 'ingredient')}
                  className="p-2 text-slate-400 hover:text-emerald-400 transition-colors"
                >
                  <PencilIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredIngredients.length === 0 && (
        <div className="text-center py-12">
          <SparklesIcon className="h-16 w-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-400 mb-2">No Ingredients Found</h3>
          <p className="text-slate-500">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  );
}

function CreaturesTab({ creatures, onEdit }: { creatures: any[], onEdit: (item: any, type: string) => void }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterSize, setFilterSize] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [selectedCreature, setSelectedCreature] = useState<any>(null);

  const filteredCreatures = creatures.filter(creature => {
    const matchesSearch = creature.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || creature.type.toLowerCase().includes(filterType.toLowerCase());
    const matchesSize = filterSize === 'all' || creature.size === filterSize;
    return matchesSearch && matchesType && matchesSize;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'name': return a.name.localeCompare(b.name);
      case 'cr': return b.challenge_rating - a.challenge_rating;
      case 'ac': return b.armor_class - a.armor_class;
      default: return 0;
    }
  });

  const types = [...new Set(creatures.map(c => c.type))];
  const sizes = [...new Set(creatures.map(c => c.size))];

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="flex-1 min-w-64">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search creatures..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-emerald-400"
            />
          </div>
        </div>
        
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-emerald-400"
        >
          <option value="all">All Types</option>
          {types.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>

        <select
          value={filterSize}
          onChange={(e) => setFilterSize(e.target.value)}
          className="px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-emerald-400"
        >
          <option value="all">All Sizes</option>
          {sizes.map(size => (
            <option key={size} value={size}>{size}</option>
          ))}
        </select>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-emerald-400"
        >
          <option value="name">Sort by Name</option>
          <option value="cr">Sort by CR</option>
          <option value="ac">Sort by AC</option>
        </select>
      </div>

      {/* Results Count */}
      <div className="text-slate-400 text-sm">
        Showing {filteredCreatures.length} of {creatures.length} creatures
      </div>

      {/* Creatures Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCreatures.map((creature) => (
          <div key={creature.name} className="bg-slate-700/30 rounded-lg p-4 border border-slate-600/50 hover:border-emerald-400/50 transition-all duration-200">
            <div className="space-y-3">
              {/* Creature Image */}
              <div className="w-full h-32 bg-slate-600/30 rounded-lg flex items-center justify-center overflow-hidden">
                <img
                  src={getCreatureImagePath(creature.name)}
                  alt={creature.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const img = e.target as HTMLImageElement;
                    img.style.display = 'none';
                    const parent = img.parentElement;
                    if (parent) {
                      parent.innerHTML = '<span class="text-4xl">🐉</span>';
                    }
                  }}
                />
              </div>
              
              <div className="flex items-start justify-between">
                <h3 className="font-semibold text-white">{creature.name}</h3>
                <span className="text-xs text-slate-400 bg-slate-600/50 px-2 py-1 rounded">
                  CR {creature.challenge_rating}
                </span>
              </div>
              
              <div className="text-sm text-slate-400">
                {creature.size} {creature.type}
              </div>
              
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="text-center">
                  <div className="text-blue-400 font-bold">{creature.armor_class}</div>
                  <div className="text-xs text-slate-400">AC</div>
                </div>
                <div className="text-center">
                  <div className="text-red-400 font-bold">{creature.hit_points}</div>
                  <div className="text-xs text-slate-400">HP</div>
                </div>
                <div className="text-center">
                  <div className="text-green-400 font-bold">
                    {creature.speed.walk || creature.speed.fly || 'Varies'}
                  </div>
                  <div className="text-xs text-slate-400">Speed</div>
                </div>
              </div>
              
              <div className="flex justify-between">
                <button 
                  onClick={() => setSelectedCreature(creature)}
                  className="flex items-center gap-1 px-3 py-1 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-lg transition-colors text-sm"
                >
                  <EyeIcon className="h-3 w-3" />
                  View Details
                </button>
                <button 
                  onClick={() => onEdit(creature, 'creature')}
                  className="p-2 text-slate-400 hover:text-emerald-400 transition-colors"
                >
                  <PencilIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredCreatures.length === 0 && (
        <div className="text-center py-12">
          <FireIcon className="h-16 w-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-400 mb-2">No Creatures Found</h3>
          <p className="text-slate-500">Try adjusting your search or filters</p>
        </div>
      )}

      {/* Creature Detail Modal */}
      {selectedCreature && (
        <CreatureDetailModal 
          creature={selectedCreature} 
          onClose={() => setSelectedCreature(null)} 
        />
      )}
    </div>
  );
}

function CreatureDetailModal({ creature, onClose }: { creature: any; onClose: () => void }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!mounted) return null;

  const modalContent = (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-[9999] overflow-y-auto" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}>
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 rounded-2xl w-full max-w-4xl my-8 shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-slate-700">
          <div className="flex items-start gap-6">
            {/* Creature Image */}
            <div className="w-24 h-24 bg-slate-600/30 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0 shadow-lg">
              <img
                src={getCreatureImagePath(creature.name)}
                alt={creature.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const img = e.target as HTMLImageElement;
                  img.style.display = 'none';
                  const parent = img.parentElement;
                  if (parent) {
                    parent.innerHTML = '<span class="text-4xl">🐉</span>';
                  }
                }}
              />
            </div>
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-white mb-2">{creature.name}</h2>
              <p className="text-slate-400 text-lg">{creature.size} {creature.type}</p>
              <p className="text-slate-500 text-sm">{creature.alignment}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[calc(90vh-120px)] overflow-y-auto">
          {/* Basic Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-700/30 rounded-lg p-3 text-center">
              <div className="text-lg font-bold text-blue-400">{creature.armor_class}</div>
              <div className="text-sm text-slate-400">Armor Class</div>
            </div>
            <div className="bg-slate-700/30 rounded-lg p-3 text-center">
              <div className="text-lg font-bold text-red-400">{creature.hit_points}</div>
              <div className="text-sm text-slate-400">Hit Points</div>
            </div>
            <div className="bg-slate-700/30 rounded-lg p-3 text-center">
              <div className="text-lg font-bold text-yellow-400">CR {creature.challenge_rating}</div>
              <div className="text-sm text-slate-400">Challenge Rating</div>
            </div>
            <div className="bg-slate-700/30 rounded-lg p-3 text-center">
              <div className="text-lg font-bold text-purple-400">+{creature.proficiency_bonus}</div>
              <div className="text-sm text-slate-400">Proficiency</div>
            </div>
          </div>

          {/* Ability Scores */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">Ability Scores</h3>
            <div className="grid grid-cols-6 gap-4">
              {Object.entries(creature.ability_scores).map(([ability, score]) => (
                <div key={ability} className="bg-slate-700/30 rounded-lg p-3 text-center">
                  <div className="text-sm font-bold text-white">{ability}</div>
                  <div className="text-lg text-emerald-400">{score}</div>
                  <div className="text-xs text-slate-400">
                    ({Math.floor(((score as number) - 10) / 2) >= 0 ? '+' : ''}{Math.floor(((score as number) - 10) / 2)})
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Speed */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">Speed</h3>
            <div className="bg-slate-700/30 rounded-lg p-3">
              <div className="flex flex-wrap gap-4 text-sm">
                {Object.entries(creature.speed).map(([type, speed]) => (
                  <span key={type} className="text-green-400">
                    {type}: {speed}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Traits */}
          {creature.traits && creature.traits.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Traits</h3>
              <div className="space-y-3">
                {creature.traits.map((trait: any, index: number) => (
                  <div key={index} className="bg-slate-700/30 rounded-lg p-4">
                    <h4 className="font-semibold text-emerald-400 mb-2">{trait.name}</h4>
                    <p className="text-slate-300 text-sm leading-relaxed">{trait.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          {creature.actions && creature.actions.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Actions</h3>
              <div className="space-y-3">
                {creature.actions.map((action: any, index: number) => (
                  <div key={index} className="bg-slate-700/30 rounded-lg p-4">
                    <h4 className="font-semibold text-red-400 mb-2">{action.name}</h4>
                    <p className="text-slate-300 text-sm leading-relaxed">{action.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bonus Actions */}
          {creature.bonus_actions && creature.bonus_actions.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Bonus Actions</h3>
              <div className="space-y-3">
                {creature.bonus_actions.map((action: any, index: number) => (
                  <div key={index} className="bg-slate-700/30 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-400 mb-2">{action.name}</h4>
                    <p className="text-slate-300 text-sm leading-relaxed">{action.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reactions */}
          {creature.reactions && creature.reactions.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Reactions</h3>
              <div className="space-y-3">
                {creature.reactions.map((reaction: any, index: number) => (
                  <div key={index} className="bg-slate-700/30 rounded-lg p-4">
                    <h4 className="font-semibold text-purple-400 mb-2">{reaction.name}</h4>
                    <p className="text-slate-300 text-sm leading-relaxed">{reaction.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

function MagicItemsTab({ magicItems, onEdit }: { magicItems: any[], onEdit: (item: any, type: string) => void }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRarity, setFilterRarity] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [filterAttunement, setFilterAttunement] = useState('all');

  const filteredMagicItems = magicItems.filter(item => {
    const matchesSearch = searchTerm === '' || item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRarity = filterRarity === 'all' || item.rarity === filterRarity;
    const matchesType = filterType === 'all' || item.type === filterType;
    const matchesAttunement = filterAttunement === 'all' || 
      (filterAttunement === 'required' && item.requiresAttunement) ||
      (filterAttunement === 'not-required' && !item.requiresAttunement);
    return matchesSearch && matchesRarity && matchesType && matchesAttunement;
  });

  const rarities = [...new Set(magicItems.map(item => item.rarity))].sort();
  const types = [...new Set(magicItems.map(item => item.type))].sort();

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="flex-1 min-w-64">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search magic items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-emerald-400"
            />
          </div>
        </div>
        
        <select
          value={filterRarity}
          onChange={(e) => setFilterRarity(e.target.value)}
          className="px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-emerald-400"
        >
          <option value="all">All Rarities</option>
          {rarities.map(rarity => (
            <option key={rarity} value={rarity}>{rarity}</option>
          ))}
        </select>

        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-emerald-400"
        >
          <option value="all">All Types</option>
          {types.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>

        <select
          value={filterAttunement}
          onChange={(e) => setFilterAttunement(e.target.value)}
          className="px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-emerald-400"
        >
          <option value="all">All Items</option>
          <option value="required">Requires Attunement</option>
          <option value="not-required">No Attunement</option>
        </select>
      </div>

      {/* Results Count */}
      <div className="text-slate-400 text-sm">
        Showing {filteredMagicItems.length} of {magicItems.length} magic items
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredMagicItems.map((item) => (
          <div
            key={item.name}
            className="bg-slate-700/30 rounded-lg p-4 border border-slate-600/50 hover:border-emerald-400/50 transition-all duration-200"
          >
            {/* Magic Item Image */}
            <div className="aspect-square mb-3 rounded-lg overflow-hidden bg-slate-800">
              <img
                src={getMagicItemImagePath(item.name)}
                alt={item.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/images/magic-items/default-magic-item.svg';
                }}
              />
            </div>

            {/* Item Info */}
            <div className="space-y-2">
              <div className="flex items-start justify-between">
                <h3 className="font-semibold text-white text-sm leading-tight">{item.name}</h3>
                <button
                  onClick={() => onEdit(item, 'magicItem')}
                  className="p-1 text-slate-400 hover:text-emerald-400 transition-colors"
                  title="Edit Magic Item"
                >
                  <PencilIcon className="h-4 w-4" />
                </button>
              </div>

              <div className="text-xs text-slate-400">{item.type}</div>

              <div className="flex items-center justify-between">
                <span className={`text-xs px-2 py-1 rounded-full ${
                  item.rarity === 'Common' ? 'bg-gray-500/20 text-gray-300' :
                  item.rarity === 'Uncommon' ? 'bg-green-500/20 text-green-300' :
                  item.rarity === 'Rare' ? 'bg-blue-500/20 text-blue-300' :
                  item.rarity === 'Very Rare' ? 'bg-purple-500/20 text-purple-300' :
                  'bg-orange-500/20 text-orange-300'
                }`}>
                  {item.rarity}
                </span>
                {item.requiresAttunement && (
                  <span className="text-xs bg-red-500/20 text-red-300 px-2 py-1 rounded-full">
                    Attunement
                  </span>
                )}
              </div>

              {item.price && (
                <div className="text-xs text-emerald-400 font-semibold">
                  {item.price} gp
                </div>
              )}

              {item.effect && (
                <p className="text-xs text-slate-400 line-clamp-2">{item.effect}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredMagicItems.length === 0 && (
        <div className="text-center py-12">
          <GiftIcon className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-400">No magic items found matching your criteria.</p>
        </div>
      )}
    </div>
  );
}