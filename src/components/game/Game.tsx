import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Castle, Play, X, Loader2, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { ART } from "@/game/assets";
import fortressAsset from "@/assets/fortress.jpg.asset.json";
const fortress = fortressAsset.url;
import {
  freshSave,
  readGuest,
  writeGuest,
  applyAction,
  addStats,
  type Save,
  type Action,
} from "@/game/progression";
import { createGame, runMetrics, type GameState, type Input } from "@/game/simulation";
import { loadPlayer, playerAction, beginRun, syncRun } from "@/game/game.functions";
import { Hub } from "./Hub";
import { Run } from "./Run";
import { settleRun } from "@/game/settlement";
import { readSnapshot } from "@/game/recovery";
const checkpointKey = "hollowfall-guest-run-v2";
export function Game() {
  const [save, setSave] = useState<Save>(freshSave),
    [ready, setReady] = useState(false),
    [entered, setEntered] = useState(false),
    [user, setUser] = useState<{ id: string; name: string } | null>(null),
    [run, setRun] = useState<GameState | null>(null),
    [recover, setRecover] = useState(false),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState(""),
    [auth, setAuth] = useState(false),
    [signup, setSignup] = useState(false),
    [email, setEmail] = useState(""),
    [password, setPassword] = useState(""),
    [username, setUsername] = useState(""),
    [authNote, setAuthNote] = useState("");
  const version = useRef(1),
    runMeta = useRef<{ id: string; sequence: number } | null>(null),
    rewarded = useRef(false),
    saveRef = useRef(save),
    userRef = useRef(user);
  const load = useServerFn(loadPlayer),
    mutate = useServerFn(playerAction),
    start = useServerFn(beginRun),
    sync = useServerFn(syncRun);
  saveRef.current = save;
  userRef.current = user;
  useEffect(() => {
    let alive = true;
    const guest = () => {
      try {
        const s = readGuest();
        if (alive) {
          setSave(s);
          setRecover(!!localStorage.getItem(checkpointKey));
        }
      } catch {
        if (alive) setMessage("Your local save could not be read. It has not been overwritten.");
      }
    };
    async function updateUser() {
      const { data } = await supabase.auth.getUser();
      if (!alive) return;
      if (data.user) {
        setBusy(true);
        setUser({ id: data.user.id, name: String(data.user.user_metadata["username"] ?? "Hunter") });
        try {
          const result = await load();
          if (alive) {
            setSave(result.save);
            version.current = result.version;
            setEntered(true);
          }
        } catch (e) {
          if (alive) setMessage(e instanceof Error ? e.message : "Cloud save could not be loaded.");
        } finally {
          if (alive) {
            setBusy(false);
            setReady(true);
          }
        }
      } else {
        setUser(null);
        guest();
        setReady(true);
      }
    }
    guest();
    void updateUser();
    const { data: subscription } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "USER_UPDATED")
        setTimeout(() => {
          void updateUser();
        }, 0);
    });
    return () => {
      alive = false;
      subscription.subscription.unsubscribe();
    };
  }, []);
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => setMessage(""), 7000);
    return () => clearTimeout(timer);
  }, [message]);
  async function act(action: Action) {
    if (busy) return;
    setBusy(true);
    try {
      if (user) {
        const result = await mutate({ data: { version: version.current, action } });
        version.current = result.version;
        setSave(result.save);
        const latest = result.save.transactions.at(-1);
        if (latest && action.type === "chest") setMessage(latest.label);
      } else {
        const result = applyAction(saveRef.current, action, Date.now());
        writeGuest(result);
        setSave(result);
        if (action.type === "chest")
          setMessage(result.transactions.at(-1)?.label ?? "Chest opened");
      }
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "This action could not be completed.");
    } finally {
      setBusy(false);
    }
  }
  async function begin() {
    if (busy) return;
    setBusy(true);
    try {
      rewarded.current = false;
      if (user) {
        const result = await start();
        runMeta.current = { id: result.id, sequence: result.sequence };
        setRun(result.state);
      } else {
        const stored = localStorage.getItem(checkpointKey);
        const initial = stored
          ? readSnapshot(stored)
          : createGame(saveRef.current, Math.floor(Math.random() * 4294967296));
        runMeta.current = null;
        localStorage.setItem(checkpointKey, JSON.stringify(initial));
        setRun(initial);
      }
      setRecover(true);
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "The hunt could not be started.");
    } finally {
      setBusy(false);
    }
  }
  async function checkpoint(frames: Input[], state: GameState, abandon = false) {
    const meta = runMeta.current;
    if (userRef.current && meta) {
      const result = await sync({ data: { ...meta, frames, abandon } });
      meta.sequence = result.sequence;
      if (result.save) {
        version.current = result.version;
        saveRef.current = result.save;
        setSave(result.save);
        rewarded.current = true;
        setRecover(false);
      }
      return result.state;
    }
    if (abandon) state.ended = true;
    localStorage.setItem(checkpointKey, JSON.stringify(state));
    return undefined;
  }
  async function finish(state: GameState) {
    if (userRef.current) return;
    if (rewarded.current) return;
    const next = settleRun(saveRef.current, state, Date.now());
    writeGuest(next);
    localStorage.removeItem(checkpointKey);
    rewarded.current = true;
    saveRef.current = next;
    setRecover(false);
    setSave(next);
  }
  async function submitAuth(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setAuthNote("");
    try {
      if (signup) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { username }, emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        setAuthNote(
          data.session
            ? "Account created."
            : "Check your email to confirm your account before signing in.",
        );
        if (data.session) setAuth(false);
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        setAuth(false);
      }
    } catch (e) {
      setAuthNote(e instanceof Error ? e.message : "Sign-in failed.");
    } finally {
      setBusy(false);
    }
  }
  if (!ready)
    return (
      <div className="loading-screen">
        <Loader2 className="spinner" />
        Entering the Hollow…
      </div>
    );
  return (
    <>
      {run ? (
        <Run
          save={save}
          initial={run}
          onExit={() => setRun(null)}
          onCheckpoint={checkpoint}
          onFinish={finish}
          cloud={!!user}
        />
      ) : entered ? (
        <Hub
          save={save}
          act={act}
          onStart={() => void begin()}
          onAccount={() => setAuth(true)}
          account={user?.name ?? "Guest"}
          busy={busy}
          recover={recover}
          onDiscard={() => {
            if (user) { setMessage("Continue your Cloud hunt and choose Abandon run from its pause menu."); return; }
            localStorage.removeItem(checkpointKey);
            setRecover(false);
          }}
        />
      ) : (
        <div className="welcome">
          <img className="welcome-bg" src={fortress} alt="The ancient fortress of Hollowfall" />
          <div className="welcome-veil" />
          <div className="welcome-brand">
            <Castle className="emblem" />
            <h1>HOLLOWFALL</h1>
            <p className="subtitle">THE NIGHT REMEMBERS</p>
            <div className="brand-divider">
              <span>✦</span>
            </div>
          </div>
          <img className="welcome-hero" src={ART.vampire} alt="Nightfang" />
          <div className="welcome-bottom">
            <Button variant="game" className="welcome-play" onClick={() => setEntered(true)}>
              <Play />
              Enter the Hollow
            </Button>
            <Button variant="ghost" onClick={() => setAuth(true)}>
              <UserRound />
              Sign in
            </Button>
          </div>
          <span className="welcome-version">HOLLOWFALL · EARLY ACCESS</span>
        </div>
      )}
      {message && (
        <div className="toast-note" role="status">
          {message}
        </div>
      )}
      {auth && (
        <div className="modal-backdrop">
          <div className="modal" role="dialog" aria-modal="true" aria-label="Player account">
            <Button
              variant="ghost"
              size="icon"
              className="modal-close"
              aria-label="Close account"
              onClick={() => setAuth(false)}
            >
              <X />
            </Button>
            <span className="eyebrow">The sanctuary remembers</span>
            <h2>{user ? user.name : signup ? "Create Account" : "Welcome Back"}</h2>
            {user ? (
              <>
                <p>
                  Your account journey is saved in Lovable Cloud. Guest progress remains separate on
                  this device.
                </p>
                <Button
                  variant="outline"
                  onClick={async () => {
                    await supabase.auth.signOut();
                    setAuth(false);
                    setRun(null);
                  }}
                >
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <form onSubmit={submitAuth}>
                  {signup && (
                    <>
                      <label htmlFor="username">Username</label>
                      <input
                        id="username"
                        required
                        minLength={3}
                        maxLength={24}
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        autoComplete="username"
                      />
                    </>
                  )}
                  <label htmlFor="email">Email</label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                  />
                  <label htmlFor="password">Password</label>
                  <input
                    id="password"
                    type="password"
                    minLength={8}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete={signup ? "new-password" : "current-password"}
                  />
                  {authNote && (
                    <div className="success-message" role="status">
                      {authNote}
                    </div>
                  )}
                  <Button variant="game" type="submit" disabled={busy}>
                    {busy ? <Loader2 className="spinner" /> : signup ? "Create Account" : "Sign In"}
                  </Button>
                </form>
                <div className="section-rule">Or</div>
                <Button
                  variant="outline"
                  disabled={busy}
                  onClick={async () => {
                    const result = await lovable.auth.signInWithOAuth("google", {
                      redirect_uri: window.location.origin,
                    });
                    if (result.error) setAuthNote(result.error.message);
                    else setAuth(false);
                  }}
                >
                  Continue with Google
                </Button>
                <div className="modal-actions">
                  <Button
                    variant="tab"
                    onClick={() => {
                      setSignup(!signup);
                      setAuthNote("");
                    }}
                  >
                    {signup ? "Already have an account?" : "Create an account"}
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setAuth(false);
                      setEntered(true);
                    }}
                  >
                    Play as Guest
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
