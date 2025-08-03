import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
  try {
    const stmt = db.prepare('SELECT * FROM npcs ORDER BY updated_at DESC');
    const npcs = stmt.all();
    
    const parsedNpcs = npcs.map((npc: any) => ({
      id: npc.id,
      ...JSON.parse(npc.data),
      _lastUpdated: npc.updated_at
    }));
    
    return NextResponse.json({ npcs: parsedNpcs });
  } catch (error) {
    console.error('Error fetching NPCs:', error);
    return NextResponse.json({ error: 'Failed to fetch NPCs' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...npcData } = body;
    
    const stmt = db.prepare(`
      INSERT OR REPLACE INTO npcs (id, data, updated_at) 
      VALUES (?, ?, CURRENT_TIMESTAMP)
    `);
    
    stmt.run(id, JSON.stringify(npcData));
    
    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error('Error saving NPC:', error);
    return NextResponse.json({ error: 'Failed to save NPC' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'NPC ID required' }, { status: 400 });
    }
    
    const stmt = db.prepare('DELETE FROM npcs WHERE id = ?');
    stmt.run(id);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting NPC:', error);
    return NextResponse.json({ error: 'Failed to delete NPC' }, { status: 500 });
  }
}