'use client';

import React, { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  BackgroundPreset,
  SceneTemplate,
  BACKGROUND_PRESETS,
  SCENE_TEMPLATES,
  getBackgroundsByCategory,
  searchBackgroundsByTags,
  getSceneTemplate
} from '@/data/vistaBackgrounds';
import { VistaScene, SceneBackground } from '@/data/vistaScenes';
import {
  MagnifyingGlassIcon,
  XMarkIcon,
  PhotoIcon,
  SparklesIcon,
  AdjustmentsHorizontalIcon,
  EyeIcon
} from '@heroicons/react/24/outline';

interface BackgroundSelectorProps {
  currentScene: VistaScene | null;
  onBackgroundChange: (background: SceneBackground) => void;
  onSceneTemplateLoad?: (template: SceneTemplate) => void;
  onClose: () => void;
}

const BACKGROUND_CATEGORIES = [
  { id: 'all', name: 'All Backgrounds' },
  { id: 'interior', name: 'Interior' },
  { id: 'exterior', name: 'Exterior' },
  { id: 'dungeon', name: 'Dungeon' },
  { id: 'special', name: 'Special' }
] as const;

type CategoryId = typeof BACKGROUND_CATEGORIES[number]['id'];

export default function BackgroundSelector({
  currentScene,
  onBackgroundChange,
  onSceneTemplateLoad,
  onClose
}: BackgroundSelectorProps) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'backgrounds' | 'templates'>('backgrounds');
  const [selectedCategory, setSelectedCategory] = useState<CategoryId>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBackground, setSelectedBackground] = useState<BackgroundPreset | null>(null);
  const [customSettings, setCustomSettings] = useState({
    brightness: currentScene?.background.brightness || 1.0,
    blur: currentScene?.background.blur || 0,
    tint: currentScene?.background.tint || ''
  });
  const [showPreview, setShowPreview] = useState(false);

  // Get filtered backgrounds
  const getFilteredBackgrounds = useCallback((): BackgroundPreset[] => {
    let backgrounds = selectedCategory === 'all'
      ? BACKGROUND_PRESETS
      : getBackgroundsByCategory(selectedCategory);

    if (searchTerm.trim()) {
      const searchTerms = searchTerm.toLowerCase().split(' ').filter(Boolean);
      backgrounds = backgrounds.filter(bg =>
        bg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bg.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        searchTerms.some(term => bg.tags.some(tag => tag.includes(term)))
      );
    }

    return backgrounds;
  }, [selectedCategory, searchTerm]);

  // Apply background preset
  const applyBackground = useCallback((preset: BackgroundPreset) => {
    const background: SceneBackground = {
      primary: preset.imagePath,
      brightness: preset.suggestedBrightness || customSettings.brightness,
      blur: preset.suggestedBlur || customSettings.blur,
      tint: preset.suggestedTint || customSettings.tint
    };

    onBackgroundChange(background);
    onClose();
  }, [customSettings, onBackgroundChange, onClose]);

  // Apply custom background
  const applyCustomBackground = useCallback(() => {
    if (!selectedBackground) return;

    const background: SceneBackground = {
      primary: selectedBackground.imagePath,
      brightness: customSettings.brightness,
      blur: customSettings.blur,
      tint: customSettings.tint
    };

    onBackgroundChange(background);
    onClose();
  }, [selectedBackground, customSettings, onBackgroundChange, onClose]);

  // Load scene template
  const loadTemplate = useCallback((template: SceneTemplate) => {
    if (onSceneTemplateLoad) {
      onSceneTemplateLoad(template);
      onClose();
    }
  }, [onSceneTemplateLoad, onClose]);

  const filteredBackgrounds = getFilteredBackgrounds();

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Background & Templates</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="px-6 py-3 border-b border-gray-200">
          <div className="flex space-x-1">
            <button
              onClick={() => setActiveTab('backgrounds')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'backgrounds'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              <PhotoIcon className="h-4 w-4 inline mr-2" />
              Backgrounds
            </button>
            <button
              onClick={() => setActiveTab('templates')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'templates'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              <SparklesIcon className="h-4 w-4 inline mr-2" />
              Scene Templates
            </button>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {activeTab === 'backgrounds' ? (
            <>
              {/* Background Selector */}
              <div className="flex-1 flex flex-col">
                {/* Controls */}
                <div className="p-4 border-b border-gray-200">
                  {/* Search */}
                  <div className="relative mb-4">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search backgrounds..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {/* Categories */}
                  <div className="flex flex-wrap gap-2">
                    {BACKGROUND_CATEGORIES.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => setSelectedCategory(category.id)}
                        className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                          selectedCategory === category.id
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {category.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Background Grid */}
                <div className="flex-1 overflow-y-auto p-4">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {filteredBackgrounds.map((background) => (
                      <div
                        key={background.id}
                        className="group relative bg-gray-100 rounded-lg overflow-hidden aspect-video cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all"
                        onClick={() => setSelectedBackground(background)}
                      >
                        {/* Background Image */}
                        <div
                          className="w-full h-full bg-cover bg-center bg-gray-300 group-hover:scale-105 transition-transform duration-200"
                          style={{ backgroundImage: `url(${background.thumbnail || background.imagePath})` }}
                        />

                        {/* Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="absolute bottom-0 left-0 right-0 p-3">
                            <h3 className="text-white font-medium text-sm truncate">
                              {background.name}
                            </h3>
                            <p className="text-white/80 text-xs truncate">
                              {background.description}
                            </p>
                          </div>
                        </div>

                        {/* Quick Apply Button */}
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              applyBackground(background);
                            }}
                            className="px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                          >
                            Apply
                          </button>
                        </div>

                        {/* Selected Indicator */}
                        {selectedBackground?.id === background.id && (
                          <div className="absolute inset-0 ring-2 ring-blue-500 bg-blue-500/20 rounded-lg" />
                        )}
                      </div>
                    ))}
                  </div>

                  {filteredBackgrounds.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                      <PhotoIcon className="h-12 w-12 opacity-50 mb-4" />
                      <p className="text-lg font-medium">No backgrounds found</p>
                      <p className="text-sm">Try adjusting your search or category filter</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Settings Panel */}
              {selectedBackground && (
                <div className="w-80 border-l border-gray-200 flex flex-col">
                  <div className="p-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">
                      {selectedBackground.name}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {selectedBackground.description}
                    </p>
                  </div>

                  <div className="flex-1 p-4 space-y-4">
                    {/* Preview */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium text-gray-700">Preview</label>
                        <button
                          onClick={() => setShowPreview(!showPreview)}
                          className="p-1 text-gray-500 hover:text-gray-700"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                      </div>
                      {showPreview && (
                        <div className="aspect-video rounded border bg-gray-100 overflow-hidden">
                          <div
                            className="w-full h-full bg-cover bg-center"
                            style={{
                              backgroundImage: `url(${selectedBackground.imagePath})`,
                              filter: `brightness(${customSettings.brightness}) blur(${customSettings.blur}px)`,
                              backgroundColor: customSettings.tint
                            }}
                          />
                        </div>
                      )}
                    </div>

                    {/* Brightness */}
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Brightness: {customSettings.brightness.toFixed(1)}
                      </label>
                      <input
                        type="range"
                        min="0.1"
                        max="2.0"
                        step="0.1"
                        value={customSettings.brightness}
                        onChange={(e) => setCustomSettings(prev => ({
                          ...prev,
                          brightness: parseFloat(e.target.value)
                        }))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                      />
                    </div>

                    {/* Blur */}
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Blur: {customSettings.blur}px
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="10"
                        step="0.5"
                        value={customSettings.blur}
                        onChange={(e) => setCustomSettings(prev => ({
                          ...prev,
                          blur: parseFloat(e.target.value)
                        }))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                      />
                    </div>

                    {/* Tint */}
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Color Tint
                      </label>
                      <div className="flex space-x-2">
                        <input
                          type="color"
                          value={customSettings.tint || '#ffffff'}
                          onChange={(e) => setCustomSettings(prev => ({
                            ...prev,
                            tint: e.target.value
                          }))}
                          className="w-12 h-8 border border-gray-300 rounded"
                        />
                        <input
                          type="text"
                          value={customSettings.tint}
                          onChange={(e) => setCustomSettings(prev => ({
                            ...prev,
                            tint: e.target.value
                          }))}
                          placeholder="Color code..."
                          className="flex-1 px-3 py-1 border border-gray-300 rounded text-sm"
                        />
                      </div>
                    </div>

                    {/* Tags */}
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">Tags</label>
                      <div className="flex flex-wrap gap-1">
                        {selectedBackground.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Apply Button */}
                  <div className="p-4 border-t border-gray-200">
                    <button
                      onClick={applyCustomBackground}
                      className="w-full px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Apply Background
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            /* Scene Templates */
            <div className="flex-1 p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {SCENE_TEMPLATES.map((template) => (
                  <div
                    key={template.id}
                    className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:bg-blue-50 transition-colors cursor-pointer"
                    onClick={() => loadTemplate(template)}
                  >
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {template.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      {template.description}
                    </p>

                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{template.suggestedTokens.length} suggested tokens</span>
                      <span className="capitalize">
                        {getSceneTemplate(template.backgroundPresetId)?.name || template.backgroundPresetId}
                      </span>
                    </div>

                    <div className="mt-3 flex items-center space-x-2">
                      {template.gridEnabled && (
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">Grid</span>
                      )}
                      {template.depthIndicatorsVisible && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">Depth</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}