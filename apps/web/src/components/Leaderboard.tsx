import { Crown, Medal, Trophy, TriangleAlert, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { api, type LeaderboardEntry } from "../lib/api";

const rankStyle = [
  "border-yellow-300/20 bg-yellow-300/10 text-yellow-200",
  "border-slate-300/20 bg-slate-300/10 text-slate-200",
  "border-orange-300/20 bg-orange-300/10 text-orange-200"
];

export function Leaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    api.leaderboard()
      .then((nextEntries) => { if (!cancelled) setEntries(nextEntries); })
      .catch((leaderboardError) => { if (!cancelled) setError(leaderboardError instanceof Error ? leaderboardError.message : "Failed to load leaderboard."); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  if (loading) return <div className="space-y-2">{Array.from({ length: 5 }, (_, index) => <div key={index} className="h-12 animate-pulse rounded-xl bg-white/[0.04]" />)}</div>;
  if (error) return <div className="flex gap-2 rounded-xl border border-red-400/20 bg-red-500/10 p-3 text-xs leading-5 text-red-200"><TriangleAlert className="shrink-0" size={16} />{error}</div>;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between rounded-xl border border-violet-300/15 bg-violet-400/[0.06] px-3 py-2.5">
        <div className="flex items-center gap-2 text-xs font-semibold text-violet-200"><Users size={14} /> Global solvers</div>
        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Live ranking</div>
      </div>
      <div className="space-y-2">
        {entries.slice(0, 8).map((entry, index) => (
          <div key={entry.id} className={`grid grid-cols-[2rem_1fr_auto] items-center gap-2 rounded-xl border px-3 py-2.5 text-xs transition hover:bg-white/[0.05] ${rankStyle[index] ?? "border-white/[0.08] bg-white/[0.025] text-slate-300"}`}>
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-black/20 font-black">{index === 0 ? <Crown size={13} /> : index < 3 ? <Medal size={13} /> : entry.rank}</span>
            <div className="min-w-0"><div className="truncate font-semibold">{entry.name}</div><div className="mt-0.5 text-[9px] text-slate-500">{entry.solves} verified solves</div></div>
            <span className="flex items-center gap-1 font-mono text-[11px]"><Trophy size={12} />{(entry.bestTimeMs / 1000).toFixed(2)}s</span>
          </div>
        ))}
      </div>
      {!entries.length ? <div className="rounded-xl border border-dashed border-white/10 p-5 text-center text-xs text-slate-600">No ranked solves yet. Set the first signal.</div> : null}
    </div>
  );
}
