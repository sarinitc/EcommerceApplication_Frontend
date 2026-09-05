import Link from "next/link";
import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import { ResetPasswordForm } from "./ResetPasswordForm";
import styles from "./reset-password.module.css";

export default function ResetPasswordPage() {
  return (
    <main className={styles.page}>
      <section className={styles.card} aria-labelledby="reset-password-title">
        <Link className={styles.back} href="/forgot-password"><ArrowBackOutlinedIcon aria-hidden="true" />Back</Link>
        <Link className={styles.brand} href="/" aria-label="IndigoStore home">IndigoStore</Link>
        <div className={styles.panel}>
          <h1 id="reset-password-title">Reset Password</h1>
          <p>Create a new secure password for your account.</p>
          <ResetPasswordForm />
        </div>
      </section>
    </main>
  );
}
