'use client';

import { useState, useRef, useEffect } from 'react';
import {
  SessionScene,
  SessionNPC,
  SessionMusic,
  SessionTreasure,
  SessionSecretClue
} from '@/data/sessions';
import { PlayerCharacter } from '@/data/characters';
import { Encounter } from '@/data/creatures';
import { combatPotions, utilityPotions, whimsyPotions } from '@/data/potions';
import { ingredients } from '@/data/ingredients';
import { magicItems } from '@/data/magicItems';
import { syncService } from '@/services/sync';
import { formatGoldValue } from '@/data/obojimaCurrency';
import { 
  PlusIcon,
  TrashIcon,
  PencilIcon,
  EyeIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  MusicalNoteIcon,
  PlayIcon,
  PauseIcon,
  ArrowUpTrayIcon,
  UserGroupIcon,
  GiftIcon,
  CheckIcon,
  EyeSlashIcon,
  SparklesIcon,
  BoltIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

// Scene Card Component
export function SceneCard({ 
  scene, 
  index, 
  total,
  onEdit, 
  onView, 
  onDelete, 
  onReorder 
}: {
  scene: SessionScene;
  index: number;
  total: number;
  onEdit: () => void;
  onView: () => void;
  onDelete: () => void;
  onReorder: (sceneId: string, direction: 'up' | 'down') => void;
}) {
  return (
    <div className="bg-slate-700/50 rounded-lg p-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-sm text-slate-400">Scene {index + 1}</span>
            <h3 className="font-semibold text-white">{scene.title}</h3>
          </div>
          {scene.description && (
            <p className="text-slate-400 text-sm line-clamp-2">{scene.description}</p>
          )}
          
          {/* Scene Assets Summary */}
          <div className="flex items-center gap-4 mt-3 text-xs text-slate-400">
            {scene.music && scene.music.length > 0 && (
              <div className="flex items-center gap-1">
                <MusicalNoteIcon className="h-3 w-3" />
                {scene.music.length}
              </div>
            )}
            {scene.npcs && scene.npcs.length > 0 && (
              <div className="flex items-center gap-1">
                <UserGroupIcon className="h-3 w-3" />
                {scene.npcs.length}
              </div>
            )}
            {scene.encounters && scene.encounters.length > 0 && (
              <div className="flex items-center gap-1">
                <SparklesIcon className="h-3 w-3" />
                {scene.encounters.length}
              </div>
            )}
            {scene.treasure && scene.treasure.length > 0 && (
              <div className="flex items-center gap-1">
                <GiftIcon className="h-3 w-3" />
                {scene.treasure.length}
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-1 ml-4">
          <button
            onClick={onView}
            className="p-1 text-slate-400 hover:text-emerald-400 transition-colors"
            title="View Scene"
          >
            <EyeIcon className="h-4 w-4" />
          </button>
          <button
            onClick={onEdit}
            className="p-1 text-slate-400 hover:text-emerald-400 transition-colors"
            title="Edit Scene"
          >
            <PencilIcon className="h-4 w-4" />
          </button>
          <button
            onClick={() => onReorder(scene.id, 'up')}
            disabled={index === 0}
            className="p-1 text-slate-400 hover:text-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Move Up"
          >
            <ChevronUpIcon className="h-4 w-4" />
          </button>
          <button
            onClick={() => onReorder(scene.id, 'down')}
            disabled={index === total - 1}
            className="p-1 text-slate-400 hover:text-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Move Down"
          >
            <ChevronDownIcon className="h-4 w-4" />
          </button>
          <button
            onClick={onDelete}
            className="p-1 text-slate-400 hover:text-red-400 transition-colors"
            title="Delete Scene"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

// Secret/Clue Card Component
export function SecretClueCard({ 
  secret, 
  characters,
  onReveal, 
  onUpdate, 
  onDelete 
}: {
  secret: SessionSecretClue;
  characters: PlayerCharacter[];
  onReveal: (secretId: string, playerId?: string) => void;
  onUpdate: (updates: Partial<SessionSecretClue>) => void;
  onDelete: () => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(secret.title);
  const [content, setContent] = useState(secret.content);

  const handleSave = () => {
    onUpdate({ title, content });
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="bg-slate-700/50 rounded-lg p-4">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-2 py-1 bg-slate-600 border border-slate-500 rounded text-white mb-2"
          placeholder="Secret title..."
        />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full px-2 py-1 bg-slate-600 border border-slate-500 rounded text-white text-sm h-20 resize-none mb-2"
          placeholder="Secret content..."
        />
        <div className="flex justify-end gap-2">
          <button
            onClick={() => setIsEditing(false)}
            className="px-3 py-1 bg-slate-600 hover:bg-slate-700 text-white rounded text-sm transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-sm transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-slate-700/50 rounded-lg p-4 ${secret.revealed ? 'opacity-75' : ''}`}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          {secret.revealed ? (
            <EyeIcon className="h-4 w-4 text-emerald-400" />
          ) : (
            <EyeSlashIcon className="h-4 w-4 text-slate-400" />
          )}
          <h4 className="font-semibold text-white">{secret.title}</h4>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsEditing(true)}
            className="p-1 text-slate-400 hover:text-emerald-400 transition-colors"
          >
            <PencilIcon className="h-3 w-3" />
          </button>
          <button
            onClick={onDelete}
            className="p-1 text-slate-400 hover:text-red-400 transition-colors"
          >
            <TrashIcon className="h-3 w-3" />
          </button>
        </div>
      </div>
      
      <p className="text-slate-300 text-sm mb-3">{secret.content}</p>
      
      {!secret.revealed ? (
        <button
          onClick={() => onReveal(secret.id)}
          className="flex items-center gap-2 px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-sm transition-colors"
        >
          <CheckIcon className="h-3 w-3" />
          Mark as Revealed
        </button>
      ) : (
        <div className="text-xs text-slate-400">
          Revealed to: {
            secret.revealedToPlayers?.length 
              ? secret.revealedToPlayers.map(id => {
                  const char = characters.find(c => c.id === id);
                  return char?.characterName || 'Unknown';
                }).join(', ')
              : 'All players'
          }
        </div>
      )}
    </div>
  );
}

// Encounter Card Component
export function EncounterCard({ 
  encounter, 
  onLoad,
  onRemove 
}: {
  encounter: Encounter;
  onLoad: () => void;
  onRemove?: () => void;
}) {
  const totalCreatures = encounter.creatures.reduce((sum, c) => sum + c.count, 0);
  
  return (
    <div className="bg-slate-700/50 rounded-lg p-4">
      <div className="flex items-start justify-between">
        <div>
          <h4 className="font-semibold text-white mb-1">{encounter.name}</h4>
          {encounter.description && (
            <p className="text-slate-400 text-sm mb-2">{encounter.description}</p>
          )}
          <div className="flex items-center gap-4 text-sm">
            <span className="text-slate-400">
              {totalCreatures} {totalCreatures === 1 ? 'creature' : 'creatures'}
            </span>
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
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onLoad}
            className="flex items-center gap-2 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-sm transition-colors"
            title="Load to Initiative Tracker"
          >
            <BoltIcon className="h-4 w-4" />
            Load
          </button>
          {onRemove && (
            <button
              onClick={onRemove}
              className="p-2 text-slate-400 hover:text-red-400 transition-colors"
              title="Remove from Session"
            >
              <TrashIcon className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
      
      {/* Creature List */}
      <div className="mt-3 space-y-1">
        {encounter.creatures.map((creatureGroup, index) => (
          <div key={index} className="text-sm text-slate-300">
            • {creatureGroup.count}x {creatureGroup.creature.name} 
            <span className="text-slate-400 ml-1">(CR {creatureGroup.creature.challenge_rating})</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// NPC Card Component  
export function NPCCard({ 
  npc, 
  onUpdate, 
  onDelete,
  onView
}: {
  npc: SessionNPC;
  onUpdate: (updates: Partial<SessionNPC>) => void;
  onDelete: () => void;
  onView?: () => void;
}) {
  const [showNotesEditor, setShowNotesEditor] = useState(false);
  const [sessionNotes, setSessionNotes] = useState(npc.notes || '');

  const handleSaveNotes = () => {
    onUpdate({ notes: sessionNotes });
    setShowNotesEditor(false);
  };

  return (
    <div className="bg-slate-700/50 rounded-lg p-4">
      <div className="flex items-start gap-3 mb-3">
        <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-600 flex-shrink-0">
          {npc.imageUrl ? (
            <img 
              src={npc.imageUrl} 
              alt={npc.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src = '/images/npcs/default-npc.svg';
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-400">
              <UserGroupIcon className="h-8 w-8" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <h4 className="font-semibold text-white">{npc.name}</h4>
              {npc.location && (
                <p className="text-slate-400 text-sm">📍 {npc.location}</p>
              )}
              {npc.description && (
                <p className="text-slate-300 text-sm mt-1 line-clamp-2">{npc.description}</p>
              )}
            </div>
            
            <div className="flex items-center gap-1 ml-2">
              {onView && (
                <button
                  onClick={onView}
                  className="p-1 text-slate-400 hover:text-blue-400 transition-colors"
                  title="View NPC Details"
                >
                  <EyeIcon className="h-4 w-4" />
                </button>
              )}
              <button
                onClick={() => setShowNotesEditor(!showNotesEditor)}
                className="p-1 text-slate-400 hover:text-emerald-400 transition-colors"
                title="Edit Session Notes"
              >
                <PencilIcon className="h-4 w-4" />
              </button>
              <button
                onClick={onDelete}
                className="p-1 text-slate-400 hover:text-red-400 transition-colors"
                title="Remove from Session"
              >
                <TrashIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Session Notes Editor */}
      {showNotesEditor && (
        <div className="mt-3 p-3 bg-slate-800/50 rounded-lg">
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Session Notes
          </label>
          <textarea
            value={sessionNotes}
            onChange={(e) => setSessionNotes(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-400 resize-none text-sm"
            placeholder="Notes specific to this session..."
          />
          <div className="flex justify-end gap-2 mt-2">
            <button
              onClick={() => {
                setSessionNotes(npc.notes || '');
                setShowNotesEditor(false);
              }}
              className="px-3 py-1 bg-slate-600 hover:bg-slate-700 text-white rounded text-sm transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveNotes}
              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-sm transition-colors"
            >
              Save
            </button>
          </div>
        </div>
      )}
      
      {/* Existing Session Notes Display */}
      {npc.notes && !showNotesEditor && (
        <div className="mt-3 p-3 bg-slate-800/50 rounded-lg">
          <div className="text-xs text-slate-400 mb-1">Session Notes:</div>
          <div className="text-sm text-slate-300">{npc.notes}</div>
        </div>
      )}
    </div>
  );
}

// Music Manager Component
export function MusicManager({ 
  music, 
  currentMusic,
  onPlay, 
  onAdd, 
  onDelete 
}: {
  music: SessionMusic[];
  currentMusic: SessionMusic | null;
  onPlay: (music: SessionMusic) => void;
  onAdd: (music: SessionMusic) => void;
  onDelete: (musicId: string) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    try {
      // Generate a unique filename
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(2, 8);
      const fileExtension = file.name.split('.').pop();
      const uniqueFilename = `${file.name.replace(/\.[^/.]+$/, '')}-${timestamp}-${randomId}.${fileExtension}`;

      // Upload the file to the server
      const formData = new FormData();
      formData.append('file', file);
      formData.append('filename', uniqueFilename);

      const response = await fetch('/api/upload-audio', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Upload failed: ${response.statusText}${errorData.details ? ` - ${errorData.details}` : ''}`);
      }

      const result = await response.json();
      
      const newMusic: SessionMusic = {
        id: `music-${Date.now()}-${Math.random()}`,
        name: file.name.replace(/\.[^/.]+$/, ''), // Remove extension
        filename: uniqueFilename,
        url: result.path, // Use the server path instead of blob URL
        tags: []
      };

      onAdd(newMusic);
      console.log('Audio file uploaded successfully:', result);
      
    } catch (error) {
      console.error('Error uploading audio file:', error);
      alert('Error uploading audio file. Please try again.');
    } finally {
      setIsUploading(false);
      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* Upload Button */}
      <div>
        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*"
          onChange={handleFileUpload}
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
        >
          <ArrowUpTrayIcon className="h-4 w-4" />
          {isUploading ? 'Uploading...' : 'Upload Music'}
        </button>
      </div>

      {/* Music List */}
      <div className="space-y-2">
        {music.map(track => (
          <div 
            key={track.id} 
            className="bg-slate-700/50 rounded-lg p-3 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <button
                onClick={() => onPlay(track)}
                className="p-2 text-emerald-400 hover:text-emerald-300 bg-slate-700 hover:bg-slate-600 rounded transition-colors"
              >
                {currentMusic?.id === track.id ? (
                  <PauseIcon className="h-4 w-4" />
                ) : (
                  <PlayIcon className="h-4 w-4" />
                )}
              </button>
              <div>
                <div className="text-white font-medium">{track.name}</div>
                {track.tags && track.tags.length > 0 && (
                  <div className="flex gap-1 mt-1">
                    {track.tags.map(tag => (
                      <span key={tag} className="px-2 py-0.5 bg-slate-600 rounded text-xs text-slate-300">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={() => onDelete(track.id)}
              className="p-1 text-slate-400 hover:text-red-400 transition-colors"
            >
              <TrashIcon className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// Treasure Manager Component
export function TreasureManager({ 
  treasure, 
  onAdd, 
  onUpdate,
  onDelete 
}: {
  treasure: SessionTreasure[];
  onAdd: (treasure: SessionTreasure) => void;
  onUpdate: (treasureId: string, updates: Partial<SessionTreasure>) => void;
  onDelete: (treasureId: string) => void;
}) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [modifiedMagicItems, setModifiedMagicItems] = useState<any[]>([]);
  const [modifiedPotions, setModifiedPotions] = useState<any[]>([]);
  const [modifiedIngredients, setModifiedIngredients] = useState<any[]>([]);

  // Load modified items from database on mount
  useEffect(() => {
    const loadModifiedItems = async () => {
      try {
        const [magicItemData, potionData, ingredientData] = await Promise.all([
          syncService.getData('user-magic-items'),
          syncService.getData('user-potions'),
          syncService.getData('user-ingredients')
        ]);
        
        setModifiedMagicItems(magicItemData.data || []);
        setModifiedPotions(potionData.data || []);
        setModifiedIngredients(ingredientData.data || []);
      } catch (error) {
        console.error('Error loading modified items:', error);
      }
    };
    
    loadModifiedItems();
  }, []);

  return (
    <div className="space-y-4">
      <button
        onClick={() => setShowAddModal(true)}
        className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
      >
        <PlusIcon className="h-4 w-4" />
        Add Treasure
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {treasure.map(item => (
          <TreasureCard 
            key={item.id}
            treasure={item}
            modifiedMagicItems={modifiedMagicItems}
            modifiedPotions={modifiedPotions}
            modifiedIngredients={modifiedIngredients}
            onUpdate={(updates) => onUpdate(item.id, updates)}
            onDelete={() => onDelete(item.id)}
          />
        ))}
      </div>

      {showAddModal && (
        <AddTreasureModal
          onAdd={onAdd}
          onClose={() => setShowAddModal(false)}
        />
      )}
    </div>
  );
}

// Treasure Card Component
function TreasureCard({ 
  treasure, 
  modifiedMagicItems,
  modifiedPotions,
  modifiedIngredients,
  onUpdate, 
  onDelete 
}: {
  treasure: SessionTreasure;
  modifiedMagicItems: any[];
  modifiedPotions: any[];
  modifiedIngredients: any[];
  onUpdate: (updates: Partial<SessionTreasure>) => void;
  onDelete: () => void;
}) {
  const [showDetails, setShowDetails] = useState(false);

  const getItemDetails = () => {
    switch (treasure.type) {
      case 'potion':
        // First check modified potions, then static data
        const modifiedPotion = modifiedPotions.find(p => `${p.category}-${p.number}` === treasure.itemId);
        if (modifiedPotion) return modifiedPotion;
        
        const allPotions = [...combatPotions, ...utilityPotions, ...whimsyPotions];
        return allPotions.find(p => `${p.category}-${p.number}` === treasure.itemId);
      case 'ingredient':
        // First check modified ingredients, then static data
        const modifiedIngredient = modifiedIngredients.find(i => i.name === treasure.itemId);
        if (modifiedIngredient) return modifiedIngredient;
        
        return ingredients.find(i => i.name === treasure.itemId);
      case 'magicItem':
        // First check modified magic items, then static data
        const modifiedMagicItem = modifiedMagicItems.find(m => m.name === treasure.itemId);
        if (modifiedMagicItem) return modifiedMagicItem;
        
        return magicItems.find(m => m.name === treasure.itemId);
      default:
        return null;
    }
  };

  const itemDetails = getItemDetails();

  return (
    <>
      <div 
        className="bg-slate-700/50 rounded-lg p-3 cursor-pointer hover:bg-slate-700 transition-colors"
        onClick={() => setShowDetails(true)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">
              {treasure.type === 'potion' ? '🧪' :
               treasure.type === 'ingredient' ? '🌿' : '✨'}
            </span>
            <div>
              <div className="text-white font-medium">
                {treasure.itemName}
                {treasure.quantity && treasure.quantity > 1 && ` (x${treasure.quantity})`}
              </div>
              <div className="text-slate-400 text-sm capitalize">{treasure.type}</div>
            </div>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="p-1 text-slate-400 hover:text-red-400 transition-colors"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      </div>

      {showDetails && itemDetails && (
        <TreasureDetailModal
          treasure={treasure}
          itemDetails={itemDetails}
          onClose={() => setShowDetails(false)}
        />
      )}
    </>
  );
}

// Add Treasure Modal
function AddTreasureModal({ 
  onAdd, 
  onClose 
}: {
  onAdd: (treasure: SessionTreasure) => void;
  onClose: () => void;
}) {
  const [type, setType] = useState<'potion' | 'ingredient' | 'magicItem'>('potion');
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');
  
  // Custom property fields
  const [customEffect, setCustomEffect] = useState('');
  const [customFlavorText, setCustomFlavorText] = useState('');
  const [customCharges, setCustomCharges] = useState('');
  const [customActivation, setCustomActivation] = useState('');
  const [customRequiresAttunement, setCustomRequiresAttunement] = useState<boolean | undefined>(undefined);
  const [customPrice, setCustomPrice] = useState<number | undefined>(undefined);

  const getItems = () => {
    switch (type) {
      case 'potion':
        return [...combatPotions, ...utilityPotions, ...whimsyPotions];
      case 'ingredient':
        return ingredients;
      case 'magicItem':
        return magicItems;
      default:
        return [];
    }
  };

  const handleAdd = () => {
    if (!selectedItem) return;

    const itemId = type === 'potion' 
      ? `${selectedItem.category}-${selectedItem.number}`
      : selectedItem.name;

    const newTreasure: SessionTreasure = {
      id: `treasure-${Date.now()}-${Math.random()}`,
      type,
      itemId,
      itemName: selectedItem.name,
      quantity,
      notes,
      // Add custom properties only if they have values
      ...(customEffect && { customEffect }),
      ...(customFlavorText && { customFlavorText }),
      ...(customCharges && { customCharges }),
      ...(customActivation && { customActivation }),
      ...(customRequiresAttunement !== undefined && { customRequiresAttunement }),
      ...(customPrice !== undefined && { customPrice })
    };

    onAdd(newTreasure);
    onClose();
  };

  const items = getItems();

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 rounded-lg w-full max-w-md max-h-[80vh] overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-700">
          <h3 className="text-lg font-bold text-white">Add Treasure</h3>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-4">
            {/* Type Selection */}
            <div>
              <label className="block text-sm text-slate-400 mb-2">Treasure Type</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setType('potion')}
                  className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                    type === 'potion' 
                      ? 'bg-emerald-600 text-white' 
                      : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                  }`}
                >
                  Potion
                </button>
                <button
                  onClick={() => setType('ingredient')}
                  className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                    type === 'ingredient' 
                      ? 'bg-emerald-600 text-white' 
                      : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                  }`}
                >
                  Ingredient
                </button>
                <button
                  onClick={() => setType('magicItem')}
                  className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                    type === 'magicItem' 
                      ? 'bg-emerald-600 text-white' 
                      : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                  }`}
                >
                  Magic Item
                </button>
              </div>
            </div>

            {/* Item Selection */}
            <div>
              <label className="block text-sm text-slate-400 mb-2">Select Item</label>
              <div className="border border-slate-600 rounded-lg max-h-48 overflow-y-auto">
                {items.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedItem(item)}
                    className={`w-full px-3 py-2 text-left hover:bg-slate-700 transition-colors ${
                      selectedItem === item ? 'bg-emerald-900/50' : ''
                    }`}
                  >
                    <div className="text-white">{item.name}</div>
                    {type === 'potion' && (
                      <div className="text-slate-400 text-xs">{item.category} • {item.rarity}</div>
                    )}
                    {type === 'ingredient' && (
                      <div className="text-slate-400 text-xs">{item.rarity} • {item.price}g</div>
                    )}
                    {type === 'magicItem' && (
                      <div className="text-slate-400 text-xs">{item.type} • {item.rarity}</div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div>
              <label className="block text-sm text-slate-400 mb-1">Quantity</label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                min="1"
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
              />
            </div>

            {/* Custom Properties Section */}
            <div className="border-t border-slate-600 pt-4">
              <h4 className="text-sm font-medium text-slate-300 mb-3">Custom Properties (Optional)</h4>
              
              {/* Custom Effect */}
              <div className="mb-3">
                <label className="block text-sm text-slate-400 mb-1">Effect</label>
                <textarea
                  value={customEffect}
                  onChange={(e) => setCustomEffect(e.target.value)}
                  placeholder="Describe the item's magical effect..."
                  className="w-full h-16 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 resize-none text-sm"
                />
              </div>

              {/* Custom Flavor Text */}
              <div className="mb-3">
                <label className="block text-sm text-slate-400 mb-1">Flavor Text</label>
                <textarea
                  value={customFlavorText}
                  onChange={(e) => setCustomFlavorText(e.target.value)}
                  placeholder="Descriptive text about the item's appearance or lore..."
                  className="w-full h-16 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 resize-none text-sm"
                />
              </div>

              {/* Custom Charges and Activation in a row */}
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Charges</label>
                  <input
                    type="text"
                    value={customCharges}
                    onChange={(e) => setCustomCharges(e.target.value)}
                    placeholder="e.g., 3 charges"
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Activation</label>
                  <input
                    type="text"
                    value={customActivation}
                    onChange={(e) => setCustomActivation(e.target.value)}
                    placeholder="e.g., Action"
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 text-sm"
                  />
                </div>
              </div>

              {/* Custom Attunement and Price in a row */}
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Requires Attunement</label>
                  <select
                    value={customRequiresAttunement === undefined ? 'default' : customRequiresAttunement.toString()}
                    onChange={(e) => {
                      const value = e.target.value;
                      setCustomRequiresAttunement(
                        value === 'default' ? undefined : value === 'true'
                      );
                    }}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm"
                  >
                    <option value="default">Use Default</option>
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Price (gp)</label>
                  <input
                    type="number"
                    value={customPrice || ''}
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      setCustomPrice(isNaN(value) ? undefined : value);
                    }}
                    placeholder="Custom price"
                    min="0"
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm text-slate-400 mb-1">Notes (Optional)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Special properties, where found, etc."
                className="w-full h-20 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 resize-none"
              />
            </div>
          </div>
        </div>

        <div className="flex gap-2 p-4 border-t border-slate-700">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleAdd}
            disabled={!selectedItem}
            className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
          >
            Add Treasure
          </button>
        </div>
      </div>
    </div>
  );
}

// Treasure Detail Modal
function TreasureDetailModal({ 
  treasure, 
  itemDetails, 
  onClose 
}: {
  treasure: SessionTreasure;
  itemDetails: any;
  onClose: () => void;
}) {
  const getTypeIcon = () => {
    switch (treasure.type) {
      case 'potion': return '🧪';
      case 'ingredient': return '🌿';
      case 'magicItem': return '✨';
      default: return '📦';
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity?.toLowerCase()) {
      case 'common': return 'text-gray-400';
      case 'uncommon': return 'text-green-400';
      case 'rare': return 'text-blue-400';
      case 'very rare': return 'text-purple-400';
      case 'legendary': return 'text-orange-400';
      case 'artifact': return 'text-red-400';
      default: return 'text-slate-400';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{getTypeIcon()}</span>
            <div>
              <h3 className="text-xl font-bold text-white">{treasure.itemName}</h3>
              <p className="text-slate-400 text-sm capitalize">{treasure.type}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto">
          <div className="space-y-4">
            {/* Item-specific details */}
            {treasure.type === 'potion' && itemDetails && (
              <>
                <div className="bg-slate-700/30 rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm font-medium text-slate-300 mb-1">Category</div>
                      <div className="text-white">{itemDetails.category}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-slate-300 mb-1">Rarity</div>
                      <div className={`font-medium ${getRarityColor(itemDetails.rarity)}`}>
                        {itemDetails.rarity}
                      </div>
                    </div>
                  </div>
                </div>
                
                {itemDetails.effect && (
                  <div className="bg-slate-700/30 rounded-lg p-4">
                    <div className="text-sm font-medium text-slate-300 mb-2">Effect</div>
                    <div className="text-white text-sm leading-relaxed">{itemDetails.effect}</div>
                  </div>
                )}
                
                {itemDetails.flavorText && (
                  <div className="bg-slate-700/30 rounded-lg p-4">
                    <div className="text-sm font-medium text-slate-300 mb-2">Description</div>
                    <div className="text-white text-sm leading-relaxed italic">{itemDetails.flavorText}</div>
                  </div>
                )}
                
                {itemDetails.price && (
                  <div className="bg-amber-900/20 border border-amber-400/30 rounded-lg p-4">
                    <div className="text-sm font-medium text-amber-400 mb-1">Value</div>
                    <div className="text-white font-bold">{itemDetails.price} gp</div>
                  </div>
                )}
              </>
            )}

            {treasure.type === 'ingredient' && itemDetails && (
              <>
                <div className="bg-slate-700/30 rounded-lg p-4">
                  <div className="text-sm font-medium text-slate-300 mb-2">Rarity</div>
                  <div className={`font-medium ${getRarityColor(itemDetails.rarity)}`}>
                    {itemDetails.rarity}
                  </div>
                </div>
                
                <div className="bg-slate-700/30 rounded-lg p-4">
                  <div className="text-sm font-medium text-slate-300 mb-2">Magical Properties</div>
                  <div className="grid grid-cols-3 gap-3 text-sm">
                    <div className="text-center">
                      <div className="text-red-400 font-medium">⚔️ Combat</div>
                      <div className="text-white">{itemDetails.combat}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-blue-400 font-medium">🔧 Utility</div>
                      <div className="text-white">{itemDetails.utility}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-purple-400 font-medium">✨ Whimsy</div>
                      <div className="text-white">{itemDetails.whimsy}</div>
                    </div>
                  </div>
                </div>
                
                {itemDetails.locations && itemDetails.locations.length > 0 && (
                  <div className="bg-slate-700/30 rounded-lg p-4">
                    <div className="text-sm font-medium text-slate-300 mb-2">Found At</div>
                    <div className="text-white text-sm">
                      {itemDetails.locations.join(', ')}
                    </div>
                  </div>
                )}
                
                <div className="bg-amber-900/20 border border-amber-400/30 rounded-lg p-4">
                  <div className="text-sm font-medium text-amber-400 mb-1">Value</div>
                  <div className="text-white font-bold">{itemDetails.price} gp</div>
                </div>
              </>
            )}

            {treasure.type === 'magicItem' && itemDetails && (
              <>
                <div className="bg-slate-700/30 rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm font-medium text-slate-300 mb-1">Type</div>
                      <div className="text-white">{itemDetails.type}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-slate-300 mb-1">Rarity</div>
                      <div className={`font-medium ${getRarityColor(itemDetails.rarity)}`}>
                        {itemDetails.rarity}
                      </div>
                    </div>
                  </div>
                </div>
                
                {itemDetails.requiresAttunement === true && (
                  <div className="bg-yellow-500/10 border border-yellow-400/30 rounded-lg p-4">
                    <div className="text-yellow-400 font-medium flex items-center gap-2">
                      <span>🔗</span>
                      Requires Attunement
                    </div>
                  </div>
                )}
                
                {itemDetails.requiresAttunement === false && (
                  <div className="bg-slate-700/30 rounded-lg p-4">
                    <div className="text-slate-300 text-sm flex items-center gap-2">
                      <span>🔓</span>
                      No Attunement Required
                    </div>
                  </div>
                )}
                
                {itemDetails.effect && (
                  <div className="bg-slate-700/30 rounded-lg p-4">
                    <div className="text-sm font-medium text-slate-300 mb-2">Effect</div>
                    <div className="text-white text-sm leading-relaxed">{itemDetails.effect}</div>
                  </div>
                )}
                
                {itemDetails.flavorText && (
                  <div className="bg-slate-700/30 rounded-lg p-4">
                    <div className="text-sm font-medium text-slate-300 mb-2">Description</div>
                    <div className="text-white text-sm leading-relaxed italic">{itemDetails.flavorText}</div>
                  </div>
                )}
                
                {itemDetails.locationFound && (
                  <div className="bg-slate-700/30 rounded-lg p-4">
                    <div className="text-sm font-medium text-slate-300 mb-2">Location Found</div>
                    <div className="text-white text-sm">{itemDetails.locationFound}</div>
                  </div>
                )}
                
                {(itemDetails.charges || itemDetails.activation) && (
                  <div className="bg-slate-700/30 rounded-lg p-4">
                    <div className="grid grid-cols-2 gap-4">
                      {itemDetails.charges && (
                        <div>
                          <div className="text-sm font-medium text-slate-300 mb-1">Charges</div>
                          <div className="text-white text-sm">{itemDetails.charges}</div>
                        </div>
                      )}
                      {itemDetails.activation && (
                        <div>
                          <div className="text-sm font-medium text-slate-300 mb-1">Activation</div>
                          <div className="text-white text-sm">{itemDetails.activation}</div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Show message when magic item has minimal information */}
                {!itemDetails.effect && !itemDetails.flavorText && !itemDetails.charges && !itemDetails.activation && !itemDetails.locationFound && (
                  <div className="bg-blue-900/20 border border-blue-400/30 rounded-lg p-4">
                    <div className="text-blue-400 text-sm flex items-center gap-2">
                      <span>ℹ️</span>
                      This magic item's detailed effects and properties are not yet documented in the database.
                    </div>
                  </div>
                )}
                
                {itemDetails.price && (
                  <div className="bg-amber-900/20 border border-amber-400/30 rounded-lg p-4">
                    <div className="text-sm font-medium text-amber-400 mb-1">Value</div>
                    <div className="text-white font-bold">{itemDetails.price} gp</div>
                  </div>
                )}
              </>
            )}

            {/* Custom Properties Display */}
            {(treasure.customEffect || treasure.customFlavorText || treasure.customCharges || treasure.customActivation || treasure.customRequiresAttunement !== undefined || treasure.customPrice) && (
              <div className="border-t border-slate-600 pt-4">
                <div className="text-sm font-medium text-emerald-400 mb-3 flex items-center gap-2">
                  <span>⭐</span>
                  Custom Properties
                </div>
                
                {treasure.customEffect && (
                  <div className="bg-emerald-900/20 border border-emerald-400/30 rounded-lg p-4 mb-3">
                    <div className="text-sm font-medium text-emerald-400 mb-2">Custom Effect</div>
                    <div className="text-white text-sm leading-relaxed">{treasure.customEffect}</div>
                  </div>
                )}
                
                {treasure.customFlavorText && (
                  <div className="bg-emerald-900/20 border border-emerald-400/30 rounded-lg p-4 mb-3">
                    <div className="text-sm font-medium text-emerald-400 mb-2">Custom Description</div>
                    <div className="text-white text-sm leading-relaxed italic">{treasure.customFlavorText}</div>
                  </div>
                )}
                
                {(treasure.customCharges || treasure.customActivation) && (
                  <div className="bg-emerald-900/20 border border-emerald-400/30 rounded-lg p-4 mb-3">
                    <div className="grid grid-cols-2 gap-4">
                      {treasure.customCharges && (
                        <div>
                          <div className="text-sm font-medium text-emerald-400 mb-1">Custom Charges</div>
                          <div className="text-white text-sm">{treasure.customCharges}</div>
                        </div>
                      )}
                      {treasure.customActivation && (
                        <div>
                          <div className="text-sm font-medium text-emerald-400 mb-1">Custom Activation</div>
                          <div className="text-white text-sm">{treasure.customActivation}</div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {treasure.customRequiresAttunement !== undefined && (
                  <div className={`rounded-lg p-4 mb-3 ${
                    treasure.customRequiresAttunement 
                      ? 'bg-yellow-500/10 border border-yellow-400/30' 
                      : 'bg-emerald-900/20 border border-emerald-400/30'
                  }`}>
                    <div className={`font-medium flex items-center gap-2 ${
                      treasure.customRequiresAttunement ? 'text-yellow-400' : 'text-emerald-400'
                    }`}>
                      <span>{treasure.customRequiresAttunement ? '🔗' : '🔓'}</span>
                      {treasure.customRequiresAttunement ? 'Custom: Requires Attunement' : 'Custom: No Attunement Required'}
                    </div>
                  </div>
                )}
                
                {treasure.customPrice !== undefined && (
                  <div className="bg-amber-900/20 border border-amber-400/30 rounded-lg p-4 mb-3">
                    <div className="text-sm font-medium text-amber-400 mb-1">Custom Value</div>
                    <div className="text-white font-bold">{formatGoldValue(treasure.customPrice)}</div>
                  </div>
                )}
              </div>
            )}

            {treasure.quantity && treasure.quantity > 1 && (
              <div className="bg-slate-700/30 rounded-lg p-4">
                <div className="text-sm font-medium text-slate-300 mb-1">Quantity</div>
                <div className="text-white font-bold">×{treasure.quantity}</div>
              </div>
            )}

            {treasure.notes && (
              <div className="bg-emerald-900/20 border border-emerald-400/30 rounded-lg p-4">
                <div className="text-sm font-medium text-emerald-400 mb-2 flex items-center gap-2">
                  <span>📝</span>
                  Session Notes
                </div>
                <div className="text-white text-sm leading-relaxed whitespace-pre-wrap">{treasure.notes}</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}