import { prisma } from "../lib/prisma";

export async function listLeaderboard() {
  const entries = await prisma.leaderboardEntry.findMany({
    orderBy: [{ bestTimeMs: "asc" }, { updatedAt: "asc" }],
    take: 100,
    include: { user: { select: { name: true } } }
  });

  return entries.map((entry, index) => ({
    id: entry.id,
    rank: index + 1,
    name: entry.user.name,
    bestTimeMs: entry.bestTimeMs,
    solves: entry.solves
  }));
}
