import { describe, expect, it } from "vitest";
import { CUBE_COLOR_RGB } from "@rubiks/shared";
import { classifyStickerSamples, robustAverageRgb } from "./opencvDetector";
function pixels(values) {
    return new Uint8ClampedArray(values.flatMap(([r, g, b]) => [r, g, b, 255]));
}
describe("camera sticker sampling", () => {
    it("trims bright glare and dark shadow from a red sticker sample", () => {
        const redPixels = Array.from({ length: 18 }, () => [170, 45, 92]);
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
});
