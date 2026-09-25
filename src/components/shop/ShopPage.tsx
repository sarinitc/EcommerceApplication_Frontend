"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { addToast } from "@heroui/toast";
import { ArrowRight, ChevronDown, ChevronLeft, ChevronRight, Grid2X2, List, PackageSearch, RotateCcw, Search, ShoppingBag, SlidersHorizontal, Sparkles, X } from "lucide-react";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { useCart } from "@/components/features/cart/CartContext";
import type { ApiResponse, Product, ProductPage } from "@/types/product";

const pageSize = 12;
const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
type SortOption = "featured" | "newest" | "price-low-to-high" | "price-high-to-low" | "most-popular";
type ViewMode = "grid" | "list";

type FilterProps = {
  categories: { name: string; count: number }[];
  selectedCategory: string | null;
  selectCategory: (name: string | null) => void;
  minPrice: number;
  maxPrice: number;
  setMinPrice: (value: number) => void;
  setMaxPrice: (value: number) => void;
  onlyInStock: boolean;
  setOnlyInStock: (value: boolean) => void;
  onlyOnSale: boolean;
  setOnlyOnSale: (value: boolean) => void;
  clearAllFilters: () => void;
};

function ProductSkeleton({ list }: { list: boolean }) {
  return <div className={`animate-pulse overflow-hidden rounded-2xl border border-slate-200 bg-white ${list ? "flex" : ""}`}><div className={`bg-slate-100 ${list ? "h-40 w-40 shrink-0" : "aspect-[4/3]"}`} /><div className="flex-1 space-y-3 p-4"><div className="h-3 w-20 rounded bg-slate-100" /><div className="h-4 w-4/5 rounded bg-slate-100" /><div className="h-4 w-1/3 rounded bg-slate-100" /></div></div>;
}

