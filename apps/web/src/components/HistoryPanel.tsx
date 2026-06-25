import { BarChart3, Clock3, Database, History, LogIn, ScanLine, TriangleAlert } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { ApiSession, ScanRecord, SolveRecord } from "../lib/api";
import { api } from "../lib/api";

export function HistoryPanel({ session }: { session: ApiSession | null }) {
  const [scans, setScans] = useState<ScanRecord[]>([]);
  const [solves, setSolves] = useState<SolveRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!session) {
      setScans([]);
      setSolves([]);
      setLoading(false);
      setError(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    Promise.all([api.listScans(), api.listSolves()])
      .then(([nextScans, nextSolves]) => {
        if (cancelled) return;
        setScans(nextScans);
        setSolves(nextSolves);
      })
      .catch((historyError) => {
        if (!cancelled) setError(historyError instanceof Error ? historyError.message : "Failed to load history.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [session]);

  const stats = useMemo(() => {
    const durations = solves.map((solve) => solve.durationMs);
    const best = durations.length ? Math.min(...durations) : null;
    const average = durations.length ? durations.reduce((sum, value) => sum + value, 0) / durations.length : null;
    return { best, average };
  }, [solves]);

  if (!session) {
    return (
      <div className="rounded-2xl border border-dashed border-white/10 bg-black/20 p-5 text-center">
        <LogIn className="mx-auto text-slate-600" size={22} />
        <div className="mt-3 text-sm font-semibold text-slate-300">Analytics are locked</div>
        <div className="mt-1 text-xs leading-5 text-slate-600">Sign in to persist scans, solve times, and movement history.</div>
      </div>
    );
  }

  if (loading) {
    return <div className="space-y-3">{Array.from({ length: 4 }, (_, index) => <div key={index} className="h-14 animate-pulse rounded-xl border border-white/[0.06] bg-white/[0.04]" />)}</div>;
  }

  if (error) {
    return <div className="flex gap-2 rounded-xl border border-red-400/20 bg-red-500/10 p-3 text-xs leading-5 text-red-200"><TriangleAlert className="shrink-0" size={16} />{error}</div>;
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-2">
        {[
          [Database, `${solves.length}`, "Solves"],
          [Clock3, stats.best === null ? "—" : `${(stats.best / 1000).toFixed(1)}s`, "Best"],
          [BarChart3, stats.average === null ? "—" : `${(stats.average / 1000).toFixed(1)}s`, "Average"]
        ].map(([Icon, value, label]) => {
          const StatIcon = Icon as typeof Database;
          return (
            <div key={String(label)} className="min-w-0 rounded-xl border border-white/10 bg-white/[0.035] p-2.5">
              <StatIcon size={13} className="mb-2 text-cyan-300" />
              <div className="truncate text-sm font-black text-white">{String(value)}</div>
              <div className="mt-0.5 truncate text-[8px] font-bold uppercase tracking-wider text-slate-600">{String(label)}</div>
            </div>
          );
        })}
      </div>

      <div>
        <div className="mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500"><ScanLine size={12} /> Recent captures</div>
        <div className="space-y-2">
          {scans.slice(0, 3).map((scan) => (
            <div key={scan.id} className="flex items-center justify-between gap-3 rounded-xl border border-white/[0.08] bg-white/[0.025] px-3 py-2.5 text-xs">
              <span className="min-w-0 truncate font-medium text-slate-300">{scan.name}</span>
              <span className="rounded-full border border-cyan-300/15 bg-cyan-300/[0.07] px-2 py-0.5 text-[8px] font-bold text-cyan-200">{scan.status}</span>
            </div>
          ))}
          {!scans.length ? <div className="rounded-xl border border-dashed border-white/10 p-3 text-center text-xs text-slate-600">No captures saved yet</div> : null}
        </div>
      </div>

      <div>
        <div className="mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500"><History size={12} /> Solve history</div>
        <div className="space-y-2">
          {solves.slice(0, 3).map((solve) => (
            <div key={solve.id} className="rounded-xl border border-white/[0.08] bg-white/[0.025] px-3 py-2.5">
              <div className="flex items-center justify-between gap-2"><span className="text-sm font-black text-white">{(solve.durationMs / 1000).toFixed(2)}s</span><span className="text-[9px] text-slate-600">{new Date(solve.createdAt).toLocaleDateString()}</span></div>
              <div className="mt-1 truncate font-mono text-[10px] text-cyan-300/70">{solve.solution.notation}</div>
            </div>
          ))}
          {!solves.length ? <div className="rounded-xl border border-dashed border-white/10 p-3 text-center text-xs text-slate-600">Your first solve will appear here</div> : null}
        </div>
      </div>
    </div>
  );
}
