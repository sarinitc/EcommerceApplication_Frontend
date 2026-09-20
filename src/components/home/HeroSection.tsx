import Link from "next/link";
import { ArrowRight, Check, ShoppingBag, Compass, Sparkles } from "lucide-react";
import type { Product } from "@/types/product";
import { Reveal } from "./Reveal";

const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

const trust = ["Free shipping", "Secure payment", "Easy returns"];

function FeaturedImage({ product, className }: { product: Product; className: string }) {
  const price = product.specialPrice > 0 ? product.specialPrice : product.price;
  return (
    <div className={`${className} overflow-hidden rounded-2xl border border-white/60 bg-white p-1.5 shadow-[0_24px_48px_-24px_rgba(17,24,39,.45)]`}>
      <div className="relative aspect-square overflow-hidden rounded-xl bg-gradient-to-br from-slate-100 to-slate-200">
        {product.image ? (
          <img src={product.image} alt={product.productName} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 hover:scale-105" />
        ) : (
          <span className="grid h-full w-full place-items-center text-slate-300"><ShoppingBag className="h-8 w-8" strokeWidth={1.2} /></span>
        )}
        <span className="absolute bottom-2 left-2 right-2 flex items-center justify-between gap-2 rounded-xl bg-white/90 px-3 py-2 backdrop-blur">
          <span className="min-w-0">
            <span className="block truncate text-[11px] font-semibold text-ink">{product.productName}</span>
            <span className="block text-[11px] font-bold text-brand">{currency.format(price)}</span>
          </span>
          <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-brand text-white"><ShoppingBag className="h-3.5 w-3.5" /></span>
        </span>
      </div>
    </div>
  );
}

export function HeroSection({ products }: { products: Product[] }) {
  const featured = products.filter((product) => product.image);
  const main = featured[0];
  const pair = featured[1];
  const mini = featured[2] ?? featured[1] ?? featured[0];

  return (
    <section className="relative overflow-hidden">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 right-[-10%] h-[28rem] w-[28rem] rounded-full bg-gradient-to-br from-brand/15 via-violet-300/25 to-transparent blur-3xl" />
        <div className="absolute bottom-[-30%] left-[-8%] h-[24rem] w-[24rem] rounded-full bg-gradient-to-tr from-violet-200/30 to-transparent blur-3xl" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand/15 to-transparent" />
      </div>

      <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-4 pb-16 pt-14 sm:px-6 sm:pt-20 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10 lg:px-8 lg:py-24 xl:px-10">
        <Reveal>
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-brand/15 bg-surface px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-brand shadow-[0_4px_12px_rgba(79,70,229,.1)]">
              <Sparkles className="h-3.5 w-3.5" />
              New season · 2026
            </span>

            <h1 className="mt-6 max-w-xl font-display text-[2.6rem] font-bold leading-[1.04] tracking-[-0.04em] text-ink sm:text-5xl lg:text-[3.6rem]">
              Everything you want. <span className="bg-gradient-to-r from-brand via-brand-hover to-violet-500 bg-clip-text text-transparent">All in one place.</span>
            </h1>

            <p className="mt-5 max-w-lg text-base leading-7 text-slate-500 sm:text-[17px]">
              Discover trending technology, fashion, lifestyle products and everyday essentials — selected for you.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link href="/products" className="inline-flex h-12 items-center gap-2 rounded-xl bg-brand px-6 text-sm font-semibold text-white shadow-[0_12px_24px_-8px_rgba(79,70,229,.55)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-hover hover:shadow-[0_16px_30px_-10px_rgba(79,70,229,.6)]">
                Shop now
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="#collections" className="inline-flex h-12 items-center gap-2 rounded-xl border border-slate-300 bg-surface px-6 text-sm font-semibold text-ink transition-all duration-200 hover:-translate-y-0.5 hover:border-brand hover:text-brand">
                <Compass className="h-4 w-4" />
                Explore categories
              </Link>
            </div>

            <div className="mt-9 flex flex-wrap items-center gap-x-5 gap-y-2">
              {trust.map((item) => (
                <span key={item} className="inline-flex items-center gap-1.5 text-[13px] font-medium text-slate-500">
                  <span className="grid h-5 w-5 place-items-center rounded-full bg-success/10 text-success"><Check className="h-3 w-3" strokeWidth={2.5} /></span>
                  {item}
                </span>
              ))}
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="relative mx-auto w-full max-w-[560px] px-4 py-6 lg:pr-10">
            <div className="relative mr-8">
              {main ? (
                <>
                  <div className="relative overflow-hidden rounded-[1.6rem] border border-white/60 bg-slate-100 shadow-[0_30px_60px_-30px_rgba(17,24,39,.5)]">
                    <div className="aspect-[4/5] w-full overflow-hidden">
                      {main.image && <img src={main.image} alt={main.productName} className="h-full w-full object-cover" />}
                    </div>
                    <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/35 via-transparent to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="rounded-2xl border border-white/70 bg-white/85 p-3 shadow-[0_16px_32px_-16px_rgba(17,24,39,.35)] backdrop-blur">
                        <p className="truncate text-xs font-bold text-ink">{main.productName}</p>
                        <p className="mt-1 text-[11px] font-semibold text-brand">{currency.format(main.specialPrice > 0 ? main.specialPrice : main.price)}</p>
                      </div>
                    </div>
                  </div>

                  {main.discount > 0 && (
                    <span className="absolute -right-4 top-6 grid h-20 w-20 rotate-6 place-items-center rounded-full bg-accent text-center font-bold text-white shadow-[0_16px_30px_-10px_rgba(249,115,22,.6)]">
                      <span>
                        <span className="block text-xl leading-none">-{main.discount}%</span>
                        <span className="block text-[9px] font-semibold uppercase tracking-wide opacity-90">today</span>
                      </span>
                    </span>
                  )}

                  {pair && (
                    <div className="absolute -right-8 top-10 hidden w-40 -rotate-2 lg:block">
                      <FeaturedImage product={pair} className="" />
                    </div>
                  )}
                </>
              ) : (
                <div className="aspect-[4/5] w-full rounded-[1.6rem] bg-gradient-to-br from-brand/15 via-violet-200/40 to-transparent" />
              )}
            </div>

            {mini && (
              <div className="absolute -bottom-4 left-0 w-56 rounded-2xl border border-slate-100 bg-white p-3 shadow-[0_24px_48px_-24px_rgba(17,24,39,.4)]">
                <div className="flex items-center gap-3">
                  <span className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-xl bg-slate-100">
                    {mini.image ? <img src={mini.image} alt="" className="h-full w-full object-cover" /> : <ShoppingBag className="h-5 w-5 text-slate-300" />}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-[12px] font-semibold text-ink">{mini.productName}</span>
                    <span className="mt-0.5 block text-[13px] font-bold text-brand">{currency.format(mini.specialPrice > 0 ? mini.specialPrice : mini.price)}</span>
                    <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-success/10 px-2 py-0.5 text-[10px] font-semibold text-success">In stock</span>
                  </span>
                </div>
              </div>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
}