'use client';

import { useState } from 'react';
import { CraftingActivity, craftingItems, calculateDaysElapsed, formatDowntimeDate, formatDowntimeObojimaDate } from '@/data/downtime';
import {
  WrenchIcon,
  CalendarDaysIcon,
  ChartBarIcon,
  CheckIcon,
  XMarkIcon,
  PlusIcon,
  TrashIcon,
  DiceIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

interface CraftingTrackerProps {
  activity: CraftingActivity;
  currentGameDate: Date;
  onUpdate: (updates: Partial<CraftingActivity>) => void;
  onDelete: () => void;
}

export default function CraftingTracker({
  activity,
  currentGameDate,
  onUpdate,
  onDelete
}: CraftingTrackerProps) {
  const [newMaterial, setNewMaterial] = useState('');
  const [showSkillCheckModal, setShowSkillCheckModal] = useState(false);
  const [skillCheckInput, setSkillCheckInput] = useState('');

  // Calculate progress
  const daysElapsed = calculateDaysElapsed(activity.startDate, currentGameDate);
  const daysWorked = Math.min(daysElapsed, activity.daysRequired);
  const automaticProgress = Math.min((daysWorked / activity.daysRequired) * 100, 100);
  const currentProgress = Math.max(activity.progress, automaticProgress);
  const isComplete = currentProgress >= 100;
  const canAttemptSkillCheck = activity.dcNeeded && !activity.result && isComplete;

  const handleUpdateItem = (field: keyof CraftingActivity, value: any) => {
    onUpdate({ [field]: value });
  };

  const handleAddMaterial = () => {
    if (newMaterial.trim()) {
      onUpdate({
        materialsUsed: [...activity.materialsUsed, newMaterial.trim()]
      });
      setNewMaterial('');
    }
  };

  const handleRemoveMaterial = (index: number) => {
    onUpdate({
      materialsUsed: activity.materialsUsed.filter((_, i) => i !== index)
    });
  };

  const handleAddProgressDay = () => {
    const newProgress = Math.min(activity.progress + (100 / activity.daysRequired), 100);
    onUpdate({
      progress: newProgress,
      status: newProgress >= 100 ? 'completed' : activity.status
    });
  };

  const handleSkillCheck = () => {
    setShowSkillCheckModal(true);
  };

  const handleSubmitSkillCheck = () => {
    const roll = parseInt(skillCheckInput);
    if (isNaN(roll) || roll < 1 || roll > 50) {
      return;
    }

    const success = roll >= (activity.dcNeeded || 15);
    const exceptional = roll === 20 || roll >= (activity.dcNeeded || 15) + 5;
    
    let result: 'success' | 'failure' | 'exceptional';
    if (exceptional) {
      result = 'exceptional';
    } else if (success) {
      result = 'success';
    } else {
      result = 'failure';
    }

    onUpdate({
      result,
      status: result === 'failure' ? 'failed' : 'completed'
    });

    setShowSkillCheckModal(false);
    setSkillCheckInput('');
  };

  const getResultColor = (result: string) => {
    switch (result) {
      case 'success': return 'text-green-400';
      case 'exceptional': return 'text-purple-400';
      case 'failure': return 'text-red-400';
      default: return 'text-slate-400';
    }
  };

  const getResultBackground = (result: string) => {
    switch (result) {
      case 'success': return 'bg-green-500/20 border-green-400/50';
      case 'exceptional': return 'bg-purple-500/20 border-purple-400/50';
      case 'failure': return 'bg-red-500/20 border-red-400/50';
      default: return 'bg-slate-500/20 border-slate-400/50';
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-500/20 rounded-lg">
              <WrenchIcon className="h-8 w-8 text-blue-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Crafting Activity</h2>
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
            <ChartBarIcon className="h-8 w-8 text-blue-400 mx-auto mb-2" />
            <div className="text-3xl font-bold text-white">{Math.round(currentProgress)}%</div>
            <div className="text-sm text-slate-400">Progress</div>
          </div>
          
          <div className="text-center p-4 bg-slate-700/50 rounded-lg">
            <CalendarDaysIcon className="h-8 w-8 text-emerald-400 mx-auto mb-2" />
            <div className="text-3xl font-bold text-white">{daysWorked}/{activity.daysRequired}</div>
            <div className="text-sm text-slate-400">Days Worked</div>
          </div>

          <div className="text-center p-4 bg-slate-700/50 rounded-lg">
            <WrenchIcon className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
            <div className={`text-3xl font-bold ${getResultColor(activity.result || 'pending')}`}>
              {activity.result ? activity.result.charAt(0).toUpperCase() + activity.result.slice(1) : 'In Progress'}
            </div>
            <div className="text-sm text-slate-400">Status</div>
          </div>
        </div>
      </div>

      {/* Item Details */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Item Details</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Item Being Crafted</label>
            <select
              value={activity.itemBeingCrafted}
              onChange={(e) => handleUpdateItem('itemBeingCrafted', e.target.value)}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
            >
              <option value="">Select an item...</option>
              {craftingItems.map((item, index) => (
                <option key={index} value={item}>{item}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Days Required</label>
            <input
              type="number"
              min="1"
              value={activity.daysRequired}
              onChange={(e) => handleUpdateItem('daysRequired', parseInt(e.target.value) || 1)}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">DC Needed (optional)</label>
            <input
              type="number"
              min="1"
              max="30"
              value={activity.dcNeeded || ''}
              onChange={(e) => handleUpdateItem('dcNeeded', e.target.value ? parseInt(e.target.value) : undefined)}
              placeholder="No skill check required"
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Tool Proficiency</label>
            <input
              type="text"
              value={activity.toolProficiency || ''}
              onChange={(e) => handleUpdateItem('toolProficiency', e.target.value)}
              placeholder="e.g., Smith's Tools, Alchemist's Supplies"
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400"
            />
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-400">Crafting Progress</span>
            <span className="text-sm text-slate-300">{Math.round(currentProgress)}% Complete</span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-blue-500 to-cyan-500 h-3 rounded-full transition-all"
              style={{ width: `${currentProgress}%` }}
            />
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleAddProgressDay}
            disabled={currentProgress >= 100}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
          >
            Log Day of Work (+{Math.round(100 / activity.daysRequired)}%)
          </button>

          {canAttemptSkillCheck && (
            <button
              onClick={handleSkillCheck}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
            >
              Make Skill Check (DC {activity.dcNeeded})
            </button>
          )}
        </div>
      </div>

      {/* Materials */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Materials Used</h3>
        
        <div className="space-y-3 mb-4">
          {activity.materialsUsed.map((material, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
              <span className="text-slate-300">{material}</span>
              <button
                onClick={() => handleRemoveMaterial(index)}
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
            value={newMaterial}
            onChange={(e) => setNewMaterial(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddMaterial()}
            placeholder="Add material or component..."
            className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400"
          />
          <button
            onClick={handleAddMaterial}
            className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
          >
            <PlusIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Result */}
      {activity.result && (
        <div className={`p-4 rounded-lg border ${getResultBackground(activity.result)}`}>
          <div className="flex items-center gap-2 mb-2">
            {activity.result === 'success' && <CheckIcon className="h-5 w-5 text-green-400" />}
            {activity.result === 'exceptional' && <CheckIcon className="h-5 w-5 text-purple-400" />}
            {activity.result === 'failure' && <XMarkIcon className="h-5 w-5 text-red-400" />}
            <span className={`font-medium ${getResultColor(activity.result)}`}>
              Crafting {activity.result === 'exceptional' ? 'Exceptional Success!' : 
                        activity.result === 'success' ? 'Success!' : 'Failed'}
            </span>
          </div>
          <p className="text-slate-300 text-sm">
            {activity.result === 'exceptional' && 'Outstanding work! The item is of exceptional quality.'}
            {activity.result === 'success' && 'The item has been successfully crafted.'}
            {activity.result === 'failure' && 'The crafting attempt failed. Materials may be lost.'}
          </p>
        </div>
      )}

      {/* DM Notes */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">DM Notes</h3>
        <textarea
          value={activity.dmNotes || ''}
          onChange={(e) => onUpdate({ dmNotes: e.target.value })}
          placeholder="Add notes about the crafting process, special requirements, or story elements..."
          className="w-full h-32 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 resize-none"
        />
      </div>

      {/* Skill Check Modal */}
      {showSkillCheckModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 border border-slate-600 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-white mb-4">Crafting Skill Check</h3>
            
            <div className="text-center mb-6">
              <div className="text-lg text-slate-300 mb-2">
                Roll a d20 + your crafting modifier
              </div>
              <div className="text-3xl font-bold text-white">
                DC {activity.dcNeeded}
              </div>
              {activity.toolProficiency && (
                <div className="text-sm text-slate-400 mt-2">
                  Using: {activity.toolProficiency}
                </div>
              )}
            </div>

            <div className="space-y-3 mb-6">
              <div className="text-center text-slate-300">
                Enter your total roll result:
              </div>
              <div className="flex gap-2">
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={skillCheckInput}
                  onChange={(e) => setSkillCheckInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSubmitSkillCheck()}
                  placeholder="1-50"
                  className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 text-center"
                  autoFocus
                />
                <button
                  onClick={handleSubmitSkillCheck}
                  disabled={!skillCheckInput || parseInt(skillCheckInput) < 1}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                >
                  Submit
                </button>
              </div>
            </div>

            <button
              onClick={() => setShowSkillCheckModal(false)}
              className="w-full px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}