import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
  try {
    const stmt = db.prepare('SELECT * FROM user_potions ORDER BY updated_at DESC');
    const potions = stmt.all();
    
    const parsedPotions = potions.map((potion: any) => ({
      id: potion.id,
      ...JSON.parse(potion.data),
      _lastUpdated: potion.updated_at
    }));
    
    return NextResponse.json({ userPotions: parsedPotions });
  } catch (error) {
    console.error('Error fetching user potions:', error);
    return NextResponse.json({ error: 'Failed to fetch user potions' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...potionData } = body;
    
    const stmt = db.prepare(`
      INSERT OR REPLACE INTO user_potions (id, data, updated_at) 
      VALUES (?, ?, CURRENT_TIMESTAMP)
    `);
    
    stmt.run(id, JSON.stringify(potionData));
    
    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error('Error saving user potion:', error);
    return NextResponse.json({ error: 'Failed to save user potion' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Potion ID required' }, { status: 400 });
    }
    
    const stmt = db.prepare('DELETE FROM user_potions WHERE id = ?');
    stmt.run(id);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting user potion:', error);
    return NextResponse.json({ error: 'Failed to delete user potion' }, { status: 500 });
  }
}