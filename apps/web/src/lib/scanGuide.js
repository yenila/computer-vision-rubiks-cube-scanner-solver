import { CUBE_COLOR_RGB } from "@rubiks/shared";
export const GUIDED_SCAN_STEPS = [
    {
        face: "F",
        centerColor: "green",
        title: "Green center",
        instruction: "Place the white center on top and point the green-center face at the camera.",
        orientationHint: "The white face must stay directly above the camera grid.",
        topEdgeColor: "white"
    },
    {
        face: "R",
        centerColor: "red",
        title: "Red center",
        instruction: "Keep white on top. Turn the whole cube one quarter-turn until the red center faces the camera.",
        orientationHint: "The white face must stay directly above the camera grid.",
        topEdgeColor: "white"
    },
    {
        face: "B",
        centerColor: "blue",
        title: "Blue center",
        instruction: "Keep white on top and continue turning the whole cube in the same direction until blue faces the camera.",
        orientationHint: "The white face must stay directly above the camera grid.",
        topEdgeColor: "white"
    },
    {
        face: "L",
        centerColor: "orange",
        title: "Orange center",
        instruction: "Keep white on top and turn the whole cube one more quarter-turn until orange faces the camera.",
        orientationHint: "The white face must stay directly above the camera grid.",
        topEdgeColor: "white"
    },
    {
        face: "U",
        centerColor: "white",
        title: "White center",
        instruction: "Reset to white on top and green in front. Tilt the whole cube toward the camera until white faces it.",
        orientationHint: "Blue must border the TOP of the grid; green must border the BOTTOM.",
        topEdgeColor: "blue"
    },
    {
        face: "D",
        centerColor: "yellow",
        title: "Yellow center",
        instruction: "Reset to white on top and green in front. Tilt the whole cube away until yellow faces the camera.",
        orientationHint: "Green must border the TOP of the grid; blue must border the BOTTOM.",
        topEdgeColor: "green"
    }
];
export function getGuidedScanStep(face) {
    const step = GUIDED_SCAN_STEPS.find((candidate) => candidate.face === face);
    if (!step)
        throw new Error(`No guided scan step is configured for face ${face}.`);
    return step;
}
export function validateGuidedCenter(faceScan, step) {
    const detectedCenter = faceScan.stickers[4]?.color;
    if (!detectedCenter)
        return "The center sticker could not be detected. Align the cube and scan again.";
    if (detectedCenter === step.centerColor)
        return null;
    return `Expected the ${step.centerColor} center, but detected ${detectedCenter}. Check the cube position and scan again.`;
}
export function buildCalibratedPalette(scan) {
    const palette = Object.fromEntries(Object.entries(CUBE_COLOR_RGB).map(([color, rgb]) => [color, { ...rgb }]));
    for (const step of GUIDED_SCAN_STEPS) {
        const centerRgb = scan[step.face]?.stickers[4]?.rgb;
        if (centerRgb)
            palette[step.centerColor] = centerRgb;
    }
    return palette;
}
