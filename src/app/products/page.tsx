"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import type { ApiResponse, Product, ProductPage } from "@/types/product";


const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
const pageSize = 12;
type SortOption = "featured" | "newest" | "price-low-to-high" | "price-high-to-low";

function Icon({ name, className = "" }: { name: "bag" | "chevron" | "filter" | "search" | "star" | "user"; className?: string }) {
  const paths = {
    bag: <><path d="M5 8h14l-1 12H6z" /><path d="M9 8V6a3 3 0 0 1 6 0v2" /></>,
    chevron: <path d="m9 18 6-6-6-6" />,
    filter: <><path d="M4 6h16M7 12h10m-7 6h4" /><circle cx="7" cy="6" r="1" /><circle cx="17" cy="12" r="1" /><circle cx="10" cy="18" r="1" /></>,
    search: <><circle cx="11" cy="11" r="6" /><path d="m20 20-4.2-4.2" /></>,
    star: <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9z" />,
    user: <><circle cx="12" cy="8" r="3.5" /><path d="M5 21a7 7 0 0 1 14 0" /></>,
  };
  return <svg aria-hidden="true" viewBox="0 0 24 24" className={className}>{paths[name]}</svg>;
}

function Check({ label, count, checked = false, disabled = false, onChange }: { label: string; count?: string; checked?: boolean; disabled?: boolean; onChange?: (checked: boolean) => void }) {
  return <label className={`group flex cursor-pointer items-center justify-between gap-3 py-2 text-sm ${disabled ? "cursor-not-allowed text-slate-300" : checked ? "text-brand" : "text-slate-600"}`}><span className="flex items-center gap-2.5"><input className="h-4 w-4 rounded border-slate-300 text-brand focus:ring-brand" type="checkbox" checked={checked} disabled={disabled} onChange={(event) => onChange?.(event.target.checked)} /><span className="transition group-hover:text-brand">{label}</span></span>{count && <span className="text-xs text-slate-400">{count}</span>}</label>;
}

