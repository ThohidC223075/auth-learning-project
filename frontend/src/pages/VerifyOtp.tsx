import { useEffect, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router";
import AuthCard from "../components/AuthCard";
import FormInput from "../components/FormInput";
import Alert from "../components/Alert";
import SubmitButton from "../components/SubmitButton";
import { authApi } from "../api/auth";
import { getErrorMessage } from "../api/client";
import { validateOtp } from "../utils/validation";

type OtpState = {
  email: string;
  purpose: "signup" | "reset";
};

const OTP_VALID_SECONDS = 180;

export default function VerifyOtp() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as OtpState | null;

  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(OTP_VALID_SECONDS);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [secondsLeft]);

  if (!state?.email) {
    return <Navigate to="/signup" replace />;
  }

  const { email, purpose } = state;
  const minutes = Math.floor(secondsLeft / 60);
  const seconds = String(secondsLeft % 60).padStart(2, "0");

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const onlyDigits = e.target.value.replace(/\D/g, "").slice(0, 6);
    setOtp(onlyDigits);
    setError("");
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setServerError("");

    const otpError = validateOtp(otp);
    if (otpError) {
      setError(otpError);
      return;
    }

    setLoading(true);
    try {
      if (purpose === "signup") {
        await authApi.verifySignupOtp(email, otp);
        navigate("/signin", {
          replace: true,
          state: { message: "Account created successfully! Please sign in." },
        });
      } else {
        await authApi.verifyResetOtp(email, otp);
        navigate("/reset-password", { replace: true, state: { email } });
      }
    } catch (err) {
      setServerError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  const backLink = purpose === "signup" ? "/signup" : "/forgot-password";

  return (
    <AuthCard title="Verify OTP" subtitle={`We sent a 6-digit code to ${email}`}>
      <Alert type="error" message={serverError} />

      <p className={`text-sm mb-4 ${secondsLeft > 0 ? "text-gray-600" : "text-red-600"}`}>
        {secondsLeft > 0
          ? `Code expires in ${minutes}:${seconds}`
          : "This code has expired. Please request a new one."}
      </p>

      <form onSubmit={handleSubmit} noValidate>
        <FormInput
          label="OTP Code"
          name="otp"
          value={otp}
          error={error}
          placeholder="123456"
          onChange={handleChange}
        />
        <SubmitButton loading={loading} text="Verify" loadingText="Verifying..." />
      </form>

      <p className="text-sm text-center mt-4 text-gray-600">
        Didn't get the code?{" "}
        <Link to={backLink} className="text-blue-600 hover:underline">
          Request a new one
        </Link>
      </p>
    </AuthCard>
  );
}