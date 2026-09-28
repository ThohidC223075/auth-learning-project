import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma";
import { AppError } from "../utils/AppError";
import { sendOtpEmail } from "./email.service";
import type { OtpPurpose } from "./email.service";

const OTP_EXPIRY_MS = 3 * 60 * 1000;

function generateOtp(): string {
  return crypto.randomInt(100000, 1000000).toString();
}

export async function issueOtp(email: string, purpose: OtpPurpose, passwordHash?: string) {
  const code = generateOtp();
  const codeHash = await bcrypt.hash(code, 10);

  await prisma.otp.deleteMany({ where: { email, purpose } });
  await prisma.otp.create({
    data: {
      email,
      purpose,
      codeHash,
      passwordHash,
      expiresAt: new Date(Date.now() + OTP_EXPIRY_MS),
    },
  });

  try {
    await sendOtpEmail(email, code, purpose);
  } catch (error) {
    console.error("Failed to send OTP email:", error);
    await prisma.otp.deleteMany({ where: { email, purpose } });
    throw new AppError(502, "Failed to send OTP email. Please try again later.");
  }
}

export async function verifyOtp(email: string, purpose: OtpPurpose, code: string) {
  const otp = await prisma.otp.findFirst({
    where: { email, purpose },
    orderBy: { createdAt: "desc" },
  });

  if (!otp) {
    throw new AppError(400, "No OTP found. Please request a new one.");
  }

  if (otp.expiresAt < new Date()) {
    throw new AppError(400, "OTP has expired. Please request a new one.");
  }

  const isMatch = await bcrypt.compare(code, otp.codeHash);
  if (!isMatch) {
    throw new AppError(400, "Incorrect OTP", { otp: "Incorrect OTP" });
  }

  return otp;
}