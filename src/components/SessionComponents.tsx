'use client';

import { useState, useRef } from 'react';
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
  BoltIcon
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
  onDelete 
}: {
  npc: SessionNPC;
  onUpdate: (updates: Partial<SessionNPC>) => void;
  onDelete: () => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: npc.name,
    role: npc.role || '',
    location: npc.location || '',
    description: npc.description || '',
    notes: npc.notes || ''
  });

  const handleSave = () => {
    onUpdate(formData);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="bg-slate-700/50 rounded-lg p-4">
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-2 py-1 bg-slate-600 border border-slate-500 rounded text-white mb-2"
          placeholder="NPC name..."
        />
        <input
          type="text"
          value={formData.role}
          onChange={(e) => setFormData({ ...formData, role: e.target.value })}
          className="w-full px-2 py-1 bg-slate-600 border border-slate-500 rounded text-white text-sm mb-2"
          placeholder="Role (e.g., merchant, guard, noble)"
        />
        <input
          type="text"
          value={formData.location}
          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          className="w-full px-2 py-1 bg-slate-600 border border-slate-500 rounded text-white text-sm mb-2"
          placeholder="Location"
        />
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full px-2 py-1 bg-slate-600 border border-slate-500 rounded text-white text-sm h-16 resize-none mb-2"
          placeholder="Description..."
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
    <div className="bg-slate-700/50 rounded-lg p-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h4 className="font-semibold text-white">{npc.name}</h4>
          {npc.role && (
            <p className="text-emerald-400 text-sm">{npc.role}</p>
          )}
          {npc.location && (
            <p className="text-slate-400 text-sm">📍 {npc.location}</p>
          )}
          {npc.description && (
            <p className="text-slate-300 text-sm mt-2">{npc.description}</p>
          )}
        </div>
        <div className="flex items-center gap-1 ml-2">
          <button
            onClick={() => setIsEditing(true)}
            className="p-1 text-slate-400 hover:text-emerald-400 transition-colors"
          >
            <PencilIcon className="h-4 w-4" />
          </button>
          <button
            onClick={onDelete}
            className="p-1 text-slate-400 hover:text-red-400 transition-colors"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Create a URL for the audio file
    const url = URL.createObjectURL(file);
    
    const newMusic: SessionMusic = {
      id: `music-${Date.now()}-${Math.random()}`,
      name: file.name.replace(/\.[^/.]+$/, ''), // Remove extension
      filename: file.name,
      url: url,
      tags: []
    };

    onAdd(newMusic);
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
          className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
        >
          <ArrowUpTrayIcon className="h-4 w-4" />
          Upload Music
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
  onUpdate, 
  onDelete 
}: {
  treasure: SessionTreasure;
  onUpdate: (updates: Partial<SessionTreasure>) => void;
  onDelete: () => void;
}) {
  const [showDetails, setShowDetails] = useState(false);

  const getItemDetails = () => {
    switch (treasure.type) {
      case 'potion':
        const allPotions = [...combatPotions, ...utilityPotions, ...whimsyPotions];
        return allPotions.find(p => `${p.category}-${p.number}` === treasure.itemId);
      case 'ingredient':
        return ingredients.find(i => i.name === treasure.itemId);
      case 'magicItem':
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
      notes
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
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 rounded-lg w-full max-w-md">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-white">{treasure.itemName}</h3>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
            >
              ✕
            </button>
          </div>

          <div className="space-y-4">
            {/* Item-specific details */}
            {treasure.type === 'potion' && itemDetails && (
              <>
                <div>
                  <div className="text-sm text-slate-400">Category</div>
                  <div className="text-white">{itemDetails.category}</div>
                </div>
                <div>
                  <div className="text-sm text-slate-400">Rarity</div>
                  <div className="text-white">{itemDetails.rarity}</div>
                </div>
                {itemDetails.description && (
                  <div>
                    <div className="text-sm text-slate-400">Description</div>
                    <div className="text-white">{itemDetails.description}</div>
                  </div>
                )}
                {itemDetails.price && (
                  <div>
                    <div className="text-sm text-slate-400">Value</div>
                    <div className="text-white">{itemDetails.price} gp</div>
                  </div>
                )}
              </>
            )}

            {treasure.type === 'ingredient' && itemDetails && (
              <>
                <div>
                  <div className="text-sm text-slate-400">Rarity</div>
                  <div className="text-white">{itemDetails.rarity}</div>
                </div>
                <div>
                  <div className="text-sm text-slate-400">Properties</div>
                  <div className="text-white">
                    Combat: {itemDetails.combat} • Utility: {itemDetails.utility} • Whimsy: {itemDetails.whimsy}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-slate-400">Value</div>
                  <div className="text-white">{itemDetails.price} gp</div>
                </div>
              </>
            )}

            {treasure.type === 'magicItem' && itemDetails && (
              <>
                <div>
                  <div className="text-sm text-slate-400">Type</div>
                  <div className="text-white">{itemDetails.type}</div>
                </div>
                <div>
                  <div className="text-sm text-slate-400">Rarity</div>
                  <div className="text-white">{itemDetails.rarity}</div>
                </div>
                {itemDetails.requiresAttunement && (
                  <div className="bg-yellow-500/10 border border-yellow-400/30 rounded-lg p-3">
                    <div className="text-yellow-400 font-medium">Requires Attunement</div>
                  </div>
                )}
                {itemDetails.effect && (
                  <div>
                    <div className="text-sm text-slate-400">Effect</div>
                    <div className="text-white">{itemDetails.effect}</div>
                  </div>
                )}
                {itemDetails.price && (
                  <div>
                    <div className="text-sm text-slate-400">Value</div>
                    <div className="text-white">{itemDetails.price} gp</div>
                  </div>
                )}
              </>
            )}

            {treasure.quantity && treasure.quantity > 1 && (
              <div>
                <div className="text-sm text-slate-400">Quantity</div>
                <div className="text-white">{treasure.quantity}</div>
              </div>
            )}

            {treasure.notes && (
              <div>
                <div className="text-sm text-slate-400">Notes</div>
                <div className="text-white">{treasure.notes}</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}