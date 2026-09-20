"use client";

import { useState } from "react";
import Link from "next/link";
import { addToast } from "@heroui/toast";
import { ShoppingBag } from "lucide-react";
import { useCart } from "@/components/features/cart/CartContext";
import type { Product } from "@/types/product";

const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

function badgeFor(product: Product) {
  if (product.discount > 0) return { label: `-${product.discount}%`, className: "bg-accent text-white" };
  if (product.quantity >= 40) return { label: "Best Seller", className: "bg-brand text-white" };
  return { label: "New", className: "bg-slate-900/85 text-white" };
}

export function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);
  const price = product.specialPrice > 0 ? product.specialPrice : product.price;
  const onSale = product.specialPrice > 0 && product.specialPrice < product.price;
  const stock = Math.max(0, product.quantity);
  const badge = badgeFor(product);

  function handleAddToCart() {
    if (stock === 0) return;
    addItem({ id: product.productId, name: product.productName, variant: product.category?.categoryName ?? "Default", price, stock, image: product.image }, 1);
    setAdded(true);
    addToast({ title: "Added to cart", description: product.productName, color: "success", timeout: 2500 });
    window.setTimeout(() => setAdded(false), 1400);
  }

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-surface transition-all duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-[0_20px_40px_-22px_rgba(17,24,39,.24)]">
      <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200">
        <Link href={`/products/${product.productId}`} aria-label={product.productName} className="block h-full w-full">
          {product.image ? (
            <img src={product.image} alt={product.productName} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.06]" />
          ) : (
            <span className="grid h-full w-full place-items-center text-slate-300">
              <ShoppingBag className="h-10 w-10" strokeWidth={1.2} />
            </span>
          )}
        </Link>

        <span className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide shadow-sm ${badge.className}`}>{badge.label}</span>

        <button
          type="button"
          disabled={stock === 0}
          onClick={handleAddToCart}
          className="absolute inset-x-3 bottom-3 flex h-10 translate-y-2 cursor-pointer items-center justify-center gap-2 rounded-xl bg-slate-900/90 text-[13px] font-semibold text-white opacity-0 shadow-lg backdrop-blur transition-all duration-300 hover:bg-brand disabled:cursor-not-allowed disabled:bg-slate-900/50 group-hover:translate-y-0 group-hover:opacity-100 max-lg:translate-y-0 max-lg:opacity-100"
        >
          {added ? <span className="flex items-center gap-1.5">Added <span aria-hidden="true">✓</span></span> : <span className="flex items-center gap-2"><ShoppingBag className="h-4 w-4" />{stock === 0 ? "Out of stock" : "Add to cart"}</span>}
        </button>
      </div>

      <div className="flex flex-1 flex-col px-4 pb-4 pt-3.5">
        <div>
          <p className="truncate text-[11px] font-semibold uppercase tracking-[0.12em] text-brand">{product.category?.categoryName ?? "Uncategorized"}</p>
        </div>
        <h3 className="mt-2 line-clamp-2 min-h-[2.6em] text-[15px] font-semibold leading-snug tracking-[-0.01em] text-ink">
          <Link href={`/products/${product.productId}`} className="transition hover:text-brand">{product.productName}</Link>
        </h3>
        <div className="mt-auto flex items-baseline gap-2 pt-3">
          <span className="text-lg font-bold tracking-[-0.02em] text-ink">{currency.format(price)}</span>
          {onSale && <span className="text-[13px] font-medium text-slate-400 line-through">{currency.format(product.price)}</span>}
        </div>
      </div>
    </article>
  );
}