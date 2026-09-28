import type { CookieOptions, Request, Response } from "express";
import * as authService from "../services/auth.service";
import { sendSuccess } from "../utils/response";

const COOKIE_NAME = "token";

const cookieOptions: CookieOptions = {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
};

export async function signup(req: Request, res: Response) {
  const { email, password } = req.body;
  await authService.signup(email, password);
  sendSuccess(res, 200, "OTP sent to your email");
}

export async function verifySignupOtp(req: Request, res: Response) {
  const { email, otp } = req.body;
  const user = await authService.verifySignupOtp(email, otp);
  sendSuccess(res, 201, "Account created successfully", { user });
}

export async function signin(req: Request, res: Response) {
  const { email, password } = req.body;
  const { token, user } = await authService.signin(email, password);

  res.cookie(COOKIE_NAME, token, { ...cookieOptions, maxAge: 24 * 60 * 60 * 1000 });
  sendSuccess(res, 200, "Signed in successfully", { user });
}

export async function forgotPassword(req: Request, res: Response) {
  await authService.forgotPassword(req.body.email);
  sendSuccess(res, 200, "OTP sent to your email");
}

export async function verifyResetOtp(req: Request, res: Response) {
  const { email, otp } = req.body;
  await authService.verifyResetOtp(email, otp);
  sendSuccess(res, 200, "OTP verified. You can now set a new password.");
}

export async function resetPassword(req: Request, res: Response) {
  const { email, password } = req.body;
  await authService.resetPassword(email, password);
  sendSuccess(res, 200, "Password updated successfully");
}

export async function me(_req: Request, res: Response) {
  const user = await authService.getCurrentUser(res.locals.userId);
  sendSuccess(res, 200, "Authenticated", { user });
}

export function signout(_req: Request, res: Response) {
  res.clearCookie(COOKIE_NAME, cookieOptions);
  sendSuccess(res, 200, "Signed out successfully");
}