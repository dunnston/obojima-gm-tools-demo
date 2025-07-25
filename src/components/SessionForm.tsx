'use client';

import { useState } from 'react';
import { GameSession } from '@/data/sessions';
import { PlayerCharacter } from '@/data/characters';
import { XMarkIcon, CalendarIcon, UserGroupIcon } from '@heroicons/react/24/outline';

interface SessionFormProps {
  session?: GameSession;
  characters: PlayerCharacter[];
  onSave: (session: Omit<GameSession, 'id' | 'createdAt' | 'updatedAt' | 'chapters'>) => void;
  onCancel: () => void;
  isEditing?: boolean;
}

export default function SessionForm({ session, characters, onSave, onCancel, isEditing = false }: SessionFormProps) {
  const [formData, setFormData] = useState({
    name: session?.name || '',
    date: session?.date ? session.date.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    characters: session?.characters || []
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCharacterToggle = (characterId: string) => {
    setFormData(prev => ({
      ...prev,
      characters: prev.characters.includes(characterId)
        ? prev.characters.filter(id => id !== characterId)
        : [...prev.characters, characterId]
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      alert('Session name is required');
      return;
    }

    onSave({
      name: formData.name,
      date: new Date(formData.date),
      characters: formData.characters
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <h2 className="text-2xl font-bold text-white">
            {isEditing ? 'Edit Session' : 'Create New Session'}
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
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Session Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-400"
                placeholder="Enter session name..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                <CalendarIcon className="h-4 w-4 inline mr-1" />
                Session Date
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
                className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-400"
              />
            </div>
          </div>

          {/* Character Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-3">
              <UserGroupIcon className="h-4 w-4 inline mr-1" />
              Party Characters ({formData.characters.length} selected)
            </label>
            
            {characters.length === 0 ? (
              <div className="text-center py-6 text-slate-400">
                <UserGroupIcon className="h-8 w-8 mx-auto mb-2" />
                <p>No characters available</p>
                <p className="text-sm">Create characters first in the Character Manager</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto">
                {characters.map((character) => (
                  <label
                    key={character.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                      formData.characters.includes(character.id)
                        ? 'border-blue-400 bg-blue-400/10'
                        : 'border-slate-600 bg-slate-700/30 hover:border-slate-500'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={formData.characters.includes(character.id)}
                      onChange={() => handleCharacterToggle(character.id)}
                      className="text-blue-400 focus:ring-blue-400 focus:ring-offset-0 bg-slate-700 border-slate-600 rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-white truncate">{character.characterName}</div>
                      <div className="text-sm text-slate-400 truncate">
                        {character.playerName} • {character.class}
                      </div>
                    </div>
                  </label>
                ))}
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
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              {isEditing ? 'Update Session' : 'Create Session'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}