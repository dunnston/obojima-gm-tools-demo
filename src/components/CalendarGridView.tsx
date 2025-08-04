'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  CalendarEvent, 
  getEventsForDate,
  isSameObojimaDate,
  formatEventDate
} from '@/data/calendarEvents';
import { 
  ObojimaDate, 
  SEASONS,
  MOON_PHASES,
  formatObojimaDate,
  addDaysToObojimaDate,
  subtractDaysFromObojimaDate
} from '@/data/obojimaCalendar';
import {
  CalendarDaysIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PlusIcon,
  EyeIcon,
  EyeSlashIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

interface CalendarGridViewProps {
  currentDate: ObojimaDate;
  events: CalendarEvent[];
  onDateSelect: (date: ObojimaDate) => void;
  onEventSelect: (event: CalendarEvent) => void;
  onCreateEvent: (date: ObojimaDate) => void;
  showDmOnly: boolean;
  onToggleDmOnly: (show: boolean) => void;
}

export default function CalendarGridView({
  currentDate,
  events,
  onDateSelect,
  onEventSelect,
  onCreateEvent,
  showDmOnly,
  onToggleDmOnly
}: CalendarGridViewProps) {
  const { t } = useTranslation();
  const [viewDate, setViewDate] = useState<ObojimaDate>(currentDate);

  // Generate calendar days for the current season/cycle
  const generateCalendarDays = () => {
    const days: Array<{
      date: ObojimaDate;
      isCurrentDate: boolean;
      events: CalendarEvent[];
    }> = [];

    // Get current phase index and cycle
    const currentPhaseIndex = MOON_PHASES.findIndex(p => p.name === viewDate.phase);
    const currentCycle = viewDate.cycle;

    // Generate all days for the current season
    for (let cycle = 1; cycle <= 3; cycle++) {
      for (let phaseIndex = 0; phaseIndex < MOON_PHASES.length; phaseIndex++) {
        const phase = MOON_PHASES[phaseIndex];
        for (let day = 1; day <= phase.days; day++) {
          const date: ObojimaDate = {
            year: viewDate.year,
            season: viewDate.season,
            cycle: cycle,
            phase: phase.name,
            day: day
          };

          const dateEvents = getEventsForDate(events, date, showDmOnly);
          const isCurrentDate = isSameObojimaDate(date, currentDate);

          days.push({
            date,
            isCurrentDate,
            events: dateEvents
          });
        }
      }
    }

    return days;
  };

  const calendarDays = generateCalendarDays();

  const handlePreviousSeason = () => {
    const seasons = SEASONS.map(s => s.name);
    const currentSeasonIndex = seasons.indexOf(viewDate.season);
    
    if (currentSeasonIndex > 0) {
      setViewDate({
        ...viewDate,
        season: seasons[currentSeasonIndex - 1] as any
      });
    } else {
      // Go to previous year
      setViewDate({
        ...viewDate,
        year: viewDate.year - 1,
        season: 'Winter'
      });
    }
  };

  const handleNextSeason = () => {
    const seasons = SEASONS.map(s => s.name);
    const currentSeasonIndex = seasons.indexOf(viewDate.season);
    
    if (currentSeasonIndex < seasons.length - 1) {
      setViewDate({
        ...viewDate,
        season: seasons[currentSeasonIndex + 1] as any
      });
    } else {
      // Go to next year
      setViewDate({
        ...viewDate,
        year: viewDate.year + 1,
        season: 'Spring'
      });
    }
  };

  const getMoonPhaseEmoji = (phase: string) => {
    switch (phase) {
      case 'New Moon': return '🌑';
      case 'Waxing Moon': return '🌓';
      case 'Full Moon': return '🌕';
      case 'Waning Moon': return '🌗';
      default: return '🌙';
    }
  };

  const getSeasonEmoji = (season: string) => {
    switch (season) {
      case 'Spring': return '🌸';
      case 'Summer': return '☀️';
      case 'Autumn': return '🍂';
      case 'Winter': return '❄️';
      default: return '📅';
    }
  };

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={handlePreviousSeason}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
          >
            <ChevronLeftIcon className="h-5 w-5" />
          </button>
          
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              {getSeasonEmoji(viewDate.season)} {viewDate.season} {viewDate.year}
            </h2>
            <p className="text-sm text-slate-400">
              {t('calendar.title')} - {t('calendar.currentDate')}: {formatObojimaDate(currentDate)}
            </p>
          </div>
          
          <button
            onClick={handleNextSeason}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
          >
            <ChevronRightIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="flex items-center gap-3">
          {/* DM Only Toggle */}
          <button
            onClick={() => onToggleDmOnly(!showDmOnly)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${ 
              showDmOnly 
                ? 'bg-amber-600 text-white hover:bg-amber-700' 
                : 'bg-slate-600 text-slate-300 hover:bg-slate-700'
            }`}
            title={showDmOnly ? 'Hide DM Only Events' : 'Show DM Only Events'}
          >
            {showDmOnly ? <EyeIcon className="h-4 w-4" /> : <EyeSlashIcon className="h-4 w-4" />}
            DM Only
          </button>

          {/* Add Event Button */}
          <button
            onClick={() => onCreateEvent(currentDate)}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
          >
            <PlusIcon className="h-4 w-4" />
            Add Event
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg overflow-hidden">
        {/* Cycle Headers */}
        <div className="grid grid-cols-3 bg-slate-700/50">
          {[1, 2, 3].map(cycle => (
            <div key={cycle} className="p-3 text-center border-r border-slate-600 last:border-r-0">
              <h3 className="font-semibold text-white">
                {t(`sessions.form.${cycle === 1 ? 'firstCycle' : cycle === 2 ? 'secondCycle' : 'thirdCycle'}`)} Cycle
              </h3>
            </div>
          ))}
        </div>

        {/* Moon Phase Rows */}
        {MOON_PHASES.map((phase, phaseIndex) => (
          <div key={phase.name} className="border-t border-slate-600">
            {/* Phase Header */}
            <div className="bg-slate-700/30 p-2 border-b border-slate-600">
              <h4 className="text-sm font-medium text-slate-300 flex items-center gap-2">
                {getMoonPhaseEmoji(phase.name)} {phase.name} ({phase.days} days)
              </h4>
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-3">
              {[1, 2, 3].map(cycle => (
                <div key={`${phase.name}-${cycle}`} className="border-r border-slate-600 last:border-r-0">
                  <div className="grid grid-cols-4 min-h-[120px]">
                    {Array.from({ length: phase.days }, (_, dayIndex) => {
                      const day = dayIndex + 1;
                      const date: ObojimaDate = {
                        year: viewDate.year,
                        season: viewDate.season,
                        cycle: cycle,
                        phase: phase.name,
                        day: day
                      };

                      const dayEvents = getEventsForDate(events, date, showDmOnly);
                      const isCurrentDate = isSameObojimaDate(date, currentDate);
                      const isToday = isSameObojimaDate(date, currentDate);

                      return (
                        <div
                          key={`${cycle}-${phase.name}-${day}`}
                          onClick={() => onDateSelect(date)}
                          className={`relative p-2 border-r border-b border-slate-600 cursor-pointer hover:bg-slate-700/30 transition-colors min-h-[60px] ${
                            isCurrentDate ? 'bg-blue-500/20 border-blue-400' : ''
                          }`}
                        >
                          {/* Day Number */}
                          <div className={`text-xs font-medium mb-1 ${
                            isCurrentDate ? 'text-blue-300' : 'text-slate-400'
                          }`}>
                            {day}
                          </div>

                          {/* Events */}
                          <div className="space-y-1">
                            {dayEvents.slice(0, 2).map((event, index) => (
                              <div
                                key={event.id}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onEventSelect(event);
                                }}
                                className={`text-xs p-1 rounded truncate cursor-pointer transition-colors ${
                                  event.isDmOnly 
                                    ? 'bg-amber-600/80 text-amber-100 hover:bg-amber-600' 
                                    : 'bg-emerald-600/80 text-emerald-100 hover:bg-emerald-600'
                                }`}
                                title={event.title}
                              >
                                {event.isDmOnly && <ExclamationTriangleIcon className="h-3 w-3 inline mr-1" />}
                                {event.title}
                              </div>
                            ))}
                            
                            {/* More events indicator */}
                            {dayEvents.length > 2 && (
                              <div className="text-xs text-slate-400 px-1">
                                +{dayEvents.length - 2} more
                              </div>
                            )}

                            {/* Add event button on hover */}
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onCreateEvent(date);
                                }}
                                className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                              >
                                <PlusIcon className="h-3 w-3" />
                                Add
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-500/20 border border-blue-400 rounded"></div>
          <span className="text-slate-400">Current Date</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-emerald-600 rounded"></div>
          <span className="text-slate-400">Regular Event</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-amber-600 rounded"></div>
          <span className="text-slate-400">DM Only Event</span>
        </div>
      </div>
    </div>
  );
}