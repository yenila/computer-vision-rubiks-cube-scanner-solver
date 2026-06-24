import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL;
const anonKey = process.env.SUPABASE_ANON_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !anonKey || !serviceRoleKey) {
  throw new Error("SUPABASE_URL, SUPABASE_ANON_KEY, and SUPABASE_SERVICE_ROLE_KEY are required.");
}

const email = `cubevision-smoke-${Date.now()}@example.com`;
const password = `Cv-${crypto.randomUUID()}-9a!`;
const userClient = createClient(url, anonKey, { auth: { persistSession: false, autoRefreshToken: false } });
const anonymousClient = createClient(url, anonKey, { auth: { persistSession: false, autoRefreshToken: false } });
const adminClient = createClient(url, serviceRoleKey, { auth: { persistSession: false, autoRefreshToken: false } });
let userId;

try {
  const { data: signUp, error: signUpError } = await userClient.auth.signUp({
    email,
    password,
    options: { data: { display_name: "Deployment Smoke Test" } }
  });
  if (signUpError || !signUp.user || !signUp.session) throw signUpError ?? new Error("Smoke-test signup did not return a session.");
  userId = signUp.user.id;

  const { data: profile, error: profileError } = await userClient.from("profiles").select("id,display_name").eq("id", userId).single();
  if (profileError || profile?.display_name !== "Deployment Smoke Test") throw profileError ?? new Error("Profile trigger did not create the expected row.");

  const { data: scan, error: scanError } = await userClient
    .from("cube_scans")
    .insert({ user_id: userId, name: "Smoke test scan", status: "SOLVED", scan: { test: true }, solution: { notation: "" } })
    .select("id")
    .single();
  if (scanError || !scan) throw scanError ?? new Error("Authenticated scan insert failed.");

  const { error: solveError } = await userClient.from("solve_history").insert({
    user_id: userId,
    scan_id: scan.id,
    solution: { notation: "", moves: [] },
    duration_ms: 12_345
  });
  if (solveError) throw solveError;

  const { data: leaderboard, error: leaderboardError } = await anonymousClient
    .from("leaderboard_entries")
    .select("user_id,best_time_ms,solves")
    .eq("user_id", userId)
    .single();
  if (leaderboardError || leaderboard?.best_time_ms !== 12_345 || leaderboard.solves !== 1) {
    throw leaderboardError ?? new Error("Leaderboard trigger did not aggregate the solve.");
  }

  const { data: leakedScans, error: rlsError } = await anonymousClient.from("cube_scans").select("id").eq("id", scan.id);
  if (rlsError || leakedScans.length !== 0) throw rlsError ?? new Error("Anonymous scan read was not blocked by RLS.");

  console.log(JSON.stringify({ auth: true, profileTrigger: true, scanWrite: true, solveWrite: true, leaderboardTrigger: true, anonymousRls: true }));
} finally {
  if (userId) {
    const { error } = await adminClient.auth.admin.deleteUser(userId);
    if (error) console.error(`Smoke-test cleanup failed: ${error.message}`);
  }
}
