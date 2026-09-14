"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
export type CartItem = { id: number; name: string; variant: string; price: number; quantity: number; stock: number; image: string };
type CartProduct = Omit<CartItem, "quantity">;
const initialItems: CartItem[] = [];
type CartContextValue = { items: CartItem[]; itemCount: number; addItem: (product: CartProduct, quantity: number) => void; updateQuantity: (id: number, variant: string, amount: number) => void; removeItem: (id: number, variant: string) => void };
const CartContext = createContext<CartContextValue | null>(null);
export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(initialItems);
  const value = useMemo<CartContextValue>(() => ({
    items,
    itemCount: items.reduce((total, item) => total + item.quantity, 0),
    addItem: (product, quantity) => setItems((current) => {
      const stock = Math.max(0, product.stock);
      if (stock === 0) return current;
      return current.some((item) => item.id === product.id && item.variant === product.variant)
        ? current.map((item) => item.id === product.id && item.variant === product.variant
          ? { ...item, stock, quantity: Math.min(stock, item.quantity + quantity) }
          : item)
        : [...current, { ...product, stock, quantity: Math.min(stock, Math.max(1, quantity)) }];
    }),
    updateQuantity: (id, variant, amount) => setItems((current) => current.map((item) => item.id === id && item.variant === variant ? { ...item, quantity: Math.min(item.stock, Math.max(1, item.quantity + amount)) } : item)),
    removeItem: (id, variant) => setItems((current) => current.filter((item) => item.id !== id || item.variant !== variant)),
  }), [items]);
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
}
