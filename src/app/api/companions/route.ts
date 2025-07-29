import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
  try {
    const stmt = db.prepare('SELECT * FROM companions ORDER BY updated_at DESC');
    const companions = stmt.all();
    
    const parsedCompanions = companions.map((companion: any) => ({
      ...JSON.parse(companion.data),
      _lastUpdated: companion.updated_at
    }));
    
    return NextResponse.json({ companions: parsedCompanions });
  } catch (error) {
    console.error('Error fetching companions:', error);
    return NextResponse.json({ error: 'Failed to fetch companions' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...companionData } = body;
    
    const stmt = db.prepare(`
      INSERT OR REPLACE INTO companions (id, data, updated_at) 
      VALUES (?, ?, CURRENT_TIMESTAMP)
    `);
    
    stmt.run(id, JSON.stringify(companionData));
    
    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error('Error saving companion:', error);
    return NextResponse.json({ error: 'Failed to save companion' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Companion ID required' }, { status: 400 });
    }
    
    const stmt = db.prepare('DELETE FROM companions WHERE id = ?');
    stmt.run(id);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting companion:', error);
    return NextResponse.json({ error: 'Failed to delete companion' }, { status: 500 });
  }
}