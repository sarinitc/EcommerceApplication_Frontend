import Image from "next/image";
import Link from "next/link";
import { RegisterForm } from "./RegisterForm";
export default function RegisterPage() {
  return (
    <main className="register-page">
      <aside className="register-showcase">
        <Link className="register-logo" href="/">
          <Image src="/icon.svg" alt="" width={74} height={74} priority />
          <span><b>IndigoStore</b><small>SHOP · ORDER · ENJOY</small></span>
        </Link>
        <div className="register-message">
          <h1>Create your<br />account</h1>
          <p>Join IndigoStore today and enjoy seamless shopping, fast delivery, and secure payments.</p>
          <i aria-hidden="true" />
        </div>
        <div className="register-illustration" aria-hidden="true">
          <div className="illustration-phone"><Image src="/icon.svg" alt="" width={96} height={96} /></div>
          <div className="illustration-bag" /><div className="illustration-boxes" />
        </div>
      </aside>
      <section className="register-content" aria-labelledby="register-title">
        <RegisterForm />
        <p className="register-copyright">© 2026 IndigoStore. All rights reserved.</p>
      </section>
    </main>
  );
}
