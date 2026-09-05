"use client";

import Link from "next/link";
import { useState } from "react";
import { addToast } from "@heroui/toast";
import { useCart } from "@/src/components/cart/CartContext";
import type { Promotion, PromotionListResponse } from "@/src/types/promotion";

type Address = {
  label: string;
  name: string;
  lines: string[];
  icon: "home" | "office";
};

const addresses: Address[] = [
  { label: "Home", name: "Jane Doe", lines: ["123 Market Lane, Apt 4B", "San Francisco, CA 94105", "United States"], icon: "home" },
  { label: "Office", name: "Jane Doe", lines: ["456 Commerce Blvd, Suite 100", "San Francisco, CA 94107", "United States"], icon: "office" },
];

function Icon({ name, className = "" }: { name: "check" | "home" | "lock" | "office" | "package"; className?: string }) {
  const paths = {
    check: <path d="m5 12 4.2 4.2L19 6.8" />,
    home: <><path d="m3.5 10 8.5-7 8.5 7" /><path d="M5.5 9v11h13V9M9.5 20v-6h5v6" /></>,
    lock: <><rect x="5" y="10" width="14" height="10" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3" /></>,
    office: <><path d="M5 21V4h14v17M9 8h1m4 0h1M9 12h1m4 0h1M9 16h1m4 0h1M3 21h18" /></>,
    package: <><path d="m3 7 9-4 9 4-9 4-9-4Z" /><path d="M3 7v10l9 4 9-4V7M12 11v10" /></>,
  };
  return <svg aria-hidden="true" viewBox="0 0 24 24" className={className}>{paths[name]}</svg>;
}

function Progress({ currentStep }: { currentStep: number }) {
  const steps = ["Shipping", "Payment", "Review"];
  return <ol className="mx-auto flex w-full max-w-2xl items-center" aria-label="Checkout progress">{steps.map((step, index) => <li className="flex flex-1 items-center last:flex-none" key={step}><div className="flex flex-col items-center"><span className={`grid h-8 w-8 place-items-center rounded-full text-xs font-bold transition-all duration-300 ${index < currentStep ? "bg-[#382bd5] text-white shadow-[0_4px_10px_rgba(56,43,213,.3)]" : index === currentStep ? "bg-[#382bd5] text-white ring-4 ring-[#e8e6ff]" : "bg-slate-200 text-slate-500"}`}>{index < currentStep ? <Icon name="check" className="h-4 w-4 fill-none stroke-current stroke-[2.5]" /> : index + 1}</span><span className={`mt-2 text-xs font-semibold ${index === currentStep ? "text-[#3028bc]" : "text-slate-500"}`}>{step}</span></div>{index < steps.length - 1 && <span className={`mx-3 mb-5 h-0.5 flex-1 transition-colors duration-300 ${index < currentStep ? "bg-[#4b40df]" : "bg-slate-200"}`} />}</li>)}</ol>;
}

