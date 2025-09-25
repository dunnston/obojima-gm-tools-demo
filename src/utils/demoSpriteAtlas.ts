// Demo Sprite Atlas System using existing Vista assets
// This demonstrates the concept while we work on .basis file support

import { SpriteAtlasData, SpriteFrame, LoadedSprite, SpriteInstance, DepthLayers } from './spriteAtlasLoader';

export interface DemoSprite {
  name: string;
  imagePath: string;
  width: number;
  height: number;
  anchorX: number;
  anchorY: number;
  category: 'character' | 'object' | 'background' | 'effect';
}

// Demo sprites using existing Vista assets
export const DEMO_SPRITES: DemoSprite[] = [
  // Player Character Classes
  {
    name: 'Warrior',
    imagePath: '/images/vista/token-portraits/warrior.png',
    width: 100,
    height: 120,
    anchorX: 0.5,
    anchorY: 0.9,
    category: 'character'
  },
  {
    name: 'Mage',
    imagePath: '/images/vista/token-portraits/mage.png',
    width: 100,
    height: 120,
    anchorX: 0.5,
    anchorY: 0.9,
    category: 'character'
  },
  {
    name: 'Rogue',
    imagePath: '/images/vista/token-portraits/rogue.png',
    width: 100,
    height: 120,
    anchorX: 0.5,
    anchorY: 0.9,
    category: 'character'
  },
  {
    name: 'Cleric',
    imagePath: '/images/vista/token-portraits/cleric.png',
    width: 100,
    height: 120,
    anchorX: 0.5,
    anchorY: 0.9,
    category: 'character'
  },

  // Demo NPCs
  {
    name: 'Elara the Archer',
    imagePath: '/images/vista/Portraits/NPCs/Girl.png',
    width: 100,
    height: 120,
    anchorX: 0.5,
    anchorY: 0.9,
    category: 'character'
  },
  {
    name: 'Lord Aldric',
    imagePath: '/images/vista/Portraits/NPCs/noble.png',
    width: 100,
    height: 120,
    anchorX: 0.5,
    anchorY: 0.9,
    category: 'character'
  },
  {
    name: 'Kai the Young Swordsman',
    imagePath: '/images/vista/Portraits/NPCs/noble.png',
    width: 100,
    height: 120,
    anchorX: 0.5,
    anchorY: 0.9,
    category: 'character'
  },
  {
    name: 'Sally the Merchant',
    imagePath: '/images/vista/Portraits/NPCs/Girl.png',
    width: 100,
    height: 120,
    anchorX: 0.5,
    anchorY: 0.9,
    category: 'character'
  },

  // Demo Companions
  {
    name: 'Billy',
    imagePath: '/images/companions/companion-1758808343757.png',
    width: 80,
    height: 100,
    anchorX: 0.5,
    anchorY: 0.9,
    category: 'character'
  },
  {
    name: 'Glovey',
    imagePath: '/images/companions/companion-1758808674246.png',
    width: 80,
    height: 100,
    anchorX: 0.5,
    anchorY: 0.9,
    category: 'character'
  },

  // Objects from campsite theme (placeholder representations)
  {
    name: 'CampfireBase',
    imagePath: '/images/vista/objects/campfire.png',
    width: 150,
    height: 80,
    anchorX: 0.5,
    anchorY: 0.8,
    category: 'object'
  },
  {
    name: 'TentCanvas',
    imagePath: '/images/vista/objects/tent.png',
    width: 300,
    height: 200,
    anchorX: 0.5,
    anchorY: 0.9,
    category: 'background'
  },
  {
    name: 'BarrelWood',
    imagePath: '/images/vista/objects/barrel.png',
    width: 80,
    height: 100,
    anchorX: 0.5,
    anchorY: 0.9,
    category: 'object'
  },
  {
    name: 'CrateWood',
    imagePath: '/images/vista/objects/crate.png',
    width: 120,
    height: 100,
    anchorX: 0.5,
    anchorY: 0.9,
    category: 'object'
  }
];

export class DemoSpriteAtlasLoader {
  private sprites: Map<string, DemoSprite> = new Map();
  private textures: Map<string, HTMLImageElement> = new Map();
  private loadingPromises: Map<string, Promise<void>> = new Map();

  constructor() {
    // Register demo sprites
    DEMO_SPRITES.forEach(sprite => {
      this.sprites.set(sprite.name, sprite);
    });
  }

  async loadSprite(spriteName: string): Promise<void> {
    if (this.loadingPromises.has(spriteName)) {
      return this.loadingPromises.get(spriteName);
    }

    const sprite = this.sprites.get(spriteName);
    if (!sprite) {
      throw new Error(`Demo sprite not found: ${spriteName}`);
    }

    const loadPromise = this.performSpriteLoad(sprite);
    this.loadingPromises.set(spriteName, loadPromise);

    try {
      await loadPromise;
    } catch (error) {
      this.loadingPromises.delete(spriteName);
      // Don't throw - just log the error and continue
      console.warn(`Failed to load demo sprite ${spriteName}:`, error);
    }
  }

  private async performSpriteLoad(sprite: DemoSprite): Promise<void> {
    return new Promise((resolve) => {
      const img = new Image();

      img.onload = () => {
        this.textures.set(sprite.name, img);
        console.log(`Loaded demo sprite: ${sprite.name}`);
        resolve();
      };

      img.onerror = () => {
        // Create a colored placeholder rectangle
        this.createPlaceholderTexture(sprite);
        resolve();
      };

      img.src = sprite.imagePath;
    });
  }

