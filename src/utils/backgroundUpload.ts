/**
 * Background Upload Utilities for Vista Scene Editor
 *
 * Handles uploading, processing, and managing custom background images
 */

export interface UploadResult {
  success: boolean;
  dataUrl?: string;
  error?: string;
  fileName?: string;
  fileSize?: number;
}

/**
 * Allowed image file types for backgrounds
 */
const ALLOWED_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif'
];

/**
 * Maximum file size in bytes (10MB)
 */
const MAX_FILE_SIZE = 10 * 1024 * 1024;

/**
 * Maximum image dimensions for performance
 */
const MAX_DIMENSIONS = {
  width: 4000,
  height: 4000
};

/**
 * Upload and process a background image file
 * @param file - The image file to upload
 * @param maxWidth - Optional maximum width for resizing
 * @param maxHeight - Optional maximum height for resizing
 * @returns Promise that resolves with upload result
 */
export async function uploadBackgroundImage(
  file: File,
  maxWidth?: number,
  maxHeight?: number
): Promise<UploadResult> {
  try {
    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return {
        success: false,
        error: `Invalid file type. Allowed types: ${ALLOWED_TYPES.join(', ')}`
      };
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return {
        success: false,
        error: `File size too large. Maximum size is ${(MAX_FILE_SIZE / 1024 / 1024).toFixed(1)}MB`
      };
    }

    // Create image element to validate and potentially resize
    const img = await createImageFromFile(file);

    // Check dimensions
    if (img.width > MAX_DIMENSIONS.width || img.height > MAX_DIMENSIONS.height) {
      return {
        success: false,
        error: `Image dimensions too large. Maximum: ${MAX_DIMENSIONS.width}x${MAX_DIMENSIONS.height}px`
      };
    }

    let dataUrl: string;
    let finalSize: number = file.size;

    // Resize if needed
    if (maxWidth || maxHeight) {
      const resizedDataUrl = await resizeImage(img, maxWidth, maxHeight);
      dataUrl = resizedDataUrl;

      // Estimate new file size
      const base64Length = resizedDataUrl.split(',')[1]?.length || 0;
      finalSize = Math.round((base64Length * 3) / 4);
    } else {
      // Convert to data URL without resizing
      dataUrl = await fileToDataUrl(file);
    }

    return {
      success: true,
      dataUrl,
      fileName: file.name,
      fileSize: finalSize
    };

  } catch (error) {
    console.error('Error uploading background image:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * Create an Image element from a File
 * @param file - The file to convert
 * @returns Promise that resolves with the Image element
 */
function createImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };

    img.src = url;
  });
}

/**
 * Convert a File to a data URL
 * @param file - The file to convert
 * @returns Promise that resolves with the data URL
 */
function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const result = e.target?.result as string;
      resolve(result);
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Resize an image to fit within specified dimensions
 * @param img - The image element to resize
 * @param maxWidth - Maximum width (optional)
 * @param maxHeight - Maximum height (optional)
 * @param quality - JPEG quality (0-1)
 * @returns Promise that resolves with the resized image data URL
 */
function resizeImage(
  img: HTMLImageElement,
  maxWidth?: number,
  maxHeight?: number,
  quality: number = 0.92
): Promise<string> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      resolve('');
      return;
    }

    // Calculate new dimensions
    let { width, height } = calculateResizeDimensions(
      img.width,
      img.height,
      maxWidth,
      maxHeight
    );

    canvas.width = width;
    canvas.height = height;

    // Draw resized image
    ctx.drawImage(img, 0, 0, width, height);

    // Convert to data URL
    const dataUrl = canvas.toDataURL('image/jpeg', quality);
    resolve(dataUrl);
  });
}

/**
 * Calculate resize dimensions while maintaining aspect ratio
 * @param originalWidth - Original image width
 * @param originalHeight - Original image height
 * @param maxWidth - Maximum allowed width
 * @param maxHeight - Maximum allowed height
 * @returns New dimensions
 */
function calculateResizeDimensions(
  originalWidth: number,
  originalHeight: number,
  maxWidth?: number,
  maxHeight?: number
): { width: number; height: number } {
  let width = originalWidth;
  let height = originalHeight;

  // If no constraints, return original
  if (!maxWidth && !maxHeight) {
    return { width, height };
  }

  const aspectRatio = originalWidth / originalHeight;

  if (maxWidth && maxHeight) {
    // Fit within both constraints
    if (width / height > maxWidth / maxHeight) {
      width = maxWidth;
      height = maxWidth / aspectRatio;
    } else {
      height = maxHeight;
      width = maxHeight * aspectRatio;
    }
  } else if (maxWidth) {
    // Constrain by width only
    if (width > maxWidth) {
      width = maxWidth;
      height = maxWidth / aspectRatio;
    }
  } else if (maxHeight) {
    // Constrain by height only
    if (height > maxHeight) {
      height = maxHeight;
      width = maxHeight * aspectRatio;
    }
  }

  return { width: Math.round(width), height: Math.round(height) };
}

/**
 * Validate if a string is a valid image data URL
 * @param dataUrl - The data URL to validate
 * @returns True if valid image data URL
 */
export function isValidImageDataUrl(dataUrl: string): boolean {
  return /^data:image\/(jpeg|jpg|png|webp|gif);base64,/.test(dataUrl);
}

/**
 * Extract file extension from a data URL
 * @param dataUrl - The data URL
 * @returns File extension or 'jpg' as default
 */
export function getExtensionFromDataUrl(dataUrl: string): string {
  const match = dataUrl.match(/^data:image\/(\w+);base64,/);
  return match?.[1] || 'jpg';
}

/**
 * Estimate file size from data URL
 * @param dataUrl - The data URL
 * @returns Estimated file size in bytes
 */
export function estimateDataUrlSize(dataUrl: string): number {
  const base64Length = dataUrl.split(',')[1]?.length || 0;
  return Math.round((base64Length * 3) / 4);
}

/**
 * Create a preview thumbnail from an image data URL
 * @param dataUrl - The source data URL
 * @param maxWidth - Thumbnail width
 * @param maxHeight - Thumbnail height
 * @returns Promise that resolves with thumbnail data URL
 */
export async function createThumbnail(
  dataUrl: string,
  maxWidth: number = 150,
  maxHeight: number = 100
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Failed to create canvas context'));
        return;
      }

      const { width, height } = calculateResizeDimensions(
        img.width,
        img.height,
        maxWidth,
        maxHeight
      );

      canvas.width = width;
      canvas.height = height;

      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', 0.7));
    };

    img.onerror = () => {
      reject(new Error('Failed to load image for thumbnail'));
    };

    img.src = dataUrl;
  });
}