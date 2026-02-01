import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { isValidTableName } from '@/lib/utils/tableValidator';
import { safeJsonStringify } from '@/lib/utils/safeJson';
import { logger } from '@/lib/utils/logger';

// Mapping from migration types to table names
const TYPE_TO_TABLE: Record<string, string> = {
  'characters': 'characters',
  'sessions': 'sessions',
  'quests': 'quests',
  'encounters': 'encounters',
  'downtime': 'downtime_activities',
  'companions': 'companions',
  'npcs': 'npcs',
  'user-potions': 'user_potions',
  'user-ingredients': 'user_ingredients',
  'user-creatures': 'user_creatures',
  'user-magic-items': 'user_magic_items',
  'user-companion-types': 'user_companion_types',
};

export async function POST(request: NextRequest) {
  try {
    const { data, type } = await request.json();

    if (!data || !type) {
      return NextResponse.json({ error: 'Missing data or type' }, { status: 400 });
    }

    let migrated = 0;

    // Handle settings migration separately (different structure)
    if (type === 'settings') {
      if (typeof data !== 'object' || data === null) {
        return NextResponse.json({ error: 'Invalid settings data' }, { status: 400 });
      }

      const stmt = db.prepare(`
        INSERT OR REPLACE INTO settings (key, value, updated_at)
        VALUES (?, ?, CURRENT_TIMESTAMP)
      `);

      for (const [key, value] of Object.entries(data)) {
        // Always JSON-encode values so safeJsonParseOrDefault can read them correctly
        const valueStr = safeJsonStringify(value);
        if (valueStr === null) {
          logger.warn(`Skipping settings key ${key}: failed to serialize`);
          continue;
        }
        stmt.run(key, valueStr);
        migrated++;
      }

      return NextResponse.json({ success: true, migrated });
    }

    // Get the table name for this type
    const tableName = TYPE_TO_TABLE[type];

    if (!tableName) {
      return NextResponse.json({ error: 'Unknown data type' }, { status: 400 });
    }

    // Validate the table name (defense in depth)
    if (!isValidTableName(tableName)) {
      logger.error(`Invalid table name derived from type: ${type} -> ${tableName}`);
      return NextResponse.json({ error: 'Invalid table configuration' }, { status: 500 });
    }

    // Validate data is an array
    if (!Array.isArray(data)) {
      return NextResponse.json({ error: 'Data must be an array' }, { status: 400 });
    }

    // Migrate the data
    const stmt = db.prepare(`
      INSERT OR REPLACE INTO ${tableName} (id, data, updated_at)
      VALUES (?, ?, CURRENT_TIMESTAMP)
    `);

    for (const item of data) {
      if (!item.id) {
        logger.warn(`Skipping item without id in ${type} migration`);
        continue;
      }

      const jsonData = safeJsonStringify(item);
      if (jsonData === null) {
        logger.warn(`Skipping item ${item.id}: failed to serialize`);
        continue;
      }

      stmt.run(item.id, jsonData);
      migrated++;
    }

    return NextResponse.json({ success: true, migrated });
  } catch (error) {
    logger.error('Migration error:', error);
    return NextResponse.json({ error: 'Migration failed' }, { status: 500 });
  }
}
