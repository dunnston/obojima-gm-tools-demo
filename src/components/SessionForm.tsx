'use client';

import { useState } from 'react';
import { GameSession } from '@/data/sessions';
import { PlayerCharacter } from '@/data/characters';
import { formatObojimaDate, ObojimaDate, resolvePhase, resolveSeason } from '@/data/obojimaCalendar';
import { useCalendarConfig } from '@/contexts/CalendarConfigContext';
import { XMarkIcon, CalendarIcon, UserGroupIcon, SparklesIcon } from '@heroicons/react/24/outline';

interface SessionFormProps {
  session?: GameSession;
  characters: PlayerCharacter[];
  onSave: (name: string, realWorldDate: Date, gameDate: ObojimaDate | undefined, playerCharacters: string[]) => void;
  onCancel: () => void;
  isEditing?: boolean;
}

export default function SessionForm({ session, characters, onSave, onCancel, isEditing = false }: SessionFormProps) {
  const config = useCalendarConfig();
  const [formData, setFormData] = useState({
    name: session?.name || '',
    realWorldDate: session?.realWorldDate ? session.realWorldDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    gameDate: session?.gameDate || {
      year: 1,
      season: config.seasons[0]?.id ?? 'Spring',
      phase: config.phases[0]?.id ?? 'New Moon',
      day: 1,
      cycle: 1
    },
    useGameDate: !!session?.gameDate,
    playerCharacters: session?.playerCharacters || []
  });

  const selectedSeason = resolveSeason(formData.gameDate.season, config);
  const maxCycles = selectedSeason?.cycles ?? 1;

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleGameDateChange = (field: keyof ObojimaDate, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      gameDate: {
        ...prev.gameDate,
        [field]: value
      }
    }));
  };

  const handleCharacterToggle = (characterId: string) => {
    setFormData(prev => ({
      ...prev,
      playerCharacters: prev.playerCharacters.includes(characterId)
        ? prev.playerCharacters.filter(id => id !== characterId)
        : [...prev.playerCharacters, characterId]
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      alert('Session name is required');
      return;
    }

    onSave(
      formData.name,
      new Date(formData.realWorldDate),
      formData.useGameDate ? formData.gameDate : undefined,
      formData.playerCharacters
    );
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

            {/* Real World Date */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                <CalendarIcon className="h-4 w-4 inline mr-1" />
                Real World Date *
              </label>
              <input
                type="date"
                value={formData.realWorldDate}
                onChange={(e) => handleInputChange('realWorldDate', e.target.value)}
                className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-400"
                required
              />
              <p className="text-xs text-slate-400 mt-1">When you actually play this session</p>
            </div>

            {/* Game Date Toggle */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-3">
                <input
                  type="checkbox"
                  checked={formData.useGameDate}
                  onChange={(e) => handleInputChange('useGameDate', e.target.checked)}
                  className="text-blue-400 focus:ring-blue-400 focus:ring-offset-0 bg-slate-700 border-slate-600 rounded"
                />
                <SparklesIcon className="h-4 w-4" />
                Set Game World Date
              </label>
              
              {formData.useGameDate && (
                <div className="bg-slate-700/30 rounded-lg p-4 space-y-4">
                  <p className="text-xs text-slate-400 mb-3">When this session takes place in the game world</p>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1">Year</label>
                      <input
                        type="number"
                        min="1"
                        value={formData.gameDate.year}
                        onChange={(e) => handleGameDateChange('year', parseInt(e.target.value) || 1)}
                        className="w-full px-3 py-2 bg-slate-600/50 border border-slate-500 rounded text-white text-sm focus:outline-none focus:border-emerald-400"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1">Season</label>
                      <select
                        value={formData.gameDate.season}
                        onChange={(e) => handleGameDateChange('season', e.target.value)}
                        className="w-full px-3 py-2 bg-slate-600/50 border border-slate-500 rounded text-white text-sm focus:outline-none focus:border-emerald-400"
                      >
                        {config.seasons.map((season) => (
                          <option key={season.id} value={season.id}>
                            {season.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1">Moon Phase</label>
                      <select
                        value={formData.gameDate.phase}
                        onChange={(e) => handleGameDateChange('phase', e.target.value)}
                        className="w-full px-3 py-2 bg-slate-600/50 border border-slate-500 rounded text-white text-sm focus:outline-none focus:border-emerald-400"
                      >
                        {config.phases.map((phase) => (
                          <option key={phase.id} value={phase.id}>
                            {phase.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1">Cycle</label>
                      <select
                        value={formData.gameDate.cycle}
                        onChange={(e) => handleGameDateChange('cycle', parseInt(e.target.value))}
                        className="w-full px-3 py-2 bg-slate-600/50 border border-slate-500 rounded text-white text-sm focus:outline-none focus:border-emerald-400"
                      >
                        {Array.from({ length: maxCycles }, (_, i) => i + 1).map(c => (
                          <option key={c} value={c}>{ordinalLabel(c)} Cycle</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Day in Phase</label>
                    <input
                      type="number"
                      min="1"
                      max={resolvePhase(formData.gameDate.phase, config)?.days ?? 8}
                      value={formData.gameDate.day}
                      onChange={(e) => handleGameDateChange('day', parseInt(e.target.value) || 1)}
                      className="w-full px-3 py-2 bg-slate-600/50 border border-slate-500 rounded text-white text-sm focus:outline-none focus:border-emerald-400"
                    />
                    <p className="text-xs text-slate-400 mt-1">
                      Max: {resolvePhase(formData.gameDate.phase, config)?.days ?? 8} days
                    </p>
                  </div>

                  {/* Game Date Preview */}
                  <div className="pt-2 border-t border-slate-600">
                    <p className="text-sm text-emerald-400 font-medium">
                      Game Date: {formatObojimaDate(formData.gameDate as ObojimaDate, config)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Character Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-3">
              <UserGroupIcon className="h-4 w-4 inline mr-1" />
              Party Characters ({formData.playerCharacters.length} selected)
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
                      formData.playerCharacters.includes(character.id)
                        ? 'border-blue-400 bg-blue-400/10'
                        : 'border-slate-600 bg-slate-700/30 hover:border-slate-500'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={formData.playerCharacters.includes(character.id)}
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

function ordinalLabel(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}