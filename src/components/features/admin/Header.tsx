"use client";

import { ChevronDown, Menu, Search, UserRound } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useId, useRef, useState } from "react";
import { UserAvatar } from "@/components/common/UserAvatar";
import { NotificationsBell } from "@/components/common/NotificationsBell";

export function Header() {
  const [search, setSearch] = useState("");
  const [accountOpen, setAccountOpen] = useState(false);
  const accountRef = useRef<HTMLDivElement>(null);
  const accountButtonRef = useRef<HTMLButtonElement>(null);
  const accountId = useId();
  const { data: session } = useSession();
  const user = session?.user;
  const name = user?.name?.trim() || "Account";
  const pathname = usePathname();
  const title = pathname.startsWith("/admin/profile") ? "My Profile" : pathname.startsWith("/admin/customers") ? "Customers" : pathname.startsWith("/admin/products") ? "Products" : pathname.startsWith("/admin/orders") ? "Orders" : pathname.startsWith("/admin/categories") ? "Categories" : pathname.startsWith("/admin/addresses") ? "Addresses" : "Dashboard";
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 8);
    }
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!accountOpen) return;

    function handlePointerDown(event: PointerEvent) {
      if (event.target instanceof Node && !accountRef.current?.contains(event.target)) {
        setAccountOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setAccountOpen(false);
        accountButtonRef.current?.focus();
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [accountOpen]);

  return (
    <header className={`sticky top-0 z-40 flex h-[82px] items-center justify-between border-b bg-white px-8 transition-[box-shadow,border-color] duration-200 ${scrolled ? "border-slate-200 shadow-md shadow-slate-200/60" : "border-slate-100"}`}>
      <div className="flex items-center gap-4">
        <button className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800" aria-label="Toggle menu">
          <Menu className="h-5 w-5" />
        </button>
        <h1 className="text-xl font-bold tracking-tight text-slate-800">{title}</h1>
      </div>
      <div className="flex items-center gap-5">
        <label className="flex h-10 w-72 items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-4 text-slate-400 focus-within:border-indigo-400 focus-within:bg-white">
          <Search className="h-4 w-4" />
          <input value={search} onChange={(event) => setSearch(event.target.value)} className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400" placeholder="Search anything..." aria-label="Search" />
        </label>
        <NotificationsBell variant="admin" />
        <div
          ref={accountRef}
          className="relative border-l border-gray-200 pl-5"
          onBlur={(event) => {
            if (event.relatedTarget && !event.currentTarget.contains(event.relatedTarget)) setAccountOpen(false);
          }}
        >
          <button
            ref={accountButtonRef}
            type="button"
            aria-label="Account information"
            aria-expanded={accountOpen}
            aria-controls={accountId}
            onClick={() => setAccountOpen((open) => !open)}
            className="flex cursor-pointer items-center gap-3 rounded-lg p-2 text-left transition hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
          >
            <UserAvatar
              className="h-10 w-10 shrink-0 rounded-full object-cover"
              fallback={<span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-indigo-50 text-indigo-600"><UserRound className="h-5 w-5" aria-hidden="true" /></span>}
            />
            <span className="min-w-0 leading-tight">
              <span className="block max-w-44 truncate text-sm font-semibold text-slate-800">{name}</span>
              <span className="block max-w-44 truncate text-xs text-slate-400">{user?.email || "No email available"}</span>
            </span>
            <ChevronDown aria-hidden="true" className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${accountOpen ? "rotate-180" : ""}`} />
          </button>
          <section
            id={accountId}
            aria-label="Account details"
            hidden={!accountOpen}
            className="absolute right-0 top-full z-50 mt-2 w-72 overflow-hidden rounded-xl border border-slate-200 bg-white text-sm shadow-lg"
          >
            <div className="border-b border-slate-100 px-4 py-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Signed in as</p>
              <p className="break-words font-semibold text-slate-800">{name}</p>
              <p className="mt-1 break-words text-slate-500">{user?.email || "No email available"}</p>
            </div>
            <div className="p-2">
              <Link
                href="/admin/profile"
                onClick={() => setAccountOpen(false)}
                className="flex items-center gap-2 rounded-lg px-3 py-2.5 font-medium text-slate-700 transition hover:bg-indigo-50 hover:text-indigo-600 focus-visible:outline-2 focus-visible:outline-indigo-500"
              >
                <UserRound className="h-4 w-4" aria-hidden="true" />
                View profile
              </Link>
            </div>
          </section>
        </div>
      </div>
    </header>
  );
}
