'use client';

import { FactionWorkActivity } from '@/data/downtime';
import { BuildingOfficeIcon } from '@heroicons/react/24/outline';

interface FactionWorkTrackerProps {
  activity: FactionWorkActivity;
  currentGameDate: Date;
  onUpdate: (updates: Partial<FactionWorkActivity>) => void;
  onDelete: () => void;
}

export default function FactionWorkTracker({
  activity,
  currentGameDate,
  onUpdate,
  onDelete
}: FactionWorkTrackerProps) {
  return (
    <div className="max-w-4xl space-y-6">
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-gray-500/20 rounded-lg">
            <BuildingOfficeIcon className="h-8 w-8 text-gray-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Faction Work</h2>
            <p className="text-slate-400">{activity.characterName}</p>
          </div>
        </div>
        <p className="text-slate-300">Faction work tracker coming soon...</p>
      </div>
    </div>
  );
}