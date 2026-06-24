import { validateCubeScan, type SolveResult } from "@rubiks/shared";
import { beforeEach, describe, expect, it } from "vitest";
import {
  createDemoScan,
  createDemoSolve,
  createSampleScan,
  listDemoLeaderboard,
  listDemoScans,
  listDemoSolves,
  resetDemoData
} from "./demoData";

const solution: SolveResult = {
  moves: ["R", "U'"],
  notation: "R U'",
  estimatedTurns: 2,
  facelets: "U".repeat(9) + "R".repeat(9) + "F".repeat(9) + "D".repeat(9) + "L".repeat(9) + "B".repeat(9)
};

describe("portfolio demo data", () => {
  beforeEach(() => resetDemoData());

  it("creates a valid sample cube that is ready to solve", () => {
    expect(validateCubeScan(createSampleScan())).toEqual({ valid: true, issues: [] });
  });

  it("persists scans and solves in browser storage", () => {
    const scan = createDemoScan({ name: "Portfolio scan", scan: createSampleScan(), solution });
    createDemoSolve({ scanId: scan.id, solution, durationMs: 12_000 });

    expect(listDemoScans()).toHaveLength(1);
    expect(listDemoScans()[0]?.status).toBe("SOLVED");
    expect(listDemoSolves()).toHaveLength(1);
    expect(listDemoLeaderboard().some((entry) => entry.name.includes("Browser demo"))).toBe(true);
  });
});
