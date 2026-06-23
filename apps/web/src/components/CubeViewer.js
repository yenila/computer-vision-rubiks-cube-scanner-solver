import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import { invertMove } from "@rubiks/shared";
import { applyMovesToFacelets, faceletColor, SOLVED_FACELETS, stickerIndex } from "../lib/cubeVisualState";
const stickerMaterials = {
    white: "#f8fafc",
    yellow: "#facc15",
    red: "#dc2626",
    orange: "#f97316",
    green: "#16a34a",
    blue: "#2563eb"
};
const layerDetails = {
    U: { axis: "y", coordinate: 1, sign: 1 },
    R: { axis: "x", coordinate: 1, sign: 1 },
    F: { axis: "z", coordinate: 1, sign: 1 },
    D: { axis: "y", coordinate: -1, sign: -1 },
    L: { axis: "x", coordinate: -1, sign: -1 },
    B: { axis: "z", coordinate: -1, sign: -1 }
};
function Sticker({ position, rotation, color }) {
    return (_jsxs("mesh", { position: position, rotation: rotation, children: [_jsx("planeGeometry", { args: [0.78, 0.78] }), _jsx("meshStandardMaterial", { color: stickerMaterials[color], roughness: 0.34, metalness: 0.08 })] }));
}
function Cubie({ x, y, z, facelets }) {
    const stickers = [];
    if (y === 1)
        stickers.push(_jsx(Sticker, { position: [0, 0.511, 0], rotation: [-Math.PI / 2, 0, 0], color: faceletColor(facelets, "U", stickerIndex("U", x, y, z)) }, "U"));
    if (x === 1)
        stickers.push(_jsx(Sticker, { position: [0.511, 0, 0], rotation: [0, Math.PI / 2, 0], color: faceletColor(facelets, "R", stickerIndex("R", x, y, z)) }, "R"));
    if (z === 1)
        stickers.push(_jsx(Sticker, { position: [0, 0, 0.511], rotation: [0, 0, 0], color: faceletColor(facelets, "F", stickerIndex("F", x, y, z)) }, "F"));
    if (y === -1)
        stickers.push(_jsx(Sticker, { position: [0, -0.511, 0], rotation: [Math.PI / 2, 0, 0], color: faceletColor(facelets, "D", stickerIndex("D", x, y, z)) }, "D"));
    if (x === -1)
        stickers.push(_jsx(Sticker, { position: [-0.511, 0, 0], rotation: [0, -Math.PI / 2, 0], color: faceletColor(facelets, "L", stickerIndex("L", x, y, z)) }, "L"));
    if (z === -1)
        stickers.push(_jsx(Sticker, { position: [0, 0, -0.511], rotation: [0, Math.PI, 0], color: faceletColor(facelets, "B", stickerIndex("B", x, y, z)) }, "B"));
    return (_jsxs("group", { position: [x * 1.05, y * 1.05, z * 1.05], children: [_jsxs("mesh", { castShadow: true, receiveShadow: true, children: [_jsx("boxGeometry", { args: [0.96, 0.96, 0.96] }), _jsx("meshStandardMaterial", { color: "#1f2937", metalness: 0.56, roughness: 0.3 })] }), stickers] }));
}
function moveAngle(move) {
    const face = move[0];
    const turns = move.endsWith("2") ? 2 : 1;
    const direction = move.endsWith("'") ? -1 : 1;
    return layerDetails[face].sign * direction * turns * -Math.PI / 2;
}
function AnimatedCube({ activeMove, facelets }) {
    const layerRef = useRef(null);
    const progressRef = useRef(0);
    const cubies = useMemo(() => {
        const result = [];
        for (const x of [-1, 0, 1])
            for (const y of [-1, 0, 1])
                for (const z of [-1, 0, 1])
                    result.push([x, y, z]);
        return result;
    }, []);
    const activeFace = activeMove?.[0];
    const layer = activeFace ? layerDetails[activeFace] : null;
    const isActiveCubie = ([x, y, z]) => {
        if (!layer)
            return false;
        return layer.axis === "x" ? x === layer.coordinate : layer.axis === "y" ? y === layer.coordinate : z === layer.coordinate;
    };
    useEffect(() => {
        progressRef.current = 0;
        layerRef.current?.rotation.set(0, 0, 0);
    }, [activeMove]);
    useFrame((_state, delta) => {
        if (!layerRef.current || !activeMove || !layer)
            return;
        progressRef.current = Math.min(1, progressRef.current + delta / 0.58);
        const eased = 0.5 - Math.cos(progressRef.current * Math.PI) / 2;
        const angle = moveAngle(activeMove) * eased;
        layerRef.current.rotation.set(0, 0, 0);
        layerRef.current.rotation[layer.axis] = angle;
    });
    const stationaryCubies = activeMove ? cubies.filter((cubie) => !isActiveCubie(cubie)) : cubies;
    const movingCubies = activeMove ? cubies.filter(isActiveCubie) : [];
    return (_jsxs("group", { children: [stationaryCubies.map(([x, y, z]) => _jsx(Cubie, { x: x, y: y, z: z, facelets: facelets }, `fixed-${x}${y}${z}`)), _jsx("group", { ref: layerRef, children: movingCubies.map(([x, y, z]) => _jsx(Cubie, { x: x, y: y, z: z, facelets: facelets }, `moving-${x}${y}${z}`)) })] }));
}
export function CubeViewer({ activeMove, moveHistory, facelets }) {
    const baseFacelets = facelets && /^[URFDLB]{54}$/.test(facelets) ? facelets : SOLVED_FACELETS;
    const completedMoves = activeMove
        ? moveHistory.at(-1) === activeMove
            ? moveHistory.slice(0, -1)
            : [...moveHistory, invertMove(activeMove)]
        : moveHistory;
    const visualFacelets = useMemo(() => applyMovesToFacelets(baseFacelets, completedMoves), [baseFacelets, completedMoves]);
    return (_jsxs("div", { className: "relative h-[400px] min-h-[340px] overflow-hidden rounded-lg border border-line bg-slate-100", children: [_jsxs("div", { className: "pointer-events-none absolute left-3 top-3 z-10 rounded-md border border-white/70 bg-white/90 px-2.5 py-2 text-xs font-semibold text-slate-700 shadow-sm", children: [_jsx("div", { className: "mb-1 font-black text-teal-800", children: "View locked" }), _jsx("div", { children: "White: top" }), _jsx("div", { children: "Green: front" }), _jsx("div", { children: "Red: right" })] }), activeMove ? (_jsxs("div", { className: "pointer-events-none absolute right-3 top-3 z-10 rounded-md bg-teal-800 px-3 py-2 text-sm font-black text-white shadow", children: ["Turning ", activeMove] })) : null, _jsxs(Canvas, { shadows: true, children: [_jsx(PerspectiveCamera, { makeDefault: true, position: [5.2, 4.1, 5.6], fov: 40 }), _jsx("ambientLight", { intensity: 0.9 }), _jsx("directionalLight", { position: [3, 6, 4], intensity: 1.8, castShadow: true }), _jsx(AnimatedCube, { activeMove: activeMove, facelets: visualFacelets }), _jsx(OrbitControls, { enablePan: false, enableRotate: false, minDistance: 5, maxDistance: 9, enableDamping: true })] })] }));
}
