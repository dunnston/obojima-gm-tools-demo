import { NextRequest, NextResponse } from 'next/server';
import { getStorageAdapter } from '@/lib/storage';
import { StorageTable } from '@/lib/storage/types';

export function createRouteHandler(tableName: StorageTable, responseKey: string) {
  return {
    async GET() {
      try {
        const storage = getStorageAdapter();
        const items = await storage.getAll(tableName);
        
        return NextResponse.json({ [responseKey]: items });
      } catch (error) {
        console.error(`Error fetching ${tableName}:`, error);
        return NextResponse.json({ error: `Failed to fetch ${tableName}` }, { status: 500 });
      }
    },

    async POST(request: NextRequest) {
      try {
        const body = await request.json();
        const { id, ...data } = body;
        
        const storage = getStorageAdapter();
        
        // Check if item exists to decide between create or update
        const existing = await storage.get(tableName, id);
        
        if (existing) {
          await storage.update(tableName, id, { id, ...data });
        } else {
          await storage.create(tableName, id, { id, ...data });
        }
        
        return NextResponse.json({ success: true, id });
      } catch (error) {
        console.error(`Error saving ${tableName}:`, error);
        return NextResponse.json({ error: `Failed to save ${tableName}` }, { status: 500 });
      }
    },

    async DELETE(request: NextRequest) {
      try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        
        if (!id) {
          return NextResponse.json({ error: `${tableName} ID required` }, { status: 400 });
        }
        
        const storage = getStorageAdapter();
        await storage.delete(tableName, id);
        
        return NextResponse.json({ success: true });
      } catch (error) {
        console.error(`Error deleting ${tableName}:`, error);
        return NextResponse.json({ error: `Failed to delete ${tableName}` }, { status: 500 });
      }
    }
  };
}