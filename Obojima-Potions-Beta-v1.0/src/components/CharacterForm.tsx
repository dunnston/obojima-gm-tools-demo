'use client';

import { useState } from 'react';
import { PlayerCharacter, CharacterFormData, DND_CLASSES, createEmptyCharacter, formDataToCharacter } from '@/data/characters';
import { XMarkIcon, PhotoIcon } from '@heroicons/react/24/outline';

interface CharacterFormProps {
  character?: PlayerCharacter;
  onSave: (character: Omit<PlayerCharacter, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
  isEditing?: boolean;
}

export default function CharacterForm({ character, onSave, onCancel, isEditing = false }: CharacterFormProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [formData, setFormData] = useState<CharacterFormData>(() => {
    if (character) {
      return {
        characterName: character.characterName,
        playerName: character.playerName,
        class: character.class,
        armorClass: character.armorClass,
        hitPoints: character.hitPoints || 0,
        maxHitPoints: character.maxHitPoints || 0,
        passivePerception: character.passivePerception,
        passiveInsight: character.passiveInsight,
        passiveInvestigation: character.passiveInvestigation,
        characterGoal: character.characterGoal,
        boons: character.boons.join('\n'),
        personalityTraits: character.personalityTraits.join('\n'),
        ideals: character.ideals.join('\n'),
        bonds: character.bonds.join('\n'),
        flaws: character.flaws.join('\n'),
        notes: character.notes || '',
        imageUrl: character.imageUrl || ''
      };
    }
    return createEmptyCharacter();
  });

  const handleInputChange = (field: keyof CharacterFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // File upload utility function
  const copyFileToPublicDirectory = async (file: File, filename: string): Promise<void> => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('filename', filename);
      formData.append('subfolder', 'characters');

      const response = await fetch('/api/upload-image', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Upload failed: ${response.statusText}${errorData.details ? ` - ${errorData.details}` : ''}`);
      }

      const result = await response.json();
      console.log('Character portrait uploaded successfully:', result);
    } catch (error) {
      console.error('Error uploading character portrait:', error);
      throw error;
    }
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
    
    // Basic validation
    if (!formData.characterName.trim() || !formData.playerName.trim()) {
      alert('Character name and player name are required');
      return;
    }

    let updatedFormData = { ...formData };

    // Handle file upload if a file is selected
    if (selectedFile) {
      try {
        const fileExtension = selectedFile.name.split('.').pop();
        const filename = `${formData.characterName.toLowerCase().replace(/[^a-z0-9]/g, '-')}.${fileExtension}`;
        const imagePath = `/images/characters/${filename}`;
        updatedFormData.imageUrl = imagePath;
        
        await copyFileToPublicDirectory(selectedFile, filename);
        
        console.log('Character portrait saved as:', filename);
        
      } catch (error) {
        console.error('Error handling file upload:', error);
        alert('Error uploading character portrait. Please try again.');
        return;
      }
    }

    const characterData = formDataToCharacter(updatedFormData);
    onSave(characterData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <h2 className="text-2xl font-bold text-white">
            {isEditing ? 'Edit Character' : 'Add New Character'}
          </h2>
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
                Character Name *
              </label>
              <input
                type="text"
                value={formData.characterName}
                onChange={(e) => handleInputChange('characterName', e.target.value)}
                className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-emerald-400"
                placeholder="Enter character name..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Player Name *
              </label>
              <input
                type="text"
                value={formData.playerName}
                onChange={(e) => handleInputChange('playerName', e.target.value)}
                className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-emerald-400"
                placeholder="Enter player name..."
                required
              />
            </div>
          </div>

          {/* Class and Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Class
              </label>
              <select
                value={formData.class}
                onChange={(e) => handleInputChange('class', e.target.value)}
                className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-emerald-400"
              >
                <option value="">Select class...</option>
                {DND_CLASSES.map(cls => (
                  <option key={cls} value={cls}>{cls}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Armor Class
              </label>
              <input
                type="number"
                min="1"
                max="30"
                value={formData.armorClass}
                onChange={(e) => handleInputChange('armorClass', e.target.value)}
                className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-emerald-400"
                placeholder="AC"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Current Hit Points
              </label>
              <input
                type="number"
                min="0"
                max="999"
                value={formData.hitPoints}
                onChange={(e) => handleInputChange('hitPoints', e.target.value)}
                className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-emerald-400"
                placeholder="Current HP"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Max Hit Points
              </label>
              <input
                type="number"
                min="1"
                max="999"
                value={formData.maxHitPoints}
                onChange={(e) => handleInputChange('maxHitPoints', e.target.value)}
                className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-emerald-400"
                placeholder="Max HP"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Passive Perception
              </label>
              <input
                type="number"
                min="1"
                max="30"
                value={formData.passivePerception}
                onChange={(e) => handleInputChange('passivePerception', e.target.value)}
                className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-emerald-400"
                placeholder="PP"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Passive Insight
              </label>
              <input
                type="number"
                min="1"
                max="30"
                value={formData.passiveInsight}
                onChange={(e) => handleInputChange('passiveInsight', e.target.value)}
                className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-emerald-400"
                placeholder="PI"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Passive Investigation
              </label>
              <input
                type="number"
                min="1"
                max="30"
                value={formData.passiveInvestigation}
                onChange={(e) => handleInputChange('passiveInvestigation', e.target.value)}
                className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-emerald-400"
                placeholder="Passive Investigation"
              />
            </div>

            {/* Character Portrait Upload */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Character Portrait
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
                  id="portrait-upload"
                />
                <label htmlFor="portrait-upload" className="cursor-pointer">
                  <div className="space-y-2">
                    <div className="text-4xl">🖼️</div>
                    <div className="text-sm text-slate-300">
                      Drag and drop a portrait here, or <span className="text-emerald-400">click to browse</span>
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
                      alt="Character Portrait Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}

              {/* Show existing image if editing and no new file selected */}
              {!previewUrl && formData.imageUrl && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Current Portrait
                  </label>
                  <div className="w-32 h-32 rounded-lg overflow-hidden bg-slate-800">
                    <img 
                      src={formData.imageUrl} 
                      alt="Current Character Portrait"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Character Goal */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Character Goal
            </label>
            <textarea
              value={formData.characterGoal}
              onChange={(e) => handleInputChange('characterGoal', e.target.value)}
              rows={2}
              className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-emerald-400 resize-none"
              placeholder="What does this character want to achieve?"
            />
          </div>

          {/* Character Traits Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Boons
              </label>
              <textarea
                value={formData.boons}
                onChange={(e) => handleInputChange('boons', e.target.value)}
                rows={3}
                className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-emerald-400 resize-none"
                placeholder="Enter each boon on a new line..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Personality Traits
              </label>
              <textarea
                value={formData.personalityTraits}
                onChange={(e) => handleInputChange('personalityTraits', e.target.value)}
                rows={3}
                className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-emerald-400 resize-none"
                placeholder="Enter each trait on a new line..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Ideals
              </label>
              <textarea
                value={formData.ideals}
                onChange={(e) => handleInputChange('ideals', e.target.value)}
                rows={3}
                className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-emerald-400 resize-none"
                placeholder="Enter each ideal on a new line..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Bonds
              </label>
              <textarea
                value={formData.bonds}
                onChange={(e) => handleInputChange('bonds', e.target.value)}
                rows={3}
                className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-emerald-400 resize-none"
                placeholder="Enter each bond on a new line..."
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Flaws
              </label>
              <textarea
                value={formData.flaws}
                onChange={(e) => handleInputChange('flaws', e.target.value)}
                rows={2}
                className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-emerald-400 resize-none"
                placeholder="Enter each flaw on a new line..."
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Additional Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              rows={4}
              className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-emerald-400 resize-none"
              placeholder="Any additional notes about this character..."
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
              {isEditing ? 'Update Character' : 'Add Character'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}