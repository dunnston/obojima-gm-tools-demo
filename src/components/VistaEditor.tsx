'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  VistaScene,
  VistaCharacterToken,
  createEmptyScene,
  createToken,
  Point,
  Viewport,
  DepthZone,
  SceneBackground
} from '@/data/vistaScenes';
import { SceneTemplate } from '@/data/vistaBackgrounds';
import { PlayerCharacter } from '@/data/characters';
import { NPC } from '@/data/npcs';
import { Companion } from '@/data/companions';
import { syncService } from '@/services/sync';
import {
  saveScene,
  loadScene,
  loadAllScenes,
  deleteScene,
  exportSceneAsJSON,
  downloadSceneAsJSON,
  downloadSceneAsImage
} from '@/utils/vistaSerializer';
import {
  updateTokenDepth,
  sortTokensByDepth,
  snapToGrid
} from '@/utils/vistaDepthManager';
import SceneCanvas from './vista/SceneCanvas';
import CharacterPalette from './vista/CharacterPalette';
import BackgroundSelector from './vista/BackgroundSelector';
import BackgroundPicker from './vista/BackgroundPicker';
import SceneManager from './vista/SceneManager';
import {
  PlayIcon,
  StopIcon,
  FolderOpenIcon,
  ArrowDownTrayIcon,
  TrashIcon,
  ArrowUturnLeftIcon,
  ArrowUturnRightIcon,
  PlusIcon,
  Cog6ToothIcon,
  EyeIcon,
  EyeSlashIcon,
  MagnifyingGlassIcon,
  PhotoIcon,
  ArrowsPointingOutIcon,
  ArrowsPointingInIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

interface VistaEditorProps {
  initialSceneId?: string;
  characters?: PlayerCharacter[];
  npcs?: NPC[];
  onSceneChange?: (scene: VistaScene) => void;
  readOnly?: boolean;
  maxTokens?: number;
}

export default function VistaEditor({
  initialSceneId,
  characters = [],
  npcs = [],
  onSceneChange,
  readOnly = false,
  maxTokens = 50
}: VistaEditorProps) {
  const { t } = useTranslation();

  // Core scene state
  const [currentScene, setCurrentScene] = useState<VistaScene | null>(null);
  const [savedScenes, setSavedScenes] = useState<VistaScene[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'error'>('idle');

  // Scene editing state
  const [selectedTokens, setSelectedTokens] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedToken, setDraggedToken] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<Point>({ x: 0, y: 0 });

  // UI state
  const [showCharacterPalette, setShowCharacterPalette] = useState(true);
  const [showBackgroundSelector, setShowBackgroundSelector] = useState(false);
  const [showBackgroundPicker, setShowBackgroundPicker] = useState(false);
  const [showSceneManager, setShowSceneManager] = useState(false);
  const [showSceneModal, setShowSceneModal] = useState(false);
  const [modalMode, setModalMode] = useState<'save' | 'load' | 'new'>('new');
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showGrid, setShowGrid] = useState(false);
  const [showDepthIndicators, setShowDepthIndicators] = useState(false);

  // Viewport and canvas state
  const [viewport, setViewport] = useState<Viewport>({ x: 0, y: 0, zoom: 1 });
  const canvasRef = useRef<HTMLDivElement>(null);

  // History for undo/redo
  const [history, setHistory] = useState<VistaScene[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const maxHistorySize = 50;

  // Load initial scene or create empty one
  useEffect(() => {
    if (initialSceneId) {
      loadSceneById(initialSceneId);
    } else {
      const newScene = createEmptyScene('New Scene');
      setCurrentScene(newScene);
      addToHistory(newScene);
    }
    loadSavedScenes();
  }, [initialSceneId]);

  // Save scene to history for undo/redo
  const addToHistory = useCallback((scene: VistaScene) => {
    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push(JSON.parse(JSON.stringify(scene))); // Deep clone

      // Limit history size
      if (newHistory.length > maxHistorySize) {
        newHistory.shift();
      } else {
        setHistoryIndex(prev => prev + 1);
      }

      return newHistory;
    });
  }, [historyIndex, maxHistorySize]);

  // Load all saved scenes
  const loadSavedScenes = async () => {
    setSyncStatus('syncing');
    try {
      const scenes = await loadAllScenes();
      setSavedScenes(scenes);
      setSyncStatus('idle');
    } catch (error) {
      console.error('Error loading scenes:', error);
      setSyncStatus('error');
    }
  };

  // Load specific scene by ID
  const loadSceneById = async (sceneId: string) => {
    setIsLoading(true);
    try {
      const scene = await loadScene(sceneId);
      if (scene) {
        setCurrentScene(scene);
        setViewport(scene.viewport || { x: 0, y: 0, zoom: 1 });
        addToHistory(scene);
      }
    } catch (error) {
      console.error('Error loading scene:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Save current scene
  const saveCurrentScene = async () => {
    if (!currentScene) return;

    setSyncStatus('syncing');
    try {
      const sceneToSave = {
        ...currentScene,
        viewport,
        metadata: {
          ...currentScene.metadata,
          updated_at: new Date()
        }
      };

      await saveScene(sceneToSave);
      setCurrentScene(sceneToSave);
      await loadSavedScenes(); // Refresh the list
      setSyncStatus('idle');

      if (onSceneChange) {
        onSceneChange(sceneToSave);
      }
    } catch (error) {
      console.error('Error saving scene:', error);
      setSyncStatus('error');
    }
  };

  // Create new scene
  const createNewScene = () => {
    const newScene = createEmptyScene('New Vista Scene');
    setCurrentScene(newScene);
    setViewport({ x: 0, y: 0, zoom: 1 });
    setSelectedTokens([]);
    addToHistory(newScene);
  };

  // Delete scene
  const deleteCurrentScene = async () => {
    if (!currentScene || !currentScene.id) return;

    try {
      await deleteScene(currentScene.id);
      await loadSavedScenes();
      createNewScene();
    } catch (error) {
      console.error('Error deleting scene:', error);
    }
  };

  // Add character token to scene
  const addCharacterToken = useCallback((
    character: PlayerCharacter | NPC | Companion,
    position: Point
  ) => {
    if (!currentScene || currentScene.tokens.length >= maxTokens) return;

    const canvasHeight = currentScene.dimensions.height;
    const snappedPosition = snapToGrid(position, currentScene.gridSize, currentScene.snapToGrid);

    // Handle different character types
    const characterId = character.id;

    // Debug logging
    console.log('Character data:', character);

    // Handle different portrait field names
    let portrait = '';
    if ('imageUrl' in character && character.imageUrl) {
      portrait = character.imageUrl;
    } else if ('image' in character && character.image) {
      portrait = character.image;
    } else if ('portrait' in character && character.portrait) {
      portrait = character.portrait;
    } else {
      portrait = '/images/vista/Portraits/NPCs/ArcosSarinland.webp';
    }

    // Handle different name field names
    const name = ('characterName' in character && character.characterName)
      || character.name
      || 'Unnamed Token';

    const newToken = createToken(
      name,
      portrait,
      snappedPosition,
      characterId
    );

    // Update token with proper depth properties
    const tokenWithDepth = updateTokenDepth(newToken, snappedPosition, canvasHeight, true);

    const updatedScene = {
      ...currentScene,
      tokens: [...currentScene.tokens, tokenWithDepth]
    };

    setCurrentScene(updatedScene);
    addToHistory(updatedScene);

    if (onSceneChange) {
      onSceneChange(updatedScene);
    }
  }, [currentScene, maxTokens, onSceneChange, addToHistory]);

  // Update token position
  const updateTokenPosition = useCallback((tokenId: string, newPosition: Point) => {
    if (!currentScene) return;

    const canvasHeight = currentScene.dimensions.height;
    const snappedPosition = snapToGrid(newPosition, currentScene.gridSize, currentScene.snapToGrid);

    const updatedTokens = currentScene.tokens.map(token => {
      if (token.id === tokenId) {
        return updateTokenDepth(token, snappedPosition, canvasHeight, true);
      }
      return token;
    });

    const updatedScene = {
      ...currentScene,
      tokens: sortTokensByDepth(updatedTokens)
    };

    setCurrentScene(updatedScene);

    if (onSceneChange) {
      onSceneChange(updatedScene);
    }
  }, [currentScene, onSceneChange]);

  // Delete selected tokens
  const deleteSelectedTokens = useCallback(() => {
    if (!currentScene || selectedTokens.length === 0) return;

    const updatedScene = {
      ...currentScene,
      tokens: currentScene.tokens.filter(token => !selectedTokens.includes(token.id))
    };

    setCurrentScene(updatedScene);
    setSelectedTokens([]);
    addToHistory(updatedScene);

    if (onSceneChange) {
      onSceneChange(updatedScene);
    }
  }, [currentScene, selectedTokens, onSceneChange]);

  // Handle token drag start
  const handleTokenDragStart = useCallback((tokenId: string, offset: Point) => {
    setIsDragging(true);
    setDraggedToken(tokenId);
    setDragOffset(offset);
  }, []);

  // Handle token drag move
  const handleTokenDragMove = useCallback((tokenId: string, position: Point) => {
    updateTokenPosition(tokenId, position);
  }, [updateTokenPosition]);

  // Handle token drag end
  const handleTokenDragEnd = useCallback((tokenId: string) => {
    setIsDragging(false);
    setDraggedToken(null);

    // Save to history when drag ends
    if (currentScene) {
      addToHistory(currentScene);
    }
  }, [currentScene, addToHistory]);

  // Handle token selection
  const handleTokenSelect = useCallback((tokenId: string, multi: boolean) => {
    if (multi) {
      setSelectedTokens(prev =>
        prev.includes(tokenId)
          ? prev.filter(id => id !== tokenId)
          : [...prev, tokenId]
      );
    } else {
      setSelectedTokens([tokenId]);
    }
  }, []);

  // Handle token context menu
  const handleTokenContextMenu = useCallback((tokenId: string, position: Point) => {
    // Select token if not already selected
    if (!selectedTokens.includes(tokenId)) {
      setSelectedTokens([tokenId]);
    }

    // TODO: Show context menu at position
    console.log('Context menu for token:', tokenId, 'at position:', position);
  }, [selectedTokens]);

  // Handle canvas click (empty space)
  const handleCanvasClick = useCallback((position: Point) => {
    // Deselect all tokens when clicking empty space
    setSelectedTokens([]);
  }, []);

  // Handle viewport changes
  const handleViewportChange = useCallback((newViewport: Viewport) => {
    setViewport(newViewport);
  }, []);

  // Toggle grid visibility
  const toggleGrid = useCallback(() => {
    setShowGrid(prev => !prev);
  }, []);

  // Toggle depth indicators
  const toggleDepthIndicators = useCallback(() => {
    setShowDepthIndicators(prev => !prev);
  }, []);

  // Handle background change
  const handleBackgroundChange = useCallback((newBackground: SceneBackground) => {
    if (!currentScene) return;

    const updatedScene = {
      ...currentScene,
      background: newBackground
    };

    setCurrentScene(updatedScene);
    addToHistory(updatedScene);

    if (onSceneChange) {
      onSceneChange(updatedScene);
    }
  }, [currentScene, addToHistory, onSceneChange]);

  // Handle scene template load
  const handleSceneTemplateLoad = useCallback((template: SceneTemplate) => {
    // TODO: Implement scene template loading
    // This would create a new scene based on the template
    console.log('Loading scene template:', template);
  }, []);

  // Undo/Redo functions
  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      const previousScene = history[newIndex];
      setCurrentScene(previousScene);
      setHistoryIndex(newIndex);

      if (onSceneChange) {
        onSceneChange(previousScene);
      }
    }
  }, [history, historyIndex, onSceneChange]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      const nextScene = history[newIndex];
      setCurrentScene(nextScene);
      setHistoryIndex(newIndex);

      if (onSceneChange) {
        onSceneChange(nextScene);
      }
    }
  }, [history, historyIndex, onSceneChange]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (readOnly) return;

      const isCtrlOrCmd = event.ctrlKey || event.metaKey;

      switch (event.key) {
        case 's':
          if (isCtrlOrCmd) {
            event.preventDefault();
            saveCurrentScene();
          }
          break;
        case 'z':
          if (isCtrlOrCmd && !event.shiftKey) {
            event.preventDefault();
            undo();
          }
          break;
        case 'y':
          if (isCtrlOrCmd) {
            event.preventDefault();
            redo();
          }
          break;
        case 'Delete':
        case 'Backspace':
          if (selectedTokens.length > 0) {
            event.preventDefault();
            deleteSelectedTokens();
          }
          break;
        case 'Escape':
          setSelectedTokens([]);
          break;
        case 'a':
          if (isCtrlOrCmd && currentScene) {
            event.preventDefault();
            setSelectedTokens(currentScene.tokens.map(t => t.id));
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [currentScene, selectedTokens, readOnly, saveCurrentScene, undo, redo, deleteSelectedTokens]);

  // Full screen toggle function
  const toggleFullScreen = useCallback(() => {
    if (!document.fullscreenElement) {
      // Enter fullscreen
      const element = document.documentElement;
      if (element.requestFullscreen) {
        element.requestFullscreen().then(() => {
          setIsFullScreen(true);
        });
      }
    } else {
      // Exit fullscreen
      if (document.exitFullscreen) {
        document.exitFullscreen().then(() => {
          setIsFullScreen(false);
        });
      }
    }
  }, []);

  // Listen for fullscreen changes (user can also press F11 or Esc)
  useEffect(() => {
    const handleFullScreenChange = () => {
      const isNowFullScreen = !!document.fullscreenElement;
      setIsFullScreen(isNowFullScreen);

      // Auto-hide character palette in full screen for maximum scene space
      if (isNowFullScreen) {
        setShowCharacterPalette(false);
      }
    };

    document.addEventListener('fullscreenchange', handleFullScreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullScreenChange);
  }, []);

  // Export functions
  const exportSceneJSON = () => {
    if (currentScene) {
      downloadSceneAsJSON(currentScene, true);
    }
  };

  const exportSceneImage = async () => {
    if (currentScene && canvasRef.current) {
      // This will need to be implemented when we create the canvas component
      console.log('Image export not yet implemented - need canvas component');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading scene...</span>
      </div>
    );
  }

  return (
    <div className={`${isFullScreen ? 'fixed inset-0 z-50 bg-black' : 'h-full'} flex flex-col ${isFullScreen ? '' : 'bg-gray-50'}`}>
      {/* Toolbar - hidden in full screen */}
      {!isFullScreen && (
        <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-lg font-semibold text-gray-900">
            {currentScene?.name || 'Scene Editor'}
          </h1>

          {/* Scene Controls */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowSceneManager(true)}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
              title="Scene Manager"
            >
              <FolderOpenIcon className="h-5 w-5" />
            </button>

            {!readOnly && (
              <button
                onClick={saveCurrentScene}
                disabled={syncStatus === 'syncing'}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded disabled:opacity-50"
                title="Save Scene (Ctrl+S)"
              >
                {syncStatus === 'syncing' ? (
                  <div className="animate-spin h-5 w-5 border-2 border-gray-600 rounded-full border-t-transparent" />
                ) : (
                  <ArrowDownTrayIcon className="h-5 w-5" />
                )}
              </button>
            )}
          </div>
        </div>

        {/* Right side controls */}
        <div className="flex items-center space-x-2">
          {/* Undo/Redo */}
          {!readOnly && (
            <>
              <button
                onClick={undo}
                disabled={historyIndex <= 0}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded disabled:opacity-50"
                title="Undo (Ctrl+Z)"
              >
                <ArrowUturnLeftIcon className="h-5 w-5" />
              </button>

              <button
                onClick={redo}
                disabled={historyIndex >= history.length - 1}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded disabled:opacity-50"
                title="Redo (Ctrl+Y)"
              >
                <ArrowUturnRightIcon className="h-5 w-5" />
              </button>

              <div className="h-6 w-px bg-gray-200" />
            </>
          )}

          {/* Export */}
          <button
            onClick={exportSceneJSON}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
            title="Export as JSON"
          >
            <ArrowDownTrayIcon className="h-5 w-5" />
          </button>

          {/* Character Palette Toggle */}
          <button
            onClick={() => setShowCharacterPalette(!showCharacterPalette)}
            className={`p-2 rounded ${
              showCharacterPalette
                ? 'text-blue-600 bg-blue-50'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
            title="Toggle Character Palette"
          >
            <PlusIcon className="h-5 w-5" />
          </button>

          <div className="h-6 w-px bg-gray-200" />

          {/* Full Screen Toggle */}
          <button
            onClick={toggleFullScreen}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
            title={isFullScreen ? "Exit Full Screen (F11 or Esc)" : "Enter Full Screen (F11)"}
          >
            {isFullScreen ? (
              <ArrowsPointingInIcon className="h-5 w-5" />
            ) : (
              <ArrowsPointingOutIcon className="h-5 w-5" />
            )}
          </button>
        </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Character Palette - hidden in full screen */}
        {showCharacterPalette && !isFullScreen && (
          <div className="w-80 bg-white border-r border-gray-200 flex-shrink-0">
            <CharacterPalette
              onAddCharacterToken={addCharacterToken}
              readOnly={readOnly}
              maxTokens={maxTokens}
              currentTokenCount={currentScene?.tokens.length || 0}
            />
          </div>
        )}

        {/* Scene Canvas Area */}
        <div className="flex-1 flex flex-col">
          {/* Canvas Toolbar - hidden in full screen */}
          {!isFullScreen && (
            <div className="bg-gray-100 px-4 py-2 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={toggleGrid}
                    className={`p-1.5 rounded text-sm ${
                      showGrid
                        ? 'bg-blue-100 text-blue-700 border border-blue-300'
                        : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
                    }`}
                    title="Toggle Grid"
                  >
                    Grid
                  </button>
                  <button
                    onClick={toggleDepthIndicators}
                    className={`p-1.5 rounded text-sm ${
                      showDepthIndicators
                        ? 'bg-blue-100 text-blue-700 border border-blue-300'
                        : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
                    }`}
                    title="Toggle Depth Indicators"
                  >
                    Depth
                  </button>
                  <button
                    onClick={() => setShowBackgroundPicker(true)}
                    className="p-1.5 rounded text-sm bg-white text-gray-600 border border-gray-300 hover:bg-gray-50"
                    title="Change Background"
                  >
                    Background
                  </button>
                </div>
                <div className="text-sm text-gray-600">
                  Zoom: {Math.round(viewport.zoom * 100)}%
                </div>
              </div>
              <div className="text-sm text-gray-500">
                {currentScene?.tokens.length || 0} tokens
              </div>
            </div>
            </div>
          )}

          {/* Scene Canvas */}
          <div className={`flex-1 relative overflow-hidden ${isFullScreen ? 'h-screen' : ''}`}>
            {currentScene ? (
              <SceneCanvas
                scene={currentScene}
                viewport={viewport}
                selectedTokens={selectedTokens}
                isDragging={isDragging}
                draggedToken={draggedToken}
                showGrid={showGrid}
                showDepthIndicators={showDepthIndicators}
                readOnly={readOnly}
                onViewportChange={handleViewportChange}
                onTokenDragStart={handleTokenDragStart}
                onTokenDragMove={handleTokenDragMove}
                onTokenDragEnd={handleTokenDragEnd}
                onTokenSelect={handleTokenSelect}
                onTokenContextMenu={handleTokenContextMenu}
                onCanvasClick={handleCanvasClick}
                onAddCharacterToken={addCharacterToken}
              />
            ) : (
              <div className="flex-1 bg-gray-200 relative overflow-hidden flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <PhotoIcon className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">No Scene Loaded</p>
                  <p className="text-sm">Create or load a scene to begin</p>
                </div>
              </div>
            )}

            {/* Full Screen Exit Button - only visible in full screen */}
            {isFullScreen && (
              <button
                onClick={toggleFullScreen}
                className="fixed top-4 right-4 z-50 p-2 bg-black/70 text-white rounded-lg hover:bg-black/90 transition-colors"
                title="Exit Full Screen (F11 or Esc)"
              >
                <ArrowsPointingInIcon className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Modals - Will be implemented later */}
      {showSceneModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-medium mb-4">Scene Management</h3>
            <p className="text-gray-600 mb-4">Scene modal will be implemented later.</p>
            <button
              onClick={() => setShowSceneModal(false)}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Background Selector Modal */}
      {showBackgroundSelector && (
        <BackgroundSelector
          currentScene={currentScene}
          onBackgroundChange={handleBackgroundChange}
          onSceneTemplateLoad={handleSceneTemplateLoad}
          onClose={() => setShowBackgroundSelector(false)}
        />
      )}

      {/* Background Picker Modal */}
      {showBackgroundPicker && currentScene && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-96 max-h-[80vh] overflow-y-auto">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Change Background</h3>
                <button
                  onClick={() => setShowBackgroundPicker(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="p-4">
              <BackgroundPicker
                currentBackground={currentScene.background}
                onBackgroundChange={(background) => {
                  handleBackgroundChange(background);
                  setShowBackgroundPicker(false);
                }}
                readOnly={readOnly}
              />
            </div>
          </div>
        </div>
      )}

      {/* Scene Manager Modal */}
      {showSceneManager && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-4xl h-[80vh] overflow-hidden flex flex-col">
            <div className="p-4 border-b border-gray-200 flex-shrink-0">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Scene Manager</h3>
                <button
                  onClick={() => setShowSceneManager(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-hidden">
              <SceneManager
                currentScene={currentScene}
                onSceneLoad={(scene) => {
                  setCurrentScene(scene);
                  setViewport(scene.viewport || { x: 0, y: 0, zoom: 1 });
                  if (onSceneChange) onSceneChange(scene);
                  setShowSceneManager(false);
                }}
                onNewScene={() => {
                  createNewScene();
                  setShowSceneManager(false);
                }}
                readOnly={readOnly}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}