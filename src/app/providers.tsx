"use client";

import type { ReactNode } from "react";
import { ToastProvider } from "@heroui/toast";
import { SessionProvider } from "next-auth/react";
import type { Session } from "next-auth";
import { CartProvider } from "@/components/features/cart/CartContext";
import { WishlistProvider } from "@/components/features/wishlist/WishlistContext";

export function Providers({ children, session }: { children: ReactNode; session: Session | null }) {
  return (
    <>
      <ToastProvider
        placement="top-center"
        toastProps={{
          motionProps: { transition: { duration: 0.18, ease: "easeOut" } },
        }}
      />
      <SessionProvider session={session}><CartProvider><WishlistProvider>{children}</WishlistProvider></CartProvider></SessionProvider>
    </>
  );
}
