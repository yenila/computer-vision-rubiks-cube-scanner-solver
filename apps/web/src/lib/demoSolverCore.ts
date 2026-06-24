import { parseNotation, type SolveResult } from "@rubiks/shared";
import Cube from "cubejs";

function isPermutation(values: number[], size: number) {
  if (values.length !== size) return false;
  const seen = new Set(values);
  return seen.size === size && Array.from({ length: size }, (_, index) => index).every((index) => seen.has(index));
}

function parseValidCube(facelets: string) {
  const cube = Cube.fromString(facelets);
  const state = cube.toJSON();
  const valid =
    isPermutation(state.center, 6) &&
    isPermutation(state.cp, 8) &&
    isPermutation(state.ep, 12) &&
    cube.asString() === facelets &&
    state.co.reduce((sum, value) => sum + value, 0) % 3 === 0 &&
    state.eo.reduce((sum, value) => sum + value, 0) % 2 === 0 &&
    cube.cornerParity() === cube.edgeParity();
  return valid ? cube : null;
}

export function solveDemoFacelets(facelets: string): SolveResult {
  if (!/^[URFDLB]{54}$/.test(facelets)) throw new Error("Facelets must be 54 characters in URFDLB notation.");
  const cube = parseValidCube(facelets);
  if (!cube) throw new Error("This scan orientation is not physically valid. Check the manual correction grid or load the sample cube again.");

  Cube.initSolver();
  const notation = cube.solve();
  const verification = Cube.fromString(facelets);
  if (notation.trim()) verification.move(notation);
  const solved = "U".repeat(9) + "R".repeat(9) + "F".repeat(9) + "D".repeat(9) + "L".repeat(9) + "B".repeat(9);
  if (verification.asString() !== solved) throw new Error("The generated browser solution could not be verified.");

  const moves = notation.trim() ? parseNotation(notation) : [];
  return { moves, notation, estimatedTurns: moves.length, facelets };
}
