"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/features/cart/CartContext";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";

function Icon({ name, className = "" }: { name: "bag" | "minus" | "plus" | "search" | "trash" | "user"; className?: string }) {
  const paths = {
    bag: <><path d="M5 8h14l-1 12H6z" /><path d="M9 8V6a3 3 0 0 1 6 0v2" /></>, minus: <path d="M5 12h14" />, plus: <path d="M12 5v14M5 12h14" />, search: <><circle cx="11" cy="11" r="6" /><path d="m20 20-4.2-4.2" /></>, trash: <><path d="M4 7h16M10 11v6m4-6v6M6 7l1 13h10l1-13M9 7V4h6v3" /></>, user: <><circle cx="12" cy="8" r="3.5" /><path d="M5 21a7 7 0 0 1 14 0" /></>,
  };
  return <svg aria-hidden="true" viewBox="0 0 24 24" className={className}>{paths[name]}</svg>;
}

export default function CartPage() {
  const { items, itemCount, removeItem, updateQuantity } = useCart();
  const router = useRouter();
  const subtotal = items.reduce((total, item) => total + item.quantity * item.price, 0);
  const discount = subtotal >= 250 ? 15 : 0;
  const total = subtotal - discount;

  function handleRemoveItem(id: number, variant: string) {
    const isLastItem = items.length === 1;
    removeItem(id, variant);

    if (isLastItem) {
      router.push("/products");
    }
  }

  return <main className="flex min-h-screen flex-col bg-canvas text-ink"><SiteHeader />
    <div className="mx-auto w-full max-w-7xl flex-1 px-5 py-9 sm:px-8 lg:px-10"><h1 className="text-3xl font-bold tracking-[-.05em]">Shopping Cart</h1><p className="mt-2 text-sm text-slate-500">You have {itemCount} {itemCount === 1 ? "item" : "items"} in your cart.</p><div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1.55fr)_minmax(320px,.75fr)]"><section className="grid gap-5">{items.length ? items.map((item) => <article className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_5px_12px_rgba(23,32,51,.08)] sm:items-center" key={`${item.id}-${item.variant}`}><div className="h-22 w-22 shrink-0 overflow-hidden rounded-lg bg-slate-100"><div className="h-full w-full bg-cover bg-center" style={{ backgroundImage: `url(${item.image})` }} /></div><div className="min-w-0 flex-1"><h2 className="text-lg font-bold">{item.name}</h2><p className="mt-1 text-sm text-slate-500">{item.variant}</p><p className="mt-1 text-xs text-slate-500">{item.stock} available</p><div className="mt-3 flex h-8 w-fit items-center overflow-hidden rounded-lg border border-slate-300"><button className="grid h-full w-8 place-items-center text-slate-500 hover:bg-slate-50" onClick={() => updateQuantity(item.id, item.variant, -1)} aria-label={`Decrease ${item.name}`}><Icon name="minus" className="h-3.5 w-3.5 fill-none stroke-current stroke-2" /></button><span className="grid h-full w-9 place-items-center border-x border-slate-300 text-sm font-semibold">{item.quantity}</span><button className="grid h-full w-8 place-items-center text-slate-500 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-35" disabled={item.quantity >= item.stock} onClick={() => updateQuantity(item.id, item.variant, 1)} aria-label={`Increase ${item.name}`}><Icon name="plus" className="h-3.5 w-3.5 fill-none stroke-current stroke-2" /></button></div></div><div className="flex self-stretch flex-col items-end justify-between"><button className="grid h-8 w-8 place-items-center text-slate-400 hover:text-[#b7432a]" onClick={() => handleRemoveItem(item.id, item.variant)} aria-label={`Remove ${item.name}`}><Icon name="trash" className="h-5 w-5 fill-none stroke-current stroke-[1.7]" /></button><strong className="text-xl text-brand-deep">${(item.price * item.quantity).toFixed(2)}</strong></div></article>) : <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center"><p className="text-slate-500">Your cart is empty.</p><Link className="mt-4 inline-block font-semibold text-brand" href="/products">Continue shopping</Link></div>}</section>
      {items.length > 0 && <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-7 shadow-[0_5px_12px_rgba(23,32,51,.08)]"><h2 className="text-xl font-bold">Order Summary</h2><div className="mt-5 border-t border-slate-200 pt-5 text-sm"><div className="flex justify-between"><span className="text-slate-600">Subtotal ({itemCount} items)</span><span>${subtotal.toFixed(2)}</span></div><div className="mt-4 flex justify-between"><span className="text-[#c45c25]">Discount (SUMMER15)</span><span className="text-[#c45c25]">-${discount.toFixed(2)}</span></div><div className="mt-4 flex justify-between"><span className="text-slate-600">Shipping</span><span>Free</span></div></div><div className="mt-6 flex items-end justify-between border-t border-slate-200 pt-6"><strong className="text-xl">Total</strong><strong className="text-3xl text-brand-deep">${total.toFixed(2)}</strong></div><button className="mt-8 w-full rounded-xl bg-brand py-4 text-sm font-bold text-white shadow-[0_9px_18px_rgba(64,56,220,.22)] transition hover:bg-brand-hover" onClick={() => router.push("/checkout")}>Proceed to Checkout →</button><Link className="mt-3 flex w-full items-center justify-center rounded-xl border border-brand/40 py-3 text-sm text-slate-600 hover:bg-[#f7f8ff]" href="/products">← Continue Shopping</Link></aside>}</div></div>
    <SiteFooter />
  </main>;
}
