import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { MousePointerClick, ScanLine } from "lucide-react";
import { COLOR_ORDER } from "@rubiks/shared";
const colorClass = {
    white: "bg-gradient-to-br from-white to-slate-300",
    yellow: "bg-gradient-to-br from-yellow-200 to-yellow-400",
    red: "bg-gradient-to-br from-red-400 to-red-700",
    orange: "bg-gradient-to-br from-orange-300 to-orange-600",
    green: "bg-gradient-to-br from-emerald-300 to-emerald-600",
    blue: "bg-gradient-to-br from-blue-400 to-blue-700"
};
export function FaceGridEditor({ faceScan, onChange }) {
    if (!faceScan) {
        return (_jsxs("div", { className: "flex aspect-square flex-col items-center justify-center rounded-2xl border border-dashed border-white/15 bg-slate-950/40 px-6 text-center", children: [_jsx("div", { className: "flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-slate-500", children: _jsx(ScanLine, { size: 22 }) }), _jsx("div", { className: "mt-4 text-sm font-semibold text-slate-300", children: "No face data yet" }), _jsx("div", { className: "mt-1 text-xs leading-5 text-slate-600", children: "Capture this face to unlock sticker calibration." })] }));
    }
    const updateSticker = (index, color) => {
        const stickers = faceScan.stickers.map((sticker, stickerIndex) => stickerIndex === index ? { ...sticker, color, confidence: 1, source: "manual" } : sticker);
        onChange({ ...faceScan, stickers });
    };
    return (_jsxs("div", { className: "space-y-4", children: [_jsx("div", { className: "grid grid-cols-3 gap-2 rounded-2xl border border-white/10 bg-slate-950/70 p-2.5 shadow-inner", children: faceScan.stickers.map((sticker, index) => (_jsxs("label", { className: "group relative aspect-square rounded-xl border border-white/10 bg-slate-900 p-1.5 pb-8 transition hover:-translate-y-0.5 hover:border-cyan-300/40", children: [_jsx("span", { className: `block h-full rounded-lg ${colorClass[sticker.color]}`, style: { boxShadow: "inset 0 1px 2px rgba(255,255,255,.35), inset 0 -4px 10px rgba(0,0,0,.2), 0 5px 14px rgba(0,0,0,.28)" } }), _jsx("select", { "aria-label": `Sticker ${index + 1}`, title: `Change sticker ${index + 1} color`, className: "absolute inset-x-1.5 bottom-1.5 h-6 cursor-pointer rounded-md border border-white/15 bg-slate-950/95 px-1 text-[9px] font-bold capitalize text-white outline-none shadow-lg focus:border-cyan-300 focus:ring-2 focus:ring-cyan-300/20", value: sticker.color, onChange: (event) => updateSticker(index, event.target.value), children: COLOR_ORDER.map((color) => _jsx("option", { value: color, children: color }, color)) }), _jsxs("span", { className: "absolute right-2 top-2 rounded-md border border-black/10 bg-slate-950/80 px-1.5 py-0.5 text-[9px] font-bold text-white backdrop-blur", children: [Math.round(sticker.confidence * 100), "%"] }), index === 4 ? _jsx("span", { className: "absolute left-2 top-2 rounded-md bg-slate-950/80 px-1.5 py-0.5 text-[8px] font-black uppercase tracking-wider text-cyan-200", children: "Center" }) : null] }, index))) }), _jsxs("div", { children: [_jsxs("div", { className: "mb-2 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500", children: [_jsx(MousePointerClick, { size: 12 }), " Set center color"] }), _jsx("div", { className: "grid grid-cols-6 gap-1.5 rounded-xl border border-white/[0.07] bg-white/[0.025] p-2", children: COLOR_ORDER.map((color) => (_jsx("button", { type: "button", className: `h-8 rounded-lg border border-white/20 transition hover:scale-105 focus:outline-none focus:ring-2 focus:ring-cyan-300 ${colorClass[color]}`, title: `Set center sticker to ${color}`, onClick: () => updateSticker(4, color) }, color))) })] })] }));
}
