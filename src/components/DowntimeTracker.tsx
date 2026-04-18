'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
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
import { syncService } from '@/services/sync';
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
  ChartBarIcon,
  ArrowPathIcon
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
  const { t } = useTranslation();
  const [activities, setActivities] = useState<SpecificDowntimeActivity[]>([]);
  const [characters, setCharacters] = useState<PlayerCharacter[]>([]);
  const [selectedView, setSelectedView] = useState<'dashboard' | 'activities'>('dashboard');
  const [selectedActivity, setSelectedActivity] = useState<SpecificDowntimeActivity | null>(null);
  const [showNewActivityForm, setShowNewActivityForm] = useState(false);
  const [filterCharacter, setFilterCharacter] = useState<string>('all');
  const [filterType, setFilterType] = useState<DowntimeActivityType | 'all'>('all');
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'error'>('idle');
  // Convert Obojima date to JS date for compatibility with existing downtime calculation functions
  const currentGameDate = obojimaDateToJSDate(currentObojimaDate);

  // Validator for downtime activity data
  const validateDowntimeActivity = (activity: any): SpecificDowntimeActivity => {
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
  };

  // Validator for character data
  const validateCharacter = (char: any): PlayerCharacter => ({
    ...char,
    createdAt: new Date(char.createdAt),
    updatedAt: new Date(char.updatedAt)
  });

  // Load all data with sync
  const loadAllData = async () => {
    setSyncStatus('syncing');
    try {
      // Load activities and characters in parallel
      const [activityData, characterData] = await Promise.all([
        syncService.syncWithFallback('downtime', 'obojima-downtime-activities', validateDowntimeActivity),
        syncService.syncWithFallback('characters', 'obojima-characters', validateCharacter)
      ]);

      setActivities(activityData);
      setCharacters(characterData);
      setSyncStatus('idle');
    } catch (error) {
      console.error('Error loading downtime data:', error);
      setSyncStatus('error');
    }
  };

  // Load data on mount
  useEffect(() => {
    loadAllData();
    
    // Note: Auto-sync disabled to prevent conflicts with other components
    // Users can manually refresh using the refresh button
  }, []);

  // Save individual activity with sync
  const saveActivity = async (activity: SpecificDowntimeActivity) => {
    try {
      await syncService.saveDowntimeActivity(activity);

      setActivities(prev => {
        const updatedActivities = prev.map(a => a.id === activity.id ? activity : a);
        return updatedActivities.some(a => a.id === activity.id)
          ? updatedActivities
          : [...prev, activity];
      });
    } catch (error) {
      console.error('Error saving downtime activity:', error);
      alert(t('downtime.errorSaving'));
    }
  };

  // Save activities with sync (for bulk operations)
  const saveActivities = async (updatedActivities: SpecificDowntimeActivity[]) => {
    try {
      for (const activity of updatedActivities) {
        await syncService.saveDowntimeActivity(activity);
      }

      setActivities(updatedActivities);
    } catch (error) {
      console.error('Error saving downtime activities:', error);
      alert(t('downtime.errorSaving'));
    }
  };

  const handleCreateActivity = async (type: DowntimeActivityType, characterId: string) => {
    const character = characters.find(c => c.id === characterId);
    if (!character) return;

    const newActivity = createEmptyDowntimeActivity(type, characterId, character.characterName);
    // Override the start date with current game date
    newActivity.startDate = currentGameDate;
    await saveActivity(newActivity);
    setSelectedActivity(newActivity);
    setShowNewActivityForm(false);
  };

  const handleUpdateActivity = async (activityId: string, updates: Partial<SpecificDowntimeActivity>) => {
    const activity = activities.find(a => a.id === activityId);
    if (!activity) return;

    const updatedActivity = { ...activity, ...updates, updated_at: new Date() } as SpecificDowntimeActivity;
    await saveActivity(updatedActivity);

    // Also update selectedActivity if it's the one being updated
    if (selectedActivity && selectedActivity.id === activityId) {
      setSelectedActivity(updatedActivity);
    }
  };

  const handleDeleteActivity = async (activityId: string) => {
    if (confirm(t('downtime.confirmDelete'))) {
      try {
        await syncService.deleteDowntimeActivity(activityId);

        const updatedActivities = activities.filter(activity => activity.id !== activityId);
        setActivities(updatedActivities);

        setSelectedActivity(null);
      } catch (error) {
        console.error('Error deleting downtime activity:', error);
        alert(t('downtime.errorDeleting'));
      }
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
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-white mb-2">{t('downtime.title')}</h1>
              {/* Minimal sync status indicator */}
              {syncStatus === 'syncing' && (
                <ArrowPathIcon className="h-5 w-5 text-blue-400 animate-spin" />
              )}
              {syncStatus === 'error' && (
                <span className="text-xs text-amber-400">{t('downtime.offline')}</span>
              )}
            </div>
            <p className="text-slate-400">{t('downtime.subtitle')}</p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={loadAllData}
              className="p-2 text-slate-400 hover:text-white transition-colors"
              title={t('downtime.refresh')}
            >
              <ArrowPathIcon className="h-5 w-5" />
            </button>
            <button
              onClick={async () => {
                if (confirm(t('downtime.confirmClearAll'))) {
                  await saveActivities([]);
                  setSelectedActivity(null);
                }
              }}
              className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition-colors"
            >
              {t('downtime.clearAllData')}
            </button>
            <div className="text-right">
              <p className="text-sm text-slate-400">{t('downtime.currentGameDate')}</p>
              <div className="px-3 py-1 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm">
                {formatObojimaDate(currentObojimaDate)}
              </div>
              <p className="text-xs text-slate-500 mt-1">{t('downtime.useCalendarToChange')}</p>
            </div>
            <button
              onClick={() => setShowNewActivityForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
            >
              <PlusIcon className="h-5 w-5" />
              {t('downtime.newActivity')}
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
            {t('downtime.dashboard')}
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
            {t('downtime.activities')}
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
              <option value="all">{t('downtime.allCharacters')}</option>
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
              <option value="all">{t('downtime.allActivities')}</option>
              <option value="sword_school">{t('downtime.activityTypes.sword_school')}</option>
              <option value="witch_coven">{t('downtime.activityTypes.witch_coven')}</option>
              <option value="crafting">{t('downtime.activityTypes.crafting')}</option>
              <option value="gathering">{t('downtime.activityTypes.gathering')}</option>
              <option value="carousing">{t('downtime.activityTypes.carousing')}</option>
              <option value="learning">{t('downtime.activityTypes.learning')}</option>
              <option value="faction_work">{t('downtime.activityTypes.faction_work')}</option>
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
                      {t('downtime.started')} {formatDowntimeObojimaDate(activity.startDate)}
                    </div>
                    <div className="flex items-center gap-2 text-slate-300">
                      <ClockIcon className="h-4 w-4" />
                      {phasesElapsed} {t('downtime.phasesElapsed')}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredActivities.length === 0 && (
            <div className="text-center py-12">
              <CalendarDaysIcon className="h-16 w-16 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">{t('downtime.noActivitiesFound')}</p>
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
            {t('downtime.backToActivities')}
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