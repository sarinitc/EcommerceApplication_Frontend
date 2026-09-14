"use client";
import { useEffect } from "react";
import { CheckCircle2, X } from "lucide-react";
export type ToastMessage = { id: number; text: string };
export function Toast({ message, onDismiss }: { message: ToastMessage | null; onDismiss: () => void }) {
  useEffect(() => { if (!message) return; const timer = setTimeout(onDismiss, 4500); return () => clearTimeout(timer); }, [message, onDismiss]);
  return <div role="status" aria-live="polite" className="fixed right-4 bottom-5 left-4 z-[100] mx-auto max-w-md">{message && <div className="flex items-center gap-3 rounded-2xl border border-emerald-100 bg-white p-4 text-sm text-gray-800 shadow-xl"><CheckCircle2 className="shrink-0 text-emerald-600" size={22} /><span className="flex-1">{message.text}</span><button onClick={onDismiss} aria-label="Dismiss notification" className="cursor-pointer rounded-lg p-2 hover:bg-gray-50"><X size={16} /></button></div>}</div>;
}
