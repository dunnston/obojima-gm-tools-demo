// Image mapping for potions and ingredients
// This maps item names to their specific image files when available

import { combatPotions, utilityPotions, whimsyPotions } from '@/data/potions';
import { ingredients } from '@/data/ingredients';

// Extract Google Drive ID from URL
function extractGoogleDriveId(url: string): string | null {
  const match = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  return match ? match[1] : null;
}

// Generate mapping for potions that have specific images
export const potionImageMap = new Map<string, string>();
export const ingredientImageMap = new Map<string, string>();

// Build potion image mapping
const allPotions = [...combatPotions, ...utilityPotions, ...whimsyPotions];
allPotions.forEach(potion => {
  if (potion.imageUrl) {
    const driveId = extractGoogleDriveId(potion.imageUrl);
    if (driveId) {
      // For now, we'll use the Google Drive URL until images are downloaded
      // In the future, this would map to local files like: `/images/potions/${potion-name}.jpg`
      potionImageMap.set(potion.name.toLowerCase(), potion.imageUrl);
    }
  }
});

// Build ingredient image mapping
ingredients.forEach(ingredient => {
  if (ingredient.imageUrl) {
    const driveId = extractGoogleDriveId(ingredient.imageUrl);
    if (driveId) {
      ingredientImageMap.set(ingredient.name.toLowerCase(), ingredient.imageUrl);
    }
  }
});

// Local file caches to track uploaded images
const localIngredientFiles = new Set<string>();
const localPotionFiles = new Set<string>();
const localCreatureFiles = new Set<string>();
const localMagicItemFiles = new Set<string>();

// Functions to add locally uploaded files to the cache
export function addLocalIngredientFile(ingredientName: string, extension: string) {
  const cleanName = ingredientName.toLowerCase().replace(/[^a-z0-9]/g, '-');
  localIngredientFiles.add(`${cleanName}.${extension}`);
}

export function addLocalPotionFile(potionName: string, extension: string) {
  const cleanName = potionName.toLowerCase().replace(/[^a-z0-9]/g, '-');
  localPotionFiles.add(`${cleanName}.${extension}`);
}

export function addLocalCreatureFile(creatureName: string, extension: string) {
  const cleanName = creatureName.toLowerCase().replace(/[^a-z0-9]/g, '-');
  const filename = `${cleanName}.${extension}`;
  localCreatureFiles.add(filename);
  
  // Also add with original name (with spaces) for better matching
  const originalFilename = `${creatureName}.${extension}`;
  localCreatureFiles.add(originalFilename);
  
  // Persist to localStorage
  if (typeof window !== 'undefined') {
    const savedFiles = JSON.parse(localStorage.getItem('localCreatureFiles') || '[]');
    if (!savedFiles.includes(filename)) {
      savedFiles.push(filename);
    }
    if (!savedFiles.includes(originalFilename)) {
      savedFiles.push(originalFilename);
    }
    localStorage.setItem('localCreatureFiles', JSON.stringify(savedFiles));
  }
}

export function addLocalMagicItemFile(magicItemName: string, extension: string) {
  const cleanName = magicItemName.toLowerCase().replace(/[^a-z0-9]/g, '-');
  const filename = `${cleanName}.${extension}`;
  localMagicItemFiles.add(filename);
  
  // Also add with original name (with spaces) for better matching
  const originalFilename = `${magicItemName}.${extension}`;
  localMagicItemFiles.add(originalFilename);
  
  // Persist to localStorage
  if (typeof window !== 'undefined') {
    const savedFiles = JSON.parse(localStorage.getItem('localMagicItemFiles') || '[]');
    if (!savedFiles.includes(filename)) {
      savedFiles.push(filename);
    }
    if (!savedFiles.includes(originalFilename)) {
      savedFiles.push(originalFilename);
    }
    localStorage.setItem('localMagicItemFiles', JSON.stringify(savedFiles));
  }
}

