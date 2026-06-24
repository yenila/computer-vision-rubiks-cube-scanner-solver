import { parseNotation, type SolveResult } from "@rubiks/shared";
import { Worker } from "node:worker_threads";
import { badRequest, serviceUnavailable } from "../lib/http";

const SOLVER_TIMEOUT_MS = 9000;

function runCubeSolver(facelets: string): Promise<{ notation: string; facelets: string }> {
  const script = `
const { parentPort, workerData: facelets } = require("node:worker_threads");
function isPermutation(values, size) {
  if (!Array.isArray(values) || values.length !== size) return false;
  const seen = new Set(values);
  if (seen.size !== size) return false;
  for (let i = 0; i < size; i += 1) {
    if (!seen.has(i)) return false;
  }
  return true;
}
function parseValidCube(Cube, facelets) {
  const cube = Cube.fromString(facelets);
  const state = cube.toJSON();
  const validPieces =
    isPermutation(state.center, 6) &&
    isPermutation(state.cp, 8) &&
    isPermutation(state.ep, 12) &&
    cube.asString() === facelets &&
    state.co.reduce((sum, value) => sum + value, 0) % 3 === 0 &&
    state.eo.reduce((sum, value) => sum + value, 0) % 2 === 0 &&
    cube.cornerParity() === cube.edgeParity();

  return validPieces ? cube : null;
}
function describeInvalidFacelets(facelets) {
  const cornerFacelets = [
    [8, 9, 20], [6, 18, 38], [0, 36, 47], [2, 45, 11],
    [29, 26, 15], [27, 44, 24], [33, 53, 42], [35, 17, 51]
  ];
  const edgeFacelets = [
    [5, 10], [7, 19], [3, 37], [1, 46],
    [32, 16], [28, 25], [30, 43], [34, 52],
    [23, 12], [21, 41], [50, 39], [48, 14]
  ];
  const cornerNames = ["URF", "UFL", "ULB", "UBR", "DFR", "DLF", "DBL", "DRB"];
  const edgeNames = ["UR", "UF", "UL", "UB", "DR", "DF", "DL", "DB", "FR", "FL", "BL", "BR"];
  const validCorners = new Set(["FRU", "FLU", "BLU", "BRU", "DFR", "DFL", "BDL", "BDR"]);
  const validEdges = new Set(["RU", "FU", "LU", "BU", "DR", "DF", "DL", "BD", "FR", "FL", "BL", "BR"]);
  const invalid = [];

  for (let index = 0; index < cornerFacelets.length; index += 1) {
    const colors = cornerFacelets[index].map((position) => facelets[position]);
    const key = [...colors].sort().join("");
    if (!validCorners.has(key)) invalid.push(cornerNames[index] + " corner reads " + colors.join("-"));
  }

  for (let index = 0; index < edgeFacelets.length; index += 1) {
    const colors = edgeFacelets[index].map((position) => facelets[position]);
    const key = [...colors].sort().join("");
    if (!validEdges.has(key)) invalid.push(edgeNames[index] + " edge reads " + colors.join("-"));
  }

  if (invalid.length) return "Check " + invalid.slice(0, 4).join("; ") + ".";
  return "The pieces look plausible, but their orientation or parity is impossible. Check whether two stickers or two whole faces are swapped.";
}
try {
  const Cube = require("cubejs");
  const cube = parseValidCube(Cube, facelets);

  if (!cube) {
    throw new Error("This scan orientation is not physically valid. Rescan each face with the required color edge at the TOP of the camera grid. " + describeInvalidFacelets(facelets));
  }

  Cube.initSolver();
  const notation = cube.solve();
  const verification = Cube.fromString(facelets);
  if (notation.trim()) verification.move(notation);
  const solvedFacelets = "U".repeat(9) + "R".repeat(9) + "F".repeat(9) + "D".repeat(9) + "L".repeat(9) + "B".repeat(9);
  if (verification.asString() !== solvedFacelets) {
    throw new Error("The generated moves did not verify against the exact scan. Rescan the cube before trying to solve it.");
  }
  parentPort.postMessage({ notation, facelets });
} catch (error) {
  parentPort.postMessage({ error: error instanceof Error ? error.message : "Solver failed." });
}
`;

  return new Promise((resolve, reject) => {
    const worker = new Worker(script, { eval: true, workerData: facelets });
    let settled = false;
    const timeoutId = setTimeout(() => {
      if (settled) return;
      settled = true;
      void worker.terminate();
      reject(badRequest("Solver timed out. Check the scanned stickers or correct the cube manually."));
    }, SOLVER_TIMEOUT_MS);

    const finish = (callback: () => void) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeoutId);
      callback();
    };

    worker.once("message", (payload: { notation?: string; facelets?: string; error?: string }) => {
      finish(() => {
        if (payload.error) reject(badRequest(payload.error));
        else resolve({ notation: payload.notation ?? "", facelets: payload.facelets ?? facelets });
      });
    });
    worker.once("error", (error) => {
      finish(() => reject(serviceUnavailable(`Solver worker failed to start: ${error.message}`)));
    });
    worker.once("exit", (code) => {
      if (code !== 0) finish(() => reject(serviceUnavailable("Solver worker stopped before returning a result.")));
    });
  });
}

export async function solveFacelets(facelets: string): Promise<SolveResult> {
  if (!/^[URFDLB]{54}$/.test(facelets)) {
    throw badRequest("Facelets must be 54 characters in URFDLB notation.");
  }

  const solved = await runCubeSolver(facelets);
  const moves = solved.notation.trim() ? parseNotation(solved.notation) : [];
  return {
    moves,
    notation: solved.notation,
    estimatedTurns: moves.length,
    facelets: solved.facelets
  };
}
