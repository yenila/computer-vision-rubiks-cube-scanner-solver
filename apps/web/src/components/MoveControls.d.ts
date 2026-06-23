import type { MoveToken, SolveResult } from "@rubiks/shared";
export declare function MoveControls({ solution, moveHistory, activeMove, onApplyMoves, onUndo, onReset }: {
    solution: SolveResult | null;
    moveHistory: MoveToken[];
    activeMove: MoveToken | null;
    onApplyMoves: (moves: MoveToken[]) => void;
    onUndo: () => void;
    onReset: () => void;
}): import("react").JSX.Element;
