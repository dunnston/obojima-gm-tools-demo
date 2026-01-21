/**
 * Parallax Background System for Layered Vista Scenes
 *
 * This system handles multi-layer backgrounds with proper depth sorting
 * for ground-based movement where characters walk behind objects.
 */

export interface ParallaxLayer {
  id: string;
  name: string;
  imagePath: string;
  zIndex: number;
  parallaxRate: number;  // 0 = no parallax, 1 = full parallax
  opacity: number;       // 0-1
  blendMode?: string;    // CSS blend mode
  isGround?: boolean;    // True for ground/base layers that don't move
  scale?: number;        // Layer scale multiplier
  offset?: {
    x: number;
    y: number;
  };
}

export interface LayeredScene {
  id: string;
  name: string;
  baseDimensions: {
    width: number;
    height: number;
  };
  layers: ParallaxLayer[];
  characterZone: {
    minZ: number;    // Characters render between minZ and maxZ
    maxZ: number;
  };
}

// Koi Pond Scene Configuration
export const KOI_POND_SCENE: LayeredScene = {
  id: 'koi-pond-parallax',
  name: 'Koi Pond Parallax Scene',
  baseDimensions: {
    width: 1920,
    height: 1080
  },
  layers: [
    // Background (furthest back)
    {
      id: 'pond-base',
      name: 'Pond Base',
      imagePath: '/images/vista/backgrounds/koipond/Pond.png',
      zIndex: 10,
      parallaxRate: 0, // Static background
      opacity: 1.0,
      isGround: true
    },

    // Far background elements
    {
      id: 'tree-far',
      name: 'Background Trees',
      imagePath: '/images/vista/backgrounds/koipond/Tree.png',
      zIndex: 20,
      parallaxRate: 0.2, // Slow parallax
      opacity: 1.0
    },
    {
      id: 'tree-2-far',
      name: 'Background Tree 2',
      imagePath: '/images/vista/backgrounds/koipond/Tree 2.png',
      zIndex: 25,
      parallaxRate: 0.2,
      opacity: 1.0
    },

    // Mid-background bushes
    {
      id: 'bushes-back',
      name: 'Background Bushes',
      imagePath: '/images/vista/backgrounds/koipond/Bushes.png',
      zIndex: 30,
      parallaxRate: 0.4,
      opacity: 1.0
    },
    {
      id: 'bushes-2-back',
      name: 'Background Bushes 2',
      imagePath: '/images/vista/backgrounds/koipond/Bushes 2.png',
      zIndex: 35,
      parallaxRate: 0.4,
      opacity: 1.0
    },

    // Rocks (behind character zone)
    {
      id: 'rock-1',
      name: 'Rock 1',
      imagePath: '/images/vista/backgrounds/koipond/Rock.png',
      zIndex: 40,
      parallaxRate: 0.6,
      opacity: 1.0
    },
    {
      id: 'rock-2',
      name: 'Rock 2',
      imagePath: '/images/vista/backgrounds/koipond/Rock 2.png',
      zIndex: 45,
      parallaxRate: 0.6,
      opacity: 1.0
    },

    // Statue (can be behind or in front of characters)
    {
      id: 'statue',
      name: 'Statue',
      imagePath: '/images/vista/backgrounds/koipond/Satutue.png',
      zIndex: 150, // In character zone
      parallaxRate: 0.8,
      opacity: 1.0
    },

    // Foreground elements (in front of characters)
    {
      id: 'bridge',
      name: 'Bridge',
      imagePath: '/images/vista/backgrounds/koipond/Bridge.png',
      zIndex: 200, // Above characters
      parallaxRate: 1.0, // Full parallax
      opacity: 1.0
    },

    // Individual bushes (can be placed strategically)
    {
      id: 'bush-1',
      name: 'Bush 1',
      imagePath: '/images/vista/backgrounds/koipond/Bush.png',
      zIndex: 180,
      parallaxRate: 0.9,
      opacity: 1.0
    },
    {
      id: 'bush-2',
      name: 'Bush 2',
      imagePath: '/images/vista/backgrounds/koipond/Bush 2.png',
      zIndex: 190,
      parallaxRate: 0.95,
      opacity: 1.0
    },
    {
      id: 'bush-3',
      name: 'Bush 3',
      imagePath: '/images/vista/backgrounds/koipond/Bush 3.png',
      zIndex: 185,
      parallaxRate: 0.9,
      opacity: 1.0
    },
    {
      id: 'bush-4',
      name: 'Bush 4',
      imagePath: '/images/vista/backgrounds/koipond/Bush 4.png',
      zIndex: 175,
      parallaxRate: 0.85,
      opacity: 1.0
    }
  ],
  characterZone: {
    minZ: 50,  // Characters render above rocks/background
    maxZ: 199  // Characters render below bridge/foreground bushes
  }
};

