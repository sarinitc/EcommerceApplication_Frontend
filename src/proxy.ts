import { auth } from "@/auth";

export default auth;

export const config = {
  matcher: ["/profile/:path*", "/account/:path*", "/orders/:path*", "/checkout/:path*", "/admin/:path*"],
};
