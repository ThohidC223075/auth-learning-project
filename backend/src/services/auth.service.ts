import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma";
import { env } from "../config/env";
import { AppError } from "../utils/AppError";
import { issueOtp, verifyOtp } from "./otp.service";

const SALT_ROUNDS = 10;
const RESET_WINDOW_MS = 10 * 60 * 1000;
const publicUser = { id: true, email: true, createdAt: true } as const;

export async function signup(email: string, password: string) {
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new AppError(409, "Email already exists", { email: "Email already exists" });
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  await issueOtp(email, "SIGNUP", passwordHash);
}

export async function verifySignupOtp(email: string, code: string) {
  const otp = await verifyOtp(email, "SIGNUP", code);

  if (!otp.passwordHash) {
    throw new AppError(400, "Invalid sign up request. Please sign up again.");
  }

  const user = await prisma.user.create({
    data: { email, password: otp.passwordHash },
    select: publicUser,
  });

  await prisma.otp.deleteMany({ where: { email, purpose: "SIGNUP" } });
  return user;
}

export async function signin(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new AppError(404, "Account doesn't exist", {
      email: "No account found with this email",
    });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new AppError(401, "Incorrect email or password");
  }

  const token = jwt.sign({ userId: user.id }, env.JWT_SECRET, { expiresIn: "1d" });

  return {
    token,
    user: { id: user.id, email: user.email, createdAt: user.createdAt },
  };
}

export async function forgotPassword(email: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new AppError(404, "Account doesn't exist", {
      email: "No account found with this email",
    });
  }

  await issueOtp(email, "RESET_PASSWORD");
}

export async function verifyResetOtp(email: string, code: string) {
  const otp = await verifyOtp(email, "RESET_PASSWORD", code);

  await prisma.otp.update({
    where: { id: otp.id },
    data: { verified: true, expiresAt: new Date(Date.now() + RESET_WINDOW_MS) },
  });
}

export async function resetPassword(email: string, newPassword: string) {
  const otp = await prisma.otp.findFirst({
    where: { email, purpose: "RESET_PASSWORD", verified: true },
    orderBy: { createdAt: "desc" },
  });

  if (!otp) {
    throw new AppError(403, "Please verify your OTP first.");
  }
  if (otp.expiresAt < new Date()) {
    throw new AppError(400, "Reset session expired. Please request a new OTP.");
  }

  const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);

  await prisma.user.update({
    where: { email },
    data: { password: passwordHash },
  });

  await prisma.otp.deleteMany({ where: { email, purpose: "RESET_PASSWORD" } });
}

export async function getCurrentUser(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: publicUser });
  if (!user) {
    throw new AppError(401, "User not found. Please sign in again.");
  }
  return user;
}