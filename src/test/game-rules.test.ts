import { describe, expect, it } from "vitest";
import { freshSave, adjustedOdds } from "@/game/progression";
import { CHESTS, WORLDS } from "@/game/content";
import { createGame, step, choose } from "@/game/simulation";
import { settleRun } from "@/game/settlement";
import { attractionStep, overlapsArc, segmentHit } from "@/game/geometry";

describe("Preserved Hollowfall gameplay", () => {
  it("keeps all three worlds and their twelve enemies and seven bosses", () => {
    expect(WORLDS).toHaveLength(3);
    for (const world of WORLDS) {
      expect(world.enemies).toHaveLength(12);
      expect(world.bosses).toHaveLength(7);
      expect(world.bosses[6]?.at).toBe(1800);
    }
  });
  it("keeps base and soft pity probabilities at 100 percent", () => {
    for (const chest of CHESTS) {
      expect(chest.odds.reduce((a, b) => a + b, 0)).toBeCloseTo(100, 8);
      for (const count of [0, 1, 50, 10000])
        expect(adjustedOdds(chest.id, count).reduce((a, b) => a + b, 0)).toBeCloseTo(100, 8);
    }
  });
  it("detects a fast projectile crossing a target between frames", () => {
    expect(segmentHit(0, 0, 200, 0, 100, 0, 10)).toBe(true);
    expect(segmentHit(0, 0, 200, 0, 100, 30, 10)).toBe(false);
  });
  it("respects directional melee arcs", () => {
    expect(overlapsArc(0, 0, 40, 0, 0, 100, Math.PI / 3)).toBe(true);
    expect(overlapsArc(0, 0, -40, 0, 0, 100, Math.PI / 3)).toBe(false);
  });
  it("never overshoots an attracted pickup", () => {
    expect(attractionStep(2, 100, 1)).toBe(1);
    expect(attractionStep(0, 100, 1)).toBe(0);
  });
  it("stops the simulation while an upgrade choice blocks play", () => {
    const save = freshSave(), game = createGame(save, 42);
    game.offers = ["w:bats"];
    const before = structuredClone(game);
    step(game, save, { x: 1, y: 0 });
    expect(game).toEqual(before);
  });
  it("replays identical real movement and upgrade input deterministically", () => {
    const save = freshSave(), first = createGame(save, 123), second = createGame(save, 123);
    for (let i = 0; i < 1200; i++) {
      const input = { x: Math.sin(i / 30), y: Math.cos(i / 30) };
      if (first.offers[0]) { choose(first, first.offers[0]); choose(second, second.offers[0] ?? ""); }
      step(first, save, input); step(second, save, input);
    }
    expect(first).toEqual(second);
    expect(first.time).toBeGreaterThan(0);
  });
  it("settles earned currencies, run records and world victory without mutating the save", () => {
    const save = freshSave(), game = createGame(save, 12);
    game.coins = 450.8; game.gems = 3; game.time = 1800; game.victory = true; game.ended = true;
    const next = settleRun(save, game, Date.UTC(2026, 9, 14));
    expect(next.coins).toBe(450); expect(next.gems).toBe(3);
    expect(next.stats["worlds"]).toBe(1); expect(next.stats["best_0_standard"]).toBe(1800);
    expect(next.stats["runs"]).toBe(1); expect(save.coins).toBe(0);
  });
  it("damage-number preference does not change combat outcomes", () => {
    const on = freshSave(), off = freshSave(); off.settings.numbers = false;
    const first = createGame(on, 321), second = createGame(off, 321);
    for (let i = 0; i < 1800; i++) {
      if (first.offers[0]) { choose(first, first.offers[0]); choose(second, second.offers[0] ?? ""); }
      step(first, on, { x: 0, y: 0 }); step(second, off, { x: 0, y: 0 });
    }
    expect(first.metrics).toEqual(second.metrics);
    expect(first.player).toEqual(second.player);
    expect(first.coins).toEqual(second.coins);
  });
});