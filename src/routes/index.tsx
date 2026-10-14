import { createFileRoute } from "@tanstack/react-router";
import { Game } from "@/components/game/Game";
export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Hollowfall — The Night Remembers" },
      {
        name: "description",
        content:
          "Enter Hollowfall, a dark-fantasy survival game with cursed heroes, spectral weapons, and persistent progression.",
      },
      { property: "og:title", content: "Hollowfall — The Night Remembers" },
      {
        property: "og:description",
        content: "Survive the darkness. Collect ancient relics. Challenge the final boss.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Game,
});
