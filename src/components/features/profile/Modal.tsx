"use client";
import { useEffect, useId, useRef, type ReactNode } from "react";
import { X } from "lucide-react";

export const primaryButton = "cursor-pointer rounded-xl bg-[#6366f1] px-4 py-2.5 text-sm font-semibold text-white transition-all duration-150 hover:bg-indigo-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 disabled:cursor-wait disabled:opacity-60";
export const secondaryButton = "cursor-pointer rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition-all duration-150 hover:bg-gray-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 disabled:cursor-wait disabled:opacity-60";
export const inputClass = "mt-2 w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition-all duration-150 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100";

export function Modal({ title, children, onClose, busy = false }: { title: string; children: ReactNode; onClose: () => void; busy?: boolean }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const element = dialog.current;
    const overflow = document.body.style.overflow;
    element?.showModal();
    document.body.style.overflow = "hidden";
    return () => { element?.close(); document.body.style.overflow = overflow; previous?.focus(); };
  }, []);
  return <dialog ref={dialog} aria-labelledby={titleId} aria-busy={busy} onCancel={(event) => { event.preventDefault(); if (!busy) onClose(); }} onClick={(event) => { if (event.target === event.currentTarget && !busy) { const bounds = event.currentTarget.getBoundingClientRect(); if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) onClose(); } }} className="fixed inset-0 m-auto max-h-[90dvh] w-[calc(100%-2rem)] max-w-md overflow-y-auto rounded-xl border-0 bg-white p-6 text-gray-900 shadow-2xl backdrop:bg-slate-950/50 backdrop:backdrop-blur-sm">
    <div className="mb-5 flex items-center justify-between gap-3"><h2 id={titleId} className="text-xl font-bold">{title}</h2><button type="button" onClick={onClose} disabled={busy} aria-label="Close dialog" className="cursor-pointer rounded-lg p-2 transition-all duration-150 hover:bg-gray-100 focus-visible:outline-indigo-500 disabled:opacity-40"><X size={20} /></button></div>{children}
  </dialog>;
}
