// Creature Import/Export Utilities
import { Creature } from '@/data/creatures';

export interface CreatureImportResult {
  success: boolean;
  imported: number;
  errors: string[];
}

/**
 * Import creatures from JSON data
 */
export function importCreaturesFromJSON(jsonData: any[]): CreatureImportResult {
  const result: CreatureImportResult = {
    success: false,
    imported: 0,
    errors: []
  };

  if (!Array.isArray(jsonData)) {
    result.errors.push('Invalid format: Expected an array of creatures');
    return result;
  }

  const validCreatures: Creature[] = [];
  
  jsonData.forEach((creature, index) => {
    try {
      // Validate required fields
      if (!creature.name || typeof creature.name !== 'string') {
        result.errors.push(`Creature ${index + 1}: Missing or invalid name`);
        return;
      }
      
      if (!creature.size || typeof creature.size !== 'string') {
        result.errors.push(`Creature ${index + 1} (${creature.name}): Missing or invalid size`);
        return;
      }
      
      if (!creature.type || typeof creature.type !== 'string') {
        result.errors.push(`Creature ${index + 1} (${creature.name}): Missing or invalid type`);
        return;
      }

      // Validate ability scores
      if (!creature.ability_scores || typeof creature.ability_scores !== 'object') {
        result.errors.push(`Creature ${index + 1} (${creature.name}): Missing or invalid ability_scores`);
        return;
      }

      const requiredStats = ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'];
      for (const stat of requiredStats) {
        if (typeof creature.ability_scores[stat] !== 'number') {
          result.errors.push(`Creature ${index + 1} (${creature.name}): Missing or invalid ${stat} score`);
          return;
        }
      }

      validCreatures.push(creature as Creature);
      result.imported++;
    } catch (error) {
      result.errors.push(`Creature ${index + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  });

  if (validCreatures.length > 0) {
    // Store imported creatures in localStorage
    const existingCreatures = getImportedCreatures();
    const newCreatures = [...existingCreatures];
    
    validCreatures.forEach(newCreature => {
      // Check if creature already exists (by name) and replace it
      const existingIndex = newCreatures.findIndex(c => c.name === newCreature.name);
      if (existingIndex >= 0) {
        newCreatures[existingIndex] = newCreature;
      } else {
        newCreatures.push(newCreature);
      }
    });
    
    localStorage.setItem('importedCreatures', JSON.stringify(newCreatures));
    result.success = true;
  }

  return result;
}

/**
 * Get all imported creatures from localStorage
 */
export function getImportedCreatures(): Creature[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem('importedCreatures');
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error loading imported creatures:', error);
    return [];
  }
}

/**
 * Clear all imported creatures
 */
export function clearImportedCreatures(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('importedCreatures');
  }
}

/**
 * Export creatures to JSON format (for backup)
 */
export function exportCreaturesToJSON(creatures: Creature[]): string {
  return JSON.stringify(creatures, null, 2);
}

/**
 * Download creatures as JSON file
 */
export function downloadCreaturesJSON(creatures: Creature[], filename: string = 'creatures-backup.json'): void {
  const jsonString = exportCreaturesToJSON(creatures);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}