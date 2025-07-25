'use client';

import { useState, useEffect } from 'react';
import { PlayerCharacter } from '@/data/characters';
import CharacterForm from './CharacterForm';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  UserIcon, 
  MagnifyingGlassIcon,
  EyeIcon,
  ShieldCheckIcon,
  EyeSlashIcon,
  MagnifyingGlassCircleIcon
} from '@heroicons/react/24/outline';

export default function CharacterManager() {
  const [characters, setCharacters] = useState<PlayerCharacter[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingCharacter, setEditingCharacter] = useState<PlayerCharacter | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCharacter, setSelectedCharacter] = useState<PlayerCharacter | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  // Load characters from localStorage on mount
  useEffect(() => {
    try {
      const savedCharacters = localStorage.getItem('obojima-characters');
      if (savedCharacters) {
        const parsed = JSON.parse(savedCharacters);
        // Convert date strings back to Date objects
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
  }, []);

  // Save characters to localStorage
  const saveCharacters = (updatedCharacters: PlayerCharacter[]) => {
    try {
      localStorage.setItem('obojima-characters', JSON.stringify(updatedCharacters));
      setCharacters(updatedCharacters);
    } catch (error) {
      console.error('Error saving characters:', error);
      alert('Error saving character data');
    }
  };

  const handleAddCharacter = (characterData: Omit<PlayerCharacter, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newCharacter: PlayerCharacter = {
      ...characterData,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const updatedCharacters = [...characters, newCharacter];
    saveCharacters(updatedCharacters);
    setShowForm(false);
  };

  const handleEditCharacter = (characterData: Omit<PlayerCharacter, 'id' | 'createdAt' | 'updatedAt'>) => {
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

    saveCharacters(updatedCharacters);
    setEditingCharacter(null);
    setShowForm(false);
  };

  const handleDeleteCharacter = (characterId: string) => {
    const character = characters.find(c => c.id === characterId);
    if (character && confirm(`Are you sure you want to delete ${character.characterName}?`)) {
      const updatedCharacters = characters.filter(char => char.id !== characterId);
      saveCharacters(updatedCharacters);
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
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <UserIcon className="h-8 w-8 text-emerald-400" />
          <h1 className="text-3xl font-bold text-white">Player Characters</h1>
        </div>
        <p className="text-slate-400">Manage your party's character information and details</p>
        
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 mx-auto px-6 py-3 bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg"
        >
          <PlusIcon className="h-5 w-5" />
          Add New Character
        </button>
      </div>

      {/* Search Bar */}
      <div className="max-w-md mx-auto">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search characters..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-emerald-400"
          />
        </div>
      </div>

      {/* Characters Grid */}
      {filteredCharacters.length === 0 ? (
        <div className="text-center py-12">
          <UserIcon className="h-16 w-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-400 mb-2">
            {characters.length === 0 ? 'No Characters Yet' : 'No Characters Found'}
          </h3>
          <p className="text-slate-500">
            {characters.length === 0 
              ? 'Add your first character to get started' 
              : 'Try adjusting your search terms'}
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
                    title="View Details"
                  >
                    <EyeIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => openEditForm(character)}
                    className="p-2 text-slate-400 hover:text-emerald-400 transition-colors"
                    title="Edit Character"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteCharacter(character.id)}
                    className="p-2 text-slate-400 hover:text-red-400 transition-colors"
                    title="Delete Character"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Character Info */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-400">Class:</span>
                  <span className="text-white font-medium">{character.class || 'Unknown'}</span>
                </div>

                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="bg-slate-700/30 rounded-lg p-2">
                    <div className="text-xs text-slate-400">AC</div>
                    <div className="text-white font-bold">{character.armorClass || 0}</div>
                  </div>
                  <div className="bg-slate-700/30 rounded-lg p-2">
                    <div className="text-xs text-slate-400">PP</div>
                    <div className="text-white font-bold">{character.passivePerception || 0}</div>
                  </div>
                  <div className="bg-slate-700/30 rounded-lg p-2">
                    <div className="text-xs text-slate-400">PI</div>
                    <div className="text-white font-bold">{character.passiveInsight || 0}</div>
                  </div>
                </div>

                {character.characterGoal && (
                  <div className="bg-slate-700/20 rounded-lg p-3">
                    <div className="text-xs text-slate-400 mb-1">Goal:</div>
                    <div className="text-sm text-slate-300 line-clamp-2">{character.characterGoal}</div>
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
                  <p className="text-slate-400">Played by {selectedCharacter.playerName}</p>
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
                  <div className="text-sm text-slate-400 mb-1">Class</div>
                  <div className="text-white font-bold">{selectedCharacter.class || 'Unknown'}</div>
                </div>
                <div className="bg-slate-700/30 rounded-lg p-4 text-center">
                  <div className="text-sm text-slate-400 mb-1">Armor Class</div>
                  <div className="text-white font-bold">{selectedCharacter.armorClass}</div>
                </div>
                <div className="bg-slate-700/30 rounded-lg p-4 text-center">
                  <div className="text-sm text-slate-400 mb-1">Passive Perception</div>
                  <div className="text-white font-bold">{selectedCharacter.passivePerception}</div>
                </div>
                <div className="bg-slate-700/30 rounded-lg p-4 text-center">
                  <div className="text-sm text-slate-400 mb-1">Passive Insight</div>
                  <div className="text-white font-bold">{selectedCharacter.passiveInsight}</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-700/30 rounded-lg p-4 text-center">
                  <div className="text-sm text-slate-400 mb-1">Passive Investigation</div>
                  <div className="text-white font-bold">{selectedCharacter.passiveInvestigation}</div>
                </div>
              </div>

              {/* Character Goal */}
              {selectedCharacter.characterGoal && (
                <div className="bg-slate-700/20 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-emerald-400 mb-2">Character Goal</h3>
                  <p className="text-slate-300">{selectedCharacter.characterGoal}</p>
                </div>
              )}

              {/* Character Traits */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {selectedCharacter.boons.length > 0 && (
                  <div className="bg-slate-700/20 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-yellow-400 mb-3">Boons</h3>
                    <ul className="space-y-1">
                      {selectedCharacter.boons.map((boon, index) => (
                        <li key={index} className="text-slate-300 text-sm">• {boon}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {selectedCharacter.personalityTraits.length > 0 && (
                  <div className="bg-slate-700/20 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-blue-400 mb-3">Personality Traits</h3>
                    <ul className="space-y-1">
                      {selectedCharacter.personalityTraits.map((trait, index) => (
                        <li key={index} className="text-slate-300 text-sm">• {trait}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {selectedCharacter.ideals.length > 0 && (
                  <div className="bg-slate-700/20 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-green-400 mb-3">Ideals</h3>
                    <ul className="space-y-1">
                      {selectedCharacter.ideals.map((ideal, index) => (
                        <li key={index} className="text-slate-300 text-sm">• {ideal}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {selectedCharacter.bonds.length > 0 && (
                  <div className="bg-slate-700/20 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-purple-400 mb-3">Bonds</h3>
                    <ul className="space-y-1">
                      {selectedCharacter.bonds.map((bond, index) => (
                        <li key={index} className="text-slate-300 text-sm">• {bond}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {selectedCharacter.flaws.length > 0 && (
                  <div className="bg-slate-700/20 rounded-lg p-4 md:col-span-2">
                    <h3 className="text-lg font-semibold text-red-400 mb-3">Flaws</h3>
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
                  <h3 className="text-lg font-semibold text-slate-400 mb-3">Additional Notes</h3>
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