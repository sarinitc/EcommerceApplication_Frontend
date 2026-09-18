"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CartBadge } from "@/components/features/cart/CartBadge";
import { UserAvatar } from "@/components/common/UserAvatar";
import { NotificationsBell } from "@/components/common/NotificationsBell";
function Icon({ name, className = "" }: { name: "bag" | "search" | "user"; className?: string }) {
  const paths = {
    bag: <><path d="M5 8h14l-1 12H6z" /><path d="M9 8V6a3 3 0 0 1 6 0v2" /></>,
    search: <><circle cx="11" cy="11" r="6" /><path d="m20 20-4.2-4.2" /></>,
    user: <><circle cx="12" cy="8" r="3.5" /><path d="M5 21a7 7 0 0 1 14 0" /></>,
  };
  return <svg aria-hidden="true" viewBox="0 0 24 24" className={className}>{paths[name]}</svg>;
}
const navLinks = [
  { href: "/products", label: "Shop" },
  { href: "/deals", label: "Deals" },
  { href: "/new-arrivals", label: "New arrivals" },
];
export function SiteHeader({ appearance = "default" }: { appearance?: "default" | "home" }) {
  const isHome = appearance === "home";
  const pathname = usePathname();
  const isActive = (href: string) =>
    pathname === "/" ? href === "/products" : pathname === href || pathname.startsWith(`${href}/`);
  return (
    <header className={isHome ? "sticky top-0 z-30 border-b border-ink/5 bg-surface font-sans" : "sticky top-0 z-30 border-b border-ink/10 bg-canvas/85 backdrop-blur-xl"}>
      <div className={isHome ? "mx-auto flex min-h-20 max-w-7xl flex-wrap items-center gap-x-2 px-4 py-4 sm:gap-x-5 sm:px-8 lg:h-22 lg:flex-nowrap lg:px-10 lg:py-0" : "mx-auto flex h-16 max-w-7xl items-center gap-6 px-5 sm:px-8 lg:px-10"}>
        <Link href="/" className={`flex items-center text-brand focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand ${isHome ? "shrink-0 gap-2 sm:gap-2.5" : "gap-2.5"}`} aria-label="IndigoStore home">
          <span className={isHome ? "relative grid h-8 w-8 place-items-center overflow-hidden rounded-[10px] bg-brand" : "relative grid h-8 w-8 place-items-center overflow-hidden rounded-[10px] bg-brand shadow-[0_5px_12px_rgba(73,56,220,.28)]"}>
            <span className="h-3.5 w-3.5 rotate-45 rounded-[3px] border border-white/80" />
            <span className="absolute h-2 w-2 rounded-full bg-brand-light" />
          </span>
          <span className={isHome ? "font-sans text-lg font-bold tracking-[-0.04em] text-brand sm:text-xl" : "font-display text-xl font-bold tracking-[-0.06em] text-brand"}>Indigo<span className="text-ink">Store</span></span>
        </Link>
        <nav className={isHome ? "order-3 flex w-full flex-wrap items-center justify-center gap-1 pt-3 lg:order-0 lg:ml-auto lg:w-auto lg:justify-end lg:gap-2 lg:pt-0" : "ml-2 hidden items-center gap-1 md:flex"} aria-label="Primary navigation">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={isActive(link.href) ? "page" : undefined}
              className={isHome
                ? `rounded-lg px-3 py-2 text-sm font-medium transition hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${isActive(link.href) ? "text-brand" : "text-ink/70"}`
                : `rounded-full px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] transition ${
                    isActive(link.href) ? "bg-brand-light text-brand" : "text-ink/55 hover:bg-ink/5 hover:text-brand"
                  }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className={isHome ? "ml-auto flex shrink-0 items-center gap-0.5 sm:gap-1.5 lg:ml-0" : "ml-auto flex items-center gap-1.5"}>
          <label className={isHome ? "hidden h-10 w-36 items-center gap-2 rounded-lg border border-ink/10 bg-surface px-3 text-ink/50 transition-colors focus-within:border-brand focus-within:ring-4 focus-within:ring-brand/10 sm:flex" : "hidden h-9 w-36 items-center gap-2 rounded-full border border-ink/10 bg-surface px-3 text-ink/50 transition-all duration-300 focus-within:w-52 focus-within:border-brand focus-within:ring-4 focus-within:ring-brand/10 sm:flex"}>
            <Icon name="search" className="h-4 w-4 shrink-0 fill-none stroke-current stroke-[1.8]" />
            <input
              className="min-w-0 w-full bg-transparent text-xs text-ink outline-none placeholder:text-ink/40"
              type="search"
              placeholder="Search products"
              aria-label="Search products"
            />
          </label>

          <NotificationsBell variant="storefront" />

          <Link
            className="relative grid h-9 w-9 place-items-center rounded-full text-ink/65 transition hover:bg-brand-light hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            href="/cart"
            aria-label="Shopping bag"
          >
            <Icon name="bag" className="h-4.75 w-4.75 fill-none stroke-current stroke-[1.7]" />
            <CartBadge />
          </Link>
          <Link
            className="grid h-9 w-9 place-items-center overflow-hidden rounded-full text-ink/65 transition hover:bg-brand-light hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            href="/profile"
            aria-label="Your profile"
          >
            <UserAvatar className="h-full w-full object-cover" fallback={<Icon name="user" className="h-4.5 w-4.5 fill-none stroke-current stroke-[1.7]" />} />
          </Link>
        </div>
      </div>
    </header>
  );
}
