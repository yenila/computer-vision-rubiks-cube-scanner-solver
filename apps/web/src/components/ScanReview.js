import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { COLOR_ORDER, FACE_ORDER } from "@rubiks/shared";
const colorClass = {
    white: "bg-white",
    yellow: "bg-yellow-300",
    red: "bg-red-600",
    orange: "bg-orange-500",
    green: "bg-green-600",
    blue: "bg-blue-600"
};
const colorLabel = {
    white: "W",
    yellow: "Y",
    red: "R",
    orange: "O",
    green: "G",
    blue: "B"
};
function nextColor(color) {
    const index = COLOR_ORDER.indexOf(color);
    return COLOR_ORDER[(index + 1) % COLOR_ORDER.length];
}
function updateSticker(faceScan, index, color) {
    return {
        ...faceScan,
        stickers: faceScan.stickers.map((sticker, stickerIndex) => stickerIndex === index ? { ...sticker, color, confidence: 1, source: "manual" } : sticker)
    };
}
export function ScanReview({ scan, activeFace, onActiveFace, onFaceScan }) {
    const counts = Object.fromEntries(COLOR_ORDER.map((color) => [color, 0]));
    let lowConfidenceCount = 0;
    for (const face of FACE_ORDER) {
        for (const sticker of scan[face]?.stickers ?? []) {
            counts[sticker.color] += 1;
            if (sticker.source === "detected" && sticker.confidence < 0.9)
                lowConfidenceCount += 1;
        }
    }
    return (_jsxs("div", { className: "space-y-3", children: [_jsxs("div", { children: [_jsx("div", { className: "text-xs font-bold uppercase tracking-wide text-slate-500", children: "Scan correction" }), _jsx("div", { className: "mt-1 text-sm text-slate-700", children: lowConfidenceCount ? `${lowConfidenceCount} low-confidence sticker${lowConfidenceCount === 1 ? "" : "s"} to review` : "Tap a sticker to correct its color" })] }), _jsx("div", { className: "grid grid-cols-6 gap-1.5", children: COLOR_ORDER.map((color) => (_jsxs("div", { className: "min-w-0 rounded-md border border-line bg-white px-1.5 py-1 text-center", children: [_jsx("div", { className: `mx-auto mb-1 h-4 w-4 rounded border border-slate-300 ${colorClass[color]}` }), _jsxs("div", { className: `text-xs font-bold ${counts[color] === 9 ? "text-teal-700" : "text-amber-700"}`, children: [counts[color], "/9"] })] }, color))) }), _jsx("div", { className: "grid grid-cols-2 gap-2 lg:grid-cols-3", children: FACE_ORDER.map((face) => {
                    const faceScan = scan[face];
                    return (_jsxs("div", { className: `rounded-md border bg-white p-2 ${activeFace === face ? "border-teal-700" : "border-line"}`, children: [_jsx("button", { className: "mb-2 h-7 w-full rounded text-sm font-bold text-slate-700 hover:bg-slate-100", type: "button", onClick: () => onActiveFace(face), children: face }), faceScan ? (_jsx("div", { className: "grid grid-cols-3 gap-1", children: faceScan.stickers.map((sticker, index) => {
                                    const lowConfidence = sticker.source === "detected" && sticker.confidence < 0.9;
                                    return (_jsxs("button", { type: "button", "aria-label": `${face} sticker ${index + 1}, ${sticker.color}`, className: `relative aspect-square rounded border ${lowConfidence ? "border-amber-500 ring-2 ring-amber-200" : "border-line"}`, onClick: () => onFaceScan(updateSticker(faceScan, index, nextColor(sticker.color))), children: [_jsx("span", { className: `block h-full rounded ${colorClass[sticker.color]}` }), _jsx("span", { className: "absolute left-1 top-0.5 rounded bg-white/85 px-1 text-[10px] font-bold text-slate-700", children: colorLabel[sticker.color] }), lowConfidence ? (_jsxs("span", { className: "absolute bottom-0.5 right-0.5 rounded bg-amber-50 px-1 text-[9px] font-bold text-amber-800", children: [Math.round(sticker.confidence * 100), "%"] })) : null] }, index));
                                }) })) : (_jsx("div", { className: "flex aspect-square items-center justify-center rounded border border-dashed border-line text-xs text-slate-500", children: "Not scanned" }))] }, face));
                }) })] }));
}
