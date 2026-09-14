"use client";

import { AlertCircle, Bell, BellOff, Check, CheckCheck, LoaderCircle, Trash2, X } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import type { Notification, NotificationType } from "@/types/notification";

const TYPE_META: Record<NotificationType, { label: string; badge: string }> = {
  COMMENT_ADDED: { label: "Comment", badge: "bg-sky-50 text-sky-600" },
  ORDER_CREATED: { label: "Order", badge: "bg-amber-50 text-amber-600" },
  ORDER_UPDATED: { label: "Order update", badge: "bg-orange-50 text-orange-600" },
  PROJECT_INVITATION: { label: "Invitation", badge: "bg-violet-50 text-violet-600" },
  MEMBER_ADDED: { label: "Team", badge: "bg-emerald-50 text-emerald-600" },
  PAYMENT_SUCCESS: { label: "Payment", badge: "bg-indigo-50 text-indigo-600" },
  PRODUCT_CREATED: { label: "Product", badge: "bg-teal-50 text-teal-600" },
  PRODUCT_UPDATED: { label: "Product", badge: "bg-cyan-50 text-cyan-600" },
};

function formatRelativeTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const seconds = Math.round((date.getTime() - Date.now()) / 1000);
  const formatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  const absolute = Math.abs(seconds);
  if (absolute < 60) return "just now";
  if (absolute < 3600) return formatter.format(Math.round(seconds / 60), "minute");
  if (absolute < 86400) return formatter.format(Math.round(seconds / 3600), "hour");
  return formatter.format(Math.round(seconds / 86400), "day");
}

