'use client';

export type QuestStatus = 'available' | 'in-progress' | 'completed' | 'failed';

export type QuestRewardType = 'magic-item' | 'potion' | 'gold' | 'ingredient' | 'other';

export interface QuestReward {
  id: string;
  type: QuestRewardType;
  name: string;
  description?: string;
  quantity?: number;
  value?: number;
}

export interface QuestObjective {
  id: string;
  description: string;
  completed: boolean;
  order: number;
}

export interface Quest {
  id: string;
  title: string;
  questGiver: string;
  description: string;
  status: QuestStatus;
  objectives: QuestObjective[];
  rewards: QuestReward[];
  dateCreated: Date;
  dateUpdated: Date;
  dateCompleted?: Date;
  notes?: string;
}

export interface QuestFormData {
  title: string;
  questGiver: string;
  description: string;
  status: QuestStatus;
  objectives: string[];
  rewards: Omit<QuestReward, 'id'>[];
  notes: string;
}

export function createEmptyQuest(): QuestFormData {
  return {
    title: '',
    questGiver: '',
    description: '',
    status: 'available',
    objectives: [''],
    rewards: [],
    notes: ''
  };
}

export function formDataToQuest(formData: QuestFormData): Omit<Quest, 'id' | 'dateCreated' | 'dateUpdated'> {
  return {
    title: formData.title,
    questGiver: formData.questGiver,
    description: formData.description,
    status: formData.status,
    objectives: formData.objectives
      .filter(obj => obj.trim())
      .map((description, index) => ({
        id: `obj-${Date.now()}-${index}`,
        description: description.trim(),
        completed: false,
        order: index
      })),
    rewards: formData.rewards.map(reward => ({
      ...reward,
      id: `reward-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    })),
    notes: formData.notes,
    dateCompleted: formData.status === 'completed' ? new Date() : undefined
  };
}

export const QUEST_REWARD_TYPES: { value: QuestRewardType; label: string }[] = [
  { value: 'magic-item', label: 'Magic Item' },
  { value: 'potion', label: 'Potion' },
  { value: 'gold', label: 'Gold' },
  { value: 'ingredient', label: 'Ingredient' },
  { value: 'other', label: 'Other' }
];

const QUEST_STORAGE_KEY = 'obojima-quests';

export function saveQuests(quests: Quest[]): void {
  localStorage.setItem(QUEST_STORAGE_KEY, JSON.stringify(quests));
}

export function loadQuests(): Quest[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const saved = localStorage.getItem(QUEST_STORAGE_KEY);
    if (!saved) return [];
    
    const parsed = JSON.parse(saved);
    return parsed.map((quest: any) => ({
      ...quest,
      dateCreated: new Date(quest.dateCreated),
      dateUpdated: new Date(quest.dateUpdated),
      dateCompleted: quest.dateCompleted ? new Date(quest.dateCompleted) : undefined
    }));
  } catch (error) {
    console.error('Error loading quests:', error);
    return [];
  }
}

export function addQuest(questData: Omit<Quest, 'id' | 'dateCreated' | 'dateUpdated'>): Quest {
  const quests = loadQuests();
  const now = new Date();
  
  const newQuest: Quest = {
    ...questData,
    id: `quest-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    dateCreated: now,
    dateUpdated: now
  };
  
  quests.push(newQuest);
  saveQuests(quests);
  
  return newQuest;
}

export function updateQuest(id: string, updates: Partial<Omit<Quest, 'id' | 'dateCreated'>>): Quest | null {
  const quests = loadQuests();
  const questIndex = quests.findIndex(q => q.id === id);
  
  if (questIndex === -1) return null;
  
  const updatedQuest = {
    ...quests[questIndex],
    ...updates,
    dateUpdated: new Date(),
    dateCompleted: updates.status === 'completed' ? new Date() : 
                   updates.status && updates.status !== 'completed' ? undefined : 
                   quests[questIndex].dateCompleted
  };
  
  quests[questIndex] = updatedQuest;
  saveQuests(quests);
  
  return updatedQuest;
}

export function deleteQuest(id: string): boolean {
  const quests = loadQuests();
  const filteredQuests = quests.filter(q => q.id !== id);
  
  if (filteredQuests.length === quests.length) return false;
  
  saveQuests(filteredQuests);
  return true;
}

export function getQuestsByStatus(status: QuestStatus): Quest[] {
  return loadQuests().filter(quest => quest.status === status);
}