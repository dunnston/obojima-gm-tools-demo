'use client';

import { NPC, ABILITIES, getAbilityModifier, formatModifier, type NPCAction, type NPCFeature } from '@/data/npcs';
import { SessionNPC } from '@/data/sessions';
import {
  XMarkIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import MentionText from './MentionText';
import { CollapsibleSection, CollapsibleRow } from './CollapsibleList';

function actionQuickStats(action: NPCAction): string {
  const parts: string[] = [];
  if (typeof action.attack_bonus === 'number') {
    parts.push(`${formatModifier(action.attack_bonus)} to hit`);
  }
  if (action.damage_dice) {
    parts.push(`${action.damage_dice}${action.damage_type ? ` ${action.damage_type}` : ''}`);
  }
  if (typeof action.spell_save_dc === 'number') {
    parts.push(`DC ${action.spell_save_dc}`);
  }
  if (action.range) {
    parts.push(action.range);
  }
  return parts.join(' • ');
}

interface NPCDetailsModalProps {
  npc: NPC;
  sessionNotes?: string;
  onClose: () => void;
}

export function NPCDetailsModal({ npc, sessionNotes, onClose }: NPCDetailsModalProps) {
  const creatureTypeLine = [npc.creature_type, npc.creature_subtype && `(${npc.creature_subtype})`]
    .filter(Boolean)
    .join(' ');
  const identityLine = [npc.size, creatureTypeLine, npc.alignment].filter(Boolean).join(' • ');
  const raceClassLine = [npc.race, npc.class].filter(Boolean).join(' ');

  const hasAbilityScores = !!npc.ability_scores;
  const hasPersonalityTraits = !!(npc.personality || npc.ideals || npc.bonds || npc.flaws);
  const profBonus = npc.proficiency_bonus ?? 2;
  const features = npc.features || [];
  const actions = npc.actions || [];

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
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-1 break-words">
                  {npc.name}
                  {npc.pronouns && (
                    <span className="ml-2 text-sm text-slate-400 font-normal">({npc.pronouns})</span>
                  )}
                </h3>
                {raceClassLine && (
                  <p className="text-slate-300 text-sm sm:text-base mb-1 break-words">{raceClassLine}</p>
                )}
                {npc.occupation && (
                  <p className="text-emerald-400 text-base sm:text-lg mb-1">{npc.occupation}</p>
                )}
                {identityLine && (
                  <p className="text-slate-400 text-xs sm:text-sm italic mb-1">{identityLine}</p>
                )}
                {npc.location && (
                  <p className="text-slate-400 flex items-center gap-1">
                    <span>📍</span>
                    <span className="break-words">{npc.location}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Ability Scores */}
            {hasAbilityScores && (
              <div className="rounded-lg border border-slate-600 bg-slate-900/40 overflow-hidden">
                <div className="grid grid-cols-6 divide-x divide-slate-700">
                  {ABILITIES.map((ability) => {
                    const score = npc.ability_scores?.[ability] ?? 10;
                    const mod = getAbilityModifier(score);
                    return (
                      <div key={ability} className="flex flex-col items-center py-3 px-1 bg-slate-800/40">
                        <span className="text-[10px] sm:text-xs font-bold tracking-wider text-amber-400/90 uppercase">{ability}</span>
                        <span className="text-lg sm:text-xl font-bold text-white mt-1">{formatModifier(mod)}</span>
                        <span className="text-xs text-slate-400 mt-1">{score}</span>
                      </div>
                    );
                  })}
                </div>
                <div className="grid grid-cols-6 divide-x divide-slate-700 border-t border-slate-700">
                  {ABILITIES.map((ability) => {
                    const proficient = !!npc.saving_throw_proficiencies?.[ability];
                    const mod = getAbilityModifier(npc.ability_scores?.[ability] ?? 10);
                    const bonus = mod + (proficient ? profBonus : 0);
                    return (
                      <div
                        key={`save-${ability}`}
                        className="flex items-center justify-center gap-1.5 py-2 bg-slate-800/20"
                        title={`${ability} saving throw — ${proficient ? 'proficient' : 'not proficient'}`}
                      >
                        <span
                          className={`w-3 h-3 rounded-full border ${
                            proficient ? 'bg-amber-400 border-amber-300' : 'border-slate-500 bg-transparent'
                          }`}
                        />
                        <span className="text-sm text-slate-200">{formatModifier(bonus)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Physical Description */}
            {npc.physical_description && (
              <div className="bg-slate-700/30 rounded-lg p-3 sm:p-4">
                <h4 className="text-sm font-semibold text-slate-300 mb-2">Physical Description</h4>
                <p className="text-white whitespace-pre-wrap break-words">{npc.physical_description}</p>
              </div>
            )}

            {/* Personality Traits */}
            {hasPersonalityTraits && (
              <div className="rounded-lg border border-slate-700 bg-slate-900/30 p-3 sm:p-4 space-y-3">
                <h4 className="text-sm font-semibold text-amber-300/90 uppercase tracking-wider">Personality Traits</h4>
                {npc.personality && (
                  <div>
                    <div className="text-xs font-semibold text-slate-400 mb-1">Personality</div>
                    <p className="text-white whitespace-pre-wrap break-words">{npc.personality}</p>
                  </div>
                )}
                {npc.ideals && (
                  <div>
                    <div className="text-xs font-semibold text-slate-400 mb-1">Ideals</div>
                    <p className="text-white whitespace-pre-wrap break-words">{npc.ideals}</p>
                  </div>
                )}
                {npc.bonds && (
                  <div>
                    <div className="text-xs font-semibold text-slate-400 mb-1">Bonds</div>
                    <p className="text-white whitespace-pre-wrap break-words">{npc.bonds}</p>
                  </div>
                )}
                {npc.flaws && (
                  <div>
                    <div className="text-xs font-semibold text-slate-400 mb-1">Flaws</div>
                    <p className="text-white whitespace-pre-wrap break-words">{npc.flaws}</p>
                  </div>
                )}
              </div>
            )}

            {/* Features */}
            {features.length > 0 && (
              <CollapsibleSection
                title="Features"
                count={features.length}
                defaultOpen
              >
                {features.map((feature: NPCFeature, index: number) => (
                  <CollapsibleRow
                    key={index}
                    summary={
                      <span className="text-white font-medium truncate block">
                        {feature.name || <span className="text-slate-500 italic">Unnamed</span>}
                      </span>
                    }
                    details={
                      <p className="text-slate-200 text-sm whitespace-pre-wrap break-words pt-2">
                        {feature.description}
                      </p>
                    }
                  />
                ))}
              </CollapsibleSection>
            )}

            {/* Actions */}
            {actions.length > 0 && (
              <CollapsibleSection
                title="Actions"
                count={actions.length}
                defaultOpen
              >
                {actions.map((action: NPCAction, index: number) => {
                  const quickStats = actionQuickStats(action);
                  return (
                    <CollapsibleRow
                      key={index}
                      summary={
                        <div className="min-w-0">
                          <div className="text-white font-medium truncate">
                            {action.name || <span className="text-slate-500 italic">Unnamed</span>}
                          </div>
                          {quickStats && (
                            <div className="text-xs text-slate-400 truncate">{quickStats}</div>
                          )}
                        </div>
                      }
                      details={
                        <p className="text-slate-200 text-sm whitespace-pre-wrap break-words pt-2">
                          {action.description}
                        </p>
                      }
                    />
                  );
                })}
              </CollapsibleSection>
            )}

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
