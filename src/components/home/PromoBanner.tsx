import Link from "next/link";
import { ArrowRight, ShoppingBag } from "lucide-react";
import type { Product } from "@/types/product";
import { Reveal } from "./Reveal";

const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

export function PromoBanner({ products }: { products: Product[] }) {
  const visual = products.filter((product) => product.image).slice(0, 3);
  const [first, second, third] = visual;

  return (
    <section className="px-4 pb-4 pt-16 sm:px-6 sm:pt-20 lg:px-8 lg:pt-24 xl:px-10">
      <Reveal>
        <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 px-6 py-12 sm:px-10 lg:px-14 lg:py-16">
          <div aria-hidden="true" className="pointer-events-none absolute inset-0">
            <div className="absolute -left-16 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute -bottom-32 right-1/4 h-80 w-80 rounded-full bg-fuchsia-400/20 blur-3xl" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(255,255,255,.12),transparent_45%)]" />
          </div>

          <div className="relative grid items-center gap-10 lg:grid-cols-[1fr_0.95fr]">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-white backdrop-blur">
                Weekly deals
              </span>
              <h2 className="mt-5 max-w-md font-display text-3xl font-bold leading-[1.1] tracking-[-0.03em] text-white sm:text-4xl lg:text-[2.9rem]">
                Upgrade your everyday.
              </h2>
              <p className="mt-4 max-w-sm text-[15px] leading-6 text-indigo-100 sm:text-base">
                Save up to 30% on selected electronics this week. Limited stock, premium picks.
              </p>
              <div className="mt-7 flex flex-wrap items-center gap-4">
                <Link
                  href="/deals"
                  className="inline-flex h-12 items-center gap-2 rounded-xl bg-white px-6 text-sm font-semibold text-indigo-700 shadow-[0_16px_30px_-10px_rgba(0,0,0,.4)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-indigo-50"
                >
                  Explore deals
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <span className="text-[13px] font-semibold text-white/80">Ends Sunday</span>
              </div>
            </div>

            <div className="relative hidden h-64 items-end justify-center sm:flex">
              {first && (
                <div className="absolute bottom-2 left-0 z-10 w-36 -rotate-6 rounded-2xl border-4 border-white/70 bg-white p-2 shadow-[0_24px_48px_-20px_rgba(0,0,0,.55)] transition-transform duration-300 hover:-translate-y-1 hover:rotate-[-3deg]">
                  <div className="aspect-square overflow-hidden rounded-xl bg-slate-100">
                    <img src={first.image} alt={first.productName} loading="lazy" className="h-full w-full object-cover" />
                  </div>
                  <p className="mt-2 truncate text-[11px] font-semibold text-slate-700">{first.productName}</p>
                  <p className="text-[12px] font-bold text-brand">{currency.format(first.specialPrice > 0 ? first.specialPrice : first.price)}</p>
                </div>
              )}
              {second && (
                <div className="absolute right-0 top-0 z-20 w-36 rotate-6 rounded-2xl border-4 border-white/70 bg-white p-2 shadow-[0_24px_48px_-20px_rgba(0,0,0,.55)] transition-transform duration-300 hover:-translate-y-1 hover:rotate-3">
                  <div className="aspect-square overflow-hidden rounded-xl bg-slate-100">
                    <img src={second.image} alt={second.productName} loading="lazy" className="h-full w-full object-cover" />
                  </div>
                  <p className="mt-2 truncate text-[11px] font-semibold text-slate-700">{second.productName}</p>
                  <p className="text-[12px] font-bold text-brand">{currency.format(second.specialPrice > 0 ? second.specialPrice : second.price)}</p>
                </div>
              )}
              {third && (
                <div className="absolute bottom-6 right-6 z-30 w-28 rotate-3 rounded-2xl border-4 border-white/70 bg-white p-1.5 shadow-[0_24px_48px_-20px_rgba(0,0,0,.55)]">
                  <div className="aspect-square overflow-hidden rounded-lg bg-slate-100">
                    <img src={third.image} alt="" loading="lazy" className="h-full w-full object-cover" />
                  </div>
                </div>
              )}
              <span className="absolute -bottom-2 left-1/2 z-40 grid h-20 w-20 -translate-x-1/2 place-items-center rounded-full bg-white text-center shadow-xl">
                <span>
                  <span className="block bg-gradient-to-br from-brand to-violet-600 bg-clip-text text-2xl font-black leading-none text-transparent">-30%</span>
                  <span className="block text-[9px] font-bold uppercase tracking-wide text-slate-400">this week</span>
                </span>
              </span>
              <span className="absolute left-10 top-16 z-0 grid h-24 w-24 place-items-center rounded-2xl bg-white/10 text-white/80 ring-1 ring-white/20 backdrop-blur">
                <ShoppingBag className="h-9 w-9" strokeWidth={1.4} />
              </span>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}