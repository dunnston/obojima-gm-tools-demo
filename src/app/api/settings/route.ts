import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
  try {
    const stmt = db.prepare('SELECT * FROM settings ORDER BY updated_at DESC');
    const settings = stmt.all();
    
    const parsedSettings: { [key: string]: any } = {};
    settings.forEach((setting: any) => {
      try {
        parsedSettings[setting.key] = JSON.parse(setting.value);
      } catch {
        parsedSettings[setting.key] = setting.value;
      }
    });
    
    return NextResponse.json({ settings: parsedSettings });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { key, value } = body;
    
    if (!key) {
      return NextResponse.json({ error: 'Setting key required' }, { status: 400 });
    }
    
    const stmt = db.prepare(`
      INSERT OR REPLACE INTO settings (key, value, updated_at) 
      VALUES (?, ?, CURRENT_TIMESTAMP)
    `);
    
    const valueStr = typeof value === 'string' ? value : JSON.stringify(value);
    stmt.run(key, valueStr);
    
    return NextResponse.json({ success: true, key });
  } catch (error) {
    console.error('Error saving setting:', error);
    return NextResponse.json({ error: 'Failed to save setting' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');
    
    if (!key) {
      return NextResponse.json({ error: 'Setting key required' }, { status: 400 });
    }
    
    const stmt = db.prepare('DELETE FROM settings WHERE key = ?');
    stmt.run(key);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting setting:', error);
    return NextResponse.json({ error: 'Failed to delete setting' }, { status: 500 });
  }
}