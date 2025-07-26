import { PlayerCharacter } from './characters';
import { Creature } from './creatures';
import { Encounter } from './creatures';

export interface SessionMusic {
  id: string;
  name: string;
  filename: string;
  url?: string; // For uploaded files
  duration?: string;
  tags?: string[]; // e.g., "combat", "ambient", "dramatic"
}

export interface SessionTreasure {
  id: string;
  type: 'potion' | 'ingredient' | 'magicItem';
  itemId: string; // Reference to the actual item
  itemName: string;
  quantity?: number;
  notes?: string;
}

export interface SessionNPC {
  id: string;
  name: string;
  description?: string;
  role?: string; // "ally", "enemy", "neutral", "merchant", etc.
  location?: string;
  notes?: string;
  imageUrl?: string;
  stats?: any; // Could link to creature stats if needed
}

export interface SessionScene {
  id: string;
  title: string;
  description: string; // What might happen in this scene
  readAloudText?: string;
  music?: SessionMusic[];
  npcs?: SessionNPC[];
  encounters?: string[]; // References to saved encounter IDs
  treasure?: SessionTreasure[];
  notes?: string; // GM notes during play
  order: number; // For scene ordering
}

export interface SessionSecretClue {
  id: string;
  title: string;
  content: string;
  revealed?: boolean;
  revealedToPlayers?: string[]; // Player character IDs who know this
}

export interface SessionCreature {
  id: string;
  creatureName: string; // Reference to creature name from database
  notes?: string;
  quantity?: number;
  context?: string; // e.g., "potential boss", "patrol guard", "random encounter"
}

export interface GameSession {
  id: string;
  name: string;
  date: Date;
  playerCharacters: string[]; // References to PlayerCharacter IDs
  
  // Session sections
  music: SessionMusic[];
  strongStart: string;
  secretsAndClues: SessionSecretClue[];
  encounters: string[]; // References to saved encounter IDs
  npcs: SessionNPC[];
  creatures: SessionCreature[];
  treasure: SessionTreasure[];
  scenes: SessionScene[];
  
  // Session notes
  sessionNotes: string;
  
  // Metadata
  status: 'planned' | 'in-progress' | 'completed';
  createdAt: Date;
  updatedAt: Date;
}

export interface SessionFormData {
  name: string;
  date: string;
  playerCharacters: string[];
}

// Helper functions
export const createEmptySession = (): Omit<GameSession, 'id' | 'createdAt' | 'updatedAt'> => ({
  name: '',
  date: new Date(),
  playerCharacters: [],
  music: [],
  strongStart: '',
  secretsAndClues: [],
  encounters: [],
  npcs: [],
  creatures: [],
  treasure: [],
  scenes: [],
  sessionNotes: '',
  status: 'planned'
});

export const createEmptyScene = (order: number): Omit<SessionScene, 'id'> => ({
  title: '',
  description: '',
  readAloudText: '',
  music: [],
  npcs: [],
  encounters: [],
  treasure: [],
  notes: '',
  order
});

export const createEmptyNPC = (): Omit<SessionNPC, 'id'> => ({
  name: '',
  description: '',
  role: 'neutral',
  location: '',
  notes: '',
  imageUrl: ''
});

export const createEmptySecretClue = (): Omit<SessionSecretClue, 'id'> => ({
  title: '',
  content: '',
  revealed: false,
  revealedToPlayers: []
});

// Session management functions
export const addMusicToSession = (session: GameSession, music: SessionMusic): GameSession => ({
  ...session,
  music: [...session.music, music],
  updatedAt: new Date()
});

export const addSceneToSession = (session: GameSession, scene: SessionScene): GameSession => ({
  ...session,
  scenes: [...session.scenes, scene].sort((a, b) => a.order - b.order),
  // Also add scene assets to session-level collections
  music: [...session.music, ...scene.music?.filter(m => 
    !session.music.some(sm => sm.id === m.id)
  ) || []],
  npcs: [...session.npcs, ...scene.npcs?.filter(n => 
    !session.npcs.some(sn => sn.id === n.id)
  ) || []],
  treasure: [...session.treasure, ...scene.treasure?.filter(t => 
    !session.treasure.some(st => st.id === t.id)
  ) || []],
  updatedAt: new Date()
});

export const updateScene = (session: GameSession, sceneId: string, updates: Partial<SessionScene>): GameSession => ({
  ...session,
  scenes: session.scenes.map(scene => 
    scene.id === sceneId ? { ...scene, ...updates } : scene
  ),
  updatedAt: new Date()
});

export const getSessionAssets = (session: GameSession) => {
  // Collect all unique assets from scenes and session level
  const allMusic = [...session.music];
  const allNPCs = [...session.npcs];
  const allTreasure = [...session.treasure];
  
  session.scenes.forEach(scene => {
    scene.music?.forEach(music => {
      if (!allMusic.some(m => m.id === music.id)) {
        allMusic.push(music);
      }
    });
    
    scene.npcs?.forEach(npc => {
      if (!allNPCs.some(n => n.id === npc.id)) {
        allNPCs.push(npc);
      }
    });
    
    scene.treasure?.forEach(treasure => {
      if (!allTreasure.some(t => t.id === treasure.id)) {
        allTreasure.push(treasure);
      }
    });
  });
  
  return { music: allMusic, npcs: allNPCs, treasure: allTreasure };
};

// Legacy types for backward compatibility (can be removed later)
export interface Chapter {
  id: string;
  title: string;
  order: number;
  music: string;
  npcs: string;
  locationInfo: string;
  linkedEncounters: string[];
  readAloudText: string;
  overview: string;
  treasure: string;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChapterFormData {
  title: string;
  music: string;
  npcs: string;
  locationInfo: string;
  linkedEncounters: string[];
  readAloudText: string;
  overview: string;
  treasure: string;
  notes: string;
}

export const createEmptyChapter = (): ChapterFormData => ({
  title: '',
  music: '',
  npcs: '',
  locationInfo: '',
  linkedEncounters: [],
  readAloudText: '',
  overview: '',
  treasure: '',
  notes: ''
});

export const formDataToChapter = (formData: ChapterFormData, order: number): Omit<Chapter, 'id' | 'createdAt' | 'updatedAt'> => ({
  title: formData.title,
  order,
  music: formData.music,
  npcs: formData.npcs,
  locationInfo: formData.locationInfo,
  linkedEncounters: formData.linkedEncounters,
  readAloudText: formData.readAloudText,
  overview: formData.overview,
  treasure: formData.treasure,
  notes: formData.notes
});

export const chapterToFormData = (chapter: Chapter): ChapterFormData => ({
  title: chapter.title,
  music: chapter.music,
  npcs: chapter.npcs,
  locationInfo: chapter.locationInfo,
  linkedEncounters: chapter.linkedEncounters,
  readAloudText: chapter.readAloudText,
  overview: chapter.overview,
  treasure: chapter.treasure,
  notes: chapter.notes
});