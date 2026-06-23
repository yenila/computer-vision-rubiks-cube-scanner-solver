import type { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "../lib/prisma";

export const createSolveSchema = z.object({
  scanId: z.string().optional(),
  solution: z.unknown(),
  durationMs: z.number().int().positive()
});

export async function createSolve(userId: string, input: z.infer<typeof createSolveSchema>) {
  const solve = await prisma.solveHistory.create({
    data: {
      userId,
      scanId: input.scanId,
      solution: input.solution as Prisma.InputJsonValue,
      durationMs: input.durationMs
    }
  });

  const current = await prisma.leaderboardEntry.findUnique({ where: { userId } });
  if (current) {
    await prisma.leaderboardEntry.update({
      where: { userId },
      data: {
        bestTimeMs: Math.min(current.bestTimeMs, input.durationMs),
        solves: { increment: 1 }
      }
    });
  } else {
    await prisma.leaderboardEntry.create({
      data: {
        userId,
        bestTimeMs: input.durationMs,
        solves: 1
      }
    });
  }

  return solve;
}

export async function listSolves(userId: string) {
  return prisma.solveHistory.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 50
  });
}
