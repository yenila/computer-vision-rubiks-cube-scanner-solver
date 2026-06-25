import { createClient, type Session, type SupabaseClient, type User } from "@supabase/supabase-js";
import Cube from "cubejs";
import {
  parseNotation,
  validateCubeScan,
  type AuthUser,
  type CubeScanState,
  type SolveResult
} from "@rubiks/shared";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
const SOLVED_FACELETS = "U".repeat(9) + "R".repeat(9) + "F".repeat(9) + "D".repeat(9) + "L".repeat(9) + "B".repeat(9);

let supabaseClient: SupabaseClient | null = null;
let solverReady = false;

export type ApiSession = {
  token: string;
  user: AuthUser;
};

export type ScanRecord = {
  id: string;
  name: string;
  status: "VALID" | "INVALID" | "SOLVED";
  createdAt: string;
  scan: CubeScanState;
};

export type SolveRecord = {
  id: string;
  scanId?: string;
  solution: SolveResult;
  durationMs: number;
  createdAt: string;
};

export type LeaderboardEntry = {
  id: string;
  rank: number;
  name: string;
  bestTimeMs: number;
  solves: number;
};

type ProfileRow = {
  id: string;
  email: string;
  name: string;
};

type ScanRow = {
  id: string;
  name: string;
  status: "VALID" | "INVALID" | "SOLVED";
  created_at: string;
  scan: CubeScanState;
};

type SolveRow = {
  id: string;
  scan_id: string | null;
  solution: SolveResult;
  duration_ms: number;
  created_at: string;
};

type LeaderboardRow = {
  id: string;
  display_name: string;
  best_time_ms: number;
  solves: number;
};

function getSupabase() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error("Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.");
  }
  supabaseClient ??= createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  return supabaseClient;
}

function authUserFromSupabase(user: User, profile?: ProfileRow | null): AuthUser {
  const metadataName = typeof user.user_metadata?.name === "string" ? user.user_metadata.name : "";
  const name = profile?.name || metadataName || user.email?.split("@")[0] || "Cube Solver";
  return {
    id: user.id,
    email: profile?.email || user.email || "",
    name
  };
}

async function currentUser() {
  const { data, error } = await getSupabase().auth.getUser();
  if (error) throw new Error(error.message);
  if (!data.user) throw new Error("Sign in before saving scans.");
  return data.user;
}

async function loadProfile(userId: string) {
  const { data, error } = await getSupabase()
    .from("profiles")
    .select("id,email,name")
    .eq("id", userId)
    .maybeSingle<ProfileRow>();
  if (error) throw new Error(error.message);
  return data;
}

async function upsertProfile(user: User, name?: string) {
  const displayName = name || (typeof user.user_metadata?.name === "string" ? user.user_metadata.name : "") || user.email?.split("@")[0] || "Cube Solver";
  const { data, error } = await getSupabase()
    .from("profiles")
    .upsert(
      {
        id: user.id,
        email: user.email ?? "",
        name: displayName,
        updated_at: new Date().toISOString()
      },
      { onConflict: "id" }
    )
    .select("id,email,name")
    .single<ProfileRow>();
  if (error) throw new Error(error.message);
  return data;
}

async function sessionFromAuth(session: Session | null, fallbackUser?: User | null, name?: string): Promise<ApiSession> {
  const user = session?.user ?? fallbackUser;
  if (!session || !user) {
    throw new Error("Check your email to confirm the account, then sign in.");
  }
  const profile = await upsertProfile(user, name);
  return {
    token: session.access_token,
    user: authUserFromSupabase(user, profile)
  };
}

function mapScan(row: ScanRow): ScanRecord {
  return {
    id: row.id,
    name: row.name,
    status: row.status,
    createdAt: row.created_at,
    scan: row.scan
  };
}

function mapSolve(row: SolveRow): SolveRecord {
  return {
    id: row.id,
    scanId: row.scan_id ?? undefined,
    solution: row.solution,
    durationMs: row.duration_ms,
    createdAt: row.created_at
  };
}

function isPermutation(values: unknown, size: number) {
  if (!Array.isArray(values) || values.length !== size) return false;
  const seen = new Set(values);
  if (seen.size !== size) return false;
  for (let index = 0; index < size; index += 1) {
    if (!seen.has(index)) return false;
  }
  return true;
}

