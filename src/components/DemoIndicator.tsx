'use client';

import { useEffect, useState } from 'react';
import { BeakerIcon } from '@heroicons/react/24/outline';

export default function DemoIndicator() {
  const [isDemoMode, setIsDemoMode] = useState(false);

  useEffect(() => {
    setIsDemoMode(process.env.NEXT_PUBLIC_DEMO_MODE === 'true');
  }, []);

  if (!isDemoMode) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-amber-500/90 backdrop-blur-sm text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
        <BeakerIcon className="h-5 w-5" />
        <span className="text-sm font-medium">Demo Mode</span>
      </div>
    </div>
  );
}