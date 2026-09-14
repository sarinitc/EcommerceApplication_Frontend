"use client";
import { useCallback, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { ProfileSidebarCard } from "./ProfileSidebarCard";
import { OrderSummaryCard } from "./OrderSummaryCard";
import { AccountSecurityCard } from "./AccountSecurityCard";
import { PersonalInfoModal } from "./PersonalInfoModal";
import { Modal, secondaryButton } from "./Modal";
import { Toast, type ToastMessage } from "./Toast";
import { logout } from "./actions";
import { Crown, ChevronRight } from "lucide-react";
import { ProfileStoreHeader } from "./ProfileStoreHeader";

export function ProfilePage({ name, email, image }: { name: string; email: string; image?: string | null }) {
  const { update } = useSession();
  const [profile, setProfile] = useState({ name, email });
  const [avatar, setAvatar] = useState(image || "");
  const [personalOpen, setPersonalOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState("");
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const notify = useCallback((text: string) => setToast({ id: Date.now(), text }), []);
  const dismiss = useCallback(() => setToast(null), []);
  async function handleAvatarChange(url: string | null) {
    setAvatar(url || "");
    const updatedSession = await update({ user: { image: url } });
    if (!updatedSession) throw new Error("Unable to refresh the account session.");
  }
  async function confirmLogout() { setLoggingOut(true); setLogoutError(""); try { await logout(); } catch { setLogoutError("Unable to log out. Please try again."); setLoggingOut(false); } }
  return <><ProfileStoreHeader name={profile.name} image={avatar} onProfile={() => setPersonalOpen(true)} /><main className="min-h-[calc(100vh-76px)] bg-[linear-gradient(135deg,_#f3f2ff_0%,_#f8fbff_45%,_#f4f6ff_100%)] px-4 pt-6 pb-8 text-[#0c1040] sm:px-6"><div className="mx-auto max-w-[1392px]">
    <nav aria-label="Breadcrumb" className="mb-3 flex flex-wrap items-center gap-3 text-[13px] text-[#7580a8]"><Link href="/" className="transition-all duration-150 hover:text-indigo-500">Home</Link><span aria-hidden="true">/</span><Link href="/profile" className="transition-all duration-150 hover:text-indigo-500">Account</Link><span aria-hidden="true">/</span><span aria-current="page" className="font-medium text-[#6366f1]">My Profile</span></nav>
    <header className="mb-6 flex flex-wrap items-center justify-between gap-5"><div><h1 className="text-3xl font-bold tracking-tight sm:text-[40px] sm:leading-tight">My Profile</h1><p className="mt-2 text-sm leading-6 text-[#69759e] sm:text-base">Manage your account, orders, and security settings.</p></div><button onClick={() => setPersonalOpen(true)} className="flex w-full cursor-pointer items-center gap-4 rounded-2xl bg-[linear-gradient(135deg,_#eef2ff,_#ece8ff)] px-5 py-4 text-left transition-all duration-150 hover:shadow-sm sm:w-auto sm:min-w-80"><span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-indigo-200/60 text-[#7360ff]"><Crown size={23} className="fill-indigo-400" /></span><span className="min-w-0 flex-1"><strong className="block text-sm font-semibold">Welcome back, {profile.name.trim().split(/\s+/)[0]}!</strong><span className="mt-1 block text-xs text-[#717aa4]">Thanks for being a valued member.</span></span><ChevronRight size={17} className="text-[#6366f1]" /></button></header>
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,0.43fr)_minmax(0,1fr)]"><ProfileSidebarCard {...profile} image={avatar} onAvatarChange={handleAvatarChange} onPersonalInfo={() => setPersonalOpen(true)} onLogout={() => setLogoutOpen(true)} /><div className="grid min-w-0 gap-5"><OrderSummaryCard /><AccountSecurityCard notify={notify} /></div></div>
    <p className="mt-5 text-center text-[11px] leading-5 text-[#737b9e]">Demo preview: personal information edits, two-factor authentication, login activity, membership date, and orders use sample data. Demo changes reset on reload. Password changes, profile photo uploads, and account logout are live.</p>
    {personalOpen && <PersonalInfoModal {...profile} onClose={() => setPersonalOpen(false)} onSave={(nextName, nextEmail) => { setProfile({ name: nextName, email: nextEmail }); setPersonalOpen(false); notify("Personal information updated"); }} />}
    {logoutOpen && <Modal title="Log out?" onClose={() => setLogoutOpen(false)} busy={loggingOut}><p className="text-sm leading-6 text-gray-500">Are you sure you want to log out? This will sign you out of your account.</p>{logoutError && <p role="alert" className="mt-3 text-sm text-red-600">{logoutError}</p>}<div className="mt-6 flex justify-end gap-3"><button disabled={loggingOut} className={secondaryButton} onClick={() => setLogoutOpen(false)}>Cancel</button><button disabled={loggingOut} onClick={confirmLogout} className="cursor-pointer rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition-all duration-150 hover:bg-red-700 disabled:cursor-wait disabled:opacity-60">{loggingOut ? "Logging out…" : "Log out"}</button></div></Modal>}
    <Toast message={toast} onDismiss={dismiss} />
  </div></main></>;
}
