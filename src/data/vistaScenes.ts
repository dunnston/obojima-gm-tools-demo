/**
 * Vista Parallax Scene Editor - Data Models
 *
 * This module defines the core data structures for the Vista scene editor,
 * including character tokens, scenes, and depth zones.
 */

export type DepthZone = 'background' | 'midground' | 'foreground';

export interface Point {
  x: number;
  y: number;
}

export interface Viewport {
  x: number;
  y: number;
  zoom: number;
}

/**
 * Represents a character token in the scene
 */
export interface VistaCharacterToken {
  id: string;                            // Unique token identifier
  characterId?: string;                  // Link to existing character
  name: string;                          // Display name
  portrait: string;                      // Image path or URL
  position: Point;                       // Canvas position
  depth: DepthZone;                      // Current depth zone
  scale: number;                         // Calculated from depth
  zIndex: number;                        // Layer order within depth
  locked?: boolean;                      // Prevent accidental moves
  opacity?: number;                      // Transparency (0-1)
  customScale?: number;                  // Override auto-scaling
  rotation?: number;                     // Rotation in degrees
}

/**
 * Background configuration for a scene
 */
export interface SceneBackground {
  primary: string;                       // Main background image path or data URL
  layers?: string[];                     // Additional parallax layers
  parallaxRates?: number[];              // Scroll rates for layers (0-1)
  brightness?: number;                   // Background brightness (0-2, 1 is normal)
  blur?: number;                         // Background blur amount (0-10)
  tint?: string;                         // Color overlay (hex color)
  isCustomUpload?: boolean;              // True if primary is a custom uploaded image
  originalFileName?: string;             // Original file name for custom uploads
}

/**
 * Complete scene data structure
 */
export interface VistaScene {
  id: string;                           // Unique scene identifier
  name: string;                         // Scene name
  description?: string;                 // Scene description/notes
  campaignId?: string;                  // Link to campaign
  sessionId?: string;                   // Link to specific session
  background: SceneBackground;          // Background configuration
  tokens: VistaCharacterToken[];        // All tokens in scene
  dimensions: {
    width: number;                      // Scene width in pixels
    height: number;                     // Scene height in pixels
  };
  viewport?: Viewport;                  // Saved viewport position
  gridEnabled: boolean;                 // Show grid overlay
  gridSize: number;                     // Grid cell size in pixels
  depthIndicatorsVisible: boolean;      // Show depth zones
  snapToGrid: boolean;                  // Enable grid snapping
  metadata: {
    created_at: Date;
    updated_at: Date;
    tags: string[];                     // Searchable tags
    notes: string;                      // GM notes
    isTemplate?: boolean;               // Mark as reusable template
    version?: number;                   // Schema version for migrations
  };
}

/**
 * Depth zone configuration
 */
export interface DepthZoneConfig {
  zone: DepthZone;
  yRange: [number, number];              // Min and max Y position (0-1)
  scale: number;                         // Scale multiplier
  zIndexBase: number;                    // Base z-index for zone
  blur?: number;                         // Optional blur amount
  opacity?: number;                      // Optional opacity modifier
}

/**
 * Default depth zone configurations
 */
export const DEPTH_ZONES: Record<DepthZone, DepthZoneConfig> = {
  background: {
    zone: 'background',
    yRange: [0, 0.3],
    scale: 0.6,
    zIndexBase: 100,
    blur: 1.5,
    opacity: 0.9
  },
  midground: {
    zone: 'midground',
    yRange: [0.3, 0.7],
    scale: 1.0,
    zIndexBase: 200,
    blur: 0,
    opacity: 1.0
  },
  foreground: {
    zone: 'foreground',
    yRange: [0.7, 1.0],
    scale: 1.4,
    zIndexBase: 300,
    blur: 0,
    opacity: 1.0
  }
};

/**
 * Scene export format for sharing
 */
export interface ExportedVistaScene {
  version: string;                       // Export format version
  scene: VistaScene;                    // Scene data
  assets?: {                            // Optional embedded assets
    images?: Record<string, string>;    // Base64 encoded images
  };
}

/**
 * Create an empty scene with defaults
 */
export function createEmptyScene(name: string = 'New Scene'): VistaScene {
  return {
    id: `scene-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name,
    background: {
      primary: '/images/vista/backgrounds/forest.png',
      brightness: 1.0,
      blur: 0
    },
    tokens: [],
    dimensions: {
      width: 1920,
      height: 1080
    },
    viewport: {
      x: 0,
      y: 0,
      zoom: 1
    },
    gridEnabled: false,
    gridSize: 50,
    depthIndicatorsVisible: false,
    snapToGrid: false,
    metadata: {
      created_at: new Date(),
      updated_at: new Date(),
      tags: [],
      notes: '',
      isTemplate: false,
      version: 1
    }
  };
}

/**
 * Create a new character token
 */
export function createToken(
  name: string,
  portrait: string,
  position: Point,
  characterId?: string
): VistaCharacterToken {
  return {
    id: `token-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    characterId,
    name,
    portrait,
    position,
    depth: 'midground',
    scale: 1.0,
    zIndex: 200,
    opacity: 1.0,
    rotation: 0
  };
}

/**
 * Scene validation
 */
export function validateScene(scene: any): scene is VistaScene {
  return (
    scene &&
    typeof scene === 'object' &&
    typeof scene.id === 'string' &&
    typeof scene.name === 'string' &&
    scene.background &&
    typeof scene.background.primary === 'string' &&
    Array.isArray(scene.tokens) &&
    scene.dimensions &&
    typeof scene.dimensions.width === 'number' &&
    typeof scene.dimensions.height === 'number'
  );
}

/**
 * Clone a scene (for templates or duplication)
 */
export function cloneScene(scene: VistaScene, newName?: string): VistaScene {
  const cloned = JSON.parse(JSON.stringify(scene));
  cloned.id = `scene-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  cloned.name = newName || `${scene.name} (Copy)`;
  cloned.metadata.created_at = new Date();
  cloned.metadata.updated_at = new Date();
  cloned.metadata.isTemplate = false;

  // Generate new IDs for tokens
  cloned.tokens = cloned.tokens.map((token: VistaCharacterToken) => ({
    ...token,
    id: `token-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }));

  return cloned;
}