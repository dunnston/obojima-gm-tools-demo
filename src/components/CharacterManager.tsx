'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { PlayerCharacter } from '@/data/characters';
import CharacterForm from './CharacterForm';
import { syncService } from '@/services/sync';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  UserIcon, 
  MagnifyingGlassIcon,
  EyeIcon,
  EyeSlashIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

export default function CharacterManager() {
  const [characters, setCharacters] = useState<PlayerCharacter[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingCharacter, setEditingCharacter] = useState<PlayerCharacter | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCharacter, setSelectedCharacter] = useState<PlayerCharacter | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'error'>('idle');
  const { t } = useTranslation();

  // Validate and fix character data structure
  const validateCharacter = (char: any): PlayerCharacter => {
    // Ensure stats object exists with all required properties
    const defaultStats = {
      strength: 10,
      dexterity: 10,
      constitution: 10,
      intelligence: 10,
      wisdom: 10,
      charisma: 10
    };
    
    return {
      ...char,
      createdAt: char.createdAt ? new Date(char.createdAt) : new Date(),
      updatedAt: char.updatedAt ? new Date(char.updatedAt) : new Date(),
      // Ensure required fields with backward compatibility
      level: char.level || 1,
      armorClass: char.armorClass || char.ac || 10,
      hitPoints: char.hitPoints || char.currentHp || char.maxHitPoints || char.maxHp || 10,
      maxHitPoints: char.maxHitPoints || char.maxHp || 10,
      passivePerception: char.passivePerception || 10,
      passiveInsight: char.passiveInsight || 10,
      passiveInvestigation: char.passiveInvestigation || 10,
      characterGoal: char.characterGoal || '',
      boons: char.boons || [],
      personalityTraits: char.personalityTraits || [],
      ideals: char.ideals || [],
      bonds: char.bonds || [],
      flaws: char.flaws || [],
      strength: char.strength || 10,
      dexterity: char.dexterity || 10,
      constitution: char.constitution || 10,
      intelligence: char.intelligence || 10,
      wisdom: char.wisdom || 10,
      charisma: char.charisma || 10,
      speed: char.speed || 30,
      proficiencyBonus: char.proficiencyBonus || 2
    };
  };

  // Load characters from API or localStorage fallback
  const loadCharacters = async () => {
    setSyncStatus('syncing');
    
    try {
      // Try to load from API first
      const result = await syncService.getCharacters();
      
      if (result.success && result.data) {
        const validatedCharacters = result.data.map(validateCharacter);
        setCharacters(validatedCharacters);
        setSyncStatus('idle');
      } else {
        // Fall back to localStorage if API fails
        const savedCharacters = localStorage.getItem('obojima-characters');
        if (savedCharacters) {
          const parsed = JSON.parse(savedCharacters);
          const validatedCharacters = parsed.map(validateCharacter);
          setCharacters(validatedCharacters);
        }
        setSyncStatus('error');
      }
    } catch (error) {
      console.error('Error loading characters:', error);
      setSyncStatus('error');
      
      // Fall back to localStorage
      try {
        const savedCharacters = localStorage.getItem('obojima-characters');
        if (savedCharacters) {
          const parsed = JSON.parse(savedCharacters);
          const validatedCharacters = parsed.map(validateCharacter);
          setCharacters(validatedCharacters);
        }
      } catch (localError) {
        console.error('Error loading from localStorage:', localError);
      }
    }
  };

  // One-time migration from localStorage to database
  const migrateFromLocalStorage = async () => {
    try {
      const migrationDone = localStorage.getItem('obojima-migration-complete');
      if (migrationDone) return;
      
      const savedCharacters = localStorage.getItem('obojima-characters');
      if (savedCharacters) {
        const parsed = JSON.parse(savedCharacters);
        if (parsed.length > 0) {
          // Validate characters before migration
          const validatedCharacters = parsed.map(validateCharacter);
          
          const response = await fetch('/api/migrate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ data: validatedCharacters, type: 'characters' })
          });
          
          if (response.ok) {
            console.log('Successfully migrated characters from localStorage');
            localStorage.setItem('obojima-migration-complete', 'true');
          }
        }
      }
    } catch (error) {
      console.error('Migration error:', error);
    }
  };

  // Initial load and set up auto-sync
  useEffect(() => {
    migrateFromLocalStorage().then(() => {
      loadCharacters();
    });
    
    // Set up polling for updates every 5 seconds
    syncService.startSync(loadCharacters, 5000);
    
    return () => {
      syncService.stopSync();
    };
  }, []);

  // Save characters to both API and localStorage
  const saveCharacters = async (updatedCharacters: PlayerCharacter[]) => {
    try {
      // Save to localStorage immediately for offline support
      localStorage.setItem('obojima-characters', JSON.stringify(updatedCharacters));
      setCharacters(updatedCharacters);
      
      // Save each character to API
      for (const character of updatedCharacters) {
        await syncService.saveCharacter(character);
      }
    } catch (error) {
      console.error('Error saving characters:', error);
      alert('Error saving character data. Data saved locally but may not sync to other devices.');
    }
  };

  const handleAddCharacter = async (characterData: Omit<PlayerCharacter, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newCharacter: PlayerCharacter = {
      ...characterData,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const updatedCharacters = [...characters, newCharacter];
    await saveCharacters(updatedCharacters);
    closeForm();
  };

  const handleEditCharacter = async (characterData: Omit<PlayerCharacter, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!editingCharacter) return;

    const updatedCharacter: PlayerCharacter = {
      ...characterData,
      id: editingCharacter.id,
      createdAt: editingCharacter.createdAt,
      updatedAt: new Date()
    };

    const updatedCharacters = characters.map(char => 
      char.id === editingCharacter.id ? updatedCharacter : char
    );

    await saveCharacters(updatedCharacters);
    closeForm();
  };

  const handleDeleteCharacter = async (characterId: string) => {
    const character = characters.find(c => c.id === characterId);
    if (character && confirm(`${t('characters.confirmDelete')} ${character.characterName}?`)) {
      const updatedCharacters = characters.filter(char => char.id !== characterId);
      await saveCharacters(updatedCharacters);
      
      // Also delete from API
      await syncService.deleteCharacter(characterId);
    }
  };

  const openEditForm = (character: PlayerCharacter) => {
    setEditingCharacter(character);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingCharacter(null);
  };

  const openCharacterDetails = (character: PlayerCharacter) => {
    setSelectedCharacter(character);
    setShowDetails(true);
  };

  const closeCharacterDetails = () => {
    setShowDetails(false);
    setSelectedCharacter(null);
  };

  // Filter characters based on search term
  const filteredCharacters = characters.filter(character =>
    character.characterName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    character.playerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    character.class.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">{t('characters.title')}</h1>
        <div className="flex items-center justify-between">
          <p className="text-gray-300">{t('characters.subtitle')}</p>
          {/* Minimal sync status indicator */}
          <div className="flex items-center gap-2">
            {syncStatus === 'syncing' && (
              <ArrowPathIcon className="h-4 w-4 text-blue-400 animate-spin" />
            )}
            {syncStatus === 'error' && (
              <span className="text-xs text-amber-400">{t('characters.offline')}</span>
            )}
            <button
              onClick={loadCharacters}
              className="p-1 text-gray-400 hover:text-white transition-colors"
              title={t('characters.refresh')}
            >
              <ArrowPathIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Search and Add Character */}
      <div className="mb-6 flex gap-4">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder={t('characters.searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-800 text-white px-4 py-3 pr-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <MagnifyingGlassIcon className="absolute right-3 top-3.5 h-5 w-5 text-gray-400" />
        </div>
        <button
          onClick={() => {
            setEditingCharacter(null);
            setShowForm(true);
          }}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg transition-colors flex items-center gap-2"
        >
          <PlusIcon className="h-5 w-5" />
          {t('characters.addCharacter')}
        </button>
      </div>

      {/* Characters Grid */}
      {filteredCharacters.length === 0 ? (
        <div className="text-center py-12">
          <UserIcon className="h-16 w-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-400 mb-2">
            {characters.length === 0 ? t('characters.noCharactersYet') : t('characters.noCharactersFound')}
          </h3>
          <p className="text-slate-500">
            {characters.length === 0 
              ? t('characters.addFirstCharacter') 
              : t('characters.adjustSearchTerms')}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCharacters.map((character) => (
            <div key={character.id} className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-2xl border border-white/10 p-6 hover:border-emerald-400/30 transition-all duration-200">
              {/* Character Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-400/20 to-blue-500/20 rounded-full flex items-center justify-center">
                    {character.imageUrl ? (
                      <img
                        src={character.imageUrl}
                        alt={character.characterName}
                        className="w-10 h-10 rounded-full object-cover"
                        onError={(e) => {
                          const img = e.target as HTMLImageElement;
                          img.style.display = 'none';
                          const parent = img.parentElement;
                          if (parent) {
                            parent.innerHTML = '<span class="text-xl">👤</span>';
                          }
                        }}
                      />
                    ) : (
                      <span className="text-xl">👤</span>
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-lg">{character.characterName}</h3>
                    <p className="text-sm text-slate-400">{character.playerName}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openCharacterDetails(character)}
                    className="p-2 text-slate-400 hover:text-blue-400 transition-colors"
                    title={t('characters.viewDetails')}
                  >
                    <EyeIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => openEditForm(character)}
                    className="p-2 text-slate-400 hover:text-emerald-400 transition-colors"
                    title={t('characters.editCharacter')}
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteCharacter(character.id)}
                    className="p-2 text-slate-400 hover:text-red-400 transition-colors"
                    title={t('characters.deleteCharacter')}
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Character Info */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-400">{t('characters.class')}:</span>
                  <span className="text-white font-medium">{character.class || t('characters.form.unknown')}</span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
                  <div className="bg-slate-700/30 rounded-lg p-2">
                    <div className="text-xs text-slate-400">{t('characters.form.ac')}</div>
                    <div className="text-white font-bold">{character.armorClass || 0}</div>
                  </div>
                  <div className="bg-slate-700/30 rounded-lg p-2">
                    <div className="text-xs text-slate-400">{t('initiative.hp')}</div>
                    <div className="text-white font-bold">{character.hitPoints || 0}/{character.maxHitPoints || 0}</div>
                  </div>
                  <div className="bg-slate-700/30 rounded-lg p-2">
                    <div className="text-xs text-slate-400">{t('characters.form.pp')}</div>
                    <div className="text-white font-bold">{character.passivePerception || 0}</div>
                  </div>
                  <div className="bg-slate-700/30 rounded-lg p-2">
                    <div className="text-xs text-slate-400">{t('characters.level')}</div>
                    <div className="text-white font-bold">{character.level || 1}</div>
                  </div>
                </div>

                {character.notes && (
                  <div className="bg-slate-700/20 rounded-lg p-3">
                    <div className="text-xs text-slate-400 mb-1">{t('characters.notes')}:</div>
                    <div className="text-sm text-slate-300 line-clamp-2">{character.notes}</div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Character Form Modal */}
      {showForm && (
        <CharacterForm
          character={editingCharacter || undefined}
          onSave={editingCharacter ? handleEditCharacter : handleAddCharacter}
          onCancel={closeForm}
          isEditing={!!editingCharacter}
        />
      )}

      {/* Character Details Modal */}
      {showDetails && selectedCharacter && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-700">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-400/20 to-blue-500/20 rounded-full flex items-center justify-center">
                  {selectedCharacter.imageUrl ? (
                    <img
                      src={selectedCharacter.imageUrl}
                      alt={selectedCharacter.characterName}
                      className="w-14 h-14 rounded-full object-cover"
                      onError={(e) => {
                        const img = e.target as HTMLImageElement;
                        img.style.display = 'none';
                        const parent = img.parentElement;
                        if (parent) {
                          parent.innerHTML = '<span class="text-2xl">👤</span>';
                        }
                      }}
                    />
                  ) : (
                    <span className="text-2xl">👤</span>
                  )}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">{selectedCharacter.characterName}</h2>
                  <p className="text-slate-400">{t('characters.playedBy')} {selectedCharacter.playerName}</p>
                </div>
              </div>
              <button
                onClick={closeCharacterDetails}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors"
              >
                <EyeSlashIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-700/30 rounded-lg p-4 text-center">
                  <div className="text-sm text-slate-400 mb-1">{t('characters.class')}</div>
                  <div className="text-white font-bold">{selectedCharacter.class || t('characters.form.unknown')} {selectedCharacter.level || 1}</div>
                </div>
                <div className="bg-slate-700/30 rounded-lg p-4 text-center">
                  <div className="text-sm text-slate-400 mb-1">{t('characters.armorClass')}</div>
                  <div className="text-white font-bold">{selectedCharacter.armorClass || 0}</div>
                </div>
                <div className="bg-slate-700/30 rounded-lg p-4 text-center">
                  <div className="text-sm text-slate-400 mb-1">{t('characters.hitPoints')}</div>
                  <div className="text-white font-bold">{selectedCharacter.hitPoints || 0} / {selectedCharacter.maxHitPoints || 0}</div>
                </div>
                <div className="bg-slate-700/30 rounded-lg p-4 text-center">
                  <div className="text-sm text-slate-400 mb-1">{t('characters.passivePerception')}</div>
                  <div className="text-white font-bold">{selectedCharacter.passivePerception}</div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-700/30 rounded-lg p-4 text-center">
                  <div className="text-sm text-slate-400 mb-1">{t('characters.passiveInsight')}</div>
                  <div className="text-white font-bold">{selectedCharacter.passiveInsight || 10}</div>
                </div>
                <div className="bg-slate-700/30 rounded-lg p-4 text-center">
                  <div className="text-sm text-slate-400 mb-1">{t('characters.passiveInvestigation')}</div>
                  <div className="text-white font-bold">{selectedCharacter.passiveInvestigation || 10}</div>
                </div>
                <div className="bg-slate-700/30 rounded-lg p-4 text-center">
                  <div className="text-sm text-slate-400 mb-1">{t('characters.form.speed')}</div>
                  <div className="text-white font-bold">{selectedCharacter.speed || 30} ft</div>
                </div>
                <div className="bg-slate-700/30 rounded-lg p-4 text-center">
                  <div className="text-sm text-slate-400 mb-1">{t('characters.form.proficiency')}</div>
                  <div className="text-white font-bold">+{selectedCharacter.proficiencyBonus || 2}</div>
                </div>
              </div>

              {/* Ability Scores */}
              <div>
                <h3 className="text-lg font-semibold text-slate-300 mb-3">{t('characters.form.abilityScores')}</h3>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                  {(['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'] as const).map((ability) => {
                    const score = selectedCharacter[ability] || 10;
                    const mod = Math.floor((score - 10) / 2);
                    const modStr = mod >= 0 ? `+${mod}` : `${mod}`;
                    return (
                      <div key={ability} className="bg-slate-700/30 rounded-lg p-4 text-center">
                        <div className="text-xs text-slate-500 uppercase mb-1">{ability.slice(0, 3)}</div>
                        <div className="text-2xl text-white font-bold">{score}</div>
                        <div className={`text-sm font-medium ${mod > 0 ? 'text-emerald-400' : mod < 0 ? 'text-red-400' : 'text-slate-400'}`}>{modStr}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Character Goal */}
              {selectedCharacter.characterGoal && (
                <div className="bg-slate-700/20 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-emerald-400 mb-2">{t('characters.characterGoal')}</h3>
                  <p className="text-slate-300">{selectedCharacter.characterGoal}</p>
                </div>
              )}

              {/* Character Traits */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {selectedCharacter.boons && selectedCharacter.boons.length > 0 && (
                  <div className="bg-slate-700/20 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-yellow-400 mb-3">{t('characters.boons')}</h3>
                    <ul className="space-y-1">
                      {selectedCharacter.boons.map((boon, index) => (
                        <li key={index} className="text-slate-300 text-sm">• {boon}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {selectedCharacter.personalityTraits && selectedCharacter.personalityTraits.length > 0 && (
                  <div className="bg-slate-700/20 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-blue-400 mb-3">{t('characters.personalityTraits')}</h3>
                    <ul className="space-y-1">
                      {selectedCharacter.personalityTraits.map((trait, index) => (
                        <li key={index} className="text-slate-300 text-sm">• {trait}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {selectedCharacter.ideals && selectedCharacter.ideals.length > 0 && (
                  <div className="bg-slate-700/20 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-green-400 mb-3">{t('characters.ideals')}</h3>
                    <ul className="space-y-1">
                      {selectedCharacter.ideals.map((ideal, index) => (
                        <li key={index} className="text-slate-300 text-sm">• {ideal}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {selectedCharacter.bonds && selectedCharacter.bonds.length > 0 && (
                  <div className="bg-slate-700/20 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-purple-400 mb-3">{t('characters.bonds')}</h3>
                    <ul className="space-y-1">
                      {selectedCharacter.bonds.map((bond, index) => (
                        <li key={index} className="text-slate-300 text-sm">• {bond}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {selectedCharacter.flaws && selectedCharacter.flaws.length > 0 && (
                  <div className="bg-slate-700/20 rounded-lg p-4 md:col-span-2">
                    <h3 className="text-lg font-semibold text-red-400 mb-3">{t('characters.flaws')}</h3>
                    <ul className="space-y-1">
                      {selectedCharacter.flaws.map((flaw, index) => (
                        <li key={index} className="text-slate-300 text-sm">• {flaw}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Notes */}
              {selectedCharacter.notes && (
                <div className="bg-slate-700/20 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-slate-400 mb-3">{t('characters.additionalNotes')}</h3>
                  <p className="text-slate-300 whitespace-pre-line">{selectedCharacter.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}