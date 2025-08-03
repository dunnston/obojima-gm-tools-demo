'use client';

import { NPC } from '@/data/npcs';
import { SessionNPC } from '@/data/sessions';
import { 
  XMarkIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';

interface NPCDetailsModalProps {
  npc: NPC;
  sessionNotes?: string;
  onClose: () => void;
}

export function NPCDetailsModal({ npc, sessionNotes, onClose }: NPCDetailsModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <UserGroupIcon className="h-6 w-6 text-blue-400" />
            <h2 className="text-2xl font-bold text-white">NPC Details</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto">
          <div className="space-y-6">
            {/* NPC Header */}
            <div className="flex items-start gap-4">
              <div className="w-24 h-24 rounded-lg overflow-hidden bg-slate-600 flex-shrink-0">
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
                    <UserGroupIcon className="h-12 w-12" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-white mb-2">{npc.name}</h3>
                {npc.occupation && (
                  <p className="text-emerald-400 text-lg mb-1">{npc.occupation}</p>
                )}
                {npc.location && (
                  <p className="text-slate-400 flex items-center gap-1">
                    <span>📍</span>
                    <span>{npc.location}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Details */}
            {npc.details && (
              <div className="bg-slate-700/30 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-slate-300 mb-2">Description</h4>
                <p className="text-white whitespace-pre-wrap">{npc.details}</p>
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
              <div className="bg-emerald-900/20 border border-emerald-400/30 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-emerald-400 mb-2">Session Notes</h4>
                <p className="text-white whitespace-pre-wrap">{sessionNotes}</p>
              </div>
            )}

            {/* Metadata */}
            <div className="text-xs text-slate-400 pt-4 border-t border-slate-700">
              <div className="flex justify-between">
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