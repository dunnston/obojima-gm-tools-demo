export interface Ingredient {
  name: string;
  combat: number;
  utility: number;
  whimsy: number;
  rarity: 'Common' | 'Uncommon' | 'Rare';
  imageUrl?: string;
  locations: string[];
  price: number; // Price in gold pieces
}

export const ingredients: Ingredient[] = [
  {
    name: "Amber",
    combat: 9,
    utility: 5,
    whimsy: 4,
    rarity: "Common",
    imageUrl: "https://drive.google.com/uc?export=view&id=1DcYYoRwdg7nabC3WBhu5UzyGvMrmTz2U",
    locations: ["Land of Hot Water", "Mount Arbora"],
    price: 4.75
  },
  {
    name: "Apper Carrot",
    combat: 0,
    utility: 3,
    whimsy: 1,
    rarity: "Common",
    imageUrl: "https://drive.google.com/uc?export=view&id=15H8rAYLy9gwGgvutT_PghAOR3WasJmig",
    locations: ["Gale Fields", "Gift of Shuritashi"],
    price: 1.25
  },
  {
    name: "Bamboo",
    combat: 3,
    utility: 3,
    whimsy: 3,
    rarity: "Common",
    imageUrl: "https://drive.google.com/uc?export=view&id=1al1WISoIZ0V4lPcubTXgjFe-wLsVLpWL",
    locations: ["Brackwater Wetlands", "Gift of Shuritashi", "Land of Hot Water"],
    price: 2.5
  },
  {
    name: "Bashu Powder",
    combat: 2,
    utility: 0,
    whimsy: 0,
    rarity: "Common",
    imageUrl: "https://drive.google.com/uc?export=view&id=19ieAj7-4N09_E1hlXBqedEp03tvUdRcr",
    locations: ["Gift of Shuritashi", "Land of Hot Water"],
    price: 4.75
  },
  {
    name: "Black Cinnamon",
    combat: 16,
    utility: 12,
    whimsy: 11,
    rarity: "Uncommon",
    imageUrl: "https://drive.google.com/uc?export=view&id=1ON9g63OukagHmOfYDsch5yoCAEiFvfUP",
    locations: ["Mount Arbora"],
    price: 10
  },
  {
    name: "Black Pearl",
    combat: 13,
    utility: 14,
    whimsy: 15,
    rarity: "Uncommon",
    imageUrl: "https://drive.google.com/uc?export=view&id=1aOXwtS9r9RVcm4CWU2wJCHbbnUMSt8CV",
    locations: ["Shallows"],
    price: 10.75
  },
  {
    name: "Blossom of Spirit Vine",
    combat: 18,
    utility: 18,
    whimsy: 19,
    rarity: "Rare",
    imageUrl: "https://drive.google.com/uc?export=view&id=1VwAK5sMXORnu86r7YjBzCnlW17CpIbUW",
    locations: ["Spirit Realm"],
    price: 14
  },
  {
    name: "Blue Back Salmon",
    combat: 3,
    utility: 4,
    whimsy: 7,
    rarity: "Common",
    imageUrl: "https://drive.google.com/uc?export=view&id=1W3Fq7y-vKHqX4ff_89VxlgSbNYT5uexM",
    locations: ["Brackwater Wetlands", "Coastal Highlands", "Gale Fields", "Gift of Shuritashi", "Land of Hot Water", "Mount Arbora", "Shallows"],
    price: 3.75
  },
  {
    name: "Boom Beri",
    combat: 7,
    utility: 6,
    whimsy: 1,
    rarity: "Common",
    imageUrl: "https://drive.google.com/uc?export=view&id=16E-V3rahF8JTwSDfLySaqP0rIoPD-vGs",
    locations: ["Coastal Highlands", "Gift of Shuritashi", "Land of Hot Water", "Mount Arbora"],
    price: 3.75
  },
  {
    name: "Bora Bug",
    combat: 4,
    utility: 8,
    whimsy: 3,
    rarity: "Common",
    imageUrl: "https://drive.google.com/uc?export=view&id=1kQfPmTAONVayg05ziybnjMZ-ku3_8nR3",
    locations: ["Brackwater Wetlands", "Coastal Highlands", "Gale Fields", "Gift of Shuritashi", "Mount Arbora"],
    price: 4
  },
  {
    name: "Bottle Cap (Supa-Fizz!)",
    combat: 11,
    utility: 13,
    whimsy: 16,
    rarity: "Uncommon",
    imageUrl: "https://drive.google.com/uc?export=view&id=1dUyQpTAmLulRt2Omovx4RnhXZghk8Edu",
    locations: ["Brackwater Wetlands", "Coastal Highlands", "Gale Fields", "Gift of Shuritashi", "Land of Hot Water", "Mount Arbora", "Shallows"],
    price: 3.75
  },
  {
    name: "Bottled Lightning",
    combat: 20,
    utility: 20,
    whimsy: 18,
    rarity: "Rare",
    imageUrl: "https://drive.google.com/uc?export=view&id=1YO_lqcNWDqCJ_yFvufJ_Cjbl9iPFXd4L",
    locations: [],
    price: 14.75
  },
  {
    name: "Brush Reed",
    combat: 1,
    utility: 10,
    whimsy: 6,
    rarity: "Common",
    imageUrl: "https://drive.google.com/uc?export=view&id=1HtbN8X2OI3SQjywc42xlTRAoqQBA-18k",
    locations: ["Brackwater Wetlands", "Land of Hot Water", "Shallows"],
    price: 4.5
  },
  {
    name: "Bubble Gum",
    combat: 18,
    utility: 19,
    whimsy: 20,
    rarity: "Rare",
    imageUrl: "https://drive.google.com/uc?export=view&id=1o7n4kLiPFN3XrWv3hjh2pVCJYxcrjrGa",
    locations: [],
    price: 4.5
  },
  {
    name: "Bundle of Driko Twigs",
    combat: 1,
    utility: 1,
    whimsy: 2,
    rarity: "Common",
    imageUrl: "https://drive.google.com/uc?export=view&id=133AeoqAqYeFkrksLFASwn1hendVf_c6v",
    locations: ["Brackwater Wetlands", "Coastal Highlands", "Gale Fields", "Gift of Shuritashi", "Land of Hot Water", "Mount Arbora"],
    price: 1.25
  },
  {
    name: "Camp Mite",
    combat: 6,
    utility: 4,
    whimsy: 8,
    rarity: "Common",
    imageUrl: "https://drive.google.com/uc?export=view&id=14PZ9BBaSRDNamjsXrbdWCNEDxdHXqkMU",
    locations: ["Brackwater Wetlands", "Gale Fields", "Gift of Shuritashi"],
    price: 4.75
  },
  {
    name: "Chicken Egg",
    combat: 1,
    utility: 1,
    whimsy: 2,
    rarity: "Common",
    imageUrl: "https://drive.google.com/uc?export=view&id=1xdG8uGbmQCfiQQAzd8bBOntBzvtm-JZW",
    locations: ["Brackwater Wetlands", "Coastal Highlands", "Gale Fields", "Gift of Shuritashi", "Land of Hot Water"],
    price: 4.75
  },
  {
    name: "Chisuay's Heavenly Tea",
    combat: 2,
    utility: 7,
    whimsy: 5,
    rarity: "Common",
    imageUrl: "https://drive.google.com/uc?export=view&id=1P7HDAoXaMDht2cpWPfWR9gbn6eay8XeH",
    locations: ["Land of Hot Water"],
    price: 3.75
  },
  {
    name: "Clay Snake Tail",
    combat: 8,
    utility: 6,
    whimsy: 5,
    rarity: "Common",
    imageUrl: "https://drive.google.com/uc?export=view&id=1_Ipb5NPUPR8fxB2MXo_rPM-T7NVn0EYL",
    locations: ["Brackwater Wetlands", "Gale Fields", "Land of Hot Water", "Mount Arbora"],
    price: 5
  },
  {
    name: "Cloud Horn",
    combat: 1,
    utility: 0,
    whimsy: 0,
    rarity: "Common",
    imageUrl: "https://drive.google.com/uc?export=view&id=1PYwAXH7OP0-VubxGwLNv6LTcRTTbxW1Q",
    locations: ["Gale Fields", "Gift of Shuritashi"],
    price: 0.5
  },
  {
    name: "Coal from the Wandering Line",
    combat: 19,
    utility: 19,
    whimsy: 20,
    rarity: "Rare",
    imageUrl: "https://drive.google.com/uc?export=view&id=16zNrksDDfgCu35dBNsMO-kA7vxRyxHNH",
    locations: [],
    price: 0
  },
  {
    name: "Corrupted Seawater",
    combat: 17,
    utility: 11,
    whimsy: 14,
    rarity: "Uncommon",
    imageUrl: "https://drive.google.com/uc?export=view&id=1U6kxQwzr35woJUCSLyQ82tnD-jy5Cv3Z",
    locations: ["Brackwater Wetlands"],
    price: 10.75
  },
  {
    name: "Crackling Jasper",
    combat: 17,
    utility: 15,
    whimsy: 12,
    rarity: "Uncommon",
    imageUrl: "https://drive.google.com/uc?export=view&id=1VW0ukxFCLXnntNZV72KChfOWQ60pv2_J",
    locations: ["Land of Hot Water"],
    price: 0
  },
  {
    name: "Creeping Bolete",
    combat: 3,
    utility: 10,
    whimsy: 6,
    rarity: "Common",
    imageUrl: "https://drive.google.com/uc?export=view&id=1hJVKqgHPzwWGNS4-IOK5ZfXB0urGWbhr",
    locations: ["Brackwater Wetlands", "Coastal Highlands", "Gift of Shuritashi"],
    price: 5
  },
  {
    name: "Crimson Octopus Ink",
    combat: 19,
    utility: 18,
    whimsy: 19,
    rarity: "Rare",
    imageUrl: "https://drive.google.com/uc?export=view&id=1wg2eqZQH7LlKYHeSg95PSRGvZBtUHe-9",
    locations: [],
    price: 14.25
  },
  {
    name: "Dawn Petal",
    combat: 11,
    utility: 13,
    whimsy: 17,
    rarity: "Uncommon",
    imageUrl: "https://drive.google.com/uc?export=view&id=1KKlUZlbb3uqZZWRf-TVsZB1kv9JT63p8",
    locations: ["Gift of Shuritashi", "Mount Arbora"],
    price: 10.5
  },
  {
    name: "Dorrin Plate",
    combat: 7,
    utility: 8,
    whimsy: 4,
    rarity: "Common",
    imageUrl: "https://drive.google.com/uc?export=view&id=1B00BD7opiNS54C4WUYpcWwZP9zGoC3RJ",
    locations: [],
    price: 5
  },
  {
    name: "Dragon Fang of Yutro",
    combat: 20,
    utility: 18,
    whimsy: 19,
    rarity: "Rare",
    imageUrl: "https://drive.google.com/uc?export=view&id=149ZCTaMoH-ypWjG1sMlj0V5FIO6fQJ87",
    locations: [],
    price: 14.5
  },
  {
    name: "Dragon Root",
    combat: 14,
    utility: 15,
    whimsy: 16,
    rarity: "Uncommon",
    imageUrl: "https://drive.google.com/uc?export=view&id=1yvG6Zbwf3psGN17hocv4iBqs6idcC9XM",
    locations: ["Gale Fields"],
    price: 11.5
  },
  {
    name: "Dried Fruit",
    combat: 2,
    utility: 1,
    whimsy: 4,
    rarity: "Common",
    imageUrl: "https://drive.google.com/uc?export=view&id=1vowhcad9oc_DZGOZvXO77xt3iiLtceva",
    locations: [],
    price: 2
  },
  {
    name: "Earwax",
    combat: 0,
    utility: 0,
    whimsy: 0,
    rarity: "Common",
    imageUrl: "https://drive.google.com/uc?export=view&id=1Ca1sBXMWM3jNZ_yBBbJaM6a-5CQAlfDi",
    locations: ["Brackwater Wetlands", "Coastal Highlands", "Gale Fields", "Gift of Shuritashi", "Land of Hot Water", "Mount Arbora"],
    price: 0.25
  },
  {
    name: "Essence of Glumbug",
    combat: 11,
    utility: 11,
    whimsy: 17,
    rarity: "Uncommon",
    imageUrl: "https://drive.google.com/uc?export=view&id=1lcIZK8-3naOmYvo36c3p6UtO1i_1IiUA",
    locations: ["Coastal Highlands", "Mount Arbora"],
    price: 10
  },
  {
    name: "Essence of Ill Omen",
    combat: 16,
    utility: 12,
    whimsy: 11,
    rarity: "Uncommon",
    imageUrl: "https://drive.google.com/uc?export=view&id=1mMoAm3zrybMRXkVcO3QP77hP8xXqf78c",
    locations: [],
    price: 10
  },
  {
    name: "Fairy Willow",
    combat: 18,
    utility: 18,
    whimsy: 20,
    rarity: "Rare",
    imageUrl: "https://drive.google.com/uc?export=view&id=10W8L8eAhYMwfkXJtQ-Iiz7w9KaRMeLHf",
    locations: [],
    price: 14.25
  },
  {
    name: "Feather Rock",
    combat: 13,
    utility: 17,
    whimsy: 15,
    rarity: "Uncommon",
    imageUrl: "https://drive.google.com/uc?export=view&id=185EyK15VOnVf82PmKZnyVE4Dbcnd5Cx6",
    locations: ["Gale Fields"],
    price: 11.5
  },
  {
    name: "Fish Folk Tooth",
    combat: 9,
    utility: 4,
    whimsy: 3,
    rarity: "Common",
    imageUrl: "https://drive.google.com/uc?export=view&id=1Xz693qCWY_hjboEFPiFl2U3u78ZqFryu",
    locations: ["Brackwater Wetlands", "Gift of Shuritashi", "Land of Hot Water", "Shallows"],
    price: 4.25
  },
  {
    name: "Fish Head",
    combat: 4,
    utility: 5,
    whimsy: 4,
    rarity: "Common",
    imageUrl: "https://drive.google.com/uc?export=view&id=1roXHjfz3HP7sP9qeoz_vxqdlzsNRkCeC",
    locations: ["Brackwater Wetlands", "Coastal Highlands", "Gale Fields", "Gift of Shuritashi", "Land of Hot Water", "Mount Arbora", "Shallows"],
    price: 3.5
  },
  {
    name: "Fizzing Green",
    combat: 12,
    utility: 14,
    whimsy: 12,
    rarity: "Uncommon",
    imageUrl: "https://drive.google.com/uc?export=view&id=1qfBeHJ8_1pGJj1ECxAgNEa_agOfrBMRa",
    locations: ["Gift of Shuritashi"],
    price: 9.75
  },
  {
    name: "Flash Paper",
    combat: 6,
    utility: 9,
    whimsy: 1,
    rarity: "Common",
    imageUrl: "https://drive.google.com/uc?export=view&id=1ckvpYZ-4cZVR0a1PZprTqSqarqj5_qeQ",
    locations: ["Coastal Highlands", "Gift of Shuritashi", "Land of Hot Water"],
    price: 4.25
  },
  {
    name: "Forge Slag",
    combat: 15,
    utility: 14,
    whimsy: 11,
    rarity: "Uncommon",
    imageUrl: "https://drive.google.com/uc?export=view&id=1iuhO9OnMhFiiN-fyvgcqllhbZyUMFHDi",
    locations: ["Mount Arbora"],
    price: 10.25
  },
  {
    name: "Gargoyle Powder",
    combat: 15,
    utility: 16,
    whimsy: 13,
    rarity: "Uncommon",
    imageUrl: "https://drive.google.com/uc?export=view&id=1GU97ZXtFu-cL1yaIdje822w1owp034s3",
    locations: ["Land of Hot Water", "Mount Arbora"],
    price: 11.25
  },
  {
    name: "Giant Koi Fish Scale",
    combat: 18,
    utility: 20,
    whimsy: 18,
    rarity: "Rare",
    imageUrl: "https://drive.google.com/uc?export=view&id=1_TYKaIPK4FiJxoOmlDum800qLRy5-Sop",
    locations: [],
    price: 14.25
  },
  {
    name: "Glow Worms of the Vale",
    combat: 12,
    utility: 15,
    whimsy: 14,
    rarity: "Uncommon",
    imageUrl: "https://drive.google.com/uc?export=view&id=1nfUqDY89J0B7tB-7qz92hPOIw8aMe9Iy",
    locations: ["Gale Fields"],
    price: 10.5
  },
  {
    name: "Gohaku Rice",
    combat: 3,
    utility: 2,
    whimsy: 3,
    rarity: "Common",
    imageUrl: "https://drive.google.com/uc?export=view&id=15inJS7fudZhvffz0RSjYvAu0Qk4bUOAv",
    locations: ["Brackwater Wetlands", "Land of Hot Water"],
    price: 2.25
  },
  {
    name: "Golden Root",
    combat: 18,
    utility: 18,
    whimsy: 18,
    rarity: "Rare",
    imageUrl: "https://drive.google.com/uc?export=view&id=1s5ivocor52GanW2rDlJMljSpy3xIiaXW",
    locations: [],
    price: 13.75
  },
  {
    name: "Hakuma Sapwood",
    combat: 5,
    utility: 1,
    whimsy: 9,
    rarity: "Common",
    imageUrl: "https://drive.google.com/uc?export=view&id=1JVrGCdea8c5GhGCeO3lkuyAzuevkonG7",
    locations: ["Gale Fields", "Gift of Shuritashi", "Mount Arbora"],
    price: 4
  },
  {
    name: "Hakumon's Ramen Broth",
    combat: 12,
    utility: 14,
    whimsy: 17,
    rarity: "Uncommon",
    imageUrl: "https://drive.google.com/uc?export=view&id=1tu3ZmwHUtnmtoi9LQgnRZfIeUo9OEdCG",
    locations: ["Brackwater Wetlands"],
    price: 0
  },
  {
    name: "Hand of Eryo",
    combat: 18,
    utility: 18,
    whimsy: 19,
    rarity: "Rare",
    imageUrl: "https://drive.google.com/uc?export=view&id=1r1Wx_gPQY_FErE9RVSlCN2PKgJUlSdRt",
    locations: [],
    price: 14
  },
  {
    name: "Happy Joy Cake",
    combat: 12,
    utility: 13,
    whimsy: 12,
    rarity: "Uncommon",
    imageUrl: "https://drive.google.com/uc?export=view&id=1-TQLuF6xrWOpClN3lsn4jqXu3jz3v77V",
    locations: ["Gift of Shuritashi"],
    price: 9.5
  },
  {
    name: "Hill Dragon Egg",
    combat: 9,
    utility: 3,
    whimsy: 8,
    rarity: "Common",
    imageUrl: "https://drive.google.com/uc?export=view&id=1Iu1fNKsJ_kaLaZRXaeEnFymGu-HIsWyG",
    locations: ["Gale Fields"],
    price: 5.25
  },
  {
    name: "Howler Fur",
    combat: 10,
    utility: 5,
    whimsy: 4,
    rarity: "Common",
    imageUrl: "https://drive.google.com/uc?export=view&id=1VDqESOUpVNEgz1vhUau1ea1U1e40AR25",
    locations: ["Brackwater Wetlands", "Gale Fields", "Mount Arbora"],
    price: 5
  },
  {
    name: "Irimbi Chrysalis",
    combat: 19,
    utility: 20,
    whimsy: 18,
    rarity: "Rare",
    imageUrl: "https://drive.google.com/uc?export=view&id=1qqApah3xSNxbc53LsB5eM7nN4-POt4h1",
    locations: [],
    price: 14.5
  },
  {
    name: "Itchi Beri",
    combat: 0,
    utility: 1,
    whimsy: 0,
    rarity: "Common",
    imageUrl: "https://drive.google.com/uc?export=view&id=1t6APPtlKycji7_f9MbSIP2hpBV6IFBEj",
    locations: ["Gale Fields"],
    price: 0.5
  },
  {
    name: "Jack-O'-Lantern Bits",
    combat: 2,
    utility: 1,
    whimsy: 3,
    rarity: "Common",
    imageUrl: "https://drive.google.com/uc?export=view&id=1sYx9jukYBcwAnT_1eEe627tD4LgBVoTt",
    locations: ["Gale Fields", "Gift of Shuritashi"],
    price: 0
  },
  {
    name: "Jumping Bonfire",
    combat: 6,
    utility: 4,
    whimsy: 10,
    rarity: "Common",
    imageUrl: "https://drive.google.com/uc?export=view&id=1crqA1RgsICA0Go5qyJo3b5a9TSy2ztjL",
    locations: ["Coastal Highlands", "Gale Fields", "Gift of Shuritashi", "Land of Hot Water"],
    price: 5.25
  },
  {
    name: "Kloth Leech",
    combat: 1,
    utility: 1,
    whimsy: 1,
    rarity: "Common",
    imageUrl: "https://drive.google.com/uc?export=view&id=1NAhLqVHv2KyenNdB7C4IlWt3abQSus_4",
    locations: ["Brackwater Wetlands"],
    price: 1
  },
  {
    name: "Knobble Leaf Seaweed",
    combat: 1,
    utility: 1,
    whimsy: 1,
    rarity: "Common",
    imageUrl: "https://drive.google.com/uc?export=view&id=1iWD08H2uPK_uQOsI3SJDiOnDuAfFJ7K6",
    locations: ["Brackwater Wetlands", "Gift of Shuritashi", "Shallows"],
    price: 1
  },
  {
    name: "Kojo Root",
    combat: 6,
    utility: 3,
    whimsy: 2,
    rarity: "Common",
    imageUrl: "https://drive.google.com/uc?export=view&id=1aDUoEv-XM4DWkiyJNs5LI1FLFKDjfHTf",
    locations: ["Coastal Highlands"],
    price: 3
  },
  {
    name: "Kojobi Fruit",
    combat: 14,
    utility: 14,
    whimsy: 14,
    rarity: "Uncommon",
    imageUrl: "https://drive.google.com/uc?export=view&id=1yiSruG5ux7vY1qhSE9EX1yackX17PkzK",
    locations: ["Coastal Highlands", "Gale Fields", "Gift of Shuritashi", "Land of Hot Water"],
    price: 10.75
  },
  {
    name: "Laughing Moss",
    combat: 11,
    utility: 16,
    whimsy: 16,
    rarity: "Uncommon",
    imageUrl: "https://drive.google.com/uc?export=view&id=11pjxKeJK0VXNMgPe-YolZMG84_30lv1H",
    locations: ["Brackwater Wetlands", "Gift of Shuritashi"],
    price: 11
  },
  {
    name: "Lionfish Poison",
    combat: 20,
    utility: 0,
    whimsy: 0,
    rarity: "Rare",
    imageUrl: "https://drive.google.com/uc?export=view&id=1s2IbGthBb8gHIjcgTCO_tohSV9PRHtoB",
    locations: ["Shallows"],
    price: 5.25
  },
  {
    name: "Lions Blume",
    combat: 17,
    utility: 13,
    whimsy: 16,
    rarity: "Uncommon",
    imageUrl: "https://drive.google.com/uc?export=view&id=1rkSuN4_Ac-za1eSscI3bXgQDF6l7BrhW",
    locations: ["Coastal Highlands"],
    price: 11.75
  },
  {
    name: "Living Spud",
    combat: 14,
    utility: 12,
    whimsy: 17,
    rarity: "Uncommon",
    imageUrl: "https://drive.google.com/uc?export=view&id=1QFO_kOmkGEAbsnCudWf6_JRYttYDYl_a",
    locations: ["Gale Fields"],
    price: 11
  },
  {
    name: "Lovers Vine",
    combat: 0,
    utility: 0,
    whimsy: 2,
    rarity: "Common",
    imageUrl: "https://drive.google.com/uc?export=view&id=1CdROlEZomJcv9qYpQawUnWrYpZ3kc1NE",
    locations: ["Brackwater Wetlands", "Gift of Shuritashi"],
    price: 0.75
  },
  {
    name: "Magic Monk's Rice Wine",
    combat: 16,
    utility: 12,
    whimsy: 15,
    rarity: "Uncommon",
    imageUrl: "https://drive.google.com/uc?export=view&id=1_3iase25K887voWZu5JMc4Om11r26cyl",
    locations: [],
    price: 0
  },
  {
    name: "Mandrake Root",
    combat: 8,
    utility: 5,
    whimsy: 2,
    rarity: "Common",
    imageUrl: "https://drive.google.com/uc?export=view&id=1KR5lBnfwJcQt1y4UyW1QztM7HQuQMzIS",
    locations: ["Mount Arbora"],
    price: 4
  },
  {
    name: "Mellowort",
    combat: 4,
    utility: 8,
    whimsy: 7,
    rarity: "Common",
    imageUrl: "https://drive.google.com/uc?export=view&id=1AkNQ7H_TpCYmYceQt2b8fyH1uk2_cvze",
    locations: ["Brackwater Wetlands", "Gift of Shuritashi"],
    price: 5
  },
  {
    name: "Molted Lizard Skin",
    combat: 15,
    utility: 12,
    whimsy: 12,
    rarity: "Uncommon",
    imageUrl: "https://drive.google.com/uc?export=view&id=1954dRKu2BVhZmYG2FPLDUhNzSVfvf6A0",
    locations: ["Land of Hot Water"],
    price: 10
  },
  {
    name: "Monkey's Coil",
    combat: 2,
    utility: 0,
    whimsy: 1,
    rarity: "Common",
    imageUrl: "https://drive.google.com/uc?export=view&id=1QkAeXJd11pb_SKi-4YJg_GUNB4cP38YD",
    locations: ["Gale Fields"],
    price: 1
  },
  {
    name: "Mountain Ox Dung",
    combat: 10,
    utility: 3,
    whimsy: 8,
    rarity: "Common",
    imageUrl: "https://drive.google.com/uc?export=view&id=1r7VodCzDYsZfpwRCKqIyGiMchk41gvNY",
    locations: ["Coastal Highlands"],
    price: 5.5
  },
  {
    name: "Mountain Snail",
    combat: 14,
    utility: 15,
    whimsy: 12,
    rarity: "Uncommon",
    imageUrl: "https://drive.google.com/uc?export=view&id=1l_c57FzZjL2wT1tzF4h7BLo85-prehWb",
    locations: ["Mount Arbora"],
    price: 10.5
  },
  {
    name: "Mournshade",
    combat: 13,
    utility: 14,
    whimsy: 13,
    rarity: "Uncommon",
    imageUrl: "https://drive.google.com/uc?export=view&id=1_2Ofv_ZT8VRxVM57RkKDZL7gPA7s_nKH",
    locations: ["Brackwater Wetlands"],
    price: 10.5
  },
  {
    name: "Mouse Tree Nut",
    combat: 4,
    utility: 6,
    whimsy: 5,
    rarity: "Common",
    imageUrl: "https://drive.google.com/uc?export=view&id=1r3fOPoAzPsaTBeZc7WZuNwpU7ZgDmhXw",
    locations: ["Coastal Highlands"],
    price: 4
  },
  {
    name: "Munchanka Root",
    combat: 17,
    utility: 11,
    whimsy: 11,
    rarity: "Uncommon",
    imageUrl: "https://drive.google.com/uc?export=view&id=1N0Q0BLCEgcNf9DPkxtr9yXUUFykdRhNR",
    locations: ["Gift of Shuritashi"],
    price: 10
  },
  {
    name: "Nakudama Spice",
    combat: 12,
    utility: 15,
    whimsy: 14,
    rarity: "Uncommon",
    imageUrl: "https://drive.google.com/uc?export=view&id=1y0SM7gVBzMYk48y7N9ArdpXKirIn8v7u",
    locations: ["Coastal Highlands", "Gift of Shuritashi"],
    price: 10.5
  },
  {
    name: "Narutomaki",
    combat: 0,
    utility: 0,
    whimsy: 0,
    rarity: "Common",
    imageUrl: "https://drive.google.com/uc?export=view&id=1tp3BwZpR59xK3le727A-mbM7qF7jeoKh",
    locations: ["Brackwater Wetlands", "Gift of Shuritashi"],
    price: 0.25
  },
  {
    name: "Night Thistle",
    combat: 14,
    utility: 17,
    whimsy: 16,
    rarity: "Uncommon",
    imageUrl: "https://drive.google.com/uc?export=view&id=1MZt_C9W1bdeO582lD0POcxDhqhUpu29_",
    locations: ["Brackwater Wetlands"],
    price: 12
  },
  {
    name: "Nobblewort",
    combat: 3,
    utility: 1,
    whimsy: 2,
    rarity: "Common",
    imageUrl: "https://drive.google.com/uc?export=view&id=1ODyq86IiPi7gikRQ0373nOgE61ZgRutO",
    locations: ["Gale Fields", "Gift of Shuritashi", "Mount Arbora"],
    price: 1.75
  },
  {
    name: "Nokumai's Frozen Breath",
    combat: 0,
    utility: 0,
    whimsy: 20,
    rarity: "Rare",
    imageUrl: "https://drive.google.com/uc?export=view&id=1sRn4xgLlj1QhiN7lqMUM_NAqI2gR756h",
    locations: [],
    price: 0
  },
  {
    name: "Noodle Eel",
    combat: 13,
    utility: 12,
    whimsy: 16,
    rarity: "Uncommon",
    imageUrl: "https://drive.google.com/uc?export=view&id=16W1Ax4MBYxC-FUkS2vk57VHVSwqkM9pZ",
    locations: ["Brackwater Wetlands", "Coastal Highlands", "Gale Fields", "Gift of Shuritashi", "Land of Hot Water", "Mount Arbora", "Shallows"],
    price: 10.5
  },
  {
    name: "Oporion Glass",
    combat: 1,
    utility: 10,
    whimsy: 0,
    rarity: "Common",
    imageUrl: "https://drive.google.com/uc?export=view&id=12IB3Qe-VBkekc1NylsNBB2Zl0wBPQazW",
    locations: ["Land of Hot Water", "Mount Arbora", "Shallows"],
    price: 3
  },
  {
    name: "Opu Opu Spring Water",
    combat: 11,
    utility: 16,
    whimsy: 14,
    rarity: "Uncommon",
    imageUrl: "https://drive.google.com/uc?export=view&id=1K5KU9D3NqSY7KeC13rdY6_dR7DG2rjGM",
    locations: ["Mount Arbora"],
    price: 10.5
  },
  {
    name: "Origami Crane",
    combat: 6,
    utility: 0,
    whimsy: 10,
    rarity: "Common",
    imageUrl: "https://drive.google.com/uc?export=view&id=1V_fJ3V8CU0dw9FuShMuhZUEAY084l5px",
    locations: ["Land of Hot Water"],
    price: 4.25
  },
  {
    name: "Ota Lantern Oil",
    combat: 0,
    utility: 20,
    whimsy: 0,
    rarity: "Rare",
    imageUrl: "https://drive.google.com/uc?export=view&id=1RyhH-tDXd_QFgGeg8b0Kcc30cqS2V_zv",
    locations: [],
    price: 5.25
  },
  {
    name: "Peeping Willow",
    combat: 0,
    utility: 0,
    whimsy: 1,
    rarity: "Common",
    imageUrl: "https://drive.google.com/uc?export=view&id=12jz66kLw3mCKhC8gLTCKrb1lsmOC4Rde",
    locations: ["Mount Arbora"],
    price: 0.5
  },
  {
    name: "Petrified Alligator",
    combat: 15,
    utility: 16,
    whimsy: 13,
    rarity: "Uncommon",
    imageUrl: "https://drive.google.com/uc?export=view&id=1mD_cLKqn1xiydyhH4lKmNuPdCkQ8Ps5g",
    locations: ["Brackwater Wetlands", "Coastal Highlands", "Gale Fields", "Gift of Shuritashi", "Land of Hot Water", "Mount Arbora", "Shallows"],
    price: 11.25
  },
  {
    name: "Pink Candle Wax",
    combat: 2,
    utility: 2,
    whimsy: 0,
    rarity: "Common",
    imageUrl: "https://drive.google.com/uc?export=view&id=1jTOFrf0EfmqXal523YY8mnmfX2wMZsn0",
    locations: ["Coastal Highlands", "Gift of Shuritashi", "Land of Hot Water"],
    price: 1.25
  },
  {
    name: "Plumage of a Running Kirio",
    combat: 18,
    utility: 18,
    whimsy: 19,
    rarity: "Rare",
    imageUrl: "https://drive.google.com/uc?export=view&id=1lay0s9UTQ2VVeHkR5HjMM3-Z7ywF_YUV",
    locations: [],
    price: 0
  },
  {
    name: "Poison",
    combat: 9,
    utility: 8,
    whimsy: 0,
    rarity: "Common",
    imageUrl: "https://drive.google.com/uc?export=view&id=1WR17tSlBj-fp6W4lZXzbm4kMz6_nIGxk",
    locations: ["Brackwater Wetlands", "Coastal Highlands", "Gale Fields", "Land of Hot Water", "Mount Arbora"],
    price: 4.5
  },
  {
    name: "Pok Pok Flakes",
    combat: 13,
    utility: 14,
    whimsy: 13,
    rarity: "Uncommon",
    imageUrl: "https://drive.google.com/uc?export=view&id=14H3tbwhqrL0tKeiITdpxc8-jJ3_SPBSO",
    locations: ["Shallows"],
    price: 10.25
  },
  {
    name: "Pungent Sea Foam",
    combat: 5,
    utility: 7,
    whimsy: 5,
    rarity: "Common",
    imageUrl: "https://drive.google.com/uc?export=view&id=19-1BGVvO-zIRoB3fZ4bAGaG6Nits8_tM",
    locations: ["Shallows"],
    price: 4.5
  },
  {
    name: "Pyramid Melon",
    combat: 2,
    utility: 2,
    whimsy: 2,
    rarity: "Common",
    imageUrl: "https://drive.google.com/uc?export=view&id=1m6Wj4EZatMLBr_4kGBzN0bjYoi4GYImU",
    locations: ["Gale Fields"],
    price: 1.75
  },
  {
    name: "Queen's Dilemma",
    combat: 7,
    utility: 5,
    whimsy: 3,
    rarity: "Common",
    imageUrl: "https://drive.google.com/uc?export=view&id=1nQxo9xbY3DnNzzWOYdXdfVZycmBmn6M1",
    locations: ["Brackwater Wetlands", "Gift of Shuritashi", "Mount Arbora"],
    price: 4
  },
  {
    name: "Raka Paste",
    combat: 4,
    utility: 10,
    whimsy: 0,
    rarity: "Common",
    imageUrl: "https://drive.google.com/uc?export=view&id=157NyCkn3uLN6820ya6SuIWr5l1YAGeOS",
    locations: ["Brackwater Wetlands", "Land of Hot Water", "Mount Arbora"],
    price: 0
  },
  {
    name: "Rattle Shoot",
    combat: 10,
    utility: 8,
    whimsy: 7,
    rarity: "Common",
    imageUrl: "https://drive.google.com/uc?export=view&id=1elnfxSDIK_nF5MkS2jcBcsRMP-8SejcJ",
    locations: ["Gale Fields"],
    price: 6.5
  },
  {
    name: "Ribbon Rot",
    combat: 5,
    utility: 3,
    whimsy: 9,
    rarity: "Common",
    imageUrl: "https://drive.google.com/uc?export=view&id=137d1ydRcfayJdcurDbQxv0ZzBQwZjql8",
    locations: ["Brackwater Wetlands"],
    price: 4.5
  },
  {
    name: "Ronin Neko Figurine",
    combat: 0,
    utility: 19,
    whimsy: 18,
    rarity: "Rare",
    imageUrl: "https://drive.google.com/uc?export=view&id=1LLYxyjcRud1XfQKn16d8L7rHftT8oeuK",
    locations: [],
    price: 9.5
  },
  {
    name: "Rubble from a Rubble Golem",
    combat: 16,
    utility: 11,
    whimsy: 15,
    rarity: "Uncommon",
    imageUrl: "https://drive.google.com/uc?export=view&id=1tCzpvJbxCk-4zhSuP6jv8qjafVAUOwF4",
    locations: [],
    price: 0
  },
  {
    name: "Rust Crab",
    combat: 8,
    utility: 4,
    whimsy: 2,
    rarity: "Common",
    imageUrl: "https://drive.google.com/uc?export=view&id=1D3xubPGdMHL--6coaVIL4ACigAeg4F79",
    locations: ["Shallows"],
    price: 3.75
  },
  {
    name: "Sage Arol's Beetle",
    combat: 18,
    utility: 20,
    whimsy: 0,
    rarity: "Rare",
    imageUrl: "https://drive.google.com/uc?export=view&id=1U-lnpc2kuet_9bYUcJdXo6qMU7X0h7Oz",
    locations: [],
    price: 9.75
  },
  {
    name: "Scalefruit Rind",
    combat: 4,
    utility: 2,
    whimsy: 2,
    rarity: "Common",
    imageUrl: "https://drive.google.com/uc?export=view&id=1yLuVERMW7cPwgea7_RQsKdYxU0N297mF",
    locations: ["Brackwater Wetlands", "Gift of Shuritashi"],
    price: 2.25
  },
  {
    name: "Scumweed",
    combat: 11,
    utility: 12,
    whimsy: 11,
    rarity: "Uncommon",
    imageUrl: "https://drive.google.com/uc?export=view&id=10uG82vWIVAvKOu0CvzlvnzcAW3q55sgz",
    locations: ["Brackwater Wetlands"],
    price: 8.75
  },
  {
    name: "Sea Water",
    combat: 1,
    utility: 0,
    whimsy: 0,
    rarity: "Common",
    imageUrl: "https://drive.google.com/uc?export=view&id=17xJANb0-LG23HHt7l12eN7ZwlgC0hEyZ",
    locations: ["Brackwater Wetlands", "Gift of Shuritashi", "Land of Hot Water", "Shallows"],
    price: 0
  },
  {
    name: "Seashell",
    combat: 0,
    utility: 0,
    whimsy: 1,
    rarity: "Common",
    imageUrl: "https://drive.google.com/uc?export=view&id=1jYFVkRqbJzQyJ77QZHkpK1IQU4cHH-9B",
    locations: ["Brackwater Wetlands", "Gift of Shuritashi", "Land of Hot Water", "Shallows"],
    price: 0.5
  },
  {
    name: "Shadowroot",
    combat: 15,
    utility: 13,
    whimsy: 12,
    rarity: "Uncommon",
    imageUrl: "https://drive.google.com/uc?export=view&id=1TT_7aCP9uHSud6wcAB1Q78759qWOGMwG",
    locations: ["Brackwater Wetlands", "Gift of Shuritashi"],
    price: 10.25
  },
  {
    name: "Sheep Dragon Wool",
    combat: 10,
    utility: 8,
    whimsy: 7,
    rarity: "Common",
    imageUrl: "https://drive.google.com/uc?export=view&id=1JLRK2iTPB6AX7237NlXkR3YsSWMWoeSm",
    locations: ["Coastal Highlands", "Gale Fields"],
    price: 6.5
  },
  {
    name: "Sleeping Merchant",
    combat: 13,
    utility: 13,
    whimsy: 13,
    rarity: "Uncommon",
    imageUrl: "https://drive.google.com/uc?export=view&id=1CgabzDTc0E-6tOcBlq329onLziRo2iFS",
    locations: [],
    price: 10
  },
  {
    name: "Slime, Corrupted",
    combat: 16,
    utility: 14,
    whimsy: 13,
    rarity: "Uncommon",
    imageUrl: "https://drive.google.com/uc?export=view&id=1AUt7vxEz274RtwJOIw_FP_kbeAwVoj6U",
    locations: ["Brackwater Wetlands"],
    price: 0
  },
  {
    name: "Slime, Green",
    combat: 8,
    utility: 6,
    whimsy: 7,
    rarity: "Common",
    imageUrl: "https://drive.google.com/uc?export=view&id=1CDvFfbm6u3E_XZS9th_q8-kRc2mMkoPV",
    locations: ["Brackwater Wetlands", "Coastal Highlands", "Gale Fields", "Gift of Shuritashi"],
    price: 0
  },
  {
    name: "Slime, Orange",
    combat: 20,
    utility: 20,
    whimsy: 20,
    rarity: "Rare",
    imageUrl: "https://drive.google.com/uc?export=view&id=1WxAC6j3faP82gXJmdD7PdGNAaiyJ9lpe",
    locations: [],
    price: 0
  },
  {
    name: "Slime, Yellow",
    combat: 17,
    utility: 11,
    whimsy: 11,
    rarity: "Uncommon",
    imageUrl: "https://drive.google.com/uc?export=view&id=1oQKjZJqSZldhb7zob5OwBKsMlh79kmgJ",
    locations: ["Land of Hot Water"],
    price: 0
  },
  {
    name: "Snap Vine Sap",
    combat: 0,
    utility: 2,
    whimsy: 0,
    rarity: "Common",
    imageUrl: "https://drive.google.com/uc?export=view&id=1WDrG7odxXYh-TUcDr3LXQQtUOe4POeed",
    locations: ["Coastal Highlands"],
    price: 0.75
  },
  {
    name: "Spark Plug",
    combat: 11,
    utility: 17,
    whimsy: 11,
    rarity: "Uncommon",
    imageUrl: "https://drive.google.com/uc?export=view&id=1qPHb2z0q4002reFAWZqHaGcfFfvWUng7",
    locations: ["Brackwater Wetlands", "Coastal Highlands", "Gale Fields", "Gift of Shuritashi", "Land of Hot Water", "Mount Arbora"],
    price: 10
  },
  {
    name: "Spindle Leg Spider Webs",
    combat: 5,
    utility: 9,
    whimsy: 6,
    rarity: "Common",
    imageUrl: "https://drive.google.com/uc?export=view&id=1al2Nuz___yrDmIeUDQOdEaVtewB5sZ-Q",
    locations: ["Coastal Highlands", "Gale Fields", "Gift of Shuritashi"],
    price: 0
  },
  {
    name: "Spirit Root",
    combat: 6,
    utility: 0,
    whimsy: 9,
    rarity: "Common",
    imageUrl: "https://drive.google.com/uc?export=view&id=1_acDanY2aoDXNSy_TdgSzo9QtQUR2ckg",
    locations: ["Mount Arbora"],
    price: 4
  },
  {
    name: "Spirit Tea",
    combat: 11,
    utility: 11,
    whimsy: 17,
    rarity: "Uncommon",
    imageUrl: "https://drive.google.com/uc?export=view&id=1TtPT_EoVuABIUxv3HZFa_gmsKywpNW98",
    locations: ["Land of Hot Water"],
    price: 10
  },
  {
    name: "Spring",
    combat: 14,
    utility: 17,
    whimsy: 15,
    rarity: "Uncommon",
    imageUrl: "https://drive.google.com/uc?export=view&id=18FpQrC6hFDzLCakJWsHHOV5PQ6DbyDI4",
    locations: ["Brackwater Wetlands", "Coastal Highlands", "Gale Fields", "Gift of Shuritashi", "Land of Hot Water", "Mount Arbora"],
    price: 11.75
  },
  {
    name: "Squid Ink",
    combat: 4,
    utility: 9,
    whimsy: 7,
    rarity: "Common",
    imageUrl: "https://drive.google.com/uc?export=view&id=1ff-ad_HrzFWbsZVXK9XLEmCbAfmlFXxJ",
    locations: ["Shallows"],
    price: 5.25
  },
  {
    name: "Starstone",
    combat: 18,
    utility: 0,
    whimsy: 19,
    rarity: "Rare",
    imageUrl: "https://drive.google.com/uc?export=view&id=193QBdopEdgrnXFKLqj8LHRcWEeXcuy45",
    locations: [],
    price: 9.5
  },
  {
    name: "Sun Shroom",
    combat: 13,
    utility: 16,
    whimsy: 14,
    rarity: "Uncommon",
    imageUrl: "https://drive.google.com/uc?export=view&id=1YqmRfru-dBzk6Bpzfqlo9iSrfYyJUqGu",
    locations: ["Gale Fields"],
    price: 11
  },
  {
    name: "Tangle Weed",
    combat: 8,
    utility: 8,
    whimsy: 4,
    rarity: "Common",
    imageUrl: "https://drive.google.com/uc?export=view&id=1HmOU--UXLHNWAaI3gz1xiGIsO0rXhmlm",
    locations: ["Shallows"],
    price: 5.25
  },
  {
    name: "Tears of the Moon",
    combat: 18,
    utility: 18,
    whimsy: 18,
    rarity: "Rare",
    imageUrl: "https://drive.google.com/uc?export=view&id=1Au3TsZ5hul1zeek1eFTE-9sUz2ZUvSc4",
    locations: [],
    price: 13.75
  },
  {
    name: "Toka Truffle",
    combat: 15,
    utility: 12,
    whimsy: 14,
    rarity: "Uncommon",
    imageUrl: "https://drive.google.com/uc?export=view&id=1rwtp_iCmoWxjNEAIDOMPD76NnT4GLTO0",
    locations: ["Gift of Shuritashi"],
    price: 10.5
  },
  {
    name: "Ube",
    combat: 2,
    utility: 6,
    whimsy: 5,
    rarity: "Common",
    imageUrl: "https://drive.google.com/uc?export=view&id=138ntI_5HJWNP39dzSVZnPh2aEqyomGA_",
    locations: ["Gale Fields"],
    price: 3.5
  },
  {
    name: "Varrow",
    combat: 0,
    utility: 1,
    whimsy: 0,
    rarity: "Common",
    imageUrl: "https://drive.google.com/uc?export=view&id=12q7HU8XM1HZ989nUoH4WgPFO9kFz_7hm",
    locations: ["Brackwater Wetlands", "Gift of Shuritashi", "Land of Hot Water"],
    price: 0.5
  },
  {
    name: "Venus Fly Rat",
    combat: 9,
    utility: 2,
    whimsy: 8,
    rarity: "Common",
    imageUrl: "https://drive.google.com/uc?export=view&id=1Yid7-R_9rpao_h-zEcK1e82wBQ6wlA9o",
    locations: ["Coastal Highlands"],
    price: 5
  },
  {
    name: "Vinyl Record",
    combat: 15,
    utility: 15,
    whimsy: 15,
    rarity: "Uncommon",
    imageUrl: "https://drive.google.com/uc?export=view&id=1NJXd-T_gIn-p3I1vyUSqVxHdc7rBEHm-",
    locations: ["Brackwater Wetlands", "Coastal Highlands", "Gale Fields", "Gift of Shuritashi", "Land of Hot Water", "Mount Arbora"],
    price: 11.5
  },
  {
    name: "Windbloom",
    combat: 6,
    utility: 7,
    whimsy: 0,
    rarity: "Common",
    imageUrl: "https://drive.google.com/uc?export=view&id=14S-I7ZfHvg97HCW3UDigt2RK4rC520_w",
    locations: ["Gale Fields", "Land of Hot Water", "Mount Arbora"],
    price: 3.5
  },
  {
    name: "Witch's Broom",
    combat: 3,
    utility: 0,
    whimsy: 5,
    rarity: "Common",
    imageUrl: "https://drive.google.com/uc?export=view&id=1bQ6RMzERALvpyQ9jKA0K_HnXu3echtjK",
    locations: ["Gale Fields"],
    price: 2.25
  },
  {
    name: "Witch's Eye Coral",
    combat: 1,
    utility: 0,
    whimsy: 10,
    rarity: "Common",
    imageUrl: "https://drive.google.com/uc?export=view&id=1wlLHLmmAufsxkAvq5LK3td2Fu_HLXQuR",
    locations: ["Shallows"],
    price: 3
  },
  {
    name: "Wolfenite",
    combat: 11,
    utility: 17,
    whimsy: 11,
    rarity: "Uncommon",
    imageUrl: "https://drive.google.com/uc?export=view&id=1Ex6bLnriIaOD7F780pSeSJBPz5CY4wTE",
    locations: ["Brackwater Wetlands", "Gale Fields", "Mount Arbora"],
    price: 10
  },
  {
    name: "Wufu Whisky",
    combat: 19,
    utility: 19,
    whimsy: 19,
    rarity: "Rare",
    imageUrl: "https://drive.google.com/uc?export=view&id=1WZMgYzp64diSZZ-7H58T4uh-_IrvJ-4e",
    locations: [],
    price: 14.5
  },
  {
    name: "Wychwood",
    combat: 14,
    utility: 13,
    whimsy: 15,
    rarity: "Uncommon",
    imageUrl: "https://drive.google.com/uc?export=view&id=1hDXz6G85y1540IPnimsZfu6oygq749pA",
    locations: ["Gift of Shuritashi"],
    price: 10.75
  },
  {
    name: "Yugi Sap",
    combat: 0,
    utility: 4,
    whimsy: 2,
    rarity: "Common",
    imageUrl: "https://drive.google.com/uc?export=view&id=1waAOlfTpLwmP5hMAYE89Ixlj3sa6B24S",
    locations: ["Gale Fields", "Gift of Shuritashi", "Mount Arbora"],
    price: 1.75
  },
  {
    name: "Yuma Shrub",
    combat: 5,
    utility: 8,
    whimsy: 4,
    rarity: "Common",
    imageUrl: "https://drive.google.com/uc?export=view&id=1a3kPUeU2fQ66hid_-xyv57IImIystOED",
    locations: ["Coastal Highlands", "Mount Arbora"],
    price: 4.5
  }
];