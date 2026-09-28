const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmail(email: string): string {
  if (!email.trim()) return "Email is required";
  if (!EMAIL_REGEX.test(email.trim())) return "Please enter a valid email";
  return "";
}

export function validatePassword(password: string): string {
  if (!password) return "Password is required";
  if (password.length < 8) return "Password must be at least 8 characters";
  if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) {
    return "Password must contain both letters and numbers";
  }
  return "";
}

export function validateConfirmPassword(password: string, confirmPassword: string): string {
  if (!confirmPassword) return "Please confirm your password";
  if (password !== confirmPassword) return "Passwords do not match";
  return "";
}

export function validateOtp(otp: string): string {
  if (!otp) return "OTP is required";
  if (!/^\d{6}$/.test(otp)) return "OTP must be 6 digits";
  return "";
}