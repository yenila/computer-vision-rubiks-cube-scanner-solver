import { LogIn, Save, ShieldCheck } from "lucide-react";
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
import { AuthPanel } from "./components/AuthPanel";
import { Button } from "./components/Button";
import { CameraScanner } from "./components/CameraScanner";
import { CubeViewer } from "./components/CubeViewer";
import { HistoryPanel } from "./components/HistoryPanel";
import { Leaderboard } from "./components/Leaderboard";
import { MoveControls } from "./components/MoveControls";
import { Panel } from "./components/Panel";
import { ScanReview } from "./components/ScanReview";
import { WelcomeScreen } from "./components/WelcomeScreen";

type SolveStatus = "unchecked" | "solvable" | "not_solvable";

export function App() {
  const [scan, setScan] = useState<CubeScanState>(() => createEmptyScanState());
  const [activeFace, setActiveFace] = useState<CubeFace>("F");
  const [session, setSession] = useState<ApiSession | null>(() => {
    const raw = localStorage.getItem("rubiks-session");
    if (!raw) return null;
    try {
      return JSON.parse(raw) as ApiSession;
    } catch {
      localStorage.removeItem("rubiks-session");
      return null;
    }
  });
  const [hasEnteredApp, setHasEnteredApp] = useState(() => Boolean(session));
  const [solution, setSolution] = useState<SolveResult | null>(null);
  const [moveHistory, setMoveHistory] = useState<MoveToken[]>([]);
  const [activeMove, setActiveMove] = useState<MoveToken | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isSolving, setIsSolving] = useState(false);
  const [solveStatus, setSolveStatus] = useState<SolveStatus>("unchecked");
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
    if (session) localStorage.setItem("rubiks-session", JSON.stringify(session));
    else localStorage.removeItem("rubiks-session");
  }, [session]);

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
      setMessage("Scan saved.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Save failed.");
    }
  };

  const handleSession = (nextSession: ApiSession | null) => {
    setSession(nextSession);
    setHasEnteredApp(Boolean(nextSession));
  };

  if (!hasEnteredApp) {
    return (
      <WelcomeScreen
        onSession={(nextSession) => handleSession(nextSession)}
        onContinueAsGuest={() => {
          setSession(null);
          setHasEnteredApp(true);
        }}
      />
    );
  }

  return (
    <main className="min-h-screen bg-[#eef2f6]">
      <header className="border-b border-line bg-white">
        <div className="mx-auto flex max-w-[1500px] flex-col gap-3 px-4 py-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-black tracking-normal text-ink">Computer Vision Rubik’s Cube Scanner and Solver</h1>
            <p className="text-sm text-slate-600">Scan, correct, solve, replay, and track cube solves.</p>
          </div>
          <div className="flex items-center gap-2 rounded-md border border-line bg-slate-50 px-3 py-2 text-sm">
            <ShieldCheck size={17} className={statusColor} />
            {statusLabel}
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
              <div className="flex gap-2">
                <Button icon={<Save size={16} />} onClick={saveScan}>
                  Save
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
          <Panel title={session ? "Account" : "Guest session"}>
            {session ? (
              <AuthPanel session={session} onSession={handleSession} />
            ) : (
              <div className="space-y-3">
                <p className="text-sm leading-6 text-slate-600">You can scan and solve as a guest. Sign in to save scans and view your solve history.</p>
                <Button icon={<LogIn size={16} />} onClick={() => setHasEnteredApp(false)}>
                  Sign in or register
                </Button>
              </div>
            )}
          </Panel>
          <Panel title="History">
            <HistoryPanel session={session} />
          </Panel>
          <Panel title="Global leaderboard">
            <Leaderboard />
          </Panel>
        </aside>
      </div>
    </main>
  );
}
