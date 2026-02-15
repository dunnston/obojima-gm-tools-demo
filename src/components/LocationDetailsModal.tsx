'use client';

import { Location, LocationTreasure } from '@/data/locations';
import { NPC } from '@/data/npcs';
import { Quest } from '@/data/quests';
import { regions } from '@/data/encounters';
import {
  XMarkIcon,
  MapPinIcon,
  UserGroupIcon,
  BookOpenIcon,
  LinkIcon,
  BoltIcon,
  DocumentTextIcon,
  SparklesIcon,
  BeakerIcon,
  GiftIcon,
} from '@heroicons/react/24/outline';
import MentionText from './MentionText';

interface LocationDetailsModalProps {
  location: Location;
  npcs?: NPC[];
  allLocations?: Location[];
  quests?: Quest[];
  encounters?: any[];
  onClose: () => void;
  onNPCClick?: (npc: NPC) => void;
  onLocationClick?: (location: Location) => void;
  onLoadEncounter?: (encounterId: string, playerIds?: string[]) => void;
  onNavigateToInitiative?: () => void;
}

export function LocationDetailsModal({
  location,
  npcs = [],
  allLocations = [],
  quests = [],
  encounters = [],
  onClose,
  onNPCClick,
  onLocationClick,
  onLoadEncounter,
  onNavigateToInitiative,
}: LocationDetailsModalProps) {
  const regionName = regions.find(r => r.id === location.region)?.name || location.region;

  const linkedNPCs = (location.npcIds || [])
    .map(id => npcs.find(n => n.id === id))
    .filter(Boolean) as NPC[];

  const relatedLocations = (location.relatedLocationIds || [])
    .map(id => allLocations.find(l => l.id === id))
    .filter(Boolean) as Location[];

  const linkedQuests = (location.linkedQuestIds || [])
    .map(id => quests.find(q => q.id === id))
    .filter(Boolean) as Quest[];

  const linkedEncounters = (location.encounterIds || [])
    .map(id => {
      const enc = encounters.find((e: any) => e.id === id);
      return enc ? { id: enc.id, name: enc.name || enc.title || 'Unnamed Encounter' } : null;
    })
    .filter(Boolean) as { id: string; name: string }[];

  const handleLoadEncounter = (encounterId: string) => {
    localStorage.setItem('pendingEncounter', JSON.stringify({
      encounterId,
      playerIds: []
    }));
    if (onLoadEncounter) {
      onLoadEncounter(encounterId);
    }
    if (onNavigateToInitiative) {
      onNavigateToInitiative();
    }
  };

  const getTreasureIcon = (type: string) => {
    switch (type) {
      case 'potion': return <BeakerIcon className="h-4 w-4 text-purple-400" />;
      case 'ingredient': return <SparklesIcon className="h-4 w-4 text-green-400" />;
      case 'magicItem': return <GiftIcon className="h-4 w-4 text-amber-400" />;
      default: return <SparklesIcon className="h-4 w-4 text-slate-400" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <MapPinIcon className="h-6 w-6 text-amber-400" />
            <h2 className="text-2xl font-bold text-white">Location Details</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-88px)]">
          <div className="space-y-6">
            {/* Location Image */}
            {location.imageUrl && (
              <div className="w-full h-48 rounded-lg overflow-hidden -mt-2">
                <img
                  src={location.imageUrl}
                  alt={location.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Name & Region */}
            <div>
              <h3 className="text-2xl font-bold text-white mb-1">{location.name}</h3>
              {regionName && (
                <p className="text-amber-400 flex items-center gap-1.5">
                  <MapPinIcon className="h-4 w-4" />
                  <span>{regionName}</span>
                </p>
              )}
            </div>

            {/* Tone/Vibe */}
            {location.toneVibe && (
              <div>
                <span className="inline-block px-3 py-1 bg-indigo-500/20 border border-indigo-400/30 rounded-full text-sm text-indigo-300">
                  {location.toneVibe}
                </span>
              </div>
            )}

            {/* Description */}
            {location.description && (
              <div className="bg-slate-700/30 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-slate-300 mb-2">Description</h4>
                <MentionText text={location.description} className="text-white whitespace-pre-wrap" />
              </div>
            )}

            {/* Read Aloud Text */}
            {location.readAloudText && (
              <div className="bg-amber-900/20 border border-amber-400/30 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-amber-400 mb-2 flex items-center gap-1.5">
                  <BookOpenIcon className="h-4 w-4" />
                  Read Aloud
                </h4>
                <p className="text-amber-100 whitespace-pre-wrap italic">{location.readAloudText}</p>
              </div>
            )}

            {/* NPCs */}
            {linkedNPCs.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
                  <UserGroupIcon className="h-4 w-4" />
                  NPCs
                </h4>
                <div className="flex flex-wrap gap-2">
                  {linkedNPCs.map(npc => (
                    <button
                      key={npc.id}
                      onClick={() => onNPCClick?.(npc)}
                      className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/20 border border-blue-400/30 rounded-lg text-blue-300 hover:bg-blue-500/30 transition-colors cursor-pointer"
                    >
                      {npc.portrait ? (
                        <img src={npc.portrait} alt={npc.name} className="w-5 h-5 rounded-full object-cover" />
                      ) : (
                        <UserGroupIcon className="h-4 w-4" />
                      )}
                      <span className="text-sm">{npc.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Plot Hooks */}
            {location.plotHooks && (
              <div className="bg-slate-700/30 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
                  <DocumentTextIcon className="h-4 w-4" />
                  Plot Hooks
                </h4>
                <MentionText text={location.plotHooks} className="text-white whitespace-pre-wrap" />
              </div>
            )}

            {/* Linked Quests */}
            {linkedQuests.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
                  <BookOpenIcon className="h-4 w-4" />
                  Linked Quests
                </h4>
                <div className="flex flex-wrap gap-2">
                  {linkedQuests.map(quest => (
                    <span
                      key={quest.id}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/20 border border-emerald-400/30 rounded-lg text-emerald-300 text-sm"
                    >
                      <BookOpenIcon className="h-4 w-4" />
                      {quest.title}
                      <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                        quest.status === 'completed' ? 'bg-green-500/30 text-green-300' :
                        quest.status === 'in-progress' ? 'bg-blue-500/30 text-blue-300' :
                        quest.status === 'failed' ? 'bg-red-500/30 text-red-300' :
                        'bg-slate-500/30 text-slate-300'
                      }`}>
                        {quest.status}
                      </span>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Treasure */}
            {((location.treasure && location.treasure.length > 0) || location.treasureNotes) && (
              <div className="bg-slate-700/30 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
                  <GiftIcon className="h-4 w-4" />
                  Treasure
                </h4>
                {location.treasure && location.treasure.length > 0 && (
                  <div className="space-y-1 mb-2">
                    {location.treasure.map((item: LocationTreasure) => (
                      <div key={item.id} className="flex items-center gap-2 text-sm text-white">
                        {getTreasureIcon(item.type)}
                        <span>{item.itemName}</span>
                        {item.quantity && item.quantity > 1 && (
                          <span className="text-slate-400">x{item.quantity}</span>
                        )}
                        {item.notes && (
                          <span className="text-slate-400">- {item.notes}</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                {location.treasureNotes && (
                  <p className="text-slate-300 text-sm whitespace-pre-wrap mt-2 pt-2 border-t border-slate-600">
                    {location.treasureNotes}
                  </p>
                )}
              </div>
            )}

            {/* Linked Encounters */}
            {linkedEncounters.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
                  <BoltIcon className="h-4 w-4" />
                  Encounters
                </h4>
                <div className="space-y-2">
                  {linkedEncounters.map(enc => (
                    <div key={enc.id} className="flex items-center justify-between bg-red-500/10 border border-red-400/20 rounded-lg px-3 py-2">
                      <span className="text-red-300 text-sm">{enc.name}</span>
                      <button
                        onClick={() => handleLoadEncounter(enc.id)}
                        className="px-3 py-1 bg-red-500/20 hover:bg-red-500/30 border border-red-400/30 rounded text-red-300 text-xs transition-colors"
                      >
                        Load to Initiative
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* DM Notes */}
            {location.dmNotes && (
              <div className="bg-purple-900/20 border border-purple-400/30 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-purple-400 mb-2 flex items-center gap-1.5">
                  <DocumentTextIcon className="h-4 w-4" />
                  DM Notes
                </h4>
                <MentionText text={location.dmNotes} className="text-white whitespace-pre-wrap" />
              </div>
            )}

            {/* Related Locations */}
            {relatedLocations.length > 0 && (
              <div className="border-t border-slate-700 pt-4">
                <h4 className="text-sm font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
                  <LinkIcon className="h-4 w-4" />
                  Related Locations
                </h4>
                <div className="flex flex-wrap gap-2">
                  {relatedLocations.map(loc => (
                    <button
                      key={loc.id}
                      onClick={() => onLocationClick?.(loc)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/20 border border-amber-400/30 rounded-lg text-amber-300 hover:bg-amber-500/30 transition-colors cursor-pointer text-sm"
                    >
                      <MapPinIcon className="h-4 w-4" />
                      {loc.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Metadata */}
            <div className="text-xs text-slate-400 pt-4 border-t border-slate-700">
              <div className="flex justify-between">
                <span>Created: {new Date(location.created_at).toLocaleDateString()}</span>
                <span>Updated: {new Date(location.updated_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
