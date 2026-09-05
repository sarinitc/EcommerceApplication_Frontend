import type { NextAuthConfig } from "next-auth";

const protectedPaths = ["/profile", "/orders", "/checkout", "/admin"];

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isProtectedPath = protectedPaths.some(
        (path) => nextUrl.pathname === path || nextUrl.pathname.startsWith(`${path}/`),
      );

      if (isProtectedPath) return !!auth?.user;

      if (auth?.user && ["/login", "/register"].includes(nextUrl.pathname)) {
        return Response.redirect(new URL("/", nextUrl));
      }

      return true;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
