'use client';

import { CraftingActivity, craftingItems } from '@/data/downtime';
import { WrenchIcon } from '@heroicons/react/24/outline';

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
  return (
    <div className="max-w-4xl space-y-6">
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-blue-500/20 rounded-lg">
            <WrenchIcon className="h-8 w-8 text-blue-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Crafting Activity</h2>
            <p className="text-slate-400">{activity.characterName}</p>
          </div>
        </div>
        <p className="text-slate-300">Crafting tracker coming soon...</p>
      </div>
    </div>
  );
}