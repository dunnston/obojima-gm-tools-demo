'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  CalendarEvent, 
  CalendarEventFormData, 
  createEmptyCalendarEvent,
  calendarEventToFormData,
  formDataToCalendarEvent
} from '@/data/calendarEvents';
import {
  ObojimaDate,
  resolvePhase,
  resolveSeason,
  formatObojimaDate
} from '@/data/obojimaCalendar';
import { useCalendarConfig } from '@/contexts/CalendarConfigContext';
import { Quest } from '@/data/quests';
import {
  XMarkIcon,
  MagnifyingGlassIcon,
  CalendarDaysIcon,
  MapPinIcon,
  DocumentTextIcon,
  BookOpenIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { syncService } from '@/services/sync';
import MentionTextarea from './MentionTextarea';

interface CalendarEventModalProps {
  event?: CalendarEvent;
  initialDate?: ObojimaDate;
  onSave: (eventData: Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
  onDelete?: () => void;
  isEditing?: boolean;
}

export default function CalendarEventModal({
  event,
  initialDate,
  onSave,
  onCancel,
  onDelete,
  isEditing = false
}: CalendarEventModalProps) {
  const { t } = useTranslation();
  const config = useCalendarConfig();
  const [formData, setFormData] = useState<CalendarEventFormData>(() => {
    if (event) {
      return calendarEventToFormData(event);
    }
    return createEmptyCalendarEvent(initialDate, config);
  });

  const selectedSeason = resolveSeason(formData.date.season, config);
  const maxCycles = selectedSeason?.cycles ?? 1;

  const [quests, setQuests] = useState<Quest[]>([]);
  const [questSearchTerm, setQuestSearchTerm] = useState('');
  const [showQuestSearch, setShowQuestSearch] = useState(false);
  const [loading, setLoading] = useState(false);

  // Load quests for search
  useEffect(() => {
    const loadQuests = async () => {
      try {
        const result = await syncService.getQuests();
        if (result.success && result.data) {
          setQuests(result.data);
        } else {
          console.warn('Failed to load quests:', result.error);
          setQuests([]);
        }
      } catch (error) {
        console.error('Error loading quests:', error);
        setQuests([]);
      }
    };

    loadQuests();
  }, []);

  const handleInputChange = (field: keyof CalendarEventFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleDateChange = (field: keyof ObojimaDate, value: any) => {
    setFormData(prev => {
      const nextDate = { ...prev.date, [field]: value } as ObojimaDate;
      // Clamp cycle and day to the new season/phase's max so we never save an
      // impossible date (e.g. cycle 3 in a 1-cycle season after a season switch,
      // or day 8 in a 5-day phase after a phase switch).
      if (field === 'season') {
        const newSeason = resolveSeason(String(value), config);
        if (newSeason && nextDate.cycle > newSeason.cycles) {
          nextDate.cycle = newSeason.cycles;
        }
      }
      if (field === 'phase') {
        const newPhase = resolvePhase(String(value), config);
        if (newPhase && nextDate.day > newPhase.days) {
          nextDate.day = newPhase.days;
        }
      }
      return { ...prev, date: nextDate };
    });
  };

  const handleQuestSelect = (quest: Quest) => {
    setFormData(prev => ({
      ...prev,
      questId: quest.id,
      questTitle: quest.title
    }));
    setShowQuestSearch(false);
    setQuestSearchTerm('');
  };

  const handleRemoveQuest = () => {
    setFormData(prev => ({
      ...prev,
      questId: undefined,
      questTitle: undefined
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      alert('Event title is required');
      return;
    }

    setLoading(true);
    try {
      const eventData = formDataToCalendarEvent(formData);
      await onSave(eventData);
    } catch (error) {
      console.error('Error saving event:', error);
      alert('Error saving event. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filteredQuests = Array.isArray(quests) ? quests.filter(quest =>
    quest.title.toLowerCase().includes(questSearchTerm.toLowerCase()) ||
    quest.description.toLowerCase().includes(questSearchTerm.toLowerCase())
  ) : [];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <CalendarDaysIcon className="h-6 w-6" />
            {isEditing ? 'Edit Event' : 'Create New Event'}
          </h2>
          <button
            onClick={onCancel}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Event Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-emerald-400"
              placeholder="Enter event title..."
              required
            />
          </div>

          {/* Date Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Event Date *
            </label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Year</label>
                <input
                  type="number"
                  min="1"
                  value={formData.date.year}
                  onChange={(e) => handleDateChange('year', parseInt(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-emerald-400"
                />
              </div>
              
              <div>
                <label className="block text-xs text-slate-400 mb-1">Season</label>
                <select
                  value={formData.date.season}
                  onChange={(e) => handleDateChange('season', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-emerald-400"
                >
                  {config.seasons.map(season => (
                    <option key={season.id} value={season.id}>{season.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Cycle</label>
                <select
                  value={formData.date.cycle}
                  onChange={(e) => handleDateChange('cycle', parseInt(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-emerald-400"
                >
                  {Array.from({ length: maxCycles }, (_, i) => i + 1).map(c => (
                    <option key={c} value={c}>{ordinalShort(c)}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Phase</label>
                <select
                  value={formData.date.phase}
                  onChange={(e) => handleDateChange('phase', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-emerald-400"
                >
                  {config.phases.map(phase => (
                    <option key={phase.id} value={phase.id}>{phase.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Day</label>
                <input
                  type="number"
                  min="1"
                  max={resolvePhase(formData.date.phase, config)?.days ?? 8}
                  value={formData.date.day}
                  onChange={(e) => handleDateChange('day', parseInt(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-emerald-400"
                />
              </div>
            </div>
            <p className="mt-2 text-sm text-slate-400">
              Selected: {formatObojimaDate(formData.date, config)}
            </p>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              <MapPinIcon className="h-4 w-4 inline mr-1" />
              Location
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-emerald-400"
              placeholder="Where will this event take place?"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              <DocumentTextIcon className="h-4 w-4 inline mr-1" />
              Description
            </label>
            <MentionTextarea
              value={formData.description}
              onChange={(value) => handleInputChange('description', value)}
              rows={4}
              className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-emerald-400 resize-none"
              placeholder="Describe what happens during this event..."
            />
          </div>

          {/* Quest Linking */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              <BookOpenIcon className="h-4 w-4 inline mr-1" />
              Linked Quest
            </label>
            
            {formData.questId ? (
              <div className="flex items-center justify-between p-3 bg-slate-700/50 border border-slate-600 rounded-lg">
                <div>
                  <p className="text-white font-medium">{formData.questTitle}</p>
                  <p className="text-sm text-slate-400">Quest linked to this event</p>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveQuest}
                  className="text-red-400 hover:text-red-300 text-sm"
                >
                  Remove
                </button>
              </div>
            ) : (
              <div className="relative">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={questSearchTerm}
                    onChange={(e) => setQuestSearchTerm(e.target.value)}
                    onFocus={() => setShowQuestSearch(true)}
                    className="flex-1 px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-emerald-400"
                    placeholder="Search for a quest to link..."
                  />
                  <button
                    type="button"
                    onClick={() => setShowQuestSearch(!showQuestSearch)}
                    className="px-3 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition-colors"
                  >
                    <MagnifyingGlassIcon className="h-4 w-4" />
                  </button>
                </div>

                {/* Quest Search Results */}
                {showQuestSearch && (
                  <div className="absolute top-full left-0 right-0 mt-1 max-h-40 bg-slate-800 border border-slate-600 rounded-lg overflow-y-auto z-10">
                    {filteredQuests.length > 0 ? (
                      filteredQuests.map(quest => (
                        <button
                          key={quest.id}
                          type="button"
                          onClick={() => handleQuestSelect(quest)}
                          className="w-full p-3 text-left hover:bg-slate-700 transition-colors border-b border-slate-600 last:border-b-0"
                        >
                          <p className="text-white font-medium">{quest.title}</p>
                          <p className="text-sm text-slate-400 truncate">{quest.description}</p>
                        </button>
                      ))
                    ) : (
                      <div className="p-3 text-slate-400 text-sm">
                        No quests found. {questSearchTerm && `Try searching for "${questSearchTerm}"`}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* DM Only Checkbox */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="isDmOnly"
              checked={formData.isDmOnly}
              onChange={(e) => handleInputChange('isDmOnly', e.target.checked)}
              className="w-4 h-4 text-amber-600 bg-slate-700 border-slate-600 rounded focus:ring-amber-500 focus:ring-2"
            />
            <label htmlFor="isDmOnly" className="text-sm text-slate-300 flex items-center gap-2">
              <ExclamationTriangleIcon className="h-4 w-4 text-amber-400" />
              DM Only Event (hidden from players when toggle is off)
            </label>
          </div>

          {/* Form Actions */}
          <div className="flex justify-between pt-4 border-t border-slate-700">
            <div>
              {isEditing && onDelete && (
                <button
                  type="button"
                  onClick={onDelete}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                >
                  Delete Event
                </button>
              )}
            </div>
            
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onCancel}
                className="px-6 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !formData.title.trim()}
                className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
              >
                {loading ? 'Saving...' : (isEditing ? 'Update Event' : 'Create Event')}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

function ordinalShort(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}