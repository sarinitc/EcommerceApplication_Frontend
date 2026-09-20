"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { bentoSizes, uniqueCategoryImages, type HomeCategory } from "./categories";
import { SectionHeader } from "./SectionHeader";
import { Reveal } from "./Reveal";

function ArrowButton() {
  return (
    <span className="grid h-9 w-9 place-items-center rounded-full bg-white/95 text-slate-900 opacity-0 shadow-[0_10px_20px_-8px_rgba(0,0,0,.4)] transition-all duration-300 group-hover:translate-x-0.5 group-hover:opacity-100 max-lg:opacity-100">
      <ArrowUpRight className="h-4 w-4" />
    </span>
  );
}

export function CategorySection({ categories }: { categories: HomeCategory[] }) {
  if (categories.length === 0) return null;

  const gallery = uniqueCategoryImages(categories);

  return (
    <section id="collections" className="scroll-mt-24 py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 xl:px-10">
        <Reveal>
          <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
            <SectionHeader
              align="left"
              eyebrow="Collections"
              title="Shop by category"
              subtitle="Curated categories filled with products worth discovering."
            />
            <Link href="/products" className="group inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-ink transition hover:text-brand">
              View all products
              <ArrowUpRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </div>
        </Reveal>

        <div className="mt-10 grid auto-rows-[170px] grid-cols-2 gap-3 sm:gap-4 lg:auto-rows-[190px] lg:grid-cols-4">
          {categories.slice(0, 7).map((category, index) => {
            const slot = bentoSizes(categories.length)[index];
            const image = gallery.get(category.categoryId);
            return (
              <Reveal key={category.categoryId} className={slot.className} delay={index * 0.04}>
                <Link
                  href={`/products?category=${encodeURIComponent(category.categoryName)}`}
                  aria-label={`Browse ${category.categoryName}`}
                  className="group relative flex h-full w-full overflow-hidden rounded-2xl bg-slate-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                >
                  {image ? (
                    <img src={image} alt={`${category.categoryName} collection`} loading="lazy" className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.07]" />
                  ) : (
                    <span className="absolute inset-0 bg-gradient-to-br from-brand/20 via-violet-200/40 to-slate-200" />
                  )}
                  <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/10 to-transparent transition-opacity duration-300 group-hover:from-slate-950/80" />

                  <span className="relative z-10 mt-auto flex w-full items-end justify-between gap-3 p-4 sm:p-5">
                    <span className="min-w-0">
                      <span className="block truncate text-lg font-bold tracking-[-0.02em] text-white drop-shadow-sm">{category.categoryName}</span>
                      {typeof category.productCount === "number" && (
                        <span className="mt-1 block text-[13px] font-medium text-white/80">{category.productCount} products</span>
                      )}
                    </span>
                    <ArrowButton />
                  </span>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}