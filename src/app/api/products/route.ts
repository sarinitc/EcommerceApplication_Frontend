import { auth } from "@/auth";
import type { ApiResponse, Product, ProductPage, ProductRequest } from "@/src/lib/products";

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
    return Response.json({ message: "Please sign in to view products." }, { status: 401 });
  }
  const jwt = backendAccessToken.replace(/^Bearer\s+/i, "");

  const { searchParams } = new URL(request.url);
  const page = searchParams.get("page") ?? "0";
  const size = searchParams.get("size") ?? "12";
  const response = await fetch(`${backendUrl}/products?page=${encodeURIComponent(page)}&size=${encodeURIComponent(size)}`, {
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

export async function POST(request: Request) {
  if (!backendUrl) return Response.json({ message: "The product API is not configured." }, { status: 500 });

  const session = await auth();
  const backendAccessToken = (session as (typeof session & { backendAccessToken?: string }) | null)?.backendAccessToken;
  if (!backendAccessToken) return Response.json({ message: "Please sign in to create products." }, { status: 401 });
  const jwt = backendAccessToken.replace(/^Bearer\s+/i, "");
  let backendUserId = Number((session as (typeof session & { backendUserId?: string | number }) | null)?.backendUserId);
  if (!Number.isInteger(backendUserId) || backendUserId <= 0) {
    const currentUserResponse = await fetch(`${backendUrl}/auth/me`, {
      headers: { Authorization: `Bearer ${jwt}` },
      cache: "no-store",
    });
    const currentUser = await currentUserResponse.json().catch(() => null) as { payload?: { userId?: number } } | null;
    backendUserId = Number(currentUser?.payload?.userId);
  }
  if (!Number.isInteger(backendUserId) || backendUserId <= 0) {
    return Response.json({ message: "Unable to identify the signed-in seller." }, { status: 401 });
  }

  const product = (await request.json()) as ProductRequest;
  const backendProduct = { ...product, sellerId: backendUserId };
  const response = await fetch(`${backendUrl}/products`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${jwt}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(backendProduct),
    cache: "no-store",
  });
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    return Response.json({ message: data?.message ?? `Product API returned ${response.status} ${response.statusText}.` }, { status: response.status });
  }

  return Response.json(data, { status: response.status });
}
