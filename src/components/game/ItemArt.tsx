import { ART } from "@/game/assets";
import {
  Shield,
  Crown,
  Footprints,
  Gem,
  Circle,
  Bird,
  Bug,
  Cat,
  Dog,
  Sparkles,
  Flame,
  Hexagon,
  Skull,
} from "lucide-react";
import type { Item } from "@/game/content";
export function ItemArt({ item }: { item: Pick<Item, "category" | "slot" | "set" | "rarity"> }) {
  if (item.category === "pet") {
    const icons = [Dog, Bug, Bird, Sparkles, Flame, Bug, Skull, Hexagon, Cat, Dog];
    const Icon = icons[item.set] ?? Bird;
    return <Icon className={`item-symbol rarity-${item.rarity}`} strokeWidth={1.3} />;
  }
  if (item.category === "ring")
    return (
      <svg className={`item-symbol rarity-${item.rarity}`} viewBox="0 0 64 64" fill="none">
        <ellipse cx="32" cy="38" rx="16" ry="17" stroke="currentColor" strokeWidth="5" />
        <ellipse cx="32" cy="38" rx="11" ry="12" stroke="currentColor" strokeWidth="1" />
        <path d={`M20 20 L32 ${5 + (item.set % 4)} L44 20 L32 31 Z`} fill="currentColor" />
        <path d="M28 17 L32 11 L36 17 L32 24 Z" stroke="var(--foreground)" strokeWidth="1" />
      </svg>
    );
  const Icon =
    item.slot === "helmet"
      ? Crown
      : item.slot === "chest"
        ? Shield
        : item.slot === "boots"
          ? Footprints
          : Gem;
  return <Icon className={`item-symbol rarity-${item.rarity}`} strokeWidth={1.25} />;
}
export function ChestArt({ tier }: { tier: number }) {
  return (
    <svg
      className={`item-symbol rarity-${[1, 2, 4, 5][tier] ?? 1}`}
      width="130"
      height="130"
      viewBox="0 0 130 130"
    >
      <path
        d="M20 52Q20 27 65 27Q110 27 110 52V92Q65 111 20 92Z"
        fill="var(--secondary)"
        stroke="currentColor"
        strokeWidth="3"
      />
      <path
        d="M21 53Q65 67 109 53M21 65Q65 81 109 65M36 39V98M94 39V98"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
      />
      <path d="M55 55H75V78H55Z" fill="currentColor" />
      <path d="M65 61V71" stroke="var(--background)" strokeWidth="4" />
      <path d="M51 26L65 12L79 26" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M10 26L15 20M113 27L120 20M65 2V7" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}