// Initialize ALL downloaded potion images
addLocalPotionFile('A New Look', 'webp');
localPotionFiles.add('A New Look.webp');
addLocalPotionFile('Animal Affinity', 'webp');
localPotionFiles.add('Animal Affinity.webp');
addLocalPotionFile('Arcane Solvent', 'webp');
localPotionFiles.add('Arcane Solvent.webp');
addLocalPotionFile('Astounding Vigor', 'webp');
localPotionFiles.add('Astounding Vigor.webp');
addLocalPotionFile('Audio Oddity', 'webp');
localPotionFiles.add('Audio Oddity.webp');
addLocalPotionFile('Beard Brew', 'webp');
localPotionFiles.add('Beard Brew.webp');
addLocalPotionFile('Beast Hide', 'webp');
localPotionFiles.add('Beast Hide.webp');
addLocalPotionFile('beast-hide', 'webp');
localPotionFiles.add('beast-hide.webp');
addLocalPotionFile('Blessing of the Moon Spirit', 'webp');
localPotionFiles.add('Blessing of the Moon Spirit.webp');
addLocalPotionFile('Bottled Bind', 'webp');
localPotionFiles.add('Bottled Bind.webp');
addLocalPotionFile('Bottled Bomb', 'webp');
localPotionFiles.add('Bottled Bomb.webp');
addLocalPotionFile('Bottled Slime', 'webp');
localPotionFiles.add('Bottled Slime.webp');
addLocalPotionFile('Bottled Torch', 'webp');
localPotionFiles.add('Bottled Torch.webp');
addLocalPotionFile('bottled-bomb', 'webp');
localPotionFiles.add('bottled-bomb.webp');
addLocalPotionFile('Bowark\'s Bombastic Beer', 'webp');
localPotionFiles.add('Bowark\'s Bombastic Beer.webp');
addLocalPotionFile('Breakfast in a Bottle', 'webp');
localPotionFiles.add('Breakfast in a Bottle.webp');
addLocalPotionFile('Brute Brew', 'webp');
localPotionFiles.add('Brute Brew.webp');
addLocalPotionFile('Bubble Message', 'webp');
localPotionFiles.add('Bubble Message.webp');
addLocalPotionFile('Candlecap', 'webp');
localPotionFiles.add('Candlecap.webp');
addLocalPotionFile('Carbonated Snake', 'webp');
localPotionFiles.add('Carbonated Snake.webp');
addLocalPotionFile('Carla Cackletooth\'s Corruption Cocktail', 'webp');
localPotionFiles.add('Carla Cackletooth\'s Corruption Cocktail.webp');
addLocalPotionFile('Cat\'s Eye', 'webp');
localPotionFiles.add('Cat\'s Eye.webp');
addLocalPotionFile('Catspeed', 'webp');
localPotionFiles.add('Catspeed.webp');
addLocalPotionFile('Cave Diver', 'webp');
localPotionFiles.add('Cave Diver.webp');
addLocalPotionFile('Chicken Chaser', 'webp');
localPotionFiles.add('Chicken Chaser.webp');
addLocalPotionFile('Cinderskin', 'webp');
localPotionFiles.add('Cinderskin.webp');
addLocalPotionFile('Claws of the Crab King', 'webp');
localPotionFiles.add('Claws of the Crab King.webp');
addLocalPotionFile('Crafter\'s Brew', 'webp');
localPotionFiles.add('Crafter\'s Brew.webp');
addLocalPotionFile('Crystal Clear', 'webp');
localPotionFiles.add('Crystal Clear.webp');
addLocalPotionFile('Dancing Feet', 'webp');
localPotionFiles.add('Dancing Feet.webp');
addLocalPotionFile('Dancing Juice', 'webp');
localPotionFiles.add('Dancing Juice.webp');
addLocalPotionFile('Demonskin', 'webp');
localPotionFiles.add('Demonskin.webp');
addLocalPotionFile('Detective\'s Tonic', 'webp');
localPotionFiles.add('Detective\'s Tonic.webp');
addLocalPotionFile('Disappearing Act', 'webp');
localPotionFiles.add('Disappearing Act.webp');
addLocalPotionFile('Displacement Field', 'webp');
localPotionFiles.add('Displacement Field.webp');
addLocalPotionFile('displacement-field', 'webp');
localPotionFiles.add('displacement-field.webp');
addLocalPotionFile('Don\'t Eat Dirt', 'webp');
localPotionFiles.add('Don\'t Eat Dirt.webp');
addLocalPotionFile('Don\'t Hit Me Juice', 'webp');
localPotionFiles.add('Don\'t Hit Me Juice.webp');
addLocalPotionFile('Dragon Frog Transmutation', 'webp');
localPotionFiles.add('Dragon Frog Transmutation.webp');
addLocalPotionFile('Duck Foot', 'webp');
localPotionFiles.add('Duck Foot.webp');
addLocalPotionFile('Duko the Trickster\'s Elixir', 'webp');
localPotionFiles.add('Duko the Trickster\'s Elixir.webp');
addLocalPotionFile('Durability', 'webp');
localPotionFiles.add('Durability.webp');
addLocalPotionFile('Eagle\'s Vision', 'webp');
localPotionFiles.add('Eagle\'s Vision.webp');
addLocalPotionFile('eagle-s-vision', 'webp');
localPotionFiles.add('eagle-s-vision.webp');
addLocalPotionFile('Elder Elixir', 'webp');
localPotionFiles.add('Elder Elixir.webp');
addLocalPotionFile('Elixir of Echoes', 'webp');
localPotionFiles.add('Elixir of Echoes.webp');
addLocalPotionFile('Elixir of Jipampa', 'webp');
localPotionFiles.add('Elixir of Jipampa.webp');
addLocalPotionFile('Elixir of Omnimind', 'webp');
localPotionFiles.add('Elixir of Omnimind.webp');
addLocalPotionFile('Enhanced Bottled Bomb', 'webp');
localPotionFiles.add('Enhanced Bottled Bomb.webp');
addLocalPotionFile('Enhanced Lightning Breath', 'webp');
localPotionFiles.add('Enhanced Lightning Breath.webp');
addLocalPotionFile('Enhanced Static Shock', 'webp');
localPotionFiles.add('Enhanced Static Shock.webp');
addLocalPotionFile('Epic Bottled Bomb', 'webp');
localPotionFiles.add('Epic Bottled Bomb.webp');
addLocalPotionFile('Essence of Great Rivers', 'webp');
localPotionFiles.add('Essence of Great Rivers.webp');
addLocalPotionFile('Essence of The River Spirit', 'webp');
localPotionFiles.add('Essence of The River Spirit.webp');
addLocalPotionFile('Essence of Umami', 'webp');
localPotionFiles.add('Essence of Umami.webp');
addLocalPotionFile('Eyes of Akibu', 'webp');
localPotionFiles.add('Eyes of Akibu.webp');
addLocalPotionFile('Face of Fugari', 'webp');
localPotionFiles.add('Face of Fugari.webp');
addLocalPotionFile('Fire Shield', 'webp');
localPotionFiles.add('Fire Shield.webp');
addLocalPotionFile('Flip and Skip', 'webp');
localPotionFiles.add('Flip and Skip.webp');
addLocalPotionFile('Gardener\'s Solution', 'webp');
localPotionFiles.add('Gardener\'s Solution.webp');
addLocalPotionFile('Gargoyle Hooch', 'webp');
localPotionFiles.add('Gargoyle Hooch.webp');
addLocalPotionFile('Glowskin', 'webp');
localPotionFiles.add('Glowskin.webp');
addLocalPotionFile('Gobble Gunk', 'webp');
localPotionFiles.add('Gobble Gunk.webp');
addLocalPotionFile('Grand Friendship', 'webp');
localPotionFiles.add('Grand Friendship.webp');
addLocalPotionFile('Grandma\'s Turnip Soup', 'webp');
localPotionFiles.add('Grandma\'s Turnip Soup.webp');
addLocalPotionFile('Healing Gas', 'webp');
localPotionFiles.add('Healing Gas.webp');
addLocalPotionFile('Herbalists Aid', 'webp');
localPotionFiles.add('Herbalists Aid.webp');
addLocalPotionFile('Hero\'s Blade', 'webp');
localPotionFiles.add('Hero\'s Blade.webp');
addLocalPotionFile('Heroism', 'webp');
localPotionFiles.add('Heroism.webp');
addLocalPotionFile('Hidden Hand', 'webp');
localPotionFiles.add('Hidden Hand.webp');
addLocalPotionFile('Hindsight', 'webp');
localPotionFiles.add('Hindsight.webp');
addLocalPotionFile('Homegrown', 'webp');
localPotionFiles.add('Homegrown.webp');
addLocalPotionFile('Homeward Tonic', 'webp');
localPotionFiles.add('Homeward Tonic.webp');
addLocalPotionFile('Hsirebbig', 'webp');
localPotionFiles.add('Hsirebbig.webp');
addLocalPotionFile('Hunter\'s Speed', 'webp');
localPotionFiles.add('Hunter\'s Speed.webp');
addLocalPotionFile('Illusion in a Bottle', 'webp');
localPotionFiles.add('Illusion in a Bottle.webp');
addLocalPotionFile('Incoming!', 'webp');
localPotionFiles.add('Incoming!.webp');
addLocalPotionFile('Incredible Luck', 'webp');
localPotionFiles.add('Incredible Luck.webp');
addLocalPotionFile('Intoxicating Aroma', 'webp');
localPotionFiles.add('Intoxicating Aroma.webp');
addLocalPotionFile('Invisible Tonic', 'webp');
localPotionFiles.add('Invisible Tonic.webp');
addLocalPotionFile('Invulnerability', 'webp');
localPotionFiles.add('Invulnerability.webp');
addLocalPotionFile('Iron Belly', 'webp');
localPotionFiles.add('Iron Belly.webp');
addLocalPotionFile('Iron Mind', 'webp');
localPotionFiles.add('Iron Mind.webp');
addLocalPotionFile('Irresistible Charm', 'webp');
localPotionFiles.add('Irresistible Charm.webp');
addLocalPotionFile('Island Nectar', 'webp');
localPotionFiles.add('Island Nectar.webp');
addLocalPotionFile('Keening Voice', 'webp');
localPotionFiles.add('Keening Voice.webp');
addLocalPotionFile('Kinetic Pop', 'webp');
localPotionFiles.add('Kinetic Pop.webp');
addLocalPotionFile('Ladybug Kinship', 'webp');
localPotionFiles.add('Ladybug Kinship.webp');
addLocalPotionFile('Language Lore', 'webp');
localPotionFiles.add('Language Lore.webp');
addLocalPotionFile('Last Resort', 'webp');
localPotionFiles.add('Last Resort.webp');
addLocalPotionFile('Life-Steal', 'webp');
localPotionFiles.add('Life-Steal.webp');
addLocalPotionFile('Lifetime Supply', 'webp');
localPotionFiles.add('Lifetime Supply.webp');
addLocalPotionFile('Lightning Breath', 'webp');
localPotionFiles.add('Lightning Breath.webp');
addLocalPotionFile('Liquid Arcana', 'webp');
localPotionFiles.add('Liquid Arcana.webp');
addLocalPotionFile('Liquid Cat', 'webp');
localPotionFiles.add('Liquid Cat.webp');
addLocalPotionFile('Liquid Disguise', 'webp');
localPotionFiles.add('Liquid Disguise.webp');
addLocalPotionFile('Liquid Dispel', 'webp');
localPotionFiles.add('Liquid Dispel.webp');
addLocalPotionFile('Liquid Lockpick', 'webp');
localPotionFiles.add('Liquid Lockpick.webp');
addLocalPotionFile('Liquid Mending', 'webp');
localPotionFiles.add('Liquid Mending.webp');
addLocalPotionFile('Lunar Elixir', 'webp');
localPotionFiles.add('Lunar Elixir.webp');
addLocalPotionFile('Machine Oil', 'webp');
localPotionFiles.add('Machine Oil.webp');
addLocalPotionFile('Manifested Nostalgia', 'webp');
localPotionFiles.add('Manifested Nostalgia.webp');
addLocalPotionFile('Many Hands', 'webp');
localPotionFiles.add('Many Hands.webp');
addLocalPotionFile('Meditative Trance', 'webp');
localPotionFiles.add('Meditative Trance.webp');
addLocalPotionFile('Melodious Bird Calls', 'webp');
localPotionFiles.add('Melodious Bird Calls.webp');
addLocalPotionFile('Merriment', 'webp');
localPotionFiles.add('Merriment.webp');
addLocalPotionFile('Mind Over Might', 'webp');
localPotionFiles.add('Mind Over Might.webp');
addLocalPotionFile('Mind Transfer', 'webp');
localPotionFiles.add('Mind Transfer.webp');
addLocalPotionFile('Mosspot', 'webp');
localPotionFiles.add('Mosspot.webp');
addLocalPotionFile('Move A Thing', 'webp');
localPotionFiles.add('Move A Thing.webp');
addLocalPotionFile('Musical Mixer', 'webp');
localPotionFiles.add('Musical Mixer.webp');
addLocalPotionFile('New Life', 'webp');
localPotionFiles.add('New Life.webp');
addLocalPotionFile('Newly Found Magic', 'webp');
localPotionFiles.add('Newly Found Magic.webp');
addLocalPotionFile('Object Embodiment', 'webp');
localPotionFiles.add('Object Embodiment.webp');
addLocalPotionFile('Oil of the Trademark Flourish', 'webp');
localPotionFiles.add('Oil of the Trademark Flourish.webp');
addLocalPotionFile('Paradise Plumage', 'webp');
localPotionFiles.add('Paradise Plumage.webp');
addLocalPotionFile('Paranoia', 'webp');
localPotionFiles.add('Paranoia.webp');
addLocalPotionFile('Passing Memory', 'webp');
localPotionFiles.add('Passing Memory.webp');
addLocalPotionFile('Pathseeking', 'webp');
localPotionFiles.add('Pathseeking.webp');
addLocalPotionFile('Perfect Memory', 'webp');
localPotionFiles.add('Perfect Memory.webp');
addLocalPotionFile('Phoenix Elixir', 'webp');
localPotionFiles.add('Phoenix Elixir.webp');
addLocalPotionFile('Photosynthetic Skin', 'webp');
localPotionFiles.add('Photosynthetic Skin.webp');
addLocalPotionFile('Pig Snout', 'webp');
localPotionFiles.add('Pig Snout.webp');
addLocalPotionFile('Pigment', 'webp');
localPotionFiles.add('Pigment.webp');
addLocalPotionFile('Pocket Portal', 'webp');
localPotionFiles.add('Pocket Portal.webp');
addLocalPotionFile('Pocket Stomach', 'webp');
localPotionFiles.add('Pocket Stomach.webp');
addLocalPotionFile('Potion of Attunement', 'webp');
localPotionFiles.add('Potion of Attunement.webp');
addLocalPotionFile('Potion of Exertion', 'webp');
localPotionFiles.add('Potion of Exertion.webp');
addLocalPotionFile('Potion of Fog', 'webp');
localPotionFiles.add('Potion of Fog.webp');
addLocalPotionFile('Potion of Freezing', 'webp');
localPotionFiles.add('Potion of Freezing.webp');
addLocalPotionFile('Potion of Healing Touch', 'webp');
localPotionFiles.add('Potion of Healing Touch.webp');
addLocalPotionFile('Potion of Holistic Wellness', 'webp');
localPotionFiles.add('Potion of Holistic Wellness.webp');
addLocalPotionFile('Potion of Reprieve', 'webp');
localPotionFiles.add('Potion of Reprieve.webp');
addLocalPotionFile('Potion of Soft Steps', 'webp');
localPotionFiles.add('Potion of Soft Steps.webp');
addLocalPotionFile('Prickleskin', 'webp');
localPotionFiles.add('Prickleskin.webp');
addLocalPotionFile('Projected Thoughts', 'webp');
localPotionFiles.add('Projected Thoughts.webp');
addLocalPotionFile('Pumpkin Patch Guard', 'webp');
localPotionFiles.add('Pumpkin Patch Guard.webp');
addLocalPotionFile('Rabbit\'s Speed', 'webp');
localPotionFiles.add('Rabbit\'s Speed.webp');
addLocalPotionFile('rabbit-s-speed', 'webp');
localPotionFiles.add('rabbit-s-speed.webp');
addLocalPotionFile('Rapid Withdrawal', 'webp');
localPotionFiles.add('Rapid Withdrawal.webp');
addLocalPotionFile('Ratatam\'s Glowskin Elixir', 'webp');
localPotionFiles.add('Ratatam\'s Glowskin Elixir.webp');
addLocalPotionFile('Respiratory Distress', 'webp');
localPotionFiles.add('Respiratory Distress.webp');
addLocalPotionFile('Rubberskin', 'webp');
localPotionFiles.add('Rubberskin.webp');
addLocalPotionFile('Secret Path', 'webp');
localPotionFiles.add('Secret Path.webp');
addLocalPotionFile('Seeking Smoke', 'webp');
localPotionFiles.add('Seeking Smoke.webp');
addLocalPotionFile('Sensorius Maximus', 'webp');
localPotionFiles.add('Sensorius Maximus.webp');
addLocalPotionFile('Severed Reaction', 'webp');
localPotionFiles.add('Severed Reaction.webp');
addLocalPotionFile('Shadow Child', 'webp');
localPotionFiles.add('Shadow Child.webp');
addLocalPotionFile('Shadow Puppet', 'webp');
localPotionFiles.add('Shadow Puppet.webp');
addLocalPotionFile('Sharp Mind', 'webp');
localPotionFiles.add('Sharp Mind.webp');
addLocalPotionFile('Sheep Dragon Brew', 'webp');
localPotionFiles.add('Sheep Dragon Brew.webp');
addLocalPotionFile('Shepherd\'s Bane', 'webp');
localPotionFiles.add('Shepherd\'s Bane.webp');
addLocalPotionFile('Simulacrum Elixir', 'webp');
localPotionFiles.add('Simulacrum Elixir.webp');
addLocalPotionFile('Sky Swimming', 'webp');
localPotionFiles.add('Sky Swimming.webp');
addLocalPotionFile('Slugskin', 'webp');
localPotionFiles.add('Slugskin.webp');
addLocalPotionFile('Soft Paw', 'webp');
localPotionFiles.add('Soft Paw.webp');
addLocalPotionFile('Spirit Appendage', 'webp');
localPotionFiles.add('Spirit Appendage.webp');
addLocalPotionFile('Spirit Armor', 'webp');
localPotionFiles.add('Spirit Armor.webp');
addLocalPotionFile('Spirit of Salyri', 'webp');
localPotionFiles.add('Spirit of Salyri.webp');
addLocalPotionFile('Spirit Repellent', 'webp');
localPotionFiles.add('Spirit Repellent.webp');
addLocalPotionFile('Spirit Sweets', 'webp');
localPotionFiles.add('Spirit Sweets.webp');
addLocalPotionFile('Spiritual Rebuke', 'webp');
localPotionFiles.add('Spiritual Rebuke.webp');
addLocalPotionFile('Static Shock', 'webp');
localPotionFiles.add('Static Shock.webp');
addLocalPotionFile('Stink Brew', 'webp');
localPotionFiles.add('Stink Brew.webp');
addLocalPotionFile('Super Singing', 'webp');
localPotionFiles.add('Super Singing.webp');
addLocalPotionFile('Thunderbelch', 'webp');
localPotionFiles.add('Thunderbelch.webp');
addLocalPotionFile('Tiny Bubbles', 'webp');
localPotionFiles.add('Tiny Bubbles.webp');
addLocalPotionFile('Tiny Telekinesis', 'webp');
localPotionFiles.add('Tiny Telekinesis.webp');
addLocalPotionFile('Tunnel Vision', 'webp');
localPotionFiles.add('Tunnel Vision.webp');
addLocalPotionFile('Twin Telepathy', 'webp');
localPotionFiles.add('Twin Telepathy.webp');
addLocalPotionFile('Twin Vision', 'webp');
localPotionFiles.add('Twin Vision.webp');
addLocalPotionFile('Umi\'s Powerful Undertow', 'webp');
localPotionFiles.add('Umi\'s Powerful Undertow.webp');
addLocalPotionFile('Uncanny Focus', 'webp');
localPotionFiles.add('Uncanny Focus.webp');
addLocalPotionFile('Unified Might', 'webp');
localPotionFiles.add('Unified Might.webp');
addLocalPotionFile('Unknown Elixir', 'webp');
localPotionFiles.add('Unknown Elixir.webp');
addLocalPotionFile('Ups-A-Daisy', 'webp');
localPotionFiles.add('Ups-A-Daisy.webp');
addLocalPotionFile('Vocal Stranger', 'webp');
localPotionFiles.add('Vocal Stranger.webp');
addLocalPotionFile('Water Breathing', 'webp');
localPotionFiles.add('Water Breathing.webp');
addLocalPotionFile('Weapon Master\'s Elixir', 'webp');
localPotionFiles.add('Weapon Master\'s Elixir.webp');
addLocalPotionFile('Witch\'s Hidden Gem', 'webp');
localPotionFiles.add('Witch\'s Hidden Gem.webp');
addLocalPotionFile('Witch\'s Lament', 'webp');
localPotionFiles.add('Witch\'s Lament.webp');
addLocalPotionFile('Withered Will', 'webp');
localPotionFiles.add('Withered Will.webp');
addLocalPotionFile('Wonder Juice', 'webp');
localPotionFiles.add('Wonder Juice.webp');
addLocalPotionFile('Wrathful Spirit', 'webp');
localPotionFiles.add('Wrathful Spirit.webp');

