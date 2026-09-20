"use client";

import { useHomeData } from "./useHomeData";
import { HeroSection } from "./HeroSection";
import { CategoryChips } from "./CategoryChips";
import { CategorySection } from "./CategorySection";
import { TrendingProducts } from "./TrendingProducts";
import { WeeklyPicks } from "./WeeklyPicks";
import { PromoBanner } from "./PromoBanner";
import { RecommendedProducts } from "./RecommendedProducts";
import { BenefitsSection } from "./BenefitsSection";
import { AboutSection } from "./AboutSection";
import { NewsletterSection } from "./NewsletterSection";

function HeroSkeleton() {
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto grid max-w-7xl items-center gap-14 px-4 py-14 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-24 xl:px-10">
        <div className="animate-pulse">
          <div className="h-7 w-40 rounded-full bg-slate-200" />
          <div className="mt-6 h-14 w-11/12 rounded-2xl bg-slate-200" />
          <div className="mt-3 h-14 w-3/4 rounded-2xl bg-slate-200" />
          <div className="mt-5 h-5 w-2/3 rounded-full bg-slate-100" />
          <div className="mt-8 flex gap-3">
            <div className="h-12 w-36 rounded-xl bg-slate-200" />
            <div className="h-12 w-44 rounded-xl bg-slate-100" />
          </div>
        </div>
        <div className="mx-auto aspect-[4/5] w-full max-w-[480px] animate-pulse rounded-[1.6rem] bg-gradient-to-br from-slate-200 to-slate-100" />
      </div>
    </section>
  );
}

export function HomeSections() {
  const { categories, products, loading } = useHomeData();

  return (
    <>
      {loading ? <HeroSkeleton /> : <HeroSection products={products} />}
      <CategoryChips categories={categories} />
      <CategorySection categories={categories} />
      <TrendingProducts products={products} />
      <WeeklyPicks products={products} />
      <PromoBanner products={products} />
      <RecommendedProducts products={products} />
      <BenefitsSection />
      <AboutSection products={products} categories={categories} />
      <NewsletterSection />
    </>
  );
}