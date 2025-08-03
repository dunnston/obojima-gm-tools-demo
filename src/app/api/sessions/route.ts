import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
  try {
    const stmt = db.prepare('SELECT * FROM sessions ORDER BY updated_at DESC');
    const sessions = stmt.all();
    
    const parsedSessions = sessions.map((session: any) => ({
      id: session.id,
      ...JSON.parse(session.data),
      _lastUpdated: session.updated_at
    }));
    
    return NextResponse.json({ sessions: parsedSessions });
  } catch (error) {
    console.error('Error fetching sessions:', error);
    return NextResponse.json({ error: 'Failed to fetch sessions' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...sessionData } = body;
    
    const stmt = db.prepare(`
      INSERT OR REPLACE INTO sessions (id, data, updated_at) 
      VALUES (?, ?, CURRENT_TIMESTAMP)
    `);
    
    stmt.run(id, JSON.stringify(sessionData));
    
    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error('Error saving session:', error);
    return NextResponse.json({ error: 'Failed to save session' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Session ID required' }, { status: 400 });
    }
    
    const stmt = db.prepare('DELETE FROM sessions WHERE id = ?');
    stmt.run(id);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting session:', error);
    return NextResponse.json({ error: 'Failed to delete session' }, { status: 500 });
  }
}