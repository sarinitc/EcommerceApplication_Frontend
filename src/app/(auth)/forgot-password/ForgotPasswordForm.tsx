"use client";

import { useState } from "react";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import ArrowForwardOutlinedIcon from "@mui/icons-material/ArrowForwardOutlined";
import { useRouter } from "next/navigation";
import { getApiUrl, normalizeEmail } from "../../../lib/api";
import styles from "./forgot-password.module.css";

export function ForgotPasswordForm() {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setIsError(false);
    setIsPending(true);

    const email = normalizeEmail(String(new FormData(event.currentTarget).get("email") ?? ""));

    try {
      const response = await fetch(getApiUrl("/auth/forgot-password"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await response.json().catch(() => null) as { message?: string } | null;

      if (!response.ok) {
        throw new Error(data?.message ?? "Unable to send an OTP right now.");
      }

      sessionStorage.setItem("password-reset-email", email);
      sessionStorage.removeItem("password-reset-otp");
      setMessage(data?.message ?? "An OTP has been sent to your email address.");
      router.push(`/verify-otp?email=${encodeURIComponent(email)}`);
    } catch (error) {
      setIsError(true);
      setMessage(error instanceof Error ? error.message : "Unable to send an OTP right now.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <label htmlFor="reset-email">Email Address</label>
      <div className={styles.inputWrap}>
        <EmailOutlinedIcon aria-hidden="true" />
        <input id="reset-email" name="email" type="email" placeholder="name@example.com" autoComplete="email" required />
      </div>
      {message && <p className={isError ? styles.error : styles.notice} role="status">{message}</p>}
      <button type="submit" disabled={isPending}>{isPending ? "Sending OTP..." : "Send OTP"} <ArrowForwardOutlinedIcon aria-hidden="true" /></button>
    </form>
  );
}
