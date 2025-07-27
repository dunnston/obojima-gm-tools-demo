'use client';

import { useState, useEffect } from 'react';
import { GameSession, Chapter } from '@/data/sessions';
import { PlayerCharacter } from '@/data/characters';
import SessionForm from './SessionForm';
import ChapterForm from './ChapterForm';
import { 
  BookOpenIcon, 
  PlusIcon, 
  PencilIcon, 
  TrashIcon,
  CalendarIcon,
  UserGroupIcon,
  ChevronRightIcon,
  DocumentTextIcon,
  PlayIcon
} from '@heroicons/react/24/outline';

export default function GMNotes() {
  const [sessions, setSessions] = useState<GameSession[]>([]);
  const [characters, setCharacters] = useState<PlayerCharacter[]>([]);
  const [selectedSession, setSelectedSession] = useState<GameSession | null>(null);
  const [showSessionForm, setShowSessionForm] = useState(false);
  const [showChapterForm, setShowChapterForm] = useState(false);
  const [editingSession, setEditingSession] = useState<GameSession | null>(null);
  const [editingChapter, setEditingChapter] = useState<Chapter | null>(null);

  // Load data from localStorage
  useEffect(() => {
    try {
      const savedSessions = localStorage.getItem('obojima-sessions');
      if (savedSessions) {
        const parsed = JSON.parse(savedSessions);
        const sessionsWithDates = parsed.map((session: any) => ({
          ...session,
          date: new Date(session.date),
          createdAt: new Date(session.createdAt),
          updatedAt: new Date(session.updatedAt),
          chapters: session.chapters.map((chapter: any) => ({
            ...chapter,
            createdAt: new Date(chapter.createdAt),
            updatedAt: new Date(chapter.updatedAt)
          }))
        }));
        setSessions(sessionsWithDates);
      }

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
      console.error('Error loading GM Notes data:', error);
    }
  }, []);

  // Save sessions to localStorage
  const saveSessions = (updatedSessions: GameSession[]) => {
    try {
      localStorage.setItem('obojima-sessions', JSON.stringify(updatedSessions));
      setSessions(updatedSessions);
    } catch (error) {
      console.error('Error saving sessions:', error);
      alert('Error saving session data');
    }
  };

  const handleCreateSession = (sessionData: Omit<GameSession, 'id' | 'createdAt' | 'updatedAt' | 'chapters'>) => {
    const newSession: GameSession = {
      ...sessionData,
      id: Date.now().toString(),
      chapters: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const updatedSessions = [...sessions, newSession];
    saveSessions(updatedSessions);
    setShowSessionForm(false);
  };

  const handleEditSession = (sessionData: Omit<GameSession, 'id' | 'createdAt' | 'updatedAt' | 'chapters'>) => {
    if (!editingSession) return;

    const updatedSession: GameSession = {
      ...editingSession,
      ...sessionData,
      updatedAt: new Date()
    };

    const updatedSessions = sessions.map(session => 
      session.id === editingSession.id ? updatedSession : session
    );

    saveSessions(updatedSessions);
    if (selectedSession?.id === editingSession.id) {
      setSelectedSession(updatedSession);
    }
    setEditingSession(null);
    setShowSessionForm(false);
  };

  const handleDeleteSession = (sessionId: string) => {
    const session = sessions.find(s => s.id === sessionId);
    if (session && confirm(`Are you sure you want to delete "${session.name}"?`)) {
      const updatedSessions = sessions.filter(s => s.id !== sessionId);
      saveSessions(updatedSessions);
      if (selectedSession?.id === sessionId) {
        setSelectedSession(null);
      }
    }
  };

  const handleCreateChapter = (chapterData: Omit<Chapter, 'id' | 'order' | 'createdAt' | 'updatedAt'>) => {
    if (!selectedSession) return;

    const newChapter: Chapter = {
      ...chapterData,
      id: Date.now().toString(),
      order: selectedSession.chapters.length + 1,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const updatedSession = {
      ...selectedSession,
      chapters: [...selectedSession.chapters, newChapter],
      updatedAt: new Date()
    };

    const updatedSessions = sessions.map(session => 
      session.id === selectedSession.id ? updatedSession : session
    );

    saveSessions(updatedSessions);
    setSelectedSession(updatedSession);
    setShowChapterForm(false);
  };

  const handleEditChapter = (chapterData: Omit<Chapter, 'id' | 'order' | 'createdAt' | 'updatedAt'>) => {
    if (!selectedSession || !editingChapter) return;

    const updatedChapter: Chapter = {
      ...editingChapter,
      ...chapterData,
      updatedAt: new Date()
    };

    const updatedSession = {
      ...selectedSession,
      chapters: selectedSession.chapters.map(chapter => 
        chapter.id === editingChapter.id ? updatedChapter : chapter
      ),
      updatedAt: new Date()
    };

    const updatedSessions = sessions.map(session => 
      session.id === selectedSession.id ? updatedSession : session
    );

    saveSessions(updatedSessions);
    setSelectedSession(updatedSession);
    setEditingChapter(null);
    setShowChapterForm(false);
  };

  const handleDeleteChapter = (chapterId: string) => {
    if (!selectedSession) return;

    const chapter = selectedSession.chapters.find(c => c.id === chapterId);
    if (chapter && confirm(`Are you sure you want to delete "${chapter.title}"?`)) {
      const updatedChapters = selectedSession.chapters
        .filter(c => c.id !== chapterId)
        .map((chapter, index) => ({ ...chapter, order: index + 1 }));

      const updatedSession = {
        ...selectedSession,
        chapters: updatedChapters,
        updatedAt: new Date()
      };

      const updatedSessions = sessions.map(session => 
        session.id === selectedSession.id ? updatedSession : session
      );

      saveSessions(updatedSessions);
      setSelectedSession(updatedSession);
    }
  };

  const openEditSession = (session: GameSession) => {
    setEditingSession(session);
    setShowSessionForm(true);
  };

  const openEditChapter = (chapter: Chapter) => {
    setEditingChapter(chapter);
    setShowChapterForm(true);
  };

  const closeSessionForm = () => {
    setShowSessionForm(false);
    setEditingSession(null);
  };

  const closeChapterForm = () => {
    setShowChapterForm(false);
    setEditingChapter(null);
  };

  const getCharactersByIds = (characterIds: string[]) => {
    return characters.filter(char => characterIds.includes(char.id));
  };

  // If no session is selected, show session list
  if (!selectedSession) {
    return (
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <BookOpenIcon className="h-8 w-8 text-blue-400" />
            <h1 className="text-3xl font-bold text-white">GM Notes & Session Prep</h1>
          </div>
          <p className="text-slate-400">Organize your campaign sessions and prepare chapters for memorable adventures</p>
          
          <button
            onClick={() => setShowSessionForm(true)}
            className="flex items-center gap-2 mx-auto px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg"
          >
            <PlusIcon className="h-5 w-5" />
            Create New Session
          </button>
        </div>

        {/* Sessions Grid */}
        {sessions.length === 0 ? (
          <div className="text-center py-12">
            <BookOpenIcon className="h-16 w-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-400 mb-2">No Sessions Yet</h3>
            <p className="text-slate-500">Create your first session to start preparing your campaign</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sessions.map((session) => {
              const sessionCharacters = getCharactersByIds(session.characters);
              return (
                <div key={session.id} className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-2xl border border-white/10 p-6 hover:border-blue-400/30 transition-all duration-200">
                  {/* Session Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-bold text-white text-lg mb-1">{session.name}</h3>
                      <div className="flex items-center gap-2 text-sm text-slate-400 mb-2">
                        <CalendarIcon className="h-4 w-4" />
                        {session.date.toLocaleDateString()}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditSession(session)}
                        className="p-2 text-slate-400 hover:text-blue-400 transition-colors"
                        title="Edit Session"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteSession(session.id)}
                        className="p-2 text-slate-400 hover:text-red-400 transition-colors"
                        title="Delete Session"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Characters */}
                  {sessionCharacters.length > 0 && (
                    <div className="mb-4">
                      <div className="flex items-center gap-2 text-sm text-slate-400 mb-2">
                        <UserGroupIcon className="h-4 w-4" />
                        Characters ({sessionCharacters.length})
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {sessionCharacters.slice(0, 3).map((char) => (
                          <span key={char.id} className="text-xs bg-slate-700/50 px-2 py-1 rounded-full text-slate-300">
                            {char.characterName}
                          </span>
                        ))}
                        {sessionCharacters.length > 3 && (
                          <span className="text-xs bg-slate-700/50 px-2 py-1 rounded-full text-slate-300">
                            +{sessionCharacters.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Chapter Count */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                      <DocumentTextIcon className="h-4 w-4" />
                      {session.chapters.length} chapters
                    </div>
                    
                    <button
                      onClick={() => setSelectedSession(session)}
                      className="flex items-center gap-1 px-3 py-1 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-lg transition-colors text-sm"
                    >
                      <PlayIcon className="h-3 w-3" />
                      Open
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Session Form Modal */}
        {showSessionForm && (
          <SessionForm
            session={editingSession || undefined}
            characters={characters}
            onSave={editingSession ? handleEditSession : handleCreateSession}
            onCancel={closeSessionForm}
            isEditing={!!editingSession}
          />
        )}
      </div>
    );
  }

  // Show selected session details with chapters
  const sessionCharacters = getCharactersByIds(selectedSession.characters);
  
  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Session Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSelectedSession(null)}
            className="p-2 text-slate-400 hover:text-white transition-colors"
          >
            <ChevronRightIcon className="h-5 w-5 rotate-180" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-white">{selectedSession.name}</h1>
            <div className="flex items-center gap-4 text-slate-400 mt-1">
              <div className="flex items-center gap-1">
                <CalendarIcon className="h-4 w-4" />
                {selectedSession.date.toLocaleDateString()}
              </div>
              {sessionCharacters.length > 0 && (
                <div className="flex items-center gap-1">
                  <UserGroupIcon className="h-4 w-4" />
                  {sessionCharacters.length} characters
                </div>
              )}
            </div>
          </div>
        </div>
        
        <button
          onClick={() => openEditSession(selectedSession)}
          className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
        >
          <PencilIcon className="h-4 w-4" />
          Edit Session
        </button>
      </div>

      {/* Characters List */}
      {sessionCharacters.length > 0 && (
        <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <UserGroupIcon className="h-5 w-5 text-cyan-400" />
            Party Characters
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sessionCharacters.map((character) => (
              <div key={character.id} className="bg-slate-700/30 rounded-lg p-4">
                <h3 className="font-semibold text-white">{character.characterName}</h3>
                <p className="text-sm text-slate-400">{character.playerName}</p>
                <div className="flex items-center gap-4 mt-2 text-xs text-slate-300">
                  <span>{character.class}</span>
                  <span>AC {character.armorClass}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Chapters Section */}
      <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <DocumentTextIcon className="h-5 w-5 text-purple-400" />
            Chapters ({selectedSession.chapters.length})
          </h2>
          <button
            onClick={() => setShowChapterForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold rounded-lg transition-all duration-200"
          >
            <PlusIcon className="h-4 w-4" />
            New Chapter
          </button>
        </div>

        {selectedSession.chapters.length === 0 ? (
          <div className="text-center py-8">
            <DocumentTextIcon className="h-12 w-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-slate-400 mb-2">No Chapters Yet</h3>
            <p className="text-slate-500">Create your first chapter to start planning this session</p>
          </div>
        ) : (
          <div className="space-y-4">
            {selectedSession.chapters
              .sort((a, b) => a.order - b.order)
              .map((chapter, index) => (
                <div key={chapter.id} className="bg-slate-700/30 rounded-lg p-4 border border-slate-600/50">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 bg-purple-500/20 text-purple-400 rounded-full flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </span>
                      <div>
                        <h3 className="font-semibold text-white">{chapter.title || `Chapter ${index + 1}`}</h3>
                        <p className="text-xs text-slate-400">
                          Updated {chapter.updatedAt.toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditChapter(chapter)}
                        className="p-2 text-slate-400 hover:text-purple-400 transition-colors"
                        title="Edit Chapter"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteChapter(chapter.id)}
                        className="p-2 text-slate-400 hover:text-red-400 transition-colors"
                        title="Delete Chapter"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Chapter Preview */}
                  <div className="space-y-2 text-sm">
                    {chapter.overview && (
                      <p className="text-slate-300 line-clamp-2">{chapter.overview}</p>
                    )}
                    {chapter.locationInfo && (
                      <p className="text-slate-400 text-xs">📍 {chapter.locationInfo}</p>
                    )}
                    {chapter.music && (
                      <p className="text-slate-400 text-xs">🎵 {chapter.music}</p>
                    )}
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Chapter Form Modal */}
      {showChapterForm && (
        <ChapterForm
          chapter={editingChapter || undefined}
          onSave={editingChapter ? handleEditChapter : handleCreateChapter}
          onCancel={closeChapterForm}
          isEditing={!!editingChapter}
        />
      )}

      {/* Session Form Modal */}
      {showSessionForm && (
        <SessionForm
          session={editingSession || undefined}
          characters={characters}
          onSave={editingSession ? handleEditSession : handleCreateSession}
          onCancel={closeSessionForm}
          isEditing={!!editingSession}
        />
      )}
    </div>
  );
}