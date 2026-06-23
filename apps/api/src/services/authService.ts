import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { env } from "../config/env";
import { badRequest, unauthorized } from "../lib/http";
import { prisma } from "../lib/prisma";

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2).max(80)
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

function signToken(user: { id: string; email: string }) {
  return jwt.sign({ email: user.email }, env.JWT_SECRET, {
    subject: user.id,
    expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"]
  });
}

const toAuthUser = (user: { id: string; email: string; name: string }) => ({
  id: user.id,
  email: user.email,
  name: user.name
});

export async function register(input: z.infer<typeof registerSchema>) {
  const email = input.email.toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw badRequest("Email is already registered");

  const user = await prisma.user.create({
    data: {
      email,
      name: input.name,
      passwordHash: await bcrypt.hash(input.password, 12)
    }
  });

  return { user: toAuthUser(user), token: signToken(user) };
}

export async function login(input: z.infer<typeof loginSchema>) {
  const user = await prisma.user.findUnique({ where: { email: input.email.toLowerCase() } });
  if (!user) throw unauthorized("Invalid email or password");

  const ok = await bcrypt.compare(input.password, user.passwordHash);
  if (!ok) throw unauthorized("Invalid email or password");

  return { user: toAuthUser(user), token: signToken(user) };
}
