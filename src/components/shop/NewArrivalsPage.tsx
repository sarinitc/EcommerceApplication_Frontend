"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { addToast } from "@heroui/toast";
import { ArrowRight, Check, ChevronRight, Search, ShoppingBag, Sparkles, Tag, X } from "lucide-react";
import { useCart } from "@/components/features/cart/CartContext";
import { WishlistToggle } from "@/components/features/wishlist/WishlistButton";
import type { ApiResponse, Product, ProductPage } from "@/types/product";

const pageSize = 24;
const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

type LoadState = "loading" | "ready" | "error";

function ProductSkeleton() {
  return (
    <div className="animate-pulse overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="aspect-4/3 bg-slate-100" />
      <div className="space-y-3 p-4">
        <div className="h-3 w-24 rounded bg-slate-100" />
        <div className="h-4 w-4/5 rounded bg-slate-100" />
        <div className="h-5 w-20 rounded bg-slate-100" />
      </div>
    </div>
  );
}

function ProductTile({ product }: { product: Product }) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);
  const price = product.specialPrice > 0 ? product.specialPrice : product.price;
  const onSale = product.specialPrice > 0 && product.specialPrice < product.price;
  const inStock = product.quantity > 0;

  function addToCart() {
    if (!inStock) return;
    addItem({ id: product.productId, name: product.productName, variant: product.category?.categoryName ?? "Default", price, stock: product.quantity, image: product.image }, 1);
    setAdded(true);
    addToast({ title: "Added to cart", description: product.productName, color: "success", timeout: 2500 });
    window.setTimeout(() => setAdded(false), 1400);
  }

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition-all duration-300 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-[0_20px_42px_-24px_rgba(15,23,42,.34)]">
      <div className="relative aspect-4/3 overflow-hidden bg-slate-50">
        <Link href={`/products/${product.productId}`} aria-label={product.productName} className="block h-full w-full">
          {product.image ? (
            <img src={product.image} alt={product.productName} loading="lazy" className="h-full w-full object-contain p-5 transition duration-500 group-hover:scale-[1.05]" />
          ) : (
            <span className="grid h-full w-full place-items-center text-slate-300"><ShoppingBag className="h-10 w-10" strokeWidth={1.2} /></span>
          )}
        </Link>
        <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-indigo-600 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-white shadow-sm">
          <Sparkles className="h-3 w-3" /> New
        </span>
        {onSale && <span className="absolute bottom-3 left-3 rounded-full bg-orange-500 px-2.5 py-1 text-[10px] font-bold text-white">-{product.discount}%</span>}
        <span className="absolute right-3 top-3"><WishlistToggle productId={product.productId} /></span>
        <button type="button" disabled={!inStock} onClick={addToCart} className="absolute inset-x-3 bottom-3 flex h-10 translate-y-2 items-center justify-center gap-2 rounded-xl bg-slate-950/90 text-xs font-bold text-white opacity-0 shadow-lg backdrop-blur transition-all duration-300 hover:bg-indigo-600 disabled:cursor-not-allowed disabled:opacity-50 group-hover:translate-y-0 group-hover:opacity-100 max-lg:translate-y-0 max-lg:opacity-100">
          {added ? <><Check className="h-4 w-4" /> Added to cart</> : inStock ? <><ShoppingBag className="h-4 w-4" /> Add to cart</> : "Out of stock"}
        </button>
      </div>
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <p className="truncate text-[10px] font-bold uppercase tracking-[0.14em] text-indigo-600">{product.category?.categoryName ?? "Uncategorized"}</p>
        <h2 className="mt-2 line-clamp-2 min-h-[2.7em] text-[15px] font-bold leading-snug text-slate-900">
          <Link href={`/products/${product.productId}`} className="transition hover:text-indigo-600">{product.productName}</Link>
        </h2>
        <div className="mt-auto flex items-end justify-between gap-3 pt-4">
          <div>
            <span className="text-lg font-bold text-slate-950">{currency.format(price)}</span>
            {onSale && <del className="ml-2 text-xs text-slate-400">{currency.format(product.price)}</del>}
            <p className={`mt-1 flex items-center gap-1.5 text-[11px] font-medium ${inStock ? "text-emerald-600" : "text-rose-500"}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${inStock ? "bg-emerald-500" : "bg-rose-500"}`} />
              {inStock ? "In stock" : "Out of stock"}
            </p>
          </div>
          <Link href={`/products/${product.productId}`} aria-label={`View ${product.productName}`} className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-slate-200 text-slate-500 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-100">
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </article>
  );
}

