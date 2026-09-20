"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

const STORAGE_KEY = "indigostore:wishlist";

type WishlistContextValue = {
  wishlist: Set<number>;
  count: number;
  has: (productId: number) => boolean;
  toggle: (productId: number) => void;
};

const WishlistContext = createContext<WishlistContextValue | null>(null);

function readStored(): number[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((id): id is number => typeof id === "number").map(Number) : [];
  } catch {
    return [];
  }
}

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [ids, setIds] = useState<number[]>(() => readStored());

  useEffect(() => {
    function sync() {
      setIds(readStored());
    }
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);

  const value = useMemo<WishlistContextValue>(() => {
    const set = new Set(ids);
    return {
      wishlist: set,
      count: set.size,
      has: (productId) => set.has(productId),
      toggle: (productId) => {
        setIds((current) => {
          const next = current.includes(productId) ? current.filter((id) => id !== productId) : [...current, productId];
          try {
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
          } catch {
            /* storage unavailable — keep in-memory state */
          }
          return next;
        });
      },
    };
  }, [ids]);

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) throw new Error("useWishlist must be used within WishlistProvider");
  return context;
}