"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { useWishlist } from "./WishlistContext";

export function WishlistBadge() {
  const { count } = useWishlist();
  const hasItems = count > 0;

  return (
    <Link
      href="/products"
      aria-label={`Wishlist, ${count} saved ${count === 1 ? "product" : "products"}`}
      className="relative grid h-9 w-9 place-items-center rounded-full text-ink/65 transition hover:bg-brand-light hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
    >
      <Heart className="h-5 w-5" />
      {hasItems && (
        <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full border-2 border-canvas bg-accent px-1 text-[8px] font-bold text-white">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  );
}

export function WishlistToggle({ productId }: { productId: number }) {
  const { has, toggle } = useWishlist();
  const active = has(productId);

  return (
    <button
      type="button"
      aria-pressed={active}
      aria-label={active ? "Remove from wishlist" : "Add to wishlist"}
      onClick={() => toggle(productId)}
      className={`grid h-8 w-8 cursor-pointer place-items-center rounded-full backdrop-blur transition-all duration-200 ${
        active
          ? "bg-accent text-white shadow-[0_6px_14px_rgba(249,115,22,.35)]"
          : "bg-white/90 text-ink/60 shadow-[0_4px_12px_rgba(17,24,39,.12)] hover:bg-white hover:text-accent"
      }`}
    >
      <Heart className={`h-4 w-4 ${active ? "fill-current" : ""}`} />
    </button>
  );
}