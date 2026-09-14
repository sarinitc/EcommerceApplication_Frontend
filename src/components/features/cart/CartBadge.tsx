"use client";

import { useCart } from "./CartContext";

export function CartBadge() {
  const { itemCount } = useCart();

  return <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full border-2 border-canvas bg-brand px-1 text-[8px] font-bold text-white">{itemCount}</span>;
}
