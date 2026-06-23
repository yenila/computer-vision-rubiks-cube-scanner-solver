import { COLOR_ORDER, FACE_ORDER, type CubeColor, type CubeFace, type CubeScanState, type ValidationResult } from "./types";

export function createEmptyScanState(): CubeScanState {
  return {
    U: null,
    R: null,
    F: null,
    D: null,
    L: null,
    B: null
  };
}

export function validateCubeScan(scan: CubeScanState): ValidationResult {
  const issues: ValidationResult["issues"] = [];
  const colorCounts = Object.fromEntries(COLOR_ORDER.map((color) => [color, 0])) as Record<CubeColor, number>;
  const centers = new Map<CubeColor, CubeFace>();

  for (const face of FACE_ORDER) {
    const faceScan = scan[face];
    if (!faceScan) {
      issues.push({ code: "MISSING_FACE", face, message: `Face ${face} has not been scanned.` });
      continue;
    }

    if (faceScan.stickers.length !== 9) {
      issues.push({ code: "BAD_STICKER_COUNT", face, message: `Face ${face} must contain exactly 9 stickers.` });
      continue;
    }

    const center = faceScan.stickers[4];
    if (!center) {
      issues.push({ code: "CENTER_MISSING", face, message: `Face ${face} has no center sticker.` });
    } else if (centers.has(center.color)) {
      issues.push({
        code: "CENTER_DUPLICATE",
        face,
        color: center.color,
        message: `Center color ${center.color} appears on multiple faces.`
      });
    } else {
      centers.set(center.color, face);
    }

    for (const sticker of faceScan.stickers) {
      colorCounts[sticker.color] += 1;
    }
  }

  for (const color of COLOR_ORDER) {
    if (colorCounts[color] !== 9) {
      issues.push({
        code: "COLOR_COUNT",
        color,
        message: `Color ${color} appears ${colorCounts[color]} times; expected 9.`
      });
    }
  }

  return { valid: issues.length === 0, issues };
}

export function scanToFaceletString(scan: CubeScanState): string {
  const validation = validateCubeScan(scan);
  if (!validation.valid) {
    throw new Error(validation.issues.map((issue) => issue.message).join(" "));
  }

  const centerToFace = new Map<CubeColor, CubeFace>();
  for (const face of FACE_ORDER) {
    const center = scan[face]!.stickers[4]!.color;
    centerToFace.set(center, face);
  }

  return FACE_ORDER.flatMap((face) =>
    scan[face]!.stickers.map((sticker) => {
      const mappedFace = centerToFace.get(sticker.color);
      if (!mappedFace) {
        throw new Error(`Color ${sticker.color} is not represented by any center.`);
      }
      return mappedFace;
    })
  ).join("");
}
