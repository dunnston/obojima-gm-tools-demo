'use client';

import { useState } from 'react';
import { createPortal } from 'react-dom';
import { regions, rollEncounter, type Encounter } from '@/data/encounters';
import { 
  XMarkIcon, 
  PuzzlePieceIcon, 
  MapIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

interface EncounterGeneratorProps {
  onClose: () => void;
}

interface GeneratedEncounter {
  roll: number;
  encounter: Encounter;
  regionName: string;
  timestamp: Date;
}

export default function EncounterGenerator({ onClose }: EncounterGeneratorProps) {
  const [selectedRegionId, setSelectedRegionId] = useState<string>('');
  const [generatedEncounter, setGeneratedEncounter] = useState<GeneratedEncounter | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateEncounter = async () => {
    if (!selectedRegionId) return;

    setIsGenerating(true);
    
    // Add a small delay for effect
    setTimeout(() => {
      const result = rollEncounter(selectedRegionId);
      const region = regions.find(r => r.id === selectedRegionId);
      
      if (result.encounter && region) {
        setGeneratedEncounter({
          roll: result.roll,
          encounter: result.encounter,
          regionName: region.name,
          timestamp: new Date()
        });
      }
      setIsGenerating(false);
    }, 500);
  };

  const handleGenerateAnother = () => {
    setGeneratedEncounter(null);
  };

  const modalContent = (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 border border-slate-600 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-600">
          <div className="flex items-center gap-3">
            <MapIcon className="h-6 w-6 text-emerald-400" />
            <h2 className="text-2xl font-bold text-white">Random Encounter Generator</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {!generatedEncounter ? (
            <>
              {/* Region Selection */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-3">
                  Select Region
                </label>
                <select
                  value={selectedRegionId}
                  onChange={(e) => setSelectedRegionId(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-emerald-400"
                >
                  <option value="">Choose a region...</option>
                  {regions.map((region) => (
                    <option key={region.id} value={region.id}>
                      {region.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Generate Button */}
              <div className="text-center">
                <button
                  onClick={handleGenerateEncounter}
                  disabled={!selectedRegionId || isGenerating}
                  className={`
                    flex items-center gap-3 px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-200 mx-auto
                    ${!selectedRegionId || isGenerating
                      ? 'bg-slate-600 text-slate-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-emerald-500 to-blue-500 text-white hover:shadow-lg hover:scale-105'
                    }
                  `}
                >
                  <PuzzlePieceIcon className={`h-6 w-6 ${isGenerating ? 'animate-spin' : ''}`} />
                  {isGenerating ? 'Rolling the dice...' : 'Generate Random Encounter'}
                </button>
              </div>

              {/* Information */}
              <div className="bg-slate-700/30 rounded-lg p-4 border border-slate-600/50">
                <div className="flex items-center gap-2 mb-2">
                  <SparklesIcon className="h-5 w-5 text-emerald-400" />
                  <h3 className="font-semibold text-white">How it works</h3>
                </div>
                <p className="text-slate-300 text-sm">
                  Select a region and click the generate button to roll a d12 and get a random encounter 
                  from that region's encounter table. Perfect for adding unexpected moments to your sessions!
                </p>
              </div>
            </>
          ) : (
            <>
              {/* Generated Encounter Display */}
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-emerald-500/20 to-blue-500/20 rounded-lg p-4 border border-emerald-400/30">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="bg-emerald-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">
                        {generatedEncounter.roll}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">{generatedEncounter.encounter.title}</h3>
                        <p className="text-emerald-400 text-sm">{generatedEncounter.regionName}</p>
                      </div>
                    </div>
                    <div className="text-xs text-slate-400">
                      {generatedEncounter.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                </div>

                <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
                  <h4 className="font-semibold text-white mb-3">Description</h4>
                  <p className="text-slate-300 leading-relaxed">
                    {generatedEncounter.encounter.description}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleGenerateAnother}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
                >
                  <PuzzlePieceIcon className="h-5 w-5" />
                  Generate Another
                </button>
                <button
                  onClick={onClose}
                  className="px-4 py-3 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition-colors"
                >
                  Close
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}