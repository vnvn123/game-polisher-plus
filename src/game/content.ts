import { ART } from "./assets";
import riftMines from "@/assets/rift-mines.png";
import voidLance from "@/assets/void-lance.png";
import riftwalkerAsset from "@/assets/riftwalker.png.asset.json";
const riftwalker = riftwalkerAsset.url;
import alchemistAsset from "@/assets/alchemist.png.asset.json";
const alchemist = alchemistAsset.url;
import fortressAsset from "@/assets/fortress.jpg.asset.json";
const fortress = fortressAsset.url;
import libraryAsset from "@/assets/library.jpg.asset.json";
const library = libraryAsset.url;
import cityAsset from "@/assets/city.jpg.asset.json";
const city = cityAsset.url;
export const RARITIES = ["Common", "Rare", "Epic", "Mythic", "Legendary", "S-Tier"] as const;
export const RARITY_SCALE = [0.35, 0.65, 1, 1.12, 1.3, 1.5];
export const CAPS = {
  cooldown: 0.25,
  defense: 0.3,
  coin: 1.5,
  armor: 20,
  permanent: 15,
  run: 8,
  slots: 5,
};
export const HEROES = [
  {
    id: "nightfang",
    name: "Nightfang",
    title: "The Crimson Heir",
    hp: 100,
    speed: 210,
    speedLabel: "Very fast",
    weapon: "bats",
    art: ART.vampire,
    cost: 0,
    need: 0,
    lore: "Three centuries of hunger. One final night to break the curse.",
  },
  {
    id: "hunter",
    name: "Gloam Hunter",
    title: "The Briarborn",
    hp: 150,
    speed: 180,
    speedLabel: "Normal",
    weapon: "bow",
    art: ART.huntress,
    cost: 600,
    need: 100,
    lore: "The forest took her name. In return, it taught her where monsters hide.",
  },
  {
    id: "gravebound",
    name: "Gravebound",
    title: "The Oath Unbroken",
    hp: 200,
    speed: 155,
    speedLabel: "Moderately slow",
    weapon: "wraith",
    art: ART.knight,
    cost: 1200,
    need: 500,
    lore: "His kingdom fell. His oath did not.",
  },
  {
    id: "stormcaller",
    name: "Stormcaller",
    title: "Keeper of the Tempest",
    hp: 125,
    speed: 195,
    speedLabel: "Fast",
    weapon: "storm",
    art: ART.necro,
    cost: 1800,
    need: 1000,
    lore: "The dead whisper. The storm answers.",
  },
  {
    id: "riftwalker",
    name: "Riftwalker",
    title: "Beyond the Veil",
    hp: 125,
    speed: 180,
    speedLabel: "Normal",
    weapon: "gravebolt",
    art: riftwalker,
    cost: 2400,
    need: 2000,
    lore: "A wanderer between the places that should not exist.",
  },
  {
    id: "alchemist",
    name: "Plague Alchemist",
    title: "The Last Remedy",
    hp: 175,
    speed: 190,
    speedLabel: "Moderately fast",
    weapon: "electro",
    art: alchemist,
    cost: 3000,
    need: 3000,
    lore: "Every poison has a cure. Every cure has a price.",
  },
];
export interface Weapon {
  id: string;
  name: string;
  art: string;
  damage: number;
  cooldown: number;
  range: number;
  kind: string;
  description: string;
  levels: string[];
}
export const WEAPONS: Weapon[] = [
  {
    id: "storm",
    name: "Storm",
    art: ART.staff,
    damage: 20,
    cooldown: 6.5,
    range: 280,
    kind: "area",
    description: "A storm cloud strikes nearby enemies every 0.75s for 3s.",
    levels: [
      "20 damage per tick · 1 target",
      "Damage +20%",
      "Chains to 1 additional target",
      "Range +25%",
      "Chains to 3 additional targets · damage +20%",
      "Chain range +20%",
      "Damage +15% · cooldown −5%",
      "First target +20% damage",
    ],
  },
  {
    id: "electro",
    name: "Electro Zone",
    art: ART.witchglass,
    damage: 10,
    cooldown: 1,
    range: 105,
    kind: "area",
    description: "A pulsing field around you. 10 damage every second.",
    levels: [
      "10 damage per tick",
      "Damage +20%",
      "Radius +20%",
      "Field cycle +1s",
      "One final pulse each cycle",
      "Duration +15%",
      "Damage inside field +10%",
      "One extra pulse each cycle",
    ],
  },
  {
    id: "lightning",
    name: "Lightning",
    art: ART["ashen-covenant"],
    damage: 30,
    cooldown: 2.5,
    range: 320,
    kind: "chain",
    description: "A focused strike that bounces between nearby foes.",
    levels: [
      "30 damage · 2.5s cooldown",
      "Damage +20%",
      "1 additional target",
      "Attack frequency +20%",
      "Up to 8 targets",
      "1 additional target",
      "Range and speed +20%",
      "Every fourth strike +25% primary damage",
    ],
  },
  {
    id: "bats",
    name: "Cursed Bats",
    art: ART.raven,
    damage: 23,
    cooldown: 7,
    range: 105,
    kind: "orbit",
    description: "Spectral bats orbit for 4s, then rest for 3s.",
    levels: [
      "1 bat · 23 damage",
      "1 additional bat",
      "Damage +20%",
      "Return 15% faster",
      "2 additional bats · damage +20%",
      "Active duration +15%",
      "Previously bitten enemies take +10%",
      "One temporary bat every third cycle",
    ],
  },
  {
    id: "gravebolt",
    name: "Gravebolt Wand",
    art: ART.wand,
    damage: 22,
    cooldown: 2.2,
    range: 480,
    kind: "bolt",
    description: "A seeking bolt curves toward the nearest foe.",
    levels: [
      "22 damage · 2.2s cooldown",
      "Damage +15%",
      "Bolt speed +20%",
      "Cooldown −10%",
      "Pierces 1 enemy",
      "Pierces 1 additional enemy",
      "Speed +20% · cooldown −10%",
      "1 additional bolt at an alternate target",
    ],
  },
  {
    id: "bow",
    name: "Spectral Bow",
    art: ART.bow,
    damage: 18,
    cooldown: 1.9,
    range: 570,
    kind: "arrow",
    description: "Swift spectral arrows pierce the darkness.",
    levels: [
      "18 damage · 1.9s cooldown",
      "1 additional arrow",
      "Pierces 1 enemy",
      "Arrow speed +20%",
      "Damage +20%",
      "Pierces 1 additional enemy",
      "Speed +20% · cooldown −10%",
      "1 additional spread arrow",
    ],
  },
  {
    id: "wraith",
    name: "Wraithblade",
    art: ART.sword,
    damage: 30,
    cooldown: 2,
    range: 115,
    kind: "arc",
    description: "A spectral blade sweeps a short forward arc.",
    levels: [
      "30 damage · 2s cooldown",
      "Damage +20%",
      "Reach +20%",
      "Arc width +20%",
      "Cooldown −10%",
      "Reach +15%",
      "Cooldown −12%",
      "A second delayed spectral slash",
    ],
  },
  {
    id: "harvest",
    name: "Soul Harvester",
    art: ART.scythe,
    damage: 16,
    cooldown: 2.8,
    range: 280,
    kind: "return",
    description: "A spectral scythe strikes outward and returns.",
    levels: [
      "16 damage · 2.8s cooldown",
      "Damage +15%",
      "Travel distance +20%",
      "Travel speed +20%",
      "Pierces 2 additional enemies",
      "Travel distance +15%",
      "Damage +15% · return speed +15%",
      "A brief after-sweep on return",
    ],
  },
  {
    id: "mines",
    name: "Rift Mines",
    art: riftMines,
    damage: 40,
    cooldown: 3.5,
    range: 80,
    kind: "mine",
    description: "Armed rifts explode when enemies draw near.",
    levels: [
      "40 damage · 3.5s placement",
      "1 additional mine",
      "Radius +20%",
      "Damage +20%",
      "Explosion briefly slows normal enemies",
      "1 additional mine",
      "Radius +15% · damage +10%",
      "One secondary burst at 50% damage",
    ],
  },
  {
    id: "lance",
    name: "Void Lance",
    art: voidLance,
    damage: 65,
    cooldown: 5,
    range: 650,
    kind: "beam",
    description: "A narrow piercing lance with a 0.8s charge.",
    levels: [
      "65 damage · 0.8s charge · 5s cooldown",
      "Charge time −10%",
      "Damage +20%",
      "Beam width +20%",
      "A small final burst",
      "Pierces 1 additional enemy",
      "Charge time −15%",
      "A controlled void trail",
    ],
  },
];
export const PASSIVES = [
  { id: "swift", name: "Swiftstep", art: ART.daggers, effect: "+3% movement speed · cap 15%" },
  { id: "vital", name: "Vital Core", art: ART.witchglass, effect: "+10 maximum HP · cap +50" },
  {
    id: "root",
    name: "Bloodroot",
    art: ART["saints-lament"],
    effect: "0.5–1.5 HP regenerated per second",
  },
  { id: "lens", name: "Arcane Lens", art: ART.wand, effect: "+4% weapon damage · cap 20%" },
  {
    id: "pulse",
    name: "Quickened Pulse",
    art: ART["ashen-covenant"],
    effect: "−3% weapon cooldown · cap 15%",
  },
  { id: "sight", name: "Far-Sight Charm", art: ART.bow, effect: "+8% projectile range · cap 40%" },
  { id: "glass", name: "Stormglass", art: ART.staff, effect: "+3% attack area · cap 15%" },
  { id: "magnet", name: "Soul Magnet", art: ART.scythe, effect: "+15% pickup range · cap 75%" },
  { id: "iron", name: "Iron Heart", art: ART.sword, effect: "−3% incoming damage · cap 15%" },
  {
    id: "fortune",
    name: "Fortune Sigil",
    art: ART.raven,
    effect: "+3 percentage points bonus crystal chance · cap 15%",
  },
];
export const SETS = [
  [
    "Wolfbound",
    "Pack Instinct",
    "Repeated hits mark a target.",
    "Moonlit Pursuit",
    "Defeating a marked enemy briefly grants crowd mobility.",
  ],
  [
    "Hollow Witch",
    "Hex Thread",
    "Repeated hits consume a hex for bonus damage.",
    "Coven’s Debt",
    "Consumed hexes spread to at most 2 nearby enemies.",
  ],
  [
    "Cursed Knight",
    "Last Stand",
    "After taking damage, avoid damage for 4s to gain resolve.",
    "Oath Unbroken",
    "At low health, stagger an elite once every 20s.",
  ],
  [
    "Plague Doctor",
    "Contagion",
    "Defeated foes leave brief decay patches.",
    "Patient Zero",
    "Kills in decay extend a patch up to 5s.",
  ],
  [
    "Wraith Archer",
    "Marked Quarry",
    "Three consecutive hits mark a target.",
    "Piercing Omen",
    "Consume a mark for extra piercing or modest boss damage.",
  ],
  [
    "Stormforged",
    "Static Charge",
    "Every fourth hit shocks a nearby foe.",
    "Thunderhead",
    "A shock leaves a brief storm mark.",
  ],
  [
    "Grave Scholar",
    "Forbidden Notes",
    "First defeats of a type grant a research mark.",
    "Footnote of Doom",
    "The next hit against that type consumes research.",
  ],
  [
    "Riftwalker",
    "Rift Residue",
    "Passing through a close gap leaves a brief rift.",
    "Folded Distance",
    "A qualifying hit triggers a small secondary strike.",
  ],
  [
    "Revenant Royalty",
    "Royal Decree",
    "Defeating elites grants a royal charge.",
    "Edict of Ruin",
    "Spend a charge to weaken ordinary enemies.",
  ],
  [
    "Starless Sovereign",
    "Ominous Alignment",
    "Rapid defeats build alignment.",
    "Eclipse Event",
    "Full alignment enhances the next pet activation.",
  ],
];
export const RINGS = [
  ["Last Echo", "Ring of Last Echo", "20% killing-blow echo · cap 40 damage · 1.5s cooldown"],
  [
    "Borrowed Seconds",
    "Borrowed Seconds",
    "250 damage slows elite 12% / boss 6% for 2s · 8s cooldown",
  ],
  ["Unbroken Path", "Unbroken Path", "Pass 5 foes in 3s: trail deals 12 damage · 3 trails maximum"],
  [
    "Unseen Hoard",
    "Unseen Hoard",
    "Discovery range +25% · elite 5% chance of 5 coins · 10s cooldown",
  ],
  ["Cinder Debt", "Cinder Debt", "Store 5% damage up to 100 · release every 3s"],
  ["Fractured Fate", "Fractured Fate", "Boss marks grant +8% damage for 5s · no stacking"],
  ["Pale Collector", "Pale Collector", "20 hits release a fragment · next crystal +10% XP · cap 3"],
  ["Twin Eclipse", "Twin Eclipse", "Alternate every 6s: next area / single hit +10%"],
  ["Dying Lantern", "Dying Lantern", "Below 25% HP: outline nearby enemies for 3s · 45s cooldown"],
  ["Huntmaster", "Huntmaster", "4 different kills in 8s: next elite hit +15% · 15s cooldown"],
];
export const PETS = [
  ["Gravehound", "Soul Howl", 24, 5, "Marks 8 enemies · next 3 hits +8% damage / bosses +4%"],
  ["Mourning Moth", "Veil of Dusk", 28, 4, "Slows enemies 15% / bosses 5%"],
  ["Bone Raven", "Carrion Dive", 18, 3, "35 damage to 6 targets · next hit +5% / bosses +2.5%"],
  [
    "Rune Wisp",
    "Anchor Sigil",
    26,
    5,
    "18 damage once · stagger 0.25s · bosses cannot be staggered",
  ],
  ["Emberfox", "Foxfire Trail", 22, 3, "Four fire patches · 12 damage each second"],
  ["Graveclock Spider", "Time Snare", 25, 8, "20 damage · slow 25% / bosses 8%"],
  ["Mireling", "Bog Bloom", 30, 4, "8 damage per second · enemy contact −10% / bosses −3%"],
  [
    "Shardback",
    "Crystal Burst",
    32,
    1,
    "Spend 5% current XP progress · 45 damage · push normal enemies",
  ],
  ["Hollowcat", "False Shadow", 35, 4, "120 HP decoy · bosses distracted for at most 1s"],
  ["Wraithstag", "Phantom Charge", 27, 2, "30 damage to 8 targets · trail deals 10 once"],
] as const;
export type Slot = "helmet" | "chest" | "boots" | "accessory" | "ring1" | "ring2" | "pet";
export const SLOTS: Slot[] = ["helmet", "chest", "boots", "accessory", "ring1", "ring2", "pet"];
export interface Item {
  id: string;
  name: string;
  category: "armor" | "ring" | "pet";
  slot: string;
  set: number;
  rarity: number;
  level: number;
  count: number;
}
export function itemName(category: string, index: number, slot: string) {
  return category === "armor"
    ? `${SETS[index]?.[0]} ${slot === "chest" ? "Chestplate" : slot[0]?.toUpperCase() + slot.slice(1)}`
    : category === "ring"
      ? String(RINGS[index]?.[1])
      : String(PETS[index]?.[0]);
}
export const CHESTS = [
  { id: "rare", name: "Rare Chest", price: 75, odds: [75, 20, 4, 0.8, 0.199, 0.001] },
  { id: "epic", name: "Epic Chest", price: 200, odds: [20, 35, 35, 7, 2, 1] },
  { id: "legendary", name: "Legendary Chest", price: 600, odds: [5, 10, 20, 30, 30, 5] },
  { id: "s-tier", name: "S-Tier Chest", price: 1250, odds: [0, 0, 5, 15, 45, 35] },
];
export interface EnemyDef {
  id: string;
  name: string;
  hp: number;
  dps: number;
  speed: number;
  cell: number;
  boss: boolean;
  tier: string;
  at: number;
  behaviour: string;
}
const normalNames = [
  "Plague Rat",
  "Rottenling",
  "Thorn Crawler",
  "Gravewalker",
  "Bloodfang",
  "Mossback",
  "Hollow Stalker",
  "Briarbound",
  "Crypt Guard",
  "Antlered Hunter",
  "Ironroot Brute",
  "Dread Hound",
];
const hp = [15, 30, 40, 45, 50, 75, 85, 100, 115, 140, 160, 120],
  dps = [10, 15, 15, 20, 35, 25, 25, 30, 35, 45, 50, 40],
  speeds = [135, 85, 115, 70, 105, 55, 75, 65, 55, 90, 45, 120];
