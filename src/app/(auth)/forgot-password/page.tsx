import Link from "next/link";
import LockResetOutlinedIcon from "@mui/icons-material/LockResetOutlined";
import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import { ForgotPasswordForm } from "./ForgotPasswordForm";
import styles from "./forgot-password.module.css";

export default function ForgotPasswordPage() {
  return (
    <main className={styles.page}>
      <section className={styles.card} aria-labelledby="forgot-password-title">
        <Link className={styles.brand} href="/" aria-label="IndigoStore home">IndigoStore</Link>
        <span className={styles.icon} aria-hidden="true"><LockResetOutlinedIcon /></span>
        <h1 id="forgot-password-title">Forgot Password?</h1>
        <p className={styles.description}>Enter your email and we&apos;ll send you an OTP to reset your password.</p>
        <ForgotPasswordForm />
        <div className={styles.divider} />
        <Link className={styles.backLink} href="/login"><ArrowBackOutlinedIcon aria-hidden="true" />Back to Login</Link>
      </section>
    </main>
  );
}
