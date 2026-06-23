import { describe, expect, it } from "vitest";
import { solveFacelets } from "./solverService";

const SOLVED = "U".repeat(9) + "R".repeat(9) + "F".repeat(9) + "D".repeat(9) + "L".repeat(9) + "B".repeat(9);

describe("solver scan orientation", () => {
  it("verifies generated moves against the exact submitted facelets", async () => {
    const result = await solveFacelets(SOLVED);
    expect(result.facelets).toBe(SOLVED);
    expect(result.moves).toEqual(expect.any(Array));
  }, 15_000);

  it("rejects independently rotated face grids instead of solving a guessed state", async () => {
    const ambiguousScan = "RBURUURBDFRFURRBDDLLLLFFRBLRDBDDLLFUUUFRLFUBDDFBDBUBLF";
    await expect(solveFacelets(ambiguousScan)).rejects.toThrow("scan orientation is not physically valid");
  });
});
