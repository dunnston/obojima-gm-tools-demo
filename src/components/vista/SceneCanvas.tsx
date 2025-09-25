'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  VistaScene,
  VistaCharacterToken,
  Point,
  Viewport,
  DepthZone
} from '@/data/vistaScenes';
import {
  getDepthZoneBoundaries,
  getDepthZoneColor,
  getDepthZoneLabel,
  sortTokensByDepth
} from '@/utils/vistaDepthManager';
import CharacterToken from './CharacterToken';
import DepthIndicator from './DepthIndicator';

interface SceneCanvasProps {
  scene: VistaScene;
  viewport: Viewport;
  selectedTokens: string[];
  isDragging: boolean;
  draggedToken: string | null;
  showGrid: boolean;
  showDepthIndicators: boolean;
  readOnly?: boolean;
  onViewportChange: (viewport: Viewport) => void;
  onTokenDragStart: (tokenId: string, offset: Point) => void;
  onTokenDragMove: (tokenId: string, position: Point) => void;
  onTokenDragEnd: (tokenId: string) => void;
  onTokenSelect: (tokenId: string, multi: boolean) => void;
  onTokenContextMenu: (tokenId: string, position: Point) => void;
  onCanvasClick: (position: Point) => void;
  onAddCharacterToken?: (character: any, position: Point) => void;
}

