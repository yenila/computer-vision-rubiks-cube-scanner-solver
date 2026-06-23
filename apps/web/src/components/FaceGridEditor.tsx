import { COLOR_ORDER, type CubeColor, type FaceScan } from "@rubiks/shared";

const colorClass: Record<CubeColor, string> = {
  white: "bg-white",
  yellow: "bg-yellow-300",
  red: "bg-red-600",
  orange: "bg-orange-500",
  green: "bg-green-600",
  blue: "bg-blue-600"
};

export function FaceGridEditor({
  faceScan,
  onChange
}: {
  faceScan: FaceScan | null;
  onChange: (next: FaceScan) => void;
}) {
  if (!faceScan) {
    return <div className="flex aspect-square items-center justify-center rounded-md border border-dashed border-line text-sm text-slate-500">No face captured</div>;
  }

  const updateSticker = (index: number, color: CubeColor) => {
    const stickers = faceScan.stickers.map((sticker, stickerIndex) =>
      stickerIndex === index ? { ...sticker, color, confidence: 1, source: "manual" as const } : sticker
    );
    onChange({ ...faceScan, stickers });
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-2">
        {faceScan.stickers.map((sticker, index) => (
          <label key={index} className="relative aspect-square rounded-md border border-line bg-slate-50 p-1">
            <span className={`block h-full rounded ${colorClass[sticker.color]}`} style={{ boxShadow: "inset 0 0 0 1px rgba(15, 23, 42, .16)" }} />
            <select
              aria-label={`Sticker ${index + 1}`}
              className="absolute inset-1 cursor-pointer opacity-0"
              value={sticker.color}
              onChange={(event) => updateSticker(index, event.target.value as CubeColor)}
            >
              {COLOR_ORDER.map((color) => (
                <option key={color} value={color}>
                  {color}
                </option>
              ))}
            </select>
            <span className="absolute bottom-1 right-1 rounded bg-white/85 px-1 text-[10px] font-semibold text-slate-700">{Math.round(sticker.confidence * 100)}%</span>
          </label>
        ))}
      </div>
      <div className="grid grid-cols-6 gap-1">
        {COLOR_ORDER.map((color) => (
          <button
            key={color}
            type="button"
            className={`h-8 rounded border border-line ${colorClass[color]}`}
            title={`Set center sticker to ${color}`}
            onClick={() => updateSticker(4, color)}
          />
        ))}
      </div>
    </div>
  );
}