export default function ProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [sortOption, setSortOption] = useState<SortOption>("featured");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [maxPrice, setMaxPrice] = useState(1000);
  const [onlyInStock, setOnlyInStock] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    async function loadProducts() {
      try {
        setError(null);
        const firstResponse = await fetch(`/api/products?page=0&size=${pageSize}`, { signal: controller.signal });
        if (firstResponse.status === 401) {
          router.replace("/login");
          return;
        }
        const firstData = (await firstResponse.json()) as ApiResponse<ProductPage> | { message?: string };
        if (!firstResponse.ok || !("payload" in firstData)) throw new Error(firstData.message ?? "Unable to load products.");

        const allProducts = [...firstData.payload.content];
        for (let page = 1; page < firstData.payload.totalPages; page += 1) {
          const response = await fetch(`/api/products?page=${page}&size=${pageSize}`, { signal: controller.signal });
          if (response.status === 401) {
            router.replace("/login");
            return;
          }
          const data = (await response.json()) as ApiResponse<ProductPage> | { message?: string };
          if (!response.ok || !("payload" in data)) throw new Error(data.message ?? "Unable to load products.");
          allProducts.push(...data.payload.content);
        }
        setProducts(allProducts);
      } catch (loadError) {
        if (!controller.signal.aborted) setError(loadError instanceof Error ? loadError.message : "Unable to load products.");
      }
    }

    void loadProducts();
    return () => controller.abort();
  }, [router]);

  useEffect(() => {
    const category = new URLSearchParams(window.location.search).get("category");
    if (!category) return;
    const timer = window.setTimeout(() => setSelectedCategory(category), 0);
    return () => window.clearTimeout(timer);
  }, []);

  const sortedProducts = useMemo(() => {
    if (sortOption === "featured") return products;

    return [...products].sort((first, second) => {
      if (sortOption === "newest") return second.productId - first.productId;

      const priceDifference = (first.specialPrice || first.price) - (second.specialPrice || second.price);
      return sortOption === "price-low-to-high" ? priceDifference : -priceDifference;
    });
  }, [products, sortOption]);

  const categoryOptions = useMemo(() => {
    const counts = new Map<string, number>();
    for (const product of products) {
      const name = product.category?.categoryName.trim() || "Uncategorized";
      counts.set(name, (counts.get(name) ?? 0) + 1);
    }
    return [...counts.entries()].map(([name, count]) => ({ name, count }));
  }, [products]);

  const filteredProducts = useMemo(() => {
    const category = selectedCategory?.trim().toLowerCase();
    return sortedProducts.filter((product) => {
      const productCategory = (product.category?.categoryName ?? "Uncategorized").trim().toLowerCase();
      if (category && productCategory !== category) return false;
      const price = product.specialPrice || product.price;
      if (price > maxPrice) return false;
      if (onlyInStock && product.quantity <= 0) return false;
      return true;
    });
  }, [sortedProducts, selectedCategory, maxPrice, onlyInStock]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / pageSize));
  const activePage = Math.min(currentPage, totalPages - 1);
  const currentProducts = useMemo(
    () => filteredProducts.slice(activePage * pageSize, activePage * pageSize + pageSize),
    [filteredProducts, activePage],
  );

  const pageNumbers = Array.from({ length: totalPages }, (_, index) => index);

  const selectCategory = (name: string | null) => {
    setCurrentPage(0);
    setSelectedCategory(name);
    const searchParams = new URLSearchParams(window.location.search);
    if (name) searchParams.set("category", name);
    else searchParams.delete("category");
    router.replace(`/products${searchParams.size ? `?${searchParams}` : ""}`, { scroll: false });
  };

  return <main className="min-h-screen bg-canvas text-ink">
    <SiteHeader />

    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-8 sm:py-8 lg:px-10 lg:py-12">
      <nav className="flex items-center gap-2 text-xs text-slate-500" aria-label="Breadcrumb"><Link className="hover:text-brand" href="/">Home</Link><Icon name="chevron" className="h-3.5 w-3.5 fill-none stroke-current stroke-2 text-slate-300" /><Link className="hover:text-brand" href="/products">Shop</Link><Icon name="chevron" className="h-3.5 w-3.5 fill-none stroke-current stroke-2 text-slate-300" /><span className="font-semibold text-slate-700">{selectedCategory ?? "All Products"}</span></nav>
      <div className="mt-7 flex flex-col gap-5 border-b border-slate-200 pb-8 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[.2em] text-[#5b55d4]">{selectedCategory ? `The ${selectedCategory} edit` : "The daily edit"}</p><h1 className="mt-2 font-display text-5xl font-semibold tracking-[-.06em] text-[#172033]">{selectedCategory ?? "All Products"}</h1><p className="mt-3 text-sm text-slate-500">{products.length ? `${filteredProducts.length} of ${products.length} products` : "Loading products…"}</p></div><label className="flex w-full items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500 sm:w-auto sm:min-w-48">Sort by:<select className="bg-transparent font-semibold text-slate-700 outline-none" value={sortOption} aria-label="Sort products" onChange={(event) => { setCurrentPage(0); setSortOption(event.target.value as SortOption); }}><option value="featured">Featured</option><option value="newest">Newest</option><option value="price-low-to-high">Price: low to high</option><option value="price-high-to-low">Price: high to low</option></select></label></div>

      <div className="mt-9 grid gap-8 lg:grid-cols-[245px_minmax(0,1fr)]"><aside className="h-fit rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_10px_25px_rgba(23,32,51,.04)] lg:sticky lg:top-24"><div className="flex items-center justify-between"><h2 className="font-display text-xl font-semibold">Filters</h2><Icon name="filter" className="h-5 w-5 fill-none stroke-brand stroke-[1.7]" /></div><div className="mt-5 border-t border-slate-100 pt-4"><h3 className="text-[11px] font-bold uppercase tracking-[.14em] text-slate-700">Categories</h3><div className="mt-2">{categoryOptions.map((option) => <Check key={option.name} label={option.name} count={String(option.count)} checked={selectedCategory === option.name} onChange={(checked) => selectCategory(checked ? option.name : null)} />)}</div></div><div className="mt-5 border-t border-slate-100 pt-5"><h3 className="text-[11px] font-bold uppercase tracking-[.14em] text-slate-700">Price range</h3><div className="mt-5 flex items-center justify-between text-xs"><span className="text-slate-500">Maximum price</span><span className="font-bold text-brand">{maxPrice >= 1000 ? "$1000+" : `$${maxPrice}`}</span></div><input className="mt-2 w-full accent-brand" type="range" min="0" max="1000" value={maxPrice} onChange={(event) => { setCurrentPage(0); setMaxPrice(Number(event.target.value)); }} aria-label="Maximum price" /><div className="mt-2 flex justify-between text-xs text-slate-500"><span>$0</span><span>$1000+</span></div></div>{categoryOptions.length > 1 && <button className="mt-5 w-full rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-600 transition hover:border-brand hover:text-brand" type="button" onClick={() => { selectCategory(null); setMaxPrice(1000); setOnlyInStock(false); }}>Clear all filters</button>}<div className="mt-5 border-t border-slate-100 pt-5"><h3 className="text-[11px] font-bold uppercase tracking-[.14em] text-slate-700">Rating</h3><label className="mt-3 flex cursor-pointer items-center gap-2.5 text-sm text-slate-600"><input className="h-4 w-4 rounded border-slate-300 text-brand focus:ring-brand" type="checkbox" /><span className="flex text-[#e3a52b]"><Icon name="star" className="h-3.5 w-3.5 fill-current stroke-current" /><Icon name="star" className="h-3.5 w-3.5 fill-current stroke-current" /><Icon name="star" className="h-3.5 w-3.5 fill-current stroke-current" /><Icon name="star" className="h-3.5 w-3.5 fill-current stroke-current" /><Icon name="star" className="h-3.5 w-3.5 fill-current stroke-current" /></span></label><label className="mt-3 flex cursor-pointer items-center gap-2.5 text-sm text-slate-600"><input className="h-4 w-4 rounded border-slate-300 text-brand focus:ring-brand" type="checkbox" /><span className="flex text-[#e3a52b]"><Icon name="star" className="h-3.5 w-3.5 fill-current stroke-current" /><Icon name="star" className="h-3.5 w-3.5 fill-current stroke-current" /><Icon name="star" className="h-3.5 w-3.5 fill-current stroke-current" /><Icon name="star" className="h-3.5 w-3.5 fill-current stroke-current" /></span></label><label className="mt-3 flex cursor-pointer items-center gap-2.5 text-sm text-slate-600"><input className="h-4 w-4 rounded border-slate-300 text-brand focus:ring-brand" type="checkbox" /><span className="flex text-[#e3a52b]"><Icon name="star" className="h-3.5 w-3.5 fill-current stroke-current" /><Icon name="star" className="h-3.5 w-3.5 fill-current stroke-current" /><Icon name="star" className="h-3.5 w-3.5 fill-current stroke-current" /></span></label><label className="mt-3 flex cursor-pointer items-center gap-2.5 text-sm text-slate-600"><input className="h-4 w-4 rounded border-slate-300 text-brand focus:ring-brand" type="checkbox" /><span className="flex text-[#e3a52b]"><Icon name="star" className="h-3.5 w-3.5 fill-current stroke-current" /><Icon name="star" className="h-3.5 w-3.5 fill-current stroke-current" /></span></label></div></aside>

        <section><div className="mb-5 flex items-center justify-between lg:hidden"><button className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700"><Icon name="filter" className="h-4 w-4 fill-none stroke-current stroke-2" />Filters</button><span className="text-xs text-slate-500">{products.length} products</span></div>{selectedCategory && <div className="mb-6 flex flex-wrap items-center gap-2"><span className="inline-flex items-center gap-2 rounded-full bg-brand-light px-3 py-1 text-xs font-semibold text-brand"><Icon name="bag" className="h-3.5 w-3.5 fill-none stroke-current stroke-[1.7]" />{selectedCategory}<button className="grid h-4 w-4 place-items-center rounded-full bg-brand text-[10px] font-bold leading-none text-white transition hover:bg-brand-hover" type="button" onClick={() => selectCategory(null)} aria-label={`Clear ${selectedCategory} filter`}>×</button></span><span className="text-xs text-slate-500">{filteredProducts.length} item{filteredProducts.length === 1 ? "" : "s"} match{filteredProducts.length === 1 ? "es" : ""}</span></div>}{error ? <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">{error}</div> : filteredProducts.length === 0 ? <div className="rounded-2xl border border-slate-200 bg-white px-6 py-20 text-center shadow-[0_10px_24px_rgba(23,32,51,.06)]"><p className="text-sm text-slate-500">No products match your filters.</p><p className="mt-1 text-xs text-slate-400">Try widening the price range or clearing the category.</p><button className="mt-6 rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-hover" type="button" onClick={() => { selectCategory(null); setMaxPrice(1000); setOnlyInStock(false); }}>Clear all filters</button></div> : <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{currentProducts.map((product, index) => <article className={`group overflow-hidden rounded-2xl border bg-white p-3 shadow-[0_10px_24px_rgba(23,32,51,.06)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_35px_rgba(23,32,51,.13)] ${index === 0 ? "border-dashed border-brand-hover ring-2 ring-brand-faint" : "border-slate-200"}`} key={product.productId}><Link href={`/products/${product.productId}`} className="relative block aspect-[1/0.88] overflow-hidden rounded-xl bg-[#f1f2f3]">{product.image && <div className="absolute inset-0 bg-cover bg-center transition duration-500 group-hover:scale-110" style={{ backgroundImage: `url(${product.image})` }} />}{product.discount > 0 && <span className="absolute left-3 top-3 rounded-full bg-[#202440] px-2.5 py-1 text-[10px] font-bold text-white">-{product.discount}%</span>}</Link><div className="px-1 pb-1 pt-4"><p className="text-[11px] text-slate-500">{product.category?.categoryName ?? "Uncategorized"}</p><h2 className="mt-2 font-display text-lg font-semibold tracking-[-.03em] text-slate-800"><Link href={`/products/${product.productId}`} className="hover:text-brand">{product.productName}</Link></h2><div className="mt-2 flex items-center gap-2"><span className="text-sm font-bold text-brand-deep">{currency.format(product.specialPrice || product.price)}</span>{product.specialPrice > 0 && product.specialPrice < product.price && <span className="text-xs text-slate-400 line-through">{currency.format(product.price)}</span>}</div>{product.quantity <= 0 ? <p className="mt-1 text-xs font-semibold text-red-500">Out of stock</p> : <p className="mt-1 text-xs text-emerald-600">In stock</p>}</div></article>)}</div>}

          {totalPages > 1 && <nav className="mt-12 flex flex-wrap items-center justify-center gap-2" aria-label="Pagination"><button className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:border-brand disabled:cursor-not-allowed disabled:text-slate-400" aria-label="Previous page" disabled={activePage === 0} onClick={() => setCurrentPage((page) => Math.max(page - 1, 0))}><Icon name="chevron" className="h-4 w-4 rotate-180 fill-none stroke-current stroke-2" /></button>{pageNumbers.map((page) => <button className={`grid h-9 w-9 place-items-center rounded-lg text-sm font-semibold ${page === activePage ? "bg-brand text-white shadow-[0_6px_14px_rgba(79,70,217,.25)]" : "border border-slate-200 bg-white text-slate-600 hover:border-brand"}`} key={page} onClick={() => setCurrentPage(page)} aria-current={page === activePage ? "page" : undefined}>{page + 1}</button>)}<button className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:border-brand disabled:cursor-not-allowed disabled:text-slate-400" aria-label="Next page" disabled={activePage === totalPages - 1} onClick={() => setCurrentPage((page) => Math.min(page + 1, totalPages - 1))}><Icon name="chevron" className="h-4 w-4 fill-none stroke-current stroke-2" /></button></nav>}
        </section>
      </div>
    </div>

    <SiteFooter />
  </main>;
}