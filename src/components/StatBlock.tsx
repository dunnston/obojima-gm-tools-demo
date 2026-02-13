'use client';

import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { Creature } from '@/data/creatures';
import { getCreatureImagePath } from '@/utils/imageUtils';

interface StatBlockProps {
  creature: Creature;
  isOpen: boolean;
  onClose: () => void;
}

function getAbilityModifier(score: number): string {
  const modifier = Math.floor((score - 10) / 2);
  return modifier >= 0 ? `+${modifier}` : `${modifier}`;
}

function formatSpeed(speed: any): string {
  const speedEntries = [];
  if (speed.walk && speed.walk !== "0 ft.") speedEntries.push(speed.walk);
  if (speed.fly) speedEntries.push(`fly ${speed.fly}`);
  if (speed.swim) speedEntries.push(`swim ${speed.swim}`);
  if (speed.climb) speedEntries.push(`climb ${speed.climb}`);
  if (speed.burrow) speedEntries.push(`burrow ${speed.burrow}`);
  return speedEntries.join(', ') || '0 ft.';
}

function formatLanguages(languages: string[]): string {
  return languages.length > 0 ? languages.join(', ') : '—';
}

export default function StatBlock({ creature, isOpen, onClose }: StatBlockProps) {
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 p-6 text-left align-middle shadow-xl transition-all">
                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-start gap-6">
                    {/* Creature Image */}
                    <div className="w-24 h-24 bg-slate-600/30 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0 shadow-lg">
                      <img
                        src={(creature as any).imageUrl || getCreatureImagePath(creature.name)}
                        alt={creature.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const img = e.target as HTMLImageElement;
                          img.style.display = 'none';
                          const parent = img.parentElement;
                          if (parent) {
                            parent.innerHTML = '<span class="text-4xl">🐉</span>';
                          }
                        }}
                      />
                    </div>
                    <div className="flex-1">
                      <Dialog.Title className="text-3xl font-bold text-white mb-2">
                        {creature.name}
                      </Dialog.Title>
                      <div className="text-lg italic text-slate-400">
                        {creature.size} {creature.type}, {creature.alignment}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="rounded-lg p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                {/* Basic Info */}
                <div className="space-y-4 text-slate-300">
                  <div className="border-b border-slate-600 pb-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <span className="font-semibold text-orange-400">Armor Class:</span> {creature.armor_class}
                      </div>
                      <div>
                        <span className="font-semibold text-red-400">Hit Points:</span> {creature.hit_points}
                      </div>
                      <div>
                        <span className="font-semibold text-blue-400">Speed:</span> {formatSpeed(creature.speed)}
                      </div>
                    </div>
                  </div>

                  {/* Ability Scores */}
                  <div className="border-b border-slate-600 pb-4">
                    <div className="grid grid-cols-6 gap-2 text-center">
                      {Object.entries(creature.ability_scores).map(([ability, score]) => (
                        <div key={ability} className="bg-slate-700/50 rounded-lg p-3">
                          <div className="font-semibold text-yellow-400">{ability}</div>
                          <div className="text-lg">{score}</div>
                          <div className="text-sm text-slate-400">({getAbilityModifier(score)})</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Skills, Saves, etc. */}
                  <div className="space-y-2 border-b border-slate-600 pb-4">
                    {creature.saving_throws && (
                      <div>
                        <span className="font-semibold text-green-400">Saving Throws:</span>{' '}
                        {Object.entries(creature.saving_throws).map(([ability, bonus]) => 
                          `${ability} +${bonus}`
                        ).join(', ')}
                      </div>
                    )}
                    
                    {creature.skills && (
                      <div>
                        <span className="font-semibold text-green-400">Skills:</span>{' '}
                        {Object.entries(creature.skills).map(([skill, bonus]) => 
                          `${skill} +${bonus}`
                        ).join(', ')}
                      </div>
                    )}

                    {creature.damage_vulnerabilities && creature.damage_vulnerabilities.length > 0 && (
                      <div>
                        <span className="font-semibold text-red-400">Damage Vulnerabilities:</span>{' '}
                        {creature.damage_vulnerabilities.join(', ')}
                      </div>
                    )}

                    {creature.damage_resistances && creature.damage_resistances.length > 0 && (
                      <div>
                        <span className="font-semibold text-yellow-400">Damage Resistances:</span>{' '}
                        {creature.damage_resistances.join(', ')}
                      </div>
                    )}

                    {creature.damage_immunities && creature.damage_immunities.length > 0 && (
                      <div>
                        <span className="font-semibold text-purple-400">Damage Immunities:</span>{' '}
                        {creature.damage_immunities.join(', ')}
                      </div>
                    )}

                    {creature.condition_immunities && creature.condition_immunities.length > 0 && (
                      <div>
                        <span className="font-semibold text-purple-400">Condition Immunities:</span>{' '}
                        {creature.condition_immunities.join(', ')}
                      </div>
                    )}

                    <div>
                      <span className="font-semibold text-cyan-400">Senses:</span>{' '}
                      {creature.senses.darkvision && `Darkvision ${creature.senses.darkvision}, `}
                      {creature.senses.truesight && `Truesight ${creature.senses.truesight}, `}
                      Passive Perception {creature.senses.passive_perception}
                    </div>

                    <div>
                      <span className="font-semibold text-cyan-400">Languages:</span> {formatLanguages(creature.languages)}
                    </div>

                    <div className="flex gap-4">
                      <div>
                        <span className="font-semibold text-emerald-400">Challenge:</span> {creature.challenge_rating}
                      </div>
                      <div>
                        <span className="font-semibold text-emerald-400">Proficiency Bonus:</span> +{creature.proficiency_bonus}
                      </div>
                    </div>
                  </div>

                  {/* Traits */}
                  {creature.traits && creature.traits.length > 0 && (
                    <div className="space-y-2 border-b border-slate-600 pb-4">
                      {creature.traits.map((trait, index) => (
                        <div key={index}>
                          <span className="font-semibold text-yellow-400">{trait.name}.</span>{' '}
                          <span className="whitespace-pre-line">{trait.description}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Actions */}
                  {creature.actions && creature.actions.length > 0 && (
                    <div className="space-y-2 border-b border-slate-600 pb-4">
                      <h3 className="text-xl font-bold text-red-400 mb-2">Actions</h3>
                      {creature.actions.map((action, index) => (
                        <div key={index}>
                          <span className="font-semibold text-yellow-400">{action.name}.</span>{' '}
                          <span className="whitespace-pre-line">{action.description}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Bonus Actions */}
                  {creature.bonus_actions && creature.bonus_actions.length > 0 && (
                    <div className="space-y-2 border-b border-slate-600 pb-4">
                      <h3 className="text-xl font-bold text-orange-400 mb-2">Bonus Actions</h3>
                      {creature.bonus_actions.map((action, index) => (
                        <div key={index}>
                          <span className="font-semibold text-yellow-400">{action.name}.</span>{' '}
                          <span className="whitespace-pre-line">{action.description}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Reactions */}
                  {creature.reactions && creature.reactions.length > 0 && (
                    <div className="space-y-2 border-b border-slate-600 pb-4">
                      <h3 className="text-xl font-bold text-blue-400 mb-2">Reactions</h3>
                      {creature.reactions.map((reaction, index) => (
                        <div key={index}>
                          <span className="font-semibold text-yellow-400">{reaction.name}.</span>{' '}
                          <span className="whitespace-pre-line">{reaction.description}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Legendary Actions */}
                  {creature.legendary_actions && creature.legendary_actions.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="text-xl font-bold text-purple-400 mb-2">Legendary Actions</h3>
                      {creature.legendary_actions.map((action, index) => (
                        <div key={index}>
                          <span className="font-semibold text-yellow-400">{action.name}.</span>{' '}
                          <span className="whitespace-pre-line">{action.description}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}