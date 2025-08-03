'use client';

import { useState, useEffect } from 'react';
import { 
  ObojimaDate, 
  Season, 
  MoonPhase,
  SEASONS,
  MOON_PHASES,
  DAYS_PER_YEAR,
  formatObojimaDate,
  formatObojimaDateShort,
  addDaysToObojimaDate,
  subtractDaysFromObojimaDate,
  getCurrentObojimaDate
} from '@/data/obojimaCalendar';
import {
  CalendarDaysIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ClockIcon,
  SunIcon,
  CloudIcon,
  SparklesIcon,
  CloudIcon as SnowflakeIcon,
  PlusIcon,
  MinusIcon,
  ForwardIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

interface ObojimaCalendarProps {
  currentDate: ObojimaDate;
  onDateChange: (date: ObojimaDate) => void;
  onRefresh?: () => void;
  syncStatus?: 'idle' | 'syncing' | 'error';
}

export default function ObojimaCalendar({ currentDate, onDateChange, onRefresh, syncStatus = 'idle' }: ObojimaCalendarProps) {
  const [showTimeAdvancement, setShowTimeAdvancement] = useState(false);
  const [daysToAdvance, setDaysToAdvance] = useState(1);

  // Helper function to get days in current phase
  const getDaysInCurrentPhase = () => {
    switch (currentDate.phase) {
      case 'New Moon':
      case 'Full Moon':
        return 8;
      case 'Waxing Moon':
      case 'Waning Moon':
        return 7;
      default:
        return 8;
    }
  };

  // Helper function to get days remaining in current phase
  const getDaysRemainingInPhase = () => {
    return getDaysInCurrentPhase() - currentDate.day;
  };

  // Helper function to get days to advance to next phase
  const getDaysToNextPhase = () => {
    return getDaysRemainingInPhase() + 1;
  };

  // Helper function to get days remaining in current season
  const getDaysRemainingInSeason = () => {
    const currentPhaseIndex = MOON_PHASES.findIndex(p => p.name === currentDate.phase);
    const currentCycle = currentDate.cycle || 1;
    
    let remainingDays = getDaysRemainingInPhase();
    
    // Add remaining phases in current cycle
    for (let i = currentPhaseIndex + 1; i < MOON_PHASES.length; i++) {
      remainingDays += MOON_PHASES[i].days;
    }
    
    // Add complete remaining cycles
    const remainingCycles = 3 - currentCycle;
    remainingDays += remainingCycles * 30; // Each cycle is 30 days
    
    return remainingDays;
  };

  // Helper function to get days to advance to next season
  const getDaysToNextSeason = () => {
    return getDaysRemainingInSeason() + 1;
  };

  const getSeasonIcon = (season: Season) => {
    switch (season) {
      case 'Spring': return SunIcon;
      case 'Summer': return SunIcon;
      case 'Autumn': return CloudIcon;
      case 'Winter': return SnowflakeIcon;
      default: return CalendarDaysIcon;
    }
  };

  const getSeasonColor = (season: Season) => {
    switch (season) {
      case 'Spring': return 'text-green-400';
      case 'Summer': return 'text-yellow-400';
      case 'Autumn': return 'text-orange-400';
      case 'Winter': return 'text-blue-400';
      default: return 'text-slate-400';
    }
  };

  const getMoonPhaseEmoji = (phase: MoonPhase) => {
    switch (phase) {
      case 'New Moon': return '🌑';
      case 'Waxing Moon': return '🌓';
      case 'Full Moon': return '🌕';
      case 'Waning Moon': return '🌗';
      default: return '🌙';
    }
  };

  const handlePreviousDay = () => {
    const newDate = subtractDaysFromObojimaDate(currentDate, 1);
    onDateChange(newDate);
  };

  const handleNextDay = () => {
    const newDate = addDaysToObojimaDate(currentDate, 1);
    onDateChange(newDate);
  };

  const handleAdvanceTime = () => {
    if (daysToAdvance > 0) {
      const newDate = addDaysToObojimaDate(currentDate, daysToAdvance);
      onDateChange(newDate);
      setShowTimeAdvancement(false);
      setDaysToAdvance(1);
    }
  };

  const currentSeason = SEASONS.find(s => s.name === currentDate.season);
  const currentPhase = MOON_PHASES.find(p => p.name === currentDate.phase);
  const SeasonIcon = getSeasonIcon(currentDate.season);

  return (
    <div className="max-w-4xl space-y-6">
      {/* Current Date Display */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-lg ${getSeasonColor(currentDate.season).replace('text-', 'bg-').replace('-400', '-500/20')}`}>
              <SeasonIcon className={`h-8 w-8 ${getSeasonColor(currentDate.season)}`} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold text-white">Obojima Calendar</h2>
                {/* Sync status indicator */}
                {syncStatus === 'syncing' && (
                  <ArrowPathIcon className="h-4 w-4 text-blue-400 animate-spin" />
                )}
                {syncStatus === 'error' && (
                  <span className="text-xs text-amber-400">Offline</span>
                )}
              </div>
              <p className="text-slate-400">
                Current Date{syncStatus === 'syncing' ? ' (syncing...)' : ''}
                <span className="text-xs text-slate-500 ml-2">• Auto-sync every 30min</span>
              </p>
            </div>
          </div>
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="p-2 text-slate-400 hover:text-white transition-colors"
              title="Refresh Calendar Data"
            >
              <ArrowPathIcon className="h-5 w-5" />
            </button>
          )}
        </div>

        <div className="text-center space-y-2">
          <div className="text-3xl font-bold text-white">
            {formatObojimaDate(currentDate)}
          </div>
          <div className="text-lg text-slate-300">
            {getMoonPhaseEmoji(currentDate.phase)} {currentDate.phase}
          </div>
        </div>
      </div>

      {/* Date Navigation */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Date Navigation</h3>
        
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={handlePreviousDay}
            className="flex items-center gap-2 px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition-colors"
          >
            <ChevronLeftIcon className="h-4 w-4" />
            Previous Day
          </button>
          
          <div className="text-center">
            <div className="text-sm text-slate-400">Quick Navigation</div>
            <div className="text-lg font-semibold text-white">
              {formatObojimaDateShort(currentDate)}
            </div>
          </div>
          
          <button
            onClick={handleNextDay}
            className="flex items-center gap-2 px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition-colors"
          >
            Next Day
            <ChevronRightIcon className="h-4 w-4" />
          </button>
        </div>

        <button
          onClick={() => setShowTimeAdvancement(true)}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
        >
          <ForwardIcon className="h-5 w-5" />
          Advance Time Between Sessions
        </button>
      </div>

      {/* Season & Phase Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Current Season */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <SeasonIcon className={`h-6 w-6 ${getSeasonColor(currentDate.season)}`} />
            <h3 className="text-lg font-semibold text-white">{currentDate.season}</h3>
          </div>
          <p className="text-slate-300 mb-4">{currentSeason?.description}</p>
          
          <div className="space-y-2">
            <div className="text-sm text-slate-400">Season Progress</div>
            <div className="space-y-1">
              {MOON_PHASES.map((phase, index) => {
                const isCurrent = phase.name === currentDate.phase;
                const isPast = MOON_PHASES.indexOf(currentPhase!) > index;
                return (
                  <div
                    key={phase.name}
                    className={`flex items-center justify-between p-2 rounded ${
                      isCurrent 
                        ? 'bg-blue-500/20 border border-blue-400/50' 
                        : isPast 
                        ? 'bg-green-500/10' 
                        : 'bg-slate-700/30'
                    }`}
                  >
                    <span className={`text-sm ${isCurrent ? 'text-blue-300 font-semibold' : isPast ? 'text-green-400' : 'text-slate-400'}`}>
                      {getMoonPhaseEmoji(phase.name)} {phase.name}
                    </span>
                    <span className="text-xs text-slate-500">
                      {phase.days} days
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Current Moon Phase */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="text-2xl">{getMoonPhaseEmoji(currentDate.phase)}</div>
            <h3 className="text-lg font-semibold text-white">{currentDate.phase}</h3>
          </div>
          <p className="text-slate-300 mb-4">{currentPhase?.description}</p>
          
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-slate-400">Phase Progress</span>
                <span className="text-sm text-slate-300">
                  Day {currentDate.day} of {currentPhase?.days}
                </span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all"
                  style={{ width: `${((currentDate.day) / (currentPhase?.days || 1)) * 100}%` }}
                />
              </div>
            </div>
            
            <div className="text-xs text-slate-500">
              {(currentPhase?.days || 0) - currentDate.day} days remaining in this phase
            </div>
          </div>
        </div>
      </div>

      {/* Year Overview */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Year {currentDate.year} Overview</h3>
        
        <div className="grid grid-cols-4 gap-4">
          {SEASONS.map((season) => {
            const isCurrent = season.name === currentDate.season;
            const SeasonIcon = getSeasonIcon(season.name);
            return (
              <div
                key={season.name}
                className={`text-center p-4 rounded-lg ${
                  isCurrent ? 'bg-blue-500/20 border border-blue-400/50' : 'bg-slate-700/30'
                }`}
              >
                <SeasonIcon className={`h-8 w-8 mx-auto mb-2 ${
                  isCurrent ? 'text-blue-400' : getSeasonColor(season.name)
                }`} />
                <div className={`font-semibold ${isCurrent ? 'text-blue-300' : 'text-white'}`}>
                  {season.name}
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  {season.totalDays} days
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Time Advancement Modal */}
      {showTimeAdvancement && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 border border-slate-600 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-white mb-4">Advance Time Between Sessions</h3>
            
            <div className="mb-6">
              <div className="text-center mb-4">
                <ClockIcon className="h-12 w-12 text-blue-400 mx-auto mb-2" />
                <p className="text-slate-300">
                  How many days would you like to advance?
                </p>
                <div className="text-xs text-slate-400 bg-slate-700/50 rounded p-2 mt-2">
                  Current: {currentDate.day}/{getDaysInCurrentPhase()} days in {currentDate.phase}<br/>
                  {getDaysRemainingInPhase()} days left in current phase
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Days to Advance
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setDaysToAdvance(Math.max(1, daysToAdvance - 1))}
                      className="p-2 bg-slate-600 hover:bg-slate-700 text-white rounded transition-colors"
                    >
                      <MinusIcon className="h-4 w-4" />
                    </button>
                    <input
                      type="number"
                      min="1"
                      max="365"
                      value={daysToAdvance}
                      onChange={(e) => setDaysToAdvance(Math.max(1, parseInt(e.target.value) || 1))}
                      className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-center"
                    />
                    <button
                      onClick={() => setDaysToAdvance(daysToAdvance + 1)}
                      className="p-2 bg-slate-600 hover:bg-slate-700 text-white rounded transition-colors"
                    >
                      <PlusIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="text-sm text-slate-400 text-center">
                  New date will be: <br />
                  <span className="text-white font-medium">
                    {formatObojimaDate(addDaysToObojimaDate(currentDate, daysToAdvance))}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setDaysToAdvance(getDaysToNextPhase())}
                    className="px-2 py-2 bg-slate-600 hover:bg-slate-700 text-white text-xs rounded transition-colors"
                    title={`${getDaysToNextPhase()} days to next phase`}
                  >
                    1 Phase<br/>({getDaysToNextPhase()}d)
                  </button>
                  <button
                    onClick={() => setDaysToAdvance(getDaysToNextSeason())}
                    className="px-2 py-2 bg-slate-600 hover:bg-slate-700 text-white text-xs rounded transition-colors"
                    title={`${getDaysToNextSeason()} days to next season`}
                  >
                    1 Season<br/>({getDaysToNextSeason()}d)
                  </button>
                  <button
                    onClick={() => setDaysToAdvance(DAYS_PER_YEAR)}
                    className="px-2 py-2 bg-slate-600 hover:bg-slate-700 text-white text-xs rounded transition-colors"
                    title={`${DAYS_PER_YEAR} days (1 full year)`}
                  >
                    1 Year<br/>({DAYS_PER_YEAR}d)
                  </button>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleAdvanceTime}
                disabled={daysToAdvance < 1}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
              >
                Advance Time
              </button>
              <button
                onClick={() => setShowTimeAdvancement(false)}
                className="px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}