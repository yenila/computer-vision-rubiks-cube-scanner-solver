import { type CubeFace, type CubeScanState, type FaceScan } from "@rubiks/shared";
export declare function ScanReview({ scan, activeFace, onActiveFace, onFaceScan }: {
    scan: CubeScanState;
    activeFace: CubeFace;
    onActiveFace: (face: CubeFace) => void;
    onFaceScan: (faceScan: FaceScan) => void;
}): import("react").JSX.Element;
