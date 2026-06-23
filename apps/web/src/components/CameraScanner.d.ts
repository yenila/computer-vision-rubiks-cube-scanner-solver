import type { CubeFace, CubeScanState, FaceScan } from "@rubiks/shared";
export declare function CameraScanner({ scan, activeFace, onActiveFace, onFaceScan }: {
    scan: CubeScanState;
    activeFace: CubeFace;
    onActiveFace: (face: CubeFace) => void;
    onFaceScan: (faceScan: FaceScan) => void;
}): import("react").JSX.Element;
