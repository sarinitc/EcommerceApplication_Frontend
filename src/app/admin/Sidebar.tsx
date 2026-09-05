"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { BarChart3, Boxes, ClipboardList, LogOut, MapPin, Package, Settings, ShoppingBag, Star, Tags, Users } from "lucide-react";

const navigation = [
  { label: "Dashboard", icon: BarChart3, href: "/admin" },
  { label: "Products", icon: Package, href: "/admin/products" },
  { label: "Categories", icon: Boxes, href: "/admin/categories" },
  { label: "Orders", icon: ClipboardList, href: "/admin/orders" },
  { label: "Customers", icon: Users, href: "/admin/customers" },
  { label: "Addresses", icon: MapPin, href: "#addresses" },
  { label: "Reviews", icon: Star, href: "#reviews" },
  { label: "Coupons", icon: Tags, href: "#coupons" },
  { label: "Reports", icon: BarChart3, href: "#reports" },
  { label: "Settings", icon: Settings, href: "#settings" },
];

export function Sidebar() {
  const pathname = usePathname();
  return <aside className="sticky top-0 flex h-screen w-64 shrink-0 flex-col bg-slate-900 px-4 py-6 text-slate-300">
    <Link href="/admin" className="mb-9 flex items-center gap-3 px-3"><span className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-indigo-400 to-violet-700 shadow-lg shadow-indigo-950/40"><ShoppingBag className="h-5 w-5 text-white" /></span><span className="leading-tight"><span className="block text-base font-bold text-white">E-Commerce</span><span className="block text-xs font-semibold tracking-wide text-indigo-400">Admin</span></span></Link>
    <nav className="grid gap-1.5">{navigation.map(({ label, icon: Icon, href }) => { const isActive = href === "/admin" ? pathname === href : pathname.startsWith(href); return <Link key={label} href={href} className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${isActive ? "bg-indigo-600 text-white shadow-md shadow-indigo-950/30" : "hover:bg-slate-800 hover:text-white"}`}><Icon className="h-[18px] w-[18px]" />{label}</Link>; })}</nav>
    <div className="mt-auto border-t border-slate-700 pt-5"><button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white" onClick={() => void signOut({ callbackUrl: "/login" })}><LogOut className="h-[18px] w-[18px]" />Logout</button></div>
  </aside>;
}
