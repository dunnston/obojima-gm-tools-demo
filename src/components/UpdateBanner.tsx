'use client';

import { ArrowDownTrayIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface UpdateBannerProps {
  version: string;
  onDismiss: () => void;
  onClick: () => void;
}

export default function UpdateBanner({ version, onDismiss, onClick }: UpdateBannerProps) {
  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-4 py-2 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button
            onClick={onClick}
            className="flex items-center gap-2 hover:opacity-90 transition-opacity flex-1"
          >
            <ArrowDownTrayIcon className="h-5 w-5" />
            <span className="font-medium">
              A new version ({version}) is available!
            </span>
            <span className="text-emerald-100 text-sm ml-2">
              Click to update
            </span>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDismiss();
            }}
            className="p-1 hover:bg-white/20 rounded transition-colors"
            aria-label="Dismiss update notification"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
