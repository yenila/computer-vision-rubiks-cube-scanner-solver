import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { FaceScan } from "@rubiks/shared";
import { FaceGridEditor } from "./FaceGridEditor";

const faceScan: FaceScan = {
  face: "U",
  capturedAt: new Date(0).toISOString(),
  stickers: Array.from({ length: 9 }, () => ({ color: "white", confidence: 0.8, source: "detected" as const }))
};

describe("FaceGridEditor", () => {
  it("emits manual sticker corrections", () => {
    const onChange = vi.fn();
    render(<FaceGridEditor faceScan={faceScan} onChange={onChange} />);
    fireEvent.change(screen.getByLabelText("Sticker 1"), { target: { value: "red" } });
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ stickers: expect.arrayContaining([expect.objectContaining({ color: "red", source: "manual" })]) }));
  });

  it("renders a persistent visible selector for every sticker", () => {
    render(<FaceGridEditor faceScan={faceScan} onChange={vi.fn()} />);

    const selectors = screen.getAllByRole("combobox");
    expect(selectors).toHaveLength(9);
    selectors.forEach((selector) => {
      expect(selector).not.toHaveClass("opacity-0");
      expect(selector).toHaveAttribute("title", expect.stringContaining("Change sticker"));
    });
  });
});
