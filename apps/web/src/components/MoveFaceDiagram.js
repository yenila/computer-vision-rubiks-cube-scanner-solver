import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { RotateCcw, RotateCw } from "lucide-react";
const faceColor = {
    white: "bg-white",
    red: "bg-red-500",
    green: "bg-emerald-500",
    yellow: "bg-yellow-300",
    orange: "bg-orange-400",
    blue: "bg-blue-500"
};
export function MoveFaceDiagram({ move, instruction, animating }) {
    const counterclockwise = instruction.direction === "counterclockwise";
    const Arrow = counterclockwise ? RotateCcw : RotateCw;
    const color = instruction.centerColor;
    return (_jsxs("div", { className: "space-y-2 text-center", children: [_jsxs("div", { className: "text-[9px] font-black uppercase tracking-[0.16em] text-slate-500", children: ["Face ", color] }), _jsxs("div", { className: `relative mx-auto grid aspect-square w-24 grid-cols-3 gap-1 rounded-2xl border-4 border-slate-700 bg-slate-900 p-1.5 shadow-[0_12px_30px_rgba(0,0,0,.45),inset_0_1px_0_rgba(255,255,255,.18)] ${faceColor[color]}`, children: [Array.from({ length: 9 }, (_, index) => _jsx("span", { className: "rounded-sm border border-black/25 bg-inherit" }, index)), _jsxs("div", { className: "absolute inset-0 flex items-center justify-center rounded-xl bg-slate-950/35", children: [_jsx(Arrow, { size: 58, strokeWidth: 2.6, className: `text-white drop-shadow-[0_0_8px_rgba(255,255,255,.65)] ${animating ? counterclockwise ? "animate-[spin_1s_ease-in-out_reverse]" : "animate-[spin_1s_ease-in-out]" : ""}`, "aria-hidden": "true" }), _jsx("span", { className: "absolute rounded-lg border border-white/10 bg-slate-950/90 px-2.5 py-1 text-lg font-black text-white", children: move })] })] }), _jsx("div", { className: "text-[10px] font-black uppercase tracking-wider text-slate-300", children: instruction.degrees === 180 ? "Half turn · 180°" : instruction.direction })] }));
}
