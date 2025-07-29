import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { data, type } = await request.json();
    
    if (!data || !type) {
      return NextResponse.json({ error: 'Missing data or type' }, { status: 400 });
    }
    
    let migrated = 0;
    
    // Generic migration function
    const migrateData = (tableName: string, items: any[]) => {
      const stmt = db.prepare(`
        INSERT OR REPLACE INTO ${tableName} (id, data, updated_at) 
        VALUES (?, ?, CURRENT_TIMESTAMP)
      `);
      
      for (const item of items) {
        stmt.run(item.id, JSON.stringify(item));
        migrated++;
      }
    };
    
    // Settings migration (different structure)
    const migrateSettings = (settings: { [key: string]: any }) => {
      const stmt = db.prepare(`
        INSERT OR REPLACE INTO settings (key, value, updated_at) 
        VALUES (?, ?, CURRENT_TIMESTAMP)
      `);
      
      for (const [key, value] of Object.entries(settings)) {
        const valueStr = typeof value === 'string' ? value : JSON.stringify(value);
        stmt.run(key, valueStr);
        migrated++;
      }
    };
    
    switch (type) {
      case 'characters':
        migrateData('characters', data);
        break;
        
      case 'sessions':
        migrateData('sessions', data);
        break;
        
      case 'quests':
        migrateData('quests', data);
        break;
        
      case 'encounters':
        migrateData('encounters', data);
        break;
        
      case 'downtime':
        migrateData('downtime_activities', data);
        break;
        
      case 'companions':
        migrateData('companions', data);
        break;
        
      case 'npcs':
        migrateData('npcs', data);
        break;
        
      case 'settings':
        migrateSettings(data);
        break;
        
      case 'user-potions':
        migrateData('user_potions', data);
        break;
        
      case 'user-ingredients':
        migrateData('user_ingredients', data);
        break;
        
      case 'user-creatures':
        migrateData('user_creatures', data);
        break;
        
      case 'user-magic-items':
        migrateData('user_magic_items', data);
        break;
        
      case 'user-companion-types':
        migrateData('user_companion_types', data);
        break;
      
      default:
        return NextResponse.json({ error: 'Unknown data type' }, { status: 400 });
    }
    
    return NextResponse.json({ success: true, migrated });
  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json({ error: 'Migration failed' }, { status: 500 });
  }
}