// Initialize ALL ingredient images
addLocalIngredientFile('Amber', 'webp');
localIngredientFiles.add('Amber.webp');
addLocalIngredientFile('apper-carrot', 'webp');
localIngredientFiles.add('apper-carrot.webp');
addLocalIngredientFile('Bamboo', 'webp');
localIngredientFiles.add('Bamboo.webp');
addLocalIngredientFile('Bashu Powder', 'webp');
localIngredientFiles.add('Bashu Powder.webp');
addLocalIngredientFile('Black Cinnamon', 'webp');
localIngredientFiles.add('Black Cinnamon.webp');
addLocalIngredientFile('Black Pearl', 'webp');
localIngredientFiles.add('Black Pearl.webp');
addLocalIngredientFile('Blossom of Spirit Vine', 'webp');
localIngredientFiles.add('Blossom of Spirit Vine.webp');
addLocalIngredientFile('Blue Back Salmon', 'webp');
localIngredientFiles.add('Blue Back Salmon.webp');
addLocalIngredientFile('Boom Beri', 'webp');
localIngredientFiles.add('Boom Beri.webp');
addLocalIngredientFile('Bora Bug', 'webp');
localIngredientFiles.add('Bora Bug.webp');
addLocalIngredientFile('Bottle Cap (Supa-Fizz!)', 'webp');
localIngredientFiles.add('Bottle Cap (Supa-Fizz!).webp');
addLocalIngredientFile('Bottled Lightning', 'webp');
localIngredientFiles.add('Bottled Lightning.webp');
addLocalIngredientFile('Brush Reed', 'webp');
localIngredientFiles.add('Brush Reed.webp');
addLocalIngredientFile('Bubble Gum', 'webp');
localIngredientFiles.add('Bubble Gum.webp');
addLocalIngredientFile('Bundle of Driko Twigs', 'webp');
localIngredientFiles.add('Bundle of Driko Twigs.webp');
addLocalIngredientFile('Camp Mite', 'webp');
localIngredientFiles.add('Camp Mite.webp');
addLocalIngredientFile('Chicken Egg', 'webp');
localIngredientFiles.add('Chicken Egg.webp');
addLocalIngredientFile('Chisuay\'s Heavenly Tea', 'webp');
localIngredientFiles.add('Chisuay\'s Heavenly Tea.webp');
addLocalIngredientFile('Clay Snake Tail', 'webp');
localIngredientFiles.add('Clay Snake Tail.webp');
addLocalIngredientFile('Cloud Horn', 'webp');
localIngredientFiles.add('Cloud Horn.webp');
addLocalIngredientFile('Coal from the Wandering Line', 'webp');
localIngredientFiles.add('Coal from the Wandering Line.webp');
addLocalIngredientFile('Corrupted Seawater', 'webp');
localIngredientFiles.add('Corrupted Seawater.webp');
addLocalIngredientFile('Crackling Jasper', 'webp');
localIngredientFiles.add('Crackling Jasper.webp');
addLocalIngredientFile('Creeping Bolete', 'webp');
localIngredientFiles.add('Creeping Bolete.webp');
addLocalIngredientFile('Crimson Octopus Ink', 'webp');
localIngredientFiles.add('Crimson Octopus Ink.webp');
addLocalIngredientFile('Dawn Petal', 'webp');
localIngredientFiles.add('Dawn Petal.webp');
addLocalIngredientFile('Dorrin Plate', 'webp');
localIngredientFiles.add('Dorrin Plate.webp');
addLocalIngredientFile('Dragon Fang of Yutro', 'webp');
localIngredientFiles.add('Dragon Fang of Yutro.webp');
addLocalIngredientFile('Dragon Root', 'webp');
localIngredientFiles.add('Dragon Root.webp');
addLocalIngredientFile('Dried Fruit', 'webp');
localIngredientFiles.add('Dried Fruit.webp');
addLocalIngredientFile('Earwax', 'webp');
localIngredientFiles.add('Earwax.webp');
addLocalIngredientFile('Essence of Glumbug', 'webp');
localIngredientFiles.add('Essence of Glumbug.webp');
addLocalIngredientFile('Essence of Ill Omen', 'webp');
localIngredientFiles.add('Essence of Ill Omen.webp');
addLocalIngredientFile('Fairy Willow', 'webp');
localIngredientFiles.add('Fairy Willow.webp');
addLocalIngredientFile('Feather Rock', 'webp');
localIngredientFiles.add('Feather Rock.webp');
addLocalIngredientFile('Fish Folk Tooth', 'webp');
localIngredientFiles.add('Fish Folk Tooth.webp');
addLocalIngredientFile('Fish Head', 'webp');
localIngredientFiles.add('Fish Head.webp');
addLocalIngredientFile('Fizzing Green', 'webp');
localIngredientFiles.add('Fizzing Green.webp');
addLocalIngredientFile('Flash Paper', 'webp');
localIngredientFiles.add('Flash Paper.webp');
addLocalIngredientFile('Forge Slag', 'webp');
localIngredientFiles.add('Forge Slag.webp');
addLocalIngredientFile('Gargoyle Powder', 'webp');
localIngredientFiles.add('Gargoyle Powder.webp');
addLocalIngredientFile('Giant Koi Fish Scale', 'webp');
localIngredientFiles.add('Giant Koi Fish Scale.webp');
addLocalIngredientFile('Glow Worms of the Vale', 'webp');
localIngredientFiles.add('Glow Worms of the Vale.webp');
addLocalIngredientFile('Gohaku Rice', 'webp');
localIngredientFiles.add('Gohaku Rice.webp');
addLocalIngredientFile('Golden Root', 'webp');
localIngredientFiles.add('Golden Root.webp');
addLocalIngredientFile('Hakuma Sapwood', 'webp');
localIngredientFiles.add('Hakuma Sapwood.webp');
addLocalIngredientFile('Hakumon\'s Ramen Broth', 'webp');
localIngredientFiles.add('Hakumon\'s Ramen Broth.webp');
addLocalIngredientFile('Hand of Eryo', 'webp');
localIngredientFiles.add('Hand of Eryo.webp');
addLocalIngredientFile('Happy Joy Cake', 'webp');
localIngredientFiles.add('Happy Joy Cake.webp');
addLocalIngredientFile('Hill Dragon Egg', 'webp');
localIngredientFiles.add('Hill Dragon Egg.webp');
addLocalIngredientFile('Howler Fur', 'webp');
localIngredientFiles.add('Howler Fur.webp');
addLocalIngredientFile('Irimbi Chrysalis', 'webp');
localIngredientFiles.add('Irimbi Chrysalis.webp');
addLocalIngredientFile('Itchi Beri', 'webp');
localIngredientFiles.add('Itchi Beri.webp');
addLocalIngredientFile('Jack-O\'-Lantern Bits', 'webp');
localIngredientFiles.add('Jack-O\'-Lantern Bits.webp');
addLocalIngredientFile('Jumping Bonfire', 'webp');
localIngredientFiles.add('Jumping Bonfire.webp');
addLocalIngredientFile('Kloth Leech', 'webp');
localIngredientFiles.add('Kloth Leech.webp');
addLocalIngredientFile('Knobble Leaf Seaweed', 'webp');
localIngredientFiles.add('Knobble Leaf Seaweed.webp');
addLocalIngredientFile('Kojo Root', 'webp');
localIngredientFiles.add('Kojo Root.webp');
addLocalIngredientFile('Kojobi Fruit', 'webp');
localIngredientFiles.add('Kojobi Fruit.webp');
addLocalIngredientFile('Laughing Moss', 'webp');
localIngredientFiles.add('Laughing Moss.webp');
addLocalIngredientFile('Lionfish Poison', 'webp');
localIngredientFiles.add('Lionfish Poison.webp');
addLocalIngredientFile('Lions Blume', 'webp');
localIngredientFiles.add('Lions Blume.webp');
addLocalIngredientFile('Living Spud', 'webp');
localIngredientFiles.add('Living Spud.webp');
addLocalIngredientFile('Lovers Vine', 'webp');
localIngredientFiles.add('Lovers Vine.webp');
addLocalIngredientFile('Magic Monk\'s Rice Wine', 'webp');
localIngredientFiles.add('Magic Monk\'s Rice Wine.webp');
addLocalIngredientFile('Mandrake Root', 'webp');
localIngredientFiles.add('Mandrake Root.webp');
addLocalIngredientFile('Mellowort', 'webp');
localIngredientFiles.add('Mellowort.webp');
addLocalIngredientFile('Molted Lizard Skin', 'webp');
localIngredientFiles.add('Molted Lizard Skin.webp');
addLocalIngredientFile('Monkey\'s Coil', 'webp');
localIngredientFiles.add('Monkey\'s Coil.webp');
addLocalIngredientFile('Mountain Ox Dung', 'webp');
localIngredientFiles.add('Mountain Ox Dung.webp');
addLocalIngredientFile('Mountain Snail', 'webp');
localIngredientFiles.add('Mountain Snail.webp');
addLocalIngredientFile('Mournshade', 'webp');
localIngredientFiles.add('Mournshade.webp');
addLocalIngredientFile('Mouse Tree Nut', 'webp');
localIngredientFiles.add('Mouse Tree Nut.webp');
addLocalIngredientFile('Mouse Tree Nut_alt', 'png');
localIngredientFiles.add('Mouse Tree Nut_alt.png');
addLocalIngredientFile('Munchanka Root', 'webp');
localIngredientFiles.add('Munchanka Root.webp');
addLocalIngredientFile('Nakudama Spice', 'webp');
localIngredientFiles.add('Nakudama Spice.webp');
addLocalIngredientFile('Narutomaki', 'webp');
localIngredientFiles.add('Narutomaki.webp');
addLocalIngredientFile('Night Thistle', 'webp');
localIngredientFiles.add('Night Thistle.webp');
addLocalIngredientFile('Nobblewort', 'webp');
localIngredientFiles.add('Nobblewort.webp');
addLocalIngredientFile('Nokumai\'s Frozen Breath', 'webp');
localIngredientFiles.add('Nokumai\'s Frozen Breath.webp');
addLocalIngredientFile('Noodle Eel', 'webp');
localIngredientFiles.add('Noodle Eel.webp');
addLocalIngredientFile('Oporion Glass', 'webp');
localIngredientFiles.add('Oporion Glass.webp');
addLocalIngredientFile('Opu Opu Spring Water', 'webp');
localIngredientFiles.add('Opu Opu Spring Water.webp');
addLocalIngredientFile('Origami Crane', 'webp');
localIngredientFiles.add('Origami Crane.webp');
addLocalIngredientFile('Ota Lantern Oil', 'webp');
localIngredientFiles.add('Ota Lantern Oil.webp');
addLocalIngredientFile('Peeping Willow', 'webp');
localIngredientFiles.add('Peeping Willow.webp');
addLocalIngredientFile('Petrified Alligator', 'webp');
localIngredientFiles.add('Petrified Alligator.webp');
addLocalIngredientFile('Pink Candle Wax', 'webp');
localIngredientFiles.add('Pink Candle Wax.webp');
addLocalIngredientFile('Plumage of a Running Kirio', 'webp');
localIngredientFiles.add('Plumage of a Running Kirio.webp');
addLocalIngredientFile('Poison', 'webp');
localIngredientFiles.add('Poison.webp');
addLocalIngredientFile('Pok Pok Flakes', 'webp');
localIngredientFiles.add('Pok Pok Flakes.webp');
addLocalIngredientFile('Pungent Sea Foam', 'webp');
localIngredientFiles.add('Pungent Sea Foam.webp');
addLocalIngredientFile('Pyramid Melon', 'webp');
localIngredientFiles.add('Pyramid Melon.webp');
addLocalIngredientFile('Queen\'s Dilemma', 'webp');
localIngredientFiles.add('Queen\'s Dilemma.webp');
addLocalIngredientFile('Raka Paste', 'webp');
localIngredientFiles.add('Raka Paste.webp');
addLocalIngredientFile('Rattle Shoot', 'webp');
localIngredientFiles.add('Rattle Shoot.webp');
addLocalIngredientFile('Ribbon Rot', 'webp');
localIngredientFiles.add('Ribbon Rot.webp');
addLocalIngredientFile('Ronin Neko Figurine', 'webp');
localIngredientFiles.add('Ronin Neko Figurine.webp');
addLocalIngredientFile('Rubble from a Rubble Golem', 'webp');
localIngredientFiles.add('Rubble from a Rubble Golem.webp');
addLocalIngredientFile('Rust Crab', 'webp');
localIngredientFiles.add('Rust Crab.webp');
addLocalIngredientFile('Sage Arol\'s Beetle', 'webp');
localIngredientFiles.add('Sage Arol\'s Beetle.webp');
addLocalIngredientFile('Scalefruit Rind', 'webp');
localIngredientFiles.add('Scalefruit Rind.webp');
addLocalIngredientFile('Scumweed', 'webp');
localIngredientFiles.add('Scumweed.webp');
addLocalIngredientFile('Sea Water', 'webp');
localIngredientFiles.add('Sea Water.webp');
addLocalIngredientFile('Seashell', 'webp');
localIngredientFiles.add('Seashell.webp');
addLocalIngredientFile('Shadowroot', 'webp');
localIngredientFiles.add('Shadowroot.webp');
addLocalIngredientFile('Sheep Dragon Wool', 'webp');
localIngredientFiles.add('Sheep Dragon Wool.webp');
addLocalIngredientFile('Sleeping Merchant', 'webp');
localIngredientFiles.add('Sleeping Merchant.webp');
addLocalIngredientFile('Slime, Corrupted', 'webp');
localIngredientFiles.add('Slime, Corrupted.webp');
addLocalIngredientFile('Slime, Green', 'webp');
localIngredientFiles.add('Slime, Green.webp');
addLocalIngredientFile('Slime, Orange', 'webp');
localIngredientFiles.add('Slime, Orange.webp');
addLocalIngredientFile('Slime, Yellow', 'webp');
localIngredientFiles.add('Slime, Yellow.webp');
addLocalIngredientFile('Snap Vine Sap', 'webp');
localIngredientFiles.add('Snap Vine Sap.webp');
addLocalIngredientFile('Spark Plug', 'webp');
localIngredientFiles.add('Spark Plug.webp');
addLocalIngredientFile('Spindle Leg Spider Webs', 'webp');
localIngredientFiles.add('Spindle Leg Spider Webs.webp');
addLocalIngredientFile('Spirit Root', 'webp');
localIngredientFiles.add('Spirit Root.webp');
addLocalIngredientFile('Spirit Tea', 'webp');
localIngredientFiles.add('Spirit Tea.webp');
addLocalIngredientFile('Spring', 'webp');
localIngredientFiles.add('Spring.webp');
addLocalIngredientFile('Squid Ink', 'webp');
localIngredientFiles.add('Squid Ink.webp');
addLocalIngredientFile('Starstone', 'webp');
localIngredientFiles.add('Starstone.webp');
addLocalIngredientFile('Sun Shroom', 'webp');
localIngredientFiles.add('Sun Shroom.webp');
addLocalIngredientFile('Tangle Weed', 'webp');
localIngredientFiles.add('Tangle Weed.webp');
addLocalIngredientFile('Tears of the Moon', 'webp');
localIngredientFiles.add('Tears of the Moon.webp');
addLocalIngredientFile('Toka Truffle', 'webp');
localIngredientFiles.add('Toka Truffle.webp');
addLocalIngredientFile('Ube', 'webp');
localIngredientFiles.add('Ube.webp');
addLocalIngredientFile('Varrow', 'webp');
localIngredientFiles.add('Varrow.webp');
addLocalIngredientFile('Venus Fly Rat', 'webp');
localIngredientFiles.add('Venus Fly Rat.webp');
addLocalIngredientFile('Vinyl Record', 'webp');
localIngredientFiles.add('Vinyl Record.webp');
addLocalIngredientFile('Windbloom', 'webp');
localIngredientFiles.add('Windbloom.webp');
addLocalIngredientFile('Witch\'s Broom', 'webp');
localIngredientFiles.add('Witch\'s Broom.webp');
addLocalIngredientFile('Witch\'s Eye Coral', 'webp');
localIngredientFiles.add('Witch\'s Eye Coral.webp');
addLocalIngredientFile('Wolfenite', 'webp');
localIngredientFiles.add('Wolfenite.webp');
addLocalIngredientFile('Wufu Whisky', 'webp');
localIngredientFiles.add('Wufu Whisky.webp');
addLocalIngredientFile('Wychwood', 'webp');
localIngredientFiles.add('Wychwood.webp');
addLocalIngredientFile('Yugi Sap', 'webp');
localIngredientFiles.add('Yugi Sap.webp');
addLocalIngredientFile('Yuma Shrub', 'webp');
localIngredientFiles.add('Yuma Shrub.webp');
addLocalIngredientFile('Yuma Shrub_alt', 'png');
localIngredientFiles.add('Yuma Shrub_alt.png');

