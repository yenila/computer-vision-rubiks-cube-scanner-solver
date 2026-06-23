import { type CubeColor, type CubeFace, type CubeScanState, type FaceScan, type Rgb } from "@rubiks/shared";
export type GuidedScanStep = {
    face: CubeFace;
    centerColor: CubeColor;
    title: string;
    instruction: string;
    orientationHint: string;
    topEdgeColor: CubeColor;
};
export declare const GUIDED_SCAN_STEPS: readonly GuidedScanStep[];
export declare function getGuidedScanStep(face: CubeFace): GuidedScanStep;
export declare function validateGuidedCenter(faceScan: FaceScan, step: GuidedScanStep): string | null;
export declare function buildCalibratedPalette(scan: CubeScanState): Record<CubeColor, Rgb>;
