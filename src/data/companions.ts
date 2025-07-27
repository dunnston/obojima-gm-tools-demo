export interface Companion {
  id: string;
  name: string;
  goal: string;
  desire: string;
  disposition: string;
  quirk: string;
  companion_type_id: string;
  spirit_form?: string; // The specific form this companion takes
  image?: string;
  created_at: Date;
  updated_at: Date;
}

// Empty array for companions - users will add their own
export const companions: Companion[] = [];

// Random generation tables from the PDF
export const goalTable = [
  "Acquire a specific mundane item",
  "Achieve recognition or fame",
  "Become a parent or mentor to someone",
  "Become a teacher of their skill or trade",
  "Become famous",
  "Become the assistant of a specific humanoid",
  "Become wealthy",
  "Collect a specific type of object",
  "Create a specific type of item",
  "Defeat a specific type of creature",
  "Discover a specific place",
  "Eat a specific type of food",
  "Find a traveling companion",
  "Find their lost family",
  "Keep a specific secret",
  "Learn a new language",
  "Overcome a specific fear",
  "Perform a specific song or dance",
  "See a specific sight",
  "Win over a specific person"
];

export const desireTable = [
  "Affection from others",
  "Alone time",
  "Answers to a specific question",
  "Being in charge",
  "Clean spaces and organization",
  "Competition and challenges",
  "Compliments and validation",
  "Conversation with others",
  "Experiencing new things",
  "Giving or receiving gifts",
  "Good reputation or fame",
  "New possessions",
  "Physical challenges or exercise",
  "Privacy and secrets",
  "Quality sleep and comfort",
  "Respect from others",
  "Routine and predictability",
  "Sensory pleasures (taste, touch, etc.)",
  "Quiet and peace",
  "Understanding others"
];

export const dispositionTable = [
  "Bitter",
  "Carefree",
  "Cheerful",
  "Cowardly",
  "Curious",
  "Cynical",
  "Defiant",
  "Friendly",
  "Grumpy",
  "Hopeful",
  "Impatient",
  "Lazy",
  "Loyal",
  "Nervous",
  "Optimistic",
  "Pessimistic",
  "Protective",
  "Shy",
  "Suspicious",
  "Wise"
];

export const quirkTable = [
  "Always wants to be touching someone or something",
  "Believes they are older (or younger) than they really are",
  "Can only sleep in small, enclosed spaces",
  "Constantly predicts the weather incorrectly",
  "Hums or sings constantly",
  "Insists on leading when following would be better",
  "Makes up elaborate stories about mundane objects",
  "Never admits to being wrong",
  "Only speaks in questions",
  "Repeats the last word other people say"
];

// Helper functions
export const getCompanionById = (id: string): Companion | undefined => {
  return companions.find(companion => companion.id === id);
};

export const searchCompanions = (query: string): Companion[] => {
  const lowercaseQuery = query.toLowerCase();
  return companions.filter(companion => 
    companion.name.toLowerCase().includes(lowercaseQuery) ||
    companion.goal.toLowerCase().includes(lowercaseQuery) ||
    companion.desire.toLowerCase().includes(lowercaseQuery) ||
    companion.disposition.toLowerCase().includes(lowercaseQuery) ||
    companion.quirk.toLowerCase().includes(lowercaseQuery)
  );
};

// Random generation functions
export const generateRandomGoal = (): string => {
  return goalTable[Math.floor(Math.random() * goalTable.length)];
};

export const generateRandomDesire = (): string => {
  return desireTable[Math.floor(Math.random() * desireTable.length)];
};

export const generateRandomDisposition = (): string => {
  return dispositionTable[Math.floor(Math.random() * dispositionTable.length)];
};

export const generateRandomQuirk = (): string => {
  return quirkTable[Math.floor(Math.random() * quirkTable.length)];
};

export const generateRandomCompanionTraits = () => {
  return {
    goal: generateRandomGoal(),
    desire: generateRandomDesire(),
    disposition: generateRandomDisposition(),
    quirk: generateRandomQuirk()
  };
};