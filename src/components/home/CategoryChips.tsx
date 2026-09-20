"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { categoryChipIconFor, type HomeCategory } from "./categories";

const preferred = ["electron", "phone", "laptop", "fashion", "shoe", "accessor", "home", "book"];

export function CategoryChips({ categories }: { categories: HomeCategory[] }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const selected = searchParams.get("category");

  const matches = preferred
    .map((token) => categories.find((category) => category.categoryName.toLowerCase().includes(token)))
    .filter((category): category is HomeCategory => Boolean(category))
    .filter((category, index, all) => all.findIndex((item) => item.categoryId === category.categoryId) === index);

  const onProducts = pathname === "/products";

  function isActive(name: string | null) {
    if (!onProducts) return false;
    return name ? selected === name : !selected;
  }

  if (matches.length === 0) return null;

  const pills = [{ id: "all", label: "All", href: "/products" }, ...matches.map((category) => ({ id: category.categoryId, label: category.categoryName, href: `/products?category=${encodeURIComponent(category.categoryName)}` }))];

  return (
    <div className="border-b border-slate-200/80 bg-surface">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8 xl:px-10">
        <div className="no-scrollbar -mx-4 flex gap-2.5 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
          {pills.map((pill) => {
            const active = pill.id === "all" ? isActive(null) : isActive(pill.label);
            return (
              <Link
                key={String(pill.id)}
                href={pill.href}
                aria-current={active ? "page" : undefined}
                className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-[13px] font-semibold transition-all duration-200 ${
                  active
                    ? "border-brand bg-brand text-white shadow-[0_8px_18px_-6px_rgba(79,70,229,.55)]"
                    : "border-slate-200 bg-surface text-slate-600 hover:-translate-y-0.5 hover:border-brand/50 hover:text-brand"
                }`}
              >
                {categoryChipIconFor(pill.label)}
                {pill.label}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}