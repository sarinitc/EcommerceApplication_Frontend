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
export function SiteHeader() {
  const pathname = usePathname();
  const isActive = (href: string) =>
    pathname === "/" ? href === "/products" : pathname === href || pathname.startsWith(`${href}/`);
  return (
    <header className="sticky top-0 z-30 border-b border-ink/10 bg-canvas/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-5 sm:px-8 lg:px-10">
        <Link href="/" className="flex items-center gap-2.5 text-brand focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand" aria-label="IndigoStore home">
          <span className="relative grid h-8 w-8 place-items-center overflow-hidden rounded-[10px] bg-brand shadow-[0_5px_12px_rgba(73,56,220,.28)]">
            <span className="h-3.5 w-3.5 rotate-45 rounded-[3px] border border-white/80" />
            <span className="absolute h-2 w-2 rounded-full bg-brand-light" />
          </span>
          <span className="font-display text-xl font-bold tracking-[-0.06em] text-brand">Indigo<span className="text-ink">Store</span></span>
        </Link>

        <nav className="ml-2 hidden items-center gap-1 md:flex" aria-label="Primary navigation">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={isActive(link.href) ? "page" : undefined}
              className={`rounded-full px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] transition ${
                isActive(link.href) ? "bg-brand-light text-brand" : "text-ink/55 hover:bg-ink/5 hover:text-brand"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-1.5">
          <label className="hidden h-9 w-36 items-center gap-2 rounded-full border border-ink/10 bg-surface px-3 text-ink/50 transition-all duration-300 focus-within:w-52 focus-within:border-brand focus-within:ring-4 focus-within:ring-brand/10 sm:flex">
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
            <Icon name="bag" className="h-4.75 w-[19px] fill-none stroke-current stroke-[1.7]" />
            <CartBadge />
          </Link>

          <Link
            className="grid h-9 w-9 place-items-center overflow-hidden rounded-full text-ink/65 transition hover:bg-brand-light hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            href="/profile"
            aria-label="Your profile"
          >
            <UserAvatar className="h-full w-full object-cover" fallback={<Icon name="user" className="h-[18px] w-[18px] fill-none stroke-current stroke-[1.7]" />} />
          </Link>
        </div>
      </div>
    </header>
  );
}