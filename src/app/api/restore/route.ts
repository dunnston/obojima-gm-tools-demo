import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { getValidTableNames, isValidTableName } from '@/lib/utils/tableValidator';
import { logger } from '@/lib/utils/logger';

// Required for static export (Tauri build)
export const dynamic = 'force-static';

// Use validated table names from the central validator
const TABLES = getValidTableNames().filter(t => t !== 'settings');

export async function POST(request: NextRequest) {
  try {
    const backupData = await request.json();

    // Validate backup format
    if (!backupData.version || !backupData.data) {
      return NextResponse.json({ error: 'Invalid backup format' }, { status: 400 });
    }

    // Use a transaction to ensure atomicity - if anything fails, all changes are rolled back
    const restoreTransaction = db.transaction(() => {
      const results: Record<string, number> = {};
      let totalRestored = 0;

      // Restore each table
      for (const table of TABLES) {
        // Double-check table name is valid (defense in depth)
        if (!isValidTableName(table)) {
          logger.warn(`Skipping invalid table name: ${table}`);
          results[table] = 0;
          continue;
        }

        const tableData = backupData.data[table];
        if (!tableData || !Array.isArray(tableData)) {
          results[table] = 0;
          continue;
        }

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
          if (!row.id || row.data === undefined) {
            logger.warn(`Skipping invalid row in ${table}`);
            continue;
          }
          insertStmt.run(
            row.id,
            row.data,
            row.updated_at || new Date().toISOString()
          );
          count++;
        }

        results[table] = count;
        totalRestored += count;
      }

      // Restore settings (different structure)
      const settingsData = backupData.data['settings'];
      if (settingsData && Array.isArray(settingsData)) {
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
          if (!row.key || row.value === undefined) {
            logger.warn('Skipping invalid settings row');
            continue;
          }
          insertSettingsStmt.run(
            row.key,
            row.value,
            row.updated_at || new Date().toISOString()
          );
          settingsCount++;
        }

        results['settings'] = settingsCount;
        totalRestored += settingsCount;
      }

      return { results, totalRestored };
    });

    // Execute the transaction - automatically rolls back on error
    const { results, totalRestored } = restoreTransaction();

    return NextResponse.json({
      success: true,
      totalRestored,
      details: results,
      message: `Successfully restored ${totalRestored} records`
    });
  } catch (error) {
    logger.error('Restore error:', error);
    return NextResponse.json(
      { error: 'Failed to restore backup. No changes were made to your data.' },
      { status: 500 }
    );
  }
}
