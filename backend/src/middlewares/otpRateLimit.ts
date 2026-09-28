import type { NextFunction, Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { AppError } from "../utils/AppError";

const MAX_OTP_REQUESTS = 2;
const BLOCK_DURATION_MS = 10 * 60 * 1000;

export async function otpRateLimit(req: Request, _res: Response, next: NextFunction) {
  const ip = req.ip ?? "unknown";
  const now = new Date();

  const record = await prisma.otpRateLimit.findUnique({ where: { ip } });

  if (record?.blockedUntil && record.blockedUntil > now) {
    const minutesLeft = Math.ceil((record.blockedUntil.getTime() - now.getTime()) / 60000);
    throw new AppError(429, `Too many OTP requests. Try again in ${minutesLeft} minute(s).`);
  }

  const shouldReset =
    !record ||
    (record.blockedUntil !== null && record.blockedUntil <= now) ||
    now.getTime() - record.updatedAt.getTime() > BLOCK_DURATION_MS;

  const currentCount = shouldReset ? 0 : (record?.requestCount ?? 0);

  if (currentCount >= MAX_OTP_REQUESTS) {
    await prisma.otpRateLimit.update({
      where: { ip },
      data: { blockedUntil: new Date(now.getTime() + BLOCK_DURATION_MS) },
    });
    throw new AppError(429, "Too many OTP requests. You are blocked for 10 minutes.");
  }

  await prisma.otpRateLimit.upsert({
    where: { ip },
    create: { ip, requestCount: 1 },
    update: { requestCount: currentCount + 1, blockedUntil: null },
  });

  next();
}