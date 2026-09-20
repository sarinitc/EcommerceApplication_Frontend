import { auth } from "@/auth";
import type { ApiResponse, Product, ProductPage } from "@/types/product";

const backendUrl = (process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL)?.replace(/\/$/, "");

function resolveImageUrl(image: string) {
  if (!image || image.startsWith("data:")) return image;

  const productImagePath = "/uploads/products/";
  const backendOrigin = new URL(backendUrl!).origin;
  const url = new URL(image, `${backendOrigin}/`);
  if (/^https?:\/\//i.test(image) && url.origin !== backendOrigin) return image;
  const imagePathIndex = url.pathname.indexOf(productImagePath);
  const fileName = imagePathIndex >= 0
    ? url.pathname.slice(imagePathIndex + productImagePath.length)
    : image;

  if (!fileName.includes("/")) return `/api/product-images/${encodeURIComponent(fileName)}`;

  return url.toString();
}

export async function GET(request: Request) {
  if (!backendUrl) {
    return Response.json({ message: "The product API is not configured." }, { status: 500 });
  }

  const session = await auth();
  const backendAccessToken = (session as (typeof session & { backendAccessToken?: string }) | null)?.backendAccessToken;
  if (!backendAccessToken) {
    return Response.json({ message: "Please sign in to view new arrivals." }, { status: 401 });
  }
  const jwt = backendAccessToken.replace(/^Bearer\s+/i, "");

  const { searchParams } = new URL(request.url);
  const page = searchParams.get("page") ?? "0";
  const size = searchParams.get("size") ?? "12";
  const response = await fetch(`${backendUrl}/products/new-arrivals?page=${encodeURIComponent(page)}&size=${encodeURIComponent(size)}`, {
    headers: { Authorization: `Bearer ${jwt}` },
    cache: "no-store",
  });

  const data = (await response.json().catch(() => null)) as ApiResponse<ProductPage> | null;
  if (!response.ok) {
    return Response.json(
      { message: data?.message ?? `Product API returned ${response.status} ${response.statusText}.` },
      { status: response.status },
    );
  }
  if (!data) {
    return Response.json({ message: "Product API returned an empty response." }, { status: 502 });
  }

  return Response.json({
    ...data,
    payload: {
      ...data.payload,
      content: data.payload.content.map((product: Product) => ({
        ...product,
        image: resolveImageUrl(product.image),
      })),
    },
  });
}