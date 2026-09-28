import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { Navigate, useLocation, useNavigate } from "react-router";
import AuthCard from "../components/AuthCard";
import FormInput from "../components/FormInput";
import Alert from "../components/Alert";
import SubmitButton from "../components/SubmitButton";
import { authApi } from "../api/auth";
import { ApiError, getErrorMessage } from "../api/client";
import { validatePassword, validateConfirmPassword } from "../utils/validation";

type FormErrors = {
  password?: string;
  confirmPassword?: string;
};

export default function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = (location.state as { email?: string } | null)?.email;

  const [form, setForm] = useState({ password: "", confirmPassword: "" });
  const [errors, setErrors] = useState<FormErrors>({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!email) {
    return <Navigate to="/forgot-password" replace />;
  }

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setServerError("");

    const newErrors: FormErrors = {
      password: validatePassword(form.password),
      confirmPassword: validateConfirmPassword(form.password, form.confirmPassword),
    };
    setErrors(newErrors);
    if (newErrors.password || newErrors.confirmPassword) return;

    setLoading(true);
    try {
      await authApi.resetPassword(email!, form.password, form.confirmPassword);
      navigate("/signin", {
        replace: true,
        state: { message: "Password updated successfully! Please sign in." },
      });
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
    <AuthCard title="Reset Password" subtitle={`Set a new password for ${email}`}>
      <Alert type="error" message={serverError} />

      <form onSubmit={handleSubmit} noValidate>
        <FormInput
          label="New Password"
          name="password"
          type="password"
          value={form.password}
          error={errors.password}
          onChange={handleChange}
        />
        <FormInput
          label="Confirm New Password"
          name="confirmPassword"
          type="password"
          value={form.confirmPassword}
          error={errors.confirmPassword}
          onChange={handleChange}
        />
        <SubmitButton loading={loading} text="Update Password" loadingText="Updating..." />
      </form>
    </AuthCard>
  );
}