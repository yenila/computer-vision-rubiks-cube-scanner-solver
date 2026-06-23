import { COLOR_ORDER, FACE_ORDER, type CubeColor, type CubeFace, type CubeScanState, type FaceScan } from "@rubiks/shared";

const colorClass: Record<CubeColor, string> = {
  white: "bg-white",
  yellow: "bg-yellow-300",
  red: "bg-red-600",
  orange: "bg-orange-500",
  green: "bg-green-600",
  blue: "bg-blue-600"
};

const colorLabel: Record<CubeColor, string> = {
  white: "W",
  yellow: "Y",
  red: "R",
  orange: "O",
  green: "G",
  blue: "B"
};

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
    <div className="space-y-3">
      <div>
        <div className="text-xs font-bold uppercase tracking-wide text-slate-500">Scan correction</div>
        <div className="mt-1 text-sm text-slate-700">
          {lowConfidenceCount ? `${lowConfidenceCount} low-confidence sticker${lowConfidenceCount === 1 ? "" : "s"} to review` : "Tap a sticker to correct its color"}
        </div>
      </div>

      <div className="grid grid-cols-6 gap-1.5">
        {COLOR_ORDER.map((color) => (
          <div key={color} className="min-w-0 rounded-md border border-line bg-white px-1.5 py-1 text-center">
            <div className={`mx-auto mb-1 h-4 w-4 rounded border border-slate-300 ${colorClass[color]}`} />
            <div className={`text-xs font-bold ${counts[color] === 9 ? "text-teal-700" : "text-amber-700"}`}>{counts[color]}/9</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-2 lg:grid-cols-3">
        {FACE_ORDER.map((face) => {
          const faceScan = scan[face];
          return (
            <div key={face} className={`rounded-md border bg-white p-2 ${activeFace === face ? "border-teal-700" : "border-line"}`}>
              <button className="mb-2 h-7 w-full rounded text-sm font-bold text-slate-700 hover:bg-slate-100" type="button" onClick={() => onActiveFace(face)}>
                {face}
              </button>
              {faceScan ? (
                <div className="grid grid-cols-3 gap-1">
                  {faceScan.stickers.map((sticker, index) => {
                    const lowConfidence = sticker.source === "detected" && sticker.confidence < 0.9;
                    return (
                      <button
                        key={index}
                        type="button"
                        aria-label={`${face} sticker ${index + 1}, ${sticker.color}`}
                        className={`relative aspect-square rounded border ${lowConfidence ? "border-amber-500 ring-2 ring-amber-200" : "border-line"}`}
                        onClick={() => onFaceScan(updateSticker(faceScan, index, nextColor(sticker.color)))}
                      >
                        <span className={`block h-full rounded ${colorClass[sticker.color]}`} />
                        <span className="absolute left-1 top-0.5 rounded bg-white/85 px-1 text-[10px] font-bold text-slate-700">{colorLabel[sticker.color]}</span>
                        {lowConfidence ? (
                          <span className="absolute bottom-0.5 right-0.5 rounded bg-amber-50 px-1 text-[9px] font-bold text-amber-800">
                            {Math.round(sticker.confidence * 100)}%
                          </span>
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="flex aspect-square items-center justify-center rounded border border-dashed border-line text-xs text-slate-500">Not scanned</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
