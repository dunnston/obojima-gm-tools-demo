'use client';

import { useState } from 'react';
import { CarousingActivity, calculateDaysElapsed, formatDowntimeDate, formatDowntimeObojimaDate } from '@/data/downtime';
import { SimpleCurrencyDisplay } from '@/components/CurrencyDisplay';
import {
  MusicalNoteIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  ExclamationCircleIcon,
  HeartIcon,
  TrashIcon,
  ChatBubbleLeftRightIcon,
  HandRaisedIcon,
  InformationCircleIcon,
  PlusIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

interface CarousingTrackerProps {
  activity: CarousingActivity;
  currentGameDate: Date;
  onUpdate: (updates: Partial<CarousingActivity>) => void;
  onDelete: () => void;
}

// Common carousing locations
const carousingLocations = [
  'The Drunken Dragon Tavern',
  'The Gilded Rose Inn',
  'The Thieves\' Den',
  'The Noble\'s Ball',
  'The Fighting Pit',
  'The Harbor District',
  'The Market Square',
  'The Temple Quarter',
  'The Wizard\'s Tower',
  'The Guard Barracks',
  'The Merchant Guild',
  'The Bard\'s College'
];

// Carousing results based on d20 roll
const carousingResults = [
  { range: [1, 5], result: 'Got into serious trouble', type: 'trouble' },
  { range: [6, 10], result: 'Made a minor social blunder', type: 'neutral' },
  { range: [11, 15], result: 'Made some acquaintances', type: 'good' },
  { range: [16, 19], result: 'Made valuable connections', type: 'great' },
  { range: [20, 20], result: 'Legendary night!', type: 'legendary' }
];

export default function CarousingTracker({
  activity,
  currentGameDate,
  onUpdate,
  onDelete
}: CarousingTrackerProps) {
  const [showOutcomeModal, setShowOutcomeModal] = useState(false);
  const [rollInput, setRollInput] = useState('');
  const [newFriend, setNewFriend] = useState('');
  const [newFavor, setNewFavor] = useState('');
  
  // Calculate if carousing period is complete
  const daysElapsed = calculateDaysElapsed(activity.startDate, currentGameDate);
  const isCarousingComplete = daysElapsed >= activity.duration;
  const canSetOutcome = isCarousingComplete && !activity.rollOutcome;

  const handleUpdateField = (field: keyof CarousingActivity, value: any) => {
    onUpdate({ [field]: value });
  };

  const handleShowOutcomeModal = () => {
    setShowOutcomeModal(true);
    setRollInput('');
  };

  const handleSubmitOutcome = () => {
    const roll = parseInt(rollInput);
    if (isNaN(roll) || roll < 1 || roll > 20) {
      return;
    }

    // Determine result based on roll
    const resultEntry = carousingResults.find(r => roll >= r.range[0] && roll <= r.range[1]);
    const result = resultEntry?.result || 'An ordinary night';
    
    // Update with existing data from modal inputs
    const currentOutcome = activity.rollOutcome || {};
    
    onUpdate({
      rollOutcome: {
        ...currentOutcome,
        roll,
        result
      },
      status: 'completed'
    });

    setShowOutcomeModal(false);
  };

  const handleAddFriend = () => {
    if (newFriend.trim() && activity.rollOutcome) {
      const currentFriends = activity.rollOutcome.friendsMade || [];
      onUpdate({
        rollOutcome: {
          ...activity.rollOutcome,
          friendsMade: [...currentFriends, newFriend.trim()]
        }
      });
      setNewFriend('');
    }
  };

  const handleRemoveFriend = (index: number) => {
    if (activity.rollOutcome?.friendsMade) {
      onUpdate({
        rollOutcome: {
          ...activity.rollOutcome,
          friendsMade: activity.rollOutcome.friendsMade.filter((_, i) => i !== index)
        }
      });
    }
  };

  const handleAddFavor = () => {
    if (newFavor.trim() && activity.rollOutcome) {
      const currentFavors = activity.rollOutcome.favorsEarned || [];
      onUpdate({
        rollOutcome: {
          ...activity.rollOutcome,
          favorsEarned: [...currentFavors, newFavor.trim()]
        }
      });
      setNewFavor('');
    }
  };

  const handleRemoveFavor = (index: number) => {
    if (activity.rollOutcome?.favorsEarned) {
      onUpdate({
        rollOutcome: {
          ...activity.rollOutcome,
          favorsEarned: activity.rollOutcome.favorsEarned.filter((_, i) => i !== index)
        }
      });
    }
  };

  const getResultColor = (roll: number) => {
    if (roll >= 20) return 'text-purple-400';
    if (roll >= 16) return 'text-green-400';
    if (roll >= 11) return 'text-blue-400';
    if (roll >= 6) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getResultBackground = (roll: number) => {
    if (roll >= 20) return 'bg-purple-500/20 border-purple-400/50';
    if (roll >= 16) return 'bg-green-500/20 border-green-400/50';
    if (roll >= 11) return 'bg-blue-500/20 border-blue-400/50';
    if (roll >= 6) return 'bg-yellow-500/20 border-yellow-400/50';
    return 'bg-red-500/20 border-red-400/50';
  };

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-pink-500/20 rounded-lg">
              <MusicalNoteIcon className="h-8 w-8 text-pink-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Carousing</h2>
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
            <CurrencyDollarIcon className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
            <div className="flex justify-center">
              <SimpleCurrencyDisplay goldValue={activity.fundsSpent} size="lg" className="text-white font-bold" />
            </div>
            <div className="text-sm text-slate-400">Funds Spent</div>
          </div>
          
          <div className="text-center p-4 bg-slate-700/50 rounded-lg">
            <MusicalNoteIcon className="h-8 w-8 text-blue-400 mx-auto mb-2" />
            <div className={`text-3xl font-bold ${activity.rollOutcome ? getResultColor(activity.rollOutcome.roll) : 'text-white'}`}>
              {activity.rollOutcome ? `d20: ${activity.rollOutcome.roll}` : 'Pending'}
            </div>
            <div className="text-sm text-slate-400">Roll Result</div>
          </div>

          <div className="text-center p-4 bg-slate-700/50 rounded-lg">
            <HeartIcon className="h-8 w-8 text-pink-400 mx-auto mb-2" />
            <div className="text-3xl font-bold text-white">
              {activity.rollOutcome ? 'Complete' : 'Ongoing'}
            </div>
            <div className="text-sm text-slate-400">Status</div>
          </div>
        </div>
      </div>

      {/* Carousing Details */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Carousing Details</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Location</label>
            <select
              value={activity.location}
              onChange={(e) => handleUpdateField('location', e.target.value)}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
            >
              <option value="">Select a location...</option>
              {carousingLocations.map((location, index) => (
                <option key={index} value={location}>{location}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Funds Spent (gp)</label>
            <input
              type="number"
              min="0"
              value={activity.fundsSpent}
              onChange={(e) => handleUpdateField('fundsSpent', parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-300 mb-2">Duration (days)</label>
            <input
              type="number"
              min="1"
              value={activity.duration}
              onChange={(e) => handleUpdateField('duration', parseInt(e.target.value) || 1)}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
            />
          </div>
        </div>

        {/* Carousing Status */}
        {!isCarousingComplete ? (
          <div className="text-center p-4 bg-pink-500/20 border border-pink-400/50 rounded-lg">
            <MusicalNoteIcon className="h-8 w-8 text-pink-400 mx-auto mb-2" />
            <p className="text-pink-300 font-semibold">Carousing in Progress</p>
            <p className="text-slate-300 text-sm mt-1">
              {daysElapsed} of {activity.duration} days complete
            </p>
          </div>
        ) : canSetOutcome ? (
          <button
            onClick={handleShowOutcomeModal}
            className="w-full px-4 py-3 bg-pink-600 hover:bg-pink-700 text-white font-semibold rounded-lg transition-colors"
          >
            Roll for Carousing Results
          </button>
        ) : null}
      </div>

      {/* Carousing Outcome */}
      {activity.rollOutcome && (
        <div className={`p-4 rounded-lg border ${getResultBackground(activity.rollOutcome.roll)}`}>
          <div className="flex items-center gap-2 mb-3">
            <MusicalNoteIcon className={`h-5 w-5 ${getResultColor(activity.rollOutcome.roll)}`} />
            <span className={`font-medium ${getResultColor(activity.rollOutcome.roll)}`}>
              {activity.rollOutcome.result}
            </span>
          </div>
          
          {/* Trouble Caused */}
          {activity.rollOutcome.troubleCaused && (
            <div className="mb-3 p-3 bg-red-500/10 border border-red-400/30 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <ExclamationCircleIcon className="h-5 w-5 text-red-400" />
                <span className="font-medium text-red-400">Trouble Caused</span>
              </div>
              <p className="text-slate-300">{activity.rollOutcome.troubleCaused}</p>
            </div>
          )}

          {/* Rumor Learned */}
          {activity.rollOutcome.rumorLearned && (
            <div className="mb-3 p-3 bg-blue-500/10 border border-blue-400/30 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <InformationCircleIcon className="h-5 w-5 text-blue-400" />
                <span className="font-medium text-blue-400">Rumor Learned</span>
              </div>
              <p className="text-slate-300">{activity.rollOutcome.rumorLearned}</p>
            </div>
          )}

          {/* Update Additional Details */}
          <div className="space-y-3 mt-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Trouble Caused</label>
              <input
                type="text"
                value={activity.rollOutcome.troubleCaused || ''}
                onChange={(e) => onUpdate({
                  rollOutcome: { ...activity.rollOutcome, troubleCaused: e.target.value }
                })}
                placeholder="Describe any trouble or complications..."
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Rumor Learned</label>
              <input
                type="text"
                value={activity.rollOutcome.rumorLearned || ''}
                onChange={(e) => onUpdate({
                  rollOutcome: { ...activity.rollOutcome, rumorLearned: e.target.value }
                })}
                placeholder="Any interesting rumors or information..."
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400"
              />
            </div>
          </div>
        </div>
      )}

      {/* Friends Made */}
      {activity.rollOutcome && (
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <UserGroupIcon className="h-5 w-5 text-green-400" />
            <h3 className="text-lg font-semibold text-white">Friends & Contacts Made</h3>
          </div>
          
          <div className="space-y-3 mb-4">
            {activity.rollOutcome.friendsMade?.map((friend, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                <span className="text-slate-300">{friend}</span>
                <button
                  onClick={() => handleRemoveFriend(index)}
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
              value={newFriend}
              onChange={(e) => setNewFriend(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddFriend()}
              placeholder="Add a new friend or contact..."
              className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400"
            />
            <button
              onClick={handleAddFriend}
              className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            >
              <PlusIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      {/* Favors Earned */}
      {activity.rollOutcome && (
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <HandRaisedIcon className="h-5 w-5 text-purple-400" />
            <h3 className="text-lg font-semibold text-white">Favors & Obligations</h3>
          </div>
          
          <div className="space-y-3 mb-4">
            {activity.rollOutcome.favorsEarned?.map((favor, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                <span className="text-slate-300">{favor}</span>
                <button
                  onClick={() => handleRemoveFavor(index)}
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
              value={newFavor}
              onChange={(e) => setNewFavor(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddFavor()}
              placeholder="Add a favor earned or owed..."
              className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400"
            />
            <button
              onClick={handleAddFavor}
              className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
            >
              <PlusIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      {/* DM Notes */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">DM Notes</h3>
        <textarea
          value={activity.dmNotes || ''}
          onChange={(e) => onUpdate({ dmNotes: e.target.value })}
          placeholder="Add notes about the carousing activities, memorable moments, or story hooks..."
          className="w-full h-32 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 resize-none"
        />
      </div>

      {/* Outcome Modal */}
      {showOutcomeModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 border border-slate-600 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-white mb-4">Carousing Results</h3>
            
            <div className="mb-6">
              <div className="text-center mb-4">
                <ChatBubbleLeftRightIcon className="h-12 w-12 text-pink-400 mx-auto mb-2" />
                <p className="text-slate-300">
                  Roll a d20 to see how your night of carousing went!
                </p>
              </div>

              <div className="space-y-2 text-sm text-slate-400">
                <p>• 1-5: Got into serious trouble</p>
                <p>• 6-10: Made a minor social blunder</p>
                <p>• 11-15: Made some acquaintances</p>
                <p>• 16-19: Made valuable connections</p>
                <p>• 20: Legendary night!</p>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <label className="block text-sm font-medium text-slate-300">Enter your d20 roll:</label>
              <input
                type="number"
                min="1"
                max="20"
                value={rollInput}
                onChange={(e) => setRollInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSubmitOutcome()}
                placeholder="1-20"
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 text-center text-lg"
                autoFocus
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleSubmitOutcome}
                disabled={!rollInput || parseInt(rollInput) < 1 || parseInt(rollInput) > 20}
                className="flex-1 px-4 py-2 bg-pink-600 hover:bg-pink-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
              >
                Submit Roll
              </button>
              <button
                onClick={() => setShowOutcomeModal(false)}
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