'use client';

import { 
  SpecificDowntimeActivity,
  getActivityTypeDisplayName,
  getStatusColorClasses,
  calculateWeeksElapsed,
  calculatePhasesElapsed,
  calculateObojimaPhases,
  formatDowntimeDate,
  formatDowntimeObojimaDate
} from '@/data/downtime';
import { PlayerCharacter } from '@/data/characters';
import {
  CalendarDaysIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  PauseCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

interface DowntimeDashboardProps {
  activities: SpecificDowntimeActivity[];
  characters: PlayerCharacter[];
  currentGameDate: Date;
  onSelectActivity: (activity: SpecificDowntimeActivity) => void;
}

export default function DowntimeDashboard({
  activities,
  characters,
  currentGameDate,
  onSelectActivity
}: DowntimeDashboardProps) {
  // Group activities by character
  const activitiesByCharacter = characters.map(character => {
    const charActivities = activities.filter(a => a.characterId === character.id);
    const activeActivities = charActivities.filter(a => a.status === 'active');
    const completedActivities = charActivities.filter(a => a.status === 'completed');
    
    return {
      character,
      activities: charActivities,
      activeCount: activeActivities.length,
      completedCount: completedActivities.length
    };
  });

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return CheckCircleIcon;
      case 'completed': return CheckCircleIcon;
      case 'paused': return PauseCircleIcon;
      case 'failed': return XCircleIcon;
      default: return ExclamationCircleIcon;
    }
  };

  // Calculate progress for different activity types
  const getActivityProgress = (activity: SpecificDowntimeActivity): { label: string; value: string } => {
    const phasesElapsed = calculateObojimaPhases(activity.startDate, currentGameDate);

    switch (activity.type) {
      case 'sword_school':
        return {
          label: 'Master AC',
          value: `${activity.currentMasterAC}`
        };
      case 'witch_coven':
        return {
          label: 'Status',
          value: activity.status
        };
      case 'crafting':
        return {
          label: 'Progress',
          value: `${activity.progress}%`
        };
      case 'learning':
        return {
          label: 'Days Spent',
          value: `${activity.daysSpent}`
        };
      case 'gathering':
        return {
          label: 'Location',
          value: activity.location || 'Not set'
        };
      case 'carousing':
        return {
          label: 'Funds Spent',
          value: `${activity.fundsSpent} gp`
        };
      case 'faction_work':
        return {
          label: 'Faction',
          value: activity.factionName || 'Not set'
        };
    }
  };

  // Get upcoming events
  const getUpcomingEvents = () => {
    const events: Array<{ date: Date; description: string; activity: SpecificDowntimeActivity }> = [];

    activities.forEach(activity => {
      if (activity.type === 'sword_school' && activity.nextAttemptDate && activity.status === 'active') {
        events.push({
          date: activity.nextAttemptDate,
          description: `${activity.characterName} can attempt duel again`,
          activity
        });
      }

      // Add completion dates based on duration
      if (activity.status === 'active') {
        const completionDate = new Date(activity.startDate);
        completionDate.setDate(completionDate.getDate() + activity.duration);
        
        if (completionDate > currentGameDate) {
          events.push({
            date: completionDate,
            description: `${activity.characterName} completes ${getActivityTypeDisplayName(activity.type)}`,
            activity
          });
        }
      }
    });

    return events.sort((a, b) => a.date.getTime() - b.date.getTime()).slice(0, 5);
  };

  const upcomingEvents = getUpcomingEvents();

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-slate-400">Total Activities</h3>
            <CalendarDaysIcon className="h-5 w-5 text-slate-500" />
          </div>
          <p className="text-2xl font-bold text-white">{activities.length}</p>
        </div>

        <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-slate-400">Active</h3>
            <CheckCircleIcon className="h-5 w-5 text-green-500" />
          </div>
          <p className="text-2xl font-bold text-green-400">
            {activities.filter(a => a.status === 'active').length}
          </p>
        </div>

        <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-slate-400">Completed</h3>
            <CheckCircleIcon className="h-5 w-5 text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-blue-400">
            {activities.filter(a => a.status === 'completed').length}
          </p>
        </div>

        <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-slate-400">Characters</h3>
            <CalendarDaysIcon className="h-5 w-5 text-purple-500" />
          </div>
          <p className="text-2xl font-bold text-purple-400">{characters.length}</p>
        </div>
      </div>

      {/* Character Overview */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Character Activities</h2>
        <div className="space-y-4">
          {activitiesByCharacter.map(({ character, activities, activeCount, completedCount }) => (
            <div key={character.id} className="border-b border-slate-700 pb-4 last:border-0">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-white">{character.characterName}</h3>
                  <p className="text-sm text-slate-400">
                    {character.class} {character.level} • {activeCount} active, {completedCount} completed
                  </p>
                </div>
              </div>

              {activities.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {activities.map(activity => {
                    const progress = getActivityProgress(activity);
                    const StatusIcon = getStatusIcon(activity.status);
                    
                    return (
                      <div
                        key={activity.id}
                        onClick={() => onSelectActivity(activity)}
                        className="p-3 bg-slate-700/50 rounded-lg hover:bg-slate-700 cursor-pointer transition-colors"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium text-white text-sm">
                            {getActivityTypeDisplayName(activity.type)}
                          </h4>
                          <StatusIcon className={`h-4 w-4 ${
                            activity.status === 'active' ? 'text-green-400' :
                            activity.status === 'completed' ? 'text-blue-400' :
                            activity.status === 'paused' ? 'text-yellow-400' :
                            'text-red-400'
                          }`} />
                        </div>
                        <div className="space-y-1 text-xs">
                          <div className="flex justify-between text-slate-400">
                            <span>{progress.label}:</span>
                            <span className="text-slate-300">{progress.value}</span>
                          </div>
                          <div className="flex justify-between text-slate-400">
                            <span>Started:</span>
                            <span className="text-slate-300">
                              {formatDowntimeDate(activity.startDate)}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-slate-500 italic">No activities recorded</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Upcoming Events */}
      {upcomingEvents.length > 0 && (
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Upcoming Events</h2>
          <div className="space-y-3">
            {upcomingEvents.map((event, index) => (
              <div
                key={index}
                onClick={() => onSelectActivity(event.activity)}
                className="flex items-center gap-4 p-3 bg-slate-700/50 rounded-lg hover:bg-slate-700 cursor-pointer transition-colors"
              >
                <div className="flex-shrink-0">
                  <CalendarDaysIcon className="h-5 w-5 text-emerald-400" />
                </div>
                <div className="flex-1">
                  <p className="text-white">{event.description}</p>
                  <p className="text-sm text-slate-400">
                    {formatDowntimeDate(event.date)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}