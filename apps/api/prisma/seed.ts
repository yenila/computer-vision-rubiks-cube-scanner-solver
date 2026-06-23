import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { createEmptyScanState, FACE_ORDER, type CubeColor, type CubeFace } from "@rubiks/shared";

const prisma = new PrismaClient();

const faceColors: Record<CubeFace, CubeColor> = {
  U: "white",
  R: "red",
  F: "green",
  D: "yellow",
  L: "orange",
  B: "blue"
};

async function main() {
  const passwordHash = await bcrypt.hash("password123", 12);
  const demo = await prisma.user.upsert({
    where: { email: "demo@rubiks.local" },
    update: {},
    create: {
      email: "demo@rubiks.local",
      name: "Demo Solver",
      passwordHash
    }
  });

  const scan = createEmptyScanState();
  for (const face of FACE_ORDER) {
    scan[face] = {
      face,
      capturedAt: new Date().toISOString(),
      stickers: Array.from({ length: 9 }, () => ({ color: faceColors[face], confidence: 1, source: "manual" as const }))
    };
  }

  await prisma.cubeScan.create({
    data: {
      userId: demo.id,
      name: "Seed solved cube",
      scan,
      status: "SOLVED",
      solution: { moves: [], notation: "", estimatedTurns: 0 }
    }
  });

  await prisma.leaderboardEntry.upsert({
    where: { userId: demo.id },
    update: { bestTimeMs: 18420, solves: 12 },
    create: { userId: demo.id, bestTimeMs: 18420, solves: 12 }
  });
}

main()
  .finally(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
