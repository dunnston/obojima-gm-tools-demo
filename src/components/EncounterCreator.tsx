'use client';

import { useState, useEffect } from 'react';
import { creatures, Creature, Encounter } from '@/data/creatures';
import StatBlock from './StatBlock';
import { calculateEncounterDifficulty, getEncounterDifficultyRating } from '@/utils/encounterCalculator';
import { syncService } from '@/services/sync';
import { PlusIcon, TrashIcon, EyeIcon, BookmarkIcon, CalculatorIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { getCreatureImagePath } from '@/utils/imageUtils';

interface EncounterCreature {
  creature: Creature;
  count: number;
  notes?: string;
}

export default function EncounterCreator() {
  const [encounterName, setEncounterName] = useState('');
  const [encounterDescription, setEncounterDescription] = useState('');
  const [environment, setEnvironment] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [encounterCreatures, setEncounterCreatures] = useState<EncounterCreature[]>([]);
  const [selectedCreature, setSelectedCreature] = useState<Creature | null>(null);
  const [showStatBlock, setShowStatBlock] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [savedEncounters, setSavedEncounters] = useState<Encounter[]>([]);
  const [partyLevel, setPartyLevel] = useState(5);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'error'>('idle');

  // Validator for encounter data
  const validateEncounter = (encounter: any): Encounter => ({
    ...encounter,
    created_at: new Date(encounter.created_at),
    updated_at: new Date(encounter.updated_at)
  });

  // Load encounters with sync
  const loadEncounters = async () => {
    setSyncStatus('syncing');
    try {
      const encounterData = await syncService.syncWithFallback('encounters', 'obojima-encounters', validateEncounter);
      setSavedEncounters(encounterData);
      setSyncStatus('idle');
    } catch (error) {
      console.error('Error loading encounters:', error);
      setSyncStatus('error');
    }
  };

  // Load encounters on mount
  useEffect(() => {
    loadEncounters();
    
    // Note: Auto-sync disabled to prevent conflicts with other components
    // Users can manually refresh using the refresh button
  }, []);

  // Filter creatures based on search term
  const filteredCreatures = creatures.filter(creature =>
    creature.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    creature.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    creature.size.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addCreatureToEncounter = (creature: Creature) => {
    const existingIndex = encounterCreatures.findIndex(ec => ec.creature.name === creature.name);
    
    if (existingIndex >= 0) {
      // If creature already exists, increment count
      const updated = [...encounterCreatures];
      updated[existingIndex].count += 1;
      setEncounterCreatures(updated);
    } else {
      // Add new creature
      setEncounterCreatures([...encounterCreatures, { creature, count: 1 }]);
    }
  };

  const removeCreatureFromEncounter = (index: number) => {
    const updated = encounterCreatures.filter((_, i) => i !== index);
    setEncounterCreatures(updated);
  };

  const updateCreatureCount = (index: number, count: number) => {
    if (count <= 0) {
      removeCreatureFromEncounter(index);
      return;
    }
    
    const updated = [...encounterCreatures];
    updated[index].count = count;
    setEncounterCreatures(updated);
  };

  const updateCreatureNotes = (index: number, notes: string) => {
    const updated = [...encounterCreatures];
    updated[index].notes = notes;
    setEncounterCreatures(updated);
  };

  const openStatBlock = (creature: Creature) => {
    setSelectedCreature(creature);
    setShowStatBlock(true);
  };

  // Save encounters with sync
  const saveEncounters = async (updatedEncounters: Encounter[]) => {
    try {
      await syncService.saveWithFallback('encounters', 'obojima-encounters', updatedEncounters);
      setSavedEncounters(updatedEncounters);
    } catch (error) {
      console.error('Error saving encounters:', error);
      alert('Error saving encounter data. Data saved locally but may not sync to other devices.');
    }
  };

  const saveEncounter = async () => {
    if (!encounterName.trim()) {
      alert('Please enter an encounter name');
      return;
    }

    if (encounterCreatures.length === 0) {
      alert('Please add at least one creature to the encounter');
      return;
    }

    const newEncounter: Encounter = {
      id: Date.now().toString(),
      name: encounterName,
      description: encounterDescription,
      creatures: encounterCreatures,
      difficulty,
      environment,
      created_at: new Date(),
      updated_at: new Date()
    };

    const updated = [...savedEncounters, newEncounter];
    await saveEncounters(updated);
    alert('Encounter saved successfully!');
    clearEncounter();
  };

  const clearEncounter = () => {
    setEncounterName('');
    setEncounterDescription('');
    setEnvironment('');
    setDifficulty('');
    setEncounterCreatures([]);
  };

  const loadEncounter = (encounter: Encounter) => {
    setEncounterName(encounter.name);
    setEncounterDescription(encounter.description || '');
    setEnvironment(encounter.environment || '');
    setDifficulty(encounter.difficulty || '');
    setEncounterCreatures(encounter.creatures);
  };

  const deleteEncounter = async (encounterId: string) => {
    if (confirm('Are you sure you want to delete this encounter?')) {
      const updated = savedEncounters.filter(e => e.id !== encounterId);
      await saveEncounters(updated);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-3">
          <h1 className="text-3xl font-bold text-white">Encounter Creator</h1>
          {/* Minimal sync status indicator */}
          {syncStatus === 'syncing' && (
            <ArrowPathIcon className="h-5 w-5 text-blue-400 animate-spin" />
          )}
          {syncStatus === 'error' && (
            <span className="text-xs text-amber-400">Offline</span>
          )}
        </div>
        <div className="flex items-center justify-center gap-3">
          <p className="text-slate-400">Build custom encounters with Obojima creatures</p>
          <button
            onClick={loadEncounters}
            className="p-2 text-slate-400 hover:text-white transition-colors"
            title="Refresh"
          >
            <ArrowPathIcon className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Encounter Builder */}
        <div className="space-y-6">
          {/* Encounter Details */}
          <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Encounter Details</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Encounter Name *
                </label>
                <input
                  type="text"
                  value={encounterName}
                  onChange={(e) => setEncounterName(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-emerald-400"
                  placeholder="Enter encounter name..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Description
                </label>
                <textarea
                  value={encounterDescription}
                  onChange={(e) => setEncounterDescription(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-emerald-400 resize-none"
                  placeholder="Describe the encounter..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Environment
                  </label>
                  <input
                    type="text"
                    value={environment}
                    onChange={(e) => setEnvironment(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-emerald-400"
                    placeholder="Forest, Cave, etc."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Party Level
                  </label>
                  <select
                    value={partyLevel}
                    onChange={(e) => setPartyLevel(parseInt(e.target.value))}
                    className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-emerald-400"
                  >
                    {Array.from({ length: 20 }, (_, i) => i + 1).map(level => (
                      <option key={level} value={level}>Level {level}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Encounter Difficulty Calculator */}
          {encounterCreatures.length > 0 && (() => {
            const encounterDifficulty = calculateEncounterDifficulty(encounterCreatures);
            const difficultyRating = getEncounterDifficultyRating(encounterDifficulty.adjustedXp, partyLevel);
            const difficultyColor = {
              'Trivial': 'text-gray-400',
              'Easy': 'text-green-400',
              'Medium': 'text-yellow-400', 
              'Hard': 'text-orange-400',
              'Deadly': 'text-red-400'
            }[difficultyRating] || 'text-gray-400';

            return (
              <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <CalculatorIcon className="h-6 w-6 text-emerald-400" />
                  <h2 className="text-xl font-semibold text-white">Encounter Difficulty</h2>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">{encounterDifficulty.totalCreatures}</div>
                    <div className="text-sm text-slate-400">Total Creatures</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-emerald-400">{encounterDifficulty.totalXp}</div>
                    <div className="text-sm text-slate-400">Base XP</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-400">{encounterDifficulty.adjustedXp}</div>
                    <div className="text-sm text-slate-400">Adjusted XP</div>
                  </div>
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${difficultyColor}`}>{difficultyRating}</div>
                    <div className="text-sm text-slate-400">Difficulty</div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
                  <div className="text-center p-3 bg-slate-700/30 rounded-lg">
                    <div className="font-semibold text-white">Average CR</div>
                    <div className="text-slate-300">{encounterDifficulty.averageCr}</div>
                  </div>
                  <div className="text-center p-3 bg-slate-700/30 rounded-lg">
                    <div className="font-semibold text-white">Highest CR</div>
                    <div className="text-slate-300">{encounterDifficulty.highestCr}</div>
                  </div>
                  <div className="text-center p-3 bg-slate-700/30 rounded-lg">
                    <div className="font-semibold text-white">Multiplier</div>
                    <div className="text-slate-300">×{encounterDifficulty.multiplier}</div>
                  </div>
                </div>

                {/* XP Breakdown */}
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-slate-300 mb-2">XP Breakdown:</h3>
                  {encounterDifficulty.breakdown.map((item, index) => (
                    <div key={index} className="flex justify-between items-center text-sm bg-slate-700/20 rounded-lg p-2">
                      <span className="text-white">
                        {item.count}× {item.creature} (CR {item.cr})
                      </span>
                      <span className="text-slate-300">
                        {item.xpEach} × {item.count} = {item.totalXp} XP
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}

          {/* Current Encounter */}
          <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white">Current Encounter</h2>
              <div className="flex gap-2">
                <button
                  onClick={saveEncounter}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
                >
                  <BookmarkIcon className="h-4 w-4" />
                  Save
                </button>
                <button
                  onClick={clearEncounter}
                  className="px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition-colors"
                >
                  Clear
                </button>
              </div>
            </div>

            {encounterCreatures.length === 0 ? (
              <p className="text-slate-400 text-center py-8">No creatures added yet</p>
            ) : (
              <div className="space-y-3">
                {encounterCreatures.map((ec, index) => (
                  <div key={index} className="bg-slate-700/50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        {/* Creature Image */}
                        <div className="w-10 h-10 bg-slate-600/30 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                          <img
                            src={getCreatureImagePath(ec.creature.name)}
                            alt={ec.creature.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const img = e.target as HTMLImageElement;
                              img.style.display = 'none';
                              const parent = img.parentElement;
                              if (parent) {
                                parent.innerHTML = '<span class="text-lg">🐉</span>';
                              }
                            }}
                          />
                        </div>
                        <button
                          onClick={() => openStatBlock(ec.creature)}
                          className="text-emerald-400 hover:text-emerald-300 transition-colors"
                        >
                          <EyeIcon className="h-5 w-5" />
                        </button>
                        <span className="font-medium text-white">{ec.creature.name}</span>
                        <span className="text-sm text-slate-400">
                          CR {ec.creature.challenge_rating} • {ec.creature.type}
                        </span>
                      </div>
                      <button
                        onClick={() => removeCreatureFromEncounter(index)}
                        className="text-red-400 hover:text-red-300 transition-colors"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <label className="text-sm text-slate-300">Count:</label>
                        <input
                          type="number"
                          min="1"
                          value={ec.count}
                          onChange={(e) => updateCreatureCount(index, parseInt(e.target.value) || 1)}
                          className="w-16 px-2 py-1 bg-slate-600 border border-slate-500 rounded text-white text-sm"
                        />
                      </div>
                      <div className="flex-1">
                        <input
                          type="text"
                          placeholder="Notes..."
                          value={ec.notes || ''}
                          onChange={(e) => updateCreatureNotes(index, e.target.value)}
                          className="w-full px-3 py-1 bg-slate-600 border border-slate-500 rounded text-white text-sm placeholder-slate-400"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Creature Library & Saved Encounters */}
        <div className="space-y-6">
          {/* Creature Library */}
          <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Creature Library</h2>
            
            <div className="mb-4">
              <input
                type="text"
                placeholder="Search creatures..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-emerald-400"
              />
            </div>

            <div className="max-h-96 overflow-y-auto space-y-2">
              {filteredCreatures.map((creature, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors">
                  <div className="flex items-center gap-3 flex-1">
                    {/* Creature Image */}
                    <div className="w-10 h-10 bg-slate-600/30 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                      <img
                        src={getCreatureImagePath(creature.name)}
                        alt={creature.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const img = e.target as HTMLImageElement;
                          img.style.display = 'none';
                          const parent = img.parentElement;
                          if (parent) {
                            parent.innerHTML = '<span class="text-lg">🐉</span>';
                          }
                        }}
                      />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-white">{creature.name}</div>
                      <div className="text-sm text-slate-400">
                        CR {creature.challenge_rating} • {creature.size} {creature.type}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openStatBlock(creature)}
                      className="p-2 text-slate-400 hover:text-emerald-400 transition-colors"
                      title="View Stat Block"
                    >
                      <EyeIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => addCreatureToEncounter(creature)}
                      className="p-2 text-slate-400 hover:text-emerald-400 transition-colors"
                      title="Add to Encounter"
                    >
                      <PlusIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Saved Encounters */}
          <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Saved Encounters</h2>
            
            {savedEncounters.length === 0 ? (
              <p className="text-slate-400 text-center py-4">No saved encounters yet</p>
            ) : (
              <div className="max-h-64 overflow-y-auto space-y-2">
                {savedEncounters.map((encounter) => (
                  <div key={encounter.id} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium text-white">{encounter.name}</div>
                      <div className="text-sm text-slate-400">
                        {encounter.creatures.length} creature{encounter.creatures.length !== 1 ? 's' : ''}
                        {encounter.difficulty && ` • ${encounter.difficulty}`}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => loadEncounter(encounter)}
                        className="px-3 py-1 text-sm bg-emerald-600 hover:bg-emerald-700 text-white rounded transition-colors"
                      >
                        Load
                      </button>
                      <button
                        onClick={() => deleteEncounter(encounter.id)}
                        className="p-1 text-red-400 hover:text-red-300 transition-colors"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stat Block Modal */}
      {selectedCreature && (
        <StatBlock
          creature={selectedCreature}
          isOpen={showStatBlock}
          onClose={() => setShowStatBlock(false)}
        />
      )}
    </div>
  );
}