function AddAddressForm({ onCancel, onSave }: { onCancel: () => void; onSave: (address: Address) => void }) {
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const data = new FormData(event.currentTarget);
    const street = String(data.get("street"));
    const landmark = String(data.get("landmark"));
    const city = String(data.get("city"));
    const state = String(data.get("state"));
    const country = String(data.get("country"));
    const postalCode = String(data.get("postalCode"));
    const request = {
      street,
      buildingName: landmark || undefined,
      city,
      state: state || undefined,
      country,
      pincode: postalCode,
    };

    setIsSaving(true);
    try {
      const response = await fetch("/api/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request),
      });
      const result = await response.json().catch(() => null) as { message?: string; payload?: typeof request } | null;
      if (!response.ok) {
        setError(result?.message ?? "We could not save this address. Please try again.");
        return;
      }
      const savedAddress = result?.payload ?? request;
      const lines = [savedAddress.street, savedAddress.buildingName, `${savedAddress.city}, ${savedAddress.state ?? ""} ${savedAddress.pincode}`, savedAddress.country]
        .filter((line): line is string => Boolean(line));
      onSave({
        label: "New address",
        name: "Delivery address",
        lines,
      icon: "home",
      });
    } catch {
      setError("Unable to reach the address service. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }

  const inputClass = "mt-2 w-full rounded-lg border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#4b35d5] focus:ring-3 focus:ring-[#e9e6ff]";
  const labelClass = "text-sm font-semibold text-slate-800";

  return <main className="min-h-screen bg-[#f8faff] px-4 py-6 text-[#172033] sm:px-8 sm:py-10"><div className="mx-auto max-w-3xl"><header className="mb-6"><button type="button" onClick={onCancel} className="inline-flex h-10 w-10 items-center justify-center rounded-full text-xl text-slate-700 transition hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4b35d5]" aria-label="Back to addresses">←</button><h1 className="mt-2 text-2xl font-bold tracking-tight">Add New Address</h1><nav className="mt-2 flex items-center gap-2 text-xs font-medium text-slate-500" aria-label="Breadcrumb"><span>Account</span><span>›</span><span className="text-[#4b35d5]">My Addresses</span><span>›</span><span>Add New Address</span></nav></header><form onSubmit={handleSubmit} className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_10px_30px_rgba(23,32,51,.07)]"><div className="p-5 sm:p-7"><h2 className="text-lg font-bold">Address Information</h2><p className="mt-1 text-sm text-slate-500">Fill in the details below to add a new address.</p><div className="mt-7 grid gap-x-5 gap-y-5 sm:grid-cols-2"><label className={labelClass}>Street Address <span className="text-red-500">*</span><input name="street" required className={inputClass} placeholder="House No, Street Name" /></label><label className={labelClass}>Building Name / Landmark <span className="font-normal text-slate-500">(Optional)</span><input name="landmark" className={inputClass} placeholder="Near Vattanac Bank" /></label><label className={labelClass}>City / Town <span className="text-red-500">*</span><input name="city" required className={inputClass} placeholder="Phnom Penh" /></label><label className={labelClass}>State / Province <span className="font-normal text-slate-500">(Optional)</span><input name="state" className={inputClass} placeholder="Phnom Penh" /></label><label className={labelClass}>Country <span className="text-red-500">*</span><select name="country" required defaultValue="Cambodia" className={inputClass}><option>Cambodia</option><option>Thailand</option><option>Vietnam</option></select></label><label className={labelClass}>Postal Code <span className="text-red-500">*</span><input name="postalCode" required className={inputClass} placeholder="12000" /></label><label className={`${labelClass} sm:col-span-2`}>Phone Number <span className="font-normal text-slate-500">(Optional)</span><input name="phone" type="tel" className={inputClass} placeholder="012 345 678" /><span className="mt-1.5 block text-xs font-normal text-slate-500">For delivery purposes</span></label></div><label className="mt-7 flex cursor-pointer items-start gap-3"><input name="default" type="checkbox" defaultChecked className="mt-0.5 h-4 w-4 accent-[#4b35d5]" /><span><span className="block text-sm font-semibold">Set as default address</span><span className="mt-1 block text-xs text-slate-500">This will be used as your default shipping address.</span></span></label>{error && <p className="mt-5 rounded-lg bg-red-50 p-3 text-sm font-medium text-red-700" role="alert">{error}</p>}</div><div className="grid gap-3 border-t border-slate-100 px-5 py-5 sm:grid-cols-2 sm:px-7"><button type="button" onClick={onCancel} disabled={isSaving} className="rounded-lg border border-slate-200 bg-white py-3 text-sm font-bold transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4b35d5]">Cancel</button><button type="submit" disabled={isSaving} className="rounded-lg bg-[#4b35d5] py-3 text-sm font-bold text-white shadow-[0_7px_16px_rgba(75,53,213,.28)] transition hover:bg-[#3d2ab7] disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4b35d5]">{isSaving ? "Saving…" : "Save Address"}</button></div><div className="mx-5 mb-5 rounded-lg bg-[#f5f3ff] p-4 text-sm text-slate-600 sm:mx-7 sm:mb-7"><strong className="text-[#4b35d5]">💡 Tips</strong><p className="mt-2 text-xs">Make sure your address is correct to ensure smooth and fast delivery.</p></div></form></div></main>;
}

export default function CheckoutPage() {
  const { items } = useCart();
  const [checkoutAddresses, setCheckoutAddresses] = useState<Address[]>(addresses);
  const [selectedAddress, setSelectedAddress] = useState(0);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromotion, setAppliedPromotion] = useState<Promotion | null>(null);
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);
  const [paymentStep, setPaymentStep] = useState(false);
  const subtotal = items.reduce((total, item) => total + item.price * item.quantity, 0);
  const discount = appliedPromotion
    ? Math.min(subtotal, appliedPromotion.discountType === "PERCENTAGE" ? subtotal * (appliedPromotion.discountValue / 100) : appliedPromotion.discountValue)
    : 0;
  const total = subtotal - discount;
  const promoApplied = Boolean(appliedPromotion);

  function setPromoApplied(value: boolean) {
    if (value) void applyPromotion();
    else setAppliedPromotion(null);
  }

  function showPromotionMessage(message: string, isSuccess = false) {
    addToast({
      title: isSuccess ? "Promotion applied" : "Promotion code not applied",
      description: message,
      color: isSuccess ? "success" : "danger",
      severity: isSuccess ? "success" : "danger",
      variant: "solid",
      timeout: 4000,
      shouldShowTimeoutProgress: true,
    });
  }

  async function applyPromotion() {
    const code = promoCode.trim().toLocaleLowerCase();
    if (!code || isApplyingPromo) return;
    setIsApplyingPromo(true);
    try {
      const response = await fetch("/api/promotions", { cache: "no-store" });
      const result = await response.json().catch(() => null) as PromotionListResponse | null;
      if (!response.ok) {
        showPromotionMessage(result?.message ?? "Unable to load promotions.");
        return;
      }
      const promotion = result?.payload?.find((item) => item.code.trim().toLocaleLowerCase() === code);
      const now = new Date();
      if (!promotion) showPromotionMessage("That promotion code is not valid. Please check the code and try again.");
      else if (!promotion.active || new Date(promotion.startDate) > now || new Date(promotion.endDate) < now) showPromotionMessage("This promotion is not currently active.");
      else if ((promotion.usageLimit ?? Infinity) <= (promotion.usedCount ?? 0)) showPromotionMessage("This promotion has reached its usage limit.");
      else if (subtotal < (promotion.minimumOrderAmount ?? 0)) showPromotionMessage(`This code requires a minimum order of $${(promotion.minimumOrderAmount ?? 0).toFixed(2)}.`);
      else {
        setAppliedPromotion(promotion);
        showPromotionMessage(`Promotion code ${promotion.code} has been applied successfully.`, true);
      }
    } catch {
      showPromotionMessage("Unable to reach the promotion service. Please try again.");
    } finally {
      setIsApplyingPromo(false);
    }
  }

  if (isAddingAddress) return <AddAddressForm onCancel={() => setIsAddingAddress(false)} onSave={(address) => { setCheckoutAddresses((current) => [...current, address]); setSelectedAddress(checkoutAddresses.length); setIsAddingAddress(false); }} />;

  return <main className="flex min-h-screen flex-col bg-[#f5f7fb] text-[#172033]"><header className="border-b border-slate-200 bg-white"><div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10"><Link href="/" className="font-[Georgia,serif] text-2xl font-bold tracking-[-.05em] text-[#382bd5]">IndigoStore</Link><span className="flex items-center gap-2 text-sm font-medium text-slate-600"><Icon name="lock" className="h-5 w-5 fill-none stroke-[#382bd5] stroke-[1.9]" />Secure Checkout</span></div></header>
    <div className="mx-auto w-full max-w-7xl px-5 pb-9 pt-7 sm:px-8 lg:px-10"><Progress currentStep={paymentStep ? 1 : 0} /></div>
    <div className="mx-auto grid w-full max-w-7xl flex-1 gap-6 px-5 pb-10 sm:px-8 lg:grid-cols-[minmax(0,1.55fr)_370px] lg:px-10"><section className="space-y-5"><div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_8px_22px_rgba(23,32,51,.08)] sm:p-7"><div className="flex items-center gap-3"><span className="grid h-8 w-8 place-items-center rounded-full bg-[#382bd5] text-sm font-bold text-white">1</span><div><h1 className="text-xl font-bold">Shipping Address</h1><p className="mt-0.5 text-sm text-slate-500">Choose where we should deliver your order.</p></div></div><div className="mt-6 grid gap-4 sm:grid-cols-2">{checkoutAddresses.map((address, index) => <button className={`group relative rounded-xl border-2 p-4 text-left outline-none transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_6px_16px_rgba(56,43,213,.12)] focus-visible:ring-4 focus-visible:ring-[#dedaFF] ${selectedAddress === index ? "border-[#4038e8] bg-[#fbfaff]" : "border-slate-200 bg-white hover:border-[#908af0]"}`} key={`${address.label}-${index}`} onClick={() => setSelectedAddress(index)} aria-pressed={selectedAddress === index}><div className="flex items-center gap-2.5"><span className={`grid h-8 w-8 place-items-center rounded-lg ${selectedAddress === index ? "bg-[#e8e6ff] text-[#382bd5]" : "bg-slate-100 text-slate-500"}`}><Icon name={address.icon} className="h-4 w-4 fill-none stroke-current stroke-[1.8]" /></span><strong className="text-sm">{address.label}</strong>{index === 0 && <span className="rounded-full bg-[#eeeDff] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#382bd5]">Default</span>}</div>{selectedAddress === index && <span className="absolute right-4 top-4 grid h-5 w-5 place-items-center rounded-full bg-[#4038e8] text-white"><Icon name="check" className="h-3.5 w-3.5 fill-none stroke-current stroke-[2.5]" /></span>}<p className="mt-4 text-sm leading-5 text-slate-600">{address.name}<br />{address.lines.map((line) => <span key={line}>{line}<br /></span>)}</p></button>)}</div><button type="button" onClick={() => setIsAddingAddress(true)} className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#382bd5] transition hover:text-[#2920a9] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#382bd5]"><span className="text-xl font-normal leading-none">+</span>Add New Address</button></div>
      <div className={`rounded-2xl border bg-white p-5 shadow-[0_8px_22px_rgba(23,32,51,.06)] transition-all duration-300 sm:p-7 ${paymentStep ? "border-[#c7c3ff]" : "border-slate-200"}`}><div className="flex items-center gap-3"><span className={`grid h-8 w-8 place-items-center rounded-full text-sm font-bold ${paymentStep ? "bg-[#382bd5] text-white" : "bg-slate-100 text-slate-500"}`}>{paymentStep ? <Icon name="check" className="h-4 w-4 fill-none stroke-current stroke-[2.5]" /> : "2"}</span><div><h2 className="text-xl font-bold">Payment Method</h2><p className="mt-0.5 text-sm text-slate-500">{paymentStep ? "Payment options are ready." : "Unlock this step after confirming your delivery address."}</p></div>{!paymentStep && <span className="ml-auto flex items-center gap-1.5 text-xs font-semibold text-slate-500"><Icon name="lock" className="h-4 w-4 fill-none stroke-current stroke-2" />Locked</span>}</div>{paymentStep && <div className="mt-6 rounded-xl border border-[#d9d6ff] bg-[#f8f7ff] p-4 text-sm text-[#332dac]">Payment options will appear here in the next checkout step.</div>}</div></section>
      <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_10px_26px_rgba(23,32,51,.13)] sm:p-6 lg:sticky lg:top-6"><h2 className="text-xl font-bold">Order Summary</h2><p className="mt-1 text-sm text-slate-500">{items.length} {items.length === 1 ? "product" : "products"} in your order</p><div className="mt-5 divide-y divide-slate-100 border-y border-slate-200">{items.length ? items.map((item) => <div className="flex gap-3 py-4" key={item.id}><div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-100"><div className="h-full w-full bg-cover bg-center" style={{ backgroundImage: `url(${item.image})` }} /></div><div className="min-w-0 flex-1"><div className="flex gap-2"><p className="min-w-0 flex-1 text-sm font-semibold leading-5 text-slate-800">{item.name}</p><strong className="shrink-0 text-sm">${(item.price * item.quantity).toFixed(2)}</strong></div><p className="mt-1 text-xs text-slate-500">Qty: {item.quantity}</p></div></div>) : <div className="py-8 text-center text-sm text-slate-500"><Icon name="package" className="mx-auto mb-2 h-6 w-6 fill-none stroke-current stroke-[1.7]" />Your cart is empty.</div>}</div><div className="mt-5"><label className="text-sm font-semibold text-slate-700" htmlFor="promo-code">Promo code</label><div className="mt-2 flex gap-2"><input className="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-[#4038e8] focus:ring-3 focus:ring-[#e5e3ff]" id="promo-code" value={promoCode} onChange={(event) => setPromoCode(event.target.value)} placeholder="Enter code" /><button className="rounded-lg border border-[#4038e8] px-3 text-sm font-bold text-[#382bd5] transition hover:bg-[#f0efff] disabled:cursor-not-allowed disabled:opacity-45" disabled={!promoCode.trim() || promoApplied} onClick={() => setPromoApplied(true)}>{promoApplied ? "Applied" : "Apply"}</button></div>{promoApplied && <p className="mt-2 text-xs font-medium text-emerald-700">10% discount applied.</p>}</div><div className="mt-5 space-y-3 border-t border-slate-200 pt-5 text-sm"><div className="flex justify-between text-slate-600"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>{promoApplied && <div className="flex justify-between text-emerald-700"><span>Promo discount</span><span>−${discount.toFixed(2)}</span></div>}<div className="flex justify-between gap-5 text-slate-600"><span>Estimated shipping</span><span className="text-right">$5.00–$12.00</span></div><p className="text-xs leading-4 text-slate-500">Final shipping is calculated after your payment method is selected.</p></div><div className="mt-5 flex items-center justify-between border-t border-slate-200 pt-5"><strong className="text-xl">Total</strong><strong className="text-2xl text-[#172033]">${total.toFixed(2)}</strong></div><button className="mt-6 w-full rounded-xl bg-[#b94f2a] py-3.5 text-sm font-bold text-white shadow-[0_8px_16px_rgba(185,79,42,.28)] transition hover:-translate-y-0.5 hover:bg-[#9e3e1e] focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-[#b94f2a] disabled:cursor-not-allowed disabled:opacity-50" disabled={items.length === 0} onClick={() => setPaymentStep(true)}>Continue to Payment</button></aside></div>
    <footer className="border-t border-slate-200 bg-white"><div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-5 px-5 py-7 text-center sm:flex-row sm:px-8 sm:text-left lg:px-10"><p className="text-sm text-slate-600">© 2026 IndigoStore. All rights reserved.</p><div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs font-medium text-slate-500"><span className="flex items-center gap-1.5"><Icon name="lock" className="h-4 w-4 fill-none stroke-[#382bd5] stroke-2" />Secure payment</span><span>30-day returns</span><span>Support when you need it</span></div></div></footer></main>;
}
