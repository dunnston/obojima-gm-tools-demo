import { NextRequest, NextResponse } from 'next/server';
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

export async function POST(request: NextRequest) {
  try {
    const backupData = await request.json();

    // Validate backup format
    if (!backupData.version || !backupData.data) {
      return NextResponse.json({ error: 'Invalid backup format' }, { status: 400 });
    }

    const results: Record<string, number> = {};
    let totalRestored = 0;

    // Restore each table
    for (const table of TABLES) {
      const tableData = backupData.data[table];
      if (!tableData || !Array.isArray(tableData)) {
        results[table] = 0;
        continue;
      }

      try {
        // Clear existing data
        const deleteStmt = db.prepare(`DELETE FROM ${table}`);
        deleteStmt.run();

        // Insert backup data
        const insertStmt = db.prepare(`
          INSERT INTO ${table} (id, data, updated_at)
          VALUES (?, ?, ?)
        `);

        let count = 0;
        for (const row of tableData) {
          insertStmt.run(
            row.id,
            row.data,
            row.updated_at || new Date().toISOString()
          );
          count++;
        }

        results[table] = count;
        totalRestored += count;
      } catch (error) {
        console.error(`Error restoring ${table}:`, error);
        results[table] = 0;
      }
    }

    // Restore settings (different structure)
    const settingsData = backupData.data['settings'];
    if (settingsData && Array.isArray(settingsData)) {
      try {
        // Clear existing settings
        const deleteSettingsStmt = db.prepare('DELETE FROM settings');
        deleteSettingsStmt.run();

        // Insert backup settings
        const insertSettingsStmt = db.prepare(`
          INSERT INTO settings (key, value, updated_at)
          VALUES (?, ?, ?)
        `);

        let settingsCount = 0;
        for (const row of settingsData) {
          insertSettingsStmt.run(
            row.key,
            row.value,
            row.updated_at || new Date().toISOString()
          );
          settingsCount++;
        }

        results['settings'] = settingsCount;
        totalRestored += settingsCount;
      } catch (error) {
        console.error('Error restoring settings:', error);
        results['settings'] = 0;
      }
    }

    return NextResponse.json({
      success: true,
      totalRestored,
      details: results,
      message: `Successfully restored ${totalRestored} records`
    });
  } catch (error) {
    console.error('Restore error:', error);
    return NextResponse.json({ error: 'Failed to restore backup' }, { status: 500 });
  }
}
