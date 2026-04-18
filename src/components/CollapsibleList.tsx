'use client';

import { ReactNode, useState } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

interface CollapsibleSectionProps {
  title: string;
  count?: number;
  defaultOpen?: boolean;
  children: ReactNode;
  headerAccessory?: ReactNode;
}

export function CollapsibleSection({
  title,
  count,
  defaultOpen = false,
  children,
  headerAccessory,
}: CollapsibleSectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="rounded-lg border border-slate-700 bg-slate-900/30 overflow-hidden">
      <div className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-slate-800/40">
        <button
          type="button"
          onClick={() => setOpen(o => !o)}
          className="flex-1 flex items-center gap-2 text-left"
        >
          <ChevronDownIcon
            className={`h-4 w-4 text-slate-400 transition-transform ${open ? '' : '-rotate-90'}`}
          />
          <span className="text-sm font-semibold text-amber-300/90 uppercase tracking-wider">
            {title}
          </span>
          {typeof count === 'number' && (
            <span className="text-xs text-slate-400">({count})</span>
          )}
        </button>
        {headerAccessory}
      </div>
      {open && <div className="p-3 sm:p-4 space-y-2">{children}</div>}
    </div>
  );
}

interface CollapsibleRowProps {
  summary: ReactNode;
  details: ReactNode;
  defaultOpen?: boolean;
  rowAccessory?: ReactNode;
}

export function CollapsibleRow({
  summary,
  details,
  defaultOpen = false,
  rowAccessory,
}: CollapsibleRowProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="rounded-lg border border-slate-700/70 bg-slate-800/30 overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2">
        <button
          type="button"
          onClick={() => setOpen(o => !o)}
          className="flex-1 flex items-center gap-2 text-left min-w-0"
        >
          <ChevronDownIcon
            className={`h-4 w-4 text-slate-400 transition-transform flex-shrink-0 ${open ? '' : '-rotate-90'}`}
          />
          <div className="flex-1 min-w-0">{summary}</div>
        </button>
        {rowAccessory}
      </div>
      {open && (
        <div className="px-3 pb-3 pt-1 border-t border-slate-700/50">{details}</div>
      )}
    </div>
  );
}
