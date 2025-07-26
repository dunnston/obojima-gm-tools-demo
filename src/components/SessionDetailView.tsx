'use client';

import { useState, useRef } from 'react';
import { 
  GameSession, 
  SessionScene, 
  SessionNPC, 
  SessionMusic, 
  SessionTreasure, 
  SessionSecretClue,
  SessionCreature,
  createEmptyScene,
  createEmptyNPC,
  createEmptySecretClue
} from '@/data/sessions';
import { PlayerCharacter } from '@/data/characters';
import { creatures } from '@/data/creatures';
import { Encounter } from '@/data/creatures';
import { combatPotions, utilityPotions, whimsyPotions } from '@/data/potions';
import { ingredients } from '@/data/ingredients';
import { magicItems } from '@/data/magicItems';
import { 
  PlusIcon, 
  PlayIcon, 
  PauseIcon,
  PencilIcon, 
  EyeIcon,
  TrashIcon,
  CalendarIcon,
  UserGroupIcon,
  MusicalNoteIcon,
  SparklesIcon,
  GiftIcon,
  DocumentTextIcon,
  EyeSlashIcon,
  BoltIcon,
  BookOpenIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  FireIcon,
  ArrowUpTrayIcon,
  CheckIcon
} from '@heroicons/react/24/outline';

interface SessionDetailViewProps {
  session: GameSession;
  characters: PlayerCharacter[];
  savedEncounters: Encounter[];
  onUpdateSession: (sessionId: string, updates: Partial<GameSession>) => void;
  onNavigateToInitiative?: () => void;
}

