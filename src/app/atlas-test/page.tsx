'use client';

import React, { useState } from 'react';
import AtlasVistaEditor from '@/components/vista/AtlasVistaEditor';
import { SpriteInstance } from '@/utils/spriteAtlasLoader';

export default function AtlasTestPage() {
  const [sprites, setSprites] = useState<SpriteInstance[]>([]);

  const handleSceneChange = (newSprites: SpriteInstance[]) => {
    setSprites(newSprites);
  };

  const handleExportScene = () => {
    const sceneData = {
      sprites,
      timestamp: new Date().toISOString(),
      version: '1.0'
    };

    const blob = new Blob([JSON.stringify(sceneData, null, 2)], {
      type: 'application/json'
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `atlas-scene-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Sprite Atlas Vista Editor
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Professional layered scene editor with depth sorting and WASD camera movement
            </p>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={handleExportScene}
              disabled={sprites.length === 0}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              Export Scene ({sprites.length} sprites)
            </button>
          </div>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1">
        <AtlasVistaEditor
          width={1920}
          height={1080}
          onSceneChange={handleSceneChange}
          initialSprites={[]}
        />
      </div>

      {/* Instructions */}
      <div className="bg-gray-50 border-t border-gray-200 px-6 py-3">
        <div className="flex items-center justify-center space-x-8 text-sm text-gray-600">
          <div className="flex items-center space-x-2">
            <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-xs">+</kbd>
            <span>Add sprites from browser</span>
          </div>
          <div className="flex items-center space-x-2">
            <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-xs">WASD</kbd>
            <span>Move camera</span>
          </div>
          <div className="flex items-center space-x-2">
            <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-xs">G</kbd>
            <span>Toggle grid</span>
          </div>
          <div className="flex items-center space-x-2">
            <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-xs">Del</kbd>
            <span>Delete selected</span>
          </div>
          <div className="flex items-center space-x-2">
            <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-xs">Home</kbd>
            <span>Reset camera</span>
          </div>
        </div>
      </div>
    </div>
  );
}