// Initialize creature images - ALL downloaded creatures
addLocalCreatureFile('Acorn Crab', 'webp');
localCreatureFiles.add('Acorn Crab.webp');
addLocalCreatureFile('acorn-crab', 'webp');
localCreatureFiles.add('acorn-crab.webp');
addLocalCreatureFile('Akaobata', 'webp');
localCreatureFiles.add('Akaobata.webp');
addLocalCreatureFile('Animalistic Spirit', 'webp');
localCreatureFiles.add('Animalistic Spirit.webp');
addLocalCreatureFile('Animated Object Spirit', 'webp');
localCreatureFiles.add('Animated Object Spirit.webp');
addLocalCreatureFile('Aquatic Beast Spirit', 'webp');
localCreatureFiles.add('Aquatic Beast Spirit.webp');
addLocalCreatureFile('Bearracuda', 'webp');
localCreatureFiles.add('Bearracuda.webp');
addLocalCreatureFile('Beast Spirit', 'webp');
localCreatureFiles.add('Beast Spirit.webp');
addLocalCreatureFile('Bloodfin', 'png');
localCreatureFiles.add('Bloodfin.png');
addLocalCreatureFile('Blowbelly Pufferfish', 'webp');
localCreatureFiles.add('Blowbelly Pufferfish.webp');
addLocalCreatureFile('Bora Bug', 'webp');
localCreatureFiles.add('Bora Bug.webp');
addLocalCreatureFile('Cat of Prodigious Size', 'webp');
localCreatureFiles.add('Cat of Prodigious Size.webp');
addLocalCreatureFile('Clone of Viota', 'webp');
localCreatureFiles.add('Clone of Viota.webp');
addLocalCreatureFile('Corrupted Muk', 'webp');
localCreatureFiles.add('Corrupted Muk.webp');
addLocalCreatureFile('Crawler', 'webp');
localCreatureFiles.add('Crawler.webp');
addLocalCreatureFile('Cuddle Bug', 'webp');
localCreatureFiles.add('Cuddle Bug.webp');
addLocalCreatureFile('Dara', 'jpg');
localCreatureFiles.add('Dara.jpg');
addLocalCreatureFile('Deep Angler', 'webp');
localCreatureFiles.add('Deep Angler.webp');
addLocalCreatureFile('Dragon', 'webp');
localCreatureFiles.add('Dragon.webp');
addLocalCreatureFile('Dragon, Frog', 'webp');
localCreatureFiles.add('Dragon, Frog.webp');
addLocalCreatureFile('Dragon, Hill', 'webp');
localCreatureFiles.add('Dragon, Hill.webp');
addLocalCreatureFile('Dragon, Sheep', 'webp');
localCreatureFiles.add('Dragon, Sheep.webp');
addLocalCreatureFile('Dust Bunny', 'webp');
localCreatureFiles.add('Dust Bunny.webp');
addLocalCreatureFile('Elder Dragon Frog', 'webp');
localCreatureFiles.add('Elder Dragon Frog.webp');
addLocalCreatureFile('Elemental Spirit', 'webp');
localCreatureFiles.add('Elemental Spirit.webp');
addLocalCreatureFile('Field Giant', 'webp');
localCreatureFiles.add('Field Giant.webp');
addLocalCreatureFile('Fish Folk', 'webp');
localCreatureFiles.add('Fish Folk.webp');
addLocalCreatureFile('Flora Spirit', 'webp');
localCreatureFiles.add('Flora Spirit.webp');
addLocalCreatureFile('Flying Beast Spirit', 'webp');
localCreatureFiles.add('Flying Beast Spirit.webp');
addLocalCreatureFile('Giant Jellyfish', 'webp');
localCreatureFiles.add('Giant Jellyfish.webp');
addLocalCreatureFile('Giant Koi', 'webp');
localCreatureFiles.add('Giant Koi.webp');
addLocalCreatureFile('Goro Goro', 'webp');
localCreatureFiles.add('Goro Goro.webp');
addLocalCreatureFile('Hammer Gull', 'webp');
localCreatureFiles.add('Hammer Gull.webp');
addLocalCreatureFile('Harpy', 'webp');
localCreatureFiles.add('Harpy.webp');
addLocalCreatureFile('Howler', 'webp');
localCreatureFiles.add('Howler.webp');
addLocalCreatureFile('Howler, Snarler', 'webp');
localCreatureFiles.add('Howler, Snarler.webp');
addLocalCreatureFile('Howler, Stalker', 'webp');
localCreatureFiles.add('Howler, Stalker.webp');
addLocalCreatureFile('Howler, Yipper', 'webp');
localCreatureFiles.add('Howler, Yipper.webp');
addLocalCreatureFile('Jumaga', 'webp');
localCreatureFiles.add('Jumaga.webp');
addLocalCreatureFile('Kafuka', 'webp');
localCreatureFiles.add('Kafuka.webp');
addLocalCreatureFile('Lion\'s Blume', 'webp');
localCreatureFiles.add('Lion\'s Blume.webp');
addLocalCreatureFile('Lionfish King', 'webp');
localCreatureFiles.add('Lionfish King.webp');
addLocalCreatureFile('Malgrotha', 'png');
localCreatureFiles.add('Malgrotha.png');
addLocalCreatureFile('Minor Demon', 'webp');
localCreatureFiles.add('Minor Demon.webp');
addLocalCreatureFile('Morris', 'png');
localCreatureFiles.add('Morris.png');
addLocalCreatureFile('Mossling', 'webp');
localCreatureFiles.add('Mossling.webp');
addLocalCreatureFile('Pixie', 'webp');
localCreatureFiles.add('Pixie.webp');
addLocalCreatureFile('Pixie, Giant', 'webp');
localCreatureFiles.add('Pixie, Giant.webp');
addLocalCreatureFile('Postal Knight', 'webp');
localCreatureFiles.add('Postal Knight.webp');
addLocalCreatureFile('Rubble Golem', 'webp');
localCreatureFiles.add('Rubble Golem.webp');
addLocalCreatureFile('Seagull', 'png');
localCreatureFiles.add('Seagull.png');
addLocalCreatureFile('Seaweed Elemental', 'webp');
localCreatureFiles.add('Seaweed Elemental.webp');
addLocalCreatureFile('Skeletal Fish', 'webp');
localCreatureFiles.add('Skeletal Fish.webp');
addLocalCreatureFile('Sky King', 'webp');
localCreatureFiles.add('Sky King.webp');
addLocalCreatureFile('Slagger', 'webp');
localCreatureFiles.add('Slagger.webp');
addLocalCreatureFile('Slime Wisps', 'png');
localCreatureFiles.add('Slime Wisps.png');
addLocalCreatureFile('Slime, Green', 'webp');
localCreatureFiles.add('Slime, Green.webp');
addLocalCreatureFile('Slime, Soda', 'webp');
localCreatureFiles.add('Slime, Soda.webp');
addLocalCreatureFile('Sludge-Touched Sentinel', 'png');
localCreatureFiles.add('Sludge-Touched Sentinel.png');
addLocalCreatureFile('Slurpgill', 'png');
localCreatureFiles.add('Slurpgill.png');
addLocalCreatureFile('Snowball Spirits', 'webp');
localCreatureFiles.add('Snowball Spirits.webp');
addLocalCreatureFile('Spirit', 'webp');
localCreatureFiles.add('Spirit.webp');
addLocalCreatureFile('Stone Whale', 'webp');
localCreatureFiles.add('Stone Whale.webp');
addLocalCreatureFile('Stul', 'webp');
localCreatureFiles.add('Stul.webp');
addLocalCreatureFile('The Hunter', 'webp');
localCreatureFiles.add('The Hunter.webp');
addLocalCreatureFile('Urugama', 'webp');
localCreatureFiles.add('Urugama.webp');
addLocalCreatureFile('Venus Fly Rat', 'webp');
localCreatureFiles.add('Venus Fly Rat.webp');
addLocalCreatureFile('Vespoma', 'webp');
localCreatureFiles.add('Vespoma.webp');
addLocalCreatureFile('Vile Corruption', 'webp');
localCreatureFiles.add('Vile Corruption.webp');
addLocalCreatureFile('Voraro the Parasite', 'webp');
localCreatureFiles.add('Voraro the Parasite.webp');
addLocalCreatureFile('Wandering Door', 'webp');
localCreatureFiles.add('Wandering Door.webp');
addLocalCreatureFile('Watchwood Tree', 'webp');
localCreatureFiles.add('Watchwood Tree.webp');
addLocalCreatureFile('Witch', 'webp');
localCreatureFiles.add('Witch.webp');
addLocalCreatureFile('Yokario', 'webp');
localCreatureFiles.add('Yokario.webp');

