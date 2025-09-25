'use client';

import React, { useState, useEffect } from 'react';
import { VistaScene, createEmptyScene, cloneScene } from '@/data/vistaScenes';
import {
  saveScene,
  loadScene,
  loadAllScenes,
  deleteScene,
  importSceneFromFile,
  downloadSceneAsJSON
} from '@/utils/vistaSerializer';
import {
  FolderIcon,
  PlusIcon,
  TrashIcon,
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  DocumentDuplicateIcon,
  MagnifyingGlassIcon,
  CalendarIcon,
  TagIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

interface SceneManagerProps {
  currentScene: VistaScene | null;
  onSceneLoad: (scene: VistaScene) => void;
  onNewScene: () => void;
  readOnly?: boolean;
}

export default function SceneManager({
  currentScene,
  onSceneLoad,
  onNewScene,
  readOnly = false
}: SceneManagerProps) {
  const [scenes, setScenes] = useState<VistaScene[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'updated' | 'created'>('updated');
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Load all scenes on mount
  useEffect(() => {
    loadAllScenesData();
  }, []);

  const loadAllScenesData = async () => {
    setLoading(true);
    setError(null);

    try {
      const loadedScenes = await loadAllScenes();
      setScenes(loadedScenes);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load scenes');
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort scenes
  const filteredScenes = scenes
    .filter(scene => {
      if (!searchTerm.trim()) return true;

      const term = searchTerm.toLowerCase();
      return (
        scene.name.toLowerCase().includes(term) ||
        scene.description?.toLowerCase().includes(term) ||
        scene.metadata.tags.some(tag => tag.toLowerCase().includes(term))
      );
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'created':
          return new Date(b.metadata.created_at).getTime() - new Date(a.metadata.created_at).getTime();
        case 'updated':
        default:
          return new Date(b.metadata.updated_at).getTime() - new Date(a.metadata.updated_at).getTime();
      }
    });

  // Handle scene save
  const handleSaveScene = async (scene: VistaScene) => {
    if (readOnly) return;

    try {
      await saveScene(scene);
      await loadAllScenesData(); // Refresh the list
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save scene');
    }
  };

  // Handle scene load
  const handleLoadScene = async (sceneId: string) => {
    try {
      const scene = await loadScene(sceneId);
      if (scene) {
        onSceneLoad(scene);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load scene');
    }
  };

  // Handle scene delete
  const handleDeleteScene = async (sceneId: string) => {
    if (readOnly) return;

    try {
      await deleteScene(sceneId);
      setScenes(prev => prev.filter(s => s.id !== sceneId));
      setDeleteConfirm(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete scene');
    }
  };

  // Handle scene duplicate
  const handleDuplicateScene = async (scene: VistaScene) => {
    if (readOnly) return;

    try {
      const duplicated = cloneScene(scene);
      await saveScene(duplicated);
      await loadAllScenesData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to duplicate scene');
    }
  };

  // Handle file import
  const handleFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || readOnly) return;

    try {
      const importedScene = await importSceneFromFile(file);
      await saveScene(importedScene);
      await loadAllScenesData();
      onSceneLoad(importedScene);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to import scene');
    }

    // Reset file input
    event.target.value = '';
  };

  // Format date for display
  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Get scene thumbnail or placeholder
  const getSceneThumbnail = (scene: VistaScene) => {
    return scene.background.primary;
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <h3 className="text-lg font-semibold text-gray-900">Scenes</h3>
            <button
              onClick={loadAllScenesData}
              disabled={loading}
              className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
              title="Refresh Scenes"
            >
              <div className={loading ? 'animate-spin h-4 w-4 border-2 border-gray-500 rounded-full border-t-transparent' : 'hidden'} />
              <FolderIcon className={loading ? 'hidden' : 'h-4 w-4'} />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search scenes..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'name' | 'updated' | 'created')}
            className="text-sm border border-gray-300 rounded px-2 py-1 bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="updated">Sort by Updated</option>
            <option value="created">Sort by Created</option>
            <option value="name">Sort by Name</option>
          </select>

          <div className="flex items-center space-x-2">
            {!readOnly && (
              <>
                <button
                  onClick={onNewScene}
                  className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors flex items-center"
                  title="New Scene"
                >
                  <PlusIcon className="h-4 w-4" />
                </button>

                <label
                  className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors cursor-pointer flex items-center"
                  title="Import Scene"
                >
                  <ArrowUpTrayIcon className="h-4 w-4" />
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleFileImport}
                    className="hidden"
                  />
                </label>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 border-b border-red-200">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-400 mr-2" />
            <p className="text-sm text-red-800">{error}</p>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-400 hover:text-red-600"
            >
              <span className="sr-only">Dismiss</span>
              ×
            </button>
          </div>
        </div>
      )}

      {/* Scene List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-8 text-center text-gray-500">
            <div className="animate-spin h-8 w-8 border-2 border-gray-300 rounded-full border-t-blue-600 mx-auto mb-4" />
            <p>Loading scenes...</p>
          </div>
        ) : filteredScenes.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <FolderIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="font-medium mb-2">
              {searchTerm ? 'No matching scenes' : 'No saved scenes'}
            </p>
            <p className="text-sm">
              {searchTerm
                ? 'Try adjusting your search terms'
                : 'Create your first scene to get started'
              }
            </p>
          </div>
        ) : (
          <div className="p-4 space-y-2">
            {filteredScenes.map((scene) => (
              <div
                key={scene.id}
                className={`
                  group p-3 border rounded-lg transition-all hover:border-blue-300 hover:bg-blue-50
                  ${currentScene?.id === scene.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}
                `}
              >
                <div className="flex items-start space-x-3">
                  {/* Thumbnail */}
                  <div
                    className="w-16 h-10 rounded bg-gray-300 bg-cover bg-center border border-gray-200 flex-shrink-0"
                    style={{ backgroundImage: `url(${getSceneThumbnail(scene)})` }}
                  />

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-gray-900 truncate">
                      {scene.name}
                    </h4>
                    {scene.description && (
                      <p className="text-xs text-gray-600 truncate mt-1">
                        {scene.description}
                      </p>
                    )}

                    <div className="flex items-center space-x-3 mt-2 text-xs text-gray-500">
                      <span className="flex items-center">
                        <CalendarIcon className="h-3 w-3 mr-1" />
                        {formatDate(scene.metadata.updated_at)}
                      </span>

                      {scene.metadata.tags.length > 0 && (
                        <span className="flex items-center">
                          <TagIcon className="h-3 w-3 mr-1" />
                          {scene.metadata.tags.slice(0, 2).join(', ')}
                          {scene.metadata.tags.length > 2 && ' +more'}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleLoadScene(scene.id)}
                      className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-100 rounded"
                      title="Load Scene"
                    >
                      <FolderIcon className="h-4 w-4" />
                    </button>

                    {!readOnly && (
                      <>
                        <button
                          onClick={() => handleDuplicateScene(scene)}
                          className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-100 rounded"
                          title="Duplicate Scene"
                        >
                          <DocumentDuplicateIcon className="h-4 w-4" />
                        </button>

                        <button
                          onClick={() => downloadSceneAsJSON(scene)}
                          className="p-1.5 text-gray-400 hover:text-purple-600 hover:bg-purple-100 rounded"
                          title="Export Scene"
                        >
                          <ArrowDownTrayIcon className="h-4 w-4" />
                        </button>

                        <button
                          onClick={() => setDeleteConfirm(scene.id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-100 rounded"
                          title="Delete Scene"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="p-4 border-t border-gray-200 bg-red-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-800">Delete scene?</p>
              <p className="text-xs text-red-600">This action cannot be undone.</p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteScene(deleteConfirm)}
                className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Save Current Scene */}
      {currentScene && !readOnly && (
        <div className="p-4 border-t border-gray-200 bg-gray-50 flex-shrink-0">
          <button
            onClick={() => handleSaveScene(currentScene)}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Save Current Scene
          </button>
          <p className="text-xs text-gray-500 mt-2 text-center">
            {currentScene.name}
          </p>
        </div>
      )}
    </div>
  );
}