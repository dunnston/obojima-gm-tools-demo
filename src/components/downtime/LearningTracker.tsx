'use client';

import { LearningActivity } from '@/data/downtime';
import { BookOpenIcon } from '@heroicons/react/24/outline';

interface LearningTrackerProps {
  activity: LearningActivity;
  currentGameDate: Date;
  onUpdate: (updates: Partial<LearningActivity>) => void;
  onDelete: () => void;
}

export default function LearningTracker({
  activity,
  currentGameDate,
  onUpdate,
  onDelete
}: LearningTrackerProps) {
  return (
    <div className="max-w-4xl space-y-6">
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-indigo-500/20 rounded-lg">
            <BookOpenIcon className="h-8 w-8 text-indigo-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Learning & Study</h2>
            <p className="text-slate-400">{activity.characterName}</p>
          </div>
        </div>
        <p className="text-slate-300">Learning tracker coming soon...</p>
      </div>
    </div>
  );
}