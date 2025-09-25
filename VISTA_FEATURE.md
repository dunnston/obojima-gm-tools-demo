# Vista Parallax Scene Editor

## Overview
The Vista Parallax Scene Editor is an immersive first-person scene creator for TTRPGs, inspired by Ember Vista. It allows game masters to create dynamic scenes with draggable character tokens positioned at different depths (background, midground, foreground) with automatic scaling and parallax effects.

## Feature Architecture

### Core Concepts

#### Depth Zones
The scene is divided into three depth zones based on vertical position (Y-axis):

| Zone | Y Range | Scale Factor | Z-Index | Visual Effect |
|------|---------|--------------|---------|---------------|
| **Background** | 0-30% | 0.6x | 100+ | Slight blur, smaller scale |
| **Midground** | 30-70% | 1.0x | 200+ | Normal scale, no effects |
| **Foreground** | 70-100% | 1.4x | 300+ | Larger scale, prominent |

#### Character Tokens
- Draggable portrait representations of characters, NPCs, or creatures
- Automatically scale based on depth position
- Maintain proper layering with z-index
- Can be linked to existing character data

#### Scene Canvas
- Main viewport for scene composition
- Supports background images with optional parallax layers
- Pan and zoom capabilities
- Grid overlay for precise positioning

## File Structure

```
src/
├── components/
│   ├── VistaEditor.tsx                 # Main component
│   └── vista/
│       ├── SceneCanvas.tsx             # Scene viewport & rendering
│       ├── CharacterToken.tsx          # Draggable character elements
│       ├── DepthIndicator.tsx          # Visual depth zone overlay
│       ├── SceneToolbar.tsx            # Tool controls & actions
│       ├── CharacterPalette.tsx        # Character selection panel
│       ├── BackgroundSelector.tsx      # Background image selector
│       └── VistaSceneModal.tsx         # Save/load modal dialogs
├── data/
│   ├── vistaScenes.ts                  # Scene data types & interfaces
│   └── vistaBackgrounds.ts             # Background presets & defaults
├── utils/
│   ├── vistaDepthManager.ts            # Depth calculation utilities
│   └── vistaSerializer.ts              # Scene save/load utilities
├── hooks/
│   └── useVistaDrag.ts                  # Drag and drop custom hook
└── public/images/vista/
    ├── backgrounds/                     # Scene background images
    │   ├── tavern-interior.jpg
    │   ├── forest-clearing.jpg
    │   ├── dungeon-chamber.jpg
    │   └── throne-room.jpg
    └── tokens/                          # Default token images
        └── defaults/
            ├── warrior.png
            ├── mage.png
            └── rogue.png
```

## Data Models

### VistaCharacterToken
```typescript
interface VistaCharacterToken {
  id: string;                            // Unique token identifier
  characterId?: string;                  // Link to existing character
  name: string;                          // Display name
  portrait: string;                      // Image path or URL
  position: { x: number; y: number };    // Canvas position
  depth: 'background' | 'midground' | 'foreground';
  scale: number;                         // Calculated from depth
  zIndex: number;                        // Layer order
  locked?: boolean;                      // Prevent accidental moves
  opacity?: number;                      // Transparency (0-1)
  customScale?: number;                  // Override auto-scaling
}
```

### VistaScene
```typescript
interface VistaScene {
  id: string;                           // Unique scene identifier
  name: string;                         // Scene name
  description?: string;                 // Scene description/notes
  campaignId?: string;                  // Link to campaign
  sessionId?: string;                   // Link to specific session
  background: {
    primary: string;                    // Main background image
    layers: string[];                   // Additional parallax layers
    parallaxRates: number[];            // Scroll rates for layers
    brightness?: number;                // Background brightness (0-1)
    blur?: number;                      // Background blur amount
  };
  tokens: VistaCharacterToken[];        // All tokens in scene
  dimensions: {
    width: number;
    height: number;
  };
  gridEnabled: boolean;                 // Show grid overlay
  gridSize: number;                     // Grid cell size in pixels
  depthIndicatorsVisible: boolean;      // Show depth zones
  metadata: {
    created_at: Date;
    updated_at: Date;
    tags: string[];                     // Searchable tags
    notes: string;                      // GM notes
    isTemplate?: boolean;               // Mark as reusable template
  };
}
```

## Component Details

### VistaEditor.tsx
**Main container component that orchestrates the entire feature**

Responsibilities:
- Scene state management
- Data persistence via syncService
- Keyboard shortcut handling
- Undo/redo functionality
- Export capabilities

Key State:
```typescript
const [currentScene, setCurrentScene] = useState<VistaScene | null>(null);
const [selectedTokens, setSelectedTokens] = useState<string[]>([]);
const [isDragging, setIsDragging] = useState(false);
const [draggedToken, setDraggedToken] = useState<string | null>(null);
const [history, setHistory] = useState<VistaScene[]>([]);
const [historyIndex, setHistoryIndex] = useState(-1);
```

