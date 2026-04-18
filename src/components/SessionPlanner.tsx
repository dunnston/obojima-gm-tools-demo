'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { GameSession, SessionScene, SessionNPC, SessionMusic, SessionTreasure, SessionSecretClue, createEmptySession } from '@/data/sessions';
import { PlayerCharacter } from '@/data/characters';
import { creatures, Encounter } from '@/data/creatures';
import { ObojimaDate, formatObojimaDate, SEASONS, MOON_PHASES, daysBetweenObojimaDate, obojimaDateToAbsoluteDays } from '@/data/obojimaCalendar';
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

interface SessionPlannerProps {
  onPageChange?: (page: string) => void;
  currentGameDate?: ObojimaDate;
  onGameDateChange?: (newDate: ObojimaDate) => void;
}

export default function SessionPlanner({ onPageChange, currentGameDate, onGameDateChange }: SessionPlannerProps) {
  const [sessions, setSessions] = useState<GameSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<GameSession | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditingSession, setIsEditingSession] = useState(false);
  const [characters, setCharacters] = useState<PlayerCharacter[]>([]);
  const [encounters, setEncounters] = useState<Encounter[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [npcs, setNpcs] = useState<any[]>([]);
  const [quests, setQuests] = useState<any[]>([]);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'error'>('idle');
  const { t } = useTranslation();
  
  // Validator for session data
  const validateSession = (session: any): GameSession => ({
    ...session,
    // Handle backward compatibility - if old 'date' field exists, use it as realWorldDate
    realWorldDate: new Date(session.realWorldDate || session.date),
    gameDate: session.gameDate || undefined,
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
      const [sessionData, characterData, encounterData, locationData, npcData, questData] = await Promise.all([
        syncService.syncWithFallback('sessions', 'obojima-sessions', validateSession),
        syncService.syncWithFallback('characters', 'obojima-characters', validateCharacter),
        syncService.syncWithFallback('encounters', 'obojima-encounters', validateEncounter),
        syncService.syncWithFallback('locations', 'obojima-locations'),
        syncService.syncWithFallback('npcs', 'modifiedNPCs'),
        syncService.syncWithFallback('quests', 'quests')
      ]);

      setSessions(sessionData);
      setCharacters(characterData);
      setEncounters(encounterData);
      setLocations(locationData);
      setNpcs(npcData);
      setQuests(questData);
      setSyncStatus('idle');
    } catch (error) {
      console.error('Error loading session data:', error);
      setSyncStatus('error');
    }
  };

  // Load data on mount and cleanup on unmount
  useEffect(() => {
    loadAllData();
    
    // Note: Auto-sync disabled to prevent conflicts with other components
    // Users can manually refresh using the refresh button
    
    // Cleanup debounce timeouts on unmount
    return () => {
      saveTimeouts.forEach(timeout => clearTimeout(timeout));
    };
  }, []);

  // Check and align world date with latest session whenever sessions or current date changes
  useEffect(() => {
    if (sessions.length > 0 && currentGameDate && onGameDateChange) {
      const sessionsWithGameDates = sessions.filter(s => s.gameDate);
      if (sessionsWithGameDates.length > 0) {
        // Find the latest session date (where the world should be)
        const latestSessionDate = sessionsWithGameDates.reduce((latest, session) => {
          const sessionDays = obojimaDateToAbsoluteDays(session.gameDate!);
          const latestDays = obojimaDateToAbsoluteDays(latest.gameDate!);
          return sessionDays > latestDays ? session : latest;
        }).gameDate;

        const daysDifference = daysBetweenObojimaDate(currentGameDate, latestSessionDate);
        if (daysDifference !== 0) {
          // Silently align the world date to the latest session date
          if (process.env.NODE_ENV === 'development') {
            console.log(`Auto-aligning world date from ${formatObojimaDate(currentGameDate)} to latest session ${formatObojimaDate(latestSessionDate)}`);
          }
          onGameDateChange(latestSessionDate);
        }
      }
    }
  }, [sessions, currentGameDate]);

  // Save individual session to avoid performance issues
  const saveSession = async (session: GameSession) => {
    try {
      await syncService.saveSession(session);
      setSessions(prev => {
        const filtered = prev.filter(s => s.id !== session.id);
        return [...filtered, session];
      });
    } catch (error) {
      console.error('Error saving session:', error);
      alert(t('sessions.errorSaving'));
    }
  };

  // Save all sessions (only used for bulk operations like initial creation)
  const saveSessions = async (updatedSessions: GameSession[]) => {
    try {
      for (const session of updatedSessions) {
        await syncService.saveSession(session);
      }
      setSessions(updatedSessions);
    } catch (error) {
      console.error('Error saving sessions:', error);
      alert(t('sessions.errorSaving'));
    }
  };

  const createSession = async (name: string, realWorldDate: Date, gameDate: { year: number; season: string; phase: string; day: number; cycle: number; } | undefined, playerCharacters: string[]) => {
    const newSession: GameSession = {
      id: `session-${Date.now()}-${Math.random()}`,
      ...createEmptySession(),
      name,
      realWorldDate,
      gameDate,
      playerCharacters,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Check if we need to align the world date with campaign anchor
    if (gameDate) {
      await checkAndAlignWorldDate(gameDate);
    }

    const updatedSessions = [...sessions, newSession];
    await saveSessions(updatedSessions);
    setSelectedSession(newSession);
    setIsCreating(false);
  };

  // Debounced save map to prevent excessive API calls
  const [saveTimeouts, setSaveTimeouts] = useState<Map<string, NodeJS.Timeout>>(new Map());

  // Function to determine the campaign anchor date (earliest session with game date)
  const getCampaignAnchorDate = () => {
    const sessionsWithGameDates = sessions.filter(s => s.gameDate);
    if (sessionsWithGameDates.length === 0) return null;
    
    // Find the earliest session date
    return sessionsWithGameDates.reduce((earliest, session) => {
      const sessionDays = obojimaDateToAbsoluteDays(session.gameDate!);
      const earliestDays = obojimaDateToAbsoluteDays(earliest.gameDate!);
      return sessionDays < earliestDays ? session : earliest;
    }).gameDate;
  };

  // Function to check and align world date with campaign progression
  const checkAndAlignWorldDate = async (newSessionGameDate: any) => {
    if (!newSessionGameDate || !currentGameDate || !onGameDateChange) {
      return;
    }

    try {
      // Calculate what the dates will be after adding this session
      const tempSessions = [...sessions, { gameDate: newSessionGameDate }];
      const sessionsWithGameDates = tempSessions.filter(s => s.gameDate);
      
      if (sessionsWithGameDates.length === 0) return;
      
      // Find the earliest (anchor) date and the latest (current) date
      const anchorDate = sessionsWithGameDates.reduce((earliest, session) => {
        const sessionDays = obojimaDateToAbsoluteDays(session.gameDate!);
        const earliestDays = obojimaDateToAbsoluteDays(earliest.gameDate!);
        return sessionDays < earliestDays ? session : earliest;
      }).gameDate;

      const latestSessionDate = sessionsWithGameDates.reduce((latest, session) => {
        const sessionDays = obojimaDateToAbsoluteDays(session.gameDate!);
        const latestDays = obojimaDateToAbsoluteDays(latest.gameDate!);
        return sessionDays > latestDays ? session : latest;
      }).gameDate;

      // The world date should be the latest session date, but never before the anchor
      const targetWorldDate = latestSessionDate;
      const daysDifference = daysBetweenObojimaDate(currentGameDate, targetWorldDate);
      
      if (daysDifference !== 0) {
        const isFirstSession = sessions.filter(s => s.gameDate).length === 0;
        const isNewAnchor = daysBetweenObojimaDate(currentGameDate, anchorDate) < 0; // Current date is after new anchor
        
        let message = '';
        if (isFirstSession) {
          message = `This is your first session with a game date. The campaign will begin on ${formatObojimaDate(targetWorldDate)}.\n\nThe world calendar will be set to this date.`;
        } else if (isNewAnchor) {
          message = `This session date (${formatObojimaDate(newSessionGameDate)}) creates a new campaign starting point (${formatObojimaDate(anchorDate)}).\n\nThe world calendar will be set to the latest session date: ${formatObojimaDate(targetWorldDate)}.\n\nAll existing sessions and activities will be adjusted accordingly.`;
        } else {
          message = `The world date will advance from ${formatObojimaDate(currentGameDate)} to ${formatObojimaDate(targetWorldDate)} to match your latest session.\n\nThis represents ${Math.abs(daysDifference)} days passing in the game world.`;
        }

        if (process.env.NODE_ENV === 'development') {
          console.log(`Advancing world date from ${formatObojimaDate(currentGameDate)} to ${formatObojimaDate(targetWorldDate)}`);
        }

        // Update the world date to the latest session date
        await onGameDateChange(targetWorldDate);
        
        // Show notification to user
        if (confirm(message + '\n\nWould you like to go to the Downtime Tracker to review activities?')) {
          onPageChange?.('downtime');
        }
      }
    } catch (error) {
      console.error('Error checking/aligning world date:', error);
    }
  };

  const updateSession = async (sessionId: string, updates: Partial<GameSession>) => {
    // Update local state immediately for responsive UI
    const updatedSession = sessions.find(s => s.id === sessionId);
    if (!updatedSession) return;

    const newSession = { ...updatedSession, ...updates, updatedAt: new Date() };
    
    // Update local state immediately
    setSessions(prev => prev.map(session => 
      session.id === sessionId ? newSession : session
    ));
    
    if (selectedSession && selectedSession.id === sessionId) {
      setSelectedSession(newSession);
    }

    // Debounce the actual save to server (wait 1 second after last change)
    const existingTimeout = saveTimeouts.get(sessionId);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }

    const newTimeout = setTimeout(async () => {
      await saveSession(newSession);
      setSaveTimeouts(prev => {
        const newMap = new Map(prev);
        newMap.delete(sessionId);
        return newMap;
      });
    }, 1000); // 1 second debounce

    setSaveTimeouts(prev => {
      const newMap = new Map(prev);
      newMap.set(sessionId, newTimeout);
      return newMap;
    });
  };

  const deleteSession = async (sessionId: string) => {
    if (confirm(t('sessions.confirmDelete'))) {
      try {
        // Cancel any pending saves for this session
        const existingTimeout = saveTimeouts.get(sessionId);
        if (existingTimeout) {
          clearTimeout(existingTimeout);
          setSaveTimeouts(prev => {
            const newMap = new Map(prev);
            newMap.delete(sessionId);
            return newMap;
          });
        }

        // Delete from API
        await syncService.deleteSession(sessionId);
        
        const updatedSessions = sessions.filter(session => session.id !== sessionId);
        setSessions(updatedSessions);
        
        if (selectedSession && selectedSession.id === sessionId) {
          setSelectedSession(null);
        }

        // Check if we need to recalculate the campaign anchor after deletion
        const deletedSession = sessions.find(s => s.id === sessionId);
        if (deletedSession?.gameDate) {
          // Wait a bit for state to update, then check if anchor changed
          setTimeout(async () => {
            const remainingSessions = sessions.filter(s => s.id !== sessionId);
            const remainingWithDates = remainingSessions.filter(s => s.gameDate);
            
            if (remainingWithDates.length > 0) {
              // Find the latest remaining session date (where world should be)
              const newLatestDate = remainingWithDates.reduce((latest, session) => {
                const sessionDays = obojimaDateToAbsoluteDays(session.gameDate!);
                const latestDays = obojimaDateToAbsoluteDays(latest.gameDate!);
                return sessionDays > latestDays ? session : latest;
              }).gameDate;
              
              const daysDifference = daysBetweenObojimaDate(currentGameDate, newLatestDate);
              if (daysDifference !== 0) {
                const message = `After deleting that session, the world date is now ${formatObojimaDate(newLatestDate)} (matching your latest remaining session).\n\nThe world calendar will be adjusted to match.`;
                if (process.env.NODE_ENV === 'development') {
                  console.log(`Realigning world date to latest remaining session: ${formatObojimaDate(newLatestDate)}`);
                }
                await onGameDateChange?.(newLatestDate);
                alert(message);
              }
            }
          }, 100);
        }
      } catch (error) {
        console.error('Error deleting session:', error);
        alert(t('sessions.errorDeleting'));
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
              <h1 className="text-3xl font-bold text-white mb-2">{t('sessions.title')}</h1>
              {/* Minimal sync status indicator */}
              {syncStatus === 'syncing' && (
                <ArrowPathIcon className="h-5 w-5 text-blue-400 animate-spin" />
              )}
              {syncStatus === 'error' && (
                <span className="text-xs text-amber-400">{t('sessions.offline')}</span>
              )}
            </div>
            <p className="text-slate-400">{t('sessions.subtitle')}</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={loadAllData}
              className="p-2 text-slate-400 hover:text-white transition-colors"
              title={t('sessions.refresh')}
            >
              <ArrowPathIcon className="h-5 w-5" />
            </button>
            <button
              onClick={() => setIsCreating(true)}
              className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-colors"
            >
              <PlusIcon className="h-5 w-5" />
              {t('sessions.newSession')}
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
                  {t(`sessions.status.${session.status}`)}
                </span>
              </div>
              
              <div className="space-y-2 text-sm text-slate-400">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4" />
                  {session.realWorldDate.toLocaleDateString()}
                </div>
                {session.gameDate && (
                  <div className="flex items-center gap-2 text-emerald-400">
                    <SparklesIcon className="h-4 w-4" />
                    {formatObojimaDate(session.gameDate as any)}
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <UserGroupIcon className="h-4 w-4" />
                  {session.playerCharacters?.length || 0} {t('sessions.players')}
                </div>
                <div className="flex items-center gap-2">
                  <DocumentTextIcon className="h-4 w-4" />
                  {session.scenes?.length || 0} {t('sessions.scenes')}
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
              <h3 className="text-xl font-semibold text-white mb-2">{t('sessions.noSessionsYet')}</h3>
              <p className="text-slate-400 mb-6">{t('sessions.createFirstSession')}</p>
              <button
                onClick={() => setIsCreating(true)}
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-colors"
              >
                {t('sessions.createFirstSessionButton')}
              </button>
            </div>
          )}
        </div>

        {/* Create Session Modal */}
        {isCreating && (
          <CreateSessionModal
            characters={characters}
            currentGameDate={currentGameDate}
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
              <span>{selectedSession.realWorldDate.toLocaleDateString()}</span>
              {selectedSession.gameDate && (
                <span className="text-emerald-400">
                  {t('sessions.game')}: {formatObojimaDate(selectedSession.gameDate as any)}
                </span>
              )}
              <span>{selectedSession.playerCharacters?.length || 0} {t('sessions.players')}</span>
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
            onClick={() => setIsEditingSession(true)}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-600 rounded-lg transition-colors"
            title={t('sessions.editSessionDetails')}
          >
            <PencilIcon className="h-5 w-5" />
          </button>
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
                {t('sessions.endSession')}
              </>
            ) : (
              <>
                <PlayIcon className="h-4 w-4 inline mr-2" />
                {t('sessions.startSession')}
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
        savedLocations={locations}
        savedNPCs={npcs}
        savedQuests={quests}
        onUpdateSession={updateSession}
        onNavigateToInitiative={() => onPageChange?.('initiative')}
      />

      {/* Edit Session Modal */}
      {isEditingSession && (
        <EditSessionModal
          session={selectedSession}
          characters={characters}
          currentGameDate={currentGameDate}
          onSave={async (name, realWorldDate, gameDate, playerCharacters) => {
            // Update the session first
            updateSession(selectedSession.id, {
              name,
              realWorldDate,
              gameDate,
              playerCharacters
            });
            
            // Then check if we need to align the world date with new campaign anchor
            if (gameDate) {
              // Wait a bit for state to update, then recalculate anchor
              setTimeout(async () => {
                await checkAndAlignWorldDate(gameDate);
              }, 100);
            }
            
            setIsEditingSession(false);
          }}
          onClose={() => setIsEditingSession(false)}
        />
      )}
    </div>
  );
}

// Create Session Modal Component
function CreateSessionModal({ 
  characters, 
  currentGameDate,
  onCreate, 
  onClose 
}: { 
  characters: PlayerCharacter[];
  currentGameDate?: any;
  onCreate: (name: string, realWorldDate: Date, gameDate: { year: number; season: string; phase: string; day: number; cycle: number; } | undefined, playerCharacters: string[]) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState('');
  const [realWorldDate, setRealWorldDate] = useState(new Date().toISOString().split('T')[0]);
  const [useGameDate, setUseGameDate] = useState(false);
  const [gameDate, setGameDate] = useState(
    currentGameDate || {
      year: 1,
      season: 'Spring',
      phase: 'New Moon',
      day: 1,
      cycle: 1
    }
  );
  const [selectedCharacters, setSelectedCharacters] = useState<string[]>([]);
  const { t } = useTranslation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onCreate(
        name.trim(), 
        new Date(realWorldDate), 
        useGameDate ? gameDate : undefined,
        selectedCharacters
      );
    }
  };

  const handleGameDateChange = (field: string, value: string | number) => {
    setGameDate(prev => ({
      ...prev,
      [field]: value
    }));
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
        <h3 className="text-xl font-bold text-white mb-4">{t('sessions.form.createNewSession')}</h3>
        
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
            <label className="block text-sm text-slate-400 mb-1">Real World Date</label>
            <input
              type="date"
              value={realWorldDate}
              onChange={(e) => setRealWorldDate(e.target.value)}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
              required
            />
            <p className="text-xs text-slate-500 mt-1">When you actually play this session</p>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm text-slate-400 mb-2">
              <input
                type="checkbox"
                checked={useGameDate}
                onChange={(e) => setUseGameDate(e.target.checked)}
                className="text-blue-400 focus:ring-blue-400 focus:ring-offset-0 bg-slate-700 border-slate-600 rounded"
              />
              {t('sessions.form.setGameWorldDate')}
            </label>
            
            {useGameDate && (
              <div className="bg-slate-700/50 rounded-lg p-3 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Year</label>
                    <input
                      type="number"
                      min="1"
                      value={gameDate.year}
                      onChange={(e) => handleGameDateChange('year', parseInt(e.target.value) || 1)}
                      className="w-full px-2 py-1 bg-slate-600 border border-slate-500 rounded text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Season</label>
                    <select
                      value={gameDate.season}
                      onChange={(e) => handleGameDateChange('season', e.target.value)}
                      className="w-full px-2 py-1 bg-slate-600 border border-slate-500 rounded text-white text-sm"
                    >
                      {SEASONS.map((season) => (
                        <option key={season.name} value={season.name}>{season.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Phase</label>
                    <select
                      value={gameDate.phase}
                      onChange={(e) => handleGameDateChange('phase', e.target.value)}
                      className="w-full px-2 py-1 bg-slate-600 border border-slate-500 rounded text-white text-sm"
                    >
                      {MOON_PHASES.map((phase) => (
                        <option key={phase.name} value={phase.name}>{phase.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Cycle</label>
                    <select
                      value={gameDate.cycle}
                      onChange={(e) => handleGameDateChange('cycle', parseInt(e.target.value))}
                      className="w-full px-2 py-1 bg-slate-600 border border-slate-500 rounded text-white text-sm"
                    >
                      <option value={1}>1st</option>
                      <option value={2}>2nd</option>
                      <option value={3}>3rd</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Day in Phase</label>
                  <input
                    type="number"
                    min="1"
                    max={gameDate.phase === 'New Moon' || gameDate.phase === 'Full Moon' ? 8 : 7}
                    value={gameDate.day}
                    onChange={(e) => handleGameDateChange('day', parseInt(e.target.value) || 1)}
                    className="w-full px-2 py-1 bg-slate-600 border border-slate-500 rounded text-white text-sm"
                  />
                </div>
                <div className="pt-2 border-t border-slate-600">
                  <p className="text-xs text-emerald-400">
                    Game Date: {formatObojimaDate(gameDate as any)}
                  </p>
                  {!useGameDate && currentGameDate && (
                    <p className="text-xs text-slate-400 mt-1">
                      Current: {formatObojimaDate(currentGameDate)}
                    </p>
                  )}
                </div>
              </div>
            )}
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
                  <div>{t('sessions.form.noCharactersFound')}</div>
                  <div className="text-xs mt-1">{t('sessions.form.createCharactersFirst')}</div>
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
              {t('sessions.form.createSession')}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition-colors"
            >
              {t('buttons.cancel')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

import SessionDetailView from './SessionDetailView';

// Edit Session Modal Component
function EditSessionModal({ 
  session,
  characters, 
  currentGameDate,
  onSave, 
  onClose 
}: { 
  session: GameSession;
  characters: PlayerCharacter[];
  currentGameDate?: any;
  onSave: (name: string, realWorldDate: Date, gameDate: { year: number; season: string; phase: string; day: number; cycle: number; } | undefined, playerCharacters: string[]) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState(session.name);
  const [realWorldDate, setRealWorldDate] = useState(session.realWorldDate.toISOString().split('T')[0]);
  const [useGameDate, setUseGameDate] = useState(!!session.gameDate);
  const [gameDate, setGameDate] = useState(
    session.gameDate || {
      year: 1,
      season: 'Spring',
      phase: 'New Moon',
      day: 1,
      cycle: 1
    }
  );
  const [selectedCharacters, setSelectedCharacters] = useState<string[]>(session.playerCharacters);
  const { t } = useTranslation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSave(
        name.trim(),
        new Date(realWorldDate),
        useGameDate ? gameDate : undefined,
        selectedCharacters
      );
    }
  };

  const handleGameDateChange = (field: string, value: string | number) => {
    setGameDate(prev => ({
      ...prev,
      [field]: value
    }));
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
      <div className="bg-slate-800 rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h3 className="text-xl font-bold text-white mb-4">{t('sessions.form.editSession')}</h3>
        
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
            <label className="block text-sm text-slate-400 mb-1">Real World Date</label>
            <input
              type="date"
              value={realWorldDate}
              onChange={(e) => setRealWorldDate(e.target.value)}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
              required
            />
            <p className="text-xs text-slate-500 mt-1">When you actually play this session</p>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm text-slate-400 mb-2">
              <input
                type="checkbox"
                checked={useGameDate}
                onChange={(e) => setUseGameDate(e.target.checked)}
                className="text-blue-400 focus:ring-blue-400 focus:ring-offset-0 bg-slate-700 border-slate-600 rounded"
              />
              {t('sessions.form.setGameWorldDate')}
            </label>
            
            {useGameDate && (
              <div className="bg-slate-700/50 rounded-lg p-3 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Year</label>
                    <input
                      type="number"
                      min="1"
                      value={gameDate.year}
                      onChange={(e) => handleGameDateChange('year', parseInt(e.target.value) || 1)}
                      className="w-full px-2 py-1 bg-slate-600 border border-slate-500 rounded text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Season</label>
                    <select
                      value={gameDate.season}
                      onChange={(e) => handleGameDateChange('season', e.target.value)}
                      className="w-full px-2 py-1 bg-slate-600 border border-slate-500 rounded text-white text-sm"
                    >
                      {SEASONS.map((season) => (
                        <option key={season.name} value={season.name}>{season.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Phase</label>
                    <select
                      value={gameDate.phase}
                      onChange={(e) => handleGameDateChange('phase', e.target.value)}
                      className="w-full px-2 py-1 bg-slate-600 border border-slate-500 rounded text-white text-sm"
                    >
                      {MOON_PHASES.map((phase) => (
                        <option key={phase.name} value={phase.name}>{phase.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Cycle</label>
                    <select
                      value={gameDate.cycle}
                      onChange={(e) => handleGameDateChange('cycle', parseInt(e.target.value))}
                      className="w-full px-2 py-1 bg-slate-600 border border-slate-500 rounded text-white text-sm"
                    >
                      <option value={1}>1st</option>
                      <option value={2}>2nd</option>
                      <option value={3}>3rd</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Day in Phase</label>
                  <input
                    type="number"
                    min="1"
                    max={gameDate.phase === 'New Moon' || gameDate.phase === 'Full Moon' ? 8 : 7}
                    value={gameDate.day}
                    onChange={(e) => handleGameDateChange('day', parseInt(e.target.value) || 1)}
                    className="w-full px-2 py-1 bg-slate-600 border border-slate-500 rounded text-white text-sm"
                  />
                </div>
                <div className="pt-2 border-t border-slate-600">
                  <p className="text-xs text-emerald-400">
                    Game Date: {formatObojimaDate(gameDate as any)}
                  </p>
                  {!useGameDate && currentGameDate && (
                    <p className="text-xs text-slate-400 mt-1">
                      Current: {formatObojimaDate(currentGameDate)}
                    </p>
                  )}
                </div>
              </div>
            )}
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
                  <div>{t('sessions.form.noCharactersFound')}</div>
                  <div className="text-xs mt-1">{t('sessions.form.createCharactersFirst')}</div>
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
              {t('sessions.form.saveChanges')}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition-colors"
            >
              {t('buttons.cancel')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}