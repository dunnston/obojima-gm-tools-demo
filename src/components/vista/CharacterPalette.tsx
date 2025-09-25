'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { PlayerCharacter } from '@/data/characters';
import { NPC } from '@/data/npcs';
import { Point } from '@/data/vistaScenes';
import { DEFAULT_TOKEN_PORTRAITS, DEFAULT_TOKEN_STYLES } from '@/data/vistaBackgrounds';
import { syncService } from '@/services/sync';
import {
  MagnifyingGlassIcon,
  UserIcon,
  UsersIcon,
  HeartIcon,
  PlusIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

interface CharacterPaletteProps {
  onAddCharacterToken: (character: PlayerCharacter | NPC | Companion, position: Point) => void;
  readOnly?: boolean;
  maxTokens?: number;
  currentTokenCount?: number;
}

type PaletteItem = PlayerCharacter | NPC | Companion;

const PALETTE_TABS = [
  { id: 'characters', name: 'Characters', icon: UserIcon },
  { id: 'npcs', name: 'NPCs', icon: UsersIcon },
  { id: 'companions', name: 'Companions', icon: HeartIcon }
] as const;

type TabId = typeof PALETTE_TABS[number]['id'];

export default function CharacterPalette({
  onAddCharacterToken,
  readOnly = false,
  maxTokens = 50,
  currentTokenCount = 0
}: CharacterPaletteProps) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<TabId>('characters');
  const [searchTerm, setSearchTerm] = useState('');
  const [characters, setCharacters] = useState<PlayerCharacter[]>([]);
  const [npcs, setNpcs] = useState<NPC[]>([]);
  const [companions, setCompanions] = useState<Companion[]>([]);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'error'>('idle');
  const [draggedItem, setDraggedItem] = useState<PaletteItem | null>(null);


  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);

  // Load characters and NPCs from API
  const loadData = async () => {
    setSyncStatus('syncing');

    try {
      // Load characters
      const charactersResult = await syncService.getCharacters();
      console.log('Characters result:', charactersResult);
      if (charactersResult.success && charactersResult.data) {
        console.log('Character data:', charactersResult.data);
        setCharacters(charactersResult.data);
      }

      // Load NPCs
      console.log('Attempting to load NPCs...');
      const npcsResult = await syncService.getNpcs();
      console.log('NPCs result:', npcsResult);
      if (npcsResult.success && npcsResult.data) {
        console.log('Setting NPCs:', npcsResult.data);
        setNpcs(npcsResult.data);
      } else {
        console.log('Failed to load NPCs or no data');
      }

      // Load Companions using syncService (which includes demo data)
      console.log('Attempting to load companions...');
      const companionsResult = await syncService.getCompanions();
      console.log('Companions result:', companionsResult);
      if (companionsResult.success && companionsResult.data) {
        console.log('Setting companions:', companionsResult.data);
        setCompanions(companionsResult.data);
      } else {
        console.log('Failed to load companions or no data');
      }

      setSyncStatus('idle');
    } catch (error) {
      console.error('Error loading palette data:', error);
      setSyncStatus('error');

      // Fall back to localStorage for characters
      try {
        const savedCharacters = localStorage.getItem('obojima-characters');
        if (savedCharacters) {
          setCharacters(JSON.parse(savedCharacters));
        }
      } catch (localError) {
        console.error('Error loading from localStorage:', localError);
      }
    }
  };

  // Filter items based on search term
  const getFilteredItems = (items: PaletteItem[]): PaletteItem[] => {
    if (!items || !Array.isArray(items)) return [];
    if (!searchTerm.trim()) return items;

    const term = searchTerm.toLowerCase().trim();
    return items.filter(item =>
      (item.name || '').toLowerCase().includes(term) ||
      ('playerName' in item && item.playerName?.toLowerCase().includes(term)) ||
      ('class' in item && item.class?.toLowerCase().includes(term)) ||
      ('race' in item && item.race?.toLowerCase().includes(term)) ||
      ('goal' in item && item.goal?.toLowerCase().includes(term)) ||
      ('disposition' in item && item.disposition?.toLowerCase().includes(term))
    );
  };

  // Get current tab items
  const getCurrentTabItems = (): PaletteItem[] => {
    console.log('Getting items for tab:', activeTab);
    console.log('Characters:', characters?.length || 0);
    console.log('NPCs:', npcs?.length || 0);
    console.log('Companions:', companions?.length || 0);

    switch (activeTab) {
      case 'characters':
        return getFilteredItems(characters || []);
      case 'npcs':
        const npcItems = getFilteredItems(npcs || []);
        console.log('Filtered NPC items:', npcItems);
        return npcItems;
      case 'companions':
        return getFilteredItems(companions || []);
      default:
        return [];
    }
  };

  // Handle drag start
  const handleDragStart = (event: React.DragEvent, item: PaletteItem) => {
    if (readOnly || currentTokenCount >= maxTokens) return;

    setDraggedItem(item);

    // Set drag data
    event.dataTransfer.setData('application/json', JSON.stringify({
      type: 'character-token',
      item
    }));

    // Set drag image to character portrait if available
    if (item.portrait) {
      const img = new Image();
      img.src = item.portrait;
      event.dataTransfer.setDragImage(img, 50, 50);
    }

    event.dataTransfer.effectAllowed = 'copy';
  };

  // Handle drag end
  const handleDragEnd = () => {
    setDraggedItem(null);
  };

  // Handle click to add token at center
  const handleAddToken = (item: PaletteItem) => {
    if (readOnly || currentTokenCount >= maxTokens) return;

    // Add token at center of canvas (960, 540 in scene coordinates for 1920x1080 canvas)
    onAddCharacterToken(item, { x: 960, y: 540 });
  };

  // Get item portrait with fallback
  const getItemPortrait = (item: PaletteItem): string => {
    // For PlayerCharacters, check imageUrl field
    if ('imageUrl' in item && item.imageUrl) {
      return item.imageUrl;
    }

    // For Companions, check image field
    if ('image' in item && item.image) {
      return item.image;
    }

    // For NPCs, check portrait field
    if ('portrait' in item && item.portrait) {
      return item.portrait;
    }

    // Fallback to default portraits based on class/type
    if ('class' in item && item.class) {
      const classKey = item.class.toLowerCase();
      return DEFAULT_TOKEN_PORTRAITS[classKey as keyof typeof DEFAULT_TOKEN_PORTRAITS]
        || DEFAULT_TOKEN_PORTRAITS.warrior;
    }

    return DEFAULT_TOKEN_PORTRAITS.warrior;
  };

  // Get item subtitle
  const getItemSubtitle = (item: PaletteItem): string => {
    if ('playerName' in item && item.playerName) {
      return `by ${item.playerName}`;
    }
    if ('class' in item && item.class) {
      return `Level ${item.level || 1} ${item.class}`;
    }
    if ('race' in item && item.race) {
      return item.race;
    }
    if ('disposition' in item && item.disposition) {
      return `${item.disposition} companion`;
    }
    return 'NPC';
  };

  const currentItems = getCurrentTabItems();
  const canAddToken = !readOnly && currentTokenCount < maxTokens;

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900">Character Palette</h3>
          <button
            onClick={loadData}
            disabled={syncStatus === 'syncing'}
            className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
            title="Refresh Data"
          >
            {syncStatus === 'syncing' ? (
              <div className="animate-spin h-4 w-4 border-2 border-gray-500 rounded-full border-t-transparent" />
            ) : (
              <ArrowPathIcon className="h-4 w-4" />
            )}
          </button>
        </div>

        {/* Token Counter */}
        <div className="mb-3">
          <div className={`text-sm ${currentTokenCount >= maxTokens ? 'text-red-600' : 'text-gray-600'}`}>
            {currentTokenCount} / {maxTokens} tokens
            {currentTokenCount >= maxTokens && (
              <span className="ml-2 text-red-600">
                <ExclamationTriangleIcon className="inline h-4 w-4" />
                Max reached
              </span>
            )}
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search characters..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4 py-2 border-b border-gray-200">
        <div className="flex space-x-1">
          {PALETTE_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-2 py-2 text-xs font-medium rounded-md transition-colors flex-1 justify-center ${
                  isActive
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon className="h-4 w-4 mr-1" />
                <span className="truncate">{tab.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {syncStatus === 'error' && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-400 mr-2" />
              <p className="text-sm text-red-800">
                Failed to load data. Showing cached data if available.
              </p>
            </div>
          </div>
        )}

        {currentItems.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <div className="mb-4">
              {activeTab === 'characters' && <UserIcon className="h-12 w-12 mx-auto opacity-50" />}
              {activeTab === 'npcs' && <UsersIcon className="h-12 w-12 mx-auto opacity-50" />}
              {activeTab === 'companions' && <HeartIcon className="h-12 w-12 mx-auto opacity-50" />}
            </div>
            <p className="font-medium">
              {searchTerm ? 'No matches found' : `No ${activeTab} available`}
            </p>
            <p className="text-sm mt-1">
              {searchTerm
                ? 'Try adjusting your search terms'
                : activeTab === 'characters'
                  ? 'Create characters in the Player Characters tab'
                  : activeTab === 'npcs'
                    ? 'Create NPCs in the Database Editor'
                    : 'Create companions in the Database Editor'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {currentItems.map((item) => (
              <div
                key={item.id}
                draggable={canAddToken}
                onDragStart={(e) => handleDragStart(e, item)}
                onDragEnd={handleDragEnd}
                className={`
                  group relative p-3 border border-gray-200 rounded-lg transition-all
                  ${canAddToken
                    ? 'cursor-grab hover:border-blue-300 hover:bg-blue-50 active:cursor-grabbing'
                    : 'cursor-not-allowed opacity-50'
                  }
                  ${draggedItem?.id === item.id ? 'opacity-50 scale-95' : ''}
                `}
              >
                <div className="flex items-center space-x-3">
                  {/* Portrait */}
                  <div className="flex-shrink-0">
                    {!getItemPortrait(item) ? (
                      // CSS-based token preview
                      <div
                        className="w-12 h-12 rounded-full flex flex-col items-center justify-center border-2 border-gray-200"
                        style={{
                          backgroundColor: (() => {
                            const tokenName = (item.name || '').toLowerCase();
                            for (const [key, style] of Object.entries(DEFAULT_TOKEN_STYLES)) {
                              if (tokenName.includes(key.toLowerCase())) {
                                return style.bg;
                              }
                            }
                            return DEFAULT_TOKEN_STYLES.commoner.bg;
                          })(),
                          color: (() => {
                            const tokenName = (item.name || '').toLowerCase();
                            for (const [key, style] of Object.entries(DEFAULT_TOKEN_STYLES)) {
                              if (tokenName.includes(key.toLowerCase())) {
                                return style.color;
                              }
                            }
                            return DEFAULT_TOKEN_STYLES.commoner.color;
                          })()
                        }}
                      >
                        <div className="text-sm">
                          {(() => {
                            const tokenName = (item.name || '').toLowerCase();
                            for (const [key, style] of Object.entries(DEFAULT_TOKEN_STYLES)) {
                              if (tokenName.includes(key.toLowerCase())) {
                                return style.emoji;
                              }
                            }
                            return DEFAULT_TOKEN_STYLES.commoner.emoji;
                          })()}
                        </div>
                        <div className="text-xs font-bold">
                          {(item.name || 'T').charAt(0).toUpperCase()}
                        </div>
                      </div>
                    ) : (
                      // Image-based token
                      <div
                        className="w-12 h-12 rounded-full bg-gray-300 bg-cover bg-center border-2 border-gray-200"
                        style={{ backgroundImage: `url(${getItemPortrait(item)})` }}
                      />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {('characterName' in item && item.characterName) || item.name || 'Unnamed Item'}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {getItemSubtitle(item)}
                    </p>
                  </div>

                  {/* Add Button */}
                  <button
                    onClick={() => handleAddToken(item)}
                    disabled={!canAddToken}
                    className={`
                      flex-shrink-0 p-1.5 rounded-md transition-colors
                      ${canAddToken
                        ? 'text-gray-400 hover:text-blue-600 hover:bg-blue-100 group-hover:text-blue-600'
                        : 'text-gray-300 cursor-not-allowed'
                      }
                    `}
                    title={canAddToken ? "Add to scene" : "Cannot add more tokens"}
                  >
                    <PlusIcon className="h-4 w-4" />
                  </button>
                </div>

                {/* Drag Hint */}
                {canAddToken && (
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-blue-50/80 rounded-lg">
                    <p className="text-xs text-blue-700 font-medium bg-white px-2 py-1 rounded shadow">
                      Drag to canvas or click +
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Instructions */}
      {!readOnly && (
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="text-xs text-gray-600">
            <p className="font-medium mb-1">How to add tokens:</p>
            <ul className="space-y-1">
              <li>• Drag characters onto the canvas</li>
              <li>• Click the + button to add at center</li>
              <li>• Position affects depth and scale</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}