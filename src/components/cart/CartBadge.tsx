"use client";

import { useCart } from "./CartContext";

export function CartBadge() {
  const { itemCount } = useCart();

  return <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full border-2 border-[#f7f7f4] bg-[#5049db] px-1 text-[8px] font-bold text-white">{itemCount}</span>;
}
