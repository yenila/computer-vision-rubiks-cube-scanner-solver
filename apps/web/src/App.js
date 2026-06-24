import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { LogIn, Save, ShieldCheck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { createEmptyScanState, invertMove, scanToFaceletString, validateCubeScan } from "@rubiks/shared";
import { api } from "./lib/api";
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
    const [hasEnteredApp, setHasEnteredApp] = useState(() => Boolean(session));
    const [solution, setSolution] = useState(null);
    const [moveHistory, setMoveHistory] = useState([]);
    const [activeMove, setActiveMove] = useState(null);
    const [message, setMessage] = useState(null);
    const [isSolving, setIsSolving] = useState(false);
    const [solveStatus, setSolveStatus] = useState("unchecked");
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
    return (_jsxs("main", { className: "min-h-screen bg-[#eef2f6]", children: [_jsx("header", { className: "border-b border-line bg-white", children: _jsxs("div", { className: "mx-auto flex max-w-[1500px] flex-col gap-3 px-4 py-4 md:flex-row md:items-center md:justify-between", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-black tracking-normal text-ink", children: "Computer Vision Rubik\u2019s Cube Scanner and Solver" }), _jsx("p", { className: "text-sm text-slate-600", children: "Scan, correct, solve, replay, and track cube solves." })] }), _jsxs("div", { className: "flex items-center gap-2 rounded-md border border-line bg-slate-50 px-3 py-2 text-sm", children: [_jsx(ShieldCheck, { size: 17, className: statusColor }), statusLabel] })] }) }), _jsxs("div", { className: "mx-auto grid max-w-[1500px] gap-4 px-4 py-4 xl:grid-cols-[1fr_420px]", children: [_jsxs("div", { className: "space-y-4", children: [_jsx(Panel, { title: "Guided scan", children: _jsx(CameraScanner, { scan: scan, activeFace: activeFace, onActiveFace: setActiveFace, onFaceScan: updateFaceScan }) }), _jsxs(Panel, { title: "Validation and solving", actions: _jsxs("div", { className: "flex gap-2", children: [_jsx(Button, { icon: _jsx(Save, { size: 16 }), onClick: saveScan, children: "Save" }), _jsx(Button, { variant: "primary", onClick: solve, disabled: !validation.valid || isSolving, children: isSolving ? "Generating" : "Generate solution" })] }), children: [message ? _jsx("div", { className: "mb-3 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800", children: message }) : null, _jsxs("div", { className: "grid gap-3 md:grid-cols-2", children: [_jsx("div", { className: "rounded-md border border-line bg-slate-50 p-3", children: validation.valid ? (_jsx(ScanReview, { scan: scan, activeFace: activeFace, onActiveFace: setActiveFace, onFaceScan: updateFaceScan })) : (_jsxs(_Fragment, { children: [_jsx("div", { className: "mb-2 text-xs font-bold uppercase tracking-wide text-slate-500", children: "Basic scan checks" }), _jsx("div", { className: "space-y-1 text-sm text-slate-700", children: validation.issues.slice(0, 8).map((issue, index) => _jsx("div", { children: issue.message }, index)) })] })) }), _jsxs("div", { className: "space-y-3", children: [_jsx(CubeViewer, { activeMove: activeMove, moveHistory: moveHistory, facelets: solution?.facelets }), _jsx(MoveControls, { solution: solution, moveHistory: moveHistory, activeMove: activeMove, onApplyMoves: applyMoves, onUndo: () => {
                                                            const last = moveHistory.at(-1);
                                                            if (!last)
                                                                return;
                                                            setMoveHistory((current) => current.slice(0, -1));
                                                            setActiveMove(invertMove(last));
                                                            window.setTimeout(() => setActiveMove(null), 720);
                                                        }, onReset: () => {
                                                            setMoveHistory([]);
                                                            setActiveMove(null);
                                                        } })] })] })] })] }), _jsxs("aside", { className: "space-y-4", children: [_jsx(Panel, { title: session ? "Account" : "Guest session", children: session ? (_jsx(AuthPanel, { session: session, onSession: handleSession })) : (_jsxs("div", { className: "space-y-3", children: [_jsx("p", { className: "text-sm leading-6 text-slate-600", children: "You can scan and solve as a guest. Sign in to save scans and view your solve history." }), _jsx(Button, { icon: _jsx(LogIn, { size: 16 }), onClick: () => setHasEnteredApp(false), children: "Sign in or register" })] })) }), _jsx(Panel, { title: "History", children: _jsx(HistoryPanel, { session: session }) }), _jsx(Panel, { title: "Global leaderboard", children: _jsx(Leaderboard, {}) })] })] })] }));
}