export class ParallaxRenderer {
  private viewport: { x: number; y: number; zoom: number } = { x: 0, y: 0, zoom: 1 };
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private imageCache: Map<string, HTMLImageElement> = new Map();
  private loadingPromises: Map<string, Promise<HTMLImageElement>> = new Map();

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
  }

  async loadImage(imagePath: string): Promise<HTMLImageElement> {
    if (this.imageCache.has(imagePath)) {
      return this.imageCache.get(imagePath)!;
    }

    if (this.loadingPromises.has(imagePath)) {
      return this.loadingPromises.get(imagePath)!;
    }

    const loadPromise = new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        this.imageCache.set(imagePath, img);
        resolve(img);
      };
      img.onerror = () => {
        console.error(`Failed to load parallax layer: ${imagePath}`);
        reject(new Error(`Failed to load image: ${imagePath}`));
      };
      img.src = imagePath;
    });

    this.loadingPromises.set(imagePath, loadPromise);

    try {
      return await loadPromise;
    } finally {
      this.loadingPromises.delete(imagePath);
    }
  }

  async preloadScene(scene: LayeredScene): Promise<void> {
    const loadPromises = scene.layers.map(layer => this.loadImage(layer.imagePath));
    await Promise.allSettled(loadPromises); // Don't fail if some images are missing
  }

  setViewport(x: number, y: number, zoom: number = 1): void {
    this.viewport = { x, y, zoom };
  }

  getCharacterDepthFromY(y: number, sceneHeight: number): number {
    const { characterZone } = KOI_POND_SCENE;

    // Map Y position to character zone depth
    const normalizedY = Math.max(0, Math.min(1, y / sceneHeight));
    const depthRange = characterZone.maxZ - characterZone.minZ;

    return Math.floor(characterZone.minZ + (depthRange * normalizedY));
  }

  render(scene: LayeredScene, characters: Array<{
    id: string;
    x: number;
    y: number;
    image: HTMLImageElement;
    scale?: number;
  }> = []): void {
    if (!this.ctx || !this.canvas) return;

    const { width, height } = this.canvas;
    this.ctx.clearRect(0, 0, width, height);

    // Calculate camera offset with parallax
    const cameraX = this.viewport.x * this.viewport.zoom;
    const cameraY = this.viewport.y * this.viewport.zoom;

    // Create render list with all elements
    interface RenderItem {
      zIndex: number;
      render: () => void;
    }

    const renderItems: RenderItem[] = [];

    // Add background layers
    scene.layers.forEach(layer => {
      const img = this.imageCache.get(layer.imagePath);
      if (!img) return;

      renderItems.push({
        zIndex: layer.zIndex,
        render: () => this.renderLayer(layer, img, cameraX, cameraY)
      });
    });

    // Add characters with depth-based z-index
    characters.forEach(char => {
      const charZ = this.getCharacterDepthFromY(char.y, scene.baseDimensions.height);
      renderItems.push({
        zIndex: charZ,
        render: () => this.renderCharacter(char, cameraX, cameraY)
      });
    });

    // Sort by z-index and render
    renderItems
      .sort((a, b) => a.zIndex - b.zIndex)
      .forEach(item => item.render());
  }

  private renderLayer(
    layer: ParallaxLayer,
    image: HTMLImageElement,
    cameraX: number,
    cameraY: number
  ): void {
    if (!this.ctx) return;

    this.ctx.save();

    // Apply opacity and blend mode
    this.ctx.globalAlpha = layer.opacity;
    if (layer.blendMode) {
      this.ctx.globalCompositeOperation = layer.blendMode as GlobalCompositeOperation;
    }

    // Calculate parallax offset
    const parallaxX = layer.isGround ? 0 : cameraX * layer.parallaxRate;
    const parallaxY = layer.isGround ? 0 : cameraY * layer.parallaxRate;

    // Apply layer offset
    const offsetX = (layer.offset?.x || 0) - parallaxX;
    const offsetY = (layer.offset?.y || 0) - parallaxY;

    // Apply scale
    const scale = (layer.scale || 1) * this.viewport.zoom;

    this.ctx.scale(scale, scale);
    this.ctx.drawImage(image, offsetX / scale, offsetY / scale);

    this.ctx.restore();
  }

  private renderCharacter(
    character: {
      id: string;
      x: number;
      y: number;
      image: HTMLImageElement;
      scale?: number;
    },
    cameraX: number,
    cameraY: number
  ): void {
    if (!this.ctx) return;

    this.ctx.save();

    const scale = (character.scale || 1) * this.viewport.zoom;
    const x = character.x - cameraX;
    const y = character.y - cameraY;

    this.ctx.scale(scale, scale);
    this.ctx.drawImage(
      character.image,
      (x / scale) - (character.image.width / 2),
      (y / scale) - character.image.height + 20 // Anchor to feet
    );

    this.ctx.restore();
  }

  // WASD camera movement
  moveCamera(deltaX: number, deltaY: number): void {
    this.viewport.x += deltaX;
    this.viewport.y += deltaY;
  }

  // Zoom functionality
  setZoom(zoom: number, centerX?: number, centerY?: number): void {
    if (centerX !== undefined && centerY !== undefined) {
      // Zoom toward a specific point
      const prevZoom = this.viewport.zoom;
      this.viewport.x = centerX - (centerX - this.viewport.x) * (zoom / prevZoom);
      this.viewport.y = centerY - (centerY - this.viewport.y) * (zoom / prevZoom);
    }
    this.viewport.zoom = Math.max(0.1, Math.min(3, zoom));
  }
}

// Utility function to create character render data
export function createCharacterRenderData(
  vistaToken: any,
  portraitImage: HTMLImageElement
) {
  return {
    id: vistaToken.id,
    x: vistaToken.position.x,
    y: vistaToken.position.y,
    image: portraitImage,
    scale: vistaToken.scale || 1
  };
}

// Export the koi pond scene for easy use
export { KOI_POND_SCENE as koiPondScene };