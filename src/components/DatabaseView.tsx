'use client';

import { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { combatPotions, utilityPotions, whimsyPotions } from '@/data/potions';
import { ingredients } from '@/data/ingredients';
import { creatures } from '@/data/creatures';
import { getImportedCreatures } from '@/utils/creatureImport';
import { LOCATIONS } from '@/utils/ingredientForaging';
import { magicItems } from '@/data/magicItems';
import { companionTypes } from '@/data/companionTypes';
import { companions } from '@/data/companions';
import { PotionEditForm, IngredientEditForm, CreatureEditForm, MagicItemEditForm, NPCEditForm, CompanionTypeEditForm, CompanionEditForm, LocationEditForm } from './EditForms';
import { getPotionImagePath, getIngredientImagePath, getCreatureImagePath, getMagicItemImagePath } from '@/utils/imageUtils';
import {
  BeakerIcon,
  SparklesIcon,
  FireIcon,
  GiftIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  EyeIcon,
  PlusIcon,
  TrashIcon,
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  UserGroupIcon,
  XMarkIcon,
  ArrowPathIcon,
  MapPinIcon,
} from '@heroicons/react/24/outline';
import { regions } from '@/data/encounters';
import { LocationDetailsModal } from './LocationDetailsModal';
import { syncService } from '@/services/sync';
import { useItemTranslation } from '@/hooks/useItemTranslation';

type TabType = 'potions' | 'ingredients' | 'creatures' | 'magicItems' | 'npcs' | 'companionTypes' | 'companions' | 'locations';

export default function DatabaseView() {
  const [activeTab, setActiveTab] = useState<TabType>('potions');
  const [editingItem, setEditingItem] = useState<any>(null);
  const [editingType, setEditingType] = useState<string>('');
  const { t } = useTranslation();
  const { translatePotionName, translateIngredientName } = useItemTranslation();
  
  // State for modified data with localStorage persistence
  const [modifiedIngredients, setModifiedIngredients] = useState<any[]>([]);
  const [modifiedPotions, setModifiedPotions] = useState<any[]>([]);
  const [modifiedCreatures, setModifiedCreatures] = useState<any[]>([]);
  const [modifiedMagicItems, setModifiedMagicItems] = useState<any[]>([]);
  const [modifiedNPCs, setModifiedNPCs] = useState<any[]>([]);
  const [modifiedCompanionTypes, setModifiedCompanionTypes] = useState<any[]>([]);
  const [modifiedCompanions, setModifiedCompanions] = useState<any[]>([]);
  const [modifiedLocations, setModifiedLocations] = useState<any[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'error'>('idle');

  // Migration helper to ensure all items have unique IDs
  const migrateCreaturesWithIds = (creatures: any[]): any[] => {
    const seenIds = new Set<string>();
    return creatures.map((creature, index) => {
      // Generate ID if missing or if it's a duplicate
      let id = creature.id;
      if (!id || seenIds.has(id)) {
        id = `creature-${creature.name?.toLowerCase().replace(/[^a-z0-9]/g, '-') || 'unknown'}-${Date.now()}-${index}`;
      }
      seenIds.add(id);
      return { ...creature, id };
    });
  };

  const migrateMagicItemsWithIds = (items: any[]): any[] => {
    const seenIds = new Set<string>();
    return items.map((item, index) => {
      let id = item.id;
      if (!id || seenIds.has(id)) {
        id = `magic-item-${item.name?.toLowerCase().replace(/[^a-z0-9]/g, '-') || 'unknown'}-${Date.now()}-${index}`;
      }
      seenIds.add(id);
      return { ...item, id };
    });
  };

  // Load all user-generated data with sync
  const loadAllUserData = async () => {
    setSyncStatus('syncing');
    try {
      // Load all user-generated content in parallel
      const [
        potionData,
        ingredientData,
        creatureData,
        magicItemData,
        npcData,
        companionTypeData,
        companionData,
        locationData
      ] = await Promise.all([
        syncService.syncWithFallback('user-potions', 'modifiedPotions'),
        syncService.syncWithFallback('user-ingredients', 'modifiedIngredients'),
        syncService.syncWithFallback('user-creatures', 'modifiedCreatures'),
        syncService.syncWithFallback('user-magic-items', 'modifiedMagicItems'),
        syncService.syncWithFallback('npcs', 'modifiedNPCs'),
        syncService.syncWithFallback('user-companion-types', 'modifiedCompanionTypes'),
        syncService.syncWithFallback('companions', 'modifiedCompanions'),
        syncService.syncWithFallback('locations', 'obojima-locations')
      ]);

      console.log('Loaded potion data from sync:', potionData);
      console.log('LocalStorage modifiedPotions:', localStorage.getItem('modifiedPotions'));

      // Migrate data to ensure all items have unique IDs
      const migratedCreatures = migrateCreaturesWithIds(creatureData);
      const migratedMagicItems = migrateMagicItemsWithIds(magicItemData);

      // If migration added IDs, save the migrated data back
      if (JSON.stringify(migratedCreatures) !== JSON.stringify(creatureData)) {
        console.log('Migrating creatures with new IDs...');
        await saveUserCreatures(migratedCreatures);
      }
      if (JSON.stringify(migratedMagicItems) !== JSON.stringify(magicItemData)) {
        console.log('Migrating magic items with new IDs...');
        await saveUserMagicItems(migratedMagicItems);
      }

      setModifiedPotions(potionData);
      setModifiedIngredients(ingredientData);
      setModifiedCreatures(migratedCreatures);
      setModifiedMagicItems(migratedMagicItems);
      setModifiedNPCs(npcData);
      setModifiedCompanionTypes(companionTypeData);
      setModifiedCompanions(companionData);
      setModifiedLocations(locationData);
      setIsLoaded(true);
      setSyncStatus('idle');
    } catch (error) {
      console.error('Error loading user data:', error);
      setSyncStatus('error');
      // Fall back to localStorage loading
      loadFromLocalStorage();
    }
  };

  // Fallback localStorage loading (keeping original logic)
  const loadFromLocalStorage = () => {
    if (typeof window !== 'undefined') {
      const savedIngredients = localStorage.getItem('modifiedIngredients');
      const savedPotions = localStorage.getItem('modifiedPotions');
      const savedCreatures = localStorage.getItem('modifiedCreatures');
      const savedMagicItems = localStorage.getItem('modifiedMagicItems');

      if (savedIngredients) {
        try {
          const parsedIngredients = JSON.parse(savedIngredients);
          setModifiedIngredients(parsedIngredients);
        } catch (error) {
          console.error('Error parsing saved ingredients:', error);
        }
      }

      if (savedPotions) {
        try {
          const parsedPotions = JSON.parse(savedPotions);
          setModifiedPotions(parsedPotions);
        } catch (error) {
          console.error('Error parsing saved potions:', error);
        }
      }

      if (savedCreatures) {
        try {
          const parsedCreatures = JSON.parse(savedCreatures);
          setModifiedCreatures(parsedCreatures);
        } catch (error) {
          console.error('Error parsing saved creatures:', error);
        }
      }

      if (savedMagicItems) {
        try {
          const parsedMagicItems = JSON.parse(savedMagicItems);
          setModifiedMagicItems(parsedMagicItems);
        } catch (error) {
          console.error('Error parsing saved magic items:', error);
        }
      }

      const savedNPCs = localStorage.getItem('modifiedNPCs');
      if (savedNPCs) {
        try {
          const parsedNPCs = JSON.parse(savedNPCs);
          setModifiedNPCs(parsedNPCs);
        } catch (error) {
          console.error('Error parsing saved NPCs:', error);
        }
      }

      const savedCompanionTypes = localStorage.getItem('modifiedCompanionTypes');
      if (savedCompanionTypes) {
        try {
          const parsedCompanionTypes = JSON.parse(savedCompanionTypes);
          setModifiedCompanionTypes(parsedCompanionTypes);
        } catch (error) {
          console.error('Error parsing saved companion types:', error);
        }
      }

      const savedCompanions = localStorage.getItem('modifiedCompanions');
      if (savedCompanions) {
        try {
          const parsedCompanions = JSON.parse(savedCompanions);
          setModifiedCompanions(parsedCompanions);
        } catch (error) {
          console.error('Error parsing saved companions:', error);
        }
      }

      const savedLocations = localStorage.getItem('obojima-locations');
      if (savedLocations) {
        try {
          const parsedLocations = JSON.parse(savedLocations);
          setModifiedLocations(parsedLocations);
        } catch (error) {
          console.error('Error parsing saved locations:', error);
        }
      }

      setIsLoaded(true);
    }
  };

  // Load data on mount with sync
  useEffect(() => {
    loadAllUserData();
    
    // Note: Auto-sync disabled to prevent conflicts with other components
    // Users can manually refresh using the refresh button
  }, []);

  // Sync-enabled save functions
  const saveUserPotions = async (potions: any[]) => {
    try {
      // Ensure all potions have proper IDs based on category AND number
      const potionsWithIds = potions.map(potion => ({
        ...potion,
        id: potion.id || `potion-${potion.category}-${potion.number}`
      }));
      
      await syncService.saveWithFallback('user-potions', 'modifiedPotions', potionsWithIds);
      setModifiedPotions(potionsWithIds);
    } catch (error) {
      console.error('Error saving user potions:', error);
    }
  };

  const saveUserIngredients = async (ingredients: any[]) => {
    try {
      // Ensure all ingredients have proper IDs
      const ingredientsWithIds = ingredients.map(ingredient => ({
        ...ingredient,
        id: ingredient.id || `ingredient-${ingredient.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`
      }));
      
      await syncService.saveWithFallback('user-ingredients', 'modifiedIngredients', ingredientsWithIds);
      setModifiedIngredients(ingredientsWithIds);
    } catch (error) {
      console.error('Error saving user ingredients:', error);
    }
  };

  const saveUserCreatures = async (creatures: any[]) => {
    try {
      await syncService.saveWithFallback('user-creatures', 'modifiedCreatures', creatures);
      setModifiedCreatures(creatures);
    } catch (error) {
      console.error('Error saving user creatures:', error);
    }
  };

  const saveUserMagicItems = async (items: any[]) => {
    try {
      await syncService.saveWithFallback('user-magic-items', 'modifiedMagicItems', items);
      setModifiedMagicItems(items);
    } catch (error) {
      console.error('Error saving user magic items:', error);
    }
  };

  const saveUserCompanionTypes = async (types: any[]) => {
    try {
      await syncService.saveWithFallback('user-companion-types', 'modifiedCompanionTypes', types);
      setModifiedCompanionTypes(types);
    } catch (error) {
      console.error('Error saving user companion types:', error);
    }
  };

  const saveNPCs = async (npcs: any[]) => {
    try {
      await syncService.saveWithFallback('npcs', 'modifiedNPCs', npcs);
      setModifiedNPCs(npcs);
    } catch (error) {
      console.error('Error saving NPCs:', error);
    }
  };

  const saveCompanions = async (companions: any[]) => {
    try {
      await syncService.saveWithFallback('companions', 'modifiedCompanions', companions);
      setModifiedCompanions(companions);
    } catch (error) {
      console.error('Error saving companions:', error);
    }
  };

  const saveLocations = async (locations: any[]) => {
    try {
      await syncService.saveWithFallback('locations', 'obojima-locations', locations);
      setModifiedLocations(locations);
    } catch (error) {
      console.error('Error saving locations:', error);
    }
  };

  // Save to localStorage whenever modified data changes (keeping for backup)
  // Wrapped in try/catch to handle quota exceeded errors gracefully
  useEffect(() => {
    if (typeof window !== 'undefined' && isLoaded) {
      try { localStorage.setItem('modifiedIngredients', JSON.stringify(modifiedIngredients)); }
      catch (e) { console.warn('[DatabaseView] localStorage quota exceeded for modifiedIngredients'); }
    }
  }, [modifiedIngredients, isLoaded]);

  useEffect(() => {
    if (typeof window !== 'undefined' && isLoaded) {
      try { localStorage.setItem('modifiedPotions', JSON.stringify(modifiedPotions)); }
      catch (e) { console.warn('[DatabaseView] localStorage quota exceeded for modifiedPotions'); }
    }
  }, [modifiedPotions, isLoaded]);

  useEffect(() => {
    if (typeof window !== 'undefined' && isLoaded) {
      try { localStorage.setItem('modifiedCreatures', JSON.stringify(modifiedCreatures)); }
      catch (e) { console.warn('[DatabaseView] localStorage quota exceeded for modifiedCreatures'); }
    }
  }, [modifiedCreatures, isLoaded]);

  useEffect(() => {
    if (typeof window !== 'undefined' && isLoaded) {
      try { localStorage.setItem('modifiedMagicItems', JSON.stringify(modifiedMagicItems)); }
      catch (e) { console.warn('[DatabaseView] localStorage quota exceeded for modifiedMagicItems'); }
    }
  }, [modifiedMagicItems, isLoaded]);

  useEffect(() => {
    if (typeof window !== 'undefined' && isLoaded) {
      try { localStorage.setItem('modifiedNPCs', JSON.stringify(modifiedNPCs)); }
      catch (e) { console.warn('[DatabaseView] localStorage quota exceeded for modifiedNPCs'); }
    }
  }, [modifiedNPCs, isLoaded]);

  useEffect(() => {
    if (typeof window !== 'undefined' && isLoaded) {
      try { localStorage.setItem('modifiedCompanionTypes', JSON.stringify(modifiedCompanionTypes)); }
      catch (e) { console.warn('[DatabaseView] localStorage quota exceeded for modifiedCompanionTypes'); }
    }
  }, [modifiedCompanionTypes, isLoaded]);

  useEffect(() => {
    if (typeof window !== 'undefined' && isLoaded) {
      try { localStorage.setItem('modifiedCompanions', JSON.stringify(modifiedCompanions)); }
      catch (e) { console.warn('[DatabaseView] localStorage quota exceeded for modifiedCompanions'); }
    }
  }, [modifiedCompanions, isLoaded]);

  useEffect(() => {
    if (typeof window !== 'undefined' && isLoaded) {
      try { localStorage.setItem('obojima-locations', JSON.stringify(modifiedLocations)); }
      catch (e) { console.warn('[DatabaseView] localStorage quota exceeded for obojima-locations'); }
    }
  }, [modifiedLocations, isLoaded]);

  // Combine all potion arrays and apply modifications
  // Apply modifications to potions and add new ones
  const originalPotions = [...combatPotions, ...utilityPotions, ...whimsyPotions].map(p => ({
    ...p,
    id: `potion-${p.category}-${p.number}`, // Include category to make IDs unique
    imageUrl: `/images/potions/${p.name}.webp` // Use local image path based on name
  }));
  
  // Create a map to track which potions we've already processed
  const processedIds = new Set<string>();
  
  const potions = [
    ...originalPotions.map(potion => {
      // Find modifications by BOTH category and number to ensure uniqueness
      const modified = modifiedPotions.find(p => 
        p.number === potion.number && p.category === potion.category
      );
      if (modified) {
        const uniqueId = `${potion.category}-${potion.number}`;
        processedIds.add(uniqueId);
        // Ensure the modified potion has an ID
        return { ...modified, id: modified.id || potion.id };
      }
      return potion;
    }),
    // Add completely new potions that don't exist in original data
    ...modifiedPotions.filter(modified => {
      const uniqueId = `${modified.category}-${modified.number}`;
      // Only add if we haven't already processed this potion
      if (processedIds.has(uniqueId)) {
        return false;
      }
      return !originalPotions.find(original => 
        original.number === modified.number && original.category === modified.category
      );
    })
  ];
  
  // Debug: Check for duplicates
  const potionNumbers = potions.map(p => p.number);
  const duplicateNumbers = potionNumbers.filter((num, index) => potionNumbers.indexOf(num) !== index);
  if (duplicateNumbers.length > 0) {
    console.warn('Duplicate potion numbers found:', duplicateNumbers);
    console.log('All potions:', potions);
    console.log('Modified potions:', modifiedPotions);
  }

  // Function to find ingredient image path
  const getIngredientImagePath = (ingredientName: string) => {
    // Special cases for known filename mismatches
    const specialCases: { [key: string]: string } = {
      'Apper Carrot': 'apper-carrot.webp',
      // Add more special cases here if needed
    };
    
    if (specialCases[ingredientName]) {
      return `/images/ingredients/${specialCases[ingredientName]}`;
    }
    
    // Default: try original name format (works for most ingredients)
    return `/images/ingredients/${ingredientName}.webp`;
  };

  // Apply modifications to ingredients and add new ones
  const originalIngredients = ingredients.map(ingredient => ({
    ...ingredient,
    id: `ingredient-${ingredient.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`, // Create unique ID based on name
    imageUrl: getIngredientImagePath(ingredient.name) // Use improved image path matching
  }));

  // Create a map to track which ingredients we've already processed
  const processedIngredientIds = new Set<string>();

  const currentIngredients = [
    ...originalIngredients.map(ingredient => {
      // Find modifications by ID (generated from original name)
      const modified = modifiedIngredients.find(i => i.id === ingredient.id);
      if (modified) {
        processedIngredientIds.add(ingredient.id);
        // Ensure the modified ingredient has an ID
        return { ...modified, id: modified.id || ingredient.id };
      }
      return ingredient;
    }),
    // Add completely new ingredients that don't exist in original data
    ...modifiedIngredients.filter(modified => {
      // Only add if we haven't already processed this ingredient
      if (processedIngredientIds.has(modified.id)) {
        return false;
      }
      return !originalIngredients.find(original => original.id === modified.id);
    })
  ];

  // Combine original creatures with imported creatures
  const importedCreatures = getImportedCreatures();
  const allBaseCreatures = [
    ...creatures,
    ...importedCreatures.filter(imported => !creatures.find(original => original.name === imported.name))
  ];

  // Apply modifications to creatures and add new ones
  // Base creatures get stable IDs based on their names
  const baseCreaturesWithIds = allBaseCreatures.map(creature => ({
    ...creature,
    id: creature.id || `creature-base-${creature.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`
  }));

  // Create a set to track which creatures we've already processed
  const processedCreatureIds = new Set<string>();

  // Merge base creatures with modifications (similar to ingredients)
  const currentCreatures = [
    ...baseCreaturesWithIds.map(creature => {
      // Find modification by ID
      const modified = modifiedCreatures.find(c => c.id === creature.id);
      if (modified) {
        processedCreatureIds.add(creature.id);
        return { ...modified, id: modified.id || creature.id };
      }
      return creature;
    }),
    // Add only NEW user-created creatures that don't exist in base data
    ...modifiedCreatures.filter(modified => {
      // Skip if we've already processed this creature
      if (processedCreatureIds.has(modified.id)) {
        return false;
      }
      // Only add if it's not a base creature
      return !baseCreaturesWithIds.find(base => base.id === modified.id);
    })
  ];

  // Apply modifications to magic items and add new ones
  const originalMagicItems = magicItems.map(magicItem => ({
    ...magicItem,
    id: `magic-item-${magicItem.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}` // Generate ID from name
  }));
  
  // Create a map to track which magic items we've already processed
  const processedMagicItemIds = new Set<string>();
  
  const currentMagicItems = [
    ...originalMagicItems.map(magicItem => {
      const modified = modifiedMagicItems.find(m => m.id === magicItem.id);
      if (modified) {
        processedMagicItemIds.add(magicItem.id);
        // Ensure the modified magic item has an ID
        return { ...modified, id: modified.id || magicItem.id };
      }
      return magicItem;
    }),
    // Add completely new magic items that don't exist in original data
    ...modifiedMagicItems.filter(modified => {
      // Only add if we haven't already processed this magic item
      if (processedMagicItemIds.has(modified.id)) {
        return false;
      }
      return !magicItems.find(original => original.name === modified.name);
    })
  ];

  // Apply modifications to companion types and add new ones
  const currentCompanionTypes = [
    ...companionTypes.map(companionType => {
      const modified = modifiedCompanionTypes.find(ct => ct.id === companionType.id);
      return modified || companionType;
    }),
    // Add completely new companion types that don't exist in original data
    ...modifiedCompanionTypes.filter(modified => !companionTypes.find(original => original.id === modified.id))
  ];

  const handleEdit = (item: any, type: string) => {
    setEditingItem(item);
    setEditingType(type);
  };

  const handleDelete = async (item: any, type: string) => {
    if (!confirm(`Are you sure you want to delete "${item.name}"?`)) {
      return;
    }

    if (type === 'ingredient') {
      // Only allow deleting custom ingredients (not in original data)
      const isCustomItem = !ingredients.find(original => `ingredient-${original.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}` === item.id);
      if (isCustomItem) {
        // Update local state
        const updatedIngredients = modifiedIngredients.filter(i => i.id !== item.id);
        setModifiedIngredients(updatedIngredients);

        // Sync deletion to server
        try {
          await saveUserIngredients(updatedIngredients);
        } catch (error) {
          console.error('Error syncing ingredient deletion:', error);
        }
      }
    } else if (type === 'potion') {
      // Only allow deleting custom potions (not in original data)
      const originalPotions = [...combatPotions, ...utilityPotions, ...whimsyPotions];
      const isCustomItem = !originalPotions.find(original => original.number === item.number);
      if (isCustomItem) {
        // Update local state
        const updatedPotions = modifiedPotions.filter(p => p.number !== item.number);
        setModifiedPotions(updatedPotions);

        // Sync deletion to server
        try {
          await saveUserPotions(updatedPotions);
        } catch (error) {
          console.error('Error syncing potion deletion:', error);
        }
      }
    } else if (type === 'creature') {
      // Only allow deleting custom creatures (not in original data or imported data)
      const importedCreatures = getImportedCreatures();
      const allBaseCreatures = [...creatures, ...importedCreatures];
      const isCustomItem = !allBaseCreatures.find(original => original.name === item.name);
      if (isCustomItem && item.id) {
        // Update local state - filter by ID only to avoid removing same-named creatures
        const updatedCreatures = modifiedCreatures.filter(c => c.id !== item.id);
        setModifiedCreatures(updatedCreatures);

        // Sync deletion to server
        try {
          await saveUserCreatures(updatedCreatures);
        } catch (error) {
          console.error('Error syncing creature deletion:', error);
        }
      }
    } else if (type === 'magicItem') {
      // Only allow deleting custom magic items (not in original data)
      const isCustomItem = !magicItems.find(original => original.name === item.name);
      if (isCustomItem && item.id) {
        // Update local state - filter by ID only to avoid removing same-named items
        const updatedMagicItems = modifiedMagicItems.filter(m => m.id !== item.id);
        setModifiedMagicItems(updatedMagicItems);

        // Sync deletion to server
        try {
          await saveUserMagicItems(updatedMagicItems);
        } catch (error) {
          console.error('Error syncing magic item deletion:', error);
        }
      }
    } else if (type === 'npc') {
      // All NPCs are custom (user-created)
      setModifiedNPCs(prev => prev.filter(n => n.id !== item.id));
      
      // Sync deletion to server
      try {
        await syncService.deleteNpc(item.id);
      } catch (error) {
        console.error('Error syncing NPC deletion:', error);
      }
    } else if (type === 'companionType') {
      // Only allow deleting custom companion types (not in original data)
      const isCustomItem = !companionTypes.find(original => original.id === item.id);
      if (isCustomItem) {
        // Update local state
        const updatedCompanionTypes = modifiedCompanionTypes.filter(ct => ct.id !== item.id);
        setModifiedCompanionTypes(updatedCompanionTypes);

        // Sync deletion to server
        try {
          await saveUserCompanionTypes(updatedCompanionTypes);
        } catch (error) {
          console.error('Error syncing companion type deletion:', error);
        }
      }
    } else if (type === 'companion') {
      // All companions are custom (user-created)

      // Sync deletion to server first
      try {
        const result = await syncService.deleteCompanion(item.id);
        if (result.success) {
          setModifiedCompanions(prev => prev.filter(c => c.id !== item.id));
        } else {
          console.error('Failed to delete companion from server:', result.error);
          alert('Failed to delete companion. Please try again.');
        }
      } catch (error) {
        console.error('Error syncing companion deletion:', error);
        alert('Failed to delete companion. Please try again.');
      }
    } else if (type === 'location') {
      // All locations are custom (user-created)
      setModifiedLocations(prev => prev.filter(l => l.id !== item.id));

      // Sync deletion to server
      try {
        await syncService.deleteLocation(item.id);
      } catch (error) {
        console.error('Error syncing location deletion:', error);
      }
    }
  };

  // Helper function to check if an item is custom (created by user)
  const isCustomItem = (item: any, type: string): boolean => {
    if (type === 'ingredient') {
      return !ingredients.find(original => `ingredient-${original.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}` === item.id);
    } else if (type === 'potion') {
      const originalPotions = [...combatPotions, ...utilityPotions, ...whimsyPotions];
      return !originalPotions.find(original => original.number === item.number);
    } else if (type === 'creature') {
      const importedCreatures = getImportedCreatures();
      const allBaseCreatures = [...creatures, ...importedCreatures];
      return !allBaseCreatures.find(original => original.name === item.name);
    } else if (type === 'magicItem') {
      return !magicItems.find(original => original.name === item.name);
    } else if (type === 'npc') {
      return true; // All NPCs are custom (user-created)
    } else if (type === 'companionType') {
      return !companionTypes.find(original => original.id === item.id);
    } else if (type === 'companion') {
      return true; // All companions are custom (user-created)
    } else if (type === 'location') {
      return true; // All locations are custom (user-created)
    }
    return false;
  };

  const handleSave = async (updatedItem: any) => {
    // Update the appropriate state based on type
    if (editingType === 'ingredient') {
      setModifiedIngredients(prev => {
        // Check if this is a new item (original editing item had empty name)
        const isNewItem = editingItem?.name === '';
        
        if (isNewItem) {
          // Generate unique ID for new ingredient
          updatedItem.id = `ingredient-${updatedItem.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now()}`;
          
          if (updatedItem.name && updatedItem.name.trim()) {
            return [...prev, updatedItem];
          }
          return prev;
        } else {
          // For existing items, replace the existing one using the original ID
          updatedItem.id = editingItem.id; // Preserve the original ID
          const filtered = prev.filter(item => item.id !== editingItem.id);
          return [...filtered, updatedItem];
        }
      });
      
      // Sync to server
      try {
        const updatedIngredients = modifiedIngredients.filter(i => i.id === updatedItem.id).length > 0 
          ? modifiedIngredients.map(i => i.id === updatedItem.id ? updatedItem : i)
          : [...modifiedIngredients, updatedItem];
        await saveUserIngredients(updatedIngredients);
      } catch (error) {
        console.error('Error syncing ingredient:', error);
      }
    } else if (editingType === 'potion') {
      const updatedPotions = (() => {
        // Check if this is a new item (original editing item had empty name)
        const isNewItem = editingItem?.name === '';

        if (isNewItem) {
          // Assign new unique number for new potions
          const maxNumber = Math.max(
            ...potions.map(p => p.number || 0),
            ...modifiedPotions.map(p => p.number || 0),
            0
          );
          updatedItem.number = maxNumber + 1;

          // Ensure the new potion has a proper ID based on category AND number
          updatedItem.id = `potion-${updatedItem.category}-${updatedItem.number}`;

          if (updatedItem.name && updatedItem.name.trim()) {
            return [...modifiedPotions, updatedItem];
          }
          return modifiedPotions;
        } else {
          // For existing items, replace the existing one using BOTH category AND number for uniqueness
          const filtered = modifiedPotions.filter(item =>
            !(item.number === editingItem.number && item.category === editingItem.category)
          );

          // Ensure the updated potion has a proper ID
          updatedItem.id = updatedItem.id || `potion-${updatedItem.category}-${updatedItem.number}`;

          return [...filtered, updatedItem];
        }
      })();

      console.log('Saving updated potions:', updatedPotions);
      setModifiedPotions(updatedPotions);

      // Sync to server
      try {
        await saveUserPotions(updatedPotions);
        console.log('Potions saved successfully');
        console.log('LocalStorage after save:', localStorage.getItem('modifiedPotions'));
      } catch (error) {
        console.error('Error syncing potion:', error);
      }
    } else if (editingType === 'creature') {
      const updatedCreatures = (() => {
        // Check if this is a new item (original editing item had empty name)
        const isNewItem = editingItem?.name === '';

        if (isNewItem) {
          // Generate unique ID for new creature
          updatedItem.id = `creature-${updatedItem.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now()}`;

          // For new items, just add to the list if name is provided
          if (updatedItem.name && updatedItem.name.trim()) {
            return [...modifiedCreatures, updatedItem];
          }
          return modifiedCreatures;
        } else {
          // For existing items, preserve the original ID and replace using ID only
          updatedItem.id = editingItem.id || `creature-${editingItem.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now()}`;
          const filtered = modifiedCreatures.filter(item => item.id !== editingItem.id);
          return [...filtered, updatedItem];
        }
      })();

      setModifiedCreatures(updatedCreatures);

      // Sync to server
      try {
        await saveUserCreatures(updatedCreatures);
      } catch (error) {
        console.error('Error syncing creature:', error);
      }
    } else if (editingType === 'magicItem') {
      const updatedItems = (() => {
        // Check if this is a new item (original editing item had empty name)
        const isNewItem = editingItem?.name === '';
        
        if (isNewItem) {
          // For new items, generate unique ID and add to the list if name is provided
          if (updatedItem.name && updatedItem.name.trim()) {
            updatedItem.id = `magic-item-${updatedItem.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now()}`;
            return [...modifiedMagicItems, updatedItem];
          }
          return modifiedMagicItems;
        } else {
          // For existing items, replace the existing one using the original ID
          updatedItem.id = editingItem.id; // Preserve the original ID
          const filtered = modifiedMagicItems.filter(item => item.id !== editingItem.id);
          return [...filtered, updatedItem];
        }
      })();
      
      setModifiedMagicItems(updatedItems);
      
      // Sync to server
      try {
        await saveUserMagicItems(updatedItems);
      } catch (error) {
        console.error('Error syncing magic item:', error);
      }
    } else if (editingType === 'npc') {
      setModifiedNPCs(prev => {
        // Check if this is a new item (original editing item had empty id)
        const isNewItem = !editingItem?.id;
        
        if (isNewItem) {
          // Generate unique ID for new NPC
          updatedItem.id = `npc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          updatedItem.created_at = new Date();
          updatedItem.updated_at = new Date();
          
          if (updatedItem.name && updatedItem.name.trim()) {
            return [...prev, updatedItem];
          }
          return prev;
        } else {
          // For existing items, replace the existing one
          updatedItem.updated_at = new Date();
          const filtered = prev.filter(item => item.id !== updatedItem.id);
          return [...filtered, updatedItem];
        }
      });
      
      // Sync to server
      try {
        await syncService.saveNpc(updatedItem);
      } catch (error) {
        console.error('Error syncing NPC:', error);
      }
    } else if (editingType === 'companionType') {
      const updatedCompanionTypes = (() => {
        // Check if this is a new item (original editing item had empty id)
        const isNewItem = !editingItem?.id;

        if (isNewItem) {
          // Generate unique ID for new companion type
          updatedItem.id = `companion_type_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          updatedItem.created_at = new Date();
          updatedItem.updated_at = new Date();

          if (updatedItem.name && updatedItem.name.trim()) {
            return [...modifiedCompanionTypes, updatedItem];
          }
          return modifiedCompanionTypes;
        } else {
          // For existing items, replace the existing one
          updatedItem.updated_at = new Date();
          const filtered = modifiedCompanionTypes.filter(item => item.id !== updatedItem.id);
          return [...filtered, updatedItem];
        }
      })();

      setModifiedCompanionTypes(updatedCompanionTypes);

      // Sync to server
      try {
        await saveUserCompanionTypes(updatedCompanionTypes);
      } catch (error) {
        console.error('Error syncing companion type:', error);
      }
    } else if (editingType === 'companion') {
      setModifiedCompanions(prev => {
        // Check if this is a new item (original editing item had empty id)
        const isNewItem = !editingItem?.id;
        
        if (isNewItem) {
          // Generate unique ID for new companion
          updatedItem.id = `companion_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          updatedItem.created_at = new Date();
          updatedItem.updated_at = new Date();
          
          if (updatedItem.name && updatedItem.name.trim()) {
            return [...prev, updatedItem];
          }
          return prev;
        } else {
          // For existing items, replace the existing one
          updatedItem.updated_at = new Date();
          const filtered = prev.filter(item => item.id !== updatedItem.id);
          return [...filtered, updatedItem];
        }
      });
      
      // Sync to server
      try {
        await syncService.saveCompanion(updatedItem);
      } catch (error) {
        console.error('Error syncing companion:', error);
      }
    } else if (editingType === 'location') {
      setModifiedLocations(prev => {
        // Check if this is a new item (original editing item had empty id)
        const isNewItem = !editingItem?.id;

        if (isNewItem) {
          // Generate unique ID for new location
          updatedItem.id = `location_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          updatedItem.created_at = new Date();
          updatedItem.updated_at = new Date();

          if (updatedItem.name && updatedItem.name.trim()) {
            return [...prev, updatedItem];
          }
          return prev;
        } else {
          // For existing items, replace the existing one
          updatedItem.updated_at = new Date();
          const filtered = prev.filter(item => item.id !== updatedItem.id);
          return [...filtered, updatedItem];
        }
      });

      // Sync to server
      try {
        await syncService.saveLocation(updatedItem);
      } catch (error) {
        console.error('Error syncing location:', error);
      }
    }

    setEditingItem(null);
    setEditingType('');
  };

  const handleCancel = () => {
    setEditingItem(null);
    setEditingType('');
  };

  const handleAdd = (type: string) => {
    // Create empty template for new item based on type
    let newItem = {};
    
    switch (type) {
      case 'potion':
        newItem = {
          number: Math.max(...potions.map(p => p.number), 0) + 1,
          name: '',
          rarity: 'Common',
          category: 'Combat',
          price: 50,
          imageUrl: ''
        };
        break;
      case 'ingredient':
        newItem = {
          name: '',
          combat: 0,
          utility: 0,
          whimsy: 0,
          rarity: 'Common',
          imageUrl: '',
          locations: [],
          price: 50
        };
        break;
      case 'creature':
        newItem = {
          name: '',
          size: 'Medium',
          type: 'Beast',
          alignment: 'Neutral',
          armor_class: 12,
          hit_points: '22 (3d8 + 9)',
          speed: { walk: '30 ft.' },
          ability_scores: {
            STR: 12,
            DEX: 12,
            CON: 12,
            INT: 12,
            WIS: 12,
            CHA: 12
          },
          senses: {},
          languages: [],
          challenge_rating: 1,
          proficiency_bonus: 2,
          traits: [],
          actions: []
        };
        break;
      case 'magicItem':
        newItem = {
          name: '',
          type: 'Wondrous Item',
          rarity: 'Common',
          requiresAttunement: false,
          effect: '',
          price: 500
        };
        break;
      case 'npc':
        newItem = {
          id: '',
          name: '',
          portrait: '',
          details: '',
          location: '',
          occupation: '',
          tags: []
        };
        break;
      case 'companionType':
        newItem = {
          id: '',
          name: '',
          spirit_form: 'Tiny Spirit',
          image: '',
          size: 'Tiny',
          type: 'Spirit',
          alignment: 'Any Alignment',
          armor_class: 12,
          hit_points: '21 (6d4 + 6)',
          speed: { walk: '30 ft.' },
          ability_scores: {
            STR: 10,
            DEX: 12,
            CON: 12,
            INT: 10,
            WIS: 10,
            CHA: 10
          },
          skills: [],
          senses: ['Passive Perception 10'],
          damage_immunities: [],
          condition_immunities: [],
          languages: ['Common', 'Torum'],
          challenge_rating: '1/2 (100 XP)',
          proficiency_bonus: 2,
          traits: [],
          actions: []
        };
        break;
      case 'companion':
        newItem = {
          id: '',
          name: '',
          goal: '',
          desire: '',
          disposition: '',
          quirk: '',
          companion_type_id: '',
          image: ''
        };
        break;
      case 'location':
        newItem = {
          id: '',
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
          dmNotes: ''
        };
        break;
    }
    
    setEditingItem(newItem);
    setEditingType(type);
  };

  // Function to clear all saved changes (useful for debugging)
  const clearSavedChanges = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('modifiedIngredients');
      localStorage.removeItem('modifiedPotions');
      localStorage.removeItem('modifiedCreatures');
      localStorage.removeItem('modifiedMagicItems');
      localStorage.removeItem('modifiedNPCs');
      localStorage.removeItem('modifiedCompanionTypes');
      localStorage.removeItem('modifiedCompanions');
      localStorage.removeItem('obojima-locations');
      setModifiedIngredients([]);
      setModifiedPotions([]);
      setModifiedCreatures([]);
      setModifiedMagicItems([]);
      setModifiedNPCs([]);
      setModifiedCompanionTypes([]);
      setModifiedCompanions([]);
      setModifiedLocations([]);
    }
  };

  const tabGroups = [
    {
      id: 'items',
      name: 'Items',
      icon: BeakerIcon,
      tabs: [
        { id: 'potions' as TabType, name: t('database.tabs.potions'), icon: BeakerIcon, count: potions.length },
        { id: 'ingredients' as TabType, name: t('database.tabs.ingredients'), icon: SparklesIcon, count: currentIngredients.length },
        { id: 'magicItems' as TabType, name: t('database.tabs.magicItems'), icon: GiftIcon, count: currentMagicItems.length }
      ]
    },
    {
      id: 'entities',
      name: 'Entities',
      icon: UserGroupIcon,
      tabs: [
        { id: 'creatures' as TabType, name: t('database.tabs.creatures'), icon: FireIcon, count: currentCreatures.length },
        { id: 'npcs' as TabType, name: t('database.tabs.npcs'), icon: UserGroupIcon, count: modifiedNPCs.length }
      ]
    },
    {
      id: 'companions',
      name: 'Companions',
      icon: FireIcon,
      tabs: [
        { id: 'companionTypes' as TabType, name: t('database.tabs.companionTypes'), icon: FireIcon, count: currentCompanionTypes.length },
        { id: 'companions' as TabType, name: t('database.tabs.companions'), icon: SparklesIcon, count: modifiedCompanions.length }
      ]
    },
    {
      id: 'world',
      name: 'World',
      icon: MapPinIcon,
      tabs: [
        { id: 'locations' as TabType, name: 'Locations', icon: MapPinIcon, count: modifiedLocations.length }
      ]
    }
  ];

  const [selectedGroup, setSelectedGroup] = useState('items');

  // Update selected group when active tab changes
  useEffect(() => {
    const newActiveGroup = tabGroups.find(group => 
      group.tabs.some(tab => tab.id === activeTab)
    );
    if (newActiveGroup && newActiveGroup.id !== selectedGroup) {
      setSelectedGroup(newActiveGroup.id);
    }
  }, [activeTab, tabGroups, selectedGroup]);

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex-1"></div>
          <div className="flex items-center gap-3">
            <BeakerIcon className="h-8 w-8 text-emerald-400" />
            <h1 className="text-3xl font-bold text-white">{t('database.title')}</h1>
            {/* Sync status indicator */}
            {syncStatus === 'syncing' && (
              <ArrowPathIcon className="h-5 w-5 text-blue-400 animate-spin" />
            )}
            {syncStatus === 'error' && (
              <span className="text-xs text-amber-400">Offline</span>
            )}
          </div>
          <div className="flex-1 flex justify-end">
            <button
              onClick={loadAllUserData}
              className="p-2 text-slate-400 hover:text-white transition-colors"
              title="Refresh Data"
            >
              <ArrowPathIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
        <p className="text-slate-400">Browse, filter, and edit your game data</p>
      </div>

      {/* Navigation */}
      <div className="space-y-4">
        {/* Main Group Tabs */}
        <div className="flex justify-center overflow-x-auto">
          <div className="flex bg-slate-800/50 backdrop-blur-sm rounded-xl p-1 border border-white/10">
            {tabGroups.map((group) => {
              const GroupIcon = group.icon;
              const totalCount = group.tabs.reduce((sum, tab) => sum + tab.count, 0);
              const isActive = selectedGroup === group.id;
              
              return (
                <button
                  key={group.id}
                  onClick={() => {
                    setSelectedGroup(group.id);
                    // Set active tab to first tab in the group if switching groups
                    if (!isActive) {
                      setActiveTab(group.tabs[0].id);
                    }
                  }}
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 whitespace-nowrap ${
                    isActive
                      ? 'bg-gradient-to-r from-emerald-500 to-blue-500 text-white shadow-lg'
                      : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                  }`}
                >
                  <GroupIcon className="h-5 w-5" />
                  {group.name}
                  <span className="bg-slate-700 text-slate-300 px-2 py-1 rounded-full text-xs">
                    {totalCount}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Sub Tabs */}
        <div className="flex justify-center overflow-x-auto">
          <div className="flex bg-slate-700/30 backdrop-blur-sm rounded-lg p-1 border border-white/5">
            {tabGroups.find(group => group.id === selectedGroup)?.tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-all duration-200 whitespace-nowrap text-sm ${
                    activeTab === tab.id
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'text-slate-300 hover:text-white hover:bg-slate-600/50'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.name}
                  <span className="bg-slate-600 text-slate-200 px-2 py-0.5 rounded-full text-xs">
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
        {activeTab === 'potions' && <PotionsTab potions={potions} onEdit={handleEdit} onAdd={() => handleAdd('potion')} onDelete={handleDelete} isCustomItem={isCustomItem} />}
        {activeTab === 'ingredients' && <IngredientsTab ingredients={currentIngredients} onEdit={handleEdit} onAdd={() => handleAdd('ingredient')} onDelete={handleDelete} isCustomItem={isCustomItem} />}
        {activeTab === 'creatures' && <CreaturesTab creatures={currentCreatures} onEdit={handleEdit} onAdd={() => handleAdd('creature')} onDelete={handleDelete} isCustomItem={isCustomItem} />}
        {activeTab === 'magicItems' && <MagicItemsTab magicItems={currentMagicItems} onEdit={handleEdit} onAdd={() => handleAdd('magicItem')} onDelete={handleDelete} isCustomItem={isCustomItem} />}
        {activeTab === 'npcs' && <NPCsTab npcs={modifiedNPCs} onEdit={handleEdit} onAdd={() => handleAdd('npc')} onDelete={handleDelete} isCustomItem={isCustomItem} />}
        {activeTab === 'companionTypes' && <CompanionTypesTab companionTypes={currentCompanionTypes} onEdit={handleEdit} onAdd={() => handleAdd('companionType')} onDelete={handleDelete} isCustomItem={isCustomItem} />}
        {activeTab === 'companions' && <CompanionsTab companions={modifiedCompanions} onEdit={handleEdit} onAdd={() => handleAdd('companion')} onDelete={handleDelete} isCustomItem={isCustomItem} />}
        {activeTab === 'locations' && <LocationsTab locations={modifiedLocations} npcs={modifiedNPCs} quests={[]} onEdit={handleEdit} onAdd={() => handleAdd('location')} onDelete={handleDelete} isCustomItem={isCustomItem} />}
      </div>

      {/* Edit Forms */}
      {editingItem && editingType === 'potion' && (
        <PotionEditForm
          potion={editingItem}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      )}
      {editingItem && editingType === 'ingredient' && (
        <IngredientEditForm
          ingredient={editingItem}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      )}
      {editingItem && editingType === 'creature' && (
        <CreatureEditForm
          creature={editingItem}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      )}
      {editingItem && editingType === 'magicItem' && (
        <MagicItemEditForm
          magicItem={editingItem}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      )}
      {editingItem && editingType === 'npc' && (
        <NPCEditForm
          npc={editingItem}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      )}
      {editingItem && editingType === 'companionType' && (
        <CompanionTypeEditForm
          companionType={editingItem}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      )}
      {editingItem && editingType === 'companion' && (
        <CompanionEditForm
          companion={editingItem}
          companionTypes={currentCompanionTypes}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      )}
      {editingItem && editingType === 'location' && (
        <LocationEditForm
          location={editingItem}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      )}
    </div>
  );
}

function PotionsTab({ potions, onEdit, onAdd, onDelete, isCustomItem }: { potions: any[]; onEdit: (item: any, type: string) => void; onAdd: () => void; onDelete: (item: any, type: string) => void; isCustomItem: (item: any, type: string) => boolean }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRarity, setFilterRarity] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterPrice, setFilterPrice] = useState('all');
  const { t } = useTranslation();
  const { translatePotionName } = useItemTranslation();

  const filteredPotions = potions.filter(potion => {
    const translatedName = translatePotionName(potion.name);
    const matchesSearch = searchTerm === '' || 
      potion.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      translatedName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRarity = filterRarity === 'all' || potion.rarity === filterRarity;
    const matchesCategory = filterCategory === 'all' || potion.category === filterCategory;
    const matchesPrice = filterPrice === 'all' || potion.price.toString() === filterPrice;
    return matchesSearch && matchesRarity && matchesCategory && matchesPrice;
  });

  const rarities = [...new Set(potions.map(p => p.rarity))].sort();
  const categories = [...new Set(potions.map(p => p.category))].sort();
  const prices = ['50', '200', '2000'];

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-64">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="text"
                placeholder={t('common.search')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-emerald-400"
              />
            </div>
          </div>
          
          <select
            value={filterRarity}
            onChange={(e) => setFilterRarity(e.target.value)}
            className="px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-emerald-400"
          >
            <option value="all">All Rarities</option>
            {rarities.map(rarity => (
              <option key={rarity} value={rarity}>{rarity}</option>
            ))}
          </select>

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-emerald-400"
          >
            <option value="all">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>

          <select
            value={filterPrice}
            onChange={(e) => setFilterPrice(e.target.value)}
            className="px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-emerald-400"
          >
            <option value="all">All Prices</option>
            {prices.map(price => (
              <option key={price} value={price}>{price}g</option>
            ))}
          </select>
        </div>

        {/* Add New Button */}
        <button
          onClick={onAdd}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
        >
          <PlusIcon className="h-4 w-4" />
          {t('potions.addPotion')}
        </button>
      </div>

      {/* Results Count */}
      <div className="text-slate-400 text-sm">
        {t('common.search')} {filteredPotions.length} / {potions.length} {t('potions.title').toLowerCase()}
      </div>

      {/* Potions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredPotions.map((potion, index) => (
          <div key={`${potion.category}-${potion.number}-${index}`} className="bg-slate-700/30 rounded-lg p-4 border border-slate-600/50 hover:border-emerald-400/50 transition-all duration-200">
            {/* Potion Image */}
            <div className="aspect-square mb-3 rounded-lg overflow-hidden bg-slate-800">
              <img 
                src={potion.imageUrl || '/images/potions/default-potion.svg'} 
                alt={potion.name}
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Potion Info */}
            <div className="space-y-2">
              <div className="flex items-start justify-between">
                <h3 className="font-semibold text-white text-sm">{translatePotionName(potion.name)}</h3>
                <span className="text-xs text-slate-400">#{potion.number}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className={`text-xs px-2 py-1 rounded-full ${
                  potion.rarity === 'Common' ? 'bg-gray-500/20 text-gray-300' :
                  potion.rarity === 'Uncommon' ? 'bg-green-500/20 text-green-300' :
                  'bg-purple-500/20 text-purple-300'
                }`}>
                  {potion.rarity}
                </span>
                <span className="text-yellow-400 font-bold text-sm">💰{potion.price || 0}g</span>
              </div>
              
              <div className="text-xs text-slate-400">{potion.category}</div>
              
              <div className="flex justify-end gap-1">
                <button 
                  onClick={() => onEdit(potion, 'potion')}
                  className="p-2 text-slate-400 hover:text-emerald-400 transition-colors"
                >
                  <PencilIcon className="h-4 w-4" />
                </button>
                {isCustomItem(potion, 'potion') && (
                  <button 
                    onClick={() => onDelete(potion, 'potion')}
                    className="p-2 text-slate-400 hover:text-red-400 transition-colors"
                    title="Delete custom potion"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
        
      {filteredPotions.length === 0 && (
        <div className="text-center py-12">
          <BeakerIcon className="h-16 w-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-400 mb-2">No Potions Found</h3>
          <p className="text-slate-500">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  );
}

function IngredientsTab({ ingredients, onEdit, onAdd, onDelete, isCustomItem }: { ingredients: any[], onEdit: (item: any, type: string) => void, onAdd: () => void, onDelete: (item: any, type: string) => void, isCustomItem: (item: any, type: string) => boolean }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRarity, setFilterRarity] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [filterLocation, setFilterLocation] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const { translateIngredientName } = useItemTranslation();

  const filteredIngredients = ingredients.filter(ingredient => {
    const translatedName = translateIngredientName(ingredient.name);
    const matchesSearch = ingredient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      translatedName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRarity = filterRarity === 'all' || ingredient.rarity === filterRarity;
    const matchesType = filterType === 'all' || ingredient.type === filterType;
    const matchesLocation = filterLocation === 'all' || ingredient.locations.some((loc: string) => 
      loc.toLowerCase().includes(filterLocation.toLowerCase())
    );
    return matchesSearch && matchesRarity && matchesType && matchesLocation;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'name': return a.name.localeCompare(b.name);
      case 'price': return (b.price || 0) - (a.price || 0);
      case 'combat': return b.combat - a.combat;
      case 'utility': return b.utility - a.utility;
      case 'whimsy': return b.whimsy - a.whimsy;
      default: return 0;
    }
  });

  const rarities = [...new Set(ingredients.map(i => i.rarity))];
  const types = [...new Set(ingredients.map(i => i.type).filter(Boolean))].sort();
  const allLocations = [...new Set(ingredients.flatMap(i => i.locations))];

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-64">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search ingredients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-emerald-400"
              />
            </div>
          </div>
          
          <select
            value={filterRarity}
            onChange={(e) => setFilterRarity(e.target.value)}
            className="px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-emerald-400"
          >
            <option value="all">All Rarities</option>
            {rarities.map(rarity => (
              <option key={rarity} value={rarity}>{rarity}</option>
            ))}
          </select>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-emerald-400"
          >
            <option value="all">All Types</option>
            {types.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>

          <select
            value={filterLocation}
            onChange={(e) => setFilterLocation(e.target.value)}
            className="px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-emerald-400"
          >
            <option value="all">All Locations</option>
            {allLocations.map(location => (
              <option key={location} value={location}>{location}</option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-emerald-400"
          >
            <option value="name">Sort by Name</option>
            <option value="price">Sort by Price</option>
            <option value="combat">Sort by Combat</option>
            <option value="utility">Sort by Utility</option>
            <option value="whimsy">Sort by Whimsy</option>
          </select>
        </div>

        {/* Add New Button */}
        <button
          onClick={onAdd}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
        >
          <PlusIcon className="h-4 w-4" />
          Add New Ingredient
        </button>
      </div>

      {/* Results Count */}
      <div className="text-slate-400 text-sm">
        Showing {filteredIngredients.length} of {ingredients.length} ingredients
      </div>

      {/* Ingredients List */}
      <div className="space-y-4">
        {filteredIngredients.map((ingredient, index) => (
          <div key={ingredient.id || `${ingredient.name}-${index}`} className="bg-slate-700/30 rounded-lg p-4 border border-slate-600/50 hover:border-emerald-400/50 transition-all duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-800 flex-shrink-0">
                  <img 
                    src={ingredient.imageUrl || '/images/ingredients/default-ingredient.svg'} 
                    alt={ingredient.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <div className="space-y-1">
                  <h3 className="font-semibold text-white">{translateIngredientName(ingredient.name)}</h3>
                  <div className="flex items-center gap-4 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      ingredient.rarity === 'Common' ? 'bg-gray-500/20 text-gray-300' :
                      ingredient.rarity === 'Uncommon' ? 'bg-green-500/20 text-green-300' :
                      'bg-purple-500/20 text-purple-300'
                    }`}>
                      {ingredient.rarity}
                    </span>
                    {ingredient.type && (
                      <span className="px-2 py-1 bg-slate-600/50 text-slate-300 rounded-full text-xs">
                        {ingredient.type}
                      </span>
                    )}
                    <span className="text-yellow-400 font-bold">💰{ingredient.price || 0}g</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-6">
                {/* Scores */}
                <div className="flex items-center gap-4 text-sm">
                  <div className="text-center">
                    <div className="text-red-400 font-bold">{ingredient.combat}</div>
                    <div className="text-xs text-slate-400">Combat</div>
                  </div>
                  <div className="text-center">
                    <div className="text-blue-400 font-bold">{ingredient.utility}</div>
                    <div className="text-xs text-slate-400">Utility</div>
                  </div>
                  <div className="text-center">
                    <div className="text-purple-400 font-bold">{ingredient.whimsy}</div>
                    <div className="text-xs text-slate-400">Whimsy</div>
                  </div>
                </div>

                {/* Locations */}
                <div className="text-sm text-slate-400 max-w-48">
                  {ingredient.locations.slice(0, 2).join(', ')}
                  {ingredient.locations.length > 2 && ' +' + (ingredient.locations.length - 2)}
                </div>

                {/* Actions */}
                <div className="flex gap-1">
                  <button 
                    onClick={() => onEdit(ingredient, 'ingredient')}
                    className="p-2 text-slate-400 hover:text-emerald-400 transition-colors"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  {isCustomItem(ingredient, 'ingredient') && (
                    <button 
                      onClick={() => onDelete(ingredient, 'ingredient')}
                      className="p-2 text-slate-400 hover:text-red-400 transition-colors"
                      title="Delete custom ingredient"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
        
      </div>

      {filteredIngredients.length === 0 && (
        <div className="text-center py-12">
          <SparklesIcon className="h-16 w-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-400 mb-2">No Ingredients Found</h3>
          <p className="text-slate-500">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  );
}

function CreaturesTab({ creatures, onEdit, onAdd, onDelete, isCustomItem }: { creatures: any[], onEdit: (item: any, type: string) => void, onAdd: () => void, onDelete: (item: any, type: string) => void, isCustomItem: (item: any, type: string) => boolean }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterSize, setFilterSize] = useState('all');
  const [filterTag, setFilterTag] = useState('all');
  const [filterLocation, setFilterLocation] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [selectedCreature, setSelectedCreature] = useState<any>(null);

  const handleImportJSON = async (file: File) => {
    try {
      const text = await file.text();
      const jsonData = JSON.parse(text);
      
      // Import using the utility function
      const { importCreaturesFromJSON } = await import('@/utils/creatureImport');
      const result = importCreaturesFromJSON(jsonData);
      
      if (result.success) {
        alert(`Successfully imported ${result.imported} creatures!`);
        // Force a page refresh to update the creatures list
        window.location.reload();
      } else {
        alert(`Import failed. Errors:\n${result.errors.join('\n')}`);
      }
    } catch (error) {
      alert(`Failed to import JSON: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const filteredCreatures = creatures.filter(creature => {
    const matchesSearch = creature.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (creature.habitat && creature.habitat.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (creature.info && creature.info.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = filterType === 'all' || creature.type.toLowerCase().includes(filterType.toLowerCase());
    const matchesSize = filterSize === 'all' || creature.size === filterSize;
    const matchesTag = filterTag === 'all' || (creature.tags && creature.tags.includes(filterTag));
    const matchesLocation = filterLocation === 'all' || creature.location === filterLocation;
    return matchesSearch && matchesType && matchesSize && matchesTag && matchesLocation;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'name': return a.name.localeCompare(b.name);
      case 'cr': return b.challenge_rating - a.challenge_rating;
      case 'ac': return b.armor_class - a.armor_class;
      default: return 0;
    }
  });

  const types = [...new Set(creatures.map(c => c.type))];
  const sizes = [...new Set(creatures.map(c => c.size))];
  const allTags = [...new Set(creatures.flatMap(c => c.tags || []))].sort();

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-64">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search creatures..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-emerald-400"
              />
            </div>
          </div>
          
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-emerald-400"
          >
            <option value="all">All Types</option>
            {types.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>

          <select
            value={filterSize}
            onChange={(e) => setFilterSize(e.target.value)}
            className="px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-emerald-400"
          >
            <option value="all">All Sizes</option>
            {sizes.map(size => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>

          {allTags.length > 0 && (
            <select
              value={filterTag}
              onChange={(e) => setFilterTag(e.target.value)}
              className="px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-emerald-400"
            >
              <option value="all">All Tags</option>
              {allTags.map(tag => (
                <option key={tag} value={tag}>{tag}</option>
              ))}
            </select>
          )}

          <select
            value={filterLocation}
            onChange={(e) => setFilterLocation(e.target.value)}
            className="px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-emerald-400"
          >
            <option value="all">All Locations</option>
            {LOCATIONS.map(location => (
              <option key={location} value={location}>{location}</option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-emerald-400"
          >
            <option value="name">Sort by Name</option>
            <option value="cr">Sort by CR</option>
            <option value="ac">Sort by AC</option>
          </select>
        </div>

        {/* Add New and Import Buttons */}
        <div className="flex gap-2">
          <button
            onClick={onAdd}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
          >
            <PlusIcon className="h-4 w-4" />
            Add New
          </button>
          <label className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors cursor-pointer">
            <ArrowUpTrayIcon className="h-4 w-4" />
            Import JSON
            <input
              type="file"
              accept=".json"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  handleImportJSON(file);
                  e.target.value = ''; // Reset input
                }
              }}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Results Count */}
      <div className="text-slate-400 text-sm">
        Showing {filteredCreatures.length} of {creatures.length} creatures
      </div>

      {/* Creatures Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCreatures.map((creature, index) => (
          <div key={creature.id || `${creature.name}-${index}`} className="bg-slate-700/30 rounded-lg p-4 border border-slate-600/50 hover:border-emerald-400/50 transition-all duration-200">
            <div className="space-y-3">
              {/* Creature Image */}
              <div className="w-full h-32 bg-slate-600/30 rounded-lg flex items-center justify-center overflow-hidden">
                <img
                  src={creature.imageUrl || getCreatureImagePath(creature.name)}
                  alt={creature.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const img = e.target as HTMLImageElement;
                    img.style.display = 'none';
                    const parent = img.parentElement;
                    if (parent) {
                      parent.innerHTML = '<span class="text-4xl">🐉</span>';
                    }
                  }}
                />
              </div>
              
              <div className="flex items-start justify-between">
                <h3 className="font-semibold text-white">{creature.name}</h3>
                <span className="text-xs text-slate-400 bg-slate-600/50 px-2 py-1 rounded">
                  CR {creature.challenge_rating}
                </span>
              </div>
              
              <div className="text-sm text-slate-400">
                {creature.size} {creature.type}
              </div>

              {/* Location */}
              {creature.location && (
                <div className="text-xs text-cyan-400">
                  📍 {creature.location}
                </div>
              )}

              {/* Tags */}
              {creature.tags && creature.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {creature.tags.slice(0, 3).map((tag: string, tagIndex: number) => (
                    <span
                      key={tagIndex}
                      className="bg-emerald-600/20 text-emerald-400 px-2 py-0.5 rounded-full text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                  {creature.tags.length > 3 && (
                    <span className="text-xs text-slate-500">+{creature.tags.length - 3}</span>
                  )}
                </div>
              )}

              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="text-center">
                  <div className="text-blue-400 font-bold">{creature.armor_class}</div>
                  <div className="text-xs text-slate-400">AC</div>
                </div>
                <div className="text-center">
                  <div className="text-red-400 font-bold">{creature.hit_points}</div>
                  <div className="text-xs text-slate-400">HP</div>
                </div>
                <div className="text-center">
                  <div className="text-green-400 font-bold">
                    {creature.speed.walk || creature.speed.fly || 'Varies'}
                  </div>
                  <div className="text-xs text-slate-400">Speed</div>
                </div>
              </div>
              
              <div className="flex justify-between">
                <button 
                  onClick={() => setSelectedCreature(creature)}
                  className="flex items-center gap-1 px-3 py-1 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-lg transition-colors text-sm"
                >
                  <EyeIcon className="h-3 w-3" />
                  View Details
                </button>
                <button 
                  onClick={() => onEdit(creature, 'creature')}
                  className="p-1 text-slate-400 hover:text-emerald-400 transition-colors"
                >
                  <PencilIcon className="h-4 w-4" />
                </button>
                {isCustomItem(creature, 'creature') && (
                  <button 
                    onClick={() => onDelete(creature, 'creature')}
                    className="p-1 text-slate-400 hover:text-red-400 transition-colors"
                    title="Delete custom creature"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
        
      </div>

      {filteredCreatures.length === 0 && (
        <div className="text-center py-12">
          <FireIcon className="h-16 w-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-400 mb-2">No Creatures Found</h3>
          <p className="text-slate-500">Try adjusting your search or filters</p>
        </div>
      )}

      {/* Creature Detail Modal */}
      {selectedCreature && (
        <CreatureDetailModal 
          creature={selectedCreature} 
          onClose={() => setSelectedCreature(null)} 
        />
      )}
    </div>
  );
}

function CreatureDetailModal({ creature, onClose }: { creature: any; onClose: () => void }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!mounted) return null;

  const modalContent = (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-[9999] overflow-y-auto" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}>
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 rounded-2xl w-full max-w-4xl my-8 shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-slate-700">
          <div className="flex items-start gap-6">
            {/* Creature Image */}
            <div className="w-24 h-24 bg-slate-600/30 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0 shadow-lg">
              <img
                src={creature.imageUrl || getCreatureImagePath(creature.name)}
                alt={creature.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const img = e.target as HTMLImageElement;
                  img.style.display = 'none';
                  const parent = img.parentElement;
                  if (parent) {
                    parent.innerHTML = '<span class="text-4xl">🐉</span>';
                  }
                }}
              />
            </div>
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-white mb-2">{creature.name}</h2>
              <p className="text-slate-400 text-lg">{creature.size} {creature.type}</p>
              <p className="text-slate-500 text-sm">{creature.alignment}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[calc(90vh-120px)] overflow-y-auto">
          {/* Basic Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-700/30 rounded-lg p-3 text-center">
              <div className="text-lg font-bold text-blue-400">{creature.armor_class}</div>
              <div className="text-sm text-slate-400">Armor Class</div>
            </div>
            <div className="bg-slate-700/30 rounded-lg p-3 text-center">
              <div className="text-lg font-bold text-red-400">{creature.hit_points}</div>
              <div className="text-sm text-slate-400">Hit Points</div>
            </div>
            <div className="bg-slate-700/30 rounded-lg p-3 text-center">
              <div className="text-lg font-bold text-yellow-400">CR {creature.challenge_rating}</div>
              <div className="text-sm text-slate-400">Challenge Rating</div>
            </div>
            <div className="bg-slate-700/30 rounded-lg p-3 text-center">
              <div className="text-lg font-bold text-purple-400">+{creature.proficiency_bonus}</div>
              <div className="text-sm text-slate-400">Proficiency</div>
            </div>
          </div>

          {/* Ability Scores */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">Ability Scores</h3>
            <div className="grid grid-cols-6 gap-4">
              {Object.entries(creature.ability_scores).map(([ability, score]) => (
                <div key={ability} className="bg-slate-700/30 rounded-lg p-3 text-center">
                  <div className="text-sm font-bold text-white">{ability}</div>
                  <div className="text-lg text-emerald-400">{String(score)}</div>
                  <div className="text-xs text-slate-400">
                    ({Math.floor((Number(score) - 10) / 2) >= 0 ? '+' : ''}{Math.floor((Number(score) - 10) / 2)})
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Speed */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">Speed</h3>
            <div className="bg-slate-700/30 rounded-lg p-3">
              <div className="flex flex-wrap gap-4 text-sm">
                {Object.entries(creature.speed).map(([type, speed]) => (
                  <span key={type} className="text-green-400">
                    {type}: {String(speed)}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Traits */}
          {creature.traits && creature.traits.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Traits</h3>
              <div className="space-y-3">
                {creature.traits.map((trait: any, index: number) => (
                  <div key={index} className="bg-slate-700/30 rounded-lg p-4">
                    <h4 className="font-semibold text-emerald-400 mb-2">{trait.name}</h4>
                    <p className="text-slate-300 text-sm leading-relaxed">{trait.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          {creature.actions && creature.actions.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Actions</h3>
              <div className="space-y-3">
                {creature.actions.map((action: any, index: number) => (
                  <div key={index} className="bg-slate-700/30 rounded-lg p-4">
                    <h4 className="font-semibold text-red-400 mb-2">{action.name}</h4>
                    <p className="text-slate-300 text-sm leading-relaxed">{action.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bonus Actions */}
          {creature.bonus_actions && creature.bonus_actions.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Bonus Actions</h3>
              <div className="space-y-3">
                {creature.bonus_actions.map((action: any, index: number) => (
                  <div key={index} className="bg-slate-700/30 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-400 mb-2">{action.name}</h4>
                    <p className="text-slate-300 text-sm leading-relaxed">{action.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reactions */}
          {creature.reactions && creature.reactions.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Reactions</h3>
              <div className="space-y-3">
                {creature.reactions.map((reaction: any, index: number) => (
                  <div key={index} className="bg-slate-700/30 rounded-lg p-4">
                    <h4 className="font-semibold text-purple-400 mb-2">{reaction.name}</h4>
                    <p className="text-slate-300 text-sm leading-relaxed">{reaction.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Location */}
          {creature.location && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Location</h3>
              <div className="bg-slate-700/30 rounded-lg p-4">
                <p className="text-cyan-400">📍 {creature.location}</p>
              </div>
            </div>
          )}

          {/* Tags */}
          {creature.tags && creature.tags.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {creature.tags.map((tag: string, index: number) => (
                  <span
                    key={index}
                    className="bg-emerald-600/30 text-emerald-400 px-3 py-1 rounded-full text-sm border border-emerald-600/50"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Habitat */}
          {creature.habitat && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Habitat</h3>
              <div className="bg-slate-700/30 rounded-lg p-4">
                <p className="text-slate-300">{creature.habitat}</p>
              </div>
            </div>
          )}

          {/* Additional Info */}
          {creature.info && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Additional Info</h3>
              <div className="bg-slate-700/30 rounded-lg p-4">
                <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">{creature.info}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

function MagicItemsTab({ magicItems, onEdit, onAdd, onDelete, isCustomItem }: { magicItems: any[], onEdit: (item: any, type: string) => void, onAdd: () => void, onDelete: (item: any, type: string) => void, isCustomItem: (item: any, type: string) => boolean }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRarity, setFilterRarity] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [filterAttunement, setFilterAttunement] = useState('all');

  const filteredMagicItems = magicItems.filter(item => {
    const matchesSearch = searchTerm === '' || item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRarity = filterRarity === 'all' || item.rarity === filterRarity;
    const matchesType = filterType === 'all' || item.type === filterType;
    const matchesAttunement = filterAttunement === 'all' || 
      (filterAttunement === 'required' && item.requiresAttunement) ||
      (filterAttunement === 'not-required' && !item.requiresAttunement);
    return matchesSearch && matchesRarity && matchesType && matchesAttunement;
  });

  const rarities = [...new Set(magicItems.map(item => item.rarity))].sort();
  const types = [...new Set(magicItems.map(item => item.type))].sort();

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-64">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search magic items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-emerald-400"
              />
            </div>
          </div>
          
          <select
            value={filterRarity}
            onChange={(e) => setFilterRarity(e.target.value)}
            className="px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-emerald-400"
          >
            <option value="all">All Rarities</option>
            {rarities.map(rarity => (
              <option key={rarity} value={rarity}>{rarity}</option>
            ))}
          </select>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-emerald-400"
          >
            <option value="all">All Types</option>
            {types.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>

          <select
            value={filterAttunement}
            onChange={(e) => setFilterAttunement(e.target.value)}
            className="px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-emerald-400"
          >
            <option value="all">All Items</option>
            <option value="required">Requires Attunement</option>
            <option value="not-required">No Attunement</option>
          </select>
        </div>

        {/* Add New Button */}
        <button
          onClick={onAdd}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
        >
          <PlusIcon className="h-4 w-4" />
          Add New Magic Item
        </button>
      </div>

      {/* Results Count */}
      <div className="text-slate-400 text-sm">
        Showing {filteredMagicItems.length} of {magicItems.length} magic items
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredMagicItems.map((item, index) => (
          <div
            key={item.id || `${item.name}-${index}`}
            className="bg-slate-700/30 rounded-lg p-4 border border-slate-600/50 hover:border-emerald-400/50 transition-all duration-200"
          >
            {/* Magic Item Image */}
            <div className="aspect-square mb-3 rounded-lg overflow-hidden bg-slate-800">
              <img
                src={getMagicItemImagePath(item.name)}
                alt={item.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/images/magic-items/default-magic-item.svg';
                }}
              />
            </div>

            {/* Item Info */}
            <div className="space-y-2">
              <div className="flex items-start justify-between">
                <h3 className="font-semibold text-white text-sm leading-tight">{item.name}</h3>
                <div className="flex gap-1">
                  <button
                    onClick={() => onEdit(item, 'magicItem')}
                    className="p-1 text-slate-400 hover:text-emerald-400 transition-colors"
                    title="Edit Magic Item"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  {isCustomItem(item, 'magicItem') && (
                    <button
                      onClick={() => onDelete(item, 'magicItem')}
                      className="p-1 text-slate-400 hover:text-red-400 transition-colors"
                      title="Delete custom magic item"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              <div className="text-xs text-slate-400">{item.type}</div>

              <div className="flex items-center justify-between">
                <span className={`text-xs px-2 py-1 rounded-full ${
                  item.rarity === 'Common' ? 'bg-gray-500/20 text-gray-300' :
                  item.rarity === 'Uncommon' ? 'bg-green-500/20 text-green-300' :
                  item.rarity === 'Rare' ? 'bg-blue-500/20 text-blue-300' :
                  item.rarity === 'Very Rare' ? 'bg-purple-500/20 text-purple-300' :
                  'bg-orange-500/20 text-orange-300'
                }`}>
                  {item.rarity}
                </span>
                {item.requiresAttunement && (
                  <span className="text-xs bg-red-500/20 text-red-300 px-2 py-1 rounded-full">
                    Attunement
                  </span>
                )}
              </div>

              {item.price && (
                <div className="text-xs text-emerald-400 font-semibold">
                  {item.price} gp
                </div>
              )}

              {item.effect && (
                <p className="text-xs text-slate-400 line-clamp-2">{item.effect}</p>
              )}
            </div>
          </div>
        ))}
        
      </div>

      {filteredMagicItems.length === 0 && (
        <div className="text-center py-12">
          <GiftIcon className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-400">No magic items found matching your criteria.</p>
        </div>
      )}
    </div>
  );
}

function NPCsTab({ npcs, onEdit, onAdd, onDelete, isCustomItem }: { npcs: any[], onEdit: (item: any, type: string) => void, onAdd: () => void, onDelete: (item: any, type: string) => void, isCustomItem: (item: any, type: string) => boolean }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLocation, setFilterLocation] = useState('all');
  const [filterTag, setFilterTag] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [viewingNPC, setViewingNPC] = useState<any>(null);

  const filteredNPCs = npcs.filter(npc => {
    const matchesSearch = npc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         npc.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         npc.occupation?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLocation = filterLocation === 'all' || npc.location === filterLocation;
    const matchesTag = filterTag === 'all' || (npc.tags && npc.tags.includes(filterTag));
    return matchesSearch && matchesLocation && matchesTag;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'name': return a.name.localeCompare(b.name);
      case 'recent': return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      default: return 0;
    }
  });

  const locations = [...new Set(npcs.filter(n => n.location).map(n => n.location))];
  const allTags = [...new Set(npcs.flatMap(n => n.tags || []))];

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-64">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search NPCs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-emerald-400"
              />
            </div>
          </div>
          
          {locations.length > 0 && (
            <select
              value={filterLocation}
              onChange={(e) => setFilterLocation(e.target.value)}
              className="px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-emerald-400"
            >
              <option value="all">All Locations</option>
              {locations.map(location => (
                <option key={location} value={location}>{location}</option>
              ))}
            </select>
          )}

          {allTags.length > 0 && (
            <select
              value={filterTag}
              onChange={(e) => setFilterTag(e.target.value)}
              className="px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-emerald-400"
            >
              <option value="all">All Tags</option>
              {allTags.map(tag => (
                <option key={tag} value={tag}>{tag}</option>
              ))}
            </select>
          )}

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-emerald-400"
          >
            <option value="name">Sort by Name</option>
            <option value="recent">Sort by Recent</option>
          </select>
        </div>

        <button
          onClick={onAdd}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-blue-500 text-white rounded-lg hover:shadow-lg hover:scale-105 transition-all duration-200"
        >
          <PlusIcon className="h-5 w-5" />
          Add New NPC
        </button>
      </div>

      {/* NPCs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredNPCs.map((npc) => (
          <div key={npc.id} className="bg-slate-700/50 rounded-xl p-6 border border-slate-600 hover:border-emerald-400 transition-all duration-200">
            <div className="space-y-4">
              {/* Portrait */}
              {npc.portrait && (
                <div className="aspect-square w-full rounded-lg overflow-hidden bg-slate-800">
                  <img
                    src={npc.portrait}
                    alt={npc.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="flex items-start justify-between">
                <h3 className="text-xl font-semibold text-white">{npc.name}</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => setViewingNPC(npc)}
                    className="p-1 text-slate-400 hover:text-blue-400 transition-colors"
                    title="View NPC Details"
                  >
                    <EyeIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onEdit(npc, 'npc')}
                    className="p-1 text-slate-400 hover:text-emerald-400 transition-colors"
                    title="Edit NPC"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onDelete(npc, 'npc')}
                    className="p-1 text-slate-400 hover:text-red-400 transition-colors"
                    title="Delete NPC"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {npc.occupation && (
                <div className="text-sm text-emerald-400">{npc.occupation}</div>
              )}

              {npc.location && (
                <div className="text-sm text-slate-400">
                  <span className="text-slate-500">Location:</span> {npc.location}
                </div>
              )}

              <p className="text-sm text-slate-300 line-clamp-3">{npc.details}</p>

              {npc.tags && npc.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {npc.tags.map((tag: string, index: number) => (
                    <span
                      key={index}
                      className="text-xs bg-slate-600 text-slate-300 px-2 py-1 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredNPCs.length === 0 && (
        <div className="text-center py-12">
          <UserGroupIcon className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-400 mb-2">No NPCs Found</h3>
          <p className="text-slate-500">Create your first NPC to get started!</p>
        </div>
      )}

      {/* NPC View Modal */}
      {viewingNPC && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-700">
            <div className="flex items-start justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">NPC Details</h2>
              <button
                onClick={() => setViewingNPC(null)}
                className="p-2 text-slate-400 hover:text-white transition-colors"
                title="Close"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-6">
              {/* Portrait and Basic Info */}
              <div className="flex flex-col md:flex-row gap-6">
                {viewingNPC.portrait && (
                  <div className="flex-shrink-0">
                    <div className="aspect-square w-48 rounded-lg overflow-hidden bg-slate-700">
                      <img
                        src={viewingNPC.portrait}
                        alt={viewingNPC.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                )}
                
                <div className="flex-1 space-y-4">
                  <div>
                    <h3 className="text-3xl font-bold text-white mb-2">{viewingNPC.name}</h3>
                    {viewingNPC.occupation && (
                      <p className="text-lg text-emerald-400">{viewingNPC.occupation}</p>
                    )}
                  </div>

                  {viewingNPC.location && (
                    <div>
                      <span className="text-sm font-medium text-slate-400">Location</span>
                      <p className="text-white">{viewingNPC.location}</p>
                    </div>
                  )}

                  {viewingNPC.tags && viewingNPC.tags.length > 0 && (
                    <div>
                      <span className="text-sm font-medium text-slate-400 block mb-2">Tags</span>
                      <div className="flex flex-wrap gap-2">
                        {viewingNPC.tags.map((tag: string, index: number) => (
                          <span
                            key={index}
                            className="bg-slate-600 text-slate-200 px-3 py-1 rounded-full text-sm"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Details */}
              <div>
                <span className="text-sm font-medium text-slate-400 block mb-2">Details</span>
                <div className="bg-slate-700/30 rounded-lg p-4 border border-slate-600">
                  <p className="text-slate-200 whitespace-pre-wrap leading-relaxed">
                    {viewingNPC.details}
                  </p>
                </div>
              </div>

              {/* Timestamps */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-400 pt-4 border-t border-slate-700">
                <div>
                  <span className="font-medium">Created:</span>{' '}
                  {viewingNPC.created_at ? new Date(viewingNPC.created_at).toLocaleDateString() : 'Unknown'}
                </div>
                <div>
                  <span className="font-medium">Last Modified:</span>{' '}
                  {viewingNPC.updated_at ? new Date(viewingNPC.updated_at).toLocaleDateString() : 'Unknown'}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-4 pt-6 border-t border-slate-700">
                <button
                  onClick={() => {
                    setViewingNPC(null);
                    onEdit(viewingNPC, 'npc');
                  }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
                >
                  Edit NPC
                </button>
                <button
                  onClick={() => setViewingNPC(null)}
                  className="px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CompanionTypesTab({ companionTypes, onEdit, onAdd, onDelete, isCustomItem }: { companionTypes: any[], onEdit: (item: any, type: string) => void, onAdd: () => void, onDelete: (item: any, type: string) => void, isCustomItem: (item: any, type: string) => boolean }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [viewingCompanionType, setViewingCompanionType] = useState<any>(null);

  const filteredCompanionTypes = companionTypes.filter(ct => {
    const matchesSearch = ct.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ct.spirit_form.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ct.type.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'name': return a.name.localeCompare(b.name);
      case 'recent': return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      default: return 0;
    }
  });

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-64">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search companion types..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-emerald-400"
              />
            </div>
          </div>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-emerald-400"
          >
            <option value="name">Sort by Name</option>
            <option value="recent">Sort by Recent</option>
          </select>
        </div>
        
        <button
          onClick={onAdd}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
        >
          <PlusIcon className="h-5 w-5" />
          Add Companion Type
        </button>
      </div>

      {/* Companion Types Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCompanionTypes.map((companionType) => (
          <div key={companionType.id} className="bg-slate-700/30 rounded-lg p-4 border border-slate-600/50 hover:border-emerald-400/50 transition-all duration-200">
            <div className="space-y-3">
              {/* Companion Type Image */}
              <div className="w-full h-32 bg-slate-600/30 rounded-lg flex items-center justify-center overflow-hidden">
                {companionType.image ? (
                  <img
                    src={companionType.image}
                    alt={companionType.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const img = e.target as HTMLImageElement;
                      img.style.display = 'none';
                      const parent = img.parentElement;
                      if (parent) {
                        parent.innerHTML = '<span class="text-4xl">✨</span>';
                      }
                    }}
                  />
                ) : (
                  <span className="text-4xl">✨</span>
                )}
              </div>
              
              <div className="flex items-start justify-between">
                <h3 className="font-semibold text-white">{companionType.name}</h3>
                <span className="text-xs text-slate-400 bg-slate-600/50 px-2 py-1 rounded">
                  CR {companionType.challenge_rating}
                </span>
              </div>
              
              <div className="text-sm text-slate-400">
                {companionType.size} {companionType.type}
              </div>
              
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="text-center">
                  <div className="text-blue-400 font-bold">{companionType.armor_class}</div>
                  <div className="text-xs text-slate-400">AC</div>
                </div>
                <div className="text-center">
                  <div className="text-red-400 font-bold">{companionType.hit_points}</div>
                  <div className="text-xs text-slate-400">HP</div>
                </div>
                <div className="text-center">
                  <div className="text-green-400 font-bold">
                    {Object.values(companionType.speed)[0] || '30 ft.'}
                  </div>
                  <div className="text-xs text-slate-400">Speed</div>
                </div>
              </div>
              
              <div className="flex justify-between">
                <button 
                  onClick={() => setViewingCompanionType(companionType)}
                  className="flex items-center gap-1 px-3 py-1 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-lg transition-colors text-sm"
                >
                  <EyeIcon className="h-3 w-3" />
                  View Details
                </button>
                <button 
                  onClick={() => onEdit(companionType, 'companionType')}
                  className="p-1 text-slate-400 hover:text-emerald-400 transition-colors"
                >
                  <PencilIcon className="h-4 w-4" />
                </button>
                {isCustomItem(companionType, 'companionType') && (
                  <button 
                    onClick={() => onDelete(companionType, 'companionType')}
                    className="p-1 text-slate-400 hover:text-red-400 transition-colors"
                    title="Delete custom companion type"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* View Modal */}
      {viewingCompanionType && (
        <CompanionTypeDetailModal 
          companionType={viewingCompanionType} 
          onClose={() => setViewingCompanionType(null)} 
        />
      )}
    </div>
  );
}

function CompanionTypeDetailModal({ companionType, onClose }: { companionType: any; onClose: () => void }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!mounted) return null;

  const modalContent = (
    <>
      {/* Modal Background */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" 
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div className="bg-slate-800 border border-slate-600 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto pointer-events-auto" onClick={(e) => e.stopPropagation()}>
          {/* Header with close button */}
          <div className="sticky top-0 bg-slate-800 border-b border-slate-600 p-4 flex justify-between items-center">
            <h2 className="text-2xl font-bold text-white">{companionType.name}</h2>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Basic Info */}
            <div className="flex gap-6">
              {companionType.image && (
                <div className="flex-shrink-0">
                  <img
                    src={companionType.image}
                    alt={companionType.name}
                    className="w-32 h-32 rounded-lg object-cover"
                  />
                </div>
              )}
              <div className="flex-1">
                <p className="text-lg text-emerald-400 mb-1">{companionType.spirit_form}</p>
                <p className="text-slate-300">{companionType.size} {companionType.type}, {companionType.alignment}</p>
                <p className="text-sm text-slate-400 mt-2">Challenge Rating: {companionType.challenge_rating}</p>
                {companionType.spirit_forms && companionType.spirit_forms.length > 0 && (
                  <div className="mt-3">
                    <p className="text-sm text-slate-400 mb-1">Possible Forms:</p>
                    <div className="flex flex-wrap gap-2">
                      {companionType.spirit_forms.map((form, index) => (
                        <span key={index} className="bg-slate-700/50 px-2 py-1 rounded text-xs text-slate-300">
                          {form}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Combat Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-slate-700/30 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-blue-400">{companionType.armor_class}</div>
                <div className="text-sm text-slate-400">Armor Class</div>
              </div>
              <div className="bg-slate-700/30 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-red-400">{companionType.hit_points}</div>
                <div className="text-sm text-slate-400">Hit Points</div>
              </div>
              <div className="bg-slate-700/30 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-green-400">+{companionType.proficiency_bonus}</div>
                <div className="text-sm text-slate-400">Proficiency</div>
              </div>
            </div>

            {/* Speed */}
            <div>
              <h3 className="text-sm font-medium text-slate-400 mb-2">Speed</h3>
              <div className="bg-slate-700/30 rounded-lg p-4">
                <div className="flex flex-wrap gap-4">
                  {Object.entries(companionType.speed).map(([type, value]) => (
                    <span key={type} className="text-slate-200">
                      <span className="capitalize">{type}:</span> {value}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Ability Scores */}
            <div>
              <h3 className="text-sm font-medium text-slate-400 mb-2">Ability Scores</h3>
              <div className="bg-slate-700/30 rounded-lg p-4">
                <div className="grid grid-cols-6 gap-4 text-center">
                  {Object.entries(companionType.ability_scores).map(([ability, score]) => (
                    <div key={ability}>
                      <div className="text-xs text-slate-400">{ability}</div>
                      <div className="text-lg font-bold text-white">{score}</div>
                      <div className="text-xs text-slate-500">{Math.floor((score - 10) / 2) >= 0 ? '+' : ''}{Math.floor((score - 10) / 2)}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Skills, Senses, Languages */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {companionType.skills && companionType.skills.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-slate-400 mb-2">Skills</h3>
                  <div className="bg-slate-700/30 rounded-lg p-4">
                    <p className="text-slate-200">{companionType.skills.join(', ')}</p>
                  </div>
                </div>
              )}
              
              <div>
                <h3 className="text-sm font-medium text-slate-400 mb-2">Senses</h3>
                <div className="bg-slate-700/30 rounded-lg p-4">
                  <p className="text-slate-200">{companionType.senses.join(', ')}</p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-slate-400 mb-2">Languages</h3>
                <div className="bg-slate-700/30 rounded-lg p-4">
                  <p className="text-slate-200">{companionType.languages.join(', ')}</p>
                </div>
              </div>

              {(companionType.damage_immunities?.length > 0 || companionType.condition_immunities?.length > 0) && (
                <div>
                  <h3 className="text-sm font-medium text-slate-400 mb-2">Immunities</h3>
                  <div className="bg-slate-700/30 rounded-lg p-4">
                    {companionType.damage_immunities?.length > 0 && (
                      <p className="text-slate-200">
                        <span className="text-slate-400">Damage:</span> {companionType.damage_immunities.join(', ')}
                      </p>
                    )}
                    {companionType.condition_immunities?.length > 0 && (
                      <p className="text-slate-200">
                        <span className="text-slate-400">Conditions:</span> {companionType.condition_immunities.join(', ')}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Traits */}
            {companionType.traits && companionType.traits.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Traits</h3>
                <div className="space-y-3">
                  {companionType.traits.map((trait: any, index: number) => (
                    <div key={index} className="bg-slate-700/30 rounded-lg p-4">
                      <h4 className="font-semibold text-emerald-400 mb-1">{trait.name}</h4>
                      <p className="text-slate-200 text-sm">{trait.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            {companionType.actions && companionType.actions.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Actions</h3>
                <div className="space-y-3">
                  {companionType.actions.map((action: any, index: number) => (
                    <div key={index} className="bg-slate-700/30 rounded-lg p-4">
                      <h4 className="font-semibold text-red-400 mb-1">{action.name}</h4>
                      <p className="text-slate-200 text-sm">{action.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );

  return createPortal(modalContent, document.body);
}

function CompanionDetailModal({ companion, onClose }: { companion: any, onClose: () => void }) {
  // Get the companion type for stat block information
  const companionType = companionTypes.find(type => type.id === companion.companion_type_id);

  if (!companionType) {
    return null;
  }

  const modalContent = (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 border border-slate-600 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-600">
          <h2 className="text-2xl font-bold text-white">{companion.name}</h2>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Companion Information */}
          <div className="space-y-6">
            {/* Portrait */}
            {companion.image && (
              <div className="aspect-square w-full max-w-md mx-auto rounded-lg overflow-hidden bg-slate-700">
                <img
                  src={companion.image}
                  alt={companion.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Personality Traits */}
            <div className="bg-slate-700/50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-white mb-4">Personality</h3>
              <div className="space-y-3">
                <div>
                  <span className="text-emerald-400 font-medium">Goal:</span>
                  <p className="text-slate-300">{companion.goal}</p>
                </div>
                <div>
                  <span className="text-blue-400 font-medium">Desire:</span>
                  <p className="text-slate-300">{companion.desire}</p>
                </div>
                <div>
                  <span className="text-purple-400 font-medium">Disposition:</span>
                  <p className="text-slate-300">{companion.disposition}</p>
                </div>
                <div>
                  <span className="text-amber-400 font-medium">Quirk:</span>
                  <p className="text-slate-300">{companion.quirk}</p>
                </div>
                {companion.spirit_form && (
                  <div>
                    <span className="text-cyan-400 font-medium">Spirit Form:</span>
                    <p className="text-slate-300">{companion.spirit_form}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Stat Block */}
          <div className="bg-slate-700/50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-4">{companionType.name} Stat Block</h3>
            
            {/* Basic Info */}
            <div className="border-b border-slate-600 pb-4 mb-4">
              <h4 className="text-xl font-bold text-white">{companionType.name}</h4>
              <p className="text-slate-300 italic">{companionType.size} {companionType.type}, {companionType.alignment}</p>
            </div>

            {/* AC, HP, Speed */}
            <div className="grid grid-cols-1 gap-2 mb-4 text-sm">
              <div><strong className="text-red-400">Armor Class</strong> {companionType.armor_class}</div>
              <div><strong className="text-green-400">Hit Points</strong> {companionType.hit_points}</div>
              <div>
                <strong className="text-blue-400">Speed</strong> {' '}
                {Object.entries(companionType.speed).map(([type, value]) => 
                  type !== 'hover' ? `${value} ${type}` : null
                ).filter(Boolean).join(', ')}
                {companionType.speed.hover && ' (hover)'}
              </div>
            </div>

            {/* Ability Scores */}
            <div className="border-t border-slate-600 pt-4 mb-4">
              <div className="grid grid-cols-6 gap-2 text-center text-sm">
                {Object.entries(companionType.ability_scores).map(([ability, score]) => (
                  <div key={ability}>
                    <div className="font-bold text-white">{ability}</div>
                    <div className="text-slate-300">{score} ({Math.floor((score - 10) / 2) >= 0 ? '+' : ''}{Math.floor((score - 10) / 2)})</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Skills, Senses, Languages */}
            <div className="space-y-2 text-sm border-t border-slate-600 pt-4 mb-4">
              {companionType.skills && companionType.skills.length > 0 && (
                <div><strong className="text-yellow-400">Skills</strong> {companionType.skills.join(', ')}</div>
              )}
              <div><strong className="text-purple-400">Senses</strong> {companionType.senses.join(', ')}</div>
              <div><strong className="text-cyan-400">Languages</strong> {companionType.languages.join(', ')}</div>
              <div><strong className="text-orange-400">Challenge</strong> {companionType.challenge_rating} (Proficiency Bonus +{companionType.proficiency_bonus})</div>
            </div>

            {/* Traits */}
            {companionType.traits && companionType.traits.length > 0 && (
              <div className="border-t border-slate-600 pt-4 mb-4">
                <h5 className="font-bold text-white mb-2">Traits</h5>
                {companionType.traits.map((trait, index) => (
                  <div key={index} className="mb-3">
                    <strong className="text-emerald-400">{trait.name}.</strong>
                    <span className="text-slate-300 ml-1">{trait.description}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Actions */}
            {companionType.actions && companionType.actions.length > 0 && (
              <div className="border-t border-slate-600 pt-4">
                <h5 className="font-bold text-white mb-2">Actions</h5>
                {companionType.actions.map((action, index) => (
                  <div key={index} className="mb-3">
                    <strong className="text-red-400">{action.name}.</strong>
                    <span className="text-slate-300 ml-1">{action.description}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

function CompanionsTab({ companions, onEdit, onAdd, onDelete, isCustomItem }: { companions: any[], onEdit: (item: any, type: string) => void, onAdd: () => void, onDelete: (item: any, type: string) => void, isCustomItem: (item: any, type: string) => boolean }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [viewingCompanion, setViewingCompanion] = useState<any | null>(null);

  const filteredCompanions = companions.filter(companion => {
    const matchesSearch = companion.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         companion.goal.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         companion.desire.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'name': return a.name.localeCompare(b.name);
      case 'recent': return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      default: return 0;
    }
  });

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-64">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search companions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-emerald-400"
              />
            </div>
          </div>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-emerald-400"
          >
            <option value="name">Sort by Name</option>
            <option value="recent">Sort by Recent</option>
          </select>
        </div>
        
        <button
          onClick={onAdd}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
        >
          <PlusIcon className="h-5 w-5" />
          Add Companion
        </button>
      </div>

      {/* Companions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCompanions.map((companion) => (
          <div
            key={companion.id}
            className="bg-slate-800/50 border border-slate-600 rounded-lg p-6 hover:border-emerald-400 transition-all duration-300"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <h3 className="text-xl font-bold text-white mb-1">{companion.name}</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setViewingCompanion(companion)}
                      className="p-1 text-slate-400 hover:text-blue-400 transition-colors"
                      title="View Companion Details"
                    >
                      <EyeIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onEdit(companion, 'companion')}
                      className="p-1 text-slate-400 hover:text-emerald-400 transition-colors"
                      title="Edit Companion"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onDelete(companion, 'companion')}
                      className="p-1 text-slate-400 hover:text-red-400 transition-colors"
                      title="Delete Companion"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <p className="text-emerald-400 text-sm">{companion.goal}</p>
                {companion.spirit_form && (
                  <p className="text-slate-400 text-xs mt-1">Spirit Form: {companion.spirit_form}</p>
                )}
              </div>
              {companion.image && (
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-slate-700 flex-shrink-0 ml-4">
                  <img
                    src={companion.image}
                    alt={companion.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>

            <div className="space-y-2 mb-4">
              <div className="text-sm">
                <span className="text-slate-400">Desire:</span>
                <span className="text-white ml-2">{companion.desire}</span>
              </div>
              <div className="text-sm">
                <span className="text-slate-400">Disposition:</span>
                <span className="text-white ml-2">{companion.disposition}</span>
              </div>
              <div className="text-sm">
                <span className="text-slate-400">Quirk:</span>
                <span className="text-white ml-2">{companion.quirk}</span>
              </div>
            </div>

          </div>
        ))}
      </div>

      {/* Companion Detail Modal */}
      {viewingCompanion && (
        <CompanionDetailModal
          companion={viewingCompanion}
          onClose={() => setViewingCompanion(null)}
        />
      )}
    </div>
  );
}

function LocationsTab({ locations, npcs, quests, onEdit, onAdd, onDelete, isCustomItem }: { locations: any[], npcs: any[], quests: any[], onEdit: (item: any, type: string) => void, onAdd: () => void, onDelete: (item: any, type: string) => void, isCustomItem: (item: any, type: string) => boolean }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRegion, setFilterRegion] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [viewingLocation, setViewingLocation] = useState<any>(null);

  const filteredLocations = locations.filter(location => {
    const matchesSearch = !searchTerm ||
      location.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      location.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      location.toneVibe?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRegion = filterRegion === 'all' || location.region === filterRegion;
    return matchesSearch && matchesRegion;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'name': return (a.name || '').localeCompare(b.name || '');
      case 'region': return (a.region || '').localeCompare(b.region || '');
      case 'recent': return new Date(b.updated_at || 0).getTime() - new Date(a.updated_at || 0).getTime();
      default: return 0;
    }
  });

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-64">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search locations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <select
            value={filterRegion}
            onChange={(e) => setFilterRegion(e.target.value)}
            className="px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-amber-400"
          >
            <option value="all">All Regions</option>
            {regions.map(region => (
              <option key={region.id} value={region.id}>{region.name}</option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-amber-400"
          >
            <option value="name">Sort by Name</option>
            <option value="region">Sort by Region</option>
            <option value="recent">Sort by Recent</option>
          </select>
        </div>

        <button
          onClick={onAdd}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg hover:shadow-lg hover:scale-105 transition-all duration-200"
        >
          <PlusIcon className="h-5 w-5" />
          Add New Location
        </button>
      </div>

      {/* Locations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredLocations.map((location) => {
          const regionName = regions.find(r => r.id === location.region)?.name;
          const npcCount = (location.npcIds || []).length;
          const questCount = (location.linkedQuestIds || []).length;
          const encounterCount = (location.encounterIds || []).length;

          return (
            <div key={location.id} className="bg-slate-700/50 rounded-xl border border-slate-600 hover:border-amber-400 transition-all duration-200 overflow-hidden">
              {location.imageUrl && (
                <div className="w-full h-32 overflow-hidden">
                  <img src={location.imageUrl} alt={location.name} className="w-full h-full object-cover" />
                </div>
              )}
              <div className="p-6 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-white">{location.name}</h3>
                    {regionName && (
                      <p className="text-amber-400 text-sm flex items-center gap-1 mt-1">
                        <MapPinIcon className="h-3.5 w-3.5" />
                        {regionName}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setViewingLocation(location)}
                      className="p-1 text-slate-400 hover:text-blue-400 transition-colors"
                      title="View Location Details"
                    >
                      <EyeIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onEdit(location, 'location')}
                      className="p-1 text-slate-400 hover:text-amber-400 transition-colors"
                      title="Edit Location"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onDelete(location, 'location')}
                      className="p-1 text-slate-400 hover:text-red-400 transition-colors"
                      title="Delete Location"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {location.toneVibe && (
                  <span className="inline-block px-2 py-0.5 bg-indigo-500/20 border border-indigo-400/30 rounded-full text-xs text-indigo-300">
                    {location.toneVibe}
                  </span>
                )}

                {location.description && (
                  <p className="text-sm text-slate-300 line-clamp-3">{location.description.replace(/@\[([^\]]+)\]\([^)]+\)/g, '$1')}</p>
                )}

                {/* Stats */}
                <div className="flex flex-wrap gap-3 text-xs text-slate-400">
                  {npcCount > 0 && (
                    <span className="flex items-center gap-1">
                      <UserGroupIcon className="h-3.5 w-3.5" />
                      {npcCount} NPC{npcCount !== 1 ? 's' : ''}
                    </span>
                  )}
                  {questCount > 0 && (
                    <span className="flex items-center gap-1">
                      <GiftIcon className="h-3.5 w-3.5" />
                      {questCount} Quest{questCount !== 1 ? 's' : ''}
                    </span>
                  )}
                  {encounterCount > 0 && (
                    <span className="flex items-center gap-1">
                      <FireIcon className="h-3.5 w-3.5" />
                      {encounterCount} Encounter{encounterCount !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredLocations.length === 0 && (
        <div className="text-center py-12">
          <MapPinIcon className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-400 mb-2">No Locations Found</h3>
          <p className="text-slate-500">Create your first location to get started!</p>
        </div>
      )}

      {/* Location View Modal */}
      {viewingLocation && (
        <LocationDetailsModal
          location={viewingLocation}
          npcs={npcs}
          allLocations={locations}
          quests={quests}
          onClose={() => setViewingLocation(null)}
          onLocationClick={(loc) => {
            setViewingLocation(loc);
          }}
        />
      )}
    </div>
  );
}