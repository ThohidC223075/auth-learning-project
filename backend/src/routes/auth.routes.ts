import { Router } from "express";
import * as authController from "../controllers/auth.controller";
import { validate } from "../middlewares/validate";
import { otpRateLimit } from "../middlewares/otpRateLimit";
import { requireAuth } from "../middlewares/requireAuth";
import {
  signupSchema,
  signinSchema,
  emailOnlySchema,
  verifyOtpSchema,
  resetPasswordSchema,
} from "../validators/auth.validator";

const router = Router();

router.post("/signup", validate(signupSchema), otpRateLimit, authController.signup);
router.post("/verify-signup-otp", validate(verifyOtpSchema), authController.verifySignupOtp);

router.post("/signin", validate(signinSchema), authController.signin);

router.post("/forgot-password", validate(emailOnlySchema), otpRateLimit, authController.forgotPassword);
router.post("/verify-reset-otp", validate(verifyOtpSchema), authController.verifyResetOtp);
router.post("/reset-password", validate(resetPasswordSchema), authController.resetPassword);

router.get("/me", requireAuth, authController.me);
router.post("/signout", authController.signout);

export default router;