import { Activity, Box, CircleUserRound, LogIn, Save, ScanLine, ShieldCheck, Sparkles } from "lucide-react";
import { lazy, Suspense, useEffect, useMemo, useState } from "react";
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
import { HistoryPanel } from "./components/HistoryPanel";
import { Leaderboard } from "./components/Leaderboard";
import { MoveControls } from "./components/MoveControls";
import { Panel } from "./components/Panel";
import { ScanReview } from "./components/ScanReview";
import { SpatialEngineBoundary } from "./components/RuntimeErrorBoundary";
import { WelcomeScreen } from "./components/WelcomeScreen";

type SolveStatus = "unchecked" | "solvable" | "not_solvable";

const CubeViewer = lazy(async () => {
  const module = await import("./components/CubeViewer");
  return { default: module.CubeViewer };
});

export function App() {
  const [scan, setScan] = useState<CubeScanState>(() => createEmptyScanState());
  const [activeFace, setActiveFace] = useState<CubeFace>("F");
  const [session, setSession] = useState<ApiSession | null>(null);
  const [hasEnteredApp, setHasEnteredApp] = useState(false);
  const [solution, setSolution] = useState<SolveResult | null>(null);
  const [moveHistory, setMoveHistory] = useState<MoveToken[]>([]);
  const [activeMove, setActiveMove] = useState<MoveToken | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isSolving, setIsSolving] = useState(false);
  const [spatialEnabled, setSpatialEnabled] = useState(false);
  const [solveStatus, setSolveStatus] = useState<SolveStatus>("unchecked");
  const validation = useMemo(() => validateCubeScan(scan), [scan]);

  const statusLabel = !validation.valid
    ? `${validation.issues.length} basic validation issue${validation.issues.length === 1 ? "" : "s"}`
    : solveStatus === "solvable"
      ? "Cube state solvable"
      : solveStatus === "not_solvable"
        ? "Cube state not solvable"
        : "Basic scan valid";

  const statusColor = !validation.valid ? "text-slate-500" : solveStatus === "not_solvable" ? "text-amber-300" : "text-emerald-300";
  const scannedFaces = Object.values(scan).filter(Boolean).length;
  const workspaceMetrics: Array<{ icon: typeof ScanLine; value: string; label: string }> = [
    { icon: ScanLine, value: `${scannedFaces}/6`, label: "Faces" },
    { icon: Activity, value: validation.valid ? "Ready" : `${validation.issues.length}`, label: "Validation" },
    { icon: Box, value: solution ? `${solution.moves.length}` : "—", label: "Moves" }
  ];

  useEffect(() => {
    let cancelled = false;
    api.getSession()
      .then((storedSession) => {
        if (cancelled || !storedSession) return;
        setSession(storedSession);
        setHasEnteredApp(true);
      })
      .catch(() => undefined);
    const unsubscribe = api.onAuthStateChange((nextSession) => {
      if (cancelled) return;
      setSession(nextSession);
      if (nextSession) setHasEnteredApp(true);
    });
    return () => {
      cancelled = true;
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
      const saved = await api.createScan(undefined, { name: `Scan ${new Date().toLocaleString()}`, scan, solution: solution ?? undefined });
      if (solution) await api.createSolve(undefined, { scanId: saved.id, solution, durationMs: Math.max(1000, solution.moves.length * 850) });
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
    <main className="relative min-h-screen overflow-hidden bg-canvas text-slate-100">
      <div className="pointer-events-none fixed -left-48 top-24 h-[32rem] w-[32rem] rounded-full bg-cyan-400/[0.06] blur-[130px]" />
      <div className="pointer-events-none fixed -right-56 top-1/3 h-[38rem] w-[38rem] rounded-full bg-violet-500/[0.07] blur-[150px]" />

      <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/75 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <div className="grid h-10 w-10 shrink-0 grid-cols-2 gap-0.5 rounded-xl border border-white/15 bg-gradient-to-br from-slate-100 to-slate-600 p-2 shadow-cyan">
              <span className="rounded-sm bg-cyan-300" /><span className="rounded-sm bg-violet-400" />
              <span className="rounded-sm bg-emerald-400" /><span className="rounded-sm bg-slate-950" />
            </div>
            <div className="min-w-0">
              <div className="truncate text-sm font-black tracking-[0.18em] text-white sm:text-base">CUBEVISION</div>
              <div className="hidden text-[9px] font-semibold uppercase tracking-[0.28em] text-cyan-300 sm:block">Scanner & solver engine</div>
            </div>
          </div>

          <div className="hidden items-center gap-1 rounded-xl border border-white/10 bg-white/[0.04] p-1 md:flex">
            <span className="rounded-lg bg-white/10 px-3 py-2 text-xs font-semibold text-white">Workspace</span>
            <span className="px-3 py-2 text-xs font-medium text-slate-500">Vision pipeline</span>
            <span className="px-3 py-2 text-xs font-medium text-slate-500">Solve analytics</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs sm:flex">
              <ShieldCheck size={15} className={statusColor} />
              <span className="max-w-48 truncate text-slate-300">{statusLabel}</span>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-slate-300">
              <CircleUserRound size={19} />
            </div>
          </div>
        </div>
      </header>

      <div className="relative mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:py-8">
        <section className="mb-6 grid gap-5 overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-cyan-950/30 p-6 shadow-glass sm:p-8 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.24em] text-cyan-300">
              <Sparkles size={14} /> Live solve workspace
            </div>
            <h1 className="mt-3 text-3xl font-black tracking-[-0.035em] text-white sm:text-5xl">Capture. Validate. Solve.</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">A guided six-face vision pipeline with exact-state validation and an interactive spatial walkthrough.</p>
          </div>
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {workspaceMetrics.map(({ icon: MetricIcon, value, label }) => (
              <div key={label} className="min-w-0 rounded-2xl border border-white/10 bg-black/20 p-3 sm:min-w-28 sm:p-4">
                <MetricIcon size={15} className="mb-3 text-cyan-300" />
                <div className="truncate text-lg font-black text-white">{value}</div>
                <div className="mt-0.5 truncate text-[10px] font-semibold uppercase tracking-widest text-slate-500">{label}</div>
              </div>
            ))}
          </div>
        </section>

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_390px]">
          <div className="space-y-5">
            <Panel title="01 / Guided vision capture">
              <CameraScanner scan={scan} activeFace={activeFace} onActiveFace={setActiveFace} onFaceScan={updateFaceScan} />
            </Panel>
            <Panel
              title="02 / Validate & solve"
              actions={
                <div className="flex gap-2">
                  <Button icon={<Save size={16} />} onClick={saveScan}>Save</Button>
                  <Button variant="primary" onClick={solve} disabled={!validation.valid || isSolving}>
                    {isSolving ? "Generating" : "Generate solution"}
                  </Button>
                </div>
              }
            >
              {message ? (
                <div className={`mb-4 rounded-xl border px-4 py-3 text-sm ${solveStatus === "not_solvable" ? "border-red-400/20 bg-red-500/10 text-red-200" : "border-cyan-300/20 bg-cyan-300/[0.07] text-cyan-100"}`}>
                  {message}
                </div>
              ) : null}
              <div className="grid gap-4 lg:grid-cols-[.78fr_1.22fr]">
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  {validation.valid ? (
                    <ScanReview scan={scan} activeFace={activeFace} onActiveFace={setActiveFace} onFaceScan={updateFaceScan} />
                  ) : (
                    <>
                      <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-slate-400"><ShieldCheck size={15} /> State diagnostics</div>
                      <div className="space-y-2 text-sm text-slate-400">
                        {validation.issues.slice(0, 8).map((issue, index) => <div className="rounded-lg border border-white/[0.07] bg-white/[0.03] px-3 py-2" key={index}>{issue.message}</div>)}
                      </div>
                    </>
                  )}
                </div>
                <div className="space-y-4">
                  {spatialEnabled ? (
                    <SpatialEngineBoundary>
                      <Suspense fallback={
                        <div className="flex h-[430px] min-h-[360px] flex-col items-center justify-center rounded-2xl border border-white/10 bg-[radial-gradient(circle_at_50%_45%,rgba(34,211,238,.1),transparent_30%),#03060b]">
                          <div className="h-10 w-10 animate-spin rounded-xl border-2 border-cyan-300/20 border-t-cyan-300" />
                          <div className="mt-4 text-xs font-bold uppercase tracking-[0.2em] text-cyan-200">Starting spatial engine</div>
                        </div>
                      }>
                        <CubeViewer activeMove={activeMove} moveHistory={moveHistory} facelets={solution?.facelets} />
                      </Suspense>
                    </SpatialEngineBoundary>
                  ) : (
                    <div className="flex h-[430px] min-h-[360px] flex-col items-center justify-center rounded-2xl border border-white/10 bg-[radial-gradient(circle_at_50%_45%,rgba(34,211,238,.08),transparent_30%),#03060b] p-6 text-center">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-300/20 bg-cyan-300/10 text-cyan-300"><Box size={26} /></div>
                      <div className="mt-4 text-sm font-bold text-white">3D spatial preview is paused</div>
                      <p className="mt-2 max-w-sm text-xs leading-5 text-slate-500">Start it when needed. Scanning, validation, authentication, and solving remain lightweight until then.</p>
                      <Button className="mt-5" variant="primary" onClick={() => setSpatialEnabled(true)}>Start 3D engine</Button>
                    </div>
                  )}
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

          <aside className="space-y-5 xl:sticky xl:top-24 xl:self-start">
            <Panel title={session ? "Account" : "Guest session"}>
              {session ? (
                <AuthPanel session={session} onSession={handleSession} />
              ) : (
                <div className="space-y-3">
                  <p className="text-sm leading-6 text-slate-400">You can scan and solve as a guest. Sign in to save scans and view your solve history.</p>
                  <Button icon={<LogIn size={16} />} onClick={() => setHasEnteredApp(false)}>Sign in or register</Button>
                </div>
              )}
            </Panel>
            <Panel title="Solve analytics"><HistoryPanel session={session} /></Panel>
            <Panel title="Global signal"><Leaderboard /></Panel>
          </aside>
        </div>
      </div>
    </main>
  );
}
