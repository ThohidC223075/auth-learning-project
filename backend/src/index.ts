import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { env } from "./config/env";
import { prisma } from "./lib/prisma";
import { transporter } from "./lib/mailer";
import authRoutes from "./routes/auth.routes";
import { errorHandler, notFound } from "./middlewares/errorHandler";

const app = express();

app.use(cors({ origin: env.CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.get("/api/health", async (_req, res) => {
  const status = { server: "ok", database: "error", smtp: "error" };

  try {
    await prisma.$queryRaw`SELECT 1`;
    status.database = "ok";
  } catch (error) {
    console.error("Database check failed:", error);
  }

  try {
    await transporter.verify();
    status.smtp = "ok";
  } catch (error) {
    console.error("SMTP check failed:", error);
  }

  const allOk = status.database === "ok" && status.smtp === "ok";
  res.status(allOk ? 200 : 503).json(status);
});

app.use("/api/auth", authRoutes);

app.use(notFound);
app.use(errorHandler);

app.listen(env.PORT, () => {
  console.log(`Server running on http://localhost:${env.PORT}`);
});