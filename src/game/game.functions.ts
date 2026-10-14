import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { freshSave, applyAction, type Save, type Action } from "./progression";
import { createGame, step, type GameState, type Input } from "./simulation";
import type { Json } from "@/integrations/supabase/types";
import { settleRun } from "./settlement";
export const loadPlayer = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("game_saves")
      .select("*")
      .eq("user_id", context.userId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (data) {
      const { data: unfinished, error: runError } = await context.supabase.from("game_runs")
        .select("id").eq("user_id", context.userId).eq("finished", false).limit(1);
      if (runError) throw new Error(runError.message);
      return { save: data.state as unknown as Save, version: data.version, recover: !!unfinished?.length };
    }
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const state = freshSave();
    const { error: insert } = await supabaseAdmin
      .from("game_saves")
      .upsert(
        { user_id: context.userId, state: state as unknown as Json, version: 1 },
        { onConflict: "user_id", ignoreDuplicates: true },
      );
    if (insert) throw new Error(insert.message);
    return { save: state, version: 1, recover: false };
  });
export const playerAction = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { version: number; action: Action }) => input)
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase
      .from("game_saves")
      .select("*")
      .eq("user_id", context.userId)
      .single();
    if (error || !row) throw new Error("Save could not be loaded");
    if (row.version !== data.version)
      throw new Error("Your save changed on another device. Reload before retrying.");
    const next = applyAction(row.state as unknown as Save, data.action, Date.now(), () => {
      const n = new Uint32Array(1);
      crypto.getRandomValues(n);
      return (n[0] ?? 0) / 4294967296;
    });
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: ok, error: commit } = await supabaseAdmin.rpc("commit_game_save", {
      p_user: context.userId,
      p_version: row.version,
      p_state: next as unknown as Json,
    });
    if (commit || !ok) throw new Error("Save conflict. Reload before retrying.");
    return { save: next, version: row.version + 1 };
  });
export const beginRun = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: old } = await context.supabase
      .from("game_runs")
      .select("*")
      .eq("user_id", context.userId)
      .eq("finished", false)
      .maybeSingle();
    if (old)
      return { id: old.id, state: old.state as unknown as GameState, sequence: old.sequence };
    const { data: save } = await context.supabase
      .from("game_saves")
      .select("state")
      .eq("user_id", context.userId)
      .single();
    if (!save) throw new Error("Create your player save first");
    const seed = new Uint32Array(1);
    crypto.getRandomValues(seed);
    const state = createGame(save.state as unknown as Save, seed[0] ?? 1);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: run, error } = await supabaseAdmin
      .from("game_runs")
      .insert({ user_id: context.userId, state: state as unknown as Json })
      .select()
      .single();
    if (error || !run) throw new Error("Run could not be started");
    return { id: run.id, state, sequence: 0 };
  });
export const syncRun = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        id: z.string().uuid(),
        sequence: z.number().int().min(0),
        frames: z
          .array(
            z.object({
              x: z.number().min(-1).max(1),
              y: z.number().min(-1).max(1),
              choice: z.string().optional(),
              pet: z.boolean().optional(),
            }),
          )
          .max(450),
        abandon: z.boolean().optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { data: run } = await context.supabase
      .from("game_runs")
      .select("*")
      .eq("id", data.id)
      .eq("user_id", context.userId)
      .single();
    const { data: row } = await context.supabase
      .from("game_saves")
      .select("*")
      .eq("user_id", context.userId)
      .single();
    if (!run || !row || run.rewarded || run.sequence !== data.sequence)
      throw new Error("Run checkpoint conflict. Reload to recover.");
    const state = run.state as unknown as GameState;
    const save = row.state as unknown as Save;
    const maxTime = (Date.now() - new Date(run.started_at).getTime()) / 1000 + 2;
    if (state.time + data.frames.length / 30 > maxTime)
      throw new Error("Run elapsed time did not validate");
    for (const input of data.frames) step(state, save, input as Input);
    if (data.abandon) state.ended = true;
    let next: Save | undefined;
    if (state.ended) next = settleRun(save, state, Date.now());
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: ok, error } = await supabaseAdmin.rpc("commit_game_run", {
      p_user: context.userId,
      p_run: data.id,
      p_sequence: run.sequence,
      p_state: state as unknown as Json,
      p_finished: state.ended,
      p_save: next ? (next as unknown as Json) : null,
      p_save_version: row.version,
    });
    if (error || !ok) throw new Error("Checkpoint was not saved. Retry before continuing.");
    return {
      state,
      sequence: run.sequence + 1,
      save: next,
      version: next ? row.version + 1 : row.version,
    };
  });
export const importGuest = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { version: number; guest: Save }) => input)
  .handler(async () => {
    throw new Error(
      "Guest-to-account transfer requires a verified guest event history. Your local progress has been kept; no cloud save was overwritten.",
    );
  });
