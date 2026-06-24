import type { Session } from "@supabase/supabase-js";
import type { CubeScanState, SolveResult } from "@rubiks/shared";
import type { ApiSession, AppService, LeaderboardEntry, ScanRecord, SolveRecord } from "./api";
import { solveInBrowser } from "./demoSolver";
import { getSupabaseClient, type Json } from "./supabaseClient";

function toApiSession(session: Session | null): ApiSession | null {
  if (!session) return null;
  const displayName = session.user.user_metadata.display_name;
  return {
    token: session.access_token,
    user: {
      id: session.user.id,
      email: session.user.email ?? "",
      name: typeof displayName === "string" && displayName.trim() ? displayName : session.user.email?.split("@")[0] ?? "Cube Solver"
    }
  };
}

async function currentUserId() {
  const { data, error } = await getSupabaseClient().auth.getUser();
  if (error || !data.user) throw new Error(error?.message ?? "Sign in to continue.");
  return data.user.id;
}

function scanRecord(row: {
  id: string;
  name: string;
  status: "VALID" | "INVALID" | "SOLVED";
  created_at: string;
  scan: Json;
}): ScanRecord {
  return {
    id: row.id,
    name: row.name,
    status: row.status,
    createdAt: row.created_at,
    scan: row.scan as unknown as CubeScanState
  };
}

function solveRecord(row: { id: string; scan_id: string | null; solution: Json; duration_ms: number; created_at: string }): SolveRecord {
  return {
    id: row.id,
    ...(row.scan_id ? { scanId: row.scan_id } : {}),
    solution: row.solution as unknown as SolveResult,
    durationMs: row.duration_ms,
    createdAt: row.created_at
  };
}

export const supabaseApi: AppService = {
  async register(input) {
    const { data, error } = await getSupabaseClient().auth.signUp({
      email: input.email,
      password: input.password,
      options: {
        emailRedirectTo: window.location.origin,
        data: { display_name: input.name }
      }
    });
    if (error) throw new Error(error.message);
    return toApiSession(data.session);
  },

  async login(input) {
    const { data, error } = await getSupabaseClient().auth.signInWithPassword(input);
    if (error) throw new Error(error.message);
    return toApiSession(data.session);
  },

  solve: solveInBrowser,

  async listScans() {
    const { data, error } = await getSupabaseClient().from("cube_scans").select("id,name,status,created_at,scan").order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data.map(scanRecord);
  },

  async createScan(_token, input) {
    const userId = await currentUserId();
    const { data, error } = await getSupabaseClient()
      .from("cube_scans")
      .insert({
        user_id: userId,
        name: input.name,
        status: input.solution ? "SOLVED" : "VALID",
        scan: input.scan as unknown as Json,
        solution: input.solution ? (input.solution as unknown as Json) : null
      })
      .select("id,name,status,created_at,scan")
      .single();
    if (error) throw new Error(error.message);
    return scanRecord(data);
  },

  async listSolves() {
    const { data, error } = await getSupabaseClient().from("solve_history").select("id,scan_id,solution,duration_ms,created_at").order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data.map(solveRecord);
  },

  async createSolve(_token, input) {
    const userId = await currentUserId();
    const { data, error } = await getSupabaseClient()
      .from("solve_history")
      .insert({
        user_id: userId,
        scan_id: input.scanId ?? null,
        solution: input.solution as unknown as Json,
        duration_ms: input.durationMs
      })
      .select("id,scan_id,solution,duration_ms,created_at")
      .single();
    if (error) throw new Error(error.message);
    return solveRecord(data);
  },

  async leaderboard() {
    const supabase = getSupabaseClient();
    const { data: entries, error } = await supabase.from("leaderboard_entries").select("id,user_id,best_time_ms,solves").order("best_time_ms", { ascending: true }).limit(8);
    if (error) throw new Error(error.message);
    const userIds = entries.map((entry) => entry.user_id);
    const { data: profiles, error: profileError } = userIds.length
      ? await supabase.from("profiles").select("id,display_name").in("id", userIds)
      : { data: [], error: null };
    if (profileError) throw new Error(profileError.message);
    const names = new Map(profiles.map((profile) => [profile.id, profile.display_name]));
    return entries.map<LeaderboardEntry>((entry, index) => ({
      id: entry.id,
      rank: index + 1,
      name: names.get(entry.user_id) ?? "Cube Solver",
      bestTimeMs: entry.best_time_ms,
      solves: entry.solves
    }));
  },

  async getSession() {
    const { data, error } = await getSupabaseClient().auth.getSession();
    if (error) throw new Error(error.message);
    return toApiSession(data.session);
  },

  onSessionChange(callback) {
    const { data } = getSupabaseClient().auth.onAuthStateChange((_event, session) => callback(toApiSession(session)));
    return () => data.subscription.unsubscribe();
  },

  async logout() {
    const { error } = await getSupabaseClient().auth.signOut();
    if (error) throw new Error(error.message);
  },

  resetDemoData: async () => undefined
};
