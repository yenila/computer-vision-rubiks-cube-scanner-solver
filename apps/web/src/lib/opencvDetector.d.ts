import { type CubeColor, type Rgb, type CubeFace, type FaceScan, type Sticker } from "@rubiks/shared";
declare global {
    interface Window {
        cv?: unknown;
    }
}
export type DetectionResult = {
    faceScan: FaceScan;
    debug: {
        mode: "opencv" | "fallback-grid";
        message: string;
        detectedCenter: CubeColor;
    };
};
export declare function loadOpenCv(): Promise<boolean>;
export declare function robustAverageRgb(imageData: Uint8ClampedArray): Rgb;
export declare function classifyStickerSamples(samples: Rgb[], palette?: Record<CubeColor, Rgb>, expectedCenter?: CubeColor): {
    stickers: Sticker[];
    detectedCenter: CubeColor;
};
export declare function detectFace(video: HTMLVideoElement, face: CubeFace, options?: {
    palette?: Record<CubeColor, Rgb>;
    expectedCenter?: CubeColor;
}): Promise<DetectionResult>;
