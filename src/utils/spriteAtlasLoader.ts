// Sprite Atlas Loading and Management System
// Handles loading and rendering of sprite atlases with depth sorting

export interface SpriteFrame {
  frame: {
    x: number;
    y: number;
    w: number;
    h: number;
  };
  rotated: boolean;
  trimmed: boolean;
  spriteSourceSize: {
    x: number;
    y: number;
    w: number;
    h: number;
  };
  sourceSize: {
    w: number;
    h: number;
  };
  anchor: {
    x: number;
    y: number;
  };
}

export interface SpriteAtlasData {
  frames: Record<string, SpriteFrame>;
  meta: {
    app: string;
    version: string;
    image: string;
    format: string;
    size: {
      w: number;
      h: number;
    };
    scale: string;
    related_multi_packs?: string[];
    smartupdate?: string;
  };
}

export interface LoadedSprite {
  name: string;
  frame: SpriteFrame;
  atlasIndex: number;
  texture?: HTMLImageElement;
}

export interface SpriteInstance {
  id: string;
  spriteName: string;
  x: number;
  y: number;
  scaleX?: number;
  scaleY?: number;
  rotation?: number;
  depth: number; // For depth sorting
  visible?: boolean;
  opacity?: number;
}

export class SpriteAtlasLoader {
  private atlases: Map<string, SpriteAtlasData> = new Map();
  private textures: Map<string, HTMLImageElement> = new Map();
  private sprites: Map<string, LoadedSprite> = new Map();
  private loadingPromises: Map<string, Promise<void>> = new Map();

  // Load a sprite atlas from JSON and texture files
  async loadAtlas(basePath: string, atlasName: string): Promise<void> {
    const loadKey = `${basePath}/${atlasName}`;

    if (this.loadingPromises.has(loadKey)) {
      return this.loadingPromises.get(loadKey);
    }

    const loadPromise = this.performAtlasLoad(basePath, atlasName);
    this.loadingPromises.set(loadKey, loadPromise);

    try {
      await loadPromise;
    } catch (error) {
      this.loadingPromises.delete(loadKey);
      throw error;
    }
  }

  private async performAtlasLoad(basePath: string, atlasName: string): Promise<void> {
    try {
      // Load JSON metadata
      const jsonPath = `${basePath}/${atlasName}.json`;
      const response = await fetch(jsonPath);
      if (!response.ok) {
        throw new Error(`Failed to load atlas JSON: ${jsonPath}`);
      }

      const atlasData: SpriteAtlasData = await response.json();
      this.atlases.set(atlasName, atlasData);

      // Load main texture
      await this.loadTexture(basePath, atlasData.meta.image, atlasName);

      // Load related textures if they exist
      if (atlasData.meta.related_multi_packs) {
        for (const relatedPack of atlasData.meta.related_multi_packs) {
          const relatedName = relatedPack.replace('.json', '');
          await this.loadAtlas(basePath, relatedName);
        }
      }

      // Register all sprites from this atlas
      Object.entries(atlasData.frames).forEach(([spriteName, frame]) => {
        this.sprites.set(spriteName, {
          name: spriteName,
          frame,
          atlasIndex: parseInt(atlasName) || 0,
          texture: this.textures.get(`${atlasName}_texture`)
        });
      });

      console.log(`Loaded sprite atlas: ${atlasName} with ${Object.keys(atlasData.frames).length} sprites`);
    } catch (error) {
      console.error(`Failed to load sprite atlas ${atlasName}:`, error);
      throw error;
    }
  }

