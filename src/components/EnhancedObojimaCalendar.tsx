'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  ObojimaDate,
  addDaysToObojimaDate,
  formatObojimaDate
} from '@/data/obojimaCalendar';
import { 
  CalendarEvent, 
  getEventsForDate,
  getEventsBetweenDates,
  isSameObojimaDate,
  formDataToCalendarEvent,
  createEmptyCalendarEvent
} from '@/data/calendarEvents';
import {
  CalendarDaysIcon,
  TableCellsIcon,
  ExclamationTriangleIcon,
  BellIcon
} from '@heroicons/react/24/outline';
import ObojimaCalendar from './ObojimaCalendar';
import CalendarGridView from './CalendarGridView';
import CalendarEventModal from './CalendarEventModal';
import CalendarEventDetailsModal from './CalendarEventDetailsModal';

interface EnhancedObojimaCalendarProps {
  currentDate: ObojimaDate;
  onDateChange: (date: ObojimaDate, skipEvents?: string[]) => void;
  onRefresh?: () => void;
  syncStatus?: 'idle' | 'syncing' | 'error';
}

export default function EnhancedObojimaCalendar({ 
  currentDate, 
  onDateChange, 
  onRefresh, 
  syncStatus = 'idle' 
}: EnhancedObojimaCalendarProps) {
  const { t } = useTranslation();
  const [viewMode, setViewMode] = useState<'standard' | 'grid'>('standard');
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [showDmOnly, setShowDmOnly] = useState(true);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showEventDetails, setShowEventDetails] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [eventModalDate, setEventModalDate] = useState<ObojimaDate | null>(null);
  const [currentDayAlert, setCurrentDayAlert] = useState<CalendarEvent[]>([]);

  // Load calendar events
  const loadEvents = async () => {
    try {
      const response = await fetch('/api/calendar-events');
      if (response.ok) {
        const eventData: CalendarEvent[] = await response.json();
        // Parse dates properly
        const parsedEvents = eventData.map(event => ({
          ...event,
          createdAt: new Date(event.createdAt),
          updatedAt: new Date(event.updatedAt)
        }));
        setEvents(parsedEvents);
        
        // Check for current day events
        const todayEvents = getEventsForDate(parsedEvents, currentDate, showDmOnly);
        if (todayEvents.length > 0) {
          setCurrentDayAlert(todayEvents);
        } else {
          setCurrentDayAlert([]);
        }
      }
    } catch (error) {
      console.error('Error loading calendar events:', error);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  useEffect(() => {
    // Update current day alert when date or showDmOnly changes
    const todayEvents = getEventsForDate(events, currentDate, showDmOnly);
    setCurrentDayAlert(todayEvents);
  }, [currentDate, events, showDmOnly]);

  // Enhanced date change handler with event warnings
  const handleDateChange = (newDate: ObojimaDate, skipEventIds?: string[]) => {
    // Check for events between current date and new date
    const eventsBetween = getEventsBetweenDates(events, currentDate, newDate, showDmOnly);
    const unskippedEvents = eventsBetween.filter(event => 
      !skipEventIds?.includes(event.id) && !isSameObojimaDate(event.date, currentDate)
    );

    if (unskippedEvents.length > 0) {
      const eventList = unskippedEvents.map(event => 
        `• ${event.title} on ${formatObojimaDate(event.date)}`
      ).join('\n');
      
      const confirmMessage = `You are about to skip past ${unskippedEvents.length} calendar event(s):\n\n${eventList}\n\nDo you want to continue?`;
      
      if (confirm(confirmMessage)) {
        onDateChange(newDate, unskippedEvents.map(e => e.id));
      }
    } else {
      onDateChange(newDate);
    }
  };

  const handleCreateEvent = (date: ObojimaDate) => {
    setEventModalDate(date);
    setSelectedEvent(null);
    setShowEventModal(true);
  };

  const handleEditEvent = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setEventModalDate(null);
    setShowEventModal(true);
  };

  const handleViewEvent = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setShowEventDetails(true);
  };

  const handleSaveEvent = async (eventData: Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const response = selectedEvent 
        ? await fetch('/api/calendar-events', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...eventData, id: selectedEvent.id })
          })
        : await fetch('/api/calendar-events', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(eventData)
          });

      if (response.ok) {
        await loadEvents();
        setShowEventModal(false);
      } else {
        throw new Error('Failed to save event');
      }
    } catch (error) {
      console.error('Error saving event:', error);
      alert('Error saving event. Please try again.');
    }
  };

  const handleDeleteEvent = async () => {
    if (!selectedEvent) return;

    try {
      const response = await fetch(`/api/calendar-events?id=${selectedEvent.id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await loadEvents();
        setShowEventDetails(false);
        setSelectedEvent(null);
      } else {
        throw new Error('Failed to delete event');
      }
    } catch (error) {
      console.error('Error deleting event:', error);
      alert('Error deleting event. Please try again.');
    }
  };

  const dismissCurrentDayAlert = () => {
    setCurrentDayAlert([]);
  };

  return (
    <div className="space-y-6">
      {/* Current Day Event Alert */}
      {currentDayAlert.length > 0 && (
        <div className="bg-gradient-to-r from-amber-600/20 to-orange-600/20 border border-amber-500/50 rounded-lg p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <BellIcon className="h-5 w-5 text-amber-400 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="text-amber-300 font-semibold mb-2">Events Today!</h3>
                <div className="space-y-1">
                  {currentDayAlert.map(event => (
                    <div key={event.id} className="flex items-center gap-2">
                      <span className="text-amber-200">{event.title}</span>
                      {event.isDmOnly && (
                        <ExclamationTriangleIcon className="h-4 w-4 text-amber-400" title="DM Only" />
                      )}
                      {event.location && (
                        <span className="text-amber-300 text-sm">@ {event.location}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <button
              onClick={dismissCurrentDayAlert}
              className="text-amber-400 hover:text-amber-300 text-sm"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* View Mode Toggle */}
      <div className="flex justify-center">
        <div className="flex bg-slate-700/50 rounded-lg p-1">
          <button
            onClick={() => setViewMode('standard')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
              viewMode === 'standard'
                ? 'bg-slate-600 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <CalendarDaysIcon className="h-4 w-4" />
            Standard View
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
              viewMode === 'grid'
                ? 'bg-slate-600 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <TableCellsIcon className="h-4 w-4" />
            Calendar Grid
          </button>
        </div>
      </div>

      {/* Calendar Content */}
      {viewMode === 'standard' ? (
        <ObojimaCalendar
          currentDate={currentDate}
          onDateChange={handleDateChange}
          onRefresh={onRefresh}
          syncStatus={syncStatus}
        />
      ) : (
        <CalendarGridView
          currentDate={currentDate}
          events={events}
          onDateSelect={handleDateChange}
          onEventSelect={handleViewEvent}
          onCreateEvent={handleCreateEvent}
          showDmOnly={showDmOnly}
          onToggleDmOnly={setShowDmOnly}
        />
      )}

      {/* Event Creation/Edit Modal */}
      {showEventModal && (
        <CalendarEventModal
          event={selectedEvent}
          initialDate={eventModalDate}
          onSave={handleSaveEvent}
          onCancel={() => {
            setShowEventModal(false);
            setSelectedEvent(null);
            setEventModalDate(null);
          }}
          onDelete={selectedEvent ? handleDeleteEvent : undefined}
          isEditing={!!selectedEvent}
        />
      )}

      {/* Event Details Modal */}
      {showEventDetails && selectedEvent && (
        <CalendarEventDetailsModal
          event={selectedEvent}
          onEdit={() => {
            setShowEventDetails(false);
            handleEditEvent(selectedEvent);
          }}
          onDelete={handleDeleteEvent}
          onClose={() => {
            setShowEventDetails(false);
            setSelectedEvent(null);
          }}
        />
      )}
    </div>
  );
}