function describeInvalidFacelets(facelets: string) {
  const cornerFacelets = [
    [8, 9, 20], [6, 18, 38], [0, 36, 47], [2, 45, 11],
    [29, 26, 15], [27, 44, 24], [33, 53, 42], [35, 17, 51]
  ];
  const edgeFacelets = [
    [5, 10], [7, 19], [3, 37], [1, 46],
    [32, 16], [28, 25], [30, 43], [34, 52],
    [23, 12], [21, 41], [50, 39], [48, 14]
  ];
  const cornerNames = ["URF", "UFL", "ULB", "UBR", "DFR", "DLF", "DBL", "DRB"];
  const edgeNames = ["UR", "UF", "UL", "UB", "DR", "DF", "DL", "DB", "FR", "FL", "BL", "BR"];
  const validCorners = new Set(["FRU", "FLU", "BLU", "BRU", "DFR", "DFL", "BDL", "BDR"]);
  const validEdges = new Set(["RU", "FU", "LU", "BU", "DR", "DF", "DL", "BD", "FR", "FL", "BL", "BR"]);
  const invalid: string[] = [];

  for (let index = 0; index < cornerFacelets.length; index += 1) {
    const colors = cornerFacelets[index]!.map((position) => facelets[position]);
    const key = [...colors].sort().join("");
    if (!validCorners.has(key)) invalid.push(`${cornerNames[index]} corner reads ${colors.join("-")}`);
  }

  for (let index = 0; index < edgeFacelets.length; index += 1) {
    const colors = edgeFacelets[index]!.map((position) => facelets[position]);
    const key = [...colors].sort().join("");
    if (!validEdges.has(key)) invalid.push(`${edgeNames[index]} edge reads ${colors.join("-")}`);
  }

  if (invalid.length) return `Check ${invalid.slice(0, 4).join("; ")}.`;
  return "The pieces look plausible, but their orientation or parity is impossible. Check whether two stickers or two whole faces are swapped.";
}

function solveFacelets(facelets: string): SolveResult {
  if (!/^[URFDLB]{54}$/.test(facelets)) {
    throw new Error("Facelets must be 54 characters in URFDLB notation.");
  }

  const cube = Cube.fromString(facelets);
  const state = cube.toJSON();
  const validPieces =
    isPermutation(state.center, 6) &&
    isPermutation(state.cp, 8) &&
    isPermutation(state.ep, 12) &&
    cube.asString() === facelets &&
    state.co.reduce((sum: number, value: number) => sum + value, 0) % 3 === 0 &&
    state.eo.reduce((sum: number, value: number) => sum + value, 0) % 2 === 0 &&
    cube.cornerParity() === cube.edgeParity();

  if (!validPieces) {
    throw new Error(`This scan orientation is not physically valid. Rescan each face with the required color edge at the TOP of the camera grid. ${describeInvalidFacelets(facelets)}`);
  }

  if (!solverReady) {
    Cube.initSolver();
    solverReady = true;
  }

  const notation = cube.solve();
  const verification = Cube.fromString(facelets);
  if (notation.trim()) verification.move(notation);
  if (verification.asString() !== SOLVED_FACELETS) {
    throw new Error("The generated moves did not verify against the exact scan. Rescan the cube before trying to solve it.");
  }

  const moves = notation.trim() ? parseNotation(notation) : [];
  return {
    moves,
    notation,
    estimatedTurns: moves.length,
    facelets
  };
}

