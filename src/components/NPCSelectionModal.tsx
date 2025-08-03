'use client';

import { useState, useEffect } from 'react';
import { NPC } from '@/data/npcs';
import { syncService } from '@/services/sync';
import { 
  XMarkIcon,
  UserGroupIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';

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
      <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div className="bg-slate-800 rounded-lg p-6">
          <div className="text-white">Loading NPCs...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <UserGroupIcon className="h-6 w-6 text-blue-400" />
            <h2 className="text-2xl font-bold text-white">Add NPCs</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="flex h-[70vh]">
          {/* NPC List */}
          <div className="w-1/2 border-r border-slate-700">
            <div className="p-4 border-b border-slate-700">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-emerald-400"
                  placeholder="Search NPCs..."
                />
              </div>
            </div>
            
            <div className="overflow-y-auto h-full p-4">
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
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-600 flex-shrink-0">
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
                              <UserGroupIcon className="h-8 w-8" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">{npc.name}</div>
                          {npc.occupation && (
                            <div className="text-sm text-slate-400">{npc.occupation}</div>
                          )}
                          {npc.location && (
                            <div className="text-xs text-slate-500">📍 {npc.location}</div>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Details Panel */}
          <div className="w-1/2 p-6">
            {selectedNPC ? (
              <div className="space-y-4">
                <div>
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-20 h-20 rounded-lg overflow-hidden bg-slate-600 flex-shrink-0">
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
                          <UserGroupIcon className="h-12 w-12" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white mb-2">{selectedNPC.name}</h3>
                      {selectedNPC.occupation && (
                        <p className="text-emerald-400 mb-1">{selectedNPC.occupation}</p>
                      )}
                      {selectedNPC.location && (
                        <p className="text-slate-400 text-sm">📍 {selectedNPC.location}</p>
                      )}
                    </div>
                  </div>
                  
                  {selectedNPC.details && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-slate-300 mb-2">Details</h4>
                      <p className="text-slate-300 text-sm">{selectedNPC.details}</p>
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

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Session Notes
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-emerald-400 resize-none"
                      placeholder="Notes specific to this session..."
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAdd}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
                  >
                    Add NPC
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
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