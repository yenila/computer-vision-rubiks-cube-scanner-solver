import { Router } from "express";
import { asyncHandler } from "../lib/asyncHandler";
import { requireAuth, type AuthRequest } from "../middleware/auth";
import { login, loginSchema, register, registerSchema } from "../services/authService";
import { prisma } from "../lib/prisma";
import { notFound } from "../lib/http";

export const authRoutes = Router();

authRoutes.post(
  "/auth/register",
  asyncHandler(async (req, res) => {
    res.status(201).json(await register(registerSchema.parse(req.body)));
  })
);

authRoutes.post(
  "/auth/login",
  asyncHandler(async (req, res) => {
    res.json(await login(loginSchema.parse(req.body)));
  })
);

authRoutes.get(
  "/me",
  requireAuth,
  asyncHandler(async (req: AuthRequest, res) => {
    const user = await prisma.user.findUnique({ where: { id: req.user!.id }, select: { id: true, email: true, name: true } });
    if (!user) throw notFound("User not found");
    res.json(user);
  })
);
