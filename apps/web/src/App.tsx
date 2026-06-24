import { CloudOff, Database, Save, ShieldCheck, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  createEmptyScanState,
  invertMove,
  scanToFaceletString,
  validateCubeScan,
  type CubeFace,
  type CubeScanState,
  type FaceScan,
  type MoveToken,
  type SolveResult
} from "@rubiks/shared";
import { api, type ApiSession } from "./lib/api";
import { appMode, isDemoMode, isSupabaseMode, usesBrowserSolver } from "./lib/appMode";
import { createSampleScan, demoSession } from "./lib/demoData";
import { AuthPanel } from "./components/AuthPanel";
import { Button } from "./components/Button";
import { CameraScanner } from "./components/CameraScanner";
import { CubeViewer } from "./components/CubeViewer";
import { HistoryPanel } from "./components/HistoryPanel";
import { Leaderboard } from "./components/Leaderboard";
import { MoveControls } from "./components/MoveControls";
import { Panel } from "./components/Panel";
import { ScanReview } from "./components/ScanReview";

type SolveStatus = "unchecked" | "solvable" | "not_solvable";

export function App() {
  const [scan, setScan] = useState<CubeScanState>(() => createEmptyScanState());
  const [activeFace, setActiveFace] = useState<CubeFace>("F");
  const [session, setSession] = useState<ApiSession | null>(() => {
    if (isDemoMode) return demoSession;
    if (isSupabaseMode) return null;
    const raw = localStorage.getItem("rubiks-session");
    try {
      return raw ? (JSON.parse(raw) as ApiSession) : null;
    } catch {
      return null;
    }
  });
  const [solution, setSolution] = useState<SolveResult | null>(null);
  const [moveHistory, setMoveHistory] = useState<MoveToken[]>([]);
  const [activeMove, setActiveMove] = useState<MoveToken | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isSolving, setIsSolving] = useState(false);
  const [solveStatus, setSolveStatus] = useState<SolveStatus>("unchecked");
  const [dataRevision, setDataRevision] = useState(0);
  const validation = useMemo(() => validateCubeScan(scan), [scan]);

  const statusLabel = !validation.valid
    ? `${validation.issues.length} basic validation issue${validation.issues.length === 1 ? "" : "s"}`
    : solveStatus === "solvable"
      ? "Cube state solvable"
      : solveStatus === "not_solvable"
        ? "Cube state not solvable"
        : "Basic scan valid";

  const statusColor = !validation.valid ? "text-slate-400" : solveStatus === "not_solvable" ? "text-amber-700" : "text-teal-700";

  useEffect(() => {
    if (appMode !== "fullstack") return;
    if (session) localStorage.setItem("rubiks-session", JSON.stringify(session));
    else localStorage.removeItem("rubiks-session");
  }, [session]);

  useEffect(() => {
    if (!isSupabaseMode) return;
    let active = true;
    api.getSession()
      .then((nextSession) => {
        if (active) setSession(nextSession);
      })
      .catch((error) => {
        if (active) setMessage(error instanceof Error ? error.message : "Supabase session could not be restored.");
      });
    let unsubscribe: () => void = () => undefined;
    try {
      unsubscribe = api.onSessionChange((nextSession) => {
        if (active) setSession(nextSession);
      });
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Supabase authentication could not start.");
    }
    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  const updateFaceScan = (faceScan: FaceScan) => {
    setScan((current) => ({ ...current, [faceScan.face]: faceScan }));
    setSolution(null);
    setSolveStatus("unchecked");
    setMessage(null);
  };

  const solve = async () => {
    setMessage(null);
    setIsSolving(true);
    try {
      const facelets = scanToFaceletString(scan);
      const result = await api.solve(facelets);
      setSolution(result);
      setMoveHistory([]);
      setActiveMove(null);
      setSolveStatus("solvable");
      setMessage(result.moves.length ? `Generated ${result.moves.length}-move solution.` : "Cube is already solved.");
    } catch (error) {
      setSolution(null);
      setSolveStatus("not_solvable");
      setMessage(error instanceof Error ? error.message : "Solver failed. Check the scan and try again.");
    } finally {
      setIsSolving(false);
    }
  };

  const applyMoves = (moves: MoveToken[]) => {
    moves.forEach((move, index) => {
      window.setTimeout(() => {
        setActiveMove(move);
        setMoveHistory((current) => [...current, move]);
      }, index * 420);
    });
    window.setTimeout(() => setActiveMove(null), moves.length * 420 + 300);
  };

  const saveScan = async () => {
    if (!session) {
      setMessage("Sign in before saving scans.");
      return;
    }
    try {
      const saved = await api.createScan(session.token, { name: `Scan ${new Date().toLocaleString()}`, scan, solution: solution ?? undefined });
      if (solution) await api.createSolve(session.token, { scanId: saved.id, solution, durationMs: Math.max(1000, solution.moves.length * 850) });
      setDataRevision((current) => current + 1);
      setMessage(isDemoMode ? "Saved in this browser." : isSupabaseMode ? "Saved to Supabase." : "Scan saved.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Save failed.");
    }
  };

  return (
    <main className="min-h-screen bg-[#eef2f6]">
      <header className="border-b border-line bg-white">
        <div className="mx-auto flex max-w-[1500px] flex-col gap-3 px-4 py-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-black tracking-normal text-ink">Computer Vision Rubik’s Cube Scanner and Solver</h1>
            <p className="text-sm text-slate-600">Scan, correct, solve, replay, and track cube solves.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {isDemoMode ? (
              <div className="flex items-center gap-2 rounded-md border border-teal-200 bg-teal-50 px-3 py-2 text-sm font-semibold text-teal-800">
                <CloudOff size={17} />
                Portfolio demo · runs in your browser
              </div>
            ) : isSupabaseMode ? (
              <div className="flex items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-800">
                <Database size={17} />
                Supabase cloud · browser solver
              </div>
            ) : null}
            <div className="flex items-center gap-2 rounded-md border border-line bg-slate-50 px-3 py-2 text-sm">
              <ShieldCheck size={17} className={statusColor} />
              {statusLabel}
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1500px] gap-4 px-4 py-4 xl:grid-cols-[1fr_420px]">
        <div className="space-y-4">
          <Panel title="Guided scan">
            <CameraScanner scan={scan} activeFace={activeFace} onActiveFace={setActiveFace} onFaceScan={updateFaceScan} />
          </Panel>
          <Panel
            title="Validation and solving"
            actions={
              <div className="flex flex-wrap gap-2">
                {usesBrowserSolver ? (
                  <Button
                    icon={<Sparkles size={16} />}
                    onClick={() => {
                      setScan(createSampleScan());
                      setActiveFace("F");
                      setSolution(null);
                      setMoveHistory([]);
                      setActiveMove(null);
                      setSolveStatus("unchecked");
                      setMessage("Sample scrambled cube loaded. Generate its solution or edit any sticker.");
                    }}
                  >
                    Load sample cube
                  </Button>
                ) : null}
                <Button icon={<Save size={16} />} onClick={saveScan}>
                  {isDemoMode ? "Save locally" : isSupabaseMode ? "Save to cloud" : "Save"}
                </Button>
                <Button variant="primary" onClick={solve} disabled={!validation.valid || isSolving}>
                  {isSolving ? "Generating" : "Generate solution"}
                </Button>
              </div>
            }
          >
            {message ? <div className="mb-3 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">{message}</div> : null}
            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-md border border-line bg-slate-50 p-3">
                {validation.valid ? (
                  <ScanReview scan={scan} activeFace={activeFace} onActiveFace={setActiveFace} onFaceScan={updateFaceScan} />
                ) : (
                  <>
                    <div className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">Basic scan checks</div>
                    <div className="space-y-1 text-sm text-slate-700">{validation.issues.slice(0, 8).map((issue, index) => <div key={index}>{issue.message}</div>)}</div>
                  </>
                )}
              </div>
              <div className="space-y-3">
                <CubeViewer activeMove={activeMove} moveHistory={moveHistory} facelets={solution?.facelets} />
                <MoveControls
                  solution={solution}
                  moveHistory={moveHistory}
                  activeMove={activeMove}
                  onApplyMoves={applyMoves}
                  onUndo={() => {
                    const last = moveHistory.at(-1);
                    if (!last) return;
                    setMoveHistory((current) => current.slice(0, -1));
                    setActiveMove(invertMove(last));
                    window.setTimeout(() => setActiveMove(null), 720);
                  }}
                  onReset={() => {
                    setMoveHistory([]);
                    setActiveMove(null);
                  }}
                />
              </div>
            </div>
          </Panel>
        </div>

        <aside className="space-y-4">
          <Panel title={isDemoMode ? "Demo session" : isSupabaseMode ? "Supabase account" : "Account"}>
            <AuthPanel
              session={session}
              onSession={setSession}
              onDataReset={() => setDataRevision((current) => current + 1)}
            />
          </Panel>
          <Panel title="History">
            <HistoryPanel session={session} refreshKey={dataRevision} />
          </Panel>
          <Panel title={isDemoMode ? "Demo leaderboard" : "Global leaderboard"}>
            <Leaderboard refreshKey={dataRevision} />
          </Panel>
        </aside>
      </div>
    </main>
  );
}
