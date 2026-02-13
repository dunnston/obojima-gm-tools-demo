'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { creatures, Creature, Encounter } from '@/data/creatures';
import { PlayerCharacter } from '@/data/characters';
import { getImportedCreatures } from '@/utils/creatureImport';
import { syncService } from '@/services/sync';
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

const INITIATIVE_STORAGE_KEY = 'obojima-initiative-state';

export default function InitiativeTracker() {
  const [participants, setParticipants] = useState<CombatParticipant[]>([]);
  const [combatStarted, setCombatStarted] = useState(false);
  const [currentTurn, setCurrentTurn] = useState(0);
  const [round, setRound] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addType, setAddType] = useState<'player' | 'creature'>('player');
  const [availableCreatures, setAvailableCreatures] = useState<Creature[]>(creatures);
  const [isInitialized, setIsInitialized] = useState(false);
  const { t } = useTranslation();

  // Load creatures from all sources (database + static + imported)
  const loadCreatures = async () => {
    try {
      // Load modified creatures from sync service
      const savedCreatures = await syncService.syncWithFallback('user-creatures', 'modifiedCreatures');

      // Combine original creatures with imported creatures
      const importedCreatures = getImportedCreatures();
      const allBaseCreatures = [
        ...creatures,
        ...importedCreatures.filter(imported => !creatures.find(original => original.name === imported.name))
      ];

      // Apply modifications to creatures and add new ones
      const allCreatures = [
        ...allBaseCreatures.map(creature => {
          const modified = savedCreatures?.find((c: any) => c.name === creature.name);
          return modified || creature;
        }),
        // Add completely new creatures that don't exist in base data
        ...(savedCreatures?.filter((modified: any) =>
          !allBaseCreatures.find(original => original.name === modified.name)) || [])
      ];

      setAvailableCreatures(allCreatures);
    } catch (error) {
      console.error('Error loading creatures:', error);
      // Fallback to base creatures if loading fails
      setAvailableCreatures(creatures);
    }
  };

  // Load saved initiative state on mount
  useEffect(() => {
    try {
      const savedState = localStorage.getItem(INITIATIVE_STORAGE_KEY);
      if (savedState) {
        const { participants: savedParticipants, combatStarted: savedCombatStarted, currentTurn: savedCurrentTurn, round: savedRound } = JSON.parse(savedState);
        if (savedParticipants && savedParticipants.length > 0) {
          setParticipants(savedParticipants);
          setCombatStarted(savedCombatStarted || false);
          setCurrentTurn(savedCurrentTurn || 0);
          setRound(savedRound || 1);
        }
      }
    } catch (error) {
      console.error('Error loading saved initiative state:', error);
    }
    setIsInitialized(true);
  }, []);

  // Save initiative state whenever it changes
  useEffect(() => {
    if (!isInitialized) return; // Don't save during initial load

    try {
      const stateToSave = {
        participants,
        combatStarted,
        currentTurn,
        round
      };
      localStorage.setItem(INITIATIVE_STORAGE_KEY, JSON.stringify(stateToSave));
    } catch (error) {
      console.error('Error saving initiative state:', error);
    }
  }, [participants, combatStarted, currentTurn, round, isInitialized]);

  // Load creatures and check for pending encounter on mount
  useEffect(() => {
    loadCreatures();

    const pendingEncounterData = localStorage.getItem('pendingEncounter');
    if (pendingEncounterData) {
      try {
        const { encounterId, playerIds } = JSON.parse(pendingEncounterData);
        loadEncounterAndPlayers(encounterId, playerIds);
        localStorage.removeItem('pendingEncounter');
      } catch (error) {
        console.error('Error loading pending encounter:', error);
      }
    }

    // Auto-refresh creatures when window gains focus (e.g., after editing in Database tab)
    const handleFocus = () => {
      loadCreatures();
    };

    // Also refresh on visibility change (for tab switches)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        loadCreatures();
      }
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

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

  const updateParticipantHP = (id: string, newHp: number) => {
    setParticipants(participants.map(p => 
      p.id === id ? { ...p, hp: Math.max(0, newHp) } : p
    ));
  };

  const healParticipant = (id: string, amount: number) => {
    setParticipants(participants.map(p => 
      p.id === id ? { ...p, hp: Math.min((p.maxHp || 100), (p.hp || 0) + amount) } : p
    ));
  };

  const damageParticipant = (id: string, amount: number) => {
    setParticipants(participants.map(p => 
      p.id === id ? { ...p, hp: Math.max(0, (p.hp || 0) - amount) } : p
    ));
  };

  const startCombat = () => {
    if (participants.length < 2) {
      alert(t('initiative.addTwoParticipants'));
      return;
    }
    setCombatStarted(true);
    setCurrentTurn(0);
    setRound(1);
  };

  const nextTurn = () => {
    let nextIndex = currentTurn + 1;
    let newRound = round;
    
    // If we've reached the end of the list, go to the beginning and increment round
    if (nextIndex >= sortedParticipants.length) {
      nextIndex = 0;
      newRound = round + 1;
    }
    
    // Skip dead participants
    let attempts = 0;
    while (attempts < sortedParticipants.length && (sortedParticipants[nextIndex]?.hp || 0) <= 0) {
      nextIndex++;
      attempts++;
      
      if (nextIndex >= sortedParticipants.length) {
        nextIndex = 0;
        if (attempts === 0) newRound++; // Only increment round if we wrapped around
      }
    }
    
    // If all participants are dead, end combat
    if (attempts >= sortedParticipants.length) {
      alert(t('initiative.allDefeated'));
      endCombat();
      return;
    }
    
    setCurrentTurn(nextIndex);
    setRound(newRound);
  };

  const endCombat = () => {
    setCombatStarted(false);
    setCurrentTurn(0);
    setRound(1);
    setParticipants([]);
    // Clear saved state when combat ends
    localStorage.removeItem(INITIATIVE_STORAGE_KEY);
  };

  const loadEncounterAndPlayers = (encounterId: string, playerIds: string[]) => {
    // Load encounter from localStorage
    const savedEncounters = localStorage.getItem('obojima-encounters');
    if (!savedEncounters) return;

    try {
      const encounters: Encounter[] = JSON.parse(savedEncounters);
      const encounter = encounters.find(e => e.id === encounterId);
      if (!encounter) return;

      // Load player characters
      const savedCharacters = localStorage.getItem('obojima-characters');
      let characters: PlayerCharacter[] = [];
      if (savedCharacters) {
        characters = JSON.parse(savedCharacters);
      }

      const newParticipants: CombatParticipant[] = [];

      // Add players
      playerIds.forEach(playerId => {
        const character = characters.find(c => c.id === playerId);
        if (character) {
          newParticipants.push({
            id: `player-${Date.now()}-${Math.random()}`,
            name: character.characterName,
            type: 'player',
            initiative: Math.floor(Math.random() * 20) + 1, // Random initiative for now
            ac: character.armorClass,
            hp: character.hitPoints || 0,
            maxHp: character.maxHitPoints || 0,
            imageUrl: character.imageUrl,
            playerClass: character.class,
            characterData: character
          });
        }
      });

      // Add creatures from encounter
      encounter.creatures.forEach(creatureGroup => {
        for (let i = 0; i < creatureGroup.count; i++) {
          const creature = creatureGroup.creature;
          const hp = parseInt(creature.hit_points.split(' ')[0]) || 10; // Parse HP from string like "45 (7d6 + 21)"
          
          newParticipants.push({
            id: `creature-${Date.now()}-${Math.random()}-${i}`,
            name: creatureGroup.count > 1 ? `${creature.name} ${i + 1}` : creature.name,
            type: 'creature',
            initiative: Math.floor(Math.random() * 20) + 1, // Random initiative for now
            ac: creature.armor_class,
            hp: hp,
            maxHp: hp,
            imageUrl: creature.imageUrl || getCreatureImagePath(creature.name),
            creatureData: creature
          });
        }
      });

      setParticipants(newParticipants);
    } catch (error) {
      console.error('Error loading encounter and players:', error);
    }
  };

  return (
    <div className="flex h-full">
      {/* Left Panel - Initiative Order */}
      <div className="w-1/2 bg-slate-800/50 p-6 border-r border-slate-700">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-white">{t('initiative.initiativeOrder')}</h2>
            {combatStarted && (
              <div className="text-sm text-slate-400">
                {t('initiative.round')} {round}
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
                  {t('initiative.addPlayer')}
                </button>
                <button
                  onClick={() => { setAddType('creature'); setShowAddModal(true); }}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                >
                  <UserPlusIcon className="h-4 w-4" />
                  {t('initiative.addCreature')}
                </button>
                <button
                  onClick={startCombat}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors ml-auto"
                >
                  <PlayIcon className="h-4 w-4" />
                  {t('initiative.startCombat')}
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={nextTurn}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
                >
                  <ForwardIcon className="h-4 w-4" />
                  {t('initiative.nextTurn')}
                </button>
                <button
                  onClick={endCombat}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                >
                  <ArrowPathIcon className="h-4 w-4" />
                  {t('initiative.endCombat')}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Participants List */}
        <div className="space-y-2">
          {(combatStarted ? sortedParticipants : participants).map((participant, index) => {
            const isCurrent = combatStarted && index === currentTurn;
            const isDead = (participant.hp || 0) <= 0;
            return (
              <div
                key={participant.id}
                className={`p-4 rounded-lg border-2 transition-all ${
                  isDead
                    ? 'border-red-500/50 bg-red-900/20 opacity-60' 
                    : isCurrent 
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
                          src={participant.imageUrl || getCreatureImagePath(participant.name)}
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
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className={`font-semibold ${isDead ? 'text-red-400 line-through' : 'text-white'}`}>
                          {participant.name}
                        </h3>
                        {isDead && <span className="text-red-400 text-xs font-bold">💀 {t('initiative.dead')}</span>}
                      </div>
                      <div className="text-sm text-slate-400">
                        {participant.type === 'player' && participant.playerClass && (
                          <span>{t('initiative.level')} {participant.level} {participant.playerClass}</span>
                        )}
                        {participant.type === 'creature' && (
                          <span>{t('initiative.creature')}</span>
                        )}
                      </div>
                      {/* HP Bar */}
                      {combatStarted && participant.hp !== undefined && participant.maxHp && (
                        <div className="mt-2">
                          <div className="flex justify-between text-xs text-slate-400 mb-1">
                            <span>{t('initiative.hp')}</span>
                            <span>{participant.hp}/{participant.maxHp}</span>
                          </div>
                          <div className="w-full bg-slate-600 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full transition-all ${
                                isDead ? 'bg-red-500' : 
                                (participant.hp / participant.maxHp) < 0.25 ? 'bg-red-500' :
                                (participant.hp / participant.maxHp) < 0.5 ? 'bg-yellow-500' : 'bg-green-500'
                              }`}
                              style={{ width: `${Math.max(0, (participant.hp / participant.maxHp) * 100)}%` }}
                            />
                          </div>
                        </div>
                      )}
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
                          placeholder={t('initiative.init')}
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
                        <div className="flex items-center gap-1">
                          <BoltIcon className="h-4 w-4 text-yellow-400" />
                          <span className="text-white font-bold text-sm">{participant.initiative}</span>
                        </div>
                        
                        {/* Compact HP Controls */}
                        {participant.hp !== undefined && participant.maxHp && (
                          <HPControls 
                            participant={participant}
                            onUpdateHP={updateParticipantHP}
                            onHeal={healParticipant}
                            onDamage={damageParticipant}
                          />
                        )}
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
              <p>{t('initiative.noParticipants')}</p>
              <p className="text-sm mt-2">{t('initiative.noParticipantsSubtitle')}</p>
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
              <h2 className="text-3xl font-bold text-white mb-2">{currentParticipant.name}{t('initiative.currentTurn')}</h2>
              <div className="text-slate-400">{t('initiative.round')} {round}</div>
            </div>

            {/* Image */}
            <div className="flex justify-center">
              <div className="w-48 h-48 rounded-full overflow-hidden bg-slate-700 border-4 border-emerald-400">
                {currentParticipant.type === 'creature' ? (
                  <img
                    src={currentParticipant.imageUrl || getCreatureImagePath(currentParticipant.name)}
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
              <PlayerDetails 
                participant={currentParticipant} 
                onUpdateHP={updateParticipantHP}
                onHeal={healParticipant}
                onDamage={damageParticipant}
              />
            ) : (
              <CreatureDetails 
                participant={currentParticipant} 
                onUpdateHP={updateParticipantHP}
                onHeal={healParticipant}
                onDamage={damageParticipant}
              />
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-slate-400">
            <div className="text-center">
              <BoltIcon className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-xl">{t('initiative.noActiveCombat')}</p>
              <p className="text-sm mt-2">{t('initiative.startCombatToSee')}</p>
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
          availableCreatures={availableCreatures}
        />
      )}
    </div>
  );
}

// Player Details Component
function PlayerDetails({ 
  participant, 
  onUpdateHP, 
  onHeal, 
  onDamage 
}: { 
  participant: CombatParticipant;
  onUpdateHP: (id: string, newHp: number) => void;
  onHeal: (id: string, amount: number) => void;
  onDamage: (id: string, amount: number) => void;
}) {
  const [hpInput, setHpInput] = useState('');
  const [healAmount, setHealAmount] = useState('');
  const [damageAmount, setDamageAmount] = useState('');
  const { t } = useTranslation();
  return (
    <div className="bg-slate-800/50 rounded-lg p-6 space-y-4">
      <h3 className="text-xl font-semibold text-white mb-4">{t('initiative.playerDetails')}</h3>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-700/50 rounded-lg p-4">
          <div className="flex items-center gap-2 text-slate-400 mb-1">
            <UserIcon className="h-4 w-4" />
            <span className="text-sm">{t('initiative.class')}</span>
          </div>
          <div className="text-white font-semibold">
            {participant.playerClass || t('initiative.unknown')} ({t('initiative.level')} {participant.level || 1})
          </div>
        </div>

        <div className="bg-slate-700/50 rounded-lg p-4">
          <div className="flex items-center gap-2 text-slate-400 mb-1">
            <ShieldCheckIcon className="h-4 w-4" />
            <span className="text-sm">{t('initiative.armorClass')}</span>
          </div>
          <div className="text-white font-semibold text-2xl">
            {participant.ac || '—'}
          </div>
        </div>

        <div className="bg-slate-700/50 rounded-lg p-4 col-span-2">
          <div className="flex items-center gap-2 text-slate-400 mb-1">
            <HeartIcon className="h-4 w-4" />
            <span className="text-sm">{t('initiative.hitPoints')}</span>
          </div>
          <div className="text-white font-semibold text-2xl">
            {participant.hp || 0} / {participant.maxHp || 0}
          </div>
          {participant.maxHp && participant.hp !== undefined && (
            <div className="mt-2 w-full bg-slate-600 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all ${
                  (participant.hp || 0) <= 0 ? 'bg-red-500' :
                  (participant.hp / participant.maxHp) < 0.25 ? 'bg-red-500' :
                  (participant.hp / participant.maxHp) < 0.5 ? 'bg-yellow-500' : 'bg-green-500'
                }`}
                style={{ width: `${Math.max(0, (participant.hp / participant.maxHp) * 100)}%` }}
              />
            </div>
          )}
        </div>
      </div>

      {/* HP Controls */}
      <div className="bg-slate-700/50 rounded-lg p-4">
        <h4 className="text-white font-semibold mb-3">{t('initiative.healthManagement')}</h4>
        
        {/* Direct HP Set */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          <input
            type="number"
            value={hpInput}
            onChange={(e) => setHpInput(e.target.value)}
            placeholder={t('initiative.setHp')}
            className="px-3 py-2 bg-slate-600 border border-slate-500 rounded text-white text-sm"
            min="0"
            max={participant.maxHp || 100}
          />
          <button
            onClick={() => {
              const newHp = parseInt(hpInput);
              if (!isNaN(newHp)) {
                onUpdateHP(participant.id, newHp);
                setHpInput('');
              }
            }}
            className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors"
          >
            {t('initiative.setHp')}
          </button>
          <button
            onClick={() => onUpdateHP(participant.id, participant.maxHp || 100)}
            className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded text-sm transition-colors"
          >
            {t('initiative.fullHeal')}
          </button>
        </div>

        {/* Heal/Damage */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <input
              type="number"
              value={healAmount}
              onChange={(e) => setHealAmount(e.target.value)}
              placeholder={t('initiative.healAmount')}
              className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded text-white text-sm"
              min="1"
            />
            <button
              onClick={() => {
                const heal = parseInt(healAmount);
                if (!isNaN(heal) && heal > 0) {
                  onHeal(participant.id, heal);
                  setHealAmount('');
                }
              }}
              className="w-full px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded text-sm transition-colors"
            >
              ❤️ {t('initiative.heal')}
            </button>
          </div>
          
          <div className="space-y-2">
            <input
              type="number"
              value={damageAmount}
              onChange={(e) => setDamageAmount(e.target.value)}
              placeholder={t('initiative.damageAmount')}
              className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded text-white text-sm"
              min="1"
            />
            <button
              onClick={() => {
                const damage = parseInt(damageAmount);
                if (!isNaN(damage) && damage > 0) {
                  onDamage(participant.id, damage);
                  setDamageAmount('');
                }
              }}
              className="w-full px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded text-sm transition-colors"
            >
              ⚔️ {t('initiative.damage')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Creature Details Component
function CreatureDetails({ 
  participant, 
  onUpdateHP, 
  onHeal, 
  onDamage 
}: { 
  participant: CombatParticipant;
  onUpdateHP: (id: string, newHp: number) => void;
  onHeal: (id: string, amount: number) => void;
  onDamage: (id: string, amount: number) => void;
}) {
  const [hpInput, setHpInput] = useState('');
  const [healAmount, setHealAmount] = useState('');
  const [damageAmount, setDamageAmount] = useState('');
  const { t } = useTranslation();
  const creature = participant.creatureData;
  
  if (!creature) return null;

  return (
    <div className="bg-slate-800/50 rounded-lg p-6 space-y-4 max-h-[calc(100vh-400px)] overflow-y-auto">
      <h3 className="text-xl font-semibold text-white mb-4">{t('initiative.creatureStats')}</h3>
      
      {/* Basic Info */}
      <div className="bg-slate-700/50 rounded-lg p-4 mb-4">
        <div className="text-center">
          <div className="text-lg font-semibold text-white">{creature.name}</div>
          <div className="text-slate-400 text-sm">
            {creature.size} {creature.type}, {creature.alignment}
          </div>
          <div className="text-slate-400 text-sm mt-1">
            {t('initiative.challengeRating')}: {creature.challenge_rating} ({t('initiative.proficiency')}: +{creature.proficiency_bonus})
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
          <div className="text-white font-bold text-xl">
            {participant.hp || 0} / {participant.maxHp || 0}
          </div>
          <div className="text-slate-400 text-xs mt-1">{creature.hit_points}</div>
        </div>
        <div className="bg-slate-700/50 rounded-lg p-3 text-center">
          <div className="text-slate-400 text-sm">{t('initiative.speed')}</div>
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

      {/* HP Controls */}
      <div className="bg-slate-700/50 rounded-lg p-4">
        <h4 className="text-white font-semibold mb-3">{t('initiative.healthManagement')}</h4>
        
        {/* HP Bar */}
        {participant.maxHp && participant.hp !== undefined && (
          <div className="mb-3">
            <div className="w-full bg-slate-600 rounded-full h-3">
              <div 
                className={`h-3 rounded-full transition-all ${
                  (participant.hp || 0) <= 0 ? 'bg-red-500' :
                  (participant.hp / participant.maxHp) < 0.25 ? 'bg-red-500' :
                  (participant.hp / participant.maxHp) < 0.5 ? 'bg-yellow-500' : 'bg-green-500'
                }`}
                style={{ width: `${Math.max(0, (participant.hp / participant.maxHp) * 100)}%` }}
              />
            </div>
          </div>
        )}
        
        {/* Direct HP Set */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          <input
            type="number"
            value={hpInput}
            onChange={(e) => setHpInput(e.target.value)}
            placeholder={t('initiative.setHp')}
            className="px-3 py-2 bg-slate-600 border border-slate-500 rounded text-white text-sm"
            min="0"
            max={participant.maxHp || 100}
          />
          <button
            onClick={() => {
              const newHp = parseInt(hpInput);
              if (!isNaN(newHp)) {
                onUpdateHP(participant.id, newHp);
                setHpInput('');
              }
            }}
            className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors"
          >
            {t('initiative.setHp')}
          </button>
          <button
            onClick={() => onUpdateHP(participant.id, participant.maxHp || 100)}
            className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded text-sm transition-colors"
          >
            {t('initiative.fullHeal')}
          </button>
        </div>

        {/* Heal/Damage */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <input
              type="number"
              value={healAmount}
              onChange={(e) => setHealAmount(e.target.value)}
              placeholder={t('initiative.healAmount')}
              className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded text-white text-sm"
              min="1"
            />
            <button
              onClick={() => {
                const heal = parseInt(healAmount);
                if (!isNaN(heal) && heal > 0) {
                  onHeal(participant.id, heal);
                  setHealAmount('');
                }
              }}
              className="w-full px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded text-sm transition-colors"
            >
              ❤️ {t('initiative.heal')}
            </button>
          </div>
          
          <div className="space-y-2">
            <input
              type="number"
              value={damageAmount}
              onChange={(e) => setDamageAmount(e.target.value)}
              placeholder={t('initiative.damageAmount')}
              className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded text-white text-sm"
              min="1"
            />
            <button
              onClick={() => {
                const damage = parseInt(damageAmount);
                if (!isNaN(damage) && damage > 0) {
                  onDamage(participant.id, damage);
                  setDamageAmount('');
                }
              }}
              className="w-full px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded text-sm transition-colors"
            >
              ⚔️ {t('initiative.damage')}
            </button>
          </div>
        </div>
      </div>

      {/* Skills and Saves */}
      {(creature.skills || creature.saving_throws) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {creature.saving_throws && Object.keys(creature.saving_throws).length > 0 && (
            <div className="bg-slate-700/50 rounded-lg p-3">
              <h4 className="text-white font-semibold mb-2 text-sm">{t('initiative.savingThrows')}</h4>
              <div className="text-slate-300 text-sm">
                {Object.entries(creature.saving_throws).map(([save, bonus]) => 
                  `${save.toUpperCase()} +${bonus}`
                ).join(', ')}
              </div>
            </div>
          )}
          
          {creature.skills && Object.keys(creature.skills).length > 0 && (
            <div className="bg-slate-700/50 rounded-lg p-3">
              <h4 className="text-white font-semibold mb-2 text-sm">{t('initiative.skills')}</h4>
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
              <h4 className="text-orange-400 font-semibold mb-1 text-sm">{t('initiative.damageResistances')}</h4>
              <div className="text-slate-300 text-sm">{creature.damage_resistances.join(', ')}</div>
            </div>
          )}
          
          {creature.damage_immunities && creature.damage_immunities.length > 0 && (
            <div className="bg-slate-700/50 rounded-lg p-3">
              <h4 className="text-green-400 font-semibold mb-1 text-sm">{t('initiative.damageImmunities')}</h4>
              <div className="text-slate-300 text-sm">{creature.damage_immunities.join(', ')}</div>
            </div>
          )}
          
          {creature.damage_vulnerabilities && creature.damage_vulnerabilities.length > 0 && (
            <div className="bg-slate-700/50 rounded-lg p-3">
              <h4 className="text-red-400 font-semibold mb-1 text-sm">{t('initiative.damageVulnerabilities')}</h4>
              <div className="text-slate-300 text-sm">{creature.damage_vulnerabilities.join(', ')}</div>
            </div>
          )}
          
          {creature.condition_immunities && creature.condition_immunities.length > 0 && (
            <div className="bg-slate-700/50 rounded-lg p-3">
              <h4 className="text-blue-400 font-semibold mb-1 text-sm">{t('initiative.conditionImmunities')}</h4>
              <div className="text-slate-300 text-sm">{creature.condition_immunities.join(', ')}</div>
            </div>
          )}
        </div>
      )}

      {/* Senses and Languages */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-slate-700/50 rounded-lg p-3">
          <h4 className="text-white font-semibold mb-2 text-sm">{t('initiative.senses')}</h4>
          <div className="text-slate-300 text-sm">
            {creature.senses.darkvision && <div>Darkvision {creature.senses.darkvision}</div>}
            {creature.senses.truesight && <div>Truesight {creature.senses.truesight}</div>}
            <div>{t('initiative.passivePerception')} {creature.senses.passive_perception}</div>
          </div>
        </div>
        
        <div className="bg-slate-700/50 rounded-lg p-3">
          <h4 className="text-white font-semibold mb-2 text-sm">{t('initiative.languages')}</h4>
          <div className="text-slate-300 text-sm">
            {creature.languages.length > 0 ? creature.languages.join(', ') : t('initiative.none')}
          </div>
        </div>
      </div>

      {/* Traits */}
      {creature.traits && creature.traits.length > 0 && (
        <div>
          <h4 className="text-white font-semibold mb-2">{t('initiative.traits')}</h4>
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
          <h4 className="text-white font-semibold mb-2">{t('initiative.actions')}</h4>
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
          <h4 className="text-white font-semibold mb-2">{t('initiative.bonusActions')}</h4>
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
          <h4 className="text-white font-semibold mb-2">{t('initiative.reactions')}</h4>
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
          <h4 className="text-white font-semibold mb-2">{t('initiative.legendaryActions')}</h4>
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
  onClose,
  availableCreatures
}: {
  type: 'player' | 'creature';
  onAdd: (participant: Omit<CombatParticipant, 'id'>) => void;
  onClose: () => void;
  availableCreatures: Creature[];
}) {
  const [initiative, setInitiative] = useState(0);
  const [selectedCreature, setSelectedCreature] = useState<any>(null);
  const [selectedCharacter, setSelectedCharacter] = useState<PlayerCharacter | null>(null);
  const [characters, setCharacters] = useState<PlayerCharacter[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [hp, setHp] = useState(10);
  const [maxHp, setMaxHp] = useState(10);
  const { t } = useTranslation();

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

  // Auto-populate HP when a character is selected
  useEffect(() => {
    if (selectedCharacter && type === 'player') {
      setHp(selectedCharacter.hitPoints || 10);
      setMaxHp(selectedCharacter.maxHitPoints || 10);
    }
  }, [selectedCharacter, type]);

  const filteredCreatures = availableCreatures.filter(c =>
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
      // Parse max HP from hit_points string (e.g., "67 (9d8 + 27)")
      const maxHpMatch = selectedCreature.hit_points.match(/^(\d+)/);
      const maxHp = maxHpMatch ? parseInt(maxHpMatch[1]) : 1;
      
      onAdd({
        name: selectedCreature.name,
        type: 'creature',
        initiative,
        creatureData: selectedCreature,
        ac: selectedCreature.armor_class,
        hp: maxHp,
        maxHp: maxHp
      });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 rounded-lg p-6 w-full max-w-md max-h-[80vh] overflow-y-auto">
        <h3 className="text-xl font-bold text-white mb-4">
          {t('initiative.addParticipant')} {type === 'player' ? t('initiative.player') : t('initiative.creature')}
        </h3>

        <div className="space-y-4">
          {type === 'player' ? (
            <>
              <div>
                <label className="block text-sm text-slate-400 mb-1">{t('initiative.searchCharacters')}</label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                  placeholder={t('initiative.searchCharactersPlaceholder')}
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
                    <div>{t('initiative.noCharactersFound')}</div>
                    <div className="text-xs mt-1">
                      {characters.length === 0 
                        ? t('initiative.createCharactersFirst')
                        : t('initiative.adjustSearchTerms')
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
                    <label className="block text-sm text-slate-400 mb-1">{t('initiative.currentHp')}</label>
                    <input
                      type="number"
                      value={hp}
                      onChange={(e) => setHp(parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">{t('initiative.maxHp')}</label>
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
                <label className="block text-sm text-slate-400 mb-1">{t('initiative.searchCreatures')}</label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                  placeholder={t('initiative.searchCreaturesPlaceholder')}
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
                        src={creature.imageUrl || getCreatureImagePath(creature.name)}
                        alt={creature.name}
                        className="w-8 h-8 rounded"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/images/creatures/default-creature.svg';
                        }}
                      />
                      <span className="text-white">{creature.name}</span>
                      <span className="text-slate-400 text-sm ml-auto">CR {creature.challenge_rating}</span>
                    </div>
                  </button>
                ))}
              </div>

              {selectedCreature && (
                <div className="bg-slate-700/50 rounded-lg p-3">
                  <div className="text-white font-semibold">{selectedCreature.name}</div>
                  <div className="text-sm text-slate-400">
                    AC {selectedCreature.armor_class} • HP {selectedCreature.hit_points} • CR {selectedCreature.challenge_rating}
                  </div>
                </div>
              )}
            </>
          )}

          <div>
            <label className="block text-sm text-slate-400 mb-1">{t('initiative.initiativeRoll')}</label>
            <input
              type="number"
              value={initiative}
              onChange={(e) => setInitiative(parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
              placeholder={t('initiative.rollModifier')}
            />
          </div>
        </div>

        <div className="flex gap-2 mt-6">
          <button
            onClick={handleSubmit}
            disabled={type === 'player' ? !selectedCharacter : !selectedCreature}
            className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
          >
            {t('initiative.addParticipant')} {type === 'player' ? t('initiative.player') : t('initiative.creature')}
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition-colors"
          >
            {t('buttons.cancel')}
          </button>
        </div>
      </div>
    </div>
  );
}

// Compact HP Controls Component
function HPControls({ 
  participant, 
  onUpdateHP, 
  onHeal, 
  onDamage 
}: { 
  participant: CombatParticipant;
  onUpdateHP: (id: string, newHp: number) => void;
  onHeal: (id: string, amount: number) => void;
  onDamage: (id: string, amount: number) => void;
}) {
  const [showControls, setShowControls] = useState(false);
  const [damageAmount, setDamageAmount] = useState('');
  const [healAmount, setHealAmount] = useState('');
  const { t } = useTranslation();

  const handleDamage = () => {
    const damage = parseInt(damageAmount);
    if (!isNaN(damage) && damage > 0) {
      onDamage(participant.id, damage);
      setDamageAmount('');
      setShowControls(false);
    }
  };

  const handleHeal = () => {
    const heal = parseInt(healAmount);
    if (!isNaN(heal) && heal > 0) {
      onHeal(participant.id, heal);
      setHealAmount('');
      setShowControls(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent, action: 'damage' | 'heal') => {
    if (e.key === 'Enter') {
      if (action === 'damage') {
        handleDamage();
      } else {
        handleHeal();
      }
    }
  };

  if (!showControls) {
    return (
      <button
        onClick={() => setShowControls(true)}
        className="px-2 py-1 bg-slate-600 hover:bg-slate-500 text-white rounded text-xs transition-colors"
        title={t('initiative.modifyHp')}
      >
        ❤️
      </button>
    );
  }

  return (
    <div className="flex items-center gap-1 bg-slate-800 rounded-lg p-2 border border-slate-600">
      {/* Damage */}
      <div className="flex items-center gap-1">
        <input
          type="number"
          value={damageAmount}
          onChange={(e) => setDamageAmount(e.target.value)}
          onKeyPress={(e) => handleKeyPress(e, 'damage')}
          placeholder="DMG"
          className="w-12 px-1 py-1 bg-slate-700 border border-slate-600 rounded text-white text-xs text-center"
          min="1"
          autoFocus
        />
        <button
          onClick={handleDamage}
          className="px-1 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs transition-colors"
          title={t('initiative.dealDamage')}
        >
          ⚔️
        </button>
      </div>

      {/* Heal */}
      <div className="flex items-center gap-1">
        <input
          type="number"
          value={healAmount}
          onChange={(e) => setHealAmount(e.target.value)}
          onKeyPress={(e) => handleKeyPress(e, 'heal')}
          placeholder="HEAL"
          className="w-12 px-1 py-1 bg-slate-700 border border-slate-600 rounded text-white text-xs text-center"
          min="1"
        />
        <button
          onClick={handleHeal}
          className="px-1 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs transition-colors"
          title={t('initiative.heal')}
        >
          ❤️
        </button>
      </div>

      {/* Close */}
      <button
        onClick={() => {
          setShowControls(false);
          setDamageAmount('');
          setHealAmount('');
        }}
        className="px-1 py-1 bg-slate-600 hover:bg-slate-500 text-white rounded text-xs transition-colors ml-1"
        title={t('buttons.close')}
      >
        ✕
      </button>
    </div>
  );
}