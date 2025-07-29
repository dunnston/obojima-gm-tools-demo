'use client';

import { useState, useEffect } from 'react';
import { 
  SpecificDowntimeActivity,
  DowntimeActivityType,
  createEmptyDowntimeActivity,
  getActivityTypeDisplayName,
  calculateWeeksElapsed,
  calculatePhasesElapsed,
  calculateObojimaPhases,
  formatDowntimeDate,
  formatDowntimeObojimaDate
} from '@/data/downtime';
import { PlayerCharacter } from '@/data/characters';
import { ObojimaDate, formatObojimaDate, obojimaDateToJSDate } from '@/data/obojimaCalendar';
import {
  CalendarDaysIcon,
  UserGroupIcon,
  PlusIcon,
  ClockIcon,
  AcademicCapIcon,
  SparklesIcon,
  WrenchIcon,
  MapIcon,
  MusicalNoteIcon,
  BookOpenIcon,
  BuildingOfficeIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import DowntimeDashboard from './DowntimeDashboard';
import DowntimeActivityForm from './DowntimeActivityForm';
import SwordSchoolTracker from './downtime/SwordSchoolTracker';
import WitchCovenTracker from './downtime/WitchCovenTracker';
import CraftingTracker from './downtime/CraftingTracker';
import GatheringTracker from './downtime/GatheringTracker';
import CarousingTracker from './downtime/CarousingTracker';
import LearningTracker from './downtime/LearningTracker';
import FactionWorkTracker from './downtime/FactionWorkTracker';

interface DowntimeTrackerProps {
  currentObojimaDate: ObojimaDate;
}

export default function DowntimeTracker({ currentObojimaDate }: DowntimeTrackerProps) {
  const [activities, setActivities] = useState<SpecificDowntimeActivity[]>([]);
  const [characters, setCharacters] = useState<PlayerCharacter[]>([]);
  const [selectedView, setSelectedView] = useState<'dashboard' | 'activities'>('dashboard');
  const [selectedActivity, setSelectedActivity] = useState<SpecificDowntimeActivity | null>(null);
  const [showNewActivityForm, setShowNewActivityForm] = useState(false);
  const [filterCharacter, setFilterCharacter] = useState<string>('all');
  const [filterType, setFilterType] = useState<DowntimeActivityType | 'all'>('all');
  // Convert Obojima date to JS date for compatibility with existing downtime calculation functions
  const currentGameDate = obojimaDateToJSDate(currentObojimaDate);

  // Load data on mount
  useEffect(() => {
    const savedActivities = localStorage.getItem('obojima-downtime-activities');
    if (savedActivities) {
      const parsed = JSON.parse(savedActivities);
      const activitiesWithDates = parsed.map((activity: any) => {
        // Migrate old property names to new ones
        const migratedActivity = { ...activity };
        
        // Migrate sword school properties
        if (activity.type === 'sword_school' && activity.totalWeeksTrained !== undefined && activity.totalPhasesTrained === undefined) {
          migratedActivity.totalPhasesTrained = activity.totalWeeksTrained;
        }
        
        // Migrate witch coven properties
        if (activity.type === 'witch_coven' && activity.weeksStudied !== undefined && activity.phasesStudied === undefined) {
          migratedActivity.phasesStudied = activity.weeksStudied;
        }
        
        return {
          ...migratedActivity,
          startDate: new Date(activity.startDate),
          created_at: new Date(activity.created_at),
          updated_at: new Date(activity.updated_at),
          nextAttemptDate: activity.nextAttemptDate ? new Date(activity.nextAttemptDate) : undefined
        };
      });
      setActivities(activitiesWithDates);
    }

    const savedCharacters = localStorage.getItem('obojima-characters');
    if (savedCharacters) {
      const parsed = JSON.parse(savedCharacters);
      const charactersWithDates = parsed.map((char: any) => ({
        ...char,
        createdAt: new Date(char.createdAt),
        updatedAt: new Date(char.updatedAt)
      }));
      setCharacters(charactersWithDates);
    }

    // Game date is now managed by the parent component via Obojima calendar
  }, []);

  // Save activities whenever they change
  useEffect(() => {
    if (activities.length > 0) {
      localStorage.setItem('obojima-downtime-activities', JSON.stringify(activities));
    }
  }, [activities]);

  // Game date is now managed by the parent component via Obojima calendar

  const handleCreateActivity = (type: DowntimeActivityType, characterId: string) => {
    const character = characters.find(c => c.id === characterId);
    if (!character) return;

    const newActivity = createEmptyDowntimeActivity(type, characterId, character.characterName);
    // Override the start date with current game date
    newActivity.startDate = currentGameDate;
    setActivities([...activities, newActivity]);
    setSelectedActivity(newActivity);
    setShowNewActivityForm(false);
  };

  const handleUpdateActivity = (activityId: string, updates: Partial<SpecificDowntimeActivity>) => {
    setActivities(prev => prev.map(activity => 
      activity.id === activityId 
        ? { ...activity, ...updates, updated_at: new Date() } as SpecificDowntimeActivity
        : activity
    ));

    // Also update selectedActivity if it's the one being updated
    if (selectedActivity && selectedActivity.id === activityId) {
      setSelectedActivity(prev => prev ? { ...prev, ...updates, updated_at: new Date() } as SpecificDowntimeActivity : null);
    }
  };

  const handleDeleteActivity = (activityId: string) => {
    if (confirm('Are you sure you want to delete this downtime activity?')) {
      setActivities(prev => prev.filter(activity => activity.id !== activityId));
      setSelectedActivity(null);
    }
  };

  const getActivityIcon = (type: DowntimeActivityType) => {
    const icons: Record<DowntimeActivityType, any> = {
      sword_school: AcademicCapIcon,
      witch_coven: SparklesIcon,
      crafting: WrenchIcon,
      gathering: MapIcon,
      carousing: MusicalNoteIcon,
      learning: BookOpenIcon,
      faction_work: BuildingOfficeIcon
    };
    return icons[type];
  };

  const getActivityComponent = (activity: SpecificDowntimeActivity) => {
    switch (activity.type) {
      case 'sword_school':
        return (
          <SwordSchoolTracker
            activity={activity}
            currentGameDate={currentGameDate}
            onUpdate={(updates) => handleUpdateActivity(activity.id, updates)}
            onDelete={() => handleDeleteActivity(activity.id)}
          />
        );
      case 'witch_coven':
        return (
          <WitchCovenTracker
            activity={activity}
            currentGameDate={currentGameDate}
            onUpdate={(updates) => handleUpdateActivity(activity.id, updates)}
            onDelete={() => handleDeleteActivity(activity.id)}
          />
        );
      case 'crafting':
        return (
          <CraftingTracker
            activity={activity}
            currentGameDate={currentGameDate}
            onUpdate={(updates) => handleUpdateActivity(activity.id, updates)}
            onDelete={() => handleDeleteActivity(activity.id)}
          />
        );
      case 'gathering':
        return (
          <GatheringTracker
            activity={activity}
            currentGameDate={currentGameDate}
            onUpdate={(updates) => handleUpdateActivity(activity.id, updates)}
            onDelete={() => handleDeleteActivity(activity.id)}
          />
        );
      case 'carousing':
        return (
          <CarousingTracker
            activity={activity}
            currentGameDate={currentGameDate}
            onUpdate={(updates) => handleUpdateActivity(activity.id, updates)}
            onDelete={() => handleDeleteActivity(activity.id)}
          />
        );
      case 'learning':
        return (
          <LearningTracker
            activity={activity}
            currentGameDate={currentGameDate}
            onUpdate={(updates) => handleUpdateActivity(activity.id, updates)}
            onDelete={() => handleDeleteActivity(activity.id)}
          />
        );
      case 'faction_work':
        return (
          <FactionWorkTracker
            activity={activity}
            currentGameDate={currentGameDate}
            onUpdate={(updates) => handleUpdateActivity(activity.id, updates)}
            onDelete={() => handleDeleteActivity(activity.id)}
          />
        );
    }
  };

  const filteredActivities = activities.filter(activity => {
    if (filterCharacter !== 'all' && activity.characterId !== filterCharacter) return false;
    if (filterType !== 'all' && activity.type !== filterType) return false;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Downtime Tracker</h1>
            <p className="text-slate-400">Manage character downtime activities between sessions</p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                if (confirm('Are you sure you want to clear ALL downtime activities? This cannot be undone.')) {
                  localStorage.removeItem('obojima-downtime-activities');
                  setActivities([]);
                  setSelectedActivity(null);
                }
              }}
              className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition-colors"
            >
              Clear All Data
            </button>
            <div className="text-right">
              <p className="text-sm text-slate-400">Current Game Date</p>
              <div className="px-3 py-1 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm">
                {formatObojimaDate(currentObojimaDate)}
              </div>
              <p className="text-xs text-slate-500 mt-1">Use Calendar to change date</p>
            </div>
            <button
              onClick={() => setShowNewActivityForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
            >
              <PlusIcon className="h-5 w-5" />
              New Activity
            </button>
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex gap-2">
          <button
            onClick={() => setSelectedView('dashboard')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedView === 'dashboard'
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            <ChartBarIcon className="h-5 w-5 inline mr-2" />
            Dashboard
          </button>
          <button
            onClick={() => setSelectedView('activities')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedView === 'activities'
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            <CalendarDaysIcon className="h-5 w-5 inline mr-2" />
            Activities
          </button>
        </div>
      </div>

      {/* Dashboard View */}
      {selectedView === 'dashboard' && (
        <DowntimeDashboard
          activities={activities}
          characters={characters}
          currentGameDate={currentGameDate}
          onSelectActivity={setSelectedActivity}
        />
      )}

      {/* Activities View */}
      {selectedView === 'activities' && !selectedActivity && (
        <div className="space-y-6">
          {/* Filters */}
          <div className="flex gap-4 p-4 bg-slate-800/50 rounded-lg border border-slate-700">
            <select
              value={filterCharacter}
              onChange={(e) => setFilterCharacter(e.target.value)}
              className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
            >
              <option value="all">All Characters</option>
              {characters.map(char => (
                <option key={char.id} value={char.id}>
                  {char.characterName}
                </option>
              ))}
            </select>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as DowntimeActivityType | 'all')}
              className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
            >
              <option value="all">All Activities</option>
              <option value="sword_school">Sword School</option>
              <option value="witch_coven">Witch Coven</option>
              <option value="crafting">Crafting</option>
              <option value="gathering">Gathering</option>
              <option value="carousing">Carousing</option>
              <option value="learning">Learning</option>
              <option value="faction_work">Faction Work</option>
            </select>
          </div>

          {/* Activities List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredActivities.map(activity => {
              const Icon = getActivityIcon(activity.type);
              const phasesElapsed = calculateObojimaPhases(activity.startDate, currentGameDate);
              
              return (
                <div
                  key={activity.id}
                  onClick={() => setSelectedActivity(activity)}
                  className="p-4 bg-slate-800/50 border border-slate-700 rounded-lg hover:border-emerald-400 cursor-pointer transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-slate-700 rounded-lg">
                        <Icon className="h-5 w-5 text-emerald-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">
                          {activity.characterName}
                        </h3>
                        <p className="text-sm text-slate-400">
                          {getActivityTypeDisplayName(activity.type)}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center gap-2 text-slate-300">
                      <CalendarDaysIcon className="h-4 w-4" />
                      Started {formatDowntimeObojimaDate(activity.startDate)}
                    </div>
                    <div className="flex items-center gap-2 text-slate-300">
                      <ClockIcon className="h-4 w-4" />
                      {phasesElapsed} phases elapsed
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredActivities.length === 0 && (
            <div className="text-center py-12">
              <CalendarDaysIcon className="h-16 w-16 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">No downtime activities found</p>
            </div>
          )}
        </div>
      )}

      {/* Activity Detail View */}
      {selectedActivity && (
        <div>
          <button
            onClick={() => setSelectedActivity(null)}
            className="mb-4 text-slate-400 hover:text-white transition-colors"
          >
            ← Back to Activities
          </button>
          {getActivityComponent(selectedActivity)}
        </div>
      )}

      {/* New Activity Form */}
      {showNewActivityForm && (
        <DowntimeActivityForm
          characters={characters}
          onCreate={handleCreateActivity}
          onClose={() => setShowNewActivityForm(false)}
        />
      )}
    </div>
  );
}