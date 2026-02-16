'use client';

import { NPC } from '@/data/npcs';
import { SessionNPC } from '@/data/sessions';
import {
  XMarkIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import MentionText from './MentionText';

interface NPCDetailsModalProps {
  npc: NPC;
  sessionNotes?: string;
  onClose: () => void;
}

export function NPCDetailsModal({ npc, sessionNotes, onClose }: NPCDetailsModalProps) {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-2 sm:p-4 z-50" onClick={onClose}>
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 rounded-2xl w-full max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-700 flex-shrink-0">
          <div className="flex items-center gap-3">
            <UserGroupIcon className="h-6 w-6 text-blue-400" />
            <h2 className="text-xl sm:text-2xl font-bold text-white">NPC Details</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2.5 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          <div className="space-y-6">
            {/* NPC Header */}
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-lg overflow-hidden bg-slate-600 flex-shrink-0">
                {npc.portrait ? (
                  <img
                    src={npc.portrait}
                    alt={npc.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = '/images/npcs/default-npc.svg';
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400">
                    <UserGroupIcon className="h-8 w-8 sm:h-12 sm:w-12" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-1 sm:mb-2 break-words">{npc.name}</h3>
                {npc.occupation && (
                  <p className="text-emerald-400 text-base sm:text-lg mb-1">{npc.occupation}</p>
                )}
                {npc.location && (
                  <p className="text-slate-400 flex items-center gap-1">
                    <span>📍</span>
                    <span className="break-words">{npc.location}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Details */}
            {npc.details && (
              <div className="bg-slate-700/30 rounded-lg p-3 sm:p-4">
                <h4 className="text-sm font-semibold text-slate-300 mb-2">Description</h4>
                <MentionText text={npc.details} className="text-white whitespace-pre-wrap break-words" />
              </div>
            )}

            {/* Tags */}
            {npc.tags && npc.tags.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-slate-300 mb-2">Tags</h4>
                <div className="flex flex-wrap gap-2">
                  {npc.tags.map(tag => (
                    <span key={tag} className="px-3 py-1 bg-slate-700 rounded-full text-sm text-slate-300">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Session Notes */}
            {sessionNotes && (
              <div className="bg-emerald-900/20 border border-emerald-400/30 rounded-lg p-3 sm:p-4">
                <h4 className="text-sm font-semibold text-emerald-400 mb-2">Session Notes</h4>
                <MentionText text={sessionNotes || ''} className="text-white whitespace-pre-wrap break-words" />
              </div>
            )}

            {/* Metadata */}
            <div className="text-xs text-slate-400 pt-4 border-t border-slate-700">
              <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                <span>Created: {new Date(npc.created_at).toLocaleDateString()}</span>
                <span>Updated: {new Date(npc.updated_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
