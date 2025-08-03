import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
  try {
    const stmt = db.prepare('SELECT * FROM user_companion_types ORDER BY updated_at DESC');
    const companionTypes = stmt.all();
    
    const parsedCompanionTypes = companionTypes.map((type: any) => ({
      id: type.id,
      ...JSON.parse(type.data),
      _lastUpdated: type.updated_at
    }));
    
    return NextResponse.json({ userCompanionTypes: parsedCompanionTypes });
  } catch (error) {
    console.error('Error fetching user companion types:', error);
    return NextResponse.json({ error: 'Failed to fetch user companion types' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...typeData } = body;
    
    const stmt = db.prepare(`
      INSERT OR REPLACE INTO user_companion_types (id, data, updated_at) 
      VALUES (?, ?, CURRENT_TIMESTAMP)
    `);
    
    stmt.run(id, JSON.stringify(typeData));
    
    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error('Error saving user companion type:', error);
    return NextResponse.json({ error: 'Failed to save user companion type' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Companion type ID required' }, { status: 400 });
    }
    
    const stmt = db.prepare('DELETE FROM user_companion_types WHERE id = ?');
    stmt.run(id);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting user companion type:', error);
    return NextResponse.json({ error: 'Failed to delete user companion type' }, { status: 500 });
  }
}