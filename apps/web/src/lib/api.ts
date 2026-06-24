import type { AuthUser, CubeScanState, SolveResult } from "@rubiks/shared";
import { isDemoMode } from "./appMode";
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

const remoteApi = {
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
  resetDemoData: async (): Promise<void> => undefined
};

const demoApi: typeof remoteApi = {
  register: async () => demoSession,
  login: async () => demoSession,
  solve: solveInBrowser,
  listScans: async () => listDemoScans(),
  createScan: async (_token, input) => createDemoScan(input),
  listSolves: async () => listDemoSolves(),
  createSolve: async (_token, input) => createDemoSolve(input),
  leaderboard: async () => listDemoLeaderboard(),
  resetDemoData: async () => resetDemoData()
};

export const api = isDemoMode ? demoApi : remoteApi;