export default function SessionDetailView({ 
  session, 
  characters, 
  savedEncounters,
  onUpdateSession,
  onNavigateToInitiative 
}: SessionDetailViewProps) {
  const [editingScene, setEditingScene] = useState<SessionScene | null>(null);
  const [viewingScene, setViewingScene] = useState<SessionScene | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['scenes', 'players']));
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentMusic, setCurrentMusic] = useState<SessionMusic | null>(null);
  const [showEncounterModal, setShowEncounterModal] = useState(false);
  const [showCreatureSelector, setShowCreatureSelector] = useState(false);
  const [viewingCreature, setViewingCreature] = useState<string | null>(null);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(section)) {
        newSet.delete(section);
      } else {
        newSet.add(section);
      }
      return newSet;
    });
  };

  const handleAddScene = () => {
    const newScene: SessionScene = {
      id: `scene-${Date.now()}-${Math.random()}`,
      ...createEmptyScene(session.scenes.length),
      title: `Scene ${session.scenes.length + 1}`
    };
    
    onUpdateSession(session.id, {
      scenes: [...session.scenes, newScene]
    });
    setEditingScene(newScene);
  };

  const handleUpdateScene = (sceneId: string, updates: Partial<SessionScene>) => {
    const updatedScenes = session.scenes.map(scene => 
      scene.id === sceneId ? { ...scene, ...updates } : scene
    );
    onUpdateSession(session.id, { scenes: updatedScenes });
  };

  const handleDeleteScene = (sceneId: string) => {
    if (confirm('Are you sure you want to delete this scene?')) {
      const updatedScenes = session.scenes.filter(scene => scene.id !== sceneId);
      onUpdateSession(session.id, { scenes: updatedScenes });
    }
  };

  const handleReorderScenes = (sceneId: string, direction: 'up' | 'down') => {
    const currentIndex = session.scenes.findIndex(s => s.id === sceneId);
    if (currentIndex === -1) return;
    
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= session.scenes.length) return;
    
    const newScenes = [...session.scenes];
    [newScenes[currentIndex], newScenes[newIndex]] = [newScenes[newIndex], newScenes[currentIndex]];
    
    // Update order values
    newScenes.forEach((scene, index) => {
      scene.order = index;
    });
    
    onUpdateSession(session.id, { scenes: newScenes });
  };

  const handleAddNPC = () => {
    const newNPC: SessionNPC = {
      id: `npc-${Date.now()}-${Math.random()}`,
      ...createEmptyNPC(),
      name: 'New NPC'
    };
    
    onUpdateSession(session.id, {
      npcs: [...session.npcs, newNPC]
    });
  };

  const handleAddCreature = () => {
    setShowCreatureSelector(true);
  };

  const handleAddSecretClue = () => {
    const newSecret: SessionSecretClue = {
      id: `secret-${Date.now()}-${Math.random()}`,
      ...createEmptySecretClue(),
      title: 'New Secret'
    };
    
    onUpdateSession(session.id, {
      secretsAndClues: [...session.secretsAndClues, newSecret]
    });
  };

  const handleRevealSecret = (secretId: string, playerId?: string) => {
    const updatedSecrets = session.secretsAndClues.map(secret => {
      if (secret.id === secretId) {
        const revealed = true;
        const revealedToPlayers = playerId && !secret.revealedToPlayers?.includes(playerId)
          ? [...(secret.revealedToPlayers || []), playerId]
          : secret.revealedToPlayers;
        
        return { ...secret, revealed, revealedToPlayers };
      }
      return secret;
    });
    
    onUpdateSession(session.id, { secretsAndClues: updatedSecrets });
  };

  const handleAddEncounter = (encounterId: string) => {
    if (!session.encounters.includes(encounterId)) {
      onUpdateSession(session.id, {
        encounters: [...session.encounters, encounterId]
      });
    }
    setShowEncounterModal(false);
  };

  const handleRemoveEncounter = (encounterId: string) => {
    onUpdateSession(session.id, {
      encounters: session.encounters.filter(id => id !== encounterId)
    });
  };

  const handlePlayMusic = (music: SessionMusic) => {
    if (currentMusic?.id === music.id && audioRef.current && !audioRef.current.paused) {
      audioRef.current.pause();
      setCurrentMusic(null);
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      
      audioRef.current = new Audio(music.url || '');
      audioRef.current.play();
      setCurrentMusic(music);
      
      audioRef.current.onended = () => {
        setCurrentMusic(null);
      };
    }
  };

  const loadEncounterToInitiative = (encounterId: string) => {
    // Store encounter info in localStorage
    localStorage.setItem('pendingEncounter', JSON.stringify({
      encounterId,
      playerIds: session.playerCharacters
    }));
    
    // Navigate to initiative tracker using parent navigation function
    if (onNavigateToInitiative) {
      onNavigateToInitiative();
    }
  };

  const getPlayerCharacter = (playerId: string) => {
    return characters.find(c => c.id === playerId);
  };

  return (
    <div className="space-y-6">
      {/* Player Characters Section */}
      <Section 
        title="Player Characters"
        icon={UserGroupIcon}
        count={session.playerCharacters.length}
        expanded={expandedSections.has('players')}
        onToggle={() => toggleSection('players')}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {session.playerCharacters.map(playerId => {
            const character = getPlayerCharacter(playerId);
            if (!character) return null;
            
            return (
              <PlayerCard key={playerId} character={character} />
            );
          })}
        </div>
      </Section>

      {/* Strong Start Section */}
      <Section 
        title="Strong Start"
        icon={BoltIcon}
        expanded={expandedSections.has('strongStart')}
        onToggle={() => toggleSection('strongStart')}
      >
        <textarea
          value={session.strongStart}
          onChange={(e) => onUpdateSession(session.id, { strongStart: e.target.value })}
          placeholder="How will you kick off this session with energy and excitement?"
          className="w-full h-32 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 resize-none focus:outline-none focus:border-emerald-400"
        />
      </Section>

      {/* Secrets & Clues Section */}
      <Section 
        title="Secrets & Clues"
        icon={EyeSlashIcon}
        count={session.secretsAndClues.length}
        expanded={expandedSections.has('secrets')}
        onToggle={() => toggleSection('secrets')}
        onAdd={handleAddSecretClue}
      >
        <div className="space-y-3">
          {session.secretsAndClues.map(secret => (
            <SecretClueCard 
              key={secret.id}
              secret={secret}
              characters={characters.filter(c => session.playerCharacters.includes(c.id))}
              onReveal={handleRevealSecret}
              onUpdate={(updates) => {
                const updatedSecrets = session.secretsAndClues.map(s => 
                  s.id === secret.id ? { ...s, ...updates } : s
                );
                onUpdateSession(session.id, { secretsAndClues: updatedSecrets });
              }}
              onDelete={() => {
                if (confirm('Delete this secret?')) {
                  const updatedSecrets = session.secretsAndClues.filter(s => s.id !== secret.id);
                  onUpdateSession(session.id, { secretsAndClues: updatedSecrets });
                }
              }}
            />
          ))}
        </div>
      </Section>

      {/* Scenes Section */}
      <Section 
        title="Scenes"
        icon={DocumentTextIcon}
        count={session.scenes.length}
        expanded={expandedSections.has('scenes')}
        onToggle={() => toggleSection('scenes')}
        onAdd={handleAddScene}
      >
        <div className="space-y-3">
          {session.scenes.map((scene, index) => (
            <SceneCard 
              key={scene.id}
              scene={scene}
              index={index}
              total={session.scenes.length}
              onEdit={() => setEditingScene(scene)}
              onView={() => setViewingScene(scene)}
              onDelete={() => handleDeleteScene(scene.id)}
              onReorder={handleReorderScenes}
            />
          ))}
        </div>
      </Section>

      {/* Encounters Section */}
      <Section 
        title="Encounters"
        icon={SparklesIcon}
        count={session.encounters.length}
        expanded={expandedSections.has('encounters')}
        onToggle={() => toggleSection('encounters')}
        onAdd={() => setShowEncounterModal(true)}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {session.encounters.map(encounterId => {
            const encounter = savedEncounters.find(e => e.id === encounterId);
            if (!encounter) return null;
            
            return (
              <EncounterCard 
                key={encounterId}
                encounter={encounter}
                onLoad={() => loadEncounterToInitiative(encounterId)}
                onRemove={() => handleRemoveEncounter(encounterId)}
              />
            );
          })}
        </div>
      </Section>

      {/* NPCs Section */}
      <Section 
        title="NPCs"
        icon={UserGroupIcon}
        count={session.npcs.length}
        expanded={expandedSections.has('npcs')}
        onToggle={() => toggleSection('npcs')}
        onAdd={handleAddNPC}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {session.npcs.map(npc => (
            <NPCCard 
              key={npc.id}
              npc={npc}
              onUpdate={(updates) => {
                const updatedNPCs = session.npcs.map(n => 
                  n.id === npc.id ? { ...n, ...updates } : n
                );
                onUpdateSession(session.id, { npcs: updatedNPCs });
              }}
              onDelete={() => {
                if (confirm('Delete this NPC?')) {
                  const updatedNPCs = session.npcs.filter(n => n.id !== npc.id);
                  onUpdateSession(session.id, { npcs: updatedNPCs });
                }
              }}
            />
          ))}
        </div>
      </Section>

      {/* Creatures Section */}
      <Section 
        title="Creatures"
        icon={FireIcon}
        count={session.creatures?.length || 0}
        expanded={expandedSections.has('creatures')}
        onToggle={() => toggleSection('creatures')}
        onAdd={handleAddCreature}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(session.creatures || []).map(creature => (
            <CreatureCard 
              key={creature.id}
              creature={creature}
              onView={() => setViewingCreature(creature.creatureName)}
              onUpdate={(updates) => {
                const updatedCreatures = (session.creatures || []).map(c => 
                  c.id === creature.id ? { ...c, ...updates } : c
                );
                onUpdateSession(session.id, { creatures: updatedCreatures });
              }}
              onDelete={() => {
                if (confirm('Remove this creature from the session?')) {
                  const updatedCreatures = (session.creatures || []).filter(c => c.id !== creature.id);
                  onUpdateSession(session.id, { creatures: updatedCreatures });
                }
              }}
            />
          ))}
        </div>
      </Section>

      {/* Music Section */}
      <Section 
        title="Music"
        icon={MusicalNoteIcon}
        count={session.music.length}
        expanded={expandedSections.has('music')}
        onToggle={() => toggleSection('music')}
      >
        <MusicManager 
          music={session.music}
          currentMusic={currentMusic}
          onPlay={handlePlayMusic}
          onAdd={(newMusic) => {
            onUpdateSession(session.id, {
              music: [...session.music, newMusic]
            });
          }}
          onDelete={(musicId) => {
            const updatedMusic = session.music.filter(m => m.id !== musicId);
            onUpdateSession(session.id, { music: updatedMusic });
          }}
        />
      </Section>

      {/* Treasure Section */}
      <Section 
        title="Treasure"
        icon={GiftIcon}
        count={session.treasure.length}
        expanded={expandedSections.has('treasure')}
        onToggle={() => toggleSection('treasure')}
      >
        <TreasureManager 
          treasure={session.treasure}
          onAdd={(newTreasure) => {
            onUpdateSession(session.id, {
              treasure: [...session.treasure, newTreasure]
            });
          }}
          onUpdate={(treasureId, updates) => {
            const updatedTreasure = session.treasure.map(t => 
              t.id === treasureId ? { ...t, ...updates } : t
            );
            onUpdateSession(session.id, { treasure: updatedTreasure });
          }}
          onDelete={(treasureId) => {
            const updatedTreasure = session.treasure.filter(t => t.id !== treasureId);
            onUpdateSession(session.id, { treasure: updatedTreasure });
          }}
        />
      </Section>

      {/* Session Notes */}
      <Section 
        title="Session Notes"
        icon={BookOpenIcon}
        expanded={expandedSections.has('notes')}
        onToggle={() => toggleSection('notes')}
      >
        <textarea
          value={session.sessionNotes}
          onChange={(e) => onUpdateSession(session.id, { sessionNotes: e.target.value })}
          placeholder="Record what happens during the session..."
          className="w-full h-48 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 resize-none focus:outline-none focus:border-emerald-400"
        />
      </Section>

      {/* Scene Edit Modal */}
      {editingScene && (
        <SceneEditModal
          scene={editingScene}
          savedEncounters={savedEncounters}
          sessionMusic={session.music}
          sessionNPCs={session.npcs}
          sessionTreasure={session.treasure}
          onSave={(updates) => {
            handleUpdateScene(editingScene.id, updates);
            setEditingScene(null);
          }}
          onClose={() => setEditingScene(null)}
        />
      )}

      {/* Scene View Modal */}
      {viewingScene && (
        <SceneViewModal
          scene={viewingScene}
          currentMusic={currentMusic}
          savedEncounters={savedEncounters}
          onClose={() => setViewingScene(null)}
          onEdit={() => {
            setEditingScene(viewingScene);
            setViewingScene(null);
          }}
          onPlayMusic={handlePlayMusic}
          onLoadEncounter={loadEncounterToInitiative}
        />
      )}

      {/* Encounter Selection Modal */}
      {showEncounterModal && (
        <EncounterSelectionModal
          encounters={savedEncounters}
          selectedEncounters={session.encounters}
          onAdd={handleAddEncounter}
          onClose={() => setShowEncounterModal(false)}
        />
      )}

      {/* Creature Selection Modal */}
      {showCreatureSelector && (
        <CreatureSelectionModal
          onAdd={(creatureName, quantity, context, notes) => {
            const newCreature: SessionCreature = {
              id: `creature-${Date.now()}-${Math.random()}`,
              creatureName,
              quantity,
              context,
              notes
            };
            onUpdateSession(session.id, {
              creatures: [...(session.creatures || []), newCreature]
            });
            setShowCreatureSelector(false);
          }}
          onClose={() => setShowCreatureSelector(false)}
        />
      )}

      {/* Creature Details Modal */}
      {viewingCreature && (
        <CreatureDetailsModal
          creatureName={viewingCreature}
          onClose={() => setViewingCreature(null)}
        />
      )}
    </div>
  );
}

