import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
  try {
    const stmt = db.prepare('SELECT * FROM encounters ORDER BY updated_at DESC');
    const encounters = stmt.all();
    
    const parsedEncounters = encounters.map((encounter: any) => ({
      id: encounter.id,
      ...JSON.parse(encounter.data),
      _lastUpdated: encounter.updated_at
    }));
    
    return NextResponse.json({ encounters: parsedEncounters });
  } catch (error) {
    console.error('Error fetching encounters:', error);
    return NextResponse.json({ error: 'Failed to fetch encounters' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...encounterData } = body;
    
    const stmt = db.prepare(`
      INSERT OR REPLACE INTO encounters (id, data, updated_at) 
      VALUES (?, ?, CURRENT_TIMESTAMP)
    `);
    
    stmt.run(id, JSON.stringify(encounterData));
    
    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error('Error saving encounter:', error);
    return NextResponse.json({ error: 'Failed to save encounter' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Encounter ID required' }, { status: 400 });
    }
    
    const stmt = db.prepare('DELETE FROM encounters WHERE id = ?');
    stmt.run(id);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting encounter:', error);
    return NextResponse.json({ error: 'Failed to delete encounter' }, { status: 500 });
  }
}