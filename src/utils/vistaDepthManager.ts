/**
 * Vista Parallax Scene Editor - Depth Management Utilities
 *
 * This module provides utilities for calculating depth zones, scaling,
 * and z-index management based on token positions.
 */

import { DepthZone, DepthZoneConfig, DEPTH_ZONES, VistaCharacterToken, Point } from '@/data/vistaScenes';

/**
 * Calculate the depth zone from a Y position
 * @param y - Y position in pixels
 * @param canvasHeight - Total height of the canvas
 * @returns The depth zone the position falls into
 */
export function calculateDepthFromPosition(y: number, canvasHeight: number): DepthZone {
  const normalized = Math.max(0, Math.min(1, y / canvasHeight));

  if (normalized <= DEPTH_ZONES.background.yRange[1]) {
    return 'background';
  } else if (normalized <= DEPTH_ZONES.midground.yRange[1]) {
    return 'midground';
  } else {
    return 'foreground';
  }
}

/**
 * Get the scale factor for a specific depth zone
 * @param depth - The depth zone
 * @returns The scale multiplier for that zone
 */
export function getScaleForDepth(depth: DepthZone): number {
  return DEPTH_ZONES[depth].scale;
}

/**
 * Calculate the scale based on exact Y position with smooth interpolation
 * @param y - Y position in pixels
 * @param canvasHeight - Total height of the canvas
 * @returns Interpolated scale value
 */
export function calculateScaleFromPosition(y: number, canvasHeight: number): number {
  const normalized = Math.max(0, Math.min(1, y / canvasHeight));

  // Determine which zones we're between
  if (normalized <= DEPTH_ZONES.background.yRange[1]) {
    // Within background zone
    const zoneProgress = normalized / DEPTH_ZONES.background.yRange[1];
    const minScale = DEPTH_ZONES.background.scale * 0.8; // Even smaller at very back
    return minScale + (DEPTH_ZONES.background.scale - minScale) * zoneProgress;
  } else if (normalized <= DEPTH_ZONES.midground.yRange[1]) {
    // Between background and midground
    const zoneStart = DEPTH_ZONES.background.yRange[1];
    const zoneEnd = DEPTH_ZONES.midground.yRange[1];
    const zoneProgress = (normalized - zoneStart) / (zoneEnd - zoneStart);
    return DEPTH_ZONES.background.scale +
           (DEPTH_ZONES.midground.scale - DEPTH_ZONES.background.scale) * zoneProgress;
  } else {
    // Between midground and foreground
    const zoneStart = DEPTH_ZONES.midground.yRange[1];
    const zoneProgress = (normalized - zoneStart) / (1 - zoneStart);
    return DEPTH_ZONES.midground.scale +
           (DEPTH_ZONES.foreground.scale - DEPTH_ZONES.midground.scale) * zoneProgress;
  }
}

/**
 * Calculate z-index for a token based on depth and Y position
 * @param depth - The depth zone
 * @param y - Y position for fine-grained ordering within zone
 * @param canvasHeight - Total height of the canvas
 * @returns The calculated z-index
 */
export function calculateZIndex(depth: DepthZone, y: number, canvasHeight: number): number {
  const baseZ = DEPTH_ZONES[depth].zIndexBase;
  const normalized = Math.max(0, Math.min(1, y / canvasHeight));
  // Add fine-grained ordering within the zone (0-99)
  const fineZ = Math.floor(normalized * 99);
  return baseZ + fineZ;
}

/**
 * Get the CSS transform string for a token
 * @param token - The character token
 * @param smoothTransition - Whether to apply smooth transition
 * @returns CSS transform string
 */
export function getTokenTransform(token: VistaCharacterToken, smoothTransition: boolean = true): string {
  const scale = token.customScale || token.scale;
  const rotation = token.rotation || 0;

  // Center the token by offsetting by half the token size
  // Token size is 200px wide x 360px tall (200 * 1.8)
  const offsetX = token.position.x - 100; // Half width (200/2)
  const offsetY = token.position.y - 180; // Half height (360/2)

  const transforms = [
    `translate(${offsetX}px, ${offsetY}px)`,
    `scale(${scale})`,
    rotation !== 0 ? `rotate(${rotation}deg)` : ''
  ].filter(Boolean);

  return transforms.join(' ');
}

/**
 * Get CSS styles for a token including position, scale, and effects
 * @param token - The character token
 * @param isDragging - Whether the token is being dragged
 * @returns CSS style object
 */
export function getTokenStyles(
  token: VistaCharacterToken,
  isDragging: boolean = false
): React.CSSProperties {
  const depthConfig = DEPTH_ZONES[token.depth];
  const scale = token.customScale || token.scale;

  return {
    position: 'absolute',
    left: 0,
    top: 0,
    transform: getTokenTransform(token, !isDragging),
    zIndex: token.zIndex,
    opacity: token.opacity || depthConfig.opacity || 1,
    filter: depthConfig.blur && depthConfig.blur > 0
      ? `blur(${depthConfig.blur}px)`
      : undefined,
    transition: isDragging ? 'none' : 'transform 0.3s ease, opacity 0.3s ease',
    cursor: token.locked ? 'not-allowed' : 'grab',
    transformOrigin: 'center center',
    willChange: isDragging ? 'transform' : 'auto',
    pointerEvents: token.locked ? 'none' : 'auto'
  };
}

/**
 * Check if a position is within a specific depth zone
 * @param y - Y position in pixels
 * @param canvasHeight - Total height of the canvas
 * @param zone - The depth zone to check
 * @returns True if the position is in the specified zone
 */
