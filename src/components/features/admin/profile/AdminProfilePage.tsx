"use client";

import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { BadgeCheck, CalendarDays, Hash, LockKeyhole, LogOut, Mail, ShieldCheck, UserRound } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { addToast } from "@heroui/toast";
import { AvatarUpload } from "@/components/features/profile/AvatarUpload";
import { ChangePasswordModal } from "@/components/features/profile/ChangePasswordModal";

const cardClass = "rounded-2xl border border-slate-100 bg-white shadow-sm transition-shadow duration-200 hover:shadow-md";

type DetailFieldProps = {
  icon: LucideIcon;
  tint: string;
  accent: string;
  label: string;
  value: string;
};

function DetailFieldRow({ icon: Icon, tint, accent, label, value }: DetailFieldProps) {
  return (
    <div className={`flex items-start gap-4 rounded-xl border border-slate-100 border-l-4 bg-slate-50/60 px-4 py-3 ${accent}`}>
      <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg ${tint}`}><Icon className="h-5 w-5" aria-hidden="true" /></span>
      <div className="min-w-0">
        <p className="text-xs font-medium text-slate-400">{label}</p>
        <p className="mt-0.5 break-all text-sm font-semibold text-slate-700">{value}</p>
      </div>
    </div>
  );
}

export function AdminProfilePage({ name, email, image, adminId, roles }: { name: string; email: string; image?: string | null; adminId?: string | number; roles?: string[] }) {
  const { update } = useSession();
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [avatar, setAvatar] = useState(image || "");
  const roleList = Array.isArray(roles) && roles.length ? roles.map((role) => role.toUpperCase()) : ["ADMIN"];

  async function handleAvatarChange(url: string | null) {
    setAvatar(url || "");
    const updatedSession = await update({ user: { image: url } });
    if (!updatedSession) throw new Error("Unable to refresh the account session.");
  }

  return (
    <main className="space-y-6 p-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800">My Profile</h1>
          <p className="mt-1 text-sm text-slate-500">Manage your administrator account, photo, and security.</p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 px-3 py-1.5 text-xs font-bold text-white shadow-sm shadow-emerald-500/30">
          <BadgeCheck className="h-3.5 w-3.5" aria-hidden="true" />
          Administrator
        </span>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,0.42fr)_minmax(0,1fr)]">
        <div className="grid gap-6">
          <section className={`${cardClass} overflow-hidden`}>
            <div className="relative h-24 bg-gradient-to-r from-indigo-600 via-purple-600 to-fuchsia-500" aria-hidden="true" />
            <div className="-mt-12 flex flex-col items-center px-6 pb-6 text-center">
              <AvatarUpload currentAvatarUrl={avatar} userName={name} onUploadSuccess={handleAvatarChange} />
              <h2 className="mt-3 break-words text-lg font-semibold text-slate-800">{name}</h2>
              <p className="mt-2 break-all text-sm text-slate-500">{email || "No email available"}</p>
              <div className="mt-5 flex flex-wrap justify-center gap-2">
                {roleList.map((role) => (
                  <span key={role} className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm shadow-indigo-500/30">
                    <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
                    {role}
                  </span>
                ))}
              </div>
              <div className="mt-6 grid w-full grid-cols-1 gap-3 border-t border-slate-100 pt-5 sm:grid-cols-2">
                <DetailFieldRow icon={Hash} tint="bg-violet-50 text-violet-600" accent="border-l-violet-400" label="Admin ID" value={adminId != null ? String(adminId) : "—"} />
                <DetailFieldRow icon={CalendarDays} tint="bg-indigo-50 text-indigo-600" accent="border-l-indigo-400" label="Account type" value="Admin" />
              </div>
            </div>
          </section>

          <section className={`${cardClass} p-5`}>
            <h3 className="text-sm font-semibold text-slate-800">Account actions</h3>
            <div className="mt-4 grid gap-3">
              <button type="button" onClick={() => setPasswordOpen(true)} className="flex w-full cursor-pointer items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/40 px-4 py-3 text-sm font-medium text-slate-700 transition-all duration-150 hover:border-slate-200 hover:bg-slate-50 hover:shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-indigo-50 text-indigo-600"><LockKeyhole className="h-4 w-4" aria-hidden="true" /></span>
                Change password
              </button>
              <button type="button" onClick={() => void signOut({ callbackUrl: "/login" })} className="flex w-full cursor-pointer items-center gap-3 rounded-xl border border-rose-100 bg-rose-50/40 px-4 py-3 text-sm font-medium text-rose-600 transition-all duration-150 hover:border-rose-200 hover:bg-rose-50 hover:shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-500">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-rose-50 text-rose-600"><LogOut className="h-4 w-4" aria-hidden="true" /></span>
                Sign out
              </button>
            </div>
          </section>
        </div>

        <div className="grid gap-6">
          <section className={`${cardClass} p-6`}>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-400">Administrator details</h3>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <DetailFieldRow icon={Mail} tint="bg-blue-50 text-blue-600" accent="border-l-blue-400" label="Email address" value={email || "—"} />
              <DetailFieldRow icon={ShieldCheck} tint="bg-emerald-50 text-emerald-600" accent="border-l-emerald-400" label="Roles" value={roleList.join(", ")} />
              <DetailFieldRow icon={Hash} tint="bg-purple-50 text-purple-600" accent="border-l-purple-400" label="Admin ID" value={adminId != null ? String(adminId) : "—"} />
              <DetailFieldRow icon={UserRound} tint="bg-amber-50 text-amber-600" accent="border-l-amber-400" label="Account status" value="Active" />
            </div>
          </section>

          <section className={`${cardClass} p-6`}>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-400">Account security</h3>
            <p className="mt-1 text-sm leading-6 text-slate-500">Keep your administrator account protected by using a strong, unique password.</p>
            <div className="mt-5 grid items-stretch gap-4 sm:grid-cols-[minmax(0,1fr)_auto]">
              <div className="flex items-start gap-4 rounded-xl border border-slate-100 border-l-4 border-l-indigo-400 bg-slate-50/60 px-4 py-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-indigo-50 text-indigo-600"><LockKeyhole className="h-5 w-5" aria-hidden="true" /></span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-700">Password</p>
                  <p className="mt-0.5 flex items-start gap-1.5 text-xs leading-5 text-slate-500">
                    <span>Use your current password to set a new password.</span>
                  </p>
                </div>
              </div>
              <button type="button" onClick={() => setPasswordOpen(true)} className="flex h-fit w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-3 text-sm font-semibold text-white transition-all duration-150 hover:from-indigo-700 hover:to-violet-700 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 sm:w-auto">
                <LockKeyhole className="h-4 w-4" aria-hidden="true" />
                Update password
              </button>
            </div>
          </section>
        </div>
      </div>

      {passwordOpen && <ChangePasswordModal onClose={() => setPasswordOpen(false)} onSuccess={() => { setPasswordOpen(false); addToast({ title: "Password changed successfully", color: "success" }); }} />}
    </main>
  );
}
