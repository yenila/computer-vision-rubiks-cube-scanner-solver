import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Trophy } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "../lib/api";
export function Leaderboard() {
    const [entries, setEntries] = useState([]);
    const [error, setError] = useState(null);
    useEffect(() => {
        api.leaderboard().then(setEntries).catch((leaderboardError) => setError(leaderboardError instanceof Error ? leaderboardError.message : "Failed to load leaderboard."));
    }, []);
    if (error)
        return _jsx("div", { className: "text-sm text-red-700", children: error });
    return (_jsxs("div", { className: "space-y-2", children: [entries.slice(0, 8).map((entry) => (_jsxs("div", { className: "grid grid-cols-[2rem_1fr_auto] items-center gap-2 rounded-md border border-line px-3 py-2 text-sm", children: [_jsx("span", { className: "font-bold text-slate-500", children: entry.rank }), _jsx("span", { className: "truncate font-medium", children: entry.name }), _jsxs("span", { className: "flex items-center gap-1 text-slate-600", children: [_jsx(Trophy, { size: 14 }), (entry.bestTimeMs / 1000).toFixed(2), "s"] })] }, entry.id))), !entries.length ? _jsx("div", { className: "text-sm text-slate-500", children: "No leaderboard entries yet" }) : null] }));
}
