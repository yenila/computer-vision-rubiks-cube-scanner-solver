import type { MoveToken } from "@rubiks/shared";
export type MoveInstruction = {
    face: MoveToken[0];
    faceName: string;
    centerColor: string;
    direction: "clockwise" | "counterclockwise" | "180 degrees";
    degrees: 90 | 180;
    instruction: string;
    viewpoint: string;
};
export declare function describeMove(move: MoveToken): MoveInstruction;