### SceneCanvas.tsx
**The main rendering area for the scene**

Features:
- Canvas/SVG hybrid rendering
- Mouse and touch event handling
- Viewport pan and zoom
- Grid overlay rendering
- Background image management

Key Methods:
- `handleTokenDrag(tokenId, newPosition)`
- `handleViewportPan(deltaX, deltaY)`
- `handleZoom(scale, centerPoint)`
- `renderGrid()`
- `getTokensInBounds(bounds)`

### CharacterToken.tsx
**Individual draggable character element**

Features:
- Drag and drop functionality
- Auto-scaling based on depth
- Selection highlighting
- Context menu support
- Smooth transitions

Props:
```typescript
interface CharacterTokenProps {
  token: VistaCharacterToken;
  isSelected: boolean;
  isDragging: boolean;
  onDragStart: (tokenId: string) => void;
  onDragMove: (tokenId: string, position: Point) => void;
  onDragEnd: (tokenId: string) => void;
  onSelect: (tokenId: string, multi: boolean) => void;
  onContextMenu: (tokenId: string, position: Point) => void;
}
```

### DepthIndicator.tsx
**Visual overlay showing depth zones**

Features:
- Semi-transparent colored zones
- Toggle visibility
- Labels for each zone
- Interactive depth preview during drag

### SceneToolbar.tsx
**Control panel for scene manipulation**

Tools:
- Character palette toggle
- Background selector
- Grid toggle
- Depth indicators toggle
- Zoom controls (25%, 50%, 75%, 100%, 125%, 150%)
- Save/Load/Export actions
- Undo/Redo buttons
- Clear scene
- Scene settings

### CharacterPalette.tsx
**Panel for selecting and adding characters to scene**

Features:
- Display existing player characters
- Show NPCs
- Show creatures
- Search/filter functionality
- Drag to add to scene
- Quick add buttons
- Custom token upload

## Utility Functions

### vistaDepthManager.ts
```typescript
// Calculate depth zone from Y position
export function calculateDepthFromPosition(y: number, canvasHeight: number): DepthZone

// Get scale factor for depth
export function getScaleForDepth(depth: DepthZone): number

// Calculate z-index for token
export function calculateZIndex(depth: DepthZone, y: number): number

// Get CSS transform for token
export function getTokenTransform(token: VistaCharacterToken): string

// Check if position is in depth zone
export function isInDepthZone(y: number, canvasHeight: number, zone: DepthZone): boolean
```

### vistaSerializer.ts
```typescript
// Save scene to localStorage/API
export async function saveScene(scene: VistaScene): Promise<void>

// Load scene from storage
export async function loadScene(sceneId: string): Promise<VistaScene>

// Export scene as JSON
export function exportSceneAsJSON(scene: VistaScene): string

// Import scene from JSON
export function importSceneFromJSON(json: string): VistaScene

// Export scene as image
export async function exportSceneAsImage(canvas: HTMLCanvasElement): Promise<Blob>

// Generate scene thumbnail
export async function generateSceneThumbnail(scene: VistaScene): Promise<string>
```

## User Interactions

### Mouse/Keyboard Controls

| Action | Mouse | Keyboard | Touch |
|--------|-------|----------|-------|
| Select token | Click | Arrow keys to navigate | Tap |
| Multi-select | Ctrl/Cmd + Click | Shift + Arrow keys | Two-finger tap |
| Drag token | Click and drag | Arrow keys (selected) | Touch and drag |
| Pan viewport | Middle mouse drag | Space + drag | Two-finger drag |
| Zoom | Scroll wheel | Ctrl/Cmd + +/- | Pinch |
| Delete token | - | Delete/Backspace | Long press → Delete |
| Undo | - | Ctrl/Cmd + Z | - |
| Redo | - | Ctrl/Cmd + Y | - |
| Save | - | Ctrl/Cmd + S | - |
| Select all | - | Ctrl/Cmd + A | - |
| Deselect all | Click empty space | Escape | Tap empty space |
| Context menu | Right-click | Menu key | Long press |

### Drag and Drop Workflow

1. **From Palette to Scene:**
   - User drags character from palette
   - Preview shows at cursor with depth indicator
   - Drop position determines initial depth and scale
   - Token is added to scene

2. **Repositioning Tokens:**
   - Click and hold on token
   - Drag to new position
   - Depth indicator shows during drag
   - Scale updates in real-time
   - Drop to confirm position

3. **Multi-select Operations:**
   - Select multiple tokens
   - Drag any selected token moves all
   - Maintain relative positions
   - Depth changes apply to all

## Performance Optimizations

1. **Rendering:**
   - Use CSS transforms for positioning (GPU acceleration)
   - React.memo for token components
   - Virtual viewport for large scenes
   - RequestAnimationFrame for smooth animations

2. **State Management:**
   - Debounce position updates during drag
   - Batch state updates
   - Use immutable updates for history

