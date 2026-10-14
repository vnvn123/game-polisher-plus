import { addStats, type Save } from "./progression";
import { runMetrics, type GameState } from "./simulation";

/** One reward calculation for local play and authoritative replay. */
export function settleRun(save: Save, state: GameState, now: number): Save {
  const next = structuredClone(save);
  next.coins += Math.floor(state.coins);
  next.gems += state.gems;
  addStats(next, runMetrics(state), now);
  next.stats["best"] = Math.max(next.stats["best"] ?? 0, state.time);
  const key = `best_${state.world}_${state.endless ? "endless" : "standard"}`;
  next.stats[key] = Math.max(next.stats[key] ?? 0, state.time);
  if (state.victory) next.stats["worlds"] = Math.max(next.stats["worlds"] ?? 0, state.world + 1);
  next.version++;
  return next;
}