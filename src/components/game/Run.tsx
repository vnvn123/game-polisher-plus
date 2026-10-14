import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Coins, Pause, Skull, Play, ArrowLeft, RotateCcw, Heart, X } from "lucide-react";
import { PASSIVES, PETS, WEAPONS, WORLDS, weaponStats } from "@/game/content";
import { ItemArt } from "./ItemArt";
import { Renderer } from "@/game/rendering";
import { choose, step, type GameState, type Input } from "@/game/simulation";
import type { Save } from "@/game/progression";
export const formatTime = (time: number) =>
  `${Math.floor(time / 60)}:${String(Math.floor(time % 60)).padStart(2, "0")}`;
export function Run({
  save,
  initial,
  onExit,
  onCheckpoint,
  onFinish,
  cloud,
}: {
  save: Save;
  initial: GameState;
  onExit: () => void;
  onCheckpoint: (
    frames: Input[],
    state: GameState,
    abandon?: boolean,
  ) => Promise<GameState | undefined>;
  onFinish: (s: GameState) => Promise<void>;
  cloud: boolean;
}) {
  const canvas = useRef<HTMLCanvasElement>(null),
    state = useRef<GameState>(structuredClone(initial)),
    keys = useRef(new Set<string>()),
    frames = useRef<Input[]>([]),
    joystick = useRef({ x: 0, y: 0 }),
    pointer = useRef<{ x: number; y: number } | null>(null),
    pausedRef = useRef(false),
    saving = useRef(false),
    finished = useRef(false);
  const [hud, setHud] = useState(state.current),
    [paused, setPaused] = useState(false),
    [inspected, setInspected] = useState<string | null>(null),
    [pending, setPending] = useState(false),
    [settled, setSettled] = useState(false),
    [error, setError] = useState(""),
    [saveStatus, setSaveStatus] = useState(
      cloud ? "Cloud checkpoints active" : "Guest save on this device",
    );
  useEffect(() => {
    if (!canvas.current) return;
    const renderer = new Renderer(canvas.current);
    let raf = 0,
      last = performance.now(),
      acc = 0,
      hudTime = 0,
      checkpoint = 0;
    const kd = (e: KeyboardEvent) => {
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(e.key))
        e.preventDefault();
      if (e.key === "Escape" || e.key.toLowerCase() === "p") {
        pausedRef.current = true;
        setPaused(true);
        keys.current.clear();
        return;
      }
      keys.current.add(e.key.toLowerCase());
    };
    const ku = (e: KeyboardEvent) => keys.current.delete(e.key.toLowerCase());
    const blur = () => {
      pausedRef.current = true;
      setPaused(true);
      keys.current.clear();
    };
    window.addEventListener("keydown", kd);
    window.addEventListener("keyup", ku);
    window.addEventListener("blur", blur);
    const loop = (now: number) => {
      acc += Math.min(0.1, (now - last) / 1000);
      last = now;
      const s = state.current;
      if (!pausedRef.current && !s.offers.length && !s.ended && !saving.current) {
        while (acc >= 1 / 30) {
          const input = {
            x: Math.max(
              -1,
              Math.min(
                1,
                (keys.current.has("d") || keys.current.has("arrowright") ? 1 : 0) -
                  (keys.current.has("a") || keys.current.has("arrowleft") ? 1 : 0) +
                  joystick.current.x,
              ),
            ),
            y: Math.max(
              -1,
              Math.min(
                1,
                (keys.current.has("s") || keys.current.has("arrowdown") ? 1 : 0) -
                  (keys.current.has("w") || keys.current.has("arrowup") ? 1 : 0) +
                  joystick.current.y,
              ),
            ),
          };
          step(s, save, input);
          frames.current.push(input);
          acc -= 1 / 30;
          checkpoint++;
          if (s.offers.length || s.ended) break;
        }
        if (checkpoint >= 300) {
          checkpoint = 0;
          void flush(false);
        }
      } else acc = 0;
      renderer.draw(s, save);
      if (now - hudTime > 100) {
        setHud(structuredClone(s));
        hudTime = now;
      }
      if (s.ended && !finished.current) {
        finished.current = true;
        void finish();
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("keydown", kd);
      window.removeEventListener("keyup", ku);
      window.removeEventListener("blur", blur);
    };
  }, [save]);
  async function flush(abandon: boolean) {
    if (saving.current) return false;
    saving.current = true;
    setPending(true);
    setSaveStatus("Saving checkpoint…");
    try {
      const returned = await onCheckpoint([...frames.current], state.current, abandon);
      frames.current = [];
      if (returned) state.current = returned;
      setSaveStatus(cloud ? "Checkpoint saved to Cloud" : "Checkpoint saved on this device");
      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Checkpoint failed");
      pausedRef.current = true;
      setPaused(true);
      setSaveStatus("Checkpoint not saved");
      return false;
    } finally {
      saving.current = false;
      setPending(false);
    }
  }
  async function finish() {
    const saved = await flush(false);
    if (saved) {
      try {
        await onFinish(state.current);
        setSettled(true);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Rewards were not saved");
      }
    }
  }
  const pick = (id: string) => {
    choose(state.current, id);
    frames.current.push({ x: 0, y: 0, choice: id });
    setHud(structuredClone(state.current));
  };
  const boss = hud.enemies.find((e) => WORLDS[hud.world]?.["bosses"].some((b) => b.id === e.def));
  const bossDef = boss ? WORLDS[hud.world]?.["bosses"].find((b) => b.id === boss.def) : undefined;
  const equippedPet = save.inventory.find((item) => item.id === save.equipped.pet);
  const inspectedWeapon = WEAPONS.find((w) => inspected === `w:${w.id}`);
  const inspectedPassive = PASSIVES.find((p) => inspected === `p:${p.id}`);
  const inspectionLevel = inspectedWeapon
    ? hud.weapons[inspectedWeapon.id] ?? 1
    : hud.passives[inspectedPassive?.id ?? ""] ?? 1;
  const inspectionStats = inspectedWeapon ? weaponStats(inspectedWeapon.id, inspectionLevel) : null;
  const inspectSkill = (id: string) => {
    pausedRef.current = true;
    keys.current.clear();
    setInspected(id);
  };
  return (
    <div className="run-screen" data-ui-scale={save.settings.scale}>
      <canvas
        ref={canvas}
        aria-label="Hollowfall survival battlefield"
        onPointerDown={(e) => {
          pointer.current = { x: e.clientX, y: e.clientY };
          e.currentTarget.setPointerCapture(e.pointerId);
        }}
        onPointerMove={(e) => {
          if (pointer.current)
            joystick.current = {
              x: Math.max(-1, Math.min(1, (e.clientX - pointer.current.x) / 50)),
              y: Math.max(-1, Math.min(1, (e.clientY - pointer.current.y) / 50)),
            };
        }}
        onPointerUp={() => {
          pointer.current = null;
          joystick.current = { x: 0, y: 0 };
        }}
        onPointerCancel={() => {
          pointer.current = null;
          joystick.current = { x: 0, y: 0 };
        }}
      />
      <div className="run-top">
        <div className="xp-bar">
          <span style={{ width: `${Math.min(100, (hud.xp / hud.xpNext) * 100)}%` }} />
        </div>
        <div className="run-line">
          <div className="run-counter">
            <Skull />
            {hud.metrics["kills"] ?? 0}
            <Coins />
            {Math.floor(hud.coins)}
          </div>
          <div className="run-time">
            {formatTime(hud.time)}
            <small>
              LEVEL {hud.level} · {WORLDS[hud.world]?.name}
            </small>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="run-pause"
            aria-label="Pause run"
            onClick={() => {
              pausedRef.current = true;
              setPaused(true);
            }}
          >
            <Pause />
          </Button>
        </div>
        {boss && bossDef && (
          <div className="boss-hud">
            <span>{bossDef.name}</span>
            <div className="progress">
              <span style={{ width: `${(boss.hp / boss.max) * 100}%` }} />
            </div>
          </div>
        )}
      </div>
      <div className="run-skills">
        {Object.entries(hud.weapons).map(([id, l]) => (
          <Button variant="ghost"
            className="run-skill"
            key={id}
            aria-label={`Inspect ${WEAPONS.find((w) => w.id === id)?.name}`}
            onClick={() => inspectSkill(`w:${id}`)}
            title={`${WEAPONS.find((w) => w.id === id)?.name} · ${l}/8`}
          >
            <img src={WEAPONS.find((w) => w.id === id)?.art} alt="" />
            <small>{l}</small>
          </Button>
        ))}
        {Object.entries(hud.passives).map(([id, l]) => (
          <Button variant="ghost"
            className="run-skill passive"
            key={id}
            aria-label={`Inspect ${PASSIVES.find((w) => w.id === id)?.name}`}
            onClick={() => inspectSkill(`p:${id}`)}
            title={`${PASSIVES.find((w) => w.id === id)?.name} · ${l}/8`}
          >
            <img src={PASSIVES.find((w) => w.id === id)?.art} alt="" />
            <small>{l}</small>
          </Button>
        ))}
      </div>
      <div className="run-save-status">{saveStatus}</div>
      {equippedPet && <div className="run-pet" aria-label="Automatic pet ability">
        <ItemArt item={equippedPet} />
        <span>{PETS[equippedPet.set]?.[1]}<small>Auto · {hud.petCooldown > 0 ? `${Math.ceil(hud.petCooldown)}s` : "Ready"}</small></span>
      </div>}
      {inspected && (inspectedWeapon || inspectedPassive) && (
        <div className="modal-backdrop">
          <div className="modal" role="dialog" aria-modal="true" aria-label="Active skill details">
            <Button variant="ghost" size="icon" className="modal-close" aria-label="Close skill details"
              onClick={() => { setInspected(null); pausedRef.current = paused; }}><X /></Button>
            <span className="eyebrow">{inspectedWeapon ? "Weapon" : "Passive"} · {inspectionLevel}/8</span>
            <h2>{inspectedWeapon?.name ?? inspectedPassive?.name}</h2>
            <p>{inspectedWeapon?.description ?? inspectedPassive?.effect}</p>
            {inspectionStats && <>
              <div className="detail-row"><span>Base damage</span><strong>{inspectionStats.damage.toFixed(1)}</strong></div>
              <div className="detail-row"><span>Base cooldown</span><strong>{inspectionStats.cooldown.toFixed(2)}s</strong></div>
              <div className="detail-row"><span>Range</span><strong>{Math.round(inspectionStats.range)}</strong></div>
            </>}
            {inspectedWeapon && <div className="skill-milestones">{inspectedWeapon.levels.slice(0, inspectionLevel).map((text, i) => <p key={text}><span>{i + 1}</span>{text}</p>)}</div>}
          </div>
        </div>
      )}
      {hud.offers.length > 0 && !hud.ended && (
        <div className="modal-backdrop">
          <div className="level-dialog">
            <span className="eyebrow">The darkness makes you stronger</span>
            <h2>Level {hud.level}</h2>
            <div className="upgrade-options">
              {hud.offers.map((id, i) => {
                const [k, key] = id.split(":");
                const w = WEAPONS.find((x) => x.id === key),
                  p = PASSIVES.find((x) => x.id === key);
                const level = (k === "w" ? hud.weapons[key ?? ""] : hud.passives[key ?? ""]) ?? 0;
                return (
                  <Button
                    variant="ghost"
                    className="upgrade-option"
                    key={`${id}${i}`}
                    onClick={() => pick(id)}
                  >
                    {w || p ? (
                      <img src={w?.art ?? p?.art} alt="" />
                    ) : key === "heal" ? (
                      <Heart />
                    ) : (
                      <Coins />
                    )}
                    <strong>
                      {w?.name ?? p?.name ?? (key === "heal" ? "Blessed Draught" : "Tithe of Gold")}
                    </strong>
                    <p>
                      {w
                        ? w.levels[level]
                        : p
                          ? p.effect
                          : key === "heal"
                            ? "Restore 30% maximum health."
                            : "Gain 25 coins."}
                    </p>
                    <small>
                      {k === "f"
                        ? "Reward"
                        : `${k === "w" ? "Weapon" : "Passive"} · ${level + 1}/8`}
                    </small>
                  </Button>
                );
              })}
            </div>
          </div>
        </div>
      )}
      {paused && !hud.ended && (
        <div className="modal-backdrop">
          <div className="modal">
            <span className="eyebrow">The night waits</span>
            <h2>Paused</h2>
            <div className="detail-row">
              <span>Survived</span>
              <strong>{formatTime(hud.time)}</strong>
            </div>
            <div className="detail-row">
              <span>Health</span>
              <strong>
                {Math.ceil(hud.player.hp)} / {Math.round(hud.player.max)}
              </strong>
            </div>
            <div className="detail-row">
              <span>Enemies defeated</span>
              <strong>{hud.metrics["kills"] ?? 0}</strong>
            </div>
            {error && <div className="error-message">{error}</div>}
            <div className="modal-actions">
              {error ? (
                <Button
                  variant="game"
                  onClick={async () => {
                    setError("");
                    await flush(false);
                  }}
                >
                  <RotateCcw />
                  Retry save
                </Button>
              ) : (
                <Button
                  variant="game"
                  onClick={() => {
                    pausedRef.current = false;
                    setPaused(false);
                  }}
                >
                  <Play />
                  Resume
                </Button>
              )}
              <Button
                variant="outline"
                disabled={pending || !!error}
                onClick={async () => {
                  if (await flush(false)) onExit();
                }}
              >
                <ArrowLeft />
                Save & return
              </Button>
              <Button
                variant="ghost"
                disabled={pending || !!error}
                onClick={async () => {
                  if (!(await flush(true))) return;
                  state.current.ended = true;
                  finished.current = true;
                  setHud(structuredClone(state.current));
                  try { await onFinish(state.current); setSettled(true); }
                  catch (e) { setError(e instanceof Error ? e.message : "Rewards were not saved"); }
                }}
              >
                Abandon run
              </Button>
            </div>
          </div>
        </div>
      )}
      {hud.ended && (
        <div className="modal-backdrop">
          <div className="modal">
            <div className="result-title">
              <span className="eyebrow">{hud.victory ? "Dawn breaks" : "The night remembers"}</span>
              <h2>{hud.victory ? "Victory" : "The Hunt Ends"}</h2>
            </div>
            <div className="result-stats">
              {[
                ["Survived", formatTime(hud.time)],
                ["Enemies defeated", hud.metrics["kills"] ?? 0],
                ["Bosses defeated", hud.metrics["bosses"] ?? 0],
                ["Level reached", hud.level],
                ["Coins earned", Math.floor(hud.coins)],
                ["Gems earned", hud.gems],
              ].map(([name, value]) => (
                <div className="detail-row" key={name}>
                  <span>{name}</span>
                  <strong>{value}</strong>
                </div>
              ))}
            </div>
            {error && <div className="error-message">{error}</div>}
            <div className="modal-actions">
              {error && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setError("");
                    void finish();
                  }}
                >
                  Retry save
                </Button>
              )}
              <Button variant="game" disabled={!settled || pending || !!error} onClick={onExit}>
                <ArrowLeft />
                Return to Hub
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
