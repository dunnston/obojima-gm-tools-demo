'use client';

import { useState } from 'react';
import { FactionWorkActivity, calculateDaysElapsed, formatDowntimeDate, formatDowntimeObojimaDate } from '@/data/downtime';
import {
  BuildingOfficeIcon,
  UserGroupIcon,
  ClipboardDocumentCheckIcon,
  StarIcon,
  CheckCircleIcon,
  XCircleIcon,
  GiftIcon,
  ExclamationTriangleIcon,
  TrashIcon,
  PlusIcon,
  XMarkIcon,
  TrophyIcon
} from '@heroicons/react/24/outline';

interface FactionWorkTrackerProps {
  activity: FactionWorkActivity;
  currentGameDate: Date;
  onUpdate: (updates: Partial<FactionWorkActivity>) => void;
  onDelete: () => void;
}

// Common factions in a D&D setting
const commonFactions = [
  'The Harpers',
  'The Order of the Gauntlet',
  'The Emerald Enclave',
  'The Lords\' Alliance',
  'The Zhentarim',
  'Thieves\' Guild',
  'Merchants\' Guild',
  'Adventurers\' Guild',
  'City Watch',
  'Royal Court',
  'Temple of Light',
  'College of Wizardry',
  'Assassins\' Guild',
  'Sailors\' Brotherhood'
];

// Common faction tasks
const factionTasks = [
  'Deliver a secret message',
  'Guard a valuable shipment',
  'Investigate suspicious activity',
  'Recruit new members',
  'Sabotage rival operations',
  'Gather intelligence',
  'Protect a VIP',
  'Negotiate a treaty',
  'Eliminate a threat',
  'Retrieve stolen goods',
  'Establish a new safe house',
  'Train new recruits',
  'Spread propaganda',
  'Secure funding'
];

