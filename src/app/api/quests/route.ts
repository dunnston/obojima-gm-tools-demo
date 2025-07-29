import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
  try {
    const stmt = db.prepare('SELECT * FROM quests ORDER BY updated_at DESC');
    const quests = stmt.all();
    
    const parsedQuests = quests.map((quest: any) => ({
      ...JSON.parse(quest.data),
      _lastUpdated: quest.updated_at
    }));
    
    return NextResponse.json({ quests: parsedQuests });
  } catch (error) {
    console.error('Error fetching quests:', error);
    return NextResponse.json({ error: 'Failed to fetch quests' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...questData } = body;
    
    const stmt = db.prepare(`
      INSERT OR REPLACE INTO quests (id, data, updated_at) 
      VALUES (?, ?, CURRENT_TIMESTAMP)
    `);
    
    stmt.run(id, JSON.stringify(questData));
    
    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error('Error saving quest:', error);
    return NextResponse.json({ error: 'Failed to save quest' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Quest ID required' }, { status: 400 });
    }
    
    const stmt = db.prepare('DELETE FROM quests WHERE id = ?');
    stmt.run(id);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting quest:', error);
    return NextResponse.json({ error: 'Failed to delete quest' }, { status: 500 });
  }
}