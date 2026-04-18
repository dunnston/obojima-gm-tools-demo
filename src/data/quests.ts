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
  locationId?: string;
  locationName?: string;
}

export interface QuestFormData {
  title: string;
  questGiver: string;
  description: string;
  status: QuestStatus;
  objectives: string[];
  rewards: Omit<QuestReward, 'id'>[];
  notes: string;
  locationId?: string;
  locationName?: string;
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
    locationId: formData.locationId,
    locationName: formData.locationName,
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

