export interface StorageAdapter {
  // Generic CRUD operations
  getAll(table: string): Promise<any[]>;
  get(table: string, id: string): Promise<any | null>;
  create(table: string, id: string, data: any): Promise<void>;
  update(table: string, id: string, data: any): Promise<void>;
  delete(table: string, id: string): Promise<void>;
  
  // Settings-specific operations
  getSetting(key: string): Promise<any | null>;
  setSetting(key: string, value: any): Promise<void>;
}

export type StorageTable = 
  | 'characters'
  | 'sessions'
  | 'quests'
  | 'downtime_activities'
  | 'companions'
  | 'npcs'
  | 'encounters'
  | 'user_potions'
  | 'user_ingredients'
  | 'user_creatures'
  | 'user_magic_items'
  | 'user_companion_types';