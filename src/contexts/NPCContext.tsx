'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { NPC } from '@/data/npcs';
import { syncService } from '@/services/sync';

interface NPCContextType {
  npcs: NPC[];
  getNpcById: (id: string) => NPC | undefined;
  refreshNpcs: () => Promise<void>;
}

const NPCContext = createContext<NPCContextType>({
  npcs: [],
  getNpcById: () => undefined,
  refreshNpcs: async () => {},
});

export function NPCProvider({ children }: { children: ReactNode }) {
  const [npcs, setNpcs] = useState<NPC[]>([]);

  const loadNpcs = useCallback(async () => {
    try {
      const result = await syncService.getNpcs();
      if (result.success && result.data) {
        setNpcs(result.data);
      }
    } catch (error) {
      console.error('NPCContext: Error loading NPCs', error);
    }
  }, []);

  useEffect(() => {
    loadNpcs();
    const interval = setInterval(loadNpcs, 30000);
    return () => clearInterval(interval);
  }, [loadNpcs]);

  const getNpcById = useCallback((id: string) => {
    return npcs.find(n => n.id === id);
  }, [npcs]);

  return (
    <NPCContext.Provider value={{ npcs, getNpcById, refreshNpcs: loadNpcs }}>
      {children}
    </NPCContext.Provider>
  );
}

export const useNPCs = () => useContext(NPCContext);
