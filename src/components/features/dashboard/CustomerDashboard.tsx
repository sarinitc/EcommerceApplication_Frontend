"use client";

import { BarChart3, CheckCircle2, ChevronDown, ClipboardList, LogOut, MapPin, Package, ShoppingBag, ShoppingCart, Timer, UserRound } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useEffect, useId, useRef, useState } from "react";
import { NotificationsBell } from "@/components/common/NotificationsBell";
import { UserAvatar } from "@/components/common/UserAvatar";
import { StatCard } from "@/components/features/admin/StatCard";

type OrderRow = {
  orderId: number;
  email: string;
  date: string;
  status: StatusKey;
  itemCount: number;
  total: number;
  paymentMethod: string;
};

type StatusKey = "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";

const Status = {
  PENDING: "bg-amber-50 text-amber-700",
  PROCESSING: "bg-blue-50 text-blue-700",
  SHIPPED: "bg-violet-50 text-violet-700",
  DELIVERED: "bg-emerald-50 text-emerald-700",
  CANCELLED: "bg-red-50 text-red-600",
} satisfies Record<StatusKey, string>;

const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

function normalizeStatus(value?: string): StatusKey {
  const key = String(value ?? "").toUpperCase() as StatusKey;
  return key in Status ? key : "PENDING";
}

function parseOrders(data: unknown): OrderRow[] {
  const payload = Array.isArray(data) ? data : (data as { payload?: unknown } | null)?.payload;
  if (!Array.isArray(payload)) return [];
  return payload.flatMap((raw: unknown) => {
    if (!raw || typeof raw !== "object") return [];
    const value = raw as Record<string, unknown>;
    const items = Array.isArray(value.items) ? value.items : [];
    const itemCount = items.reduce((sum, item) => sum + (Number((item as { quantity?: number } | null)?.quantity) || 0), 0);
    const itemsTotal = items.reduce((sum, item) => {
      const entry = item as { orderedProductPrice?: number; quantity?: number } | null;
      return sum + (Number(entry?.orderedProductPrice) || 0) * (Number(entry?.quantity) || 0);
    }, 0);
    return [{
      orderId: Number(value.orderId) || 0,
      email: typeof value.email === "string" ? value.email : "Customer",
      date: typeof value.orderDate === "string" ? value.orderDate : new Date().toISOString(),
      status: normalizeStatus(typeof value.orderStatus === "string" ? value.orderStatus : undefined),
      itemCount,
      total: typeof value.totalAmount === "number" ? value.totalAmount : itemsTotal,
      paymentMethod: typeof (value.payment as { paymentMethod?: string } | null | undefined)?.paymentMethod === "string" ? (value.payment as { paymentMethod: string }).paymentMethod : "Not specified",
    }];
  });
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(date));
}

function orderLabel(id: number) {
  return `ORD-${String(id).padStart(4, "0")}`;
}

const navigation = [
  { label: "Dashboard", icon: BarChart3, href: "/dashboard" },
  { label: "My Orders", icon: ClipboardList, href: "/orders" },
  { label: "My Profile", icon: UserRound, href: "/profile" },
  { label: "Addresses", icon: MapPin, href: "/profile" },
];

