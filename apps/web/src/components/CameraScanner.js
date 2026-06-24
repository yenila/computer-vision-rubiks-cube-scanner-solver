import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Camera, CheckCircle2, CircleAlert, RotateCw, ScanLine, ShieldCheck, VideoOff } from "lucide-react";
import { useState } from "react";
import { useCamera } from "../hooks/useCamera";
import { detectFace } from "../lib/opencvDetector";
import { buildCalibratedPalette, GUIDED_SCAN_STEPS, getGuidedScanStep } from "../lib/scanGuide";
import { Button } from "./Button";
import { FaceGridEditor } from "./FaceGridEditor";
const colorClass = {
    white: "bg-white shadow-[0_0_14px_rgba(255,255,255,.35)]",
    red: "bg-red-500 shadow-[0_0_14px_rgba(239,68,68,.35)]",
    green: "bg-emerald-400 shadow-[0_0_14px_rgba(52,211,153,.35)]",
    yellow: "bg-yellow-300 shadow-[0_0_14px_rgba(253,224,71,.35)]",
    orange: "bg-orange-400 shadow-[0_0_14px_rgba(251,146,60,.35)]",
    blue: "bg-blue-500 shadow-[0_0_14px_rgba(59,130,246,.35)]"
};
export function CameraScanner({ scan, activeFace, onActiveFace, onFaceScan }) {
    const camera = useCamera();
    const [detecting, setDetecting] = useState(false);
    const [status, setStatus] = useState("Align all nine stickers inside the guide.");
    const [pendingScan, setPendingScan] = useState(null);
    const activeStep = getGuidedScanStep(activeFace);
    const activeStepIndex = GUIDED_SCAN_STEPS.findIndex((step) => step.face === activeFace);
    const completedCount = GUIDED_SCAN_STEPS.filter((step) => Boolean(scan[step.face])).length;
    const cameraOrientationLabel = camera.facingMode === "environment"
        ? "Rear camera · unmirrored"
        : camera.facingMode === "user"
            ? "Front camera · unmirrored"
            : "Camera capture · unmirrored";
    const acceptFace = (faceScan) => {
        onFaceScan(faceScan);
        setPendingScan(null);
        const nextStep = GUIDED_SCAN_STEPS[activeStepIndex + 1];
        if (nextStep) {
            setStatus(`${activeStep.title} captured. Next: ${nextStep.instruction}`);
            onActiveFace(nextStep.face);
        }
        else {
            setStatus("All six faces are captured. Review the cube net below before generating the solution.");
        }
    };
    const capture = async () => {
        if (!camera.videoRef.current)
            return;
        setDetecting(true);
        setPendingScan(null);
        try {
            const result = await detectFace(camera.videoRef.current, activeFace, {
                palette: buildCalibratedPalette(scan),
                expectedCenter: activeStep.centerColor
            });
            if (result.debug.detectedCenter !== activeStep.centerColor) {
                setPendingScan({ faceScan: result.faceScan, detectedCenter: result.debug.detectedCenter });
                setStatus(`The camera reads ${result.debug.detectedCenter}, but this step expects ${activeStep.centerColor}. If the physical center is ${activeStep.centerColor}, confirm it below.`);
                return;
            }
            acceptFace(result.faceScan);
        }
        catch (error) {
            setStatus(error instanceof Error ? error.message : "Detection failed.");
        }
        finally {
            setDetecting(false);
        }
    };
    return (_jsxs("div", { className: "space-y-5", children: [_jsxs("div", { className: "grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]", children: [_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "relative overflow-hidden rounded-2xl border border-cyan-300/20 bg-gradient-to-r from-cyan-400/[0.08] via-slate-950/60 to-violet-500/[0.07] p-4", children: [_jsx("div", { className: "absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-cyan-300 to-violet-500" }), _jsxs("div", { className: "flex items-start gap-4", children: [_jsx("div", { className: `mt-0.5 h-11 w-11 shrink-0 rounded-xl border-4 border-slate-900 ${colorClass[activeStep.centerColor]}` }), _jsxs("div", { className: "min-w-0 flex-1", children: [_jsxs("div", { className: "flex flex-wrap items-center justify-between gap-2", children: [_jsxs("div", { className: "text-sm font-black text-white", children: ["Step ", activeStepIndex + 1, " / ", GUIDED_SCAN_STEPS.length, " \u00B7 ", activeStep.title] }), _jsxs("div", { className: "rounded-full border border-emerald-300/20 bg-emerald-400/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-300", children: [completedCount, " captured"] })] }), _jsx("p", { className: "mt-1.5 text-sm leading-6 text-slate-300", children: activeStep.instruction }), _jsxs("div", { className: "mt-2 flex items-center gap-1.5 text-xs text-cyan-200/80", children: [_jsx(RotateCw, { size: 14 }), activeStep.orientationHint] })] })] })] }), _jsxs("div", { className: "group relative overflow-hidden rounded-2xl border border-white/10 bg-[#02050a] shadow-[0_0_60px_rgba(34,211,238,.06)]", children: [_jsx("div", { className: "pointer-events-none absolute inset-x-0 top-0 z-10 h-px bg-gradient-to-r from-transparent via-cyan-300/60 to-transparent" }), _jsx("video", { ref: camera.videoRef, className: "aspect-video w-full object-contain", style: { transform: "scaleX(1)" }, muted: true, playsInline: true }), camera.permission !== "granted" ? (_jsxs("div", { className: "absolute inset-0 flex flex-col items-center justify-center bg-slate-950/70 backdrop-blur-sm", children: [_jsx("div", { className: "flex h-16 w-16 items-center justify-center rounded-2xl border border-cyan-300/20 bg-cyan-300/10 text-cyan-300", children: _jsx(Camera, { size: 28 }) }), _jsx("div", { className: "mt-4 text-sm font-semibold text-white", children: "Vision sensor offline" }), _jsx("div", { className: "mt-1 text-xs text-slate-500", children: "Enable camera access to begin capture" })] })) : null, _jsx("div", { className: "pointer-events-none absolute inset-0 flex items-center justify-center", children: _jsxs("div", { className: "camera-mask relative grid aspect-square h-[62%] grid-cols-3 grid-rows-3 gap-0.5 rounded-xl border", children: [_jsxs("div", { className: "absolute -top-9 left-1/2 flex -translate-x-1/2 items-center gap-1.5 whitespace-nowrap rounded-full border border-white/10 bg-slate-950/90 px-3 py-1.5 text-[10px] font-black uppercase tracking-wide text-white backdrop-blur", children: [_jsx("span", { className: `h-3 w-3 rounded-full border border-white/70 ${colorClass[activeStep.topEdgeColor]}` }), activeStep.topEdgeColor, " edge on top"] }), Array.from({ length: 9 }).map((_, index) => _jsx("div", { className: "border border-white/40" }, index))] }) }), _jsxs("div", { className: "absolute left-3 top-3 flex items-center gap-1.5 rounded-full border border-white/10 bg-slate-950/80 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-300 backdrop-blur", children: [_jsx(ShieldCheck, { size: 13, className: "text-emerald-300" }), cameraOrientationLabel] }), _jsxs("div", { className: "absolute bottom-3 right-3 flex items-center gap-2 rounded-full border border-white/10 bg-slate-950/80 px-3 py-1.5 text-[10px] font-semibold text-slate-400 backdrop-blur", children: [_jsx("span", { className: `h-1.5 w-1.5 rounded-full ${camera.permission === "granted" ? "animate-pulse bg-emerald-400" : "bg-slate-600"}` }), camera.permission === "granted" ? "LIVE" : "STANDBY"] })] }), _jsxs("div", { className: "rounded-2xl border border-white/10 bg-white/[0.03] p-3", children: [_jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [camera.permission === "granted" ? (_jsx(Button, { icon: _jsx(VideoOff, { size: 16 }), onClick: camera.stop, children: "Stop camera" })) : (_jsx(Button, { icon: _jsx(Camera, { size: 16 }), variant: "primary", onClick: camera.start, disabled: camera.permission === "requesting", children: "Enable camera" })), _jsx(Button, { icon: _jsx(ScanLine, { size: 16 }), variant: "primary", onClick: capture, disabled: camera.permission !== "granted" || detecting, children: detecting ? "Capturing…" : `Scan ${activeStep.centerColor} face` }), pendingScan ? (_jsxs(Button, { variant: "secondary", onClick: () => {
                                                    const stickers = pendingScan.faceScan.stickers.map((sticker, index) => index === 4
                                                        ? { ...sticker, color: activeStep.centerColor, confidence: 1, source: "manual" }
                                                        : sticker);
                                                    acceptFace({ ...pendingScan.faceScan, stickers });
                                                }, children: ["Confirm ", activeStep.centerColor, " center"] })) : null] }), _jsxs("div", { className: `mt-3 flex items-start gap-2 text-xs leading-5 ${pendingScan || camera.error ? "text-amber-200" : "text-slate-500"}`, children: [pendingScan || camera.error ? _jsx(CircleAlert, { className: "mt-0.5 shrink-0", size: 14 }) : _jsx("span", { className: "mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-300" }), _jsx("span", { children: camera.error ?? status })] })] })] }), _jsxs("div", { className: "rounded-2xl border border-white/10 bg-black/20 p-4", children: [_jsxs("div", { className: "mb-4", children: [_jsx("div", { className: "text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-300", children: "Manual calibration" }), _jsx("div", { className: "mt-1 text-sm text-slate-400", children: "Fine-tune detected stickers before validation." })] }), _jsx(FaceGridEditor, { faceScan: scan[activeFace], onChange: onFaceScan })] })] }), _jsx("div", { className: "grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6", children: GUIDED_SCAN_STEPS.map((step, index) => {
                    const complete = Boolean(scan[step.face]);
                    const active = activeFace === step.face;
                    return (_jsxs("button", { type: "button", className: `group relative flex min-h-14 min-w-0 items-center gap-3 overflow-hidden rounded-xl border px-3 text-left transition ${active ? "border-cyan-300/40 bg-cyan-300/10 shadow-[0_0_20px_rgba(34,211,238,.08)]" : "border-white/10 bg-white/[0.025] hover:border-white/20 hover:bg-white/[0.05]"}`, onClick: () => {
                            onActiveFace(step.face);
                            setPendingScan(null);
                            setStatus(step.instruction);
                        }, "aria-label": `Step ${index + 1}: scan ${step.centerColor} center`, children: [_jsxs("div", { className: "text-[10px] font-black text-slate-600", children: ["0", index + 1] }), complete ? _jsx(CheckCircle2, { size: 17, className: "shrink-0 text-emerald-300" }) : _jsx("span", { className: `h-4 w-4 shrink-0 rounded-full border-2 border-slate-900 ${colorClass[step.centerColor]}` }), _jsxs("div", { className: "min-w-0", children: [_jsx("div", { className: `truncate text-xs font-bold capitalize ${active ? "text-cyan-100" : "text-slate-300"}`, children: step.centerColor }), _jsx("div", { className: "truncate text-[9px] uppercase tracking-wider text-slate-600", children: complete ? "Captured" : "Pending" })] })] }, step.face));
                }) })] }));
}