const bossNames = [
  "Thornmaw",
  "The Blighted Knight",
  "Witch of the Hollow",
  "The Root-Crowned",
  "The Bellkeeper",
  "The Hollow Colossus",
  "The Antlered Dark",
];
const bossHp = [200, 275, 350, 500, 650, 750, 2500],
  bossAt = [240, 480, 720, 960, 1200, 1500, 1800];
const otherNames = [
  [
    "Ink Rat",
    "Dustbound",
    "Page Crawler",
    "Silent Scholar",
    "Quillfang",
    "Tomeback",
    "Index Stalker",
    "Binding Horror",
    "Archive Guard",
    "Blind Curator",
    "Ironbound Golem",
    "Margin Hound",
  ],
  [
    "Ash Rat",
    "Cinderling",
    "Gutter Crawler",
    "Grave Citizen",
    "Bloodmongrel",
    "Rubbleback",
    "Alley Stalker",
    "Briar Butcher",
    "City Watch",
    "Antler Reaver",
    "Iron Gate Brute",
    "Dread Mastiff",
  ],
];
const otherBoss = [
  [
    "The Bookmaw",
    "The Hollow Librarian",
    "The Ink Widow",
    "Keeper of Forbidden Names",
    "The Silent Bell",
    "The Walking Archive",
    "The Unwritten One",
  ],
  [
    "The Gutter King",
    "The Fallen Captain",
    "The Ash Bride",
    "The Crownless Regent",
    "The Last Bellringer",
    "The Siege Colossus",
    "The King Beneath the Ash",
  ],
];
export const WORLDS = ["Cursed Wilds", "Abandoned Library", "Abandoned City"].map((name, w) => ({
  id: ["wilds", "library", "city"][w] ?? "wilds",
  name,
  art: [fortress, library, city][w] ?? fortress,
  scale: [1, 1.2, 1.5][w] ?? 1,
  description: [
    "Something stirs beneath the roots.",
    "Every forgotten page remembers.",
    "The bells never stopped ringing.",
  ][w],
  enemies: normalNames.map((n, i): EnemyDef => ({
    id: `${w}_enemy_${i}`,
    name: w ? (otherNames[w - 1]?.[i] ?? n) : n,
    hp: (hp[i] ?? 30) * ([1, 1.2, 1.5][w] ?? 1),
    dps: (dps[i] ?? 15) * ([1, 1.2, 1.5][w] ?? 1),
    speed: speeds[i] ?? 85,
    cell: i,
    boss: false,
    tier: "normal",
    at: [0, 0, 90, 150, 300, 420, 540, 720, 900, 1080, 1260, 1440][i] ?? 0,
    behaviour:
      [
        "swarm",
        "chase",
        "flank",
        "chase",
        "lunge",
        "brute",
        "accel",
        "brute",
        "chase",
        "lunge",
        "brute",
        "accel",
      ][i] ?? "chase",
  })),
  bosses: bossNames.map((n, i): EnemyDef => ({
    id: `${w}_boss_${i}`,
    name: w ? (otherBoss[w - 1]?.[i] ?? n) : n,
    hp: (bossHp[i] ?? 200) * (i === 6 ? 1 : ([1, 1.2, 1.5][w] ?? 1)),
    dps: (i < 3 ? 60 : i === 6 ? 80 : 70) * ([1, 1.2, 1.5][w] ?? 1),
    speed: 45 + i * 2,
    cell: i,
    boss: true,
    tier: i === 6 ? "final" : i < 3 ? "medium" : "major",
    at: bossAt[i] ?? 1800,
    behaviour: ["charge", "dash", "pounce", "sweep", "stomp", "burst", "final"][i] ?? "charge",
  })),
}));
export const heroById = (id: string) => HEROES.find((h) => h.id === id) ?? HEROES[0];
export const weaponById = (id: string) => WEAPONS.find((w) => w.id === id) ?? WEAPONS[0];
export function weaponStats(id: string, level: number) {
  const w = weaponById(id);
  if (!w) throw new Error("Unknown weapon");
  let damage = w.damage,
    cooldown = w.cooldown,
    range = w.range;
  const l = Math.min(8, level);
  if (["storm", "electro", "lightning", "wraith", "lance", "mines"].includes(id) && l >= 2)
    damage *= id === "lance" ? 1 : 1.2;
  if (id === "lance" && l >= 3) damage *= 1.2;
  if (["bats", "bow"].includes(id) && l >= (id === "bats" ? 3 : 5)) damage *= 1.2;
  if (["gravebolt", "harvest"].includes(id) && l >= 2) damage *= 1.15;
  if (id === "storm" && l >= 5) damage *= 1.2;
  if (id === "bats" && l >= 5) damage *= 1.2;
  if (id === "lightning" && l >= 4) cooldown /= 1.2;
  if (["wraith", "gravebolt"].includes(id) && l >= (id === "wraith" ? 5 : 4)) cooldown *= 0.9;
  if (["gravebolt", "bow"].includes(id) && l >= 7) cooldown *= 0.9;
  if (id === "wraith" && l >= 7) cooldown *= 0.88;
  if (id === "storm" && l >= 7) {
    damage *= 1.15;
    cooldown *= 0.95;
  }
  if (id === "harvest" && l >= 7) damage *= 1.15;
  if (id === "mines" && l >= 4) damage *= 1.2;
  if (id === "mines" && l >= 7) {
    damage *= 1.1;
    range *= 1.15;
  }
  if (id === "storm" && l >= 4) range *= 1.25;
  if (["electro", "wraith", "harvest", "mines"].includes(id) && l >= 3) range *= 1.2;
  if (["wraith", "harvest"].includes(id) && l >= 6) range *= 1.15;
  return { ...w, damage, cooldown, range };
}
export interface Objective {
  id: string;
  name: string;
  description: string;
  metric: string;
  target: number;
  gems: number;
  coins: number;
  category: string;
  hidden?: boolean;
}
export const ACHIEVEMENTS: Objective[] = [
  ...[10, 50, 100, 250, 500, 1000, 2500, 5000, 10000, 25000].map((target, i) => ({
    id: `kills_${i}`,
    name:
      [
        "First Blood",
        "A Quiet Hunt",
        "Into the Dark",
        "Blood on the Roots",
        "Night Reaper",
        "A Thousand Shadows",
        "The Unending Hunt",
        "No Rest for the Wicked",
        "A Forest of Graves",
        "The Night Remembers",
      ][i] ?? "Night Hunter",
    description: `Defeat ${target.toLocaleString()} enemies.`,
    metric: "kills",
    target,
    gems: 5 + i * 2,
    coins: 50 + i * 25,
    category: "Combat",
  })),
  ...[60, 180, 300, 600, 900, 1200, 1500, 1800].map((target, i) => ({
    id: `survive_${i}`,
    name: `Endure ${Math.floor(target / 60)} Minutes`,
    description: `Survive ${Math.floor(target / 60)} minutes in a single run.`,
    metric: "best",
    target,
    gems: 5 + i * 2,
    coins: 50 + i * 25,
    category: "Survival",
  })),
  ...[1, 3, 10, 25, 50, 100].map((target, i) => ({
    id: `boss_${i}`,
    name: `Bane of Kings ${i + 1}`,
    description: `Defeat ${target} bosses.`,
    metric: "bosses",
    target,
    gems: 10 + i * 3,
    coins: 100 + i * 30,
    category: "Bosses",
  })),
  ...[1, 5, 10, 25, 50, 100].map((target, i) => ({
    id: `runs_${i}`,
    name: `Return from Darkness ${i + 1}`,
    description: `Complete ${target} runs.`,
    metric: "runs",
    target,
    gems: 5 + i * 2,
    coins: 50 + i * 20,
    category: "Progression",
  })),
  ...WEAPONS.flatMap((w) =>
    [1000, 10000, 100000].map((target, i) => ({
      id: `weapon_${w.id}_${i}`,
      name: `${w.name} Mastery ${i + 1}`,
      description: `Deal ${target.toLocaleString()} damage with ${w.name}.`,
      metric: `damage_${w.id}`,
      target,
      gems: 5 + i * 5,
      coins: 75 + i * 50,
      category: "Weapons",
    })),
  ),
  ...HEROES.map((h) => ({
    id: `hero_${h.id}`,
    name: `The Legend of ${h.name}`,
    description: `Complete 10 runs with ${h.name}.`,
    metric: `hero_${h.id}`,
    target: 10,
    gems: 15,
    coins: 200,
    category: "Characters",
  })),
  ...[1, 10, 25, 50, 100, 200].map((target, i) => ({
    id: `collection_${i}`,
    name: `Relics of the Fallen ${i + 1}`,
    description: `Collect ${target} equipment pieces.`,
    metric: "collected",
    target,
    gems: 8 + i * 2,
    coins: 100 + i * 25,
    category: "Equipment",
  })),
  ...WORLDS.map((w, i) => ({
    id: `world_${i}`,
    name: `Silence ${w.name}`,
    description: `Defeat the final boss of ${w.name}.`,
    metric: `victory_${w.id}`,
    target: 1,
    gems: 30,
    coins: 300,
    category: "Worlds",
  })),
  ...[10, 50, 100].map((target, i) => ({
    id: `pet_${i}`,
    name: `Companion of the Damned ${i + 1}`,
    description: `Activate pet abilities ${target} times.`,
    metric: "pets",
    target,
    gems: 10 + i * 5,
    coins: 100,
    category: "Pets",
  })),
  ...[1, 10, 50].map((target, i) => ({
    id: `merge_${i}`,
    name: `Forged in Darkness ${i + 1}`,
    description: `Merge equipment ${target} times.`,
    metric: "merges",
    target,
    gems: 10 + i * 5,
    coins: 100,
    category: "Equipment",
  })),
  {
    id: "hidden_1",
    name: "A Secret in the Dark",
    description: "Survive 10 minutes without taking contact damage.",
    metric: "flawless",
    target: 600,
    gems: 25,
    coins: 250,
    category: "Hidden",
    hidden: true,
  },
];
export const DAILY: Objective[] = [
  {
    id: "daily_kills",
    name: "Thin the Shadows",
    description: "Defeat 150 enemies.",
    metric: "kills",
    target: 150,
    gems: 10,
    coins: 100,
    category: "Daily",
  },
  {
    id: "daily_time",
    name: "An Hour Before Dawn",
    description: "Survive for 600 seconds.",
    metric: "time",
    target: 600,
    gems: 15,
    coins: 150,
    category: "Daily",
  },
  {
    id: "daily_boss",
    name: "Break the Crown",
    description: "Defeat 2 bosses.",
    metric: "bosses",
    target: 2,
    gems: 20,
    coins: 200,
    category: "Daily",
  },
];
export const WEEKLY: Objective[] = [
  {
    id: "weekly_kills",
    name: "A Thousand Graves",
    description: "Defeat 2000 enemies.",
    metric: "kills",
    target: 2000,
    gems: 30,
    coins: 400,
    category: "Weekly",
  },
  {
    id: "weekly_runs",
    name: "Seven Nights",
    description: "Complete 7 runs.",
    metric: "runs",
    target: 7,
    gems: 25,
    coins: 300,
    category: "Weekly",
  },
  {
    id: "weekly_bosses",
    name: "Kingslayer",
    description: "Defeat 10 bosses.",
    metric: "bosses",
    target: 10,
    gems: 35,
    coins: 500,
    category: "Weekly",
  },
  {
    id: "weekly_crystals",
    name: "Gather the Lost",
    description: "Collect 500 crystals.",
    metric: "crystals",
    target: 500,
    gems: 25,
    coins: 250,
    category: "Weekly",
  },
  {
    id: "weekly_damage",
    name: "A Debt in Blood",
    description: "Deal 50,000 damage.",
    metric: "damage",
    target: 50000,
    gems: 30,
    coins: 400,
    category: "Weekly",
  },
];
export const UPGRADES = [
  { id: "speed", name: "Swift Blood", effect: "+2% movement speed", max: 10 },
  { id: "hp", name: "Undying Heart", effect: "+5 maximum HP", max: 20 },
  { id: "damage", name: "Dark Resolve", effect: "+2% weapon damage", max: 15 },
  { id: "defense", name: "Iron Oath", effect: "+1% damage reduction", max: 15 },
  { id: "xp", name: "Forbidden Wisdom", effect: "+3% XP gain", max: 15 },
  { id: "luck", name: "Fated Star", effect: "+1% bonus crystal chance", max: 10 },
  { id: "pickup", name: "Soul Reach", effect: "+5% pickup range", max: 15 },
  { id: "coin", name: "Gilded Hunger", effect: "+5% coin multiplier · cap 1.5×", max: 10 },
];
