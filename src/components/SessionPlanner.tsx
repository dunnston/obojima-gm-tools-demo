'use client';

import { useState, useEffect } from 'react';
import { GameSession, SessionScene, SessionNPC, SessionMusic, SessionTreasure, SessionSecretClue, createEmptySession } from '@/data/sessions';
import { PlayerCharacter } from '@/data/characters';
import { creatures, Encounter } from '@/data/creatures';
import { syncService } from '@/services/sync';
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
  ArrowPathIcon
} from '@heroicons/react/24/outline';

export default function SessionPlanner({ onPageChange }: { onPageChange?: (page: string) => void }) {
  const [sessions, setSessions] = useState<GameSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<GameSession | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [characters, setCharacters] = useState<PlayerCharacter[]>([]);
  const [encounters, setEncounters] = useState<Encounter[]>([]);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'error'>('idle');
  
  // Validator for session data
  const validateSession = (session: any): GameSession => ({
    ...session,
    date: new Date(session.date),
    createdAt: new Date(session.createdAt),
    updatedAt: new Date(session.updatedAt),
    // Ensure all arrays exist with defaults
    playerCharacters: session.playerCharacters || [],
    music: session.music || [],
    secretsAndClues: session.secretsAndClues || [],
    encounters: session.encounters || [],
    npcs: session.npcs || [],
    creatures: session.creatures || [],
    treasure: session.treasure || [],
    scenes: session.scenes || []
  });

  // Validator for character data
  const validateCharacter = (char: any): PlayerCharacter => ({
    ...char,
    createdAt: new Date(char.createdAt),
    updatedAt: new Date(char.updatedAt)
  });

  // Validator for encounter data
  const validateEncounter = (encounter: any): Encounter => ({
    ...encounter,
    created_at: new Date(encounter.created_at),
    updated_at: new Date(encounter.updated_at)
  });

  // Load all data with sync
  const loadAllData = async () => {
    setSyncStatus('syncing');
    try {
      // Load sessions, characters, and encounters in parallel
      const [sessionData, characterData, encounterData] = await Promise.all([
        syncService.syncWithFallback('sessions', 'obojima-sessions', validateSession),
        syncService.syncWithFallback('characters', 'obojima-characters', validateCharacter),
        syncService.syncWithFallback('encounters', 'obojima-encounters', validateEncounter)
      ]);

      setSessions(sessionData);
      setCharacters(characterData);
      setEncounters(encounterData);
      setSyncStatus('idle');
    } catch (error) {
      console.error('Error loading session data:', error);
      setSyncStatus('error');
    }
  };

  // Load data on mount
  useEffect(() => {
    loadAllData();
    
    // Note: Auto-sync disabled to prevent conflicts with other components
    // Users can manually refresh using the refresh button
  }, []);

  const saveSessions = async (updatedSessions: GameSession[]) => {
    try {
      await syncService.saveWithFallback('sessions', 'obojima-sessions', updatedSessions);
      setSessions(updatedSessions);
    } catch (error) {
      console.error('Error saving sessions:', error);
      alert('Error saving session data. Data saved locally but may not sync to other devices.');
    }
  };

  const createSession = async (name: string, date: Date, playerCharacters: string[]) => {
    const newSession: GameSession = {
      id: `session-${Date.now()}-${Math.random()}`,
      ...createEmptySession(),
      name,
      date,
      playerCharacters,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const updatedSessions = [...sessions, newSession];
    await saveSessions(updatedSessions);
    setSelectedSession(newSession);
    setIsCreating(false);
  };

  const updateSession = async (sessionId: string, updates: Partial<GameSession>) => {
    const updatedSessions = sessions.map(session => 
      session.id === sessionId 
        ? { ...session, ...updates, updatedAt: new Date() }
        : session
    );
    await saveSessions(updatedSessions);
    
    if (selectedSession && selectedSession.id === sessionId) {
      setSelectedSession({ ...selectedSession, ...updates, updatedAt: new Date() });
    }
  };

  const deleteSession = async (sessionId: string) => {
    if (confirm('Are you sure you want to delete this session?')) {
      const updatedSessions = sessions.filter(session => session.id !== sessionId);
      await saveSessions(updatedSessions);
      
      if (selectedSession && selectedSession.id === sessionId) {
        setSelectedSession(null);
      }
    }
  };

  const addScene = () => {
    if (!selectedSession) return;
    
    const newScene: SessionScene = {
      id: `scene-${Date.now()}-${Math.random()}`,
      title: 'New Scene',
      description: '',
      readAloudText: '',
      music: [],
      npcs: [],
      encounters: [],
      treasure: [],
      notes: '',
      order: selectedSession.scenes?.length || 0
    };

    updateSession(selectedSession.id, {
      scenes: [...(selectedSession.scenes || []), newScene]
    });
  };

  if (!selectedSession) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-white mb-2">Session Planner</h1>
              {/* Minimal sync status indicator */}
              {syncStatus === 'syncing' && (
                <ArrowPathIcon className="h-5 w-5 text-blue-400 animate-spin" />
              )}
              {syncStatus === 'error' && (
                <span className="text-xs text-amber-400">Offline</span>
              )}
            </div>
            <p className="text-slate-400">Plan and manage your tabletop RPG sessions</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={loadAllData}
              className="p-2 text-slate-400 hover:text-white transition-colors"
              title="Refresh"
            >
              <ArrowPathIcon className="h-5 w-5" />
            </button>
            <button
              onClick={() => setIsCreating(true)}
              className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-colors"
            >
              <PlusIcon className="h-5 w-5" />
              New Session
            </button>
          </div>
        </div>

        {/* Session List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sessions.map((session) => (
            <div
              key={session.id}
              className="bg-slate-800/50 rounded-lg p-6 border border-slate-700 hover:border-emerald-400/50 transition-all cursor-pointer"
              onClick={() => setSelectedSession(session)}
            >
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-xl font-semibold text-white">{session.name}</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  session.status === 'completed' ? 'bg-green-500/20 text-green-300' :
                  session.status === 'in-progress' ? 'bg-yellow-500/20 text-yellow-300' :
                  'bg-slate-500/20 text-slate-300'
                }`}>
                  {session.status}
                </span>
              </div>
              
              <div className="space-y-2 text-sm text-slate-400">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4" />
                  {session.date.toLocaleDateString()}
                </div>
                <div className="flex items-center gap-2">
                  <UserGroupIcon className="h-4 w-4" />
                  {session.playerCharacters?.length || 0} players
                </div>
                <div className="flex items-center gap-2">
                  <DocumentTextIcon className="h-4 w-4" />
                  {session.scenes?.length || 0} scenes
                </div>
              </div>

              <div className="flex justify-end mt-4">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteSession(session.id);
                  }}
                  className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}

          {sessions.length === 0 && (
            <div className="col-span-full text-center py-12">
              <DocumentTextIcon className="h-16 w-16 text-slate-400 mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-semibold text-white mb-2">No Sessions Yet</h3>
              <p className="text-slate-400 mb-6">Create your first session to start planning your campaign</p>
              <button
                onClick={() => setIsCreating(true)}
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-colors"
              >
                Create First Session
              </button>
            </div>
          )}
        </div>

        {/* Create Session Modal */}
        {isCreating && (
          <CreateSessionModal
            characters={characters}
            onCreate={createSession}
            onClose={() => setIsCreating(false)}
          />
        )}
      </div>
    );
  }

  // Session Detail View
  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Session Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSelectedSession(null)}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
          >
            ←
          </button>
          <div>
            <h1 className="text-3xl font-bold text-white">{selectedSession.name}</h1>
            <div className="flex items-center gap-4 text-slate-400 mt-1">
              <span>{selectedSession.date.toLocaleDateString()}</span>
              <span>{selectedSession.playerCharacters?.length || 0} players</span>
              <span className={`px-2 py-1 rounded-full text-xs ${
                selectedSession.status === 'completed' ? 'bg-green-500/20 text-green-300' :
                selectedSession.status === 'in-progress' ? 'bg-yellow-500/20 text-yellow-300' :
                'bg-slate-500/20 text-slate-300'
              }`}>
                {selectedSession.status}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => updateSession(selectedSession.id, { 
              status: selectedSession.status === 'in-progress' ? 'planned' : 'in-progress' 
            })}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedSession.status === 'in-progress'
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
            }`}
          >
            {selectedSession.status === 'in-progress' ? (
              <>
                <PauseIcon className="h-4 w-4 inline mr-2" />
                End Session
              </>
            ) : (
              <>
                <PlayIcon className="h-4 w-4 inline mr-2" />
                Start Session
              </>
            )}
          </button>
        </div>
      </div>

      {/* Session Content */}
      <SessionDetailView 
        session={selectedSession}
        characters={characters}
        savedEncounters={encounters}
        onUpdateSession={updateSession}
        onNavigateToInitiative={() => onPageChange?.('initiative')}
      />
    </div>
  );
}

// Create Session Modal Component
function CreateSessionModal({ 
  characters, 
  onCreate, 
  onClose 
}: { 
  characters: PlayerCharacter[];
  onCreate: (name: string, date: Date, playerCharacters: string[]) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedCharacters, setSelectedCharacters] = useState<string[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onCreate(name.trim(), new Date(date), selectedCharacters);
    }
  };

  const toggleCharacter = (characterId: string) => {
    setSelectedCharacters(prev => 
      prev.includes(characterId)
        ? prev.filter(id => id !== characterId)
        : [...prev, characterId]
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 rounded-lg p-6 w-full max-w-md">
        <h3 className="text-xl font-bold text-white mb-4">Create New Session</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1">Session Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
              placeholder="Session 1: The Adventure Begins"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-1">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-2">Player Characters</label>
            <div className="max-h-40 overflow-y-auto border border-slate-600 rounded-lg">
              {characters.length > 0 ? (
                characters.map((character) => (
                  <label
                    key={character.id}
                    className="flex items-center gap-3 p-3 hover:bg-slate-700 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedCharacters.includes(character.id)}
                      onChange={() => toggleCharacter(character.id)}
                      className="rounded border-slate-600 bg-slate-700 text-emerald-600 focus:ring-emerald-500"
                    />
                    <div>
                      <div className="text-white font-medium">{character.characterName}</div>
                      <div className="text-slate-400 text-sm">{character.playerName} • {character.class}</div>
                    </div>
                  </label>
                ))
              ) : (
                <div className="p-4 text-center text-slate-400">
                  <UserGroupIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <div>No characters found</div>
                  <div className="text-xs mt-1">Create characters in the Player Characters tab first</div>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <button
              type="submit"
              disabled={!name.trim()}
              className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
            >
              Create Session
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

import SessionDetailView from './SessionDetailView';