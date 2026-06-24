import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { COLOR_ORDER, FACE_ORDER, type CubeColor, type CubeFace, type CubeScanState, type FaceScan } from "@rubiks/shared";

const colorClass: Record<CubeColor, string> = {
  white: "bg-gradient-to-br from-white to-slate-300",
  yellow: "bg-gradient-to-br from-yellow-200 to-yellow-400",
  red: "bg-gradient-to-br from-red-400 to-red-700",
  orange: "bg-gradient-to-br from-orange-300 to-orange-600",
  green: "bg-gradient-to-br from-emerald-300 to-emerald-600",
  blue: "bg-gradient-to-br from-blue-400 to-blue-700"
};

const colorLabel: Record<CubeColor, string> = { white: "W", yellow: "Y", red: "R", orange: "O", green: "G", blue: "B" };

function nextColor(color: CubeColor): CubeColor {
  const index = COLOR_ORDER.indexOf(color);
  return COLOR_ORDER[(index + 1) % COLOR_ORDER.length]!;
}

function updateSticker(faceScan: FaceScan, index: number, color: CubeColor): FaceScan {
  return {
    ...faceScan,
    stickers: faceScan.stickers.map((sticker, stickerIndex) =>
      stickerIndex === index ? { ...sticker, color, confidence: 1, source: "manual" as const } : sticker
    )
  };
}

export function ScanReview({
  scan,
  activeFace,
  onActiveFace,
  onFaceScan
}: {
  scan: CubeScanState;
  activeFace: CubeFace;
  onActiveFace: (face: CubeFace) => void;
  onFaceScan: (faceScan: FaceScan) => void;
}) {
  const counts = Object.fromEntries(COLOR_ORDER.map((color) => [color, 0])) as Record<CubeColor, number>;
  let lowConfidenceCount = 0;

  for (const face of FACE_ORDER) {
    for (const sticker of scan[face]?.stickers ?? []) {
      counts[sticker.color] += 1;
      if (sticker.source === "detected" && sticker.confidence < 0.9) lowConfidenceCount += 1;
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-300">State correction matrix</div>
        <div className="mt-2 flex items-start gap-2 text-sm text-slate-400">
          {lowConfidenceCount ? <AlertTriangle className="mt-0.5 shrink-0 text-amber-300" size={15} /> : <CheckCircle2 className="mt-0.5 shrink-0 text-emerald-300" size={15} />}
          <span>{lowConfidenceCount ? `${lowConfidenceCount} low-confidence sticker${lowConfidenceCount === 1 ? "" : "s"} need review` : "All detections are confident. Tap any sticker to cycle its color."}</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 sm:grid-cols-6 lg:grid-cols-3 2xl:grid-cols-6">
        {COLOR_ORDER.map((color) => (
          <div key={color} className="rounded-xl border border-white/10 bg-white/[0.035] p-2 text-center">
            <div className={`mx-auto mb-1.5 h-4 w-4 rounded-md border border-white/20 ${colorClass[color]}`} />
            <div className={`text-[11px] font-black ${counts[color] === 9 ? "text-emerald-300" : "text-amber-300"}`}>{counts[color]}<span className="text-slate-600">/9</span></div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-2 2xl:grid-cols-3">
        {FACE_ORDER.map((face) => {
          const faceScan = scan[face];
          const active = activeFace === face;
          return (
            <div key={face} className={`rounded-xl border p-2 transition ${active ? "border-cyan-300/40 bg-cyan-300/[0.06]" : "border-white/10 bg-white/[0.025]"}`}>
              <button className={`mb-2 h-7 w-full rounded-lg text-xs font-black transition hover:bg-white/[0.06] ${active ? "text-cyan-200" : "text-slate-400"}`} type="button" onClick={() => onActiveFace(face)}>
                FACE {face}
              </button>
              {faceScan ? (
                <div className="grid grid-cols-3 gap-1 rounded-lg bg-slate-950/70 p-1">
                  {faceScan.stickers.map((sticker, index) => {
                    const lowConfidence = sticker.source === "detected" && sticker.confidence < 0.9;
                    return (
                      <button
                        key={index}
                        type="button"
                        aria-label={`${face} sticker ${index + 1}, ${sticker.color}`}
                        className={`relative aspect-square rounded-md border p-0.5 transition hover:scale-105 ${lowConfidence ? "border-amber-300 ring-1 ring-amber-300/30" : "border-white/10"}`}
                        onClick={() => onFaceScan(updateSticker(faceScan, index, nextColor(sticker.color)))}
                      >
                        <span className={`block h-full rounded ${colorClass[sticker.color]}`} />
                        <span className="absolute left-1 top-0.5 rounded bg-slate-950/80 px-1 text-[8px] font-black text-white">{colorLabel[sticker.color]}</span>
                        {lowConfidence ? <span className="absolute bottom-0.5 right-0.5 rounded bg-amber-950/90 px-1 text-[7px] font-bold text-amber-200">{Math.round(sticker.confidence * 100)}%</span> : null}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="flex aspect-square items-center justify-center rounded-lg border border-dashed border-white/10 bg-slate-950/30 px-2 text-center text-[10px] text-slate-600">Awaiting scan</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
