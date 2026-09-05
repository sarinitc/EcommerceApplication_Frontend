"use client";

/* Product image URLs are backend-controlled and displayed in compact admin list rows. */
/* eslint-disable @next/next/no-img-element */

import { useEffect, useState } from "react";
import Link from "next/link";
import type { ApiResponse, Product, ProductPage } from "@/src/lib/products";

const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

export function AdminProductsList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadProducts() {
      try {
        const response = await fetch("/api/products?page=0&size=50");
        const data = await response.json() as ApiResponse<ProductPage> | { message?: string };
        if (!response.ok || !("payload" in data)) throw new Error(data.message ?? "Unable to load products.");
        setProducts(data.payload.content);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Unable to load products.");
      }
    }

    void loadProducts();
  }, []);

  if (error) return <p className="mt-8 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>;
  if (!products.length) return <p className="mt-8 rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">No products found.</p>;

  return <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_10px_25px_rgba(23,32,51,.05)]"><div className="divide-y divide-slate-100">{products.map((product) => <article className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center" key={product.productId}><div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-slate-100">{product.image && <img className="h-full w-full object-cover" src={product.image} alt="" />}</div><div className="min-w-0 flex-1"><p className="text-xs text-slate-500">#{product.productId} · {product.category?.categoryName ?? "Uncategorized"}</p><h2 className="mt-1 truncate font-semibold text-slate-800">{product.productName}</h2><p className="mt-1 text-sm text-[#332dac]">{currency.format(product.specialPrice || product.price)} {product.discount > 0 && <span className="text-slate-400">({product.discount}% off)</span>}</p></div><Link className="inline-flex w-fit rounded-xl border border-[#4f46d9] px-4 py-2.5 text-sm font-bold text-[#433bc8] transition hover:bg-[#f0efff]" href={`/admin/products/${product.productId}/edit`}>Edit product</Link></article>)}</div></div>;
}
