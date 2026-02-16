'use client';

import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useCharacters } from '@/hooks/useCharacters';
import { PlayerCharacter } from '@/data/characters';
import {
  UserGroupIcon,
  XMarkIcon,
  EyeIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';

interface PlayerQuickViewProps {
  isVisible: boolean;
  onClose: () => void;
  onNavigateToCharacter?: () => void;
}

const ABILITY_KEYS = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'] as const;
const ABILITY_LABELS = ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'];

function calcMod(score: number): string {
  const mod = Math.floor((score - 10) / 2);
  return mod >= 0 ? `+${mod}` : `${mod}`;
}

function modColor(score: number): string {
  const mod = Math.floor((score - 10) / 2);
  if (mod > 0) return 'text-emerald-400';
  if (mod < 0) return 'text-red-400';
  return 'text-slate-400';
}

function CharacterCard({ character, onViewProfile }: { character: PlayerCharacter; onViewProfile?: () => void }) {
  const { t } = useTranslation();

  return (
    <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-md rounded-2xl border border-white/10 p-5 hover:border-blue-400/30 transition-all duration-200">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 bg-gradient-to-br from-emerald-400/20 to-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0">
          {character.imageUrl ? (
            <img
              src={character.imageUrl}
              alt={character.characterName}
              className="w-10 h-10 rounded-full object-cover"
              onError={(e) => {
                const img = e.target as HTMLImageElement;
                img.style.display = 'none';
                const parent = img.parentElement;
                if (parent) parent.innerHTML = '<span class="text-xl">👤</span>';
              }}
            />
          ) : (
            <span className="text-xl">👤</span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-bold text-white text-lg leading-tight truncate">{character.characterName}</h3>
          <p className="text-sm text-slate-400 truncate">{character.playerName}</p>
        </div>
      </div>

      {/* Class & Level */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-slate-400">{t('characters.class')}:</span>
        <span className="text-white font-semibold">{character.class || '—'}</span>
      </div>

      {/* Top Stats Row */}
      <div className="grid grid-cols-3 gap-2 text-center mb-3">
        <div className="bg-slate-700/40 rounded-lg p-2">
          <div className="text-[10px] text-slate-500 uppercase tracking-wider">AC</div>
          <div className="text-white font-bold text-lg">{character.armorClass}</div>
        </div>
        <div className="bg-slate-700/40 rounded-lg p-2">
          <div className="text-[10px] text-slate-500 uppercase tracking-wider">HP</div>
          <div className="text-white font-bold text-lg leading-tight">{character.hitPoints}<span className="text-slate-500 text-xs font-normal">/{character.maxHitPoints}</span></div>
        </div>
        <div className="bg-slate-700/40 rounded-lg p-2">
          <div className="text-[10px] text-slate-500 uppercase tracking-wider">Level</div>
          <div className="text-white font-bold text-lg">{character.level}</div>
        </div>
      </div>

      {/* Passives Row */}
      <div className="grid grid-cols-3 gap-2 text-center mb-3">
        <div className="bg-slate-700/40 rounded-lg p-2">
          <div className="text-[10px] text-slate-500 uppercase tracking-wider">PP</div>
          <div className="text-white font-bold">{character.passivePerception}</div>
        </div>
        <div className="bg-slate-700/40 rounded-lg p-2">
          <div className="text-[10px] text-slate-500 uppercase tracking-wider">P. Insight</div>
          <div className="text-white font-bold">{character.passiveInsight || 10}</div>
        </div>
        <div className="bg-slate-700/40 rounded-lg p-2">
          <div className="text-[10px] text-slate-500 uppercase tracking-wider">P. Invest</div>
          <div className="text-white font-bold">{character.passiveInvestigation || 10}</div>
        </div>
      </div>

      {/* Proficiency & Speed Row */}
      <div className="grid grid-cols-4 gap-2 text-center mb-3">
        <div className="bg-slate-700/40 rounded-lg p-2">
          <div className="text-[10px] text-slate-500 uppercase tracking-wider">Prof</div>
          <div className="text-white font-bold">+{character.proficiencyBonus}</div>
        </div>
        <div className="bg-slate-700/40 rounded-lg p-2">
          <div className="text-[10px] text-slate-500 uppercase tracking-wider">Speed</div>
          <div className="text-white font-bold">{character.speed}</div>
        </div>
        <div className="bg-slate-700/40 rounded-lg p-2">
          <div className="text-[10px] text-slate-500 uppercase tracking-wider">STR</div>
          <div className={`font-bold ${modColor(character.strength)}`}>{calcMod(character.strength)}</div>
        </div>
        <div className="bg-slate-700/40 rounded-lg p-2">
          <div className="text-[10px] text-slate-500 uppercase tracking-wider">DEX</div>
          <div className={`font-bold ${modColor(character.dexterity)}`}>{calcMod(character.dexterity)}</div>
        </div>
      </div>

      {/* Ability Scores Grid */}
      <div className="grid grid-cols-6 gap-1.5 text-center mb-4">
        {ABILITY_KEYS.map((ability, i) => {
          const score = character[ability] || 10;
          return (
            <div key={ability} className="bg-slate-700/30 rounded-lg py-1.5 px-1">
              <div className="text-[9px] text-slate-500 uppercase tracking-wider">{ABILITY_LABELS[i]}</div>
              <div className="text-white font-bold text-sm">{score}</div>
              <div className={`text-[10px] font-semibold ${modColor(score)}`}>{calcMod(score)}</div>
            </div>
          );
        })}
      </div>

      {/* View Profile Button */}
      {onViewProfile && (
        <button
          onClick={onViewProfile}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/20 hover:border-blue-500/40 text-blue-400 text-sm font-medium rounded-lg transition-all"
        >
          <EyeIcon className="h-4 w-4" />
          {t('characters.viewDetails')}
        </button>
      )}
    </div>
  );
}

export default function PlayerQuickView({ isVisible, onClose, onNavigateToCharacter }: PlayerQuickViewProps) {
  const { characters, isLoading, refresh } = useCharacters();
  const { t } = useTranslation();

  // Re-fetch characters every time the overlay becomes visible
  useEffect(() => {
    if (isVisible) {
      refresh();
    }
  }, [isVisible, refresh]);

  if (!isVisible) return null;

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-start justify-center z-[60] overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-7xl mx-auto p-6 pt-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600/20 rounded-lg">
              <UserGroupIcon className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">{t('characters.quickStats.title')}</h2>
              <p className="text-sm text-slate-400">{t('characters.quickStats.holdKeyHint')}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <ArrowPathIcon className="h-8 w-8 text-blue-400 animate-spin" />
          </div>
        ) : characters.length === 0 ? (
          <div className="text-center py-20">
            <UserGroupIcon className="h-16 w-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-400 mb-2">{t('characters.quickStats.noCharacters')}</h3>
            <p className="text-slate-500">{t('characters.addFirstCharacter')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {characters.map((character) => (
              <CharacterCard
                key={character.id}
                character={character}
                onViewProfile={onNavigateToCharacter}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
