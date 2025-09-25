'use client';

import React from 'react';
import { DepthZone } from '@/data/vistaScenes';
import { getDepthZoneColor, getDepthZoneLabel } from '@/utils/vistaDepthManager';

interface DepthIndicatorProps {
  zone: DepthZone;
  top: number;
  height: number;
  width: number;
  visible: boolean;
  opacity?: number;
}

export default function DepthIndicator({
  zone,
  top,
  height,
  width,
  visible,
  opacity = 0.15
}: DepthIndicatorProps) {
  const color = getDepthZoneColor(zone);
  const label = getDepthZoneLabel(zone);

  if (!visible) return null;

  return (
    <div
      className="absolute pointer-events-none transition-opacity duration-300"
      style={{
        top,
        width,
        height,
        backgroundColor: `${color}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`,
        borderTop: zone !== 'background' ? `2px solid ${color}80` : undefined,
        borderBottom: zone !== 'foreground' ? `2px solid ${color}80` : undefined
      }}
    >
      {/* Zone Label */}
      <div className="absolute top-2 left-4">
        <div
          className="text-white text-sm font-medium px-2 py-1 rounded shadow-lg"
          style={{ backgroundColor: `${color}CC` }}
        >
          {label}
        </div>
      </div>

      {/* Zone Info */}
      <div className="absolute top-2 right-4">
        <div className="bg-black/60 text-white text-xs px-2 py-1 rounded">
          Scale: {zone === 'background' ? '0.6x' : zone === 'midground' ? '1.0x' : '1.4x'}
        </div>
      </div>

      {/* Visual Gradient */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          background: zone === 'background'
            ? `linear-gradient(to bottom, ${color}40, transparent)`
            : zone === 'foreground'
            ? `linear-gradient(to top, ${color}40, transparent)`
            : `linear-gradient(to bottom, transparent, ${color}20, transparent)`
        }}
      />
    </div>
  );
}