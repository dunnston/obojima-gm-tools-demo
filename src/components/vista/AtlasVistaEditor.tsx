'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import SpriteRenderer, { useSprite, SpriteBrowser } from './SpriteRenderer';
import { SpriteInstance } from '@/utils/spriteAtlasLoader';
import {
  PlusIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  ArrowsPointingOutIcon,
  HomeIcon,
  EyeIcon,
  EyeSlashIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';

interface AtlasVistaEditorProps {
  width?: number;
  height?: number;
  onSceneChange?: (sprites: SpriteInstance[]) => void;
  initialSprites?: SpriteInstance[];
}

export default function AtlasVistaEditor({
  width = 1920,
  height = 1080,
  onSceneChange,
  initialSprites = []
}: AtlasVistaEditorProps) {
  const [sprites, setSprites] = useState<SpriteInstance[]>(initialSprites);
  const [selectedSprite, setSelectedSprite] = useState<string | null>(null);
  const [cameraX, setCameraX] = useState(0);
  const [cameraY, setCameraY] = useState(0);
  const [showSpriteBrowser, setShowSpriteBrowser] = useState(false);
  const [spriteSearchFilter, setSpriteSearchFilter] = useState('');
  const [isAddingSprite, setIsAddingSprite] = useState(false);
  const [pendingSpriteName, setPendingSpriteName] = useState<string | null>(null);
  const [showGrid, setShowGrid] = useState(true);
  const [gridSize, setGridSize] = useState(50);

  const keysPressed = useRef<Set<string>>(new Set());
  const animationFrameRef = useRef<number>();

  // WASD camera movement
  const handleCameraMovement = useCallback(() => {
    const moveSpeed = 5;
    let newCameraX = cameraX;
    let newCameraY = cameraY;

    if (keysPressed.current.has('KeyW') || keysPressed.current.has('ArrowUp')) {
      newCameraY -= moveSpeed;
    }
    if (keysPressed.current.has('KeyS') || keysPressed.current.has('ArrowDown')) {
      newCameraY += moveSpeed;
    }
    if (keysPressed.current.has('KeyA') || keysPressed.current.has('ArrowLeft')) {
      newCameraX -= moveSpeed;
    }
    if (keysPressed.current.has('KeyD') || keysPressed.current.has('ArrowRight')) {
      newCameraX += moveSpeed;
    }

    if (newCameraX !== cameraX || newCameraY !== cameraY) {
      setCameraX(newCameraX);
      setCameraY(newCameraY);
    }

    animationFrameRef.current = requestAnimationFrame(handleCameraMovement);
  }, [cameraX, cameraY]);

  // Keyboard event handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed.current.add(e.code);

      // Prevent default for WASD and arrow keys
      if (['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
        e.preventDefault();
      }

      // Toggle grid with G
      if (e.code === 'KeyG' && !e.repeat) {
        setShowGrid(prev => !prev);
      }

      // Delete selected sprite with Delete/Backspace
      if ((e.code === 'Delete' || e.code === 'Backspace') && selectedSprite) {
        handleDeleteSprite(selectedSprite);
      }

      // Reset camera with Home
      if (e.code === 'Home') {
        setCameraX(0);
        setCameraY(0);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current.delete(e.code);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [selectedSprite]);

  // Start camera movement animation
  useEffect(() => {
    animationFrameRef.current = requestAnimationFrame(handleCameraMovement);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [handleCameraMovement]);

  // Update parent when sprites change
  useEffect(() => {
    if (onSceneChange) {
      onSceneChange(sprites);
    }
  }, [sprites, onSceneChange]);

  // Add sprite to scene
  const handleAddSprite = (spriteName: string, x: number, y: number) => {
    const newSprite = useSprite(spriteName, x, y);
    setSprites(prev => [...prev, newSprite]);
    setSelectedSprite(newSprite.id);
    setIsAddingSprite(false);
    setPendingSpriteName(null);
  };

  // Handle canvas click
  const handleCanvasClick = (x: number, y: number, event: MouseEvent) => {
    if (isAddingSprite && pendingSpriteName) {
      handleAddSprite(pendingSpriteName, x, y);
    } else {
      setSelectedSprite(null);
    }
  };

  // Handle sprite click
  const handleSpriteClick = (sprite: SpriteInstance, event: MouseEvent) => {
    event.stopPropagation();
    setSelectedSprite(sprite.id);
  };

  // Delete sprite
  const handleDeleteSprite = (spriteId: string) => {
    setSprites(prev => prev.filter(s => s.id !== spriteId));
    if (selectedSprite === spriteId) {
      setSelectedSprite(null);
    }
  };

  // Move sprite
  const handleMoveSprite = (spriteId: string, deltaX: number, deltaY: number) => {
    setSprites(prev =>
      prev.map(sprite =>
        sprite.id === spriteId
          ? { ...sprite, x: sprite.x + deltaX, y: sprite.y + deltaY }
          : sprite
      )
    );
  };

  // Toggle sprite visibility
  const handleToggleVisibility = (spriteId: string) => {
    setSprites(prev =>
      prev.map(sprite =>
        sprite.id === spriteId
          ? { ...sprite, visible: sprite.visible !== false ? false : true }
          : sprite
      )
    );
  };

  // Handle sprite browser selection
  const handleSpriteSelect = (spriteName: string) => {
    setPendingSpriteName(spriteName);
    setIsAddingSprite(true);
    setShowSpriteBrowser(false);
  };

  // Get selected sprite data
  const selectedSpriteData = selectedSprite
    ? sprites.find(s => s.id === selectedSprite)
    : null;

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Main Canvas Area */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h2 className="text-lg font-semibold">Atlas Vista Editor</h2>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowSpriteBrowser(!showSpriteBrowser)}
                className={`p-2 rounded transition-colors ${
                  showSpriteBrowser
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
                title="Toggle Sprite Browser"
              >
                <PlusIcon className="h-5 w-5" />
              </button>

              <button
                onClick={() => setShowGrid(!showGrid)}
                className={`p-2 rounded transition-colors ${
                  showGrid
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
                title="Toggle Grid (G)"
              >
                <ArrowsPointingOutIcon className="h-5 w-5" />
              </button>

              <button
                onClick={() => {
                  setCameraX(0);
                  setCameraY(0);
                }}
                className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded transition-colors"
                title="Reset Camera (Home)"
              >
                <HomeIcon className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <span>Camera: {Math.round(cameraX)}, {Math.round(cameraY)}</span>
            <span>Sprites: {sprites.length}</span>
            {isAddingSprite && (
              <span className="text-blue-600 font-medium">
                Click to place {pendingSpriteName}
              </span>
            )}
          </div>
        </div>

        {/* Canvas Container */}
        <div className="flex-1 relative overflow-hidden">
          <SpriteRenderer
            width={width}
            height={height}
            sprites={sprites}
            cameraX={cameraX}
            cameraY={cameraY}
            onSpriteClick={handleSpriteClick}
            onCanvasClick={handleCanvasClick}
            className="absolute inset-0"
          />

          {/* Grid overlay */}
          {showGrid && (
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                backgroundImage: `
                  linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)
                `,
                backgroundSize: `${gridSize}px ${gridSize}px`,
                backgroundPosition: `${-cameraX % gridSize}px ${-cameraY % gridSize}px`
              }}
            />
          )}

          {/* Controls overlay */}
          <div className="absolute bottom-4 left-4 bg-black bg-opacity-75 text-white p-3 rounded text-xs">
            <div>WASD / Arrow Keys: Move camera</div>
            <div>G: Toggle grid</div>
            <div>Home: Reset camera</div>
            <div>Delete: Remove selected sprite</div>
          </div>
        </div>
      </div>

      {/* Right Sidebar */}
      <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
        {/* Sprite Browser */}
        {showSpriteBrowser && (
          <div className="border-b border-gray-200 p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium">Add Sprites</h3>
              <button
                onClick={() => setShowSpriteBrowser(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            <div className="relative mb-3">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={spriteSearchFilter}
                onChange={(e) => setSpriteSearchFilter(e.target.value)}
                placeholder="Search sprites..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <SpriteBrowser
              onSpriteSelect={handleSpriteSelect}
              searchFilter={spriteSearchFilter}
              className="max-h-64 overflow-y-auto"
            />
          </div>
        )}

        {/* Scene Objects */}
        <div className="flex-1 p-4 overflow-y-auto">
          <h3 className="font-medium mb-3">Scene Objects ({sprites.length})</h3>

          <div className="space-y-2">
            {sprites.map(sprite => (
              <div
                key={sprite.id}
                className={`p-3 border rounded transition-colors ${
                  selectedSprite === sprite.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedSprite(sprite.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {sprite.spriteName}
                    </p>
                    <p className="text-xs text-gray-500">
                      {Math.round(sprite.x)}, {Math.round(sprite.y)} (depth: {sprite.depth})
                    </p>
                  </div>

                  <div className="flex items-center space-x-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleVisibility(sprite.id);
                      }}
                      className="p-1 text-gray-400 hover:text-gray-600"
                      title={sprite.visible !== false ? 'Hide' : 'Show'}
                    >
                      {sprite.visible !== false ? (
                        <EyeIcon className="h-4 w-4" />
                      ) : (
                        <EyeSlashIcon className="h-4 w-4" />
                      )}
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteSprite(sprite.id);
                      }}
                      className="p-1 text-gray-400 hover:text-red-600"
                      title="Delete"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {sprites.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <p className="text-sm">No sprites in scene</p>
                <p className="text-xs">Add sprites using the browser above</p>
              </div>
            )}
          </div>
        </div>

        {/* Selected Sprite Properties */}
        {selectedSpriteData && (
          <div className="border-t border-gray-200 p-4">
            <h3 className="font-medium mb-3">Properties</h3>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Position
                </label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    value={Math.round(selectedSpriteData.x)}
                    onChange={(e) => {
                      const newX = parseInt(e.target.value) || 0;
                      handleMoveSprite(selectedSpriteData.id, newX - selectedSpriteData.x, 0);
                    }}
                    className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs"
                    placeholder="X"
                  />
                  <input
                    type="number"
                    value={Math.round(selectedSpriteData.y)}
                    onChange={(e) => {
                      const newY = parseInt(e.target.value) || 0;
                      handleMoveSprite(selectedSpriteData.id, 0, newY - selectedSpriteData.y);
                    }}
                    className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs"
                    placeholder="Y"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Scale
                </label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    max="5"
                    value={selectedSpriteData.scaleX || 1}
                    onChange={(e) => {
                      const scaleX = parseFloat(e.target.value) || 1;
                      setSprites(prev =>
                        prev.map(sprite =>
                          sprite.id === selectedSpriteData.id
                            ? { ...sprite, scaleX }
                            : sprite
                        )
                      );
                    }}
                    className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs"
                  />
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    max="5"
                    value={selectedSpriteData.scaleY || 1}
                    onChange={(e) => {
                      const scaleY = parseFloat(e.target.value) || 1;
                      setSprites(prev =>
                        prev.map(sprite =>
                          sprite.id === selectedSpriteData.id
                            ? { ...sprite, scaleY }
                            : sprite
                        )
                      );
                    }}
                    className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Opacity
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={selectedSpriteData.opacity || 1}
                  onChange={(e) => {
                    const opacity = parseFloat(e.target.value);
                    setSprites(prev =>
                      prev.map(sprite =>
                        sprite.id === selectedSpriteData.id
                          ? { ...sprite, opacity }
                          : sprite
                      )
                    );
                  }}
                  className="w-full"
                />
                <div className="text-xs text-gray-500 text-center">
                  {Math.round((selectedSpriteData.opacity || 1) * 100)}%
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}