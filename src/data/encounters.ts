export interface Encounter {
  roll: number;
  title: string;
  description: string;
}

export interface Region {
  id: string;
  name: string;
  encounters: Encounter[];
}

export const regions: Region[] = [
  {
    id: "gift_of_shuritashi",
    name: "The Gift of Shuritashi",
    encounters: [
      {
        roll: 1,
        title: "Wild Horses",
        description: "A herd of wild horses (use the pony* stat block) majestically gallop past the party."
      },
      {
        roll: 2,
        title: "Yokario Ambush!",
        description: "A band of 1d6+2 yokario jump out of hiding, making an awful din that sounds vaguely like music. They demand payment or a song in order for the party to pass."
      },
      {
        roll: 3,
        title: "Sad Little Spirit",
        description: "A spirit companion that is lost and is loudly crying. With staggered speech and streams of tears, they describe their beloved companion they're separated from."
      },
      {
        roll: 4,
        title: "Wild Boars",
        description: "A sounder of wild boars* charge at the party. Maybe they're hungry, maybe they're angry, maybe they're both."
      },
      {
        roll: 5,
        title: "Does It Still Work?",
        description: "An overgrown First Age vehicle is discovered in a patch of tall grass."
      },
      {
        roll: 6,
        title: "Here Kitty Kitty!",
        description: "An awakened cat either wishes the party would leave it alone to nap, or won't stop following the party until it gets a treat."
      },
      {
        roll: 7,
        title: "Troubadours",
        description: "A wandering band of troubadours on the way to the nearest village to spread music and good cheer."
      },
      {
        roll: 8,
        title: "Shooting Star",
        description: "A shooting star streaks through the sky and lands a few miles away with a loud booming sound and flash of light."
      },
      {
        roll: 9,
        title: "Merchant",
        description: "A merchant can be heard grumbling in the distance about her wagon having a broken wheel."
      },
      {
        roll: 10,
        title: "Great Beast",
        description: "The Hunter can be seen flying overhead, even high up in the sky it's still an imposing size."
      },
      {
        roll: 11,
        title: "Dara Glyph",
        description: "A successful DC 17 Wisdom (Perception) check reveals a dara glyph etched into a tree."
      },
      {
        roll: 12,
        title: "Young Witch",
        description: "A young witch (use the acolyte* stat block) who knows just enough magic to cause a mishap or two asks the party to help them practice their spellcasting."
      }
    ]
  },
  {
    id: "land_of_hot_water",
    name: "The Land of Hot Water",
    encounters: [
      {
        roll: 1,
        title: "Geyser Eruption",
        description: "A nearby geyser erupts unexpectedly; scalding steam and water threaten to engulf you. Make a successful DC 15 Dexterity (Acrobatics) saving throw or take 2d10 fire damage."
      },
      {
        roll: 2,
        title: "Soothing Hot Springs",
        description: "You find a serene hot spring, perfect for rest and recovery. A short rest here provides an additional 1d8 healing."
      },
      {
        roll: 3,
        title: "Lone Inventor",
        description: "A lone inventor from Sky Kite Valley has traveled here and set up a temporary workshop by a geothermal vent to test a prototype flying machine. They might offer assistance or trade if you help with their experiments."
      },
      {
        roll: 4,
        title: "Sky Salamander",
        description: "You see the long, sinuous form of the Sky Salamander flying in the air."
      },
      {
        roll: 5,
        title: "Mineral Vein",
        description: "You discover a rich vein of colorful minerals. Extracting them could be valuable but risky, as they are extremely hot and volatile. Talk with your players about how their adventurers would extract the minerals without getting burned."
      },
      {
        roll: 6,
        title: "Thermal Updraft",
        description: "A strong thermal updraft suddenly lifts you off the ground. Make a successful DC 12 Dexterity (Acrobatics) saving throw to land safely or be carried away, taking 1d6 bludgeoning damage from a rough landing."
      },
      {
        roll: 7,
        title: "Earthquake",
        description: "You feel the ground begins to shake and roil under your feet as Mount Arbora rumbles violently. New fissures open up all around you. On a successful DC 12 Dexterity (Acrobatics) saving throw you avoid falling into one of these fissures and taking 1d10 fire damage."
      },
      {
        roll: 8,
        title: "Crashed Kite",
        description: "A disoriented inventor from Sky Kite Valley was trying to discover new thermal columns and crashed their kite. They may need saving from monsters. They offer information or mechanical know-how in exchange for any assistance."
      },
      {
        roll: 9,
        title: "Sulfur Plume",
        description: "A noxious cloud of sulfur gas erupts from a vent, threatening to overwhelm you. Make a successful DC 15 Constitution saving throw or suffer 1d6 poison damage and be poisoned for 1 hour."
      },
      {
        roll: 10,
        title: "Giant Koi Scale",
        description: "On a successful DC 14 Wisdom (Perception) check, you find a giant koi fish scale lodged in between some boulders."
      },
      {
        roll: 11,
        title: "Grumpy Harpy",
        description: "You stumble across a lone harpy's nest. On a successful DC 15 Dexterity (Stealth) check she doesn't see you. On a failed roll she instantly sees and despises you."
      },
      {
        roll: 12,
        title: "Demon Hole",
        description: "A demon crawls out from a fumarole where it has its lair. It sees you unless you succeed at a DC 15 Dexterity (Stealth) saving throw."
      }
    ]
  },
  {
    id: "mount_arbora",
    name: "Mount Arbora",
    encounters: [
      {
        roll: 1,
        title: "Gentle Guide",
        description: "Depending on your location on the mountain (above or below the tree line), you encounter either a dryad* or a peaceful spirit that looks like a boulder. They offer cryptic guidance or a minor boon if treated respectfully."
      },
      {
        roll: 2,
        title: "Pesky Spirits",
        description: "A band of mischievous fire spirits attempt to play tricks on the party. They may burn items, lead the party astray, or cause minor illusions."
      },
      {
        roll: 3,
        title: "Avalanche!",
        description: "On a successful DC 12 Wisdom (Perception) saving throw, the party hears the sounds of rocks and/or snow beginning to rumble, signifying an impending avalanche. A series of skill checks must be made to avoid imminent disaster!"
      },
      {
        roll: 4,
        title: "Ancient Guardian",
        description: "An awakened tree or spirit boulder blocks the path and demands to know who is treading on the sacred slopes of Mount Arbora. Some Charisma checks and roleplaying are needed in order to go beyond the stubborn yet wise guardian."
      },
      {
        roll: 5,
        title: "Runic Stone",
        description: "The party stumbles upon a glowing runic stone. Whoever touches or interacts with the stone gets put into an altered state where they come face to face with an elder spirit that may or may not be the spirit of Mount Arbora. After some roleplaying and skill checks, they may be granted a temporary magical boon."
      },
      {
        roll: 6,
        title: "Snowstorm",
        description: "A sudden, magical snowstorm engulfs the party. Visibility drops and navigation becomes challenging. Monsters adapted to the cold might take advantage of the party's disorientation."
      },
      {
        roll: 7,
        title: "Treasure Hunter",
        description: "An eccentric treasure hunter from Toggle offers to trade information about hidden treasures on the mountain in exchange for assistance with a dangerous task. The prospector could be an ally or a secret foe who wishes to lead the party into peril."
      },
      {
        roll: 8,
        title: "Frozen Clue",
        description: "What looks like a person can be seen, frozen in the glacial ice. The frozen adventurer may hold a vital clue, magical item, or be revived through powerful magic to share tales of their journey."
      },
      {
        roll: 9,
        title: "Snowball Fight!",
        description: "A group of snowball spirits greet the party. Will it be a friendly encounter or a snowball fight?"
      },
      {
        roll: 10,
        title: "Find My Percy!",
        description: "A distraught and exhausted farmer pleads with the party to find their pet snowshoe pig, Percival. Some clever tracking can lead the party to Percival, but it also may lead them to a monster tracking the pig as well!"
      },
      {
        roll: 11,
        title: "Hunters are the Hunted",
        description: "The party begins to be tracked by a hill dragon that has taken to the mountain slopes in search of prey."
      },
      {
        roll: 12,
        title: "Blood of the Mountain",
        description: "In a small cave on the mountainside is a clear pool of water. Drinking from it could heal, provide visions, or mark someone for one of the great beasts such as the Sky Salamander or the Hunter."
      }
    ]
  },
  {
    id: "gale_fields",
    name: "The Gale Fields",
    encounters: [
      {
        roll: 1,
        title: "Howlers",
        description: "2d4 Howlers begin to stalk and encircle the party. You can announce their presence by having the party hear their howls over the swishing of the wind through the grass or have the encounter be an ambush."
      },
      {
        roll: 2,
        title: "Lethal Trickster",
        description: "During the daytime, a monster that can make a cry like a small child tries to pull do-gooders off the path and into the tall grass."
      },
      {
        roll: 3,
        title: "Stiltwalker Nomads",
        description: "A group of 1d6+1 Stiltwalker nomads offers trade and tales of the Gale Fields. They have unique items, are knowledgeable about the safest routes, know hidden paths, have a quest or two, and may offer to have the party stay a night in one of their stilt houses."
      },
      {
        roll: 4,
        title: "Gale Spirit",
        description: "A spirit emerges from the tall grass. They could offer guidance, reveal a hidden path, ask for help, or lead the party into deeper danger."
      },
      {
        roll: 5,
        title: "Ambush!",
        description: "1d4+1 bandits (use bandit* stat block) are lying in wait within the tall grass. They attempt to ambush the party for valuables."
      },
      {
        roll: 6,
        title: "The Crawling Canopy",
        description: "The party encounters the Crawling Canopy. You could have them see it from a distance—oddly out of place in the Gale Fields. The forest could be moving or stationary for the time being. The forest could also engulf them as they camp in the Gale Fields (this could start the adventure in this book titled Lost Within the Crawling Canopy (pg 360))."
      },
      {
        roll: 7,
        title: "Howls of Pain",
        description: "A lone, injured howler crosses paths with the party. It's desperate and dangerous. It might have got separated from its pack or banished or it could all be a clever ploy."
      },
      {
        roll: 8,
        title: "Witchcraft at Work",
        description: "A witch from the Fish Head Coven has found a massive skeleton. They don't know if it is a dragon or some ancient megafauna but they are trying to figure out how to unearth it. Once they do, they will try to animate it."
      },
      {
        roll: 9,
        title: "Bugung the Smusher",
        description: "Bugung the Smusher is a spirit with an ego the size of Mount Arbora. Bugung is looking to eat some gophers, but Bugung is hungry so, at this point, pretty much anything will do."
      },
      {
        roll: 10,
        title: "Wind Eels",
        description: "A school of wind eel spirits pass around the party, floating on the breeze. They're generally harmless but they have been known to gnaw holes in stone buildings."
      },
      {
        roll: 11,
        title: "Dandelion Spirits",
        description: "The wind blows dandelion fluff spirits that get everywhere. The spirits are having the time of their lives. Some are small enough to tickle nose hairs and make an adventurer sneeze."
      },
      {
        roll: 12,
        title: "Hidden Village",
        description: "Expertly camouflaged in the tall grass is a hidden village of people who have lived here for generations. They can provide food, shelter, and information about the area. They also may have need of things from outside the Gale Fields and ask for the party's assistance."
      }
    ]
  },
  {
    id: "brackwater_wetlands",
    name: "The Brackwater Wetlands",
    encounters: [
      {
        roll: 1,
        title: "Mud Eel Fishing",
        description: "A group of fishers offers to share tales and freshly caught mud eels (use the animalistic spirit stat block in this book) in exchange for news from beyond the Wetlands. Since the tsunami, they are managing to survive on their wits and knowledge of the Wetlands."
      },
      {
        roll: 2,
        title: "Quicksand!",
        description: "Whether by bad luck, being chased by a monster, or lured by a tricksy spirit, the party must deal with this environmental danger."
      },
      {
        roll: 3,
        title: "Hakumon's Hospitality",
        description: "The party stumbles upon Hakumon's Ramen Shop. Hakumon offers a hearty meal and shelter for the night, but warns of the nearby Corruption's advance."
      },
      {
        roll: 4,
        title: "Unlikely Train Stop",
        description: "Partially submerged in the mud is a lonesome platform and train stop. Sitting on the partially broken bench is an old man quietly reading a book and waiting for the Wandering Line."
      },
      {
        roll: 5,
        title: "Railroad Passage",
        description: "The party finds an entrance to the underground subway system that can be found in parts of the Brackwater Wetlands."
      },
      {
        roll: 6,
        title: "Muk Ambush",
        description: "1d4 Corrupted Muk ambush the party from under the swamp."
      },
      {
        roll: 7,
        title: "Crawlers",
        description: "The party encounters 1d4 Crawlers."
      },
      {
        roll: 8,
        title: "Borgork",
        description: "The party has stumbled into the territory of Borgork, a haughty and imperious young Dragon Frog who claims to rule this part of the Brackwater Wetlands. They must appease Borgork with tribute and flattery or suffer his wrath."
      },
      {
        roll: 9,
        title: "Missing Villager",
        description: "A woodcutter who was with Grifftang Crump got separated and is huddled in the hollow of a broken tree, clinging to life. They fled a howler attack, got disoriented, and now have no idea how to get back home."
      },
      {
        roll: 10,
        title: "Bubbling Below",
        description: "Suddenly the ground below the party's feet starts to feel like mud as black pools of Corruption seep from the ground like a sponge being squeezed. Anyone caught in it must make a DC 14 Dexterity saving throw. On a failed save the creature gains a level of exhaustion."
      },
      {
        roll: 11,
        title: "Lion's Blume",
        description: "The party encounters one (or several) lion's blume vines. Entangled in one of them is a missing resident from Polewater who is calling for help."
      },
      {
        roll: 12,
        title: "Roakraska",
        description: "The party encounters the gulper eel spirit, Roakraska."
      }
    ]
  },
  {
    id: "coastal_highlands",
    name: "The Coastal Highlands",
    encounters: [
      {
        roll: 1,
        title: "Singing Harpies",
        description: "The party hears some beautiful singing, a chorus of voices so alluring that they are compelled to listen closer. These voices come from 1d4+1 harpies but they have an extra innate ability to use Charm Person* to lure their prey to them for fun or food."
      },
      {
        roll: 2,
        title: "Wandering Shepherd",
        description: "A shepherd with a flock of sheep dragons asks for help locating a lost sheep dragon lamb."
      },
      {
        roll: 3,
        title: "Opal Falls Merchants",
        description: "Traveling merchants from Opal Falls have set up a temporary market, selling rare and enchanted goods. They are eager to trade for unusual items or tales of adventure."
      },
      {
        roll: 4,
        title: "Harpy Ambush",
        description: "A group of harpies (possibly those from Broken Bird Airfield), swoops down, attempting to capture travelers for a feast, to demand tribute, to invite them to a gambling game, or to mug them for loot."
      },
      {
        roll: 5,
        title: "Sudden Fog",
        description: "A dense, magical fog rolls in, reducing visibility to zero. The fog causes disorientation unless the party can navigate by sound or other means. If the party is near the cliffs, a DC 15 Wisdom (Perception) or Wisdom (Survival) saving throw should be made to avoid falling into the sea or being dashed on the rocks below."
      },
      {
        roll: 6,
        title: "Wind-Swept Cliff",
        description: "Sudden and powerful winds blow across the highlands. the adventurers must succeed on a DC 14 Strength saving throw or be pushed 1d4x5 feet in a random direction—hopefully not off a cliff."
      },
      {
        roll: 7,
        title: "Ancient Airplane",
        description: "The party discovers a relic from the First Age, an old airplane half-buried in the rock. Examining it reveals a First Age item like a cassette or VHS tape and runs the risk of awakening a sleeping bearracuda that has its den in the plane."
      },
      {
        roll: 8,
        title: "View of Opal Falls",
        description: "The party stumbles upon a perfect vantage point where they can see Opal Falls and Blue Back Lake in all their glory."
      },
      {
        roll: 9,
        title: "Druid of the Highlands",
        description: "A druid is tending to the natural balance of the area. They might offer healing, wisdom, or challenge the party to prove their respect for nature."
      },
      {
        roll: 10,
        title: "Dancing Flowers",
        description: "The party stumbles on small clearing where hundreds of awakened dancing flowers block the path forward."
      },
      {
        roll: 11,
        title: "Trapped Traveller",
        description: "A young traveller has crawled inside an old abandoned refrigerator to scare his friends, but soon realized the door had been magically sealed behind him by a trickster spirit."
      },
      {
        roll: 12,
        title: "Unwanted Companion",
        description: "A chattering and somewhat irritating seagull spirit takes a liking to the party and refuses to leave their side."
      }
    ]
  },
  {
    id: "the_shallows",
    name: "The Shallows",
    encounters: [
      {
        roll: 1,
        title: "Fish Folk Pirates",
        description: "A band of 1d4+4 fish folk pirates aboard their ship, the Snapping Turtle, which is made from a giant turtle shell. They demand a toll for passing through their territory. They may offer a parley, willing to trade for something of value. They can also be bribed or tricked."
      },
      {
        roll: 2,
        title: "Ghost Ship",
        description: "A boat from the First Age can be seen floating in the Shallows. It could be piloted by a spirit that has whelmed its engine or it could be mysteriously abandoned with a series of strange clues on board that point to a sunken city."
      },
      {
        roll: 3,
        title: "Sunken Treasure",
        description: "At the bottom of the Shallows, barely visible through a hole in the hull of a sunken wooden ship, is an iron-bound chest lying half-buried in the sand. The wreck is in 20 feet of water and is guarded by a Seaweed Elemental. The chest could contain a famous lost treasure or clues to another adventure on land."
      },
      {
        roll: 4,
        title: "Spirit Serpent",
        description: "This animalistic spirit serpent could serve as a sage or a foe, providing information or demanding tribute for safe passage."
      },
      {
        roll: 5,
        title: "Whirlpool",
        description: "Avoiding the whirlpool requires quick thinking and agility. Getting caught in it requires strength and stamina. Those who survive might discover a hidden treasure or sunken city."
      },
      {
        roll: 6,
        title: "Trickery in the Seas",
        description: "The party encounters a deep angler that is looking for an unsuspecting meal."
      },
      {
        roll: 7,
        title: "Sleeping Girl",
        description: "At the bottom of the Shallows is a little girl no older than 5 who is sleeping in an air bubble."
      },
      {
        roll: 8,
        title: "Lady Blue",
        description: "A spirit that takes the visage of an enormous red-headed woman is drawn by the presence of the party. They might be curious, indifferent, or hostile, depending on their actions."
      },
      {
        roll: 9,
        title: "Tendrils of Corruption",
        description: "Dark tendrils of the Corruption bubble up from the reef causing a twisted maze of web-like strands. Navigating through the Corruption takes several skill checks. Note: This encounter should happen only on the eastern half of the Shallows."
      },
      {
        roll: 10,
        title: "The Doomspine",
        description: "The party sees the Doomspine and on board is the Lionfish King along with 3d4 of his most loyal pirates."
      },
      {
        roll: 11,
        title: "Shark!",
        description: "The party's activities in the Shallows draws the attention of a giant shark*."
      },
      {
        roll: 12,
        title: "School of Fish",
        description: "A school of skeletal fish swims toward the party. Perhaps one of them is a companion spirit that takes a liking to a party member and has some interesting information to share."
      }
    ]
  }
];

// Helper functions
export const getRegionById = (id: string): Region | undefined => {
  return regions.find(region => region.id === id);
};

export const getRandomEncounter = (regionId: string): Encounter | null => {
  const region = getRegionById(regionId);
  if (!region) return null;
  
  const roll = Math.floor(Math.random() * 12) + 1;
  return region.encounters.find(encounter => encounter.roll === roll) || null;
};

export const rollEncounter = (regionId: string): { roll: number; encounter: Encounter | null } => {
  const region = getRegionById(regionId);
  if (!region) return { roll: 0, encounter: null };
  
  const roll = Math.floor(Math.random() * 12) + 1;
  const encounter = region.encounters.find(encounter => encounter.roll === roll) || null;
  
  return { roll, encounter };
};