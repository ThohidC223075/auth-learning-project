import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import AuthCard from "../components/AuthCard";
import FormInput from "../components/FormInput";
import Alert from "../components/Alert";
import SubmitButton from "../components/SubmitButton";
import { authApi } from "../api/auth";
import { ApiError, getErrorMessage } from "../api/client";
import { validateEmail } from "../utils/validation";

type FormErrors = {
  email?: string;
  password?: string;
};

export default function Signin() {
  const navigate = useNavigate();
  const location = useLocation();
  const successMessage = (location.state as { message?: string } | null)?.message ?? "";

  const [form, setForm] = useState({ email: "", password: "" });
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
      password: form.password ? "" : "Password is required",
    };
    setErrors(newErrors);
    return !newErrors.email && !newErrors.password;
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setServerError("");

    if (!validate()) return;

    setLoading(true);
    try {
      await authApi.signin(form.email.trim().toLowerCase(), form.password);
      navigate("/", { replace: true });
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
    <AuthCard title="Sign In" subtitle="Welcome back">
      {!serverError && <Alert type="success" message={successMessage} />}
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

        <div className="text-right -mt-2 mb-4">
          <Link to="/forgot-password" className="text-sm text-blue-600 hover:underline">
            Forgot password?
          </Link>
        </div>

        <SubmitButton loading={loading} text="Sign In" loadingText="Signing in..." />
      </form>

      <p className="text-sm text-center mt-4 text-gray-600">
        Don't have an account?{" "}
        <Link to="/signup" className="text-blue-600 hover:underline">
          Sign Up
        </Link>
      </p>
    </AuthCard>
  );
}