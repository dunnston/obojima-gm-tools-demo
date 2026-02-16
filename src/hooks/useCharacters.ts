'use client';

import { useState, useEffect, useCallback } from 'react';
import { PlayerCharacter } from '@/data/characters';
import { syncService } from '@/services/sync';

function validateCharacter(char: any): PlayerCharacter {
  return {
    ...char,
    createdAt: char.createdAt ? new Date(char.createdAt) : new Date(),
    updatedAt: char.updatedAt ? new Date(char.updatedAt) : new Date(),
    level: char.level || 1,
    armorClass: char.armorClass || char.ac || 10,
    hitPoints: char.hitPoints || char.currentHp || char.maxHitPoints || char.maxHp || 10,
    maxHitPoints: char.maxHitPoints || char.maxHp || 10,
    passivePerception: char.passivePerception || 10,
    passiveInsight: char.passiveInsight || 10,
    passiveInvestigation: char.passiveInvestigation || 10,
    characterGoal: char.characterGoal || '',
    boons: char.boons || [],
    personalityTraits: char.personalityTraits || [],
    ideals: char.ideals || [],
    bonds: char.bonds || [],
    flaws: char.flaws || [],
    strength: char.strength || 10,
    dexterity: char.dexterity || 10,
    constitution: char.constitution || 10,
    intelligence: char.intelligence || 10,
    wisdom: char.wisdom || 10,
    charisma: char.charisma || 10,
    speed: char.speed || 30,
    proficiencyBonus: char.proficiencyBonus || 2,
  };
}

export function useCharacters() {
  const [characters, setCharacters] = useState<PlayerCharacter[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadCharacters = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await syncService.getCharacters();
      if (result.success && result.data) {
        setCharacters(result.data.map(validateCharacter));
      } else {
        const saved = localStorage.getItem('obojima-characters');
        if (saved) {
          setCharacters(JSON.parse(saved).map(validateCharacter));
        }
      }
    } catch {
      try {
        const saved = localStorage.getItem('obojima-characters');
        if (saved) {
          setCharacters(JSON.parse(saved).map(validateCharacter));
        }
      } catch {}
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCharacters();
  }, [loadCharacters]);

  return { characters, isLoading, refresh: loadCharacters };
}
