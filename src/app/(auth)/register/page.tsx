import Image from "next/image";
import Link from "next/link";
import { RegisterForm } from "@/components/forms/register/RegisterForm";
import styles from "@/components/forms/register/register.module.css";
export default function RegisterPage() {
  return (
    <main className={styles.page}>
      <aside className={styles.showcase}>
        <Link className={styles.logo} href="/">
          <Image src="/icon.svg" alt="" width={74} height={74} priority />
          <span><b>IndigoStore</b><small>SHOP · ORDER · ENJOY</small></span>
        </Link>
        <div className={styles.message}>
          <h1>Create your<br />account</h1>
          <p>Join IndigoStore today and enjoy seamless shopping, fast delivery, and secure payments.</p>
          <i aria-hidden="true" />
        </div>
        <div className={styles.illustration} aria-hidden="true">
          <div className={styles.phone}><Image src="/icon.svg" alt="" width={96} height={96} /></div>
          <div className={styles.bag} /><div className={styles.boxes} />
        </div>
      </aside>
      <section className={styles.content} aria-labelledby="register-title">
        <RegisterForm />
        <p className={styles.copyright}>© 2026 IndigoStore. All rights reserved.</p>
      </section>
    </main>
  );
}
