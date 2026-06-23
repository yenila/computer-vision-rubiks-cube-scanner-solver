import { describe, expect, it } from "vitest";
import { applyMovesToFacelets, faceletColor, SOLVED_FACELETS, stickerIndex } from "./cubeVisualState";

describe("3D solution state", () => {
  it("applies moves cumulatively and restores state with the inverse", () => {
    const turned = applyMovesToFacelets(SOLVED_FACELETS, ["R"]);
    expect(turned).not.toBe(SOLVED_FACELETS);
    expect(applyMovesToFacelets(SOLVED_FACELETS, ["R", "R'"])).toBe(SOLVED_FACELETS);
  });

  it("maps normalized facelets to physical sticker colors", () => {
    expect(faceletColor(SOLVED_FACELETS, "U", 4)).toBe("white");
    expect(faceletColor(SOLVED_FACELETS, "R", 4)).toBe("red");
    expect(faceletColor(SOLVED_FACELETS, "F", 4)).toBe("green");
  });

  it("maps every visible face to nine unique grid positions", () => {
    const coordinates = [-1, 0, 1];
    const front = coordinates.flatMap((x) => coordinates.map((y) => stickerIndex("F", x, y, 1)));
    const top = coordinates.flatMap((x) => coordinates.map((z) => stickerIndex("U", x, 1, z)));
    expect([...new Set(front)].sort()).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8]);
    expect([...new Set(top)].sort()).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8]);
  });
});
