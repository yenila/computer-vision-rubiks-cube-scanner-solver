import { Router } from "express";
import { asyncHandler } from "../lib/asyncHandler";
import { requireAuth, type AuthRequest } from "../middleware/auth";
import { createSolve, createSolveSchema } from "../services/solveHistoryService";
import { listLeaderboard } from "../services/leaderboardService";

export const leaderboardRoutes = Router();

leaderboardRoutes.get(
  "/leaderboard",
  asyncHandler(async (_req, res) => {
    res.json(await listLeaderboard());
  })
);

leaderboardRoutes.post(
  "/leaderboard",
  requireAuth,
  asyncHandler(async (req: AuthRequest, res) => {
    const solve = await createSolve(req.user!.id, createSolveSchema.parse(req.body));
    res.status(201).json(solve);
  })
);
