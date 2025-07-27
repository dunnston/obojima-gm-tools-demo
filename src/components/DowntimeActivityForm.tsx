'use client';

import { useState } from 'react';
import { createPortal } from 'react-dom';
import { DowntimeActivityType, getActivityTypeDisplayName } from '@/data/downtime';
import { PlayerCharacter } from '@/data/characters';
import {
  XMarkIcon,
  AcademicCapIcon,
  SparklesIcon,
  WrenchIcon,
  MapIcon,
  MusicalNoteIcon,
  BookOpenIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';

interface DowntimeActivityFormProps {
  characters: PlayerCharacter[];
  onCreate: (type: DowntimeActivityType, characterId: string) => void;
  onClose: () => void;
}

export default function DowntimeActivityForm({
  characters,
  onCreate,
  onClose
}: DowntimeActivityFormProps) {
  const [selectedCharacter, setSelectedCharacter] = useState<string>('');
  const [selectedType, setSelectedType] = useState<DowntimeActivityType | ''>('');

  const activityTypes: Array<{
    type: DowntimeActivityType;
    name: string;
    description: string;
    icon: any;
    color: string;
  }> = [
    {
      type: 'sword_school',
      name: 'Sword School Training',
      description: 'Train at a sword school to master combat techniques',
      icon: AcademicCapIcon,
      color: 'from-red-500 to-orange-500'
    },
    {
      type: 'witch_coven',
      name: 'Witch Coven',
      description: 'Study with a coven to learn magical arts',
      icon: SparklesIcon,
      color: 'from-purple-500 to-pink-500'
    },
    {
      type: 'crafting',
      name: 'Crafting',
      description: 'Create items, potions, or equipment',
      icon: WrenchIcon,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      type: 'gathering',
      name: 'Gathering & Exploration',
      description: 'Search for resources or explore new areas',
      icon: MapIcon,
      color: 'from-green-500 to-emerald-500'
    },
    {
      type: 'carousing',
      name: 'Carousing',
      description: 'Socialize, make connections, and gather information',
      icon: MusicalNoteIcon,
      color: 'from-yellow-500 to-amber-500'
    },
    {
      type: 'learning',
      name: 'Learning & Study',
      description: 'Study subjects or train new skills',
      icon: BookOpenIcon,
      color: 'from-indigo-500 to-blue-500'
    },
    {
      type: 'faction_work',
      name: 'Faction Work',
      description: 'Complete tasks for various factions',
      icon: BuildingOfficeIcon,
      color: 'from-gray-500 to-slate-500'
    }
  ];

  const handleSubmit = () => {
    if (selectedCharacter && selectedType) {
      onCreate(selectedType, selectedCharacter);
    }
  };

  const modalContent = (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 border border-slate-600 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-600">
          <h2 className="text-2xl font-bold text-white">New Downtime Activity</h2>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Character Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-3">
              Select Character
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {characters.map(character => (
                <button
                  key={character.id}
                  onClick={() => setSelectedCharacter(character.id)}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    selectedCharacter === character.id
                      ? 'border-emerald-400 bg-emerald-500/10'
                      : 'border-slate-600 bg-slate-700/50 hover:border-slate-500'
                  }`}
                >
                  <h3 className="font-semibold text-white">{character.characterName}</h3>
                  <p className="text-sm text-slate-400">
                    {character.class} {character.level} • {character.playerName}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Activity Type Selection */}
          {selectedCharacter && (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-3">
                Select Activity Type
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activityTypes.map(({ type, name, description, icon: Icon, color }) => (
                  <button
                    key={type}
                    onClick={() => setSelectedType(type)}
                    className={`p-4 rounded-lg border-2 transition-all text-left ${
                      selectedType === type
                        ? 'border-emerald-400 bg-emerald-500/10'
                        : 'border-slate-600 bg-slate-700/50 hover:border-slate-500'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 bg-gradient-to-r ${color} rounded-lg`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-white mb-1">{name}</h3>
                        <p className="text-sm text-slate-400">{description}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-600">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!selectedCharacter || !selectedType}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
            >
              Create Activity
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}