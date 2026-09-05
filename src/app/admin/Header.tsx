"use client";

import { Bell, ChevronDown, Menu, Search } from "lucide-react";
import { usePathname } from "next/navigation";
import { useState } from "react";

export function Header() {
  const [search, setSearch] = useState("");
  const pathname = usePathname();
  const title = pathname.startsWith("/admin/customers") ? "Customers" : pathname.startsWith("/admin/products") ? "Products" : "Dashboard";
  return <header className="flex h-[82px] items-center justify-between border-b border-gray-200 bg-white px-8">
    <div className="flex items-center gap-4"><button className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800" aria-label="Toggle menu"><Menu className="h-5 w-5" /></button><h1 className="text-xl font-bold tracking-tight text-slate-800">{title}</h1></div>
    <div className="flex items-center gap-5"><label className="flex h-10 w-72 items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-4 text-slate-400 focus-within:border-indigo-400 focus-within:bg-white"><Search className="h-4 w-4" /><input value={search} onChange={(event) => setSearch(event.target.value)} className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400" placeholder="Search anything..." aria-label="Search" /></label><button className="relative rounded-full p-2 text-slate-500 transition hover:bg-indigo-50 hover:text-indigo-600" aria-label="Notifications"><Bell className="h-5 w-5" /><span className="absolute right-0 top-0 grid h-4 min-w-4 place-items-center rounded-full border-2 border-white bg-indigo-500 px-1 text-[9px] font-bold text-white">3</span></button><div className="flex items-center gap-3 border-l border-gray-200 pl-5"><img className="h-10 w-10 rounded-full object-cover" src="https://i.pravatar.cc/80?img=12" alt="Admin" /><span className="leading-tight"><span className="block text-sm font-semibold text-slate-800">Admin</span><span className="block text-xs text-slate-400">admin@gmail.com</span></span><ChevronDown className="h-4 w-4 text-slate-400" /></div></div>
  </header>;
}
