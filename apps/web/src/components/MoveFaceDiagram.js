import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { RotateCcw, RotateCw } from "lucide-react";
const faceColor = {
    white: "bg-white",
    red: "bg-red-600",
    green: "bg-green-600",
    yellow: "bg-yellow-400",
    orange: "bg-orange-500",
    blue: "bg-blue-600"
};
export function MoveFaceDiagram({ move, instruction, animating }) {
    const counterclockwise = instruction.direction === "counterclockwise";
    const Arrow = counterclockwise ? RotateCcw : RotateCw;
    const color = instruction.centerColor;
    return (_jsxs("div", { className: "space-y-1.5 text-center", children: [_jsxs("div", { className: "text-[10px] font-black uppercase tracking-wide text-slate-600", children: ["Look straight at ", color] }), _jsxs("div", { className: `relative mx-auto grid aspect-square w-24 grid-cols-3 gap-1 rounded-lg border-2 border-slate-700 bg-slate-800 p-1.5 shadow-inner ${faceColor[color]}`, children: [Array.from({ length: 9 }, (_, index) => (_jsx("span", { className: "rounded-sm border border-black/25 bg-inherit" }, index))), _jsxs("div", { className: "absolute inset-0 flex items-center justify-center rounded-lg bg-slate-950/30", children: [_jsx(Arrow, { size: 58, strokeWidth: 2.6, className: `text-white drop-shadow ${animating ? counterclockwise ? "animate-[spin_1s_ease-in-out_reverse]" : "animate-[spin_1s_ease-in-out]" : ""}`, "aria-hidden": "true" }), _jsx("span", { className: "absolute rounded bg-slate-950/85 px-2 py-1 text-lg font-black text-white", children: move })] })] }), _jsx("div", { className: "text-[11px] font-black uppercase text-slate-800", children: instruction.degrees === 180 ? "Half turn - 180°" : instruction.direction })] }));
}
