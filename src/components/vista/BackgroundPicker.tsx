'use client';

import React, { useState, useRef } from 'react';
import { SceneBackground } from '@/data/vistaScenes';
import { BACKGROUND_PRESETS } from '@/data/vistaBackgrounds';
import { uploadBackgroundImage, UploadResult, isValidImageDataUrl } from '@/utils/backgroundUpload';
import {
  PhotoIcon,
  CloudArrowUpIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

interface BackgroundPickerProps {
  currentBackground: SceneBackground;
  onBackgroundChange: (background: SceneBackground) => void;
  readOnly?: boolean;
}

export default function BackgroundPicker({
  currentBackground,
  onBackgroundChange,
  readOnly = false
}: BackgroundPickerProps) {
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle preset background selection
  const handlePresetSelect = (presetId: string) => {
    if (readOnly) return;

    const preset = BACKGROUND_PRESETS.find(p => p.id === presetId);
    if (preset) {
      onBackgroundChange({
        primary: preset.imagePath,
        brightness: preset.suggestedBrightness || currentBackground.brightness || 1.0,
        blur: preset.suggestedBlur || currentBackground.blur || 0,
        tint: preset.suggestedTint || currentBackground.tint,
        isCustomUpload: false
      });
    }
  };

  // Handle file upload
  const handleFileUpload = async (file: File) => {
    if (readOnly) return;

    setIsUploading(true);
    setUploadResult(null);

    try {
      const result = await uploadBackgroundImage(file, 1920, 1080);
      setUploadResult(result);

      if (result.success && result.dataUrl) {
        onBackgroundChange({
          primary: result.dataUrl,
          brightness: currentBackground.brightness || 1.0,
          blur: currentBackground.blur || 0,
          tint: currentBackground.tint,
          isCustomUpload: true,
          originalFileName: result.fileName
        });
      }
    } catch (error) {
      setUploadResult({
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed'
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Handle drag and drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (readOnly) return;

    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find(file => file.type.startsWith('image/'));

    if (imageFile) {
      handleFileUpload(imageFile);
    }
  };

  // Handle file input change
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  // Clear upload result
  const clearUploadResult = () => {
    setUploadResult(null);
  };

  const isCustomBackground = currentBackground.isCustomUpload && isValidImageDataUrl(currentBackground.primary);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-900">Background</h3>
        {isCustomBackground && (
          <span className="text-xs text-green-600 font-medium">Custom Upload</span>
        )}
      </div>

      {/* Upload Section */}
      {!readOnly && (
        <div className="space-y-3">
          {/* Upload Area */}
          <div
            className={`
              border-2 border-dashed rounded-lg p-4 text-center transition-colors
              ${isUploading
                ? 'border-blue-300 bg-blue-50'
                : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
              }
            `}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <div className="space-y-2">
              <CloudArrowUpIcon className="mx-auto h-8 w-8 text-gray-400" />
              <div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50"
                >
                  {isUploading ? 'Uploading...' : 'Choose file'}
                </button>
                <span className="text-sm text-gray-500"> or drag and drop</span>
              </div>
              <p className="text-xs text-gray-500">
                PNG, JPG, WebP up to 10MB (max 4000x4000px)
              </p>
            </div>
          </div>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileInputChange}
            className="hidden"
          />

          {/* Upload Result */}
          {uploadResult && (
            <div className={`p-3 rounded-md ${uploadResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  {uploadResult.success ? (
                    <CheckCircleIcon className="h-5 w-5 text-green-400" />
                  ) : (
                    <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
                  )}
                </div>
                <div className="ml-3 flex-1">
                  <p className={`text-sm font-medium ${uploadResult.success ? 'text-green-800' : 'text-red-800'}`}>
                    {uploadResult.success ? 'Upload successful!' : 'Upload failed'}
                  </p>
                  <p className={`text-xs ${uploadResult.success ? 'text-green-600' : 'text-red-600'}`}>
                    {uploadResult.success
                      ? `${uploadResult.fileName} (${(uploadResult.fileSize! / 1024).toFixed(1)}KB)`
                      : uploadResult.error
                    }
                  </p>
                </div>
                <button
                  onClick={clearUploadResult}
                  className="flex-shrink-0 ml-2 text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Preset Backgrounds */}
      <div className="space-y-3">
        <h4 className="text-xs font-medium text-gray-700 uppercase tracking-wide">
          Preset Backgrounds
        </h4>

        <div className="grid grid-cols-2 gap-2">
          {BACKGROUND_PRESETS.map((preset) => {
            const isSelected = !isCustomBackground && currentBackground.primary === preset.imagePath;

            return (
              <button
                key={preset.id}
                onClick={() => handlePresetSelect(preset.id)}
                disabled={readOnly}
                className={`
                  relative aspect-video rounded-lg overflow-hidden border-2 transition-all
                  ${isSelected
                    ? 'border-blue-500 ring-2 ring-blue-200'
                    : 'border-gray-200 hover:border-gray-300'
                  }
                  ${readOnly ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
                `}
              >
                <div
                  className="w-full h-full bg-cover bg-center"
                  style={{ backgroundImage: `url(${preset.thumbnail || preset.imagePath})` }}
                />

                {/* Overlay with name */}
                <div className="absolute inset-0 bg-black/20 flex items-end">
                  <div className="w-full p-2 bg-gradient-to-t from-black/60 to-transparent">
                    <p className="text-xs font-medium text-white truncate">
                      {preset.name}
                    </p>
                  </div>
                </div>

                {/* Selection indicator */}
                {isSelected && (
                  <div className="absolute top-2 right-2">
                    <CheckCircleIcon className="h-5 w-5 text-blue-500" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Current Background Info */}
      {(isCustomBackground || currentBackground.primary) && (
        <div className="space-y-2">
          <h4 className="text-xs font-medium text-gray-700 uppercase tracking-wide">
            Current Background
          </h4>

          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div
                className="w-12 h-8 rounded bg-cover bg-center border border-gray-200"
                style={{ backgroundImage: `url(${currentBackground.primary})` }}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {isCustomBackground
                    ? (currentBackground.originalFileName || 'Custom Upload')
                    : BACKGROUND_PRESETS.find(preset => preset.imagePath === currentBackground.primary)?.name || 'Unknown'
                  }
                </p>
                <p className="text-xs text-gray-500">
                  {isCustomBackground ? 'Custom image' : 'Preset background'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}