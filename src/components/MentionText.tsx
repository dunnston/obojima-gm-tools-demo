'use client';

import { useState, useMemo } from 'react';
import { useNPCs } from '@/contexts/NPCContext';
import { NPCDetailsModal } from './NPCDetailsModal';

// Regex to parse stored mention tokens: @[NPC Name](npc-id)
const MENTION_TOKEN_REGEX = /@\[([^\]]+)\]\(([^)]+)\)/g;

interface MentionTextProps {
  text: string;
  className?: string;
}

export default function MentionText({ text, className }: MentionTextProps) {
  const { getNpcById } = useNPCs();
  const [viewingNpcId, setViewingNpcId] = useState<string | null>(null);

  const parts = useMemo(() => {
    const result: Array<{ type: 'text' | 'mention'; content: string; npcId?: string }> = [];
    let lastIndex = 0;

    const regex = new RegExp(MENTION_TOKEN_REGEX.source, 'g');
    let match;

    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        result.push({ type: 'text', content: text.slice(lastIndex, match.index) });
      }
      result.push({ type: 'mention', content: match[1], npcId: match[2] });
      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < text.length) {
      result.push({ type: 'text', content: text.slice(lastIndex) });
    }

    return result;
  }, [text]);

  // If no mentions found, render plain text for performance
  if (parts.length === 1 && parts[0].type === 'text') {
    return <span className={className}>{text}</span>;
  }

  const viewingNpc = viewingNpcId ? getNpcById(viewingNpcId) : null;

  return (
    <>
      <span className={className}>
        {parts.map((part, i) => {
          if (part.type === 'mention') {
            const npc = part.npcId ? getNpcById(part.npcId) : null;
            return (
              <button
                key={i}
                onClick={() => part.npcId && setViewingNpcId(part.npcId)}
                className="text-pink-400 hover:text-pink-300 font-medium underline decoration-pink-400/30 hover:decoration-pink-300 transition-colors cursor-pointer"
                title={npc ? `${npc.name}${npc.occupation ? ` — ${npc.occupation}` : ''}` : part.content}
              >
                @{part.content}
              </button>
            );
          }
          return <span key={i}>{part.content}</span>;
        })}
      </span>

      {viewingNpc && (
        <NPCDetailsModal
          npc={viewingNpc}
          onClose={() => setViewingNpcId(null)}
        />
      )}
    </>
  );
}
