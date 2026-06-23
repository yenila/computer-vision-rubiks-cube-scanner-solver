import { type MoveToken } from "@rubiks/shared";
export declare function CubeViewer({ activeMove, moveHistory, facelets }: {
    activeMove: MoveToken | null;
    moveHistory: MoveToken[];
    facelets?: string | null;
}): import("react").JSX.Element;
