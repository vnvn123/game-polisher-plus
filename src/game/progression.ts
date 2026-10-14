import {
  ACHIEVEMENTS,
  CAPS,
  CHESTS,
  DAILY,
  HEROES,
  PETS,
  RARITIES,
  SETS,
  SLOTS,
  UPGRADES,
  WEAPONS,
  WEEKLY,
  heroById,
  itemName,
  type Item,
  type Slot,
} from "./content";
export interface Settings {
  numbers: boolean;
  effects: boolean;
  shake: boolean;
  animation: boolean;
  scale: number;
}
export interface Save {
  version: number;
  coins: number;
  gems: number;
  hero: string;
  world: number;
  endless: boolean;
  heroes: string[];
  heroLevels: Record<string, number>;
  weaponLevels: Record<string, number>;
  souls: Record<string, number>;
  upgrades: Record<string, number>;
  inventory: Item[];
  equipped: Partial<Record<Slot, string>>;
  stats: Record<string, number>;
  claims: Record<string, number>;
  pity: Record<string, number>;
  transactions: { id: string; label: string; coins: number; gems: number; at: number }[];
  settings: Settings;
  periods: Record<string, Record<string, number>>;
  skin: string;
}
export function freshSave(): Save {
  return {
    version: 1,
    coins: 0,
    gems: 0,
    hero: "nightfang",
    world: 0,
    endless: false,
    heroes: ["nightfang"],
    heroLevels: { nightfang: 1 },
    weaponLevels: {},
    souls: {},
    upgrades: {},
    inventory: [],
    equipped: {},
    stats: {},
    claims: {},
    pity: {},
    transactions: [],
    settings: { numbers: true, effects: true, shake: true, animation: true, scale: 1 },
    periods: {},
    skin: "original",
  };
}
export const costOf = (level: number) => Math.floor(75 * 1.3 ** level);
export const soulCost = (level: number) => 10 + level * 5;
export function periods(now: number) {
  const d = new Date(now);
  const day = d.toISOString().slice(0, 10);
  const monday = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  monday.setUTCDate(monday.getUTCDate() - ((monday.getUTCDay() + 6) % 7));
  return { daily: day, weekly: monday.toISOString().slice(0, 10) };
}
export function metric(save: Save, key: string, period?: string) {
  return (period ? save.periods[period] : save.stats)?.[key] ?? 0;
}
export function questKey(kind: "daily" | "weekly", now: number) {
  return `${kind}:${periods(now)[kind]}`;
}
export function addStats(save: Save, events: Record<string, number>, now: number) {
  for (const [key, value] of Object.entries(events)) {
    save.stats[key] = (save.stats[key] ?? 0) + value;
    for (const p of ["daily", "weekly"] as const) {
      const period = questKey(p, now);
      save.periods[period] ??= {};
      const bucket = save.periods[period];
      if (bucket) bucket[key] = (bucket[key] ?? 0) + value;
    }
  }
}
export function activeSets(save: Save) {
  const counts: Record<string, number> = {};
  for (const slot of ["helmet", "chest", "boots", "accessory"] as const) {
    const item = save.inventory.find((i) => i.id === save.equipped[slot]);
    if (item && item.rarity >= 2) counts[item.set] = (counts[item.set] ?? 0) + 1;
  }
  return counts;
}
export function equipmentStats(save: Save) {
  let hp = 0,
    damage = 0,
    speed = 0,
    defense = 0,
    xp = 0;
  for (const id of Object.values(save.equipped)) {
    const i = save.inventory.find((x) => x.id === id);
    if (!i || i.category !== "armor") continue;
    const tier = [0.35, 0.65, 1, 1.12, 1.3, 1.5][i.rarity] ?? 1;
    const value = tier * (1 + (i.level - 1) * 0.025);
    if (i.slot === "helmet") hp += 12 * value;
    if (i.slot === "chest") defense += 0.02 * value;
    if (i.slot === "boots") speed += 0.02 * value;
    if (i.slot === "accessory") {
      damage += 0.025 * value;
      xp += 0.02 * value;
    }
  }
  return { hp, damage, speed, defense: Math.min(CAPS["defense"], defense), xp };
}
export function combatStats(save: Save) {
  const hero = heroById(save.hero);
  if (!hero) throw new Error("Missing character");
  const gear = equipmentStats(save);
  const l = (save.heroLevels[hero.id] ?? 1) - 1;
  return {
    hp: hero["hp"] + gear["hp"] + l * 2 + (save.upgrades["hp"] ?? 0) * 5,
    speed: hero["speed"] * (1 + gear["speed"] + l * 0.002 + (save.upgrades["speed"] ?? 0) * 0.02),
    damage: 1 + gear["damage"] + l * 0.01 + (save.upgrades["damage"] ?? 0) * 0.02,
    defense: Math.min(CAPS["defense"], gear["defense"] + (save.upgrades["defense"] ?? 0) * 0.01),
    xp: 1 + gear["xp"] + (save.upgrades["xp"] ?? 0) * 0.03,
    coin: Math.min(CAPS["coin"], 1 + (save.upgrades["coin"] ?? 0) * 0.05),
    pickup: 1 + (save.upgrades["pickup"] ?? 0) * 0.05,
    luck: (save.upgrades["luck"] ?? 0) * 0.01,
  };
}
export type Action = {
  type: string;
  id?: string;
  slot?: Slot;
  category?: string;
  tier?: string;
  value?: unknown;
};
export function adjustedOdds(tier: string, pity: number) {
  const chest = CHESTS.find((c) => c.id === tier);
  if (!chest) throw new Error("Unknown chest");
  const odds = [...chest.odds];
  const shift = Math.min(5, pity * 0.1);
  const low = (odds[0] ?? 0) + (odds[1] ?? 0);
  if (low > 0) {
    odds[0] = (odds[0] ?? 0) * (1 - shift / 100);
    odds[1] = (odds[1] ?? 0) * (1 - shift / 100);
    const added = (low * shift) / 100;
    odds[3] = (odds[3] ?? 0) + added * 0.5;
    odds[4] = (odds[4] ?? 0) + added * 0.4;
    odds[5] = (odds[5] ?? 0) + added * 0.1;
  }
  return odds;
}
export function rarityRoll(odds: number[], rng: () => number) {
  const r = rng() * 100;
  let total = 0;
  for (let i = 0; i < odds.length; i++) {
    total += odds[i] ?? 0;
    if (r < total) return i;
  }
  return odds.length - 1;
}
function spend(save: Save, coins: number, gems = 0) {
  if (save.coins < coins || save.gems < gems) throw new Error("Not enough currency");
  save.coins -= coins;
  save.gems -= gems;
}
export function applyAction(
  original: Save,
  action: Action,
  now: number,
  rng = () => Math.random(),
): Save {
  const s = structuredClone(original);
  const id = action.id ?? "";
  let label = "";
  const before = { coins: s.coins, gems: s.gems };
  if (action.type === "selectHero") {
    if (!s.heroes.includes(id)) throw new Error("Character is locked");
    s.hero = id;
  } else if (action.type === "selectWorld") {
    const w = Number(id);
    if (w < 0 || w > 2 || !Number.isInteger(w) || w > (s.stats["worlds"] ?? 0))
      throw new Error("World is locked");
    s.world = w;
    s.endless = false;
  } else if (action.type === "mode") {
    if (id === "endless" && !s.stats[`victory_${["wilds", "library", "city"][s.world]}`])
      throw new Error("Defeat this world’s final boss to unlock Endless");
    s.endless = id === "endless";
  } else if (action.type === "unlockHero") {
    const h = HEROES.find((x) => x.id === id);
    if (!h || s.heroes.includes(id)) throw new Error("Invalid character");
    if ((s.stats["kills"] ?? 0) < h.need) throw new Error(`Defeat ${h.need} enemies first`);
    spend(s, h.cost);
    s.heroes.push(id);
    s.heroLevels[id] = 1;
    label = `Unlocked ${h.name}`;
  } else if (action.type === "upgradeHero" || action.type === "upgradeWeapon") {
    const hero = action.type === "upgradeHero";
    const defs = hero ? HEROES : WEAPONS;
    if (!defs.some((d) => d.id === id) || (hero && !s.heroes.includes(id)))
      throw new Error("Invalid upgrade");
    const levels = hero ? s.heroLevels : s.weaponLevels;
    const l = levels[id] ?? 1;
    if (l >= 15) throw new Error("Maximum level reached");
    const soulKey = `${hero ? "hero" : "weapon"}_${id}`;
    if ((s.souls[soulKey] ?? 0) < soulCost(l)) throw new Error("Not enough matching souls");
    if (!hero && l >= 5 && (s.stats[`damage_${id}`] ?? 0) < 1000)
      throw new Error("Complete the weapon’s first mastery achievement");
    spend(s, costOf(l));
    s.souls[soulKey] = (s.souls[soulKey] ?? 0) - soulCost(l);
    levels[id] = l + 1;
    label = `${id} upgraded to ${l + 1}`;
  } else if (action.type === "upgrade") {
    const u = UPGRADES.find((x) => x.id === id);
    const l = s.upgrades[id] ?? 0;
    if (!u || l >= u.max) throw new Error("Maximum level reached");
    spend(s, costOf(l));
    s.upgrades[id] = l + 1;
    label = `${u.name} upgraded`;
  } else if (action.type === "resetUpgrades") {
    const refund = s.transactions
      .filter((t) => t.label.startsWith("Global upgrade:"))
      .reduce((sum, t) => sum - t.coins, 0);
    s.coins += refund;
    s.upgrades = {};
    s.transactions = s.transactions.filter((t) => !t.label.startsWith("Global upgrade:"));
    label = "Permanent upgrades reset";
  } else if (action.type === "equip") {
    const item = s.inventory.find((i) => i.id === id);
    const slot = action.slot;
    if (
      !item ||
      !slot ||
      !SLOTS.includes(slot) ||
      (item.category === "ring" ? !slot.startsWith("ring") : item.slot !== slot)
    )
      throw new Error("Incompatible item");
    if (Object.entries(s.equipped).some(([k, v]) => k !== slot && v === id) && item.count < 2)
      throw new Error("This item is already equipped");
    s.equipped[slot] = id;
  } else if (action.type === "unequip") {
    if (action.slot) delete s.equipped[action.slot];
  } else if (action.type === "upgradeItem") {
    const item = s.inventory.find((i) => i.id === id);
    if (!item || item.level >= 20) throw new Error("Maximum level reached");
    spend(s, costOf(item.level));
    item.level++;
    label = `${item.name} upgraded`;
  } else if (action.type === "merge") {
    const i = s.inventory.find((x) => x.id === id);
    if (!i || i.count < 3) throw new Error("Three identical copies are required");
    const used = Object.values(s.equipped).filter((x) => x === id).length;
    if (i.count - 3 < used) throw new Error("Unequip these items before merging");
    i.count -= 3;
    if (i.rarity === 5) {
      s.gems += 100;
      label = "S-Tier duplicates converted to 100 gems";
    } else {
      const nextId = `${i.category}_${i.set}_${i.slot}_${i.rarity + 1}`;
      const existing = s.inventory.find((x) => x.id === nextId);
      if (existing) existing.count++;
      else s.inventory.push({ ...i, id: nextId, rarity: i.rarity + 1, count: 1 });
      label = `Merged ${i.name} to ${RARITIES[i.rarity + 1]}`;
    }
    addStats(s, { merges: 1 }, now);
  } else if (action.type === "chest") {
    const c = CHESTS.find((x) => x.id === action.tier);
    const category = action.category;
    if (!c || !category || !["weapon", "hero", "armor", "ring", "pet"].includes(category))
      throw new Error("Unknown chest");
    spend(s, 0, c.price);
    const key = `${category}_${c.id}`;
    const rarity = rarityRoll(adjustedOdds(c.id, s.pity[key] ?? 0), rng);
    s.pity[key] = rarity >= 3 ? 0 : (s.pity[key] ?? 0) + 1;
    const index = Math.floor(rng() * (category === "hero" ? 6 : 10));
    s.coins += 50 + Math.floor(rng() * 101);
    if (category === "weapon" || category === "hero") {
      const target = (category === "hero" ? HEROES : WEAPONS)[index];
      if (!target) throw new Error("Invalid soul reward");
      const soulKey = `${category}_${target.id}`;
      const count = [5, 10, 20, 35, 55, 100][rarity] ?? 5;
      const maxed = (category === "hero" ? s.heroLevels : s.weaponLevels)[target.id] === 15;
      if (maxed) s.gems += count;
      else s.souls[soulKey] = (s.souls[soulKey] ?? 0) + count;
      label = `${count} ${target.name} souls · ${RARITIES[rarity]}`;
    } else {
      const slot =
        category === "armor"
          ? (["helmet", "chest", "boots", "accessory"][Math.floor(rng() * 4)] ?? "helmet")
          : category;
      const itemId = `${category}_${index}_${slot}_${rarity}`;
      const existing = s.inventory.find((i) => i.id === itemId);
      if (existing) existing.count++;
      else
        s.inventory.push({
          id: itemId,
          name: itemName(category, index, slot),
          category: category as Item["category"],
          slot,
          set: index,
          rarity,
          level: 1,
          count: 1,
        });
      addStats(s, { collected: 1 }, now);
      label = `${RARITIES[rarity]} ${itemName(category, index, slot)}`;
    }
  } else if (action.type === "claim") {
    const kind = action.category;
    const objective = (kind === "daily" ? DAILY : kind === "weekly" ? WEEKLY : ACHIEVEMENTS).find(
      (x) => x.id === id,
    );
    const period = kind === "daily" || kind === "weekly" ? questKey(kind, now) : undefined;
    const claimKey = period ? `${period}:${id}` : id;
    if (!objective || s.claims[claimKey] || metric(s, objective.metric, period) < objective.target)
      throw new Error("Reward is not available");
    s.claims[claimKey] = now;
    s.coins += objective.coins;
    s.gems += objective.gems;
    if (objective.category === "Weapons") {
      const wid = id.split("_")[1];
      const key = `weapon_${wid}`;
      s.souls[key] = (s.souls[key] ?? 0) + 10;
    }
    if (objective.category === "Characters") {
      s.souls[id] = (s.souls[id] ?? 0) + 20;
    }
    label = `Claimed ${objective.name}`;
  } else if (action.type === "settings") {
    const v = action.value as Partial<Settings>;
    for (const k of ["numbers", "effects", "shake", "animation"] as const)
      if (typeof v[k] === "boolean") s.settings[k] = v[k];
    if (typeof v.scale === "number" && v.scale >= 0.8 && v.scale <= 1.2) s.settings.scale = v.scale;
  } else if (action.type === "skin") {
    if (id !== "original" && (s.stats[`hero_${s.hero}`] ?? 0) < 10)
      throw new Error("Complete 10 runs with this hero");
    s.skin = id === "original" ? "original" : "spectral";
  } else throw new Error("Unknown action");
  if (label) {
    if (action.type === "upgrade") label = `Global upgrade:${label}`;
    s.transactions.push({
      id: `${now}_${s.version}`,
      label,
      coins: s.coins - before.coins,
      gems: s.gems - before.gems,
      at: now,
    });
    s.transactions = s.transactions.slice(-1000);
  }
  s.version++;
  return s;
}
export const guestKey = "hollowfall-guest-v2";
export function readGuest(): Save {
  const raw = localStorage.getItem(guestKey);
  if (!raw) return freshSave();
  const parsed = JSON.parse(raw) as Save;
  if (parsed.version < 1 || !parsed.stats || !parsed.inventory)
    throw new Error("Guest save could not be read");
  return { ...freshSave(), ...parsed };
}
export function writeGuest(s: Save) {
  localStorage.setItem(guestKey, JSON.stringify(s));
}
