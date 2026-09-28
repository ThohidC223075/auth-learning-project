import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { Link, useNavigate } from "react-router";
import AuthCard from "../components/AuthCard";
import FormInput from "../components/FormInput";
import Alert from "../components/Alert";
import SubmitButton from "../components/SubmitButton";
import { authApi } from "../api/auth";
import { getErrorMessage } from "../api/client";
import { validateEmail } from "../utils/validation";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    setEmail(e.target.value);
    setError("");
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setServerError("");

    const emailError = validateEmail(email);
    if (emailError) {
      setError(emailError);
      return;
    }

    setLoading(true);
    try {
      const cleanEmail = email.trim().toLowerCase();
      await authApi.forgotPassword(cleanEmail);
      navigate("/verify-otp", { state: { email: cleanEmail, purpose: "reset" } });
    } catch (err) {
      setServerError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthCard title="Forgot Password" subtitle="We'll send an OTP to your email">
      <Alert type="error" message={serverError} />

      <form onSubmit={handleSubmit} noValidate>
        <FormInput
          label="Email"
          name="email"
          type="email"
          value={email}
          error={error}
          placeholder="you@example.com"
          onChange={handleChange}
        />
        <SubmitButton loading={loading} text="Send OTP" loadingText="Sending OTP..." />
      </form>

      <p className="text-sm text-center mt-4 text-gray-600">
        Remembered it?{" "}
        <Link to="/signin" className="text-blue-600 hover:underline">
          Back to Sign In
        </Link>
      </p>
    </AuthCard>
  );
}