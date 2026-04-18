'use client';

import { useState, useEffect } from 'react';
import { XMarkIcon, MapPinIcon } from '@heroicons/react/24/outline';
import { addLocalIngredientFile, addLocalPotionFile, addLocalCreatureFile, addLocalMagicItemFile } from '@/utils/imageMapping';
import { syncService } from '@/services/sync';
import { isTauriEnvironment } from '@/lib/storage';
import { LOCATIONS } from '@/utils/ingredientForaging';
import { regions } from '@/data/encounters';
import MentionTextarea from './MentionTextarea';
import {
  ABILITIES,
  type Ability,
  SIZE_OPTIONS,
  CREATURE_TYPE_OPTIONS,
  ALIGNMENT_OPTIONS,
  DEFAULT_ABILITY_SCORES,
  DEFAULT_SAVING_THROW_PROFICIENCIES,
  getAbilityModifier,
  formatModifier,
  type NPCFeature,
  type NPCAction,
} from '@/data/npcs';
import { CollapsibleSection, CollapsibleRow } from './CollapsibleList';

interface PotionEditFormProps {
  potion: any;
  onSave: (potion: any) => void;
  onCancel: () => void;
}

export function PotionEditForm({ potion, onSave, onCancel }: PotionEditFormProps) {
  const [formData, setFormData] = useState({
    name: potion.name || '',
    number: potion.number || 0,
    rarity: potion.rarity || 'Common',
    category: potion.category || 'Utility',
    price: potion.price || 0,
    imageUrl: potion.imageUrl || '',
    description: potion.description || ''
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      alert('Potion name is required');
      return;
    }

    // Preserve original imageUrl if no new file is selected
    let updatedPotion = { 
      ...potion, 
      ...formData,
      imageUrl: potion.imageUrl, // Preserve existing image URL (tied to ID, not name)
      id: potion.id || `potion-${formData.category || potion.category}-${formData.number || potion.number}` // Include category in ID
    };

    if (selectedFile) {
      try {
        const fileExtension = selectedFile.name.split('.').pop();
        // Use potion ID for filename to ensure persistence when name changes
        const filename = `${updatedPotion.id}.${fileExtension}`;

        const result = await syncService.uploadFile(selectedFile, 'potions', filename);

        if (!result.success) {
          throw new Error(result.error || 'Upload failed');
        }

        // In Tauri mode, use the data URL directly for display
        // In web mode, use the file path
        if (isTauriEnvironment() && result.data?.dataUrl) {
          updatedPotion.imageUrl = result.data.dataUrl;
        } else {
          updatedPotion.imageUrl = result.data?.path || `/images/potions/${filename}`;
        }

        console.log('Potion image saved as:', filename);

      } catch (error) {
        console.error('Error handling file upload:', error);
        alert('Error uploading image. Please try again.');
        return;
      }
    }

    onSave(updatedPotion);
  };

  const rarities = ['Common', 'Uncommon', 'Rare'];
  const categories = ['Combat', 'Utility', 'Whimsy'];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <h2 className="text-2xl font-bold text-white">Edit Potion</h2>
          <button
            onClick={onCancel}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Potion Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-emerald-400"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Potion Number
              </label>
              <input
                type="number"
                value={formData.number}
                onChange={(e) => setFormData(prev => ({ ...prev, number: parseInt(e.target.value) }))}
                className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-emerald-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Rarity
              </label>
              <select
                value={formData.rarity}
                onChange={(e) => setFormData(prev => ({ ...prev, rarity: e.target.value }))}
                className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-emerald-400"
              >
                {rarities.map(rarity => (
                  <option key={rarity} value={rarity}>{rarity}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-emerald-400"
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Price (Gold Flowers)
              </label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-emerald-400"
                step="0.01"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe what this potion does..."
              rows={3}
              className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-emerald-400 resize-y"
            />
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Potion Image
            </label>
            
            {/* Drag and Drop Area */}
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              className="border-2 border-dashed border-slate-600 rounded-lg p-6 text-center hover:border-emerald-400 transition-colors cursor-pointer"
            >
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                id="image-upload"
              />
              <label htmlFor="image-upload" className="cursor-pointer">
                <div className="space-y-2">
                  <div className="text-4xl">📷</div>
                  <div className="text-sm text-slate-300">
                    Drag and drop an image here, or <span className="text-emerald-400">click to browse</span>
                  </div>
                  <div className="text-xs text-slate-500">
                    Supports JPG, PNG, GIF up to 10MB
                  </div>
                </div>
              </label>
            </div>

            {/* Selected File Info */}
            {selectedFile && (
              <div className="mt-3 p-3 bg-slate-700/30 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-300">
                    📁 {selectedFile.name}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFile(null);
                      setPreviewUrl('');
                    }}
                    className="text-red-400 hover:text-red-300 text-xs"
                  >
                    Remove
                  </button>
                </div>
              </div>
            )}

            {/* Image Preview */}
            {previewUrl && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Preview
                </label>
                <div className="w-32 h-32 rounded-lg overflow-hidden bg-slate-800">
                  <img 
                    src={previewUrl} 
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-4 pt-4 border-t border-slate-700">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface IngredientEditFormProps {
  ingredient: any;
  onSave: (ingredient: any) => void;
  onCancel: () => void;
}

export function IngredientEditForm({ ingredient, onSave, onCancel }: IngredientEditFormProps) {
  const [formData, setFormData] = useState({
    name: ingredient.name || '',
    combat: ingredient.combat || 0,
    utility: ingredient.utility || 0,
    whimsy: ingredient.whimsy || 0,
    rarity: ingredient.rarity || 'Common',
    type: ingredient.type || 'Plant',
    price: ingredient.price || 0,
    locations: ingredient.locations || [],
    imageUrl: ingredient.imageUrl || ''
  });

  const [locationInput, setLocationInput] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      alert('Ingredient name is required');
      return;
    }

    let updatedIngredient = { 
      ...ingredient, 
      ...formData,
      imageUrl: ingredient.imageUrl, // Preserve existing image URL (tied to ID, not name)
      id: ingredient.id || `ingredient-${formData.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}` // Ensure ingredient has an ID
    };

    if (selectedFile) {
      try {
        const fileExtension = selectedFile.name.split('.').pop();
        // Use ingredient ID for filename to ensure persistence when name changes
        const filename = `${updatedIngredient.id}.${fileExtension}`;

        const result = await syncService.uploadFile(selectedFile, 'ingredients', filename);

        if (!result.success) {
          throw new Error(result.error || 'Upload failed');
        }

        // In Tauri mode, use the data URL directly for display
        // In web mode, use the file path
        if (isTauriEnvironment() && result.data?.dataUrl) {
          updatedIngredient.imageUrl = result.data.dataUrl;
        } else {
          updatedIngredient.imageUrl = result.data?.path || `/images/ingredients/${filename}`;
        }

        console.log('Ingredient image saved as:', filename);

      } catch (error) {
        console.error('Error handling file upload:', error);
        alert('Error uploading image. Please try again.');
        return;
      }
    }

    onSave(updatedIngredient);
  };

  const addLocation = () => {
    if (locationInput.trim() && !formData.locations.includes(locationInput.trim())) {
      setFormData(prev => ({
        ...prev,
        locations: [...prev.locations, locationInput.trim()]
      }));
      setLocationInput('');
    }
  };

  const removeLocation = (location: string) => {
    setFormData(prev => ({
      ...prev,
      locations: prev.locations.filter(loc => loc !== location)
    }));
  };

  const rarities = ['Common', 'Uncommon', 'Rare'];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <h2 className="text-2xl font-bold text-white">Edit Ingredient</h2>
          <button
            onClick={onCancel}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Ingredient Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-emerald-400"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Price (Gold Flowers)
              </label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-emerald-400"
                step="0.01"
              />
            </div>
          </div>

          {/* Scores */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-4">
              Ability Scores
            </label>
            <div className="grid grid-cols-3 gap-6">
              <div>
                <label className="block text-sm text-slate-400 mb-2">Combat</label>
                <input
                  type="number"
                  value={formData.combat}
                  onChange={(e) => setFormData(prev => ({ ...prev, combat: parseInt(e.target.value) || 0 }))}
                  className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-red-400"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-2">Utility</label>
                <input
                  type="number"
                  value={formData.utility}
                  onChange={(e) => setFormData(prev => ({ ...prev, utility: parseInt(e.target.value) || 0 }))}
                  className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-400"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-2">Whimsy</label>
                <input
                  type="number"
                  value={formData.whimsy}
                  onChange={(e) => setFormData(prev => ({ ...prev, whimsy: parseInt(e.target.value) || 0 }))}
                  className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-purple-400"
                  min="0"
                />
              </div>
            </div>
          </div>

          {/* Rarity and Type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Rarity
              </label>
              <select
                value={formData.rarity}
                onChange={(e) => setFormData(prev => ({ ...prev, rarity: e.target.value }))}
                className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-emerald-400"
              >
                {rarities.map(rarity => (
                  <option key={rarity} value={rarity}>{rarity}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Type
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-emerald-400"
              >
                <option value="Plant">Plant</option>
                <option value="Food">Food</option>
                <option value="Fish">Fish</option>
                <option value="Bug">Bug</option>
                <option value="Monster">Monster</option>
                <option value="Water">Water</option>
                <option value="Other">Other</option>
                <option value="Salvage">Salvage</option>
              </select>
            </div>
          </div>

          {/* Locations */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Locations
            </label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={locationInput}
                onChange={(e) => setLocationInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addLocation())}
                className="flex-1 px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-emerald-400"
                placeholder="Add location..."
              />
              <button
                type="button"
                onClick={addLocation}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
              >
                Add
              </button>
            </div>
            
            {formData.locations.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.locations.map((location, index) => (
                  <span
                    key={index}
                    className="bg-slate-600/50 text-slate-300 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                  >
                    {location}
                    <button
                      type="button"
                      onClick={() => removeLocation(location)}
                      className="text-slate-400 hover:text-red-400 transition-colors"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Ingredient Image
            </label>
            
            {/* Drag and Drop Area */}
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              className="border-2 border-dashed border-slate-600 rounded-lg p-6 text-center hover:border-emerald-400 transition-colors cursor-pointer"
            >
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                id="ingredient-image-upload"
              />
              <label htmlFor="ingredient-image-upload" className="cursor-pointer">
                <div className="space-y-2">
                  <div className="text-4xl">🌿</div>
                  <div className="text-sm text-slate-300">
                    Drag and drop an image here, or <span className="text-emerald-400">click to browse</span>
                  </div>
                  <div className="text-xs text-slate-500">
                    Supports JPG, PNG, GIF up to 10MB
                  </div>
                </div>
              </label>
            </div>

            {/* Selected File Info */}
            {selectedFile && (
              <div className="mt-3 p-3 bg-slate-700/30 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-300">
                    📁 {selectedFile.name}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFile(null);
                      setPreviewUrl('');
                    }}
                    className="text-red-400 hover:text-red-300 text-xs"
                  >
                    Remove
                  </button>
                </div>
              </div>
            )}

            {/* Image Preview */}
            {previewUrl && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Preview
                </label>
                <div className="w-32 h-32 rounded-lg overflow-hidden bg-slate-800">
                  <img 
                    src={previewUrl} 
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-4 pt-4 border-t border-slate-700">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface CreatureEditFormProps {
  creature: any;
  onSave: (creature: any) => void;
  onCancel: () => void;
}

export function CreatureEditForm({ creature, onSave, onCancel }: CreatureEditFormProps) {
  const [formData, setFormData] = useState({
    name: creature.name || '',
    size: creature.size || 'Medium',
    type: creature.type || 'Beast',
    alignment: creature.alignment || 'Neutral',
    armor_class: creature.armor_class || 10,
    hit_points: creature.hit_points || '1d8',
    challenge_rating: creature.challenge_rating || 0,
    proficiency_bonus: creature.proficiency_bonus || 2,
    ability_scores: {
      STR: creature.ability_scores?.STR || 10,
      DEX: creature.ability_scores?.DEX || 10,
      CON: creature.ability_scores?.CON || 10,
      INT: creature.ability_scores?.INT || 10,
      WIS: creature.ability_scores?.WIS || 10,
      CHA: creature.ability_scores?.CHA || 10
    },
    speed: {
      walk: creature.speed?.walk || '30 ft.',
      fly: creature.speed?.fly || '',
      swim: creature.speed?.swim || '',
      climb: creature.speed?.climb || '',
      burrow: creature.speed?.burrow || ''
    },
    traits: creature.traits || [],
    actions: creature.actions || [],
    bonus_actions: creature.bonus_actions || [],
    reactions: creature.reactions || [],
    legendary_actions: creature.legendary_actions || [],
    tags: creature.tags || [],
    location: creature.location || '',
    habitat: creature.habitat || '',
    info: creature.info || ''
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [currentTagInput, setCurrentTagInput] = useState('');

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  // Trait helpers
  const addTrait = () => {
    setFormData(prev => ({
      ...prev,
      traits: [...prev.traits, { name: '', description: '' }]
    }));
  };

  const updateTrait = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      traits: prev.traits.map((trait: any, i: number) =>
        i === index ? { ...trait, [field]: value } : trait
      )
    }));
  };

  const removeTrait = (index: number) => {
    setFormData(prev => ({
      ...prev,
      traits: prev.traits.filter((_: any, i: number) => i !== index)
    }));
  };

  // Action helpers
  const addAction = () => {
    setFormData(prev => ({
      ...prev,
      actions: [...prev.actions, { name: '', description: '' }]
    }));
  };

  const updateAction = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      actions: prev.actions.map((action: any, i: number) =>
        i === index ? { ...action, [field]: value } : action
      )
    }));
  };

  const removeAction = (index: number) => {
    setFormData(prev => ({
      ...prev,
      actions: prev.actions.filter((_: any, i: number) => i !== index)
    }));
  };

  // Bonus Action helpers
  const addBonusAction = () => {
    setFormData(prev => ({
      ...prev,
      bonus_actions: [...prev.bonus_actions, { name: '', description: '' }]
    }));
  };

  const updateBonusAction = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      bonus_actions: prev.bonus_actions.map((action: any, i: number) =>
        i === index ? { ...action, [field]: value } : action
      )
    }));
  };

  const removeBonusAction = (index: number) => {
    setFormData(prev => ({
      ...prev,
      bonus_actions: prev.bonus_actions.filter((_: any, i: number) => i !== index)
    }));
  };

  // Reaction helpers
  const addReaction = () => {
    setFormData(prev => ({
      ...prev,
      reactions: [...prev.reactions, { name: '', description: '' }]
    }));
  };

  const updateReaction = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      reactions: prev.reactions.map((reaction: any, i: number) =>
        i === index ? { ...reaction, [field]: value } : reaction
      )
    }));
  };

  const removeReaction = (index: number) => {
    setFormData(prev => ({
      ...prev,
      reactions: prev.reactions.filter((_: any, i: number) => i !== index)
    }));
  };

  // Legendary Action helpers
  const addLegendaryAction = () => {
    setFormData(prev => ({
      ...prev,
      legendary_actions: [...prev.legendary_actions, { name: '', description: '' }]
    }));
  };

  const updateLegendaryAction = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      legendary_actions: prev.legendary_actions.map((action: any, i: number) =>
        i === index ? { ...action, [field]: value } : action
      )
    }));
  };

  const removeLegendaryAction = (index: number) => {
    setFormData(prev => ({
      ...prev,
      legendary_actions: prev.legendary_actions.filter((_: any, i: number) => i !== index)
    }));
  };

  // Tag helpers
  const addTag = () => {
    if (currentTagInput.trim() && !formData.tags.includes(currentTagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, currentTagInput.trim()]
      }));
      setCurrentTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter((tag: string) => tag !== tagToRemove)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert('Creature name is required');
      return;
    }

    let updatedCreature = { ...creature, ...formData };

    if (selectedFile) {
      try {
        const fileExtension = selectedFile.name.split('.').pop();
        const filename = `${formData.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}.${fileExtension}`;

        const result = await syncService.uploadFile(selectedFile, 'creatures', filename);

        if (!result.success) {
          throw new Error(result.error || 'Upload failed');
        }

        // In Tauri mode, use the data URL directly for display
        // In web mode, use the file path
        if (isTauriEnvironment() && result.data?.dataUrl) {
          updatedCreature.imageUrl = result.data.dataUrl;
        } else {
          updatedCreature.imageUrl = result.data?.path || `/images/creatures/${filename}`;
        }

        // Register the file with the image mapping system
        addLocalCreatureFile(formData.name, fileExtension || 'jpg');

        console.log('Creature image saved as:', filename);

      } catch (error) {
        console.error('Error handling file upload:', error);
        alert('Error uploading image. Please try again.');
        return;
      }
    }

    // Clean up empty speed values
    const cleanedSpeed = Object.fromEntries(
      Object.entries(formData.speed).filter(([_, value]) => value.trim() !== '')
    );
    updatedCreature.speed = cleanedSpeed;

    // Clean up empty traits and actions (filter out entries with no name)
    updatedCreature.traits = formData.traits.filter((t: any) => t.name.trim() !== '');
    updatedCreature.actions = formData.actions.filter((a: any) => a.name.trim() !== '');
    updatedCreature.bonus_actions = formData.bonus_actions.filter((a: any) => a.name.trim() !== '');
    updatedCreature.reactions = formData.reactions.filter((r: any) => r.name.trim() !== '');
    updatedCreature.legendary_actions = formData.legendary_actions.filter((a: any) => a.name.trim() !== '');

    onSave(updatedCreature);
  };

  const sizes = ['Tiny', 'Small', 'Medium', 'Large', 'Huge', 'Gargantuan'];
  const types = ['Beast', 'Monstrosity', 'Spirit', 'Undead', 'Fiend', 'Humanoid', 'Dragon', 'Fey'];
  const alignments = ['Lawful Good', 'Neutral Good', 'Chaotic Good', 'Lawful Neutral', 'Neutral', 'Chaotic Neutral', 'Lawful Evil', 'Neutral Evil', 'Chaotic Evil', 'Unaligned'];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <h2 className="text-2xl font-bold text-white">Edit Creature</h2>
          <button
            onClick={onCancel}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Creature Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-emerald-400"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Size
              </label>
              <select
                value={formData.size}
                onChange={(e) => setFormData(prev => ({ ...prev, size: e.target.value }))}
                className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-emerald-400"
              >
                {sizes.map(size => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Type
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-emerald-400"
              >
                {types.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Alignment
              </label>
              <select
                value={formData.alignment}
                onChange={(e) => setFormData(prev => ({ ...prev, alignment: e.target.value }))}
                className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-emerald-400"
              >
                {alignments.map(alignment => (
                  <option key={alignment} value={alignment}>{alignment}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Combat Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Armor Class
              </label>
              <input
                type="number"
                value={formData.armor_class}
                onChange={(e) => setFormData(prev => ({ ...prev, armor_class: parseInt(e.target.value) || 10 }))}
                className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-400"
                min="1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Hit Points
              </label>
              <input
                type="text"
                value={formData.hit_points}
                onChange={(e) => setFormData(prev => ({ ...prev, hit_points: e.target.value }))}
                className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-red-400"
                placeholder="e.g., 45 (10d8)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Challenge Rating
              </label>
              <input
                type="number"
                value={formData.challenge_rating}
                onChange={(e) => setFormData(prev => ({ ...prev, challenge_rating: parseFloat(e.target.value) || 0 }))}
                className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-yellow-400"
                min="0"
                step="0.125"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Proficiency Bonus
              </label>
              <input
                type="number"
                value={formData.proficiency_bonus}
                onChange={(e) => setFormData(prev => ({ ...prev, proficiency_bonus: parseInt(e.target.value) || 2 }))}
                className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-purple-400"
                min="2"
              />
            </div>
          </div>

          {/* Ability Scores */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-4">
              Ability Scores
            </label>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
              {Object.entries(formData.ability_scores).map(([ability, score]) => (
                <div key={ability}>
                  <label className="block text-sm text-slate-400 mb-2">{ability}</label>
                  <input
                    type="number"
                    value={score}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      ability_scores: {
                        ...prev.ability_scores,
                        [ability]: parseInt(e.target.value) || 10
                      }
                    }))}
                    className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white text-center focus:outline-none focus:border-emerald-400"
                    min="1"
                    max="30"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Speed */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-4">
              Speed
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {Object.entries(formData.speed).map(([speedType, value]) => (
                <div key={speedType}>
                  <label className="block text-sm text-slate-400 mb-2 capitalize">{speedType}</label>
                  <input
                    type="text"
                    value={value}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      speed: {
                        ...prev.speed,
                        [speedType]: e.target.value
                      }
                    }))}
                    className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-green-400"
                    placeholder="e.g., 30 ft."
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Creature Image
            </label>
            
            {/* Drag and Drop Area */}
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              className="border-2 border-dashed border-slate-600 rounded-lg p-6 text-center hover:border-emerald-400 transition-colors cursor-pointer"
            >
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                id="creature-image-upload"
              />
              <label htmlFor="creature-image-upload" className="cursor-pointer">
                <div className="space-y-2">
                  <div className="text-4xl">🐉</div>
                  <div className="text-sm text-slate-300">
                    Drag and drop an image here, or <span className="text-emerald-400">click to browse</span>
                  </div>
                  <div className="text-xs text-slate-500">
                    Supports JPG, PNG, GIF up to 10MB
                  </div>
                </div>
              </label>
            </div>

            {/* Selected File Info */}
            {selectedFile && (
              <div className="mt-3 p-3 bg-slate-700/30 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-300">
                    📁 {selectedFile.name}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFile(null);
                      setPreviewUrl('');
                    }}
                    className="text-red-400 hover:text-red-300 text-xs"
                  >
                    Remove
                  </button>
                </div>
              </div>
            )}

            {/* Image Preview */}
            {previewUrl && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Preview
                </label>
                <div className="w-32 h-32 rounded-lg overflow-hidden bg-slate-800">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Traits Section */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-slate-300">
                Traits
              </label>
              <button
                type="button"
                onClick={addTrait}
                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-sm rounded transition-colors"
              >
                Add Trait
              </button>
            </div>
            <div className="space-y-3">
              {formData.traits.map((trait: any, index: number) => (
                <div key={index} className="bg-slate-700/30 rounded-lg p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Trait Name"
                      value={trait.name}
                      onChange={(e) => updateTrait(index, 'name', e.target.value)}
                      className="flex-1 px-3 py-2 bg-slate-700/50 border border-slate-600 rounded text-white placeholder-slate-400 focus:outline-none focus:border-emerald-400"
                    />
                    <button
                      type="button"
                      onClick={() => removeTrait(index)}
                      className="px-2 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  </div>
                  <textarea
                    placeholder="Trait Description"
                    value={trait.description}
                    onChange={(e) => updateTrait(index, 'description', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded text-white placeholder-slate-400 focus:outline-none focus:border-emerald-400 resize-none"
                    rows={2}
                  />
                </div>
              ))}
              {formData.traits.length === 0 && (
                <p className="text-sm text-slate-500 italic">No traits added yet. Click "Add Trait" to add one.</p>
              )}
            </div>
          </div>

          {/* Actions Section */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-slate-300">
                Actions
              </label>
              <button
                type="button"
                onClick={addAction}
                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors"
              >
                Add Action
              </button>
            </div>
            <div className="space-y-3">
              {formData.actions.map((action: any, index: number) => (
                <div key={index} className="bg-slate-700/30 rounded-lg p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Action Name"
                      value={action.name}
                      onChange={(e) => updateAction(index, 'name', e.target.value)}
                      className="flex-1 px-3 py-2 bg-slate-700/50 border border-slate-600 rounded text-white placeholder-slate-400 focus:outline-none focus:border-blue-400"
                    />
                    <button
                      type="button"
                      onClick={() => removeAction(index)}
                      className="px-2 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  </div>
                  <textarea
                    placeholder="Action Description"
                    value={action.description}
                    onChange={(e) => updateAction(index, 'description', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded text-white placeholder-slate-400 focus:outline-none focus:border-blue-400 resize-none"
                    rows={2}
                  />
                </div>
              ))}
              {formData.actions.length === 0 && (
                <p className="text-sm text-slate-500 italic">No actions added yet. Click "Add Action" to add one.</p>
              )}
            </div>
          </div>

          {/* Bonus Actions Section */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-slate-300">
                Bonus Actions
              </label>
              <button
                type="button"
                onClick={addBonusAction}
                className="px-3 py-1 bg-yellow-600 hover:bg-yellow-700 text-white text-sm rounded transition-colors"
              >
                Add Bonus Action
              </button>
            </div>
            <div className="space-y-3">
              {formData.bonus_actions.map((action: any, index: number) => (
                <div key={index} className="bg-slate-700/30 rounded-lg p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Bonus Action Name"
                      value={action.name}
                      onChange={(e) => updateBonusAction(index, 'name', e.target.value)}
                      className="flex-1 px-3 py-2 bg-slate-700/50 border border-slate-600 rounded text-white placeholder-slate-400 focus:outline-none focus:border-yellow-400"
                    />
                    <button
                      type="button"
                      onClick={() => removeBonusAction(index)}
                      className="px-2 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  </div>
                  <textarea
                    placeholder="Bonus Action Description"
                    value={action.description}
                    onChange={(e) => updateBonusAction(index, 'description', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded text-white placeholder-slate-400 focus:outline-none focus:border-yellow-400 resize-none"
                    rows={2}
                  />
                </div>
              ))}
              {formData.bonus_actions.length === 0 && (
                <p className="text-sm text-slate-500 italic">No bonus actions added yet. Click "Add Bonus Action" to add one.</p>
              )}
            </div>
          </div>

          {/* Reactions Section */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-slate-300">
                Reactions
              </label>
              <button
                type="button"
                onClick={addReaction}
                className="px-3 py-1 bg-orange-600 hover:bg-orange-700 text-white text-sm rounded transition-colors"
              >
                Add Reaction
              </button>
            </div>
            <div className="space-y-3">
              {formData.reactions.map((reaction: any, index: number) => (
                <div key={index} className="bg-slate-700/30 rounded-lg p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Reaction Name"
                      value={reaction.name}
                      onChange={(e) => updateReaction(index, 'name', e.target.value)}
                      className="flex-1 px-3 py-2 bg-slate-700/50 border border-slate-600 rounded text-white placeholder-slate-400 focus:outline-none focus:border-orange-400"
                    />
                    <button
                      type="button"
                      onClick={() => removeReaction(index)}
                      className="px-2 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  </div>
                  <textarea
                    placeholder="Reaction Description"
                    value={reaction.description}
                    onChange={(e) => updateReaction(index, 'description', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded text-white placeholder-slate-400 focus:outline-none focus:border-orange-400 resize-none"
                    rows={2}
                  />
                </div>
              ))}
              {formData.reactions.length === 0 && (
                <p className="text-sm text-slate-500 italic">No reactions added yet. Click "Add Reaction" to add one.</p>
              )}
            </div>
          </div>

          {/* Legendary Actions Section */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-slate-300">
                Legendary Actions
              </label>
              <button
                type="button"
                onClick={addLegendaryAction}
                className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded transition-colors"
              >
                Add Legendary Action
              </button>
            </div>
            <div className="space-y-3">
              {formData.legendary_actions.map((action: any, index: number) => (
                <div key={index} className="bg-slate-700/30 rounded-lg p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Legendary Action Name"
                      value={action.name}
                      onChange={(e) => updateLegendaryAction(index, 'name', e.target.value)}
                      className="flex-1 px-3 py-2 bg-slate-700/50 border border-slate-600 rounded text-white placeholder-slate-400 focus:outline-none focus:border-purple-400"
                    />
                    <button
                      type="button"
                      onClick={() => removeLegendaryAction(index)}
                      className="px-2 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  </div>
                  <textarea
                    placeholder="Legendary Action Description"
                    value={action.description}
                    onChange={(e) => updateLegendaryAction(index, 'description', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded text-white placeholder-slate-400 focus:outline-none focus:border-purple-400 resize-none"
                    rows={2}
                  />
                </div>
              ))}
              {formData.legendary_actions.length === 0 && (
                <p className="text-sm text-slate-500 italic">No legendary actions added yet. Click "Add Legendary Action" to add one.</p>
              )}
            </div>
          </div>

          {/* Location Dropdown */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Location
            </label>
            <select
              value={formData.location}
              onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
              className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-emerald-400"
            >
              <option value="">Select a location...</option>
              {LOCATIONS.map(location => (
                <option key={location} value={location}>{location}</option>
              ))}
            </select>
          </div>

          {/* Tags Section */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Tags
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={currentTagInput}
                onChange={(e) => setCurrentTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                className="flex-1 px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-emerald-400"
                placeholder="Add a tag..."
              />
              <button
                type="button"
                onClick={addTag}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
              >
                Add
              </button>
            </div>
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag: string, index: number) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 bg-slate-600 text-slate-200 px-3 py-1 rounded-full text-sm"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="hover:text-red-400 transition-colors"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Habitat Field */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Habitat
            </label>
            <input
              type="text"
              value={formData.habitat}
              onChange={(e) => setFormData(prev => ({ ...prev, habitat: e.target.value }))}
              className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-emerald-400"
              placeholder="e.g., Forests, Mountains, Swamps..."
            />
          </div>

          {/* Info Text Area */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Additional Info
            </label>
            <textarea
              value={formData.info}
              onChange={(e) => setFormData(prev => ({ ...prev, info: e.target.value }))}
              className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-emerald-400 resize-none"
              placeholder="Additional notes, lore, or details about this creature..."
              rows={4}
            />
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-4 pt-4 border-t border-slate-700">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface MagicItemEditFormProps {
  magicItem: any;
  onSave: (magicItem: any) => void;
  onCancel: () => void;
}

export function MagicItemEditForm({ magicItem, onSave, onCancel }: MagicItemEditFormProps) {
  const [formData, setFormData] = useState({
    name: magicItem.name || '',
    type: magicItem.type || '',
    rarity: magicItem.rarity || 'Common',
    requiresAttunement: magicItem.requiresAttunement || false,
    effect: magicItem.effect || '',
    charges: magicItem.charges || '',
    activation: magicItem.activation || '',
    locationFound: magicItem.locationFound || '',
    flavorText: magicItem.flavorText || '',
    price: magicItem.price || 0,
    imageUrl: magicItem.imageUrl || ''
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
               type === 'number' ? parseFloat(value) || 0 : value
    }));
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      alert('Magic item name is required');
      return;
    }

    let updatedMagicItem = { 
      ...magicItem, 
      ...formData,
      id: magicItem.id || `magic-item-${formData.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}` // Preserve original ID, only generate if missing
    };

    if (selectedFile) {
      try {
        const fileExtension = selectedFile.name.split('.').pop();
        const filename = `${formData.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}.${fileExtension}`;

        const result = await syncService.uploadFile(selectedFile, 'magic-items', filename);

        if (!result.success) {
          throw new Error(result.error || 'Upload failed');
        }

        // In Tauri mode, use the data URL directly for display
        // In web mode, use the file path
        if (isTauriEnvironment() && result.data?.dataUrl) {
          updatedMagicItem.imageUrl = result.data.dataUrl;
        } else {
          updatedMagicItem.imageUrl = result.data?.path || `/images/magic-items/${filename}`;
        }

        // Register the file with the image mapping system
        addLocalMagicItemFile(formData.name, fileExtension || 'jpg');

        console.log('Magic item image saved as:', filename);

      } catch (error) {
        console.error('Error handling file upload:', error);
        alert('Error uploading image. Please try again.');
        return;
      }
    }

    onSave(updatedMagicItem);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-white/10 p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Edit Magic Item</h2>
          <button
            onClick={onCancel}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-emerald-400"
                required
              />
            </div>

            {/* Type */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Type
              </label>
              <input
                type="text"
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-emerald-400"
                required
              />
            </div>

            {/* Rarity */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Rarity
              </label>
              <select
                name="rarity"
                value={formData.rarity}
                onChange={handleInputChange}
                className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-emerald-400"
              >
                <option value="Common">Common</option>
                <option value="Uncommon">Uncommon</option>
                <option value="Rare">Rare</option>
                <option value="Very Rare">Very Rare</option>
                <option value="Legendary">Legendary</option>
              </select>
            </div>

            {/* Requires Attunement */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Requires Attunement
              </label>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="requiresAttunement"
                  checked={formData.requiresAttunement}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-emerald-600 bg-slate-700 border-slate-600 rounded focus:ring-emerald-500 focus:ring-2"
                />
                <span className="ml-2 text-slate-300">Yes</span>
              </div>
            </div>

            {/* Charges */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Charges
              </label>
              <input
                type="text"
                name="charges"
                value={formData.charges}
                onChange={handleInputChange}
                className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-emerald-400"
                placeholder="e.g., 3 charges per day"
              />
            </div>

            {/* Activation */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Activation
              </label>
              <input
                type="text"
                name="activation"
                value={formData.activation}
                onChange={handleInputChange}
                className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-emerald-400"
                placeholder="e.g., Action, Bonus Action"
              />
            </div>

            {/* Price */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Price (Gold Flowers)
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-emerald-400"
                min="0"
                step="1"
                placeholder="0"
              />
            </div>
          </div>

          {/* Location Found */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Location Found
            </label>
            <input
              type="text"
              name="locationFound"
              value={formData.locationFound}
              onChange={handleInputChange}
              className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-emerald-400"
              placeholder="Where this item can be found"
            />
          </div>

          {/* Effect */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Effect
            </label>
            <textarea
              name="effect"
              value={formData.effect}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-emerald-400"
              placeholder="Describe the magical effect of this item"
            ></textarea>
          </div>

          {/* Flavor Text */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Flavor Text
            </label>
            <textarea
              name="flavorText"
              value={formData.flavorText}
              onChange={handleInputChange}
              rows={2}
              className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-emerald-400"
              placeholder="Atmospheric description or lore"
            ></textarea>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Magic Item Image
            </label>
            <div
              className="border-2 border-dashed border-slate-600 rounded-lg p-6 text-center hover:border-slate-500 transition-colors"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            >
              {previewUrl ? (
                <div className="space-y-4">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="mx-auto max-h-32 rounded-lg"
                  />
                  <p className="text-sm text-slate-400">New image selected</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="text-4xl text-slate-500">🎯</div>
                  <div>
                    <p className="text-slate-300 mb-2">Drag and drop an image here, or</p>
                    <label className="inline-block px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg cursor-pointer transition-colors">
                      Choose File
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <p className="text-xs text-slate-500">PNG, JPG, WebP up to 10MB</p>
                </div>
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-4 pt-6 border-t border-slate-700">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function NPCEditForm({ npc, onSave, onCancel }: { npc: any; onSave: (npc: any) => void; onCancel: () => void }) {
  const [editedNPC, setEditedNPC] = useState({
    ...npc,
    size: npc.size || 'Medium',
    ability_scores: { ...DEFAULT_ABILITY_SCORES, ...(npc.ability_scores || {}) },
    saving_throw_proficiencies: {
      ...DEFAULT_SAVING_THROW_PROFICIENCIES,
      ...(npc.saving_throw_proficiencies || {}),
    },
    proficiency_bonus: npc.proficiency_bonus ?? 2,
  });
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentTagInput, setCurrentTagInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(editedNPC);
  };

  const updateAbilityScore = (ability: Ability, raw: string) => {
    const parsed = parseInt(raw, 10);
    const value = Number.isNaN(parsed) ? 0 : parsed;
    setEditedNPC((prev: any) => ({
      ...prev,
      ability_scores: { ...prev.ability_scores, [ability]: value },
    }));
  };

  const toggleSavingThrowProficiency = (ability: Ability) => {
    setEditedNPC((prev: any) => ({
      ...prev,
      saving_throw_proficiencies: {
        ...prev.saving_throw_proficiencies,
        [ability]: !prev.saving_throw_proficiencies?.[ability],
      },
    }));
  };

  const savingThrowBonus = (ability: Ability): number => {
    const mod = getAbilityModifier(editedNPC.ability_scores?.[ability] ?? 10);
    const prof = editedNPC.saving_throw_proficiencies?.[ability] ? (editedNPC.proficiency_bonus ?? 2) : 0;
    return mod + prof;
  };

  const addFeature = () => {
    setEditedNPC((prev: any) => ({
      ...prev,
      features: [...(prev.features || []), { name: '', description: '' }],
    }));
  };

  const updateFeature = (index: number, patch: Partial<NPCFeature>) => {
    setEditedNPC((prev: any) => ({
      ...prev,
      features: (prev.features || []).map((f: NPCFeature, i: number) =>
        i === index ? { ...f, ...patch } : f
      ),
    }));
  };

  const removeFeature = (index: number) => {
    setEditedNPC((prev: any) => ({
      ...prev,
      features: (prev.features || []).filter((_: NPCFeature, i: number) => i !== index),
    }));
  };

  const addAction = () => {
    setEditedNPC((prev: any) => ({
      ...prev,
      actions: [...(prev.actions || []), { name: '', description: '' }],
    }));
  };

  const updateAction = (index: number, patch: Partial<NPCAction>) => {
    setEditedNPC((prev: any) => ({
      ...prev,
      actions: (prev.actions || []).map((a: NPCAction, i: number) =>
        i === index ? { ...a, ...patch } : a
      ),
    }));
  };

  const removeAction = (index: number) => {
    setEditedNPC((prev: any) => ({
      ...prev,
      actions: (prev.actions || []).filter((_: NPCAction, i: number) => i !== index),
    }));
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    // Generate unique filename
    const timestamp = Date.now();
    const fileExt = file.name.split('.').pop() || 'jpg';
    const filename = `npc-${timestamp}.${fileExt}`;

    try {
      const result = await syncService.uploadFile(file, 'npcs', filename);

      if (!result.success) {
        throw new Error(result.error || 'Upload failed');
      }

      // In Tauri mode, use the data URL directly for display
      // In web mode, use the file path
      if (isTauriEnvironment() && result.data?.dataUrl) {
        setEditedNPC((prev: any) => ({
          ...prev,
          portrait: result.data.dataUrl
        }));
      } else {
        setEditedNPC((prev: any) => ({
          ...prev,
          portrait: result.data?.path
        }));
      }
      
      setUploadProgress(100);
    } catch (error: any) {
      console.error('Error uploading file:', error);
      alert(error.message || 'Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  };

  const addTag = () => {
    if (currentTagInput.trim() && !editedNPC.tags?.includes(currentTagInput.trim())) {
      setEditedNPC((prev: any) => ({
        ...prev,
        tags: [...(prev.tags || []), currentTagInput.trim()]
      }));
      setCurrentTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setEditedNPC((prev: any) => ({
      ...prev,
      tags: prev.tags?.filter((tag: string) => tag !== tagToRemove) || []
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-2 sm:p-4" onClick={onCancel}>
      <div className="bg-slate-800 rounded-xl w-full max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="p-4 sm:p-6 border-b border-slate-700 flex-shrink-0">
          <h2 className="text-xl sm:text-2xl font-bold text-white">
            {npc.id ? 'Edit NPC' : 'Create New NPC'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="p-4 sm:p-6 space-y-6 overflow-y-auto flex-1">
            {/* Portrait Upload */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Portrait</label>
              <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
                {editedNPC.portrait && (
                  <div className="aspect-square w-24 sm:w-32 rounded-lg overflow-hidden bg-slate-700 flex-shrink-0">
                    <img
                      src={editedNPC.portrait}
                      alt={editedNPC.name || 'NPC'}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="w-full sm:flex-1">
                  <label className="block">
                    <div className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg cursor-pointer text-center transition-colors">
                      {editedNPC.portrait ? 'Change Portrait' : 'Upload Portrait'}
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                      disabled={isUploading}
                    />
                  </label>
                  {isUploading && (
                    <div className="mt-2">
                      <div className="bg-slate-700 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-emerald-500 h-full transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Name</label>
                <input
                  type="text"
                  value={editedNPC.name || ''}
                  onChange={(e) => setEditedNPC({ ...editedNPC, name: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-emerald-400"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Pronouns</label>
                <input
                  type="text"
                  value={editedNPC.pronouns || ''}
                  onChange={(e) => setEditedNPC({ ...editedNPC, pronouns: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-emerald-400"
                  placeholder="e.g., she/her, they/them"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Race</label>
                <input
                  type="text"
                  value={editedNPC.race || ''}
                  onChange={(e) => setEditedNPC({ ...editedNPC, race: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-emerald-400"
                  placeholder="e.g., Human, Elf, Dwarf"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Class</label>
                <input
                  type="text"
                  value={editedNPC.class || ''}
                  onChange={(e) => setEditedNPC({ ...editedNPC, class: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-emerald-400"
                  placeholder="e.g., Fighter, Wizard"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Occupation</label>
                <input
                  type="text"
                  value={editedNPC.occupation || ''}
                  onChange={(e) => setEditedNPC({ ...editedNPC, occupation: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-emerald-400"
                  placeholder="e.g., Merchant, Guard, Scholar"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Alignment</label>
                <select
                  value={editedNPC.alignment || ''}
                  onChange={(e) => setEditedNPC({ ...editedNPC, alignment: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-emerald-400"
                >
                  <option value="">Select alignment...</option>
                  {ALIGNMENT_OPTIONS.map(a => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Size / Creature Type */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Size</label>
                <select
                  value={editedNPC.size || 'Medium'}
                  onChange={(e) => setEditedNPC({ ...editedNPC, size: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-emerald-400"
                >
                  {SIZE_OPTIONS.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Creature Type</label>
                <select
                  value={editedNPC.creature_type || ''}
                  onChange={(e) => setEditedNPC({ ...editedNPC, creature_type: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-emerald-400"
                >
                  <option value="">Select type...</option>
                  {CREATURE_TYPE_OPTIONS.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Subtype</label>
                <input
                  type="text"
                  value={editedNPC.creature_subtype || ''}
                  onChange={(e) => setEditedNPC({ ...editedNPC, creature_subtype: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-emerald-400"
                  placeholder="e.g., Human, Elf"
                />
              </div>
            </div>

            {/* Ability Scores */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-slate-300">Ability Scores</label>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span>Proficiency Bonus</span>
                  <input
                    type="number"
                    value={editedNPC.proficiency_bonus ?? 2}
                    onChange={(e) => setEditedNPC({ ...editedNPC, proficiency_bonus: parseInt(e.target.value, 10) || 0 })}
                    className="w-14 px-2 py-1 bg-slate-700/50 border border-slate-600 rounded text-white text-center focus:outline-none focus:border-emerald-400"
                  />
                </div>
              </div>
              <div className="rounded-lg border border-slate-600 bg-slate-900/40 overflow-hidden">
                <div className="grid grid-cols-6 divide-x divide-slate-700">
                  {ABILITIES.map((ability) => {
                    const score = editedNPC.ability_scores?.[ability] ?? 10;
                    const mod = getAbilityModifier(score);
                    return (
                      <div key={ability} className="flex flex-col items-center py-3 px-1 bg-slate-800/40">
                        <span className="text-[10px] sm:text-xs font-bold tracking-wider text-amber-400/90 uppercase">{ability}</span>
                        <span className="text-lg sm:text-xl font-bold text-white mt-1">{formatModifier(mod)}</span>
                        <input
                          type="number"
                          value={score}
                          onChange={(e) => updateAbilityScore(ability, e.target.value)}
                          className="w-12 mt-1 px-1 py-0.5 bg-slate-700/60 border border-slate-600 rounded text-white text-center text-sm focus:outline-none focus:border-emerald-400"
                        />
                      </div>
                    );
                  })}
                </div>
                <div className="grid grid-cols-6 divide-x divide-slate-700 border-t border-slate-700">
                  {ABILITIES.map((ability) => {
                    const proficient = !!editedNPC.saving_throw_proficiencies?.[ability];
                    const bonus = savingThrowBonus(ability);
                    return (
                      <button
                        type="button"
                        key={`save-${ability}`}
                        onClick={() => toggleSavingThrowProficiency(ability)}
                        className="flex items-center justify-center gap-1.5 py-2 bg-slate-800/20 hover:bg-slate-700/40 transition-colors"
                        title={`${ability} saving throw — ${proficient ? 'proficient' : 'not proficient'}`}
                      >
                        <span
                          className={`w-3 h-3 rounded-full border ${
                            proficient ? 'bg-amber-400 border-amber-300' : 'border-slate-500 bg-transparent'
                          }`}
                        />
                        <span className="text-sm text-slate-200">{formatModifier(bonus)}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
              <p className="mt-1 text-xs text-slate-500">Click a dot to toggle saving throw proficiency.</p>
            </div>

            {/* Physical Description */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Physical Description</label>
              <textarea
                value={editedNPC.physical_description || ''}
                onChange={(e) => setEditedNPC({ ...editedNPC, physical_description: e.target.value })}
                rows={3}
                className="w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-emerald-400"
                placeholder="Appearance, height, build, distinctive features..."
              />
            </div>

            {/* Personality Traits */}
            <div className="space-y-3 rounded-lg border border-slate-700 bg-slate-900/30 p-4">
              <h3 className="text-sm font-semibold text-amber-300/90 uppercase tracking-wider">Personality Traits</h3>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Personality</label>
                <textarea
                  value={editedNPC.personality || ''}
                  onChange={(e) => setEditedNPC({ ...editedNPC, personality: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-emerald-400"
                  placeholder="How they act and speak..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Ideals</label>
                <textarea
                  value={editedNPC.ideals || ''}
                  onChange={(e) => setEditedNPC({ ...editedNPC, ideals: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-emerald-400"
                  placeholder="What they believe in..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Bonds</label>
                <textarea
                  value={editedNPC.bonds || ''}
                  onChange={(e) => setEditedNPC({ ...editedNPC, bonds: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-emerald-400"
                  placeholder="Who or what they care about..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Flaws</label>
                <textarea
                  value={editedNPC.flaws || ''}
                  onChange={(e) => setEditedNPC({ ...editedNPC, flaws: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-emerald-400"
                  placeholder="Weaknesses, fears, secrets..."
                />
              </div>
            </div>

            {/* Features */}
            <CollapsibleSection
              title="Features"
              count={editedNPC.features?.length || 0}
              defaultOpen={(editedNPC.features?.length || 0) > 0}
              headerAccessory={
                <button
                  type="button"
                  onClick={addFeature}
                  className="px-3 py-1 text-xs bg-emerald-600 hover:bg-emerald-700 text-white rounded transition-colors"
                >
                  + Add Feature
                </button>
              }
            >
              {(editedNPC.features?.length || 0) === 0 ? (
                <p className="text-sm text-slate-500 italic">No features yet.</p>
              ) : (
                (editedNPC.features as NPCFeature[]).map((feature, index) => (
                  <CollapsibleRow
                    key={index}
                    defaultOpen={!feature.name}
                    summary={
                      <span className="text-white font-medium truncate block">
                        {feature.name || <span className="text-slate-500 italic">New feature</span>}
                      </span>
                    }
                    rowAccessory={
                      <button
                        type="button"
                        onClick={() => removeFeature(index)}
                        className="text-slate-400 hover:text-red-400 text-lg leading-none px-2"
                        title="Remove feature"
                      >
                        ×
                      </button>
                    }
                    details={
                      <div className="space-y-2 pt-2">
                        <input
                          type="text"
                          value={feature.name}
                          onChange={(e) => updateFeature(index, { name: e.target.value })}
                          className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded text-white focus:outline-none focus:border-emerald-400"
                          placeholder="Feature name"
                        />
                        <textarea
                          value={feature.description}
                          onChange={(e) => updateFeature(index, { description: e.target.value })}
                          rows={3}
                          className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded text-white focus:outline-none focus:border-emerald-400"
                          placeholder="Description"
                        />
                      </div>
                    }
                  />
                ))
              )}
            </CollapsibleSection>

            {/* Actions */}
            <CollapsibleSection
              title="Actions"
              count={editedNPC.actions?.length || 0}
              defaultOpen={(editedNPC.actions?.length || 0) > 0}
              headerAccessory={
                <button
                  type="button"
                  onClick={addAction}
                  className="px-3 py-1 text-xs bg-emerald-600 hover:bg-emerald-700 text-white rounded transition-colors"
                >
                  + Add Action
                </button>
              }
            >
              {(editedNPC.actions?.length || 0) === 0 ? (
                <p className="text-sm text-slate-500 italic">No actions yet.</p>
              ) : (
                (editedNPC.actions as NPCAction[]).map((action, index) => (
                  <CollapsibleRow
                    key={index}
                    defaultOpen={!action.name}
                    summary={
                      <span className="text-white font-medium truncate block">
                        {action.name || <span className="text-slate-500 italic">New action</span>}
                      </span>
                    }
                    rowAccessory={
                      <button
                        type="button"
                        onClick={() => removeAction(index)}
                        className="text-slate-400 hover:text-red-400 text-lg leading-none px-2"
                        title="Remove action"
                      >
                        ×
                      </button>
                    }
                    details={
                      <div className="space-y-2 pt-2">
                        <input
                          type="text"
                          value={action.name}
                          onChange={(e) => updateAction(index, { name: e.target.value })}
                          className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded text-white focus:outline-none focus:border-emerald-400"
                          placeholder="Action name"
                        />
                        <textarea
                          value={action.description}
                          onChange={(e) => updateAction(index, { description: e.target.value })}
                          rows={3}
                          className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded text-white focus:outline-none focus:border-emerald-400"
                          placeholder="Description"
                        />
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                          <div>
                            <label className="block text-xs text-slate-400 mb-1">Attack Bonus</label>
                            <input
                              type="number"
                              value={action.attack_bonus ?? ''}
                              onChange={(e) =>
                                updateAction(index, {
                                  attack_bonus: e.target.value === '' ? undefined : parseInt(e.target.value, 10),
                                })
                              }
                              className="w-full px-2 py-1.5 bg-slate-700/50 border border-slate-600 rounded text-white text-sm focus:outline-none focus:border-emerald-400"
                              placeholder="+5"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-slate-400 mb-1">Damage</label>
                            <input
                              type="text"
                              value={action.damage_dice || ''}
                              onChange={(e) => updateAction(index, { damage_dice: e.target.value })}
                              className="w-full px-2 py-1.5 bg-slate-700/50 border border-slate-600 rounded text-white text-sm focus:outline-none focus:border-emerald-400"
                              placeholder="1d8 + 3"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-slate-400 mb-1">Damage Type</label>
                            <input
                              type="text"
                              value={action.damage_type || ''}
                              onChange={(e) => updateAction(index, { damage_type: e.target.value })}
                              className="w-full px-2 py-1.5 bg-slate-700/50 border border-slate-600 rounded text-white text-sm focus:outline-none focus:border-emerald-400"
                              placeholder="piercing"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-slate-400 mb-1">Range</label>
                            <input
                              type="text"
                              value={action.range || ''}
                              onChange={(e) => updateAction(index, { range: e.target.value })}
                              className="w-full px-2 py-1.5 bg-slate-700/50 border border-slate-600 rounded text-white text-sm focus:outline-none focus:border-emerald-400"
                              placeholder="5 ft."
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs text-slate-400 mb-1">Spell Save DC</label>
                          <input
                            type="number"
                            value={action.spell_save_dc ?? ''}
                            onChange={(e) =>
                              updateAction(index, {
                                spell_save_dc: e.target.value === '' ? undefined : parseInt(e.target.value, 10),
                              })
                            }
                            className="w-28 px-2 py-1.5 bg-slate-700/50 border border-slate-600 rounded text-white text-sm focus:outline-none focus:border-emerald-400"
                            placeholder="15"
                          />
                        </div>
                      </div>
                    }
                  />
                ))
              )}
            </CollapsibleSection>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Location</label>
              <input
                type="text"
                value={editedNPC.location || ''}
                onChange={(e) => setEditedNPC({ ...editedNPC, location: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-emerald-400"
                placeholder="Where can this NPC be found?"
              />
            </div>

            {/* Details */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Details</label>
              <textarea
                value={editedNPC.details || ''}
                onChange={(e) => setEditedNPC({ ...editedNPC, details: e.target.value })}
                rows={4}
                className="w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-emerald-400"
                placeholder="Description, backstory, notes..."
                required
              />
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Tags</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={currentTagInput}
                  onChange={(e) => setCurrentTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  className="flex-1 px-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-emerald-400"
                  placeholder="Add a tag..."
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
                >
                  Add
                </button>
              </div>
              {editedNPC.tags && editedNPC.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {editedNPC.tags.map((tag: string, index: number) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1.5 bg-slate-600 text-slate-200 px-3 py-1.5 rounded-full text-sm"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="hover:text-red-400 transition-colors p-0.5"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Form Actions - pinned to bottom */}
          <div className="flex justify-end gap-3 sm:gap-4 p-4 sm:p-6 border-t border-slate-700 flex-shrink-0">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 sm:px-6 py-2.5 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 sm:px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
            >
              {npc.id ? 'Save Changes' : 'Create NPC'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface CompanionTypeEditFormProps {
  companionType: any;
  onSave: (companionType: any) => void;
  onCancel: () => void;
}

export function CompanionTypeEditForm({ companionType, onSave, onCancel }: CompanionTypeEditFormProps) {
  const [formData, setFormData] = useState({
    name: companionType.name || '',
    spirit_form: companionType.spirit_form || 'Tiny Spirit',
    size: companionType.size || 'Tiny',
    type: companionType.type || 'Spirit',
    alignment: companionType.alignment || 'Any Alignment',
    armor_class: companionType.armor_class || 12,
    hit_points: companionType.hit_points || '21 (6d4 + 6)',
    speed: companionType.speed || { walk: '30 ft.' },
    ability_scores: companionType.ability_scores || {
      STR: 10,
      DEX: 12,
      CON: 12,
      INT: 10,
      WIS: 10,
      CHA: 10
    },
    skills: Array.isArray(companionType.skills) ? companionType.skills.join(', ') : '',
    senses: Array.isArray(companionType.senses) ? companionType.senses.join(', ') : 'Passive Perception 10',
    damage_immunities: Array.isArray(companionType.damage_immunities) ? companionType.damage_immunities.join(', ') : '',
    condition_immunities: Array.isArray(companionType.condition_immunities) ? companionType.condition_immunities.join(', ') : '',
    languages: Array.isArray(companionType.languages) ? companionType.languages.join(', ') : 'Common, Torum',
    challenge_rating: companionType.challenge_rating || '1/2 (100 XP)',
    proficiency_bonus: companionType.proficiency_bonus || 2,
    spirit_forms: Array.isArray(companionType.spirit_forms) ? companionType.spirit_forms.join(', ') : '',
    traits: companionType.traits || [],
    actions: companionType.actions || []
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      let imageUrl = companionType.image || '';

      if (selectedFile) {
        const timestamp = Date.now();
        const fileExt = selectedFile.name.split('.').pop();
        const filename = `companion-type-${timestamp}.${fileExt}`;

        const result = await syncService.uploadFile(selectedFile, 'companion-types', filename);

        if (!result.success) {
          throw new Error(result.error || 'Upload failed');
        }

        // In Tauri mode, use the data URL directly for display
        // In web mode, use the file path
        if (isTauriEnvironment() && result.data?.dataUrl) {
          imageUrl = result.data.dataUrl;
        } else {
          imageUrl = result.data?.path || `/images/companion-types/${filename}`;
        }
      }

      const processedData = {
        ...formData,
        image: imageUrl,
        speed: typeof formData.speed === 'string' ? { walk: formData.speed } : formData.speed,
        skills: formData.skills ? formData.skills.split(',').map(s => s.trim()).filter(s => s) : [],
        senses: formData.senses.split(',').map(s => s.trim()).filter(s => s),
        damage_immunities: formData.damage_immunities ? formData.damage_immunities.split(',').map(s => s.trim()).filter(s => s) : [],
        condition_immunities: formData.condition_immunities ? formData.condition_immunities.split(',').map(s => s.trim()).filter(s => s) : [],
        languages: formData.languages.split(',').map(s => s.trim()).filter(s => s),
        spirit_forms: formData.spirit_forms ? formData.spirit_forms.split(',').map(s => s.trim()).filter(s => s) : []
      };

      onSave(processedData);
    } catch (error) {
      console.error('Error saving companion type:', error);
      alert('Failed to save companion type. Please try again.');
    }
  };

  const addTrait = () => {
    setFormData(prev => ({
      ...prev,
      traits: [...prev.traits, { name: '', description: '' }]
    }));
  };

  const updateTrait = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      traits: prev.traits.map((trait: any, i: number) => 
        i === index ? { ...trait, [field]: value } : trait
      )
    }));
  };

  const removeTrait = (index: number) => {
    setFormData(prev => ({
      ...prev,
      traits: prev.traits.filter((_: any, i: number) => i !== index)
    }));
  };

  const addAction = () => {
    setFormData(prev => ({
      ...prev,
      actions: [...prev.actions, { name: '', description: '' }]
    }));
  };

  const updateAction = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      actions: prev.actions.map((action: any, i: number) => 
        i === index ? { ...action, [field]: value } : action
      )
    }));
  };

  const removeAction = (index: number) => {
    setFormData(prev => ({
      ...prev,
      actions: prev.actions.filter((_: any, i: number) => i !== index)
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 border border-slate-600 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-600">
          <h2 className="text-2xl font-bold text-white">
            {companionType.id ? 'Edit Companion Type' : 'Create New Companion Type'}
          </h2>
          <button
            onClick={onCancel}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-emerald-400"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Spirit Form
              </label>
              <input
                type="text"
                value={formData.spirit_form}
                onChange={(e) => setFormData(prev => ({ ...prev, spirit_form: e.target.value }))}
                className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-emerald-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Size
              </label>
              <select
                value={formData.size}
                onChange={(e) => setFormData(prev => ({ ...prev, size: e.target.value }))}
                className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-emerald-400"
              >
                <option value="Tiny">Tiny</option>
                <option value="Small">Small</option>
                <option value="Medium">Medium</option>
                <option value="Large">Large</option>
                <option value="Huge">Huge</option>
                <option value="Gargantuan">Gargantuan</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Type
              </label>
              <input
                type="text"
                value={formData.type}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-emerald-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Alignment
              </label>
              <input
                type="text"
                value={formData.alignment}
                onChange={(e) => setFormData(prev => ({ ...prev, alignment: e.target.value }))}
                className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-emerald-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Challenge Rating
              </label>
              <input
                type="text"
                value={formData.challenge_rating}
                onChange={(e) => setFormData(prev => ({ ...prev, challenge_rating: e.target.value }))}
                className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-emerald-400"
              />
            </div>
          </div>

          {/* Spirit Forms */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Spirit Forms (comma-separated)
            </label>
            <textarea
              value={formData.spirit_forms}
              onChange={(e) => setFormData(prev => ({ ...prev, spirit_forms: e.target.value }))}
              placeholder="e.g., Action Figure, Candle, Glove, Hovering Mask, Pocket Video Game, Stuffed Animal"
              className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-emerald-400 resize-none"
              rows={2}
            />
            <p className="text-xs text-slate-400 mt-1">List all possible forms this spirit type can take</p>
          </div>

          {/* Combat Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Armor Class
              </label>
              <input
                type="number"
                value={formData.armor_class}
                onChange={(e) => setFormData(prev => ({ ...prev, armor_class: parseInt(e.target.value) || 0 }))}
                className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-emerald-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Hit Points
              </label>
              <input
                type="text"
                value={formData.hit_points}
                onChange={(e) => setFormData(prev => ({ ...prev, hit_points: e.target.value }))}
                className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-emerald-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Proficiency Bonus
              </label>
              <input
                type="number"
                value={formData.proficiency_bonus}
                onChange={(e) => setFormData(prev => ({ ...prev, proficiency_bonus: parseInt(e.target.value) || 0 }))}
                className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-emerald-400"
              />
            </div>
          </div>

          {/* Ability Scores */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Ability Scores
            </label>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
              {['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'].map((ability) => (
                <div key={ability}>
                  <label className="block text-xs text-slate-400 mb-1">{ability}</label>
                  <input
                    type="number"
                    value={formData.ability_scores[ability as keyof typeof formData.ability_scores]}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      ability_scores: {
                        ...prev.ability_scores,
                        [ability]: parseInt(e.target.value) || 0
                      }
                    }))}
                    className="w-full px-2 py-1 bg-slate-700/50 border border-slate-600 rounded text-white text-sm focus:outline-none focus:border-emerald-400"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Other Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Skills (comma-separated)
              </label>
              <textarea
                value={formData.skills}
                onChange={(e) => setFormData(prev => ({ ...prev, skills: e.target.value }))}
                className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-emerald-400 resize-none"
                rows={2}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Senses (comma-separated)
              </label>
              <textarea
                value={formData.senses}
                onChange={(e) => setFormData(prev => ({ ...prev, senses: e.target.value }))}
                className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-emerald-400 resize-none"
                rows={2}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Languages (comma-separated)
              </label>
              <textarea
                value={formData.languages}
                onChange={(e) => setFormData(prev => ({ ...prev, languages: e.target.value }))}
                className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-emerald-400 resize-none"
                rows={2}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Damage Immunities (comma-separated)
              </label>
              <textarea
                value={formData.damage_immunities}
                onChange={(e) => setFormData(prev => ({ ...prev, damage_immunities: e.target.value }))}
                className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-emerald-400 resize-none"
                rows={2}
              />
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-emerald-600 file:text-white hover:file:bg-emerald-700 focus:outline-none focus:border-emerald-400"
            />
            {(previewUrl || companionType.image) && (
              <div className="mt-2">
                <img
                  src={previewUrl || companionType.image}
                  alt="Preview"
                  className="w-32 h-32 object-cover rounded-lg border border-slate-600"
                />
              </div>
            )}
          </div>

          {/* Traits */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-slate-300">
                Traits
              </label>
              <button
                type="button"
                onClick={addTrait}
                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-sm rounded transition-colors"
              >
                Add Trait
              </button>
            </div>
            <div className="space-y-3">
              {formData.traits.map((trait: any, index: number) => (
                <div key={index} className="bg-slate-700/30 rounded-lg p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Trait Name"
                      value={trait.name}
                      onChange={(e) => updateTrait(index, 'name', e.target.value)}
                      className="flex-1 px-3 py-2 bg-slate-700/50 border border-slate-600 rounded text-white placeholder-slate-400 focus:outline-none focus:border-emerald-400"
                    />
                    <button
                      type="button"
                      onClick={() => removeTrait(index)}
                      className="px-2 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  </div>
                  <textarea
                    placeholder="Trait Description"
                    value={trait.description}
                    onChange={(e) => updateTrait(index, 'description', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded text-white placeholder-slate-400 focus:outline-none focus:border-emerald-400 resize-none"
                    rows={2}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-slate-300">
                Actions
              </label>
              <button
                type="button"
                onClick={addAction}
                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-sm rounded transition-colors"
              >
                Add Action
              </button>
            </div>
            <div className="space-y-3">
              {formData.actions.map((action: any, index: number) => (
                <div key={index} className="bg-slate-700/30 rounded-lg p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Action Name"
                      value={action.name}
                      onChange={(e) => updateAction(index, 'name', e.target.value)}
                      className="flex-1 px-3 py-2 bg-slate-700/50 border border-slate-600 rounded text-white placeholder-slate-400 focus:outline-none focus:border-emerald-400"
                    />
                    <button
                      type="button"
                      onClick={() => removeAction(index)}
                      className="px-2 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  </div>
                  <textarea
                    placeholder="Action Description"
                    value={action.description}
                    onChange={(e) => updateAction(index, 'description', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded text-white placeholder-slate-400 focus:outline-none focus:border-emerald-400 resize-none"
                    rows={2}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-4 pt-6 border-t border-slate-600">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
            >
              {companionType.id ? 'Save Changes' : 'Create Companion Type'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface CompanionEditFormProps {
  companion: any;
  companionTypes: any[];
  onSave: (companion: any) => void;
  onCancel: () => void;
}

export function CompanionEditForm({ companion, companionTypes, onSave, onCancel }: CompanionEditFormProps) {
  const [formData, setFormData] = useState({
    name: companion.name || '',
    goal: companion.goal || '',
    desire: companion.desire || '',
    disposition: companion.disposition || '',
    quirk: companion.quirk || '',
    companion_type_id: companion.companion_type_id || '',
    spirit_form: companion.spirit_form || ''
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');

  // Import random generation functions
  const { generateRandomGoal, generateRandomDesire, generateRandomDisposition, generateRandomQuirk, generateRandomCompanionTraits } = require('@/data/companions');

  // Get the selected companion type
  const selectedCompanionType = companionTypes.find(type => type.id === formData.companion_type_id);
  const availableForms = selectedCompanionType?.spirit_forms || [];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const generateRandomTraits = () => {
    const traits = generateRandomCompanionTraits();
    setFormData(prev => ({
      ...prev,
      ...traits
    }));
  };

  const generateRandomField = (field: string) => {
    let value = '';
    switch (field) {
      case 'goal':
        value = generateRandomGoal();
        break;
      case 'desire':
        value = generateRandomDesire();
        break;
      case 'disposition':
        value = generateRandomDisposition();
        break;
      case 'quirk':
        value = generateRandomQuirk();
        break;
      case 'spirit_form':
        if (availableForms.length > 0) {
          value = availableForms[Math.floor(Math.random() * availableForms.length)];
        }
        break;
    }
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCompanionTypeChange = (typeId: string) => {
    setFormData(prev => ({ 
      ...prev, 
      companion_type_id: typeId,
      spirit_form: '' // Reset spirit form when type changes
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      let imageUrl = companion.image || '';

      if (selectedFile) {
        const timestamp = Date.now();
        const fileExt = selectedFile.name.split('.').pop();
        const filename = `companion-${timestamp}.${fileExt}`;

        const result = await syncService.uploadFile(selectedFile, 'companions', filename);

        if (!result.success) {
          throw new Error(result.error || 'Upload failed');
        }

        // In Tauri mode, use the data URL directly for display
        // In web mode, use the file path
        if (isTauriEnvironment() && result.data?.dataUrl) {
          imageUrl = result.data.dataUrl;
        } else {
          imageUrl = result.data?.path || `/images/companions/${filename}`;
        }
      }

      onSave({
        ...companion,
        ...formData,
        image: imageUrl
      });
    } catch (error) {
      console.error('Error saving companion:', error);
      alert('Failed to save companion. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 border border-slate-600 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-600">
          <h2 className="text-2xl font-bold text-white">
            {companion.id ? 'Edit Companion' : 'Create New Companion'}
          </h2>
          <button
            onClick={onCancel}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-emerald-400"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Companion Type
            </label>
            <select
              value={formData.companion_type_id}
              onChange={(e) => handleCompanionTypeChange(e.target.value)}
              className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-emerald-400"
            >
              <option value="">Select a companion type...</option>
              {companionTypes.map((type: any) => (
                <option key={type.id} value={type.id}>
                  {type.name} ({type.spirit_form})
                </option>
              ))}
            </select>
          </div>

          {/* Spirit Form Selection - only show if companion type is selected */}
          {formData.companion_type_id && availableForms.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-slate-300">
                  Spirit Form
                </label>
                <button
                  type="button"
                  onClick={() => generateRandomField('spirit_form')}
                  className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs rounded transition-colors"
                >
                  Random
                </button>
              </div>
              <select
                value={formData.spirit_form}
                onChange={(e) => setFormData(prev => ({ ...prev, spirit_form: e.target.value }))}
                className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-emerald-400"
                required
              >
                <option value="">Select a spirit form...</option>
                {availableForms.map((form: string) => (
                  <option key={form} value={form}>
                    {form}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-white">Personality Traits</h3>
            <button
              type="button"
              onClick={generateRandomTraits}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg transition-colors"
            >
              Generate All Random
            </button>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-slate-300">
                Goal
              </label>
              <button
                type="button"
                onClick={() => generateRandomField('goal')}
                className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs rounded transition-colors"
              >
                Random
              </button>
            </div>
            <textarea
              value={formData.goal}
              onChange={(e) => setFormData(prev => ({ ...prev, goal: e.target.value }))}
              className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-emerald-400 resize-none"
              rows={2}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-slate-300">
                Desire
              </label>
              <button
                type="button"
                onClick={() => generateRandomField('desire')}
                className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs rounded transition-colors"
              >
                Random
              </button>
            </div>
            <textarea
              value={formData.desire}
              onChange={(e) => setFormData(prev => ({ ...prev, desire: e.target.value }))}
              className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-emerald-400 resize-none"
              rows={2}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-slate-300">
                Disposition
              </label>
              <button
                type="button"
                onClick={() => generateRandomField('disposition')}
                className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs rounded transition-colors"
              >
                Random
              </button>
            </div>
            <textarea
              value={formData.disposition}
              onChange={(e) => setFormData(prev => ({ ...prev, disposition: e.target.value }))}
              className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-emerald-400 resize-none"
              rows={2}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-slate-300">
                Quirk
              </label>
              <button
                type="button"
                onClick={() => generateRandomField('quirk')}
                className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs rounded transition-colors"
              >
                Random
              </button>
            </div>
            <textarea
              value={formData.quirk}
              onChange={(e) => setFormData(prev => ({ ...prev, quirk: e.target.value }))}
              className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-emerald-400 resize-none"
              rows={2}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-emerald-600 file:text-white hover:file:bg-emerald-700 focus:outline-none focus:border-emerald-400"
            />
            {(previewUrl || companion.image) && (
              <div className="mt-2">
                <img
                  src={previewUrl || companion.image}
                  alt="Preview"
                  className="w-32 h-32 object-cover rounded-lg border border-slate-600"
                />
              </div>
            )}
          </div>

          <div className="flex gap-4 pt-6 border-t border-slate-600">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
            >
              {companion.id ? 'Save Changes' : 'Create Companion'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ==================== Location Edit Form ====================

interface LocationEditFormProps {
  location: any;
  onSave: (location: any) => void;
  onCancel: () => void;
}

export function LocationEditForm({ location, onSave, onCancel }: LocationEditFormProps) {
  const [editedLocation, setEditedLocation] = useState({
    ...location,
    name: location.name || '',
    region: location.region || '',
    toneVibe: location.toneVibe || '',
    description: location.description || '',
    readAloudText: location.readAloudText || '',
    npcIds: location.npcIds || [],
    relatedLocationIds: location.relatedLocationIds || [],
    plotHooks: location.plotHooks || '',
    linkedQuestIds: location.linkedQuestIds || [],
    treasure: location.treasure || [],
    treasureNotes: location.treasureNotes || '',
    encounterIds: location.encounterIds || [],
    dmNotes: location.dmNotes || '',
    imageUrl: location.imageUrl || '',
  });

  // Image upload state
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Entity lists for selectors
  const [allNPCs, setAllNPCs] = useState<any[]>([]);
  const [allQuests, setAllQuests] = useState<any[]>([]);
  const [allLocations, setAllLocations] = useState<any[]>([]);
  const [allEncounters, setAllEncounters] = useState<any[]>([]);
  const [allPotions, setAllPotions] = useState<any[]>([]);
  const [allIngredients, setAllIngredients] = useState<any[]>([]);
  const [allMagicItems, setAllMagicItems] = useState<any[]>([]);

  // Search states
  const [npcSearch, setNpcSearch] = useState('');
  const [questSearch, setQuestSearch] = useState('');
  const [locationSearch, setLocationSearch] = useState('');
  const [encounterSearch, setEncounterSearch] = useState('');
  const [treasureSearch, setTreasureSearch] = useState('');
  const [treasureType, setTreasureType] = useState<'potion' | 'ingredient' | 'magicItem'>('potion');
  const [treasureQuantity, setTreasureQuantity] = useState(1);

  // Toggle states for selectors
  const [showNPCSelector, setShowNPCSelector] = useState(false);
  const [showQuestSelector, setShowQuestSelector] = useState(false);
  const [showLocationSelector, setShowLocationSelector] = useState(false);
  const [showEncounterSelector, setShowEncounterSelector] = useState(false);
  const [showTreasureSelector, setShowTreasureSelector] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [npcsResult, questsResult, locationsResult, encountersResult, potionsResult, ingredientsResult, magicItemsResult] = await Promise.all([
          syncService.syncWithFallback('npcs', 'modifiedNPCs'),
          syncService.syncWithFallback('quests', 'obojima-quests'),
          syncService.syncWithFallback('locations', 'obojima-locations'),
          syncService.syncWithFallback('encounters', 'obojima-encounters'),
          syncService.syncWithFallback('user-potions', 'modifiedPotions'),
          syncService.syncWithFallback('user-ingredients', 'modifiedIngredients'),
          syncService.syncWithFallback('user-magic-items', 'modifiedMagicItems'),
        ]);
        setAllNPCs(npcsResult || []);
        setAllQuests(questsResult || []);
        setAllLocations((locationsResult || []).filter((l: any) => l.id !== location.id));
        setAllEncounters(encountersResult || []);
        setAllPotions(potionsResult || []);
        setAllIngredients(ingredientsResult || []);
        setAllMagicItems(magicItemsResult || []);
      } catch (error) {
        console.error('Error loading entity data for location form:', error);
      }
    };
    loadData();
  }, [location.id]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editedLocation.name.trim()) {
      alert('Location name is required');
      return;
    }
    onSave(editedLocation);
  };

  // Image upload handler
  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    const timestamp = Date.now();
    const fileExt = file.name.split('.').pop() || 'jpg';
    const filename = `location-${timestamp}.${fileExt}`;

    try {
      const result = await syncService.uploadFile(file, 'locations', filename);

      if (!result.success) {
        throw new Error(result.error || 'Upload failed');
      }

      if (isTauriEnvironment() && result.data?.dataUrl) {
        setEditedLocation((prev: any) => ({ ...prev, imageUrl: result.data.dataUrl }));
      } else {
        setEditedLocation((prev: any) => ({ ...prev, imageUrl: result.data?.path }));
      }

      setUploadProgress(100);
    } catch (error: any) {
      console.error('Error uploading location image:', error);
      alert(error.message || 'Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  };

  // NPC helpers
  const addNPC = (npcId: string) => {
    if (!editedLocation.npcIds.includes(npcId)) {
      setEditedLocation((prev: any) => ({ ...prev, npcIds: [...prev.npcIds, npcId] }));
    }
    setNpcSearch('');
  };

  const removeNPC = (npcId: string) => {
    setEditedLocation((prev: any) => ({ ...prev, npcIds: prev.npcIds.filter((id: string) => id !== npcId) }));
  };

  // Quest helpers
  const addQuest = (questId: string) => {
    if (!editedLocation.linkedQuestIds.includes(questId)) {
      setEditedLocation((prev: any) => ({ ...prev, linkedQuestIds: [...prev.linkedQuestIds, questId] }));
    }
    setQuestSearch('');
  };

  const removeQuest = (questId: string) => {
    setEditedLocation((prev: any) => ({ ...prev, linkedQuestIds: prev.linkedQuestIds.filter((id: string) => id !== questId) }));
  };

  // Related location helpers
  const addRelatedLocation = (locId: string) => {
    if (!editedLocation.relatedLocationIds.includes(locId)) {
      setEditedLocation((prev: any) => ({ ...prev, relatedLocationIds: [...prev.relatedLocationIds, locId] }));
    }
    setLocationSearch('');
  };

  const removeRelatedLocation = (locId: string) => {
    setEditedLocation((prev: any) => ({ ...prev, relatedLocationIds: prev.relatedLocationIds.filter((id: string) => id !== locId) }));
  };

  // Encounter helpers
  const addEncounter = (encId: string) => {
    if (!editedLocation.encounterIds.includes(encId)) {
      setEditedLocation((prev: any) => ({ ...prev, encounterIds: [...prev.encounterIds, encId] }));
    }
    setEncounterSearch('');
  };

  const removeEncounter = (encId: string) => {
    setEditedLocation((prev: any) => ({ ...prev, encounterIds: prev.encounterIds.filter((id: string) => id !== encId) }));
  };

  // Treasure helpers
  const getTreasureItems = () => {
    switch (treasureType) {
      case 'potion': return allPotions;
      case 'ingredient': return allIngredients;
      case 'magicItem': return allMagicItems;
      default: return [];
    }
  };

  const addTreasureItem = (item: any) => {
    const newTreasure = {
      id: `treasure_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: treasureType,
      itemId: item.id || item.name,
      itemName: item.name,
      quantity: treasureQuantity,
    };
    setEditedLocation((prev: any) => ({ ...prev, treasure: [...prev.treasure, newTreasure] }));
    setTreasureSearch('');
    setTreasureQuantity(1);
  };

  const removeTreasureItem = (treasureId: string) => {
    setEditedLocation((prev: any) => ({ ...prev, treasure: prev.treasure.filter((t: any) => t.id !== treasureId) }));
  };

  const filteredNPCs = allNPCs.filter(n =>
    n.name?.toLowerCase().includes(npcSearch.toLowerCase()) &&
    !editedLocation.npcIds.includes(n.id)
  );

  const filteredQuests = allQuests.filter((q: any) =>
    q.title?.toLowerCase().includes(questSearch.toLowerCase()) &&
    !editedLocation.linkedQuestIds.includes(q.id)
  );

  const filteredLocations = allLocations.filter((l: any) =>
    l.name?.toLowerCase().includes(locationSearch.toLowerCase()) &&
    !editedLocation.relatedLocationIds.includes(l.id)
  );

  const filteredEncounters = allEncounters.filter((e: any) =>
    (e.name || e.title || '').toLowerCase().includes(encounterSearch.toLowerCase()) &&
    !editedLocation.encounterIds.includes(e.id)
  );

  const filteredTreasureItems = getTreasureItems().filter((item: any) =>
    item.name?.toLowerCase().includes(treasureSearch.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-xl p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
          <MapPinIcon className="h-6 w-6 text-amber-400" />
          {location.id ? 'Edit Location' : 'Create New Location'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name & Region */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Location Name *</label>
              <input
                type="text"
                value={editedLocation.name}
                onChange={(e) => setEditedLocation((prev: any) => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="Enter location name"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Obojima Region</label>
              <select
                value={editedLocation.region}
                onChange={(e) => setEditedLocation((prev: any) => ({ ...prev, region: e.target.value }))}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              >
                <option value="">Select a region...</option>
                {regions.map(region => (
                  <option key={region.id} value={region.id}>{region.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Location Image</label>
            <div className="flex items-start gap-4">
              {editedLocation.imageUrl && (
                <div className="w-40 h-24 rounded-lg overflow-hidden bg-slate-700 flex-shrink-0">
                  <img
                    src={editedLocation.imageUrl}
                    alt={editedLocation.name || 'Location'}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="flex-1">
                <label className="block">
                  <div className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg cursor-pointer text-center transition-colors text-sm">
                    {editedLocation.imageUrl ? 'Change Image' : 'Upload Image'}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                    disabled={isUploading}
                  />
                </label>
                {editedLocation.imageUrl && (
                  <button
                    type="button"
                    onClick={() => setEditedLocation((prev: any) => ({ ...prev, imageUrl: '' }))}
                    className="mt-2 text-xs text-slate-400 hover:text-red-400 transition-colors"
                  >
                    Remove image
                  </button>
                )}
                {isUploading && (
                  <div className="mt-2">
                    <div className="bg-slate-700 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-amber-500 h-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Tone/Vibe */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Tone / Vibe</label>
            <input
              type="text"
              value={editedLocation.toneVibe}
              onChange={(e) => setEditedLocation((prev: any) => ({ ...prev, toneVibe: e.target.value }))}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              placeholder="e.g., Mysterious, Peaceful, Dangerous..."
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Description</label>
            <MentionTextarea
              value={editedLocation.description}
              onChange={(value) => setEditedLocation((prev: any) => ({ ...prev, description: value }))}
              placeholder="Describe this location... (Use @ to mention NPCs)"
              rows={4}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-y"
            />
          </div>

          {/* Read Aloud Text */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Read Aloud Text</label>
            <textarea
              value={editedLocation.readAloudText}
              onChange={(e) => setEditedLocation((prev: any) => ({ ...prev, readAloudText: e.target.value }))}
              rows={4}
              className="w-full px-3 py-2 bg-slate-700 border border-amber-500/30 rounded-lg text-amber-100 italic focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-y"
              placeholder="Text to read aloud to players..."
            />
          </div>

          {/* NPCs */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">NPCs</label>
            {/* Selected NPCs */}
            {editedLocation.npcIds.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {editedLocation.npcIds.map((npcId: string) => {
                  const npc = allNPCs.find(n => n.id === npcId);
                  return (
                    <span key={npcId} className="inline-flex items-center gap-1 px-2 py-1 bg-blue-500/20 border border-blue-400/30 rounded-lg text-blue-300 text-sm">
                      {npc?.name || npcId}
                      <button type="button" onClick={() => removeNPC(npcId)} className="text-blue-400 hover:text-red-400 ml-1">&times;</button>
                    </span>
                  );
                })}
              </div>
            )}
            <button
              type="button"
              onClick={() => setShowNPCSelector(!showNPCSelector)}
              className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded-lg text-slate-300 text-sm transition-colors"
            >
              {showNPCSelector ? 'Hide' : 'Add NPC'}
            </button>
            {showNPCSelector && (
              <div className="mt-2 bg-slate-700/50 border border-slate-600 rounded-lg p-3">
                <input
                  type="text"
                  value={npcSearch}
                  onChange={(e) => setNpcSearch(e.target.value)}
                  placeholder="Search NPCs..."
                  className="w-full px-3 py-1.5 bg-slate-700 border border-slate-600 rounded text-white text-sm mb-2"
                />
                <div className="max-h-32 overflow-y-auto space-y-1">
                  {filteredNPCs.slice(0, 10).map(npc => (
                    <button
                      key={npc.id}
                      type="button"
                      onClick={() => addNPC(npc.id)}
                      className="w-full text-left px-2 py-1 text-sm text-white hover:bg-slate-600 rounded transition-colors"
                    >
                      {npc.name} {npc.occupation && <span className="text-slate-400">- {npc.occupation}</span>}
                    </button>
                  ))}
                  {filteredNPCs.length === 0 && <p className="text-slate-400 text-sm">No NPCs found</p>}
                </div>
              </div>
            )}
          </div>

          {/* Plot Hooks */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Plot Hooks</label>
            <MentionTextarea
              value={editedLocation.plotHooks}
              onChange={(value) => setEditedLocation((prev: any) => ({ ...prev, plotHooks: value }))}
              placeholder="Plot hooks for this location... (Use @ to mention NPCs)"
              rows={3}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-y"
            />
          </div>

          {/* Linked Quests */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Linked Quests</label>
            {editedLocation.linkedQuestIds.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {editedLocation.linkedQuestIds.map((questId: string) => {
                  const quest = allQuests.find((q: any) => q.id === questId);
                  return (
                    <span key={questId} className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-500/20 border border-emerald-400/30 rounded-lg text-emerald-300 text-sm">
                      {quest?.title || questId}
                      <button type="button" onClick={() => removeQuest(questId)} className="text-emerald-400 hover:text-red-400 ml-1">&times;</button>
                    </span>
                  );
                })}
              </div>
            )}
            <button
              type="button"
              onClick={() => setShowQuestSelector(!showQuestSelector)}
              className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded-lg text-slate-300 text-sm transition-colors"
            >
              {showQuestSelector ? 'Hide' : 'Link Quest'}
            </button>
            {showQuestSelector && (
              <div className="mt-2 bg-slate-700/50 border border-slate-600 rounded-lg p-3">
                <input
                  type="text"
                  value={questSearch}
                  onChange={(e) => setQuestSearch(e.target.value)}
                  placeholder="Search quests..."
                  className="w-full px-3 py-1.5 bg-slate-700 border border-slate-600 rounded text-white text-sm mb-2"
                />
                <div className="max-h-32 overflow-y-auto space-y-1">
                  {filteredQuests.slice(0, 10).map((quest: any) => (
                    <button
                      key={quest.id}
                      type="button"
                      onClick={() => addQuest(quest.id)}
                      className="w-full text-left px-2 py-1 text-sm text-white hover:bg-slate-600 rounded transition-colors"
                    >
                      {quest.title} <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                        quest.status === 'completed' ? 'bg-green-500/30 text-green-300' :
                        quest.status === 'in-progress' ? 'bg-blue-500/30 text-blue-300' :
                        'bg-slate-500/30 text-slate-300'
                      }`}>{quest.status}</span>
                    </button>
                  ))}
                  {filteredQuests.length === 0 && <p className="text-slate-400 text-sm">No quests found</p>}
                </div>
              </div>
            )}
          </div>

          {/* Treasure */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Treasure</label>
            {editedLocation.treasure.length > 0 && (
              <div className="space-y-1 mb-2">
                {editedLocation.treasure.map((item: any) => (
                  <div key={item.id} className="flex items-center justify-between bg-slate-700/30 rounded px-3 py-1.5">
                    <span className="text-sm text-white">
                      {item.itemName}
                      {item.quantity > 1 && <span className="text-slate-400"> x{item.quantity}</span>}
                      <span className="text-slate-500 ml-2">({item.type})</span>
                    </span>
                    <button type="button" onClick={() => removeTreasureItem(item.id)} className="text-slate-400 hover:text-red-400">&times;</button>
                  </div>
                ))}
              </div>
            )}
            <button
              type="button"
              onClick={() => setShowTreasureSelector(!showTreasureSelector)}
              className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded-lg text-slate-300 text-sm transition-colors"
            >
              {showTreasureSelector ? 'Hide' : 'Add Treasure'}
            </button>
            {showTreasureSelector && (
              <div className="mt-2 bg-slate-700/50 border border-slate-600 rounded-lg p-3">
                <div className="flex gap-2 mb-2">
                  <select
                    value={treasureType}
                    onChange={(e) => setTreasureType(e.target.value as any)}
                    className="px-2 py-1.5 bg-slate-700 border border-slate-600 rounded text-white text-sm"
                  >
                    <option value="potion">Potion</option>
                    <option value="ingredient">Ingredient</option>
                    <option value="magicItem">Magic Item</option>
                  </select>
                  <input
                    type="number"
                    value={treasureQuantity}
                    onChange={(e) => setTreasureQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    min={1}
                    className="w-16 px-2 py-1.5 bg-slate-700 border border-slate-600 rounded text-white text-sm"
                    placeholder="Qty"
                  />
                  <input
                    type="text"
                    value={treasureSearch}
                    onChange={(e) => setTreasureSearch(e.target.value)}
                    placeholder="Search items..."
                    className="flex-1 px-2 py-1.5 bg-slate-700 border border-slate-600 rounded text-white text-sm"
                  />
                </div>
                <div className="max-h-32 overflow-y-auto space-y-1">
                  {filteredTreasureItems.slice(0, 10).map((item: any, index: number) => (
                    <button
                      key={item.id || `${item.name}-${index}`}
                      type="button"
                      onClick={() => addTreasureItem(item)}
                      className="w-full text-left px-2 py-1 text-sm text-white hover:bg-slate-600 rounded transition-colors"
                    >
                      {item.name} {item.rarity && <span className="text-slate-400">({item.rarity})</span>}
                    </button>
                  ))}
                  {filteredTreasureItems.length === 0 && <p className="text-slate-400 text-sm">No items found</p>}
                </div>
              </div>
            )}
            {/* Treasure Notes */}
            <div className="mt-3">
              <label className="block text-sm font-medium text-slate-300 mb-1">Treasure Notes</label>
              <textarea
                value={editedLocation.treasureNotes}
                onChange={(e) => setEditedLocation((prev: any) => ({ ...prev, treasureNotes: e.target.value }))}
                rows={2}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-y text-sm"
                placeholder="Additional treasure notes..."
              />
            </div>
          </div>

          {/* Linked Encounters */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Linked Encounters</label>
            {editedLocation.encounterIds.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {editedLocation.encounterIds.map((encId: string) => {
                  const enc = allEncounters.find((e: any) => e.id === encId);
                  return (
                    <span key={encId} className="inline-flex items-center gap-1 px-2 py-1 bg-red-500/20 border border-red-400/30 rounded-lg text-red-300 text-sm">
                      {enc?.name || enc?.title || encId}
                      <button type="button" onClick={() => removeEncounter(encId)} className="text-red-400 hover:text-red-300 ml-1">&times;</button>
                    </span>
                  );
                })}
              </div>
            )}
            <button
              type="button"
              onClick={() => setShowEncounterSelector(!showEncounterSelector)}
              className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded-lg text-slate-300 text-sm transition-colors"
            >
              {showEncounterSelector ? 'Hide' : 'Link Encounter'}
            </button>
            {showEncounterSelector && (
              <div className="mt-2 bg-slate-700/50 border border-slate-600 rounded-lg p-3">
                <input
                  type="text"
                  value={encounterSearch}
                  onChange={(e) => setEncounterSearch(e.target.value)}
                  placeholder="Search encounters..."
                  className="w-full px-3 py-1.5 bg-slate-700 border border-slate-600 rounded text-white text-sm mb-2"
                />
                <div className="max-h-32 overflow-y-auto space-y-1">
                  {filteredEncounters.slice(0, 10).map((enc: any) => (
                    <button
                      key={enc.id}
                      type="button"
                      onClick={() => addEncounter(enc.id)}
                      className="w-full text-left px-2 py-1 text-sm text-white hover:bg-slate-600 rounded transition-colors"
                    >
                      {enc.name || enc.title}
                    </button>
                  ))}
                  {filteredEncounters.length === 0 && <p className="text-slate-400 text-sm">No encounters found</p>}
                </div>
              </div>
            )}
          </div>

          {/* DM Notes */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">DM Notes</label>
            <MentionTextarea
              value={editedLocation.dmNotes}
              onChange={(value) => setEditedLocation((prev: any) => ({ ...prev, dmNotes: value }))}
              placeholder="Private DM notes... (Use @ to mention NPCs)"
              rows={3}
              className="w-full px-3 py-2 bg-slate-700 border border-purple-500/30 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-y"
            />
          </div>

          {/* Related Locations (at the bottom as requested) */}
          <div className="border-t border-slate-700 pt-4">
            <label className="block text-sm font-medium text-slate-300 mb-1">Related Locations</label>
            <p className="text-xs text-slate-400 mb-2">Sub-locations or related areas</p>
            {editedLocation.relatedLocationIds.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {editedLocation.relatedLocationIds.map((locId: string) => {
                  const loc = allLocations.find((l: any) => l.id === locId);
                  return (
                    <span key={locId} className="inline-flex items-center gap-1 px-2 py-1 bg-amber-500/20 border border-amber-400/30 rounded-lg text-amber-300 text-sm">
                      {loc?.name || locId}
                      <button type="button" onClick={() => removeRelatedLocation(locId)} className="text-amber-400 hover:text-red-400 ml-1">&times;</button>
                    </span>
                  );
                })}
              </div>
            )}
            <button
              type="button"
              onClick={() => setShowLocationSelector(!showLocationSelector)}
              className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded-lg text-slate-300 text-sm transition-colors"
            >
              {showLocationSelector ? 'Hide' : 'Link Location'}
            </button>
            {showLocationSelector && (
              <div className="mt-2 bg-slate-700/50 border border-slate-600 rounded-lg p-3">
                <input
                  type="text"
                  value={locationSearch}
                  onChange={(e) => setLocationSearch(e.target.value)}
                  placeholder="Search locations..."
                  className="w-full px-3 py-1.5 bg-slate-700 border border-slate-600 rounded text-white text-sm mb-2"
                />
                <div className="max-h-32 overflow-y-auto space-y-1">
                  {filteredLocations.slice(0, 10).map((loc: any) => (
                    <button
                      key={loc.id}
                      type="button"
                      onClick={() => addRelatedLocation(loc.id)}
                      className="w-full text-left px-2 py-1 text-sm text-white hover:bg-slate-600 rounded transition-colors"
                    >
                      {loc.name} {loc.region && <span className="text-slate-400">- {regions.find(r => r.id === loc.region)?.name || loc.region}</span>}
                    </button>
                  ))}
                  {filteredLocations.length === 0 && <p className="text-slate-400 text-sm">No locations found</p>}
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-700">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
            >
              {location.id ? 'Save Changes' : 'Create Location'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}