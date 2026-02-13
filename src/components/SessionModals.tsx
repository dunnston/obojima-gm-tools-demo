'use client';

import { useState, useEffect } from 'react';
import { 
  SessionScene, 
  SessionNPC, 
  SessionMusic, 
  SessionTreasure, 
  SessionSecretClue 
} from '@/data/sessions';
import { PlayerCharacter } from '@/data/characters';
import { Encounter, creatures } from '@/data/creatures';
import { NPC } from '@/data/npcs';
import { Companion } from '@/data/companions';
import { syncService } from '@/services/sync';
import { combatPotions, utilityPotions, whimsyPotions } from '@/data/potions';
import { ingredients } from '@/data/ingredients';
import { magicItems } from '@/data/magicItems';
import { getCreatureImagePath } from '@/utils/imageUtils';
import { 
  XMarkIcon,
  PlusIcon,
  TrashIcon,
  MusicalNoteIcon,
  UserGroupIcon,
  SparklesIcon,
  GiftIcon,
  CheckIcon,
  PencilIcon,
  PlayIcon,
  PauseIcon,
  ArrowUpTrayIcon,
  FireIcon,
  MagnifyingGlassIcon,
  EyeIcon
} from '@heroicons/react/24/outline';

// Scene Edit Modal
export function SceneEditModal({ 
  scene, 
  savedEncounters,
  sessionMusic,
  sessionNPCs,
  sessionTreasure,
  onSave, 
  onClose 
}: {
  scene: SessionScene;
  savedEncounters: Encounter[];
  sessionMusic: SessionMusic[];
  sessionNPCs: SessionNPC[];
  sessionTreasure: SessionTreasure[];
  onSave: (updates: Partial<SessionScene>) => void;
  onClose: () => void;
}) {
  const [formData, setFormData] = useState({
    title: scene.title,
    description: scene.description,
    readAloudText: scene.readAloudText || '',
    notes: scene.notes || ''
  });
  
  const [selectedMusic, setSelectedMusic] = useState<string[]>(
    scene.music?.map(m => m.id) || []
  );
  const [selectedNPCs, setSelectedNPCs] = useState<string[]>(
    scene.npcs?.map(n => n.id) || []
  );
  const [selectedEncounters, setSelectedEncounters] = useState<string[]>(
    scene.encounters || []
  );
  const [selectedTreasure, setSelectedTreasure] = useState<string[]>(
    scene.treasure?.map(t => t.id) || []
  );

  const handleSave = () => {
    onSave({
      ...formData,
      music: sessionMusic.filter(m => selectedMusic.includes(m.id)),
      npcs: sessionNPCs.filter(n => selectedNPCs.includes(n.id)),
      encounters: selectedEncounters,
      treasure: sessionTreasure.filter(t => selectedTreasure.includes(t.id))
    });
  };

  const toggleSelection = (id: string, selectedList: string[], setSelectedList: (list: string[]) => void) => {
    if (selectedList.includes(id)) {
      setSelectedList(selectedList.filter(item => item !== id));
    } else {
      setSelectedList([...selectedList, id]);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <h3 className="text-xl font-bold text-white">Edit Scene</h3>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1">Scene Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="What might happen in this scene?"
                  className="w-full h-24 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-1">Read Aloud Text</label>
                <textarea
                  value={formData.readAloudText}
                  onChange={(e) => setFormData({ ...formData, readAloudText: e.target.value })}
                  placeholder="Narrative text to read to players..."
                  className="w-full h-32 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 resize-none font-serif"
                />
              </div>
            </div>

            {/* Music Selection */}
            <div>
              <h4 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                <MusicalNoteIcon className="h-4 w-4" />
                Music
              </h4>
              <div className="border border-slate-600 rounded-lg max-h-32 overflow-y-auto">
                {sessionMusic.length > 0 ? (
                  sessionMusic.map(music => (
                    <label
                      key={music.id}
                      className="flex items-center gap-3 p-3 hover:bg-slate-700 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedMusic.includes(music.id)}
                        onChange={() => toggleSelection(music.id, selectedMusic, setSelectedMusic)}
                        className="rounded border-slate-600 bg-slate-700 text-emerald-600"
                      />
                      <span className="text-white">{music.name}</span>
                      {music.tags && (
                        <div className="flex gap-1 ml-auto">
                          {music.tags.map(tag => (
                            <span key={tag} className="px-2 py-1 bg-slate-600 rounded text-xs text-slate-300">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </label>
                  ))
                ) : (
                  <div className="p-4 text-center text-slate-400">
                    No music added to session yet
                  </div>
                )}
              </div>
            </div>

            {/* NPCs Selection */}
            <div>
              <h4 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                <UserGroupIcon className="h-4 w-4" />
                NPCs
              </h4>
              <div className="border border-slate-600 rounded-lg max-h-32 overflow-y-auto">
                {sessionNPCs.length > 0 ? (
                  sessionNPCs.map(npc => (
                    <label
                      key={npc.id}
                      className="flex items-center gap-3 p-3 hover:bg-slate-700 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedNPCs.includes(npc.id)}
                        onChange={() => toggleSelection(npc.id, selectedNPCs, setSelectedNPCs)}
                        className="rounded border-slate-600 bg-slate-700 text-emerald-600"
                      />
                      <span className="text-white">{npc.name}</span>
                      {npc.role && (
                        <span className="text-slate-400 text-sm">({npc.role})</span>
                      )}
                    </label>
                  ))
                ) : (
                  <div className="p-4 text-center text-slate-400">
                    No NPCs added to session yet
                  </div>
                )}
              </div>
            </div>

            {/* Encounters Selection */}
            <div>
              <h4 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                <SparklesIcon className="h-4 w-4" />
                Encounters
              </h4>
              <div className="border border-slate-600 rounded-lg max-h-32 overflow-y-auto">
                {savedEncounters.length > 0 ? (
                  savedEncounters.map(encounter => (
                    <label
                      key={encounter.id}
                      className="flex items-center gap-3 p-3 hover:bg-slate-700 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedEncounters.includes(encounter.id)}
                        onChange={() => toggleSelection(encounter.id, selectedEncounters, setSelectedEncounters)}
                        className="rounded border-slate-600 bg-slate-700 text-emerald-600"
                      />
                      <div>
                        <div className="text-white">{encounter.name}</div>
                        <div className="text-slate-400 text-xs">
                          {encounter.creatures.reduce((total, c) => total + c.count, 0)} creatures • 
                          {encounter.difficulty && ` ${encounter.difficulty}`}
                        </div>
                      </div>
                    </label>
                  ))
                ) : (
                  <div className="p-4 text-center text-slate-400">
                    No saved encounters found
                  </div>
                )}
              </div>
            </div>

            {/* Treasure Selection */}
            <div>
              <h4 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                <GiftIcon className="h-4 w-4" />
                Treasure
              </h4>
              <div className="border border-slate-600 rounded-lg max-h-32 overflow-y-auto">
                {sessionTreasure.length > 0 ? (
                  sessionTreasure.map(treasure => (
                    <label
                      key={treasure.id}
                      className="flex items-center gap-3 p-3 hover:bg-slate-700 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedTreasure.includes(treasure.id)}
                        onChange={() => toggleSelection(treasure.id, selectedTreasure, setSelectedTreasure)}
                        className="rounded border-slate-600 bg-slate-700 text-emerald-600"
                      />
                      <span className="text-white">{treasure.itemName}</span>
                      <span className="text-slate-400 text-sm">
                        ({treasure.type}){treasure.quantity && treasure.quantity > 1 && ` x${treasure.quantity}`}
                      </span>
                    </label>
                  ))
                ) : (
                  <div className="p-4 text-center text-slate-400">
                    No treasure added to session yet
                  </div>
                )}
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm text-slate-400 mb-1">GM Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Private notes about this scene..."
                className="w-full h-24 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 resize-none"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 p-6 border-t border-slate-700">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
          >
            Save Scene
          </button>
        </div>
      </div>
    </div>
  );
}

// Scene View Modal
export function SceneViewModal({ 
  scene, 
  currentMusic,
  savedEncounters,
  onClose, 
  onEdit,
  onPlayMusic,
  onLoadEncounter 
}: {
  scene: SessionScene;
  currentMusic?: SessionMusic | null;
  savedEncounters?: Encounter[];
  onClose: () => void;
  onEdit: () => void;
  onPlayMusic?: (music: SessionMusic) => void;
  onLoadEncounter?: (encounterId: string) => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <h3 className="text-2xl font-bold text-white">{scene.title}</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={onEdit}
              className="p-2 text-slate-400 hover:text-emerald-400 hover:bg-slate-700 rounded-lg transition-colors"
            >
              <PencilIcon className="h-5 w-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Description */}
            {scene.description && (
              <div>
                <h4 className="text-sm font-semibold text-slate-400 mb-2">Scene Overview</h4>
                <p className="text-white">{scene.description}</p>
              </div>
            )}

            {/* Read Aloud Text */}
            {scene.readAloudText && (
              <div className="bg-slate-700/50 rounded-lg p-6 border-l-4 border-emerald-400">
                <h4 className="text-sm font-semibold text-emerald-400 mb-3">Read Aloud</h4>
                <p className="text-white font-serif text-lg leading-relaxed whitespace-pre-wrap">
                  {scene.readAloudText}
                </p>
              </div>
            )}

            {/* Assets Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Music */}
              {scene.music && scene.music.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                    <MusicalNoteIcon className="h-4 w-4" />
                    Music
                  </h4>
                  <div className="space-y-2">
                    {scene.music.map(music => (
                      <div key={music.id} className="bg-slate-700/50 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <span className="text-white">{music.name}</span>
                          {onPlayMusic && (
                            <button 
                              onClick={() => onPlayMusic(music)}
                              className="p-1 text-emerald-400 hover:text-emerald-300"
                            >
                              {currentMusic?.id === music.id ? (
                                <PauseIcon className="h-4 w-4" />
                              ) : (
                                <PlayIcon className="h-4 w-4" />
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* NPCs */}
              {scene.npcs && scene.npcs.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                    <UserGroupIcon className="h-4 w-4" />
                    NPCs
                  </h4>
                  <div className="space-y-2">
                    {scene.npcs.map(npc => (
                      <div key={npc.id} className="bg-slate-700/50 rounded-lg p-3">
                        <div className="text-white font-medium">{npc.name}</div>
                        {npc.role && (
                          <div className="text-slate-400 text-sm">{npc.role}</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Encounters */}
              {scene.encounters && scene.encounters.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                    <SparklesIcon className="h-4 w-4" />
                    Encounters
                  </h4>
                  <div className="space-y-2">
                    {scene.encounters.map(encounterId => {
                      const encounter = savedEncounters?.find(e => e.id === encounterId);
                      if (!encounter) return (
                        <div key={encounterId} className="bg-slate-700/50 rounded-lg p-3">
                          <div className="text-slate-400">Encounter not found</div>
                        </div>
                      );
                      
                      const totalCreatures = encounter.creatures.reduce((sum, c) => sum + c.count, 0);
                      
                      return (
                        <div key={encounterId} className="bg-slate-700/50 rounded-lg p-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-white font-medium">{encounter.name}</div>
                              <div className="text-slate-400 text-sm">
                                {totalCreatures} creatures • {encounter.difficulty}
                              </div>
                            </div>
                            {onLoadEncounter && (
                              <button
                                onClick={() => onLoadEncounter(encounterId)}
                                className="flex items-center gap-2 px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-sm transition-colors"
                              >
                                <SparklesIcon className="h-3 w-3" />
                                Load
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Treasure */}
              {scene.treasure && scene.treasure.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                    <GiftIcon className="h-4 w-4" />
                    Treasure
                  </h4>
                  <div className="space-y-2">
                    {scene.treasure.map(treasure => (
                      <div key={treasure.id} className="bg-slate-700/50 rounded-lg p-3">
                        <div className="text-white">
                          {treasure.itemName}
                          {treasure.quantity && treasure.quantity > 1 && ` (x${treasure.quantity})`}
                        </div>
                        <div className="text-slate-400 text-sm capitalize">{treasure.type}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* GM Notes */}
            {scene.notes && (
              <div>
                <h4 className="text-sm font-semibold text-slate-400 mb-2">GM Notes</h4>
                <div className="bg-slate-700/50 rounded-lg p-4">
                  <p className="text-white whitespace-pre-wrap">{scene.notes}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Player Detail Modal
export function PlayerDetailModal({ 
  character, 
  onClose 
}: {
  character: PlayerCharacter;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div>
            <h3 className="text-2xl font-bold text-white">{character.characterName}</h3>
            <p className="text-slate-400">{character.playerName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Image and Basic Info */}
          <div className="flex gap-6">
            {character.imageUrl && (
              <div className="w-32 h-32 rounded-lg overflow-hidden bg-slate-700">
                <img 
                  src={character.imageUrl} 
                  alt={character.characterName}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="flex-1 grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-slate-400">Class</div>
                <div className="text-lg text-white font-semibold">{character.class}</div>
              </div>
              <div>
                <div className="text-sm text-slate-400">Level</div>
                <div className="text-lg text-white font-semibold">{character.level}</div>
              </div>
              <div>
                <div className="text-sm text-slate-400">Armor Class</div>
                <div className="text-lg text-white font-semibold">{character.armorClass}</div>
              </div>
              <div>
                <div className="text-sm text-slate-400">Hit Points</div>
                <div className="text-lg text-white font-semibold">{character.hitPoints} / {character.maxHitPoints}</div>
              </div>
              <div>
                <div className="text-sm text-slate-400">Passive Perception</div>
                <div className="text-lg text-white font-semibold">{character.passivePerception}</div>
              </div>
              <div>
                <div className="text-sm text-slate-400">Passive Insight</div>
                <div className="text-lg text-white font-semibold">{character.passiveInsight}</div>
              </div>
              <div>
                <div className="text-sm text-slate-400">Passive Investigation</div>
                <div className="text-lg text-white font-semibold">{character.passiveInvestigation}</div>
              </div>
            </div>
          </div>

          {/* Character Goal */}
          {character.characterGoal && (
            <div>
              <h4 className="text-sm font-semibold text-slate-400 mb-2">Character Goal</h4>
              <p className="text-white bg-slate-700/50 rounded-lg p-3">{character.characterGoal}</p>
            </div>
          )}

          {/* Traits Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {character.personalityTraits.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-slate-400 mb-2">Personality Traits</h4>
                <ul className="space-y-1">
                  {character.personalityTraits.map((trait, index) => (
                    <li key={index} className="text-white text-sm">• {trait}</li>
                  ))}
                </ul>
              </div>
            )}

            {character.ideals.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-slate-400 mb-2">Ideals</h4>
                <ul className="space-y-1">
                  {character.ideals.map((ideal, index) => (
                    <li key={index} className="text-white text-sm">• {ideal}</li>
                  ))}
                </ul>
              </div>
            )}

            {character.bonds.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-slate-400 mb-2">Bonds</h4>
                <ul className="space-y-1">
                  {character.bonds.map((bond, index) => (
                    <li key={index} className="text-white text-sm">• {bond}</li>
                  ))}
                </ul>
              </div>
            )}

            {character.flaws.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-slate-400 mb-2">Flaws</h4>
                <ul className="space-y-1">
                  {character.flaws.map((flaw, index) => (
                    <li key={index} className="text-white text-sm">• {flaw}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Boons */}
          {character.boons.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-slate-400 mb-2">Boons & Special Abilities</h4>
              <div className="bg-emerald-900/20 border border-emerald-400/30 rounded-lg p-4">
                <ul className="space-y-1">
                  {character.boons.map((boon, index) => (
                    <li key={index} className="text-emerald-300 text-sm">★ {boon}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Notes */}
          {character.notes && (
            <div>
              <h4 className="text-sm font-semibold text-slate-400 mb-2">Additional Notes</h4>
              <p className="text-white text-sm bg-slate-700/50 rounded-lg p-3">{character.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Encounter Selection Modal
export function EncounterSelectionModal({
  encounters,
  selectedEncounters,
  onAdd,
  onClose
}: {
  encounters: Encounter[];
  selectedEncounters: string[];
  onAdd: (encounterId: string) => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 rounded-lg w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <h3 className="text-xl font-bold text-white">Add Encounter to Session</h3>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {encounters.length > 0 ? (
            <div className="space-y-3">
              {encounters.map(encounter => {
                const isSelected = selectedEncounters.includes(encounter.id);
                const totalCreatures = encounter.creatures.reduce((sum, c) => sum + c.count, 0);
                
                return (
                  <div 
                    key={encounter.id}
                    className={`bg-slate-700/50 rounded-lg p-4 border transition-colors ${
                      isSelected ? 'border-emerald-400 opacity-50' : 'border-slate-600 hover:border-slate-500'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-semibold text-white">{encounter.name}</h4>
                          {encounter.difficulty && (
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              encounter.difficulty === 'Easy' ? 'bg-green-500/20 text-green-300' :
                              encounter.difficulty === 'Medium' ? 'bg-yellow-500/20 text-yellow-300' :
                              encounter.difficulty === 'Hard' ? 'bg-orange-500/20 text-orange-300' :
                              'bg-red-500/20 text-red-300'
                            }`}>
                              {encounter.difficulty}
                            </span>
                          )}
                        </div>
                        
                        {encounter.description && (
                          <p className="text-slate-400 text-sm mb-2">{encounter.description}</p>
                        )}
                        
                        <div className="text-sm text-slate-400">
                          {totalCreatures} {totalCreatures === 1 ? 'creature' : 'creatures'}
                        </div>
                        
                        {/* Creature preview */}
                        <div className="mt-2 text-xs text-slate-500">
                          {encounter.creatures.map((creatureGroup, index) => (
                            <span key={index}>
                              {creatureGroup.count}x {creatureGroup.creature.name}
                              {index < encounter.creatures.length - 1 ? ', ' : ''}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      <button
                        onClick={() => onAdd(encounter.id)}
                        disabled={isSelected}
                        className={`ml-4 px-4 py-2 rounded text-sm font-medium transition-colors ${
                          isSelected
                            ? 'bg-slate-600 text-slate-400 cursor-not-allowed'
                            : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        }`}
                      >
                        {isSelected ? 'Added' : 'Add'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <SparklesIcon className="h-16 w-16 text-slate-400 mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-semibold text-white mb-2">No Encounters Found</h3>
              <p className="text-slate-400">Create encounters in the Encounters tab first</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Enhanced Creature/Companion Selection Modal
export function CreatureSelectionModal({
  onAdd,
  onClose
}: {
  onAdd: (type: 'creature' | 'companion', entityName: string, entityId?: string, quantity?: number, context?: string, notes?: string) => void;
  onClose: () => void;
}) {
  const [activeTab, setActiveTab] = useState<'creatures' | 'companions'>('creatures');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCreature, setSelectedCreature] = useState<typeof creatures[0] | null>(null);
  const [selectedCompanion, setSelectedCompanion] = useState<Companion | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [context, setContext] = useState('');
  const [notes, setNotes] = useState('');
  const [companions, setCompanions] = useState<Companion[]>([]);
  const [loading, setLoading] = useState(false);

  // Load companions from database
  useEffect(() => {
    const loadCompanions = async () => {
      if (activeTab === 'companions') {
        setLoading(true);
        try {
          const result = await syncService.getCompanions();
          if (result.success && result.data) {
            setCompanions(result.data);
          }
        } catch (error) {
          console.error('Error loading companions:', error);
        } finally {
          setLoading(false);
        }
      }
    };
    loadCompanions();
  }, [activeTab]);

  const filteredCreatures = creatures.filter(creature =>
    creature.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    creature.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredCompanions = companions.filter(companion =>
    companion.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    companion.goal.toLowerCase().includes(searchTerm.toLowerCase()) ||
    companion.desire.toLowerCase().includes(searchTerm.toLowerCase()) ||
    companion.disposition.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAdd = () => {
    if (activeTab === 'creatures' && selectedCreature) {
      onAdd(
        'creature',
        selectedCreature.name,
        undefined, // No ID for built-in creatures
        quantity || 1,
        context || undefined,
        notes || undefined
      );
    } else if (activeTab === 'companions' && selectedCompanion) {
      onAdd(
        'companion',
        selectedCompanion.name,
        selectedCompanion.id,
        1, // Companions are typically unique, so quantity is 1
        context || undefined,
        notes || undefined
      );
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <FireIcon className="h-6 w-6 text-red-400" />
            <h2 className="text-2xl font-bold text-white">Add Creatures & Companions</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-700 bg-slate-800/50">
          <button
            onClick={() => {
              setActiveTab('creatures');
              setSelectedCreature(null);
              setSelectedCompanion(null);
              setSearchTerm('');
            }}
            className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'creatures'
                ? 'text-white bg-slate-700/50 border-b-2 border-red-400'
                : 'text-slate-400 hover:text-white hover:bg-slate-700/30'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <FireIcon className="h-4 w-4" />
              Creatures
            </div>
          </button>
          <button
            onClick={() => {
              setActiveTab('companions');
              setSelectedCreature(null);
              setSelectedCompanion(null);
              setSearchTerm('');
            }}
            className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'companions'
                ? 'text-white bg-slate-700/50 border-b-2 border-blue-400'
                : 'text-slate-400 hover:text-white hover:bg-slate-700/30'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <UserGroupIcon className="h-4 w-4" />
              Companions
            </div>
          </button>
        </div>

        <div className="flex h-[70vh]">
          {/* Entity List */}
          <div className="w-1/2 border-r border-slate-700">
            <div className="p-4 border-b border-slate-700">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-emerald-400"
                  placeholder={`Search ${activeTab}...`}
                />
              </div>
            </div>
            
            <div className="overflow-y-auto h-full p-4">
              {loading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="text-white">Loading {activeTab}...</div>
                </div>
              ) : (
                <div className="space-y-2">
                  {activeTab === 'creatures' ? (
                    filteredCreatures.length > 0 ? (
                      filteredCreatures.map((creature) => (
                        <button
                          key={creature.name}
                          onClick={() => setSelectedCreature(creature)}
                          className={`w-full p-3 text-left rounded-lg transition-colors border ${
                            selectedCreature?.name === creature.name 
                              ? 'bg-emerald-600/20 border-emerald-400 text-white' 
                              : 'bg-slate-700/30 border-slate-600 text-slate-200 hover:bg-slate-700/50'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-600 flex-shrink-0">
                              <img
                                src={creature.imageUrl || getCreatureImagePath(creature.name)}
                                alt={creature.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.src = '/images/creatures/default-creature.svg';
                                }}
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <div>
                                  <div className="font-medium truncate">{creature.name}</div>
                                  <div className="text-sm text-slate-400">
                                    {creature.type} • CR {creature.challenge_rating}
                                  </div>
                                </div>
                                <div className="text-xs text-slate-400 ml-2">
                                  AC {creature.armor_class}
                                </div>
                              </div>
                            </div>
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="text-center py-12 text-slate-400">
                        No creatures found matching your search.
                      </div>
                    )
                  ) : (
                    filteredCompanions.length > 0 ? (
                      filteredCompanions.map((companion) => (
                        <button
                          key={companion.id}
                          onClick={() => setSelectedCompanion(companion)}
                          className={`w-full p-3 text-left rounded-lg transition-colors border ${
                            selectedCompanion?.id === companion.id 
                              ? 'bg-emerald-600/20 border-emerald-400 text-white' 
                              : 'bg-slate-700/30 border-slate-600 text-slate-200 hover:bg-slate-700/50'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-600 flex-shrink-0">
                              {companion.image ? (
                                <img 
                                  src={companion.image} 
                                  alt={companion.name}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.currentTarget.src = '/images/companions/default-companion.svg';
                                  }}
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-400">
                                  <UserGroupIcon className="h-8 w-8" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium truncate">{companion.name}</div>
                              <div className="text-sm text-slate-400 truncate">{companion.disposition}</div>
                              <div className="text-xs text-slate-500 truncate">{companion.goal}</div>
                            </div>
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="text-center py-12">
                        <UserGroupIcon className="h-16 w-16 text-slate-400 mx-auto mb-4 opacity-50" />
                        <h3 className="text-xl font-semibold text-white mb-2">No Companions Found</h3>
                        <p className="text-slate-400">Create companions in the Database tab first</p>
                      </div>
                    )
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Details Panel */}
          <div className="w-1/2 p-6">
            {activeTab === 'creatures' && selectedCreature ? (
              <div className="space-y-4">
                <div>
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-20 h-20 rounded-lg overflow-hidden bg-slate-600 flex-shrink-0">
                      <img
                        src={selectedCreature.imageUrl || getCreatureImagePath(selectedCreature.name)}
                        alt={selectedCreature.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = '/images/creatures/default-creature.svg';
                        }}
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white mb-2">{selectedCreature.name}</h3>
                      <p className="text-slate-400">
                        {selectedCreature.type} • CR {selectedCreature.challenge_rating}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-slate-300">
                        <span>AC {selectedCreature.armor_class}</span>
                        <span>HP {selectedCreature.hit_points}</span>
                        <span>Speed {selectedCreature.speed.walk || selectedCreature.speed.fly || 'Varies'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Quantity
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                      className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-emerald-400"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Context
                    </label>
                    <input
                      type="text"
                      value={context}
                      onChange={(e) => setContext(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-emerald-400"
                      placeholder="e.g., potential boss, patrol guard..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Notes
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-emerald-400 resize-none"
                      placeholder="Additional notes about this creature..."
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAdd}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
                  >
                    Add Creature
                  </button>
                </div>
              </div>
            ) : activeTab === 'companions' && selectedCompanion ? (
              <div className="space-y-4">
                <div>
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-20 h-20 rounded-lg overflow-hidden bg-slate-600 flex-shrink-0">
                      {selectedCompanion.image ? (
                        <img 
                          src={selectedCompanion.image} 
                          alt={selectedCompanion.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = '/images/companions/default-companion.svg';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400">
                          <UserGroupIcon className="h-12 w-12" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white mb-2">{selectedCompanion.name}</h3>
                      <p className="text-emerald-400 mb-1">{selectedCompanion.disposition}</p>
                      <p className="text-slate-400 text-sm mb-2">{selectedCompanion.goal}</p>
                      <p className="text-slate-500 text-xs">{selectedCompanion.desire}</p>
                    </div>
                  </div>
                  
                  {selectedCompanion.quirk && (
                    <div className="bg-slate-700/30 rounded-lg p-3 mb-4">
                      <h4 className="text-sm font-medium text-slate-300 mb-1">Quirk</h4>
                      <p className="text-slate-300 text-sm">{selectedCompanion.quirk}</p>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Context
                    </label>
                    <input
                      type="text"
                      value={context}
                      onChange={(e) => setContext(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-emerald-400"
                      placeholder="e.g., helpful ally, potential recruit..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Session Notes
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-emerald-400 resize-none"
                      placeholder="Session-specific notes about this companion..."
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAdd}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
                  >
                    Add Companion
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                {activeTab === 'creatures' ? (
                  <>
                    <FireIcon className="h-16 w-16 text-slate-400 mx-auto mb-4 opacity-50" />
                    <h3 className="text-xl font-semibold text-white mb-2">Select a Creature</h3>
                    <p className="text-slate-400">Choose a creature from the list to add to your session</p>
                  </>
                ) : (
                  <>
                    <UserGroupIcon className="h-16 w-16 text-slate-400 mx-auto mb-4 opacity-50" />
                    <h3 className="text-xl font-semibold text-white mb-2">Select a Companion</h3>
                    <p className="text-slate-400">Choose a companion from the list to add to your session</p>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Creature Details Modal
export function CreatureDetailsModal({
  creatureName,
  onClose
}: {
  creatureName: string;
  onClose: () => void;
}) {
  const creature = creatures.find(c => c.name === creatureName);

  if (!creature) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div className="bg-slate-800 border border-slate-600 rounded-xl p-6">
          <p className="text-white">Creature not found</p>
          <button
            onClick={onClose}
            className="mt-4 px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <FireIcon className="h-6 w-6 text-red-400" />
            <h2 className="text-2xl font-bold text-white">{creature.name}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Basic Information</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Type:</span>
                    <span className="text-white">{creature.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Challenge Rating:</span>
                    <span className="text-white">{creature.challenge_rating}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Armor Class:</span>
                    <span className="text-white">{creature.armor_class}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Hit Points:</span>
                    <span className="text-white">{creature.hit_points}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Speed:</span>
                    <span className="text-white">{creature.speed.walk || creature.speed.fly || 'Varies'}</span>
                  </div>
                </div>
              </div>

              {/* Abilities */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Ability Scores</h3>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div className="text-center p-2 bg-slate-700/50 rounded">
                    <div className="text-slate-400 text-xs">STR</div>
                    <div className="text-white font-semibold">{creature.ability_scores.STR}</div>
                  </div>
                  <div className="text-center p-2 bg-slate-700/50 rounded">
                    <div className="text-slate-400 text-xs">DEX</div>
                    <div className="text-white font-semibold">{creature.ability_scores.DEX}</div>
                  </div>
                  <div className="text-center p-2 bg-slate-700/50 rounded">
                    <div className="text-slate-400 text-xs">CON</div>
                    <div className="text-white font-semibold">{creature.ability_scores.CON}</div>
                  </div>
                  <div className="text-center p-2 bg-slate-700/50 rounded">
                    <div className="text-slate-400 text-xs">INT</div>
                    <div className="text-white font-semibold">{creature.ability_scores.INT}</div>
                  </div>
                  <div className="text-center p-2 bg-slate-700/50 rounded">
                    <div className="text-slate-400 text-xs">WIS</div>
                    <div className="text-white font-semibold">{creature.ability_scores.WIS}</div>
                  </div>
                  <div className="text-center p-2 bg-slate-700/50 rounded">
                    <div className="text-slate-400 text-xs">CHA</div>
                    <div className="text-white font-semibold">{creature.ability_scores.CHA}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Image */}
            <div>
              <div className="mb-4">
                <img
                  src={creature.imageUrl || getCreatureImagePath(creature.name)}
                  alt={creature.name}
                  className="w-full h-64 object-cover rounded-lg border border-slate-600"
                  onError={(e) => {
                    e.currentTarget.src = '/images/creatures/default-creature.svg';
                  }}
                />
              </div>
            </div>
          </div>

          {/* Additional sections like features, actions, etc. can be added here */}
          {creature.traits && creature.traits.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-white mb-3">Traits</h3>
              <div className="space-y-3">
                {creature.traits.map((trait, index) => (
                  <div key={index} className="p-4 bg-slate-700/30 rounded-lg">
                    <h4 className="font-semibold text-emerald-400 mb-2">{trait.name}</h4>
                    <p className="text-slate-300 text-sm">{trait.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {creature.actions && creature.actions.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-white mb-3">Actions</h3>
              <div className="space-y-3">
                {creature.actions.map((action, index) => (
                  <div key={index} className="p-4 bg-slate-700/30 rounded-lg">
                    <h4 className="font-semibold text-red-400 mb-2">{action.name}</h4>
                    <p className="text-slate-300 text-sm">{action.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}