import type { AuthUser, CubeScanState, SolveResult } from "@rubiks/shared";
import { isDemoMode, isSupabaseMode } from "./appMode";
import {
  createDemoScan,
  createDemoSolve,
  demoSession,
  listDemoLeaderboard,
  listDemoScans,
  listDemoSolves,
  resetDemoData
} from "./demoData";
import { solveInBrowser } from "./demoSolver";
import { supabaseApi } from "./supabaseService";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000/api";
const REQUEST_TIMEOUT_MS = import.meta.env.PROD ? 45000 : 10000;

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

export type AppService = {
  register: (input: { email: string; password: string; name: string }) => Promise<ApiSession | null>;
  login: (input: { email: string; password: string }) => Promise<ApiSession | null>;
  solve: (facelets: string) => Promise<SolveResult>;
  listScans: (token: string) => Promise<ScanRecord[]>;
  createScan: (token: string, input: { name: string; scan: CubeScanState; solution?: SolveResult }) => Promise<ScanRecord>;
  listSolves: (token: string) => Promise<SolveRecord[]>;
  createSolve: (token: string, input: { scanId?: string; solution: SolveResult; durationMs: number }) => Promise<SolveRecord>;
  leaderboard: () => Promise<LeaderboardEntry[]>;
  getSession: () => Promise<ApiSession | null>;
  onSessionChange: (callback: (session: ApiSession | null) => void) => () => void;
  logout: () => Promise<void>;
  resetDemoData: () => Promise<void>;
};

async function request<T>(path: string, options: RequestInit = {}, token?: string): Promise<T> {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers
      }
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error("The API took too long to respond. Please try again in a moment.");
    }
    throw error;
  } finally {
    window.clearTimeout(timeoutId);
  }

  const payload = (await response.json().catch(() => null)) as T | { error?: string } | null;
  if (!response.ok) {
    const message = payload && typeof payload === "object" && "error" in payload ? payload.error : null;
    throw new Error(message || `Request failed with ${response.status}`);
  }
  return payload as T;
}

const remoteApi: AppService = {
  register: (input: { email: string; password: string; name: string }) =>
    request<ApiSession>("/auth/register", { method: "POST", body: JSON.stringify(input) }),
  login: (input: { email: string; password: string }) =>
    request<ApiSession>("/auth/login", { method: "POST", body: JSON.stringify(input) }),
  solve: (facelets: string) => request<SolveResult>("/solver", { method: "POST", body: JSON.stringify({ facelets }) }),
  listScans: (token: string) => request<ScanRecord[]>("/scans", {}, token),
  createScan: (token: string, input: { name: string; scan: CubeScanState; solution?: SolveResult }) =>
    request<ScanRecord>("/scans", { method: "POST", body: JSON.stringify(input) }, token),
  listSolves: (token: string) => request<SolveRecord[]>("/solves", {}, token),
  createSolve: (token: string, input: { scanId?: string; solution: SolveResult; durationMs: number }) =>
    request<SolveRecord>("/solves", { method: "POST", body: JSON.stringify(input) }, token),
  leaderboard: () => request<LeaderboardEntry[]>("/leaderboard"),
  getSession: async () => {
    try {
      const value = localStorage.getItem("rubiks-session");
      return value ? (JSON.parse(value) as ApiSession) : null;
    } catch {
      return null;
    }
  },
  onSessionChange: () => () => undefined,
  logout: async () => undefined,
  resetDemoData: async (): Promise<void> => undefined
};

const demoApi: AppService = {
  register: async () => demoSession,
  login: async () => demoSession,
  solve: solveInBrowser,
  listScans: async () => listDemoScans(),
  createScan: async (_token, input) => createDemoScan(input),
  listSolves: async () => listDemoSolves(),
  createSolve: async (_token, input) => createDemoSolve(input),
  leaderboard: async () => listDemoLeaderboard(),
  getSession: async () => demoSession,
  onSessionChange: () => () => undefined,
  logout: async () => undefined,
  resetDemoData: async () => resetDemoData()
};

export const api: AppService = isSupabaseMode ? supabaseApi : isDemoMode ? demoApi : remoteApi;
