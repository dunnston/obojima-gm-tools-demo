import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
  try {
    const stmt = db.prepare('SELECT * FROM downtime_activities ORDER BY updated_at DESC');
    const activities = stmt.all();
    
    const parsedActivities = activities.map((activity: any) => ({
      id: activity.id,
      ...JSON.parse(activity.data),
      _lastUpdated: activity.updated_at
    }));
    
    return NextResponse.json({ activities: parsedActivities });
  } catch (error) {
    console.error('Error fetching downtime activities:', error);
    return NextResponse.json({ error: 'Failed to fetch downtime activities' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...activityData } = body;
    
    const stmt = db.prepare(`
      INSERT OR REPLACE INTO downtime_activities (id, data, updated_at) 
      VALUES (?, ?, CURRENT_TIMESTAMP)
    `);
    
    stmt.run(id, JSON.stringify(activityData));
    
    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error('Error saving downtime activity:', error);
    return NextResponse.json({ error: 'Failed to save downtime activity' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Activity ID required' }, { status: 400 });
    }
    
    const stmt = db.prepare('DELETE FROM downtime_activities WHERE id = ?');
    stmt.run(id);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting downtime activity:', error);
    return NextResponse.json({ error: 'Failed to delete downtime activity' }, { status: 500 });
  }
}