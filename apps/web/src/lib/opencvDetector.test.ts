import { describe, expect, it } from "vitest";
import { CUBE_COLOR_RGB } from "@rubiks/shared";
import { classifyStickerSamples, isOpenCvReady, robustAverageRgb } from "./opencvDetector";

function pixels(values: Array<[number, number, number]>): Uint8ClampedArray {
  return new Uint8ClampedArray(values.flatMap(([r, g, b]) => [r, g, b, 255]));
}

describe("camera sticker sampling", () => {
  it("trims bright glare and dark shadow from a red sticker sample", () => {
    const redPixels = Array.from({ length: 18 }, () => [170, 45, 92] as [number, number, number]);
    const result = robustAverageRgb(pixels([
      [4, 4, 4],
      [8, 7, 7],
      ...redPixels,
      [248, 248, 248],
      [255, 255, 255]
    ]));

    expect(result.r).toBeCloseTo(170, 0);
    expect(result.g).toBeCloseTo(45, 0);
    expect(result.b).toBeCloseTo(92, 0);
  });

  it("ignores transparent pixels", () => {
    expect(robustAverageRgb(new Uint8ClampedArray([255, 0, 0, 0]))).toEqual({ r: 0, g: 0, b: 0 });
  });

  it("calibrates a yellow capture that the uncalibrated camera renders green", () => {
    const green = { r: 70, g: 188, b: 74 };
    const cameraYellow = { r: 130, g: 235, b: 92 };
    const samples = Array.from({ length: 9 }, () => green);
    samples[4] = cameraYellow;
    const palette = { ...CUBE_COLOR_RGB, green };

    const result = classifyStickerSamples(samples, palette, "yellow");
    expect(result.detectedCenter).toBe("green");
    expect(result.stickers[4]?.color).toBe("yellow");
    expect(result.stickers[0]?.color).toBe("green");
    expect(result.stickers[4]?.rgb).toEqual(cameraYellow);
  });

  it("keeps cyan-shifted blue and magenta-shifted red distinct on the first face", () => {
    const samples = [
      { r: 210, g: 222, b: 226 },
      { r: 70, g: 184, b: 220 },
      { r: 244, g: 121, b: 63 },
      { r: 65, g: 181, b: 218 },
      { r: 67, g: 205, b: 105 },
      { r: 72, g: 177, b: 216 },
      { r: 75, g: 214, b: 99 },
      { r: 61, g: 201, b: 104 },
      { r: 214, g: 48, b: 82 }
    ];
    const clonedPalette = Object.fromEntries(
      Object.entries(CUBE_COLOR_RGB).map(([color, rgb]) => [color, { ...rgb }])
    ) as typeof CUBE_COLOR_RGB;

    const result = classifyStickerSamples(samples, clonedPalette, "green");
    expect(result.stickers.map((sticker) => sticker.color)).toEqual([
      "white", "blue", "orange", "blue", "green", "blue", "green", "green", "red"
    ]);
  });

  it("does not report OpenCV ready until Mat constructors exist", () => {
    expect(isOpenCvReady({ Mat: {}, MatVector: {}, imread: () => ({}) })).toBe(false);
    expect(isOpenCvReady({ Mat: function Mat() {}, MatVector: function MatVector() {}, imread: () => ({}) })).toBe(true);
  });
});
