'use client';

import { GatheringActivity } from '@/data/downtime';
import { MapIcon } from '@heroicons/react/24/outline';

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
  return (
    <div className="max-w-4xl space-y-6">
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-green-500/20 rounded-lg">
            <MapIcon className="h-8 w-8 text-green-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Gathering & Exploration</h2>
            <p className="text-slate-400">{activity.characterName}</p>
          </div>
        </div>
        <p className="text-slate-300">Gathering tracker coming soon...</p>
      </div>
    </div>
  );
}