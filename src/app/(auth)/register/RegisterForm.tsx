"use client";

import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type RegisterResponse = { message?: string };

export function RegisterForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const username = String(formData.get("fullName") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");
    const confirmPassword = String(formData.get("confirmPassword") ?? "");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setError("");
    setIsPending(true);
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });
      const data = await response.json().catch(() => ({})) as RegisterResponse;
      if (!response.ok) {
        setError(data.message ?? "Registration failed.");
        return;
      }

      sessionStorage.setItem("registration-email", email);
      router.push(`/verify-otp?email=${encodeURIComponent(email)}&purpose=registration`);
    } catch {
      setError("Unable to register right now.");
    } finally {
      setIsPending(false);
    }
  }

  return <form className="register-card" onSubmit={handleSubmit}>
    <header><h2 id="register-title">Create Account</h2><p>Fill in the form below to get started.</p></header>
    <label htmlFor="fullName">Full Name</label>
    <div className="register-input"><PersonOutlinedIcon aria-hidden="true" /><input id="fullName" name="fullName" placeholder="Enter your full name" autoComplete="name" required /></div>
    <label htmlFor="registerEmail">Email Address</label>
    <div className="register-input"><EmailOutlinedIcon aria-hidden="true" /><input id="registerEmail" name="email" type="email" placeholder="Enter your email address" autoComplete="email" required /></div>
    <label htmlFor="registerPassword">Password</label>
    <div className="register-input"><LockOutlinedIcon aria-hidden="true" /><input id="registerPassword" name="password" type="password" placeholder="Create a password" autoComplete="new-password" minLength={6} required /></div>
    <label htmlFor="confirmPassword">Confirm Password</label>
    <div className="register-input"><LockOutlinedIcon aria-hidden="true" /><input id="confirmPassword" name="confirmPassword" type="password" placeholder="Confirm your password" autoComplete="new-password" minLength={6} required /></div>
    <label htmlFor="phoneNumber">Phone Number <span>(Optional)</span></label>
    <div className="register-input"><PhoneOutlinedIcon aria-hidden="true" /><input id="phoneNumber" name="phoneNumber" type="tel" placeholder="Enter your phone number" autoComplete="tel" /></div>
    <label className="terms-check"><input type="checkbox" required /> <span>I agree to the <Link href="/terms">Terms of Service</Link> and <Link href="/privacy">Privacy Policy</Link></span></label>
    {error && <p className="text-sm text-red-600" role="alert">{error}</p>}
    <button className="register-submit" type="submit" disabled={isPending}>{isPending ? "Creating account..." : "Create Account"}</button>
    <div className="register-divider"><span>or</span></div>
    <p className="register-login">Already have an account? <Link href="/login">Sign in</Link></p>
  </form>;
}
