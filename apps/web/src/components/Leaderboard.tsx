import { Trophy } from "lucide-react";
import { useEffect, useState } from "react";
import { api, type LeaderboardEntry } from "../lib/api";

export function Leaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.leaderboard().then(setEntries).catch((leaderboardError) => setError(leaderboardError instanceof Error ? leaderboardError.message : "Failed to load leaderboard."));
  }, []);

  if (error) return <div className="text-sm text-red-700">{error}</div>;

  return (
    <div className="space-y-2">
      {entries.slice(0, 8).map((entry) => (
        <div key={entry.id} className="grid grid-cols-[2rem_1fr_auto] items-center gap-2 rounded-md border border-line px-3 py-2 text-sm">
          <span className="font-bold text-slate-500">{entry.rank}</span>
          <span className="truncate font-medium">{entry.name}</span>
          <span className="flex items-center gap-1 text-slate-600">
            <Trophy size={14} />
            {(entry.bestTimeMs / 1000).toFixed(2)}s
          </span>
        </div>
      ))}
      {!entries.length ? <div className="text-sm text-slate-500">No leaderboard entries yet</div> : null}
    </div>
  );
}
