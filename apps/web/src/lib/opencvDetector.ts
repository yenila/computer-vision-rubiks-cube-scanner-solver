import { CUBE_COLOR_RGB, classifyColor, type CubeColor, type Rgb, type CubeFace, type FaceScan, type Sticker } from "@rubiks/shared";

declare global {
  interface Window {
    cv?: unknown;
  }
}

type CvMat = { delete: () => void };
type CvMatVector = { size: () => number; get: (index: number) => CvMat; delete: () => void };
type CvLike = {
  Mat: new () => CvMat;
  MatVector: new () => CvMatVector;
  imread: (canvas: HTMLCanvasElement) => CvMat;
  cvtColor: (src: CvMat, dst: CvMat, code: number) => void;
  split: (src: CvMat, dst: CvMatVector) => void;
  threshold: (src: CvMat, dst: CvMat, threshold: number, maxValue: number, type: number) => void;
  findContours: (image: CvMat, contours: CvMatVector, hierarchy: CvMat, mode: number, method: number) => void;
  contourArea: (contour: CvMat) => number;
  boundingRect: (contour: CvMat) => { x: number; y: number; width: number; height: number };
  COLOR_RGBA2RGB: number;
  COLOR_RGB2HSV: number;
  THRESH_BINARY: number;
  RETR_EXTERNAL: number;
  CHAIN_APPROX_SIMPLE: number;
};

export type DetectionResult = {
  faceScan: FaceScan;
  debug: {
    mode: "opencv" | "fallback-grid";
    message: string;
    detectedCenter: CubeColor;
  };
};

let openCvPromise: Promise<boolean> | null = null;

export function loadOpenCv(): Promise<boolean> {
  if (window.cv) return Promise.resolve(true);
  if (openCvPromise) return openCvPromise;

  openCvPromise = new Promise((resolve) => {
    const script = document.createElement("script");
    script.async = true;
    script.src = import.meta.env.VITE_OPENCV_URL ?? "https://docs.opencv.org/4.x/opencv.js";
    script.onload = () => resolve(Boolean(window.cv));
    script.onerror = () => resolve(false);
    document.head.appendChild(script);
  });

  return openCvPromise;
}

export function robustAverageRgb(imageData: Uint8ClampedArray): Rgb {
  const samples: Array<Rgb & { luminance: number }> = [];

  for (let index = 0; index < imageData.length; index += 4) {
    const r = imageData[index] ?? 0;
    const g = imageData[index + 1] ?? 0;
    const b = imageData[index + 2] ?? 0;
    const alpha = imageData[index + 3] ?? 0;
    if (alpha < 128) continue;
    samples.push({ r, g, b, luminance: r * 0.2126 + g * 0.7152 + b * 0.0722 });
  }

  if (!samples.length) return { r: 0, g: 0, b: 0 };

  samples.sort((a, b) => a.luminance - b.luminance);
  const trim = samples.length >= 10 ? Math.floor(samples.length * 0.15) : 0;
  const selected = samples.slice(trim, samples.length - trim || samples.length);
  const total = selected.reduce(
    (sum, sample) => ({ r: sum.r + sample.r, g: sum.g + sample.g, b: sum.b + sample.b }),
    { r: 0, g: 0, b: 0 }
  );

  return {
    r: total.r / selected.length,
    g: total.g / selected.length,
    b: total.b / selected.length
  };
}

function sampleAverage(ctx: CanvasRenderingContext2D, x: number, y: number, size: number): Rgb {
  const imageData = ctx.getImageData(Math.max(0, x), Math.max(0, y), size, size).data;
  return robustAverageRgb(imageData);
}

function gridCenters(width: number, height: number) {
  const side = Math.floor(Math.min(width, height) * 0.62);
  const left = Math.floor((width - side) / 2);
  const top = Math.floor((height - side) / 2);
  const cell = side / 3;

  return Array.from({ length: 9 }, (_, index) => {
    const row = Math.floor(index / 3);
    const col = index % 3;
    return {
      x: left + col * cell + cell / 2,
      y: top + row * cell + cell / 2,
      size: Math.max(10, Math.floor(cell * 0.3))
    };
  });
}

