import { auth } from "@/auth";
import type { DashboardOverview, TopProduct } from "@/src/lib/dashboard";

const backendUrl = (process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL)?.replace(/\/$/, "");

function resolveImageUrl(image: string) {
  if (!image || image.startsWith("data:")) return image;

  const productImagePath = "/uploads/products/";
  const backendOrigin = new URL(backendUrl!).origin;
  const url = new URL(image, `${backendOrigin}/`);
  if (/^https?:\/\//i.test(image) && url.origin !== backendOrigin) return image;
  const imagePathIndex = url.pathname.indexOf(productImagePath);
  const fileName = imagePathIndex >= 0 ? url.pathname.slice(imagePathIndex + productImagePath.length) : image;

  return !fileName.includes("/") ? `/api/product-images/${encodeURIComponent(fileName)}` : url.toString();
}

export async function GET(request: Request) {
  if (!backendUrl) return Response.json({ message: "The dashboard API is not configured." }, { status: 500 });

  const session = await auth();
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
      topProducts: data.payload.topProducts.map((product: TopProduct) => ({ ...product, image: resolveImageUrl(product.image) })),
    },
  });
}