  private async loadTexture(basePath: string, imageName: string, atlasName: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const textureKey = `${atlasName}_texture`;

      img.onload = () => {
        this.textures.set(textureKey, img);
        console.log(`Loaded texture: ${imageName} for atlas ${atlasName}`);
        resolve();
      };

      img.onerror = () => {
        // If the original format fails, try common web formats
        const fallbackFormats = ['png', 'jpg', 'jpeg', 'webp'];
        const baseNameWithoutExt = imageName.split('.')[0];

        let formatIndex = 0;
        const tryNextFormat = () => {
          if (formatIndex >= fallbackFormats.length) {
            reject(new Error(`Failed to load texture: ${imageName} (tried all fallback formats)`));
            return;
          }

          const fallbackImg = new Image();
          const fallbackPath = `${basePath}/${baseNameWithoutExt}.${fallbackFormats[formatIndex]}`;

          fallbackImg.onload = () => {
            this.textures.set(textureKey, fallbackImg);
            console.log(`Loaded fallback texture: ${fallbackPath} for atlas ${atlasName}`);
            resolve();
          };

          fallbackImg.onerror = () => {
            formatIndex++;
            tryNextFormat();
          };

          fallbackImg.src = fallbackPath;
        };

        tryNextFormat();
      };

      // Handle different image formats - try original first
      const imagePath = `${basePath}/${imageName}`;
      img.src = imagePath;
    });
  }

  // Get sprite data by name
  getSprite(spriteName: string): LoadedSprite | null {
    return this.sprites.get(spriteName) || null;
  }

  // Get all available sprite names
  getSpriteNames(): string[] {
    return Array.from(this.sprites.keys());
  }

  // Search sprites by pattern
  searchSprites(pattern: string): LoadedSprite[] {
    const regex = new RegExp(pattern, 'i');
    return Array.from(this.sprites.values()).filter(sprite =>
      regex.test(sprite.name)
    );
  }

  // Render a sprite instance to canvas
  renderSprite(
    ctx: CanvasRenderingContext2D,
    instance: SpriteInstance,
    cameraX: number = 0,
    cameraY: number = 0
  ): boolean {
    if (!instance.visible !== false && instance.opacity !== 0) {
      return false;
    }

    const sprite = this.getSprite(instance.spriteName);
    if (!sprite || !sprite.texture) {
      console.warn(`Sprite not found or texture not loaded: ${instance.spriteName}`);
      return false;
    }

    const { frame } = sprite;
    const scaleX = instance.scaleX || 1;
    const scaleY = instance.scaleY || 1;
    const rotation = instance.rotation || 0;
    const opacity = instance.opacity !== undefined ? instance.opacity : 1;

    // Calculate render position (world coordinates - camera offset)
    const renderX = instance.x - cameraX;
    const renderY = instance.y - cameraY;

    // Calculate anchor offset
    const anchorOffsetX = frame.sourceSize.w * frame.anchor.x * scaleX;
    const anchorOffsetY = frame.sourceSize.h * frame.anchor.y * scaleY;

    ctx.save();

    // Apply opacity
    if (opacity < 1) {
      ctx.globalAlpha = opacity;
    }

    // Apply transformations
    ctx.translate(renderX, renderY);
    if (rotation !== 0) {
      ctx.rotate(rotation);
    }
    ctx.scale(scaleX, scaleY);

    // Draw the sprite with proper anchoring
    ctx.drawImage(
      sprite.texture,
      frame.frame.x, // source x
      frame.frame.y, // source y
      frame.frame.w, // source width
      frame.frame.h, // source height
      -anchorOffsetX + frame.spriteSourceSize.x, // dest x
      -anchorOffsetY + frame.spriteSourceSize.y, // dest y
      frame.frame.w, // dest width
      frame.frame.h  // dest height
    );

    ctx.restore();
    return true;
  }

  // Render multiple sprite instances with depth sorting
  renderSprites(
    ctx: CanvasRenderingContext2D,
    instances: SpriteInstance[],
    cameraX: number = 0,
    cameraY: number = 0
  ): void {
    // Sort by depth (higher depth values render on top)
    const sortedInstances = [...instances].sort((a, b) => a.depth - b.depth);

    for (const instance of sortedInstances) {
      this.renderSprite(ctx, instance, cameraX, cameraY);
    }
  }

  // Check if an atlas is loaded
  isAtlasLoaded(atlasName: string): boolean {
    return this.atlases.has(atlasName);
  }

  // Get atlas metadata
  getAtlasMetadata(atlasName: string): SpriteAtlasData | null {
    return this.atlases.get(atlasName) || null;
  }

  // Clear all loaded data
  clear(): void {
    this.atlases.clear();
    this.textures.clear();
    this.sprites.clear();
    this.loadingPromises.clear();
  }
}

// Global sprite atlas loader instance
export const spriteAtlasLoader = new SpriteAtlasLoader();

// Utility functions for depth calculation
export const DepthLayers = {
  BACKGROUND: 0,
  GROUND_OBJECTS: 100,
  CHARACTERS: 200,
  FOREGROUND_OBJECTS: 300,
  UI_ELEMENTS: 400,
  EFFECTS: 500
} as const;

export function calculateDepthFromY(y: number, baseDepth: number = DepthLayers.CHARACTERS): number {
  // Objects lower on the screen (higher Y) should render in front
  return baseDepth + Math.floor(y / 10);
}

export function getObjectDepthCategory(spriteName: string): number {
  const name = spriteName.toLowerCase();

  // Background elements
  if (name.includes('tent') || name.includes('wagon') || name.includes('background')) {
    return DepthLayers.BACKGROUND;
  }

  // Ground objects
  if (name.includes('crate') || name.includes('barrel') || name.includes('campfire') ||
      name.includes('basket') || name.includes('fabric') || name.includes('candle')) {
    return DepthLayers.GROUND_OBJECTS;
  }

  // Characters and creatures
  if (name.includes('rask') || name.includes('yarnac') || name.includes('trickadee')) {
    return DepthLayers.CHARACTERS;
  }

  // Default to ground objects
  return DepthLayers.GROUND_OBJECTS;
}