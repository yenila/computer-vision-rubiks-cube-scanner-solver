import { Router } from "express";
import { asyncHandler } from "../lib/asyncHandler";
import { badRequest } from "../lib/http";
import { requireAuth, type AuthRequest } from "../middleware/auth";
import { createScan, createScanSchema, getScan, listScans } from "../services/scanService";

export const scanRoutes = Router();

scanRoutes.get(
  "/scans",
  requireAuth,
  asyncHandler(async (req: AuthRequest, res) => {
    res.json(await listScans(req.user!.id));
  })
);

scanRoutes.get(
  "/scans/:id",
  requireAuth,
  asyncHandler(async (req: AuthRequest, res) => {
    const scanId = req.params.id;
    if (typeof scanId !== "string") throw badRequest("Scan id is required.");
    res.json(await getScan(req.user!.id, scanId));
  })
);

scanRoutes.post(
  "/scans",
  requireAuth,
  asyncHandler(async (req: AuthRequest, res) => {
    res.status(201).json(await createScan(req.user!.id, createScanSchema.parse(req.body)));
  })
);