export function NewArrivalsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [state, setState] = useState<LoadState>("loading");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [query, setQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    async function loadProducts() {
      try {
        setState("loading");
        const firstResponse = await fetch(`/api/products/new-arrivals?page=0&size=${pageSize}`, { signal: controller.signal, cache: "no-store" });
        if (!firstResponse.ok) throw new Error("Unable to load new arrivals.");
        const firstData = await firstResponse.json() as ApiResponse<ProductPage>;
        const allProducts = [...firstData.payload.content];
        for (let page = 1; page < firstData.payload.totalPages; page += 1) {
          const response = await fetch(`/api/products/new-arrivals?page=${page}&size=${pageSize}`, { signal: controller.signal, cache: "no-store" });
          if (!response.ok) throw new Error("Unable to load new arrivals.");
          const data = await response.json() as ApiResponse<ProductPage>;
          allProducts.push(...data.payload.content);
        }
        setProducts(allProducts);
        setState("ready");
      } catch (loadError) {
        if (!controller.signal.aborted) setState("error");
        void loadError;
      }
    }
    void loadProducts();
    return () => controller.abort();
  }, []);

  const categories = useMemo(() => ["All", ...Array.from(new Set(products.map((product) => product.category?.categoryName).filter(Boolean) as string[])).sort()], [products]);
  const visibleProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return products.filter((product) => {
      const matchesCategory = selectedCategory === "All" || product.category?.categoryName === selectedCategory;
      const matchesQuery = !normalizedQuery || product.productName.toLowerCase().includes(normalizedQuery);
      return matchesCategory && matchesQuery;
    });
  }, [products, query, selectedCategory]);
  const totalPages = Math.max(1, Math.ceil(visibleProducts.length / pageSize));
  const activePage = Math.min(currentPage, totalPages - 1);
  const pagedProducts = visibleProducts.slice(activePage * pageSize, activePage * pageSize + pageSize);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <section className="relative overflow-hidden border-b border-slate-200 bg-white">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <div className="absolute -right-24 -top-32 h-80 w-80 rounded-full bg-indigo-100/70 blur-3xl" />
          <div className="absolute -bottom-44 left-1/4 h-72 w-72 rounded-full bg-violet-100/60 blur-3xl" />
          <div className="absolute inset-x-0 bottom-0 h-px bg-linear-to-r from-transparent via-indigo-200 to-transparent" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 pb-12 pt-8 sm:px-6 sm:pb-16 sm:pt-12 lg:px-8 lg:pb-20 lg:pt-16 xl:px-10">
          <nav className="flex items-center gap-2 text-xs font-semibold text-slate-400" aria-label="Breadcrumb">
            <Link href="/" className="transition hover:text-indigo-600">Home</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-slate-700">New arrivals</span>
          </nav>
          <div className="mt-10 grid items-end gap-10 lg:grid-cols-[1fr_auto]">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-indigo-700"><Sparkles className="h-3.5 w-3.5" /> Just landed</span>
              <h1 className="mt-5 font-display text-4xl font-bold tracking-tighter text-slate-950 sm:text-5xl lg:text-6xl">New pieces,<br /><span className="text-indigo-600">freshly found.</span></h1>
              <p className="mt-5 max-w-xl text-base leading-7 text-slate-500 sm:text-lg">Meet the latest additions to IndigoStore, selected for modern routines, thoughtful upgrades, and everyday style.</p>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm"><p className="text-2xl font-bold tracking-tight text-slate-950">{state === "ready" ? products.length : "—"}</p><p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">New products</p></div>
              <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm"><p className="text-2xl font-bold tracking-tight text-slate-950">{categories.length > 1 ? categories.length - 1 : "—"}</p><p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">Categories</p></div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10 xl:px-10">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-indigo-600">The latest edit</p>
            <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">Shop new arrivals <span className="ml-2 text-sm font-medium text-slate-400">{visibleProducts.length} results</span></h2>
          </div>
          <label className="flex h-11 w-full items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 shadow-sm transition focus-within:border-indigo-400 focus-within:ring-4 focus-within:ring-indigo-100 sm:w-80">
            <Search className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
            <input value={query} onChange={(event) => { setQuery(event.target.value); setCurrentPage(0); }} placeholder="Search new arrivals" aria-label="Search new arrivals" className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400" />
            {query && <button type="button" onClick={() => { setQuery(""); setCurrentPage(0); }} aria-label="Clear search" className="text-slate-400 transition hover:text-slate-700"><X className="h-4 w-4" /></button>}
          </label>
        </div>
        <div className="no-scrollbar mt-6 flex gap-2 overflow-x-auto pb-1">
          {categories.map((category) => <button key={category} type="button" onClick={() => { setSelectedCategory(category); setCurrentPage(0); }} className={`shrink-0 rounded-full border px-4 py-2 text-[13px] font-semibold transition-all ${selectedCategory === category ? "border-indigo-600 bg-indigo-600 text-white shadow-[0_8px_18px_-8px_rgba(79,70,229,.65)]" : "border-slate-200 bg-white text-slate-600 hover:border-indigo-300 hover:text-indigo-600"}`}>{category}</button>)}
        </div>

        {state === "loading" && <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{Array.from({ length: 8 }, (_, index) => <ProductSkeleton key={index} />)}</div>}
        {state === "error" && <div className="mt-8 rounded-2xl border border-rose-200 bg-rose-50 px-6 py-12 text-center"><Tag className="mx-auto h-8 w-8 text-rose-400" /><h3 className="mt-4 text-lg font-bold text-slate-900">New arrivals are taking a moment.</h3><p className="mt-2 text-sm text-slate-600">Please refresh the page and try again.</p></div>}
        {state === "ready" && visibleProducts.length === 0 && <div className="mt-8 rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center"><Search className="mx-auto h-8 w-8 text-slate-300" /><h3 className="mt-4 text-lg font-bold text-slate-900">No products match this view.</h3><p className="mt-2 text-sm text-slate-500">Try another category or clear your search.</p><button type="button" onClick={() => { setSelectedCategory("All"); setQuery(""); setCurrentPage(0); }} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700">Reset view</button></div>}
        {state === "ready" && visibleProducts.length > 0 && <>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{pagedProducts.map((product) => <ProductTile key={product.productId} product={product} />)}</div>
          {totalPages > 1 && <nav className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-slate-200 pt-5 sm:flex-row" aria-label="New arrivals pagination">
            <p className="text-xs font-medium text-slate-500">Showing {activePage * pageSize + 1}–{Math.min((activePage + 1) * pageSize, visibleProducts.length)} of {visibleProducts.length} products</p>
            <div className="flex items-center gap-1.5">
              <button type="button" onClick={() => setCurrentPage((page) => Math.max(0, page - 1))} disabled={activePage === 0} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-indigo-300 hover:text-indigo-600 disabled:cursor-not-allowed disabled:opacity-40">Previous</button>
              <div className="flex items-center gap-1" aria-label={`Page ${activePage + 1} of ${totalPages}`}>
                {Array.from({ length: totalPages }, (_, page) => <button key={page} type="button" onClick={() => setCurrentPage(page)} aria-current={activePage === page ? "page" : undefined} className={`grid h-8 min-w-8 place-items-center rounded-lg px-2 text-xs font-bold transition ${activePage === page ? "bg-indigo-600 text-white" : "text-slate-500 hover:bg-indigo-50 hover:text-indigo-600"}`}>{page + 1}</button>)}
              </div>
              <button type="button" onClick={() => setCurrentPage((page) => Math.min(totalPages - 1, page + 1))} disabled={activePage === totalPages - 1} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-indigo-300 hover:text-indigo-600 disabled:cursor-not-allowed disabled:opacity-40">Next</button>
            </div>
          </nav>}
        </>}
      </section>
    </main>
  );
}
