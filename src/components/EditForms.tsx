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

    const result = await response.json();

    if (!response.ok) {
      // If it's a demo mode error, show a more user-friendly message
      if (response.status === 403 && result.error) {
        throw new Error(result.error);
      }
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    console.log('File uploaded successfully:', result);
  } catch (error: any) {
    console.error('Error copying file:', error);
    // Show the actual error message to the user
    alert(error.message || 'Failed to upload image. Please try again.');
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
        const imagePath = `/images/potions/${filename}`;
        updatedPotion.imageUrl = imagePath;
        
        await copyFileToPublicDirectory(selectedFile, filename, 'potions');
        
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
        const imagePath = `/images/ingredients/${filename}`;
        updatedIngredient.imageUrl = imagePath;
        
        await copyFileToPublicDirectory(selectedFile, filename, 'ingredients');
        
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

    let updatedMagicItem = { 
      ...magicItem, 
      ...formData,
      id: magicItem.id || `magic-item-${formData.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}` // Preserve original ID, only generate if missing
    };

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
  const [editedNPC, setEditedNPC] = useState(npc);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentTagInput, setCurrentTagInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(editedNPC);
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
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('filename', filename);
    formData.append('subfolder', 'npcs');

    try {
      const response = await fetch('/api/upload-image', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        // If it's a demo mode error, show the specific message
        if (response.status === 403 && data.error) {
          throw new Error(data.error);
        }
        throw new Error('Upload failed');
      }
      
      setEditedNPC((prev: any) => ({
        ...prev,
        portrait: data.path
      }));
      
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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-white mb-6">
          {npc.id ? 'Edit NPC' : 'Create New NPC'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Portrait Upload */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Portrait</label>
            <div className="flex items-start gap-6">
              {editedNPC.portrait && (
                <div className="aspect-square w-32 rounded-lg overflow-hidden bg-slate-700">
                  <img
                    src={editedNPC.portrait}
                    alt={editedNPC.name || 'NPC'}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="flex-1">
                <label className="block">
                  <div className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg cursor-pointer text-center transition-colors">
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
                className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-emerald-400"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Occupation</label>
              <input
                type="text"
                value={editedNPC.occupation || ''}
                onChange={(e) => setEditedNPC({ ...editedNPC, occupation: e.target.value })}
                className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-emerald-400"
                placeholder="e.g., Merchant, Guard, Scholar"
              />
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Location</label>
            <input
              type="text"
              value={editedNPC.location || ''}
              onChange={(e) => setEditedNPC({ ...editedNPC, location: e.target.value })}
              className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-emerald-400"
              placeholder="Where can this NPC be found?"
            />
          </div>

          {/* Details */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Details</label>
            <textarea
              value={editedNPC.details || ''}
              onChange={(e) => setEditedNPC({ ...editedNPC, details: e.target.value })}
              rows={6}
              className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-emerald-400"
              placeholder="Description, personality, backstory, notes..."
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
                className="flex-1 px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-emerald-400"
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
            {editedNPC.tags && editedNPC.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {editedNPC.tags.map((tag: string, index: number) => (
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
        
        await copyFileToPublicDirectory(selectedFile, filename, 'companion-types');
        imageUrl = `/images/companion-types/${filename}`;
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
        
        await copyFileToPublicDirectory(selectedFile, filename, 'companions');
        imageUrl = `/images/companions/${filename}`;
      }

      onSave({
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