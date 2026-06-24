import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { invertMove, type CubeColor, type CubeFace, type MoveToken } from "@rubiks/shared";
import { applyMovesToFacelets, faceletColor, SOLVED_FACELETS, stickerIndex } from "../lib/cubeVisualState";

const stickerMaterials: Record<CubeColor, string> = {
  white: "#f8fafc",
  yellow: "#facc15",
  red: "#dc2626",
  orange: "#f97316",
  green: "#16a34a",
  blue: "#2563eb"
};

const layerDetails: Record<CubeFace, { axis: "x" | "y" | "z"; coordinate: number; sign: number }> = {
  U: { axis: "y", coordinate: 1, sign: 1 },
  R: { axis: "x", coordinate: 1, sign: 1 },
  F: { axis: "z", coordinate: 1, sign: 1 },
  D: { axis: "y", coordinate: -1, sign: -1 },
  L: { axis: "x", coordinate: -1, sign: -1 },
  B: { axis: "z", coordinate: -1, sign: -1 }
};

function Sticker({ position, rotation, color }: { position: [number, number, number]; rotation: [number, number, number]; color: CubeColor }) {
  return (
    <mesh position={position} rotation={rotation}>
      <planeGeometry args={[0.78, 0.78]} />
      <meshStandardMaterial color={stickerMaterials[color]} emissive={stickerMaterials[color]} emissiveIntensity={0.04} roughness={0.28} metalness={0.14} />
    </mesh>
  );
}

function Cubie({ x, y, z, facelets }: { x: number; y: number; z: number; facelets: string }) {
  const stickers = [];
  if (y === 1) stickers.push(<Sticker key="U" position={[0, 0.511, 0]} rotation={[-Math.PI / 2, 0, 0]} color={faceletColor(facelets, "U", stickerIndex("U", x, y, z))} />);
  if (x === 1) stickers.push(<Sticker key="R" position={[0.511, 0, 0]} rotation={[0, Math.PI / 2, 0]} color={faceletColor(facelets, "R", stickerIndex("R", x, y, z))} />);
  if (z === 1) stickers.push(<Sticker key="F" position={[0, 0, 0.511]} rotation={[0, 0, 0]} color={faceletColor(facelets, "F", stickerIndex("F", x, y, z))} />);
  if (y === -1) stickers.push(<Sticker key="D" position={[0, -0.511, 0]} rotation={[Math.PI / 2, 0, 0]} color={faceletColor(facelets, "D", stickerIndex("D", x, y, z))} />);
  if (x === -1) stickers.push(<Sticker key="L" position={[-0.511, 0, 0]} rotation={[0, -Math.PI / 2, 0]} color={faceletColor(facelets, "L", stickerIndex("L", x, y, z))} />);
  if (z === -1) stickers.push(<Sticker key="B" position={[0, 0, -0.511]} rotation={[0, Math.PI, 0]} color={faceletColor(facelets, "B", stickerIndex("B", x, y, z))} />);

  return (
    <group position={[x * 1.05, y * 1.05, z * 1.05]}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[0.96, 0.96, 0.96]} />
        <meshStandardMaterial color="#7f8a9b" metalness={0.92} roughness={0.22} />
      </mesh>
      {stickers}
    </group>
  );
}

function moveAngle(move: MoveToken): number {
  const face = move[0] as CubeFace;
  const turns = move.endsWith("2") ? 2 : 1;
  const direction = move.endsWith("'") ? -1 : 1;
  return layerDetails[face].sign * direction * turns * -Math.PI / 2;
}

