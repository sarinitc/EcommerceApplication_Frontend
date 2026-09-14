import type { NextAuthConfig } from "next-auth";

const protectedPaths = ["/profile", "/account", "/orders", "/checkout", "/admin"];

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  callbacks: {
    session({ session, token }) {
      (session.user as typeof session.user & { roles: string[] }).roles = Array.isArray(token.roles)
        ? token.roles.filter((role): role is string => typeof role === "string")
        : [];
      return session;
    },
    authorized({ auth, request: { nextUrl } }) {
      const isAdminPath = nextUrl.pathname === "/admin" || nextUrl.pathname.startsWith("/admin/");
      const isAdmin = (auth?.user as { roles?: string[] } | undefined)?.roles?.includes("ADMIN");
      if (isAdminPath && !isAdmin) {
        return Response.redirect(new URL("/login?account=admin", nextUrl));
      }
      const isProtectedPath = protectedPaths.some(
        (path) => nextUrl.pathname === path || nextUrl.pathname.startsWith(`${path}/`),
      );

      if (isProtectedPath) return !!auth?.user;

      if (auth?.user && ["/login", "/register"].includes(nextUrl.pathname)) {
        if (nextUrl.pathname === "/login" && nextUrl.searchParams.get("account") === "admin") {
          return isAdmin
            ? Response.redirect(new URL("/admin", nextUrl))
            : true;
        }
        return Response.redirect(new URL("/", nextUrl));
      }

      return true;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
