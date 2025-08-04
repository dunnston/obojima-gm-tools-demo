import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { CalendarEvent } from '@/data/calendarEvents';

const DATA_DIR = path.join(process.cwd(), 'data');
const EVENTS_FILE = path.join(DATA_DIR, 'calendar-events.json');

// Ensure data directory exists
async function ensureDataDir() {
  try {
    await fs.access(DATA_DIR);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }
}

// Read events from file
async function readEvents(): Promise<CalendarEvent[]> {
  try {
    await ensureDataDir();
    const data = await fs.readFile(EVENTS_FILE, 'utf-8');
    const events = JSON.parse(data);
    
    // Ensure dates are properly parsed
    return events.map((event: any) => ({
      ...event,
      createdAt: new Date(event.createdAt),
      updatedAt: new Date(event.updatedAt)
    }));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return [];
    }
    throw error;
  }
}

// Write events to file
async function writeEvents(events: CalendarEvent[]): Promise<void> {
  await ensureDataDir();
  await fs.writeFile(EVENTS_FILE, JSON.stringify(events, null, 2));
}

// GET - Fetch all calendar events
export async function GET() {
  try {
    const events = await readEvents();
    return NextResponse.json(events);
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
    const events = await readEvents();
    
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
    
    events.push(newEvent);
    await writeEvents(events);
    
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
    const events = await readEvents();
    
    const eventIndex = events.findIndex(e => e.id === eventData.id);
    if (eventIndex === -1) {
      return NextResponse.json(
        { error: 'Calendar event not found' },
        { status: 404 }
      );
    }
    
    const updatedEvent: CalendarEvent = {
      ...events[eventIndex],
      title: eventData.title,
      description: eventData.description || '',
      location: eventData.location || '',
      date: eventData.date,
      questId: eventData.questId || undefined,
      questTitle: eventData.questTitle || undefined,
      isDmOnly: eventData.isDmOnly || false,
      updatedAt: new Date()
    };
    
    events[eventIndex] = updatedEvent;
    await writeEvents(events);
    
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
    
    const events = await readEvents();
    const updatedEvents = events.filter(event => event.id !== eventId);
    
    if (events.length === updatedEvents.length) {
      return NextResponse.json(
        { error: 'Calendar event not found' },
        { status: 404 }
      );
    }
    
    await writeEvents(updatedEvents);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting calendar event:', error);
    return NextResponse.json(
      { error: 'Failed to delete calendar event' },
      { status: 500 }
    );
  }
}