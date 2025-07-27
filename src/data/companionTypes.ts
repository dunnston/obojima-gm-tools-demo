export interface CompanionTypeAbilityScores {
  STR: number;
  DEX: number;
  CON: number;
  INT: number;
  WIS: number;
  CHA: number;
}

export interface CompanionTypeSpeed {
  walk?: string;
  fly?: string;
  swim?: string;
  climb?: string;
  hover?: boolean;
}

export interface CompanionTypeTrait {
  name: string;
  description: string;
}

export interface CompanionTypeAction {
  name: string;
  description: string;
  attack_bonus?: number;
  damage_dice?: string;
  damage_type?: string;
  range?: string;
  spell_save_dc?: number;
}

export interface CompanionType {
  id: string;
  name: string;
  spirit_form: string;
  spirit_forms?: string[]; // Array of possible forms this spirit can take
  image?: string;
  size: string;
  type: string;
  alignment: string;
  armor_class: number;
  hit_points: string;
  speed: CompanionTypeSpeed;
  ability_scores: CompanionTypeAbilityScores;
  skills?: string[];
  senses: string[];
  damage_immunities?: string[];
  condition_immunities?: string[];
  languages: string[];
  challenge_rating: string;
  proficiency_bonus: number;
  traits: CompanionTypeTrait[];
  actions: CompanionTypeAction[];
  created_at: Date;
  updated_at: Date;
}

