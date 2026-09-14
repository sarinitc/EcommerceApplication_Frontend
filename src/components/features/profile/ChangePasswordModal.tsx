"use client";
import { useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { Modal, inputClass, primaryButton } from "./Modal";
export function validatePassword(current: string, password: string, confirm: string) {
  if (!current.trim()) return "Enter your current password.";
  if (password.length < 8 || !password.trim()) return "Use at least 8 characters for your new password.";
  if (!confirm.trim()) return "Confirm your new password.";
  if (password === current) return "Choose a password different from your current password.";
  if (password !== confirm) return "New passwords do not match.";
  return "";
}
export function ChangePasswordModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [values, setValues] = useState(["", "", ""]);
  const [visible, setVisible] = useState([false, false, false]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const submitting = useRef(false);
  const password = values[1];
  const score = Number(password.length >= 8) + Number(/\d/.test(password)) + Number(/[A-Z]/.test(password) && /[a-z]/.test(password)) + Number(/[^a-zA-Z0-9]/.test(password));
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (submitting.current) return;

    const issue = validatePassword(values[0], values[1], values[2]);
    setError(issue);
    if (issue) return;

    submitting.current = true;
    setBusy(true);
    try {
      const response = await fetch("/api/profile/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: values[0],
          newPassword: values[1],
          confirmPassword: values[2],
        }),
        cache: "no-store",
      });
      const data: unknown = await response.json().catch(() => null);
      const result = data && typeof data === "object" ? data as { success?: unknown; message?: unknown } : null;
      if (!response.ok || result?.success !== true) {
        const message = typeof result?.message === "string" && result.message.trim()
          ? result.message
          : response.status === 401
            ? "Your session has expired. Please sign in again."
            : "Unable to change your password. Please try again.";
        setError(message);
        return;
      }
      setValues(["", "", ""]);
      setVisible([false, false, false]);
      onSuccess();
    } catch {
      setError("Unable to reach the server. Check your connection and try again.");
    } finally {
      submitting.current = false;
      setBusy(false);
    }
  }
  return <Modal title="Change password" onClose={onClose} busy={busy}><p className="mb-5 text-sm leading-6 text-gray-500">Enter your current password, then choose and confirm your new password.</p><form onSubmit={submit} className="space-y-4" aria-busy={busy}>
    {["Current Password", "New Password", "Confirm New Password"].map((label, index) => <div key={label}><label htmlFor={`password-${index}`} className="text-sm font-medium">{label}</label><div className="relative"><input id={`password-${index}`} type={visible[index] ? "text" : "password"} autoComplete={index === 0 ? "current-password" : "new-password"} required value={values[index]} disabled={busy} onChange={(event) => setValues((previous) => previous.map((value, i) => i === index ? event.target.value : value))} className={`${inputClass} pr-12`} /><button type="button" aria-label={`${visible[index] ? "Hide" : "Show"} ${label.toLowerCase()}`} aria-pressed={visible[index]} onClick={() => setVisible((previous) => previous.map((value, i) => i === index ? !value : value))} className="absolute right-2 bottom-1 cursor-pointer rounded-lg p-2 text-gray-500 hover:bg-gray-50">{visible[index] ? <EyeOff size={18} /> : <Eye size={18} />}</button></div></div>)}
    <div><div className="flex gap-1" role="meter" aria-label="Password strength" aria-valuemin={0} aria-valuemax={4} aria-valuenow={score}>{[1, 2, 3, 4].map((step) => <span key={step} className={`h-1.5 flex-1 rounded-full ${score < step ? "bg-gray-100" : score < 3 ? "bg-amber-400" : "bg-emerald-500"}`} />)}</div><p className="mt-2 text-xs text-gray-500">{password ? ["Weak", "Weak", "Fair", "Good", "Strong"][score] : "Use at least 8 characters."}</p></div>
    <Link href="/forgot-password" aria-disabled={busy} tabIndex={busy ? -1 : undefined} onClick={(event) => { if (busy) event.preventDefault(); }} className="inline-block text-sm font-medium text-indigo-600 hover:underline aria-disabled:cursor-wait aria-disabled:opacity-50">Forgot current password?</Link>
    {error && <p role="alert" className="text-sm text-red-600">{error}</p>}<button type="submit" disabled={busy} className={`${primaryButton} w-full`}>{busy ? "Updating…" : "Change Password"}</button></form></Modal>;
}
