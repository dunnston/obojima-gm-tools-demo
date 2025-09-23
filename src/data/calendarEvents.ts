import { ObojimaDate, formatObojimaDate, obojimaDateToJSDate } from './obojimaCalendar';

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

export const createEmptyCalendarEvent = (date?: ObojimaDate): CalendarEventFormData => ({
  title: '',
  description: '',
  location: '',
  date: date || { year: 1, season: 'Spring', cycle: 1, phase: 'New Moon', day: 1 },
  questId: undefined,
  questTitle: undefined,
  isDmOnly: false
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

// Helper function to compare Obojima dates (returns -1, 0, or 1)
export const compareObojimaDate = (date1: ObojimaDate, date2: ObojimaDate): number => {
  if (date1.year !== date2.year) return date1.year - date2.year;
  
  const seasons = ['Spring', 'Summer', 'Autumn', 'Winter'];
  const season1Index = seasons.indexOf(date1.season);
  const season2Index = seasons.indexOf(date2.season);
  if (season1Index !== season2Index) return season1Index - season2Index;
  
  if (date1.cycle !== date2.cycle) return date1.cycle - date2.cycle;
  
  const phases = ['New Moon', 'Waxing Moon', 'Full Moon', 'Waning Moon'];
  const phase1Index = phases.indexOf(date1.phase);
  const phase2Index = phases.indexOf(date2.phase);
  if (phase1Index !== phase2Index) return phase1Index - phase2Index;
  
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
  showDmOnly: boolean = true
): CalendarEvent[] => {
  return events.filter(event => {
    if (!showDmOnly && event.isDmOnly) return false;
    const eventDate = event.date;
    return compareObojimaDate(eventDate, startDate) >= 0 && 
           compareObojimaDate(eventDate, endDate) <= 0;
  }).sort((a, b) => compareObojimaDate(a.date, b.date));
};

// Helper function to format event date for display
export const formatEventDate = (event: CalendarEvent): string => {
  return formatObojimaDate(event.date);
};