function ProductCard({ product, list }: { product: Product; list: boolean }) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);
  const price = product.specialPrice > 0 ? product.specialPrice : product.price;
  const onSale = product.specialPrice > 0 && product.specialPrice < product.price;
  const stock = Math.max(0, product.quantity);
  const badge = product.discount > 0 ? `-${product.discount}%` : product.quantity >= 40 ? "Best seller" : "New";

  function addToCart() {
    if (!stock) return;
    addItem({ id: product.productId, name: product.productName, variant: product.category?.categoryName ?? "Default", price, stock, image: product.image }, 1);
    setAdded(true);
    addToast({ title: "Added to cart", description: product.productName, color: "success", timeout: 2500 });
    window.setTimeout(() => setAdded(false), 1400);
  }

  return <article className={`group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition duration-200 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-[0_20px_40px_-24px_rgba(15,23,42,.32)] ${list ? "sm:flex-row" : ""}`}>
    <div className={`relative overflow-hidden bg-slate-50 ${list ? "sm:w-56 sm:shrink-0" : "aspect-[4/3]"}`}>
      <Link href={`/products/${product.productId}`} aria-label={product.productName} className="block h-full w-full">{product.image ? <img src={product.image} alt={product.productName} loading="lazy" className="h-full w-full object-contain p-5 transition duration-500 group-hover:scale-[1.04]" /> : <span className="grid h-full min-h-48 place-items-center text-slate-300"><ShoppingBag className="h-10 w-10" strokeWidth={1.2} /></span>}</Link>
      <span className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${product.discount > 0 ? "bg-violet-600 text-white" : "bg-slate-900 text-white"}`}>{badge}</span>
      {!list && <button type="button" disabled={!stock} onClick={addToCart} className="absolute inset-x-3 bottom-3 flex h-10 translate-y-2 items-center justify-center gap-2 rounded-xl bg-slate-950/90 text-xs font-bold text-white opacity-0 shadow-lg backdrop-blur transition duration-200 hover:bg-indigo-600 disabled:opacity-50 group-hover:translate-y-0 group-hover:opacity-100 max-lg:translate-y-0 max-lg:opacity-100">{added ? "Added to cart" : stock ? <><ShoppingBag className="h-4 w-4" />Add to cart</> : "Out of stock"}</button>}
    </div>
    <div className="flex min-w-0 flex-1 flex-col p-4 sm:p-5"><p className="truncate text-[10px] font-bold uppercase tracking-[0.14em] text-indigo-600">{product.category?.categoryName ?? "Uncategorized"}</p><h2 className="mt-2 line-clamp-2 min-h-[2.7em] text-[15px] font-bold leading-snug text-slate-900"><Link href={`/products/${product.productId}`} className="transition hover:text-indigo-600">{product.productName}</Link></h2><div className="mt-auto flex items-end justify-between gap-3 pt-4"><div><span className="text-lg font-bold text-slate-950">{currency.format(price)}</span>{onSale && <del className="ml-2 text-xs text-slate-400">{currency.format(product.price)}</del>}<p className={`mt-1 flex items-center gap-1.5 text-[11px] font-medium ${stock ? "text-emerald-600" : "text-rose-500"}`}><span className={`h-1.5 w-1.5 rounded-full ${stock ? "bg-emerald-500" : "bg-rose-500"}`} />{stock ? "In stock" : "Out of stock"}</p></div>{list && <button type="button" disabled={!stock} onClick={addToCart} className="hidden h-10 items-center gap-2 rounded-xl bg-indigo-600 px-4 text-xs font-bold text-white transition hover:bg-indigo-700 disabled:opacity-50 sm:inline-flex">{added ? "Added" : "Add to cart"}<ArrowRight className="h-3.5 w-3.5" /></button>}</div></div>
  </article>;
}

function FilterSection({ title, children, open, onToggle }: { title: string; children: ReactNode; open: boolean; onToggle: () => void }) {
  return <section className="border-t border-slate-100 py-4"><button type="button" onClick={onToggle} className="flex w-full items-center justify-between text-left text-sm font-bold text-slate-800"><span>{title}</span><ChevronDown className={`h-4 w-4 text-slate-400 transition ${open ? "rotate-180" : ""}`} /></button>{open && <div className="mt-3">{children}</div>}</section>;
}

function Filters({ categories, selectedCategory, selectCategory, minPrice, maxPrice, setMinPrice, setMaxPrice, onlyInStock, setOnlyInStock, onlyOnSale, setOnlyOnSale, clearAllFilters }: FilterProps) {
  const [open, setOpen] = useState({ categories: true, price: true, availability: true });
  const toggle = (key: keyof typeof open) => setOpen((current) => ({ ...current, [key]: !current[key] }));
  return <div><div className="flex items-center justify-between pb-2"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-indigo-600">Refine</p><h2 className="mt-1 text-xl font-bold text-slate-950">Filters</h2></div><button type="button" onClick={clearAllFilters} className="text-xs font-semibold text-slate-400 transition hover:text-indigo-600">Clear all</button></div><FilterSection title="Categories" open={open.categories} onToggle={() => toggle("categories")}><div className="space-y-1">{categories.map((option) => <label key={option.name} className={`flex cursor-pointer items-center justify-between rounded-lg px-2 py-2 text-sm transition hover:bg-indigo-50 ${selectedCategory === option.name ? "bg-indigo-50 font-semibold text-indigo-700" : "text-slate-600"}`}><span className="flex items-center gap-2.5"><input type="checkbox" checked={selectedCategory === option.name} onChange={(event) => selectCategory(event.target.checked ? option.name : null)} className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />{option.name}</span><span className="text-xs text-slate-400">{option.count}</span></label>)}</div></FilterSection><FilterSection title="Price range" open={open.price} onToggle={() => toggle("price")}><div className="grid grid-cols-2 gap-2"><label className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Min<input type="number" min="0" max={maxPrice} value={minPrice} onChange={(event) => setMinPrice(Math.max(0, Number(event.target.value)))} className="mt-1 h-9 w-full rounded-lg border border-slate-200 px-2 text-sm font-semibold text-slate-700 outline-none focus:border-indigo-500" /></label><label className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Max<input type="number" min={minPrice} max="1000" value={maxPrice} onChange={(event) => setMaxPrice(Math.min(1000, Number(event.target.value)))} className="mt-1 h-9 w-full rounded-lg border border-slate-200 px-2 text-sm font-semibold text-slate-700 outline-none focus:border-indigo-500" /></label></div><input className="mt-4 w-full accent-indigo-600" type="range" min="0" max="1000" value={maxPrice} onChange={(event) => setMaxPrice(Number(event.target.value))} aria-label="Maximum price" /><div className="mt-1 flex justify-between text-[11px] text-slate-400"><span>$0</span><span>$1000+</span></div></FilterSection><FilterSection title="Availability" open={open.availability} onToggle={() => toggle("availability")}><label className="flex cursor-pointer items-center gap-2.5 py-2 text-sm text-slate-600"><input type="checkbox" checked={onlyInStock} onChange={(event) => setOnlyInStock(event.target.checked)} className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />In stock</label><label className="flex cursor-pointer items-center gap-2.5 py-2 text-sm text-slate-600"><input type="checkbox" checked={onlyOnSale} onChange={(event) => setOnlyOnSale(event.target.checked)} className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />On sale</label></FilterSection></div>;
}

export function ShopPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [sortOption, setSortOption] = useState<SortOption>("featured");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(1000);
  const [onlyInStock, setOnlyInStock] = useState(false);
  const [onlyOnSale, setOnlyOnSale] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  useEffect(() => {
    const controller = new AbortController();
    async function loadProducts() {
      try {
        setLoading(true); setError(null);
        const firstResponse = await fetch(`/api/products?page=0&size=${pageSize}`, { signal: controller.signal });
        if (firstResponse.status === 401) { router.replace("/login"); return; }
        const firstData = await firstResponse.json() as ApiResponse<ProductPage> | { message?: string };
        if (!firstResponse.ok || !("payload" in firstData)) throw new Error(firstData.message ?? "Unable to load products.");
        const allProducts = [...firstData.payload.content];
        for (let page = 1; page < firstData.payload.totalPages; page += 1) {
          const response = await fetch(`/api/products?page=${page}&size=${pageSize}`, { signal: controller.signal });
          if (response.status === 401) { router.replace("/login"); return; }
          const data = await response.json() as ApiResponse<ProductPage> | { message?: string };
          if (!response.ok || !("payload" in data)) throw new Error(data.message ?? "Unable to load products.");
          allProducts.push(...data.payload.content);
        }
        setProducts(allProducts);
      } catch (loadError) { if (!controller.signal.aborted) setError(loadError instanceof Error ? loadError.message : "Unable to load products."); }
      finally { if (!controller.signal.aborted) setLoading(false); }
    }
    void loadProducts(); return () => controller.abort();
  }, [router]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const category = params.get("category");
    const search = params.get("search");
    const timer = window.setTimeout(() => {
      setSelectedCategory(category);
      setSearchTerm(search ?? "");
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const categoryOptions = useMemo(() => { const counts = new Map<string, number>(); products.forEach((product) => { const name = product.category?.categoryName.trim() || "Uncategorized"; counts.set(name, (counts.get(name) ?? 0) + 1); }); return [...counts.entries()].map(([name, count]) => ({ name, count })); }, [products]);
  const filteredProducts = useMemo(() => {
    const category = selectedCategory?.trim().toLowerCase(); const query = searchTerm.trim().toLowerCase();
    return [...products].sort((first, second) => { if (sortOption === "newest") return second.productId - first.productId; if (sortOption === "price-low-to-high" || sortOption === "price-high-to-low") { const difference = (first.specialPrice || first.price) - (second.specialPrice || second.price); return sortOption === "price-low-to-high" ? difference : -difference; } if (sortOption === "most-popular") return second.quantity - first.quantity; return 0; }).filter((product) => { const productCategory = (product.category?.categoryName ?? "Uncategorized").trim().toLowerCase(); const price = product.specialPrice || product.price; return (!category || productCategory === category) && (!query || product.productName.toLowerCase().includes(query)) && price >= minPrice && price <= maxPrice && (!onlyInStock || product.quantity > 0) && (!onlyOnSale || (product.specialPrice > 0 && product.specialPrice < product.price)); });
  }, [products, selectedCategory, searchTerm, sortOption, minPrice, maxPrice, onlyInStock, onlyOnSale]);
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / pageSize));
  const activePage = Math.min(currentPage, totalPages - 1);
  const currentProducts = filteredProducts.slice(activePage * pageSize, activePage * pageSize + pageSize);
  const selectCategory = (name: string | null) => { setCurrentPage(0); setSelectedCategory(name); const params = new URLSearchParams(window.location.search); if (name) params.set("category", name); else params.delete("category"); router.replace(`/products${params.size ? `?${params}` : ""}`, { scroll: false }); };
  const clearAllFilters = () => { setSelectedCategory(null); setMaxPrice(1000); setMinPrice(0); setOnlyInStock(false); setOnlyOnSale(false); setSearchTerm(""); setCurrentPage(0); setFiltersOpen(false); router.replace("/products", { scroll: false }); };
  const filterProps: FilterProps = { categories: categoryOptions, selectedCategory, selectCategory, minPrice, maxPrice, setMinPrice: (value) => { setCurrentPage(0); setMinPrice(value); }, setMaxPrice: (value) => { setCurrentPage(0); setMaxPrice(value); }, onlyInStock, setOnlyInStock, onlyOnSale, setOnlyOnSale, clearAllFilters };

  return <main className="min-h-screen bg-slate-50 text-slate-900"><SiteHeader /><div className="mx-auto max-w-7xl px-4 pb-16 pt-6 sm:px-6 lg:px-8 lg:pt-8 xl:px-10"><nav className="flex items-center gap-2 text-xs font-medium text-slate-400" aria-label="Breadcrumb"><Link href="/" className="hover:text-indigo-600">Home</Link><ChevronRight className="h-3.5 w-3.5" /><span>Shop</span><ChevronRight className="h-3.5 w-3.5" /><span className="text-slate-700">All Products</span></nav><section className="relative mt-6 overflow-hidden rounded-3xl bg-slate-950 px-6 py-8 text-white sm:px-10 sm:py-10 lg:px-14"><div className="absolute -right-16 -top-28 h-72 w-72 rounded-full bg-indigo-500/30 blur-3xl" /><div className="absolute -bottom-36 right-1/3 h-64 w-64 rounded-full bg-violet-600/20 blur-3xl" /><div className="relative max-w-2xl"><div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-indigo-300"><Sparkles className="h-4 w-4" />The Indigo edit</div><h1 className="mt-4 font-display text-4xl font-semibold tracking-[-0.05em] sm:text-5xl">Find something you&apos;ll love.</h1><p className="mt-3 max-w-xl text-sm leading-6 text-slate-300 sm:text-base">Discover the latest products, hand-picked collections and exclusive deals.</p><p className="mt-6 text-sm font-semibold text-white">{loading ? "Curating the collection…" : `${products.length} products available`}</p></div></section><div className="mt-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-indigo-600">Shop collection</p><h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">All Products <span className="ml-2 text-sm font-medium text-slate-400">{filteredProducts.length} results</span></h2></div><div className="flex flex-wrap items-center gap-2"><button type="button" onClick={() => setFiltersOpen(true)} className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm lg:hidden"><SlidersHorizontal className="h-4 w-4" />Filters</button><div className="flex h-10 items-center rounded-xl border border-slate-200 bg-white p-1 shadow-sm"><button type="button" onClick={() => setViewMode("grid")} className={`grid h-8 w-8 place-items-center rounded-lg ${viewMode === "grid" ? "bg-indigo-50 text-indigo-600" : "text-slate-400"}`} aria-label="Grid view"><Grid2X2 className="h-4 w-4" /></button><button type="button" onClick={() => setViewMode("list")} className={`grid h-8 w-8 place-items-center rounded-lg ${viewMode === "list" ? "bg-indigo-50 text-indigo-600" : "text-slate-400"}`} aria-label="List view"><List className="h-4 w-4" /></button></div><label className="flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-400 shadow-sm">Sort<select value={sortOption} aria-label="Sort products" onChange={(event) => { setCurrentPage(0); setSortOption(event.target.value as SortOption); }} className="bg-transparent font-semibold text-slate-700 outline-none"><option value="featured">Featured</option><option value="newest">Newest</option><option value="price-low-to-high">Price: Low to High</option><option value="price-high-to-low">Price: High to Low</option><option value="best-rated">Best Rated</option><option value="most-popular">Most Popular</option></select></label></div></div><div className="mt-6 grid gap-8 lg:grid-cols-[260px_minmax(0,1fr)]"><aside className="hidden h-fit rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:sticky lg:top-24 lg:block"><Filters {...filterProps} /></aside><section><div className="mb-5 flex flex-wrap items-center gap-2">{selectedCategory && <span className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700">{selectedCategory}<button type="button" onClick={() => selectCategory(null)} aria-label={`Clear ${selectedCategory} filter`}><X className="h-3.5 w-3.5" /></button></span>}{searchTerm && <span className="inline-flex items-center gap-2 rounded-full bg-slate-200/70 px-3 py-1.5 text-xs font-semibold text-slate-600"><Search className="h-3 w-3" />&ldquo;{searchTerm}&rdquo;</span>}{(selectedCategory || searchTerm || minPrice > 0 || maxPrice < 1000 || onlyInStock || onlyOnSale) && <button type="button" onClick={clearAllFilters} className="inline-flex items-center gap-1 text-xs font-semibold text-slate-400 hover:text-indigo-600"><RotateCcw className="h-3.5 w-3.5" />Clear filters</button>}</div>{error ? <div className="rounded-2xl border border-rose-200 bg-rose-50 p-8 text-center"><p className="font-semibold text-rose-800">We couldn&apos;t load the collection.</p><p className="mt-1 text-sm text-rose-600">{error}</p><button type="button" onClick={() => window.location.reload()} className="mt-4 rounded-xl bg-rose-600 px-4 py-2 text-sm font-bold text-white">Try again</button></div> : loading ? <div className={`grid gap-5 ${viewMode === "list" ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3"}`}>{Array.from({ length: 6 }, (_, index) => <ProductSkeleton key={index} list={viewMode === "list"} />)}</div> : currentProducts.length === 0 ? <div className="rounded-2xl border border-slate-200 bg-white px-6 py-20 text-center shadow-sm"><PackageSearch className="mx-auto h-10 w-10 text-indigo-300" /><h3 className="mt-4 text-lg font-bold text-slate-900">No products found</h3><p className="mt-1 text-sm text-slate-500">Try adjusting your filters or search.</p><button type="button" onClick={clearAllFilters} className="mt-5 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white">Clear filters</button></div> : <div className={`grid gap-5 ${viewMode === "list" ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3"}`}>{currentProducts.map((product) => <ProductCard key={product.productId} product={product} list={viewMode === "list"} />)}</div>}{totalPages > 1 && <nav className="mt-10 flex items-center justify-center gap-2" aria-label="Pagination"><button type="button" disabled={activePage === 0} onClick={() => setCurrentPage((page) => Math.max(0, page - 1))} className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 bg-white text-slate-500 disabled:opacity-40" aria-label="Previous page"><ChevronLeft className="h-4 w-4" /></button>{Array.from({ length: totalPages }, (_, page) => <button type="button" key={page} onClick={() => setCurrentPage(page)} aria-current={page === activePage ? "page" : undefined} className={`grid h-10 w-10 place-items-center rounded-xl text-sm font-bold ${page === activePage ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" : "border border-slate-200 bg-white text-slate-600 hover:border-indigo-300"}`}>{page + 1}</button>)}<button type="button" disabled={activePage === totalPages - 1} onClick={() => setCurrentPage((page) => Math.min(totalPages - 1, page + 1))} className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 bg-white text-slate-500 disabled:opacity-40" aria-label="Next page"><ChevronRight className="h-4 w-4" /></button></nav>}</section></div></div>{filtersOpen && <div className="fixed inset-0 z-50 lg:hidden"><button type="button" aria-label="Close filters" onClick={() => setFiltersOpen(false)} className="absolute inset-0 bg-slate-950/35 backdrop-blur-sm" /><aside className="absolute inset-y-0 left-0 w-[min(88vw,360px)] overflow-y-auto bg-white p-5 shadow-2xl"><div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-4"><span className="text-lg font-bold text-slate-950">Filter collection</span><button type="button" onClick={() => setFiltersOpen(false)} className="grid h-9 w-9 place-items-center rounded-full bg-slate-100 text-slate-500" aria-label="Close filters"><X className="h-4 w-4" /></button></div><Filters {...filterProps} /></aside></div>}<SiteFooter /></main>;
}
