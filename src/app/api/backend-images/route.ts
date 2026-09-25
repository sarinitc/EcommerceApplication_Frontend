import { auth } from "@/auth";
import { getBackendImageUrl } from "@/lib/image-urls";

const backendUrl = (process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL)?.replace(/\/$/, "");

export async function GET(request: Request) {
  if (!backendUrl) return new Response(null, { status: 500 });
  const session = await auth();
  const token = (session as (typeof session & { backendAccessToken?: string }) | null)?.backendAccessToken;
  if (!token) return new Response(null, { status: 401 });

  const path = new URL(request.url).searchParams.get("path") ?? "";
  const imageUrl = getBackendImageUrl(path, backendUrl);
  if (!imageUrl) return new Response(null, { status: 400 });

  try {
    const response = await fetch(imageUrl, {
      headers: { Authorization: `Bearer ${token.replace(/^Bearer\s+/i, "")}` },
      cache: "no-store",
      redirect: "error",
    });
    if (!response.ok) return new Response(null, { status: response.status });
    const contentType = response.headers.get("Content-Type") ?? "";
    if (!response.body || !/^image\/(?:png|jpeg|webp|gif|avif|bmp|x-icon|vnd\.microsoft\.icon)(?:;|$)/i.test(contentType)) {
      return new Response(null, { status: 502 });
    }
    return new Response(response.body, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new Response(null, { status: 502 });
  }
}
