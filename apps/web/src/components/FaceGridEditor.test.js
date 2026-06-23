import { jsx as _jsx } from "react/jsx-runtime";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { FaceGridEditor } from "./FaceGridEditor";
const faceScan = {
    face: "U",
    capturedAt: new Date(0).toISOString(),
    stickers: Array.from({ length: 9 }, () => ({ color: "white", confidence: 0.8, source: "detected" }))
};
describe("FaceGridEditor", () => {
    it("emits manual sticker corrections", () => {
        const onChange = vi.fn();
        render(_jsx(FaceGridEditor, { faceScan: faceScan, onChange: onChange }));
        fireEvent.change(screen.getByLabelText("Sticker 1"), { target: { value: "red" } });
        expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ stickers: expect.arrayContaining([expect.objectContaining({ color: "red", source: "manual" })]) }));
    });
});
