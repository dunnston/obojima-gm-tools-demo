'use client';

import { useState } from 'react';
import { GatheringActivity, RiskLevel, gatheringLocations, gatheringResources, calculateDaysElapsed, formatDowntimeDate, formatDowntimeObojimaDate } from '@/data/downtime';
import {
  MapIcon,
  ExclamationTriangleIcon,
  CheckIcon,
  XMarkIcon,
  EyeIcon,
  TrashIcon,
  CalendarDaysIcon,
  CubeIcon,
  ShieldExclamationIcon
} from '@heroicons/react/24/outline';

interface GatheringTrackerProps {
  activity: GatheringActivity;
  currentGameDate: Date;
  onUpdate: (updates: Partial<GatheringActivity>) => void;
  onDelete: () => void;
}

export default function GatheringTracker({
  activity,
  currentGameDate,
  onUpdate,
  onDelete
}: GatheringTrackerProps) {
  const [showOutcomeModal, setShowOutcomeModal] = useState(false);
  const [rollInput, setRollInput] = useState('');
  const [quantityInput, setQuantityInput] = useState('');
  const [dangerInput, setDangerInput] = useState('');
  const [outcomeSuccess, setOutcomeSuccess] = useState(true);

  // Calculate if expedition is complete
  const daysElapsed = calculateDaysElapsed(activity.startDate, currentGameDate);
  const isExpeditionComplete = daysElapsed >= activity.duration;
  const canSetOutcome = isExpeditionComplete && !activity.outcome;

  const handleUpdateField = (field: keyof GatheringActivity, value: any) => {
    onUpdate({ [field]: value });
  };

  const handleStartOutcome = () => {
    setShowOutcomeModal(true);
    setRollInput('');
    setQuantityInput('');
    setDangerInput('');
    setOutcomeSuccess(true);
  };

  const handleSubmitOutcome = () => {
    const roll = parseInt(rollInput);
    const quantity = parseInt(quantityInput) || 0;
    
    if (isNaN(roll) || roll < 1) {
      return;
    }

    onUpdate({
      outcome: {
        success: outcomeSuccess,
        rollResult: roll,
        quantityFound: outcomeSuccess ? quantity : 0,
        dangerEncountered: dangerInput.trim() || undefined
      },
      status: outcomeSuccess ? 'completed' : 'failed'
    });

    setShowOutcomeModal(false);
  };

  const getRiskColor = (risk: RiskLevel) => {
    switch (risk) {
      case 'low': return 'text-green-400';
      case 'medium': return 'text-yellow-400';
      case 'high': return 'text-orange-400';
      case 'extreme': return 'text-red-400';
      default: return 'text-slate-400';
    }
  };

  const getRiskBackground = (risk: RiskLevel) => {
    switch (risk) {
      case 'low': return 'bg-green-500/20 border-green-400/50';
      case 'medium': return 'bg-yellow-500/20 border-yellow-400/50';
      case 'high': return 'bg-orange-500/20 border-orange-400/50';
      case 'extreme': return 'bg-red-500/20 border-red-400/50';
      default: return 'bg-slate-500/20 border-slate-400/50';
    }
  };

  const getRiskIcon = (risk: RiskLevel) => {
    switch (risk) {
      case 'low': return CheckIcon;
      case 'medium': return EyeIcon;
      case 'high': return ExclamationTriangleIcon;
      case 'extreme': return ShieldExclamationIcon;
      default: return MapIcon;
    }
  };

  const getRiskDescription = (risk: RiskLevel) => {
    switch (risk) {
      case 'low': return 'Minimal danger, reliable resources';
      case 'medium': return 'Some risk, moderate rewards';
      case 'high': return 'Dangerous but rewarding';
      case 'extreme': return 'Extremely dangerous, rare treasures';
      default: return 'Unknown risk level';
    }
  };

  const RiskIcon = getRiskIcon(activity.riskLevel);

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-500/20 rounded-lg">
              <MapIcon className="h-8 w-8 text-green-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Gathering & Exploration</h2>
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
            <CalendarDaysIcon className="h-8 w-8 text-blue-400 mx-auto mb-2" />
            <div className="text-3xl font-bold text-white">{daysElapsed}/{activity.duration}</div>
            <div className="text-sm text-slate-400">Days Elapsed</div>
          </div>
          
          <div className="text-center p-4 bg-slate-700/50 rounded-lg">
            <RiskIcon className={`h-8 w-8 ${getRiskColor(activity.riskLevel)} mx-auto mb-2`} />
            <div className={`text-3xl font-bold ${getRiskColor(activity.riskLevel)}`}>
              {activity.riskLevel.charAt(0).toUpperCase() + activity.riskLevel.slice(1)}
            </div>
            <div className="text-sm text-slate-400">Risk Level</div>
          </div>

          <div className="text-center p-4 bg-slate-700/50 rounded-lg">
            <CubeIcon className="h-8 w-8 text-purple-400 mx-auto mb-2" />
            <div className="text-3xl font-bold text-white">
              {activity.outcome ? (activity.outcome.success ? 'Success' : 'Failed') : 'Ongoing'}
            </div>
            <div className="text-sm text-slate-400">Status</div>
          </div>
        </div>
      </div>

      {/* Expedition Details */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Expedition Details</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Target Resource</label>
            <select
              value={activity.targetResource}
              onChange={(e) => handleUpdateField('targetResource', e.target.value)}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
            >
              <option value="">Select a resource...</option>
              {gatheringResources.map((resource, index) => (
                <option key={index} value={resource}>{resource}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Location</label>
            <select
              value={activity.location}
              onChange={(e) => handleUpdateField('location', e.target.value)}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
            >
              <option value="">Select a location...</option>
              {gatheringLocations.map((location, index) => (
                <option key={index} value={location}>{location}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Risk Level</label>
            <select
              value={activity.riskLevel}
              onChange={(e) => handleUpdateField('riskLevel', e.target.value as RiskLevel)}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
            >
              <option value="low">Low Risk</option>
              <option value="medium">Medium Risk</option>
              <option value="high">High Risk</option>
              <option value="extreme">Extreme Risk</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Expedition Duration (days)</label>
            <input
              type="number"
              min="1"
              value={activity.duration}
              onChange={(e) => handleUpdateField('duration', parseInt(e.target.value) || 1)}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
            />
          </div>
        </div>

        {/* Risk Level Info */}
        <div className={`p-4 rounded-lg border ${getRiskBackground(activity.riskLevel)}`}>
          <div className="flex items-center gap-2 mb-2">
            <RiskIcon className={`h-5 w-5 ${getRiskColor(activity.riskLevel)}`} />
            <span className={`font-medium ${getRiskColor(activity.riskLevel)}`}>
              {activity.riskLevel.charAt(0).toUpperCase() + activity.riskLevel.slice(1)} Risk
            </span>
          </div>
          <p className="text-slate-300 text-sm">
            {getRiskDescription(activity.riskLevel)}
          </p>
        </div>

        {/* Expedition Status */}
        <div className="mt-4">
          {!isExpeditionComplete ? (
            <div className="text-center p-4 bg-blue-500/20 border border-blue-400/50 rounded-lg">
              <CalendarDaysIcon className="h-8 w-8 text-blue-400 mx-auto mb-2" />
              <p className="text-blue-300 font-semibold">Expedition in Progress</p>
              <p className="text-slate-300 text-sm mt-1">
                Return date: {(() => {
                  const returnDate = new Date(activity.startDate);
                  returnDate.setDate(returnDate.getDate() + activity.duration);
                  return formatDowntimeObojimaDate(returnDate);
                })()}
              </p>
            </div>
          ) : canSetOutcome ? (
            <button
              onClick={handleStartOutcome}
              className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors"
            >
              Resolve Expedition Outcome
            </button>
          ) : null}
        </div>
      </div>

      {/* Outcome Results */}
      {activity.outcome && (
        <div className={`p-4 rounded-lg border ${
          activity.outcome.success 
            ? 'bg-green-500/20 border-green-400/50' 
            : 'bg-red-500/20 border-red-400/50'
        }`}>
          <div className="flex items-center gap-2 mb-2">
            {activity.outcome.success ? (
              <CheckIcon className="h-5 w-5 text-green-400" />
            ) : (
              <XMarkIcon className="h-5 w-5 text-red-400" />
            )}
            <span className={`font-medium ${
              activity.outcome.success ? 'text-green-400' : 'text-red-400'
            }`}>
              Expedition {activity.outcome.success ? 'Successful!' : 'Failed'}
            </span>
          </div>
          
          <div className="space-y-2 text-sm text-slate-300">
            {activity.outcome.rollResult && (
              <p>Roll Result: {activity.outcome.rollResult}</p>
            )}
            {activity.outcome.success && activity.outcome.quantityFound && (
              <p>Resources Found: {activity.outcome.quantityFound} units of {activity.targetResource}</p>
            )}
            {activity.outcome.dangerEncountered && (
              <p>Danger Encountered: {activity.outcome.dangerEncountered}</p>
            )}
          </div>
        </div>
      )}

      {/* DM Notes */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">DM Notes</h3>
        <textarea
          value={activity.dmNotes || ''}
          onChange={(e) => onUpdate({ dmNotes: e.target.value })}
          placeholder="Add notes about the expedition, encounters, discoveries, or story elements..."
          className="w-full h-32 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 resize-none"
        />
      </div>

      {/* Outcome Modal */}
      {showOutcomeModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 border border-slate-600 rounded-lg p-6 max-w-lg w-full">
            <h3 className="text-xl font-bold text-white mb-4">Resolve Expedition Outcome</h3>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Expedition Result</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setOutcomeSuccess(true)}
                    className={`flex-1 px-3 py-2 rounded-lg transition-colors ${
                      outcomeSuccess 
                        ? 'bg-green-600 text-white' 
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    Success
                  </button>
                  <button
                    onClick={() => setOutcomeSuccess(false)}
                    className={`flex-1 px-3 py-2 rounded-lg transition-colors ${
                      !outcomeSuccess 
                        ? 'bg-red-600 text-white' 
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    Failure
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Roll Result (d20 or relevant check)</label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={rollInput}
                  onChange={(e) => setRollInput(e.target.value)}
                  placeholder="Enter roll result"
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400"
                />
              </div>

              {outcomeSuccess && (
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Quantity Found</label>
                  <input
                    type="number"
                    min="0"
                    value={quantityInput}
                    onChange={(e) => setQuantityInput(e.target.value)}
                    placeholder="How many units found?"
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Danger Encountered (optional)</label>
                <input
                  type="text"
                  value={dangerInput}
                  onChange={(e) => setDangerInput(e.target.value)}
                  placeholder="Monsters, traps, environmental hazards..."
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleSubmitOutcome}
                disabled={!rollInput || parseInt(rollInput) < 1}
                className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
              >
                Confirm Outcome
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