// Initialize ALL magic item images
addLocalMagicItemFile('Anglerfish Helm', 'webp');
localMagicItemFiles.add('Anglerfish Helm.webp');
addLocalMagicItemFile('Baffled Candle', 'webp');
localMagicItemFiles.add('Baffled Candle.webp');
addLocalMagicItemFile('Bell of Resonance', 'webp');
localMagicItemFiles.add('Bell of Resonance.webp');
addLocalMagicItemFile('Boots of the Stampede', 'webp');
localMagicItemFiles.add('Boots of the Stampede.webp');
addLocalMagicItemFile('Burnright Brand Hair Dryer', 'webp');
localMagicItemFiles.add('Burnright Brand Hair Dryer.webp');
addLocalMagicItemFile('Canseco Bat', 'webp');
localMagicItemFiles.add('Canseco Bat.webp');
addLocalMagicItemFile('Censer of Arguing Spirits', 'webp');
localMagicItemFiles.add('Censer of Arguing Spirits.webp');
addLocalMagicItemFile('Cloud-touched Boomerang', 'webp');
localMagicItemFiles.add('Cloud-touched Boomerang.webp');
addLocalMagicItemFile('Coins Edge', 'webp');
localMagicItemFiles.add('Coins Edge.webp');
addLocalMagicItemFile('Corrupted Pendant', 'webp');
localMagicItemFiles.add('Corrupted Pendant.webp');
addLocalMagicItemFile('CRT TV & Chicken Timer', 'webp');
localMagicItemFiles.add('CRT TV & Chicken Timer.webp');
addLocalMagicItemFile('Cube of Cubes', 'webp');
localMagicItemFiles.add('Cube of Cubes.webp');
addLocalMagicItemFile('Eye Kite', 'webp');
localMagicItemFiles.add('Eye Kite.webp');
addLocalMagicItemFile('Familiars Collar', 'webp');
localMagicItemFiles.add('Familiars Collar.webp');
addLocalMagicItemFile('Field Cauldron', 'webp');
localMagicItemFiles.add('Field Cauldron.webp');
addLocalMagicItemFile('Fishermans Spear', 'webp');
localMagicItemFiles.add('Fishermans Spear.webp');
addLocalMagicItemFile('Flying Broomstick', 'webp');
localMagicItemFiles.add('Flying Broomstick.webp');
addLocalMagicItemFile('Gametoy', 'webp');
localMagicItemFiles.add('Gametoy.webp');
addLocalMagicItemFile('Guardian Spheres', 'webp');
localMagicItemFiles.add('Guardian Spheres.webp');
addLocalMagicItemFile('Herons Eye Ring', 'webp');
localMagicItemFiles.add('Herons Eye Ring.webp');
addLocalMagicItemFile('Hover Hopper', 'webp');
localMagicItemFiles.add('Hover Hopper.webp');
addLocalMagicItemFile('Hurlers Gloves', 'webp');
localMagicItemFiles.add('Hurlers Gloves.webp');
addLocalMagicItemFile('Instaprint Camera', 'webp');
localMagicItemFiles.add('Instaprint Camera.webp');
addLocalMagicItemFile('Jabbadoons Feather', 'webp');
localMagicItemFiles.add('Jabbadoons Feather.webp');
addLocalMagicItemFile('Keys to the Sandcastle', 'webp');
localMagicItemFiles.add('Keys to the Sandcastle.webp');
addLocalMagicItemFile('Keytar', 'webp');
localMagicItemFiles.add('Keytar.webp');
addLocalMagicItemFile('Lafulas Iron Teapot', 'webp');
localMagicItemFiles.add('Lafulas Iron Teapot.webp');
addLocalMagicItemFile('Lunar Weapon', 'webp');
localMagicItemFiles.add('Lunar Weapon.webp');
addLocalMagicItemFile('Oikis Pinwheel', 'webp');
localMagicItemFiles.add('Oikis Pinwheel.webp');
addLocalMagicItemFile('Only Members Jacket', 'webp');
localMagicItemFiles.add('Only Members Jacket.webp');
addLocalMagicItemFile('Painters Sun Hat', 'webp');
localMagicItemFiles.add('Painters Sun Hat.webp');
addLocalMagicItemFile('Pendants of Belonging', 'webp');
localMagicItemFiles.add('Pendants of Belonging.webp');
addLocalMagicItemFile('Punch Card', 'webp');
localMagicItemFiles.add('Punch Card.webp');
addLocalMagicItemFile('Roakes Clay Urn', 'webp');
localMagicItemFiles.add('Roakes Clay Urn.webp');
addLocalMagicItemFile('Ruby Red Bike', 'webp');
localMagicItemFiles.add('Ruby Red Bike.webp');
addLocalMagicItemFile('Scarf of Muffling', 'webp');
localMagicItemFiles.add('Scarf of Muffling.webp');
addLocalMagicItemFile('Scuttling Lantern', 'webp');
localMagicItemFiles.add('Scuttling Lantern.webp');
addLocalMagicItemFile('Sibling Purses 1', 'webp');
localMagicItemFiles.add('Sibling Purses 1.webp');
addLocalMagicItemFile('Sibling Purses 2', 'webp');
localMagicItemFiles.add('Sibling Purses 2.webp');
addLocalMagicItemFile('Sibling Purses', 'webp');
localMagicItemFiles.add('Sibling Purses.webp');
addLocalMagicItemFile('Soda Cans 1', 'webp');
localMagicItemFiles.add('Soda Cans 1.webp');
addLocalMagicItemFile('Soda Cans 2', 'webp');
localMagicItemFiles.add('Soda Cans 2.webp');
addLocalMagicItemFile('Soda Cans 3', 'webp');
localMagicItemFiles.add('Soda Cans 3.webp');
addLocalMagicItemFile('Soda Cans', 'webp');
localMagicItemFiles.add('Soda Cans.webp');
addLocalMagicItemFile('Solar Amulet', 'webp');
localMagicItemFiles.add('Solar Amulet.webp');
addLocalMagicItemFile('Splinter Bow', 'webp');
localMagicItemFiles.add('Splinter Bow.webp');
addLocalMagicItemFile('Sticky Hand', 'webp');
localMagicItemFiles.add('Sticky Hand.webp');
addLocalMagicItemFile('Sunbaked Cassette', 'webp');
localMagicItemFiles.add('Sunbaked Cassette.webp');
addLocalMagicItemFile('Talisman of the Phoenix', 'webp');
localMagicItemFiles.add('Talisman of the Phoenix.webp');
addLocalMagicItemFile('Travel Wok', 'webp');
localMagicItemFiles.add('Travel Wok.webp');
addLocalMagicItemFile('Umbrella of Shielding', 'webp');
localMagicItemFiles.add('Umbrella of Shielding.webp');
addLocalMagicItemFile('Weapon of the Sun and Moon', 'webp');
localMagicItemFiles.add('Weapon of the Sun and Moon.webp');
addLocalMagicItemFile('Yappa Mask', 'webp');
localMagicItemFiles.add('Yappa Mask.webp');

