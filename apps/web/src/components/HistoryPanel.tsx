import { useEffect, useState } from "react";
import type { ApiSession, ScanRecord, SolveRecord } from "../lib/api";
import { api } from "../lib/api";

export function HistoryPanel({ session }: { session: ApiSession | null }) {
  const [scans, setScans] = useState<ScanRecord[]>([]);
  const [solves, setSolves] = useState<SolveRecord[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!session) return;
    Promise.all([api.listScans(session.token), api.listSolves(session.token)])
      .then(([nextScans, nextSolves]) => {
        setScans(nextScans);
        setSolves(nextSolves);
      })
      .catch((historyError) => setError(historyError instanceof Error ? historyError.message : "Failed to load history."));
  }, [session]);

  if (!session) return <div className="text-sm text-slate-600">Sign in to save scans and solve history.</div>;
  if (error) return <div className="text-sm text-red-700">{error}</div>;

  return (
    <div className="space-y-4">
      <div>
        <div className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">Recent scans</div>
        <div className="space-y-2">
          {scans.slice(0, 4).map((scan) => (
            <div key={scan.id} className="flex items-center justify-between rounded-md border border-line px-3 py-2 text-sm">
              <span className="font-medium">{scan.name}</span>
              <span className="text-slate-500">{scan.status}</span>
            </div>
          ))}
          {!scans.length ? <div className="text-sm text-slate-500">No scans yet</div> : null}
        </div>
      </div>
      <div>
        <div className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">Solve history</div>
        <div className="space-y-2">
          {solves.slice(0, 4).map((solve) => (
            <div key={solve.id} className="rounded-md border border-line px-3 py-2 text-sm">
              <div className="font-medium">{(solve.durationMs / 1000).toFixed(2)}s</div>
              <div className="truncate text-slate-500">{solve.solution.notation}</div>
            </div>
          ))}
          {!solves.length ? <div className="text-sm text-slate-500">No solves yet</div> : null}
        </div>
      </div>
    </div>
  );
}
