import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { AppError } from "../utils/AppError";

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token: string | undefined = req.cookies?.token;

  if (!token) {
    throw new AppError(401, "Not authenticated. Please sign in.");
  }

  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as { userId: string };
    res.locals.userId = payload.userId;
  } catch {
    throw new AppError(401, "Session expired. Please sign in again.");
  }

  next();
}