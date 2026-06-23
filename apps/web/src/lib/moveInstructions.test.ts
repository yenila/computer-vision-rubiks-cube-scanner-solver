import { describe, expect, it } from "vitest";
import { describeMove } from "./moveInstructions";

describe("solution move instructions", () => {
  it("describes a clockwise face turn using its center color", () => {
    expect(describeMove("R")).toMatchObject({
      face: "R",
      faceName: "right",
      centerColor: "red",
      direction: "clockwise",
      degrees: 90,
      instruction: "Turn the red right face 90° clockwise."
    });
  });

  it("describes a prime move as counterclockwise", () => {
    expect(describeMove("U'")).toMatchObject({
      centerColor: "white",
      direction: "counterclockwise",
      instruction: "Turn the white top face 90° counterclockwise."
    });
  });

  it("describes a double move as 180 degrees", () => {
    expect(describeMove("F2")).toMatchObject({
      centerColor: "green",
      direction: "180 degrees",
      degrees: 180,
      instruction: "Turn the green front face 180°."
    });
  });
});
