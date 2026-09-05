"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useCart } from "@/src/components/cart/CartContext";
import type { ApiResponse, Product, ProductPage } from "@/src/lib/products";
import { UserAvatar } from "@/src/components/account/UserAvatar";

const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
const pageSize = 6;
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

function Check({ label, count }: { label: string; count?: string }) {
  return <label className="group flex cursor-pointer items-center justify-between gap-3 py-2 text-sm text-slate-600"><span className="flex items-center gap-2.5"><input className="h-4 w-4 rounded border-slate-300 text-[#4f46d9] focus:ring-[#4f46d9]" type="checkbox" /><span className="transition group-hover:text-[#4038c8]">{label}</span></span>{count && <span className="text-xs text-slate-400">{count}</span>}</label>;
}

export default function ProductsPage() {
  const { itemCount } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [productPage, setProductPage] = useState<ProductPage | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [sortOption, setSortOption] = useState<SortOption>("featured");

  useEffect(() => {
    const controller = new AbortController();

    async function loadProducts() {
      try {
        setError(null);
        const response = await fetch(`/api/products?page=${currentPage}&size=${pageSize}`, { signal: controller.signal });
        const data = (await response.json()) as ApiResponse<ProductPage> | { message?: string };
        if (!response.ok || !("payload" in data)) throw new Error(data.message ?? "Unable to load products.");
        setProducts(data.payload.content);
        setProductPage(data.payload);
      } catch (loadError) {
        if (!controller.signal.aborted) setError(loadError instanceof Error ? loadError.message : "Unable to load products.");
      }
    }

    void loadProducts();
    return () => controller.abort();
  }, [currentPage]);

  const pageNumbers = productPage
    ? Array.from({ length: productPage.totalPages }, (_, index) => index)
    : [];

  const sortedProducts = useMemo(() => {
    if (sortOption === "featured") return products;

    return [...products].sort((first, second) => {
      if (sortOption === "newest") return second.productId - first.productId;

      const priceDifference = (first.specialPrice || first.price) - (second.specialPrice || second.price);
      return sortOption === "price-low-to-high" ? priceDifference : -priceDifference;
    });
  }, [products, sortOption]);

  return <main className="min-h-screen bg-[#f8f8f6] text-[#172033]">
    <header className="sticky top-0 z-30 border-b border-slate-900/5 bg-[#f8f8f6]/90 shadow-[0_8px_24px_rgba(23,32,51,.06)] backdrop-blur-xl"><div className="mx-auto flex h-[70px] max-w-7xl items-center gap-5 px-5 sm:px-8 lg:px-10">
      <Link href="/" className="flex items-center gap-2.5 text-[#2720a7]" aria-label="IndigoStore home"><span className="relative grid h-8 w-8 place-items-center overflow-hidden rounded-[10px] bg-[#2720a7]"><span className="h-3.5 w-3.5 rotate-45 rounded-[3px] border border-white/80" /><span className="absolute h-2 w-2 rounded-full bg-[#b9b6ff]" /></span><span className="font-[Georgia,serif] text-xl font-bold tracking-[-.06em]">Indigo<span className="text-[#172033]">Store</span></span></Link>
      <nav className="hidden items-center gap-6 text-[11px] font-semibold uppercase tracking-[.14em] text-slate-500 md:flex" aria-label="Primary navigation"><Link className="relative py-2 text-[#2720a7] after:absolute after:inset-x-0 after:-bottom-0.5 after:h-px after:bg-[#5049db]" href="/products" aria-current="page">Shop</Link><Link className="transition hover:text-[#2720a7]" href="/deals">Deals</Link><Link className="transition hover:text-[#2720a7]" href="/new-arrivals">New arrivals</Link></nav>
      <div className="ml-auto flex items-center gap-2"><label className="hidden h-9 w-44 items-center gap-2 rounded-full border border-slate-300/80 bg-white/80 px-3 text-slate-500 sm:flex"><Icon name="search" className="h-4 w-4 fill-none stroke-current stroke-[1.8]" /><input className="min-w-0 bg-transparent text-xs outline-none placeholder:text-slate-400" type="search" placeholder="Search products" aria-label="Search products" /></label><Link className="relative grid h-9 w-9 place-items-center rounded-full text-slate-600 transition hover:bg-[#e6e6ff] hover:text-[#2720a7]" href="/cart" aria-label={`Cart, ${itemCount} items`}><Icon name="bag" className="h-[18px] w-[18px] fill-none stroke-current stroke-[1.7]" /><span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full border-2 border-[#f8f8f6] bg-[#5049db] px-1 text-[8px] font-bold text-white">{itemCount}</span></Link><Link className="grid h-9 w-9 place-items-center overflow-hidden rounded-full text-slate-600 transition hover:bg-[#e6e6ff] hover:text-[#2720a7]" href="/profile" aria-label="Your profile"><UserAvatar className="h-full w-full object-cover" fallback={<Icon name="user" className="h-[18px] w-[18px] fill-none stroke-current stroke-[1.7]" />} /></Link></div>
    </div></header>

    <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-10 lg:py-12">
      <nav className="flex items-center gap-2 text-xs text-slate-500" aria-label="Breadcrumb"><Link className="hover:text-[#4f46d9]" href="/">Home</Link><Icon name="chevron" className="h-3.5 w-3.5 fill-none stroke-current stroke-2 text-slate-300" /><Link className="hover:text-[#4f46d9]" href="/products">Shop</Link><Icon name="chevron" className="h-3.5 w-3.5 fill-none stroke-current stroke-2 text-slate-300" /><span className="font-semibold text-slate-700">Electronics</span></nav>
      <div className="mt-7 flex flex-col gap-5 border-b border-slate-200 pb-8 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[.2em] text-[#5c56d3]">The daily edit</p><h1 className="mt-2 font-[Georgia,serif] text-5xl font-semibold tracking-[-.06em] text-[#172033]">Electronics</h1><p className="mt-3 text-sm text-slate-500">{productPage ? `Showing ${productPage.number * productPage.size + 1}–${productPage.number * productPage.size + productPage.numberOfElements} of ${productPage.totalElements} products` : "Loading products…"}</p></div><label className="flex w-full items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500 sm:w-auto sm:min-w-48">Sort by:<select className="bg-transparent font-semibold text-slate-700 outline-none" value={sortOption} aria-label="Sort products" onChange={(event) => setSortOption(event.target.value as SortOption)}><option value="featured">Featured</option><option value="newest">Newest</option><option value="price-low-to-high">Price: low to high</option><option value="price-high-to-low">Price: high to low</option></select></label></div>

      <div className="mt-9 grid gap-8 lg:grid-cols-[245px_minmax(0,1fr)]"><aside className="h-fit rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_10px_25px_rgba(23,32,51,.04)] lg:sticky lg:top-24"><div className="flex items-center justify-between"><h2 className="font-[Georgia,serif] text-xl font-semibold">Filters</h2><Icon name="filter" className="h-5 w-5 fill-none stroke-[#4f46d9] stroke-[1.7]" /></div><div className="mt-5 border-t border-slate-100 pt-4"><h3 className="text-[11px] font-bold uppercase tracking-[.14em] text-slate-700">Categories</h3><div className="mt-2"><Check label="Electronics" count="144" /><Check label="Home & Office" count="89" /><Check label="Accessories" count="62" /><Check label="Wearables" count="37" /></div></div><div className="mt-5 border-t border-slate-100 pt-5"><h3 className="text-[11px] font-bold uppercase tracking-[.14em] text-slate-700">Price range</h3><input className="mt-5 w-full accent-[#4f46d9]" type="range" min="0" max="1000" defaultValue="680" aria-label="Maximum price" /><div className="mt-2 flex justify-between text-xs text-slate-500"><span>$0</span><span>$1000+</span></div></div><div className="mt-5 border-t border-slate-100 pt-5"><h3 className="text-[11px] font-bold uppercase tracking-[.14em] text-slate-700">Rating</h3><label className="mt-3 flex cursor-pointer items-center gap-2.5 text-sm text-slate-600"><input className="h-4 w-4 rounded border-slate-300 text-[#4f46d9] focus:ring-[#4f46d9]" type="checkbox" /><span className="flex text-[#e3a52b]"><Icon name="star" className="h-3.5 w-3.5 fill-current stroke-current" /><Icon name="star" className="h-3.5 w-3.5 fill-current stroke-current" /><Icon name="star" className="h-3.5 w-3.5 fill-current stroke-current" /><Icon name="star" className="h-3.5 w-3.5 fill-current stroke-current" /><Icon name="star" className="h-3.5 w-3.5 fill-current stroke-current" /></span></label><label className="mt-3 flex cursor-pointer items-center gap-2.5 text-sm text-slate-600"><input className="h-4 w-4 rounded border-slate-300 text-[#4f46d9] focus:ring-[#4f46d9]" type="checkbox" /><span className="flex text-[#e3a52b]"><Icon name="star" className="h-3.5 w-3.5 fill-current stroke-current" /><Icon name="star" className="h-3.5 w-3.5 fill-current stroke-current" /><Icon name="star" className="h-3.5 w-3.5 fill-current stroke-current" /><Icon name="star" className="h-3.5 w-3.5 fill-current stroke-current" /><Icon name="star" className="h-3.5 w-3.5 fill-current stroke-current text-slate-200" /></span><span> & up</span></label></div><div className="mt-5 border-t border-slate-100 pt-5"><h3 className="text-[11px] font-bold uppercase tracking-[.14em] text-slate-700">Availability</h3><div className="mt-2"><Check label="In stock" count="128" /></div></div></aside>

        <section><div className="mb-5 flex items-center justify-between lg:hidden"><button className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700"><Icon name="filter" className="h-4 w-4 fill-none stroke-current stroke-2" />Filters</button><span className="text-xs text-slate-500">{productPage?.totalElements ?? 0} products</span></div>{error ? <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">{error}</div> : <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{sortedProducts.map((product, index) => <article className={`group overflow-hidden rounded-2xl border bg-white p-3 shadow-[0_10px_24px_rgba(23,32,51,.06)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_35px_rgba(23,32,51,.13)] ${index === 0 ? "border-dashed border-[#625be8] ring-2 ring-[#e6e4ff]" : "border-slate-200"}`} key={product.productId}><Link href={`/products/${product.productId}`} className="relative block aspect-[1/0.88] overflow-hidden rounded-xl bg-[#f1f2f3]">{product.image && <div className="absolute inset-0 bg-cover bg-center transition duration-500 group-hover:scale-110" style={{ backgroundImage: `url(${product.image})` }} />}{product.discount > 0 && <span className="absolute left-3 top-3 rounded-full bg-[#202440] px-2.5 py-1 text-[10px] font-bold text-white">-{product.discount}%</span>}</Link><div className="px-1 pb-1 pt-4"><p className="text-[11px] text-slate-500">{product.category?.categoryName ?? "Uncategorized"}</p><h2 className="mt-2 font-[Georgia,serif] text-lg font-semibold tracking-[-.03em] text-slate-800"><Link href={`/products/${product.productId}`} className="hover:text-[#4f46d9]">{product.productName}</Link></h2><div className="mt-2 flex items-center gap-2"><span className="text-sm font-bold text-[#332dac]">{currency.format(product.specialPrice || product.price)}</span>{product.specialPrice > 0 && product.specialPrice < product.price && <span className="text-xs text-slate-400 line-through">{currency.format(product.price)}</span>}</div></div></article>)}</div>}
          {productPage && productPage.totalPages > 1 && <nav className="mt-12 flex flex-wrap items-center justify-center gap-2" aria-label="Pagination"><button className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:border-[#aaa5ff] disabled:cursor-not-allowed disabled:text-slate-400" aria-label="Previous page" disabled={productPage.first} onClick={() => setCurrentPage((page) => Math.max(page - 1, 0))}><Icon name="chevron" className="h-4 w-4 rotate-180 fill-none stroke-current stroke-2" /></button>{pageNumbers.map((page) => <button className={`grid h-9 w-9 place-items-center rounded-lg text-sm font-semibold ${page === productPage.number ? "bg-[#4f46d9] text-white shadow-[0_6px_14px_rgba(79,70,217,.25)]" : "border border-slate-200 bg-white text-slate-600 hover:border-[#aaa5ff]"}`} key={page} onClick={() => setCurrentPage(page)} aria-current={page === productPage.number ? "page" : undefined}>{page + 1}</button>)}<button className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:border-[#aaa5ff] disabled:cursor-not-allowed disabled:text-slate-400" aria-label="Next page" disabled={productPage.last} onClick={() => setCurrentPage((page) => Math.min(page + 1, productPage.totalPages - 1))}><Icon name="chevron" className="h-4 w-4 fill-none stroke-current stroke-2" /></button></nav>}
        </section>
      </div>
    </div>

    <footer className="border-t border-slate-200 bg-[#ebedf0]"><div className="mx-auto flex max-w-7xl flex-col gap-8 px-5 py-10 sm:px-8 md:flex-row md:items-start md:justify-between lg:px-10"><div><Link href="/" className="font-[Georgia,serif] text-xl font-bold tracking-[-.06em] text-[#2720a7]">Indigo<span className="text-[#172033]">Store</span></Link><p className="mt-3 text-xs text-slate-500">© 2026 IndigoStore. All rights reserved.</p></div><div className="grid grid-cols-2 gap-x-12 gap-y-8 text-xs text-slate-500 sm:grid-cols-3"><div className="grid gap-3"><Link className="font-semibold text-[#4540bc]" href="/about">About Us</Link><Link className="hover:text-[#4038c8]" href="/contact">Contact</Link></div><div className="grid gap-3"><a className="hover:text-[#4038c8]" href="#">Shipping Policy</a><a className="hover:text-[#4038c8]" href="#">Terms of Service</a></div><div><a className="hover:text-[#4038c8]" href="#">Privacy</a></div></div></div></footer>
  </main>;
}
