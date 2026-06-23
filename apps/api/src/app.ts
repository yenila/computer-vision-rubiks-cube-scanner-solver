import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env";
import { errorHandler } from "./middleware/errorHandler";
import { authRoutes } from "./routes/authRoutes";
import { leaderboardRoutes } from "./routes/leaderboardRoutes";
import { scanRoutes } from "./routes/scanRoutes";
import { solveRoutes } from "./routes/solveRoutes";

export function createApp() {
  const app = express();
  app.use(helmet());
  app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
  app.use(express.json({ limit: "1mb" }));
  app.use(morgan(env.NODE_ENV === "test" ? "tiny" : "combined"));

  app.get("/api/health", (_req, res) => {
    res.json({ ok: true });
  });

  app.use("/api", authRoutes);
  app.use("/api", scanRoutes);
  app.use("/api", solveRoutes);
  app.use("/api", leaderboardRoutes);
  app.use("/api", (_req, res) => {
    res.status(404).json({ error: "Endpoint not found" });
  });
  app.use(errorHandler);

  return app;
}
