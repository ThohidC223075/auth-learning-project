import { transporter } from "../lib/mailer";
import { env } from "../config/env";

export type OtpPurpose = "SIGNUP" | "RESET_PASSWORD";

export async function sendOtpEmail(to: string, code: string, purpose: OtpPurpose) {
  const subject = purpose === "SIGNUP" ? "Verify your email" : "Reset your password";

  await transporter.sendMail({
    from: env.SMTP_FROM,
    to,
    subject,
    text: `Your OTP code is ${code}. It will expire in 3 minutes.`,
    html: `
      <p>Your OTP code is:</p>
      <h2 style="letter-spacing: 4px;">${code}</h2>
      <p>This code will expire in <b>3 minutes</b>.</p>
      <p>If you didn't request this, you can ignore this email.</p>
    `,
  });
}