'use client';

import { useState } from 'react';
import { Chapter, ChapterFormData, createEmptyChapter, chapterToFormData } from '@/data/sessions';
import { XMarkIcon, DocumentTextIcon } from '@heroicons/react/24/outline';

interface ChapterFormProps {
  chapter?: Chapter;
  onSave: (chapter: Omit<Chapter, 'id' | 'order' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
  isEditing?: boolean;
}

export default function ChapterForm({ chapter, onSave, onCancel, isEditing = false }: ChapterFormProps) {
  const [formData, setFormData] = useState<ChapterFormData>(() => {
    if (chapter) {
      return chapterToFormData(chapter);
    }
    return createEmptyChapter();
  });

  const handleInputChange = (field: keyof ChapterFormData, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleEncounterChange = (value: string) => {
    // Split by commas and clean up
    const encounters = value.split(',').map(e => e.trim()).filter(e => e.length > 0);
    setFormData(prev => ({ ...prev, linkedEncounters: encounters }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      alert('Chapter title is required');
      return;
    }

    onSave({
      title: formData.title,
      music: formData.music,
      npcs: formData.npcs,
      locationInfo: formData.locationInfo,
      linkedEncounters: formData.linkedEncounters,
      readAloudText: formData.readAloudText,
      overview: formData.overview,
      treasure: formData.treasure,
      notes: formData.notes
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <DocumentTextIcon className="h-6 w-6 text-purple-400" />
            {isEditing ? 'Edit Chapter' : 'Create New Chapter'}
          </h2>
          <button
            onClick={onCancel}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Chapter Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-purple-400"
              placeholder="Enter chapter title..."
              required
            />
          </div>

          {/* Music and Location Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                🎵 Music
              </label>
              <input
                type="text"
                value={formData.music}
                onChange={(e) => handleInputChange('music', e.target.value)}
                className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-purple-400"
                placeholder="Background music or playlist..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                📍 Location Information
              </label>
              <input
                type="text"
                value={formData.locationInfo}
                onChange={(e) => handleInputChange('locationInfo', e.target.value)}
                className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-purple-400"
                placeholder="Where does this chapter take place?"
              />
            </div>
          </div>

          {/* NPCs */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              👥 NPCs
            </label>
            <textarea
              value={formData.npcs}
              onChange={(e) => handleInputChange('npcs', e.target.value)}
              rows={4}
              className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-purple-400 resize-none"
              placeholder="Describe the NPCs the party will encounter, their motivations, and key dialogue..."
            />
          </div>

          {/* Linked Encounters */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              ⚔️ Linked Encounters
            </label>
            <input
              type="text"
              value={formData.linkedEncounters.join(', ')}
              onChange={(e) => handleEncounterChange(e.target.value)}
              className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-purple-400"
              placeholder="Encounter names or IDs, separated by commas..."
            />
            <p className="text-xs text-slate-500 mt-1">Reference encounters from your Encounter Creator</p>
          </div>

          {/* Read Aloud Text */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              📖 Read Aloud Text
            </label>
            <textarea
              value={formData.readAloudText}
              onChange={(e) => handleInputChange('readAloudText', e.target.value)}
              rows={4}
              className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-purple-400 resize-none"
              placeholder="Text to read directly to players to set the scene..."
            />
          </div>

          {/* Overview */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              📋 Overview
            </label>
            <textarea
              value={formData.overview}
              onChange={(e) => handleInputChange('overview', e.target.value)}
              rows={6}
              className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-purple-400 resize-none"
              placeholder="Detailed overview of the chapter: plot points, key events, player goals, potential complications..."
            />
          </div>

          {/* Treasure */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              💰 Treasure
            </label>
            <textarea
              value={formData.treasure}
              onChange={(e) => handleInputChange('treasure', e.target.value)}
              rows={3}
              className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-purple-400 resize-none"
              placeholder="Loot, rewards, magic items, or other treasures the party might find..."
            />
          </div>

          {/* Session Notes */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              📝 Session Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              rows={4}
              className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-purple-400 resize-none"
              placeholder="Space for notes during the session: player decisions, important events, things to remember..."
            />
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-4 pt-4 border-t border-slate-700">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
            >
              {isEditing ? 'Update Chapter' : 'Create Chapter'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}