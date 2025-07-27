'use client';

import { useState } from 'react';
import { 
  WitchCovenActivity,
  CovenStatus,
  calculateWeeksElapsed,
  covenNames
} from '@/data/downtime';
import {
  CalendarDaysIcon,
  SparklesIcon,
  AcademicCapIcon,
  GiftIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  TrashIcon,
  CheckIcon,
  XMarkIcon,
  ShieldExclamationIcon
} from '@heroicons/react/24/outline';

interface WitchCovenTrackerProps {
  activity: WitchCovenActivity;
  currentGameDate: Date;
  onUpdate: (updates: Partial<WitchCovenActivity>) => void;
  onDelete: () => void;
}

export default function WitchCovenTracker({
  activity,
  currentGameDate,
  onUpdate,
  onDelete
}: WitchCovenTrackerProps) {
  const [newResource, setNewResource] = useState('');
  const [newBoon, setNewBoon] = useState('');
  const [newQuest, setNewQuest] = useState('');
  const [newRivalry, setNewRivalry] = useState('');
  const [curseDescription, setCurseDescription] = useState(activity.covenCurse || '');

  // Calculate current progress
  const weeksElapsed = calculateWeeksElapsed(activity.startDate, currentGameDate);
  const totalWeeksStudied = activity.weeksStudied + weeksElapsed;

  const statusColors: Record<CovenStatus, string> = {
    apprentice: 'text-blue-400',
    member: 'text-emerald-400',
    oathbound: 'text-purple-400',
    rejected: 'text-red-400'
  };

  const handleAddWeekStudy = () => {
    onUpdate({
      weeksStudied: activity.weeksStudied + 1
    });
  };

  const handleStatusChange = (newStatus: CovenStatus) => {
    const updates: Partial<WitchCovenActivity> = { status: newStatus };
    
    if (newStatus === 'oathbound') {
      updates.oathTaken = true;
    } else if (newStatus === 'rejected') {
      updates.status = 'rejected';
      updates.accessToResources = [];
    }
    
    onUpdate(updates);
  };

  const handleBreachOath = () => {
    if (confirm('Are you sure? Breaking the oath will have consequences!')) {
      onUpdate({
        breachOfOath: true,
        status: 'rejected',
        accessToResources: []
      });
    }
  };

  const handleAddItem = (type: 'resource' | 'boon' | 'quest' | 'rivalry', value: string) => {
    if (!value.trim()) return;

    switch (type) {
      case 'resource':
        onUpdate({ accessToResources: [...activity.accessToResources, value] });
        setNewResource('');
        break;
      case 'boon':
        onUpdate({ covenBoons: [...activity.covenBoons, value] });
        setNewBoon('');
        break;
      case 'quest':
        onUpdate({ covenQuests: [...activity.covenQuests, value] });
        setNewQuest('');
        break;
      case 'rivalry':
        onUpdate({ rivalryEvents: [...activity.rivalryEvents, value] });
        setNewRivalry('');
        break;
    }
  };

  const handleRemoveItem = (type: 'resource' | 'boon' | 'quest' | 'rivalry', index: number) => {
    switch (type) {
      case 'resource':
        onUpdate({ 
          accessToResources: activity.accessToResources.filter((_, i) => i !== index) 
        });
        break;
      case 'boon':
        onUpdate({ 
          covenBoons: activity.covenBoons.filter((_, i) => i !== index) 
        });
        break;
      case 'quest':
        onUpdate({ 
          covenQuests: activity.covenQuests.filter((_, i) => i !== index) 
        });
        break;
      case 'rivalry':
        onUpdate({ 
          rivalryEvents: activity.rivalryEvents.filter((_, i) => i !== index) 
        });
        break;
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-500/20 rounded-lg">
              <SparklesIcon className="h-8 w-8 text-purple-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Witch Coven Training</h2>
              <p className="text-slate-400">{activity.characterName}</p>
            </div>
          </div>
          <button
            onClick={onDelete}
            className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
          >
            <TrashIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-slate-700/50 rounded-lg">
            <SparklesIcon className="h-8 w-8 text-purple-400 mx-auto mb-2" />
            <div className="text-lg font-bold text-white">
              {activity.covenName || 'No Coven'}
            </div>
            <div className="text-sm text-slate-400">Coven Name</div>
          </div>
          
          <div className="text-center p-4 bg-slate-700/50 rounded-lg">
            <AcademicCapIcon className="h-8 w-8 text-emerald-400 mx-auto mb-2" />
            <div className="text-lg font-bold capitalize">
              <span className={statusColors[activity.status]}>
                {activity.status}
              </span>
            </div>
            <div className="text-sm text-slate-400">Status</div>
          </div>

          <div className="text-center p-4 bg-slate-700/50 rounded-lg">
            <CalendarDaysIcon className="h-8 w-8 text-blue-400 mx-auto mb-2" />
            <div className="text-3xl font-bold text-white">{totalWeeksStudied}</div>
            <div className="text-sm text-slate-400">Weeks Studied</div>
          </div>
        </div>
      </div>

      {/* Coven Selection & Status */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Coven Details</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-slate-400 mb-2">Coven Name</label>
            <select
              value={activity.covenName}
              onChange={(e) => onUpdate({ covenName: e.target.value })}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
            >
              <option value="">Select a coven...</option>
              {covenNames.map(name => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-2">Status Progression</label>
            <div className="flex items-center gap-2">
              {(['apprentice', 'member', 'oathbound'] as CovenStatus[]).map((status, index) => (
                <button
                  key={status}
                  onClick={() => handleStatusChange(status)}
                  disabled={activity.status === 'rejected'}
                  className={`flex-1 px-3 py-2 rounded-lg font-medium capitalize transition-all ${
                    activity.status === status
                      ? 'bg-purple-600 text-white'
                      : activity.status === 'rejected'
                      ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                      : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {activity.status === 'rejected' && (
            <div className="p-4 bg-red-500/20 border border-red-400/50 rounded-lg">
              <div className="flex items-center gap-2 text-red-300">
                <XMarkIcon className="h-5 w-5" />
                <span className="font-medium">Rejected by Coven</span>
              </div>
              {activity.covenCurse && (
                <p className="text-sm text-red-200 mt-2">
                  Curse: {activity.covenCurse}
                </p>
              )}
            </div>
          )}

          <button
            onClick={handleAddWeekStudy}
            className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
          >
            Log Week of Study (+1)
          </button>
        </div>
      </div>

      {/* Oath & Consequences */}
      {activity.status !== 'rejected' && (
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Oath & Consequences</h3>
          
          <div className="space-y-4">
            {!activity.oathTaken ? (
              <button
                onClick={() => onUpdate({ oathTaken: true, status: 'oathbound' })}
                disabled={activity.status === 'apprentice'}
                className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-slate-600 disabled:to-slate-700 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all"
              >
                Take the Coven Oath
              </button>
            ) : (
              <div className="space-y-3">
                <div className="p-4 bg-purple-500/20 border border-purple-400/50 rounded-lg">
                  <div className="flex items-center gap-2 text-purple-300">
                    <CheckIcon className="h-5 w-5" />
                    <span className="font-medium">Oath Taken</span>
                  </div>
                </div>
                
                {!activity.breachOfOath && (
                  <button
                    onClick={handleBreachOath}
                    className="w-full px-4 py-2 bg-red-600/20 hover:bg-red-600/30 border border-red-600 text-red-300 rounded-lg transition-colors"
                  >
                    <ShieldExclamationIcon className="h-5 w-5 inline mr-2" />
                    Break Oath (Dangerous!)
                  </button>
                )}
              </div>
            )}

            {activity.breachOfOath && (
              <div className="space-y-3">
                <label className="block text-sm text-slate-400">Coven Curse</label>
                <textarea
                  value={curseDescription}
                  onChange={(e) => setCurseDescription(e.target.value)}
                  onBlur={() => onUpdate({ covenCurse: curseDescription })}
                  placeholder="Describe the curse inflicted by the coven..."
                  className="w-full h-24 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 resize-none"
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Resources & Access */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Resources & Access</h3>
        
        <div className="space-y-3 mb-4">
          {activity.accessToResources.map((resource, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
              <span className="text-slate-300">{resource}</span>
              <button
                onClick={() => handleRemoveItem('resource', index)}
                className="p-1 text-red-400 hover:text-red-300 transition-colors"
              >
                <TrashIcon className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={newResource}
            onChange={(e) => setNewResource(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddItem('resource', newResource)}
            placeholder="Add resource access (potions, spells, etc.)..."
            className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400"
          />
          <button
            onClick={() => handleAddItem('resource', newResource)}
            className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
          >
            <PlusIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Boons & Quests */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Boons */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Coven Boons</h3>
          
          <div className="space-y-3 mb-4">
            {activity.covenBoons.map((boon, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                <span className="text-slate-300">{boon}</span>
                <button
                  onClick={() => handleRemoveItem('boon', index)}
                  className="p-1 text-red-400 hover:text-red-300 transition-colors"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={newBoon}
              onChange={(e) => setNewBoon(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddItem('boon', newBoon)}
              placeholder="Add boon..."
              className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400"
            />
            <button
              onClick={() => handleAddItem('boon', newBoon)}
              className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
            >
              <PlusIcon className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Quests */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Coven Quests</h3>
          
          <div className="space-y-3 mb-4">
            {activity.covenQuests.map((quest, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                <span className="text-slate-300">{quest}</span>
                <button
                  onClick={() => handleRemoveItem('quest', index)}
                  className="p-1 text-red-400 hover:text-red-300 transition-colors"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={newQuest}
              onChange={(e) => setNewQuest(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddItem('quest', newQuest)}
              placeholder="Add quest..."
              className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400"
            />
            <button
              onClick={() => handleAddItem('quest', newQuest)}
              className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
            >
              <PlusIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Rivalry Events */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Rivalry Events</h3>
        
        <div className="space-y-3 mb-4">
          {activity.rivalryEvents.map((event, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-red-500/10 border border-red-400/30 rounded-lg">
              <span className="text-red-200">{event}</span>
              <button
                onClick={() => handleRemoveItem('rivalry', index)}
                className="p-1 text-red-400 hover:text-red-300 transition-colors"
              >
                <TrashIcon className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={newRivalry}
            onChange={(e) => setNewRivalry(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddItem('rivalry', newRivalry)}
            placeholder="Add rivalry event (Cloud Cap feud, etc.)..."
            className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400"
          />
          <button
            onClick={() => handleAddItem('rivalry', newRivalry)}
            className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            <PlusIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* DM Notes */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">DM Notes</h3>
        <textarea
          value={activity.dmNotes || ''}
          onChange={(e) => onUpdate({ dmNotes: e.target.value })}
          placeholder="Add notes about coven relationships, magical teachings, or story developments..."
          className="w-full h-32 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 resize-none"
        />
      </div>
    </div>
  );
}