// Load saved creature files from localStorage
if (typeof window !== 'undefined') {
  const savedCreatureFiles = JSON.parse(localStorage.getItem('localCreatureFiles') || '[]');
  savedCreatureFiles.forEach((filename: string) => {
    localCreatureFiles.add(filename);
  });

  // Load saved magic item files from localStorage
  const savedMagicItemFiles = JSON.parse(localStorage.getItem('localMagicItemFiles') || '[]');
  savedMagicItemFiles.forEach((filename: string) => {
    localMagicItemFiles.add(filename);
  });
}

// Get specific image for potion or fallback to default
export function getPotionImageUrl(potionName: string): string {
  const localImageExtensions = ['webp', 'jpg', 'jpeg', 'png', 'gif'];
  
  // For known potions that have existing image files, check both formats
  // This is a temporary fix until the file registration system is improved
  for (const ext of localImageExtensions) {
    // Check original filename with spaces (e.g., "Essence of the River Spirit.webp")
    const originalFilename = `${potionName}.${ext}`;
    
    // Check normalized filename with dashes (e.g., "essence-of-the-river-spirit.webp")  
    const cleanName = potionName.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const normalizedFilename = `${cleanName}.${ext}`;
    
    // Return the path if either format might exist (the browser will handle 404s gracefully)
    // Priority: original name first, then normalized name
    if (localPotionFiles.has(originalFilename)) {
      return `/images/potions/${originalFilename}`;
    }
    if (localPotionFiles.has(normalizedFilename)) {
      return `/images/potions/${normalizedFilename}`;
    }
  }
  
  // If we don't have it registered, try the original format first
  // This handles cases where files exist but aren't registered in localPotionFiles
  return `/images/potions/${potionName}.webp`;
}

