import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { BarChart3, Clock3, Database, History, LogIn, ScanLine, TriangleAlert } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { api } from "../lib/api";
export function HistoryPanel({ session }) {
    const [scans, setScans] = useState([]);
    const [solves, setSolves] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
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
        Promise.all([api.listScans(session.token), api.listSolves(session.token)])
            .then(([nextScans, nextSolves]) => {
            if (cancelled)
                return;
            setScans(nextScans);
            setSolves(nextSolves);
        })
            .catch((historyError) => {
            if (!cancelled)
                setError(historyError instanceof Error ? historyError.message : "Failed to load history.");
        })
            .finally(() => {
            if (!cancelled)
                setLoading(false);
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
        return (_jsxs("div", { className: "rounded-2xl border border-dashed border-white/10 bg-black/20 p-5 text-center", children: [_jsx(LogIn, { className: "mx-auto text-slate-600", size: 22 }), _jsx("div", { className: "mt-3 text-sm font-semibold text-slate-300", children: "Analytics are locked" }), _jsx("div", { className: "mt-1 text-xs leading-5 text-slate-600", children: "Sign in to persist scans, solve times, and movement history." })] }));
    }
    if (loading) {
        return _jsx("div", { className: "space-y-3", children: Array.from({ length: 4 }, (_, index) => _jsx("div", { className: "h-14 animate-pulse rounded-xl border border-white/[0.06] bg-white/[0.04]" }, index)) });
    }
    if (error) {
        return _jsxs("div", { className: "flex gap-2 rounded-xl border border-red-400/20 bg-red-500/10 p-3 text-xs leading-5 text-red-200", children: [_jsx(TriangleAlert, { className: "shrink-0", size: 16 }), error] });
    }
    return (_jsxs("div", { className: "space-y-5", children: [_jsx("div", { className: "grid grid-cols-3 gap-2", children: [
                    [Database, `${solves.length}`, "Solves"],
                    [Clock3, stats.best === null ? "—" : `${(stats.best / 1000).toFixed(1)}s`, "Best"],
                    [BarChart3, stats.average === null ? "—" : `${(stats.average / 1000).toFixed(1)}s`, "Average"]
                ].map(([Icon, value, label]) => {
                    const StatIcon = Icon;
                    return (_jsxs("div", { className: "min-w-0 rounded-xl border border-white/10 bg-white/[0.035] p-2.5", children: [_jsx(StatIcon, { size: 13, className: "mb-2 text-cyan-300" }), _jsx("div", { className: "truncate text-sm font-black text-white", children: String(value) }), _jsx("div", { className: "mt-0.5 truncate text-[8px] font-bold uppercase tracking-wider text-slate-600", children: String(label) })] }, String(label)));
                }) }), _jsxs("div", { children: [_jsxs("div", { className: "mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500", children: [_jsx(ScanLine, { size: 12 }), " Recent captures"] }), _jsxs("div", { className: "space-y-2", children: [scans.slice(0, 3).map((scan) => (_jsxs("div", { className: "flex items-center justify-between gap-3 rounded-xl border border-white/[0.08] bg-white/[0.025] px-3 py-2.5 text-xs", children: [_jsx("span", { className: "min-w-0 truncate font-medium text-slate-300", children: scan.name }), _jsx("span", { className: "rounded-full border border-cyan-300/15 bg-cyan-300/[0.07] px-2 py-0.5 text-[8px] font-bold text-cyan-200", children: scan.status })] }, scan.id))), !scans.length ? _jsx("div", { className: "rounded-xl border border-dashed border-white/10 p-3 text-center text-xs text-slate-600", children: "No captures saved yet" }) : null] })] }), _jsxs("div", { children: [_jsxs("div", { className: "mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500", children: [_jsx(History, { size: 12 }), " Solve history"] }), _jsxs("div", { className: "space-y-2", children: [solves.slice(0, 3).map((solve) => (_jsxs("div", { className: "rounded-xl border border-white/[0.08] bg-white/[0.025] px-3 py-2.5", children: [_jsxs("div", { className: "flex items-center justify-between gap-2", children: [_jsxs("span", { className: "text-sm font-black text-white", children: [(solve.durationMs / 1000).toFixed(2), "s"] }), _jsx("span", { className: "text-[9px] text-slate-600", children: new Date(solve.createdAt).toLocaleDateString() })] }), _jsx("div", { className: "mt-1 truncate font-mono text-[10px] text-cyan-300/70", children: solve.solution.notation })] }, solve.id))), !solves.length ? _jsx("div", { className: "rounded-xl border border-dashed border-white/10 p-3 text-center text-xs text-slate-600", children: "Your first solve will appear here" }) : null] })] })] }));
}
