"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { X } from "lucide-react";

export function OrderCreateModal({ open, busy, onClose, onSubmit }: {
  open: boolean;
  busy: boolean;
  onClose: () => void;
  onSubmit: (data: { customer: { name: string; email: string }; total: number }) => void;
}) {
  const [error, setError] = useState<string | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get("customerName") ?? "").trim();
    const email = String(form.get("customerEmail") ?? "").trim();
    const total = Number(form.get("orderTotal"));
    if (!name || !email) {
      setError("Customer name and email are required.");
      return;
    }
    if (!Number.isFinite(total) || total <= 0) {
      setError("Please provide a valid order amount.");
      return;
    }
    setError(null);
    onSubmit({ customer: { name, email }, total });
  }

  const fieldClass = "mt-1.5 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-3 focus:ring-indigo-100";

  return (
    <div className="fixed inset-0 z-[60] grid place-items-center bg-slate-950/45 p-4 backdrop-blur-sm">
      <form role="dialog" aria-modal="true" aria-labelledby="create-order-title" onSubmit={handleSubmit} className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-indigo-500">Order management</p>
            <h2 id="create-order-title" className="mt-1 text-xl font-bold text-slate-900">Create Order</h2>
            <p className="mt-1 text-sm text-slate-500">Start a new order for a customer.</p>
          </div>
          <button ref={closeRef} type="button" onClick={onClose} aria-label="Close create order form" className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500">
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
        <div className="mt-6 grid gap-4">
          <label className="block">
            <span className="text-xs font-semibold text-slate-600">Customer name</span>
            <input ref={inputRef} name="customerName" required autoComplete="off" className={fieldClass} placeholder="e.g. John Doe" />
          </label>
          <label className="block">
            <span className="text-xs font-semibold text-slate-600">Customer email</span>
            <input name="customerEmail" type="email" required autoComplete="off" className={fieldClass} placeholder="e.g. john@example.com" />
          </label>
          <label className="block">
            <span className="text-xs font-semibold text-slate-600">Order amount (USD)</span>
            <input name="orderTotal" type="number" step="0.01" min="0.01" required className={fieldClass} placeholder="e.g. 120.00" />
          </label>
        </div>
        {error && <p role="alert" className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50">Cancel</button>
          <button type="submit" disabled={busy} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60">{busy ? "Creating..." : "Create order"}</button>
        </div>
      </form>
    </div>
  );
}