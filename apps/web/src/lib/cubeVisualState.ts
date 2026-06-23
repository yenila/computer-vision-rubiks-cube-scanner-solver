import Cube from "cubejs";
import type { CubeColor, CubeFace, MoveToken } from "@rubiks/shared";

export const SOLVED_FACELETS = "U".repeat(9) + "R".repeat(9) + "F".repeat(9) + "D".repeat(9) + "L".repeat(9) + "B".repeat(9);

const faceOffset: Record<CubeFace, number> = { U: 0, R: 9, F: 18, D: 27, L: 36, B: 45 };
const faceletColors: Record<CubeFace, CubeColor> = {
  U: "white",
  R: "red",
  F: "green",
  D: "yellow",
  L: "orange",
  B: "blue"
};

export function applyMovesToFacelets(facelets: string, moves: MoveToken[]): string {
  if (!/^[URFDLB]{54}$/.test(facelets)) return SOLVED_FACELETS;
  const cube = Cube.fromString(facelets);
  if (moves.length) cube.move(moves.join(" "));
  return cube.asString();
}

export function faceletColor(facelets: string, face: CubeFace, index: number): CubeColor {
  const symbol = facelets[faceOffset[face] + index] as CubeFace | undefined;
  return symbol ? faceletColors[symbol] : faceletColors[face];
}

export function stickerIndex(face: CubeFace, x: number, y: number, z: number): number {
  switch (face) {
    case "U": return (z + 1) * 3 + (x + 1);
    case "R": return (1 - y) * 3 + (1 - z);
    case "F": return (1 - y) * 3 + (x + 1);
    case "D": return (1 - z) * 3 + (x + 1);
    case "L": return (1 - y) * 3 + (z + 1);
    case "B": return (1 - y) * 3 + (1 - x);
  }
}
