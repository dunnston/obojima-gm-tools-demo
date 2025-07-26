'use client';

import { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { addLocalIngredientFile, addLocalPotionFile, addLocalCreatureFile, addLocalMagicItemFile } from '@/utils/imageMapping';

// File copying utility function
async function copyFileToPublicDirectory(file: File, filename: string, subfolder: string): Promise<void> {
  try {
    // For Next.js client-side, we need to use an API route to handle file uploads
    const formData = new FormData();
    formData.append('file', file);
    formData.append('filename', filename);
    formData.append('subfolder', subfolder);

    const response = await fetch('/api/upload-image', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    const result = await response.json();
    console.log('File uploaded successfully:', result);
  } catch (error) {
    console.error('Error copying file:', error);
    throw error;
  }
}

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
    imageUrl: potion.imageUrl || ''
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

    let updatedPotion = { ...potion, ...formData };

    if (selectedFile) {
      try {
        const fileExtension = selectedFile.name.split('.').pop();
        const filename = `${formData.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}.${fileExtension}`;
        const imagePath = `/images/potions/${filename}`;
        updatedPotion.imageUrl = imagePath;
        
        await copyFileToPublicDirectory(selectedFile, filename, 'potions');
        
        // Register the file with the image mapping system
        addLocalPotionFile(formData.name, fileExtension || 'jpg');
        
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
                Price (gold)
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

    let updatedIngredient = { ...ingredient, ...formData };

    if (selectedFile) {
      try {
        // Create a filename based on the ingredient name
        const fileExtension = selectedFile.name.split('.').pop();
        const filename = `${formData.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}.${fileExtension}`;
        
        // Create the image path for the database
        const imagePath = `/images/ingredients/${filename}`;
        updatedIngredient.imageUrl = imagePath;
        
        // Copy the file to the public directory using File System Access API or fallback
        await copyFileToPublicDirectory(selectedFile, filename, 'ingredients');
        
        // Register the file with the image mapping system
        addLocalIngredientFile(formData.name, fileExtension || 'jpg');
        
        console.log('Image saved as:', filename);
        
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
                Price (gold)
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

          {/* Rarity */}
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
    }
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
      alert('Creature name is required');
      return;
    }

    let updatedCreature = { ...creature, ...formData };

    if (selectedFile) {
      try {
        const fileExtension = selectedFile.name.split('.').pop();
        const filename = `${formData.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}.${fileExtension}`;
        const imagePath = `/images/creatures/${filename}`;
        updatedCreature.imageUrl = imagePath;
        
        await copyFileToPublicDirectory(selectedFile, filename, 'creatures');
        
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

    let updatedMagicItem = { ...magicItem, ...formData };

    if (selectedFile) {
      try {
        const fileExtension = selectedFile.name.split('.').pop();
        const filename = `${formData.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}.${fileExtension}`;
        const imagePath = `/images/magic-items/${filename}`;
        updatedMagicItem.imageUrl = imagePath;
        
        await copyFileToPublicDirectory(selectedFile, filename, 'magic-items');
        
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
                Price (gold)
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