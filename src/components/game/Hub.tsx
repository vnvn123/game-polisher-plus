import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Castle,
  Swords,
  UserRound,
  Coins,
  Gem,
  Lock,
  Heart,
  Wind,
  Play,
  Shield,
  BookOpen,
  Trophy,
  ScrollText,
  Settings,
  Package,
  Sparkles,
  X,
  PawPrint,
  Circle,
  Crown,
  Footprints,
  Crosshair,
  ChevronRight,
  RotateCcw,
} from "lucide-react";
import {
  HEROES,
  WEAPONS,
  PASSIVES,
  WORLDS,
  SLOTS,
  SETS,
  RINGS,
  PETS,
  RARITIES,
  CHESTS,
  UPGRADES,
  ACHIEVEMENTS,
  DAILY,
  WEEKLY,
  type Slot,
  type Item,
  type Objective,
} from "@/game/content";
import {
  combatStats,
  costOf,
  soulCost,
  metric,
  questKey,
  type Save,
  type Action,
} from "@/game/progression";
import { ItemArt, ChestArt } from "./ItemArt";
import { formatTime } from "./Run";
const navigation = [
  { id: "hunt", name: "Hunt", icon: Castle },
  { id: "character", name: "Character", icon: UserRound },
  { id: "weapons", name: "Weapons", icon: Swords },
  { id: "inventory", name: "Equipment", icon: Shield },
  { id: "chests", name: "Chests", icon: Package },
  { id: "upgrades", name: "Upgrades", icon: Sparkles },
  { id: "quests", name: "Quests", icon: ScrollText },
  { id: "achievements", name: "Achievements", icon: Trophy },
  { id: "records", name: "Records", icon: Crosshair },
  { id: "codex", name: "Codex", icon: BookOpen },
  { id: "settings", name: "Settings", icon: Settings },
];
export function Hub({
  save,
  act,
  onStart,
  onAccount,
  account,
  busy,
  recover,
}: {
  save: Save;
  act: (a: Action) => Promise<void>;
  onStart: () => void;
  onAccount: () => void;
  account: string;
  busy: boolean;
  recover: boolean;
}) {
  const [tab, setTab] = useState("hunt"),
    [selectedHero, setSelectedHero] = useState(save.hero),
    [category, setCategory] = useState("armor"),
    [questTab, setQuestTab] = useState("daily"),
    [codex, setCodex] = useState("bestiary"),
    [item, setItem] = useState<Item | null>(null),
    [slot, setSlot] = useState<Slot | null>(null),
    [odds, setOdds] = useState<string | null>(null);
  const hero = HEROES.find((h) => h.id === selectedHero) ?? HEROES[0];
  const active = HEROES.find((h) => h.id === save.hero) ?? HEROES[0];
  const world = WORLDS[save.world] ?? WORLDS[0];
  if (!hero || !active || !world) return null;
  const stats = combatStats(save);
  const heading = navigation.find((n) => n.id === tab)?.name ?? "Hunt";
  const objective = (o: Objective, kind: string) => {
    const period = kind === "daily" || kind === "weekly" ? questKey(kind, Date.now()) : undefined;
    const value = metric(save, o.metric, period),
      claimed = save.claims[period ? `${period}:${o.id}` : o.id];
    return (
      <div className="objective" key={o.id}>
        <ScrollText />
        <div className="objective-body">
          <h3>{o.hidden && value < o.target ? "Unknown Secret" : o.name}</h3>
          <p>{o.hidden && value < o.target ? "Hidden in the darkness." : o.description}</p>
          <div className="objective-rewards">
            {o.coins} coins · {o.gems} gems
          </div>
          <div className="progress">
            <span style={{ width: `${Math.min(100, (value / o.target) * 100)}%` }} />
          </div>
          <p>
            {Math.min(o.target, Math.floor(value)).toLocaleString()} / {o.target.toLocaleString()}
          </p>
        </div>
        <Button
          variant={value >= o.target && !claimed ? "game" : "outline"}
          disabled={busy || !!claimed || value < o.target}
          onClick={() => void act({ type: "claim", id: o.id, category: kind })}
        >
          {claimed ? "Claimed" : "Claim"}
        </Button>
      </div>
    );
  };
  return (
    <div className="shell">
      <header className="hub-header">
        <div className="small-brand">
          <Castle />
          <div>
            HOLLOWFALL<small>THE NIGHT REMEMBERS</small>
          </div>
        </div>
        <div className="header-center">
          {account === "Guest" ? "Guest journey" : "Cloud journey"}
        </div>
        <div className="resources">
          <div className="resource">
            <Coins />
            {save.coins.toLocaleString()}
          </div>
          <div className="resource gems">
            <Gem />
            {save.gems.toLocaleString()}
          </div>
          <Button variant="ghost" className="account-button" onClick={onAccount}>
            <UserRound />
            {account}
          </Button>
        </div>
      </header>
      <main className="hub-content">
        <div className="screen-heading">
          <div>
            <span className="eyebrow">
              {tab === "hunt" ? "Your next expedition" : "The sanctuary"}
            </span>
            <h1>{tab === "hunt" ? "Into the Hollow" : heading}</h1>
          </div>
          {tab === "hunt" && (
            <span className="reset-time">Best hunt · {formatTime(save.stats["best"] ?? 0)}</span>
          )}
        </div>
        {tab === "hunt" && (
          <>
            <div className="home-stage">
              <section>
                <div className="world-feature">
                  <img src={world.art} alt={world.name} />
                  <div className="world-shade" />
                  <div className="world-top">
                    <span>WORLD {save.world + 1} / 3</span>
                    <span>30:00 · FINAL BOSS</span>
                  </div>
                  <div className="world-title">
                    <span className="eyebrow">
                      {save.endless ? "Endless expedition" : "Survival expedition"}
                    </span>
                    <h2>{world.name}</h2>
                    <p>{world.description}</p>
                  </div>
                </div>
                <div className="world-tabs">
                  {WORLDS.map((w, i) => (
                    <Button
                      variant="ghost"
                      className={`world-tile ${save.world === i ? "selected" : ""}`}
                      key={w.id}
                      disabled={busy || i > (save.stats["worlds"] ?? 0)}
                      onClick={() => void act({ type: "selectWorld", id: String(i) })}
                    >
                      <img src={w.art} alt="" />
                      <span>{w.name}</span>
                      {i > (save.stats["worlds"] ?? 0) && <Lock size={14} />}
                    </Button>
                  ))}
                </div>
              </section>
              <section className="expedition">
                <img className="home-portrait" src={active.art} alt={active.name} />
                <h2 className="hero-home-name">{active.name}</h2>
                <p className="hero-home-title">{active.title}</p>
                <div className="signature">
                  <img src={WEAPONS.find((w) => w.id === active.weapon)?.art} alt="" />
                  {WEAPONS.find((w) => w.id === active.weapon)?.name}
                </div>
                <div className="stat-pair">
                  <span>
                    <Heart />
                    <strong>{Math.round(stats.hp)}</strong> HP
                  </span>
                  <span>
                    <Wind />
                    {active.speedLabel}
                  </span>
                </div>
                <div className="segmented">
                  <Button
                    variant="tab"
                    data-active={!save.endless}
                    disabled={busy}
                    onClick={() => void act({ type: "mode", id: "standard" })}
                  >
                    Survival
                  </Button>
                  <Button
                    variant="tab"
                    data-active={save.endless}
                    disabled={busy || !save.stats[`victory_${world.id}`]}
                    onClick={() => void act({ type: "mode", id: "endless" })}
                  >
                    Endless {!save.stats[`victory_${world.id}`] && <Lock size={12} />}
                  </Button>
                </div>
                <Button variant="game" className="start-run" disabled={busy} onClick={onStart}>
                  <Play size={17} />
                  {recover ? "Continue Hunt" : "Begin Hunt"}
                </Button>
                <p className="record-note">
                  Level {save.heroLevels[active.id] ?? 1} · {save.endless ? "Endless" : "Survival"}
                </p>
              </section>
            </div>
            <div className="section-rule">Daily contracts</div>
            <div className="daily-strip">
              {DAILY.map((o) => (
                <div className="daily-short" key={o.id}>
                  <div className="quest-icon">
                    <ScrollText size={18} />
                  </div>
                  <div className="objective-body">
                    <h3>{o.name}</h3>
                    <p>
                      {Math.floor(metric(save, o.metric, questKey("daily", Date.now())))} /{" "}
                      {o.target} · {o.gems} gems
                    </p>
                    <div className="progress">
                      <span
                        style={{
                          width: `${Math.min(100, (metric(save, o.metric, questKey("daily", Date.now())) / o.target) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Open ${o.name}`}
                    onClick={() => setTab("quests")}
                  >
                    <ChevronRight size={15} />
                  </Button>
                </div>
              ))}
            </div>
          </>
        )}
        {tab === "character" && (
          <>
            <div className="character-layout">
              <section className="character-details">
                <span className="eyebrow">{hero.title}</span>
                <h2>{hero.name}</h2>
                <p className="lore">{hero.lore}</p>
                <div className="detail-row">
                  <span>Base health</span>
                  <strong>{hero.hp}</strong>
                </div>
                <div className="detail-row">
                  <span>Movement</span>
                  <strong>{hero.speedLabel}</strong>
                </div>
                <div className="detail-row">
                  <span>Signature weapon</span>
                  <strong>{WEAPONS.find((w) => w.id === hero.weapon)?.name}</strong>
                </div>
                <div className="detail-row">
                  <span>Permanent level</span>
                  <strong>{save.heroLevels[hero.id] ?? 1} / 15</strong>
                </div>
              </section>
              <section className="loadout-stage">
                <div className="rune-platform" />
                <img
                  className={`loadout-hero ${save.skin === "spectral" ? "spectral-skin" : ""}`}
                  src={hero.art}
                  alt={hero.name}
                />
                {SLOTS.map((s) => {
                  const equipped = save.inventory.find((i) => i.id === save.equipped[s]);
                  const Icon =
                    s === "helmet"
                      ? Crown
                      : s === "boots"
                        ? Footprints
                        : s === "pet"
                          ? PawPrint
                          : s.startsWith("ring")
                            ? Circle
                            : Shield;
                  return (
                    <Button
                      variant="ghost"
                      className={`slot slot-${s} ${equipped ? `rarity-${equipped.rarity} rarity-frame` : ""}`}
                      key={s}
                      onClick={() => setSlot(s)}
                      aria-label={`Equip ${s}`}
                    >
                      {equipped ? <ItemArt item={equipped} /> : <Icon />}
                      <span>{s === "ring1" ? "Ring I" : s === "ring2" ? "Ring II" : s}</span>
                    </Button>
                  );
                })}
              </section>
              <section className="character-right">
                <div>
                  <div className="section-rule">Character progression</div>
                  <div className="detail-row">
                    <span>Matching souls</span>
                    <strong>{save.souls[`hero_${hero.id}`] ?? 0}</strong>
                  </div>
                  <div className="detail-row">
                    <span>Upgrade cost</span>
                    <strong>
                      {costOf(save.heroLevels[hero.id] ?? 1)} coins ·{" "}
                      {soulCost(save.heroLevels[hero.id] ?? 1)} souls
                    </strong>
                  </div>
                  <Button
                    variant="game"
                    disabled={busy}
                    onClick={() =>
                      void act({
                        type: save.heroes.includes(hero.id) ? "upgradeHero" : "unlockHero",
                        id: hero.id,
                      })
                    }
                  >
                    {save.heroes.includes(hero.id) ? "Upgrade" : `Unlock · ${hero.cost} coins`}
                  </Button>
                  {!save.heroes.includes(hero.id) && (
                    <p className="filter-note">Requires {hero.need} lifetime defeats.</p>
                  )}
                </div>
                <div>
                  <div className="section-rule">Chosen champion</div>
                  <Button
                    variant="outline"
                    disabled={busy || !save.heroes.includes(hero.id) || save.hero === hero.id}
                    onClick={() => void act({ type: "selectHero", id: hero.id })}
                  >
                    {save.hero === hero.id ? "Selected" : "Select Character"}
                  </Button>
                  <div className="section-rule">Appearance</div>
                  <Button
                    variant="tab"
                    onClick={() =>
                      void act({
                        type: "skin",
                        id: save.skin === "original" ? "spectral" : "original",
                      })
                    }
                  >
                    {save.skin === "original" ? "Spectral" : "Original"} appearance
                  </Button>
                </div>
              </section>
            </div>
            <div className="roster">
              {HEROES.map((h) => (
                <Button
                  variant="ghost"
                  className={`roster-hero ${h.id === selectedHero ? "selected" : ""} ${!save.heroes.includes(h.id) ? "locked" : ""}`}
                  key={h.id}
                  aria-label={h.name}
                  onClick={() => setSelectedHero(h.id)}
                >
                  <img src={h.art} alt={h.name} />
                  {!save.heroes.includes(h.id) && <Lock />}
                </Button>
              ))}
            </div>
          </>
        )}
        {tab === "weapons" && (
          <div className="collection-grid">
            {WEAPONS.map((w) => {
              const l = save.weaponLevels[w.id] ?? 1;
              return (
                <article className="weapon-card" key={w.id}>
                  <div className="card-meta">
                    <span>{w.kind.toUpperCase()}</span>
                    <span>LV {l} / 15</span>
                  </div>
                  <img src={w.art} alt={w.name} />
                  <h2>{w.name}</h2>
                  <p>{w.description}</p>
                  <div className="stats-line">
                    {w.damage} damage · {w.cooldown}s
                  </div>
                  <div className="detail-row">
                    <span>Souls</span>
                    <strong>
                      {save.souls[`weapon_${w.id}`] ?? 0} / {soulCost(l)}
                    </strong>
                  </div>
                  <Button
                    variant="game"
                    disabled={busy || l >= 15}
                    onClick={() => void act({ type: "upgradeWeapon", id: w.id })}
                  >
                    Upgrade · {costOf(l)} coins
                  </Button>
                </article>
              );
            })}
          </div>
        )}
        {tab === "inventory" && (
          <>
            <div className="filters">
              {["armor", "ring", "pet"].map((c) => (
                <Button
                  variant="tab"
                  data-active={category === c}
                  key={c}
                  onClick={() => setCategory(c)}
                >
                  {c === "armor" ? "Armor" : c === "ring" ? "Rings" : "Pets"}
                </Button>
              ))}
            </div>
            {save.inventory.some((i) => i.category === category && i.count > 0) ? (
              <div className="item-grid">
                {save.inventory
                  .filter((i) => i.category === category && i.count > 0)
                  .map((i) => (
                    <Button
                      variant="ghost"
                      className={`item-card rarity-${i.rarity} rarity-frame`}
                      key={i.id}
                      onClick={() => setItem(i)}
                    >
                      <ItemArt item={i} />
                      <h3>{i.name}</h3>
                      <span className="rarity-label">{RARITIES[i.rarity]}</span>
                      <small>
                        Lv {i.level} · ×{i.count}
                        {Object.values(save.equipped).includes(i.id) ? " · Equipped" : ""}
                      </small>
                    </Button>
                  ))}
              </div>
            ) : (
              <div className="empty-state">
                <Package />
                <h2>No relics yet</h2>
                <p>The collection awaits your first discovery.</p>
                <Button variant="game" onClick={() => setTab("chests")}>
                  Visit Chests
                </Button>
              </div>
            )}
          </>
        )}
        {tab === "chests" && (
          <>
            <div className="filters">
              {["armor", "ring", "pet", "hero", "weapon"].map((c) => (
                <Button
                  variant="tab"
                  data-active={category === c}
                  key={c}
                  onClick={() => setCategory(c)}
                >
                  {c === "armor"
                    ? "Armor"
                    : c === "ring"
                      ? "Rings"
                      : c === "pet"
                        ? "Pets"
                        : c === "hero"
                          ? "Character Souls"
                          : "Weapon Souls"}
                </Button>
              ))}
            </div>
            <div className="chest-grid">
              {CHESTS.map((c, i) => (
                <article className="chest-card" key={c.id}>
                  <span className={`rarity-${[1, 2, 4, 5][i]} rarity-label`}>
                    {c.name.toUpperCase()}
                  </span>
                  <div className="chest-art">
                    <ChestArt tier={i} />
                  </div>
                  <h2>{c.name}</h2>
                  <p>
                    {category === "hero"
                      ? "Character souls"
                      : category === "weapon"
                        ? "Weapon souls"
                        : category === "armor"
                          ? "Armor relic"
                          : category === "ring"
                            ? "Ring relic"
                            : "Pet companion"}
                  </p>
                  <Button variant="tab" onClick={() => setOdds(c.id)}>
                    View drop rates
                  </Button>
                  <Button
                    variant="game"
                    disabled={busy || save.gems < c.price}
                    onClick={() => void act({ type: "chest", tier: c.id, category })}
                  >
                    <Gem size={15} />
                    {c.price} · Open
                  </Button>
                </article>
              ))}
            </div>
          </>
        )}
        {tab === "upgrades" && (
          <>
            <div className="upgrade-grid">
              {UPGRADES.map((u, i) => {
                const Icon =
                  [Wind, Heart, Swords, Shield, BookOpen, Sparkles, Crosshair, Coins][i] ??
                  Sparkles;
                const l = save.upgrades[u.id] ?? 0;
                return (
                  <article className="upgrade-card" key={u.id}>
                    <Icon />
                    <h2>{u.name}</h2>
                    <p>{u.effect}</p>
                    <div className="card-meta">
                      <span>LEVEL {l}</span>
                      <span>{u.max} MAX</span>
                    </div>
                    <div className="progress">
                      <span style={{ width: `${(l / u.max) * 100}%` }} />
                    </div>
                    <Button
                      variant="game"
                      disabled={busy || l >= u.max || save.coins < costOf(l)}
                      onClick={() => void act({ type: "upgrade", id: u.id })}
                    >
                      {l >= u.max ? "Max Level" : `${costOf(l)} coins`}
                    </Button>
                  </article>
                );
              })}
            </div>
            <div className="section-rule">Reforge progression</div>
            <Button
              variant="outline"
              disabled={busy}
              onClick={() => {
                if (window.confirm("Reset permanent upgrades and refund their coins?"))
                  void act({ type: "resetUpgrades" });
              }}
            >
              <RotateCcw />
              Reset & refund
            </Button>
          </>
        )}
        {tab === "quests" && (
          <>
            <div className="filters">
              <Button
                variant="tab"
                data-active={questTab === "daily"}
                onClick={() => setQuestTab("daily")}
              >
                Daily
              </Button>
              <Button
                variant="tab"
                data-active={questTab === "weekly"}
                onClick={() => setQuestTab("weekly")}
              >
                Weekly
              </Button>
              <span className="reset-time">
                {questTab === "daily" ? "Resets at 00:00 UTC" : "Resets Monday at 00:00 UTC"}
              </span>
            </div>
            <div className="objective-list">
              {(questTab === "daily" ? DAILY : WEEKLY).map((o) => objective(o, questTab))}
            </div>
          </>
        )}
        {tab === "achievements" && (
          <div className="objective-list">
            {ACHIEVEMENTS.map((o) => objective(o, "achievement"))}
          </div>
        )}
        {tab === "records" && (
          <>
            <table className="record-table">
              <thead>
                <tr>
                  <th>World</th>
                  <th>Survival</th>
                  <th>Endless</th>
                  <th>Final boss</th>
                </tr>
              </thead>
              <tbody>
                {WORLDS.map((w, i) => (
                  <tr key={w.id}>
                    <td>{w.name}</td>
                    <td>{formatTime(save.stats[`best_${i}_standard`] ?? 0)}</td>
                    <td>{formatTime(save.stats[`best_${i}_endless`] ?? 0)}</td>
                    <td>{save.stats[`victory_${w.id}`] ? "Defeated" : "Unchallenged"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="stats-grid">
              {[
                ["Runs", "runs"],
                ["Enemies defeated", "kills"],
                ["Bosses defeated", "bosses"],
                ["Damage dealt", "damage"],
                ["Crystals gathered", "crystals"],
                ["Pet activations", "pets"],
                ["Equipment collected", "collected"],
                ["Merges", "merges"],
              ].map(([label, key]) => (
                <div className="lifetime-stat" key={key}>
                  <small>{label}</small>
                  <strong>{Math.floor(save.stats[key ?? ""] ?? 0).toLocaleString()}</strong>
                </div>
              ))}
            </div>
          </>
        )}
        {tab === "codex" && (
          <div className="codex-layout">
            <div className="codex-index">
              {["bestiary", "weapons", "passives", "armor sets", "rings", "pets"].map((c) => (
                <Button variant="tab" data-active={codex === c} key={c} onClick={() => setCodex(c)}>
                  {c[0]?.toUpperCase()}
                  {c.slice(1)}
                </Button>
              ))}
            </div>
            <div className="codex-article">
              <h2>
                {codex[0]?.toUpperCase()}
                {codex.slice(1)}
              </h2>
              {codex === "bestiary"
                ? WORLDS.map((w) => (
                    <section key={w.id}>
                      <div className="section-rule">{w.name}</div>
                      {[...w.enemies, ...w.bosses].map((e) => (
                        <div className="detail-row" key={e.id}>
                          <span>{save.stats[`enemy_${e.id}`] ? e.name : "Undiscovered"}</span>
                          <strong>
                            {save.stats[`enemy_${e.id}`]
                              ? `${e.hp} HP · ${e.dps} DPS · ${save.stats[`enemy_${e.id}`]} defeats`
                              : "—"}
                          </strong>
                        </div>
                      ))}
                    </section>
                  ))
                : codex === "weapons"
                  ? WEAPONS.map((w) => (
                      <section key={w.id}>
                        <div className="section-rule">{w.name}</div>
                        {w.levels.map((l, i) => (
                          <div className="detail-row" key={i}>
                            <span>Level {i + 1}</span>
                            <strong>{l}</strong>
                          </div>
                        ))}
                      </section>
                    ))
                  : codex === "passives"
                    ? PASSIVES.map((p) => (
                        <div className="detail-row" key={p.id}>
                          <span>{p.name}</span>
                          <strong>{p.effect}</strong>
                        </div>
                      ))
                    : codex === "armor sets"
                      ? SETS.map((s) => (
                          <section key={s[0]}>
                            <div className="section-rule">{s[0]}</div>
                            <p>
                              2 pieces · {s[1]}: {s[2]}
                            </p>
                            <p>
                              4 pieces · {s[3]}: {s[4]}
                            </p>
                          </section>
                        ))
                      : codex === "rings"
                        ? RINGS.map((r) => (
                            <section key={r[0]}>
                              <div className="section-rule">{r[1]}</div>
                              <p>{r[2]}</p>
                            </section>
                          ))
                        : PETS.map((p) => (
                            <section key={p[0]}>
                              <div className="section-rule">
                                {p[0]} · {p[1]}
                              </div>
                              <p>
                                {p[4]} · {p[2]}s cooldown
                              </p>
                            </section>
                          ))}
            </div>
          </div>
        )}
        {tab === "settings" && (
          <div className="settings-list">
            {(["numbers", "effects", "shake", "animation"] as const).map((k, i) => (
              <div className="setting-row" key={k}>
                <h3>
                  {["Damage numbers", "Combat effects", "Screen shake", "Character animation"][i]}
                </h3>
                <input
                  type="checkbox"
                  aria-label={
                    ["Damage numbers", "Combat effects", "Screen shake", "Character animation"][i]
                  }
                  checked={save.settings[k]}
                  disabled={busy}
                  onChange={(e) => void act({ type: "settings", value: { [k]: e.target.checked } })}
                />
              </div>
            ))}
            <div className="setting-row">
              <h3>Interface scale</h3>
              <input
                type="range"
                min="0.8"
                max="1.2"
                step="0.1"
                aria-label="Interface scale"
                defaultValue={save.settings.scale}
                onChange={(e) =>
                  void act({ type: "settings", value: { scale: Number(e.target.value) } })
                }
              />
            </div>
            <div className="setting-row">
              <h3>Account</h3>
              <Button variant="outline" onClick={onAccount}>
                {account === "Guest" ? "Sign in" : account}
              </Button>
            </div>
            <div className="section-rule">Recent currency history</div>
            {save.transactions
              .slice(-8)
              .reverse()
              .map((t) => (
                <div className="detail-row" key={t.id}>
                  <span>{t.label}</span>
                  <strong>
                    {t.coins >= 0 ? "+" : ""}
                    {t.coins} coins · {t.gems >= 0 ? "+" : ""}
                    {t.gems} gems
                  </strong>
                </div>
              ))}
          </div>
        )}
      </main>
      <nav className="hub-nav" aria-label="Game menu">
        {navigation.map((n) => (
          <Button
            variant="tab"
            aria-current={tab === n.id ? "page" : undefined}
            key={n.id}
            onClick={() => {
              setTab(n.id);
              if (n.id === "character") setSelectedHero(save.hero);
            }}
          >
            <n.icon />
            <span>{n.name}</span>
          </Button>
        ))}
      </nav>
      {(item || slot || odds) && (
        <div className="modal-backdrop">
          <div className="modal" role="dialog" aria-modal="true">
            <Button
              variant="ghost"
              size="icon"
              className="modal-close"
              aria-label="Close dialog"
              onClick={() => {
                setItem(null);
                setSlot(null);
                setOdds(null);
              }}
            >
              <X />
            </Button>
            {odds ? (
              <>
                <h2>Chest drop rates</h2>
                <table className="odds-table">
                  <tbody>
                    {RARITIES.map((r, i) => (
                      <tr key={r}>
                        <td>{r}</td>
                        <td>{CHESTS.find((c) => c.id === odds)?.odds[i]}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p>
                  Displayed base odds. Unsuccessful openings gradually shift odds toward higher
                  rarities.
                </p>
              </>
            ) : slot ? (
              <>
                <h2>Equip {slot}</h2>
                <div className="item-picker-grid">
                  {save.inventory
                    .filter(
                      (i) =>
                        i.count > 0 &&
                        (slot.startsWith("ring") ? i.category === "ring" : i.slot === slot),
                    )
                    .map((i) => (
                      <Button
                        variant="ghost"
                        className={`item-card rarity-${i.rarity} rarity-frame`}
                        key={i.id}
                        onClick={async () => {
                          await act({ type: "equip", id: i.id, slot });
                          setSlot(null);
                        }}
                      >
                        <ItemArt item={i} />
                        <h3>{i.name}</h3>
                        <span className="rarity-label">{RARITIES[i.rarity]}</span>
                      </Button>
                    ))}
                </div>
                {!save.inventory.some(
                  (i) =>
                    i.count > 0 &&
                    (slot.startsWith("ring") ? i.category === "ring" : i.slot === slot),
                ) && <p>No compatible relics collected.</p>}
                <div className="modal-actions">
                  <Button
                    variant="outline"
                    onClick={async () => {
                      await act({ type: "unequip", slot });
                      setSlot(null);
                    }}
                  >
                    Unequip
                  </Button>
                </div>
              </>
            ) : (
              item && (
                <>
                  <ItemArt item={item} />
                  <h2>{item.name}</h2>
                  <p>
                    {RARITIES[item.rarity]} · Level {item.level} · {item.count} copies
                  </p>
                  <p>
                    {item.category === "ring"
                      ? RINGS[item.set]?.[2]
                      : item.category === "pet"
                        ? PETS[item.set]?.[4]
                        : `${SETS[item.set]?.[0]} · Epic or above activates set effects.`}
                  </p>
                  <div className="modal-actions">
                    <Button
                      variant="outline"
                      disabled={busy || item.count < 3}
                      onClick={async () => {
                        await act({ type: "merge", id: item.id });
                        setItem(null);
                      }}
                    >
                      Merge ×3
                    </Button>
                    <Button
                      variant="game"
                      disabled={busy || item.level >= 20}
                      onClick={async () => {
                        await act({ type: "upgradeItem", id: item.id });
                        setItem(null);
                      }}
                    >
                      Upgrade · {costOf(item.level)}
                    </Button>
                  </div>
                </>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
}
