import Link from "next/link";
import { LoginForm } from "./LoginForm";
import styles from "./login.module.css";

export default function LoginPage() {
  return (
    <main className={styles.page}>
      <section className={styles.card} aria-labelledby="login-title">
        <Link className={styles.brand} href="/" aria-label="IndigoStore home">
          <span className={styles.brandMark} aria-hidden="true">*</span>
          <span>INDIGO</span>
          <small>SHOP / ORDER / ENJOY</small>
        </Link>
        <header className={styles.heading}>
          <h1 id="login-title">Welcome Back</h1>
        </header>
        <LoginForm />
        <p className={styles.signup}>Don&apos;t have an account? <Link href="/register">Sign Up</Link></p>
      </section>
    </main>
  );
}
