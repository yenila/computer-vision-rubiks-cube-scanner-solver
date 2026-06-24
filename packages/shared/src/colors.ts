import { COLOR_ORDER, type CubeColor, type Rgb } from "./types";

export type ClassifiedColor = {
  color: CubeColor;
  confidence: number;
  distance: number;
};

export const CUBE_COLOR_RGB: Record<CubeColor, Rgb> = {
  white: { r: 235, g: 238, b: 230 },
  yellow: { r: 246, g: 205, b: 44 },
  red: { r: 196, g: 38, b: 38 },
  orange: { r: 235, g: 112, b: 32 },
  green: { r: 36, g: 148, b: 78 },
  blue: { r: 36, g: 91, b: 182 }
};

const clamp = (value: number, min = 0, max = 255) => Math.max(min, Math.min(max, value));
const COLOR_HUES: Record<Exclude<CubeColor, "white">, number> = {
  red: 350,
  orange: 25,
  yellow: 62,
  green: 125,
  blue: 205
};
const CHROMATIC_COLORS = Object.keys(COLOR_HUES) as Array<Exclude<CubeColor, "white">>;

export function normalizeRgb(rgb: Rgb): Rgb {
  return {
    r: clamp(rgb.r),
    g: clamp(rgb.g),
    b: clamp(rgb.b)
  };
}

function weightedDistance(a: Rgb, b: Rgb): number {
  const meanRed = (a.r + b.r) / 2;
  const redWeight = 2 + meanRed / 256;
  const greenWeight = 4;
  const blueWeight = 2 + (255 - meanRed) / 256;
  return Math.sqrt(
    redWeight * Math.pow(a.r - b.r, 2) +
      greenWeight * Math.pow(a.g - b.g, 2) +
      blueWeight * Math.pow(a.b - b.b, 2)
  );
}

function rgbToHsv(rgb: Rgb): { hue: number; saturation: number; value: number } {
  const { r, g, b } = normalizeRgb(rgb);
  const red = r / 255;
  const green = g / 255;
  const blue = b / 255;
  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  const delta = max - min;

  let hue = 0;
  if (delta !== 0) {
    if (max === red) hue = 60 * (((green - blue) / delta) % 6);
    else if (max === green) hue = 60 * ((blue - red) / delta + 2);
    else hue = 60 * ((red - green) / delta + 4);
  }

  if (hue < 0) hue += 360;

  return {
    hue,
    saturation: max === 0 ? 0 : delta / max,
    value: max
  };
}

function hueDistance(a: number, b: number): number {
  const diff = Math.abs(a - b) % 360;
  return Math.min(diff, 360 - diff);
}

function nearestHue(hue: number): { color: Exclude<CubeColor, "white">; distance: number; separation: number } {
  const ranked = CHROMATIC_COLORS.map((color) => ({
    color,
    distance: hueDistance(hue, COLOR_HUES[color])
  })).sort((a, b) => a.distance - b.distance);

  const best = ranked[0]!;
  const next = ranked[1]?.distance ?? 180;
  return { ...best, separation: Math.max(0, next - best.distance) };
}

function classifyByHue(rgb: Rgb): ClassifiedColor | null {
  const hsv = rgbToHsv(rgb);

  if ((hsv.saturation <= 0.28 && hsv.value >= 0.38) || (hsv.saturation <= 0.38 && hsv.value >= 0.74)) {
    return {
      color: "white",
      distance: hsv.saturation * 100,
      confidence: Math.max(0.45, Math.min(0.99, 1 - hsv.saturation * 1.8))
    };
  }

  if (hsv.value < 0.18 || hsv.saturation < 0.18) return null;

  const { color, distance, separation } = nearestHue(hsv.hue);
  const confidence = Math.max(
    0.35,
    Math.min(0.99, 0.48 + hsv.saturation * 0.24 + separation / 160 - distance / 180)
  );

  return { color, distance, confidence };
}

function classifyByRgb(rgb: Rgb, palette: Record<CubeColor, Rgb>): ClassifiedColor {
  const normalized = normalizeRgb(rgb);
  const ranked = COLOR_ORDER.map((color) => ({
    color,
    distance: weightedDistance(normalized, palette[color])
  })).sort((a, b) => a.distance - b.distance);

  const best = ranked[0]!;
  const next = ranked[1]?.distance ?? best.distance + 1;
  const confidence = Math.max(0.05, Math.min(0.99, (next - best.distance + 40) / 120));
  return { color: best.color, distance: best.distance, confidence };
}

function hasRealCalibration(palette: Record<CubeColor, Rgb>): boolean {
  return COLOR_ORDER.some((color) => {
    const current = palette[color];
    const baseline = CUBE_COLOR_RGB[color];
    return Math.abs(current.r - baseline.r) + Math.abs(current.g - baseline.g) + Math.abs(current.b - baseline.b) >= 18;
  });
}

export function classifyColor(rgb: Rgb, palette: Record<CubeColor, Rgb> = CUBE_COLOR_RGB): ClassifiedColor {
  const hueMatch = classifyByHue(rgb);
  const rgbMatch = classifyByRgb(rgb, palette);
  if (!hueMatch) return rgbMatch;

  if (hueMatch.color === rgbMatch.color) {
    return {
      color: hueMatch.color,
      distance: Math.min(hueMatch.distance, rgbMatch.distance),
      confidence: Math.min(0.99, Math.max(hueMatch.confidence, rgbMatch.confidence))
    };
  }

  // A copied default palette is not calibration. On an uncalibrated camera, hue is
  // substantially more stable than absolute RGB under exposure and white-balance shifts.
  if (!hasRealCalibration(palette)) return hueMatch;

  // Once actual center samples exist, allow a close and decisive camera-space match
  // to override hue. This is important for yellow/white centers under colored light.
  if (rgbMatch.distance <= 85 && rgbMatch.confidence >= 0.68) {
    return { ...rgbMatch, confidence: Math.min(0.97, Math.max(0.55, rgbMatch.confidence)) };
  }

  return hueMatch;
}

export function cubeColorToFacelet(color: CubeColor): string {
  const map: Record<CubeColor, string> = {
    white: "U",
    red: "R",
    green: "F",
    yellow: "D",
    orange: "L",
    blue: "B"
  };
  return map[color];
}
