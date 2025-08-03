import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
  try {
    const stmt = db.prepare('SELECT * FROM characters ORDER BY updated_at DESC');
    const characters = stmt.all();
    
    // Parse JSON data for each character
    const parsedCharacters = characters.map((char: any) => ({
      id: char.id,
      ...JSON.parse(char.data),
      _lastUpdated: char.updated_at
    }));
    
    return NextResponse.json({ characters: parsedCharacters });
  } catch (error) {
    console.error('Error fetching characters:', error);
    return NextResponse.json({ error: 'Failed to fetch characters' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...characterData } = body;
    
    const stmt = db.prepare(`
      INSERT OR REPLACE INTO characters (id, data, updated_at) 
      VALUES (?, ?, CURRENT_TIMESTAMP)
    `);
    
    stmt.run(id, JSON.stringify(characterData));
    
    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error('Error saving character:', error);
    return NextResponse.json({ error: 'Failed to save character' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Character ID required' }, { status: 400 });
    }
    
    const stmt = db.prepare('DELETE FROM characters WHERE id = ?');
    stmt.run(id);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting character:', error);
    return NextResponse.json({ error: 'Failed to delete character' }, { status: 500 });
  }
}