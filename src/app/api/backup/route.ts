import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { getValidTableNames, isValidTableName } from '@/lib/utils/tableValidator';
import { logger } from '@/lib/utils/logger';

// Required for static export (Tauri build)
export const dynamic = 'force-static';

// Use validated table names from the central validator
const TABLES = getValidTableNames().filter(t => t !== 'settings');

export async function GET() {
  try {
    const backup: Record<string, any[]> = {};

    // Export all tables
    for (const table of TABLES) {
      // Double-check table name is valid (defense in depth)
      if (!isValidTableName(table)) {
        logger.warn(`Skipping invalid table name: ${table}`);
        continue;
      }

      try {
        const stmt = db.prepare(`SELECT * FROM ${table}`);
        const rows = stmt.all() as any[];
        backup[table] = rows.map((row: any) => ({
          id: row.id,
          data: row.data,
          updated_at: row.updated_at
        }));
      } catch (error) {
        logger.error(`Error exporting ${table}:`, error);
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
      logger.error('Error exporting settings:', error);
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
    logger.error('Backup error:', error);
    return NextResponse.json({ error: 'Failed to create backup' }, { status: 500 });
  }
}
