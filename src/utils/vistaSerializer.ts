/**
 * Vista Parallax Scene Editor - Serialization Utilities
 *
 * This module provides utilities for saving, loading, and exporting scenes.
 */

import { VistaScene, ExportedVistaScene, validateScene } from '@/data/vistaScenes';
import { syncService } from '@/services/sync';

const STORAGE_KEY = 'obojima-vista-scenes';
const CURRENT_VERSION = '1.0.0';

/**
 * Save a scene to storage (localStorage and/or API)
 * @param scene - The scene to save
 * @returns Promise that resolves when saved
 */
export async function saveScene(scene: VistaScene): Promise<void> {
  try {
    // Update the updated_at timestamp
    scene.metadata.updated_at = new Date();

    // Save to localStorage first as immediate backup
    const scenes = getLocalScenes();
    const index = scenes.findIndex(s => s.id === scene.id);

    if (index >= 0) {
      scenes[index] = scene;
    } else {
      scenes.push(scene);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(scenes));

    // Attempt to sync with API if available
    if (typeof syncService !== 'undefined' && 'saveVistaScene' in syncService) {
      await (syncService as any).saveVistaScene(scene);
    }
  } catch (error) {
    console.error('Error saving scene:', error);
    throw error;
  }
}

/**
 * Load a specific scene from storage
 * @param sceneId - The ID of the scene to load
 * @returns The loaded scene or null if not found
 */
export async function loadScene(sceneId: string): Promise<VistaScene | null> {
  try {
    // Try to load from API first if available
    if (typeof syncService !== 'undefined' && 'loadVistaScene' in syncService) {
      const scene = await (syncService as any).loadVistaScene(sceneId);
      if (scene && validateScene(scene)) {
        return scene;
      }
    }

    // Fall back to localStorage
    const scenes = getLocalScenes();
    const scene = scenes.find(s => s.id === sceneId);

    if (scene && validateScene(scene)) {
      return scene;
    }

    return null;
  } catch (error) {
    console.error('Error loading scene:', error);

    // Try localStorage as final fallback
    const scenes = getLocalScenes();
    const scene = scenes.find(s => s.id === sceneId);
    return scene || null;
  }
}

/**
 * Load all scenes from storage
 * @returns Array of all saved scenes
 */
export async function loadAllScenes(): Promise<VistaScene[]> {
  try {
    // Try to load from API first if available
    if (typeof syncService !== 'undefined' && 'loadVistaScenes' in syncService) {
      const scenes = await (syncService as any).loadVistaScenes();
      if (Array.isArray(scenes)) {
        return scenes.filter(validateScene);
      }
    }

    // Fall back to localStorage
    return getLocalScenes();
  } catch (error) {
    console.error('Error loading scenes:', error);
    return getLocalScenes();
  }
}

/**
 * Delete a scene from storage
 * @param sceneId - The ID of the scene to delete
 * @returns Promise that resolves when deleted
 */
export async function deleteScene(sceneId: string): Promise<void> {
  try {
    // Remove from localStorage
    const scenes = getLocalScenes();
    const filtered = scenes.filter(s => s.id !== sceneId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));

    // Attempt to delete from API if available
    if (typeof syncService !== 'undefined' && 'deleteVistaScene' in syncService) {
      await (syncService as any).deleteVistaScene(sceneId);
    }
  } catch (error) {
    console.error('Error deleting scene:', error);
    throw error;
  }
}

/**
 * Get scenes from localStorage
 * @returns Array of scenes from localStorage
 */
function getLocalScenes(): VistaScene[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const scenes = JSON.parse(stored);
      if (Array.isArray(scenes)) {
        // Convert date strings back to Date objects
        return scenes.map(scene => ({
          ...scene,
          metadata: {
            ...scene.metadata,
            created_at: new Date(scene.metadata.created_at),
            updated_at: new Date(scene.metadata.updated_at)
          }
        })).filter(validateScene);
      }
    }
  } catch (error) {
    console.error('Error parsing local scenes:', error);
  }
  return [];
}

/**
 * Export a scene as JSON string
 * @param scene - The scene to export
 * @param includeAssets - Whether to include embedded assets
 * @returns JSON string of the exported scene
 */
export function exportSceneAsJSON(scene: VistaScene, includeAssets: boolean = false): string {
  const exported: ExportedVistaScene = {
    version: CURRENT_VERSION,
    scene: JSON.parse(JSON.stringify(scene)), // Deep clone
    assets: includeAssets ? { images: {} } : undefined
  };

  // Clean up the exported scene
  delete (exported.scene as any).viewport; // Remove viewport state

  return JSON.stringify(exported, null, 2);
}

/**
 * Import a scene from JSON string
 * @param json - The JSON string to import
 * @returns The imported scene
 */
