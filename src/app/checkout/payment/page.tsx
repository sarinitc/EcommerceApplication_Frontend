"use client";

import Link from "next/link";
import { useState } from "react";
import { addToast } from "@heroui/toast";
import { useCart } from "@/components/features/cart/CartContext";

export default function CheckoutPaymentPage() {
  const { items } = useCart();
  const [isPaid, setIsPaid] = useState(false);
  const subtotal = items.reduce((total, item) => total + item.price * item.quantity, 0);
  const shipping = items.length ? 5 : 0;
  const total = subtotal + shipping;

  function completeDemoPayment() {
    setIsPaid(true);
    addToast({
      title: "Payment successful",
      description: "Your demo payment was completed successfully.",
      color: "success",
      severity: "success",
      variant: "solid",
      timeout: 5000,
      shouldShowTimeoutProgress: true,
    });
  }

  return (
    <main className="min-h-screen bg-canvas text-[#172033]">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10">
          <Link href="/" className="font-display text-2xl font-bold tracking-[-.05em] text-brand">IndigoStore</Link>
          <span className="flex items-center gap-2 text-sm font-medium text-slate-600">Secure Checkout</span>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-5 pb-12 pt-8 sm:px-8">
        <nav className="mx-auto mb-10 flex max-w-2xl items-center justify-center gap-3 text-xs font-semibold text-slate-500" aria-label="Checkout progress">
          <span className="flex items-center gap-2 text-brand"><span className="grid h-7 w-7 place-items-center rounded-full bg-brand text-white">1</span>Shipping</span>
          <span className="h-px w-12 bg-brand sm:w-24" />
          <span className="flex items-center gap-2 text-brand"><span className="grid h-7 w-7 place-items-center rounded-full bg-brand text-white">2</span>Payment</span>
          <span className="h-px w-12 bg-slate-200 sm:w-24" />
          <span className="flex items-center gap-2"><span className="grid h-7 w-7 place-items-center rounded-full bg-slate-200">3</span>Review</span>
        </nav>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_8px_22px_rgba(23,32,51,.08)] sm:p-8">
            <div className="flex items-start gap-3">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand text-sm font-bold text-white">2</span>
              <div>
                <h1 className="text-xl font-bold">Payment Method</h1>
                <p className="mt-1 text-sm text-slate-500">Choose how you would like to pay for your order.</p>
              </div>
            </div>

            <div className="mt-8 rounded-xl border-2 border-brand bg-brand-light/40 p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-bold text-slate-800">Online payment</p>
                  <p className="mt-1 text-sm text-slate-500">ABA Payway integration coming soon</p>
                </div>
                <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-brand">Demo</span>
              </div>
            </div>

            <div className="mt-6 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm text-slate-600">
              This is a demo payment step. No payment will be processed yet. The ABA Payway checkout will be connected here next.
            </div>

            {isPaid && <div role="status" className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-sm text-emerald-800"><p className="font-bold">Demo payment successful</p><p className="mt-1">Your order has been marked as paid for testing. Reference: DEMO-000001</p></div>}

            <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
              <Link href="/checkout" className="rounded-xl border border-slate-300 px-5 py-3 text-center text-sm font-bold text-slate-700 transition hover:bg-slate-50">Back to Shipping</Link>
              <button type="button" onClick={completeDemoPayment} disabled={isPaid || items.length === 0} className="rounded-xl bg-[#c94f2c] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#b94527] disabled:cursor-not-allowed disabled:opacity-50">{isPaid ? "Payment Successful" : `Complete Demo Payment $${total.toFixed(2)}`}</button>
            </div>
          </section>

          <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_8px_22px_rgba(23,32,51,.08)]">
            <h2 className="text-lg font-bold">Order Summary</h2>
            <p className="mt-1 text-sm text-slate-500">{items.length} {items.length === 1 ? "product" : "products"}</p>
            <div className="mt-5 space-y-3 border-y border-slate-200 py-5 text-sm">
              <div className="flex justify-between"><span>Subtotal</span><strong>${subtotal.toFixed(2)}</strong></div>
              <div className="flex justify-between"><span>Shipping</span><span>${shipping.toFixed(2)}</span></div>
            </div>
            <div className="mt-5 flex items-center justify-between"><strong className="text-lg">Total</strong><strong className="text-2xl">${total.toFixed(2)}</strong></div>
          </aside>
        </div>
      </div>
    </main>
  );
}