// Section Component
function Section({ 
  title, 
  icon: Icon, 
  count, 
  expanded, 
  onToggle, 
  onAdd, 
  children 
}: {
  title: string;
  icon: any;
  count?: number;
  expanded: boolean;
  onToggle: () => void;
  onAdd?: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-slate-800/50 rounded-lg overflow-hidden">
      <div 
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-700/50 transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-center gap-3">
          <Icon className="h-5 w-5 text-slate-400" />
          <h2 className="text-lg font-semibold text-white">{title}</h2>
          {count !== undefined && (
            <span className="px-2 py-1 bg-slate-700 rounded-full text-xs text-slate-400">
              {count}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {onAdd && expanded && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAdd();
              }}
              className="p-1 text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              <PlusIcon className="h-5 w-5" />
            </button>
          )}
          {expanded ? (
            <ChevronUpIcon className="h-5 w-5 text-slate-400" />
          ) : (
            <ChevronDownIcon className="h-5 w-5 text-slate-400" />
          )}
        </div>
      </div>
      
      {expanded && (
        <div className="p-4 pt-0">
          {children}
        </div>
      )}
    </div>
  );
}

// Player Card Component
function PlayerCard({ character }: { character: PlayerCharacter }) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <>
      <div 
        className="bg-slate-700/50 rounded-lg p-4 cursor-pointer hover:bg-slate-700 transition-colors"
        onClick={() => setShowDetails(true)}
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-600">
            {character.imageUrl ? (
              <img 
                src={character.imageUrl} 
                alt={character.characterName}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-400">
                <UserGroupIcon className="h-8 w-8" />
              </div>
            )}
          </div>
          <div>
            <h3 className="font-semibold text-white">{character.characterName}</h3>
            <p className="text-sm text-slate-400">{character.class} • AC {character.armorClass}</p>
          </div>
        </div>
      </div>

      {showDetails && (
        <PlayerDetailModal 
          character={character}
          onClose={() => setShowDetails(false)}
        />
      )}
    </>
  );
}

