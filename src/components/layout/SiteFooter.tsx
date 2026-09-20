import Link from "next/link";
import { Headphones, RotateCcw, ShieldCheck, Truck } from "lucide-react";

function BrandIcon({ name, className = "h-4 w-4" }: { name: "instagram" | "facebook" | "x" | "tiktok"; className?: string }) {
  if (name === "instagram") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
        <rect x="2" y="2" width="20" height="20" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" />
      </svg>
    );
  }
  if (name === "facebook") {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
        <path d="M13.5 21v-7h2.5l.5-3h-3V9.1c0-.9.3-1.6 1.7-1.6H16.6V4.7c-.3 0-1.3-.1-2.4-.1-2.4 0-4 1.4-4 4V11H7.5v3H10.2v7h3.3z" />
      </svg>
    );
  }
  if (name === "x") {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
        <path d="M17.7 3H21l-7.1 8.1L22.3 21h-6.6l-5.2-6.2L4.5 21H1.2l7.6-8.7L1.7 3h6.8l4.9 5.9L17.7 3zm-1.1 15.9h1.9L7.5 4.9H5.4l11.2 14z" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm4.9 7.1c0 .3-2.2 3.9-2.2 3.9l-1.7 3c-1.7 3-3.1 3-4 1.4-.9-1.5-.2-2.3 1-3.1 1.2-.8 4-1.1 4-1.1S12 11.8 11 11.2c-1-.5-2 .6-1.7 1.7-1.2.6-2 1-2.3 2.2-1.2-2.4-.7-6 2.1-8.1 2-1.6 5.2-1.8 6.7-.8 1.9 1.2 1.2 3.9.9 2.9z" />
    </svg>
  );
}

