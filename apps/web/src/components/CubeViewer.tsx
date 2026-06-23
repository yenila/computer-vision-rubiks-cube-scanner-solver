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
      <meshStandardMaterial color={stickerMaterials[color]} roughness={0.34} metalness={0.08} />
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
        <meshStandardMaterial color="#1f2937" metalness={0.56} roughness={0.3} />
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
  const completedMoves = activeMove
    ? moveHistory.at(-1) === activeMove
      ? moveHistory.slice(0, -1)
      : [...moveHistory, invertMove(activeMove)]
    : moveHistory;
  const visualFacelets = useMemo(() => applyMovesToFacelets(baseFacelets, completedMoves), [baseFacelets, completedMoves]);

  return (
    <div className="relative h-[400px] min-h-[340px] overflow-hidden rounded-lg border border-line bg-slate-100">
      <div className="pointer-events-none absolute left-3 top-3 z-10 rounded-md border border-white/70 bg-white/90 px-2.5 py-2 text-xs font-semibold text-slate-700 shadow-sm">
        <div className="mb-1 font-black text-teal-800">View locked</div>
        <div>White: top</div>
        <div>Green: front</div>
        <div>Red: right</div>
      </div>
      {activeMove ? (
        <div className="pointer-events-none absolute right-3 top-3 z-10 rounded-md bg-teal-800 px-3 py-2 text-sm font-black text-white shadow">
          Turning {activeMove}
        </div>
      ) : null}
      <Canvas shadows>
        <PerspectiveCamera makeDefault position={[5.2, 4.1, 5.6]} fov={40} />
        <ambientLight intensity={0.9} />
        <directionalLight position={[3, 6, 4]} intensity={1.8} castShadow />
        <AnimatedCube activeMove={activeMove} facelets={visualFacelets} />
        <OrbitControls enablePan={false} enableRotate={false} minDistance={5} maxDistance={9} enableDamping />
      </Canvas>
    </div>
  );
}
