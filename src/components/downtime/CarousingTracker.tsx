'use client';

import { CarousingActivity } from '@/data/downtime';
import { MusicalNoteIcon } from '@heroicons/react/24/outline';

interface CarousingTrackerProps {
  activity: CarousingActivity;
  currentGameDate: Date;
  onUpdate: (updates: Partial<CarousingActivity>) => void;
  onDelete: () => void;
}

export default function CarousingTracker({
  activity,
  currentGameDate,
  onUpdate,
  onDelete
}: CarousingTrackerProps) {
  return (
    <div className="max-w-4xl space-y-6">
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-yellow-500/20 rounded-lg">
            <MusicalNoteIcon className="h-8 w-8 text-yellow-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Carousing</h2>
            <p className="text-slate-400">{activity.characterName}</p>
          </div>
        </div>
        <p className="text-slate-300">Carousing tracker coming soon...</p>
      </div>
    </div>
  );
}