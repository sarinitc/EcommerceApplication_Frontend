"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import type { Product } from "@/types/product";
import { ProductCard } from "./ProductCard";
import { SectionHeader } from "./SectionHeader";
import { Reveal } from "./Reveal";

type TabKey = "featured" | "best" | "new" | "sale";

const tabs: { key: TabKey; label: string }[] = [
  { key: "featured", label: "Featured" },
  { key: "best", label: "Best sellers" },
  { key: "new", label: "New arrivals" },
  { key: "sale", label: "On sale" },
];

function pickByTab(products: Product[], tab: TabKey): Product[] {
  if (tab === "best") return [...products].sort((first, second) => second.quantity - first.quantity);
  if (tab === "new") return [...products].sort((first, second) => second.productId - first.productId);
  if (tab === "sale") return products.filter((product) => product.specialPrice > 0 && product.specialPrice < product.price);
  return products;
}

export function TrendingProducts({ products }: { products: Product[] }) {
  const [active, setActive] = useState<TabKey>("featured");

  const list = useMemo(() => {
    const trendingPool = products.slice(0, 8);
    const picked = pickByTab(trendingPool, active);
    return picked.length > 0 ? picked : trendingPool;
  }, [products, active]);

  if (products.length === 0) return null;

  return (
    <section className="border-y border-slate-200/80 bg-surface py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 xl:px-10">
        <Reveal>
          <SectionHeader eyebrow="Trending" title="Trending now" subtitle="Products everyone is talking about." />
        </Reveal>

        <Reveal delay={0.06}>
          <div className="mt-8 flex flex-wrap justify-center gap-1 rounded-full border border-slate-200 bg-slate-50 p-1">
            {tabs.map((tab) => {
              const isActive = active === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActive(tab.key)}
                  className={`relative cursor-pointer rounded-full px-4 py-2 text-[13px] font-semibold transition-colors duration-200 sm:px-5 ${
                    isActive ? "text-white" : "text-slate-500 hover:text-ink"
                  }`}
                >
                  {isActive && (
                    <motion.span
                      layoutId="trending-tab-pill"
                      className="absolute inset-0 rounded-full bg-brand shadow-[0_8px_18px_-6px_rgba(79,70,229,.55)]"
                      transition={{ type: "spring", stiffness: 420, damping: 34 }}
                    />
                  )}
                  <span className="relative z-10">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </Reveal>

        <div className="mt-10 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
          {list.map((product, index) => (
            <Reveal key={`${active}-${product.productId}`} delay={index * 0.03}>
              <ProductCard product={product} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}