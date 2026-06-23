import { describe, expect, it } from "vitest";
import { buildCalibratedPalette, GUIDED_SCAN_STEPS, getGuidedScanStep, validateGuidedCenter } from "./scanGuide";
function faceScan(center) {
    return {
        face: "F",
        capturedAt: "2026-06-23T00:00:00.000Z",
        stickers: Array.from({ length: 9 }, (_, index) => ({
            color: index === 4 ? center : "white",
            confidence: 0.95,
            source: "detected"
        }))
    };
}
describe("guided scan sequence", () => {
    it("uses the standard center-color order without changing URFDLB face identities", () => {
        expect(GUIDED_SCAN_STEPS.map(({ face, centerColor }) => [face, centerColor])).toEqual([
            ["F", "green"],
            ["R", "red"],
            ["B", "blue"],
            ["L", "orange"],
            ["U", "white"],
            ["D", "yellow"]
        ]);
    });
    it("accepts the expected center color", () => {
        expect(validateGuidedCenter(faceScan("green"), getGuidedScanStep("F"))).toBeNull();
    });
    it("rejects a face with the wrong center before assigning it", () => {
        expect(validateGuidedCenter(faceScan("red"), getGuidedScanStep("F"))).toContain("Expected the green center");
    });
    it("builds a session palette from captured center measurements", () => {
        const green = faceScan("green");
        green.stickers[4] = { ...green.stickers[4], rgb: { r: 82, g: 214, b: 96 } };
        const scan = { U: null, R: null, F: green, D: null, L: null, B: null };
        expect(buildCalibratedPalette(scan).green).toEqual({ r: 82, g: 214, b: 96 });
    });
});