export function NotificationsBell({ variant = "admin" }: { variant?: "admin" | "storefront" }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyIds, setBusyIds] = useState<Set<number>>(() => new Set());
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();
  const unreadCount = notifications.filter((item) => !item.read).length;

  async function load() {
    try {
      const response = await fetch("/api/notifications", { cache: "no-store" });
      const data: unknown = await response.json().catch(() => null);
      if (!response.ok) {
        const message = data && typeof data === "object" && "message" in data && typeof data.message === "string" ? data.message : null;
        throw new Error(message ?? "Failed to load notifications.");
      }
      const list = data && typeof data === "object" && "notifications" in data && Array.isArray(data.notifications) ? data.notifications : [];
      setNotifications(list);
      setError("");
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Failed to load notifications.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    queueMicrotask(() => void load());
    const interval = window.setInterval(() => void load(), 60_000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!open) return;
    queueMicrotask(() => void load());

    function handlePointerDown(event: PointerEvent) {
      if (event.target instanceof Node && !rootRef.current?.contains(event.target)) setOpen(false);
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    }
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  async function updateRead(notification: Notification, read: boolean) {
    setBusyIds((previous) => new Set(previous).add(notification.id));
    try {
      const response = await fetch(`/api/notifications/${notification.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: notification.type,
          title: notification.title,
          message: notification.message,
          referenceId: notification.referenceId,
          referenceType: notification.referenceType,
          read,
        }),
        cache: "no-store",
      });
      const data: unknown = await response.json().catch(() => null);
      if (!response.ok) {
        const message = data && typeof data === "object" && "message" in data && typeof data.message === "string" ? data.message : null;
        throw new Error(message ?? "Failed to update the notification.");
      }
      setNotifications((previous) => previous.map((item) => (item.id === notification.id ? { ...item, read } : item)));
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "Failed to update the notification.");
    } finally {
      setBusyIds((previous) => {
        const next = new Set(previous);
        next.delete(notification.id);
        return next;
      });
    }
  }

  function markAllRead() {
    const unread = notifications.filter((item) => !item.read);
    for (const item of unread) void updateRead(item, true);
  }

  async function deleteNotification(id: number) {
    setBusyIds((previous) => new Set(previous).add(id));
    try {
      const response = await fetch(`/api/notifications/${id}`, { method: "DELETE", cache: "no-store" });
      if (!response.ok) {
        const data: unknown = await response.json().catch(() => null);
        const message = data && typeof data === "object" && "message" in data && typeof data.message === "string" ? data.message : null;
        throw new Error(message ?? "Failed to delete the notification.");
      }
      setNotifications((previous) => previous.filter((item) => item.id !== id));
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Failed to delete the notification.");
      setBusyIds((previous) => {
        const next = new Set(previous);
        next.delete(id);
        return next;
      });
    }
  }

  const isStorefront = variant === "storefront";
  const buttonClass = isStorefront
    ? "grid h-9 w-9 place-items-center rounded-full text-ink/65 transition hover:bg-brand-light hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
    : "rounded-full p-2 text-slate-500 transition hover:bg-indigo-50 hover:text-indigo-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500";
  const badgeClass = isStorefront
    ? "bg-brand text-white"
    : "bg-indigo-500 text-white";

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        aria-label="Notifications"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
        className={`relative cursor-pointer transition ${buttonClass}`}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className={`absolute right-0 top-0 grid h-4 min-w-4 place-items-center rounded-full border-2 border-white px-1 text-[9px] font-bold ${badgeClass}`}>
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <section
          id={panelId}
          aria-label="Notifications"
          className="absolute right-0 top-full z-50 mt-2 w-[min(92vw,22rem)] overflow-hidden rounded-xl border border-slate-200 bg-white text-sm shadow-lg"
        >
          <header className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <p className="font-semibold text-slate-800">Notifications</p>
            {notifications.some((item) => !item.read) && (
              <button type="button" onClick={markAllRead} disabled={busyIds.size > 0} className="flex cursor-pointer items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium text-indigo-600 transition hover:bg-indigo-50 disabled:cursor-wait disabled:opacity-50">
                <CheckCheck size={14} aria-hidden="true" />
                Mark all read
              </button>
            )}
          </header>

          <div className="max-h-[min(60vh,24rem)] overflow-y-auto">
            {error && (
              <div className="flex items-start gap-2 px-4 py-3 text-xs leading-5 text-red-600">
                <AlertCircle size={15} className="mt-0.5 shrink-0" aria-hidden="true" />
                <span className="flex-1">{error}</span>
                <button type="button" onClick={() => { setError(""); void load(); }} className="cursor-pointer rounded p-0.5 hover:bg-red-50" aria-label="Retry loading notifications">
                  <LoaderCircle size={14} />
                </button>
              </div>
            )}
            {loading && !notifications.length ? (
              <div className="grid place-items-center py-10 text-slate-400">
                <LoaderCircle size={22} className="animate-spin" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="grid place-items-center gap-2 px-4 py-10 text-center">
                <BellOff size={22} className="text-slate-300" aria-hidden="true" />
                <p className="text-xs leading-5 text-slate-500">No notifications yet.</p>
              </div>
            ) : (
              <ul role="list" className="divide-y divide-slate-100">
                {notifications.map((item) => {
                  const meta = TYPE_META[item.type] ?? { label: item.type, badge: "bg-slate-50 text-slate-600" };
                  const busy = busyIds.has(item.id);
                  const time = formatRelativeTime(item.createdAt);
                  return (
                    <li key={item.id} className={`group relative flex gap-3 px-4 py-3 transition ${item.read ? "bg-white" : "bg-indigo-50/40"}`}>
                      <span className={`mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full text-[10px] font-bold uppercase ${meta.badge}`} aria-hidden="true">
                        {meta.label.slice(0, 2)}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-[13px] font-semibold text-slate-800">{item.title}</p>
                          {!item.read && <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-indigo-500" aria-label="Unread" />}
                        </div>
                        <p className="mt-0.5 break-words text-xs leading-5 text-slate-500">{item.message}</p>
                        {time && <p className="mt-1 text-[10px] text-slate-400">{time}</p>}
                      </div>
                      <div className="flex shrink-0 items-start gap-1">
                        {!item.read && (
                          <button type="button" onClick={() => void updateRead(item, true)} disabled={busy} className="cursor-pointer rounded-lg p-1.5 text-slate-400 transition hover:bg-white hover:text-indigo-600 disabled:cursor-wait" aria-label="Mark as read">
                            <Check size={14} />
                          </button>
                        )}
                        <button type="button" onClick={() => void deleteNotification(item.id)} disabled={busy} className="cursor-pointer rounded-lg p-1.5 text-slate-400 transition hover:bg-white hover:text-red-500 disabled:cursor-wait" aria-label="Delete notification">
                          {busy ? <LoaderCircle size={14} className="animate-spin" /> : <Trash2 size={14} />}
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <footer className="border-t border-slate-100 px-4 py-2 text-center">
            <button type="button" onClick={() => setOpen(false)} className="cursor-pointer rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-50 hover:text-slate-600" aria-label="Close notifications">
              <X size={15} />
            </button>
          </footer>
        </section>
      )}
    </div>
  );
}