// Companion Types from the PDF
export const companionTypes: CompanionType[] = [
  {
    id: "animated_object_spirit",
    name: "Animated Object Spirit",
    spirit_form: "Tiny Spirit",
    spirit_forms: ["Action Figure", "Candle", "Glove", "Hovering Mask", "Pocket Video Game", "Stuffed Animal"],
    size: "Tiny",
    type: "Spirit",
    alignment: "Any Alignment",
    armor_class: 12,
    hit_points: "21 (6d4 + 6)",
    speed: {
      walk: "0 ft.",
      fly: "30 ft.",
      hover: true
    },
    ability_scores: {
      STR: 7,
      DEX: 13,
      CON: 12,
      INT: 14,
      WIS: 13,
      CHA: 10
    },
    skills: ["Insight +5", "Investigation +4", "Stealth +5"],
    senses: ["Passive Perception 11"],
    damage_immunities: ["Poison"],
    condition_immunities: ["Poisoned"],
    languages: ["Common", "Torum"],
    challenge_rating: "1/2 (100 XP)",
    proficiency_bonus: 2,
    traits: [
      {
        name: "False Appearance",
        description: "If the spirit is motionless at the start of combat, it has advantage on its initiative roll. Moreover, if a creature hasn't observed the spirit move or act, that creature must succeed on a DC 18 Intelligence (Investigation) check to discern that the spirit isn't an object."
      },
      {
        name: "New Form (1/Day)",
        description: "When the spirit is reduced to 0 hit points but not killed outright, it can choose a different object it can see within 10 feet of it and send its consciousness into that object. After it does so, it drops to 1 hit point instead."
      }
    ],
    actions: [
      {
        name: "Slam",
        description: "Melee Weapon Attack: +3 to hit, reach 5 ft., one target. Hit: 4 (1d6 + 1) bludgeoning damage.",
        attack_bonus: 3,
        damage_dice: "1d6 + 1",
        damage_type: "bludgeoning"
      },
      {
        name: "Telekinetic Reach",
        description: "The spirit casts the Mage Hand cantrip. When it does so, the spectral hand created by the spell is invisible."
      }
    ],
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: "aquatic_beast_spirit",
    name: "Aquatic Beast Spirit", 
    spirit_form: "Tiny Spirit",
    spirit_forms: ["Goldfish", "Hermit Crab", "Small Octopus", "Swimming Otter", "Tiny Shark", "Young Sea Turtle"],
    size: "Tiny",
    type: "Spirit",
    alignment: "Any Alignment",
    armor_class: 12,
    hit_points: "27 (6d4 + 12)",
    speed: {
      walk: "0 ft.",
      fly: "30 ft.",
      swim: "40 ft.",
      hover: true
    },
    ability_scores: {
      STR: 12,
      DEX: 12,
      CON: 14,
      INT: 8,
      WIS: 10,
      CHA: 4
    },
    skills: ["Intimidation +1", "Nature +1", "Persuasion +1"],
    senses: ["Darkvision 60 ft.", "Passive Perception 10"],
    languages: ["Common", "Torum"],
    challenge_rating: "1/2 (100 XP)",
    proficiency_bonus: 2,
    traits: [],
    actions: [
      {
        name: "Bite, Pinch, or Sting",
        description: "Melee Weapon Attack: +3 to hit, reach 5 ft., one target. Hit: 5 (1d8 + 1) piercing damage.",
        attack_bonus: 3,
        damage_dice: "1d8 + 1",
        damage_type: "piercing"
      },
      {
        name: "Bubble Lift (1/Day)",
        description: "The spirit casts the Bubble Lift spell, using Wisdom as its spellcasting ability."
      }
    ],
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: "beast_spirit",
    name: "Beast Spirit",
    spirit_form: "Tiny Spirit",
    spirit_forms: ["Ferret", "Honey Badger", "Kitten", "Monkey", "Puppy", "Raccoon"],
    size: "Tiny",
    type: "Spirit",
    alignment: "Any Alignment",
    armor_class: 12,
    hit_points: "18 (4d4 + 8)",
    speed: {
      walk: "30 ft.",
      climb: "30 ft."
    },
    ability_scores: {
      STR: 12,
      DEX: 14,
      CON: 14,
      INT: 8,
      WIS: 12,
      CHA: 11
    },
    skills: ["Acrobatics +4", "Stealth +4", "Sleight of Hand +4"],
    senses: ["Darkvision 30 ft.", "Passive Perception 11"],
    languages: ["Common", "Torum"],
    challenge_rating: "1/2 (104 XP)",
    proficiency_bonus: 2,
    traits: [],
    actions: [
      {
        name: "Multiattack",
        description: "The spirit makes two attacks."
      },
      {
        name: "Chomp",
        description: "Melee Weapon Attack: +4 to hit, reach 5 ft., one target. Hit: 5 (1d6 + 2) piercing damage.",
        attack_bonus: 4,
        damage_dice: "1d6 + 2", 
        damage_type: "piercing"
      },
      {
        name: "Scratch",
        description: "Melee Weapon Attack: +4 to hit, reach 5 ft., one target. Hit: 7 (2d4 + 2) slashing damage.",
        attack_bonus: 4,
        damage_dice: "2d4 + 2",
        damage_type: "slashing"
      }
    ],
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: "flying_beast_spirit",
    name: "Flying Beast Spirit",
    spirit_form: "Tiny Spirit",
    spirit_forms: ["Bat", "Flying Monkey", "Flying Squirrel", "Owl", "Parrot", "Raven"],
    size: "Tiny", 
    type: "Spirit",
    alignment: "Any Alignment",
    armor_class: 12,
    hit_points: "17 (5d4 + 5)",
    speed: {
      walk: "15 ft.",
      fly: "40 ft."
    },
    ability_scores: {
      STR: 12,
      DEX: 16,
      CON: 12,
      INT: 8,
      WIS: 13,
      CHA: 10
    },
    skills: ["Perception +5", "Stealth +5"],
    senses: ["Darkvision 120 ft.", "Passive Perception 15"],
    languages: ["Common", "Torum"],
    challenge_rating: "1/4 (50 XP)",
    proficiency_bonus: 2,
    traits: [
      {
        name: "A Tinge Lucky (1/Day)",
        description: "The spirit can choose to grant itself advantage on one attack roll, ability check, or saving throw it makes."
      }
    ],
    actions: [
      {
        name: "Scratch",
        description: "Melee Weapon Attack: +5 to hit, reach 5 ft., one target. Hit: 10 (2d6 + 3) slashing damage.",
        attack_bonus: 5,
        damage_dice: "2d6 + 3",
        damage_type: "slashing"
      }
    ],
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: "elemental_spirit",
    name: "Elemental Spirit",
    spirit_form: "Tiny Spirit",
    spirit_forms: ["Mud Mephit", "Spark Mephit", "Steam Mephit", "Splinter Mephit", "Stone Mephit", "Swirl Mephit"],
    size: "Tiny",
    type: "Spirit", 
    alignment: "Any Alignment",
    armor_class: 13,
    hit_points: "31 (7d4 + 14)",
    speed: {
      walk: "30 ft.",
      fly: "30 ft.",
      swim: "40 ft.",
      hover: true
    },
    ability_scores: {
      STR: 14,
      DEX: 14,
      CON: 14,
      INT: 10,
      WIS: 8,
      CHA: 4
    },
    skills: ["Athletics +4", "Survival +3"],
    senses: ["Blindsight 30 ft.", "Passive Perception 9"],
    languages: ["Common", "Torum"],
    challenge_rating: "1/2 (100 XP)",
    proficiency_bonus: 2,
    traits: [],
    actions: [
      {
        name: "Smack",
        description: "Melee Weapon Attack: +4 to hit, reach 5 ft., one target. Hit: 7 (1d10 + 2) damage of the type associated with the spirit.",
        attack_bonus: 4,
        damage_dice: "1d10 + 2",
        damage_type: "variable"
      },
      {
        name: "Duplicate (1/Day)",
        description: "The spirit casts the Duplicate spell (spell save DC 10), using Intelligence as its spellcasting ability, requiring no material components.",
        spell_save_dc: 10
      }
    ],
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: "spectral_spirit", 
    name: "Spectral Spirit",
    spirit_form: "Tiny Spirit",
    spirit_forms: ["Ancestral Protector", "Spectral Cat", "Spectral Hound", "Spectral Raven", "Tiny Ghost", "Wisp"],
    size: "Tiny",
    type: "Spirit",
    alignment: "Any Alignment", 
    armor_class: 12,
    hit_points: "21 (6d4 + 6)",
    speed: {
      walk: "0 ft.",
      fly: "30 ft.",
      hover: true
    },
    ability_scores: {
      STR: 10,
      DEX: 13,
      CON: 13,
      INT: 10,
      WIS: 10,
      CHA: 9
    },
    skills: ["Arcana +2", "Deception +3", "Persuasion +3"],
    senses: ["Darkvision 30 ft.", "Passive Perception 10"],
    languages: ["Common", "Torum"],
    challenge_rating: "1/2 (100 XP)",
    proficiency_bonus: 2,
    traits: [
      {
        name: "Incorporeal Movement",
        description: "The spirit can move through other creatures and objects as if they were difficult terrain. It takes 5 (1d10) force damage if it ends its turn inside an object."
      },
      {
        name: "Spiritual Sight",
        description: "The spirit can see 60 feet into the Spirit Realm (Ethereal Plane) when it is on the Physical Realm, and vice versa."
      }
    ],
    actions: [
      {
        name: "Spectral Pass",
        description: "Melee Weapon Attack: +3 to hit, reach 5 ft., one target. Hit: 4 (1d6 + 1) necrotic damage.",
        attack_bonus: 3,
        damage_dice: "1d6 + 1",
        damage_type: "necrotic"
      },
      {
        name: "Etherealness",
        description: "The spirit enters the Spirit Realm (Ethereal Plane) from the Physical Realm, or vice versa. It is visible on the Physical Realm while it is in the Spirit Realm, and vice versa, yet it can't affect or be affected by anything on the other plane."
      },
      {
        name: "Incorporeal Transfer",
        description: "While holding an item, the spirit can cause it to become incorporeal, allowing it to pass through other objects and creatures. If the spirit lets go of the item while inside of an object or creature, the item is shunted to the nearest unoccupied space outside of the object or creature."
      }
    ],
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: "flora_spirit",
    name: "Flora Spirit", 
    spirit_form: "Tiny Spirit",
    spirit_forms: ["Biting Flytrap", "Budding Mandrake", "Mushroom", "Potted Daisy", "Vine Blight", "Walking Cactus"],
    size: "Tiny",
    type: "Spirit",
    alignment: "Any Alignment",
    armor_class: 12,
    hit_points: "21 (6d4 + 6)",
    speed: {
      walk: "30 ft.",
      fly: "30 ft.",
      hover: true
    },
    ability_scores: {
      STR: 10,
      DEX: 15,
      CON: 12,
      INT: 12,
      WIS: 14,
      CHA: 7
    },
    skills: ["Animal Handling +4", "Medicine +4", "Nature +3", "Perception +4", "Stealth +4"],
    senses: ["Darkvision 30 ft.", "Passive Perception 14"],
    languages: ["Common", "Torum"],
    challenge_rating: "1/2 (100 XP)",
    proficiency_bonus: 2,
    traits: [
      {
        name: "Body Bite (1/Day)",
        description: "While the spirit has at least 5 hit points, a friendly creature can use a bonus action to take a bite out of the spirit. The spirit takes 1d4 piercing damage, and the creature regains a number of hit points equal to the damage taken."
      },
      {
        name: "Regeneration",
        description: "The spirit regains 2 hit points at the start of each of its turns if it has at least 1 hit point."
      }
    ],
    actions: [
      {
        name: "Push",
        description: "Melee Weapon Attack: +2 to hit, reach 5 ft., one target. Hit: 2 (1d4) bludgeoning damage.",
        attack_bonus: 2,
        damage_dice: "1d4",
        damage_type: "bludgeoning"
      },
      {
        name: "Spellcasting",
        description: "The spirit's spellcasting ability is Wisdom (spell save DC 12). The spirit can cast the following spells, requiring no material components: At will: Druidcraft, Thorn Whip (deals no damage); 1/day: Entangle",
        spell_save_dc: 12
      }
    ],
    created_at: new Date(),
    updated_at: new Date()
  }
];

// Helper functions
export const getCompanionTypeById = (id: string): CompanionType | undefined => {
  return companionTypes.find(type => type.id === id);
};

export const searchCompanionTypes = (query: string): CompanionType[] => {
  const lowercaseQuery = query.toLowerCase();
  return companionTypes.filter(type => 
    type.name.toLowerCase().includes(lowercaseQuery) ||
    type.spirit_form.toLowerCase().includes(lowercaseQuery)
  );
};