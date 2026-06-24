import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { Activity, Box, CircleUserRound, LogIn, Save, ScanLine, ShieldCheck, Sparkles } from "lucide-react";
import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { createEmptyScanState, invertMove, scanToFaceletString, validateCubeScan } from "@rubiks/shared";
import { api } from "./lib/api";
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
const CubeViewer = lazy(async () => {
    const module = await import("./components/CubeViewer");
    return { default: module.CubeViewer };
});
export function App() {
    const [scan, setScan] = useState(() => createEmptyScanState());
    const [activeFace, setActiveFace] = useState("F");
    const [session, setSession] = useState(() => {
        const raw = localStorage.getItem("rubiks-session");
        if (!raw)
            return null;
        try {
            return JSON.parse(raw);
        }
        catch {
            localStorage.removeItem("rubiks-session");
            return null;
        }
    });
    const [hasEnteredApp, setHasEnteredApp] = useState(false);
    const [solution, setSolution] = useState(null);
    const [moveHistory, setMoveHistory] = useState([]);
    const [activeMove, setActiveMove] = useState(null);
    const [message, setMessage] = useState(null);
    const [isSolving, setIsSolving] = useState(false);
    const [spatialEnabled, setSpatialEnabled] = useState(false);
    const [solveStatus, setSolveStatus] = useState("unchecked");
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
    const workspaceMetrics = [
        { icon: ScanLine, value: `${scannedFaces}/6`, label: "Faces" },
        { icon: Activity, value: validation.valid ? "Ready" : `${validation.issues.length}`, label: "Validation" },
        { icon: Box, value: solution ? `${solution.moves.length}` : "—", label: "Moves" }
    ];
    useEffect(() => {
        if (session)
            localStorage.setItem("rubiks-session", JSON.stringify(session));
        else
            localStorage.removeItem("rubiks-session");
    }, [session]);
    const updateFaceScan = (faceScan) => {
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
        }
        catch (error) {
            setSolution(null);
            setSolveStatus("not_solvable");
            setMessage(error instanceof Error ? error.message : "Solver failed. Check the scan and try again.");
        }
        finally {
            setIsSolving(false);
        }
    };
    const applyMoves = (moves) => {
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
            if (solution)
                await api.createSolve(session.token, { scanId: saved.id, solution, durationMs: Math.max(1000, solution.moves.length * 850) });
            setMessage("Scan saved.");
        }
        catch (error) {
            setMessage(error instanceof Error ? error.message : "Save failed.");
        }
    };
    const handleSession = (nextSession) => {
        setSession(nextSession);
        setHasEnteredApp(Boolean(nextSession));
    };
    if (!hasEnteredApp) {
        return (_jsx(WelcomeScreen, { onSession: (nextSession) => handleSession(nextSession), onContinueAsGuest: () => {
                setSession(null);
                setHasEnteredApp(true);
            } }));
    }
    return (_jsxs("main", { className: "relative min-h-screen overflow-hidden bg-canvas text-slate-100", children: [_jsx("div", { className: "pointer-events-none fixed -left-48 top-24 h-[32rem] w-[32rem] rounded-full bg-cyan-400/[0.06] blur-[130px]" }), _jsx("div", { className: "pointer-events-none fixed -right-56 top-1/3 h-[38rem] w-[38rem] rounded-full bg-violet-500/[0.07] blur-[150px]" }), _jsx("header", { className: "sticky top-0 z-40 border-b border-white/10 bg-slate-950/75 backdrop-blur-2xl", children: _jsxs("div", { className: "mx-auto flex max-w-[1600px] items-center justify-between gap-4 px-4 py-3 sm:px-6", children: [_jsxs("div", { className: "flex min-w-0 items-center gap-3", children: [_jsxs("div", { className: "grid h-10 w-10 shrink-0 grid-cols-2 gap-0.5 rounded-xl border border-white/15 bg-gradient-to-br from-slate-100 to-slate-600 p-2 shadow-cyan", children: [_jsx("span", { className: "rounded-sm bg-cyan-300" }), _jsx("span", { className: "rounded-sm bg-violet-400" }), _jsx("span", { className: "rounded-sm bg-emerald-400" }), _jsx("span", { className: "rounded-sm bg-slate-950" })] }), _jsxs("div", { className: "min-w-0", children: [_jsx("div", { className: "truncate text-sm font-black tracking-[0.18em] text-white sm:text-base", children: "CUBEVISION" }), _jsx("div", { className: "hidden text-[9px] font-semibold uppercase tracking-[0.28em] text-cyan-300 sm:block", children: "Scanner & solver engine" })] })] }), _jsxs("div", { className: "hidden items-center gap-1 rounded-xl border border-white/10 bg-white/[0.04] p-1 md:flex", children: [_jsx("span", { className: "rounded-lg bg-white/10 px-3 py-2 text-xs font-semibold text-white", children: "Workspace" }), _jsx("span", { className: "px-3 py-2 text-xs font-medium text-slate-500", children: "Vision pipeline" }), _jsx("span", { className: "px-3 py-2 text-xs font-medium text-slate-500", children: "Solve analytics" })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsxs("div", { className: "hidden items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs sm:flex", children: [_jsx(ShieldCheck, { size: 15, className: statusColor }), _jsx("span", { className: "max-w-48 truncate text-slate-300", children: statusLabel })] }), _jsx("div", { className: "flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-slate-300", children: _jsx(CircleUserRound, { size: 19 }) })] })] }) }), _jsxs("div", { className: "relative mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:py-8", children: [_jsxs("section", { className: "mb-6 grid gap-5 overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-cyan-950/30 p-6 shadow-glass sm:p-8 lg:grid-cols-[1fr_auto] lg:items-end", children: [_jsxs("div", { children: [_jsxs("div", { className: "flex items-center gap-2 text-xs font-bold uppercase tracking-[0.24em] text-cyan-300", children: [_jsx(Sparkles, { size: 14 }), " Live solve workspace"] }), _jsx("h1", { className: "mt-3 text-3xl font-black tracking-[-0.035em] text-white sm:text-5xl", children: "Capture. Validate. Solve." }), _jsx("p", { className: "mt-3 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base", children: "A guided six-face vision pipeline with exact-state validation and an interactive spatial walkthrough." })] }), _jsx("div", { className: "grid grid-cols-3 gap-2 sm:gap-3", children: workspaceMetrics.map(({ icon: MetricIcon, value, label }) => (_jsxs("div", { className: "min-w-0 rounded-2xl border border-white/10 bg-black/20 p-3 sm:min-w-28 sm:p-4", children: [_jsx(MetricIcon, { size: 15, className: "mb-3 text-cyan-300" }), _jsx("div", { className: "truncate text-lg font-black text-white", children: value }), _jsx("div", { className: "mt-0.5 truncate text-[10px] font-semibold uppercase tracking-widest text-slate-500", children: label })] }, label))) })] }), _jsxs("div", { className: "grid gap-5 xl:grid-cols-[minmax(0,1fr)_390px]", children: [_jsxs("div", { className: "space-y-5", children: [_jsx(Panel, { title: "01 / Guided vision capture", children: _jsx(CameraScanner, { scan: scan, activeFace: activeFace, onActiveFace: setActiveFace, onFaceScan: updateFaceScan }) }), _jsxs(Panel, { title: "02 / Validate & solve", actions: _jsxs("div", { className: "flex gap-2", children: [_jsx(Button, { icon: _jsx(Save, { size: 16 }), onClick: saveScan, children: "Save" }), _jsx(Button, { variant: "primary", onClick: solve, disabled: !validation.valid || isSolving, children: isSolving ? "Generating" : "Generate solution" })] }), children: [message ? (_jsx("div", { className: `mb-4 rounded-xl border px-4 py-3 text-sm ${solveStatus === "not_solvable" ? "border-red-400/20 bg-red-500/10 text-red-200" : "border-cyan-300/20 bg-cyan-300/[0.07] text-cyan-100"}`, children: message })) : null, _jsxs("div", { className: "grid gap-4 lg:grid-cols-[.78fr_1.22fr]", children: [_jsx("div", { className: "rounded-2xl border border-white/10 bg-black/20 p-4", children: validation.valid ? (_jsx(ScanReview, { scan: scan, activeFace: activeFace, onActiveFace: setActiveFace, onFaceScan: updateFaceScan })) : (_jsxs(_Fragment, { children: [_jsxs("div", { className: "mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-slate-400", children: [_jsx(ShieldCheck, { size: 15 }), " State diagnostics"] }), _jsx("div", { className: "space-y-2 text-sm text-slate-400", children: validation.issues.slice(0, 8).map((issue, index) => _jsx("div", { className: "rounded-lg border border-white/[0.07] bg-white/[0.03] px-3 py-2", children: issue.message }, index)) })] })) }), _jsxs("div", { className: "space-y-4", children: [spatialEnabled ? (_jsx(SpatialEngineBoundary, { children: _jsx(Suspense, { fallback: _jsxs("div", { className: "flex h-[430px] min-h-[360px] flex-col items-center justify-center rounded-2xl border border-white/10 bg-[radial-gradient(circle_at_50%_45%,rgba(34,211,238,.1),transparent_30%),#03060b]", children: [_jsx("div", { className: "h-10 w-10 animate-spin rounded-xl border-2 border-cyan-300/20 border-t-cyan-300" }), _jsx("div", { className: "mt-4 text-xs font-bold uppercase tracking-[0.2em] text-cyan-200", children: "Starting spatial engine" })] }), children: _jsx(CubeViewer, { activeMove: activeMove, moveHistory: moveHistory, facelets: solution?.facelets }) }) })) : (_jsxs("div", { className: "flex h-[430px] min-h-[360px] flex-col items-center justify-center rounded-2xl border border-white/10 bg-[radial-gradient(circle_at_50%_45%,rgba(34,211,238,.08),transparent_30%),#03060b] p-6 text-center", children: [_jsx("div", { className: "flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-300/20 bg-cyan-300/10 text-cyan-300", children: _jsx(Box, { size: 26 }) }), _jsx("div", { className: "mt-4 text-sm font-bold text-white", children: "3D spatial preview is paused" }), _jsx("p", { className: "mt-2 max-w-sm text-xs leading-5 text-slate-500", children: "Start it when needed. Scanning, validation, authentication, and solving remain lightweight until then." }), _jsx(Button, { className: "mt-5", variant: "primary", onClick: () => setSpatialEnabled(true), children: "Start 3D engine" })] })), _jsx(MoveControls, { solution: solution, moveHistory: moveHistory, activeMove: activeMove, onApplyMoves: applyMoves, onUndo: () => {
                                                                    const last = moveHistory.at(-1);
                                                                    if (!last)
                                                                        return;
                                                                    setMoveHistory((current) => current.slice(0, -1));
                                                                    setActiveMove(invertMove(last));
                                                                    window.setTimeout(() => setActiveMove(null), 720);
                                                                }, onReset: () => {
                                                                    setMoveHistory([]);
                                                                    setActiveMove(null);
                                                                } })] })] })] })] }), _jsxs("aside", { className: "space-y-5 xl:sticky xl:top-24 xl:self-start", children: [_jsx(Panel, { title: session ? "Account" : "Guest session", children: session ? (_jsx(AuthPanel, { session: session, onSession: handleSession })) : (_jsxs("div", { className: "space-y-3", children: [_jsx("p", { className: "text-sm leading-6 text-slate-400", children: "You can scan and solve as a guest. Sign in to save scans and view your solve history." }), _jsx(Button, { icon: _jsx(LogIn, { size: 16 }), onClick: () => setHasEnteredApp(false), children: "Sign in or register" })] })) }), _jsx(Panel, { title: "Solve analytics", children: _jsx(HistoryPanel, { session: session }) }), _jsx(Panel, { title: "Global signal", children: _jsx(Leaderboard, {}) })] })] })] })] }));
}
