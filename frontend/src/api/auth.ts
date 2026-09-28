import { apiRequest } from "./client";

export type User = {
  id: string;
  email: string;
  createdAt: string;
};

export const authApi = {
  signup: (email: string, password: string, confirmPassword: string) =>
    apiRequest("/auth/signup", {
      method: "POST",
      body: { email, password, confirmPassword },
    }),

  verifySignupOtp: (email: string, otp: string) =>
    apiRequest("/auth/verify-signup-otp", {
      method: "POST",
      body: { email, otp },
    }),

  signin: (email: string, password: string) =>
    apiRequest<{ user: User }>("/auth/signin", {
      method: "POST",
      body: { email, password },
    }),

  forgotPassword: (email: string) =>
    apiRequest("/auth/forgot-password", {
      method: "POST",
      body: { email },
    }),

  verifyResetOtp: (email: string, otp: string) =>
    apiRequest("/auth/verify-reset-otp", {
      method: "POST",
      body: { email, otp },
    }),

  resetPassword: (email: string, password: string, confirmPassword: string) =>
    apiRequest("/auth/reset-password", {
      method: "POST",
      body: { email, password, confirmPassword },
    }),

  me: () => apiRequest<{ user: User }>("/auth/me"),

  signout: () => apiRequest("/auth/signout", { method: "POST" }),
};