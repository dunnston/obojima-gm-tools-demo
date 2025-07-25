export interface Chapter {
  id: string;
  title: string;
  order: number;
  music: string;
  npcs: string;
  locationInfo: string;
  linkedEncounters: string[]; // Array of encounter IDs
  readAloudText: string;
  overview: string;
  treasure: string;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface GameSession {
  id: string;
  name: string;
  date: Date;
  characters: string[]; // Array of character IDs
  chapters: Chapter[];
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

// Helper functions
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