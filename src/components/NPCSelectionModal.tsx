'use client';

import { useState, useEffect } from 'react';
import { NPC } from '@/data/npcs';
import { syncService } from '@/services/sync';
import {
  XMarkIcon,
  UserGroupIcon,
  MagnifyingGlassIcon,
  ChevronLeftIcon
} from '@heroicons/react/24/outline';
import MentionTextarea from './MentionTextarea';

// NPC Selection Modal
export function NPCSelectionModal({
  onAdd,
  onClose
}: {
  onAdd: (npcId: string, notes?: string) => void;
  onClose: () => void;
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNPC, setSelectedNPC] = useState<NPC | null>(null);
  const [notes, setNotes] = useState('');
  const [npcs, setNPCs] = useState<NPC[]>([]);
  const [loading, setLoading] = useState(true);

  // Load NPCs from the database
  useEffect(() => {
    const loadNPCs = async () => {
      try {
        const result = await syncService.getNpcs();
        if (result.success && result.data) {
          setNPCs(result.data);
        }
      } catch (error) {
        console.error('Error loading NPCs:', error);
      } finally {
        setLoading(false);
      }
    };
    loadNPCs();
  }, []);

  const filteredNPCs = npcs.filter(npc =>
    npc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    npc.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
    npc.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    npc.occupation?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAdd = () => {
    if (selectedNPC) {
      onAdd(selectedNPC.id, notes || undefined);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50" onClick={onClose}>
        <div className="bg-slate-800 rounded-lg p-6" onClick={(e) => e.stopPropagation()}>
          <div className="text-white">Loading NPCs...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-2 sm:p-4 z-50" onClick={onClose}>
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 rounded-2xl w-full max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-700 flex-shrink-0">
          <div className="flex items-center gap-3">
            {/* Back button on mobile when viewing details */}
            {selectedNPC && (
              <button
                onClick={() => setSelectedNPC(null)}
                className="lg:hidden p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors"
              >
                <ChevronLeftIcon className="h-5 w-5" />
              </button>
            )}
            <UserGroupIcon className="h-6 w-6 text-blue-400" />
            <h2 className="text-xl sm:text-2xl font-bold text-white">Add NPCs</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2.5 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Content - stacks on mobile, side-by-side on desktop */}
        <div className="flex flex-col lg:flex-row flex-1 min-h-0 overflow-hidden">
          {/* NPC List - hidden on mobile when NPC is selected */}
          <div className={`${selectedNPC ? 'hidden lg:flex' : 'flex'} flex-col w-full lg:w-1/2 lg:border-r border-slate-700 min-h-0`}>
            <div className="p-3 sm:p-4 border-b border-slate-700 flex-shrink-0">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-emerald-400"
                  placeholder="Search NPCs..."
                />
              </div>
            </div>

            <div className="overflow-y-auto flex-1 p-3 sm:p-4">
              {filteredNPCs.length === 0 ? (
                <div className="text-center py-12">
                  <UserGroupIcon className="h-16 w-16 text-slate-400 mx-auto mb-4 opacity-50" />
                  <h3 className="text-xl font-semibold text-white mb-2">No NPCs Found</h3>
                  <p className="text-slate-400">Create NPCs in the Database tab first</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredNPCs.map((npc) => (
                    <button
                      key={npc.id}
                      onClick={() => setSelectedNPC(npc)}
                      className={`w-full p-3 text-left rounded-lg transition-colors border ${
                        selectedNPC?.id === npc.id
                          ? 'bg-emerald-600/20 border-emerald-400 text-white'
                          : 'bg-slate-700/30 border-slate-600 text-slate-200 hover:bg-slate-700/50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg overflow-hidden bg-slate-600 flex-shrink-0">
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
                              <UserGroupIcon className="h-6 w-6 sm:h-8 sm:w-8" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">{npc.name}</div>
                          {npc.occupation && (
                            <div className="text-sm text-slate-400 truncate">{npc.occupation}</div>
                          )}
                          {npc.location && (
                            <div className="text-xs text-slate-500 truncate">📍 {npc.location}</div>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Details Panel - full width on mobile when selected, half on desktop */}
          <div className={`${selectedNPC ? 'flex' : 'hidden lg:flex'} flex-col w-full lg:w-1/2 min-h-0`}>
            {selectedNPC ? (
              <div className="flex flex-col flex-1 min-h-0">
                <div className="overflow-y-auto flex-1 p-4 sm:p-6">
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-start gap-4 mb-4">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden bg-slate-600 flex-shrink-0">
                          {selectedNPC.portrait ? (
                            <img
                              src={selectedNPC.portrait}
                              alt={selectedNPC.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.src = '/images/npcs/default-npc.svg';
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400">
                              <UserGroupIcon className="h-10 w-10 sm:h-12 sm:w-12" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg sm:text-xl font-bold text-white mb-1 sm:mb-2 break-words">{selectedNPC.name}</h3>
                          {selectedNPC.occupation && (
                            <p className="text-emerald-400 text-sm sm:text-base mb-1">{selectedNPC.occupation}</p>
                          )}
                          {selectedNPC.location && (
                            <p className="text-slate-400 text-sm">📍 {selectedNPC.location}</p>
                          )}
                        </div>
                      </div>

                      {selectedNPC.details && (
                        <div className="mb-4">
                          <h4 className="text-sm font-medium text-slate-300 mb-2">Details</h4>
                          <p className="text-slate-300 text-sm break-words">{selectedNPC.details}</p>
                        </div>
                      )}

                      {selectedNPC.tags && selectedNPC.tags.length > 0 && (
                        <div className="mb-4">
                          <h4 className="text-sm font-medium text-slate-300 mb-2">Tags</h4>
                          <div className="flex flex-wrap gap-1">
                            {selectedNPC.tags.map(tag => (
                              <span key={tag} className="px-2 py-1 bg-slate-600 rounded text-xs text-slate-300">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Session Notes
                      </label>
                      <MentionTextarea
                        value={notes}
                        onChange={(value) => setNotes(value)}
                        rows={3}
                        className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-emerald-400 resize-none"
                        placeholder="Notes specific to this session..."
                      />
                    </div>
                  </div>
                </div>

                {/* Action buttons pinned to bottom */}
                <div className="flex justify-end gap-3 p-4 sm:p-6 pt-3 border-t border-slate-700 flex-shrink-0">
                  <button
                    onClick={onClose}
                    className="px-4 py-2.5 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAdd}
                    className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
                  >
                    Add NPC
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 px-4">
                <UserGroupIcon className="h-16 w-16 text-slate-400 mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-semibold text-white mb-2">Select an NPC</h3>
                <p className="text-slate-400">Choose an NPC from the list to add to your session</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
