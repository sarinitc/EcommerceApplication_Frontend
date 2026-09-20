"use client";

import type { Product } from "@/types/product";
import { ProductCard } from "./ProductCard";
import { SectionHeader } from "./SectionHeader";
import { Reveal } from "./Reveal";

export function RecommendedProducts({ products }: { products: Product[] }) {
  const trendingIds = new Set(products.slice(0, 8).map((product) => product.productId));
  const picks = products.filter((product) => !trendingIds.has(product.productId)).slice(0, 10);
  if (picks.length === 0) return null;

  return (
    <section className="bg-surface py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 xl:px-10">
        <Reveal>
          <SectionHeader eyebrow="Just for you" title="Recommended for you" subtitle="Based on products you may like." />
        </Reveal>
        <div className="mt-10 grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {picks.map((product, index) => (
            <Reveal key={product.productId} delay={index * 0.03}>
              <ProductCard product={product} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}