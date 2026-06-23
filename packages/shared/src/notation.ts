import type { MoveToken } from "./types";

export const MOVE_TOKENS: MoveToken[] = [
  "U",
  "U'",
  "U2",
  "R",
  "R'",
  "R2",
  "F",
  "F'",
  "F2",
  "D",
  "D'",
  "D2",
  "L",
  "L'",
  "L2",
  "B",
  "B'",
  "B2"
];

export function parseNotation(notation: string): MoveToken[] {
  return notation
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((token) => {
      if (!MOVE_TOKENS.includes(token as MoveToken)) {
        throw new Error(`Unsupported move token: ${token}`);
      }
      return token as MoveToken;
    });
}

export function invertMove(move: MoveToken): MoveToken {
  if (move.endsWith("2")) return move;
  if (move.endsWith("'")) return move.slice(0, 1) as MoveToken;
  return `${move}'` as MoveToken;
}

export function invertSequence(moves: MoveToken[]): MoveToken[] {
  return [...moves].reverse().map(invertMove);
}

export function randomScramble(length = 20, random = Math.random): MoveToken[] {
  const axes: Record<string, string> = { U: "y", D: "y", R: "x", L: "x", F: "z", B: "z" };
  const bases = ["U", "R", "F", "D", "L", "B"] as const;
  const suffixes = ["", "'", "2"] as const;
  const moves: MoveToken[] = [];
  let previousAxis = "";

  while (moves.length < length) {
    const base = bases[Math.floor(random() * bases.length)]!;
    const axis = axes[base]!;
    if (axis === previousAxis) continue;
    const suffix = suffixes[Math.floor(random() * suffixes.length)]!;
    moves.push(`${base}${suffix}` as MoveToken);
    previousAxis = axis;
  }

  return moves;
}
