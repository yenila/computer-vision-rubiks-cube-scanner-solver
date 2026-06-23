import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { api } from "../lib/api";
export function HistoryPanel({ session }) {
    const [scans, setScans] = useState([]);
    const [solves, setSolves] = useState([]);
    const [error, setError] = useState(null);
    useEffect(() => {
        if (!session)
            return;
        Promise.all([api.listScans(session.token), api.listSolves(session.token)])
            .then(([nextScans, nextSolves]) => {
            setScans(nextScans);
            setSolves(nextSolves);
        })
            .catch((historyError) => setError(historyError instanceof Error ? historyError.message : "Failed to load history."));
    }, [session]);
    if (!session)
        return _jsx("div", { className: "text-sm text-slate-600", children: "Sign in to save scans and solve history." });
    if (error)
        return _jsx("div", { className: "text-sm text-red-700", children: error });
    return (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("div", { className: "mb-2 text-xs font-bold uppercase tracking-wide text-slate-500", children: "Recent scans" }), _jsxs("div", { className: "space-y-2", children: [scans.slice(0, 4).map((scan) => (_jsxs("div", { className: "flex items-center justify-between rounded-md border border-line px-3 py-2 text-sm", children: [_jsx("span", { className: "font-medium", children: scan.name }), _jsx("span", { className: "text-slate-500", children: scan.status })] }, scan.id))), !scans.length ? _jsx("div", { className: "text-sm text-slate-500", children: "No scans yet" }) : null] })] }), _jsxs("div", { children: [_jsx("div", { className: "mb-2 text-xs font-bold uppercase tracking-wide text-slate-500", children: "Solve history" }), _jsxs("div", { className: "space-y-2", children: [solves.slice(0, 4).map((solve) => (_jsxs("div", { className: "rounded-md border border-line px-3 py-2 text-sm", children: [_jsxs("div", { className: "font-medium", children: [(solve.durationMs / 1000).toFixed(2), "s"] }), _jsx("div", { className: "truncate text-slate-500", children: solve.solution.notation })] }, solve.id))), !solves.length ? _jsx("div", { className: "text-sm text-slate-500", children: "No solves yet" }) : null] })] })] }));
}