3. **Assets:**
   - Lazy load background images
   - Thumbnail caching
   - Image compression
   - Progressive loading

## Integration Points

### With Character System
- Load portraits from existing characters
- Link tokens to character sheets
- Pull stats for tooltips
- Update positions in encounters

### With Session Planner
- Attach scenes to sessions
- Quick load from session view
- Scene timeline/sequence
- Session recap with scenes

### With Sync Service
```typescript
// Add to DataType
type DataType = ... | 'vista-scenes';

// API endpoints
GET    /api/vista-scenes         // List all scenes
GET    /api/vista-scenes/:id     // Get specific scene
POST   /api/vista-scenes         // Create scene
PUT    /api/vista-scenes/:id     // Update scene
DELETE /api/vista-scenes/:id     // Delete scene
```

## Scene Templates

### Preset Backgrounds
1. **Tavern Interior** - Warm lighting, tables, bar
2. **Forest Clearing** - Trees, natural lighting
3. **Dungeon Chamber** - Stone walls, torches
4. **Throne Room** - Grand hall, throne
5. **Marketplace** - Stalls, crowds
6. **Ship Deck** - Ocean, rigging
7. **Cave Entrance** - Rocky, mysterious
8. **Temple Interior** - Sacred, pillars
9. **Battlefield** - Open field, dramatic
10. **Village Square** - Buildings, fountain

### Template Scenes
Pre-configured scenes with tokens:
- Bar Fight (tavern + combatants)
- Ambush (forest + hidden enemies)
- Throne Audience (throne room + court)
- Market Day (marketplace + merchants)
- Dungeon Encounter (chamber + monsters)

## Testing Strategy

### Unit Tests
```typescript
// vistaDepthManager.test.ts
- Test depth calculation from Y position
- Test scale factor calculations
- Test z-index ordering
- Test transform generation

// vistaSerializer.test.ts
- Test scene save/load
- Test JSON export/import
- Test data validation
- Test backward compatibility
```

### Integration Tests
- Token drag and drop lifecycle
- Multi-token selection and movement
- Scene state persistence
- Undo/redo functionality
- Export capabilities

### E2E Tests
- Complete scene creation workflow
- Character palette to scene flow
- Save, close, and reload scene
- Export and import scene
- Mobile touch interactions

## Future Enhancements

### Phase 2
- Animation support (moving tokens along paths)
- Fog of war overlay
- Dynamic lighting effects
- Sound integration (ambient, positional)
- Weather effects overlay

### Phase 3
- Real-time collaboration (multiple GMs)
- 3D depth with perspective
- Video backgrounds support
- AR/VR export
- AI-assisted scene generation

## Accessibility

- Keyboard navigation for all features
- Screen reader descriptions
- High contrast mode support
- Reduced motion options
- Tooltips for all controls
- Focus indicators
- ARIA labels and roles

## Mobile Considerations

- Responsive toolbar layout
- Touch-optimized controls
- Gesture support
- Portrait/landscape modes
- Performance on lower-end devices
- Offline capability

## API Reference

### Props for VistaEditor
```typescript
interface VistaEditorProps {
  initialSceneId?: string;          // Load specific scene on mount
  characters?: PlayerCharacter[];    // Available characters
  npcs?: NPC[];                     // Available NPCs
  onSceneChange?: (scene: VistaScene) => void;
  readOnly?: boolean;               // View-only mode
  maxTokens?: number;               // Limit tokens per scene
}
```

### Events
```typescript
// Scene events
onSceneLoad: (scene: VistaScene) => void
onSceneSave: (scene: VistaScene) => void
onSceneDelete: (sceneId: string) => void
onSceneExport: (scene: VistaScene, format: 'json' | 'image') => void

// Token events
onTokenAdd: (token: VistaCharacterToken) => void
onTokenMove: (tokenId: string, position: Point) => void
onTokenDelete: (tokenId: string) => void
onTokenSelect: (tokenIds: string[]) => void

// Viewport events
onViewportChange: (viewport: Viewport) => void
onZoomChange: (zoom: number) => void
```

## Troubleshooting

### Common Issues
1. **Tokens not dragging:** Check z-index and pointer-events
2. **Performance issues:** Reduce token count, optimize images
3. **Save failures:** Check localStorage quota, API connection
4. **Image loading errors:** Verify paths, check CORS

### Debug Mode
Enable with `?debug=true` in URL:
- Shows performance metrics
- Logs all events
- Displays depth zones always
- Shows token coordinates

## Version History

### v1.0.0 (Initial Release)
- Core scene editor
- Depth-based scaling
- Basic save/load
- Character palette
- Grid support

### v1.1.0 (Planned)
- Multi-selection
- Undo/redo
- Export as image
- Scene templates
- Keyboard shortcuts

### v1.2.0 (Future)
- Parallax backgrounds
- Animation support
- Fog of war
- Collaborative editing