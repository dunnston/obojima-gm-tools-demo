/**
 * Maximum file size in bytes (5MB).
 * Used for validating uploads in both web and Tauri modes.
 */
export const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;

/**
 * Maximum file size for images specifically (10MB).
 * Slightly higher limit for images since they can be larger.
 */
export const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024;

/**
 * Maximum file size for audio files (50MB).
 * Audio files tend to be larger.
 */
export const MAX_AUDIO_SIZE_BYTES = 50 * 1024 * 1024;

/**
 * Type guard to check if a value is a non-empty string.
 * @param value - The value to check
 * @returns True if the value is a string with non-whitespace content
 */
export function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

/**
 * Validate that a string is a valid ID format.
 * IDs should be alphanumeric with hyphens and underscores, max 100 chars.
 * @param id - The ID to validate
 * @returns True if the ID is valid
 */
export function isValidId(id: unknown): id is string {
  if (typeof id !== 'string') return false;
  if (id.length === 0 || id.length > 100) return false;
  return /^[\w-]+$/.test(id);
}

/**
 * Validate file size against a maximum.
 * @param sizeBytes - The file size in bytes
 * @param maxBytes - The maximum allowed size (defaults to MAX_FILE_SIZE_BYTES)
 * @returns True if the file size is valid
 */
export function validateFileSize(
  sizeBytes: number,
  maxBytes: number = MAX_FILE_SIZE_BYTES
): boolean {
  return sizeBytes > 0 && sizeBytes <= maxBytes;
}

/**
 * Get the appropriate max file size based on file type.
 * @param mimeType - The MIME type of the file
 * @param fallbackType - Optional fallback when MIME type is empty or generic ('audio' | 'image')
 * @returns The maximum allowed size in bytes
 */
export function getMaxFileSizeForType(mimeType: string, fallbackType?: 'audio' | 'image'): number {
  if (mimeType.startsWith('audio/')) {
    return MAX_AUDIO_SIZE_BYTES;
  }
  if (mimeType.startsWith('image/')) {
    return MAX_IMAGE_SIZE_BYTES;
  }
  // Use fallback type when MIME is empty or generic (e.g., application/octet-stream)
  if (fallbackType === 'audio') {
    return MAX_AUDIO_SIZE_BYTES;
  }
  if (fallbackType === 'image') {
    return MAX_IMAGE_SIZE_BYTES;
  }
  return MAX_FILE_SIZE_BYTES;
}

/**
 * Format bytes into a human-readable string.
 * @param bytes - The number of bytes
 * @returns Formatted string like "5.2 MB"
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Validate that an object has required string fields.
 * @param obj - The object to validate
 * @param fields - Array of required field names
 * @returns True if all required fields are non-empty strings
 */
export function hasRequiredStringFields(
  obj: unknown,
  fields: string[]
): boolean {
  if (typeof obj !== 'object' || obj === null) return false;

  const record = obj as Record<string, unknown>;
  return fields.every(field => isNonEmptyString(record[field]));
}
