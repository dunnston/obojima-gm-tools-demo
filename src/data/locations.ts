'use client';

export interface LocationTreasure {
  id: string;
  type: 'potion' | 'ingredient' | 'magicItem';
  itemId: string;
  itemName: string;
  quantity?: number;
  notes?: string;
}

export interface Location {
  id: string;
  name: string;
  region: string;
  toneVibe?: string;
  description?: string;
  readAloudText?: string;
  npcIds?: string[];
  relatedLocationIds?: string[];
  plotHooks?: string;
  linkedQuestIds?: string[];
  treasure?: LocationTreasure[];
  treasureNotes?: string;
  encounterIds?: string[];
  dmNotes?: string;
  imageUrl?: string;
  created_at: Date;
  updated_at: Date;
}

export interface LocationFormData {
  name: string;
  region: string;
  toneVibe: string;
  description: string;
  readAloudText: string;
  npcIds: string[];
  relatedLocationIds: string[];
  plotHooks: string;
  linkedQuestIds: string[];
  treasure: LocationTreasure[];
  treasureNotes: string;
  encounterIds: string[];
  dmNotes: string;
  imageUrl: string;
}

export function createEmptyLocation(): LocationFormData {
  return {
    name: '',
    region: '',
    toneVibe: '',
    description: '',
    readAloudText: '',
    npcIds: [],
    relatedLocationIds: [],
    plotHooks: '',
    linkedQuestIds: [],
    treasure: [],
    treasureNotes: '',
    encounterIds: [],
    dmNotes: '',
    imageUrl: ''
  };
}

export function formDataToLocation(formData: LocationFormData): Omit<Location, 'id' | 'created_at' | 'updated_at'> {
  return {
    name: formData.name,
    region: formData.region,
    toneVibe: formData.toneVibe || undefined,
    description: formData.description || undefined,
    readAloudText: formData.readAloudText || undefined,
    npcIds: formData.npcIds.length > 0 ? formData.npcIds : undefined,
    relatedLocationIds: formData.relatedLocationIds.length > 0 ? formData.relatedLocationIds : undefined,
    plotHooks: formData.plotHooks || undefined,
    linkedQuestIds: formData.linkedQuestIds.length > 0 ? formData.linkedQuestIds : undefined,
    treasure: formData.treasure.length > 0 ? formData.treasure : undefined,
    treasureNotes: formData.treasureNotes || undefined,
    encounterIds: formData.encounterIds.length > 0 ? formData.encounterIds : undefined,
    dmNotes: formData.dmNotes || undefined,
    imageUrl: formData.imageUrl || undefined
  };
}

const LOCATION_STORAGE_KEY = 'obojima-locations';

export function saveLocations(locations: Location[]): void {
  localStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(locations));
}

export function loadLocations(): Location[] {
  if (typeof window === 'undefined') return [];

  try {
    const saved = localStorage.getItem(LOCATION_STORAGE_KEY);
    if (!saved) return [];

    const parsed = JSON.parse(saved);
    return parsed.map((location: any) => ({
      ...location,
      created_at: new Date(location.created_at),
      updated_at: new Date(location.updated_at)
    }));
  } catch (error) {
    console.error('Error loading locations:', error);
    return [];
  }
}

export function addLocation(locationData: Omit<Location, 'id' | 'created_at' | 'updated_at'>): Location {
  const locations = loadLocations();
  const now = new Date();

  const newLocation: Location = {
    ...locationData,
    id: `location_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    created_at: now,
    updated_at: now
  };

  locations.push(newLocation);
  saveLocations(locations);

  return newLocation;
}

export function updateLocation(id: string, updates: Partial<Omit<Location, 'id' | 'created_at'>>): Location | null {
  const locations = loadLocations();
  const locationIndex = locations.findIndex(l => l.id === id);

  if (locationIndex === -1) return null;

  const updatedLocation = {
    ...locations[locationIndex],
    ...updates,
    updated_at: new Date()
  };

  locations[locationIndex] = updatedLocation;
  saveLocations(locations);

  return updatedLocation;
}

export function deleteLocation(id: string): boolean {
  const locations = loadLocations();
  const filteredLocations = locations.filter(l => l.id !== id);

  if (filteredLocations.length === locations.length) return false;

  saveLocations(filteredLocations);
  return true;
}

export const getLocationById = (locations: Location[], id: string): Location | undefined => {
  return locations.find(location => location.id === id);
};

export const searchLocations = (locations: Location[], query: string): Location[] => {
  const lowercaseQuery = query.toLowerCase();
  return locations.filter(location =>
    location.name.toLowerCase().includes(lowercaseQuery) ||
    location.description?.toLowerCase().includes(lowercaseQuery) ||
    location.region?.toLowerCase().includes(lowercaseQuery) ||
    location.toneVibe?.toLowerCase().includes(lowercaseQuery)
  );
};