const columns: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: "Shop",
    links: [
      { label: "New arrivals", href: "/new-arrivals" },
      { label: "Best sellers", href: "/products" },
      { label: "Deals", href: "/deals" },
      { label: "Categories", href: "/products" },
    ],
  },
  {
    title: "Customer Care",
    links: [
      { label: "Contact", href: "/contact" },
      { label: "Shipping & returns", href: "/contact" },
      { label: "FAQs", href: "/contact" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Careers", href: "/contact" },
      { label: "Blog", href: "/contact" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
    ],
  },
];

const payments = ["ABA PayWay", "Visa", "Mastercard", "KHQR"];

const socials = [
  { name: "instagram" as const, label: "Instagram", href: "https://www.instagram.com/?hl=en" },
  { name: "facebook" as const, label: "Facebook", href: "https://web.facebook.com/cheav.sarin.2025" },
  { name: "x" as const, label: "X (Twitter)", href: "https://x.com/home" },
];

function DefaultFooter() {
  return (
    <footer className="border-t border-slate-200 bg-surface">
      <div className="mx-auto max-w-7xl px-4 pb-10 pt-14 sm:px-6 lg:px-8 xl:px-10 lg:pt-16">
        <div className="grid gap-10 lg:grid-cols-[1.6fr_repeat(4,1fr)] lg:gap-8">
          <div className="max-w-xs">
            <Link href="/" className="flex items-center gap-2.5 text-brand" aria-label="IndigoStore home">
              <span className="relative grid h-8 w-8 place-items-center overflow-hidden rounded-[10px] bg-brand shadow-[0_6px_14px_rgba(79,70,229,.32)]">
                <span className="h-3.5 w-3.5 rotate-45 rounded-[3px] border-2 border-white/85" />
                <span className="absolute h-2 w-2 rounded-full bg-indigo-300" />
              </span>
              <span className="font-display text-lg font-bold tracking-[-0.04em] text-brand">Indigo<span className="text-ink">Store</span></span>
            </Link>
            <p className="mt-4 text-sm leading-6 text-slate-500">
              Tech, fashion and everyday essentials — curated for a simpler, better way to shop online.
            </p>
            <div className="mt-5 flex items-center gap-2">
              {socials.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={`Follow IndigoStore on ${social.label}`}
                  className="grid h-9 w-9 place-items-center rounded-full border border-slate-200 text-slate-500 transition-all duration-200 hover:-translate-y-0.5 hover:border-brand hover:bg-brand hover:text-white"
                >
                  <BrandIcon name={social.name} />
                </a>
              ))}
            </div>
          </div>

          {columns.map((column) => (
            <div key={column.title}>
              <h3 className="text-[12px] font-bold uppercase tracking-[0.14em] text-ink">{column.title}</h3>
              <ul className="mt-4 grid gap-3">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-sm text-slate-500 transition hover:text-brand">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-slate-200">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-6 sm:px-6 lg:flex-row lg:px-8 xl:px-10">
          <p className="text-[13px] text-slate-500">© 2026 IndigoStore. All rights reserved.</p>
          <ul className="flex flex-wrap items-center justify-center gap-2">
            {payments.map((payment) => (
              <li key={payment} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-[11px] font-semibold text-slate-500">
                {payment}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}

const premiumColumns: { title: string; links: { label: string; href: string }[] }[] = [
  ...columns.slice(0, 1),
  {
    title: "Customer Care",
    links: [
      { label: "Contact", href: "/contact" },
      { label: "Shipping & returns", href: "/contact" },
      { label: "FAQs", href: "/contact" },
      { label: "Track order", href: "/orders" },
    ],
  },
  ...columns.slice(2, 3),
  {
    title: "Legal",
    links: [
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
      { label: "Cookies", href: "/privacy" },
    ],
  },
];

const benefits = [
  { title: "Secure payment", description: "Protected checkout", icon: ShieldCheck },
  { title: "Fast delivery", description: "Reliable shipping", icon: Truck },
  { title: "Easy returns", description: "Hassle-free returns", icon: RotateCcw },
  { title: "Customer support", description: "We're here to help", icon: Headphones },
];

function PremiumFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 xl:px-10">
        <div className="grid gap-5 rounded-2xl border border-slate-200 bg-slate-50/70 px-5 py-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:gap-0 lg:divide-x lg:divide-slate-200">
          {benefits.map((benefit) => {
            const Icon = benefit.icon;
            return (
              <div key={benefit.title} className="flex items-center gap-3 lg:px-5 first:pl-0 last:pr-0">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white text-brand shadow-sm ring-1 ring-slate-200/80">
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-ink">{benefit.title}</p>
                  <p className="mt-0.5 text-xs text-slate-500">{benefit.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="border-t border-slate-200">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.5fr_repeat(4,1fr)] lg:gap-8 lg:px-8 lg:py-14 xl:px-10">
          <div className="max-w-xs">
            <Link href="/" className="flex items-center gap-2.5 text-brand" aria-label="IndigoStore home">
              <span className="relative grid h-9 w-9 place-items-center overflow-hidden rounded-xl bg-brand shadow-[0_8px_18px_-6px_rgba(79,70,229,.55)]">
                <span className="h-3.5 w-3.5 rotate-45 rounded-[3px] border-2 border-white/85" />
                <span className="absolute h-2 w-2 rounded-full bg-indigo-300" />
              </span>
              <span className="font-display text-xl font-bold tracking-[-0.045em] text-brand">Indigo<span className="text-ink">Store</span></span>
            </Link>
            <p className="mt-4 text-sm leading-6 text-slate-500">
              Tech, fashion and everyday essentials — curated for a simpler, better way to shop online.
            </p>
            <a href="mailto:cheavsaren65@gmail.com" className="mt-3 inline-flex text-sm font-medium text-slate-600 transition-colors hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30">
              cheavsaren65@gmail.com
            </a>
            <div className="mt-6 flex items-center gap-2">
              {socials.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={`Follow IndigoStore on ${social.label}`}
                  className="grid h-9 w-9 place-items-center rounded-xl border border-slate-200 bg-white text-slate-500 transition-all duration-200 hover:-translate-y-0.5 hover:border-brand hover:bg-brand hover:text-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand/15"
                >
                  <BrandIcon name={social.name} />
                </a>
              ))}
            </div>
          </div>

          {premiumColumns.map((column) => (
            <div key={column.title}>
              <h3 className="text-[11px] font-bold uppercase tracking-[0.16em] text-ink">{column.title}</h3>
              <ul className="mt-5 grid gap-3.5">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="group inline-flex text-sm text-slate-500 transition-all duration-200 hover:translate-x-0.5 hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30">
                      <span className="relative after:absolute after:-bottom-0.5 after:left-0 after:h-px after:w-0 after:bg-brand after:transition-all after:duration-200 group-hover:after:w-full">{link.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-slate-200">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-4 px-4 py-5 sm:px-6 lg:flex-row lg:items-center lg:px-8 xl:px-10">
          <p className="text-[13px] text-slate-500">© 2026 IndigoStore. All rights reserved.</p>
          <ul className="flex flex-wrap gap-2" aria-label="Accepted payment methods">
            {payments.map((payment) => (
              <li key={payment} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-[11px] font-semibold tracking-wide text-slate-600 shadow-sm">
                {payment}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}

export function SiteFooter({ appearance = "default" }: { appearance?: "default" | "home" }) {
  return appearance === "home" ? <PremiumFooter /> : <DefaultFooter />;
}