export default function SceneCanvas({
  scene,
  viewport,
  selectedTokens,
  isDragging,
  draggedToken,
  showGrid,
  showDepthIndicators,
  readOnly = false,
  onViewportChange,
  onTokenDragStart,
  onTokenDragMove,
  onTokenDragEnd,
  onTokenSelect,
  onTokenContextMenu,
  onCanvasClick,
  onAddCharacterToken
}: SceneCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const backgroundRef = useRef<HTMLDivElement>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });
  const [isPointerDown, setIsPointerDown] = useState(false);
  const [lastPointerPos, setLastPointerPos] = useState<Point>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [dragOverPosition, setDragOverPosition] = useState<Point | null>(null);

  // Update canvas size when container resizes
  useEffect(() => {
    const updateCanvasSize = () => {
      if (canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        setCanvasSize({ width: rect.width, height: rect.height });
      }
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    return () => window.removeEventListener('resize', updateCanvasSize);
  }, []);

  // Add keyboard controls for moving selected tokens
  useEffect(() => {
    if (readOnly || selectedTokens.length === 0) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Only handle WASD if no input element is focused
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }

      const moveDistance = event.shiftKey ? 50 : 10; // Shift for larger steps
      let deltaX = 0;
      let deltaY = 0;

      switch (event.key.toLowerCase()) {
        case 'w':
          deltaY = -moveDistance;
          break;
        case 'a':
          deltaX = -moveDistance;
          break;
        case 's':
          deltaY = moveDistance;
          break;
        case 'd':
          deltaX = moveDistance;
          break;
        default:
          return; // Exit if not WASD
      }

      event.preventDefault();

      // Move all selected tokens
      selectedTokens.forEach(tokenId => {
        const token = scene.tokens.find(t => t.id === tokenId);
        if (token) {
          const newPosition = {
            x: Math.max(0, Math.min(scene.dimensions.width, token.position.x + deltaX)),
            y: Math.max(0, Math.min(scene.dimensions.height, token.position.y + deltaY))
          };
          onTokenDragMove(tokenId, newPosition);
        }
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [readOnly, selectedTokens, scene.tokens, scene.dimensions, onTokenDragMove]);

  // Convert screen coordinates to scene coordinates
  const screenToScene = useCallback((screenX: number, screenY: number): Point => {
    if (!canvasRef.current) return { x: 0, y: 0 };

    const rect = canvasRef.current.getBoundingClientRect();
    const relativeX = screenX - rect.left;
    const relativeY = screenY - rect.top;

    // Calculate where the scene background starts within the canvas
    const sceneWidth = scene.dimensions.width * viewport.zoom;
    const sceneHeight = scene.dimensions.height * viewport.zoom;
    const sceneStartX = (canvasSize.width - sceneWidth) / 2 + viewport.x * viewport.zoom;
    const sceneStartY = (canvasSize.height - sceneHeight) / 2 + viewport.y * viewport.zoom;

    // Convert to scene coordinates (0,0 = top-left of scene background)
    const sceneRelativeX = relativeX - sceneStartX;
    const sceneRelativeY = relativeY - sceneStartY;

    return {
      x: Math.max(0, Math.min(scene.dimensions.width, sceneRelativeX / viewport.zoom)),
      y: Math.max(0, Math.min(scene.dimensions.height, sceneRelativeY / viewport.zoom))
    };
  }, [canvasSize, viewport, scene.dimensions]);

  // Convert scene coordinates to screen coordinates
  const sceneToScreen = useCallback((sceneX: number, sceneY: number): Point => {
    return {
      x: (sceneX + viewport.x) * viewport.zoom + canvasSize.width / 2,
      y: (sceneY + viewport.y) * viewport.zoom + canvasSize.height / 2
    };
  }, [canvasSize, viewport]);

  // Handle pointer down (mouse/touch start)
  const handlePointerDown = useCallback((event: React.PointerEvent) => {
    if (readOnly) return;

    event.preventDefault();
    setIsPointerDown(true);
    setLastPointerPos({ x: event.clientX, y: event.clientY });

    // Check if clicking on empty canvas (not on tokens)
    const target = event.target as HTMLElement;
    if (target === canvasRef.current || target.closest('[data-canvas-background]')) {
      const scenePos = screenToScene(event.clientX, event.clientY);

      // If middle mouse or space+click, start panning
      if (event.button === 1 || (event.button === 0 && event.ctrlKey)) {
        setIsPanning(true);
        event.preventDefault();
        return;
      }

      // Otherwise, handle canvas click (deselect, etc.)
      onCanvasClick(scenePos);
    }
  }, [readOnly, screenToScene, onCanvasClick]);

  // Handle pointer move (mouse/touch move)
  const handlePointerMove = useCallback((event: React.PointerEvent) => {
    if (!isPointerDown) return;

    const deltaX = event.clientX - lastPointerPos.x;
    const deltaY = event.clientY - lastPointerPos.y;

    if (isPanning) {
      // Pan the viewport
      const newViewport = {
        ...viewport,
        x: viewport.x + deltaX / viewport.zoom,
        y: viewport.y + deltaY / viewport.zoom
      };
      onViewportChange(newViewport);
    }

    setLastPointerPos({ x: event.clientX, y: event.clientY });
  }, [isPointerDown, lastPointerPos, isPanning, viewport, onViewportChange]);

  // Handle pointer up (mouse/touch end)
  const handlePointerUp = useCallback(() => {
    setIsPointerDown(false);
    setIsPanning(false);
  }, []);

  // Handle wheel zoom
  const handleWheel = useCallback((event: React.WheelEvent) => {
    if (readOnly) return;

    event.preventDefault();

    const zoomFactor = event.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = Math.max(0.25, Math.min(4, viewport.zoom * zoomFactor));

    // Zoom towards cursor position
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      const centerX = event.clientX - rect.left - canvasSize.width / 2;
      const centerY = event.clientY - rect.top - canvasSize.height / 2;

      const newViewport = {
        ...viewport,
        x: viewport.x + (centerX / viewport.zoom - centerX / newZoom),
        y: viewport.y + (centerY / viewport.zoom - centerY / newZoom),
        zoom: newZoom
      };

      onViewportChange(newViewport);
    }
  }, [readOnly, viewport, canvasSize, onViewportChange]);

  // Handle drag over (from character palette)
  const handleDragOver = useCallback((event: React.DragEvent) => {
    if (readOnly || !onAddCharacterToken) return;

    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';

    const scenePos = screenToScene(event.clientX, event.clientY);
    setDragOverPosition(scenePos);
  }, [readOnly, onAddCharacterToken, screenToScene]);

  // Handle drag leave
  const handleDragLeave = useCallback((event: React.DragEvent) => {
    // Only clear if we're actually leaving the canvas area
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect && (
      event.clientX < rect.left ||
      event.clientX > rect.right ||
      event.clientY < rect.top ||
      event.clientY > rect.bottom
    )) {
      setDragOverPosition(null);
    }
  }, []);

  // Handle drop (from character palette)
  const handleDrop = useCallback((event: React.DragEvent) => {
    if (readOnly || !onAddCharacterToken) return;

    event.preventDefault();
    setDragOverPosition(null);

    try {
      const dragData = JSON.parse(event.dataTransfer.getData('application/json'));
      if (dragData.type === 'character-token') {
        const scenePos = screenToScene(event.clientX, event.clientY);

        // Debug logging
        console.log('Drop debug - Mouse screen:', { x: event.clientX, y: event.clientY });
        console.log('Drop debug - Scene position:', scenePos);
        console.log('Drop debug - Viewport:', viewport);
        console.log('Drop debug - Canvas size:', canvasSize);

        onAddCharacterToken(dragData.item, scenePos);
      }
    } catch (error) {
      console.error('Error handling drop:', error);
    }
  }, [readOnly, onAddCharacterToken, screenToScene]);

  // Calculate canvas transform for viewport
  const canvasTransform = `translate(${viewport.x * viewport.zoom}px, ${viewport.y * viewport.zoom}px) scale(${viewport.zoom})`;

  // Get depth zone boundaries for indicators
  const depthBoundaries = getDepthZoneBoundaries(scene.dimensions.height);

  // Sort tokens for proper rendering order
  const sortedTokens = sortTokensByDepth(scene.tokens);

  // Grid configuration
  const gridSize = scene.gridSize * viewport.zoom;
  const gridOffsetX = (viewport.x * viewport.zoom) % gridSize;
  const gridOffsetY = (viewport.y * viewport.zoom) % gridSize;

  return (
    <div
      ref={canvasRef}
      className="relative w-full h-full overflow-hidden bg-gray-900 cursor-crosshair select-none"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      onWheel={handleWheel}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      style={{ touchAction: 'none' }}
    >
      {/* Background Layer */}
      <div
        ref={backgroundRef}
        data-canvas-background
        className="absolute inset-0"
        style={{ transform: canvasTransform, transformOrigin: '0 0' }}
      >
        {/* Main Background */}
        {scene.background.primary && (
          <div
            className="absolute"
            style={{
              width: scene.dimensions.width,
              height: scene.dimensions.height,
              backgroundImage: `url(${scene.background.primary})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              filter: `brightness(${scene.background.brightness || 1}) blur(${scene.background.blur || 0}px)`,
              backgroundColor: scene.background.tint || 'transparent'
            }}
          />
        )}

        {/* Parallax Layers */}
        {scene.background.layers?.map((layerImage, index) => (
          <div
            key={`parallax-${index}`}
            className="absolute"
            style={{
              width: scene.dimensions.width,
              height: scene.dimensions.height,
              backgroundImage: `url(${layerImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              transform: `translate(${viewport.x * (scene.background.parallaxRates?.[index] || 0.5)}px, ${viewport.y * (scene.background.parallaxRates?.[index] || 0.5)}px)`,
              opacity: 0.8
            }}
          />
        ))}

        {/* Grid Overlay */}
        {showGrid && (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              width: scene.dimensions.width,
              height: scene.dimensions.height,
              backgroundImage: `
                linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
              `,
              backgroundSize: `${scene.gridSize}px ${scene.gridSize}px`
            }}
          />
        )}

        {/* Depth Zone Indicators */}
        {showDepthIndicators && (
          <>
            {/* Background Zone */}
            <div
              className="absolute pointer-events-none"
              style={{
                width: scene.dimensions.width,
                height: depthBoundaries.background.bottom,
                top: 0,
                backgroundColor: `${getDepthZoneColor('background')}15`,
                borderBottom: `2px solid ${getDepthZoneColor('background')}50`
              }}
            >
              <div className="absolute top-2 left-4 text-white text-sm font-medium bg-black/50 px-2 py-1 rounded">
                {getDepthZoneLabel('background')}
              </div>
            </div>

            {/* Midground Zone */}
            <div
              className="absolute pointer-events-none"
              style={{
                width: scene.dimensions.width,
                height: depthBoundaries.midground.bottom - depthBoundaries.midground.top,
                top: depthBoundaries.midground.top,
                backgroundColor: `${getDepthZoneColor('midground')}15`,
                borderTop: `2px solid ${getDepthZoneColor('midground')}50`,
                borderBottom: `2px solid ${getDepthZoneColor('midground')}50`
              }}
            >
              <div className="absolute top-2 left-4 text-white text-sm font-medium bg-black/50 px-2 py-1 rounded">
                {getDepthZoneLabel('midground')}
              </div>
            </div>

            {/* Foreground Zone */}
            <div
              className="absolute pointer-events-none"
              style={{
                width: scene.dimensions.width,
                height: scene.dimensions.height - depthBoundaries.foreground.top,
                top: depthBoundaries.foreground.top,
                backgroundColor: `${getDepthZoneColor('foreground')}15`,
                borderTop: `2px solid ${getDepthZoneColor('foreground')}50`
              }}
            >
              <div className="absolute top-2 left-4 text-white text-sm font-medium bg-black/50 px-2 py-1 rounded">
                {getDepthZoneLabel('foreground')}
              </div>
            </div>
          </>
        )}

        {/* Character Tokens */}
        <div
          className="absolute pointer-events-none"
          style={{
            width: scene.dimensions.width,
            height: scene.dimensions.height
          }}
        >
          {sortedTokens.map(token => (
            <div key={token.id} className="pointer-events-auto">
              <CharacterToken
                token={token}
                isSelected={selectedTokens.includes(token.id)}
                isDragging={isDragging && draggedToken === token.id}
                readOnly={readOnly}
                onDragStart={(tokenId, offset) => onTokenDragStart(tokenId, offset)}
                onDragMove={(tokenId, position) => onTokenDragMove(tokenId, position)}
                onDragEnd={(tokenId) => onTokenDragEnd(tokenId)}
                onSelect={(tokenId, multi) => onTokenSelect(tokenId, multi)}
                onContextMenu={(tokenId, position) => onTokenContextMenu(tokenId, position)}
              />
            </div>
          ))}
        </div>

        {/* Drop Target Indicator */}
        {dragOverPosition && (
          <div
            className="absolute pointer-events-none z-50"
            style={{
              left: dragOverPosition.x - 50,
              top: dragOverPosition.y - 50,
              width: 100,
              height: 100,
              border: '3px dashed #3b82f6',
              borderRadius: '50%',
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              transform: `scale(${viewport.zoom})`,
              transformOrigin: 'center'
            }}
          >
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-blue-600 text-xs font-bold bg-white px-2 py-1 rounded shadow">
                DROP HERE
              </div>
            </div>
          </div>
        )}
      </div>

      {/* UI Overlay */}
      <div className="absolute top-4 right-4 pointer-events-none">
        <div className="bg-black/70 text-white text-sm px-3 py-2 rounded">
          <div>Zoom: {Math.round(viewport.zoom * 100)}%</div>
          <div>Tokens: {scene.tokens.length}</div>
          {isDragging && draggedToken && (
            <div className="text-blue-300">Dragging...</div>
          )}
        </div>
      </div>

      {/* Crosshair cursor helper */}
      {!readOnly && !isDragging && (
        <div className="absolute top-4 left-4 pointer-events-none">
          <div className="bg-black/70 text-white text-xs px-2 py-1 rounded">
            <div>Pan: Middle-click drag</div>
            <div>Zoom: Mouse wheel</div>
            <div>Select: Click token</div>
          </div>
        </div>
      )}

      {/* Loading placeholder when no background */}
      {!scene.background.primary && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
          <div className="text-center text-gray-400">
            <div className="text-6xl mb-4">🏞️</div>
            <div className="text-lg font-medium">No Background Set</div>
            <div className="text-sm">Select a background image to begin</div>
          </div>
        </div>
      )}
    </div>
  );
}