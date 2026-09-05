import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v16-appRouter";
import { Providers } from "./providers";
import { auth } from "@/auth";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ecommerce Application",
  description: "A storefront for browsing and purchasing products.",
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const session = await auth();
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <AppRouterCacheProvider>
          <Providers session={session}>{children}</Providers>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
