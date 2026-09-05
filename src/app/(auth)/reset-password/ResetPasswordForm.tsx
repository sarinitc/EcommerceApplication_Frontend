"use client";

import { useState } from "react";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import { useRouter } from "next/navigation";
import { getApiUrl, normalizeEmail } from "../../../lib/api";
import styles from "./reset-password.module.css";

export function ResetPasswordForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [message, setMessage] = useState("");
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const password = String(formData.get("newPassword") ?? "");
    const confirmation = String(formData.get("confirmPassword") ?? "");
    const savedEmail = sessionStorage.getItem("password-reset-email");
    const email = savedEmail ? normalizeEmail(savedEmail) : null;
    const otp = sessionStorage.getItem("password-reset-otp");

    if (password !== confirmation) {
      setMessage("Passwords do not match.");
      return;
    }

    if (!email || !otp) {
      setMessage("Verify your OTP before resetting your password.");
      return;
    }

    setMessage("");
    setIsPending(true);

    try {
      const response = await fetch(getApiUrl("/auth/reset-password"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, newPassword: password }),
      });
      const data = await response.json().catch(() => null) as { message?: string } | null;

      if (!response.ok) throw new Error(data?.message ?? "Unable to reset your password.");

      sessionStorage.removeItem("password-reset-email");
      sessionStorage.removeItem("password-reset-otp");
      router.push("/login");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to reset your password.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <label htmlFor="new-password">New Password</label>
      <div className={styles.passwordInput}>
        <input id="new-password" name="newPassword" type={showPassword ? "text" : "password"} placeholder="Enter new password" autoComplete="new-password" minLength={8} required />
        <button type="button" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? "Hide new password" : "Show new password"}>
          {showPassword ? <VisibilityOffOutlinedIcon aria-hidden="true" /> : <VisibilityOutlinedIcon aria-hidden="true" />}
        </button>
      </div>
      <small>Password must be at least 8 characters.</small>

      <label htmlFor="confirm-password">Confirm New Password</label>
      <div className={styles.passwordInput}>
        <input id="confirm-password" name="confirmPassword" type={showConfirmation ? "text" : "password"} placeholder="Confirm new password" autoComplete="new-password" minLength={8} required />
        <button type="button" onClick={() => setShowConfirmation((visible) => !visible)} aria-label={showConfirmation ? "Hide confirmation password" : "Show confirmation password"}>
          {showConfirmation ? <VisibilityOffOutlinedIcon aria-hidden="true" /> : <VisibilityOutlinedIcon aria-hidden="true" />}
        </button>
      </div>
      {message && <p className={styles.error} role="alert">{message}</p>}
      <button className={styles.submit} type="submit" disabled={isPending}>{isPending ? "Resetting..." : "Reset Password"}</button>
    </form>
  );
}
