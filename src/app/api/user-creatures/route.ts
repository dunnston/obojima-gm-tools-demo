import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
  try {
    const stmt = db.prepare('SELECT * FROM user_creatures ORDER BY updated_at DESC');
    const creatures = stmt.all();
    
    const parsedCreatures = creatures.map((creature: any) => ({
      ...JSON.parse(creature.data),
      _lastUpdated: creature.updated_at
    }));
    
    return NextResponse.json({ userCreatures: parsedCreatures });
  } catch (error) {
    console.error('Error fetching user creatures:', error);
    return NextResponse.json({ error: 'Failed to fetch user creatures' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...creatureData } = body;
    
    const stmt = db.prepare(`
      INSERT OR REPLACE INTO user_creatures (id, data, updated_at) 
      VALUES (?, ?, CURRENT_TIMESTAMP)
    `);
    
    stmt.run(id, JSON.stringify(creatureData));
    
    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error('Error saving user creature:', error);
    return NextResponse.json({ error: 'Failed to save user creature' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Creature ID required' }, { status: 400 });
    }
    
    const stmt = db.prepare('DELETE FROM user_creatures WHERE id = ?');
    stmt.run(id);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting user creature:', error);
    return NextResponse.json({ error: 'Failed to delete user creature' }, { status: 500 });
  }
}