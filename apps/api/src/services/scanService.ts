import type { Prisma } from "@prisma/client";
import { z } from "zod";
import { validateCubeScan, type CubeScanState } from "@rubiks/shared";
import { notFound } from "../lib/http";
import { prisma } from "../lib/prisma";

export const createScanSchema = z.object({
  name: z.string().min(1).max(120),
  scan: z.unknown(),
  solution: z.unknown().optional()
});

export async function createScan(userId: string, input: z.infer<typeof createScanSchema>) {
  const validation = validateCubeScan(input.scan as CubeScanState);
  return prisma.cubeScan.create({
    data: {
      userId,
      name: input.name,
      scan: input.scan as Prisma.InputJsonValue,
      solution: (input.solution ?? undefined) as Prisma.InputJsonValue | undefined,
      status: validation.valid ? (input.solution ? "SOLVED" : "VALID") : "INVALID"
    }
  });
}

export async function listScans(userId: string) {
  return prisma.cubeScan.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 50
  });
}

export async function getScan(userId: string, id: string) {
  const scan = await prisma.cubeScan.findFirst({ where: { id, userId } });
  if (!scan) throw notFound("Scan not found");
  return scan;
}
