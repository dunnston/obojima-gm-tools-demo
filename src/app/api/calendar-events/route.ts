import { NextRequest, NextResponse } from 'next/server';
import { CalendarEvent } from '@/data/calendarEvents';
import { getStorageAdapter } from '@/lib/storage';

// Required for static export (Tauri build)
export const dynamic = 'force-static';

const TABLE_NAME = 'calendar_events';

// GET - Fetch all calendar events
export async function GET() {
  try {
    const storage = getStorageAdapter();
    const events = await storage.getAll(TABLE_NAME);

    // Ensure dates are properly parsed
    const parsedEvents = events.map((event: any) => ({
      ...event,
      createdAt: event.createdAt ? new Date(event.createdAt) : new Date(),
      updatedAt: event.updatedAt ? new Date(event.updatedAt) : new Date()
    }));

    return NextResponse.json(parsedEvents);
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    return NextResponse.json(
      { error: 'Failed to fetch calendar events' },
      { status: 500 }
    );
  }
}

// POST - Create a new calendar event
export async function POST(request: NextRequest) {
  try {
    const eventData = await request.json();
    const storage = getStorageAdapter();

    const newEvent: CalendarEvent = {
      id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: eventData.title,
      description: eventData.description || '',
      location: eventData.location || '',
      date: eventData.date,
      questId: eventData.questId || undefined,
      questTitle: eventData.questTitle || undefined,
      isDmOnly: eventData.isDmOnly || false,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await storage.create(TABLE_NAME, newEvent.id, newEvent);

    return NextResponse.json(newEvent, { status: 201 });
  } catch (error) {
    console.error('Error creating calendar event:', error);
    return NextResponse.json(
      { error: 'Failed to create calendar event' },
      { status: 500 }
    );
  }
}

// PUT - Update an existing calendar event
export async function PUT(request: NextRequest) {
  try {
    const eventData = await request.json();
    const storage = getStorageAdapter();

    const existingEvent = await storage.get(TABLE_NAME, eventData.id);
    if (!existingEvent) {
      return NextResponse.json(
        { error: 'Calendar event not found' },
        { status: 404 }
      );
    }

    const updatedEvent: CalendarEvent = {
      ...existingEvent,
      title: eventData.title,
      description: eventData.description || '',
      location: eventData.location || '',
      date: eventData.date,
      questId: eventData.questId || undefined,
      questTitle: eventData.questTitle || undefined,
      isDmOnly: eventData.isDmOnly || false,
      updatedAt: new Date()
    };

    await storage.update(TABLE_NAME, eventData.id, updatedEvent);

    return NextResponse.json(updatedEvent);
  } catch (error) {
    console.error('Error updating calendar event:', error);
    return NextResponse.json(
      { error: 'Failed to update calendar event' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a calendar event
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('id');

    if (!eventId) {
      return NextResponse.json(
        { error: 'Event ID is required' },
        { status: 400 }
      );
    }

    const storage = getStorageAdapter();
    const existingEvent = await storage.get(TABLE_NAME, eventId);

    if (!existingEvent) {
      return NextResponse.json(
        { error: 'Calendar event not found' },
        { status: 404 }
      );
    }

    await storage.delete(TABLE_NAME, eventId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting calendar event:', error);
    return NextResponse.json(
      { error: 'Failed to delete calendar event' },
      { status: 500 }
    );
  }
}