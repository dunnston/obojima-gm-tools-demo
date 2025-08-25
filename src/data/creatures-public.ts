export interface CreatureAbilityScores {
  STR: number;
  DEX: number;
  CON: number;
  INT: number;
  WIS: number;
  CHA: number;
}

export interface CreatureSpeed {
  walk?: string;
  fly?: string;
  swim?: string;
  climb?: string;
  burrow?: string;
}

export interface CreatureSenses {
  darkvision?: string;
  truesight?: string;
  passive_perception: number | string;
}

export interface CreatureSkills {
  [skill: string]: number | string;
}

export interface CreatureSavingThrows {
  [ability: string]: number;
}

export interface CreatureTrait {
  name: string;
  description: string;
}

export interface CreatureAction {
  name: string;
  description: string;
}

export interface Creature {
  name: string;
  size: string;
  type: string;
  alignment: string;
  armor_class: number;
  hit_points: string;
  speed: CreatureSpeed;
  ability_scores: CreatureAbilityScores;
  skills?: CreatureSkills;
  saving_throws?: CreatureSavingThrows;
  damage_resistances?: string[];
  damage_immunities?: string[];
  damage_vulnerabilities?: string[];
  condition_immunities?: string[];
  senses: CreatureSenses;
  languages: string[];
  challenge_rating: number;
  proficiency_bonus: number;
  traits?: CreatureTrait[];
  actions?: CreatureAction[];
  bonus_actions?: CreatureAction[];
  reactions?: CreatureAction[];
  legendary_actions?: CreatureAction[];
}

export interface Encounter {
  id: string;
  name: string;
  description?: string;
  creatures: {
    creature: Creature;
    count: number;
    notes?: string;
  }[];
  difficulty?: string;
  environment?: string;
  created_at: Date;
  updated_at: Date;
}

// Public creatures data - only includes Yokario and any custom creatures
export const creatures: Creature[] = [
  {
    name: "Yokario",
    size: "Small",
    type: "Humanoid (Yokario)",
    alignment: "Neutral",
    armor_class: 14,
    hit_points: "13 (3d6 + 3)",
    speed: {
      walk: "30 ft."
    },
    ability_scores: {
      STR: 10,
      DEX: 14,
      CON: 12,
      INT: 10,
      WIS: 8,
      CHA: 8
    },
    skills: {
      Performance: 3
    },
    senses: {
      darkvision: "60 ft.",
      passive_perception: 9
    },
    languages: [
      "Common"
    ],
    challenge_rating: 0.25,
    proficiency_bonus: 2,
    traits: [
      {
        name: "Drum Line",
        description: "If the Yokario makes an attack against a creature that has been hit by one of its allies' Drum Mallets since the end of the Yokario's last turn, its Drum Mallet has an attack bonus of +6 instead of +4."
      }
    ],
    actions: [
      {
        name: "Drum Mallet",
        description: "Melee Weapon Attack: +4 to hit (or +6 with Drum Line), reach 5 ft., one target. Hit: 5 (1d6 + 2) bludgeoning damage."
      },
      {
        name: "Sling",
        description: "Ranged Weapon Attack: +4 to hit, range 30/120 ft., one target. Hit: 4 (1d4 + 2) bludgeoning damage."
      }
    ]
  }
];

// Helper functions
export const getCreatureByName = (name: string): Creature | undefined => {
  return creatures.find(creature => creature.name === name);
};

export const getCreaturesByType = (type: string): Creature[] => {
  return creatures.filter(creature => creature.type.toLowerCase().includes(type.toLowerCase()));
};

export const getCreaturesByCR = (challengeRating: number): Creature[] => {
  return creatures.filter(creature => creature.challenge_rating === challengeRating);
};