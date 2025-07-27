export interface NPC {
  id: string;
  name: string;
  portrait?: string;
  details: string;
  location?: string;
  occupation?: string;
  tags?: string[];
  created_at: Date;
  updated_at: Date;
}

// Empty array for NPCs - users will add their own
export const npcs: NPC[] = [];

// Helper functions
export const getNPCById = (id: string): NPC | undefined => {
  return npcs.find(npc => npc.id === id);
};

export const getNPCsByTag = (tag: string): NPC[] => {
  return npcs.filter(npc => npc.tags?.includes(tag));
};

export const searchNPCs = (query: string): NPC[] => {
  const lowercaseQuery = query.toLowerCase();
  return npcs.filter(npc => 
    npc.name.toLowerCase().includes(lowercaseQuery) ||
    npc.details.toLowerCase().includes(lowercaseQuery) ||
    npc.location?.toLowerCase().includes(lowercaseQuery) ||
    npc.occupation?.toLowerCase().includes(lowercaseQuery)
  );
};