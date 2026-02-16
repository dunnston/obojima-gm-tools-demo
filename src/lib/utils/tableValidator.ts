import type { StorageTable } from '@/lib/storage/types';

/**
 * Whitelist of valid table names matching StorageTable type.
 * This provides runtime validation to prevent SQL injection.
 */
const VALID_TABLES: Set<string> = new Set([
  'characters',
  'sessions',
  'quests',
  'downtime_activities',
  'companions',
  'npcs',
  'encounters',
  'user_potions',
  'user_ingredients',
  'user_creatures',
  'user_magic_items',
  'user_companion_types',
  'calendar_events',
  'locations',
  'settings'
]);

/**
 * Type guard to check if a string is a valid table name.
 * @param table - The table name to validate
 * @returns True if the table name is in the whitelist
 */
export function isValidTableName(table: string): table is StorageTable {
  return VALID_TABLES.has(table);
}

/**
 * Validates a table name and returns it typed as StorageTable.
 * Throws an error if the table name is not valid.
 * @param table - The table name to validate
 * @returns The validated table name
 * @throws Error if the table name is not valid
 */
export function validateTableName(table: string): StorageTable {
  if (!isValidTableName(table)) {
    throw new Error(`Invalid table name: ${table}`);
  }
  return table;
}

/**
 * Get all valid table names.
 * Useful for iteration in backup/restore operations.
 */
export function getValidTableNames(): StorageTable[] {
  return Array.from(VALID_TABLES) as StorageTable[];
}
