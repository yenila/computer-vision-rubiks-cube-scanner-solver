import type { SolveResult } from "@rubiks/shared";
import { solveDemoFacelets } from "./demoSolverCore";

type SolverRequest = { id: number; facelets: string };
type SolverResponse = { id: number; result?: SolveResult; error?: string };

self.onmessage = (event: MessageEvent<SolverRequest>) => {
  const response: SolverResponse = { id: event.data.id };
  try {
    response.result = solveDemoFacelets(event.data.facelets);
  } catch (error) {
    response.error = error instanceof Error ? error.message : "Browser solver failed.";
  }
  self.postMessage(response);
};
