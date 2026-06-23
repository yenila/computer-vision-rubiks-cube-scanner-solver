import { Router } from "express";
import { z } from "zod";
import { asyncHandler } from "../lib/asyncHandler";
import { requireAuth, type AuthRequest } from "../middleware/auth";
import { createSolve, createSolveSchema, listSolves } from "../services/solveHistoryService";
import { solveFacelets } from "../services/solverService";

export const solveRoutes = Router();

solveRoutes.post(
  "/solver",
  asyncHandler(async (req, res) => {
    const input = z.object({ facelets: z.string().length(54) }).parse(req.body);
    res.json(await solveFacelets(input.facelets));
  })
);

solveRoutes.get(
  "/solves",
  requireAuth,
  asyncHandler(async (req: AuthRequest, res) => {
    res.json(await listSolves(req.user!.id));
  })
);

solveRoutes.post(
  "/solves",
  requireAuth,
  asyncHandler(async (req: AuthRequest, res) => {
    res.status(201).json(await createSolve(req.user!.id, createSolveSchema.parse(req.body)));
  })
);