  private createPlaceholderTexture(sprite: DemoSprite): void {
    const canvas = document.createElement('canvas');
    canvas.width = sprite.width;
    canvas.height = sprite.height;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      // Generate color based on sprite name
      const hash = this.hashString(sprite.name);
      const hue = hash % 360;
      const saturation = 60 + (hash % 40);
      const lightness = 45 + (hash % 20);

      ctx.fillStyle = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
      ctx.fillRect(0, 0, sprite.width, sprite.height);

      // Add border
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.lineWidth = 2;
      ctx.strokeRect(1, 1, sprite.width - 2, sprite.height - 2);

      // Add text label
      ctx.fillStyle = 'white';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(
        sprite.name.substring(0, 8),
        sprite.width / 2,
        sprite.height / 2 + 4
      );

      // Convert to image
      const img = new Image();
      img.onload = () => {
        this.textures.set(sprite.name, img);
      };
      img.src = canvas.toDataURL();
    }
  }

  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  getSprite(spriteName: string): LoadedSprite | null {
    const sprite = this.sprites.get(spriteName);
    if (!sprite) return null;

    const texture = this.textures.get(spriteName);

    return {
      name: sprite.name,
      frame: {
        frame: { x: 0, y: 0, w: sprite.width, h: sprite.height },
        rotated: false,
        trimmed: false,
        spriteSourceSize: { x: 0, y: 0, w: sprite.width, h: sprite.height },
        sourceSize: { w: sprite.width, h: sprite.height },
        anchor: { x: sprite.anchorX, y: sprite.anchorY }
      },
      atlasIndex: 0,
      texture
    };
  }

  getSpriteNames(): string[] {
    return Array.from(this.sprites.keys());
  }

  searchSprites(pattern: string): LoadedSprite[] {
    const regex = new RegExp(pattern, 'i');
    return this.getSpriteNames()
      .filter(name => regex.test(name))
      .map(name => this.getSprite(name))
      .filter((sprite): sprite is LoadedSprite => sprite !== null);
  }

  renderSprite(
    ctx: CanvasRenderingContext2D,
    instance: SpriteInstance,
    cameraX: number = 0,
    cameraY: number = 0
  ): boolean {
    if (instance.visible === false || instance.opacity === 0) {
      return false;
    }

    const sprite = this.getSprite(instance.spriteName);
    if (!sprite || !sprite.texture) {
      return false;
    }

    const { frame } = sprite;
    const scaleX = instance.scaleX || 1;
    const scaleY = instance.scaleY || 1;
    const rotation = instance.rotation || 0;
    const opacity = instance.opacity !== undefined ? instance.opacity : 1;

    // Calculate render position
    const renderX = instance.x - cameraX;
    const renderY = instance.y - cameraY;

    // Calculate anchor offset
    const anchorOffsetX = frame.sourceSize.w * frame.anchor.x * scaleX;
    const anchorOffsetY = frame.sourceSize.h * frame.anchor.y * scaleY;

    ctx.save();

    if (opacity < 1) {
      ctx.globalAlpha = opacity;
    }

    ctx.translate(renderX, renderY);
    if (rotation !== 0) {
      ctx.rotate(rotation);
    }
    ctx.scale(scaleX, scaleY);

    ctx.drawImage(
      sprite.texture,
      -anchorOffsetX,
      -anchorOffsetY,
      frame.sourceSize.w,
      frame.sourceSize.h
    );

    ctx.restore();
    return true;
  }

  renderSprites(
    ctx: CanvasRenderingContext2D,
    instances: SpriteInstance[],
    cameraX: number = 0,
    cameraY: number = 0
  ): void {
    // Sort by depth
    const sortedInstances = [...instances].sort((a, b) => a.depth - b.depth);

    for (const instance of sortedInstances) {
      this.renderSprite(ctx, instance, cameraX, cameraY);
    }
  }

  async loadAllSprites(): Promise<void> {
    const loadPromises = this.getSpriteNames().map(name => this.loadSprite(name));
    await Promise.all(loadPromises);
  }
}

// Export demo instance
export const demoSpriteAtlasLoader = new DemoSpriteAtlasLoader();

// Utility to create demo sprite instances
export function createDemoSprite(
  spriteName: string,
  x: number,
  y: number,
  options: Partial<SpriteInstance> = {}
): SpriteInstance {
  const demoSprite = DEMO_SPRITES.find(s => s.name === spriteName);
  const baseDepth = demoSprite ? getDemoDepthCategory(demoSprite.category) : DepthLayers.GROUND_OBJECTS;

  return {
    id: options.id || `${spriteName}_${x}_${y}_${Date.now()}`,
    spriteName,
    x,
    y,
    scaleX: options.scaleX || 1,
    scaleY: options.scaleY || 1,
    rotation: options.rotation || 0,
    depth: options.depth !== undefined
      ? options.depth
      : baseDepth + Math.floor(y / 10), // Y-based depth sorting
    visible: options.visible !== false,
    opacity: options.opacity || 1,
    ...options
  };
}

function getDemoDepthCategory(category: string): number {
  switch (category) {
    case 'background': return DepthLayers.BACKGROUND;
    case 'object': return DepthLayers.GROUND_OBJECTS;
    case 'character': return DepthLayers.CHARACTERS;
    case 'effect': return DepthLayers.EFFECTS;
    default: return DepthLayers.GROUND_OBJECTS;
  }
}