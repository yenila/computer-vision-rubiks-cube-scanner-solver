import { describe, expect, it } from "vitest";
import { createEmptyScanState, scanToFaceletString, validateCubeScan } from "./validation";
import { FACE_ORDER, type CubeColor, type CubeFace, type CubeScanState } from "./types";

const colors: Record<CubeFace, CubeColor> = {
  U: "white",
  R: "red",
  F: "green",
  D: "yellow",
  L: "orange",
  B: "blue"
};

function solved(): CubeScanState {
  const scan = createEmptyScanState();
  for (const face of FACE_ORDER) {
    scan[face] = {
      face,
      capturedAt: new Date(0).toISOString(),
      stickers: Array.from({ length: 9 }, () => ({
        color: colors[face],
        confidence: 1,
        source: "manual" as const
      }))
    };
  }
  return scan;
}

describe("cube validation", () => {
  it("accepts a solved cube scan", () => {
    expect(validateCubeScan(solved()).valid).toBe(true);
  });

  it("rejects missing faces", () => {
    const scan = solved();
    scan.B = null;
    expect(validateCubeScan(scan).issues.some((issue) => issue.code === "MISSING_FACE")).toBe(true);
  });

  it("exports facelets in URFDLB order", () => {
    expect(scanToFaceletString(solved())).toBe("U".repeat(9) + "R".repeat(9) + "F".repeat(9) + "D".repeat(9) + "L".repeat(9) + "B".repeat(9));
  });
});
