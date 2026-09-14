"use client";

import { useState } from "react";
import Link from "next/link";
import { Box, ChevronDown, Search, ShoppingCart } from "lucide-react";
import { CartBadge } from "@/components/features/cart/CartBadge";

export function ProfileStoreHeader({ name, image, onProfile }: { name: string; image: string; onProfile: () => void }) {
  const [failedImage, setFailedImage] = useState("");
  return <header className="border-b border-indigo-100/70 bg-white/95">
    <div className="mx-auto flex min-h-[76px] max-w-[1440px] flex-wrap items-center gap-5 px-4 py-3 sm:px-6 lg:gap-9">
      <Link href="/" className="flex shrink-0 items-center gap-2 text-2xl font-bold tracking-tight text-[#0c1040]" aria-label="IndigoStore home"><span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-indigo-400 to-indigo-700 text-white shadow-sm"><Box size={22} /></span><span>Indigo<span className="text-[#6366f1]">Store</span></span></Link>
      <Link href="/products" className="hidden min-h-10 flex-1 items-center gap-3 rounded-xl border border-indigo-100 bg-[#f6f6fc] px-4 text-xs text-[#747da5] transition-all duration-150 hover:border-indigo-300 md:flex xl:max-w-sm"><Search size={17} /><span>Explore products, brands, and more...</span></Link>
      <nav aria-label="Store navigation" className="order-last flex w-full items-center gap-6 overflow-x-auto text-[13px] font-medium text-[#343765] sm:order-none sm:w-auto sm:flex-1 sm:justify-center lg:gap-8">
        {[{ href: "/", label: "Home" }, { href: "/products", label: "Shop" }, { href: "/new-arrivals", label: "New Arrivals" }, { href: "/deals", label: "Deals" }].map((item) => <Link key={item.href} href={item.href} className="shrink-0 py-1 transition-all duration-150 hover:text-[#6366f1]">{item.label}</Link>)}
      </nav>
      <div className="ml-auto flex items-center gap-5 sm:gap-7"><Link href="/cart" aria-label="Shopping cart" className="relative rounded-lg p-1 text-[#30366e] transition-all duration-150 hover:bg-indigo-50"><ShoppingCart size={24} /><CartBadge /></Link><button type="button" onClick={onProfile} aria-label="Open personal information" className="flex cursor-pointer items-center gap-3 rounded-lg p-1 transition-all duration-150 hover:bg-indigo-50"><span className="grid h-10 w-10 overflow-hidden rounded-full bg-indigo-100 font-bold text-indigo-600 ring-2 ring-white">
        {/* The account photo can be a local upload preview. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {image && image !== failedImage ? <img src={image} alt="" onError={() => setFailedImage(image)} className="h-full w-full object-cover" /> : <span className="m-auto">{name.charAt(0).toUpperCase()}</span>}
      </span><ChevronDown size={16} className="text-[#30366e]" /></button></div>
    </div>
  </header>;
}
