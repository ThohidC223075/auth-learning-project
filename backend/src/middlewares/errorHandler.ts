import type { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/AppError";

export function notFound(req: Request, _res: Response, next: NextFunction) {
  next(new AppError(404, `Route not found: ${req.method} ${req.originalUrl}`));
}

function isUniqueConstraintError(err: unknown): boolean {
  return typeof err === "object" && err !== null && "code" in err && err.code === "P2002";
}

function isInvalidJsonError(err: unknown): boolean {
  return err instanceof SyntaxError && "status" in err && err.status === 400;
}

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors: err.errors,
    });
    return;
  }

  if (isInvalidJsonError(err)) {
    res.status(400).json({ success: false, message: "Invalid JSON in request body" });
    return;
  }

  if (isUniqueConstraintError(err)) {
    res.status(409).json({ success: false, message: "Email already exists" });
    return;
  }

  console.error("Unexpected error:", err);
  res.status(500).json({ success: false, message: "Internal server error" });
}