"use client";

import { useState } from "react";
import { Clock3, LockKeyhole, ShieldCheck, Monitor, Smartphone } from "lucide-react";
import { ChangePasswordModal } from "./ChangePasswordModal";
import { TwoFactorSetupModal } from "./TwoFactorSetupModal";
import { Modal, secondaryButton } from "./Modal";

export function AccountSecurityCard({ notify }: { notify: (message: string) => void }) {
  const [modal, setModal] = useState<"password" | "twoFactor" | "activity" | "disable" | null>(null);
  const [enabled, setEnabled] = useState(false);
  const [sessions, setSessions] = useState([
    { id: 1, device: "Chrome on Windows", location: "Phnom Penh, Cambodia", active: "Active now", mobile: false },
    { id: 2, device: "Safari on iPhone", location: "Siem Reap, Cambodia", active: "2 hours ago", mobile: true },
    { id: 3, device: "Firefox on Mac", location: "Bangkok, Thailand", active: "Yesterday", mobile: false },
  ]);
  const rows = [
    { title: "Password", text: "Manage your password securely.", icon: LockKeyhole, action: "Update", open: () => setModal("password") },
    { title: "Two-Factor Authentication", text: enabled ? "Extra protection is enabled in this demo." : "Add another layer of account protection.", icon: ShieldCheck, action: enabled ? "Disable" : "Enable", open: () => setModal(enabled ? "disable" : "twoFactor") },
    { title: "Login Activity", text: "See where you're logged in.", icon: Clock3, action: "View", open: () => setModal("activity") },
  ];

  return (
    <section id="account-security" tabIndex={-1} className="scroll-mt-24 rounded-2xl border border-[#e6eafa] bg-white/95 p-5 shadow-[0_6px_24px_-16px_rgba(71,85,150,0.18)] outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 sm:p-7" aria-labelledby="security-title">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold tracking-[0.12em] text-[#6366f1]">PROTECTION</p>
          <h2 id="security-title" className="mt-1 text-2xl font-bold tracking-tight text-[#11143d] sm:text-[28px]">Account Security</h2>
        </div>
        <div className="relative isolate hidden items-center gap-3 rounded-xl px-4 py-2.5 md:flex lg:hidden xl:flex">
          <span aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 -skew-x-12 rounded-xl bg-gradient-to-r from-[#fbfbff] to-[#f3f3ff]" />
          <span className="flex h-12 w-11 items-center justify-center bg-gradient-to-br from-indigo-100 via-indigo-200 to-indigo-400 text-white [clip-path:polygon(50%_0%,95%_18%,88%_68%,72%_86%,50%_100%,28%_86%,12%_68%,5%_18%)]"><ShieldCheck size={27} strokeWidth={1.5} aria-hidden="true" /></span>
          <div><p className="text-xs font-medium text-[#48517c]">A more secure account</p><p className="mt-1 text-[10px] text-[#7b84a9]">Keep your information safe and protected.</p></div>
        </div>
      </div>

      <div className="divide-y divide-[#e9ebf5] rounded-xl border border-[#e5e8f4] px-3 sm:px-4">
        {rows.map(({ title, text, icon: Icon, action, open }) => (
          <div key={title} className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3 py-4 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:gap-5">
            <span className="flex size-11 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-50 to-[#ececff] text-[#6366f1] sm:size-12"><Icon size={24} strokeWidth={1.8} aria-hidden="true" /></span>
            <div>
              <div className="flex flex-wrap items-center gap-2"><h3 className="text-sm font-semibold text-[#191d46]">{title}</h3>{title === "Two-Factor Authentication" && enabled && <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">Enabled</span>}</div>
              <p className="mt-1 text-xs leading-5 text-[#697397]">{text}</p>
            </div>
            <button type="button" onClick={open} className={`col-start-2 min-w-24 cursor-pointer justify-self-start rounded-xl border px-5 py-3 text-xs font-semibold transition-all duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 sm:col-start-auto sm:justify-self-end ${action === "Disable" ? "border-red-200 bg-white text-red-600 hover:bg-red-50" : "border-[#dfe3f1] bg-[#fafaff] text-[#24284f] hover:border-indigo-200 hover:bg-indigo-50"}`}>{action}</button>
          </div>
        ))}
      </div>

      {modal === "password" && <ChangePasswordModal onClose={() => setModal(null)} onSuccess={() => { setModal(null); notify("Password changed successfully"); }} />}
      {modal === "twoFactor" && <TwoFactorSetupModal onClose={() => setModal(null)} onSuccess={() => { setEnabled(true); setModal(null); notify("Two-factor authentication enabled"); }} />}
      {modal === "disable" && <Modal title="Disable two-factor authentication?" onClose={() => setModal(null)}><p className="text-sm text-gray-500">This will turn off two-factor authentication in the demo.</p><div className="mt-6 flex justify-end gap-3"><button className={secondaryButton} onClick={() => setModal(null)}>Cancel</button><button className={`${secondaryButton} border-red-200 text-red-600 hover:bg-red-50`} onClick={() => { setEnabled(false); setModal(null); notify("Two-factor authentication disabled"); }}>Disable</button></div></Modal>}
      {modal === "activity" && <Modal title="Login activity" onClose={() => setModal(null)}><p className="mb-4 text-sm text-gray-500">Sample sessions. Logging out here removes a demo session only.</p><div className="space-y-3">{sessions.map((session) => <div key={session.id} className="flex flex-wrap items-center gap-3 rounded-xl border border-gray-100 p-4">{session.mobile ? <Smartphone size={20} className="text-indigo-500" /> : <Monitor size={20} className="text-indigo-500" />}<div className="min-w-0 flex-1"><h3 className="text-sm font-semibold">{session.device}</h3><p className="mt-1 text-xs leading-5 text-gray-500">{session.location}<br />{session.active}</p></div><button className="cursor-pointer rounded-lg p-2 text-xs font-semibold text-red-600 transition-all duration-150 hover:bg-red-50" aria-label={`Log out ${session.device}`} onClick={() => { setSessions((previous) => previous.filter((item) => item.id !== session.id)); }}>Log out</button></div>)}{sessions.length === 0 && <p role="status" className="rounded-xl bg-gray-50 p-6 text-center text-sm text-gray-500">All demo sessions have been logged out.</p>}</div></Modal>}
    </section>
  );
}
