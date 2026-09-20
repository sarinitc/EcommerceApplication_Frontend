"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Layers3, PackageCheck, Store } from "lucide-react";
import type { Product } from "@/types/product";
import type { HomeCategory } from "./categories";
import { Reveal } from "./Reveal";

export function AboutSection({ products, categories }: { products: Product[]; categories: HomeCategory[] }) {
  const shouldReduceMotion = useReducedMotion();
  const featuredProduct = products.find((product) => product.image?.trim());
  const sellerCount = new Set(products.map((product) => product.seller?.sellerId).filter((sellerId): sellerId is number => typeof sellerId === "number")).size;
  const catalogFacts = [
    products.length > 0 ? { icon: PackageCheck, label: `${products.length} products`, note: "Currently in the store catalog" } : null,
    categories.length > 0 ? { icon: Layers3, label: `${categories.length} categories`, note: "Ready to browse and discover" } : null,
    sellerCount > 0 ? { icon: Store, label: `${sellerCount} sellers`, note: "Represented in this catalog" } : null,
  ].filter((fact): fact is NonNullable<typeof fact> => fact !== null);

  return (
    <section className="border-y border-slate-200/80 bg-slate-50/70 py-16 sm:py-20 lg:py-24">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8 xl:px-10">
        <Reveal delay={0.04}>
          <div className="group relative">
            <div className="overflow-hidden rounded-4xl border border-white bg-slate-100 shadow-[0_28px_60px_-30px_rgba(17,24,39,.35)]">
              {featuredProduct ? (
                <img
                  src={featuredProduct.image}
                  alt={featuredProduct.productName}
                  loading="lazy"
                  className="aspect-4/3 w-full object-cover transition duration-700 ease-out group-hover:scale-[1.03]"
                />
              ) : (
                <div className="grid aspect-4/3 place-items-center text-slate-300">
                  <PackageCheck className="h-12 w-12" strokeWidth={1.2} />
                </div>
              )}
            </div>
            {featuredProduct && (
              <div className="absolute -bottom-5 -right-3 hidden max-w-[220px] rounded-2xl border border-slate-100 bg-white px-5 py-4 shadow-[0_20px_40px_-20px_rgba(17,24,39,.35)] sm:block">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">From the catalog</p>
                <p className="mt-1 truncate text-sm font-bold text-ink">{featuredProduct.productName}</p>
              </div>
            )}
          </div>
        </Reveal>

        <div>
          <Reveal delay={0.12}>
            <p className="inline-flex rounded-full border border-brand/15 bg-brand-light px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-brand">
              Why IndigoStore
            </p>
          </Reveal>
          <Reveal delay={0.18}>
            <h2 className="mt-5 font-display text-3xl font-bold tracking-[-0.04em] text-ink sm:text-4xl lg:text-[2.75rem] lg:leading-[1.1]">
              Shopping made simple.
            </h2>
          </Reveal>
          <Reveal delay={0.24}>
            <p className="mt-5 max-w-lg text-base leading-7 text-slate-500">
              Quality products, secure payments and a shopping experience designed around you — everything you need in one clean, fast storefront.
            </p>
          </Reveal>

          {catalogFacts.length > 0 && (
            <ul className="mt-8 grid gap-3">
              {catalogFacts.map((item, index) => (
              <motion.li
                key={item.label}
                initial={shouldReduceMotion ? false : { opacity: 0, y: 14 }}
                whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "0px 0px -48px 0px" }}
                transition={{ duration: 0.45, delay: 0.3 + index * 0.08, ease: "easeOut" }}
                className="group flex items-start gap-4 rounded-xl border border-slate-200/80 bg-white/90 p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-brand/30 hover:bg-white hover:shadow-[0_14px_28px_-18px_rgba(79,70,229,.35)]"
              >
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-light text-brand transition-transform duration-300 group-hover:scale-105">
                  <item.icon className="h-5 w-5" />
                </span>
                <span>
                  <span className="block text-[15px] font-bold text-ink">{item.label}</span>
                  <span className="mt-0.5 block text-[13px] text-slate-500">{item.note}</span>
                </span>
              </motion.li>
              ))}
            </ul>
          )}

          <Reveal delay={0.58}>
            <Link
              href="/about"
              className="mt-8 inline-flex h-12 items-center gap-2 rounded-xl bg-brand px-6 text-sm font-semibold text-white shadow-[0_12px_24px_-14px_rgba(79,70,229,.8)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-hover hover:shadow-[0_16px_28px_-14px_rgba(79,70,229,.8)]"
            >
              Learn more
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Reveal>
        </div>
      </div>
    </section>
  );
}