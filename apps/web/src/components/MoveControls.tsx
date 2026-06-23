import { Pause, Play, RotateCcw, RotateCw, ShieldCheck, SkipBack, StepBack, StepForward } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { MoveToken, SolveResult } from "@rubiks/shared";
import { describeMove } from "../lib/moveInstructions";
import { Button } from "./Button";
import { MoveFaceDiagram } from "./MoveFaceDiagram";

const playbackDelays: Record<string, number> = {
  "0.5": 3200,
  "1": 2100,
  "1.5": 1400
};

export function MoveControls({
  solution,
  moveHistory,
  activeMove,
  onApplyMoves,
  onUndo,
  onReset
}: {
  solution: SolveResult | null;
  moveHistory: MoveToken[];
  activeMove: MoveToken | null;
  onApplyMoves: (moves: MoveToken[]) => void;
  onUndo: () => void;
  onReset: () => void;
}) {
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
    if (!playing) return;
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
    if (step === 0) return;
    setPlaying(false);
    setStep((current) => Math.max(0, current - 1));
    onUndo();
  };

  const togglePlayback = () => {
    if (!moves.length) return;
    if (complete) {
      onReset();
      setStep(0);
    }
    setPlaying((current) => !current);
  };

  const progress = moves.length ? Math.min(100, (step / moves.length) * 100) : 0;

  return (
    <div className="space-y-3">
      <div className="rounded-lg border border-teal-200 bg-teal-50 p-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <div className="text-xs font-bold uppercase tracking-wide text-teal-800">Guided solution video</div>
            <div className="mt-0.5 text-sm font-semibold text-teal-950">Keep white on top, green in front, and red on the right.</div>
            {solution ? (
              <div className="mt-1 flex items-center gap-1 text-xs font-semibold text-teal-800">
                <ShieldCheck size={13} /> Verified against this exact {moves.length}-move scan. Move count varies by scramble.
              </div>
            ) : null}
          </div>
          <label className="flex items-center gap-2 text-xs font-semibold text-teal-900">
            Speed
            <select className="h-9 rounded-md border border-teal-300 bg-white px-2" value={speed} onChange={(event) => setSpeed(event.target.value)}>
              <option value="0.5">0.5×</option>
              <option value="1">1×</option>
              <option value="1.5">1.5×</option>
            </select>
          </label>
        </div>

        <div className="mt-3 h-2 overflow-hidden rounded-full bg-teal-100">
          <div className="h-full rounded-full bg-teal-700 transition-[width] duration-300" style={{ width: `${progress}%` }} />
        </div>
        <div className="mt-1 flex justify-between text-xs text-teal-800">
          <span>{moves.length ? `${step} of ${moves.length} moves completed` : "Generate a solution to begin"}</span>
          <span>{Math.round(progress)}%</span>
        </div>

        {instruction && shownMove ? (
          <div className="mt-3 grid grid-cols-[7rem_1fr] items-center gap-3 rounded-md border border-teal-200 bg-white p-3">
            <MoveFaceDiagram move={shownMove} instruction={instruction} animating={Boolean(activeMove)} />
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-base font-black text-slate-900">
                {instruction.direction === "counterclockwise" ? <RotateCcw size={20} className="text-teal-700" /> : <RotateCw size={20} className="text-teal-700" />}
                {activeMove ? "Perform this move" : complete ? "Solution complete" : `Next move: ${shownMove}`}
              </div>
              <p className="mt-1 text-sm font-semibold text-slate-800">{complete && !activeMove ? "The cube should now be solved." : instruction.instruction}</p>
              {!complete || activeMove ? (
                <>
                  <p className="mt-1 text-xs text-slate-500">{instruction.viewpoint} Keep the cube's overall orientation fixed.</p>
                  <p className="mt-2 rounded bg-amber-50 px-2 py-1.5 text-xs font-bold text-amber-900">Turn only the {instruction.centerColor} layer. Do not rotate the entire cube.</p>
                </>
              ) : null}
            </div>
          </div>
        ) : (
          <div className="mt-3 rounded-md border border-dashed border-teal-300 bg-white p-4 text-sm text-slate-600">
            Scan the cube and generate a solution to create the walkthrough.
          </div>
        )}

        <div className="mt-3 flex flex-wrap gap-2">
          <Button icon={<SkipBack size={16} />} onClick={restart} disabled={!moves.length || (step === 0 && !playing)}>
            Restart
          </Button>
          <Button icon={<StepBack size={16} />} onClick={previous} disabled={step === 0}>
            Previous
          </Button>
          <Button icon={playing ? <Pause size={16} /> : <Play size={16} />} variant="primary" onClick={togglePlayback} disabled={!moves.length}>
            {playing ? "Pause" : complete ? "Replay" : "Play instructions"}
          </Button>
          <Button icon={<StepForward size={16} />} onClick={performNext} disabled={!nextMove || playing}>
            Next move
          </Button>
        </div>
      </div>

      <div className="rounded-md border border-line bg-slate-50 p-3">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wide text-slate-500">Solution timeline</span>
          <span className="text-xs text-slate-500">{moveHistory.length} turns demonstrated</span>
        </div>
        <div className="flex min-h-10 flex-wrap gap-1.5">
          {moves.length ? moves.map((move, index) => (
            <span
              key={`${move}-${index}`}
              className={`flex h-8 min-w-8 items-center justify-center rounded border px-1.5 text-xs font-bold ${
                index < step
                  ? "border-teal-300 bg-teal-100 text-teal-900"
                  : index === step
                    ? "border-amber-400 bg-amber-50 text-amber-900 ring-2 ring-amber-200"
                    : "border-line bg-white text-slate-500"
              }`}
            >
              {move}
            </span>
          )) : <span className="text-sm text-slate-600">No solution generated</span>}
        </div>
      </div>
    </div>
  );
}
