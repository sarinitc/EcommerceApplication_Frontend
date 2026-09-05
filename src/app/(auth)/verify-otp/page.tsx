import Link from "next/link";
import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import LockClockOutlinedIcon from "@mui/icons-material/LockClockOutlined";
import { VerifyOtpForm } from "./VerifyOtpForm";
import styles from "./verify-otp.module.css";

export default function VerifyOtpPage() {
  return (
    <main className={styles.page}>
      <section className={styles.card} aria-labelledby="verify-otp-title">
        <Link className={styles.back} href="/forgot-password"><ArrowBackOutlinedIcon aria-hidden="true" />Back</Link>
        <Link className={styles.brand} href="/" aria-label="IndigoStore home">IndigoStore</Link>
        <div className={styles.panel}>
          <span className={styles.icon} aria-hidden="true"><LockClockOutlinedIcon /></span>
          <h1 id="verify-otp-title">Verify OTP</h1>
          <p>Enter the 6-digit code we sent to your email address.</p>
          <VerifyOtpForm />
        </div>
      </section>
    </main>
  );
}