// Get specific image for ingredient or fallback to default
export function getIngredientImageUrl(ingredientName: string): string {
  const localImageExtensions = ['webp', 'jpg', 'jpeg', 'png', 'gif'];
  
  // First check for files with original ingredient name (exact match with spaces)
  for (const ext of localImageExtensions) {
    const originalFilename = `${ingredientName}.${ext}`;
    if (localIngredientFiles.has(originalFilename)) {
      return `/images/ingredients/${originalFilename}`;
    }
  }
  
  // Then check for normalized names (with dashes instead of spaces)
  const cleanName = ingredientName.toLowerCase().replace(/[^a-z0-9]/g, '-');
  for (const ext of localImageExtensions) {
    const filename = `${cleanName}.${ext}`;
    if (localIngredientFiles.has(filename)) {
      return `/images/ingredients/${filename}`;
    }
  }
  
  return '/images/ingredients/default-ingredient.svg';
}

// Get specific image for creature or fallback to default
export function getCreatureImageUrl(creatureName: string): string {
  const localImageExtensions = ['webp', 'jpg', 'jpeg', 'png', 'gif'];
  
  // First check for files with original creature name (exact match with spaces)
  for (const ext of localImageExtensions) {
    const originalFilename = `${creatureName}.${ext}`;
    if (localCreatureFiles.has(originalFilename)) {
      return `/images/creatures/${originalFilename}`;
    }
  }
  
  // Then check for normalized names (with dashes instead of spaces)
  const cleanName = creatureName.toLowerCase().replace(/[^a-z0-9]/g, '-');
  for (const ext of localImageExtensions) {
    const filename = `${cleanName}.${ext}`;
    if (localCreatureFiles.has(filename)) {
      return `/images/creatures/${filename}`;
    }
  }
  
  return '/images/creatures/default-creature.svg';
}

