import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { table } = await request.json();
    
    if (!table) {
      return NextResponse.json({ error: 'Table name required' }, { status: 400 });
    }
    
    // Only allow cleanup of specific tables for safety
    const allowedTables = [
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
    ];
    
    if (!allowedTables.includes(table)) {
      return NextResponse.json({ error: 'Invalid table name' }, { status: 400 });
    }
    
    // Clear the specified table
    const stmt = db.prepare(`DELETE FROM ${table}`);
    const result = stmt.run();
    
    return NextResponse.json({ 
      success: true, 
      message: `Cleared ${result.changes} records from ${table}` 
    });
  } catch (error) {
    console.error('Cleanup error:', error);
    return NextResponse.json({ error: 'Cleanup failed' }, { status: 500 });
  }
}