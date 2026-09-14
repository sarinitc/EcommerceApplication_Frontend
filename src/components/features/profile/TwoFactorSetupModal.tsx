"use client";
import { useState, type FormEvent } from "react";
import { Modal, inputClass, primaryButton } from "./Modal";
export function TwoFactorSetupModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent) { event.preventDefault(); if (code !== "123456") { setError("Enter the demo verification code: 123456."); return; } setBusy(true); await new Promise((resolve) => setTimeout(resolve, 650)); onSuccess(); }
  return <Modal title="Set up two-factor authentication" onClose={onClose} busy={busy}><p className="text-sm leading-6 text-gray-500">This is a demo QR illustration, not an authenticator setup. Use code <strong className="text-gray-800">123456</strong> to try verification. Your real account security will not change.</p>
    <div className="my-5 text-center"><svg role="img" aria-label="Mock QR code illustration" viewBox="0 0 25 25" className="mx-auto h-36 w-36 rounded-xl border border-gray-200 bg-white p-3" shapeRendering="crispEdges"><path fill="#1e293b" d="M1 1h7v7H1z M17 1h7v7h-7z M1 17h7v7H1z M10 1h3v2h-3z M10 5h2v5h-2z M14 4h2v8h-2z M1 10h5v2H1z M7 11h5v3H7z M2 14h2v2H2z M10 16h3v5h-3z M14 14h3v3h-3z M18 10h6v3h-6z M19 15h2v4h-2z M22 18h2v6h-2z M14 20h5v4h-5z M10 23h2v1h-2z" /><path fill="white" d="M2 2h5v5H2z M18 2h5v5h-5z M2 18h5v5H2z" /><path fill="#1e293b" d="M3 3h3v3H3z M19 3h3v3h-3z M3 19h3v3H3z" /></svg><span className="mt-2 block text-xs text-gray-400">Demo QR code</span></div>
    <form onSubmit={submit}><label htmlFor="verification-code" className="text-sm font-medium">6-digit verification code</label><input id="verification-code" value={code} onChange={(event) => { setCode(event.target.value.replace(/\D/g, "").slice(0, 6)); setError(""); }} inputMode="numeric" autoComplete="one-time-code" maxLength={6} pattern="[0-9]{6}" required disabled={busy} className={`${inputClass} text-center text-xl tracking-[.4em]`} placeholder="000000" />{error && <p role="alert" className="mt-2 text-sm text-red-600">{error}</p>}<button disabled={busy} className={`${primaryButton} mt-5 w-full`}>{busy ? "Verifying…" : "Verify & Enable"}</button></form></Modal>;
}
