import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { Pause, Play, RotateCcw, RotateCw, ShieldCheck, SkipBack, StepBack, StepForward } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { describeMove } from "../lib/moveInstructions";
import { Button } from "./Button";
import { MoveFaceDiagram } from "./MoveFaceDiagram";
const playbackDelays = {
    "0.5": 3200,
    "1": 2100,
    "1.5": 1400
};
export function MoveControls({ solution, moveHistory, activeMove, onApplyMoves, onUndo, onReset }) {
    const [step, setStep] = useState(0);
    const [playing, setPlaying] = useState(false);
    const [speed, setSpeed] = useState("1");
    const moves = solution?.moves ?? [];
    const complete = moves.length > 0 && step >= moves.length;
    const nextMove = moves[step] ?? null;
    const shownMove = activeMove ?? nextMove ?? moves.at(-1) ?? null;
    const instruction = useMemo(() => shownMove ? describeMove(shownMove) : null, [shownMove]);
    useEffect(() => {
        setPlaying(false);
        setStep(0);
    }, [solution?.notation]);
    const performNext = useCallback(() => {
        const move = moves[step];
        if (!move) {
            setPlaying(false);
            return;
        }
        onApplyMoves([move]);
        setStep((current) => current + 1);
    }, [moves, onApplyMoves, step]);
    useEffect(() => {
        if (!playing)
            return;
        if (!nextMove) {
            setPlaying(false);
            return;
        }
        const timer = window.setTimeout(performNext, playbackDelays[speed] ?? playbackDelays["1"]);
        return () => window.clearTimeout(timer);
    }, [nextMove, performNext, playing, speed]);
    const restart = () => {
        setPlaying(false);
        setStep(0);
        onReset();
    };
    const previous = () => {
        if (step === 0)
            return;
        setPlaying(false);
        setStep((current) => Math.max(0, current - 1));
        onUndo();
    };
    const togglePlayback = () => {
        if (!moves.length)
            return;
        if (complete) {
            onReset();
            setStep(0);
        }
        setPlaying((current) => !current);
    };
    const progress = moves.length ? Math.min(100, (step / moves.length) * 100) : 0;
    return (_jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "rounded-lg border border-teal-200 bg-teal-50 p-3", children: [_jsxs("div", { className: "flex flex-wrap items-center justify-between gap-2", children: [_jsxs("div", { children: [_jsx("div", { className: "text-xs font-bold uppercase tracking-wide text-teal-800", children: "Guided solution video" }), _jsx("div", { className: "mt-0.5 text-sm font-semibold text-teal-950", children: "Keep white on top, green in front, and red on the right." }), solution ? (_jsxs("div", { className: "mt-1 flex items-center gap-1 text-xs font-semibold text-teal-800", children: [_jsx(ShieldCheck, { size: 13 }), " Verified against this exact ", moves.length, "-move scan. Move count varies by scramble."] })) : null] }), _jsxs("label", { className: "flex items-center gap-2 text-xs font-semibold text-teal-900", children: ["Speed", _jsxs("select", { className: "h-9 rounded-md border border-teal-300 bg-white px-2", value: speed, onChange: (event) => setSpeed(event.target.value), children: [_jsx("option", { value: "0.5", children: "0.5\u00D7" }), _jsx("option", { value: "1", children: "1\u00D7" }), _jsx("option", { value: "1.5", children: "1.5\u00D7" })] })] })] }), _jsx("div", { className: "mt-3 h-2 overflow-hidden rounded-full bg-teal-100", children: _jsx("div", { className: "h-full rounded-full bg-teal-700 transition-[width] duration-300", style: { width: `${progress}%` } }) }), _jsxs("div", { className: "mt-1 flex justify-between text-xs text-teal-800", children: [_jsx("span", { children: moves.length ? `${step} of ${moves.length} moves completed` : "Generate a solution to begin" }), _jsxs("span", { children: [Math.round(progress), "%"] })] }), instruction && shownMove ? (_jsxs("div", { className: "mt-3 grid grid-cols-[7rem_1fr] items-center gap-3 rounded-md border border-teal-200 bg-white p-3", children: [_jsx(MoveFaceDiagram, { move: shownMove, instruction: instruction, animating: Boolean(activeMove) }), _jsxs("div", { className: "min-w-0", children: [_jsxs("div", { className: "flex items-center gap-2 text-base font-black text-slate-900", children: [instruction.direction === "counterclockwise" ? _jsx(RotateCcw, { size: 20, className: "text-teal-700" }) : _jsx(RotateCw, { size: 20, className: "text-teal-700" }), activeMove ? "Perform this move" : complete ? "Solution complete" : `Next move: ${shownMove}`] }), _jsx("p", { className: "mt-1 text-sm font-semibold text-slate-800", children: complete && !activeMove ? "The cube should now be solved." : instruction.instruction }), !complete || activeMove ? (_jsxs(_Fragment, { children: [_jsxs("p", { className: "mt-1 text-xs text-slate-500", children: [instruction.viewpoint, " Keep the cube's overall orientation fixed."] }), _jsxs("p", { className: "mt-2 rounded bg-amber-50 px-2 py-1.5 text-xs font-bold text-amber-900", children: ["Turn only the ", instruction.centerColor, " layer. Do not rotate the entire cube."] })] })) : null] })] })) : (_jsx("div", { className: "mt-3 rounded-md border border-dashed border-teal-300 bg-white p-4 text-sm text-slate-600", children: "Scan the cube and generate a solution to create the walkthrough." })), _jsxs("div", { className: "mt-3 flex flex-wrap gap-2", children: [_jsx(Button, { icon: _jsx(SkipBack, { size: 16 }), onClick: restart, disabled: !moves.length || (step === 0 && !playing), children: "Restart" }), _jsx(Button, { icon: _jsx(StepBack, { size: 16 }), onClick: previous, disabled: step === 0, children: "Previous" }), _jsx(Button, { icon: playing ? _jsx(Pause, { size: 16 }) : _jsx(Play, { size: 16 }), variant: "primary", onClick: togglePlayback, disabled: !moves.length, children: playing ? "Pause" : complete ? "Replay" : "Play instructions" }), _jsx(Button, { icon: _jsx(StepForward, { size: 16 }), onClick: performNext, disabled: !nextMove || playing, children: "Next move" })] })] }), _jsxs("div", { className: "rounded-md border border-line bg-slate-50 p-3", children: [_jsxs("div", { className: "mb-2 flex items-center justify-between", children: [_jsx("span", { className: "text-xs font-bold uppercase tracking-wide text-slate-500", children: "Solution timeline" }), _jsxs("span", { className: "text-xs text-slate-500", children: [moveHistory.length, " turns demonstrated"] })] }), _jsx("div", { className: "flex min-h-10 flex-wrap gap-1.5", children: moves.length ? moves.map((move, index) => (_jsx("span", { className: `flex h-8 min-w-8 items-center justify-center rounded border px-1.5 text-xs font-bold ${index < step
                                ? "border-teal-300 bg-teal-100 text-teal-900"
                                : index === step
                                    ? "border-amber-400 bg-amber-50 text-amber-900 ring-2 ring-amber-200"
                                    : "border-line bg-white text-slate-500"}`, children: move }, `${move}-${index}`))) : _jsx("span", { className: "text-sm text-slate-600", children: "No solution generated" }) })] })] }));
}