export default function FactionWorkTracker({
  activity,
  currentGameDate,
  onUpdate,
  onDelete
}: FactionWorkTrackerProps) {
  const [showResultModal, setShowResultModal] = useState(false);
  const [rollInput, setRollInput] = useState('');
  const [newReward, setNewReward] = useState('');
  const [newConsequence, setNewConsequence] = useState('');

  // Calculate if work period is complete
  const daysElapsed = calculateDaysElapsed(activity.startDate, currentGameDate);
  const isWorkComplete = daysElapsed >= activity.duration;
  const canSetResult = isWorkComplete && activity.difficultyDC && !activity.successRoll;
  const hasResult = activity.successRoll !== undefined;

  const handleUpdateField = (field: keyof FactionWorkActivity, value: any) => {
    onUpdate({ [field]: value });
  };

  const handleShowResultModal = () => {
    setShowResultModal(true);
    setRollInput('');
  };

  const handleSubmitResult = () => {
    const roll = parseInt(rollInput);
    if (isNaN(roll) || roll < 1 || roll > 30) {
      return;
    }

    const success = roll >= (activity.difficultyDC || 15);
    const criticalSuccess = roll >= (activity.difficultyDC || 15) + 10;
    const criticalFailure = roll <= 5;
    
    // Calculate reputation points based on success
    let reputationPoints = 0;
    if (criticalSuccess) {
      reputationPoints = 3;
    } else if (success) {
      reputationPoints = 1;
    } else if (criticalFailure) {
      reputationPoints = -1;
    }

    onUpdate({
      successRoll: roll,
      reputationPoints,
      status: success ? 'completed' : 'failed'
    });

    setShowResultModal(false);
  };

  const handleAddReward = () => {
    if (newReward.trim()) {
      const currentRewards = activity.rewards || [];
      onUpdate({
        rewards: [...currentRewards, newReward.trim()]
      });
      setNewReward('');
    }
  };

  const handleRemoveReward = (index: number) => {
    if (activity.rewards) {
      onUpdate({
        rewards: activity.rewards.filter((_, i) => i !== index)
      });
    }
  };

  const handleAddConsequence = () => {
    if (newConsequence.trim()) {
      const currentConsequences = activity.consequences || [];
      onUpdate({
        consequences: [...currentConsequences, newConsequence.trim()]
      });
      setNewConsequence('');
    }
  };

  const handleRemoveConsequence = (index: number) => {
    if (activity.consequences) {
      onUpdate({
        consequences: activity.consequences.filter((_, i) => i !== index)
      });
    }
  };

  const getResultColor = () => {
    if (!activity.successRoll || !activity.difficultyDC) return 'text-slate-400';
    if (activity.successRoll >= activity.difficultyDC + 10) return 'text-purple-400';
    if (activity.successRoll >= activity.difficultyDC) return 'text-green-400';
    if (activity.successRoll <= 5) return 'text-red-400';
    return 'text-yellow-400';
  };

  const getResultText = () => {
    if (!activity.successRoll || !activity.difficultyDC) return 'Pending';
    if (activity.successRoll >= activity.difficultyDC + 10) return 'Critical Success!';
    if (activity.successRoll >= activity.difficultyDC) return 'Success';
    if (activity.successRoll <= 5) return 'Critical Failure';
    return 'Failed';
  };

  const getReputationColor = (points: number) => {
    if (points >= 3) return 'text-purple-400';
    if (points > 0) return 'text-green-400';
    if (points < 0) return 'text-red-400';
    return 'text-slate-400';
  };

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gray-500/20 rounded-lg">
              <BuildingOfficeIcon className="h-8 w-8 text-gray-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Faction Work</h2>
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
            <UserGroupIcon className="h-8 w-8 text-blue-400 mx-auto mb-2" />
            <div className="text-xl font-bold text-white line-clamp-1">{activity.factionName || 'None'}</div>
            <div className="text-sm text-slate-400">Faction</div>
          </div>
          
          <div className="text-center p-4 bg-slate-700/50 rounded-lg">
            <ClipboardDocumentCheckIcon className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
            <div className={`text-3xl font-bold ${getResultColor()}`}>
              {hasResult ? `${activity.successRoll}` : activity.difficultyDC ? `DC ${activity.difficultyDC}` : 'TBD'}
            </div>
            <div className="text-sm text-slate-400">{hasResult ? 'Roll Result' : 'Difficulty'}</div>
          </div>

          <div className="text-center p-4 bg-slate-700/50 rounded-lg">
            <StarIcon className="h-8 w-8 text-purple-400 mx-auto mb-2" />
            <div className={`text-3xl font-bold ${activity.reputationPoints ? getReputationColor(activity.reputationPoints) : 'text-white'}`}>
              {activity.reputationPoints !== undefined ? `${activity.reputationPoints > 0 ? '+' : ''}${activity.reputationPoints}` : '0'}
            </div>
            <div className="text-sm text-slate-400">Reputation</div>
          </div>
        </div>
      </div>

      {/* Task Details */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Task Details</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Faction</label>
            <select
              value={activity.factionName}
              onChange={(e) => handleUpdateField('factionName', e.target.value)}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
            >
              <option value="">Select a faction...</option>
              {commonFactions.map((faction, index) => (
                <option key={index} value={faction}>{faction}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Task Duration (days)</label>
            <input
              type="number"
              min="1"
              value={activity.duration}
              onChange={(e) => handleUpdateField('duration', parseInt(e.target.value) || 1)}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-300 mb-2">Task Description</label>
            <select
              value={activity.task}
              onChange={(e) => handleUpdateField('task', e.target.value)}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white mb-2"
            >
              <option value="">Select a task...</option>
              {factionTasks.map((task, index) => (
                <option key={index} value={task}>{task}</option>
              ))}
            </select>
            <input
              type="text"
              value={activity.task}
              onChange={(e) => handleUpdateField('task', e.target.value)}
              placeholder="Or enter a custom task..."
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Difficulty DC</label>
            <input
              type="number"
              min="5"
              max="30"
              value={activity.difficultyDC || ''}
              onChange={(e) => handleUpdateField('difficultyDC', e.target.value ? parseInt(e.target.value) : undefined)}
              placeholder="Enter DC (5-30)"
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400"
            />
          </div>
        </div>

        {/* Task Status */}
        {!isWorkComplete ? (
          <div className="text-center p-4 bg-gray-500/20 border border-gray-400/50 rounded-lg">
            <BuildingOfficeIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-300 font-semibold">Task in Progress</p>
            <p className="text-slate-300 text-sm mt-1">
              {daysElapsed} of {activity.duration} days complete
            </p>
          </div>
        ) : canSetResult ? (
          <button
            onClick={handleShowResultModal}
            className="w-full px-4 py-3 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg transition-colors"
          >
            Roll for Task Result (DC {activity.difficultyDC})
          </button>
        ) : hasResult ? (
          <div className={`p-4 rounded-lg border text-center ${
            activity.successRoll! >= (activity.difficultyDC || 15) 
              ? 'bg-green-500/20 border-green-400/50' 
              : 'bg-red-500/20 border-red-400/50'
          }`}>
            <div className="flex items-center justify-center gap-2 mb-2">
              {activity.successRoll! >= (activity.difficultyDC || 15) ? (
                <CheckCircleIcon className="h-6 w-6 text-green-400" />
              ) : (
                <XCircleIcon className="h-6 w-6 text-red-400" />
              )}
              <span className={`text-xl font-bold ${getResultColor()}`}>
                {getResultText()}
              </span>
            </div>
            <p className="text-slate-300">
              Rolled {activity.successRoll} vs DC {activity.difficultyDC}
            </p>
          </div>
        ) : (
          <div className="text-center p-4 bg-slate-700/50 rounded-lg">
            <p className="text-slate-400">Set a DC to enable result rolling</p>
          </div>
        )}
      </div>

      {/* Rewards */}
      {hasResult && (
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <GiftIcon className="h-5 w-5 text-green-400" />
            <h3 className="text-lg font-semibold text-white">Rewards Earned</h3>
          </div>
          
          <div className="space-y-3 mb-4">
            {activity.rewards?.map((reward, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                <span className="text-slate-300">{reward}</span>
                <button
                  onClick={() => handleRemoveReward(index)}
                  className="p-1 text-red-400 hover:text-red-300 transition-colors"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={newReward}
              onChange={(e) => setNewReward(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddReward()}
              placeholder="Add reward (gold, items, favors, etc.)..."
              className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400"
            />
            <button
              onClick={handleAddReward}
              className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            >
              <PlusIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      {/* Consequences */}
      {hasResult && (
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" />
            <h3 className="text-lg font-semibold text-white">Consequences & Complications</h3>
          </div>
          
          <div className="space-y-3 mb-4">
            {activity.consequences?.map((consequence, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                <span className="text-slate-300">{consequence}</span>
                <button
                  onClick={() => handleRemoveConsequence(index)}
                  className="p-1 text-red-400 hover:text-red-300 transition-colors"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={newConsequence}
              onChange={(e) => setNewConsequence(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddConsequence()}
              placeholder="Add consequence or complication..."
              className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400"
            />
            <button
              onClick={handleAddConsequence}
              className="px-3 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors"
            >
              <PlusIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      {/* Reputation Summary */}
      {activity.reputationPoints !== undefined && activity.reputationPoints !== 0 && (
        <div className={`p-4 rounded-lg border ${
          activity.reputationPoints > 0 
            ? 'bg-purple-500/20 border-purple-400/50' 
            : 'bg-red-500/20 border-red-400/50'
        }`}>
          <div className="flex items-center gap-3">
            <TrophyIcon className={`h-6 w-6 ${getReputationColor(activity.reputationPoints)}`} />
            <div>
              <p className={`font-semibold ${getReputationColor(activity.reputationPoints)}`}>
                Faction Reputation {activity.reputationPoints > 0 ? 'Increased' : 'Decreased'}
              </p>
              <p className="text-sm text-slate-300 mt-1">
                {activity.reputationPoints > 0 ? '+' : ''}{activity.reputationPoints} reputation with {activity.factionName}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* DM Notes */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">DM Notes</h3>
        <textarea
          value={activity.dmNotes || ''}
          onChange={(e) => onUpdate({ dmNotes: e.target.value })}
          placeholder="Add notes about the faction work, political implications, or future opportunities..."
          className="w-full h-32 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 resize-none"
        />
      </div>

      {/* Result Modal */}
      {showResultModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 border border-slate-600 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-white mb-4">Task Result</h3>
            
            <div className="text-center mb-6">
              <BuildingOfficeIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-lg text-slate-300 mb-2">
                Roll for your faction task outcome
              </p>
              <div className="text-3xl font-bold text-white">
                DC {activity.difficultyDC}
              </div>
              <p className="text-sm text-slate-400 mt-2">
                Success: +1 reputation | Critical Success (DC+10): +3 reputation
              </p>
              <p className="text-sm text-slate-400">
                Critical Failure (5 or less): -1 reputation
              </p>
            </div>

            <div className="space-y-3 mb-6">
              <label className="block text-sm font-medium text-slate-300">
                Enter your skill check result (d20 + modifiers):
              </label>
              <input
                type="number"
                min="1"
                max="30"
                value={rollInput}
                onChange={(e) => setRollInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSubmitResult()}
                placeholder="1-30"
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 text-center text-lg"
                autoFocus
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleSubmitResult}
                disabled={!rollInput || parseInt(rollInput) < 1 || parseInt(rollInput) > 30}
                className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
              >
                Submit Result
              </button>
              <button
                onClick={() => setShowResultModal(false)}
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