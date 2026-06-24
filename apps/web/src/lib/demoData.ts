import {
  FACE_ORDER,
  type AuthUser,
  type CubeColor,
  type CubeFace,
  type CubeScanState,
  type SolveResult
} from "@rubiks/shared";
import type { ApiSession, LeaderboardEntry, ScanRecord, SolveRecord } from "./api";

const STORAGE_PREFIX = "cubevision-demo-v1";
const SCANS_KEY = `${STORAGE_PREFIX}:scans`;
const SOLVES_KEY = `${STORAGE_PREFIX}:solves`;

const faceColors: Record<CubeFace, CubeColor> = {
  U: "white",
  R: "red",
  F: "green",
  D: "yellow",
  L: "orange",
  B: "blue"
};

const sampleFacelets = "DDBUUDBBFUBULRRBBBDRRBFFDLLFDUFDUUUDLLRRLLLRRRFFDBULFF";

const seededLeaderboard: LeaderboardEntry[] = [
  { id: "demo-1", rank: 1, name: "Maya Chen", bestTimeMs: 8420, solves: 47 },
  { id: "demo-2", rank: 2, name: "Noah Silva", bestTimeMs: 9170, solves: 31 },
  { id: "demo-3", rank: 3, name: "Ari Patel", bestTimeMs: 10680, solves: 26 },
  { id: "demo-4", rank: 4, name: "Lena Park", bestTimeMs: 12430, solves: 18 }
];

const demoUser: AuthUser = {
  id: "portfolio-guest",
  email: "guest@cubevision.demo",
  name: "Portfolio Guest"
};

export const demoSession: ApiSession = {
  token: "browser-local-demo-session",
  user: demoUser
};

function readRecords<T>(key: string): T[] {
  try {
    const value = localStorage.getItem(key);
    return value ? (JSON.parse(value) as T[]) : [];
  } catch {
    return [];
  }
}

function writeRecords<T>(key: string, records: T[]) {
  localStorage.setItem(key, JSON.stringify(records));
}

function createId(prefix: string) {
  const suffix = typeof crypto.randomUUID === "function" ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  return `${prefix}-${suffix}`;
}

export function createSampleScan(): CubeScanState {
  const capturedAt = new Date().toISOString();
  return Object.fromEntries(
    FACE_ORDER.map((face, faceIndex) => [
      face,
      {
        face,
        capturedAt,
        stickers: sampleFacelets.slice(faceIndex * 9, faceIndex * 9 + 9).split("").map((symbol) => ({
          color: faceColors[symbol as CubeFace],
          confidence: 0.98,
          source: "detected" as const
        }))
      }
    ])
  ) as CubeScanState;
}

export function listDemoScans(): ScanRecord[] {
  return readRecords<ScanRecord>(SCANS_KEY);
}

export function createDemoScan(input: { name: string; scan: CubeScanState; solution?: SolveResult }): ScanRecord {
  const record: ScanRecord = {
    id: createId("scan"),
    name: input.name,
    status: input.solution ? "SOLVED" : "VALID",
    createdAt: new Date().toISOString(),
    scan: input.scan
  };
  writeRecords(SCANS_KEY, [record, ...listDemoScans()].slice(0, 20));
  return record;
}

export function listDemoSolves(): SolveRecord[] {
  return readRecords<SolveRecord>(SOLVES_KEY);
}

export function createDemoSolve(input: { scanId?: string; solution: SolveResult; durationMs: number }): SolveRecord {
  const record: SolveRecord = {
    id: createId("solve"),
    ...(input.scanId ? { scanId: input.scanId } : {}),
    solution: input.solution,
    durationMs: input.durationMs,
    createdAt: new Date().toISOString()
  };
  writeRecords(SOLVES_KEY, [record, ...listDemoSolves()].slice(0, 20));
  return record;
}

export function listDemoLeaderboard(): LeaderboardEntry[] {
  const solves = listDemoSolves();
  if (!solves.length) return seededLeaderboard;

  const best = Math.min(...solves.map((solve) => solve.durationMs));
  return [...seededLeaderboard, { id: demoUser.id, rank: 0, name: "You · Browser demo", bestTimeMs: best, solves: solves.length }]
    .sort((left, right) => left.bestTimeMs - right.bestTimeMs)
    .map((entry, index) => ({ ...entry, rank: index + 1 }));
}

export function resetDemoData() {
  localStorage.removeItem(SCANS_KEY);
  localStorage.removeItem(SOLVES_KEY);
}
