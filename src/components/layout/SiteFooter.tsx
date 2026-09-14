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

export function SiteFooter() {
  return (
    <footer className="border-t border-ink/10 bg-ink/[0.04]">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 sm:grid-cols-2 sm:px-8 lg:grid-cols-[1.8fr_repeat(3,1fr)] lg:px-10">
        <div>
          <Link href="/" className="font-display text-xl font-bold tracking-[-0.06em] text-brand">Indigo<span className="text-ink">Store</span></Link>
          <p className="mt-4 max-w-52 text-xs leading-5 text-ink/55">Elevating the everyday through objects with purpose and presence.</p>
        </div>
        {columns.map((column) => (
          <div key={column.title}>
            <h3 className="text-[10px] font-bold uppercase tracking-[0.18em] text-brand">{column.title}</h3>
            <div className="mt-4 grid gap-3 text-xs text-ink/55">
              {column.links.map((link) => (
                <Link key={link.label} className="transition hover:text-brand" href={link.href}>{link.label}</Link>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="border-t border-ink/10">
        <div className="mx-auto max-w-7xl px-5 py-5 text-[11px] text-ink/45 sm:px-8 lg:px-10">
          © 2026 IndigoStore. All rights reserved.
        </div>
      </div>
    </footer>
  );
}