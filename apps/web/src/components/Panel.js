import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export function Panel({ title, actions, children }) {
    return (_jsxs("section", { className: "rounded-lg border border-line bg-white", children: [_jsxs("header", { className: "flex min-h-12 items-center justify-between border-b border-line px-4", children: [_jsx("h2", { className: "text-sm font-bold uppercase tracking-wide text-slate-600", children: title }), actions] }), _jsx("div", { className: "p-4", children: children })] }));
}
