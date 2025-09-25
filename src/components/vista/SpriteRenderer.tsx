'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  SpriteInstance,
  LoadedSprite,
  calculateDepthFromY,
  getObjectDepthCategory
} from '@/utils/spriteAtlasLoader';
import { demoSpriteAtlasLoader, DEMO_SPRITES, createDemoSprite } from '@/utils/demoSpriteAtlas';

interface SpriteRendererProps {
  width: number;
  height: number;
  sprites: SpriteInstance[];
  cameraX?: number;
  cameraY?: number;
  onSpriteClick?: (sprite: SpriteInstance, event: MouseEvent) => void;
  onCanvasClick?: (x: number, y: number, event: MouseEvent) => void;
  className?: string;
}

export default function SpriteRenderer({
  width,
  height,
  sprites,
  cameraX = 0,
  cameraY = 0,
  onSpriteClick,
  onCanvasClick,
  className = ''
}: SpriteRendererProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();
  const [isInitialized, setIsInitialized] = useState(false);
  const [loadingSprites, setLoadingSprites] = useState(true);

  // Initialize demo sprite atlas
  useEffect(() => {
    const initializeAtlas = async () => {
      try {
        console.log('Loading demo sprite atlas...');

        // Load all demo sprites
        await demoSpriteAtlasLoader.loadAllSprites();

        console.log('Demo sprite atlas loaded successfully');
        console.log('Available sprites:', demoSpriteAtlasLoader.getSpriteNames());

        setIsInitialized(true);
        setLoadingSprites(false);
      } catch (error) {
        console.error('Failed to load demo sprite atlas:', error);
        setLoadingSprites(false);
      }
    };

    initializeAtlas();
  }, []);

  // Render function
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !isInitialized) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Set high quality rendering
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // Render all sprites with depth sorting
    demoSpriteAtlasLoader.renderSprites(ctx, sprites, cameraX, cameraY);

    // Debug info
    if (sprites.length > 0) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(10, 10, 200, 80);
      ctx.fillStyle = 'white';
      ctx.font = '12px monospace';
      ctx.fillText(`Sprites: ${sprites.length}`, 15, 25);
      ctx.fillText(`Camera: ${Math.round(cameraX)}, ${Math.round(cameraY)}`, 15, 40);
      ctx.fillText(`Atlas loaded: ${isInitialized}`, 15, 55);
      ctx.fillText(`Available: ${demoSpriteAtlasLoader.getSpriteNames().length}`, 15, 70);
    }
  }, [width, height, sprites, cameraX, cameraY, isInitialized]);

  // Animation loop
  useEffect(() => {
    const animate = () => {
      render();
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    if (isInitialized) {
      animate();
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [render, isInitialized]);

  // Handle click events
  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left) + cameraX;
    const y = (event.clientY - rect.top) + cameraY;

    // Check if click hit any sprite (reverse depth order to check top sprites first)
    const sortedSprites = [...sprites].sort((a, b) => b.depth - a.depth);

    for (const sprite of sortedSprites) {
      if (isPointInSprite(x, y, sprite)) {
        if (onSpriteClick) {
          onSpriteClick(sprite, event.nativeEvent);
          return;
        }
      }
    }

    // If no sprite was clicked, call canvas click handler
    if (onCanvasClick) {
      onCanvasClick(x, y, event.nativeEvent);
    }
  };

  // Check if a point is within a sprite's bounds
  const isPointInSprite = (x: number, y: number, sprite: SpriteInstance): boolean => {
    const loadedSprite = demoSpriteAtlasLoader.getSprite(sprite.spriteName);
    if (!loadedSprite) return false;

    const { frame } = loadedSprite;
    const scaleX = sprite.scaleX || 1;
    const scaleY = sprite.scaleY || 1;

    // Calculate sprite bounds with anchor
    const anchorOffsetX = frame.sourceSize.w * frame.anchor.x * scaleX;
    const anchorOffsetY = frame.sourceSize.h * frame.anchor.y * scaleY;

    const left = sprite.x - anchorOffsetX + frame.spriteSourceSize.x * scaleX;
    const top = sprite.y - anchorOffsetY + frame.spriteSourceSize.y * scaleY;
    const right = left + frame.frame.w * scaleX;
    const bottom = top + frame.frame.h * scaleY;

    return x >= left && x <= right && y >= top && y <= bottom;
  };

  if (loadingSprites) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-100 ${className}`}
        style={{ width, height }}
      >
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-2 border-blue-500 rounded-full border-t-transparent mx-auto mb-2" />
          <p className="text-sm text-gray-600">Loading sprite atlas...</p>
        </div>
      </div>
    );
  }

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      onClick={handleCanvasClick}
      className={`bg-gray-50 cursor-crosshair ${className}`}
      style={{
        width: `${width}px`,
        height: `${height}px`,
        imageRendering: 'pixelated' // For pixel-perfect sprite rendering
      }}
    />
  );
}

// Hook for creating sprite instances with automatic depth calculation
export function useSprite(
  spriteName: string,
  x: number,
  y: number,
  options: Partial<SpriteInstance> = {}
): SpriteInstance {
  return createDemoSprite(spriteName, x, y, options);
}

// Component for browsing available sprites
interface SpriteBrowserProps {
  onSpriteSelect: (spriteName: string) => void;
  searchFilter?: string;
  className?: string;
}

export function SpriteBrowser({ onSpriteSelect, searchFilter = '', className = '' }: SpriteBrowserProps) {
  const [sprites, setSprites] = useState<LoadedSprite[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSprites = () => {
      if (demoSpriteAtlasLoader.getSpriteNames().length > 0) {
        const allSprites = demoSpriteAtlasLoader.getSpriteNames()
          .map(name => demoSpriteAtlasLoader.getSprite(name))
          .filter((sprite): sprite is LoadedSprite => sprite !== null);

        setSprites(allSprites);
        setLoading(false);
      } else {
        // Retry after a short delay
        setTimeout(loadSprites, 100);
      }
    };

    loadSprites();
  }, []);

  const filteredSprites = sprites.filter(sprite =>
    sprite.name.toLowerCase().includes(searchFilter.toLowerCase())
  );

  if (loading) {
    return (
      <div className={`p-4 ${className}`}>
        <p>Loading sprites...</p>
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      <div className="grid grid-cols-3 gap-2 max-h-96 overflow-y-auto p-2">
        {filteredSprites.map(sprite => (
          <button
            key={sprite.name}
            onClick={() => onSpriteSelect(sprite.name)}
            className="p-2 border border-gray-300 rounded hover:bg-blue-50 text-xs"
            title={sprite.name}
          >
            <div className="truncate">{sprite.name}</div>
            <div className="text-xs text-gray-500">
              {sprite.frame.sourceSize.w}×{sprite.frame.sourceSize.h}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}