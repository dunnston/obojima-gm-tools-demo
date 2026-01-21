'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { demoSpriteAtlasLoader, DEMO_SPRITES } from '@/utils/demoSpriteAtlas';

// Real PNG token data based on uploaded files
interface TokenData {
  name: string;
  path: string;
  category: 'background' | 'object' | 'character' | 'effect';
  displayName: string;
}

const PNG_TOKENS: TokenData[] = [
  // Trees and large structures
  { name: 'aeynit_ff_tree1', path: '/images/vista/tokens/defaults/aeynit_ff_tree1.png', category: 'background', displayName: 'Tree 1' },
  { name: 'aeynit_ff_tree2', path: '/images/vista/tokens/defaults/aeynit_ff_tree2.png', category: 'background', displayName: 'Tree 2' },
  { name: 'aeynit_ff_tree3', path: '/images/vista/tokens/defaults/aeynit_ff_tree3.png', category: 'background', displayName: 'Tree 3' },
  { name: 'aeynit_ff_tree4', path: '/images/vista/tokens/defaults/aeynit_ff_tree4.png', category: 'background', displayName: 'Tree 4' },
  { name: 'aeynit_ff_tree5', path: '/images/vista/tokens/defaults/aeynit_ff_tree5.png', category: 'background', displayName: 'Tree 5' },
  { name: 'aeynit_ff_tree3_2', path: '/images/vista/tokens/defaults/aeynit_ff_tree3_2.png', category: 'background', displayName: 'Large Tree 1' },
  { name: 'aeynit_ff_tree3_4', path: '/images/vista/tokens/defaults/aeynit_ff_tree3_4.png', category: 'background', displayName: 'Large Tree 2' },
  { name: 'aeynit_ff_tree5_3', path: '/images/vista/tokens/defaults/aeynit_ff_tree5_3.png', category: 'background', displayName: 'Large Tree 3' },
  { name: 'aeynit_ff_treehouse', path: '/images/vista/tokens/defaults/aeynit_ff_treehouse.png', category: 'background', displayName: 'Treehouse' },

  // Structures and ruins
  { name: 'aeynit_ff_ruin1', path: '/images/vista/tokens/defaults/aeynit_ff_ruin1.png', category: 'object', displayName: 'Ruins 1' },
  { name: 'aeynit_ff_ruin2', path: '/images/vista/tokens/defaults/aeynit_ff_ruin2.png', category: 'object', displayName: 'Ruins 2' },
  { name: 'aeynit_ff_ruin3', path: '/images/vista/tokens/defaults/aeynit_ff_ruin3.png', category: 'object', displayName: 'Ruins 3' },
  { name: 'aeynit_ff_pillar1', path: '/images/vista/tokens/defaults/aeynit_ff_pillar1.png', category: 'object', displayName: 'Pillar 1' },
  { name: 'aeynit_ff_pillar2', path: '/images/vista/tokens/defaults/aeynit_ff_pillar2.png', category: 'object', displayName: 'Pillar 2' },
  { name: 'aeynit_r_structure1', path: '/images/vista/tokens/defaults/aeynit_r_structure1.png', category: 'object', displayName: 'Structure 1' },
  { name: 'aeynit_r_structure2', path: '/images/vista/tokens/defaults/aeynit_r_structure2.png', category: 'object', displayName: 'Structure 2' },
  { name: 'aeynit_r_structure3', path: '/images/vista/tokens/defaults/aeynit_r_structure3.png', category: 'object', displayName: 'Structure 3' },
  { name: 'aeynit_r_structure4', path: '/images/vista/tokens/defaults/aeynit_r_structure4.png', category: 'object', displayName: 'Structure 4' },
  { name: 'aeynit_r_structure5', path: '/images/vista/tokens/defaults/aeynit_r_structure5.png', category: 'object', displayName: 'Structure 5' },

  // Plants and bushes
  { name: 'aeynit_ff_bush1', path: '/images/vista/tokens/defaults/aeynit_ff_bush1.png', category: 'object', displayName: 'Bush 1' },
  { name: 'aeynit_ff_bush2', path: '/images/vista/tokens/defaults/aeynit_ff_bush2.png', category: 'object', displayName: 'Bush 2' },
  { name: 'aeynit_ff_bush3', path: '/images/vista/tokens/defaults/aeynit_ff_bush3.png', category: 'object', displayName: 'Bush 3' },
  { name: 'aeynit_ff_plant1', path: '/images/vista/tokens/defaults/aeynit_ff_plant1.png', category: 'object', displayName: 'Plant 1' },
  { name: 'aeynit_ff_plant2', path: '/images/vista/tokens/defaults/aeynit_ff_plant2.png', category: 'object', displayName: 'Plant 2' },
  { name: 'aeynit_ff_plant3', path: '/images/vista/tokens/defaults/aeynit_ff_plant3.png', category: 'object', displayName: 'Plant 3' },

  // Stones and rocks
  { name: 'aeynit_ff_stone1', path: '/images/vista/tokens/defaults/aeynit_ff_stone1.png', category: 'object', displayName: 'Stone 1' },
  { name: 'aeynit_ff_stone2', path: '/images/vista/tokens/defaults/aeynit_ff_stone2.png', category: 'object', displayName: 'Stone 2' },
  { name: 'aeynit_ff_stone3', path: '/images/vista/tokens/defaults/aeynit_ff_stone3.png', category: 'object', displayName: 'Stone 3' },
  { name: 'aeynit_ff_stone4', path: '/images/vista/tokens/defaults/aeynit_ff_stone4.png', category: 'object', displayName: 'Stone 4' },
  { name: 'aeynit_ff_stone5', path: '/images/vista/tokens/defaults/aeynit_ff_stone5.png', category: 'object', displayName: 'Stone 5' },

  // Special objects
  { name: 'aeynit_r_portal', path: '/images/vista/tokens/defaults/aeynit_r_portal.png', category: 'effect', displayName: 'Portal' },
  { name: 'aeynit_r_statue', path: '/images/vista/tokens/defaults/aeynit_r_statue.png', category: 'object', displayName: 'Statue' },

  // Mushrooms
  { name: 'aeynit_ff_mushroom1', path: '/images/vista/tokens/defaults/aeynit_ff_mushroom1.png', category: 'object', displayName: 'Mushroom 1' },
  { name: 'aeynit_ff_mushroom2', path: '/images/vista/tokens/defaults/aeynit_ff_mushroom2.png', category: 'object', displayName: 'Mushroom 2' },
  { name: 'aeynit_ff_mushroom3', path: '/images/vista/tokens/defaults/aeynit_ff_mushroom3.png', category: 'object', displayName: 'Mushroom 3' },
];