export function isInDepthZone(y: number, canvasHeight: number, zone: DepthZone): boolean {
  const normalized = Math.max(0, Math.min(1, y / canvasHeight));
  const [min, max] = DEPTH_ZONES[zone].yRange;
  return normalized >= min && normalized <= max;
}

/**
 * Get the depth zone configuration
 * @param zone - The depth zone
 * @returns The configuration for the zone
 */
export function getDepthZoneConfig(zone: DepthZone): DepthZoneConfig {
  return DEPTH_ZONES[zone];
}

/**
 * Calculate the visual boundaries for depth zones
 * @param canvasHeight - Total height of the canvas
 * @returns Object with pixel boundaries for each zone
 */
export function getDepthZoneBoundaries(canvasHeight: number): Record<DepthZone, { top: number; bottom: number }> {
  return {
    background: {
      top: 0,
      bottom: Math.floor(canvasHeight * DEPTH_ZONES.background.yRange[1])
    },
    midground: {
      top: Math.floor(canvasHeight * DEPTH_ZONES.midground.yRange[0]),
      bottom: Math.floor(canvasHeight * DEPTH_ZONES.midground.yRange[1])
    },
    foreground: {
      top: Math.floor(canvasHeight * DEPTH_ZONES.foreground.yRange[0]),
      bottom: canvasHeight
    }
  };
}

/**
 * Update token properties based on new position
 * @param token - The character token to update
 * @param newPosition - New position
 * @param canvasHeight - Total height of the canvas
 * @param useInterpolation - Whether to use smooth scale interpolation
 * @returns Updated token with new depth, scale, and z-index
 */
export function updateTokenDepth(
  token: VistaCharacterToken,
  newPosition: Point,
  canvasHeight: number,
  useInterpolation: boolean = true
): VistaCharacterToken {
  const newDepth = calculateDepthFromPosition(newPosition.y, canvasHeight);
  const newScale = useInterpolation
    ? calculateScaleFromPosition(newPosition.y, canvasHeight)
    : getScaleForDepth(newDepth);
  const newZIndex = calculateZIndex(newDepth, newPosition.y, canvasHeight);

  return {
    ...token,
    position: newPosition,
    depth: newDepth,
    scale: token.customScale || newScale,
    zIndex: newZIndex
  };
}

/**
 * Sort tokens by their visual depth (back to front)
 * @param tokens - Array of tokens to sort
 * @returns Sorted array with background tokens first, foreground last
 */
export function sortTokensByDepth(tokens: VistaCharacterToken[]): VistaCharacterToken[] {
  return [...tokens].sort((a, b) => {
    // First sort by z-index
    if (a.zIndex !== b.zIndex) {
      return a.zIndex - b.zIndex;
    }
    // Then by Y position if z-index is the same
    return a.position.y - b.position.y;
  });
}

/**
 * Get depth indicator color for UI feedback
 * @param zone - The depth zone
 * @returns Hex color for the zone
 */
export function getDepthZoneColor(zone: DepthZone): string {
  const colors = {
    background: '#6b7280', // Gray for distant
    midground: '#3b82f6',  // Blue for middle
    foreground: '#10b981'  // Green for close
  };
  return colors[zone];
}

/**
 * Get depth indicator label
 * @param zone - The depth zone
 * @returns Human-readable label for the zone
 */
export function getDepthZoneLabel(zone: DepthZone): string {
  const labels = {
    background: 'Background (Far)',
    midground: 'Midground (Middle)',
    foreground: 'Foreground (Near)'
  };
  return labels[zone];
}

/**
 * Calculate if two tokens overlap visually
 * @param tokenA - First token
 * @param tokenB - Second token
 * @param tokenSize - Size of token image in pixels
 * @returns True if tokens overlap
 */
export function doTokensOverlap(
  tokenA: VistaCharacterToken,
  tokenB: VistaCharacterToken,
  tokenSize: number = 100
): boolean {
  const sizeA = tokenSize * tokenA.scale;
  const sizeB = tokenSize * tokenB.scale;

  const leftA = tokenA.position.x - sizeA / 2;
  const rightA = tokenA.position.x + sizeA / 2;
  const topA = tokenA.position.y - sizeA / 2;
  const bottomA = tokenA.position.y + sizeA / 2;

  const leftB = tokenB.position.x - sizeB / 2;
  const rightB = tokenB.position.x + sizeB / 2;
  const topB = tokenB.position.y - sizeB / 2;
  const bottomB = tokenB.position.y + sizeB / 2;

  return !(leftA > rightB || rightA < leftB || topA > bottomB || bottomA < topB);
}

/**
 * Snap position to grid if enabled
 * @param position - Current position
 * @param gridSize - Size of grid cells
 * @param snapEnabled - Whether snapping is enabled
 * @returns Snapped position or original if snapping disabled
 */
export function snapToGrid(
  position: Point,
  gridSize: number,
  snapEnabled: boolean
): Point {
  if (!snapEnabled || gridSize <= 0) {
    return position;
  }

  return {
    x: Math.round(position.x / gridSize) * gridSize,
    y: Math.round(position.y / gridSize) * gridSize
  };
}

/**
 * Get suggested token size based on depth
 * @param depth - The depth zone
 * @param baseSize - Base size of token in pixels
 * @returns Suggested size for the depth
 */
export function getTokenSizeForDepth(depth: DepthZone, baseSize: number = 100): number {
  return baseSize * DEPTH_ZONES[depth].scale;
}