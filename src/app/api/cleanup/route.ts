import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { isValidTableName } from '@/lib/utils/tableValidator';
import { logger } from '@/lib/utils/logger';

// Whitelist of tables that can be cleaned up
// Does not include 'settings' or 'calendar_events' for safety
const ALLOWED_CLEANUP_TABLES = new Set([
  'quests',
  'characters',
  'sessions',
  'encounters',
  'downtime_activities',
  'companions',
  'npcs',
  'user_potions',
  'user_ingredients',
  'user_creatures',
  'user_magic_items',
  'user_companion_types'
]);

export async function POST(request: NextRequest) {
  try {
    const { table } = await request.json();

    if (!table) {
      return NextResponse.json({ error: 'Table name required' }, { status: 400 });
    }

    // Validate against both the cleanup whitelist AND the general table validator
    if (!ALLOWED_CLEANUP_TABLES.has(table)) {
      return NextResponse.json({ error: 'Table cleanup not allowed' }, { status: 400 });
    }

    if (!isValidTableName(table)) {
      return NextResponse.json({ error: 'Invalid table name' }, { status: 400 });
    }

    // Clear the specified table (now safe to use in query)
    const stmt = db.prepare(`DELETE FROM ${table}`);
    const result = stmt.run();

    logger.info(`Cleaned up ${result.changes} records from ${table}`);

    return NextResponse.json({
      success: true,
      message: `Cleared ${result.changes} records from ${table}`
    });
  } catch (error) {
    logger.error('Cleanup error:', error);
    return NextResponse.json({ error: 'Cleanup failed' }, { status: 500 });
  }
}
