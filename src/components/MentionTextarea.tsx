'use client';

import { useState, useRef, useEffect, useCallback, KeyboardEvent, ChangeEvent } from 'react';
import { createPortal } from 'react-dom';
import { useNPCs } from '@/contexts/NPCContext';
import { NPC } from '@/data/npcs';
import { UserGroupIcon } from '@heroicons/react/24/outline';

interface MentionTextareaProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  rows?: number;
}

// Regex to detect @query at cursor position (supports spaces in names via word chars + spaces)
const MENTION_TRIGGER_REGEX = /@([\w\s]*)$/;

// Regex to parse stored mention tokens: @[NPC Name](npc-id)
export const MENTION_TOKEN_REGEX = /@\[([^\]]+)\]\(([^)]+)\)/g;

export default function MentionTextarea({
  value, onChange, placeholder, className, rows = 4
}: MentionTextareaProps) {
  const { npcs } = useNPCs();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [showDropdown, setShowDropdown] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [mentionStartIndex, setMentionStartIndex] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 });

  // Filter NPCs based on the query typed after @
  const filteredNPCs = npcs.filter(npc =>
    npc.name.toLowerCase().includes(mentionQuery.toLowerCase())
  ).slice(0, 8);

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    const cursorPos = e.target.selectionStart;
    onChange(newValue);

    // Check if we're in a mention context
    const textBeforeCursor = newValue.substring(0, cursorPos);
    const match = textBeforeCursor.match(MENTION_TRIGGER_REGEX);

    if (match) {
      setMentionQuery(match[1]);
      setMentionStartIndex(cursorPos - match[0].length);
      setShowDropdown(true);
      setSelectedIndex(0);
      // Position dropdown below the textarea
      if (textareaRef.current) {
        const rect = textareaRef.current.getBoundingClientRect();
        setDropdownPos({ top: rect.bottom + 4, left: rect.left });
      }
    } else {
      setShowDropdown(false);
    }
  };

  const insertMention = useCallback((npc: NPC) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const cursorPos = textarea.selectionStart;
    const before = value.substring(0, mentionStartIndex);
    const after = value.substring(cursorPos);
    const mentionToken = `@[${npc.name}](${npc.id})`;
    const newValue = before + mentionToken + ' ' + after;
    onChange(newValue);
    setShowDropdown(false);

    // Restore focus and cursor position
    setTimeout(() => {
      const newPos = before.length + mentionToken.length + 1;
      textarea.focus();
      textarea.setSelectionRange(newPos, newPos);
    }, 0);
  }, [value, mentionStartIndex, onChange]);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (!showDropdown || filteredNPCs.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, filteredNPCs.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' || e.key === 'Tab') {
      e.preventDefault();
      insertMention(filteredNPCs[selectedIndex]);
    } else if (e.key === 'Escape') {
      setShowDropdown(false);
    }
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current && !dropdownRef.current.contains(e.target as Node) &&
        textareaRef.current && !textareaRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={className}
        rows={rows}
      />

      {showDropdown && filteredNPCs.length > 0 && createPortal(
        <div
          ref={dropdownRef}
          className="fixed z-[9999] w-72 max-h-64 overflow-y-auto bg-slate-800 border border-slate-600 rounded-lg shadow-xl"
          style={{ top: dropdownPos.top, left: dropdownPos.left }}
        >
          <div className="px-3 py-1.5 text-xs text-slate-500 border-b border-slate-700">
            NPCs — press ↑↓ to navigate, Enter to select
          </div>
          {filteredNPCs.map((npc, index) => (
            <button
              key={npc.id}
              className={`w-full flex items-center gap-3 px-3 py-2 text-left transition-colors ${
                index === selectedIndex
                  ? 'bg-pink-600/20 text-white'
                  : 'text-slate-300 hover:bg-slate-700'
              }`}
              onMouseDown={(e) => { e.preventDefault(); insertMention(npc); }}
              onMouseEnter={() => setSelectedIndex(index)}
            >
              <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-700 flex-shrink-0">
                {npc.portrait ? (
                  <img src={npc.portrait} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <UserGroupIcon className="w-4 h-4 text-slate-400" />
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <div className="text-sm font-medium truncate">{npc.name}</div>
                {npc.occupation && (
                  <div className="text-xs text-slate-400 truncate">{npc.occupation}</div>
                )}
              </div>
            </button>
          ))}
        </div>,
        document.body
      )}
    </div>
  );
}
