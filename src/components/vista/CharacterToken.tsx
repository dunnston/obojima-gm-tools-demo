'use client';

import React, { useState, useCallback, useRef } from 'react';
import { VistaCharacterToken, Point } from '@/data/vistaScenes';
import { getTokenStyles, getTokenTransform } from '@/utils/vistaDepthManager';
import { DEFAULT_TOKEN_STYLES } from '@/data/vistaBackgrounds';
import {
  LockClosedIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline';

interface CharacterTokenProps {
  token: VistaCharacterToken;
  isSelected: boolean;
  isDragging: boolean;
  readOnly?: boolean;
  onDragStart: (tokenId: string, offset: Point) => void;
  onDragMove: (tokenId: string, position: Point) => void;
  onDragEnd: (tokenId: string) => void;
  onSelect: (tokenId: string, multi: boolean) => void;
  onContextMenu: (tokenId: string, position: Point) => void;
}

const TOKEN_SIZE = 200; // Base size in pixels - larger for scene integration

export default function CharacterToken({
  token,
  isSelected,
  isDragging,
  readOnly = false,
  onDragStart,
  onDragMove,
  onDragEnd,
  onSelect,
  onContextMenu
}: CharacterTokenProps) {
  const tokenRef = useRef<HTMLDivElement>(null);
  const [dragOffset, setDragOffset] = useState<Point>({ x: 0, y: 0 });
  const [isPointerDown, setIsPointerDown] = useState(false);
  const [hasStartedDrag, setHasStartedDrag] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Handle pointer down (start potential drag)
  const handlePointerDown = useCallback((event: React.PointerEvent) => {
    if (readOnly || token.locked) return;

    event.preventDefault();
    event.stopPropagation();

    const rect = tokenRef.current?.getBoundingClientRect();
    if (rect) {
      const offset = {
        x: event.clientX - rect.left - rect.width / 2,
        y: event.clientY - rect.top - rect.height / 2
      };
      setDragOffset(offset);
    }

    setIsPointerDown(true);
    setHasStartedDrag(false);

    // Select the token
    const isMultiSelect = event.ctrlKey || event.metaKey || event.shiftKey;
    onSelect(token.id, isMultiSelect);

    // Capture pointer for drag operations
    (event.target as HTMLElement).setPointerCapture(event.pointerId);
  }, [readOnly, token.locked, token.id, onSelect]);

  // Handle pointer move (dragging)
  const handlePointerMove = useCallback((event: React.PointerEvent) => {
    if (!isPointerDown || readOnly || token.locked) return;

    // Start drag operation if not already started
    if (!hasStartedDrag) {
      setHasStartedDrag(true);
      onDragStart(token.id, dragOffset);
    }

    // Calculate new position
    const newPosition = {
      x: event.clientX - dragOffset.x,
      y: event.clientY - dragOffset.y
    };

    onDragMove(token.id, newPosition);
  }, [isPointerDown, readOnly, token.locked, hasStartedDrag, token.id, dragOffset, onDragStart, onDragMove]);

  // Handle pointer up (end drag)
  const handlePointerUp = useCallback((event: React.PointerEvent) => {
    if (!isPointerDown) return;

    setIsPointerDown(false);

    if (hasStartedDrag) {
      onDragEnd(token.id);
      setHasStartedDrag(false);
    }

    // Release pointer capture
    (event.target as HTMLElement).releasePointerCapture(event.pointerId);
  }, [isPointerDown, hasStartedDrag, token.id, onDragEnd]);

  // Handle context menu (right-click)
  const handleContextMenu = useCallback((event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    const position = { x: event.clientX, y: event.clientY };
    onContextMenu(token.id, position);
  }, [token.id, onContextMenu]);

  // Handle double-click for quick actions
  const handleDoubleClick = useCallback((event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    // Could implement quick edit or other actions
    console.log('Double-clicked token:', token.name || 'Unnamed Token');
  }, [token.name]);

  // Calculate token styles
  const tokenStyles = getTokenStyles(token, isDragging);
  const actualSize = TOKEN_SIZE * (token.customScale || token.scale);


  // Determine if we should use a CSS-based token
  const shouldUseCSSToken = !token.portrait || token.portrait === '';

  // Debug logging
  console.log('Token rendering:', {
    name: token.name,
    portrait: token.portrait,
    shouldUseCSSToken
  });

  // Get token style for CSS-based tokens
  const getTokenStyle = () => {
    if (!shouldUseCSSToken) return null;

    // Try to match token name to a known style
    const tokenName = (token.name || '').toLowerCase();
    for (const [key, style] of Object.entries(DEFAULT_TOKEN_STYLES)) {
      if (tokenName.includes(key.toLowerCase())) {
        return style;
      }
    }
    // Default style if no match
    return DEFAULT_TOKEN_STYLES.commoner;
  };

  const cssTokenStyle = getTokenStyle();

  // Determine border style based on selection and state
  const getBorderStyles = () => {
    if (token.locked) {
      return { borderWidth: '3px', borderStyle: 'solid', borderColor: '#ef4444' };
    }
    if (isSelected) {
      return { borderWidth: '3px', borderStyle: 'solid', borderColor: '#3b82f6' };
    }
    if (isHovered) {
      return { borderWidth: '2px', borderStyle: 'solid', borderColor: 'rgba(255, 255, 255, 0.5)' };
    }
    return { borderWidth: '0px', borderStyle: 'solid', borderColor: 'transparent' };
  };

  // Get hover effects
  const getHoverEffects = () => {
    if (token.locked || readOnly) {
      return '';
    }
    return 'hover:brightness-110 hover:scale-105';
  };

  return (
    <div
      ref={tokenRef}
      className={`
        absolute select-none transition-all duration-200
        ${isDragging ? 'z-50' : ''}
        ${!readOnly && !token.locked ? 'cursor-grab active:cursor-grabbing' : 'cursor-not-allowed'}
        ${getHoverEffects()}
        ${isSelected ? 'ring-2 ring-blue-400 ring-offset-2' : ''}
      `}
      style={{
        ...tokenStyles,
        ...getBorderStyles(),
        width: actualSize,
        height: actualSize * 1.8, // Characters are taller than they are wide
        borderRadius: '8px', // Slight rounding instead of circle
        outline: 'none', // Ensure no outline
        boxShadow: isDragging
          ? '0 10px 25px rgba(0, 0, 0, 0.5)'
          : isSelected
          ? '0 4px 15px rgba(59, 130, 246, 0.4)'
          : 'none' // No shadow when not selected or dragging
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      onPointerEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onContextMenu={handleContextMenu}
      onDoubleClick={handleDoubleClick}
      title={`${token.name || 'Unnamed Token'} (${token.depth})`}
    >
      {/* Character Portrait */}
      {shouldUseCSSToken ? (
        /* CSS-based token */
        <div
          className="w-full h-full rounded-lg flex flex-col items-center justify-center overflow-hidden shadow-inner"
          style={{
            backgroundColor: cssTokenStyle?.bg || '#f3f4f6',
            color: cssTokenStyle?.color || '#6b7280',
            borderWidth: '0px',
            borderStyle: 'none',
            borderColor: 'transparent',
            outline: 'none'
          }}
        >
          <div className="text-4xl mb-2">
            {cssTokenStyle?.emoji || '👤'}
          </div>
          <div className="text-sm font-bold text-center px-2 leading-tight">
            {(token.name || 'Token').split(' ')[0].substring(0, 8).toUpperCase()}
          </div>
        </div>
      ) : (
        /* Image-based character - full body display */
        <div
          className="w-full h-full rounded-lg bg-contain bg-center bg-no-repeat overflow-hidden"
          style={{
            backgroundImage: `url(${token.portrait})`,
            backgroundColor: 'transparent',
            borderWidth: '0px',
            borderStyle: 'none',
            borderColor: 'transparent',
            outline: 'none'
          }}
        >
          {/* Fallback content when image fails to load */}
          <div
            className="w-full h-full flex flex-col items-center justify-center text-white font-bold opacity-0 hover:opacity-100 transition-opacity"
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              color: 'white'
            }}
          >
            <div className="text-lg mb-1">
              {cssTokenStyle?.emoji || (token.name || '?').charAt(0).toUpperCase()}
            </div>
            <div className="text-xs text-center px-1">
              {(token.name || 'Token').split(' ')[0].substring(0, 6).toUpperCase()}
            </div>
          </div>
        </div>
      )}

      {/* All indicators temporarily removed to debug the "0" display issue */}
    </div>
  );
}