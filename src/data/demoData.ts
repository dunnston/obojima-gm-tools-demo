// Demo data for NPCs and Companions when running in demo mode
// This ensures users can interact with the Vista system even on Vercel without image uploads

import { NPC } from './npcs';
import { Companion } from './companions';

// Demo NPCs based on user's local setup (using available portrait images)
export const DEMO_NPCS: NPC[] = [
  {
    id: 'demo-npc-archer',
    name: 'Elara the Archer',
    portrait: '/images/vista/Portraits/NPCs/Girl.png', // Using available Girl image as archer
    details: 'A skilled ranger from the northern forests. She knows every trail and hidden path through the wilderness.',
    location: 'Forest Outpost',
    occupation: 'Ranger',
    tags: ['archer', 'ranger', 'forest', 'guide'],
    created_at: new Date('2024-01-01T00:00:00.000Z'),
    updated_at: new Date('2024-01-01T00:00:00.000Z')
  },
  {
    id: 'demo-npc-noble',
    name: 'Lord Aldric',
    portrait: '/images/vista/Portraits/NPCs/noble.png',
    details: 'A wealthy noble from the capital city. He has connections throughout the kingdom and can open doors that others cannot.',
    location: 'Royal Palace',
    occupation: 'Noble',
    tags: ['noble', 'wealthy', 'political', 'connections'],
    created_at: new Date('2024-01-01T00:00:00.000Z'),
    updated_at: new Date('2024-01-01T00:00:00.000Z')
  },
  {
    id: 'demo-npc-sword-kid',
    name: 'Kai the Young Swordsman',
    portrait: '/images/vista/Portraits/NPCs/noble.png', // Using noble image as young swordsman
    details: 'An eager young warrior training to become a knight. Full of enthusiasm but still learning the ways of combat.',
    location: 'Training Grounds',
    occupation: 'Knight Apprentice',
    tags: ['young', 'warrior', 'trainee', 'enthusiastic'],
    created_at: new Date('2024-01-01T00:00:00.000Z'),
    updated_at: new Date('2024-01-01T00:00:00.000Z')
  },
  {
    id: 'demo-npc-sally',
    name: 'Sally the Merchant',
    portrait: '/images/vista/Portraits/NPCs/Girl.png',
    details: 'A friendly shopkeeper who knows the value of everything and has connections with traders across the realm.',
    location: 'Market District',
    occupation: 'Merchant',
    tags: ['merchant', 'trader', 'friendly', 'knowledgeable'],
    created_at: new Date('2024-01-01T00:00:00.000Z'),
    updated_at: new Date('2024-01-01T00:00:00.000Z')
  }
];

// Demo Companions based on user's local setup
export const DEMO_COMPANIONS: Companion[] = [
  {
    id: 'demo-companion-billy',
    name: 'Billy',
    goal: 'Find their lost family',
    desire: 'Affection from others',
    disposition: 'Friendly',
    quirk: 'Hums or sings constantly',
    companion_type_id: 'spirit-bear', // Assuming a bear-type companion
    spirit_form: 'Bear Spirit',
    image: '/images/companions/companion-1758808343757.png',
    created_at: new Date('2024-01-01T00:00:00.000Z'),
    updated_at: new Date('2024-01-01T00:00:00.000Z')
  },
  {
    id: 'demo-companion-glovey',
    name: 'Glovey',
    goal: 'Collect a specific type of object',
    desire: 'New possessions',
    disposition: 'Curious',
    quirk: 'Always wants to be touching someone or something',
    companion_type_id: 'spirit-monkey', // Assuming a monkey-type companion
    spirit_form: 'Monkey Spirit',
    image: '/images/companions/companion-1758808674246.png',
    created_at: new Date('2024-01-01T00:00:00.000Z'),
    updated_at: new Date('2024-01-01T00:00:00.000Z')
  }
];

// Function to check if we should use demo data
export const shouldUseDemoData = (): boolean => {
  return process.env.NEXT_PUBLIC_DEMO_MODE === 'true' ||
         typeof window !== 'undefined' && window.location.hostname === 'localhost' ||
         typeof window !== 'undefined' && window.location.hostname.includes('vercel');
};

// Function to get demo NPCs if in demo mode
export const getDemoNPCs = (): NPC[] => {
  return shouldUseDemoData() ? DEMO_NPCS : [];
};

// Function to get demo companions if in demo mode
export const getDemoCompanions = (): Companion[] => {
  return shouldUseDemoData() ? DEMO_COMPANIONS : [];
};

// Function to merge demo data with user data
export const mergeWithDemoData = <T extends { id: string }>(
  userData: T[],
  demoData: T[]
): T[] => {
  if (!shouldUseDemoData()) {
    return userData;
  }

  // Create a map of existing user data IDs to avoid duplicates
  const userIds = new Set(userData.map(item => item.id));

  // Add demo data items that don't conflict with user data
  const uniqueDemoData = demoData.filter(item => !userIds.has(item.id));

  return [...userData, ...uniqueDemoData];
};