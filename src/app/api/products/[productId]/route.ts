import { auth } from "@/auth";
import type { ApiResponse, Product, ProductRequest } from "@/src/lib/products";

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

function restoreBackendImageUrl(image: string) {
  const proxyPath = "/api/product-images/";
  if (!image.startsWith(proxyPath)) return image;

  const fileName = decodeURIComponent(image.slice(proxyPath.length));
  return `${backendUrl}/uploads/products/${encodeURIComponent(fileName)}`;
}

async function getAccessToken() {
  const session = await auth();
  const token = (session as (typeof session & { backendAccessToken?: string }) | null)?.backendAccessToken;
  return token?.replace(/^Bearer\s+/i, "");
}

export async function GET(_request: Request, { params }: { params: Promise<{ productId: string }> }) {
  if (!backendUrl) return Response.json({ message: "The product API is not configured." }, { status: 500 });
  const token = await getAccessToken();
  if (!token) return Response.json({ message: "Please sign in to view products." }, { status: 401 });

  const { productId } = await params;
  const response = await fetch(`${backendUrl}/products/${encodeURIComponent(productId)}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  const data = await response.json().catch(() => null) as ApiResponse<Product> | null;
  if (!response.ok) return Response.json({ message: data?.message ?? `Product API returned ${response.status} ${response.statusText}.` }, { status: response.status });
  if (!data) return Response.json({ message: "Product API returned an empty response." }, { status: 502 });

  return Response.json({
    ...data,
    payload: {
      ...data.payload,
      image: resolveImageUrl(data.payload.image),
    },
  });
}

export async function PUT(request: Request, { params }: { params: Promise<{ productId: string }> }) {
  if (!backendUrl) return Response.json({ message: "The product API is not configured." }, { status: 500 });
  const token = await getAccessToken();
  if (!token) return Response.json({ message: "Please sign in to update products." }, { status: 401 });

  const { productId } = await params;
  const product = await request.json() as ProductRequest;
  const backendProduct = { ...product, image: restoreBackendImageUrl(product.image) };
  const response = await fetch(`${backendUrl}/products/${encodeURIComponent(productId)}`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(backendProduct),
    cache: "no-store",
  });
  const data = await response.json().catch(() => null);
  if (!response.ok) return Response.json({ message: data?.message ?? `Product API returned ${response.status} ${response.statusText}.` }, { status: response.status });

  return Response.json(data, { status: response.status });
}
