import Link from "next/link";

const columns = [
  {
    title: "Company",
    links: [
      { label: "Our story", href: "/about" },
      { label: "Careers", href: "/contact" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Shipping & returns", href: "/contact" },
      { label: "Contact care", href: "/contact" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy", href: "/privacy" },
      { label: "Terms of service", href: "/terms" },
    ],
  },
];

export function SiteFooter({ appearance = "default" }: { appearance?: "default" | "home" }) {
  const isHome = appearance === "home";
  return (
    <footer className={isHome ? "border-t border-ink/8 bg-surface font-sans" : "border-t border-ink/10 bg-ink/[0.04]"}>
      <div className={isHome ? "mx-auto grid max-w-7xl grid-cols-2 gap-x-6 gap-y-10 px-5 py-16 sm:grid-cols-3 sm:px-8 lg:grid-cols-[1.8fr_repeat(3,1fr)] lg:gap-10 lg:px-10 lg:py-20" : "mx-auto grid max-w-7xl gap-10 px-5 py-14 sm:grid-cols-2 sm:px-8 lg:grid-cols-[1.8fr_repeat(3,1fr)] lg:px-10"}>
        <div className={isHome ? "col-span-2 sm:col-span-3 lg:col-span-1" : undefined}>
          <Link href="/" className={isHome ? "font-sans text-xl font-bold tracking-[-0.04em] text-brand" : "font-display text-xl font-bold tracking-[-0.06em] text-brand"}>Indigo<span className="text-ink">Store</span></Link>
          <p className={isHome ? "mt-4 max-w-64 text-sm leading-6 text-ink/60" : "mt-4 max-w-52 text-xs leading-5 text-ink/55"}>Elevating the everyday through objects with purpose and presence.</p>
        </div>
        {columns.map((column) => (
          <div key={column.title}>
            <h3 className={isHome ? "text-sm font-semibold text-ink" : "text-[10px] font-bold uppercase tracking-[0.18em] text-brand"}>{column.title}</h3>
            <div className={isHome ? "mt-5 grid gap-3 text-[13px] leading-5 text-ink/60" : "mt-4 grid gap-3 text-xs text-ink/55"}>
              {column.links.map((link) => (
                <Link key={link.label} className="transition hover:text-brand" href={link.href}>{link.label}</Link>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className={isHome ? "border-t border-ink/8" : "border-t border-ink/10"}>
        <div className={isHome ? "mx-auto max-w-7xl px-5 py-6 text-[13px] text-ink/55 sm:px-8 lg:px-10" : "mx-auto max-w-7xl px-5 py-5 text-[11px] text-ink/45 sm:px-8 lg:px-10"}>
          © 2026 IndigoStore. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
