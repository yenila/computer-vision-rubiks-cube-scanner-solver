import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Camera, CheckCircle2, RotateCw, ScanLine, ShieldCheck, VideoOff } from "lucide-react";
import { useCamera } from "../hooks/useCamera";
import { detectFace } from "../lib/opencvDetector";
import { buildCalibratedPalette, GUIDED_SCAN_STEPS, getGuidedScanStep } from "../lib/scanGuide";
import { Button } from "./Button";
import { FaceGridEditor } from "./FaceGridEditor";
import { useState } from "react";
const colorClass = {
    white: "bg-white",
    red: "bg-red-600",
    green: "bg-green-600",
    yellow: "bg-yellow-400",
    orange: "bg-orange-500",
    blue: "bg-blue-600"
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
        ? "Rear camera - not mirrored"
        : camera.facingMode === "user"
            ? "Front camera - capture not mirrored"
            : "Camera capture - not mirrored";
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
    return (_jsxs("div", { className: "grid gap-4 xl:grid-cols-[1.35fr_.65fr]", children: [_jsxs("div", { className: "space-y-3", children: [_jsx("div", { className: "rounded-lg border border-teal-200 bg-teal-50 p-3", children: _jsxs("div", { className: "flex items-start gap-3", children: [_jsx("div", { className: `mt-0.5 h-9 w-9 shrink-0 rounded-md border-2 border-white shadow-sm ${colorClass[activeStep.centerColor]}` }), _jsxs("div", { className: "min-w-0 flex-1", children: [_jsxs("div", { className: "flex flex-wrap items-center justify-between gap-2", children: [_jsxs("div", { className: "text-sm font-black text-teal-950", children: ["Step ", activeStepIndex + 1, " of ", GUIDED_SCAN_STEPS.length, ": ", activeStep.title] }), _jsxs("div", { className: "text-xs font-semibold text-teal-800", children: [completedCount, "/", GUIDED_SCAN_STEPS.length, " captured"] })] }), _jsx("p", { className: "mt-1 text-sm text-teal-950", children: activeStep.instruction }), _jsxs("div", { className: "mt-2 flex items-center gap-1.5 text-xs text-teal-800", children: [_jsx(RotateCw, { size: 14, "aria-hidden": "true" }), activeStep.orientationHint] })] })] }) }), _jsxs("div", { className: "relative overflow-hidden rounded-lg border border-line bg-slate-950", children: [_jsx("video", { ref: camera.videoRef, className: "aspect-video w-full object-contain", style: { transform: "scaleX(1)" }, muted: true, playsInline: true }), _jsx("div", { className: "pointer-events-none absolute inset-0 flex items-center justify-center", children: _jsxs("div", { className: "camera-mask relative grid aspect-square h-[62%] grid-cols-3 grid-rows-3 gap-0.5 rounded-md border", children: [_jsxs("div", { className: "absolute -top-8 left-1/2 flex -translate-x-1/2 items-center gap-1.5 whitespace-nowrap rounded bg-slate-950/85 px-2 py-1 text-[11px] font-black uppercase text-white", children: [_jsx("span", { className: `h-3 w-3 rounded-full border border-white/70 ${colorClass[activeStep.topEdgeColor]}` }), activeStep.topEdgeColor, " edge on top"] }), Array.from({ length: 9 }).map((_, index) => (_jsx("div", { className: "border border-white/50" }, index)))] }) }), _jsxs("div", { className: "absolute left-2 top-2 flex items-center gap-1 rounded bg-slate-950/80 px-2 py-1 text-[11px] font-semibold text-white", children: [_jsx(ShieldCheck, { size: 13, "aria-hidden": "true" }), cameraOrientationLabel] })] }), _jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [camera.permission === "granted" ? (_jsx(Button, { icon: _jsx(VideoOff, { size: 16 }), onClick: camera.stop, children: "Stop" })) : (_jsx(Button, { icon: _jsx(Camera, { size: 16 }), variant: "primary", onClick: camera.start, disabled: camera.permission === "requesting", children: "Enable camera" })), _jsx(Button, { icon: _jsx(ScanLine, { size: 16 }), variant: "primary", onClick: capture, disabled: camera.permission !== "granted" || detecting, children: detecting ? "Checking center" : `Scan ${activeStep.centerColor} center` }), pendingScan ? (_jsxs(Button, { variant: "primary", onClick: () => {
                                    const stickers = pendingScan.faceScan.stickers.map((sticker, index) => index === 4
                                        ? { ...sticker, color: activeStep.centerColor, confidence: 1, source: "manual" }
                                        : sticker);
                                    acceptFace({ ...pendingScan.faceScan, stickers });
                                }, children: ["Confirm ", activeStep.centerColor, " center"] })) : null, _jsx("span", { className: `text-sm ${pendingScan ? "font-semibold text-amber-700" : "text-slate-600"}`, children: camera.error ?? status })] }), _jsx("div", { className: "grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6", children: GUIDED_SCAN_STEPS.map((step, index) => (_jsxs("button", { type: "button", className: `flex h-11 min-w-0 items-center justify-center gap-1.5 rounded-md border px-2 text-xs font-bold capitalize ${activeFace === step.face ? "border-teal-700 bg-teal-50 text-teal-900" : "border-line bg-white text-slate-700"}`, onClick: () => {
                                onActiveFace(step.face);
                                setPendingScan(null);
                                setStatus(step.instruction);
                            }, "aria-label": `Step ${index + 1}: scan ${step.centerColor} center`, children: [scan[step.face] ? _jsx(CheckCircle2, { size: 15, className: "shrink-0 text-teal-700" }) : _jsx("span", { className: `h-3.5 w-3.5 shrink-0 rounded-full border border-slate-300 ${colorClass[step.centerColor]}` }), _jsx("span", { className: "truncate", children: step.centerColor })] }, step.face))) })] }), _jsx(FaceGridEditor, { faceScan: scan[activeFace], onChange: onFaceScan })] }));
}
