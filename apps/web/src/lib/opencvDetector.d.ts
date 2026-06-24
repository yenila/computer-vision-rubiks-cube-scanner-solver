import { type CubeColor, type Rgb, type CubeFace, type FaceScan, type Sticker } from "@rubiks/shared";
declare global {
    interface Window {
        cv?: unknown;
    }
}
type CvMat = {
    delete: () => void;
};
type CvMatVector = {
    size: () => number;
    get: (index: number) => CvMat;
    delete: () => void;
};
type CvLike = {
    Mat: new () => CvMat;
    MatVector: new () => CvMatVector;
    imread: (canvas: HTMLCanvasElement) => CvMat;
    cvtColor: (src: CvMat, dst: CvMat, code: number) => void;
    split: (src: CvMat, dst: CvMatVector) => void;
    threshold: (src: CvMat, dst: CvMat, threshold: number, maxValue: number, type: number) => void;
    findContours: (image: CvMat, contours: CvMatVector, hierarchy: CvMat, mode: number, method: number) => void;
    contourArea: (contour: CvMat) => number;
    boundingRect: (contour: CvMat) => {
        x: number;
        y: number;
        width: number;
        height: number;
    };
    COLOR_RGBA2RGB: number;
    COLOR_RGB2HSV: number;
    THRESH_BINARY: number;
    RETR_EXTERNAL: number;
    CHAIN_APPROX_SIMPLE: number;
};
export type DetectionResult = {
    faceScan: FaceScan;
    debug: {
        mode: "opencv" | "fallback-grid";
        message: string;
        detectedCenter: CubeColor;
    };
};
export declare function isOpenCvReady(candidate: unknown): candidate is CvLike;
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
export {};
