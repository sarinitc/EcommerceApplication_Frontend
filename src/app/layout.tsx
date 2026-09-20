import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v16-appRouter";
import { Providers } from "./providers";
import { auth } from "@/auth";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], display: "swap", variable: "--font-inter" });
const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], display: "swap", variable: "--font-jakarta" });

export const metadata: Metadata = {
  title: "IndigoStore — Shop technology, fashion & everyday essentials",
  description: "A modern storefront for browsing and purchasing technology, fashion, lifestyle products and everyday essentials.",
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const session = await auth();
  return (
    <html lang="en" className="h-full antialiased">
      <body className={`${inter.variable} ${jakarta.variable} min-h-full flex flex-col`}>
        <AppRouterCacheProvider>
          <Providers session={session}>{children}</Providers>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
