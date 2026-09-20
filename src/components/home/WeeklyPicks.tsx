"use client";

import { useCallback, useRef, useState, useEffect } from "react";
import Link from "next/link";
import { ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";
import type { Product } from "@/types/product";
import { ProductCard } from "./ProductCard";
import { SectionHeader } from "./SectionHeader";
import { Reveal } from "./Reveal";

export function WeeklyPicks({ products }: { products: Product[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);

  const picks = products.slice(0, 8);

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const offset = Math.round(el.scrollLeft);
    setCanPrev(offset > 10);
    setCanNext(offset < el.scrollWidth - el.clientWidth - 10);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    updateScrollState();
    el.addEventListener("scroll", updateScrollState, { passive: true });
    const observer = typeof ResizeObserver !== "undefined" ? new ResizeObserver(updateScrollState) : null;
    observer?.observe(el);
    return () => {
      el.removeEventListener("scroll", updateScrollState);
      observer?.disconnect();
    };
  }, [updateScrollState]);

  function scroll(direction: 1 | -1) {
    scrollRef.current?.scrollBy({ left: direction * 320, behavior: "smooth" });
  }

  if (picks.length === 0) return null;

  return (
    <section className="py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 xl:px-10">
        <Reveal>
          <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
            <SectionHeader
              align="left"
              eyebrow="Handpicked"
              title="This week's picks"
              subtitle="Handpicked products worth discovering."
            />
            <div className="flex items-center gap-3">
              <Link href="/products" className="group inline-flex items-center gap-2 text-sm font-semibold text-ink transition hover:text-brand">
                View all
                <ArrowUpRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
              <span className="hidden h-8 w-px bg-slate-200 sm:block" aria-hidden="true" />
              <span className="hidden gap-1.5 sm:flex">
                <button
                  type="button"
                  onClick={() => scroll(-1)}
                  disabled={!canPrev}
                  className="grid h-9 w-9 cursor-pointer place-items-center rounded-full border border-slate-200 bg-surface text-slate-500 transition hover:border-brand hover:text-brand disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-slate-200 disabled:hover:text-slate-500"
                  aria-label="Previous products"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => scroll(1)}
                  disabled={!canNext}
                  className="grid h-9 w-9 cursor-pointer place-items-center rounded-full border border-slate-200 bg-surface text-slate-500 transition hover:border-brand hover:text-brand disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-slate-200 disabled:hover:text-slate-500"
                  aria-label="Next products"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </span>
            </div>
          </div>
        </Reveal>

        <div
          ref={scrollRef}
          className="no-scrollbar mt-10 -mx-4 flex gap-4 overflow-x-auto px-4 pb-2 pt-1 sm:mx-0 sm:px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          style={{ scrollSnapType: "x mandatory" }}
        >
          {picks.map((product, index) => (
            <Reveal key={product.productId} className="flex-none snap-start w-[260px] sm:w-[290px]" delay={index * 0.04}>
              <ProductCard product={product} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}