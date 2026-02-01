/**
 * Result type for safe JSON parsing operations.
 */
export interface ParseResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Safely parse a JSON string without throwing errors.
 * @param jsonString - The JSON string to parse
 * @param fallback - Optional fallback value if parsing fails
 * @returns ParseResult with success status and either data or error
 */
export function safeJsonParse<T = unknown>(
  jsonString: string,
  fallback?: T
): ParseResult<T> {
  try {
    const data = JSON.parse(jsonString) as T;
    return { success: true, data };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown parse error';
    return {
      success: false,
      error: errorMessage,
      data: fallback
    };
  }
}

/**
 * Parse JSON and return the result or a default value.
 * Never throws - always returns a valid value.
 * @param jsonString - The JSON string to parse (can be null/undefined)
 * @param defaultValue - The default value to return if parsing fails
 * @returns The parsed data or the default value
 */
export function safeJsonParseOrDefault<T>(
  jsonString: string | null | undefined,
  defaultValue: T
): T {
  if (!jsonString) return defaultValue;

  const result = safeJsonParse<T>(jsonString);
  return result.success && result.data !== undefined ? result.data : defaultValue;
}

/**
 * Safely stringify a value to JSON.
 * Never throws - returns null if stringification fails.
 * @param value - The value to stringify
 * @returns The JSON string or null if failed
 */
export function safeJsonStringify(value: unknown): string | null {
  try {
    return JSON.stringify(value);
  } catch (error) {
    console.error('JSON stringify error:', error);
    return null;
  }
}
