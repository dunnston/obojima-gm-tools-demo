'use client';

import React, { useState } from 'react';
import { VistaScene } from '@/data/vistaScenes';
import { SpriteInstance } from '@/utils/spriteAtlasLoader';
import { createDemoSprite } from '@/utils/demoSpriteAtlas';
import AtlasVistaEditor from './AtlasVistaEditor';
import {
  ArrowsRightLeftIcon,
  SparklesIcon,
  DocumentArrowUpIcon,
  DocumentArrowDownIcon
} from '@heroicons/react/24/outline';

interface VistaAtlasIntegrationProps {
  vistaScene?: VistaScene;
  onVistaSceneUpdate?: (scene: VistaScene) => void;
  onAtlasSceneExport?: (sprites: SpriteInstance[]) => void;
}

export default function VistaAtlasIntegration({
  vistaScene,
  onVistaSceneUpdate,
  onAtlasSceneExport
}: VistaAtlasIntegrationProps) {
  const [mode, setMode] = useState<'vista' | 'atlas'>('vista');
  const [sprites, setSprites] = useState<SpriteInstance[]>([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Convert Vista scene tokens to Atlas sprites
  const convertVistaToAtlas = (): SpriteInstance[] => {
    if (!vistaScene?.characterTokens) return [];

    return vistaScene.characterTokens.map(token => {
      // Map character class to sprite name
      const spriteName = mapCharacterToSprite(token);

      return createDemoSprite(spriteName, token.position.x, token.position.y, {
        id: token.id,
        scaleX: token.scale || 1,
        scaleY: token.scale || 1,
        opacity: token.opacity || 1,
        visible: !token.hidden
      });
    });
  };

  // Map character types to available sprites
  const mapCharacterToSprite = (token: any): string => {
    const characterName = token.character?.characterName?.toLowerCase() || '';
    const className = token.character?.class?.toLowerCase() || '';

    // Try to match by class first
    if (className.includes('warrior') || className.includes('fighter')) return 'Warrior';
    if (className.includes('mage') || className.includes('wizard')) return 'Mage';
    if (className.includes('rogue') || className.includes('thief')) return 'Rogue';
    if (className.includes('cleric') || className.includes('priest')) return 'Cleric';

    // Default to warrior
    return 'Warrior';
  };

  // Switch to Atlas mode
  const switchToAtlas = () => {
    const atlasSprites = convertVistaToAtlas();
    setSprites(atlasSprites);
    setMode('atlas');
  };

  // Export Atlas scene as Vista-compatible format
  const exportToVista = () => {
    if (!vistaScene) return;

    // Convert sprites back to Vista tokens
    const characterTokens = sprites.map(sprite => ({
      id: sprite.id,
      character: {
        characterName: sprite.spriteName,
        class: sprite.spriteName,
        // Add other required character fields
      },
      position: { x: sprite.x, y: sprite.y },
      scale: sprite.scaleX,
      opacity: sprite.opacity,
      hidden: sprite.visible === false,
      depth: sprite.depth
    }));

    const updatedScene: VistaScene = {
      ...vistaScene,
      characterTokens
    };

    if (onVistaSceneUpdate) {
      onVistaSceneUpdate(updatedScene);
    }

    setHasUnsavedChanges(false);
    setMode('vista');
  };

  // Handle sprite changes in Atlas mode
  const handleAtlasSceneChange = (newSprites: SpriteInstance[]) => {
    setSprites(newSprites);
    setHasUnsavedChanges(true);
  };

  // Export sprite data as JSON
  const exportSpriteJSON = () => {
    const exportData = {
      sprites,
      metadata: {
        exported: new Date().toISOString(),
        vistaSceneId: vistaScene?.id,
        version: '1.0'
      }
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `atlas-scene-${vistaScene?.name || 'unnamed'}-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    if (onAtlasSceneExport) {
      onAtlasSceneExport(sprites);
    }
  };

  // Import sprite JSON
  const importSpriteJSON = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (data.sprites && Array.isArray(data.sprites)) {
          setSprites(data.sprites);
          setMode('atlas');
          setHasUnsavedChanges(true);
        }
      } catch (error) {
        console.error('Failed to import sprite JSON:', error);
        alert('Failed to import scene file. Please check the format.');
      }
    };
    reader.readAsText(file);

    // Reset input
    event.target.value = '';
  };

  if (mode === 'vista') {
    return (
      <div className="h-full flex flex-col">
        {/* Mode Toggle Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h2 className="text-xl font-semibold text-gray-900">Vista Scene</h2>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Traditional 2D Mode</span>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <label className="flex items-center px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 cursor-pointer transition-colors">
                <DocumentArrowUpIcon className="h-4 w-4 mr-2" />
                Import Atlas Scene
                <input
                  type="file"
                  accept=".json"
                  onChange={importSpriteJSON}
                  className="hidden"
                />
              </label>

              <button
                onClick={switchToAtlas}
                className="flex items-center px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
              >
                <SparklesIcon className="h-4 w-4 mr-2" />
                Upgrade to Atlas Mode
              </button>
            </div>
          </div>
        </div>

        {/* Vista Content */}
        <div className="flex-1 p-6 bg-gray-50">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-center">
              <SparklesIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Ready to Upgrade Your Scene
              </h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Switch to Atlas Mode to enable professional depth-sorted rendering,
                WASD camera movement, and advanced sprite management.
              </p>
              <div className="space-y-2 text-sm text-gray-500">
                {vistaScene?.characterTokens && (
                  <p>📍 {vistaScene.characterTokens.length} tokens ready to convert</p>
                )}
                <p>🎮 WASD camera movement available</p>
                <p>📐 Professional depth sorting enabled</p>
                <p>🎨 Advanced sprite properties</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Atlas Mode
  return (
    <div className="h-full flex flex-col">
      {/* Mode Toggle Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-semibold text-gray-900">Atlas Mode</h2>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span>Professional Layered Rendering</span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={exportSpriteJSON}
              disabled={sprites.length === 0}
              className="flex items-center px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-300 transition-colors"
            >
              <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
              Export Scene
            </button>

            {hasUnsavedChanges && (
              <button
                onClick={exportToVista}
                className="flex items-center px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
              >
                <ArrowsRightLeftIcon className="h-4 w-4 mr-2" />
                Save to Vista
              </button>
            )}

            <button
              onClick={() => setMode('vista')}
              className="flex items-center px-3 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
            >
              Back to Vista
            </button>
          </div>
        </div>
      </div>

      {/* Atlas Editor */}
      <div className="flex-1">
        <AtlasVistaEditor
          width={1920}
          height={1080}
          onSceneChange={handleAtlasSceneChange}
          initialSprites={sprites}
        />
      </div>
    </div>
  );
}