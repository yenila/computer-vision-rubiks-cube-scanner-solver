import type { CubeColor, CubeFace, MoveToken } from "@rubiks/shared";
export declare const SOLVED_FACELETS: string;
export declare function applyMovesToFacelets(facelets: string, moves: MoveToken[]): string;
export declare function faceletColor(facelets: string, face: CubeFace, index: number): CubeColor;
export declare function stickerIndex(face: CubeFace, x: number, y: number, z: number): number;