interface SceneObject {
  id: string;
  spriteId: string;
  x: number;
  y: number;
  scale: number;
  depth: number;
  category: 'background' | 'object' | 'character' | 'effect';
}

interface ParallaxSceneData {
  id: string;
  name: string;
  baseBackground?: string;
  horizon: number; // Y position of horizon line (0-1)
  dimensions: { width: number; height: number };
  objects: SceneObject[];
  metadata: {
    created_at: Date;
    updated_at: Date;
  };
}

interface ParallaxSceneBuilderProps {
  onSceneComplete?: (scene: ParallaxSceneData) => void;
  onBack?: () => void;
}

const GROUND_LINE_Y = 0.75; // Ground line at 75% down the canvas

export default function ParallaxSceneBuilder({
  onSceneComplete,
  onBack
}: ParallaxSceneBuilderProps) {
  const { t } = useTranslation();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [scene, setScene] = useState<ParallaxSceneData>({
    id: `scene-${Date.now()}`,
    name: 'New Parallax Scene',
    horizon: 0.3, // 30% down from top
    dimensions: { width: 1920, height: 1080 },
    objects: [],
    metadata: {
      created_at: new Date(),
      updated_at: new Date()
    }
  });

  const [selectedCategory, setSelectedCategory] = useState<string>('object');
  const [selectedObject, setSelectedObject] = useState<SceneObject | null>(null);
  const [camera, setCamera] = useState({ x: 0, y: 0, zoom: 0.5 });
  const [dragMode, setDragMode] = useState<'objects' | 'horizon' | 'background'>('objects');
  const [showGrid, setShowGrid] = useState(true);
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  const [loadedImages, setLoadedImages] = useState<Map<string, HTMLImageElement>>(new Map());
  const [isDraggingObject, setIsDraggingObject] = useState(false);
  const [isMovingCamera, setIsMovingCamera] = useState(false);
  const [dragStartPos, setDragStartPos] = useState<{ x: number; y: number } | null>(null);
  const [keysPressed, setKeysPressed] = useState<Set<string>>(new Set());

  // Load sprite atlas
  useEffect(() => {
    demoSpriteAtlasLoader.loadAllSprites();
  }, []);

  // WASD camera movement
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['KeyW', 'KeyA', 'KeyS', 'KeyD'].includes(e.code)) {
        e.preventDefault();
        setKeysPressed(prev => new Set(prev).add(e.code));
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (['KeyW', 'KeyA', 'KeyS', 'KeyD'].includes(e.code)) {
        e.preventDefault();
        setKeysPressed(prev => {
          const next = new Set(prev);
          next.delete(e.code);
          return next;
        });
      }
      // Delete key for removing selected objects
      if (e.code === 'Delete' || e.code === 'Backspace') {
        if (selectedObject) {
          deleteSelectedObject();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [selectedObject]);

  // Camera movement with WASD
  useEffect(() => {
    if (keysPressed.size === 0) return;

    const interval = setInterval(() => {
      const moveSpeed = 10;
      let deltaX = 0;
      let deltaY = 0;

      if (keysPressed.has('KeyA')) deltaX -= moveSpeed;
      if (keysPressed.has('KeyD')) deltaX += moveSpeed;
      if (keysPressed.has('KeyW')) deltaY -= moveSpeed;
      if (keysPressed.has('KeyS')) deltaY += moveSpeed;

      if (deltaX !== 0 || deltaY !== 0) {
        setCamera(prev => ({
          x: prev.x + deltaX,
          y: prev.y + deltaY,
          zoom: prev.zoom
        }));
      }
    }, 16); // ~60fps

    return () => clearInterval(interval);
  }, [keysPressed]);

  // Get available PNG tokens by category
  const getTokensForCategory = (category: string) => {
    return PNG_TOKENS.filter(token =>
      category === 'all' || token.category === category
    );
  };

  // Load PNG image
  const loadTokenImage = useCallback(async (token: TokenData): Promise<HTMLImageElement> => {
    if (loadedImages.has(token.name)) {
      return loadedImages.get(token.name)!;
    }

    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        setLoadedImages(prev => new Map(prev.set(token.name, img)));
        resolve(img);
      };
      img.onerror = () => reject(new Error(`Failed to load ${token.name}`));
      img.src = token.path;
    });
  }, [loadedImages]);

  // Calculate perspective scale based on Y position
  const calculatePerspectiveScale = (y: number) => {
    const canvasHeight = scene.dimensions.height;
    const normalizedY = y / canvasHeight;

    // Objects near horizon (background) are smaller
    // Objects near ground are larger
    if (normalizedY <= scene.horizon) {
      // Above horizon - far background
      return 0.3 + (normalizedY / scene.horizon) * 0.4; // 0.3 to 0.7
    } else {
      // Below horizon - closer to viewer
      const groundDistance = (normalizedY - scene.horizon) / (GROUND_LINE_Y - scene.horizon);
      return 0.7 + groundDistance * 0.8; // 0.7 to 1.5
    }
  };

  // Handle canvas mouse events
  const handleCanvasMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const worldX = (e.clientX - rect.left) / camera.zoom + camera.x;
    const worldY = (e.clientY - rect.top) / camera.zoom + camera.y;
    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;

    setDragStartPos({ x: screenX, y: screenY });

    if (dragMode === 'horizon') {
      // Adjust horizon line
      const normalizedY = Math.max(0.1, Math.min(0.6, worldY / scene.dimensions.height));
      setScene(prev => ({ ...prev, horizon: normalizedY }));
    } else if (dragMode === 'objects') {
      // Check if clicking on existing object (check from front to back)
      const clickedObject = [...scene.objects]
        .sort((a, b) => b.depth - a.depth)
        .find(obj => {
          const tokenImg = loadedImages.get(obj.spriteId);
          if (!tokenImg) return false;

          const objScreenX = (obj.x - camera.x) * camera.zoom;
          const objScreenY = (obj.y - camera.y) * camera.zoom;

          const drawScale = obj.scale * camera.zoom;
          const drawWidth = tokenImg.width * drawScale;
          const drawHeight = tokenImg.height * drawScale;

          const drawX = objScreenX - drawWidth / 2;
          const drawY = objScreenY - drawHeight;

          return screenX >= drawX && screenX <= drawX + drawWidth &&
                 screenY >= drawY && screenY <= drawY + drawHeight;
        });

      if (clickedObject) {
        setSelectedObject(clickedObject);
        setIsDraggingObject(true);
      } else {
        setSelectedObject(null);
        // Start camera panning if not clicking on an object
        if (e.button === 0) { // Left mouse button
          setIsMovingCamera(true);
        }
      }
    }
  }, [dragMode, scene.objects, scene.dimensions.height, camera, loadedImages]);

  const handleCanvasMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !dragStartPos) return;

    const rect = canvas.getBoundingClientRect();
    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;
    const deltaX = currentX - dragStartPos.x;
    const deltaY = currentY - dragStartPos.y;

    if (isDraggingObject && selectedObject) {
      // Move the selected object
      const worldDeltaX = deltaX / camera.zoom;
      const worldDeltaY = deltaY / camera.zoom;

      const newX = selectedObject.x + worldDeltaX;
      const newY = selectedObject.y + worldDeltaY;
      const newScale = calculatePerspectiveScale(newY);

      setScene(prev => ({
        ...prev,
        objects: prev.objects.map(obj =>
          obj.id === selectedObject.id
            ? { ...obj, x: newX, y: newY, scale: newScale, depth: Math.floor(newY) }
            : obj
        )
      }));

      setSelectedObject(prev => prev ? { ...prev, x: newX, y: newY, scale: newScale, depth: Math.floor(newY) } : null);
      setDragStartPos({ x: currentX, y: currentY });
    } else if (isMovingCamera) {
      // Pan the camera
      setCamera(prev => ({
        x: prev.x - deltaX / camera.zoom,
        y: prev.y - deltaY / camera.zoom,
        zoom: prev.zoom
      }));
      setDragStartPos({ x: currentX, y: currentY });
    }
  }, [dragStartPos, isDraggingObject, isMovingCamera, selectedObject, camera]);

  const handleCanvasMouseUp = useCallback(() => {
    setIsDraggingObject(false);
    setIsMovingCamera(false);
    setDragStartPos(null);
  }, []);

  // Handle token drag from palette
  const handleTokenDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      const data = JSON.parse(e.dataTransfer.getData('text/plain'));
      if (data.type === 'token') {
        const rect = canvas.getBoundingClientRect();
        const x = (e.clientX - rect.left) / camera.zoom + camera.x;
        const y = (e.clientY - rect.top) / camera.zoom + camera.y;

        const token = PNG_TOKENS.find(t => t.name === data.tokenName);
        if (!token) return;

        const newObject: SceneObject = {
          id: `obj-${Date.now()}`,
          spriteId: data.tokenName,
          x,
          y,
          scale: calculatePerspectiveScale(y),
          depth: Math.floor(y), // Simple depth based on Y
          category: token.category
        };

        setScene(prev => ({
          ...prev,
          objects: [...prev.objects, newObject],
          metadata: { ...prev.metadata, updated_at: new Date() }
        }));
      }
    } catch (error) {
      console.error('Drop error:', error);
    }
  }, [camera, scene.dimensions.height]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  // Render scene on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Background
    ctx.fillStyle = '#87CEEB'; // Sky blue
    ctx.fillRect(0, 0, width, height);

    // Base background if set
    if (backgroundImage) {
      const bgImg = loadedImages.get('background');
      if (bgImg) {
        ctx.save();
        const bgScale = Math.max(width / bgImg.width, height / bgImg.height);
        const bgWidth = bgImg.width * bgScale;
        const bgHeight = bgImg.height * bgScale;
        const bgX = (width - bgWidth) / 2;
        const bgY = (height - bgHeight) / 2;
        ctx.drawImage(bgImg, bgX, bgY, bgWidth, bgHeight);
        ctx.restore();
      }
    }

    // Horizon line
    const horizonY = (scene.horizon * scene.dimensions.height - camera.y) * camera.zoom;
    if (horizonY > 0 && horizonY < height) {
      ctx.strokeStyle = dragMode === 'horizon' ? '#ff4444' : '#666666';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(0, horizonY);
      ctx.lineTo(width, horizonY);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Ground line
    const groundY = (GROUND_LINE_Y * scene.dimensions.height - camera.y) * camera.zoom;
    if (groundY > 0 && groundY < height) {
      ctx.strokeStyle = '#8b4513';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, groundY);
      ctx.lineTo(width, groundY);
      ctx.stroke();
    }

    // Grid
    if (showGrid) {
      ctx.strokeStyle = 'rgba(200, 200, 200, 0.5)';
      ctx.lineWidth = 1;
      const gridSize = 50;

      for (let x = -camera.x % gridSize; x < width / camera.zoom; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x * camera.zoom, 0);
        ctx.lineTo(x * camera.zoom, height);
        ctx.stroke();
      }

      for (let y = -camera.y % gridSize; y < height / camera.zoom; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y * camera.zoom);
        ctx.lineTo(width, y * camera.zoom);
        ctx.stroke();
      }
    }

    // Scene objects (sorted by depth)
    const sortedObjects = [...scene.objects].sort((a, b) => a.depth - b.depth);

    sortedObjects.forEach(obj => {
      const tokenImg = loadedImages.get(obj.spriteId);
      if (!tokenImg) return;

      const x = (obj.x - camera.x) * camera.zoom;
      const y = (obj.y - camera.y) * camera.zoom;

      // Skip if off-screen
      if (x < -200 || x > width + 200 || y < -200 || y > height + 200) return;

      ctx.save();

      // Draw token
      const drawScale = obj.scale * camera.zoom;
      const drawWidth = tokenImg.width * drawScale;
      const drawHeight = tokenImg.height * drawScale;

      // Anchor to bottom center (like ground-based objects)
      const drawX = x - drawWidth / 2;
      const drawY = y - drawHeight;

      ctx.drawImage(tokenImg, drawX, drawY, drawWidth, drawHeight);

      // Highlight if selected
      if (selectedObject?.id === obj.id) {
        ctx.strokeStyle = '#ff4444';
        ctx.lineWidth = 3;
        ctx.strokeRect(drawX - 2, drawY - 2, drawWidth + 4, drawHeight + 4);
      }

      ctx.restore();
    });

    // UI overlays
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(10, 10, 200, 60);
    ctx.fillStyle = 'white';
    ctx.font = '12px Arial';
    ctx.fillText(`Objects: ${scene.objects.length}`, 15, 25);
    ctx.fillText(`Camera: (${Math.round(camera.x)}, ${Math.round(camera.y)})`, 15, 40);
    ctx.fillText(`Zoom: ${Math.round(camera.zoom * 100)}%`, 15, 55);

  }, [scene, camera, selectedObject, dragMode, showGrid]);

  // Delete selected object
  const deleteSelectedObject = () => {
    if (selectedObject) {
      setScene(prev => ({
        ...prev,
        objects: prev.objects.filter(obj => obj.id !== selectedObject.id),
        metadata: { ...prev.metadata, updated_at: new Date() }
      }));
      setSelectedObject(null);
    }
  };

  // Export scene
  const exportScene = () => {
    const json = JSON.stringify(scene, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${scene.name.replace(/\s+/g, '-').toLowerCase()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-full flex flex-col bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
            >
              ← Back
            </button>
            <input
              type="text"
              value={scene.name}
              onChange={(e) => setScene(prev => ({ ...prev, name: e.target.value }))}
              className="text-lg font-semibold px-2 py-1 border border-gray-300 rounded"
            />
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={exportScene}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Export Scene
            </button>
            <button
              onClick={() => onSceneComplete?.(scene)}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Use Scene
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Sprite Palette */}
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b">
            <h3 className="font-semibold mb-3">Scene Builder</h3>

            {/* Mode Tabs */}
            <div className="grid grid-cols-3 gap-1 mb-3">
              {['objects', 'horizon', 'background'].map(mode => (
                <button
                  key={mode}
                  onClick={() => setDragMode(mode as any)}
                  className={`px-2 py-1 text-xs rounded capitalize ${
                    dragMode === mode
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>

            {/* Category Filter */}
            <div className="space-y-2">
              <label className="text-xs text-gray-500">Filter objects by type:</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-2 py-1 border border-gray-300 rounded text-sm bg-white text-gray-900"
              >
                <option value="all" className="text-gray-900">All Objects ({PNG_TOKENS.length})</option>
                <option value="object" className="text-gray-900">Objects ({PNG_TOKENS.filter(t => t.category === 'object').length})</option>
                <option value="background" className="text-gray-900">Background ({PNG_TOKENS.filter(t => t.category === 'background').length})</option>
                <option value="effect" className="text-gray-900">Effects ({PNG_TOKENS.filter(t => t.category === 'effect').length})</option>
              </select>
            </div>
          </div>

          {/* Token List */}
          <div className="flex-1 overflow-y-auto p-4">
            {dragMode === 'objects' && (
              <div className="grid grid-cols-2 gap-2">
                {getTokensForCategory(selectedCategory).map(token => (
                  <div
                    key={token.name}
                    draggable
                    onDragStart={(e) => {
                      // Pre-load the image when drag starts
                      loadTokenImage(token);
                      e.dataTransfer.setData('text/plain', JSON.stringify({
                        type: 'token',
                        tokenName: token.name
                      }));
                    }}
                    className="p-2 border border-gray-200 rounded cursor-grab hover:border-blue-300 hover:bg-blue-50 active:cursor-grabbing"
                  >
                    <div
                      className="w-full h-16 bg-gray-200 rounded mb-1 bg-cover bg-center"
                      style={{ backgroundImage: `url(${token.path})` }}
                    />
                    <div className="text-xs text-center truncate font-medium">
                      {token.displayName}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {dragMode === 'horizon' && (
              <div className="text-sm text-gray-600 space-y-2">
                <p className="font-medium">Horizon Line</p>
                <p>Click and drag on canvas to adjust the horizon line. Objects above the horizon appear smaller (background), objects below appear larger (foreground).</p>
                <div className="mt-4">
                  <label className="block text-xs mb-1">Horizon Position: {Math.round(scene.horizon * 100)}%</label>
                  <input
                    type="range"
                    min="0.1"
                    max="0.6"
                    step="0.01"
                    value={scene.horizon}
                    onChange={(e) => setScene(prev => ({ ...prev, horizon: parseFloat(e.target.value) }))}
                    className="w-full"
                  />
                </div>
              </div>
            )}

            {dragMode === 'background' && (
              <div className="text-sm text-gray-600 space-y-3">
                <p className="font-medium">Base Background</p>
                <p>Upload or select a base background image. This will be the sky and far background elements.</p>

                <div className="space-y-2">
                  <label className="block">
                    <div className="w-full px-3 py-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors cursor-pointer">
                      <div className="text-center">
                        <div className="text-gray-400 mb-1">📁</div>
                        <div className="text-xs font-medium text-gray-700">Choose Background Image</div>
                        <div className="text-xs text-gray-500">PNG, JPG up to 10MB</div>
                      </div>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            const result = event.target?.result as string;
                            setBackgroundImage(result);

                            // Load the image for canvas rendering
                            const img = new Image();
                            img.onload = () => {
                              setLoadedImages(prev => new Map(prev.set('background', img)));
                            };
                            img.src = result;
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>

                  {backgroundImage && (
                    <div className="space-y-2">
                      <div className="text-xs text-green-600 font-medium">✓ Background loaded</div>
                      <button
                        onClick={() => {
                          setBackgroundImage(null);
                          setLoadedImages(prev => {
                            const next = new Map(prev);
                            next.delete('background');
                            return next;
                          });
                        }}
                        className="w-full px-3 py-1 bg-red-100 text-red-700 rounded text-xs hover:bg-red-200"
                      >
                        Remove Background
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Selected Object Info */}
          {selectedObject && (
            <div className="p-4 border-t bg-gray-50">
              <h4 className="font-medium text-sm mb-2">Selected Object</h4>
              <div className="text-xs space-y-1">
                <div>Sprite: {selectedObject.spriteId}</div>
                <div>Position: ({Math.round(selectedObject.x)}, {Math.round(selectedObject.y)})</div>
                <div>Scale: {selectedObject.scale.toFixed(2)}</div>
                <div>Depth: {selectedObject.depth}</div>
              </div>
              <button
                onClick={deleteSelectedObject}
                className="mt-2 px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          )}
        </div>

        {/* Canvas Area */}
        <div className="flex-1 flex flex-col">
          {/* Canvas Toolbar */}
          <div className="bg-gray-100 px-4 py-2 border-b flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={showGrid}
                  onChange={(e) => setShowGrid(e.target.checked)}
                  className="mr-1"
                />
                <span className="text-sm">Grid</span>
              </label>

              <div className="text-sm text-gray-600">
                Mode: <span className="capitalize font-medium">{dragMode}</span>
              </div>

              <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                WASD: Move camera | Click & drag objects | Delete: Remove selected
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCamera({ x: 0, y: 0, zoom: 0.5 })}
                className="px-2 py-1 bg-white border border-gray-300 rounded text-sm hover:bg-gray-50"
              >
                Reset View
              </button>
              <span className="text-sm">
                Zoom: {Math.round(camera.zoom * 100)}%
              </span>
            </div>
          </div>

          {/* Canvas */}
          <div className="flex-1 overflow-hidden bg-gray-800">
            <canvas
              ref={canvasRef}
              width={1920}
              height={1080}
              className={`w-full h-full object-contain ${
                isMovingCamera ? 'cursor-grabbing' : isDraggingObject ? 'cursor-move' : 'cursor-crosshair'
              }`}
              onMouseDown={handleCanvasMouseDown}
              onMouseMove={handleCanvasMouseMove}
              onMouseUp={handleCanvasMouseUp}
              onMouseLeave={handleCanvasMouseUp}
              onDrop={handleTokenDrop}
              onDragOver={handleDragOver}
            />
          </div>
        </div>
      </div>
    </div>
  );
}