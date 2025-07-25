'use client';

import { useState, useEffect } from 'react';
import { creatures } from '@/data/creatures';
import { PlayerCharacter } from '@/data/characters';
import { getCreatureImagePath } from '@/utils/imageUtils';
import { 
  UserPlusIcon, 
  TrashIcon, 
  PlayIcon, 
  ForwardIcon,
  ArrowPathIcon,
  UserIcon,
  HeartIcon,
  ShieldCheckIcon,
  BoltIcon
} from '@heroicons/react/24/outline';

interface CombatParticipant {
  id: string;
  name: string;
  type: 'player' | 'creature';
  initiative: number;
  ac?: number;
  hp?: number;
  maxHp?: number;
  imageUrl?: string;
  creatureData?: any;
  playerClass?: string;
  level?: number;
  characterData?: PlayerCharacter;
}

export default function InitiativeTracker() {
  const [participants, setParticipants] = useState<CombatParticipant[]>([]);
  const [combatStarted, setCombatStarted] = useState(false);
  const [currentTurn, setCurrentTurn] = useState(0);
  const [round, setRound] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addType, setAddType] = useState<'player' | 'creature'>('player');

  // Sort participants by initiative (descending)
  const sortedParticipants = [...participants].sort((a, b) => b.initiative - a.initiative);
  const currentParticipant = combatStarted ? sortedParticipants[currentTurn] : null;

  const addParticipant = (participant: Omit<CombatParticipant, 'id'>) => {
    const newParticipant: CombatParticipant = {
      ...participant,
      id: `${participant.type}-${Date.now()}-${Math.random()}`
    };
    setParticipants([...participants, newParticipant]);
  };

  const removeParticipant = (id: string) => {
    setParticipants(participants.filter(p => p.id !== id));
    if (combatStarted && participants.length <= 1) {
      endCombat();
    }
  };

  const updateInitiative = (id: string, initiative: number) => {
    setParticipants(participants.map(p => 
      p.id === id ? { ...p, initiative } : p
    ));
  };

  const startCombat = () => {
    if (participants.length < 2) {
      alert('Add at least 2 participants to start combat');
      return;
    }
    setCombatStarted(true);
    setCurrentTurn(0);
    setRound(1);
  };

  const nextTurn = () => {
    const nextIndex = currentTurn + 1;
    if (nextIndex >= sortedParticipants.length) {
      setCurrentTurn(0);
      setRound(round + 1);
    } else {
      setCurrentTurn(nextIndex);
    }
  };

  const endCombat = () => {
    setCombatStarted(false);
    setCurrentTurn(0);
    setRound(1);
  };

  return (
    <div className="flex h-full">
      {/* Left Panel - Initiative Order */}
      <div className="w-1/2 bg-slate-800/50 p-6 border-r border-slate-700">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-white">Initiative Order</h2>
            {combatStarted && (
              <div className="text-sm text-slate-400">
                Round {round}
              </div>
            )}
          </div>

          {/* Combat Controls */}
          <div className="flex gap-2 mb-4">
            {!combatStarted ? (
              <>
                <button
                  onClick={() => { setAddType('player'); setShowAddModal(true); }}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  <UserPlusIcon className="h-4 w-4" />
                  Add Player
                </button>
                <button
                  onClick={() => { setAddType('creature'); setShowAddModal(true); }}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                >
                  <UserPlusIcon className="h-4 w-4" />
                  Add Creature
                </button>
                <button
                  onClick={startCombat}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors ml-auto"
                >
                  <PlayIcon className="h-4 w-4" />
                  Start Combat
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={nextTurn}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
                >
                  <ForwardIcon className="h-4 w-4" />
                  Next Turn
                </button>
                <button
                  onClick={endCombat}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                >
                  <ArrowPathIcon className="h-4 w-4" />
                  End Combat
                </button>
              </>
            )}
          </div>
        </div>

        {/* Participants List */}
        <div className="space-y-2">
          {(combatStarted ? sortedParticipants : participants).map((participant, index) => {
            const isCurrent = combatStarted && index === currentTurn;
            return (
              <div
                key={participant.id}
                className={`p-4 rounded-lg border-2 transition-all ${
                  isCurrent 
                    ? 'border-emerald-400 bg-emerald-900/30 shadow-lg shadow-emerald-400/20' 
                    : 'border-slate-600 bg-slate-700/30'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {/* Image */}
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-600">
                      {participant.type === 'creature' ? (
                        <img
                          src={getCreatureImagePath(participant.name)}
                          alt={participant.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = '/images/creatures/default-creature.svg';
                          }}
                        />
                      ) : participant.imageUrl ? (
                        <img
                          src={participant.imageUrl}
                          alt={participant.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400">
                          <UserIcon className="h-8 w-8" />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div>
                      <h3 className="font-semibold text-white">{participant.name}</h3>
                      <div className="text-sm text-slate-400">
                        {participant.type === 'player' && participant.playerClass && (
                          <span>Level {participant.level} {participant.playerClass}</span>
                        )}
                        {participant.type === 'creature' && (
                          <span>Creature</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Initiative and Actions */}
                  <div className="flex items-center gap-3">
                    {!combatStarted ? (
                      <>
                        <input
                          type="number"
                          value={participant.initiative}
                          onChange={(e) => updateInitiative(participant.id, parseInt(e.target.value) || 0)}
                          className="w-16 px-2 py-1 bg-slate-600 border border-slate-500 rounded text-white text-center"
                          placeholder="Init"
                        />
                        <button
                          onClick={() => removeParticipant(participant.id)}
                          className="p-1 text-red-400 hover:text-red-300 transition-colors"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </>
                    ) : (
                      <div className="flex items-center gap-2">
                        <BoltIcon className="h-5 w-5 text-yellow-400" />
                        <span className="text-white font-bold">{participant.initiative}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {participants.length === 0 && (
            <div className="text-center py-12 text-slate-400">
              <UserPlusIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No participants added yet</p>
              <p className="text-sm mt-2">Add players and creatures to begin tracking initiative</p>
            </div>
          )}
        </div>
      </div>

      {/* Right Panel - Current Turn Details */}
      <div className="w-1/2 bg-slate-900/50 p-6">
        {currentParticipant ? (
          <div className="space-y-6">
            {/* Header */}
            <div className="text-center">
              <h2 className="text-3xl font-bold text-white mb-2">{currentParticipant.name}'s Turn</h2>
              <div className="text-slate-400">Round {round}</div>
            </div>

            {/* Image */}
            <div className="flex justify-center">
              <div className="w-48 h-48 rounded-full overflow-hidden bg-slate-700 border-4 border-emerald-400">
                {currentParticipant.type === 'creature' ? (
                  <img
                    src={getCreatureImagePath(currentParticipant.name)}
                    alt={currentParticipant.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/images/creatures/default-creature.svg';
                    }}
                  />
                ) : currentParticipant.imageUrl ? (
                  <img
                    src={currentParticipant.imageUrl}
                    alt={currentParticipant.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400">
                    <UserIcon className="h-24 w-24" />
                  </div>
                )}
              </div>
            </div>

            {/* Stats */}
            {currentParticipant.type === 'player' ? (
              <PlayerDetails participant={currentParticipant} />
            ) : (
              <CreatureDetails participant={currentParticipant} />
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-slate-400">
            <div className="text-center">
              <BoltIcon className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-xl">No active combat</p>
              <p className="text-sm mt-2">Start combat to see turn details</p>
            </div>
          </div>
        )}
      </div>

      {/* Add Participant Modal */}
      {showAddModal && (
        <AddParticipantModal
          type={addType}
          onAdd={addParticipant}
          onClose={() => setShowAddModal(false)}
        />
      )}
    </div>
  );
}

// Player Details Component
function PlayerDetails({ participant }: { participant: CombatParticipant }) {
  return (
    <div className="bg-slate-800/50 rounded-lg p-6 space-y-4">
      <h3 className="text-xl font-semibold text-white mb-4">Player Details</h3>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-700/50 rounded-lg p-4">
          <div className="flex items-center gap-2 text-slate-400 mb-1">
            <UserIcon className="h-4 w-4" />
            <span className="text-sm">Class</span>
          </div>
          <div className="text-white font-semibold">
            {participant.playerClass || 'Unknown'} (Level {participant.level || 1})
          </div>
        </div>

        <div className="bg-slate-700/50 rounded-lg p-4">
          <div className="flex items-center gap-2 text-slate-400 mb-1">
            <ShieldCheckIcon className="h-4 w-4" />
            <span className="text-sm">Armor Class</span>
          </div>
          <div className="text-white font-semibold text-2xl">
            {participant.ac || '—'}
          </div>
        </div>

        <div className="bg-slate-700/50 rounded-lg p-4 col-span-2">
          <div className="flex items-center gap-2 text-slate-400 mb-1">
            <HeartIcon className="h-4 w-4" />
            <span className="text-sm">Hit Points</span>
          </div>
          <div className="text-white font-semibold text-2xl">
            {participant.hp || 0} / {participant.maxHp || 0}
          </div>
          {participant.maxHp && participant.hp !== undefined && (
            <div className="mt-2 w-full bg-slate-600 rounded-full h-2">
              <div 
                className="bg-red-500 h-2 rounded-full transition-all"
                style={{ width: `${(participant.hp / participant.maxHp) * 100}%` }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Creature Details Component
function CreatureDetails({ participant }: { participant: CombatParticipant }) {
  const creature = participant.creatureData;
  
  if (!creature) return null;

  return (
    <div className="bg-slate-800/50 rounded-lg p-6 space-y-4 max-h-[calc(100vh-400px)] overflow-y-auto">
      <h3 className="text-xl font-semibold text-white mb-4">Creature Stats</h3>
      
      {/* Basic Info */}
      <div className="bg-slate-700/50 rounded-lg p-4 mb-4">
        <div className="text-center">
          <div className="text-lg font-semibold text-white">{creature.name}</div>
          <div className="text-slate-400 text-sm">
            {creature.size} {creature.type}, {creature.alignment}
          </div>
          <div className="text-slate-400 text-sm mt-1">
            Challenge Rating: {creature.challenge_rating} (Proficiency: +{creature.proficiency_bonus})
          </div>
        </div>
      </div>

      {/* Basic Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-slate-700/50 rounded-lg p-3 text-center">
          <div className="text-slate-400 text-sm">AC</div>
          <div className="text-white font-bold text-xl">{creature.armor_class}</div>
        </div>
        <div className="bg-slate-700/50 rounded-lg p-3 text-center">
          <div className="text-slate-400 text-sm">HP</div>
          <div className="text-white font-bold text-xl">{creature.hit_points}</div>
        </div>
        <div className="bg-slate-700/50 rounded-lg p-3 text-center">
          <div className="text-slate-400 text-sm">Speed</div>
          <div className="text-white font-bold text-sm">
            {typeof creature.speed === 'object' 
              ? Object.entries(creature.speed).map(([type, value]) => 
                  `${type}: ${value}`
                ).join(', ')
              : creature.speed || 'N/A'
            }
          </div>
        </div>
      </div>

      {/* Ability Scores */}
      <div className="grid grid-cols-6 gap-2">
        {['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'].map((ability) => {
          const score = creature.ability_scores[ability as keyof typeof creature.ability_scores];
          const modifier = Math.floor((score - 10) / 2);
          return (
            <div key={ability} className="bg-slate-700/50 rounded-lg p-2 text-center">
              <div className="text-slate-400 text-xs">{ability}</div>
              <div className="text-white font-bold">{score}</div>
              <div className="text-slate-400 text-xs">
                {modifier >= 0 ? '+' : ''}{modifier}
              </div>
            </div>
          );
        })}
      </div>

      {/* Skills and Saves */}
      {(creature.skills || creature.saving_throws) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {creature.saving_throws && Object.keys(creature.saving_throws).length > 0 && (
            <div className="bg-slate-700/50 rounded-lg p-3">
              <h4 className="text-white font-semibold mb-2 text-sm">Saving Throws</h4>
              <div className="text-slate-300 text-sm">
                {Object.entries(creature.saving_throws).map(([save, bonus]) => 
                  `${save.toUpperCase()} +${bonus}`
                ).join(', ')}
              </div>
            </div>
          )}
          
          {creature.skills && Object.keys(creature.skills).length > 0 && (
            <div className="bg-slate-700/50 rounded-lg p-3">
              <h4 className="text-white font-semibold mb-2 text-sm">Skills</h4>
              <div className="text-slate-300 text-sm">
                {Object.entries(creature.skills).map(([skill, bonus]) => 
                  `${skill} +${bonus}`
                ).join(', ')}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Resistances and Immunities */}
      {(creature.damage_resistances || creature.damage_immunities || creature.damage_vulnerabilities || creature.condition_immunities) && (
        <div className="space-y-2">
          {creature.damage_resistances && creature.damage_resistances.length > 0 && (
            <div className="bg-slate-700/50 rounded-lg p-3">
              <h4 className="text-orange-400 font-semibold mb-1 text-sm">Damage Resistances</h4>
              <div className="text-slate-300 text-sm">{creature.damage_resistances.join(', ')}</div>
            </div>
          )}
          
          {creature.damage_immunities && creature.damage_immunities.length > 0 && (
            <div className="bg-slate-700/50 rounded-lg p-3">
              <h4 className="text-green-400 font-semibold mb-1 text-sm">Damage Immunities</h4>
              <div className="text-slate-300 text-sm">{creature.damage_immunities.join(', ')}</div>
            </div>
          )}
          
          {creature.damage_vulnerabilities && creature.damage_vulnerabilities.length > 0 && (
            <div className="bg-slate-700/50 rounded-lg p-3">
              <h4 className="text-red-400 font-semibold mb-1 text-sm">Damage Vulnerabilities</h4>
              <div className="text-slate-300 text-sm">{creature.damage_vulnerabilities.join(', ')}</div>
            </div>
          )}
          
          {creature.condition_immunities && creature.condition_immunities.length > 0 && (
            <div className="bg-slate-700/50 rounded-lg p-3">
              <h4 className="text-blue-400 font-semibold mb-1 text-sm">Condition Immunities</h4>
              <div className="text-slate-300 text-sm">{creature.condition_immunities.join(', ')}</div>
            </div>
          )}
        </div>
      )}

      {/* Senses and Languages */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-slate-700/50 rounded-lg p-3">
          <h4 className="text-white font-semibold mb-2 text-sm">Senses</h4>
          <div className="text-slate-300 text-sm">
            {creature.senses.darkvision && <div>Darkvision {creature.senses.darkvision}</div>}
            {creature.senses.truesight && <div>Truesight {creature.senses.truesight}</div>}
            <div>Passive Perception {creature.senses.passive_perception}</div>
          </div>
        </div>
        
        <div className="bg-slate-700/50 rounded-lg p-3">
          <h4 className="text-white font-semibold mb-2 text-sm">Languages</h4>
          <div className="text-slate-300 text-sm">
            {creature.languages.length > 0 ? creature.languages.join(', ') : 'None'}
          </div>
        </div>
      </div>

      {/* Traits */}
      {creature.traits && creature.traits.length > 0 && (
        <div>
          <h4 className="text-white font-semibold mb-2">Traits</h4>
          <div className="space-y-2">
            {creature.traits.map((trait, index) => (
              <div key={index} className="bg-slate-700/50 rounded-lg p-3">
                <div className="font-semibold text-purple-400">{trait.name}</div>
                <div className="text-sm text-slate-300 mt-1">{trait.description}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      {creature.actions && creature.actions.length > 0 && (
        <div>
          <h4 className="text-white font-semibold mb-2">Actions</h4>
          <div className="space-y-2">
            {creature.actions.map((action, index) => (
              <div key={index} className="bg-slate-700/50 rounded-lg p-3">
                <div className="font-semibold text-emerald-400">{action.name}</div>
                <div className="text-sm text-slate-300 mt-1">{action.description}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bonus Actions */}
      {creature.bonus_actions && creature.bonus_actions.length > 0 && (
        <div>
          <h4 className="text-white font-semibold mb-2">Bonus Actions</h4>
          <div className="space-y-2">
            {creature.bonus_actions.map((action, index) => (
              <div key={index} className="bg-slate-700/50 rounded-lg p-3">
                <div className="font-semibold text-yellow-400">{action.name}</div>
                <div className="text-sm text-slate-300 mt-1">{action.description}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reactions */}
      {creature.reactions && creature.reactions.length > 0 && (
        <div>
          <h4 className="text-white font-semibold mb-2">Reactions</h4>
          <div className="space-y-2">
            {creature.reactions.map((reaction, index) => (
              <div key={index} className="bg-slate-700/50 rounded-lg p-3">
                <div className="font-semibold text-cyan-400">{reaction.name}</div>
                <div className="text-sm text-slate-300 mt-1">{reaction.description}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Legendary Actions */}
      {creature.legendary_actions && creature.legendary_actions.length > 0 && (
        <div>
          <h4 className="text-white font-semibold mb-2">Legendary Actions</h4>
          <div className="space-y-2">
            {creature.legendary_actions.map((action, index) => (
              <div key={index} className="bg-slate-700/50 rounded-lg p-3">
                <div className="font-semibold text-orange-400">{action.name}</div>
                <div className="text-sm text-slate-300 mt-1">{action.description}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Add Participant Modal Component
function AddParticipantModal({ 
  type, 
  onAdd, 
  onClose 
}: { 
  type: 'player' | 'creature';
  onAdd: (participant: Omit<CombatParticipant, 'id'>) => void;
  onClose: () => void;
}) {
  const [initiative, setInitiative] = useState(0);
  const [selectedCreature, setSelectedCreature] = useState<any>(null);
  const [selectedCharacter, setSelectedCharacter] = useState<PlayerCharacter | null>(null);
  const [characters, setCharacters] = useState<PlayerCharacter[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [hp, setHp] = useState(10);
  const [maxHp, setMaxHp] = useState(10);

  // Load characters from localStorage
  useEffect(() => {
    if (type === 'player') {
      try {
        const savedCharacters = localStorage.getItem('obojima-characters');
        if (savedCharacters) {
          const parsed = JSON.parse(savedCharacters);
          const charactersWithDates = parsed.map((char: any) => ({
            ...char,
            createdAt: new Date(char.createdAt),
            updatedAt: new Date(char.updatedAt)
          }));
          setCharacters(charactersWithDates);
        }
      } catch (error) {
        console.error('Error loading characters:', error);
      }
    }
  }, [type]);

  const filteredCreatures = creatures.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredCharacters = characters.filter(c => 
    c.characterName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.playerName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = () => {
    if (type === 'player' && selectedCharacter) {
      onAdd({
        name: selectedCharacter.characterName,
        type: 'player',
        initiative,
        playerClass: selectedCharacter.class,
        ac: selectedCharacter.armorClass,
        hp,
        maxHp,
        characterData: selectedCharacter,
        imageUrl: selectedCharacter.imageUrl
      });
      onClose();
    } else if (type === 'creature' && selectedCreature) {
      onAdd({
        name: selectedCreature.name,
        type: 'creature',
        initiative,
        creatureData: selectedCreature,
        ac: selectedCreature.ac,
        hp: selectedCreature.hp,
        maxHp: selectedCreature.hp
      });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 rounded-lg p-6 w-full max-w-md max-h-[80vh] overflow-y-auto">
        <h3 className="text-xl font-bold text-white mb-4">
          Add {type === 'player' ? 'Player' : 'Creature'}
        </h3>

        <div className="space-y-4">
          {type === 'player' ? (
            <>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Search Characters</label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                  placeholder="Search by character or player name..."
                />
              </div>

              <div className="max-h-48 overflow-y-auto border border-slate-600 rounded-lg">
                {filteredCharacters.length > 0 ? (
                  filteredCharacters.map((character) => (
                    <button
                      key={character.id}
                      onClick={() => setSelectedCharacter(character)}
                      className={`w-full px-3 py-3 text-left hover:bg-slate-700 transition-colors border-b border-slate-700 last:border-b-0 ${
                        selectedCharacter?.id === character.id ? 'bg-emerald-900/50' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-600 flex-shrink-0">
                          {character.imageUrl ? (
                            <img
                              src={character.imageUrl}
                              alt={character.characterName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400">
                              <UserIcon className="h-6 w-6" />
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="text-white font-medium">{character.characterName}</div>
                          <div className="text-slate-400 text-sm">
                            {character.playerName} • {character.class} • AC {character.armorClass}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="p-4 text-center text-slate-400">
                    <UserIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <div>No characters found</div>
                    <div className="text-xs mt-1">
                      {characters.length === 0 
                        ? 'Create characters in the Player Characters tab first'
                        : 'Try adjusting your search terms'
                      }
                    </div>
                  </div>
                )}
              </div>

              {selectedCharacter && (
                <div className="bg-slate-700/50 rounded-lg p-3">
                  <div className="text-white font-semibold">{selectedCharacter.characterName}</div>
                  <div className="text-sm text-slate-400">
                    {selectedCharacter.class} • AC {selectedCharacter.armorClass} • Player: {selectedCharacter.playerName}
                  </div>
                </div>
              )}

              {selectedCharacter && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Current HP</label>
                    <input
                      type="number"
                      value={hp}
                      onChange={(e) => setHp(parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Max HP</label>
                    <input
                      type="number"
                      value={maxHp}
                      onChange={(e) => setMaxHp(parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                    />
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Search Creatures</label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                  placeholder="Search by name..."
                />
              </div>

              <div className="max-h-48 overflow-y-auto border border-slate-600 rounded-lg">
                {filteredCreatures.map((creature) => (
                  <button
                    key={creature.name}
                    onClick={() => setSelectedCreature(creature)}
                    className={`w-full px-3 py-2 text-left hover:bg-slate-700 transition-colors ${
                      selectedCreature?.name === creature.name ? 'bg-emerald-900/50' : ''
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <img
                        src={getCreatureImagePath(creature.name)}
                        alt={creature.name}
                        className="w-8 h-8 rounded"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/images/creatures/default-creature.svg';
                        }}
                      />
                      <span className="text-white">{creature.name}</span>
                      <span className="text-slate-400 text-sm ml-auto">CR {creature.cr}</span>
                    </div>
                  </button>
                ))}
              </div>

              {selectedCreature && (
                <div className="bg-slate-700/50 rounded-lg p-3">
                  <div className="text-white font-semibold">{selectedCreature.name}</div>
                  <div className="text-sm text-slate-400">
                    AC {selectedCreature.ac} • HP {selectedCreature.hp} • CR {selectedCreature.cr}
                  </div>
                </div>
              )}
            </>
          )}

          <div>
            <label className="block text-sm text-slate-400 mb-1">Initiative Roll</label>
            <input
              type="number"
              value={initiative}
              onChange={(e) => setInitiative(parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
              placeholder="Roll + modifier"
            />
          </div>
        </div>

        <div className="flex gap-2 mt-6">
          <button
            onClick={handleSubmit}
            disabled={type === 'player' ? !selectedCharacter : !selectedCreature}
            className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
          >
            Add {type === 'player' ? 'Player' : 'Creature'}
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}