function AnimatedCube({ activeMove, facelets }: { activeMove: MoveToken | null; facelets: string }) {
  const layerRef = useRef<THREE.Group>(null);
  const progressRef = useRef(0);
  const cubies = useMemo(() => {
    const result: Array<[number, number, number]> = [];
    for (const x of [-1, 0, 1]) for (const y of [-1, 0, 1]) for (const z of [-1, 0, 1]) result.push([x, y, z]);
    return result;
  }, []);
  const activeFace = activeMove?.[0] as CubeFace | undefined;
  const layer = activeFace ? layerDetails[activeFace] : null;
  const isActiveCubie = ([x, y, z]: [number, number, number]) => {
    if (!layer) return false;
    return layer.axis === "x" ? x === layer.coordinate : layer.axis === "y" ? y === layer.coordinate : z === layer.coordinate;
  };

  useEffect(() => {
    progressRef.current = 0;
    layerRef.current?.rotation.set(0, 0, 0);
  }, [activeMove]);

  useFrame((_state, delta) => {
    if (!layerRef.current || !activeMove || !layer) return;
    progressRef.current = Math.min(1, progressRef.current + delta / 0.58);
    const eased = 0.5 - Math.cos(progressRef.current * Math.PI) / 2;
    const angle = moveAngle(activeMove) * eased;
    layerRef.current.rotation.set(0, 0, 0);
    layerRef.current.rotation[layer.axis] = angle;
  });

  const stationaryCubies = activeMove ? cubies.filter((cubie) => !isActiveCubie(cubie)) : cubies;
  const movingCubies = activeMove ? cubies.filter(isActiveCubie) : [];

  return (
    <group>
      {stationaryCubies.map(([x, y, z]) => <Cubie key={`fixed-${x}${y}${z}`} x={x} y={y} z={z} facelets={facelets} />)}
      <group ref={layerRef}>
        {movingCubies.map(([x, y, z]) => <Cubie key={`moving-${x}${y}${z}`} x={x} y={y} z={z} facelets={facelets} />)}
      </group>
    </group>
  );
}

export function CubeViewer({ activeMove, moveHistory, facelets }: { activeMove: MoveToken | null; moveHistory: MoveToken[]; facelets?: string | null }) {
  const baseFacelets = facelets && /^[URFDLB]{54}$/.test(facelets) ? facelets : SOLVED_FACELETS;
  const visualFacelets = useMemo(() => {
    const completedMoves = activeMove
      ? moveHistory.at(-1) === activeMove
        ? moveHistory.slice(0, -1)
        : [...moveHistory, invertMove(activeMove)]
      : moveHistory;
    return applyMovesToFacelets(baseFacelets, completedMoves);
  }, [activeMove, baseFacelets, moveHistory]);

  return (
    <div className="relative h-[430px] min-h-[360px] overflow-hidden rounded-2xl border border-white/10 bg-[radial-gradient(circle_at_50%_42%,rgba(34,211,238,.12),transparent_32%),linear-gradient(180deg,#070b13,#020409)] shadow-[inset_0_1px_0_rgba(255,255,255,.06),0_24px_60px_rgba(0,0,0,.35)]">
      <div className="pointer-events-none absolute inset-x-12 top-0 z-10 h-px bg-gradient-to-r from-transparent via-cyan-300/50 to-transparent" />
      <div className="pointer-events-none absolute left-4 top-4 z-10 rounded-xl border border-white/10 bg-slate-950/70 px-3 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400 shadow-lg backdrop-blur-xl">
        <div className="mb-1.5 flex items-center gap-1.5 font-black text-cyan-300"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-300" /> Spatial frame locked</div>
        <div>White / zenith</div>
        <div>Green / forward</div>
        <div>Red / right</div>
      </div>
      {activeMove ? (
        <div className="pointer-events-none absolute right-4 top-4 z-10 rounded-xl border border-cyan-300/30 bg-cyan-300/15 px-4 py-2.5 text-sm font-black text-cyan-100 shadow-[0_0_28px_rgba(34,211,238,.2)] backdrop-blur-xl">
          Executing {activeMove}
        </div>
      ) : null}
      <div className="pointer-events-none absolute bottom-4 left-4 z-10 flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.2em] text-slate-600"><span className="h-px w-8 bg-slate-700" /> Digital twin viewport</div>
      <Canvas
        dpr={[1, 1.35]}
        frameloop={activeMove ? "always" : "demand"}
        gl={{ antialias: true, powerPreference: "high-performance" }}
        shadows
        fallback={<div className="flex h-full items-center justify-center text-sm text-slate-500">WebGL is unavailable. The solver remains fully usable.</div>}
      >
        <PerspectiveCamera makeDefault position={[5.2, 4.1, 5.6]} fov={40} />
        <ambientLight intensity={0.62} />
        <directionalLight position={[3, 6, 4]} intensity={2.8} color="#dff9ff" castShadow />
        <pointLight position={[-5, 1, 3]} intensity={18} distance={12} color="#22d3ee" />
        <pointLight position={[4, -1, -3]} intensity={14} distance={12} color="#8b5cf6" />
        <AnimatedCube activeMove={activeMove} facelets={visualFacelets} />
        <mesh position={[0, -2.08, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[9, 9]} />
          <shadowMaterial transparent opacity={0.28} />
        </mesh>
        <OrbitControls enablePan={false} enableRotate={false} minDistance={5} maxDistance={9} enableDamping />
      </Canvas>
    </div>
  );
}
