import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { Link, useNavigate } from "react-router";
import AuthCard from "../components/AuthCard";
import FormInput from "../components/FormInput";
import Alert from "../components/Alert";
import SubmitButton from "../components/SubmitButton";
import { authApi } from "../api/auth";
import { ApiError, getErrorMessage } from "../api/client";
import {
  validateEmail,
  validatePassword,
  validateConfirmPassword,
} from "../utils/validation";

type FormErrors = {
  email?: string;
  password?: string;
  confirmPassword?: string;
};

export default function Signup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "", confirmPassword: "" });
  const [errors, setErrors] = useState<FormErrors>({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  }

  function validate(): boolean {
    const newErrors: FormErrors = {
      email: validateEmail(form.email),
      password: validatePassword(form.password),
      confirmPassword: validateConfirmPassword(form.password, form.confirmPassword),
    };
    setErrors(newErrors);
    return !newErrors.email && !newErrors.password && !newErrors.confirmPassword;
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setServerError("");

    if (!validate()) return;

    setLoading(true);
    try {
      const email = form.email.trim().toLowerCase();
      await authApi.signup(email, form.password, form.confirmPassword);
      navigate("/verify-otp", { state: { email, purpose: "signup" } });
    } catch (error) {
      setServerError(getErrorMessage(error));
      if (error instanceof ApiError && error.errors) {
        setErrors(error.errors);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthCard title="Create Account" subtitle="Sign up with your email">
      <Alert type="error" message={serverError} />

      <form onSubmit={handleSubmit} noValidate>
        <FormInput
          label="Email"
          name="email"
          type="email"
          value={form.email}
          error={errors.email}
          placeholder="you@example.com"
          onChange={handleChange}
        />
        <FormInput
          label="Password"
          name="password"
          type="password"
          value={form.password}
          error={errors.password}
          onChange={handleChange}
        />
        <FormInput
          label="Confirm Password"
          name="confirmPassword"
          type="password"
          value={form.confirmPassword}
          error={errors.confirmPassword}
          onChange={handleChange}
        />
        <SubmitButton loading={loading} text="Sign Up" loadingText="Sending OTP..." />
      </form>

      <p className="text-sm text-center mt-4 text-gray-600">
        Already have an account?{" "}
        <Link to="/signin" className="text-blue-600 hover:underline">
          Sign In
        </Link>
      </p>
    </AuthCard>
  );
}