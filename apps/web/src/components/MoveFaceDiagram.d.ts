import type { MoveToken } from "@rubiks/shared";
import type { MoveInstruction } from "../lib/moveInstructions";
export declare function MoveFaceDiagram({ move, instruction, animating }: {
    move: MoveToken;
    instruction: MoveInstruction;
    animating: boolean;
}): import("react").JSX.Element;
