import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { data, type } = await request.json();
    
    if (!data || !type) {
      return NextResponse.json({ error: 'Missing data or type' }, { status: 400 });
    }
    
    let migrated = 0;
    
    switch (type) {
      case 'characters':
        const stmt = db.prepare(`
          INSERT OR REPLACE INTO characters (id, data, updated_at) 
          VALUES (?, ?, CURRENT_TIMESTAMP)
        `);
        
        for (const character of data) {
          stmt.run(character.id, JSON.stringify(character));
          migrated++;
        }
        break;
        
      case 'sessions':
        const sessStmt = db.prepare(`
          INSERT OR REPLACE INTO sessions (id, data, updated_at) 
          VALUES (?, ?, CURRENT_TIMESTAMP)
        `);
        
        for (const session of data) {
          sessStmt.run(session.id, JSON.stringify(session));
          migrated++;
        }
        break;
        
      case 'quests':
        const questStmt = db.prepare(`
          INSERT OR REPLACE INTO quests (id, data, updated_at) 
          VALUES (?, ?, CURRENT_TIMESTAMP)
        `);
        
        for (const quest of data) {
          questStmt.run(quest.id, JSON.stringify(quest));
          migrated++;
        }
        break;
        
      // Add more cases for other data types as needed
      
      default:
        return NextResponse.json({ error: 'Unknown data type' }, { status: 400 });
    }
    
    return NextResponse.json({ success: true, migrated });
  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json({ error: 'Migration failed' }, { status: 500 });
  }
}