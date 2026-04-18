'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  CalendarEvent,
  getEventsForDate,
  isSameObojimaDate,
} from '@/data/calendarEvents';
import {
  ObojimaDate,
  resolvePhase,
  resolveSeason,
  formatObojimaDate,
} from '@/data/obojimaCalendar';
import { useCalendarConfigReady } from '@/contexts/CalendarConfigContext';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  PlusIcon,
  EyeIcon,
  EyeSlashIcon,
  ExclamationTriangleIcon,
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
  const { config, isLoaded } = useCalendarConfigReady();
  const [viewDate, setViewDate] = useState<ObojimaDate>(currentDate);

  // Defer rendering the grid until the active config is known — otherwise
  // a GM with a custom calendar would see a flash of the default 4×3 grid
  // before it snaps to their custom layout.
  if (!isLoaded) {
    return (
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-8 text-center text-slate-400">
        Loading calendar…
      </div>
    );
  }

  // Cycles shown for the viewed season (per-season cycle count).
  const viewSeason = resolveSeason(viewDate.season, config) ?? config.seasons[0];
  const cyclesInView = viewSeason?.cycles ?? 1;

  const handlePreviousSeason = () => {
    const seasonIds = config.seasons.map(s => s.id);
    const currentSeasonIndex = seasonIds.indexOf(viewDate.season);

    if (currentSeasonIndex > 0) {
      setViewDate({
        ...viewDate,
        season: seasonIds[currentSeasonIndex - 1],
      });
    } else {
      // Wrap to last season of previous year.
      setViewDate({
        ...viewDate,
        year: viewDate.year - 1,
        season: seasonIds[seasonIds.length - 1],
      });
    }
  };

  const handleNextSeason = () => {
    const seasonIds = config.seasons.map(s => s.id);
    const currentSeasonIndex = seasonIds.indexOf(viewDate.season);

    if (currentSeasonIndex < seasonIds.length - 1) {
      setViewDate({
        ...viewDate,
        season: seasonIds[currentSeasonIndex + 1],
      });
    } else {
      // Wrap to first season of next year.
      setViewDate({
        ...viewDate,
        year: viewDate.year + 1,
        season: seasonIds[0],
      });
    }
  };

  const getMoonPhaseEmoji = (phase: string) =>
    resolvePhase(phase, config)?.emoji ?? '🌙';

  const getSeasonEmoji = (season: string) =>
    resolveSeason(season, config)?.emoji ?? '📅';

  const viewSeasonName = viewSeason?.name ?? viewDate.season;

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
              {getSeasonEmoji(viewDate.season)} {viewSeasonName} {viewDate.year}
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
        <div
          className="bg-slate-700/50"
          style={{ display: 'grid', gridTemplateColumns: `repeat(${cyclesInView}, minmax(0, 1fr))` }}
        >
          {Array.from({ length: cyclesInView }, (_, i) => i + 1).map(cycle => (
            <div key={cycle} className="p-3 text-center border-r border-slate-600 last:border-r-0">
              <h3 className="font-semibold text-white">
                {cycleLabel(t, cycle)} Cycle
              </h3>
            </div>
          ))}
        </div>

        {/* Moon Phase Rows */}
        {config.phases.map((phase) => (
          <div key={phase.id} className="border-t border-slate-600">
            {/* Phase Header */}
            <div className="bg-slate-700/30 p-2 border-b border-slate-600">
              <h4 className="text-sm font-medium text-slate-300 flex items-center gap-2">
                {getMoonPhaseEmoji(phase.id)} {phase.name} ({phase.days} days)
              </h4>
            </div>

            {/* Days Grid */}
            <div
              style={{ display: 'grid', gridTemplateColumns: `repeat(${cyclesInView}, minmax(0, 1fr))` }}
            >
              {Array.from({ length: cyclesInView }, (_, i) => i + 1).map(cycle => (
                <div key={`${phase.id}-${cycle}`} className="border-r border-slate-600 last:border-r-0">
                  <div
                    className="min-h-[120px]"
                    style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.max(1, phase.days)}, minmax(0, 1fr))` }}
                  >
                    {Array.from({ length: phase.days }, (_, dayIndex) => {
                      const day = dayIndex + 1;
                      const date: ObojimaDate = {
                        year: viewDate.year,
                        season: viewDate.season,
                        cycle: cycle,
                        phase: phase.id,
                        day: day
                      };

                      const dayEvents = getEventsForDate(events, date, showDmOnly);
                      const isCurrentDate = isSameObojimaDate(date, currentDate);
                      const isToday = isSameObojimaDate(date, currentDate);

                      return (
                        <div
                          key={`${cycle}-${phase.id}-${day}`}
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

      {/* Cycle count hint for custom configs */}
      {cyclesInView !== 3 && (
        <p className="text-xs text-slate-500">
          {viewSeasonName} has {cyclesInView} cycle{cyclesInView === 1 ? '' : 's'} in this calendar.
        </p>
      )}

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

// Localized cycle label. Uses existing firstCycle/secondCycle/thirdCycle
// translation keys for 1–3, falls back to ordinal for custom configs with
// more cycles.
function cycleLabel(t: (key: string) => string, cycle: number): string {
  if (cycle === 1) return t('sessions.form.firstCycle');
  if (cycle === 2) return t('sessions.form.secondCycle');
  if (cycle === 3) return t('sessions.form.thirdCycle');
  return ordinal(cycle);
}

function ordinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}