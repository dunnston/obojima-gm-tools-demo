'use client';

import { useState } from 'react';
import { 
  SwordSchoolActivity,
  calculateWeeksElapsed,
  formatDowntimeDate,
  addMonths,
  hasDatePassed
} from '@/data/downtime';
import {
  CalendarDaysIcon,
  AcademicCapIcon,
  ShieldCheckIcon,
  TrophyIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  TrashIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

interface SwordSchoolTrackerProps {
  activity: SwordSchoolActivity;
  currentGameDate: Date;
  onUpdate: (updates: Partial<SwordSchoolActivity>) => void;
  onDelete: () => void;
}

export default function SwordSchoolTracker({
  activity,
  currentGameDate,
  onUpdate,
  onDelete
}: SwordSchoolTrackerProps) {
  const [newQuest, setNewQuest] = useState('');
  const [showDuelModal, setShowDuelModal] = useState(false);
  const [duelState, setDuelState] = useState<{
    playerHits: number;
    masterHits: number;
    currentTurn: 'player' | 'master';
    combatLog: Array<{ attacker: string; roll: number; ac: number; hit: boolean; damage?: number }>;
    gameOver: boolean;
    winner?: 'player' | 'master';
    waitingForRoll: boolean;
  }>({
    playerHits: 0,
    masterHits: 0,
    currentTurn: 'player',
    combatLog: [],
    gameOver: false,
    waitingForRoll: false
  });

  const [rollInput, setRollInput] = useState('');

  // Calculate current training progress
  const weeksElapsed = calculateWeeksElapsed(activity.startDate, currentGameDate);
  const totalWeeksTrained = activity.totalWeeksTrained + weeksElapsed;
  const currentMasterAC = Math.max(0, 30 - totalWeeksTrained);
  
  // Check if can attempt duel - fix date comparison
  const canAttemptDuel = !activity.attemptedDuel || 
    (activity.duelResult === 'fail' && activity.nextAttemptDate && currentGameDate >= new Date(activity.nextAttemptDate));

  const handleAddWeekTraining = () => {
    // Update the base weeks trained and reset start date to current game date
    // This prevents double-counting elapsed weeks
    const newWeeksTrained = totalWeeksTrained + 1;
    const newMasterAC = Math.max(0, 30 - newWeeksTrained);
    
    onUpdate({
      totalWeeksTrained: newWeeksTrained,
      currentMasterAC: newMasterAC,
      startDate: currentGameDate // Reset start date to prevent elapsed weeks from accumulating
    });
  };

  const handleStartDuel = () => {
    setDuelState({
      playerHits: 0,
      masterHits: 0,
      currentTurn: 'player',
      combatLog: [],
      gameOver: false,
      waitingForRoll: false
    });
    setRollInput('');
    setShowDuelModal(true);
  };

  const handleRequestRoll = () => {
    setDuelState(prev => ({
      ...prev,
      waitingForRoll: true
    }));
  };

  const handleSubmitRoll = () => {
    const roll = parseInt(rollInput);
    if (isNaN(roll) || roll < 1 || roll > 20) {
      return; // Invalid roll
    }

    const isPlayerTurn = duelState.currentTurn === 'player';
    const targetAC = isPlayerTurn ? currentMasterAC : 15;
    const hit = roll >= targetAC;
    
    const newCombatLog = [...duelState.combatLog, {
      attacker: isPlayerTurn ? activity.characterName : 'Master',
      roll,
      ac: targetAC,
      hit
    }];

    let newPlayerHits = duelState.playerHits;
    let newMasterHits = duelState.masterHits;
    
    if (hit) {
      if (isPlayerTurn) {
        newPlayerHits += 1;
      } else {
        newMasterHits += 1;
      }
    }

    const gameOver = newPlayerHits >= 3 || newMasterHits >= 3;
    const winner = newPlayerHits >= 3 ? 'player' : newMasterHits >= 3 ? 'master' : undefined;

    setDuelState({
      playerHits: newPlayerHits,
      masterHits: newMasterHits,
      currentTurn: gameOver ? duelState.currentTurn : (isPlayerTurn ? 'master' : 'player'),
      combatLog: newCombatLog,
      gameOver,
      winner,
      waitingForRoll: false
    });

    setRollInput('');

    // If duel is over, update the activity
    if (gameOver) {
      const success = winner === 'player';
      onUpdate({
        attemptedDuel: true,
        duelResult: success ? 'success' : 'fail',
        nextAttemptDate: success ? undefined : addMonths(currentGameDate, 3),
        masterTechniqueLearned: success,
        status: success ? 'completed' : activity.status
      });
    }
  };

  const handleAddQuest = () => {
    if (newQuest.trim()) {
      onUpdate({
        questsCompleted: [...activity.questsCompleted, newQuest.trim()]
      });
      setNewQuest('');
    }
  };

  const handleRemoveQuest = (index: number) => {
    onUpdate({
      questsCompleted: activity.questsCompleted.filter((_, i) => i !== index)
    });
  };

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-500/20 rounded-lg">
              <AcademicCapIcon className="h-8 w-8 text-red-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Sword School Training</h2>
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
            <ShieldCheckIcon className="h-8 w-8 text-blue-400 mx-auto mb-2" />
            <div className="text-3xl font-bold text-white">{currentMasterAC}</div>
            <div className="text-sm text-slate-400">Master's AC</div>
          </div>
          
          <div className="text-center p-4 bg-slate-700/50 rounded-lg">
            <CalendarDaysIcon className="h-8 w-8 text-emerald-400 mx-auto mb-2" />
            <div className="text-3xl font-bold text-white">{totalWeeksTrained}</div>
            <div className="text-sm text-slate-400">Weeks Trained</div>
          </div>

          <div className="text-center p-4 bg-slate-700/50 rounded-lg">
            <TrophyIcon className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
            <div className="text-3xl font-bold text-white">
              {activity.masterTechniqueLearned ? 'Yes' : 'No'}
            </div>
            <div className="text-sm text-slate-400">Master Technique</div>
          </div>
        </div>
      </div>

      {/* Training Progress */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Training Progress</h3>
        
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-400">Master AC Reduction</span>
              <span className="text-sm text-slate-300">{totalWeeksTrained} / 30 weeks</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-red-500 to-orange-500 h-2 rounded-full transition-all"
                style={{ width: `${Math.min((totalWeeksTrained / 30) * 100, 100)}%` }}
              />
            </div>
          </div>

          <button
            onClick={handleAddWeekTraining}
            className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            Log Week of Training (+1)
          </button>
        </div>
      </div>

      {/* Master Duel */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Master Duel</h3>
        
        {activity.attemptedDuel && (
          <div className={`p-4 rounded-lg mb-4 ${
            activity.duelResult === 'success' 
              ? 'bg-green-500/20 border border-green-400/50' 
              : 'bg-red-500/20 border border-red-400/50'
          }`}>
            <div className="flex items-center gap-2">
              {activity.duelResult === 'success' ? (
                <CheckIcon className="h-5 w-5 text-green-400" />
              ) : (
                <XMarkIcon className="h-5 w-5 text-red-400" />
              )}
              <span className="font-medium text-white">
                Duel Result: {activity.duelResult === 'success' ? 'Victory!' : 'Defeat'}
              </span>
            </div>
            
            {activity.duelResult === 'fail' && activity.nextAttemptDate && (
              <p className="text-sm text-slate-300 mt-2">
                Next attempt available: {formatDowntimeDate(activity.nextAttemptDate)}
              </p>
            )}
          </div>
        )}

        {canAttemptDuel && !activity.masterTechniqueLearned ? (
          <button
            onClick={handleStartDuel}
            className="w-full px-4 py-3 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-semibold rounded-lg transition-all"
          >
            Challenge Master to Duel (First to 3 Hits)
          </button>
        ) : !activity.masterTechniqueLearned ? (
          <div className="text-center p-4 bg-slate-700/50 rounded-lg">
            <ExclamationTriangleIcon className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
            <p className="text-slate-300">
              Cannot attempt duel until {activity.nextAttemptDate && formatDowntimeDate(activity.nextAttemptDate)}
            </p>
          </div>
        ) : (
          <div className="text-center p-4 bg-green-500/20 border border-green-400/50 rounded-lg">
            <TrophyIcon className="h-8 w-8 text-green-400 mx-auto mb-2" />
            <p className="text-green-300 font-semibold">Master Technique Learned!</p>
          </div>
        )}
      </div>

      {/* Quests & Charity Work */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Quests & Charity Work</h3>
        
        <div className="space-y-3 mb-4">
          {activity.questsCompleted.map((quest, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
              <span className="text-slate-300">{quest}</span>
              <button
                onClick={() => handleRemoveQuest(index)}
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
            onKeyPress={(e) => e.key === 'Enter' && handleAddQuest()}
            placeholder="Add quest or charity work..."
            className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400"
          />
          <button
            onClick={handleAddQuest}
            className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
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
          placeholder="Add notes about training, roleplay moments, or story developments..."
          className="w-full h-32 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 resize-none"
        />
      </div>

      {/* Interactive Duel Modal */}
      {showDuelModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 border border-slate-600 rounded-lg p-6 max-w-2xl w-full">
            <h3 className="text-xl font-bold text-white mb-4">Master Duel - First to 3 Hits</h3>
            
            {/* Hit Counter */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="text-center p-4 bg-slate-700/50 rounded-lg">
                <div className="text-2xl font-bold text-blue-400">{duelState.playerHits}</div>
                <div className="text-sm text-slate-300">{activity.characterName}</div>
              </div>
              <div className="text-center p-4 bg-slate-700/50 rounded-lg">
                <div className="text-2xl font-bold text-red-400">{duelState.masterHits}</div>
                <div className="text-sm text-slate-300">Master (AC {currentMasterAC})</div>
              </div>
            </div>

            {/* Combat Log */}
            <div className="mb-6 max-h-40 overflow-y-auto">
              <h4 className="text-sm font-semibold text-slate-400 mb-2">Combat Log</h4>
              <div className="space-y-1">
                {duelState.combatLog.map((entry, index) => (
                  <div key={index} className="text-sm text-slate-300 p-2 bg-slate-700/30 rounded">
                    <span className={entry.attacker === activity.characterName ? 'text-blue-400' : 'text-red-400'}>
                      {entry.attacker}
                    </span> rolls {entry.roll} vs AC {entry.ac}: 
                    <span className={entry.hit ? 'text-green-400 ml-1' : 'text-red-400 ml-1'}>
                      {entry.hit ? 'HIT!' : 'Miss'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Game State */}
            {!duelState.gameOver ? (
              <div className="space-y-4">
                <div className="text-center">
                  <span className="text-slate-300">Current Turn: </span>
                  <span className={duelState.currentTurn === 'player' ? 'text-blue-400 font-semibold' : 'text-red-400 font-semibold'}>
                    {duelState.currentTurn === 'player' ? activity.characterName : 'Master'}
                  </span>
                  <div className="text-sm text-slate-400 mt-1">
                    Target AC: {duelState.currentTurn === 'player' ? currentMasterAC : 15}
                  </div>
                </div>
                
                {!duelState.waitingForRoll ? (
                  <button
                    onClick={handleRequestRoll}
                    className={`w-full px-4 py-3 text-white font-semibold rounded-lg transition-colors ${
                      duelState.currentTurn === 'player' 
                        ? 'bg-blue-600 hover:bg-blue-700' 
                        : 'bg-red-600 hover:bg-red-700'
                    }`}
                  >
                    {duelState.currentTurn === 'player' ? 'Roll Attack (d20)' : 'Master Attacks (d20)'}
                  </button>
                ) : (
                  <div className="space-y-3">
                    <div className="text-center text-slate-300">
                      Enter your d20 roll result:
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        min="1"
                        max="20"
                        value={rollInput}
                        onChange={(e) => setRollInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSubmitRoll()}
                        placeholder="1-20"
                        className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 text-center"
                        autoFocus
                      />
                      <button
                        onClick={handleSubmitRoll}
                        disabled={!rollInput || parseInt(rollInput) < 1 || parseInt(rollInput) > 20}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                      >
                        Submit
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className={`p-4 rounded-lg text-center mb-4 ${
                duelState.winner === 'player'
                  ? 'bg-green-500/20 border border-green-400/50'
                  : 'bg-red-500/20 border border-red-400/50'
              }`}>
                <div className="text-2xl font-bold mb-2">
                  {duelState.winner === 'player' ? (
                    <span className="text-green-400">Victory!</span>
                  ) : (
                    <span className="text-red-400">Defeat!</span>
                  )}
                </div>
                <p className="text-slate-300">
                  {duelState.winner === 'player'
                    ? 'You have mastered the technique!'
                    : 'Train harder and try again in 3 months.'}
                </p>
              </div>
            )}

            <button
              onClick={() => setShowDuelModal(false)}
              className="w-full px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition-colors"
            >
              {duelState.gameOver ? 'Close' : 'Cancel Duel'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}