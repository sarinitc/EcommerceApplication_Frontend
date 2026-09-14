import Link from "next/link";
import { LoginForm } from "@/components/forms/login/LoginForm";
import styles from "@/components/forms/login/login.module.css";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ account?: string }> }) {
  const isAdminLogin = (await searchParams).account === "admin";
  const session = await auth();
  if (isAdminLogin && (session?.user as { roles?: string[] } | undefined)?.roles?.includes("ADMIN")) redirect("/admin");
  return (
    <main className={styles.page}>
      <section className={styles.card} aria-labelledby="login-title">
        <Link className={styles.brand} href="/" aria-label="IndigoStore home">
          <span className={styles.brandMark} aria-hidden="true">*</span>
          <span>INDIGO</span>
          <small>SHOP / ORDER / ENJOY</small>
        </Link>
        <header className={styles.heading}>
          <h1 id="login-title">{isAdminLogin ? "Admin Sign In" : "Welcome Back"}</h1>
          {isAdminLogin && <p>Sign in with an administrator account to manage the store.</p>}
          {isAdminLogin && session?.user && <p>You are signed in as {session.user.email}. Signing in below will switch accounts in this browser.</p>}
        </header>
        <LoginForm isAdminLogin={isAdminLogin} />
        <p className={styles.signup}>{isAdminLogin ? <Link href="/">Back to store</Link> : <>Don&apos;t have an account? <Link href="/register">Sign Up</Link></>}</p>
      </section>
    </main>
  );
}
