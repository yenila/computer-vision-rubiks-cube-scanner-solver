import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { COLOR_ORDER } from "@rubiks/shared";
const colorClass = {
    white: "bg-white",
    yellow: "bg-yellow-300",
    red: "bg-red-600",
    orange: "bg-orange-500",
    green: "bg-green-600",
    blue: "bg-blue-600"
};
export function FaceGridEditor({ faceScan, onChange }) {
    if (!faceScan) {
        return _jsx("div", { className: "flex aspect-square items-center justify-center rounded-md border border-dashed border-line text-sm text-slate-500", children: "No face captured" });
    }
    const updateSticker = (index, color) => {
        const stickers = faceScan.stickers.map((sticker, stickerIndex) => stickerIndex === index ? { ...sticker, color, confidence: 1, source: "manual" } : sticker);
        onChange({ ...faceScan, stickers });
    };
    return (_jsxs("div", { className: "space-y-3", children: [_jsx("div", { className: "grid grid-cols-3 gap-2", children: faceScan.stickers.map((sticker, index) => (_jsxs("label", { className: "relative aspect-square rounded-md border border-line bg-slate-50 p-1", children: [_jsx("span", { className: `block h-full rounded ${colorClass[sticker.color]}`, style: { boxShadow: "inset 0 0 0 1px rgba(15, 23, 42, .16)" } }), _jsx("select", { "aria-label": `Sticker ${index + 1}`, className: "absolute inset-1 cursor-pointer opacity-0", value: sticker.color, onChange: (event) => updateSticker(index, event.target.value), children: COLOR_ORDER.map((color) => (_jsx("option", { value: color, children: color }, color))) }), _jsxs("span", { className: "absolute bottom-1 right-1 rounded bg-white/85 px-1 text-[10px] font-semibold text-slate-700", children: [Math.round(sticker.confidence * 100), "%"] })] }, index))) }), _jsx("div", { className: "grid grid-cols-6 gap-1", children: COLOR_ORDER.map((color) => (_jsx("button", { type: "button", className: `h-8 rounded border border-line ${colorClass[color]}`, title: `Set center sticker to ${color}`, onClick: () => updateSticker(4, color) }, color))) })] }));
}
