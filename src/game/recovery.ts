import { z } from "zod";
import type { GameState } from "./simulation";
const number = z.number().finite();
const point = z.object({ x: number, y: number }).passthrough();
const snapshot = z.object({
  seed: number, time: number.nonnegative(), world: z.number().int().min(0).max(2),
  hero: z.string(), ended: z.boolean(), victory: z.boolean(), endless: z.boolean(),
  player: point.extend({ hp: number, max: number.positive(), angle: number, inv: number }),
  enemies: z.array(point.extend({ id: number, def: z.string(), hp: number, max: number })),
  projectiles: z.array(point.extend({ id: number, weapon: z.string(), life: number })),
  pickups: z.array(point.extend({ id: number, kind: z.string(), value: number })),
  effects: z.array(point.extend({ kind: z.string(), life: number })),
  weapons: z.record(number), passives: z.record(number), cooldowns: z.record(number),
  offers: z.array(z.string()), metrics: z.record(number), discoveries: z.record(number),
  ringCd: z.record(number), setCharges: z.record(number), level: number, xp: number,
  xpNext: number.positive(), spawn: number, bossIndex: number, nextId: number,
  coins: number, gems: number, damageTaken: number, petCooldown: number,
  lastPet: number, stored: number, fragments: number, fate: number, bestNoDamage: number,
  settings: z.object({ numbers: z.boolean(), effects: z.boolean(), shake: z.boolean(), animation: z.boolean(), scale: number }),
  decoy: point.extend({ hp: number, life: number }).nullable(),
}).passthrough();
export function readSnapshot(raw: string): GameState {
  try { return snapshot.parse(JSON.parse(raw)) as unknown as GameState; }
  catch { throw new Error("This run snapshot cannot be restored. It has been kept; discard it to start a new hunt."); }
}