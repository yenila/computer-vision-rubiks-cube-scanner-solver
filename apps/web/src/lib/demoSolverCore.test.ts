import { scanToFaceletString } from "@rubiks/shared";
import { describe, expect, it } from "vitest";
import { applyMovesToFacelets, SOLVED_FACELETS } from "./cubeVisualState";
import { createSampleScan } from "./demoData";
import { solveDemoFacelets } from "./demoSolverCore";

describe("browser demo solver", () => {
  it("solves and verifies the bundled sample cube without an API", () => {
    const facelets = scanToFaceletString(createSampleScan());
    const result = solveDemoFacelets(facelets);

    expect(result.moves.length).toBeGreaterThan(0);
    expect(applyMovesToFacelets(facelets, result.moves)).toBe(SOLVED_FACELETS);
  }, 15_000);
});
