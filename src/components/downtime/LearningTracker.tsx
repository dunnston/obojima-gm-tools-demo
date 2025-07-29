'use client';

import { useState } from 'react';
import { LearningActivity, calculateDaysElapsed, formatDowntimeDate, formatDowntimeObojimaDate } from '@/data/downtime';
import {
  BookOpenIcon,
  CalendarDaysIcon,
  AcademicCapIcon,
  CheckIcon,
  ChartBarIcon,
  SparklesIcon,
  TrashIcon,
  LightBulbIcon,
  UserIcon
} from '@heroicons/react/24/outline';

interface LearningTrackerProps {
  activity: LearningActivity;
  currentGameDate: Date;
  onUpdate: (updates: Partial<LearningActivity>) => void;
  onDelete: () => void;
}

// Common subjects for learning
const learningSubjects = [
  'Language (Common)',
  'Language (Elvish)',
  'Language (Dwarvish)',
  'Language (Giant)',
  'Language (Draconic)',
  'Language (Celestial)',
  'Language (Infernal)',
  'Language (Abyssal)',
  'History',
  'Arcana',
  'Religion',
  'Nature',
  'Medicine',
  'Investigation',
  'Survival',
  'Performance',
  'Persuasion',
  'Deception',
  'Intimidation',
  'Insight',
  'Perception',
  'Sleight of Hand',
  'Stealth',
  'Acrobatics',
  'Athletics',
  'Thieves\' Tools',
  'Forgery Kit',
  'Disguise Kit',
  'Herbalism Kit',
  'Alchemist\'s Supplies',
  'Calligrapher\'s Supplies',
  'Cartographer\'s Tools',
  'Cook\'s Utensils',
  'Gaming Set',
  'Musical Instrument',
  'Navigator\'s Tools',
  'Poisoner\'s Kit'
];

