"use client";

import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { ChevronDown, LogOut, Menu, Package, Search, ShoppingBag, UserRound, X } from "lucide-react";
import { CartBadge } from "@/components/features/cart/CartBadge";
import { NotificationsBell } from "@/components/common/NotificationsBell";
import { categoryIconFor, type HomeCategory } from "@/components/home/categories";

function readCategories(data: unknown): HomeCategory[] {
  if (!data || typeof data !== "object") return [];
  const record = data as Record<string, unknown>;
  const payload = record.payload ?? data;
  const list = Array.isArray(payload)
    ? payload
    : Array.isArray((payload as { content?: unknown }).content)
      ? (payload as { content: unknown[] }).content
      : [];
  return list.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const value = item as Record<string, unknown>;
    const name = typeof value.categoryName === "string" ? value.categoryName : typeof value.name === "string" ? value.name : null;
    if (!name) return [];
    const id = typeof value.categoryId === "number" ? value.categoryId : typeof value.id === "number" ? value.id : name;
    return [{ categoryId: id, categoryName: name }];
  });
}

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Shop" },
  { href: "/new-arrivals", label: "New Arrivals" },
  { href: "/deals", label: "Deals" },
];

function Logo({ onClick }: { onClick?: () => void }) {
  return (
    <Link href="/" onClick={onClick} className="flex shrink-0 items-center gap-2.5 text-brand focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand" aria-label="IndigoStore home">
      <span className="relative grid h-9 w-9 place-items-center overflow-hidden rounded-xl bg-brand shadow-[0_6px_14px_rgba(79,70,229,.32)]">
        <span className="h-4 w-4 rotate-45 rounded-[3px] border-2 border-white/85" />
        <span className="absolute h-2.5 w-2.5 rounded-full bg-indigo-300" />
      </span>
      <span className="font-display text-xl font-bold tracking-[-0.04em] text-brand">Indigo<span className="text-ink">Store</span></span>
    </Link>
  );
}

function SearchField({ onNavigate, className = "" }: { onNavigate?: () => void; className?: string }) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  function submit(event: FormEvent) {
    event.preventDefault();
    const q = query.trim();
    onNavigate?.();
    router.push(q ? `/products?search=${encodeURIComponent(q)}` : "/products");
  }

  return (
    <form onSubmit={submit} role="search" className={className}>
      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        className="h-full w-full bg-transparent text-sm text-ink outline-none placeholder:text-slate-400"
        type="search"
        placeholder="Search products, brands, deals…"
        aria-label="Search products"
      />
    </form>
  );
}

function SearchShell() {
  return (
    <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400" aria-hidden="true">
      <Search className="h-4 w-4" />
    </span>
  );
}

