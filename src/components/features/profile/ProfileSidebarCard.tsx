"use client";
import Link from "next/link";
import { ChevronRight, CreditCard, Crown, LogOut, MapPin, Package, ShieldCheck, ShoppingBag, UserRound } from "lucide-react";
import { AvatarUpload } from "./AvatarUpload";

export function ProfileSidebarCard({ name, email, image, onPersonalInfo, onLogout, onAvatarChange }: { name: string; email: string; image?: string | null; onPersonalInfo: () => void; onLogout: () => void; onAvatarChange: (url: string | null) => void | Promise<void> }) {
  const row = "flex min-h-14 w-full cursor-pointer items-center gap-4 rounded-xl px-4 py-3 text-left text-sm font-medium text-[#111344] transition-all duration-150 hover:bg-indigo-50/70 focus-visible:outline-2 focus-visible:outline-indigo-500";
  const icon = "shrink-0 text-[#343484]";
  return <aside className="relative min-w-0 overflow-hidden rounded-2xl border border-[#e7eafa] bg-white/95 p-3 shadow-[0_4px_24px_#454b9b06] sm:p-5">
    <div aria-hidden="true" className="absolute inset-x-0 top-0 h-20 border-b border-white bg-[linear-gradient(132deg,_#f6f1ff_5%,_#f7f8ff_45%,_#e5efff_45%,_#f6f5ff_70%,_#eeebff_70%)]" />
    <div className="relative flex flex-col items-center border-b border-[#ebedf8] pt-16 pb-5">
      <div className="relative -mt-14 z-10">
        <AvatarUpload currentAvatarUrl={image} userName={name} onUploadSuccess={onAvatarChange} />
      </div>
      <div className="mt-3 text-center">
        <h2 className="whitespace-nowrap text-lg font-semibold text-slate-900">{name}</h2>
        <p className="mt-1 text-sm text-slate-500">{email}</p>
        <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-[#f5f5fd] px-2 py-1 text-[10px] text-[#626b96]"><Crown size={13} className="shrink-0 fill-amber-400 text-amber-500" />Member since January 2024 <span className="sr-only">(demo date)</span></p>
      </div>
    </div>
    <nav aria-label="Account navigation" className="my-4 space-y-1.5"><button onClick={onPersonalInfo} className={`${row} bg-gradient-to-r from-indigo-50 to-[#f5f2ff] text-[#5945ff]`}><UserRound size={23} className="shrink-0 fill-indigo-100 text-[#6366f1]" /><span className="flex-1">Personal Information</span><ChevronRight size={18} className="text-[#6366f1]" /></button><Link href="/account/orders" className={row}><Package size={23} className={icon} /><span className="flex-1">My Orders</span><ChevronRight size={18} className="text-[#959dc1]" /></Link>
      {[{ label: "Addresses", icon: MapPin }, { label: "Payment Methods", icon: CreditCard }].map(({ label, icon: Icon }) => <button key={label} disabled className="flex w-full cursor-not-allowed items-center gap-3 rounded-xl p-4 text-left text-sm font-semibold text-gray-600 opacity-60"><Icon size={20} className={icon} /><span className="flex-1">{label}</span><span className="rounded-md bg-gray-100 px-2 py-1 text-[10px]">Soon</span></button>)}
      <a href="#account-security" className={row}><ShieldCheck size={23} className={icon} /><span className="flex-1">Security</span><ChevronRight size={18} className="text-[#959dc1]" /></a>
    </nav><button onClick={onLogout} className="flex min-h-12 w-full cursor-pointer items-center justify-center gap-3 rounded-xl border border-rose-200 bg-rose-50/40 p-3 text-sm font-semibold text-red-600 transition-all duration-150 hover:bg-red-50"><LogOut size={20} />Log out</button>
    <Link href="/products" className="relative mt-7 flex items-center gap-4 overflow-hidden rounded-xl bg-[linear-gradient(135deg,_#fafaff_5%,_#eff1ff_50%,_#e7e1ff_100%)] px-4 py-5 transition-all duration-150 hover:shadow-md"><span className="grid h-14 w-14 shrink-0 -rotate-12 place-items-center rounded-xl bg-gradient-to-br from-indigo-200 to-[#7560fa] text-white shadow-[5px_8px_12px_#6366f126]"><ShoppingBag size={33} strokeWidth={1.4} /></span><span className="min-w-0"><strong className="block text-sm font-semibold text-[#252263]">Shop more, live better</strong><span className="mt-1 block text-[11px] leading-5 text-[#69739e]">Great products. A brighter you.</span></span></Link>
  </aside>;
}
