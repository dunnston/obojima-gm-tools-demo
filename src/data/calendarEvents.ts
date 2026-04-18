import {
  ObojimaDate,
  CalendarConfig,
  DEFAULT_CALENDAR_CONFIG,
  formatObojimaDate,
} from './obojimaCalendar';

export interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  location: string;
  date: ObojimaDate;
  questId?: string;
  questTitle?: string;
  isDmOnly: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CalendarEventFormData {
  title: string;
  description: string;
  location: string;
  date: ObojimaDate;
  questId?: string;
  questTitle?: string;
  isDmOnly: boolean;
}

export const createEmptyCalendarEvent = (
  date?: ObojimaDate,
  config: CalendarConfig = DEFAULT_CALENDAR_CONFIG
): CalendarEventFormData => ({
  title: '',
  description: '',
  location: '',
  date: date || {
    year: 1,
    season: config.seasons[0]?.id ?? 'Spring',
    cycle: 1,
    phase: config.phases[0]?.id ?? 'New Moon',
    day: 1,
  },
  questId: undefined,
  questTitle: undefined,
  isDmOnly: false,
});

export const formDataToCalendarEvent = (formData: CalendarEventFormData): Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'> => ({
  title: formData.title.trim(),
  description: formData.description.trim(),
  location: formData.location.trim(),
  date: formData.date,
  questId: formData.questId || undefined,
  questTitle: formData.questTitle || undefined,
  isDmOnly: formData.isDmOnly
});

export const calendarEventToFormData = (event: CalendarEvent): CalendarEventFormData => ({
  title: event.title,
  description: event.description,
  location: event.location,
  date: event.date,
  questId: event.questId,
  questTitle: event.questTitle,
  isDmOnly: event.isDmOnly
});

// Helper function to check if two Obojima dates are the same
export const isSameObojimaDate = (date1: ObojimaDate, date2: ObojimaDate): boolean => {
  return date1.year === date2.year &&
         date1.season === date2.season &&
         date1.cycle === date2.cycle &&
         date1.phase === date2.phase &&
         date1.day === date2.day;
};

// Helper function to compare Obojima dates (returns -1, 0, or 1).
// Season and phase order are derived from the active config. Unknown ids
// sort after known ones (index = length) so legacy data doesn't disappear;
// ties among unknown ids are broken by string compare on the raw id so
// ordering is deterministic regardless of fetch order.
export const compareObojimaDate = (
  date1: ObojimaDate,
  date2: ObojimaDate,
  config: CalendarConfig = DEFAULT_CALENDAR_CONFIG
): number => {
  if (date1.year !== date2.year) return date1.year - date2.year;

  const seasonOrder = (id: string) => {
    const idx = config.seasons.findIndex(s => s.id === id);
    return idx >= 0 ? idx : config.seasons.length;
  };
  const s1 = seasonOrder(date1.season);
  const s2 = seasonOrder(date2.season);
  if (s1 !== s2) return s1 - s2;
  // Both unknown → tiebreak on raw id.
  if (s1 === config.seasons.length && date1.season !== date2.season) {
    return date1.season < date2.season ? -1 : 1;
  }

  if (date1.cycle !== date2.cycle) return date1.cycle - date2.cycle;

  const phaseOrder = (id: string) => {
    const idx = config.phases.findIndex(p => p.id === id);
    return idx >= 0 ? idx : config.phases.length;
  };
  const p1 = phaseOrder(date1.phase);
  const p2 = phaseOrder(date2.phase);
  if (p1 !== p2) return p1 - p2;
  if (p1 === config.phases.length && date1.phase !== date2.phase) {
    return date1.phase < date2.phase ? -1 : 1;
  }

  return date1.day - date2.day;
};

// Helper function to get events for a specific date
export const getEventsForDate = (events: CalendarEvent[], date: ObojimaDate, showDmOnly: boolean = true): CalendarEvent[] => {
  return events.filter(event => {
    if (!showDmOnly && event.isDmOnly) return false;
    return isSameObojimaDate(event.date, date);
  });
};

// Helper function to get events between two dates (inclusive)
export const getEventsBetweenDates = (
  events: CalendarEvent[],
  startDate: ObojimaDate,
  endDate: ObojimaDate,
  showDmOnly: boolean = true,
  config: CalendarConfig = DEFAULT_CALENDAR_CONFIG
): CalendarEvent[] => {
  return events.filter(event => {
    if (!showDmOnly && event.isDmOnly) return false;
    const eventDate = event.date;
    return compareObojimaDate(eventDate, startDate, config) >= 0 &&
           compareObojimaDate(eventDate, endDate, config) <= 0;
  }).sort((a, b) => compareObojimaDate(a.date, b.date, config));
};

// Helper function to format event date for display
export const formatEventDate = (event: CalendarEvent): string => {
  return formatObojimaDate(event.date);
};