function UserMenu() {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const rootRef = useRef<HTMLDivElement>(null);

  const name = session?.user?.name ?? "Account";
  const email = session?.user?.email ?? "";
  const image = session?.user?.image;
  const initials = name.trim().split(/\s+/).map((part) => part[0]?.toUpperCase() ?? "").slice(0, 2).join("") || "IS";

  useEffect(() => {
    if (!open) return;
    function handlePointerDown(event: PointerEvent) {
      if (event.target instanceof Node && !rootRef.current?.contains(event.target)) setOpen(false);
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        className="flex h-9 cursor-pointer items-center gap-1.5 rounded-full border border-slate-200 bg-white p-1 pr-2.5 text-ink/70 transition hover:border-brand hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((value) => !value)}
      >
        <span className="grid h-7 w-7 place-items-center overflow-hidden rounded-full bg-brand text-[11px] font-bold text-white">
          {image ? <img src={image} alt="" className="h-full w-full object-cover" /> : initials}
        </span>
        <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div id={menuId} role="menu" className="absolute right-0 top-full z-50 mt-2 w-60 origin-top-right animate-[indigo-fade-in_.18s_ease-out] overflow-hidden rounded-2xl border border-slate-200 bg-white text-sm shadow-[0_20px_40px_-20px_rgba(17,24,39,.25)]">
          <div className="border-b border-slate-100 px-4 py-3.5">
            <p className="truncate font-semibold text-slate-800">{name}</p>
            {email && <p className="mt-0.5 truncate text-xs text-slate-500">{email}</p>}
          </div>
          <div className="grid gap-0.5 p-1.5">
            <Link href="/profile" role="menuitem" onClick={() => setOpen(false)} className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-slate-600 transition hover:bg-brand-light hover:text-brand">
              <UserRound className="h-4 w-4" />My profile
            </Link>
            <Link href="/orders" role="menuitem" onClick={() => setOpen(false)} className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-slate-600 transition hover:bg-brand-light hover:text-brand">
              <Package className="h-4 w-4" />My orders
            </Link>
          </div>
          <div className="border-t border-slate-100 p-1.5">
            <button type="button" role="menuitem" onClick={() => void signOut({ callbackUrl: "/login" })} className="flex w-full cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2.5 text-slate-600 transition hover:bg-rose-50 hover:text-rose-600">
              <LogOut className="h-4 w-4" />Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function CategoriesDropdown() {
  const [open, setOpen] = useState(false);
  const [categories, setCategories] = useState<HomeCategory[]>([]);
  const rootRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/categories", { signal: controller.signal, cache: "no-store" })
      .then(async (response) => (response.ok ? await response.json() : null))
      .then((data) => {
        const loaded = readCategories(data);
        if (loaded.length) setCategories(loaded.slice(0, 8));
      })
      .catch(() => undefined);
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!open) return;
    function handlePointerDown(event: PointerEvent) {
      if (event.target instanceof Node && !rootRef.current?.contains(event.target)) setOpen(false);
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const isCategoriesActive =
    pathname === "/products" && typeof window !== "undefined" && new URLSearchParams(window.location.search).get("category") !== null;

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        className={`inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium transition after:absolute after:inset-x-3 after:bottom-1 after:h-0.5 after:origin-left after:scale-x-0 after:rounded-full after:bg-brand after:transition-transform after:duration-200 hover:text-brand hover:after:scale-x-100 ${
          isCategoriesActive ? "text-brand after:scale-x-100" : "text-ink/70"
        }`}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        Categories
        <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute left-0 top-full z-50 mt-2 w-64 origin-top-left animate-[indigo-fade-in_.18s_ease-out] overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-[0_20px_40px_-20px_rgba(17,24,39,.25)]">
          <p className="px-2.5 pb-1.5 pt-2 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">Browse by category</p>
          <div className="grid gap-0.5">
            {categories.length === 0 && (
              <Link href="/products" className="flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-sm text-slate-600 transition hover:bg-brand-light hover:text-brand" onClick={() => setOpen(false)}>
                <span className="grid h-7 w-7 place-items-center rounded-lg bg-brand-light text-brand">{categoryIconFor("All")}</span>
                All products
              </Link>
            )}
            {categories.map((category) => (
              <Link
                key={category.categoryId}
                href={`/products?category=${encodeURIComponent(category.categoryName)}`}
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-sm text-slate-600 transition hover:bg-brand-light hover:text-brand"
              >
                <span className="grid h-7 w-7 place-items-center rounded-lg bg-slate-100 text-slate-500 group-hover:text-brand">{categoryIconFor(category.categoryName)}</span>
                <span className="truncate">{category.categoryName}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function SiteHeader({ appearance = "default" }: { appearance?: "default" | "home" }) {
  void appearance;
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const [previousPathname, setPreviousPathname] = useState(pathname);
  if (previousPathname !== pathname) {
    setPreviousPathname(pathname);
    setDrawerOpen(false);
  }

  const isShopActive = pathname === "/products";

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    if (href === "/products") return pathname === "/products";
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-2 px-4 sm:px-6 lg:h-[4.5rem] lg:gap-4 lg:px-8 xl:px-10">
          <button
            type="button"
            className="grid h-9 w-9 cursor-pointer place-items-center rounded-full text-ink/70 transition hover:bg-brand-light hover:text-brand lg:hidden focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            aria-label="Open menu"
            aria-expanded={drawerOpen}
            onClick={() => setDrawerOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </button>

          <Logo />

          <nav className="hidden items-center gap-0.5 lg:flex" aria-label="Primary navigation">
            <Link
              href="/"
              className={`relative rounded-lg px-3 py-2 text-sm font-medium transition after:absolute after:inset-x-3 after:bottom-1 after:h-0.5 after:origin-left after:scale-x-0 after:rounded-full after:bg-brand after:transition-transform after:duration-200 hover:text-brand hover:after:scale-x-100 ${isActive("/") ? "text-ink after:scale-x-100" : "text-ink/70"}`}
            >
              Home
            </Link>
            <Link
              href="/products"
              className={`relative rounded-lg px-3 py-2 text-sm font-medium transition after:absolute after:inset-x-3 after:bottom-1 after:h-0.5 after:origin-left after:scale-x-0 after:rounded-full after:bg-brand after:transition-transform after:duration-200 hover:text-brand hover:after:scale-x-100 ${isActive("/products") ? "text-ink after:scale-x-100" : "text-ink/70"}`}
            >
              Shop
            </Link>
            <CategoriesDropdown />
            <Link
              href="/new-arrivals"
              className={`relative rounded-lg px-3 py-2 text-sm font-medium transition after:absolute after:inset-x-3 after:bottom-1 after:h-0.5 after:origin-left after:scale-x-0 after:rounded-full after:bg-brand after:transition-transform after:duration-200 hover:text-brand hover:after:scale-x-100 ${isActive("/new-arrivals") ? "text-ink after:scale-x-100" : "text-ink/70"}`}
            >
              New Arrivals
            </Link>
            <Link
              href="/deals"
              className={`relative rounded-lg px-3 py-2 text-sm font-medium transition after:absolute after:inset-x-3 after:bottom-1 after:h-0.5 after:origin-left after:scale-x-0 after:rounded-full after:bg-brand after:transition-transform after:duration-200 hover:text-brand hover:after:scale-x-100 ${isActive("/deals") ? "text-ink after:scale-x-100" : "text-ink/70"}`}
            >
              <span className="relative inline-flex items-center gap-1">
                Deals
                <span className="rounded-full bg-accent/10 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-accent">Save</span>
              </span>
            </Link>
          </nav>

          <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-1.5">
            <label className="relative hidden h-10 w-44 items-center rounded-full border border-slate-200 bg-white pr-3 transition-all duration-300 focus-within:w-60 focus-within:border-brand focus-within:ring-4 focus-within:ring-brand/10 xl:flex xl:w-56">
              <SearchShell />
              <SearchField className="pl-10 pr-2" />
            </label>

            <NotificationsBell variant="storefront" />

            <Link
              className="relative grid h-9 w-9 place-items-center rounded-full text-ink/65 transition hover:bg-brand-light hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
              href="/cart"
              aria-label="Shopping cart"
            >
              <ShoppingBag className="h-5 w-5" />
              <CartBadge />
            </Link>

            <UserMenu />
          </div>
        </div>
      </header>

      {drawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Menu">
          <button className="absolute inset-0 cursor-pointer bg-slate-900/40 backdrop-blur-[2px]" type="button" aria-label="Close menu" onClick={() => setDrawerOpen(false)} />
          <div className="absolute inset-y-0 left-0 flex w-[min(20rem,86vw)] flex-col bg-white shadow-2xl animate-[indigo-slide-in_.22s_ease-out]">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <Logo onClick={() => setDrawerOpen(false)} />
              <button
                type="button"
                className="grid h-9 w-9 cursor-pointer place-items-center rounded-full text-ink/60 transition hover:bg-slate-100 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                aria-label="Close menu"
                onClick={() => setDrawerOpen(false)}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="border-b border-slate-100 p-4">
              <label className="relative flex h-11 items-center rounded-full border border-slate-200 bg-slate-50 pr-3 transition focus-within:border-brand focus-within:ring-4 focus-within:ring-brand/10">
                <SearchShell />
                <SearchField className="pl-10 pr-2" onNavigate={() => setDrawerOpen(false)} />
              </label>
            </div>

            <nav className="flex-1 overflow-y-auto p-3" aria-label="Mobile navigation">
              <div className="grid gap-0.5">
                {[{ href: "/", label: "Home" }, ...navLinks].map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setDrawerOpen(false)}
                    className={`flex items-center justify-between rounded-xl px-3 py-3 text-[15px] font-medium transition ${
                      isActive(link.href) ? "bg-brand-light text-brand" : "text-slate-700 hover:bg-slate-50 hover:text-brand"
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
                <Link
                  href="/products"
                  onClick={() => setDrawerOpen(false)}
                  className={`flex items-center justify-between rounded-xl px-3 py-3 text-[15px] font-medium transition ${isShopActive ? "bg-brand-light text-brand" : "text-slate-700 hover:bg-slate-50 hover:text-brand"}`}
                >
                  Categories
                </Link>
              </div>

              <p className="mx-3 mt-6 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">Account</p>
              <div className="mt-2 grid gap-0.5">
                <Link href="/profile" onClick={() => setDrawerOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-3 text-[15px] font-medium text-slate-700 transition hover:bg-slate-50 hover:text-brand">
                  <UserRound className="h-4.5 w-4.5" />My profile
                </Link>
                <Link href="/orders" onClick={() => setDrawerOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-3 text-[15px] font-medium text-slate-700 transition hover:bg-slate-50 hover:text-brand">
                  <Package className="h-4.5 w-4.5" />My orders
                </Link>
                <button type="button" onClick={() => void signOut({ callbackUrl: "/login" })} className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-3 text-left text-[15px] font-medium text-rose-600 transition hover:bg-rose-50">
                  <LogOut className="h-4.5 w-4.5" />Sign out
                </button>
              </div>
            </nav>
          </div>
        </div>
      )}
    </>
  );
}