// Magic item name to filename mapping for items where display name differs from filename
const magicItemNameMapping: Record<string, string> = {
  "Burnbright Brand Hair Dryer": "Burnright Brand Hair Dryer",
  "Cloud-Touched Boomerang": "Cloud-touched Boomerang",
  "Coin's Edge": "Coins Edge",
  "Familiar's Collar": "Familiars Collar",
  "Fisherman's Spear": "Fishermans Spear",
  "Heron's Eye Ring": "Herons Eye Ring",
  "Hurler's Gloves": "Hurlers Gloves",
  "Jabbadoon's Feather": "Jabbadoons Feather",
  "Lafula's Iron Teapot": "Lafulas Iron Teapot",
  "Oiki's Pinwheel": "Oikis Pinwheel",
  "Painter's Sun Hat": "Painters Sun Hat",
  "Roake's Clay Urn": "Roakes Clay Urn",
  "Sunbaked Cassettes": "Sunbaked Cassette"
};

// Get specific image for magic item or fallback to default
export function getMagicItemImageUrl(magicItemName: string): string {
  const localImageExtensions = ['webp', 'jpg', 'jpeg', 'png', 'gif'];

  // Check if there's a specific filename mapping for this item
  const mappedName = magicItemNameMapping[magicItemName] || magicItemName;

  // First check for files with mapped name (exact match with spaces)
  for (const ext of localImageExtensions) {
    const mappedFilename = `${mappedName}.${ext}`;
    if (localMagicItemFiles.has(mappedFilename)) {
      return `/images/magic-items/${mappedFilename}`;
    }
  }

  // Then check for files with original magic item name (exact match with spaces)
  for (const ext of localImageExtensions) {
    const originalFilename = `${magicItemName}.${ext}`;
    if (localMagicItemFiles.has(originalFilename)) {
      return `/images/magic-items/${originalFilename}`;
    }
  }

  // Then check for normalized names (with dashes instead of spaces)
  const cleanName = magicItemName.toLowerCase().replace(/[^a-z0-9]/g, '-');
  for (const ext of localImageExtensions) {
    const filename = `${cleanName}.${ext}`;
    if (localMagicItemFiles.has(filename)) {
      return `/images/magic-items/${filename}`;
    }
  }

  return '/images/magic-items/default-magic-item.svg';
}

// Debug info
console.log(`Mapped ${potionImageMap.size} potion images`);
console.log(`Mapped ${ingredientImageMap.size} ingredient images`);