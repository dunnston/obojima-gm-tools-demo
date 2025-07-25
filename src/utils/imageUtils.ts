// Utility functions for handling images
import { getPotionImageUrl, getIngredientImageUrl, getCreatureImageUrl } from './imageMapping';

/**
 * Get the image path for a potion
 * Returns specific image if available, otherwise default placeholder
 */
export function getPotionImagePath(potionName: string, potionNumber?: number): string {
  return getPotionImageUrl(potionName);
}

/**
 * Get the image path for an ingredient
 * Returns specific image if available, otherwise default placeholder
 */
export function getIngredientImagePath(ingredientName: string): string {
  return getIngredientImageUrl(ingredientName);
}

/**
 * Get the image path for a creature
 * Returns specific image if available, otherwise default placeholder
 */
export function getCreatureImagePath(creatureName: string): string {
  return getCreatureImageUrl(creatureName);
}

/**
 * Convert external Google Drive URL to local path (for migration)
 * This helps identify which images need to be downloaded
 */
export function extractGoogleDriveId(url: string): string | null {
  const match = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  return match ? match[1] : null;
}

/**
 * Generate filename from potion/ingredient name
 */
export function generateImageFilename(name: string, extension: string = 'jpg'): string {
  return `${name.toLowerCase().replace(/[^a-z0-9]/g, '-')}.${extension}`;
}

/**
 * Legacy function for backward compatibility
 * Returns local ingredient path instead of Google Drive URL
 */
export function getGoogleDriveImageUrl(originalUrl?: string): string {
  // Instead of returning the Google Drive URL, return our local default image
  return '/images/ingredients/default-ingredient.svg';
}