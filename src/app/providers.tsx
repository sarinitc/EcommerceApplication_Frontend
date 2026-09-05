"use client";

import type { ReactNode } from "react";
import { ToastProvider } from "@heroui/toast";
import { SessionProvider } from "next-auth/react";
import type { Session } from "next-auth";
import { CartProvider } from "@/src/components/cart/CartContext";

export function Providers({ children, session }: { children: ReactNode; session: Session | null }) {
  return (
    <>
      <ToastProvider
        placement="top-center"
        toastProps={{
          motionProps: { transition: { duration: 0.18, ease: "easeOut" } },
        }}
      />
      <SessionProvider session={session}><CartProvider>{children}</CartProvider></SessionProvider>
    </>
  );
}
