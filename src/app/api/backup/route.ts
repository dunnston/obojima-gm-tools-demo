import { NextResponse } from 'next/server';
import db from '@/lib/db';

const TABLES = [
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
];

export async function GET() {
  try {
    const backup: Record<string, any[]> = {};

    // Export all tables
    for (const table of TABLES) {
      try {
        const stmt = db.prepare(`SELECT * FROM ${table}`);
        const rows = stmt.all() as any[];
        backup[table] = rows.map((row: any) => ({
          id: row.id,
          data: row.data,
          updated_at: row.updated_at
        }));
      } catch (error) {
        console.error(`Error exporting ${table}:`, error);
        backup[table] = [];
      }
    }

    // Export settings separately (different structure)
    try {
      const settingsStmt = db.prepare('SELECT * FROM settings');
      const settingsRows = settingsStmt.all() as any[];
      backup['settings'] = settingsRows.map((row: any) => ({
        key: row.key,
        value: row.value,
        updated_at: row.updated_at
      }));
    } catch (error) {
      console.error('Error exporting settings:', error);
      backup['settings'] = [];
    }

    // Add metadata
    const exportData = {
      version: 1,
      exportedAt: new Date().toISOString(),
      appName: 'Obojima GM Tools',
      data: backup
    };

    return NextResponse.json(exportData);
  } catch (error) {
    console.error('Backup error:', error);
    return NextResponse.json({ error: 'Failed to create backup' }, { status: 500 });
  }
}