export function importSceneFromJSON(json: string): VistaScene {
  try {
    const parsed = JSON.parse(json) as ExportedVistaScene;

    if (!parsed.scene) {
      throw new Error('Invalid scene format: missing scene data');
    }

    // Convert date strings to Date objects
    const scene = {
      ...parsed.scene,
      metadata: {
        ...parsed.scene.metadata,
        created_at: new Date(parsed.scene.metadata.created_at),
        updated_at: new Date(parsed.scene.metadata.updated_at)
      }
    };

    // Generate new ID to avoid conflicts
    scene.id = `scene-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    scene.name = `${scene.name} (Imported)`;

    // Validate the scene
    if (!validateScene(scene)) {
      throw new Error('Invalid scene structure');
    }

    return scene;
  } catch (error) {
    console.error('Error importing scene:', error);
    throw new Error(`Failed to import scene: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Export a scene as an image
 * @param canvas - The canvas element to export
 * @param format - Image format (png or jpeg)
 * @param quality - JPEG quality (0-1)
 * @returns Promise that resolves with the image blob
 */
export async function exportSceneAsImage(
  canvas: HTMLCanvasElement,
  format: 'png' | 'jpeg' = 'png',
  quality: number = 0.92
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to export scene as image'));
        }
      },
      `image/${format}`,
      quality
    );
  });
}

/**
 * Download a blob as a file
 * @param blob - The blob to download
 * @param filename - The filename for the download
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Export and download a scene as JSON
 * @param scene - The scene to export
 * @param includeAssets - Whether to include embedded assets
 */
export function downloadSceneAsJSON(scene: VistaScene, includeAssets: boolean = false): void {
  const json = exportSceneAsJSON(scene, includeAssets);
  const blob = new Blob([json], { type: 'application/json' });
  const filename = `${scene.name.replace(/[^a-z0-9]/gi, '_')}_${Date.now()}.json`;
  downloadBlob(blob, filename);
}

/**
 * Export and download a scene as an image
 * @param canvas - The canvas element to export
 * @param sceneName - Name of the scene for the filename
 * @param format - Image format
 */
export async function downloadSceneAsImage(
  canvas: HTMLCanvasElement,
  sceneName: string,
  format: 'png' | 'jpeg' = 'png'
): Promise<void> {
  const blob = await exportSceneAsImage(canvas, format);
  const filename = `${sceneName.replace(/[^a-z0-9]/gi, '_')}_${Date.now()}.${format}`;
  downloadBlob(blob, filename);
}

/**
 * Generate a thumbnail for a scene
 * @param canvas - The canvas element containing the scene
 * @param maxWidth - Maximum width of the thumbnail
 * @param maxHeight - Maximum height of the thumbnail
 * @returns Base64 encoded thumbnail image
 */
export async function generateSceneThumbnail(
  canvas: HTMLCanvasElement,
  maxWidth: number = 200,
  maxHeight: number = 150
): Promise<string> {
  // Create a temporary canvas for the thumbnail
  const thumbCanvas = document.createElement('canvas');
  const ctx = thumbCanvas.getContext('2d');

  if (!ctx) {
    throw new Error('Failed to create thumbnail canvas context');
  }

  // Calculate thumbnail dimensions maintaining aspect ratio
  const aspectRatio = canvas.width / canvas.height;
  let width = maxWidth;
  let height = maxWidth / aspectRatio;

  if (height > maxHeight) {
    height = maxHeight;
    width = maxHeight * aspectRatio;
  }

  thumbCanvas.width = width;
  thumbCanvas.height = height;

  // Draw scaled version
  ctx.drawImage(canvas, 0, 0, width, height);

  // Convert to base64
  return thumbCanvas.toDataURL('image/jpeg', 0.7);
}

/**
 * Import a scene from a file input
 * @param file - The file to import
 * @returns Promise that resolves with the imported scene
 */
export async function importSceneFromFile(file: File): Promise<VistaScene> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const json = e.target?.result as string;
        const scene = importSceneFromJSON(json);
        resolve(scene);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsText(file);
  });
}

/**
 * Check if local storage is available and has space
 * @returns Object with availability and remaining space info
 */
export function checkStorageAvailability(): {
  available: boolean;
  remainingSpace?: number;
  error?: string;
} {
  try {
    const testKey = '__vista_storage_test__';
    localStorage.setItem(testKey, 'test');
    localStorage.removeItem(testKey);

    // Try to estimate remaining space (not accurate in all browsers)
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      navigator.storage.estimate().then(estimate => {
        const remaining = (estimate.quota || 0) - (estimate.usage || 0);
        return { available: true, remainingSpace: remaining };
      });
    }

    return { available: true };
  } catch (error) {
    return {
      available: false,
      error: error instanceof Error ? error.message : 'Storage not available'
    };
  }
}

/**
 * Clear all Vista scenes from local storage
 * @returns Number of scenes cleared
 */
export function clearLocalScenes(): number {
  const scenes = getLocalScenes();
  localStorage.removeItem(STORAGE_KEY);
  return scenes.length;
}

/**
 * Get total size of stored scenes in bytes
 * @returns Approximate size in bytes
 */
export function getStoredScenesSize(): number {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? new Blob([stored]).size : 0;
}