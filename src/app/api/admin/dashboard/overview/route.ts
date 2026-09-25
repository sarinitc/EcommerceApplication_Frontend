import { resolveProductImageUrl } from "@/lib/image-urls";
import { auth } from "@/auth";
import type { DashboardOverview, TopProduct } from "@/types/dashboard";

const backendUrl = (process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL)?.replace(/\/$/, "");

export async function GET(request: Request) {
  if (!backendUrl) return Response.json({ message: "The dashboard API is not configured." }, { status: 500 });

  const session = await auth();
  if (!(session?.user as { roles?: string[] } | undefined)?.roles?.includes("ADMIN")) {
    return Response.json({ message: "Administrator access is required." }, { status: 403 });
  }
  const token = (session as (typeof session & { backendAccessToken?: string }) | null)?.backendAccessToken?.replace(/^Bearer\s+/i, "");
  if (!token) return Response.json({ message: "Please sign in to view the dashboard." }, { status: 401 });

  const requestUrl = new URL(request.url);
  const backendRequestUrl = new URL(`${backendUrl}/admin/dashboard/overview`);
  for (const key of ["from", "to"]) {
    const value = requestUrl.searchParams.get(key);
    if (value) backendRequestUrl.searchParams.set(key, value);
  }

  const response = await fetch(backendRequestUrl, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  const data = await response.json().catch(() => null) as { payload?: DashboardOverview; message?: string } | null;
  if (!response.ok || !data?.payload) return Response.json({ message: data?.message ?? `Dashboard API returned ${response.status} ${response.statusText}.` }, { status: response.status });

  return Response.json({
    ...data,
    payload: {
      ...data.payload,
      topProducts: data.payload.topProducts.map((product: TopProduct) => ({ ...product, image: resolveProductImageUrl(product.image, backendUrl) })),
    },
  });
}
