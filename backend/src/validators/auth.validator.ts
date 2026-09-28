import { z } from "zod";

const emailSchema = z
  .string({ error: "Email is required" })
  .trim()
  .toLowerCase()
  .min(1, "Email is required")
  .pipe(z.email("Please enter a valid email"));

const passwordSchema = z
  .string({ error: "Password is required" })
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Za-z]/, "Password must contain both letters and numbers")
  .regex(/\d/, "Password must contain both letters and numbers");

const otpSchema = z
  .string({ error: "OTP is required" })
  .regex(/^\d{6}$/, "OTP must be 6 digits");

const passwordsMatch = (data: { password: string; confirmPassword: string }) =>
  data.password === data.confirmPassword;

export const signupSchema = z
  .object({
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string({ error: "Please confirm your password" }),
  })
  .refine(passwordsMatch, { error: "Passwords do not match", path: ["confirmPassword"] });

export const signinSchema = z.object({
  email: emailSchema,
  password: z.string({ error: "Password is required" }).min(1, "Password is required"),
});

export const emailOnlySchema = z.object({
  email: emailSchema,
});

export const verifyOtpSchema = z.object({
  email: emailSchema,
  otp: otpSchema,
});

export const resetPasswordSchema = z
  .object({
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string({ error: "Please confirm your password" }),
  })
  .refine(passwordsMatch, { error: "Passwords do not match", path: ["confirmPassword"] });