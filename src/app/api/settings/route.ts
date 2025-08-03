import { NextRequest, NextResponse } from 'next/server';
import { getStorageAdapter } from '@/lib/storage';

export async function GET() {
  try {
    const storage = getStorageAdapter();
    const settings = await storage.getAll('settings');
    
    // Convert array of settings to key-value object
    const parsedSettings: { [key: string]: any } = {};
    
    // For localStorage adapter, settings might already be in the right format
    if (Array.isArray(settings)) {
      settings.forEach((setting: any) => {
        if (setting.key && setting.value !== undefined) {
          parsedSettings[setting.key] = setting.value;
        } else if (setting.id) {
          // Handle case where settings are stored with id as key
          parsedSettings[setting.id] = setting.value || setting;
        }
      });
    } else {
      // If it's already an object, use it directly
      Object.assign(parsedSettings, settings);
    }
    
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
    
    const storage = getStorageAdapter();
    await storage.setSetting(key, value);
    
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
    
    // Settings don't have a standard delete in our adapter
    // We'll set it to null or undefined
    const storage = getStorageAdapter();
    await storage.setSetting(key, null);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting setting:', error);
    return NextResponse.json({ error: 'Failed to delete setting' }, { status: 500 });
  }
}