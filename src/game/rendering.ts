import { ART } from "./assets";
import { enemyDefinition, type GameState } from "./simulation";
import { heroById } from "./content";
import type { Save } from "./progression";
import libraryCreatures from "@/assets/library-creatures.png";
import cityCreatures from "@/assets/city-creatures.png";
export class Renderer {
  images = new Map<string, HTMLImageElement>();
  palette: Record<string, string> = {};
  constructor(public canvas: HTMLCanvasElement) {
    for (const key of [
      "floor",
      "floor-alt",
      "foreground",
      "muted-foreground",
      "primary",
      "spectral",
      "danger",
      "plague",
      "border",
      "xp",
      "card",
    ])
      this.palette[key] = getComputedStyle(document.documentElement)
        .getPropertyValue(`--${key}`)
        .trim();
  }
  image(url: string | undefined) {
    if (!url) return;
    let image = this.images.get(url);
    if (!image) {
      image = new Image();
      image.src = url;
      this.images.set(url, image);
    }
    return image;
  }
  draw(s: GameState, save: Save) {
    const canvas = this.canvas;
    const width = canvas.clientWidth,
      height = canvas.clientHeight,
      dpr = Math.min(2, window.devicePixelRatio);
    if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
      canvas.width = width * dpr;
      canvas.height = height * dpr;
    }
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.imageSmoothingEnabled = false;
    const pal = this.palette;
    ctx.fillStyle = pal["floor"] ?? "";
    ctx.fillRect(0, 0, width, height);
    ctx.save();
    ctx.translate(width / 2 - s.player.x, height / 2 - s.player.y);
    if (save.settings.shake && s.player.inv > 0 && !window.matchMedia("(prefers-reduced-motion: reduce)").matches)
      ctx.translate(Math.sin(s.time * 95) * 2, Math.cos(s.time * 83) * 2);
    const minx = s.player.x - width / 2,
      miny = s.player.y - height / 2;
    const floorImage = this.image(ART["hollow-cathedral-floor"]);
    const floorReady = floorImage?.complete && floorImage.naturalWidth;
    if (floorReady) {
      const pattern = ctx.createPattern(floorImage, "repeat");
      if (pattern) {
        ctx.globalAlpha = 0.55;
        ctx.fillStyle = pattern;
        ctx.fillRect(minx, miny, width, height);
        ctx.globalAlpha = 1;
      }
    }
    const tile = 64;
    if (!floorReady)
    for (let x = Math["floor"](minx / tile) * tile; x < minx + width + tile; x += tile)
      for (let y = Math["floor"](miny / tile) * tile; y < miny + height + tile; y += tile) {
        ctx.fillStyle =
          ((Math["floor"](x / tile) + Math["floor"](y / tile)) % 2 === 0
            ? pal["floor-alt"]
            : pal["floor"]) ?? "";
        ctx.fillRect(x + 1, y + 1, tile - 2, tile - 2);
        ctx.strokeStyle = pal["border"] ?? "";
        ctx.globalAlpha = 0.13;
        ctx.strokeRect(x + 3, y + 3, tile - 6, tile - 6);
        ctx.globalAlpha = 1;
        const hash = Math.abs(Math.imul(x + 7, y + 13));
        if (hash % 19 === 0) {
          ctx.fillStyle = pal["plague"] ?? "";
          ctx.globalAlpha = 0.3;
          ctx.fillRect(x + 12, y + 10, 7, 12);
          ctx.fillRect(x + 16, y + 6, 5, 8);
          ctx.globalAlpha = 1;
        }
      }
    // Walkable ruins provide environmental texture without lethal terrain.
    ctx.strokeStyle = pal["border"] ?? "";
    for (let i = 0; i < 20; i++) {
      const x = (Math["floor"](minx / 700) + (i % 5)) * 700,
        y = (Math["floor"](miny / 700) + Math["floor"](i / 5)) * 700;
      ctx.fillStyle = pal["card"] ?? "";
      ctx.fillRect(x, y, 80, 18);
      ctx.fillRect(x + 5, y - 25, 16, 25);
      ctx.fillRect(x + 57, y - 16, 18, 16);
      ctx.strokeRect(x, y, 80, 18);
    }
    for (const g of s.pickups) {
      ctx.save();
      ctx.translate(g.x, g.y);
      if (g.kind === "xp") {
        ctx.rotate(Math.PI / 4);
        ctx.fillStyle = pal["xp"] ?? "";
        ctx.fillRect(-4, -4, 8, 8);
        ctx.fillStyle = pal["foreground"] ?? "";
        ctx.globalAlpha = 0.5;
        ctx.fillRect(-2, -3, 2, 3);
      } else if (g.kind === "chest") {
        ctx.fillStyle = pal["primary"] ?? "";
        ctx.fillRect(-13, -8, 26, 17);
        ctx.fillStyle = pal["card"] ?? "";
        ctx.fillRect(-10, -5, 20, 7);
        ctx.fillStyle = pal["primary"] ?? "";
        ctx.fillRect(-2, -7, 4, 13);
      } else {
        ctx.fillStyle =
          (g.kind === "coin" ? pal["primary"] : g.kind === "heart" ? pal["danger"] : pal["spectral"]) ?? "";
        ctx.beginPath();
        ctx.arc(0, 0, g.kind === "mark" ? 7 : 5, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
    const worldSheet = s.world === 1 ? libraryCreatures : s.world === 2 ? cityCreatures : undefined;
    const enemySheet = this.image(worldSheet ?? ART["wilds-enemies"]),
      bossSheet = this.image(worldSheet ?? ART["wilds-bosses"]);
    for (const e of s.enemies) {
      const def = enemyDefinition(s, e.def);
      if (!def) continue;
      ctx.fillStyle = pal["floor"] ?? "";
      ctx.globalAlpha = 0.6;
      ctx.beginPath();
      ctx.ellipse(e.x, e.y + e.radius, e.radius, 7, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
      const sheet = def.boss ? bossSheet : enemySheet;
      const size = e.radius * (def.boss ? 3.2 : 3);
      if (sheet?.complete && sheet.naturalWidth) {
        const cell = sheet.naturalWidth / 4;
        const index = worldSheet ? (def.boss ? 9 + def.cell : Math.min(8, def.cell)) : def.cell;
        const sx = (index % 4) * cell,
          sy = Math.floor(index / 4) * cell;
        ctx.drawImage(sheet, sx, sy, cell, cell, e.x - size / 2, e.y - size * 0.65, size, size);
      } else {
        ctx.fillStyle = pal["danger"] ?? "";
        ctx.fillRect(e.x - e.radius, e.y - e.radius, e.radius * 2, e.radius * 2);
      }
      if (e.hit > 0 && save.settings.effects) {
        ctx.fillStyle = pal["foreground"] ?? "";
        ctx.globalAlpha = 0.18;
        ctx.fillRect(e.x - e.radius, e.y - e.radius, e.radius * 2, e.radius * 2);
        ctx.globalAlpha = 1;
      }
      if (e.windup > 0) {
        ctx.strokeStyle = pal["danger"] ?? "";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(e.x, e.y, e.radius + 8, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([7, 6]);
        ctx.beginPath();
        ctx.moveTo(e.x, e.y);
        ctx.lineTo(e.x + Math.cos(e.angle) * 130, e.y + Math.sin(e.angle) * 130);
        ctx.stroke();
        ctx.setLineDash([]);
      }
      if (def.boss || e.hp < e.max) {
        ctx.fillStyle = pal["card"] ?? "";
        ctx.fillRect(e.x - e.radius, e.y - size * 0.6 - 10, e.radius * 2, 4);
        ctx.fillStyle = (def.boss ? pal["danger"] : pal["plague"]) ?? "";
        ctx.fillRect(e.x - e.radius, e.y - size * 0.6 - 10, (e.radius * 2 * e.hp) / e.max, 4);
      }
    }
    for (const b of s.projectiles) {
      ctx.strokeStyle = (b.weapon === "harvest" ? pal["primary"] : pal["spectral"]) ?? "";
      ctx.lineWidth = b.weapon === "bow" ? 3 : 5;
      ctx.beginPath();
      const a = Math.atan2(b.vy, b.vx);
      ctx.moveTo(b.x - Math.cos(a) * 14, b.y - Math.sin(a) * 14);
      ctx.lineTo(b.x + Math.cos(a) * 6, b.y + Math.sin(a) * 6);
      ctx.stroke();
    }
    for (const f of s.effects) {
      if (f.kind === "number") {
        if (save.settings.numbers) {
          ctx.save();
          ctx.font = "700 13px Manrope, sans-serif";
          ctx.textAlign = "center";
          ctx.globalAlpha = Math.min(1, f.life * 3);
          ctx.lineWidth = 3;
          ctx.strokeStyle = pal["floor"] ?? "";
          ctx.fillStyle = pal["foreground"] ?? "";
          const y = f.y - (1 - f.life / f.duration) * 26;
          ctx.strokeText(String(Math.ceil(f.damage)), f.x, y);
          ctx.fillText(String(Math.ceil(f.damage)), f.x, y);
          ctx.restore();
        }
        continue;
      }
      if (!save.settings.effects && !["mine", "charge", "bats", "trap"].includes(f.kind)) continue;
      ctx.save();
      ctx.strokeStyle =
        (["mine", "field", "bog", "trap"].includes(f.kind) ? pal["plague"] : pal["spectral"]) ?? "";
      ctx.fillStyle = ctx.strokeStyle;
      ctx.lineWidth = 2;
      ctx.globalAlpha = Math.min(0.7, f.life * 2);
      if (["bolt", "beam", "charge", "trail"].includes(f.kind)) {
        ctx.lineWidth = f.kind === "beam" ? f.radius * 2 : f.kind === "charge" ? 1 : 3;
        ctx.beginPath();
        ctx.moveTo(f.x, f.y);
        ctx.lineTo(f.x2, f.y2);
        ctx.stroke();
      } else if (["slash", "delayed"].includes(f.kind)) {
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.radius, f.x2 - f.y2, f.x2 + f.y2);
        ctx.stroke();
      } else if (f.kind === "bats") {
        const count =
          1 + ((s.weapons["bats"] ?? 1) >= 2 ? 1 : 0) + ((s.weapons["bats"] ?? 1) >= 5 ? 2 : 0);
        const bat = this.image(ART.bat);
        for (let i = 0; i < count; i++) {
          const a = s.time * 2.8 + (i * Math.PI * 2) / count,
            x = s.player.x + Math.cos(a) * f.radius,
            y = s.player.y + Math.sin(a) * f.radius;
          if (bat?.complete && bat.naturalWidth) ctx.drawImage(bat, x - 15, y - 15, 30, 30);
        }
      } else {
        ctx.beginPath();
        ctx.arc(
          f.x,
          f.y,
          f.radius * (f.kind === "pulse" ? 1 - (f.life / f.duration) * 0.2 : 1),
          0,
          Math.PI * 2,
        );
        ctx.stroke();
        ctx.globalAlpha = 0.09;
        ctx.fill();
        if (f.kind === "mine") {
          ctx.globalAlpha = 0.8;
          ctx.strokeRect(f.x - 10, f.y - 10, 20, 20);
        }
      }
      ctx.restore();
    }
    const hero = heroById(s.hero),
      image = this.image(hero?.art);
    ctx.globalAlpha = s.player.inv > 0 && Math["floor"](s.time * 16) % 2 === 0 ? 0.55 : 1;
    const bob = save.settings.animation ? Math.sin(s.time * 7) * 1.2 : 0;
    if (image?.complete && image.naturalWidth) {
      const h = 72,
        w = (h * image.naturalWidth) / image.naturalHeight;
      ctx.save();
      ctx.translate(s.player.x, s.player.y + bob);
      if (Math.cos(s.player.angle) < 0) ctx.scale(-1, 1);
      if (save.skin === "spectral") ctx.filter = "hue-rotate(140deg)";
      ctx.drawImage(image, -w / 2, -h * 0.7, w, h);
      ctx.restore();
    }
    ctx.globalAlpha = 1;
    if (s.player.hp < s.player.max) {
      ctx.fillStyle = pal["card"] ?? "";
      ctx.fillRect(s.player.x - 22, s.player.y + 31, 44, 5);
      ctx.fillStyle = pal["danger"] ?? "";
      ctx.fillRect(s.player.x - 22, s.player.y + 31, (44 * s.player.hp) / s.player.max, 5);
    }
    const pet = save.inventory.find((i) => i.id === save.equipped.pet);
    if (pet) {
      const petImage = this.image([ART.raven, ART.bat, ART.raven, ART.witchglass][pet.set % 4]);
      if (petImage?.complete && petImage.naturalWidth)
        ctx.drawImage(petImage, s.player.x - 45, s.player.y + 8, 26, 26);
    }
    if (s.decoy) {
      ctx.strokeStyle = pal["spectral"] ?? "";
      ctx.strokeRect(s.decoy.x - 12, s.decoy.y - 25, 24, 45);
    }
    ctx.restore();
  }
}
