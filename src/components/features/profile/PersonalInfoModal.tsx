"use client";
import { useState, type FormEvent } from "react";
import { Modal, inputClass, primaryButton } from "./Modal";
export function PersonalInfoModal({ name, email, onClose, onSave }: { name: string; email: string; onClose: () => void; onSave: (name: string, email: string) => void }) {
  const [nextName, setName] = useState(name);
  const [nextEmail, setEmail] = useState(email);
  function submit(event: FormEvent) { event.preventDefault(); if (nextName.trim()) onSave(nextName.trim(), nextEmail.trim()); }
  return <Modal title="Personal information" onClose={onClose}><p className="mb-5 text-sm text-gray-500">Demo edits apply to this preview only.</p><form onSubmit={submit} className="space-y-4"><label className="block text-sm font-medium">Full name<input required maxLength={100} value={nextName} onChange={(event) => setName(event.target.value)} className={inputClass} /></label><label className="block text-sm font-medium">Email address<input type="email" required value={nextEmail} onChange={(event) => setEmail(event.target.value)} className={inputClass} /></label><button disabled={!nextName.trim()} className={`${primaryButton} w-full`}>Save Changes</button></form></Modal>;
}
