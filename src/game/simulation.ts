import {
  CAPS,
  PASSIVES,
  PETS,
  WEAPONS,
  WORLDS,
  heroById,
  weaponStats,
  type EnemyDef,
} from "./content";
import { activeSets, combatStats, type Save } from "./progression";
import { overlapsArc, segmentHit } from "./geometry";
export interface Entity {
  id: number;
  def: string;
  x: number;
  y: number;
  hp: number;
  max: number;
  radius: number;
  hit: number;
  slow: number;
  windup: number;
  dash: number;
  angle: number;
  attackCd: number;
  marks: number;
  petMark: number;
  hits: number;
  damage: number;
}
export interface Projectile {
  id: number;
  weapon: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  damage: number;
  pierce: number;
  hits: number[];
  age: number;
  returning: boolean;
}
export interface Pickup {
  id: number;
  x: number;
  y: number;
  kind: "xp" | "coin" | "heart" | "chest" | "mark";
  value: number;
}
export interface Effect {
  kind: string;
  x: number;
  y: number;
  x2: number;
  y2: number;
  radius: number;
  life: number;
  damage: number;
  hits: number[];
  tick: number;
  weapon: string;
  duration: number;
}
export interface GameState {
  seed: number;
  time: number;
  player: { x: number; y: number; hp: number; max: number; angle: number; inv: number };
  enemies: Entity[];
  projectiles: Projectile[];
  pickups: Pickup[];
  effects: Effect[];
  weapons: Record<string, number>;
  passives: Record<string, number>;
  cooldowns: Record<string, number>;
  offers: string[];
  level: number;
  xp: number;
  xpNext: number;
  spawn: number;
  bossIndex: number;
  nextId: number;
  coins: number;
  gems: number;
  metrics: Record<string, number>;
  discoveries: Record<string, number>;
  ended: boolean;
  victory: boolean;
  world: number;
  endless: boolean;
  hero: string;
  settings: Save["settings"];
  damageTaken: number;
  lastPet: number;
  petCooldown: number;
  ringCd: Record<string, number>;
  stored: number;
  fragments: number;
  fate: number;
  decoy: { x: number; y: number; hp: number; life: number } | null;
  setCharges: Record<string, number>;
  bestNoDamage: number;
}
export interface Input {
  x: number;
  y: number;
  choice?: string;
  pet?: boolean;
}
export function random(s: GameState) {
  s.seed = (Math.imul(1664525, s.seed) + 1013904223) >>> 0;
  return s.seed / 4294967296;
}
export function createGame(save: Save, seed: number): GameState {
  const hero = heroById(save.hero);
  if (!hero) throw new Error("Missing hero");
  const stats = combatStats(save);
  return {
    seed,
    time: 0,
    player: { x: 0, y: 0, hp: stats.hp, max: stats.hp, angle: 0, inv: 0 },
    enemies: [],
    projectiles: [],
    pickups: [],
    effects: [],
    weapons: { [hero.weapon]: 1 },
    passives: {},
    cooldowns: {},
    offers: [],
    level: 1,
    xp: 0,
    xpNext: 5,
    spawn: 0,
    bossIndex: 0,
    nextId: 1,
    coins: 0,
    gems: 0,
    metrics: {},
    discoveries: {},
    ended: false,
    victory: false,
    world: save.world,
    endless: save.endless,
    hero: save.hero,
    settings: save.settings,
    damageTaken: 0,
    lastPet: 0,
    petCooldown: 0,
    ringCd: {},
    stored: 0,
    fragments: 0,
    fate: 0,
    decoy: null,
    setCharges: {},
    bestNoDamage: 0,
  };
}
const add = (s: GameState, k: string, v: number) => {
  s.metrics[k] = (s.metrics[k] ?? 0) + v;
};
export function enemyDefinition(s: GameState, id: string): EnemyDef | undefined {
  const w = WORLDS[s.world];
  return w?.enemies.find((e) => e.id === id) ?? w?.bosses.find((e) => e.id === id);
}
export function makeOffers(s: GameState) {
  const options = [
    ...WEAPONS.filter(
      (w) => (s.weapons[w.id] ?? 0) < 8 && (s.weapons[w.id] || Object.keys(s.weapons).length < 5),
    ).map((w) => `w:${w.id}`),
    ...PASSIVES.filter(
      (p) =>
        (s.passives[p.id] ?? 0) < 8 && (s.passives[p.id] || Object.keys(s.passives).length < 5),
    ).map((p) => `p:${p.id}`),
  ];
  const result: string[] = [];
  while (options.length && result.length < 3) {
    const i = Math.floor(random(s) * options.length);
    const selected = options.splice(i, 1)[0];
    if (selected) result.push(selected);
  }
  while (result.length < 3) result.push(result.includes("f:heal") ? "f:coin" : "f:heal");
  s.offers = result;
}
export function choose(s: GameState, id: string) {
  if (!s.offers.includes(id)) throw new Error("Invalid level-up choice");
  const [kind, key] = id.split(":");
  if (!key) return;
  if (kind === "w") {
    if (!s.weapons[key] && Object.keys(s.weapons).length >= CAPS.slots)
      throw new Error("Weapon slots full");
    s.weapons[key] = Math.min(8, (s.weapons[key] ?? 0) + 1);
  } else if (kind === "p") {
    if (!s.passives[key] && Object.keys(s.passives).length >= CAPS.slots)
      throw new Error("Passive slots full");
    s.passives[key] = Math.min(8, (s.passives[key] ?? 0) + 1);
    if (key === "vital" && (s.passives[key] ?? 0) <= 5) {
      s.player.max += 10;
      s.player.hp += 10;
    }
  } else if (key === "heal") s.player.hp = Math.min(s.player.max, s.player.hp + s.player.max * 0.3);
  else s.coins += 25;
  s.offers = [];
  if (s.xp >= s.xpNext) levelUp(s);
}
function levelUp(s: GameState) {
  s.xp -= s.xpNext;
  s.level++;
  s.xpNext = Math.floor(5 + s.level * 2 + s.level ** 1.4 * 0.6);
  makeOffers(s);
}
const pl = (s: GameState, key: string) => Math.min(5, s.passives[key] ?? 0);
function effect(
  s: GameState,
  kind: string,
  x: number,
  y: number,
  radius: number,
  damage: number,
  life: number,
  weapon: string,
  x2 = x,
  y2 = y,
) {
  s.effects.push({
    kind,
    x,
    y,
    x2,
    y2,
    radius,
    damage,
    life,
    hits: [],
    tick: 0,
    weapon,
    duration: life,
  });
}
function spawnEnemy(s: GameState, def: EnemyDef) {
  const angle = random(s) * Math.PI * 2;
  const radius = def.boss ? 430 : 520 + random(s) * 120;
  const late = s.endless && s.time > 1800 ? 1 + (s.time - 1800) / 600 : 1;
  s.enemies.push({
    id: s.nextId++,
    def: def.id,
    x: s.player.x + Math.cos(angle) * radius,
    y: s.player.y + Math.sin(angle) * radius,
    hp: def.hp * late,
    max: def.hp * late,
    radius: def.boss ? 32 + def.cell * 2 : 12 + (def.cell % 4) * 2,
    hit: 0,
    slow: 0,
    windup: 0,
    dash: 0,
    angle: 0,
    attackCd: 2 + random(s) * 2,
    marks: 0,
    petMark: 0,
    hits: 0,
    damage: 0,
  });
  if (def.boss) {
    add(s, "bossSpawns", 1);
    if (hasRing(s, "5")) {
      for (let i = 0; i < 3; i++)
        s.pickups.push({
          id: s.nextId++,
          x: s.player.x + Math.cos(i * 2.1) * 110,
          y: s.player.y + Math.sin(i * 2.1) * 110,
          kind: "mark",
          value: 20,
        });
    }
  }
}
let currentSave: Save | undefined;
function hasRing(s: GameState, index: string) {
  return currentSave?.inventory.some(
    (i) =>
      i.category === "ring" &&
      i.set === Number(index) &&
      [currentSave?.equipped.ring1, currentSave?.equipped.ring2].includes(i.id),
  );
}
function equippedPet(save: Save) {
  return save.inventory.find((i) => i.id === save.equipped.pet);
}
function hit(s: GameState, e: Entity, amount: number, weapon: string, secondary = false) {
  if (e.hp <= 0) return;
  const def = enemyDefinition(s, e.def);
  if (!def) return;
  let damage = amount;
  if (!secondary) {
    if (e.petMark > 0 && e.marks > 0) {
      damage *= 1 + (def.boss ? 0.04 : 0.08);
      e.marks--;
    }
    if (s.fate > 0) damage *= 1.08;
    if (hasRing(s, "7")) {
      const phase = Math.floor(s.time / 6);
      if (s.ringCd["eclipse"] !== phase) {
        const area = ["electro", "storm", "mines"].includes(weapon);
        if (area === (phase % 2 === 0)) {
          damage *= 1.1;
          s.ringCd["eclipse"] = phase;
        }
      }
    }
    if (hasRing(s, "4")) {
      s.stored = Math.min(100, s.stored + damage * 0.05);
      if ((s.ringCd["cinder"] ?? 0) <= s.time) {
        damage += s.stored;
        s.stored = 0;
        s.ringCd["cinder"] = s.time + 3;
      }
    }
    e.hits++;
    e.damage += damage;
    if (
      hasRing(s, "1") &&
      def.boss &&
      e.damage >= 250 &&
      (s.ringCd[`slow${e.id}`] ?? 0) <= s.time
    ) {
      e.slow = 2;
      s.ringCd[`slow${e.id}`] = s.time + 8;
      e.damage = 0;
    }
    if (hasRing(s, "6") && e.hits % 20 === 0) s.fragments = Math.min(3, s.fragments + 1);
    const sets = currentSave ? activeSets(currentSave) : {};
    for (const [index, count] of Object.entries(sets)) {
      if (count < 2) continue;
      const n = Number(index);
      if ([0, 1, 4, 5].includes(n) && e.hits % 4 === 0) {
        damage *= 1.08;
        if (count >= 4 && n === 5) effect(s, "field", e.x, e.y, 55, 4, 2, "set");
      }
      if (n === 6 && !s.discoveries[e.def]) damage *= 1.08;
      if (n === 7 && count >= 4 && s.setCharges["rift"] && s.setCharges["rift"] > s.time) {
        damage += 8;
        s.setCharges["rift"] = 0;
      }
    }
  }
  const dealt = Math.min(e.hp, damage);
  e.hp -= damage;
  e.hit = 0.13;
  if (currentSave?.settings.numbers)
    effect(s, "number", e.x, e.y - e.radius - 12, 0, dealt, 0.7, weapon);
  add(s, "damage", dealt);
  add(s, `damage_${weapon}`, dealt);
  if (e.hp > 0) return;
  add(s, "kills", 1);
  s.discoveries[e.def] = (s.discoveries[e.def] ?? 0) + 1;
  add(s, `enemy_${e.def}`, 1);
  if (def.boss) {
    add(s, "bosses", 1);
    s.pickups.push({
      id: s.nextId++,
      x: e.x,
      y: e.y,
      kind: "chest",
      value: 300 + Math.floor(random(s) * 301),
    });
    if (def.tier === "final") {
      s.victory = true;
      if (!s.endless) s.ended = true;
      add(s, `victory_${WORLDS[s.world]?.id}`, 1);
    }
  } else if (random(s) < 0.01)
    s.pickups.push({ id: s.nextId++, x: e.x, y: e.y, kind: "coin", value: 10 });
  s.pickups.push({ id: s.nextId++, x: e.x, y: e.y, kind: "xp", value: def.boss ? 12 : 1 });
  if (
    random(s) < Math.min(0.35, pl(s, "fortune") * 0.03 + (currentSave?.upgrades["luck"] ?? 0) * 0.01)
  )
    s.pickups.push({ id: s.nextId++, x: e.x + 8, y: e.y, kind: "xp", value: 1 });
  if (random(s) < 0.007)
    s.pickups.push({ id: s.nextId++, x: e.x, y: e.y, kind: "heart", value: 10 });
  if (hasRing(s, "0") && !secondary && (s.ringCd["echo"] ?? 0) <= s.time) {
    effect(s, "echo", e.x, e.y, 24, Math.min(40, damage * 0.2), 2, "echo");
    s.ringCd["echo"] = s.time + 1.5;
  }
  const sets = currentSave ? activeSets(currentSave) : {};
  if ((sets[3] ?? 0) >= 2) effect(s, "field", e.x, e.y, 38, 3, 2, "decay");
  if ((sets[0] ?? 0) >= 4 && e.hits >= 3) s.setCharges["mobility"] = s.time + 2;
  if ((sets[8] ?? 0) >= 2 && def.boss) s.setCharges["royal"] = 1;
  if ((sets[9] ?? 0) >= 2) s.setCharges["alignment"] = Math.min(10, (s.setCharges["alignment"] ?? 0) + 1);
}
function nearest(s: GameState, range: number) {
  return s.enemies
    .filter((e) => e.hp > 0 && Math.hypot(e.x - s.player.x, e.y - s.player.y) < range)
    .sort(
      (a, b) =>
        (a.x - s.player.x) ** 2 +
        (a.y - s.player.y) ** 2 -
        ((b.x - s.player.x) ** 2 + (b.y - s.player.y) ** 2),
    );
}
function projectile(
  s: GameState,
  id: string,
  angle: number,
  damage: number,
  pierce: number,
  speed: number,
  life: number,
) {
  s.projectiles.push({
    id: s.nextId++,
    weapon: id,
    x: s.player.x,
    y: s.player.y,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    life,
    damage,
    pierce,
    hits: [],
    age: 0,
    returning: false,
  });
}
function attack(s: GameState, save: Save, id: string, level: number) {
  const w = weaponStats(id, level),
    stats = combatStats(save),
    hero = heroById(s.hero);
  const base =
    w.damage *
    stats.damage *
    (1 + pl(s, "lens") * 0.04) *
    (1 + ((save.weaponLevels[id] ?? 1) - 1) * 0.015) *
    (hero?.weapon === id ? 1.05 : 1);
  const area = 1 + pl(s, "glass") * 0.03;
  const range = w.range * (1 + pl(s, "sight") * 0.08);
  const targets = nearest(s, id === "bats" ? range + 50 : range);
  const first = targets[0];
  const angle = first ? Math.atan2(first.y - s.player.y, first.x - s.player.x) : s.player.angle;
  if (id === "storm") {
    effect(s, "storm", first?.x ?? s.player.x, first?.y ?? s.player.y, range, base, 3, id);
  } else if (id === "electro") {
    effect(s, "pulse", s.player.x, s.player.y, w.range * area, base, 0.45, id);
    for (const e of nearest(s, w.range * area)) hit(s, e, base, id);
    if (level >= 5 && Math.floor(s.time) % 4 === 0)
      for (const e of nearest(s, w.range * area)) hit(s, e, base, id);
  } else if (id === "lightning") {
    const count = level >= 5 ? 8 + (level >= 6 ? 1 : 0) : level >= 3 ? 2 : 1;
    for (const e of targets.slice(0, count)) {
      hit(s, e, base * (level >= 8 && Math.floor(s.time / w.cooldown) % 4 === 0 ? 1.25 : 1), id);
      effect(s, "bolt", s.player.x, s.player.y, 1, 0, 0.22, id, e.x, e.y);
    }
  } else if (id === "bats") {
    effect(s, "bats", s.player.x, s.player.y, w.range, base, level >= 6 ? 4.6 : 4, id);
  } else if (id === "wraith") {
    effect(
      s,
      "slash",
      s.player.x,
      s.player.y,
      w.range * area,
      base,
      0.3,
      id,
      angle,
      level >= 4 ? 1.2 : 1,
    );
    for (const e of targets)
      if (
        overlapsArc(s.player.x, s.player.y, e.x, e.y, angle, w.range * area, level >= 4 ? 1.2 : 1)
      )
        hit(s, e, base, id);
    if (level >= 8)
      effect(s, "delayed", s.player.x, s.player.y, w.range * area, base, 0.65, id, angle, 1.3);
  } else if (id === "mines") {
    for (let i = 0; i < 1 + (level >= 2 ? 1 : 0) + (level >= 6 ? 1 : 0); i++)
      effect(
        s,
        "mine",
        s.player.x + Math.cos(i * 2.1) * 35,
        s.player.y + Math.sin(i * 2.1) * 35,
        w.range * area,
        base,
        12,
        id,
        level,
        0,
      );
  } else if (id === "lance") {
    effect(
      s,
      "charge",
      s.player.x,
      s.player.y,
      level >= 4 ? 16 : 12,
      base,
      0.8 * (level >= 2 ? 0.9 : 1) * (level >= 7 ? 0.85 : 1),
      id,
      s.player.x + Math.cos(angle) * range,
      s.player.y + Math.sin(angle) * range,
    );
  } else {
    const count =
      id === "bow"
        ? 1 + (level >= 2 ? 1 : 0) + (level >= 8 ? 1 : 0)
        : id === "gravebolt" && level >= 8
          ? 2
          : 1;
    for (let i = 0; i < count; i++) {
      const target = targets[i] ?? first;
      const a = target
        ? Math.atan2(target.y - s.player.y, target.x - s.player.x)
        : angle + (i - (count - 1) / 2) * 0.14;
      const speed =
        id === "bow"
          ? 430 * (level >= 4 ? 1.2 : 1) * (level >= 7 ? 1.2 : 1)
          : id === "gravebolt"
            ? 270 * (level >= 3 ? 1.2 : 1) * (level >= 7 ? 1.2 : 1)
            : 230 * (level >= 4 ? 1.2 : 1);
      projectile(
        s,
        id,
        a,
        base,
        id === "harvest"
          ? 5
          : id === "bow"
            ? 1 + (level >= 3 ? 1 : 0) + (level >= 6 ? 1 : 0)
            : 1 + (level >= 5 ? 1 : 0) + (level >= 6 ? 1 : 0),
        speed,
        (range / speed) * (id === "harvest" ? 2 : 1),
      );
    }
  }
  return w.cooldown * (1 - Math.min(0.25, pl(s, "pulse") * 0.03));
}
export function activatePet(s: GameState, save: Save) {
  const item = equippedPet(save);
  if (!item || s.petCooldown > 0) return;
  const pet = PETS[item.set];
  if (!pet) return;
  if (item.set === 7 && s.xp <= 0) return;
  const scale = [0.35, 0.65, 1, 1.12, 1.3, 1.5][item.rarity] ?? 1;
  s.petCooldown = pet[2];
  s.lastPet = s.time;
  add(s, "pets", 1);
  const targets = nearest(s, 240);
  switch (item.set) {
    case 0:
      for (const e of targets.slice(0, 8)) {
        e.petMark = 5;
        e.marks = 3;
      }
      break;
    case 1:
      effect(s, "slowfield", s.player.x, s.player.y, 140, 0, 4, "pet");
      break;
    case 2:
      for (const e of targets.slice(0, 6)) {
        hit(s, e, 35 * scale, "pet");
        e.petMark = 3;
        e.marks = 1;
      }
      effect(
        s,
        "bolt",
        s.player.x,
        s.player.y,
        1,
        0,
        0.3,
        "pet",
        targets[0]?.x ?? s.player.x + 200,
        targets[0]?.y ?? s.player.y,
      );
      break;
    case 3:
      effect(s, "rune", s.player.x, s.player.y, 105, 18 * scale, 5, "pet");
      break;
    case 4:
      for (let i = 0; i < 4; i++)
        effect(
          s,
          "field",
          s.player.x + Math.cos(s.player.angle) * i * 45,
          s.player.y + Math.sin(s.player.angle) * i * 45,
          30,
          12 * scale,
          3,
          "pet",
        );
      break;
    case 5:
      effect(s, "trap", s.player.x, s.player.y, 80, 20 * scale, 8, "pet");
      break;
    case 6:
      effect(s, "bog", s.player.x, s.player.y, 100, 8 * scale, 4, "pet");
      break;
    case 7:
      s.xp *= 0.95;
      for (const e of targets) {
        hit(s, e, 45 * scale, "pet");
        if (!enemyDefinition(s, e.def)?.boss) {
          const a = Math.atan2(e.y - s.player.y, e.x - s.player.x);
          e.x += Math.cos(a) * 80;
          e.y += Math.sin(a) * 80;
        }
      }
      effect(s, "pulse", s.player.x, s.player.y, 240, 0, 0.5, "pet");
      break;
    case 8:
      s.decoy = {
        x: s.player.x + Math.cos(s.player.angle) * 100,
        y: s.player.y + Math.sin(s.player.angle) * 100,
        hp: 120,
        life: 4,
      };
      break;
    case 9:
      for (const e of targets.slice(0, 8)) hit(s, e, 30 * scale, "pet");
      effect(
        s,
        "trail",
        s.player.x,
        s.player.y,
        35,
        10 * scale,
        2,
        "pet",
        s.player.x + Math.cos(s.player.angle) * 230,
        s.player.y + Math.sin(s.player.angle) * 230,
      );
      break;
  }
}
export function step(s: GameState, save: Save, input: Input, dt = 1 / 30) {
  currentSave = save;
  if (s.ended) return;
  if (s.offers.length) {
    if (input.choice) choose(s, input.choice);
    return;
  }
  dt = Math.max(0, Math.min(1 / 30, dt));
  s.time += dt;
  const p = s.player,
    st = combatStats(save);
  p.inv = Math.max(0, p.inv - dt);
  s.petCooldown = Math.max(0, s.petCooldown - dt);
  s.fate = Math.max(0, s.fate - dt);
  if (s.decoy) {
    s.decoy.life -= dt;
    if (s.decoy.life <= 0 || s.decoy.hp <= 0) s.decoy = null;
  }
  const length = Math.hypot(input.x, input.y);
  const move = length > 0 ? Math.min(1, length) / length : 0;
  const speed = st.speed * (1 + pl(s, "swift") * 0.03);
  p.x += input.x * move * speed * dt;
  p.y += input.y * move * speed * dt;
  if (length > 0.1) p.angle = Math.atan2(input.y, input.x);
  if (pl(s, "root")) p.hp = Math.min(p.max, p.hp + (0.25 + 0.25 * pl(s, "root")) * dt);
  if (input.pet || s.petCooldown === 0) activatePet(s, save);
  s.spawn -= dt;
  const w = WORLDS[s.world];
  if (!w) return;
  const boss = w.bosses[s.bossIndex];
  if (boss && s.time >= boss.at) {
    spawnEnemy(s, boss);
    s.bossIndex++;
  }
  if (s.endless && s.time > 1800 && Math.floor(s.time / 120) > Math.floor((s.time - dt) / 120)) {
    const champion = w.bosses[Math.floor(random(s) * 6)];
    if (champion) spawnEnemy(s, champion);
  }
  const cap = Math.min(90, 28 + Math.floor(s.time / 45));
  if (s.spawn <= 0 && s.enemies.length < cap) {
    const pool = w.enemies.filter((e) => e.at <= s.time);
    const def = pool[Math.floor(random(s) * pool.length)];
    if (def) spawnEnemy(s, def);
    s.spawn =
      Math.max(0.25, 1 - s.time / 2400) *
      (s.enemies.some((e) => enemyDefinition(s, e.def)?.boss) ? 1.25 : 1);
  }
  for (const e of s.enemies) {
    if (e.hp <= 0) continue;
    const def = enemyDefinition(s, e.def);
    if (!def) continue;
    e.hit = Math.max(0, e.hit - dt);
    e.slow = Math.max(0, e.slow - dt);
    e.petMark = Math.max(0, e.petMark - dt);
    e.attackCd -= dt;
    const target = s.decoy && (!def.boss || s.decoy.life > 3) ? s.decoy : p;
    const dx = target.x - e.x,
      dy = target.y - e.y,
      d = Math.hypot(dx, dy) || 1;
    if (e.dash > 0) {
      e.dash -= dt;
      e.x += Math.cos(e.angle) * def.speed * 3 * dt;
      e.y += Math.sin(e.angle) * def.speed * 3 * dt;
    } else if (e.windup > 0) {
      e.windup -= dt;
      if (e.windup <= 0) {
        e.dash = 0.55;
        e.attackCd = 3.5;
      }
    } else {
      if ((def.boss || def.behaviour === "lunge") && e.attackCd <= 0 && d < 300) {
        e.windup = def.boss ? 0.8 : 0.55;
        e.angle = Math.atan2(dy, dx);
      } else {
        let velocity = Math.min(st.speed, def.speed) * (e.slow > 0 ? (def.boss ? 0.94 : 0.85) : 1);
        if (def.behaviour === "accel") velocity *= Math.min(1.1, 1 + s.time * 0.00002);
        const flank = def.behaviour === "flank" && d > 100 ? Math.sin(s.time + e.id) * 0.6 : 0;
        e.x += (dx / d - (flank * dy) / d) * velocity * dt;
        e.y += (dy / d + (flank * dx) / d) * velocity * dt;
      }
    }
    if (d < e.radius + 14) {
      if (target === s.decoy && s.decoy) s.decoy.hp -= def.dps * dt;
      else if (p.inv <= 0) {
        let reduction = st.defense + pl(s, "iron") * 0.03;
        if (s.effects.some((f) => f.kind === "bog" && Math.hypot(e.x - f.x, e.y - f.y) < f.radius))
          reduction += def.boss ? 0.03 : 0.1;
        const damage = def.dps * 0.5 * (1 - Math.min(0.3, reduction));
        p.hp = Math.max(0, p.hp - damage);
        p.inv = 0.5;
        s.damageTaken += damage;
        s.bestNoDamage = Math.max(s.bestNoDamage, s.time);
        add(s, "hitsTaken", 1);
      }
    }
    if (Math.hypot(e.x - p.x, e.y - p.y) > 950) {
      e.x = p.x + (dx / d) * -560;
      e.y = p.y + (dy / d) * -560;
    }
  }
  // Local spatial buckets keep separation linear under ordinary swarm density.
  const cells = new Map<string, Entity[]>();
  for (const e of s.enemies) {
    const key = `${Math.floor(e.x / 48)},${Math.floor(e.y / 48)}`;
    const list = cells.get(key) ?? [];
    list.push(e);
    cells.set(key, list);
  }
  for (const e of s.enemies) {
    const gx = Math.floor(e.x / 48),
      gy = Math.floor(e.y / 48);
    for (let ix = -1; ix <= 1; ix++)
      for (let iy = -1; iy <= 1; iy++)
        for (const other of cells.get(`${gx + ix},${gy + iy}`) ?? []) {
          if (other.id <= e.id) continue;
          const dx = e.x - other.x,
            dy = e.y - other.y,
            dist = Math.hypot(dx, dy),
            min = (e.radius + other.radius) * 0.75;
          if (dist > 0 && dist < min) {
            const force = (min - dist) * 0.25;
            e.x += (dx / dist) * force;
            e.y += (dy / dist) * force;
            other.x -= (dx / dist) * force;
            other.y -= (dy / dist) * force;
          }
        }
  }
  for (const [id, level] of Object.entries(s.weapons)) {
    s.cooldowns[id] = (s.cooldowns[id] ?? 0) - dt;
    if ((s.cooldowns[id] ?? 0) <= 0) s.cooldowns[id] = attack(s, save, id, level);
  }
  for (const b of s.projectiles) {
    b.life -= dt;
    b.age += dt;
    const ax = b.x,
      ay = b.y;
    if (b.weapon === "gravebolt") {
      const target = nearest(s, 650).find((e) => !b.hits.includes(e.id));
      if (target) {
        const a = Math.atan2(target.y - b.y, target.x - b.x),
          speed = Math.hypot(b.vx, b.vy);
        b.vx += (Math.cos(a) * speed - b.vx) * dt * 4;
        b.vy += (Math.sin(a) * speed - b.vy) * dt * 4;
      }
    }
    if (b.weapon === "harvest" && b.age > 0.9 && !b.returning) {
      b.returning = true;
      b.hits = [];
    }
    if (b.returning) {
      const a = Math.atan2(p.y - b.y, p.x - b.x),
        speed = 300;
      b.vx = Math.cos(a) * speed;
      b.vy = Math.sin(a) * speed;
      if (Math.hypot(p.x - b.x, p.y - b.y) < 20) b.life = 0;
    }
    b.x += b.vx * dt;
    b.y += b.vy * dt;
    for (const e of s.enemies) {
      if (
        e.hp <= 0 ||
        b.hits.includes(e.id) ||
        !segmentHit(ax, ay, b.x, b.y, e.x, e.y, e.radius + 5)
      )
        continue;
      b.hits.push(e.id);
      hit(s, e, b.damage, b.weapon);
      b.pierce--;
      if (b.pierce <= 0) {
        b.life = 0;
        break;
      }
    }
  }
  for (const f of [...s.effects]) {
    f.life -= dt;
    f.tick -= dt;
    if (f.kind === "storm" && f.tick <= 0) {
      f.tick = 0.75;
      const l = s.weapons["storm"] ?? 1;
      const targets = s.enemies
        .filter((e) => e.hp > 0 && Math.hypot(e.x - f.x, e.y - f.y) < f.radius)
        .slice(0, l >= 5 ? 4 : l >= 3 ? 2 : 1);
      for (const e of targets) {
        hit(s, e, f.damage, "storm");
        effect(s, "bolt", f.x, f.y - 80, 1, 0, 0.2, "storm", e.x, e.y);
      }
    }
    if (f.kind === "bats") {
      f.x = p.x;
      f.y = p.y;
      const l = s.weapons["bats"] ?? 1;
      const count =
        1 +
        (l >= 2 ? 1 : 0) +
        (l >= 5 ? 2 : 0) +
        (l >= 8 && Math.floor(s.time / 7) % 3 === 0 ? 1 : 0);
      for (let i = 0; i < count; i++) {
        const a = s.time * 2.8 + (i * Math.PI * 2) / count,
          x = p.x + Math.cos(a) * f.radius,
          y = p.y + Math.sin(a) * f.radius;
        for (const e of s.enemies)
          if (
            e.hp > 0 &&
            Math.hypot(e.x - x, e.y - y) < e.radius + 15 &&
            (s.ringCd[`bat${e.id}`] ?? 0) <= s.time
          ) {
            hit(s, e, f.damage * (l >= 7 && e.hits > 0 ? 1.1 : 1), "bats");
            s.ringCd[`bat${e.id}`] = s.time + 0.5;
          }
      }
    }
    if (["field", "bog"].includes(f.kind) && f.tick <= 0) {
      f.tick = 1;
      for (const e of s.enemies)
        if (e.hp > 0 && Math.hypot(e.x - f.x, e.y - f.y) < f.radius)
          hit(s, e, f.damage, f.weapon, true);
    }
    if (["echo", "rune", "trap", "mine", "trail", "slowfield"].includes(f.kind)) {
      for (const e of s.enemies) {
        const within =
          f.kind === "trail"
            ? segmentHit(f.x, f.y, f.x2, f.y2, e.x, e.y, f.radius + e.radius)
            : Math.hypot(e.x - f.x, e.y - f.y) < f.radius;
        if (!within || e.hp <= 0 || f.hits.includes(e.id)) continue;
        if (f.kind === "slowfield") {
          e.slow = 0.1;
          continue;
        }
        if (f.kind === "mine") {
          effect(s, "pulse", f.x, f.y, f.radius, 0, 0.4, "mines");
          for (const target of s.enemies)
            if (target.hp > 0 && Math.hypot(target.x - f.x, target.y - f.y) < f.radius) {
              hit(s, target, f.damage, "mines");
              if ((s.weapons["mines"] ?? 0) >= 5) target.slow = 1;
            }
          if ((s.weapons["mines"] ?? 0) >= 8)
            effect(s, "burst", f.x, f.y, f.radius, f.damage * 0.5, 0.3, "mines");
          f.life = 0;
          break;
        }
        hit(s, e, f.damage, f.weapon, true);
        f.hits.push(e.id);
        if (f.kind === "echo") {
          f.life = 0;
          break;
        }
        if (f.kind === "trap") e.slow = 2;
      }
    }
    if (f.kind === "charge" && f.life <= 0) {
      effect(s, "beam", f.x, f.y, f.radius, 0, 0.3, "lance", f.x2, f.y2);
      for (const e of s.enemies)
        if (segmentHit(f.x, f.y, f.x2, f.y2, e.x, e.y, f.radius + e.radius))
          hit(s, e, f.damage, "lance");
      if ((s.weapons["lance"] ?? 0) >= 8)
        effect(s, "trail", f.x, f.y, f.radius, f.damage * 0.1, 1.5, "lance", f.x2, f.y2);
    }
    if (f.kind === "delayed" && f.life <= 0.3 && f.hits.length === 0) {
      for (const e of s.enemies)
        if (e.hp > 0 && overlapsArc(f.x, f.y, e.x, e.y, f.x2, f.radius, f.y2)) {
          hit(s, e, f.damage, "wraith");
          f.hits.push(e.id);
        }
      f.kind = "slash";
    }
    if (f.kind === "burst" && f.life <= 0) {
      for (const e of s.enemies)
        if (e.hp > 0 && Math.hypot(e.x - f.x, e.y - f.y) < f.radius)
          hit(s, e, f.damage, "mines", true);
    }
  }
  for (const g of s.pickups) {
    if (g.kind === "mark") {
      g.value -= dt;
      if (g.value <= 0) {
        g.value = -1;
        continue;
      }
    }
    const dx = p.x - g.x,
      dy = p.y - g.y,
      dist = Math.hypot(dx, dy);
    const range = (g.kind === "chest" ? 30 : 65) * st.pickup * (1 + pl(s, "magnet") * 0.15);
    if (dist < range && dist > 15) {
      g.x += (dx / dist) * 250 * dt;
      g.y += (dy / dist) * 250 * dt;
    }
    if (dist < 22) {
      if (g.kind === "xp") {
        let xp = g.value * st.xp;
        if (s.fragments > 0) {
          xp *= 1.1;
          s.fragments--;
        }
        s.xp += xp;
        add(s, "crystals", 1);
      } else if (g.kind === "coin") s.coins += g.value * st.coin;
      else if (g.kind === "chest") {
        s.coins += g.value * st.coin;
        s.gems += 3;
        add(s, "chests", 1);
      } else if (g.kind === "heart") p.hp = Math.min(p.max, p.hp + g.value);
      else s.fate = 5;
      g.value = -1;
    }
  }
  s.enemies = s.enemies.filter((e) => e.hp > 0);
  s.projectiles = s.projectiles.filter((b) => b.life > 0).slice(-160);
  s.pickups = s.pickups.filter((g) => g.value > 0).slice(-1500);
  // Cosmetic numbers must never evict combat effects or alter replay results.
  s.effects = [
    ...s.effects.filter((f) => f.life > 0 && f.kind !== "number").slice(-150),
    ...s.effects.filter((f) => f.life > 0 && f.kind === "number").slice(-60),
  ];
  if (s.xp >= s.xpNext) levelUp(s);
  if (p.hp <= 0) s.ended = true;
  if (s.ended && s.victory) {
    for (const chest of s.pickups.filter((x) => x.kind === "chest")) {
      s.coins += chest.value * st.coin;
      s.gems += 3;
    }
    s.pickups = s.pickups.filter((x) => x.kind !== "chest");
  }
  currentSave = undefined;
}
export function runMetrics(s: GameState) {
  return {
    ...s.metrics,
    time: s.time,
    runs: 1,
    defeats: s.victory ? 0 : 1,
    victories: s.victory ? 1 : 0,
    [`hero_${s.hero}`]: 1,
    coinsEarned: Math.floor(s.coins),
    gemsEarned: s.gems,
    flawless: s.damageTaken === 0 ? s.time : 0,
  };
}
