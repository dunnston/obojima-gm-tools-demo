'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { NPC } from '@/data/npcs';
import { NPCEditForm } from './EditForms';
import { NPCDetailsModal } from './NPCDetailsModal';
import { syncService } from '@/services/sync';
import { useNPCs } from '@/contexts/NPCContext';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  UserGroupIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  ArrowPathIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';

export default function NPCManager() {
  const [npcs, setNPCs] = useState<NPC[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingNPC, setEditingNPC] = useState<NPC | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNPC, setSelectedNPC] = useState<NPC | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'error'>('idle');
  const [filterLocation, setFilterLocation] = useState('');
  const [filterTag, setFilterTag] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'location' | 'recent'>('name');
  const [showFilters, setShowFilters] = useState(false);
  const { t } = useTranslation();
  const { refreshNpcs } = useNPCs();

  const loadNPCs = async () => {
    setSyncStatus('syncing');
    try {
      const result = await syncService.getNpcs();
      if (result.success && result.data) {
        setNPCs(result.data);
        setSyncStatus('idle');
      } else {
        const saved = localStorage.getItem('obojima-npcs');
        if (saved) {
          try { setNPCs(JSON.parse(saved)); } catch {}
        }
        setSyncStatus('error');
      }
    } catch (error) {
      console.error('Error loading NPCs:', error);
      setSyncStatus('error');
      try {
        const saved = localStorage.getItem('obojima-npcs');
        if (saved) setNPCs(JSON.parse(saved));
      } catch {}
    }
  };

  useEffect(() => {
    loadNPCs();
    syncService.startSync(loadNPCs, 5000);
    return () => { syncService.stopSync(); };
  }, []);

  const handleAddNPC = async (npcData: any) => {
    const newNPC: NPC = {
      ...npcData,
      id: `npc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      created_at: new Date(),
      updated_at: new Date(),
    };

    const updated = [...npcs, newNPC];
    setNPCs(updated);
    closeForm();

    try {
      await syncService.saveNpc(newNPC);
      refreshNpcs();
    } catch (error) {
      console.error('Error saving NPC:', error);
    }
  };

  const handleEditNPC = async (npcData: any) => {
    if (!editingNPC) return;

    const updatedNPC: NPC = {
      ...npcData,
      id: editingNPC.id,
      created_at: editingNPC.created_at,
      updated_at: new Date(),
    };

    const updated = npcs.map(n => n.id === editingNPC.id ? updatedNPC : n);
    setNPCs(updated);
    closeForm();

    try {
      await syncService.saveNpc(updatedNPC);
      refreshNpcs();
    } catch (error) {
      console.error('Error saving NPC:', error);
    }
  };

  const handleDeleteNPC = async (npcId: string) => {
    const npc = npcs.find(n => n.id === npcId);
    if (npc && confirm(`${t('npcs.confirmDelete')} ${npc.name}?`)) {
      const updated = npcs.filter(n => n.id !== npcId);
      setNPCs(updated);

      try {
        await syncService.deleteNpc(npcId);
        refreshNpcs();
      } catch (error) {
        console.error('Error deleting NPC:', error);
      }
    }
  };

  const openEditForm = (npc: NPC) => {
    setEditingNPC(npc);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingNPC(null);
  };

  const openDetails = (npc: NPC) => {
    setSelectedNPC(npc);
    setShowDetails(true);
  };

  const closeDetails = () => {
    setShowDetails(false);
    setSelectedNPC(null);
  };

  // Derive filter options
  const allLocations = [...new Set(npcs.map(n => n.location).filter(Boolean))] as string[];
  const allTags = [...new Set(npcs.flatMap(n => n.tags || []))];

  // Filter and sort
  const filteredNPCs = npcs
    .filter(npc => {
      const matchesSearch = !searchTerm ||
        npc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        npc.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
        npc.occupation?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesLocation = !filterLocation || npc.location === filterLocation;
      const matchesTag = !filterTag || npc.tags?.includes(filterTag);
      return matchesSearch && matchesLocation && matchesTag;
    })
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'location') return (a.location || '').localeCompare(b.location || '');
      return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
    });

  return (
    <div className="p-4 sm:p-8">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-4xl font-bold text-white mb-2">{t('npcs.title')}</h1>
        <div className="flex items-center justify-between gap-2">
          <p className="text-gray-300 text-sm sm:text-base">{t('npcs.subtitle')}</p>
          <div className="flex items-center gap-2 flex-shrink-0">
            {syncStatus === 'syncing' && (
              <ArrowPathIcon className="h-4 w-4 text-blue-400 animate-spin" />
            )}
            {syncStatus === 'error' && (
              <span className="text-xs text-amber-400">{t('npcs.offline')}</span>
            )}
            <button
              onClick={loadNPCs}
              className="p-2.5 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-slate-700/50"
              title={t('npcs.refresh')}
            >
              <ArrowPathIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Search and Controls */}
      <div className="mb-6 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder={t('npcs.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-800 text-white px-4 py-3 pr-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
            <MagnifyingGlassIcon className="absolute right-3 top-3.5 h-5 w-5 text-gray-400" />
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-3 rounded-lg transition-colors flex items-center gap-2 ${
                showFilters || filterLocation || filterTag
                  ? 'bg-pink-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <FunnelIcon className="h-5 w-5" />
              <span className="sm:hidden">Filter</span>
            </button>
            <button
              onClick={() => {
                setEditingNPC(null);
                setShowForm(true);
              }}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 sm:px-6 py-3 rounded-lg transition-colors flex items-center gap-2 flex-1 sm:flex-none justify-center"
            >
              <PlusIcon className="h-5 w-5" />
              {t('npcs.addNPC')}
            </button>
          </div>
        </div>

        {/* Filter Row */}
        {showFilters && (
          <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
            <select
              value={filterLocation}
              onChange={(e) => setFilterLocation(e.target.value)}
              className="bg-slate-800 text-white px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 w-full sm:w-auto"
            >
              <option value="">{t('npcs.filterByLocation')}</option>
              {allLocations.map(loc => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>
            <select
              value={filterTag}
              onChange={(e) => setFilterTag(e.target.value)}
              className="bg-slate-800 text-white px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 w-full sm:w-auto"
            >
              <option value="">{t('npcs.filterByTag')}</option>
              {allTags.map(tag => (
                <option key={tag} value={tag}>{tag}</option>
              ))}
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'name' | 'location' | 'recent')}
              className="bg-slate-800 text-white px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 w-full sm:w-auto"
            >
              <option value="name">{t('npcs.sortByName')}</option>
              <option value="location">{t('npcs.sortByLocation')}</option>
              <option value="recent">{t('npcs.sortByRecent')}</option>
            </select>
            {(filterLocation || filterTag) && (
              <button
                onClick={() => { setFilterLocation(''); setFilterTag(''); }}
                className="px-4 py-2.5 text-sm text-slate-400 hover:text-white transition-colors"
              >
                {t('npcs.clearFilters')}
              </button>
            )}
          </div>
        )}
      </div>

      {/* NPC Grid */}
      {filteredNPCs.length === 0 ? (
        <div className="text-center py-12">
          <UserGroupIcon className="h-16 w-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-400 mb-2">
            {npcs.length === 0 ? t('npcs.noNPCsYet') : t('npcs.noNPCsFound')}
          </h3>
          <p className="text-slate-500">
            {npcs.length === 0
              ? t('npcs.addFirstNPC')
              : t('npcs.adjustSearchTerms')}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredNPCs.map((npc) => (
            <div
              key={npc.id}
              className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-2xl border border-white/10 p-4 sm:p-6 hover:border-pink-400/30 transition-all duration-200"
            >
              {/* NPC Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg overflow-hidden bg-slate-700 flex-shrink-0">
                    {npc.portrait ? (
                      <img
                        src={npc.portrait}
                        alt={npc.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const img = e.target as HTMLImageElement;
                          img.style.display = 'none';
                          const parent = img.parentElement;
                          if (parent) {
                            parent.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-slate-400 m-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" /></svg>';
                          }
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <UserGroupIcon className="h-8 w-8 text-slate-400" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-white text-base sm:text-lg truncate">{npc.name}</h3>
                    {npc.occupation && (
                      <p className="text-emerald-400 text-sm truncate">{npc.occupation}</p>
                    )}
                    {npc.location && (
                      <p className="text-slate-400 text-sm truncate flex items-center gap-1">
                        <span>📍</span>
                        <span>{npc.location}</span>
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-0.5 flex-shrink-0">
                  <button
                    onClick={() => openDetails(npc)}
                    className="p-2.5 text-slate-400 hover:text-pink-400 transition-colors rounded-lg hover:bg-slate-700/50"
                    title={t('npcs.viewDetails')}
                  >
                    <EyeIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => openEditForm(npc)}
                    className="p-2.5 text-slate-400 hover:text-emerald-400 transition-colors rounded-lg hover:bg-slate-700/50"
                    title={t('npcs.editNPC')}
                  >
                    <PencilIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleDeleteNPC(npc.id)}
                    className="p-2.5 text-slate-400 hover:text-red-400 transition-colors rounded-lg hover:bg-slate-700/50"
                    title={t('npcs.deleteNPC')}
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Details preview */}
              {npc.details && (
                <div className="bg-slate-700/20 rounded-lg p-3 mb-3">
                  <p className="text-sm text-slate-300 line-clamp-2">{npc.details}</p>
                </div>
              )}

              {/* Tags */}
              {npc.tags && npc.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {npc.tags.slice(0, 4).map(tag => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 bg-slate-700 rounded-full text-xs text-slate-300"
                    >
                      {tag}
                    </span>
                  ))}
                  {npc.tags.length > 4 && (
                    <span className="text-xs text-slate-500">+{npc.tags.length - 4}</span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Edit/Create Form Modal */}
      {showForm && (
        <NPCEditForm
          npc={editingNPC || { name: '', details: '', tags: [] }}
          onSave={editingNPC ? handleEditNPC : handleAddNPC}
          onCancel={closeForm}
        />
      )}

      {/* Details Modal */}
      {showDetails && selectedNPC && (
        <NPCDetailsModal
          npc={selectedNPC}
          onClose={closeDetails}
        />
      )}
    </div>
  );
}