export const api = {
  getSession: async () => {
    const { data, error } = await getSupabase().auth.getSession();
    if (error) throw new Error(error.message);
    if (!data.session) return null;
    const profile = await loadProfile(data.session.user.id);
    return {
      token: data.session.access_token,
      user: authUserFromSupabase(data.session.user, profile)
    } satisfies ApiSession;
  },
  onAuthStateChange: (callback: (session: ApiSession | null) => void) => {
    const { data } = getSupabase().auth.onAuthStateChange((_event, session) => {
      if (!session) {
        callback(null);
        return;
      }
      void loadProfile(session.user.id)
        .then((profile) => callback({ token: session.access_token, user: authUserFromSupabase(session.user, profile) }))
        .catch(() => callback({ token: session.access_token, user: authUserFromSupabase(session.user) }));
    });
    return () => data.subscription.unsubscribe();
  },
  register: async (input: { email: string; password: string; name: string }) => {
    const { data, error } = await getSupabase().auth.signUp({
      email: input.email,
      password: input.password,
      options: { data: { name: input.name } }
    });
    if (error) throw new Error(error.message);
    return sessionFromAuth(data.session, data.user, input.name);
  },
  login: async (input: { email: string; password: string }) => {
    const { data, error } = await getSupabase().auth.signInWithPassword(input);
    if (error) throw new Error(error.message);
    return sessionFromAuth(data.session, data.user);
  },
  logout: async () => {
    const { error } = await getSupabase().auth.signOut();
    if (error) throw new Error(error.message);
  },
  solve: async (facelets: string) => solveFacelets(facelets),
  listScans: async (_token?: string) => {
    const user = await currentUser();
    const { data, error } = await getSupabase()
      .from("cube_scans")
      .select("id,name,status,created_at,scan")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50)
      .returns<ScanRow[]>();
    if (error) throw new Error(error.message);
    return data.map(mapScan);
  },
  createScan: async (_token: string | undefined, input: { name: string; scan: CubeScanState; solution?: SolveResult }) => {
    const user = await currentUser();
    const validation = validateCubeScan(input.scan);
    const { data, error } = await getSupabase()
      .from("cube_scans")
      .insert({
        user_id: user.id,
        name: input.name,
        status: validation.valid ? (input.solution ? "SOLVED" : "VALID") : "INVALID",
        scan: input.scan,
        solution: input.solution ?? null
      })
      .select("id,name,status,created_at,scan")
      .single<ScanRow>();
    if (error) throw new Error(error.message);
    return mapScan(data);
  },
  listSolves: async (_token?: string) => {
    const user = await currentUser();
    const { data, error } = await getSupabase()
      .from("solve_history")
      .select("id,scan_id,solution,duration_ms,created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50)
      .returns<SolveRow[]>();
    if (error) throw new Error(error.message);
    return data.map(mapSolve);
  },
  createSolve: async (_token: string | undefined, input: { scanId?: string; solution: SolveResult; durationMs: number }) => {
    const user = await currentUser();
    const profile = await loadProfile(user.id);
    const displayName = profile?.name || user.email?.split("@")[0] || "Cube Solver";
    const { data, error } = await getSupabase()
      .from("solve_history")
      .insert({
        user_id: user.id,
        scan_id: input.scanId ?? null,
        solution: input.solution,
        duration_ms: input.durationMs
      })
      .select("id,scan_id,solution,duration_ms,created_at")
      .single<SolveRow>();
    if (error) throw new Error(error.message);

    const { data: current, error: leaderboardReadError } = await getSupabase()
      .from("leaderboard_entries")
      .select("id,best_time_ms,solves")
      .eq("user_id", user.id)
      .maybeSingle<{ id: string; best_time_ms: number; solves: number }>();
    if (leaderboardReadError) throw new Error(leaderboardReadError.message);

    const leaderboardPayload = {
      user_id: user.id,
      display_name: displayName,
      best_time_ms: current ? Math.min(current.best_time_ms, input.durationMs) : input.durationMs,
      solves: current ? current.solves + 1 : 1,
      updated_at: new Date().toISOString()
    };
    const { error: leaderboardWriteError } = current
      ? await getSupabase().from("leaderboard_entries").update(leaderboardPayload).eq("user_id", user.id)
      : await getSupabase().from("leaderboard_entries").insert(leaderboardPayload);
    if (leaderboardWriteError) throw new Error(leaderboardWriteError.message);

    return mapSolve(data);
  },
  leaderboard: async () => {
    const { data, error } = await getSupabase()
      .from("leaderboard_entries")
      .select("id,display_name,best_time_ms,solves")
      .order("best_time_ms", { ascending: true })
      .order("updated_at", { ascending: true })
      .limit(100)
      .returns<LeaderboardRow[]>();
    if (error) throw new Error(error.message);
    return data.map((entry, index) => ({
      id: entry.id,
      rank: index + 1,
      name: entry.display_name,
      bestTimeMs: entry.best_time_ms,
      solves: entry.solves
    }));
  }
};
