import type { SolveResult } from "@rubiks/shared";

type SolverResponse = { id: number; result?: SolveResult; error?: string };
type PendingRequest = { resolve: (result: SolveResult) => void; reject: (error: Error) => void; timeout: number };

let worker: Worker | null = null;
let requestId = 0;
const pending = new Map<number, PendingRequest>();

function getWorker() {
  if (worker) return worker;
  worker = new Worker(new URL("./demoSolver.worker.ts", import.meta.url), { type: "module" });
  worker.onmessage = (event: MessageEvent<SolverResponse>) => {
    const request = pending.get(event.data.id);
    if (!request) return;
    window.clearTimeout(request.timeout);
    pending.delete(event.data.id);
    if (event.data.result) request.resolve(event.data.result);
    else request.reject(new Error(event.data.error ?? "Browser solver failed."));
  };
  worker.onerror = () => {
    for (const request of pending.values()) {
      window.clearTimeout(request.timeout);
      request.reject(new Error("The browser solver could not start. Refresh and try again."));
    }
    pending.clear();
    worker?.terminate();
    worker = null;
  };
  return worker;
}

export function solveInBrowser(facelets: string): Promise<SolveResult> {
  const id = ++requestId;
  return new Promise((resolve, reject) => {
    const timeout = window.setTimeout(() => {
      pending.delete(id);
      reject(new Error("The browser solver timed out. Check the cube state and try again."));
    }, 20_000);
    pending.set(id, { resolve, reject, timeout });
    getWorker().postMessage({ id, facelets });
  });
}