export function CustomerDashboard({ name, email }: { name: string; email: string }) {
  const pathname = usePathname();
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [addressCount, setAddressCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const accountRef = useRef<HTMLUListElement>(null);
  const accountMenuId = useId();

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      try {
        const [orderResponse, addressResponse] = await Promise.all([
          fetch("/api/orders", { signal: controller.signal, cache: "no-store" }),
          fetch("/api/addresses", { signal: controller.signal, cache: "no-store" }),
        ]);
        if (orderResponse.ok) setOrders(parseOrders(await orderResponse.json().catch(() => null)));
        if (addressResponse.ok) {
          const addressData = await addressResponse.json().catch(() => null) as { payload?: unknown[] } | unknown[];
          setAddressCount(Array.isArray(addressData) ? addressData.length : (addressData as { payload?: unknown[] })?.payload?.length ?? 0);
        }
      } catch {
        if (!controller.signal.aborted) setLoadError(true);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    void load();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!accountOpen) return;
    function handlePointerDown(event: PointerEvent) {
      if (event.target instanceof Node && !accountRef.current?.contains(event.target)) setAccountOpen(false);
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setAccountOpen(false);
    }
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [accountOpen]);

  const pending = orders.filter((order) => order.status === "PENDING" || order.status === "PROCESSING").length;
  const delivered = orders.filter((order) => order.status === "DELIVERED").length;
  const firstName = name.trim().split(/\s+/)[0] || "there";

  return (
    <div className="flex min-w-[1180px] bg-[#f8f9fb] font-sans">
      <aside className="sticky top-0 flex h-screen w-64 shrink-0 flex-col bg-slate-900 px-4 py-6 text-slate-300">
        <Link href="/dashboard" className="mb-9 flex items-center gap-3 px-3">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-indigo-400 to-violet-700 shadow-lg shadow-indigo-950/40"><ShoppingBag className="h-5 w-5 text-white" /></span>
          <span className="leading-tight"><span className="block text-base font-bold text-white">E-Commerce</span><span className="block text-xs font-semibold tracking-wide text-indigo-400">Customer</span></span>
        </Link>
        <nav className="grid gap-1.5">
          {navigation.map(({ label, icon: Icon, href }) => {
            const isActive = href === "/dashboard" ? pathname === href : pathname.startsWith(href);
            return <Link key={label} href={href} className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${isActive ? "bg-indigo-600 text-white shadow-md shadow-indigo-950/30" : "hover:bg-slate-800 hover:text-white"}`}><Icon className="h-[18px] w-[18px]" />{label}</Link>;
          })}
        </nav>
        <div className="mt-5 grid gap-1.5">
          <Link href="/products" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white"><ShoppingCart className="h-[18px] w-[18px]" />Continue Shopping</Link>
        </div>
        <div className="mt-auto border-t border-slate-700 pt-5">
          <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white" onClick={() => void signOut({ callbackUrl: "/login" })}><LogOut className="h-[18px] w-[18px]" />Logout</button>
        </div>
      </aside>

      <div className="min-h-screen flex-1">
        <header className="sticky top-0 z-40 flex h-[82px] items-center justify-between border-b bg-white px-8">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-800">Dashboard</h1>
            <p className="text-xs text-slate-400">Welcome back, {firstName}!</p>
          </div>
          <div className="flex items-center gap-5">
            <NotificationsBell variant="storefront" />
            <div className="relative border-l border-gray-200 pl-5">
              <button type="button" aria-label="Account information" aria-expanded={accountOpen} aria-controls={accountMenuId} onClick={() => setAccountOpen((open) => !open)} className="flex cursor-pointer items-center gap-3 rounded-lg p-2 text-left transition hover:bg-slate-50">
                <UserAvatar className="h-10 w-10 shrink-0 rounded-full object-cover" fallback={<span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-indigo-50 text-indigo-600"><UserRound className="h-5 w-5" aria-hidden="true" /></span>} />
                <span className="min-w-0 leading-tight">
                  <span className="block max-w-44 truncate text-sm font-semibold text-slate-800">{name}</span>
                  <span className="block max-w-44 truncate text-xs text-slate-400">{email || "No email available"}</span>
                </span>
                <ChevronDown aria-hidden="true" className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${accountOpen ? "rotate-180" : ""}`} />
              </button>
              <ul ref={accountRef} id={accountMenuId} hidden={!accountOpen} className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-xl border border-slate-200 bg-white text-sm shadow-lg">
                <li><Link href="/profile" onClick={() => setAccountOpen(false)} className="flex items-center gap-2 rounded-lg px-3 py-2.5 font-medium text-slate-700 transition hover:bg-indigo-50 hover:text-indigo-600"><UserRound className="h-4 w-4" aria-hidden="true" />My profile</Link></li>
                <li><Link href="/orders" onClick={() => setAccountOpen(false)} className="flex items-center gap-2 rounded-lg px-3 py-2.5 font-medium text-slate-700 transition hover:bg-indigo-50 hover:text-indigo-600"><ClipboardList className="h-4 w-4" aria-hidden="true" />My orders</Link></li>
                <li><button type="button" onClick={() => void signOut({ callbackUrl: "/login" })} className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 font-medium text-red-600 transition hover:bg-red-50"><LogOut className="h-4 w-4" aria-hidden="true" />Log out</button></li>
              </ul>
            </div>
          </div>
        </header>

        <main className="space-y-6 p-6">
          {loadError && !loading && <p role="alert" className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">Some live data could not be loaded; showing what is available.</p>}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard icon={ShoppingCart} iconBg="bg-blue-50 text-blue-600" label="Total Orders" value={String(orders.length)} subtitle="Placed on your account" />
            <StatCard icon={Timer} iconBg="bg-amber-50 text-amber-600" label="In Progress" value={String(pending)} subtitle="Pending or processing" />
            <StatCard icon={CheckCircle2} iconBg="bg-emerald-50 text-emerald-600" label="Delivered" value={String(delivered)} subtitle="Completed orders" />
            <StatCard icon={MapPin} iconBg="bg-violet-50 text-violet-600" label="Saved Addresses" value={String(addressCount)} subtitle="Ready for checkout" />
          </div>

          <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
              <div>
                <h2 className="text-sm font-bold text-slate-800">Recent orders</h2>
                <p className="mt-0.5 text-xs text-slate-400">{loading ? "Loading your orders…" : `${orders.length} order${orders.length === 1 ? "" : "s"} on your account`}</p>
              </div>
              <Link href="/orders" className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50">View all orders</Link>
            </div>

            {loading ? (
              <div className="space-y-3 p-5" role="status" aria-label="Loading orders">
                {Array.from({ length: 3 }, (_, index) => <div key={index} className="h-14 animate-pulse rounded-xl bg-slate-100" />)}
              </div>
            ) : orders.length === 0 ? (
              <div className="p-12 text-center">
                <Package className="mx-auto h-8 w-8 text-indigo-300" />
                <p className="mt-3 text-sm font-semibold text-slate-700">No orders yet</p>
                <p className="mt-1 text-sm text-slate-500">When you place an order, it will show up here.</p>
                <Link href="/products" className="mt-6 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"><ShoppingCart className="h-4 w-4" />Start shopping</Link>
              </div>
            ) : (
              <div className="max-h-120 overflow-auto">
                <table className="w-full min-w-140 text-sm">
                  <thead className="sticky top-0 z-10 bg-slate-50/95 text-left text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400 backdrop-blur">
                    <tr className="border-b border-slate-200">
                      <th className="px-5 py-3">Order</th>
                      <th className="px-5 py-3">Date</th>
                      <th className="px-5 py-3">Items</th>
                      <th className="px-5 py-3">Payment</th>
                      <th className="px-5 py-3">Total</th>
                      <th className="px-5 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {orders.slice(0, 8).map((order) => (
                      <tr key={order.orderId} className="transition-colors hover:bg-indigo-50/30">
                        <td className="px-5 py-3.5"><Link href={`/orders/${order.orderId}`} className="font-semibold text-indigo-600 hover:text-indigo-800">{orderLabel(order.orderId)}</Link></td>
                        <td className="px-5 py-3.5 text-slate-500">{formatDate(order.date)}</td>
                        <td className="px-5 py-3.5 text-slate-500">{order.itemCount} item{order.itemCount === 1 ? "" : "s"}</td>
                        <td className="px-5 py-3.5 text-slate-500">{order.paymentMethod}</td>
                        <td className="px-5 py-3.5 font-semibold text-slate-800">{currency.format(order.total)}</td>
                        <td className="px-5 py-3.5"><span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${Status[order.status]}`}>{order.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </main>

        <footer className="py-4 text-center text-sm text-gray-400">© 2026 IndigoStore. All rights reserved.</footer>
      </div>
    </div>
  );
}