export default function LearningTracker({
  activity,
  currentGameDate,
  onUpdate,
  onDelete
}: LearningTrackerProps) {
  const [showResultModal, setShowResultModal] = useState(false);
  const [proficiencyInput, setproficiencyInput] = useState('');
  const [loreInput, setLoreInput] = useState('');
  const [abilityInput, setAbilityInput] = useState('');
  const [progressInput, setProgressInput] = useState('100');

  // Calculate progress
  const daysElapsed = calculateDaysElapsed(activity.startDate, currentGameDate);
  const totalDaysSpent = activity.daysSpent + daysElapsed;
  const isStudyComplete = totalDaysSpent >= activity.duration;
  const canSetResult = isStudyComplete && !activity.result;
  
  // Calculate automatic progress based on time
  const automaticProgress = Math.min((totalDaysSpent / activity.duration) * 100, 100);

  const handleUpdateField = (field: keyof LearningActivity, value: any) => {
    onUpdate({ [field]: value });
  };

  const handleAddStudyDay = () => {
    const newDaysSpent = activity.daysSpent + 1;
    onUpdate({ 
      daysSpent: newDaysSpent,
      status: newDaysSpent >= activity.duration ? 'completed' : activity.status
    });
  };

  const handleShowResultModal = () => {
    setShowResultModal(true);
    setproficiencyInput('');
    setLoreInput('');
    setAbilityInput('');
    setProgressInput('100');
  };

  const handleSubmitResult = () => {
    const progress = parseInt(progressInput) || 100;
    
    onUpdate({
      result: {
        proficiencyGained: proficiencyInput.trim() || undefined,
        loreLearned: loreInput.trim() || undefined,
        abilityUnlocked: abilityInput.trim() || undefined,
        progress: Math.min(Math.max(progress, 0), 100)
      },
      status: 'completed'
    });

    setShowResultModal(false);
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 100) return 'text-green-400';
    if (progress >= 75) return 'text-blue-400';
    if (progress >= 50) return 'text-yellow-400';
    if (progress >= 25) return 'text-orange-400';
    return 'text-red-400';
  };

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-500/20 rounded-lg">
              <BookOpenIcon className="h-8 w-8 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Learning & Study</h2>
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
            <div className="text-3xl font-bold text-white">{totalDaysSpent}/{activity.duration}</div>
            <div className="text-sm text-slate-400">Days Studied</div>
          </div>
          
          <div className="text-center p-4 bg-slate-700/50 rounded-lg">
            <ChartBarIcon className="h-8 w-8 text-emerald-400 mx-auto mb-2" />
            <div className={`text-3xl font-bold ${getProgressColor(automaticProgress)}`}>
              {Math.round(automaticProgress)}%
            </div>
            <div className="text-sm text-slate-400">Progress</div>
          </div>

          <div className="text-center p-4 bg-slate-700/50 rounded-lg">
            <AcademicCapIcon className="h-8 w-8 text-purple-400 mx-auto mb-2" />
            <div className="text-3xl font-bold text-white">
              {activity.result ? 'Complete' : 'Studying'}
            </div>
            <div className="text-sm text-slate-400">Status</div>
          </div>
        </div>
      </div>

      {/* Study Details */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Study Details</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Subject of Study</label>
            <select
              value={activity.subject}
              onChange={(e) => handleUpdateField('subject', e.target.value)}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
            >
              <option value="">Select a subject...</option>
              {learningSubjects.map((subject, index) => (
                <option key={index} value={subject}>{subject}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Study Duration (days)</label>
            <input
              type="number"
              min="1"
              value={activity.duration}
              onChange={(e) => handleUpdateField('duration', parseInt(e.target.value) || 1)}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-300 mb-2">Instructor/Source (optional)</label>
            <input
              type="text"
              value={activity.instructor || ''}
              onChange={(e) => handleUpdateField('instructor', e.target.value)}
              placeholder="e.g., Master Wei, Ancient Tome, Library of Alexandria"
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400"
            />
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-400">Study Progress</span>
            <span className="text-sm text-slate-300">{Math.round(automaticProgress)}% Complete</span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-indigo-500 to-purple-500 h-3 rounded-full transition-all"
              style={{ width: `${automaticProgress}%` }}
            />
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleAddStudyDay}
            disabled={automaticProgress >= 100}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
          >
            Log Day of Study (+{Math.round(100 / activity.duration)}%)
          </button>

          {canSetResult && (
            <button
              onClick={handleShowResultModal}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
            >
              Record Learning Outcomes
            </button>
          )}
        </div>
      </div>

      {/* Instructor Info */}
      {activity.instructor && (
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-3">
            <UserIcon className="h-5 w-5 text-indigo-400" />
            <h3 className="text-lg font-semibold text-white">Learning From</h3>
          </div>
          <p className="text-slate-300">{activity.instructor}</p>
        </div>
      )}

      {/* Learning Results */}
      {activity.result && (
        <div className="bg-green-500/20 border border-green-400/50 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <CheckIcon className="h-5 w-5 text-green-400" />
            <h3 className="text-lg font-semibold text-white">Learning Complete!</h3>
          </div>
          
          <div className="space-y-3">
            {activity.result.proficiencyGained && (
              <div className="flex items-start gap-2">
                <SparklesIcon className="h-5 w-5 text-yellow-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-slate-300">Proficiency Gained:</p>
                  <p className="text-white">{activity.result.proficiencyGained}</p>
                </div>
              </div>
            )}
            
            {activity.result.loreLearned && (
              <div className="flex items-start gap-2">
                <BookOpenIcon className="h-5 w-5 text-blue-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-slate-300">Lore Learned:</p>
                  <p className="text-white">{activity.result.loreLearned}</p>
                </div>
              </div>
            )}
            
            {activity.result.abilityUnlocked && (
              <div className="flex items-start gap-2">
                <LightBulbIcon className="h-5 w-5 text-purple-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-slate-300">Ability Unlocked:</p>
                  <p className="text-white">{activity.result.abilityUnlocked}</p>
                </div>
              </div>
            )}
            
            <div className="mt-4 pt-3 border-t border-green-400/30">
              <p className="text-sm text-slate-300">
                Learning Progress: <span className={`font-semibold ${getProgressColor(activity.result.progress)}`}>
                  {activity.result.progress}%
                </span>
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
          placeholder="Add notes about the learning process, breakthroughs, challenges, or story elements..."
          className="w-full h-32 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 resize-none"
        />
      </div>

      {/* Result Modal */}
      {showResultModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 border border-slate-600 rounded-lg p-6 max-w-lg w-full">
            <h3 className="text-xl font-bold text-white mb-4">Record Learning Outcomes</h3>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Proficiency Gained (optional)
                </label>
                <input
                  type="text"
                  value={proficiencyInput}
                  onChange={(e) => setproficiencyInput(e.target.value)}
                  placeholder="e.g., Elvish Language, Thieves' Tools"
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Lore or Knowledge Learned (optional)
                </label>
                <textarea
                  value={loreInput}
                  onChange={(e) => setLoreInput(e.target.value)}
                  placeholder="Describe important information, history, or secrets discovered..."
                  className="w-full h-20 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Special Ability Unlocked (optional)
                </label>
                <input
                  type="text"
                  value={abilityInput}
                  onChange={(e) => setAbilityInput(e.target.value)}
                  placeholder="e.g., Ritual Casting, Specific Feat"
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Learning Progress (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={progressInput}
                  onChange={(e) => setProgressInput(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                />
                <p className="text-xs text-slate-400 mt-1">
                  Set lower than 100% if learning was incomplete or partial
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleSubmitResult}
                className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
              >
                Record Outcomes
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