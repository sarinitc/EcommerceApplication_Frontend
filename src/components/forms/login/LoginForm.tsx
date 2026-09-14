"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import { addToast, closeToast } from "@heroui/toast";
import { authenticate, type LoginActionState } from "./login.actions";
import styles from "./login.module.css";

const initialState: LoginActionState = { status: "idle" };

export function LoginForm({ isAdminLogin = false }: { isAdminLogin?: boolean }) {
  const pendingToastKey = useRef<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [state, formAction, isPending] = useActionState(authenticate, initialState);

  useEffect(() => {
    if (state.status === "idle") return;

    if (pendingToastKey.current) {
      closeToast(pendingToastKey.current);
      pendingToastKey.current = null;
    }

    if (state.status === "success") {
      // Reload so every component and the session provider see the new account.
      window.location.assign(state.redirectTo === "/admin" ? "/admin" : "/");
      return;
    }

    if (state.status === "error") {
      addToast({ title: "Login failed", description: state.message ?? "Invalid email or password.", color: "danger", severity: "danger", variant: "solid", timeout: 4000, shouldShowTimeoutProgress: true });
    }
  }, [state]);

  function handleSubmit() {
    pendingToastKey.current = addToast({ title: "Signing you in...", description: "Checking your account details.", color: "primary", severity: "primary", variant: "flat", hideCloseButton: true, timeout: 0 });
  }

  return (
    <form action={formAction} className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.field}>
        <label htmlFor="email">Email address</label>
        <input id="email" name="email" type="email" placeholder="Enter your email" autoComplete="email" required />
      </div>
      <div className={`${styles.field} ${styles.passwordField}`}>
        <label htmlFor="password">Password</label>
        <div className={styles.passwordInput}>
          <input id="password" name="password" type={showPassword ? "text" : "password"} placeholder="Enter your password" autoComplete="current-password" minLength={6} required />
          <button className={styles.passwordToggle} type="button" onClick={() => setShowPassword((isVisible) => !isVisible)} aria-label={showPassword ? "Hide password" : "Show password"} aria-pressed={showPassword}>
            {showPassword ? <VisibilityOffOutlinedIcon aria-hidden="true" /> : <VisibilityOutlinedIcon aria-hidden="true" />}
          </button>
        </div>
        <a className={styles.forgotPassword} href="/forgot-password">Forgot Password?</a>
      </div>
      {state.status === "error" && <p className={styles.error} role="alert">{state.message}</p>}
      <input type="hidden" name="account" value={isAdminLogin ? "admin" : "customer"} />
      <button type="submit" className={styles.submitButton} disabled={isPending} aria-disabled={isPending} aria-busy={isPending}>
        {isPending ? "Signing in..." : isAdminLogin ? "Sign In as Admin" : "Log In"}
      </button>
    </form>
  );
}
