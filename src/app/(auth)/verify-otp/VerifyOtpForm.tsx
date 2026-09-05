"use client";

import { useState } from "react";
import { InputOtp } from "@heroui/react";
import { useRouter, useSearchParams } from "next/navigation";
import { getApiUrl, normalizeEmail } from "../../../lib/api";
import otpStyles from "./input-otp.module.css";
import styles from "./verify-otp.module.css";

export function VerifyOtpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isRegistration = searchParams.get("purpose") === "registration";
  const email = normalizeEmail(searchParams.get("email") ?? (typeof window === "undefined" ? "" : sessionStorage.getItem(isRegistration ? "registration-email" : "password-reset-email") ?? ""));
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [isResending, setIsResending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setIsError(false);
    setIsPending(true);

    if (!/^\d{6}$/.test(otp)) {
      setIsError(true);
      setMessage("Enter the complete 6-digit OTP.");
      setIsPending(false);
      return;
    }
    try {
      const response = await fetch(getApiUrl("/auth/verify-otp"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });
      const data = await response.json().catch(() => null) as { message?: string } | null;

      if (!response.ok) throw new Error(data?.message ?? "The OTP is invalid or has expired.");
      if (isRegistration) {
        sessionStorage.removeItem("registration-email");
        router.push("/login?verified=true");
      } else {
        sessionStorage.setItem("password-reset-email", email);
        sessionStorage.setItem("password-reset-otp", otp);
        router.push("/reset-password");
      }
    } catch (error) {
      setIsError(true);
      setMessage(error instanceof Error ? error.message : "Unable to verify the OTP.");
    } finally {
      setIsPending(false);
    }
  }
  async function handleResend() {
    setMessage("");
    setIsError(false);
    setIsResending(true);
    try {
      const response = await fetch(getApiUrl("/auth/resend-otp"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await response.json().catch(() => null) as { message?: string } | null;

      if (!response.ok) throw new Error(data?.message ?? "Unable to resend the OTP.");

      setMessage(data?.message ?? "A new OTP has been sent to your email.");
      setOtp("");
      if (!isRegistration) sessionStorage.removeItem("password-reset-otp");
    } catch (error) {
      setIsError(true);
      setMessage(error instanceof Error ? error.message : "Unable to resend the OTP.");
    } finally {
      setIsResending(false);
    }
  }
  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <label htmlFor="otp">Verification Code</label>
      {email && <p className={styles.emailHint}>OTP sent to: {email}</p>}
      <InputOtp
        aria-label="Verification code"
        autoComplete="one-time-code"
        classNames={{
          base: otpStyles.otp,
          errorMessage: otpStyles.error,
          segment: otpStyles.segment,
          segmentWrapper: otpStyles.segments,
        }}
        color={isError ? "danger" : "primary"}
        errorMessage={isError ? message : undefined}
        isDisabled={isPending}
        isInvalid={isError}
        id="otp"
        length={6}
        value={otp}
        variant="bordered"
        onValueChange={(value) => {
          setOtp(value.replace(/\D/g, ""));
          setMessage("");
          setIsError(false);
        }}
      />
      {message && !isError && <p className={styles.notice} role="status">{message}</p>}
      <button type="submit" disabled={isPending || !email}>{isPending ? "Verifying..." : isRegistration ? "Verify Email" : "Verify & Proceed"}</button>
      <button className={styles.resendButton} type="button" onClick={handleResend} disabled={isResending || !email}>{isResending ? "Sending OTP..." : "Resend OTP"}</button>
      {!email && <p className={styles.error} role="alert">{isRegistration ? "Register again to receive a verification OTP." : "Request a new OTP from the forgot-password page first."}</p>}
    </form>
  );
}
