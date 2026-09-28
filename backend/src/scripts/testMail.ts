import { env } from "../config/env";
import { transporter } from "../lib/mailer";

async function main() {
  await transporter.verify();
  console.log("SMTP connection OK");

  const info = await transporter.sendMail({
    from: env.SMTP_FROM,
    to: env.SMTP_USER,
    subject: "SMTP Test - Auth Learning Project",
    text: "If you received this email, your SMTP setup works!",
  });

  console.log("Test email sent:", info.messageId);
}

main().catch((error) => {
  console.error("SMTP error:", error.message);
  process.exit(1);
});