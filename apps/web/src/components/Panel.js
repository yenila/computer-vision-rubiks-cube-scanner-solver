import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export function Panel({ title, actions, children }) {
    return (_jsxs("section", { className: "relative overflow-hidden rounded-2xl border border-white/10 bg-panel-shine bg-slate-900/70 shadow-glass backdrop-blur-xl", children: [_jsx("div", { className: "pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/50 to-transparent" }), _jsxs("header", { className: "flex min-h-14 items-center justify-between gap-3 border-b border-white/10 px-4 sm:px-5", children: [_jsx("h2", { className: "text-xs font-bold uppercase tracking-[0.18em] text-slate-300", children: title }), actions] }), _jsx("div", { className: "p-4 sm:p-5", children: children })] }));
}
