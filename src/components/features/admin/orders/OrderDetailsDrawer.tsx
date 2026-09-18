"use client";

import { useEffect, useRef } from "react";
import { CreditCard, MapPin, Printer, RefreshCw, User, X } from "lucide-react";
import { currency, formatDate, orderLabel, ORDER_STATUSES, timelineFor, type Order, type OrderStatusKey } from "./orders-data";
import { OrderStatusBadge } from "./OrderStatusBadge";
import { OrderTimeline } from "./OrderTimeline";

export function OrderDetailsDrawer({ order, busy, onClose, onUpdateStatus, onPrint }: {
  order: Order | null;
  busy: boolean;
  onClose: () => void;
  onUpdateStatus: (status: OrderStatusKey) => void;
  onPrint: () => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const lastFocused = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (order) {
      lastFocused.current = document.activeElement as HTMLElement | null;
      closeRef.current?.focus();
      return;
    }
    return undefined;
  }, [order]);

  useEffect(() => {
    if (!order) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [order, onClose]);

  if (!order) return null;

  const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="fixed inset-0 z-50" role="presentation">
      <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px]" onClick={onClose} aria-hidden="true" />
      <div role="dialog" aria-modal="true" aria-labelledby="order-drawer-title" className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-white shadow-2xl">
        <header className="flex items-start justify-between gap-3 border-b border-gray-100 px-6 py-5">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 id="order-drawer-title" className="text-lg font-bold text-slate-800">{orderLabel(order.orderId)}</h2>
              <OrderStatusBadge status={order.status} />
            </div>
            <p className="mt-1 text-sm text-slate-500">Placed on {formatDate(order.date)}</p>
          </div>
          <button ref={closeRef} type="button" onClick={onClose} aria-label="Close order details" className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500">
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </header>

        <div className="flex-1 space-y-6 overflow-y-auto px-6 py-5">
          <section>
            <h3 className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400"><User className="h-4 w-4" aria-hidden="true" />Customer</h3>
            <div className="mt-3 flex items-center gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-indigo-50 text-sm font-bold text-indigo-600" aria-hidden="true">
                {order.customer.name.slice(0, 1).toUpperCase()}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-800">{order.customer.name}</p>
                <p className="truncate text-xs text-slate-400">{order.customer.email}</p>
              </div>
            </div>
          </section>

          <section>
            <h3 className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400"><MapPin className="h-4 w-4" aria-hidden="true" />Shipping address</h3>
            <div className="mt-3 rounded-xl border border-gray-100 bg-slate-50/60 p-4 text-sm leading-6 text-slate-600">
              <p className="font-medium text-slate-700">{order.customer.name}</p>
              <p>{order.shippingAddress.street}</p>
              <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.pincode}</p>
              <p>{order.shippingAddress.country}</p>
            </div>
          </section>

          <section>
            <h3 className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400"><CreditCard className="h-4 w-4" aria-hidden="true" />Payment information</h3>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-gray-100 bg-white p-3">
                <p className="text-xs text-slate-400">Method</p>
                <p className="mt-0.5 text-sm font-medium text-slate-700">{order.paymentMethod}</p>
              </div>
              <div className="rounded-xl border border-gray-100 bg-white p-3">
                <p className="text-xs text-slate-400">Payment</p>
                <p className="mt-0.5 text-sm font-medium capitalize text-slate-700">{order.payment.toLowerCase()}</p>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">Order items <span className="normal-case text-slate-300">({itemCount})</span></h3>
            <div className="mt-3 overflow-hidden rounded-xl border border-gray-100">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  <tr>
                    <th className="px-4 py-2.5">Product</th>
                    <th className="px-3 py-2.5 text-right">Qty</th>
                    <th className="px-4 py-2.5 text-right">Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {order.items.map((item) => (
                    <tr key={item.sku}>
                      <td className="px-4 py-3">
                        <p className="font-medium text-slate-700">{item.name}</p>
                        <p className="text-xs text-slate-400">{item.sku}</p>
                      </td>
                      <td className="px-3 py-3 text-right tabular-nums text-slate-500">{item.quantity}</td>
                      <td className="px-4 py-3 text-right tabular-nums font-medium text-slate-700">{currency.format(item.price)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between"><dt className="text-slate-500">Subtotal</dt><dd className="tabular-nums font-medium text-slate-700">{currency.format(order.subTotal)}</dd></div>
              <div className="flex justify-between"><dt className="text-slate-500">Shipping</dt><dd className="tabular-nums font-medium text-slate-700">{order.shippingCost ? currency.format(order.shippingCost) : "Free"}</dd></div>
              <div className="flex justify-between"><dt className="text-slate-500">Discount</dt><dd className="tabular-nums font-medium text-emerald-600">−{currency.format(order.discount)}</dd></div>
              <div className="flex justify-between"><dt className="text-slate-500">Tax</dt><dd className="tabular-nums font-medium text-slate-700">{currency.format(order.tax)}</dd></div>
              <div className="flex justify-between border-t border-gray-100 pt-3 text-base"><dt className="font-bold text-slate-800">Total</dt><dd className="font-bold tabular-nums text-slate-900">{currency.format(order.total)}</dd></div>
            </dl>
          </section>

          <section>
            <h3 className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">Order timeline</h3>
            <div className="mt-4"><OrderTimeline steps={timelineFor(order)} /></div>
          </section>
        </div>

        <footer className="flex items-center gap-3 border-t border-gray-100 px-6 py-4">
          <label className="relative flex flex-1 items-center gap-2">
            <span className="sr-only">Update order status</span>
            <RefreshCw className="pointer-events-none absolute left-3 h-4 w-4 text-slate-400" aria-hidden="true" />
            <select
              value={order.status}
              disabled={busy}
              onChange={(event) => onUpdateStatus(event.target.value as OrderStatusKey)}
              className="h-10 w-full appearance-none rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-8 text-sm font-semibold text-slate-700 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 disabled:opacity-60"
            >
              {ORDER_STATUSES.map((status) => <option key={status} value={status}>{status.charAt(0) + status.slice(1).toLowerCase()}</option>)}
            </select>
          </label>
          <button type="button" onClick={onPrint} className="inline-flex h-10 shrink-0 items-center gap-2 rounded-lg bg-indigo-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
            <Printer className="h-4 w-4" aria-hidden="true" />Print Invoice
          </button>
        </footer>
      </div>
    </div>
  );
}