function CreatureCard({ 
  creature, 
  onView, 
  onUpdate, 
  onDelete 
}: { 
  creature: SessionCreature;
  onView: () => void;
  onUpdate: (updates: Partial<SessionCreature>) => void;
  onDelete: () => void;
}) {
  const creatureData = creatures.find(c => c.name === creature.creatureName);
  
  return (
    <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-white">{creature.creatureName}</h3>
            {creature.quantity && creature.quantity > 1 && (
              <span className="px-2 py-1 bg-slate-600 text-xs rounded text-slate-300">
                ×{creature.quantity}
              </span>
            )}
          </div>
          {creatureData && (
            <p className="text-sm text-slate-400">
              {creatureData.type} • CR {creatureData.challenge_rating}
            </p>
          )}
          {creature.context && (
            <p className="text-xs text-emerald-400 mt-1">{creature.context}</p>
          )}
        </div>
        
        <div className="flex items-center gap-1">
          <button
            onClick={onView}
            className="p-1 text-slate-400 hover:text-white hover:bg-slate-600 rounded transition-colors"
            title="View Details"
          >
            <EyeIcon className="h-4 w-4" />
          </button>
          <button
            onClick={onDelete}
            className="p-1 text-slate-400 hover:text-red-400 hover:bg-slate-600 rounded transition-colors"
            title="Remove"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
      
      {creature.notes && (
        <div className="text-sm text-slate-300 bg-slate-800/50 rounded p-2 mb-3">
          {creature.notes}
        </div>
      )}
      
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-4 text-slate-400">
          {creatureData && (
            <>
              <span>AC {creatureData.armor_class}</span>
              <span>HP {creatureData.hit_points}</span>
            </>
          )}
        </div>
        <button
          onClick={() => {
            const newQuantity = prompt('Quantity:', creature.quantity?.toString() || '1');
            const newNotes = prompt('Notes:', creature.notes || '');
            const newContext = prompt('Context:', creature.context || '');
            
            if (newQuantity !== null) {
              onUpdate({
                quantity: parseInt(newQuantity) || 1,
                notes: newNotes || undefined,
                context: newContext || undefined
              });
            }
          }}
          className="px-2 py-1 bg-slate-600 hover:bg-slate-500 text-white rounded transition-colors"
        >
          Edit
        </button>
      </div>
    </div>
  );
}

import { SceneCard, SecretClueCard, EncounterCard, NPCCard, MusicManager, TreasureManager } from './SessionComponents';
import { SceneEditModal, SceneViewModal, PlayerDetailModal, EncounterSelectionModal, CreatureSelectionModal, CreatureDetailsModal } from './SessionModals';