function detectOpenCvCenters(canvas: HTMLCanvasElement): Array<{ x: number; y: number; size: number }> {
  const cv = window.cv as CvLike | undefined;
  if (!cv) return [];

  const src = cv.imread(canvas);
  const rgb = new cv.Mat();
  const hsv = new cv.Mat();
  const mask = new cv.Mat();
  const channels = new cv.MatVector();
  const contours = new cv.MatVector();
  const hierarchy = new cv.Mat();

  try {
    cv.cvtColor(src, rgb, cv.COLOR_RGBA2RGB);
    cv.cvtColor(rgb, hsv, cv.COLOR_RGB2HSV);
    cv.split(hsv, channels);
    const saturation = channels.get(1);
    cv.threshold(saturation, mask, 34, 255, cv.THRESH_BINARY);
    cv.findContours(mask, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);

    const minArea = (canvas.width * canvas.height) / 2500;
    const maxArea = (canvas.width * canvas.height) / 18;
    const candidates: Array<{ x: number; y: number; size: number; area: number }> = [];

    for (let i = 0; i < contours.size(); i += 1) {
      const contour = contours.get(i);
      const area = cv.contourArea(contour);
      const rect = cv.boundingRect(contour);
      const ratio = rect.width / Math.max(1, rect.height);
      const withinCenter = Math.abs(rect.x + rect.width / 2 - canvas.width / 2) < canvas.width * 0.38 && Math.abs(rect.y + rect.height / 2 - canvas.height / 2) < canvas.height * 0.38;

      if (area > minArea && area < maxArea && ratio > 0.55 && ratio < 1.55 && withinCenter) {
        candidates.push({
          x: rect.x + rect.width / 2,
          y: rect.y + rect.height / 2,
          size: Math.max(10, Math.floor(Math.min(rect.width, rect.height) * 0.45)),
          area
        });
      }
      contour.delete();
    }
    saturation.delete();

    if (candidates.length < 9) return [];

    return candidates
      .sort((a, b) => b.area - a.area)
      .slice(0, 9)
      .sort((a, b) => a.y - b.y)
      .reduce<Array<{ x: number; y: number; size: number }>>((rows, candidate, index, sorted) => {
        if (index % 3 === 0) {
          sorted.slice(index, index + 3).sort((a, b) => a.x - b.x).forEach((item) => rows.push(item));
        }
        return rows;
      }, []);
  } finally {
    src.delete();
    rgb.delete();
    hsv.delete();
    mask.delete();
    channels.delete();
    contours.delete();
    hierarchy.delete();
  }
}

export function classifyStickerSamples(
  samples: Rgb[],
  palette: Record<CubeColor, Rgb> = CUBE_COLOR_RGB,
  expectedCenter?: CubeColor
): { stickers: Sticker[]; detectedCenter: CubeColor } {
  const detectedCenter = classifyColor(samples[4] ?? { r: 0, g: 0, b: 0 }, palette).color;
  const calibratedPalette = expectedCenter && samples[4]
    ? { ...palette, [expectedCenter]: samples[4] }
    : palette;

  return {
    detectedCenter,
    stickers: samples.map((rgb, index) => {
      const classified = classifyColor(rgb, calibratedPalette);
      return {
        color: index === 4 && expectedCenter ? expectedCenter : classified.color,
        confidence: index === 4 && expectedCenter ? Math.max(0.9, classified.confidence) : classified.confidence,
        source: "detected" as const,
        rgb
      };
    })
  };
}

export async function detectFace(
  video: HTMLVideoElement,
  face: CubeFace,
  options: { palette?: Record<CubeColor, Rgb>; expectedCenter?: CubeColor } = {}
): Promise<DetectionResult> {
  const canvas = document.createElement("canvas");
  const width = video.videoWidth || 960;
  const height = video.videoHeight || 720;
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("Canvas 2D context is unavailable.");
  ctx.drawImage(video, 0, 0, width, height);

  const hasOpenCv = await loadOpenCv();
  const openCvCenters = hasOpenCv ? detectOpenCvCenters(canvas) : [];
  const centers = openCvCenters.length === 9 ? openCvCenters : gridCenters(width, height);

  const samples = centers.map((center) =>
    sampleAverage(ctx, Math.floor(center.x - center.size / 2), Math.floor(center.y - center.size / 2), center.size)
  );
  const { stickers, detectedCenter } = classifyStickerSamples(samples, options.palette, options.expectedCenter);

  return {
    faceScan: {
      face,
      stickers,
      capturedAt: new Date().toISOString()
    },
    debug: {
      mode: openCvCenters.length === 9 ? "opencv" : "fallback-grid",
      message: openCvCenters.length === 9 ? "OpenCV.js detected nine sticker candidates." : "Using calibrated center grid fallback.",
      detectedCenter
    }
  };
}
