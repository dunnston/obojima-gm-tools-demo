'use client';

import React, { useState } from 'react';
import { VistaScene, createEmptyScene } from '@/data/vistaScenes';
import { SpriteInstance } from '@/utils/spriteAtlasLoader';
import VistaAtlasIntegration from '@/components/vista/VistaAtlasIntegration';

export default function VistaIntegrationPage() {
  const [currentScene, setCurrentScene] = useState<VistaScene>(() => {
    // Create a demo Vista scene with some tokens for demonstration
    const scene = createEmptyScene('Demo Scene');
    scene.characterTokens = [
      {
        id: 'demo-warrior-1',
        character: {
          id: 'char-1',
          characterName: 'Thorin',
          class: 'Warrior',
          race: 'Dwarf',
          level: 5
        },
        position: { x: 400, y: 300 }
      },
      {
        id: 'demo-mage-1',
        character: {
          id: 'char-2',
          characterName: 'Elara',
          class: 'Mage',
          race: 'Elf',
          level: 4
        },
        position: { x: 600, y: 250 }
      },
      {
        id: 'demo-rogue-1',
        character: {
          id: 'char-3',
          characterName: 'Zara',
          class: 'Rogue',
          race: 'Human',
          level: 3
        },
        position: { x: 500, y: 400 }
      }
    ];
    return scene;
  });

  const handleVistaSceneUpdate = (updatedScene: VistaScene) => {
    setCurrentScene(updatedScene);
    console.log('Vista scene updated:', updatedScene);
  };

  const handleAtlasSceneExport = (sprites: SpriteInstance[]) => {
    console.log('Atlas scene exported:', sprites);
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Vista ↔ Atlas Integration</h1>
            <p className="text-blue-100 mt-1">
              Seamlessly switch between traditional 2D and professional layered rendering
            </p>
          </div>

          <div className="text-right text-sm">
            <div className="text-blue-100">Current Scene: <span className="font-medium text-white">{currentScene.name}</span></div>
            <div className="text-blue-200">Tokens: {currentScene.characterTokens?.length || 0}</div>
          </div>
        </div>
      </div>

      {/* Integration Component */}
      <div className="flex-1">
        <VistaAtlasIntegration
          vistaScene={currentScene}
          onVistaSceneUpdate={handleVistaSceneUpdate}
          onAtlasSceneExport={handleAtlasSceneExport}
        />
      </div>

      {/* Instructions */}
      <div className="bg-gray-50 border-t border-gray-200 px-6 py-4">
        <div className="max-w-4xl mx-auto">
          <h3 className="font-medium text-gray-900 mb-2">How It Works:</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
            <div className="flex items-start space-x-2">
              <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">1</div>
              <div>
                <p className="font-medium">Start with Vista Scene</p>
                <p>Your existing 2D tokens and scene setup</p>
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <div className="w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-xs font-bold">2</div>
              <div>
                <p className="font-medium">Upgrade to Atlas Mode</p>
                <p>Professional depth sorting + WASD movement</p>
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <div className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs font-bold">3</div>
              <div>
                <p className="font-medium">Export or Save Back</p>
                <p>JSON export or sync back to Vista system</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}