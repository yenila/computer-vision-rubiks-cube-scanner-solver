import { describe, expect, it } from "vitest";
import { CUBE_COLOR_RGB, classifyColor } from "./colors";

describe("camera color classification", () => {
  it.each([
    [{ r: 165, g: 185, b: 185 }, "white"],
    [{ r: 214, g: 28, b: 35 }, "red"],
    [{ r: 235, g: 105, b: 30 }, "orange"],
    [{ r: 155, g: 178, b: 48 }, "yellow"],
    [{ r: 50, g: 185, b: 95 }, "green"],
    [{ r: 55, g: 175, b: 220 }, "blue"]
  ] as const)("classifies %o as %s", (rgb, color) => {
    expect(classifyColor(rgb).color).toBe(color);
  });

  it.each([
    { r: 171, g: 57, b: 119 },
    { r: 142, g: 43, b: 105 },
    { r: 105, g: 28, b: 72 },
    { r: 188, g: 68, b: 105 }
  ])("classifies camera-shifted magenta red %o as red", (rgb) => {
    expect(classifyColor(rgb).color).toBe("red");
  });

  it.each([
    { r: 245, g: 120, b: 96 },
    { r: 235, g: 115, b: 90 },
    { r: 226, g: 96, b: 70 },
    { r: 248, g: 137, b: 105 }
  ])("classifies washed salmon orange %o as orange", (rgb) => {
    expect(classifyColor(rgb).color).toBe("orange");
  });

  it.each([
    { r: 196, g: 48, b: 40 },
    { r: 145, g: 30, b: 24 }
  ])("does not shift warm red %o to orange", (rgb) => {
    expect(classifyColor(rgb).color).toBe("red");
  });

  it.each([
    { r: 45, g: 92, b: 170 },
    { r: 52, g: 125, b: 192 },
    { r: 42, g: 65, b: 126 }
  ])("keeps genuine blue samples %o blue", (rgb) => {
    expect(classifyColor(rgb).color).toBe("blue");
  });

  it("does not mistake a cloned default palette for camera calibration", () => {
    const clonedPalette = Object.fromEntries(
      Object.entries(CUBE_COLOR_RGB).map(([color, rgb]) => [color, { ...rgb }])
    ) as typeof CUBE_COLOR_RGB;

    expect(classifyColor({ r: 70, g: 184, b: 220 }, clonedPalette).color).toBe("blue");
    expect(classifyColor({ r: 214, g: 48, b: 82 }, clonedPalette).color).toBe("red");
  });
});
