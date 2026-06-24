import { Gauge, Pause, Play, RotateCcw, RotateCw, ShieldCheck, SkipBack, StepBack, StepForward } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { MoveToken, SolveResult } from "@rubiks/shared";
import { describeMove } from "../lib/moveInstructions";
import { Button } from "./Button";
import { MoveFaceDiagram } from "./MoveFaceDiagram";

const playbackDelays: Record<string, number> = { "0.5": 3200, "1": 2100, "1.5": 1400 };

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
  const moves = useMemo(() => solution?.moves ?? [], [solution?.moves]);
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
    <div className="space-y-4">
      <div className="overflow-hidden rounded-2xl border border-cyan-300/15 bg-gradient-to-br from-cyan-400/[0.07] via-slate-950/50 to-violet-500/[0.06]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-300">Guided solve protocol</div>
            <div className="mt-1 text-xs font-medium text-slate-400">White up · Green forward · Red right</div>
          </div>
          <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            <Gauge size={14} className="text-cyan-300" /> Speed
            <select className="h-9 rounded-xl border border-white/10 bg-slate-950 px-2 text-xs text-white outline-none focus:border-cyan-300/40" value={speed} onChange={(event) => setSpeed(event.target.value)}>
              <option value="0.5">0.5×</option><option value="1">1×</option><option value="1.5">1.5×</option>
            </select>
          </label>
        </div>

        <div className="p-4">
          <div className="mb-2 flex items-center justify-between text-[10px] font-semibold uppercase tracking-wider text-slate-500">
            <span>{moves.length ? `${step} / ${moves.length} moves` : "Awaiting verified state"}</span>
            <span className="text-cyan-300">{Math.round(progress)}%</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-slate-800">
            <div className="h-full rounded-full bg-gradient-to-r from-cyan-300 via-blue-400 to-violet-500 shadow-[0_0_12px_rgba(34,211,238,.5)] transition-[width] duration-300" style={{ width: `${progress}%` }} />
          </div>

          {solution ? (
            <div className="mt-3 flex items-center gap-1.5 text-[10px] font-semibold text-emerald-300"><ShieldCheck size={13} /> Verified against this exact {moves.length}-move state</div>
          ) : null}

          {instruction && shownMove ? (
            <div className="mt-4 grid items-center gap-4 rounded-2xl border border-white/10 bg-black/25 p-4 sm:grid-cols-[7.5rem_1fr]">
              <MoveFaceDiagram move={shownMove} instruction={instruction} animating={Boolean(activeMove)} />
              <div className="min-w-0">
                <div className="flex items-center gap-2 text-lg font-black text-white">
                  {instruction.direction === "counterclockwise" ? <RotateCcw size={20} className="text-cyan-300" /> : <RotateCw size={20} className="text-cyan-300" />}
                  {activeMove ? "Execute this move" : complete ? "Sequence complete" : `Next · ${shownMove}`}
                </div>
                <p className="mt-2 text-sm font-semibold leading-6 text-slate-200">{complete && !activeMove ? "The cube should now be solved." : instruction.instruction}</p>
                {!complete || activeMove ? (
                  <>
                    <p className="mt-1 text-xs leading-5 text-slate-500">{instruction.viewpoint} Keep the cube's overall orientation fixed.</p>
                    <p className="mt-3 rounded-xl border border-amber-300/15 bg-amber-400/[0.07] px-3 py-2 text-xs font-semibold text-amber-100">Turn only the {instruction.centerColor} layer. Do not rotate the entire cube.</p>
                  </>
                ) : null}
              </div>
            </div>
          ) : (
            <div className="mt-4 rounded-2xl border border-dashed border-white/10 bg-black/20 p-5 text-center">
              <div className="text-sm font-semibold text-slate-300">No movement sequence yet</div>
              <div className="mt-1 text-xs text-slate-600">Complete the scan and generate a verified solution.</div>
            </div>
          )}

          <div className="mt-4 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
            <Button icon={<SkipBack size={16} />} onClick={restart} disabled={!moves.length || (step === 0 && !playing)}>Restart</Button>
            <Button icon={<StepBack size={16} />} onClick={previous} disabled={step === 0}>Previous</Button>
            <Button className="col-span-2 sm:min-w-40" icon={playing ? <Pause size={16} /> : <Play size={16} />} variant="primary" onClick={togglePlayback} disabled={!moves.length}>
              {playing ? "Pause" : complete ? "Replay" : "Play instructions"}
            </Button>
            <Button icon={<StepForward size={16} />} onClick={performNext} disabled={!nextMove || playing}>Next move</Button>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Solution timeline</span>
          <span className="text-[10px] text-slate-600">{moveHistory.length} turns demonstrated</span>
        </div>
        <div className="flex min-h-10 flex-wrap gap-1.5">
          {moves.length ? moves.map((move, index) => (
            <span
              key={`${move}-${index}`}
              className={`flex h-8 min-w-8 items-center justify-center rounded-lg border px-1.5 text-xs font-black transition ${index < step ? "border-emerald-300/20 bg-emerald-400/10 text-emerald-200" : index === step ? "border-cyan-300/40 bg-cyan-300/10 text-cyan-100 ring-2 ring-cyan-300/10" : "border-white/10 bg-white/[0.03] text-slate-600"}`}
            >
              {move}
            </span>
          )) : <span className="text-xs text-slate-600">Sequence will appear here</span>}
        </div>
      </div>
    </div>
  );
}
